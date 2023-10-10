/* eslint-disable array-callback-return */
import contractResources, { transformConnection, transformContract, transformContractDetail } from '@resources'
import { defaultCode, defaultMessage, defaultStatus, logger, statusCodeConstants } from '@utils'
import { format, startOfMonth } from 'date-fns'
import { isEmpty, map } from 'lodash'
import moment from 'moment'
import { Op } from 'sequelize'
import { getDaysInMonth, noOfDaysBetween2Dates, returnInvoiceAmountProrate } from '../utils/util'
import { generateMonthlyUnBilledContracts, generateScheduledMonthlyContracts } from './contracts-job-service'
const cron = require('node-cron')

let instance

class ContractService {
  constructor () {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async getUnbilledContracts (contractData, userId, conn) {
    try {
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE } = contractData
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }
      let whereClause = {}

      if (contractData && contractData?.customerUuid) {
        whereClause.customerUuid = contractData.customerUuid
      }

      if (contractData && contractData?.contractId) {
        whereClause.contractId = contractData.contractId
      }

      let customerWhere = {}
      let isCustomerIncluded = false
      if (contractData && contractData?.customerName) {
        isCustomerIncluded = true
        customerWhere = {
          [Op.and]: conn.sequelize.where(conn.sequelize.fn('concat', conn.sequelize.fn('UPPER', conn.sequelize.col('Customer.first_name')), ' ',
            conn.sequelize.fn('UPPER', conn.sequelize.col('Customer.last_name'))), {
            [Op.like]: `%${contractData?.customerName.toUpperCase()}%`
          })
        }
      }

      if (contractData.startDate || contractData.endDate) {
        if (contractData?.startDate && contractData?.startDate !== '' && contractData?.endDate && contractData?.endDate !== '') {
          whereClause = {
            [Op.and]: [
              {
                actualStartDate: conn.sequelize.literal(`DATE("MonthlyContract"."actual_start_date") >= DATE('${contractData?.startDate}')`),
                actualEndDate: conn.sequelize.literal(`DATE("MonthlyContract"."actual_end_date") <= DATE('${contractData?.endDate}')`)
              }
            ]
          }
        } else if (contractData?.startDate && contractData?.startDate !== '') {
          whereClause = {
            [Op.and]: [
              [conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('MonthlyContract.actual_start_date')), '>=', contractData.startDate)]
            ]
          }
        } else if (contractData.endDate && contractData.endDate !== '') {
          whereClause = {
            [Op.and]: [
              [conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('MonthlyContract.actual_end_date')), '<=', contractData.endDate)]
            ]
          }
        }
      }

      if (contractData && contractData?.customerNumber) {
        isCustomerIncluded = true
        customerWhere.customerNo = { [Op.like]: `%${contractData?.customerNumber.toString()}%` }
      }

      let customerSearchIds
      if (isCustomerIncluded) {
        const customer = await conn.Customer.findAll({
          attributes: ['customerId'],
          where: customerWhere
        })
        customerSearchIds = map(customer, 'customerId')
      }
      if (isCustomerIncluded && isEmpty(customerSearchIds)) {
        const data = {
          count: 0,
          rows: []
        }
        return {
          status: statusCodeConstants?.SUCCESS,
          message: 'No contracts found',
          data
        }
      } else if (isCustomerIncluded && customerSearchIds) {
        whereClause.customerId = customerSearchIds
      }
      const count = await conn.MonthlyContract.count({
        include: [
          {
            model: conn.Customer,
            as: 'customer',
            attributes: ['customerId', 'firstName', 'lastName', 'customerNo']
          }
        ],
        where: {
          ...whereClause,
          status: [defaultStatus.UNBILLED, defaultStatus.PENDING]
        },
        ...params
      })

      const rows = await conn.MonthlyContract.findAll({
        include: [
          {
            model: conn.Customer,
            as: 'customer',
            attributes: ['customerId', 'firstName', 'lastName', 'customerNo']
            // include: [
            //   {
            //     model: conn.CustAccounts,
            //     as: 'account',
            //     attributes: ['accountId', 'customerId', 'accountNo'],
            //     include: [
            //       {
            //         model: conn.CustServices,
            //         as: 'accountServices',
            //         attributes: ['accountId', 'serviceId', 'serviceType']
            //         // include: [{
            //         //   model: conn.BusinessEntity,
            //         //   as: 'conn_typ',
            //         //   attributes: ['code',
            //         //     'codeType', 'description']
            //         // }]
            //       }
            //     ]
            //   }
            // ]
          },
          {
            model: conn.MonthlyContractDtl,
            as: 'monthlyContractDtl',
            include: [
              {
                model: conn.User,
                as: 'createdByName',
                attributes: ['firstName', 'lastName']
              },
              {
                model: conn.User,
                as: 'updatedByName',
                attributes: ['firstName', 'lastName']
              },
              {
                model: conn.BusinessEntity,
                as: 'statusDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'chargeTypeDesc',
                attributes: ['code', 'description']
              }
            ]
          },
          {
            model: conn.User,
            as: 'createdByName',
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.User,
            as: 'updatedByName',
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          }
        ],
        where: {
          ...whereClause,
          status: [defaultStatus.UNBILLED, defaultStatus.PENDING]
        },
        order: [['monthlyContractId', 'ASC'], ['createdAt', 'ASC']],
        ...params
      })

      const data = {
        count,
        rows
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched Unbilled contracts',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getBilledContracts (contractData, userId, conn) {
    try {
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE } = contractData
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }
      const whereClause = {}

      if (contractData && contractData?.customerUuid) {
        whereClause.customerUuid = contractData.customerUuid
      }

      if (contractData && contractData?.contractId) {
        whereClause.contractId = contractData.contractId
      }

      if (contractData && contractData?.billPeriod) {
        whereClause.billPeriod = contractData.billPeriod
      }

      if (contractData && contractData?.billYear) {
        whereClause.billYear = contractData.billYear
      }

      if (contractData && contractData?.billCycle) {
        whereClause.billCycle = contractData.billCycle
      }

      const responseCount = await conn.MonthlyContract.count({
        where: {
          ...whereClause,
          status: defaultStatus.BILLED
        }
      })

      const rows = await conn.MonthlyContract.findAll({
        include: [
          {
            model: conn.Customer,
            as: 'customer',
            attributes: ['customerUuid', 'firstName', 'lastName', 'customerNo'],
            include: [
              {
                model: conn.BusinessEntity,
                attributes: ['code', 'description'],
                as: 'customerCatDesc'
              },
              {
                model: conn.CustAccounts,
                as: 'account',
                attributes: ['accountUuid', 'customerUuid', 'accountNo', 'currency'],
                include: [
                  { model: conn.BusinessEntity, attributes: ['code', 'description'], as: 'currencyDesc' },
                  {
                    model: conn.CustServices,
                    as: 'accountServices',
                    attributes: ['accountUuid', 'serviceUuid', 'serviceType']
                    // include: [{
                    //   model: conn.BusinessEntity,
                    //   as: 'conn_typ',
                    //   attributes: ['code',
                    //     'codeType', 'description']
                    // }]
                  }
                ]
              }
            ]
          },
          { model: conn.BusinessEntity, attributes: ['code', 'description'], as: 'statusDesc' },
          { model: conn.User, attributes: ['firstName', 'lastName'], as: 'createdByName' },
          { model: conn.MonthlyContractDtl, as: 'monthlyContractDtl' }
        ],
        where: {
          ...whereClause,
          status: defaultStatus.BILLED
        },
        ...params
      })

      const counts = await calculateContractValue(rows)
      const response = {
        count: responseCount,
        rows,
        counts
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched Billed contracts',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getContractHistory (contractData, userId, conn) {
    try {
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE } = contractData
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }
      const whereClause = {}

      if (contractData && contractData?.customerUuid) {
        whereClause.customerUuid = contractData.customerUuid
      }

      const response = await conn.MonthlyContract.findAndCountAll({
        include: [
          {
            model: conn.Customer,
            as: 'customer',
            attributes: ['customerUuid', 'firstName', 'lastName', 'customerNo']
            /* include: [
              {
                model: conn.CustAccounts,
                as: 'account',
                attributes: ['accountUuid', 'customerUuid', 'accountNo'],
                include: [
                  {
                    model: conn.CustServices,
                    as: 'accountServices',
                    attributes: ['accountUuid', 'serviceUuid', 'serviceType']
                    // include: [{
                    //   model: conn.BusinessEntity,
                    //   as: 'conn_typ',
                    //   attributes: ['code',
                    //     'codeType', 'description']
                    // }]
                  }
                ]
              }
            ] */
          },
          { model: conn.User, attributes: ['firstName', 'lastName'], as: 'createdByName' },
          {
            model: conn.MonthlyContractDtl,
            as: 'monthlyContractDtl',
            include: [{
              model: conn.User,
              as: 'createdByName',
              attributes: ['firstName', 'lastName']
            },
            {
              model: conn.User,
              as: 'updatedByName',
              attributes: ['firstName', 'lastName']
            },
            {
              model: conn.BusinessEntity,
              as: 'statusDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'frequencyDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'chargeTypeDesc',
              attributes: ['code', 'description']
            }]
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          }
        ],
        where: {
          ...whereClause
        },
        ...params
        // logging:true
      })

      const arr = []
      for (const row of response.rows) {
        arr.push({
          ...row.dataValues,
          totalCharge: Number(row.dataValues.rcAmount || 0) + Number(row.dataValues.otcAmount || 0)
        })
      }
      // console.log('response===>', arr)
      const rep = {
        count: response.count,
        rows: arr
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched Billed contracts',
        data: rep
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getMonthlyContractCounts (contractData, userId, conn, t) {
    try {
      const contracts = await conn.MonthlyContract.findAll({
        attributes: ['contractId', 'rcAmount', 'otcAmount', 'usageAmount', 'creditAdjAmount', 'debitAdjAmount', 'billMonth', 'customerId', 'isNew'],
        where: {
          [Op.or]: [{ status: defaultStatus.PENDING }, { status: defaultStatus.UNBILLED }, { status: defaultStatus.REGENERATE }, { status: defaultStatus.HOLD }]
        },
        transaction: t
      })
      const response = await calculateContractValue(contracts)
      // let contractCount = 0
      // let contractValue = 0
      // let revenue = 0
      // let customers = 0
      // let newCustomers = 0
      // let rcAmount = 0
      // let nrcAmount = 0
      // let usageAmount = 0

      // if (Array.isArray(contracts) && contracts.length > 0) {
      //   contractCount = contracts.length
      //   let creditAdjAmount = 0
      //   let debitAdjAMount = 0
      //   const customerIds = []
      //   const existingCustomerIds = []
      //   for (const con of contracts) {
      //     rcAmount += con.rcAmount ? Number(con.rcAmount) : 0
      //     nrcAmount += con.otcAmount ? Number(con.otcAmount) : 0
      //     usageAmount += con.usageAmount ? Number(con.usageAmount) : 0
      //     creditAdjAmount += con.creditAdjAmount ? Number(con.creditAdjAmount) : 0
      //     debitAdjAMount += con.debitAdjAmount ? Number(con.debitAdjAmount) : 0

      //     if (con.customerId) {
      //       if (!existingCustomerIds.includes(con.customerId)) {
      //         customers = customers + 1
      //       }
      //       existingCustomerIds.push(con.customerId)
      //     }

      //     if (con.isNew === defaultCode.YES) {
      //       if (!customerIds.includes(con.customerId)) {
      //         newCustomers = newCustomers + 1
      //       }
      //       customerIds.push(con.customerId)
      //     }
      //   }
      //   contractValue = Number(rcAmount) + Number(nrcAmount) + Number(usageAmount)
      //   const totalAdj = (Number(debitAdjAMount) - Number(creditAdjAmount))
      //   revenue = contractValue + totalAdj
      // }
      // const response = {
      //   contractCount,
      //   contractValue,
      //   revenue,
      //   customers,
      //   newCustomers,
      //   rcAmount,
      //   nrcAmount,
      //   usageAmount
      // }
      // logger.debug('Fetch contract counts successfully')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched Billed contracts',
        data: response
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getReGenerateContracts (contractData, userId, conn) {
    const t = await conn.sequelize.transaction()
    try {
      logger.info('Getching re generated contracts ')
      const contracts = await conn.MonthlyContract.findAll({
        attributes: ['monthlyContractId'],
        include: [{ model: conn.MonthlyContractDtl, as: 'monthlyContractDtl', attributes: ['monthlyContractDtlId'] }],
        where: {
          status: 'REGENERATE'
        },
        transaction: t,
        raw: true
      })
      let count = 0
      if (contracts.length > 0) {
        count = contracts.length
        let mcount = 0
        for (const con of contracts) {
          if (Array.isArray(con.monthlyContractDtl) && con.monthlyContractDtl.length > 0) {
            for (const mcom of con.monthlyContractDtl) {
              if (mcom.monthlyContractDtlId) {
                mcount = mcount + 1
              }
            }
          }
        }
        count = contracts.length + mcount
      }
      await t.commit()
      logger.debug('Successfully fetched re generated contracts')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched contracts',
        data: count
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while fetching re generated contract'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async createContract (contractData, userId, conn) {
    const t = await conn.sequelize.transaction()
    try {
      logger.info('Creating new contract')
      const reqData = contractData.body
      let contractResponse
      if (!reqData || reqData.contractId) {
        contractResponse = await conn.Contract.findOne({ where: { contractId: reqData.contractId }, transaction: t })

        if (contractResponse.endDate < reqData.contractDtl[0].contractEndDate) {
          const obj = {
            endDate: reqData.contractDtl[0].contractEndDate
          }
          await conn.Contract.update(obj, { where: { contractId: reqData.contractId } }, { transaction: t })
        }
        if (!contractResponse) {
          logger.debug(defaultMessage.NOT_FOUND)
          return {
            status: statusCodeConstants.ERROR,
            message: defaultMessage.NOT_FOUND
          }
        }
      } else if (!reqData || !reqData.contractId) {
        if (!reqData.customerId || !reqData.accountId || !Array.isArray(reqData.contractDtl) ||
          reqData.contractDtl.length <= 0) {
          return {
            status: statusCodeConstants.ERROR,
            message: 'Please Add Contract Details'
          }
        }
        // const customer = await checkCustomerAccountHasAccess(reqData.customerId, reqData.accountId, reqData.customerUuid, t)
        // if (!customer) {
        //   logger.debug(defaultMessage.NOT_FOUND)
        //   return this.responseHelper.notFound(res, new Error('Please provide correct customer and account details'))
        // }
        // Creating contract data
        const contract = transformContract(reqData, userId)
        logger.info('Creating contract data')
        contractResponse = await conn.Contract.create(contract, { transaction: t })
        if (contractResponse) {
          contractResponse = contractResponse.dataValues
        }
      }
      if (contractResponse) {
        for (const contractDtl of reqData.contractDtl) {
          contractDtl.contractId = contractResponse.contractId
          // Getting random sequence number
          logger.info('Creating connection data')
          const connection = transformConnection(contractDtl, userId)
          const connectionResponse = await conn.CustServices.create(connection, { transaction: t })

          logger.info('Creating contractdetail data')
          contractDtl.connectionId = connectionResponse.dataValues.connectionId
          const conDtl = await transformContractDetail(contractDtl, userId, 'Create')

          // Updating contract RC/NRC/Usage values
          const data = {}
          data.contractId = contractDtl.contractId
          data.contractName = contractDtl.contractName
          logger.info(`Charge type is ${contractDtl.chargeType}`)
          if (contractDtl.chargeType === 'CC_RC') {
            data.rcAmount = Number(contractResponse.rcAmount) + Number(contractDtl.chargeAmount)
          }
          if (contractDtl.chargeType === 'CC_NRC') {
            data.otcAmount = Number(contractResponse.otcAmount) + Number(contractDtl.chargeAmount)
          }
          if (contractDtl.chargeType === 'CC_USGC') {
            data.usageAmount = Number(contractResponse.usageAmount) + Number(conDtl.chargeAmt)
          }
          logger.info('Updating contract detail data')

          await conn.ContractDtl.create(conDtl, { transaction: t })
          logger.info('Updating contract data')

          await conn.Contract.update(data, { where: { contractId: contractDtl.contractId }, transaction: t })
        }
      }

      await t.commit()
      logger.debug('Contract created successfully')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Contract created successfully',
        data: contractResponse
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: defaultMessage.ERROR
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateContract (contractData, userId, conn) {
    const t = await conn.sequelize.transaction()
    try {
      logger.info('Updating contract')
      let contract = contractData.body
      const { id } = contractData.params
      if (!contract || !id) {
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const contractInfo = await conn.Contract.findOne({ where: { contractId: id }, transaction: t })
      if (!contractInfo) {
        logger.debug(defaultMessage.NOT_FOUND)
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.NOT_FOUND
        }
      }
      contract = {
        ...contract,
        updatedBy: userId,
        customerId: contractInfo.customerId,
        accountId: contractInfo.accountId,
        connectionId: contractInfo.connectionId
      }
      await conn.Contract.update(contract, { where: { contractId: id }, transaction: t })
      await t.commit()
      logger.debug('Contract updated successfully')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Contract updated successfully'
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while updating contract'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateContractDetail (contractData, userId, conn) {
    const t = await conn.sequelize.transaction()
    try {
      logger.info('Updating contract detail')
      let contractDetail = contractData.body
      const { id } = contractData.params
      if (!contractDetail || !id) {
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const contractInfo = await conn.ContractDtl.findOne({ where: { contractDtlId: id }, transaction: t })
      if (!contractInfo) {
        logger.debug(defaultMessage.NOT_FOUND)
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.NOT_FOUND
        }
      }
      const contract = await conn.Contract.findOne({ where: { contractId: contractInfo.contractId }, transaction: t })
      if (moment(contractDetail.actualEndDate).isAfter(contract.endDate)) {
        const body = {
          endDate: contractDetail.actualEndDate
        }
        await conn.Contract.update(body, { where: { contractId: contractInfo.contractId }, transaction: t })
      }
      contractDetail = {
        ...contractDetail,
        contractId: contractInfo.contractId,
        updatedBy: userId,
        chargeId: contractInfo.chargeId
      }
      const oldContractDate = format(new Date(contractInfo.actualEndDate), 'yyyy-MM-dd')
      const newContractDate = format(new Date(contractDetail.actualEndDate), 'yyyy-MM-dd')
      if (oldContractDate !== newContractDate) {
        if (newContractDate < oldContractDate) {
          if (contractInfo.frequency === 'FREQ_QUARTER' || contractInfo.frequency === 'FREQ_HALF_YEAR' || contractInfo.frequency === 'FREQ_YEAR') {
            const nextBillPeriod = new Date().setMonth(new Date(newContractDate).getMonth() + 1)
            contractDetail.nextBillPeriod = format(startOfMonth(nextBillPeriod), 'yyyy-MM-dd')
          }
        }

        let diffmonths
        const d1 = new Date(newContractDate)
        const d2 = new Date(contractInfo.actualStartDate)
        diffmonths = (d1.getFullYear() - d2.getFullYear()) * 12
        diffmonths -= d1.getMonth()
        diffmonths += d2.getMonth()
        diffmonths = diffmonths <= 0 ? 1 : diffmonths

        contractDetail.durationMonth = Number(diffmonths)
      }
      logger.info('Getting usage details')
      if (contractDetail.chargeType === 'CC_USGC') {
        const planUsage = await calculateUsageFn(contractDetail, contractDetail.customerUuid)
        contractDetail.balanceAmount = planUsage.chargeAmount
        contractDetail.chargeAmt = planUsage.chargeAmount
        contractDetail.quantity = planUsage.quantity
        const addConsumption = {
          addConsumption1: contractDetail.addConsumption1,
          addConsumption2: contractDetail.addConsumption2,
          addConsumption3: contractDetail.addConsumption3
        }
        contractDetail.mappingPayload = {
          addConsumption
        }
      }

      await conn.ContractDtl.update(contractDetail, { where: { contractDtlId: id }, transaction: t })
      await t.commit()
      logger.debug('Contract detail updated successfully')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Contract updated successfully'
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while updating contract'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateMonthlyContract (contractData, userId, conn, t) {
    try {
      let monthlyContract = contractData
      const { id } = contractData
      if (!monthlyContract || !id) {
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const contractInfo = await conn.MonthlyContract.findOne({ where: { monthlyContractId: id }, transaction: t })
      if (!contractInfo) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: defaultMessage.NOT_FOUND
        }
      }
      monthlyContract = {
        ...monthlyContract,
        updatedBy: userId,
        status: contractInfo.status === 'PENDING' ? 'REGENERATE' : 'UNBILLED',
        contractId: contractInfo.contractId,
        customerId: contractInfo.customerId,
        accountId: contractInfo.accountId,
        connectionId: contractInfo.connectionId
      }
      await conn.MonthlyContract.update(monthlyContract, { where: { monthlyContractId: id }, transaction: t })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Contract updated successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while updating contract'
      }
    }
  }

  async updateMonthlyContractDetail (contractData, userId, conn, t) {
    try {
      let monthlyContractDtl = contractData
      const { id } = contractData
      let diffmonths
      if (!monthlyContractDtl || !id) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const contractInfo = await conn.MonthlyContractDtl.findOne({ where: { monthlyContractDtlId: id }, transaction: t })
      if (!contractInfo) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: defaultMessage.NOT_FOUND
        }
      }
      monthlyContractDtl = {
        ...monthlyContractDtl,
        status: contractInfo.status === 'PENDING' ? 'REGENERATE' : 'UNBILLED',
        contractDtlId: contractInfo.contractDtlId,
        updatedBy: userId,
        chargeId: contractInfo.chargeId
      }
      if (monthlyContractDtl.actualEndDate) {
        const oldContractDate = format(new Date(contractInfo.actualEndDate), 'yyyy-MM-dd')
        const newContractDate = format(new Date(monthlyContractDtl.actualEndDate), 'yyyy-MM-dd')
        if (oldContractDate !== newContractDate) {
          if (newContractDate < oldContractDate) {
            if (contractInfo.frequency === 'FREQ_QUARTER' || contractInfo.frequency === 'FREQ_HALF_YEAR' || contractInfo.frequency === 'FREQ_YEAR') {
              const nextBillPeriod = new Date().setMonth(new Date(newContractDate).getMonth() + 1)
              monthlyContractDtl.nextBillPeriod = format(startOfMonth(nextBillPeriod), 'yyyy-MM-dd')
            }
          }
          const d1 = new Date(newContractDate)
          const d2 = new Date(contractInfo.actualStartDate)
          diffmonths = (d1.getFullYear() - d2.getFullYear()) * 12
          diffmonths -= d1.getMonth()
          diffmonths += d2.getMonth()
          diffmonths = diffmonths <= 0 ? 1 : diffmonths
          monthlyContractDtl.durationMonth = Number(diffmonths)
        }
      }

      logger.info('Getting usage details')
      if (monthlyContractDtl.chargeType === 'CC_USGC') {
        const planUsage = await calculateUsageFn(monthlyContractDtl, monthlyContractDtl.customerUuid)
        monthlyContractDtl.balanceAmount = planUsage.chargeAmount
        monthlyContractDtl.chargeAmt = planUsage.chargeAmount
        monthlyContractDtl.quantity = planUsage.quantity
        const addConsumption = {
          addConsumption1: monthlyContractDtl.addConsumption1,
          addConsumption2: monthlyContractDtl.addConsumption2,
          addConsumption3: monthlyContractDtl.addConsumption3
        }
        monthlyContractDtl.mappingPayload = {
          addConsumption
        }
        const charge = await conn.MonthlyContract.findOne({ where: { monthlyContractId: contractInfo.monthlyContractId }, transaction: t })

        const contractData = {}
        contractData.usageAmount = charge.usageAmount + planUsage.chargeAmount

        await conn.MonthlyContract.update(contractData, { where: { monthlyContractId: contractInfo.monthlyContractId }, transaction: t })
      }

      await conn.MonthlyContractDtl.update(monthlyContractDtl, { where: { monthlyContractDtlId: id }, transaction: t })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Contract updated successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while updating contract'
      }
    }
  }

  async updateUnbilledContracts (contractData, userId, conn) {
    const t = await conn.sequelize.transaction()
    try {
      logger.info('Updating Unbilled Contract')
      const contract = contractData.body
      const { id } = contractData.params
      if (!contract || !id) {
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let update
      if (contract.status === 'HOLD') {
        update = { status: contract.status, onholdDate: new Date(), isOnhold: 'Y' }
      } else {
        update = { status: contract.status, isOnhold: 'N', onunholdCount: 1 }
      }
      update.updatedBy = userId
      await conn.MonthlyContract.update(update, { where: { monthlyContractId: id }, transaction: t })
      await conn.MonthlyContractDtl.update({ status: contract.status, updatedBy: userId }, { where: { monthlyContractId: id }, transaction: t })

      await t.commit()
      logger.debug(`Unbilled Contract updated to ${contract.status} successfully`)
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Contract put on ${contract.status}`
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while updating contract'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateUnbilledSplitContracts (contractData, userId, conn) {
    const t = await conn.sequelize.transaction()
    try {
      logger.info('Updating Unbilled Contract')
      const contract = contractData.body
      const { id } = contractData.params
      if (!contract || !id) {
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      await conn.MonthlyContract.update({ isSplit: contract.isSplit, updatedBy: userId }, { where: { monthlyContractId: id }, transaction: t })
      await conn.MonthlyContractDtl.update({ isSplit: contract.isSplit, updatedBy: userId }, { where: { monthlyContractId: id }, transaction: t })

      await t.commit()
      logger.debug('Unbilled Contract updated successfully')
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Contract put on ${contract.isSplit}`
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while updating contract'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async calculateUsage (contractData, userId, conn) {
    try {
      const response = await calculateUsageFn(contractData.body.contractDtl, contractData.body.contractDtl.customerUuid)
      logger.debug('Contract usage calculation done successfully')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Usage Calculated',
        data: response
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while calculating contract'
      }
    }
  }

  async generateMonthlyUnBilledContract (contractData, userId, conn) {
    try {
      if (!contractData || !contractData.currentMonth) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      await generateMonthlyUnBilledContracts(contractData.currentMonth, conn)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Monthly Unbilled Contract Successful'
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while getting contract'
      }
    }
  }

  async generateScheduledMonthlyContracts (conn) {
    try {
      await generateScheduledMonthlyContracts(conn)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Monthly Unbilled Contract Successful'
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while getting contract'
      }
    }
  }

  async getCustomerContractsByService (payload, conn) {
    try {
      if (!payload || !payload?.serviceUuid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const whereClause = {
        serviceUuid: payload.serviceUuid,
        status: defaultStatus.CONTRACT_OPEN
      }

      const response = await conn.Contract.findAndCountAll({
        where: whereClause
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Contract details fetched successfully',
        data: response
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while getting contract'
      }
    }
  }

  async getCustomerScheduledMonthlyContracts (payload, conn) {
    try {
      if (!payload || !payload?.customerUuid || !payload?.productId || !payload?.orderUuid) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const response = await conn.Contract.findAndCountAll({
        include: [
          {
            model: conn.MonthlyContract,
            as: 'monthlyContractDetails',
            include: [
              {
                model: conn.BusinessEntity,
                attributes: ['code', 'description'],
                as: 'statusDesc'
              }, 
              {
                model: conn.Invoice,
                as: 'invoiceDetails',
                include: [
                  {
                    model: conn.PaymentInvoiceTxn,
                    as: 'paymentDetail'
                  }
                ]
              },
              {
                model: conn.MonthlyContractDtl,
                as: 'monthlyContractDtl',
                where: {
                  productId: payload?.productId,
                  orderUuid: payload?.orderUuid
                }
              }
            ],
          }
        ],
        where: {
          customerUuid: payload?.customerUuid
        },
        order: [
          [conn.sequelize.literal('"monthlyContractDetails"."monthly_contract_id" ASC')]
        ],
      })

      const rows = contractResources.transformScheduledMonthlyContracts(response.rows)
      const data = {
        count: rows?.length || 0,
        rows: rows || []
      }

      // const response = await conn.MonthlyContract.findAndCountAll({
      //   include: [
      //     {
      //       model: conn.BusinessEntity,
      //       attributes: ['code', 'description'],
      //       as: 'statusDesc'
      //     }, {
      //       model: conn.Invoice,
      //       as: 'invoiceDetails',
      //       include: [
      //         {
      //           model: conn.PaymentInvoiceTxn,
      //           as: 'paymentDetail'
      //         }
      //       ]
      //     }
      //   ],
      //   where: {
      //     customerUuid: payload?.customerUuid
      //     // status: defaultStatus?.SCHEDULED
      //   }
      // })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Monthly Contract fetched successfully',
        data
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while getting contract'
      }
    }
  }

  async contractJob (payload) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: 'Please provide state'
        }
      }

      const { state } = payload
      if (state === 'start') {
        generateMonthlyUnBilledContractJob.start()
        generateScheduledMonthlyContractsJob.start()
      } else if (state === 'stop') {
        generateMonthlyUnBilledContractJob.stop()
        generateScheduledMonthlyContractsJob.stop()
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Contract Job ${state === 'start' ? 'started' : 'stopped'}`
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while getting contract'
      }
    }
  }

  async searchContracts (payload, conn) {
    try {
      const searchParams = payload
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE } = payload
      const offSet = (page * limit)
      if (!searchParams) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let whereClause = {}
      if (searchParams.startDate || searchParams.endDate) {
        if (searchParams.startDate !== '' && searchParams.endDate !== '') {
          whereClause = {
            [Op.and]: [
              {
                // actualStartDate: {
                //   [Op.gte]: searchParams.startDate
                // },
                // actualEndDate: {
                //   [Op.lte]: searchParams.endDate
                // }
                actualStartDate: conn.sequelize.literal(`DATE("Contract"."actual_start_date") >= DATE('${searchParams?.startDate}')`),
                actualEndDate: conn.sequelize.literal(`DATE("Contract"."actual_end_date") <= DATE('${searchParams?.endDate}')`)
              }
            ]
          }
        } else if (searchParams.startDate !== '') {
          whereClause = {
            [Op.and]: [
              // {
              //   actualStartDate: {
              //     [Op.gte]: searchParams.startDate
              //   }
              // }
              [conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('Contract.actual_start_date')), '>=', searchParams.startDate)]
            ]
          }
        } else if (searchParams.endDate !== '') {
          whereClause = {
            [Op.and]: [
              // {
              //   actualEndDate: {
              //     [Op.lte]: searchParams.endDate
              //   }
              // }
              [conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('Contract.actual_end_date')), '<=', searchParams.endDate)]
            ]
          }
        }
      }
      if (searchParams.contractId && searchParams.contractId !== '' && searchParams.contractId !== undefined) {
        whereClause.contractId = {
          [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Contract.contract_id'), 'varchar'), {
            [Op.like]: `%${searchParams.contractId.toString()}%`
          })]
        }
      }
      if (searchParams.billRefNo && searchParams.billRefNo !== '' && searchParams.billRefNo !== undefined) {
        whereClause.billRefNo = {
          [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Contract.bill_ref_no'), 'varchar'), {
            [Op.eq]: `${searchParams.billRefNo.toString()}`
          })]
        }
      }

      let customerWhere = {}
      let isCustomerIncluded = false
      if (searchParams.customerName && searchParams.customerName !== '' && searchParams.customerName !== undefined) {
        isCustomerIncluded = true
        customerWhere = {
          [Op.and]: conn.sequelize.where(conn.sequelize.fn('concat', conn.sequelize.fn('UPPER', conn.sequelize.col('Customer.first_name')), ' ',
            conn.sequelize.fn('UPPER', conn.sequelize.col('Customer.last_name'))), {
            [Op.like]: `%${searchParams.customerName.toUpperCase()}%`
          })
        }
      }
      if (searchParams.customerNumber && searchParams.customerNumber !== '' && searchParams.customerNumber !== undefined) {
        isCustomerIncluded = true
        customerWhere.customerNo = { [Op.like]: `%${searchParams.customerNumber.toString()}%` }
      }

      if (searchParams?.customerUuid && searchParams?.customerUuid) {
        whereClause.customerUuid = searchParams?.customerUuid
      }

      let customerSearchIds
      if (isCustomerIncluded) {
        const customer = await conn.Customer.findAll({
          attributes: ['customerId'],
          where: customerWhere
        })
        customerSearchIds = map(customer, 'customerId')
      }
      if (isCustomerIncluded && isEmpty(customerSearchIds)) {
        const data = {
          count: 0,
          rows: []
        }
        return {
          status: statusCodeConstants?.SUCCESS,
          message: 'No contracts found',
          data
        }
      } else if (isCustomerIncluded && customerSearchIds) {
        whereClause.customerId = customerSearchIds
      }
      if (whereClause.status) {
        whereClause.status = {
          [Op.and]: [{ [Op.ne]: 'CREATED' }, whereClause.status]
        }
      } else {
        whereClause.status = { [Op.ne]: 'CREATED' }
      }
      const contractDtlWhere = {
        status: { [Op.ne]: 'CREATED' }
      }

      const contracts = await conn.Contract.findAndCountAll({
        include: [
          {
            model: conn.CustAccounts,
            as: 'account',
            attributes: ['accountId', 'customerId', 'accountNo'],
            include: [
              { model: conn.BusinessEntity, as: 'currencyDesc', attributes: ['description'] }
            ]

          },
          {
            model: conn.ContractDtl,
            as: 'contractDetail',
            where: contractDtlWhere,
            include: [
              {
                model: conn.Charge,
                as: 'charge',
                include: [{ model: conn.BusinessEntity, as: 'chargeCatDesc', attributes: ['description'] }]
              },
              {
                model: conn.Product,
                as: 'prodDetails',
                attributes: ['productName']
                // include: [{ model: conn.PlanUsage, as: 'planUsage', attributes: ['minCommitment', 'isTierType'] }]
              },
              { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
              // { model: BusinessEntity, as: 'chargeTypeDesc', attributes: ['description'] },
              // { model: BusinessEntity, as: 'frequencyDesc', attributes: ['description'] },
              { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] },
              { model: conn.User, as: 'updatedByName', attributes: ['firstName', 'lastName'] }
              // { model: BusinessEntity, as: 'contractTypeDesc', attributes: ['description'] },
              // { model: BusinessEntity, as: 'upfrontPaymentDesc', attributes: ['description'] },
              // { model: CustomerContract, as: 'customerContractDetails', attributes: ['contractRefNo'] }
            ]
          },
          { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
          { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] },
          { model: conn.User, as: 'updatedByName', attributes: ['firstName', 'lastName'] }
          // { model: SaleOrders, as: 'soDetails', attributes: ['soNumber'] }
        ],
        distinct: true,
        where: whereClause,
        order: [['contractId', 'DESC'], ['createdAt', 'DESC']],
        offset: offSet,
        limit: Number(limit)
      })

      const businessEntity = await conn.BusinessEntity.findAll({
        where: {
          codeType: ['YES_NO', 'CHARGE_CATEGORY', 'CHARGE_FREQUENCY', 'CATALOG_TYPE', 'CONNECTION_STATUS', 'STATUS', 'CONTRACT_STATUS']
        }
      })

      contracts && contracts?.rows && contracts?.rows.map((cont) => {
        let contStatusDesc
        for (const be of businessEntity) {
          if (cont.status === be.code) {
            contStatusDesc = {
              description: be.description
            }
          }
        }
        cont.dataValues.statusDesc = contStatusDesc
        cont?.contractDetail && cont?.contractDetail.map((contDtl) => {
          let statusDesc
          let chargeTypeDesc
          let frequencyDesc
          let contractTypeDesc
          let upfrontPaymentDesc
          for (const bs of businessEntity) {
            if (contDtl.status === bs.code) {
              statusDesc = {
                description: bs.description
              }
            }
            if (contDtl.chargeType === bs.code) {
              chargeTypeDesc = {
                description: bs.description
              }
            } if (contDtl.frequency === bs.code) {
              frequencyDesc = {
                description: bs.description
              }
            }
            if (contDtl.contractType === bs.code) {
              contractTypeDesc = {
                description: bs.description
              }
            }
            if (contDtl.upfrontPayment === bs.code) {
              upfrontPaymentDesc = {
                description: bs.description
              }
            }
          }
          contDtl.dataValues.statusDesc = statusDesc
          contDtl.dataValues.chargeTypeDesc = chargeTypeDesc
          contDtl.dataValues.frequencyDesc = frequencyDesc
          contDtl.dataValues.contractTypeDesc = contractTypeDesc
          contDtl.dataValues.upfrontPaymentDesc = upfrontPaymentDesc
          return contDtl
        })
        return cont
      })

      if (!contracts) {
        const data = {
          count: 0,
          rows: []
        }
        return {
          status: statusCodeConstants?.SUCCESS,
          message: 'No contracts found',
          data
        }
      }
      let customerIds = map(contracts.rows, 'customerId')
      customerIds = Array.from(new Set(customerIds))
      const customers = await conn.Customer.findAll({
        attributes: ['customerId', 'customerNo', 'firstName', 'lastName'],
        where: { customerId: customerIds }
      })
      if (isEmpty(customers)) {
        const data = {
          count: 0,
          rows: []
        }
        return {
          status: statusCodeConstants?.SUCCESS,
          message: 'No contracts found',
          data
        }
      }
      const response = []
      contracts.rows.map((con) => {
        customers && customers.map((cus) => {
          if (Number(cus.customerId) === Number(con.customerId)) {
            con.dataValues.customer = cus
            response.push(con)
            return con
          }
        })
      })
      contracts.rows = response
      return {
        status: statusCodeConstants?.SUCCESS,
        message: 'Successfully fetched contracts',
        data: contracts
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while getting contract'
      }
    }
  }
}

const generateMonthlyUnBilledContractJob = cron.schedule('*/3 * * * *', () => {
  logger.debug('Starting contract Job')
  generateMonthlyUnBilledContracts()
},
{
  scheduled: false
})

const generateScheduledMonthlyContractsJob = cron.schedule('*/5 * * * *', () => {
  logger.debug('Starting contract Job')
  generateScheduledMonthlyContracts()
},
{
  scheduled: false
})

export const applyPayment = async (allocationLevel, selectedInvs, invChrgDtls, customerUuid, paymentId, invoiceDtls, paymentAmount, userId, conn, t) => {
  const invoiceIds = []
  let runningPaymentAmt = paymentAmount
  const osReductionAmt = []
  const invDtlUpdates = []
  let breakOut = false

  for (const r of invoiceDtls) {
    r.applied = 'N'
  }

  if (allocationLevel === 'INV') {
    if (!breakOut) {
      for (const i of selectedInvs) {
        let osDelta = null
        for (const d of invoiceDtls) {
          if (d.applied === 'Y') {
            continue
          }
          if (d.invoiceId === i && d.chargeType === 'CC_RC') {
            if (
              Number(d.invOsAmt) <= runningPaymentAmt ||
              Math.abs(runningPaymentAmt - Number(d.invOsAmt)) < 0.01
            ) {
              invDtlUpdates.push({
                invoiceDtlId: d.invoiceDtlId,
                invOsAmt: 0.0,
                paymentId,
                paidAmount: Number(d.invOsAmt),
                invoiceId: i
              })
              runningPaymentAmt = runningPaymentAmt - Number(d.invOsAmt)
              osDelta =
                osDelta === null
                  ? Number(d.invOsAmt)
                  : osDelta + Number(d.invOsAmt)
              // console.log('A', d.invoiceDtlId, runningPaymentAmt, osDelta)
            } else {
              invDtlUpdates.push({
                invoiceDtlId: d.invoiceDtlId,
                invOsAmt: Number(d.invOsAmt) - runningPaymentAmt,
                paymentId,
                paidAmount: runningPaymentAmt,
                invoiceId: i
              })
              osDelta =
                osDelta === null
                  ? runningPaymentAmt
                  : osDelta + runningPaymentAmt
              // console.log('B', d.invoiceDtlId, runningPaymentAmt, osDelta)
              runningPaymentAmt = 0.0
            }
          }
          if (runningPaymentAmt < 0.01) {
            breakOut = true
            break
          }
        }

        // console.log('CC_RC-breakOut', breakOut)

        if (!breakOut) {
          for (const d of invoiceDtls) {
            if (d.applied === 'Y') {
              continue
            }

            if (d.invoiceId === i && d.chargeType === 'CC_NRC') {
              if (
                Number(d.invOsAmt) <= runningPaymentAmt ||
                Math.abs(runningPaymentAmt - Number(d.invOsAmt)) < 0.01
              ) {
                invDtlUpdates.push({
                  invoiceDtlId: d.invoiceDtlId,
                  invOsAmt: 0.0,
                  paymentId,
                  paidAmount: Number(d.invOsAmt),
                  invoiceId: i
                })
                runningPaymentAmt = runningPaymentAmt - Number(d.invOsAmt)
                osDelta =
                  osDelta === null
                    ? Number(d.invOsAmt)
                    : osDelta + Number(d.invOsAmt)
                // console.log('C', d.invoiceDtlId, runningPaymentAmt, osDelta)
              } else {
                invDtlUpdates.push({
                  invoiceDtlId: d.invoiceDtlId,
                  invOsAmt: Number(d.invOsAmt) - runningPaymentAmt,
                  paymentId,
                  paidAmount: runningPaymentAmt,
                  invoiceId: i
                })
                osDelta =
                  osDelta === null
                    ? runningPaymentAmt
                    : osDelta + runningPaymentAmt
                // console.log('D', d.invoiceDtlId, runningPaymentAmt,osDelta)
                runningPaymentAmt = 0.0
              }
            }
          }
        }

        // console.log('CC_NRC-breakOut', breakOut)

        if (!breakOut) {
          for (const d of invoiceDtls) {
            if (d.applied === 'Y') {
              continue
            }

            if (
              d.invoiceId === i &&
              ((d.charge && d.charge?.chargeCat === 'CC_USGC') ||
                d.chargeType === 'CC_USGC')
            ) {
              if (
                Number(d.invOsAmt) <= runningPaymentAmt ||
                Math.abs(runningPaymentAmt - Number(d.invOsAmt)) < 0.01
              ) {
                invDtlUpdates.push({
                  invoiceDtlId: d.invoiceDtlId,
                  invOsAmt: 0.0,
                  paymentId,
                  paidAmount: Number(d.invOsAmt),
                  invoiceId: i
                })
                runningPaymentAmt = runningPaymentAmt - Number(d.invOsAmt)
                osDelta =
                  osDelta === null
                    ? Number(d.invOsAmt)
                    : osDelta + Number(d.invOsAmt)
                // console.log('E', d.invoiceDtlId, runningPaymentAmt, osDelta)
              } else {
                invDtlUpdates.push({
                  invoiceDtlId: d.invoiceDtlId,
                  invOsAmt: Number(d.invOsAmt) - runningPaymentAmt,
                  paymentId,
                  paidAmount: runningPaymentAmt,
                  invoiceId: i
                })
                osDelta =
                  osDelta === null
                    ? runningPaymentAmt
                    : osDelta + runningPaymentAmt
                // console.log('F', d.invoiceDtlId, runningPaymentAmt, osDelta)
                runningPaymentAmt = 0.0
              }
            }
          }
        }

        if (osReductionAmt && osReductionAmt.length > 0) {
          let found = false
          for (const x of osReductionAmt) {
            if (x.invoiceId === i) {
              x.osDelta = x.osDelta + osDelta
              found = true
            }
          }
          if (!found) {
            osReductionAmt.push({
              invoiceId: i,
              osDelta
            })
          }
        } else {
          osReductionAmt.push({
            invoiceId: i,
            osDelta
          })
        }
        if (breakOut) {
          break
        }
      }
    }
  }

  // console.log('osReductionAmt after INV', osReductionAmt)

  if (allocationLevel === 'INVCHARGE') {
    for (const d of invoiceDtls) {
      for (const sd of invChrgDtls) {
        if (d.invoiceDtlId === sd && d.applied === 'N') {
          if (
            Number(d.invOsAmt) <= runningPaymentAmt ||
            Math.abs(runningPaymentAmt - Number(d.invOsAmt)) < 0.01
          ) {
            invDtlUpdates.push({
              invoiceDtlId: d.invoiceDtlId,
              invOsAmt: 0.0,
              paymentId,
              paidAmount: Number(d.invOsAmt)
            })

            if (osReductionAmt && osReductionAmt.length > 0) {
              let found = false
              for (const x of osReductionAmt) {
                if (x.invoiceId === d.invoiceId) {
                  x.osDelta = x.osDelta + Number(d.invOsAmt)
                  found = true
                }
              }
              if (!found) {
                osReductionAmt.push({
                  invoiceId: d.invoiceId,
                  osDelta: Number(d.invOsAmt)
                })
              }
            } else {
              osReductionAmt.push({
                invoiceId: d.invoiceId,
                osDelta: Number(d.invOsAmt)
              })
            }

            runningPaymentAmt = runningPaymentAmt - Number(d.invOsAmt)

            //  console.log(d.invoiceDtlId, osDelta)
          } else {
            // console.log('OS Greater', Number(d.invOsAmt), runningPaymentAmt)

            invDtlUpdates.push({
              invoiceDtlId: d.invoiceDtlId,
              invOsAmt: Number(d.invOsAmt) - runningPaymentAmt,
              paymentId,
              paidAmount: runningPaymentAmt
            })

            if (osReductionAmt && osReductionAmt.length > 0) {
              let found = false
              for (const x of osReductionAmt) {
                if (x.invoiceId === d.invoiceId) {
                  x.osDelta = x.osDelta + runningPaymentAmt
                  found = true
                }
              }
              if (!found) {
                osReductionAmt.push({
                  invoiceId: d.invoiceId,
                  osDelta: runningPaymentAmt
                })
              }
            } else {
              osReductionAmt.push({
                invoiceId: d.invoiceId,
                osDelta: runningPaymentAmt
              })
            }

            runningPaymentAmt = 0.0

            // console.log(d.invoiceDtlId, osDelta)
          }
          d.applied = 'Y'
        }
        if (runningPaymentAmt < 0.01) {
          breakOut = true
          break
        }
      }
      if (breakOut) {
        break
      }
    }
  }

  // console.log('osReductionAmt after INVCHARGE', osReductionAmt)

  // console.log('INVCHARGE-breakOut', breakOut, runningPaymentAmt)

  for (const d of invoiceDtls) {
    if (!invoiceIds.includes(d.invoiceId)) {
      invoiceIds.push(d.invoiceId)
    }
  }

  if (!breakOut) {
    for (const i of invoiceIds) {
      if (allocationLevel === 'INV') {
        if (selectedInvs.includes(i)) {
          continue
        }
      }

      let osDelta = null
      for (const d of invoiceDtls) {
        if (d.applied === 'Y') {
          continue
        }
        if (d.invoiceId === i && d.chargeType === 'CC_RC') {
          if (
            Number(d.invOsAmt) <= runningPaymentAmt ||
            Math.abs(runningPaymentAmt - Number(d.invOsAmt)) < 0.01
          ) {
            invDtlUpdates.push({
              invoiceDtlId: d.invoiceDtlId,
              invOsAmt: 0.0,
              paymentId,
              paidAmount: Number(d.invOsAmt),
              invoiceId: i
            })
            runningPaymentAmt = runningPaymentAmt - Number(d.invOsAmt)
            osDelta =
              osDelta === null
                ? Number(d.invOsAmt)
                : osDelta + Number(d.invOsAmt)
            // console.log('A', d.invoiceDtlId, runningPaymentAmt, osDelta)
          } else {
            invDtlUpdates.push({
              invoiceDtlId: d.invoiceDtlId,
              invOsAmt: Number(d.invOsAmt) - runningPaymentAmt,
              paymentId,
              paidAmount: runningPaymentAmt,
              invoiceId: i
            })
            osDelta =
              osDelta === null
                ? runningPaymentAmt
                : osDelta + runningPaymentAmt
            // console.log('B', d.invoiceDtlId, runningPaymentAmt, osDelta)
            runningPaymentAmt = 0.0
          }
        }
        if (runningPaymentAmt < 0.01) {
          breakOut = true
          break
        }
      }

      // console.log('CC_RC-breakOut', breakOut)

      if (!breakOut) {
        for (const d of invoiceDtls) {
          if (d.applied === 'Y') {
            continue
          }

          if (d.invoiceId === i && d.chargeType === 'CC_NRC') {
            if (
              Number(d.invOsAmt) <= runningPaymentAmt ||
              Math.abs(runningPaymentAmt - Number(d.invOsAmt)) < 0.01
            ) {
              invDtlUpdates.push({
                invoiceDtlId: d.invoiceDtlId,
                invOsAmt: 0.0,
                paymentId,
                paidAmount: Number(d.invOsAmt),
                invoiceId: i
              })
              runningPaymentAmt = runningPaymentAmt - Number(d.invOsAmt)
              osDelta =
                osDelta === null
                  ? Number(d.invOsAmt)
                  : osDelta + Number(d.invOsAmt)
              // console.log('C', d.invoiceDtlId, runningPaymentAmt, osDelta)
            } else {
              invDtlUpdates.push({
                invoiceDtlId: d.invoiceDtlId,
                invOsAmt: Number(d.invOsAmt) - runningPaymentAmt,
                paymentId,
                paidAmount: runningPaymentAmt,
                invoiceId: i
              })
              osDelta =
                osDelta === null
                  ? runningPaymentAmt
                  : osDelta + runningPaymentAmt
              // console.log('D', d.invoiceDtlId, runningPaymentAmt,osDelta)
              runningPaymentAmt = 0.0
            }
          }
        }
      }

      // console.log('CC_NRC-breakOut', breakOut)

      if (!breakOut) {
        for (const d of invoiceDtls) {
          if (d.applied === 'Y') {
            continue
          }

          if (
            d.invoiceId === i &&
            ((d.charge && d.charge?.chargeCat === 'CC_USGC') ||
              d.chargeType === 'CC_USGC')
          ) {
            if (
              Number(d.invOsAmt) <= runningPaymentAmt ||
              Math.abs(runningPaymentAmt - Number(d.invOsAmt)) < 0.01
            ) {
              invDtlUpdates.push({
                invoiceDtlId: d.invoiceDtlId,
                invOsAmt: 0.0,
                paymentId,
                paidAmount: Number(d.invOsAmt),
                invoiceId: i
              })
              runningPaymentAmt = runningPaymentAmt - Number(d.invOsAmt)
              osDelta =
                osDelta === null
                  ? Number(d.invOsAmt)
                  : osDelta + Number(d.invOsAmt)
              // console.log('E', d.invoiceDtlId, runningPaymentAmt, osDelta)
            } else {
              invDtlUpdates.push({
                invoiceDtlId: d.invoiceDtlId,
                invOsAmt: Number(d.invOsAmt) - runningPaymentAmt,
                paymentId,
                paidAmount: runningPaymentAmt,
                invoiceId: i
              })
              osDelta =
                osDelta === null
                  ? runningPaymentAmt
                  : osDelta + runningPaymentAmt
              // console.log('F', d.invoiceDtlId, runningPaymentAmt, osDelta)
              runningPaymentAmt = 0.0
            }
          }
        }
      }

      if (osReductionAmt && osReductionAmt.length > 0) {
        let found = false
        for (const x of osReductionAmt) {
          if (x.invoiceId === i) {
            x.osDelta = x.osDelta + osDelta
            found = true
          }
        }
        if (!found) {
          osReductionAmt.push({
            invoiceId: i,
            osDelta
          })
        }
      } else {
        osReductionAmt.push({
          invoiceId: i,
          osDelta
        })
      }
      if (breakOut) {
        break
      }
    }
  }
  // console.log('invDtlUpdates', invDtlUpdates)
  // console.log('runningPaymentAmt', runningPaymentAmt)
  // console.log('osReductionAmt', osReductionAmt)

  for (const r of invDtlUpdates) {
    let data
    if (r.invOsAmt < 0.01) {
      await conn.InvoiceDtl.update(
        {
          invOsAmt: r.invOsAmt,
          paymentId: r.paymentId,
          paidAmount: r.paidAmount,
          invoiceStatus: 'INV-CLOSED'
        },
        {
          where: {
            invoiceDtlId: r.invoiceDtlId
          },
          transaction: t
        }
      )
      data = {
        invoiceId: r.invoiceId,
        invoiceDtlId: r.invoiceDtlId,
        paymentId: r.paymentId,
        paymentAmount: r.paidAmount,
        invOsAmt: r.invOsAmt,
        customerUuid,
        status: 'CLOSED'
      }
    } else {
      await conn.InvoiceDtl.update(
        {
          invOsAmt: r.invOsAmt,
          paymentId: r.paymentId,
          paidAmount: r.paidAmount
        },
        {
          where: {
            invoiceDtlId: r.invoiceDtlId
          },
          transaction: t
        }
      )
      data = {
        invoiceId: r.invoiceId,
        invoiceDtlId: r.invoiceDtlId,
        paymentId: r.paymentId,
        paymentAmount: r.paidAmount,
        invOsAmt: r.invOsAmt,
        customerUuid,
        status: 'OPEN'
      }
    }

    await conn.PaymentInvoiceTxn.create(
      data, { transaction: t }
    )
  }

  for (const r of osReductionAmt) {
    const invoice = await conn.Invoice.findOne({
      where: {
        invoiceId: r.invoiceId
      }
    })

    if (Math.abs(Number(invoice.invOsAmt) - r.osDelta) > 0.01) {
      // console.log('Updating invoice id', r.invoiceId)
      await conn.Invoice.update(
        {
          invOsAmt: Number(invoice.invOsAmt) - r.osDelta
        },
        {
          where: {
            invoiceId: r.invoiceId
          },
          transaction: t
        }
      )
    } else {
      await conn.Invoice.update(
        {
          invOsAmt: 0.0,
          invoiceStatus: 'INV-CLOSED'
        },
        {
          where: {
            invoiceId: r.invoiceId
          },
          transaction: t
        }
      )
    }
  }

  if (runningPaymentAmt >= 0.01) {
    await conn.AdvancePayment.create(
      {
        paymentId,
        advanceAmount: runningPaymentAmt,
        advanceBalanceAmount: runningPaymentAmt,
        customerUuid,
        status: 'OPEN',
        createdBy: userId,
        updatedBy: userId
      },
      {
        transaction: t
      }
    )
  }
}

export const calculateInvoice = async (chargeAmt, balanceAmt, contract, contStartDate, contractEndDate, noOfQuarter) => {
  let invoiceAmt; let balanceAmount; const ret = {}
  const actualEndDate = contractEndDate || contract.actualEndDate
  const diffBetDays = noOfDaysBetween2Dates(new Date(contStartDate), new Date(actualEndDate))

  let noOfQuarters = 0
  // console.log('Duration Months: ', contract.durationMonth)
  if (contract.durationMonth) {
    let duration = Number(contract.durationMonth) / 3
    if (duration) {
      const pression = duration.toString().split('.')[1]
      if (pression) {
        if (pression.charAt(0) > 0) {
          duration = Math.floor(duration)
          noOfQuarters = Number(duration) + 1
        }
      } else {
        noOfQuarters = duration
      }
    }
  }

  if (contract?.frequency === 'FREQ_MONTH' || contract?.frequency === 'FREQ_HALF_YEAR' || contract?.frequency === 'FREQ_YEAR') {
    noOfQuarters = noOfQuarter
  }

  if (balanceAmt !== 0 && balanceAmt) {
    // Need to check this for prorated yes
    // console.log('no Of quarters',noOfQuarters)
    const charge = Number(chargeAmt) / noOfQuarters// Number(contract.durationMonth)
    if (contract.prorated === 'Y') {
      if (contract.frequency === 'FREQ_DAILY') {
        const diffBetDays = noOfDaysBetween2Dates(contStartDate, actualEndDate)
        invoiceAmt = charge / diffBetDays
      } else if (contract.frequency === 'FREQ_MONTH') {
        const noOfDaysInCurrentMonth = getDaysInMonth(
          new Date(contStartDate).getMonth() + 1,
          new Date(contStartDate).getFullYear()
        )
        const amountTobeCal = charge / Number(noOfDaysInCurrentMonth)
        invoiceAmt = diffBetDays * amountTobeCal
      } else if (contract.frequency === 'FREQ_WEEK') {
        const weekcal = diffBetDays / 7
        invoiceAmt = weekcal * charge
      } else if (contract.frequency === 'FREQ_BI_MONTH') {
        const noOfDaysInCurrentMonth = getDaysInMonth(
          new Date(contStartDate).getMonth() + 1,
          new Date(contStartDate).getFullYear()
        )
        const noOfBiMonthDays = noOfDaysInCurrentMonth / 2
        const dayCal = diffBetDays / noOfBiMonthDays
        invoiceAmt = dayCal * charge
      } else {
        invoiceAmt = returnInvoiceAmountProrate(chargeAmt, contract.frequency, contract.durationMonth, contStartDate, actualEndDate, contract.nextBillPeriod, contract)
      }
    } else {
      if (contract.frequency === 'FREQ_DAILY') {
        invoiceAmt = charge / diffBetDays
      } else if (contract.frequency === 'FREQ_MONTH') {
        invoiceAmt = charge
      } else if (contract.frequency === 'FREQ_WEEK') {
        const weekcal = diffBetDays / 7
        let week
        if (weekcal > 1 && weekcal <= 2) {
          week = 2
        } else if (weekcal > 2 && weekcal <= 3) {
          week = 3
        } else if (weekcal > 3 && weekcal <= 4) {
          week = 4
        } else if (weekcal > 4 && weekcal <= 5) {
          week = 5
        } else {
          week = 1
        }
        invoiceAmt = week * charge
      } else if (contract.frequency === 'FREQ_BI_MONTH') {
        let dayCal
        if (diffBetDays <= 15) {
          dayCal = 1
        } else {
          dayCal = 2
        }
        invoiceAmt = dayCal * charge
      } else {
        invoiceAmt = (chargeAmt / noOfQuarters).toFixed(2)// per quarter amount
        if (contract.frequency === 'FREQ_HALF_YEAR') {
          // invoiceAmt = invoiceAmt * 2
        } else if (contract.frequency === 'FREQ_YEAR') {
          // invoiceAmt = invoiceAmt * 4
        }
      }
    }
    balanceAmount = balanceAmt - invoiceAmt
    if (balanceAmount < 0) {
      balanceAmount = 0
    }
    ret.balanceAmount = balanceAmount
    ret.invoiceAmt = invoiceAmt
  } else {
    ret.balanceAmount = 0
    ret.invoiceAmt = 0
  }
  return ret
}

export const calculateUsageFn = async (contractDtl, customerUuid, conn) => {
  let usageCharges = []; let chargeAmount = 0; let whereClause = {}; let additionalUsage; const response = {}
  if (contractDtl.isTierType === true) {
    whereClause = {
      isTierType: 'Y'
    }
  }

  usageCharges = await conn.PlanUsage.findAll({
    attributes: ['monthlyUtilisationCharge', 'reservationCharge', 'tier'],
    where: {
      planId: Number(contractDtl.itemId),
      customerUuid,
      ...whereClause
    }
  })
  if (usageCharges.length === 0) {
    usageCharges = await conn.PlanUsage.findAll({
      attributes: ['monthlyUtilisationCharge', 'reservationCharge', 'tier'],
      where: {
        planId: Number(contractDtl.itemId),
        [Op.or]: [{ customerUuid: '' }, { customerUuid: null }],
        ...whereClause
      }
    })
  }
  if (usageCharges.length > 0) {
    for (const usageCharge of usageCharges) {
      if (contractDtl.isTierType === true) {
        additionalUsage = Number(contractDtl.totalConsumption)
        if (usageCharge.tier === 'A') {
          chargeAmount += Number(usageCharge.monthlyUtilisationCharge) * contractDtl.addConsumption1
        }
        if (usageCharge.tier === 'B') {
          chargeAmount += Number(usageCharge.monthlyUtilisationCharge) * contractDtl.addConsumption2
        }
        if (usageCharge.tier === 'C') {
          chargeAmount += Number(usageCharge.monthlyUtilisationCharge) * contractDtl.addConsumption3
        }
      } else {
        additionalUsage = Number(contractDtl.totalConsumption) - Number(contractDtl.minCommitment)
        const reservCharge = Number(usageCharge.reservationCharge) * additionalUsage
        chargeAmount = Number(usageCharge.monthlyUtilisationCharge) * additionalUsage
        chargeAmount = Number(chargeAmount) - (Number(reservCharge) || 0)
      }
    }
    response.chargeAmount = chargeAmount
    response.quantity = additionalUsage
  } else {
    response.error = 'Usage details not found for this Plan/Product'
  }
  return response
}

export const checkCustomerAccountHasAccess = async (customerId, accountId, accountNo, conn, t) => {
  logger.info('validating customer account has access or not ')
  const response = await conn.Customer.findOne({
    attributes: ['customerId'],
    include: [
      { model: conn.Contact, as: 'contact', attributes: ['email', 'contactNo', 'contactType', 'contactNoPfx'] },
      {
        attributes: ['accountId', 'accountNo'],
        model: conn.CustAccounts,
        as: 'account',
        where: {
          accountId,
          accountNo
        }
      }
    ],
    where: {
      customerId
    },
    transaction: t
  })
  return response
}

const calculateContractValue = async (contracts) => {
  let contractCount = 0
  let contractValue = 0
  let revenue = 0
  let customers = 0
  let newCustomers = 0
  let rcAmount = 0
  let nrcAmount = 0
  let usageAmount = 0

  let response = {
    contractCount,
    contractValue,
    revenue,
    customers,
    newCustomers,
    rcAmount,
    nrcAmount,
    usageAmount
  }
  if (!contracts) {
    return response
  }
  if (Array.isArray(contracts) && contracts.length > 0) {
    contractCount = contracts.length
    let creditAdjAmount = 0
    let debitAdjAMount = 0
    const customerIds = []
    const existingCustomerIds = []
    for (const con of contracts) {
      rcAmount += con.rcAmount ? Number(con.rcAmount) : 0
      nrcAmount += con.otcAmount ? Number(con.otcAmount) : 0
      usageAmount += con.usageAmount ? Number(con.usageAmount) : 0
      creditAdjAmount += con.creditAdjAmount ? Number(con.creditAdjAmount) : 0
      debitAdjAMount += con.debitAdjAmount ? Number(con.debitAdjAmount) : 0

      if (con.customerId) {
        if (!existingCustomerIds.includes(con.customerId)) {
          customers = customers + 1
        }
        existingCustomerIds.push(con.customerId)
      }

      if (con.isNew === defaultCode.YES) {
        if (!customerIds.includes(con.customerId)) {
          newCustomers = newCustomers + 1
        }
        customerIds.push(con.customerId)
      }
    }
    contractValue = Number(rcAmount) + Number(nrcAmount) + Number(usageAmount)
    const totalAdj = (Number(debitAdjAMount) - Number(creditAdjAmount))
    revenue = contractValue + totalAdj
  }
  response = {
    contractCount,
    contractValue,
    revenue,
    customers,
    newCustomers,
    rcAmount,
    nrcAmount,
    usageAmount
  }
  return response
}
module.exports = ContractService
