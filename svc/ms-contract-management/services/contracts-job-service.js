import { logger, defaultStatus, defaultCode } from '@utils'
import { getFutureDates, getOlderDates, getQuarter } from '../utils/util'
import { camelCaseConversion, calculateInvoice } from '@utils/helpers'
// import { systemUserId } from '@config/env.config'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { isEmpty, map } from 'lodash'
import { Op, QueryTypes } from 'sequelize'
import moment from 'moment'
import { config } from '@config/env.config'
import { v4 as uuidv4 } from 'uuid'

const { tenantId } = config
const { getTenantConnection } = require('@services/connection-service')

const systemUserId = 1

export const generateMonthlyUnBilledContracts = async (currentMonth = 0, conn) => {
  if (!conn) {
    conn = await getTenantConnection(tenantId)
  }
  console.log('generateMonthlyUnBilledContracts')
  const t = await conn.sequelize.transaction()
  try {
    const billPeriod = format(startOfMonth(getFutureDates(new Date(), Number(currentMonth))), 'yyyy-MM-dd')
    const endOfbillPeriodMonth = format(endOfMonth(getFutureDates(new Date(), Number(currentMonth))), 'yyyy-MM-dd')
    console.log('billPeriod', billPeriod)
    console.log('endOfbillPeriodMonth', endOfbillPeriodMonth)

    const mContracts = await conn.MonthlyContract.findAll({
      where: {
        nextBillPeriod: { [Op.gte]: billPeriod, [Op.lte]: endOfbillPeriodMonth },
        status: defaultStatus.SCHEDULED
      },
      transaction: t,
      raw: true
    })
    console.log('mContracts', mContracts.length)

    const mdContracts = await conn.MonthlyContractDtl.findAll({
      where: {
        nextBillPeriod: { [Op.gte]: billPeriod, [Op.lte]: endOfbillPeriodMonth },
        status: defaultStatus.SCHEDULED
      },
      transaction: t,
      raw: true
    })
    console.log('mdContracts', mdContracts.length)

    const schContracts = await conn.ContractScheduler.findAll({
      where: {
        scheduleDatetime: { [Op.gte]: billPeriod, [Op.lte]: endOfbillPeriodMonth },
        scheduleStatus: defaultStatus.SCHEDULED
      },
      transaction: t,
      raw: true
    })
    console.log('schContracts', schContracts.length)

    if (Array.isArray(mContracts) && !isEmpty(mContracts)) {
      const monthlyContractIds = map(mContracts, 'monthlyContractId')
      if (!isEmpty(monthlyContractIds)) {
        await conn.MonthlyContract.update({ status: defaultStatus.UNBILLED }, {
          where: { monthlyContractId: monthlyContractIds }, transaction: t
        })
      }
    }
    if (Array.isArray(mdContracts) && !isEmpty(mdContracts)) {
      const monthlyContractDtlIds = map(mdContracts, 'monthlyContractDtlId')

      if (!isEmpty(monthlyContractDtlIds)) {
        await conn.MonthlyContractDtl.update({ status: defaultStatus.UNBILLED }, {
          where: { monthlyContractDtlId: monthlyContractDtlIds }, transaction: t
        })
      }
    }

    if (Array.isArray(schContracts) && !isEmpty(schContracts)) {
      for (const dtl of schContracts) {
        const lastBill = dtl.scheduleDatetime

        const billPending = await conn.ContractScheduler.findOne({
          where: {
            contractDtlId: dtl.contractDtlId,
            scheduleDatetime: { [Op.gt]: dtl.scheduleDatetime }
          },
          transaction: t
        })

        const contractDtlValue = await conn.ContractDtl.findOne({
          where: { contractDtlId: dtl.contractDtlId },
          attributes: ['balanceAmount', 'contractId', 'contractDtlId', 'frequency'],
          transaction: t
        })

        let nextMonth = null
        if (contractDtlValue?.frequency === 'FREQ_MONTH') {
          nextMonth = billPending ? format(startOfMonth(new Date(getFutureDates(lastBill, 1))), 'yyyy-MM-dd') : null
        } else if (contractDtlValue?.frequency === 'FREQ_QUARTER') {
          nextMonth = billPending ? format(startOfMonth(new Date(getFutureDates(lastBill, 3))), 'yyyy-MM-dd') : null
        } else if (contractDtlValue?.frequency === 'FREQ_HALF_YEAR') {
          nextMonth = billPending ? format(startOfMonth(new Date(getFutureDates(lastBill, 6))), 'yyyy-MM-dd') : null
        } else if (contractDtlValue?.frequency === 'FREQ_YEAR') {
          nextMonth = billPending ? format(startOfMonth(new Date(getFutureDates(lastBill, 12))), 'yyyy-MM-dd') : null
        }
        // const nextMonth = billPending ? format(startOfMonth(new Date(getFutureDates(lastBill, 3))), 'yyyy-MM-dd') : null

        // const monthlyContractDtl = mdContracts.find((mdtl) => mdtl?.contractDtlId === dtl.contractDtlId)

        const detailData = {
          lastBillPeriod: lastBill,
          nextBillPeriod: nextMonth
          // balanceAmount: Number(contractDtlValue.balanceAmount) - Number(monthlyContractDtl?.chargeAmt)
        }

        await conn.ContractDtl.update(detailData, { where: { contractDtlId: dtl.contractDtlId }, transaction: t })
        // await conn.ContractDtl.destroy({ where: { itemName: 'Adjument Record', contractDtlId: dtl.contractDtlId }, transaction: t })
        await conn.ContractScheduler.update({ scheduleStatus: defaultStatus.UNBILLED }, { where: { monthlyContractDtlId: dtl.monthlyContractDtlId }, transaction: t })

        let billPendingContract
        if (!billPending) {
          billPendingContract = await conn.ContractScheduler.findOne({
            where: {
              contractId: dtl.contractId,
              scheduleDatetime: { [Op.gt]: dtl.scheduleDatetime }
            },
            transaction: t
          })
        }

        const updateContract = {
          lastBillPeriod: lastBill,
          nextBillPeriod: (billPendingContract || billPending) ? format(startOfMonth(new Date(getFutureDates(lastBill, 1))), 'yyyy-MM-dd') : null
        }

        await conn.Contract.update(updateContract, {
          where: {
            contractId: dtl.contractId
            // nextBillPeriod: {
            //   [Op.gte]: billPeriod,
            //   [Op.lte]: endOfbillPeriodMonth
            // }
          },
          transaction: t
        })
      }
    }

    await t.commit()
    logger.info('Successfully Generated Monthly bill')
  } catch (error) {
    logger.error(error, 'Error while getnerating monthly bill')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

export const generateScheduledMonthlyContracts = async (conn) => {
  if (!conn) {
    conn = await getTenantConnection(tenantId)
  }
  const t = await conn.sequelize.transaction()
  try {
    // const billPeriod = format(startOfMonth(getFutureDates(new Date(), 0)), 'yyyy-MM-dd')
    const billPeriod = format(new Date(), 'yyyy-MM-dd')
    logger.info('Fetching Contract for the period::' + billPeriod)

    await createRCAndNRCMonthlyContractdtl(conn, t)
    await createUsageMonthlyContractdtl(conn, t)
    await createMonthlyContract(conn, t)

    await t.commit()
    logger.debug('Successfully generated Monthly scheduled contracts')
  } catch (error) {
    logger.error(error, 'Error while generating monthly scheduled contracts')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

// export const processContractForActiveService = async () => {
//   try {
//     const connectionList = await sequelize.query(`select connection_id, identification_no, mapping_payload,
//     service_start_date, service_stop_date, account_id from connections c  where c.status ='ACTIVE' and not exists
//     (select 'x' from contract_dtl c2 where c.connection_id=c2.connection_id)`, {
//       type: QueryTypes.SELECT,
//       model: Connection,
//       mapToModel: true
//     }
//     )
//     if (Array.isArray(connectionList) && !isEmpty(connectionList)) {
//       for (const connections of connectionList) {
//         if (!(connections && connections.mappingPayload)) {
//           return false
//         }
//         // const catalog = connections.mappingPayload.catalogId || null
//         const asset = connections.mappingPayload?.assetId || null
//         const service = connections.mappingPayload?.serviceId || null
//         const plan = connections.mappingPayload?.planId || null
//         const addons = connections.mappingPayload?.addonId || null

//         if (connections.accountId) {
//           const t = await sequelize.transaction()
//           const accountDetails = await Account.findOne({
//             where: {
//               accountId: connections.accountId
//             }
//           })
//           let data = null; let contract = null
//           if ((addons || asset || service || plan)) {
//             data = {
//               contractName: (accountDetails.firstName + ' ' + accountDetails.firstName),
//               contractDesc: (accountDetails.firstName + ' ' + accountDetails.firstName),
//               customerId: accountDetails.customerId,
//               accountId: accountDetails.accountId,
//               billRefNo: accountDetails.accountNo,
//               startDate: connections.serviceStartDate,
//               endDate: null,
//               nextBillPeriod: getLastDateOfMonth(connections.serviceStartDate),
//               status: 'ACTIVE'
//             }
//             contract = await Contract.create(data, { transaction: t })
//           }

//           if (!contract) {
//             logger.log('Error while creating contract')
//             t.rollback()
//           } else {
//             /*
//             let assetItems=[], serviceItems=[], planItems=[], addonItems=[];
//             const catDetails= await Catalog.findAll({
//               include:[
//                 {model: CatalogAssetMap, as:'assetMap'},
//                 {model: CatalogServiceMap, as:'serviceMap'},
//                 {model: CatalogPlanMap, as:'planMap'},
//                 {model: CatalogAddonMap, as:'addonMap'}
//                 ],

//               where:{
//                 catalogId:catalogId
//               }
//             })
//             const assets= catDetails[0].assetMap.assetId;
//             */
//             if (asset) {
//               const assetDet = await AssetMst.findOne({
//                 include: [
//                   {
//                     model: AssetCharge,
//                     as: 'assetCharges',
//                     include: [{ model: Charge, as: 'chargeDet' }]
//                   }
//                 ],
//                 where: {
//                   assetId: asset
//                 }
//               })
//               const assetData = transformContract(assetDet)
//               const data = transformContractDetail(contract, assetData, connections)
//               await ContractDtl.create(data, { transaction: t })
//             }

//             // const services = catDetails[0].serviceMap;
//             if (service) {
//               const serviceDet = await Service.findOne({
//                 include: [
//                   {
//                     model: ServiceCharge,
//                     as: 'serviceCharges',
//                     include: [{ model: Charge, as: 'chargeDet' }]
//                   }
//                 ],
//                 where: {
//                   serviceId: service
//                 }
//               })

//               const serviceData = transformContract(serviceDet)
//               const data = transformContractDetail(contract, serviceData, connections)
//               await ContractDtl.create(data, { transaction: t })
//             }

//             // const plans=catDetails[0].planMap;
//             if (plan) {
//               const planDet = await Plan.findOne({
//                 include: [
//                   {
//                     model: PlanCharge,
//                     as: 'planCharges',
//                     include: [{ model: Charge, as: 'chargeDet' }]
//                   }
//                 ],
//                 where: {
//                   planId: plan
//                 }
//               })
//               const planData = transformContract(planDet)
//               const data = transformContractDetail(contract, planData, connections)
//               await ContractDtl.create(data, { transaction: t })
//             }

//             t.commit()
//           }
//         }
//       }

//       const chargeAmt = await ContractDtl.findAll({
//         attributes: ['contractId', 'chargeType', [sequelize.fn('sum', sequelize.col('charge_amt')), 'chargeAmt']],
//         group: ['contractId', 'chargeType']
//       })

//       for (const chargeUpdate of chargeAmt) {
//         const t = await sequelize.transaction()

//         const data = {
//           rcAmount: (chargeUpdate.chargeType === 'CC_RC' ? chargeUpdate.chargeAmt : 0),
//           otcAmount: (chargeUpdate.chargeType === 'CC_NRC' ? chargeUpdate.chargeAmt : 0),
//           usageAmount: (chargeUpdate.chargeType === 'CC_USGC' ? chargeUpdate.chargeAmt : 0)
//         }

//         const chargeRes = await Contract.update(data, {
//           where: {
//             contractId: chargeUpdate.contractId
//           },
//           transaction: t
//         })

//         if (!chargeRes) {
//           t.rollback()
//         }
//         t.commit()
//       }
//     }
//   } catch (error) {
//     logger.error(error, 'Error while creating contract')
//   }
// }

// export const activateAdjustment = async () => {
//   const adjustmentList = await Adjustment.findAll({
//     include: [
//       { model: AdjustmentDtl, as: 'adjustmentDetails' }
//     ],

//     where: {
//       status: 'CREATED' // should be marked as active when workflow has been implemented
//     }
//   })

//   // console.log(adjustmentList)

//   const t = await sequelize.transaction()
//   for (const adjustment of adjustmentList) {
//     /** *******************************************This is temporary********************************/
//     await Adjustment.update({ status: 'ACTIVE' },
//       {
//         where: {
//           adjustmentId: adjustment.adjustmentId
//         },
//         transaction: t
//       })

//     await AdjustmentDtl.update({ status: 'ACTIVE' },
//       {
//         where: {
//           adjustmentId: adjustment.adjustmentDetails[0].adjustmentId
//         },
//         transaction: t
//       })
//     /** *******************************************This is temporary********************************/

//     if (adjustment.adjustmentDetails[0].contractDtlId && adjustment.adjustmentDetails[0].contractDtlId !== null) {
//       const data = {
//         creditAdjAmount: adjustment.adjustmentDetails[0].adjustmentType === 'ADJ_TYP_CREDIT' ? adjustment.adjustmentDetails[0].adjAmount : null,
//         debitAdjAmount: adjustment.adjustmentDetails[0].adjustmentType === 'ADJ_TYP_DEBIT' ? adjustment.adjustmentDetails[0].adjAmount : null
//       }

//       await MonthlyContractDtl.update(data, {
//         where: {
//           contractDtlId: adjustment.adjustmentDetails[0].contractDtlId
//         },
//         transaction: t
//       })
//     } else {
//       const data = {
//         contractId: adjustment.contractId,
//         itemName: 'Adjustment',
//         creditAdjAmount: adjustment.adjustmentDetails[0].adjustmentType === 'ADJ_TYP_CREDIT' ? adjustment.adjustmentDetails[0].adjAmount : null,
//         debitAdjAmount: adjustment.adjustmentDetails[0].adjustmentType === 'ADJ_TYP_DEBIT' ? adjustment.adjustmentDetails[0].adjAmount : null,
//         status: 'UNBILLED'
//       }

//       await MonthlyContractDtl.create(data, { transaction: t })
//     }
//   }
//   t.commit()
// }

const createRCAndNRCMonthlyContractdtl = async (conn, t) => {
  // and status = 'ACTIVE'
  const tranId = uuidv4()

  const contractDetails = await conn.sequelize.query(
    `select * from contract_dtl where contract_dtl_id not in ( select contract_dtl_id from contract_scheduler cs where contract_dtl_id is not null)
    and status not in ('CREATED','CANCEL') and charge_type in ('CC_RC') and status =  'CONTR_ST_OPEN' 
    union
    select * from contract_dtl where contract_dtl_id not in ( select contract_dtl_id from contract_scheduler cs where contract_dtl_id is not null)
    and charge_type = 'CC_NRC' and status not in ('CREATED','CANCEL') and status = 'CONTR_ST_OPEN'
    order by actual_start_date `, {
      type: QueryTypes.SELECT,
      model: conn.ContractDtl,
      mapToModel: true,
      transaction: t
    })
  if (Array.isArray(contractDetails) && !isEmpty(contractDetails)) {
    let totalAmount = 0
    for (let contractDtl of contractDetails) {
      contractDtl = contractDtl.dataValues
      const startDate = new Date(contractDtl.actualStartDate)
      const endDate = new Date(contractDtl.actualEndDate)
      const chargeAmt = Math.round((Number(contractDtl.chargeAmt) + Number.EPSILON) * 100) / 100
      let contractDtlStartDate, contractDtlEndDate, actualStartDate, actualEndDate, /* nextBill, */ status, lastMonthBillPeriod
      let getContractDetails = {}
      if (contractDtl && contractDtl?.contractId) {
        console.log('....Inside Get Contract Customer Details')
        getContractDetails = await conn.Contract.findOne({
          where: {
            contractId: contractDtl?.contractId
          },
          logging: console.log
        })
      }
      getContractDetails = getContractDetails?.dataValues ? getContractDetails?.dataValues : getContractDetails

      contractDtl.customerUuid = getContractDetails?.customerUuid || ''
      contractDtl.accountUuid = getContractDetails?.accountUuid || ''
      contractDtl.serviceUuid = getContractDetails?.serviceUuid || ''
      contractDtl.serviceId = getContractDetails?.serviceId || ''
      contractDtl.tranId = tranId

      if (contractDtl.chargeType === 'CC_RC' && contractDtl.frequency === 'FREQ_MONTH') {
        // const noOfMonths = noOfMonthsBetween2Dates(startDate, endDate)
        const noOfMonths = Number(contractDtl?.durationMonth)
        logger.debug('NoOfMonths: ', noOfMonths)
        totalAmount = chargeAmt
        for (let q = 0; q < noOfMonths; q++) {
          const m = 1 * q
          contractDtlStartDate = moment.utc(getFutureDates(startDate, m)).startOf('month').format('YYYY-MM-DD')
          contractDtlEndDate = moment.utc(contractDtlStartDate).endOf('month').format('YYYY-MM-DD')
          // format(endOfMonth(contractDtlStartDate), 'yyyy-MM-dd')
          if (moment.utc(startDate).format('YYYY-MM-DD') > moment.utc(contractDtlStartDate).format('YYYY-MM-DD')) {
            actualStartDate = moment.utc(startDate).format('YYYY-MM-DD')
          } else {
            actualStartDate = contractDtlStartDate
          }
          if (moment.utc(endDate).format('YYYY-MM-DD') < moment(contractDtlEndDate).format('YYYY-MM-DD')) {
            actualEndDate = moment.utc(endDate).format('YYYY-MM-DD')
          } else {
            actualEndDate = contractDtlEndDate
          }

          const nextMonthBillPeriod = moment.utc(actualStartDate).startOf('month').format('YYYY-MM-DD')

          const ret = await calculateInvoice(chargeAmt, totalAmount, contractDtl, actualStartDate, actualEndDate, noOfMonths)
          const balanceAmount = Number(ret.balanceAmount)
          logger.debug('Monthly amount: ', ret.invoiceAmt)

          // nextBill = balanceAmount === 0 ? null : nextMonthBillPeriod

          contractDtl.lastBillPeriod = lastMonthBillPeriod
          // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= format(startDate, 'yyyy-MM-dd') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd')
          if (contractDtl.upfrontPayment === 'N') {
            contractDtl.nextBillPeriod = moment.utc(getFutureDates(actualStartDate, 1)).startOf('month').format('YYYY-MM-DD')
          } else {
            contractDtl.nextBillPeriod = moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') >= moment.utc(startDate).format('YYYY-MM-DD') ? moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') : moment.utc(startDate).format('YYYY-MM-DD')
          }
          console.log(contractDtl.nextBillPeriod, '=============::===============', format(new Date(), 'yyyy-MM-dd'))
          if (contractDtl.nextBillPeriod < format(new Date(), 'yyyy-MM-dd')) {
            status = defaultStatus.BILLED
          } else {
            status = defaultStatus.SCHEDULED
          }

          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = ret.invoiceAmt
          contractDtl.balanceAmount = balanceAmount
          contractDtl.status = status
          contractDtl.createdAt = new Date()

          logger.debug('Creating Monthly contractdtl for charge type RC')

          const dtl = await conn.MonthlyContractDtl.create(contractDtl, { transaction: t })
          totalAmount = balanceAmount
          lastMonthBillPeriod = contractDtl.nextBillPeriod
          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: contractDtl.nextBillPeriod,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Scheduled Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }
          await conn.ContractScheduler.create(sch, { transaction: t })
        }
      } else if (contractDtl.chargeType === 'CC_RC' && contractDtl.frequency === 'FREQ_QUARTER') {
        const noOfQuarters = getQuarter(startDate, endDate)
        logger.debug('NoOfQuarters: ', noOfQuarters)
        totalAmount = chargeAmt
        for (let q = 0; q < noOfQuarters; q++) {
          const m = 3 * q
          contractDtlStartDate = moment.utc(getFutureDates(startDate, m)).startOf('month').format('YYYY-MM-DD')
          contractDtlEndDate = moment.utc(getFutureDates(contractDtlStartDate, 2)).endOf('month').format('YYYY-MM-DD')

          if (moment.utc(startDate).format('YYYY-MM-DD') > moment.utc(contractDtlStartDate).format('YYYY-MM-DD')) {
            actualStartDate = moment.utc(startDate).format('YYYY-MM-DD')
          } else {
            actualStartDate = contractDtlStartDate
          }
          if (moment.utc(endDate).format('YYYY-MM-DD') < moment.utc(contractDtlEndDate).format('YYYY-MM-DD')) {
            actualEndDate = moment.utc(endDate).format('YYYY-MM-DD')
          } else {
            actualEndDate = contractDtlEndDate
          }
          const nextMonthBillPeriod = moment.utc(actualStartDate).startOf('month').format('YYYY-MM-DD')

          const ret = await calculateInvoice(chargeAmt, totalAmount, contractDtl, actualStartDate, actualEndDate, noOfQuarters)
          const balanceAmount = Number(ret.balanceAmount)
          logger.debug('Monthly amount: ', ret.invoiceAmt)

          // nextBill = balanceAmount === 0 ? null : nextMonthBillPeriod

          contractDtl.lastBillPeriod = lastMonthBillPeriod

          if (contractDtl.upfrontPayment === 'N') {
            contractDtl.nextBillPeriod = moment.utc(getFutureDates(actualStartDate, 3)).startOf('month').format('YYYY-MM-DD')
          } else {
            contractDtl.nextBillPeriod = moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') >= moment.utc(startDate).format('YYYY-MM-DD') ? moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') : moment.utc(startDate).format('YYYY-MM-DD')
          }

          if (contractDtl.nextBillPeriod < format(new Date(), 'yyyy-MM-dd')) {
            status = defaultStatus.BILLED
            // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= moment.utc(startDate).format('YYYY-MM-DD') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : moment.utc(startDate).format('YYYY-MM-DD')
          } else {
            status = defaultStatus.SCHEDULED
            // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= moment.utc(startDate).format('YYYY-MM-DD') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : moment.utc(startDate).format('YYYY-MM-DD')
          }

          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = ret.invoiceAmt
          contractDtl.balanceAmount = balanceAmount
          contractDtl.status = status
          contractDtl.createdAt = new Date()
          logger.debug('Creating Monthly contractdtl for charge type RC')

          const dtl = await conn.MonthlyContractDtl.create(contractDtl, { transaction: t })
          totalAmount = balanceAmount
          lastMonthBillPeriod = contractDtl.nextBillPeriod
          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: contractDtl.nextBillPeriod,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Migrated main Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }
          await conn.ContractScheduler.create(sch, { transaction: t })
        }
        const remainingMonths = (Number(contractDtl.durationMonth) - Number(noOfQuarters) * 3)
        if (remainingMonths > 0) {
          status = defaultStatus.SCHEDULED
          actualStartDate = format(startOfMonth(new Date(getFutureDates(startOfMonth(new Date(actualEndDate)), 1))), 'yyyy-MM-dd')
          actualEndDate = format(new Date(endDate), 'yyyy-MM-dd')
          contractDtl.status = status
          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = totalAmount
          contractDtl.balanceAmount = 0
          contractDtl.lastBillPeriod = contractDtl.nextBillPeriod
          contractDtl.nextBillPeriod = actualStartDate
          contractDtl.createdAt = new Date()
          const dtl = await conn.MonthlyContractDtl.create(contractDtl, { transaction: t })

          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: actualStartDate,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Migrated main Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }

          await conn.ContractScheduler.create(sch, { transaction: t })
        }
      } else if (contractDtl.chargeType === 'CC_RC' && contractDtl.frequency === 'FREQ_HALF_YEAR') {
        // const noOfMonths = noOfMonthsBetween2Dates(startDate, endDate)
        const noOfMonths = Number(contractDtl?.durationMonth)
        const noOfHalfYears = Number(contractDtl?.durationMonth) / 6
        logger.debug('NoOfMonths: ', noOfMonths)
        logger.debug('noOfHalfYears: ', noOfHalfYears)
        totalAmount = chargeAmt
        for (let q = 0; q < noOfHalfYears; q++) {
          const m = 6 * q
          contractDtlStartDate = moment.utc(getFutureDates(startDate, m)).startOf('month').format('YYYY-MM-DD')
          contractDtlEndDate = moment.utc(getFutureDates(contractDtlStartDate, 5)).endOf('month').format('YYYY-MM-DD')

          if (moment.utc(startDate).format('YYYY-MM-DD') > moment.utc(contractDtlStartDate).format('YYYY-MM-DD')) {
            actualStartDate = moment.utc(startDate).format('YYYY-MM-DD')
          } else {
            actualStartDate = contractDtlStartDate
          }
          if (moment.utc(endDate).format('YYYY-MM-DD') < moment.utc(contractDtlEndDate).format('YYYY-MM-DD')) {
            actualEndDate = moment.utc(endDate).format('YYYY-MM-DD')
          } else {
            actualEndDate = contractDtlEndDate
          }
          const nextMonthBillPeriod = moment.utc(actualStartDate).startOf('month').format('YYYY-MM-DD')

          const ret = await calculateInvoice(chargeAmt, totalAmount, contractDtl, actualStartDate, actualEndDate, noOfHalfYears)
          const balanceAmount = Number(ret.balanceAmount)
          logger.debug('Monthly amount: ', ret.invoiceAmt)

          //  nextBill = balanceAmount === 0 ? null : nextMonthBillPeriod

          contractDtl.lastBillPeriod = lastMonthBillPeriod
          // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= moment.utc(startDate).format('YYYY-MM-DD') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : moment.utc(startDate).format('YYYY-MM-DD')
          if (contractDtl.upfrontPayment === 'N') {
            contractDtl.nextBillPeriod = moment.utc(getFutureDates(actualStartDate, 6)).startOf('month').format('YYYY-MM-DD')
          } else {
            contractDtl.nextBillPeriod = moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') >= moment.utc(startDate).format('YYYY-MM-DD') ? moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') : moment.utc(startDate).format('YYYY-MM-DD')
          }

          if (contractDtl.nextBillPeriod < format(new Date(), 'yyyy-MM-dd')) {
            status = defaultStatus.BILLED
          } else {
            status = defaultStatus.SCHEDULED
          }

          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = ret.invoiceAmt
          contractDtl.balanceAmount = balanceAmount
          contractDtl.status = status
          contractDtl.createdAt = new Date()
          logger.debug('Creating Monthly contractdtl for charge type RC')

          const dtl = await conn.MonthlyContractDtl.create(contractDtl, { transaction: t })
          totalAmount = balanceAmount
          lastMonthBillPeriod = contractDtl.nextBillPeriod
          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: contractDtl.nextBillPeriod,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Scheduled Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }
          await conn.ContractScheduler.create(sch, { transaction: t })
        }
      } else if (contractDtl.chargeType === 'CC_RC' && contractDtl.frequency === 'FREQ_YEAR') {
        // const noOfMonths = noOfMonthsBetween2Dates(startDate, endDate)
        const noOfMonths = Number(contractDtl?.durationMonth)
        const noOfYears = Number(contractDtl?.durationMonth) / 12
        logger.debug('NoOfMonths: ', noOfMonths)
        logger.debug('noOfYears: ', noOfYears)
        totalAmount = chargeAmt
        for (let q = 0; q < noOfYears; q++) {
          const m = 12 * q
          contractDtlStartDate = moment(getFutureDates(startDate, m)).startOf('month').format('YYYY-MM-DD')
          contractDtlEndDate = moment(getFutureDates(contractDtlStartDate, 11)).endOf('month').format('YYYY-MM-DD')

          if (moment(startDate).format('YYYY-MM-DD') > moment(contractDtlStartDate).format('YYYY-MM-DD')) {
            actualStartDate = moment(startDate).format('YYYY-MM-DD')
          } else {
            actualStartDate = contractDtlStartDate
          }
          if (moment(endDate).format('YYYY-MM-DD') < moment(contractDtlEndDate).format('YYYY-MM-DD')) {
            actualEndDate = moment(endDate).format('YYYY-MM-DD')
          } else {
            actualEndDate = contractDtlEndDate
          }
          const nextMonthBillPeriod = moment(actualStartDate).startOf('month').format('YYYY-MM-DD')

          const ret = await calculateInvoice(chargeAmt, totalAmount, contractDtl, actualStartDate, actualEndDate, noOfYears)
          const balanceAmount = Number(ret.balanceAmount)
          logger.debug('Monthly amount: ', ret.invoiceAmt)

          // nextBill = balanceAmount === 0 ? null : nextMonthBillPeriod

          contractDtl.lastBillPeriod = lastMonthBillPeriod
          // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= moment.utc(startDate).format('YYYY-MM-DD') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : moment.utc(startDate).format('YYYY-MM-DD')
          if (contractDtl.upfrontPayment === defaultCode.NO) {
            contractDtl.nextBillPeriod = moment(getFutureDates(actualStartDate, 12)).startOf('month').format('YYYY-MM-DD')
          } else {
            contractDtl.nextBillPeriod = moment(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') >= moment.utc(startDate).format('YYYY-MM-DD') ? moment(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') : moment.utc(startDate).format('YYYY-MM-DD')
          }

          if (contractDtl.nextBillPeriod < format(new Date(), 'yyyy-MM-dd')) {
            status = defaultStatus.BILLED
          } else {
            status = defaultStatus.SCHEDULED
          }

          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = ret.invoiceAmt
          contractDtl.balanceAmount = balanceAmount
          contractDtl.status = status
          contractDtl.createdAt = new Date()
          logger.debug('Creating Monthly contractdtl for charge type RC')

          const dtl = await conn.MonthlyContractDtl.create(contractDtl, { transaction: t })
          totalAmount = balanceAmount
          lastMonthBillPeriod = contractDtl.nextBillPeriod
          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: contractDtl.nextBillPeriod,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Scheduled Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }
          await conn.ContractScheduler.create(sch, { transaction: t })
        }
      } else if (contractDtl.chargeType === 'CC_NRC') {
        const lastMonthBillPeriod = null
        const nextMonthBillPeriod = format(new Date(startDate), 'yyyy-MM-dd')
        let balanceAmount = 0
        /// frequcny changes
        if (format(startDate, 'yyyy-MM-dd') < format(startOfMonth(new Date()), 'yyyy-MM-dd')) {
          status = defaultStatus.BILLED
          // contractDtl.isMigrated = 'Y'
        } else {
          status = defaultStatus.SCHEDULED
          balanceAmount = chargeAmt
        }
        // if(contractDtl.frequency === 'FREQ_QUARTER')  {
        //   if (format(startDate, 'yyyy-MM-dd') < format(startOfMonth(new Date()), 'yyyy-MM-dd')) {
        //     status = defaultStatus.BILLED
        //     contractDtl.isMigrated = 'Y'
        //   } else {
        //     status = defaultStatus.SCHEDULED
        //     balanceAmount = chargeAmt
        //   }
        // } else if (contractDtl.frequency === 'FREQ_MONTH') {
        //   status = defaultStatus.SCHEDULED
        //   balanceAmount = chargeAmt
        // }
        contractDtl.actualStartDate = startDate
        contractDtl.actualEndDate = endDate
        contractDtl.chargeAmt = chargeAmt
        contractDtl.balanceAmount = balanceAmount
        contractDtl.nextBillPeriod = nextMonthBillPeriod
        contractDtl.lastBillPeriod = lastMonthBillPeriod
        contractDtl.status = status
        contractDtl.createdAt = new Date()
        // if(contractDtl.upfrontPayment === 'N') {
        //   contractDtl.nextBillPeriod = format(startOfMonth(new Date(getFutureDates(actualStartDate, 1))), 'yyyy-MM-dd')
        // } else {
        //   contractDtl.nextBillPeriod = format(new Date(startDate), 'yyyy-MM-dd')
        // }
        logger.debug('Creating Monthly contractdtl for charge type NRC')
        const dtl = await conn.MonthlyContractDtl.create(contractDtl, { transaction: t })
        console.log('=========================================')

        const sch = {
          schedulerName: 'Scheduler for Contracts',
          scheduleDatetime: format(new Date(nextMonthBillPeriod), 'yyyy-MM-dd'),
          billPeriod: format(new Date(startDate), 'yyyy-MM-dd').toString() + '-' + format(new Date(endDate), 'yyyy-MM-dd').toString(),
          scheduleStatus: status,
          remarks: 'Migrated main Contracts',
          soId: contractDtl.soId,
          contractId: contractDtl.contractId,
          contractDtlId: contractDtl.contractDtlId,
          createdBy: systemUserId,
          monthlyContractDtlId: dtl.monthlyContractDtlId
        }
        await conn.ContractScheduler.create(sch, { transaction: t })
      }
    }
  }
  logger.debug('Succesfully created Monthly contract details for RC and NRC')
}

const createUsageMonthlyContractdtl = async (conn, t) => {
  logger.debug('Creating Monthly contract details for USAGE')
  const usageContractDetails = await conn.sequelize.query(
    `select * from contract_dtl where contract_dtl_id not in (select contract_dtl_id from contract_scheduler cs where contract_dtl_id is not null) 
          and status='CONTR_ST_OPEN' and charge_type in ('CC_USGC')            
        `, {
      type: QueryTypes.SELECT,
      model: conn.ContractDtl,
      mapToModel: true,
      transaction: t
    })
  if (usageContractDetails && !isEmpty(usageContractDetails)) {
    let minCommitment = 0; let soNumber
    const soNumbers = []
    // const nextMonthBillPeriod = startOfMonth(new Date(getFutureDates(usageContractDetails[0].nextBillPeriod, 3)))
    const lastBill = usageContractDetails[0].nextBillPeriod
    let contractBillMonth
    for (const contractDtl of usageContractDetails) {
      if (contractDtl.chargeType === 'CC_USGC') {
        minCommitment += Number(contractDtl.dataValues.minCommitment)
        soNumbers.push(contractDtl.dataValues.soNumber)
        if (soNumbers.length > 0) {
          soNumber = [...new Set(soNumbers)].toString()
        }
      }
    }
    for (let i = 1; i <= 3; i++) {
      contractBillMonth = getOlderDates(lastBill, i)
      const billStartDate = format(startOfMonth(new Date(contractBillMonth)), 'yyyy-MM-dd')
      const billEndDate = format(endOfMonth(new Date(contractBillMonth)), 'yyyy-MM-dd')
      const data = {
        minCommitment,
        soNumber,
        isMigrated: 'Y',
        createdBy: systemUserId,
        updatedBy: systemUserId,
        status: defaultStatus.SCHEDULED,
        actualStartDate: billStartDate,
        endDate: billEndDate,
        actualEndDate: billEndDate,
        // itemName: usageContractDetails[0].itemName,
        // itemId: usageContractDetails[0].itemId,
        contractId: usageContractDetails[0].contractId,
        contractDtlId: usageContractDetails[0].contractDtlId,
        frequency: usageContractDetails[0].frequency,
        prorated: usageContractDetails[0].prorated,
        chargeName: usageContractDetails[0].chargeName,
        chargeType: usageContractDetails[0].chargeType,
        upfrontPayment: usageContractDetails[0].upfrontPayment,
        quantity: minCommitment,
        durationMonth: usageContractDetails[0].durationMonth,
        soId: usageContractDetails[0].soId,
        nextBillPeriod: usageContractDetails[0].nextBillPeriod,
        lastBillPeriod: usageContractDetails[0].lastBillPeriod
      }
      logger.debug('Creating monthly dtl contracts')
      const dtl = await conn.MonthlyContractDtl.create(data, { transaction: t })

      const sch = {
        schedulerName: 'Scheduler for Contracts',
        scheduleDatetime: format(new Date(lastBill), 'yyyy-MM-dd'),
        billPeriod: format(startOfMonth(new Date(getOlderDates(lastBill, 1))), 'yyyy-MM-dd').toString() + '-' + format(startOfMonth(new Date(getOlderDates(lastBill, 3))), 'yyyy-MM-dd').toString(),
        scheduleStatus: defaultStatus.SCHEDULED,
        remarks: 'Migrated Usage Contracts',
        soId: usageContractDetails[0].soId,
        contractId: usageContractDetails[0].contractId,
        contractDtlId: usageContractDetails[0].contractDtlId,
        createdBy: systemUserId,
        monthlyContractDtlId: dtl.monthlyContractDtlId
      }
      await conn.ContractScheduler.create(sch, { transaction: t })
    }
  }
  logger.debug('Succesfully created Monthly contract details for USAGE')
}

const createMonthlyContract = async (conn, t) => {
  logger.debug('Creating Monthly contracts ')
  const contracts = await conn.sequelize.query(`select * from contract_hdr where contract_id in 
  (select contract_id from contract_scheduler cs where contract_id is not null and monthly_contract_id is null) 
  and status = 'CONTR_ST_OPEN'`, {
    type: QueryTypes.SELECT,
    model: conn.Contract,
    mapToModel: true,
    transaction: t
  })

  if (Array.isArray(contracts) && !isEmpty(contracts)) {
    for (const contract of contracts) {
      const sql = `select * from GET_MONTHLY_CONTRACT_JOB('BILLED',${contract.contractId})`

      let billedContractDetails = await conn.sequelize.query(sql, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      billedContractDetails = camelCaseConversion(billedContractDetails)
      let noOfBillings = 0
      logger.debug('Count of billed monthly contract details: ', billedContractDetails.length)
      if (Array.isArray(billedContractDetails) && !isEmpty(billedContractDetails)) {
        for (const contractDtl of billedContractDetails) {
          noOfBillings = noOfBillings + 1
          // const contractStart = format(new Date(contractDtl.actualStartDate), 'yyyy-MM-dd')
          // const contractEnd = format(new Date(contractDtl.actualEndDate), 'yyyy-MM-dd')
          // const nextMonthBillPeriod = startOfMonth(new Date(getFutureDates(startOfMonth(new Date(contractDtl.actualEndDate)), 1)))
          // const lastBill = startOfMonth(new Date(contractDtl.actualEndDate))
          contract.isNew = 'N'
          contract.status = defaultStatus.BILLED
          contract.startDate = contractDtl.actualStartDate
          contract.endDate = contractDtl.actualEndDate
          contract.actualEndDate = contractDtl.actualEndDate
          // contract.nextBillPeriod = nextMonthBillPeriod
          // contract.lastBillPeriod = lastBill
          contract.nextBillPeriod = contractDtl.nextBillPeriod
          contract.lastBillPeriod = contractDtl.lastBillPeriod
          contract.contractId = contractDtl.contractId
          const rcAmount = contractDtl.rcAmount
          const otcAmount = contractDtl.otcAmount

          contract.rcAmount = rcAmount
          contract.otcAmount = otcAmount
          contract.createdAt = new Date()
          contract.dataValues.noOfBillings = noOfBillings

          logger.debug('Creating Monthly Contract Record')
          const contractId = await conn.MonthlyContract.create(contract.dataValues, { transaction: t })

          await conn.MonthlyContractDtl.update({
            monthlyContractId: contractId.monthlyContractId
          },
          {
            where: {
              actualStartDate: contractDtl.actualStartDate,
              // actualEndDate: contractDtl.actualEndDate,
              status: defaultStatus.BILLED,
              contractId: contractDtl.contractId
            },
            transaction: t
          })
          await conn.ContractScheduler.update({
            monthlyContractId: contractId.monthlyContractId
          },
          {
            where: {
              billPeriod: {
                [Op.like]: `${contractDtl.actualStartDate}%`
              },
              scheduleStatus: defaultStatus.BILLED,
              contractId: contractDtl.contractId,
              monthlyContractId: null
            },
            transaction: t
          })
        }
      }

      const schSql = `select * from GET_MONTHLY_CONTRACT_JOB('SCHEDULED',${contract.contractId})`

      let scheduledContractDetails = await conn.sequelize.query(schSql, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      scheduledContractDetails = camelCaseConversion(scheduledContractDetails)
      console.log('scheduledContractDetails', scheduledContractDetails)
      // console.log(aaa)
      logger.debug('Count of scheduled monthly contract details: ', scheduledContractDetails.length)
      if (Array.isArray(scheduledContractDetails) && !isEmpty(scheduledContractDetails)) {
        for (const contractDtl of scheduledContractDetails) {
          // console.log('contractDtl',contractDtl)
          noOfBillings = noOfBillings + 1
          // const contractStart = format(new Date(contractDtl.actualStartDate), 'yyyy-MM-dd')
          // const contractEnd = format(new Date(contractDtl.actualEndDate), 'yyyy-MM-dd')
          contract.isNew = 'N'
          contract.status = defaultStatus.SCHEDULED
          contract.actualStartDate = contractDtl.actualStartDate
          // contract.endDate = contractDtl.actualEndDate
          contract.actualEndDate = contractDtl.actualEndDate
          contract.nextBillPeriod = contractDtl.nextBillPeriod
          contract.lastBillPeriod = contractDtl.lastBillPeriod
          contract.contractId = contractDtl.contractId
          contract.rcAmount = contractDtl.rcAmount
          contract.otcAmount = contractDtl.otcAmount
          contract.dataValues.noOfBillings = noOfBillings
          // console.log('contractDtl',contract)
          logger.debug('Creating scheduled monthly contacts')
          const contractId = await conn.MonthlyContract.create(contract.dataValues, { transaction: t })
          await conn.MonthlyContractDtl.update({
            monthlyContractId: contractId.monthlyContractId
          },
          {
            where: {
              // isMigrated: 'Y',
              actualStartDate: contractDtl.actualStartDate,
              // actualEndDate: contractDtl.actualEndDate,
              status: defaultStatus.SCHEDULED,
              contractId: contractDtl.contractId
            },
            transaction: t
          })

          await conn.ContractScheduler.update({
            monthlyContractId: contractId.monthlyContractId
          },
          {
            where: {
              billPeriod: {
                [Op.like]: `${contractDtl.actualStartDate}%`
              },
              scheduleStatus: defaultStatus.SCHEDULED,
              contractId: contractDtl.contractId,
              monthlyContractId: null
            },
            transaction: t
          })
        }
      }
      const scheduledUsageContract = await conn.sequelize.query(`select * from Contract_hdr where contract_id in (select contract_id 
                                      from monthly_contract_dtl where status='SCHEDULED' and charge_type='CC_USGC')`, {
        type: QueryTypes.SELECT,
        model: conn.Contract,
        mapToModel: true,
        transaction: t
      })
      logger.debug('Count of scheduled monthly usage contract: ', scheduledUsageContract.length)
      if (Array.isArray(scheduledUsageContract) && !isEmpty(scheduledUsageContract)) {
        for (const contract of scheduledUsageContract) {
          contract.isNew = 'N'
          contract.status = defaultStatus.SCHEDULED
          logger.debug('Creating scheduled monthly contacts for usage')
          const contractId = await conn.MonthlyContract.create(contract.dataValues, { transaction: t })
          await conn.MonthlyContractDtl.update({ monthlyContractId: contractId.monthlyContractId }, {
            where: {
              chargeType: 'CC_USGC',
              status: defaultStatus.SCHEDULED,
              nextBillPeriod: contract.dataValues.nextBillPeriod
            },
            transaction: t
          })
          const dtl = await conn.MonthlyContractDtl.findAll({
            where: {
              chargeType: 'CC_USGC',
              status: defaultStatus.SCHEDULED,
              nextBillPeriod: contract.dataValues.nextBillPeriod,
              monthlyContractId: contractId.monthlyContractId
            },
            transaction: t
          })
          const monthlyContractIds = map(dtl, 'monthlyContractDtlId')
          await conn.ContractScheduler.update({ monthlyContractId: contractId.monthlyContractId },
            {
              where: {
                monthlyContractDtlId: monthlyContractIds,
                scheduleStatus: defaultStatus.SCHEDULED,
                monthlyContractId: null
              },
              transaction: t
            })
        }
      }
    }
  }
  logger.debug('Succesfully created Monthly contracts')
}

// async function mergeMonthlyContractDtl (contractIds, billPeriod, endOfbillPeriodMonth, contractType, t) {
//   contractIds = [...new Set(contractIds)]
//   logger.info('Inside onhold existing unbilled contract merge')
//   const monthlyContractIds = await MonthlyContract.findAll({
//     where: {
//       contractId: contractIds,
//       status: {
//         [Op.ne]: defaultStatus.BILLED
//       }
//     }
//   })
//   if (monthlyContractIds.length > 0) {
//     let data
//     for (const monthlyContractId of monthlyContractIds) {
//       let rcAmount = 0; let otcAmount = 0; let usageAmount = 0
//       await MonthlyContractDtl.update({ monthlyContractId: monthlyContractId.monthlyContractId }, {
//         where: {
//           contractId: monthlyContractId.contractId,
//           status: 'UNBILLED'
//         },
//         transaction: t
//       })
//       const res = await MonthlyContractDtl.findAll({
//         where: {
//           contractId: monthlyContractId.contractId,
//           status: 'UNBILLED'
//         }
//       })
//       for (const rec of res) {
//         rcAmount += rec.chargeType === 'CC_RC' ? Number(rec.chargeAmt) : 0
//         otcAmount += rec.chargeType === 'CC_NRC' ? Number(rec.chargeAmt) : 0
//         usageAmount += rec.chargeType === 'CC_USGC' ? Number(rec.chargeAmt) : 0
//       }
//       data = {
//         rcAmount,
//         otcAmount,
//         usageAmount
//       }
//       await MonthlyContract.update(data, { where: { monthlyContractId: monthlyContractId.monthlyContractId }, transaction: t })
//     }
//   } else {
//     for (const contractId of contractIds) {
//       const contracts = await Contract.findOne({
//         where: {
//           contractId
//         }
//       })
//       let detailsRecords
//       if (contractType === 'OLD') {
//         detailsRecords = await MonthlyContractDtl.findAll({
//           where: {
//             contractId,
//             nextBillPeriod: {
//               [Op.lt]: billPeriod
//             },
//             status: 'UNBILLED'
//           }
//         })
//       } else {
//         detailsRecords = await MonthlyContractDtl.findAll({
//           where: {
//             contractId,
//             nextBillPeriod: {
//               [Op.gte]: billPeriod,
//               [Op.lte]: endOfbillPeriodMonth
//             },
//             status: 'UNBILLED'
//           }
//         })
//       }

//       const data = {}
//       for (const contract of detailsRecords) {
//         let rcAmount = 0; let otcAmount = 0; let usageAmount = 0
//         rcAmount += contract.chargeType === 'CC_RC' ? Number(contract.chargeAmt) : 0
//         otcAmount += contract.chargeType === 'CC_NRC' ? Number(contract.chargeAmt) : 0
//         usageAmount += contract.chargeType === 'CC_USGC' ? Number(contract.chargeAmt) : 0

//         data.isNew = contract.lastBillPeriod === null ? 'Y' : 'N'
//         data.createdBy = systemUserId
//         data.updatedBy = systemUserId
//         data.status = 'UNBILLED'
//         data.startDate = format(new Date(contract.actualStartDate), 'yyyy-MM-dd')
//         data.endDate = format(new Date(contract.actualEndDate), 'yyyy-MM-dd')
//         data.rcAmount = rcAmount
//         data.otcAmount = contract.lastBillPeriod === null ? otcAmount : 0
//         data.usageAmount = usageAmount
//         data.contractId = contracts.contractId
//         data.customerId = contracts.customerId
//         data.billRefNo = contracts.billRefNo
//         data.nextBillPeriod = contract.nextBillPeriod

//         const monthContract = await MonthlyContract.create(data, { transaction: t })
//         await MonthlyContractDtl.update({ monthlyContractId: monthContract.monthlyContractId }, {
//           where: { monthlyContractDtlId: contract.monthlyContractDtlId },
//           transaction: t
//         })
//       }
//     }
//   }
// }
