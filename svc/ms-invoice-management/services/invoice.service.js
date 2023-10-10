import { logger, statusCodeConstants, defaultMessage, camelCaseConversion } from '@utils'
import { endOfMonth, startOfMonth, format } from 'date-fns'
import { isEmpty, map } from 'lodash'
import moment from 'moment'
import { QueryTypes, Op } from 'sequelize'
import { getOlderDates, getUTCforLocalDateInddMMMyyyy, getMonthName, getFutureDates } from '@utils/util'
import invoiceTransform from '@resources'

let instance

class CatalogService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async getInvoices(invoiceData, userId, conn) {
    try {
      const { limit, page } = invoiceData
      let params = {}
      if (limit && page) {
        params = {
          offset: page * limit,
          limit: Number(limit)
        }
      }
      let whereClause = {}
      let customerWhereClause = {}

      if (invoiceData && (invoiceData?.invoiceStartDate || invoiceData?.invoiceEndDate)) {
        if (invoiceData?.invoiceStartDate !== '' && invoiceData?.invoiceEndDate !== '') {
          whereClause = {
            [Op.and]: [
              {
                invStartDate: conn.sequelize.literal(`DATE("Invoice"."inv_start_date") >= DATE('${invoiceData?.invoiceStartDate}')`),
                invEndDate: conn.sequelize.literal(`DATE("Invoice"."inv_end_date") <= DATE('${invoiceData?.invoiceEndDate}')`)

              }
            ]
          }
        } else if (invoiceData?.invoiceStartDate !== '') {
          whereClause = {
            [Op.and]: [
              { invStartDate: conn.sequelize.literal(`DATE("Invoice"."inv_start_date") >= DATE('${invoiceData?.invoiceStartDate}')`) }
            ]
          }
        } else if (invoiceData?.invoiceEndDate !== '') {
          whereClause = {
            [Op.and]: [
              { invEndDate: conn.sequelize.literal(`DATE("Invoice"."inv_end_date") <= DATE('${invoiceData?.invoiceEndDate}')`) }]
          }
        }
      }
      if (invoiceData && invoiceData?.invoiceId) {
        whereClause.invoiceId = {
          [Op.and]: [
            conn.sequelize.where(
              conn.sequelize.cast(conn.sequelize.col('Invoice.invoice_id'), 'varchar'),
              { [Op.like]: `%${invoiceData?.invoiceId.toString()}%` }
            )
          ]
        }
      }
      if (invoiceData && invoiceData?.billRefNo) {
        whereClause.billRefNo = {
          [Op.and]: [
            conn.sequelize.where(
              conn.sequelize.cast(conn.sequelize.col('Invoice.bill_ref_no'), 'varchar'),
              {
                [Op.like]: `${invoiceData?.billRefNo.toString()}`
              }
            )
          ]
        }
      }
      if (invoiceData && invoiceData?.customerUuid) {
        whereClause.customerUuid = invoiceData.customerUuid
      }
      if (invoiceData && invoiceData?.invoiceNo) {
        whereClause.invNo = invoiceData.invoiceNo
      }
      if (invoiceData && invoiceData?.customerId) {
        whereClause.customerId = invoiceData.customerId
      }

      if (invoiceData && invoiceData?.customerNumber) {
        customerWhereClause.customerNo = invoiceData.customerNumber
      }

      if (invoiceData.customerName) {
        const customerNameParts = invoiceData.customerName.split(' ')
        customerNameParts.forEach(customerNamePart => {
          customerWhereClause = {
            ...customerWhereClause,
            [Op.or]: {
              firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"customer".first_name')), 'LIKE', '%' + customerNamePart.toLowerCase() + '%'),
              lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"customer".last_name')), 'LIKE', '%' + customerNamePart.toLowerCase() + '%')
            }
          }
        })

        let customerWhereClauses = {}
        const customerNamePart = invoiceData.customerName.split(' ')
        customerNamePart.forEach(customerNmPart => {
          customerWhereClauses = {
            ...customerWhereClauses,
            [Op.or]: {
              firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".first_name')), 'LIKE', '%' + customerNmPart.toLowerCase() + '%'),
              lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".last_name')), 'LIKE', '%' + customerNmPart.toLowerCase() + '%')
            }
          }
        })

        const customers = await conn.Customer.findAll({
          where: {
            ...customerWhereClauses
          }
        })
        if (customers) {
          whereClause.customerId = {
            [Op.in]: customers.map(x => x.customerId)
          }
        }
      }

      if (invoiceData && invoiceData?.billYear) {
        whereClause.billYear = invoiceData.billYear
      }

      if (invoiceData && invoiceData?.billCycle) {
        whereClause.billCycle = invoiceData.billCycle
      }

      if (invoiceData && invoiceData?.billingStatus) {
        whereClause.billingStatus = invoiceData.billingStatus
      }

      const invoices = await conn.Invoice.findAndCountAll({
        include: [
          {
            model: conn.Customer,
            as: 'customer',
            include: [{
              model: conn.Address,
              as: 'customerAddress',
              required: false,
              // where:{
              //   billFlag: 'Y'
              // },
              attributes: ['addressNo', 'status', 'addressType', 'isPrimary', 'address1', 'address2', 'address3', 'addrZone', 'city', 'district', 'state', 'postcode', 'country', 'latitude', 'longitude'],
              include: [
                { model: conn.BusinessEntity, as: 'countryDesc', attributes: ['description'] }
              ]
            }, {
              model: conn.Contact,
              attributes: ['contactNo', 'status', 'title', 'contactType', 'isPrimary', 'firstName', 'lastName', 'emailId', 'mobilePrefix', 'mobileNo', 'telephonePrefix', 'telephoneNo', 'whatsappNoPrefix', 'whatsappNo', 'fax', 'facebookId', 'instagramId', 'telegramId', 'secondaryEmail', 'secondaryContactNo'],
              as: 'customerContact',
              include: [
                {
                  model: conn.BusinessEntity,
                  as: 'statusDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'contactTypeDesc',
                  attributes: ['code', 'description']
                }
              ],
              required: false
            }],
            where: {
              ...customerWhereClause
            }
          },
          {
            model: conn.InvoiceDtl,
            as: 'invoiceDetails',
            include: [{
              model: conn.Charge,
              as: 'charge',
              include: [{
                model: conn.BusinessEntity,
                as: 'chargeCatDesc',
                attributes:
                  ['description']
              }]
            }, {
              model: conn.MonthlyContractDtl,
              as: 'monthlyContractDet',
              attributes: ['quantity'],
              include: [{
                model: conn.BusinessEntity,
                as: 'frequencyDesc',
                attributes:
                  ['description']
              }]
            }
              // {
              //   model: conn.BusinessEntity,
              //   as: 'statusDesc',
              //   attributes: ['description']
              // }
            ]
          },
          {
            model: conn.BusinessEntity,
            as: 'invoiceStatusDesc',
            attributes: ['description']
          }
        ],
        distinct: true,
        order: [['invoiceId', 'DESC']],
        where: whereClause,
        ...params
      })

      // if (invoices.count === 0) {
      //   return {
      //     status: statusCodeConstants.SUCCESS,
      //     message: 'No Invoice details found',
      //     data: invoices
      //   }
      // }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Invoice details fetched Sucessfully',
        data: invoices
      }
    } catch (error) {
      logger.error('error in invoice search api-------', error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async finalSubmit(invoiceData, userId, conn) {
    logger.debug('Submiting invoice-------->', invoiceData)
    const t = await conn.sequelize.transaction()
    try {
      const checkBills = await conn.MonthlyContract.findAll({
        where: { [Op.or]: [{ status: 'REGENERATE' }, { status: 'UNBILLED' }] },
        transaction: t
      })
      if (!isEmpty(checkBills)) {
        logger.debug('Pending or regenerated bills found', checkBills)
        return {
          status: statusCodeConstants.ERROR,
          message: 'Please generate bills'
        }
      }
      const contracts = await conn.MonthlyContract.findAll({
        attributes: ['contractId', 'customerId', 'customerUuid', 'actualEndDate', 'nextBillPeriod', 'billRefNo'],
        where: { status: 'PENDING' },
        transaction: t
      })
      const contractIds = map(contracts, 'contractId')
      const billRefNos = map(contracts, 'billRefNo')

      const coutntableDatas = await conn.Invoice.findAll({
        attributes: ['invoiceId', 'advAmount', 'invOsAmt', 'invAmt', 'billRefNo', 'prevBalance', 'processId',
          'dueDate', 'billMonth', 'billYear', 'customerId', 'customerUuid', 'accountUuid', 'serviceUuid'],
        include: [{
          model: conn.Customer,
          as: 'customer',
          attributes: ['customerId', 'firstName', 'lastName'],
          include: [{ model: conn.Contact, as: 'customerContact', attributes: ['emailId'] }]
        }],
        where: {
          billingStatus: 'PENDING',
          billRefNo: billRefNos,
          contractId: contractIds
        },
        transaction: t
      })
      const processIds = map(coutntableDatas, 'processId')
      const processData = await conn.InvoiceProcessed.findOne({ where: { processId: processIds }, transaction: t })
      if (!processData) {
        logger.debug('No process data found')
        return {
          status: statusCodeConstants.ERROR,
          message: 'No process data found'
        }
      }
      let invAmount = 0; let invOsAmt = 0; let prevBalance = 0; let advAmount = 0
      for (const inv of coutntableDatas) {
        invAmount += Number(inv.invAmt)
        invOsAmt += Number(inv.invOsAmt)
        prevBalance += Number(inv.prevBalance)
        advAmount += Number(inv.advAmount)
      }
      const billing = {
        billDate: processData.processDate,
        totInvProcessed: processData.totalProcessed,
        totSuccess: processData.successCount,
        totFailed: processData.successCount,
        totInvAmount: invAmount,
        totAdvAmt: advAmount,
        totPreBalAmt: prevBalance,
        totOutstandAmt: invOsAmt,
        noOfContracts: contracts.length,
        billingStatus: 'OPEN',
        createdBy: userId,
        updatedBy: userId,
        billMonth: new Date().getMonth() + 1,
        billYear: new Date().getFullYear(),
        billCycle: processData.invoiceCycleNo
      }
      const createBilling = await conn.Billing.create(billing, { transaction: t })

      const monthlyContractDtls = await conn.MonthlyContractDtl.findAll({
        where: { contractId: contractIds, status: 'PENDING' }, transaction: t
      })

      for (const monContDtl of monthlyContractDtls) {
        const contDtl = await conn.ContractDtl.findOne({
          where: { contractDtlId: monContDtl?.contractDtlId },
          transaction: t
        })
        const detailData = {
          balanceAmount: Number(contDtl?.balanceAmount) - Number(monContDtl?.chargeAmt)
        }
        await conn.ContractDtl.update(detailData, { where: { contractDtlId: monContDtl?.contractDtlId }, transaction: t })
      }

      await conn.InvoiceDtl.update({ billingStatus: 'BILLED' }, {
        where: { billRefNo: billRefNos, billingStatus: 'PENDING' }, transaction: t
      })
      await conn.Invoice.update({ billingStatus: 'BILLED' }, {
        where: { billRefNo: billRefNos, billingStatus: 'PENDING' }, transaction: t
      })
      await conn.MonthlyContractDtl.update({ status: 'BILLED' }, {
        where: { contractId: contractIds, status: 'PENDING' }, transaction: t
      })
      await conn.MonthlyContract.update({ status: 'BILLED' }, {
        where: { contractId: contractIds, status: 'PENDING' }, transaction: t
      })

      logger.debug('Fetching contract details')
      const monthlyContracts = await conn.Contract.findAll({
        //  attributes: ['contractId', 'customerId', 'customerUuid', 'actualEndDate', 'nextBillPeriod', 'billRefNo'],
        where: { status: 'CONTR_ST_OPEN' },
        transaction: t
      })

      const oldContractIds = map(monthlyContracts, 'contractId')
      if (!isEmpty(monthlyContracts)) {
        for (const con of monthlyContracts) {
          const date = new Date(con.nextBillPeriod)
          date.setMonth(date.getMonth() - 1)
          const twoMonthsBack = date
          if (moment(con.actualEndDate).isBefore(moment(twoMonthsBack).format('YYYY-MM-DD')) ||
            format(new Date(con.actualEndDate), 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd') ||
            con.nextBillPeriod === null) {
            const conData = {
              lastBillPeriod: con.nextBillPeriod,
              status: 'CONTR_ST_CLOSED',
              actualEndDate: con.actualEndDate,
              nextBillPeriod: null
            }
            await conn.Contract.update(conData, { where: { contractId: con.contractId }, transaction: t })
          }
        }

        const contractDtls = await conn.ContractDtl.findAll({ where: { contractId: oldContractIds }, transaction: t })
        if (!isEmpty(contractDtls)) {
          for (const cond of contractDtls) {
            const date = new Date(cond.nextBillPeriod)
            if (moment(cond.actualEndDate).isBefore(moment(date).format('YYYY-MM-DD')) ||
              format(new Date(cond.actualEndDate), 'yyyy-MM-dd') <= format(new Date(), 'yyyy-MM-dd') ||
              cond.nextBillPeriod === null) {
              const nextBill = date.setMonth(date.getMonth() + 3)
              if (cond.chargeType === 'CC_USGC') {
                const startDate = new Date(cond.actualStartDate)
                const endDate = startOfMonth(new Date(cond.actualEndDate))
                const data = {
                  contractId: cond.contractId,
                  contractType: cond.contractType,
                  actaulEndDate: null,
                  chargeId: cond.chargeId,
                  chargeAmt: cond.chargeAmt,
                  frequency: cond.frequency,
                  prorated: cond.prorated,
                  creditAdjAmount: cond.creditAdjAmount,
                  debitAdjAmount: cond.debitAdjAmount,
                  status: cond.status,
                  createdBy: cond.createdBy,
                  updatedBy: cond.updatedBy,
                  chargeName: cond.chargeName,
                  chargeType: cond.chargeType,
                  upfrontPayment: cond.upfrontPayment,
                  quantity: cond.quantity,
                  durationMonth: cond.durationMonth,
                  balanceAmount: cond.balanceAmount,
                  minCommitment: cond.minCommitment,
                  totalConsumption: cond.totalConsumption,
                  lastBillPeriod: null,
                  nextBillPeriod: format(new Date(nextBill), 'yyyy-MM-dd'),
                  actualStartDate: format(new Date(startDate.setMonth(startDate.getMonth() + 3)), 'yyyy-MM-dd'),
                  actualEndDate: format(endOfMonth(new Date(endDate.setMonth(endDate.getMonth() + 3))), 'yyyy-MM-dd')
                }
                await conn.ContractDtl.create(data, { transaction: t })
              }
              const conDtl = {
                status: 'CONTR_ST_CLOSED',
                nextBillPeriod: null
                // lastBillPeriod: cond.nextBillPeriod
              }
              // await conn.CustServices.update({ status: 'INACTIVE' }, { where: { connectionId: cond.connectionId }, transaction: t })
              await conn.ContractDtl.update(conDtl, { where: { contractDtlId: cond.contractDtlId }, transaction: t })
            }
          }
        }
      }
      const paymentMade = await conn.AdvancePayment.findAll({ where: { status: 'PENDING' }, transaction: t })

      for (const payment of paymentMade) {
        const pay = {
          advanceBalanceAmount: Number(payment.advanceBalanceAmount) === Number(payment.appliedAmount)
            ? 0
            : Number(payment.appliedAmount),
          status: Number(payment.advanceBalanceAmount) - Number(payment.appliedAmount) > 0 ? 'OPEN' : 'INV-CLOSED'
        }
        await conn.AdvancePayment.update(pay, { where: { paymentId: payment.paymentId }, transaction: t })

        for (const invoice of coutntableDatas) {
          await conn.PaymentInvoiceTxn.update({ status: 'INV-CLOSED' }, {
            where: {
              paymentId: payment.paymentId,
              invoiceId: invoice.invoiceId,
              status: 'OPEN'
            },
            transaction: t
          })
        }
      }

      for (const item of coutntableDatas) {
        await conn.Adjustment.update({ status: 'CLOSED' }, { where: { billRefNo: item.billRefNo, status: 'PENDING' } })
        await conn.AdjustmentDtl.update({ status: 'CLOSED' }, { where: { billRefNo: item.billRefNo, status: 'PENDING' } })
      }

      // forming notification data object for storing record in Notification table
      const notificationObj = []
      for (const con of coutntableDatas) {
        const billMonth = getMonthName(con.billMonth)
        const data = {
          customerName: con.customer[0].firstName,
          invoiceNumber: con.invoiceId,
          invoiceMonthYear: billMonth + ' ' + con.billYear,
          invoiceTotal: con.invAmt,
          invoiceDueDate: moment(con.dueDate).format('DD-MMM-YYYY'),
          billRefNo: con.billRefNo,
          customerId: con.customerId
        }
        notificationObj.push(data)
      }
      // const notification = await createInvoiceNotification(notificationObj, t)
      // if (!notification) {
      //   return {
      //     status: statusCodeConstants.ERROR,
      //     message: 'Error while creating invoice Notification'
      //   }
      // }
      await t.commit()
      logger.debug('Successfully Submited Invoices')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully submitting Invoices',
        data: createBilling
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while submitting Invoices'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async invoiceCount(invoiceData, userId, conn) {
    try {
      // const first = format(startOfMonth(new Date()), 'yyyy-MM-dd')
      // const last = format(endOfMonth(new Date()), 'yyyy-MM-dd')

      // const query = `select count(*) as potential_invoice_count,
      // (case when sum(mc.rc_amount) is null then 0 else sum(mc.rc_amount) end +
      //  case when sum(mc.otc_amount)is null then 0 else sum(mc.otc_amount) end +
      //  case when sum(mc.usage_amount)is null then 0 else sum(mc.usage_amount) end )+(sum(mc.debit_adj_amount)-sum(credit_adj_amount)) as potential_revenue,
      //       case when sum(mc.rc_amount) is null then 0 else sum(mc.rc_amount) end as potential_rc
      //       , case when sum(mc.otc_amount)is null then 0 else sum(mc.otc_amount) end as potential_nrc
      //       , case when sum(mc.usage_amount)is null then 0 else sum(mc.usage_amount) end as potential_usage_value
      //       from monthly_contract_hdr mc where mc.status='PENDING' OR mc.status='UNBILLED' OR mc.status='REGENERATE'`

      if (!invoiceData || !invoiceData?.status) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let status = ''
      if (invoiceData && invoiceData?.status && Array.isArray(invoiceData?.status)) {
        invoiceData?.status.forEach((ele) => {
          status = `'${ele}'` + ',' + status
        })
      }
      status = status.replace(/,$/, '')

      const whereClause = {}
      if (invoiceData && invoiceData?.invoiceStatus) {
        whereClause.invoiceStatus = invoiceData?.invoiceStatus
      }

      let query = `select count(*) as potential_invoice_count,
      (
       case when sum(mc.rc_amount) is null then 0 else sum(mc.rc_amount) end +
       case when sum(mc.otc_amount)is null then 0 else sum(mc.otc_amount) end +
       case when sum(mc.usage_amount)is null then 0 else sum(mc.usage_amount) end 
      ) + 
      ( 
       case when sum(mc.debit_adj_amount)is null then 0 else sum(mc.debit_adj_amount) end - 
       case when sum(mc.credit_adj_amount)is null then 0 else sum(mc.credit_adj_amount)end
      ) as potential_revenue,
      case when sum(mc.rc_amount) is null then 0 else sum(mc.rc_amount) end as potential_rc ,
      case when sum(mc.otc_amount)is null then 0 else sum(mc.otc_amount) end as potential_nrc ,
      case when sum(mc.usage_amount)is null then 0 else sum(mc.usage_amount) end as potential_usage_value
      from monthly_contract_hdr mc where mc.status IN (${status})
       `
      // 'PENDING' OR mc.status = 'UNBILLED' OR mc.status = 'REGENERATE'

      if (invoiceData && invoiceData?.billCycle) {
        query = query + ` and mc.bill_cycle = ${invoiceData?.billCycle}`
        whereClause.billCycle = invoiceData?.billCycle
      }

      if (invoiceData && invoiceData?.billYear) {
        query = query + ` and mc.bill_year = ${invoiceData?.billYear}`
        whereClause.billYear = invoiceData?.billYear
      }

      let counts = await conn.sequelize.query(query, { type: QueryTypes.SELECT })
      if (!counts) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No records found'
        }
      }
      const invoices = await conn.Invoice.findAll({
        attributes: ['invoiceId', 'processId'],
        logging: true,
        where: {
          billingStatus: invoiceData?.invoiceStatus ? ['PENDING', 'BILLED'] : invoiceData?.status,
          // invoiceStatus: 'OPEN',
          invDate: {
            [Op.gte]: format(startOfMonth(getFutureDates(new Date(), 0)), 'yyyy-MM-dd'),
            [Op.lte]: format(endOfMonth(getFutureDates(new Date(), 0)), 'yyyy-MM-dd')
          },
          ...whereClause
        }
      })

      if (isEmpty(invoices)) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No records found'
        }
      }
      const processIds = []
      invoices.forEach(e => { processIds.push(e.processId) })
      const thisMonthProcess = await conn.InvoiceProcessed.findAll({
        include: [
          { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] },
          { model: conn.Invoice, attributes: ['invoiceStatus', 'billingStatus', 'contractId'], as: 'invoices' }
        ],
        where: { processId: processIds },
        order: [['processId', 'DESC']]
      })
      if (isEmpty(thisMonthProcess)) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No records found'
        }
      }

      counts = camelCaseConversion(counts)
      const response = {
        counts,
        thisMonthProcess: thisMonthProcess || null
      }
      logger.debug('Successfully fetch Invoice data')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully counts',
        data: response
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while getting counts'
      }
    }
  }

  async revenueCountByMonth(invoiceData, userId, conn) {
    try {
      const whereClauseCurrent = {}

      if (invoiceData && invoiceData?.billCycle) {
        whereClauseCurrent.billCycle = invoiceData?.billCycle
      }

      if (invoiceData && invoiceData?.billYear) {
        whereClauseCurrent.billYear = invoiceData?.billYear
      }

      if (invoiceData && invoiceData?.billingStatus) {
        whereClauseCurrent.billingStatus = invoiceData?.billingStatus
      }

      const coutntableDatas = await conn.Invoice.findAndCountAll({
        attributes: [
          [conn.sequelize.fn('sum', conn.sequelize.col('adv_amount')), 'advanceTotal'],
          [conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invOsAmtTotal'],
          [conn.sequelize.fn('sum', conn.sequelize.col('inv_amt')), 'invAmtTotal']
        ],
        where: {
          // billingStatus: 'PENDING',
          ...whereClauseCurrent
        },
        raw: true
      })
      if (coutntableDatas?.count === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No records found'
        }
      }
      const sumOfPrevious = await conn.Invoice.findAll({
        attributes: [
          [conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invAmtTotal']
        ],
        where: {
          invoiceStatus: 'OPEN',
          billingStatus: 'BILLED'
        },
        raw: true
      })
      coutntableDatas.rows[0].PreviousBalance = Number(sumOfPrevious[0].invAmtTotal) || 0
      coutntableDatas.rows[0].totalOutstanding = (Number(coutntableDatas.rows[0].invAmtTotal) -
        Number(coutntableDatas.rows[0].advanceTotal) || 0) + Number(sumOfPrevious[0].invAmtTotal) || 0
      logger.debug('Successfully fetch Invoice counts')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch Invoice counts',
        data: coutntableDatas
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while fetching invoice counts'
      }
    }
  }

  async monthlyContractHistory(invoiceData, userId, conn) {
    try {
      let { billMonth = null, billCycle = null, billYear = null } = invoiceData.body
      billMonth = billMonth || null
      billCycle = billCycle || null
      billYear = billYear || null
      const query = `select count(*), (case when sum(mc.rc_amount) is null then 0 else sum(mc.rc_amount) end + 
      case when sum(mc.otc_amount)is null then 0 else sum(mc.otc_amount) end
      + case when sum(mc.usage_amount)is null then 0 else sum(mc.usage_amount) end ) as potential_revenue,
      case when sum(mc.rc_amount) is null then 0 else sum(mc.rc_amount) end as potential_rc
      , case when sum(mc.otc_amount)is null then 0 else sum(mc.otc_amount) end as potential_nrc
      , case when sum(mc.usage_amount)is null then 0 else sum(mc.usage_amount) end as potential_usage_value
      from monthly_contract_hdr mc where mc.bill_month = '${billMonth}' or mc.bill_year = ${billYear} or mc.bill_cycle = ${billCycle}`
      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      response = camelCaseConversion(response)
      logger.debug('Successfully fetch Invoice data')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully generated counts',
        data: response
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while getting counts'
      }
    }
  } //  where mc.start_date::DATE >= '${first}' and mc.end_date::DATE <= '${last}'

  async revenueCountHistory(invoiceData, userId, conn) {
    try {
      const searchParams = invoiceData
      if (!searchParams) {
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      // const whereClause = {}
      let whereClause = '1=1'
      const monthlyfilter = {}
      if (searchParams.billPeriod && searchParams.billPeriod !== '' && searchParams.billPeriod !== undefined) {
        // whereClause.contractPeriod = searchParams.billPeriod
        whereClause += " and bill_period='" + searchParams.billPeriod + "'"
        monthlyfilter.billPeriod = searchParams.billPeriod
      }
      if (searchParams.billYear && searchParams.billYear !== '' && searchParams.billYear !== undefined) {
        // whereClause.billYear = searchParams.billYear
        whereClause += " and bill_year='" + searchParams.billYear + "'"
        monthlyfilter.billYear = searchParams.billYear
      }
      if (searchParams.billMonth && searchParams.billMonth !== '' && searchParams.billMonth !== undefined) {
        // whereClause.billMonth = searchParams.billMonth
        whereClause += " and bill_month='" + searchParams.billMonth + "'"
        monthlyfilter.billMonth = searchParams.billMonth
      }
      if (searchParams.billCycle && searchParams.billCycle !== '' && searchParams.billCycle !== undefined) {
        // whereClause.billCycle = searchParams.billCycle
        whereClause += " and bill_cycle='" + searchParams.billCycle + "'"
        monthlyfilter.billCycle = searchParams.billCycle
      }
      /*
      const coutntableDatas = await conn.Invoice.findAndCountAll({
        group: ['processId'],
        attributes: [
          'processId',
          [sequelize.fn('sum', sequelize.col('adv_amount')), 'advanceTotal'],
          [sequelize.fn('sum', sequelize.col('inv_os_amt')), 'invOsAmtTotal'],
          [sequelize.fn('sum', sequelize.col('inv_amt')), 'invAmtTotal']],
        where: whereClause
      }) */
      const countable = await conn.sequelize.query(
        `select process_id, sum(adv_amount) as advance_total, sum(inv_os_amt) as inv_os_amt_total, sum(inv_amt) as inv_amt_total, sum(prev_balance) as previous_balance 
      from invoice where ${whereClause} group by process_id`,
        {
          type: QueryTypes.SELECT
        }
      )

      const coutntableDatas = camelCaseConversion(countable)

      if (coutntableDatas.length === 0) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'No records found'
        }
      }
      const processData = await conn.InvoiceProcessed.findAll({
        include: [{ model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] }],
        where: { processId: coutntableDatas[0].processId }
      })

      const noOfContracts = await conn.MonthlyContract.count({ where: { ...monthlyfilter, status: 'BILLED' } })
      coutntableDatas[0].totalOutstanding = (Number(coutntableDatas[0].invAmtTotal) -
        Number(coutntableDatas[0].advanceTotal) || 0) + Number(coutntableDatas[0]?.previousBalance) || 0
      coutntableDatas[0].previousBalance = Number(coutntableDatas[0]?.previousBalance) || 0

      const query = `select count(*) as count, 
      (case when sum(mc.rc_amount) is null then 0 else sum(mc.rc_amount) end + 
       case when sum(mc.otc_amount)is null then 0 else sum(mc.otc_amount) end +
       case when sum(mc.usage_amount)is null then 0 else sum(mc.usage_amount) end )+(sum(mc.debit_adj_amount)-sum(credit_adj_amount)) as potential_revenue,
            case when sum(mc.rc_amount) is null then 0 else sum(mc.rc_amount) end as potential_rc
            , case when sum(mc.otc_amount)is null then 0 else sum(mc.otc_amount) end as potential_nrc
            , case when sum(mc.usage_amount)is null then 0 else sum(mc.usage_amount) end as potential_usage_value
            from monthly_contract_hdr mc where ${whereClause} and status='BILLED'`

      let counts = await conn.sequelize.query(query, { type: QueryTypes.SELECT })
      if (!counts) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'No bills found'
        }
      }
      counts = camelCaseConversion(counts)
      const response = {
        coutntableDatas,
        processData,
        noOfContracts,
        counts
      }
      logger.debug('Successfully fetch Invoice counts')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch Invoice counts',
        data: response
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while fetching invoice counts'
      }
    }
  }

  async arBillCountsbyBillRefNo(invoiceData, userId, conn) {
    try {
      const { customerUuid } = invoiceData
      if (!customerUuid) {
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const today = getUTCforLocalDateInddMMMyyyy(new Date())

      const inovicesData = await conn.Invoice.findAll({
        attributes: [[conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invOsAmtTotal']],
        where: { customerUuid, invoiceStatus: 'OPEN', billingStatus: 'BILLED' },
        raw: true,
        nest: true
      })
      const advanceAmount = await conn.AdvancePayment.findAll({
        attributes: [[conn.sequelize.fn('sum', conn.sequelize.col('advance_balance_amount')), 'advancePaymentTotal']],
        where: { customerUuid, status: ['OPEN', 'PENDING'] },
        raw: true,
        nest: true
      })

      const osData = await conn.Invoice.findAll({
        attributes: [[conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invOsAmtTotal']],
        where: {
          [Op.and]: [{ dueDate: conn.sequelize.where(conn.sequelize.col('due_date'), '<', today) }, { customerUuid }],
          invoiceStatus: 'OPEN',
          billingStatus: 'BILLED'
        },
        raw: true
      })
      if (!inovicesData || isEmpty(inovicesData)) {
        logger.error('Invoice not available')
        return {
          status: statusCodeConstants.ERROR,
          message: 'Invoice Count Not available'
        }
      }
      let servicesCount = await conn.CustAccounts.findAll({
        attributes: [],
        include: [{
          model: conn.CustServices,
          as: 'accountServices',
          attributes: [[conn.sequelize.fn('COUNT', conn.sequelize.col('service_id')), 'servicesCount']]
        }],
        where: { customerUuid, status: 'CS_ACTIVE' },
        group: ['CustAccounts.account_id'],
        raw: true,
        nest: true
      })
      if (!servicesCount || isEmpty(servicesCount)) {
        servicesCount = null
      }
      const response = {
        totoalOutstanding: !isEmpty(inovicesData) && inovicesData[0].invOsAmtTotal ? inovicesData[0].invOsAmtTotal : 0,
        // Sum of all
        dueOutStanding: !isEmpty(osData) && osData[0].invOsAmtTotal ? osData[0].invOsAmtTotal : 0,
        // Sum of all status: open, dueDate < today
        advancePayment: !isEmpty(advanceAmount) && advanceAmount[0].advancePaymentTotal ? Number(advanceAmount[0].advancePaymentTotal) : 0
        // Sum of all
        // noOfActvieServices: servicesCount[0].service.servicesCount
      }

      logger.debug('Successfully Submited Invoices')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: response
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal Server Error'
      }
    }
  }

  async arBillCountsbyBillRefNos(invoiceData, userId, conn) {
    try {
      const { customerId } = invoiceData
      if (!customerId) {
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const today = getUTCforLocalDateInddMMMyyyy(new Date())

      const inovicesData = await conn.Invoice.findAll({
        attributes: [[conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invOsAmtTotal']],
        where: { customerId, invoiceStatus: 'OPEN', billingStatus: 'BILLED' },
        raw: true,
        nest: true
      })
      const advanceAmount = await conn.AdvancePayment.findAll({
        attributes: [[conn.sequelize.fn('sum', conn.sequelize.col('advance_balance_amount')), 'advancePaymentTotal']],
        where: { customerUuid: '', status: ['OPEN', 'PENDING'] },
        raw: true,
        nest: true
      })

      const osData = await conn.Invoice.findAll({
        attributes: [[conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invOsAmtTotal']],
        where: {
          [Op.and]: [{ dueDate: conn.sequelize.where(conn.sequelize.col('due_date'), '<', today) }, { customerId }],
          invoiceStatus: 'OPEN',
          billingStatus: 'BILLED'
        },
        raw: true
      })
      if (!inovicesData || isEmpty(inovicesData)) {
        logger.error('Invoice not available')
        return {
          status: statusCodeConstants.ERROR,
          message: 'Invoice Count Not available'
        }
      }
      let servicesCount = await conn.CustAccounts.findAll({
        attributes: [],
        include: [{
          model: conn.CustServices,
          as: 'accountServices',
          attributes: [[conn.sequelize.fn('COUNT', conn.sequelize.col('service_id')), 'servicesCount']]
        }],
        where: { customerId, status: 'CS_ACTIVE' },
        group: ['CustAccounts.account_id'],
        raw: true,
        nest: true
      })
      if (!servicesCount || isEmpty(servicesCount)) {
        servicesCount = null
      }
      const response = {
        totoalOutstanding: !isEmpty(inovicesData) && inovicesData[0].invOsAmtTotal ? inovicesData[0].invOsAmtTotal : 0,
        // Sum of all
        dueOutStanding: !isEmpty(osData) && osData[0].invOsAmtTotal ? osData[0].invOsAmtTotal : 0,
        // Sum of all status: open, dueDate < today
        advancePayment: !isEmpty(advanceAmount) && advanceAmount[0].advancePaymentTotal ? Number(advanceAmount[0].advancePaymentTotal) : 0
        // Sum of all
        // noOfActvieServices: servicesCount[0].service.servicesCount
      }

      logger.debug('Successfully Submited Invoices')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: response
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal Server Error'
      }
    }
  }

  async postBillAdjustment(invoiceData, userId, conn) {
    logger.debug('Fetching Invoice data')
    try {
      const { customerUuid } = invoiceData
      if (!customerUuid) {
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const response = await conn.Invoice.findOne({
        include: [{ model: conn.Adjustment, as: 'postBillAdjustment', where: { adjustmentCat: 'POSTBILL' } }],
        where: { customerUuid }
      })

      logger.debug('Successfully fetch Invoice data')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch invoice data',
        data: response
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while fetching invoice counts'
      }
    }
  }

  async invoicePayment(invoiceData, userId, conn) {
    try {
      const { invoiceId } = invoiceData
      if (!invoiceId) {
        return {
          status: statusCodeConstants.ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response = await conn.sequelize.query(
        `select sum(pit.payment_amount) as payment_amount, i.invoice_id, pt.payment_id, cast(pt.created_at as date) as created_at, be1.description as currency_desc, be2.description as payment_mode_desc, be3.description as payment_location
        from payment_invoice_txn pit 
        left join invoice i on pit.invoice_id =i.invoice_id 
        left join payment_txn pt on pt.payment_id =pit.payment_id 
        left join ad_business_entity be1 on be1.code=pt.currency 
        left join ad_business_entity be2 on be2.code=pt.payment_mode 
        left join ad_business_entity be3 on be3.code=pt.payment_location 
        where i.invoice_id ='${invoiceId}'
        group by i.invoice_id,pt.payment_id,be1.description,be2.description,be3.description,cast(pt.created_at as date) `,
        {
          type: QueryTypes.SELECT
        }
      )
      // where i.bill_ref_no ='${billRefNo}'
      response = camelCaseConversion(response)
      logger.debug('Successfully fetch Invoice data')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch invoice data',
        data: response
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while fetching invoice counts'
      }
    }
  }

  async createInvoice(invoiceData, userId, conn) {
    const t = await conn.sequelize.transaction()
    const t2 = await conn.sequelize.transaction()
    try {
      logger.info('Creating new invoice')
      let intialProcess
      const intialProcessIds = []
      let process
      // let executing = false // This will be true if queryData() gets valid result and execute create or generate bills

      const date = new Date()

      logger.info('Query to find SUMS and bill ref numbers')
      const invoiceUpdateArr = new Map()
      const billRefNos = await queryData('UNBILLED', conn)
      if (isEmpty(billRefNos)) {
        logger.error('No bills found')
        return {
          status: statusCodeConstants.ERROR,
          message: 'No bills found'
        }
      }
      let monthlyContractDtlBulkData = []
      const contractIds = []

      logger.info('Creating new invoice Individually')
      const billSet = new Set()
      const monthlyContractIds = []
      for (const bill of billRefNos) {
        billSet.add(bill.customerUuid)
        monthlyContractIds.push(bill.monthlyContractId)
      }
      const billRefNoList = Array.from(billSet)
      const invoices = await conn.Invoice.findAll({ where: { customerUuid: billRefNoList, billingStatus: 'PENDING' } })

      if (invoices.length > 0) {
        const invoiceIds = []
        for (const id of invoices) {
          invoiceIds.push(id.invoiceId)
          intialProcessIds.push(id.processId)
          process = await conn.InvoiceProcessed.findOne({
            attributes: ['invoiceRegenCnt', 'invoiceCycleNo', 'processId'],
            where: { processId: id.processId },
            transaction: t2
          })
          await conn.InvoiceProcessed.update(
            { invoiceRegenCnt: Number(process.invoiceRegenCnt) + 1 },
            { where: { processId: id.processId }, transaction: t2 }
          )
        }
        if (invoiceIds.length > 0) {
          await conn.PaymentInvoiceTxn.destroy({ where: { invoiceId: invoiceIds }, transaction: t2 })
          await conn.InvoiceDtl.destroy({ where: { invoiceId: invoiceIds }, transaction: t2 })
          await conn.Invoice.destroy({ where: { invoiceId: invoiceIds }, transaction: t2 })
        }
      } else {
        logger.info('Creating Invoice processed data')
        intialProcess = {
          processDate: date,
          invoiceStartDate: startOfMonth(getOlderDates(billRefNos[0]?.nextBillPeriod, 1)),
          invoiceEndDate: endOfMonth(getOlderDates(billRefNos[0]?.nextBillPeriod, 1)),
          processedBy: userId,
          invoiceCycleNo: Number(billRefNos[0]?.invoiceCycleNo) + 1 ? Number(billRefNos[0]?.invoiceCycleNo) + 1 : 1,
          invoiceRegenCnt: 1,
          createdBy: userId,
          updatedBy: userId
        }
        process = await conn.InvoiceProcessed.create(intialProcess, { transaction: t })
        if (!process) {
          logger.info('failed to create Creating Invoice processed data')
          return {
            status: statusCodeConstants.ERROR,
            message: 'Invoice creation failed!!'
          }
        }
      }
      await conn.AdvancePayment.update({ status: 'OPEN', appliedAmount: 0 }, {
        where: { customerUuid: billRefNoList, status: 'PENDING' },
        transaction: t2
      })
      if (monthlyContractIds.length > 0) {
        await conn.MonthlyContract.update({ status: 'UNBILLED' }, {
          where: { status: ['PENDING', 'REGENERATE'], monthlyContractId: monthlyContractIds },
          transaction: t2
        })
        await conn.MonthlyContractDtl.update({ status: 'UNBILLED' }, {
          where: { status: ['PENDING', 'REGENERATE'], monthlyContractId: monthlyContractIds },
          transaction: t2
        })
      }
      await t2.commit()

      for (const item of billRefNoList) {
        logger.info(`Finding customerId and monthly contracts by customerUuid: ${item}`)
        const monthlyContractByBillRefNo = []
        const advanceAmount = new Map()
        const adjustmentMap = new Map()
        const paidAmount = new Map()
        const paymentInvArr = []
        let paymentId = null

        let initialAdvAmt = 0
        let creditAdjAmt = 0
        let debitAdjAmt = 0
        let advAmt = 0

        const oneInvoceOfBills = await conn.MonthlyContract.findAndCountAll({
          attributes: ['customerId', 'actualStartDate', 'actualEndDate', 'contractId', 'actualEndDate', 'monthlyContractId', 'customerUuid', 'accountUuid', 'serviceUuid', 'monthlyContractId', 'billRefNo'],
          include: [{
            model: conn.MonthlyContractDtl,
            as: 'monthlyContractDtl',
            required: true,
            where: { status: ['UNBILLED'] },
            order: [['createdDt'], ['chargeAmt', 'DESC']]
          }],
          where: { customerUuid: item, status: ['UNBILLED'] },
          transaction: t,
          raw: true,
          nest: true
        })
        const advancePayment = await conn.AdvancePayment.findAll({
          attributes: ['advanceBalanceAmount', 'paymentId'],
          where: {
            status: 'OPEN',
            customerUuid: item,
            advanceBalanceAmount: { [Op.gt]: 0 }
          },
          transaction: t,
          order: [['paymentId']]
        })
        for (const a of advancePayment) {
          advanceAmount.set(a.paymentId, a.advanceBalanceAmount)
        }
        const adjustments = await conn.AdjustmentDtl.findAll({
          attributes: ['adjustmentDtlId', 'adjustmentId', 'contractId', 'contractDtlId', 'billRefNo', 'adjAmount', 'adjustmentCat', 'adjustmentType'],
          where: {
            status: 'OPEN',
            billRefNo: item
          },
          transaction: t
        })
        for (const a of adjustments) {
          adjustmentMap.set(a.adjustmentDtlId, {
            contractDtlId: a.contractDtlId,
            adjustmentId: a.adjustmentId,
            adjAmount: a.adjAmount,
            adjustmentCat: a.adjustmentCat,
            adjustmentType: a.adjustmentType
          })
        }
        for (const monthlyBills of oneInvoceOfBills.rows) {
          monthlyContractByBillRefNo.push(monthlyBills.monthlyContractDtl)
        }
        for (const unbilled of monthlyContractByBillRefNo) {
          if (unbilled.chargeType === 'CC_USGC' && (unbilled.totalConsumption === null ||
            Number(unbilled.totalConsumption) === Number(0))) {
            logger.info('failed to create Creating Invoice due to Zero or empty total consumption')
            return {
              status: statusCodeConstants.ERROR,
              message: 'Total Consumption for Usage Contract is not provided. Kindly edit Unbilled contract and provide.'
            }
          }
        }
        logger.info('Creating Invoice object and record in DB' + item)

        let splitContractList = await conn.sequelize.query(
          `select distinct contract_id as contract_id,min(actual_start_date) as start_date,max(actual_end_date) as end_date, monthly_contract_id 
          from monthly_contract_hdr where bill_ref_no='${item}' and is_split='Y' and status in ('UNBILLED','PENDING') group by contract_id, monthly_contract_id`,
          {
            type: QueryTypes.SELECT,
            transaction: t
          }
        )
        splitContractList = camelCaseConversion(splitContractList)

        let unSplitContractList = await conn.sequelize.query(
          `with a as (
            select contract_id, monthly_contract_id from monthly_contract_hdr 
            where customer_uuid = '${item.toString()}' and is_split ='Y' and status in ('UNBILLED', 'PENDING') ),
            b as(
            select distinct mc2.contract_id as contract_id, min(mc.actual_start_date) start_date, max(mc.actual_end_date) end_date, null as monthly_contract_id
            ,'N' is_split from monthly_contract_dtl mc
            join monthly_contract_hdr mc2 on mc.monthly_contract_id =mc2.monthly_contract_id 
            left join a on mc.contract_id !=a.contract_id 
            where mc2.is_split ='N' and mc2.customer_uuid = '${item.toString()}' and mc2.status in ('UNBILLED', 'PENDING')
            group by mc2.contract_id ) ,c as ( 
            --union
            select distinct mc.contract_id as contract_id, min(mc.actual_start_date) start_date, max(mc.actual_end_date) end_date,mc.monthly_contract_id,'Y' is_split from monthly_contract_hdr mc
            join a on mc.contract_id =a.contract_id and mc.monthly_contract_id not in (
            select monthly_contract_id from monthly_contract_hdr 
            where customer_uuid = '${item.toString()}' and is_split ='Y'and status in ('UNBILLED', 'PENDING') )
            group by mc.contract_id,mc.monthly_contract_id )
            select 
           (case when (c.is_split='Y') then cast(c.contract_id as varchar) else cast(b.contract_id as varchar) end ) contract_id,
           (case when (c.is_split='Y') then cast(c.start_date as varchar) else cast(b.start_date as varchar)end ) start_date,
           (case when (c.is_split='Y') then cast(c.end_date as varchar) else cast(b.end_date as varchar) end ) end_date,
           (case when (c.is_split='Y') then cast(c.monthly_contract_id as varchar)else cast(b.monthly_contract_id as varchar) end ) monthly_contract_id
            from b left join c on b.contract_id=c.contract_id`, {
          type: QueryTypes.SELECT,
          logging: true,
          transaction: t
        }
        )

        unSplitContractList = camelCaseConversion(unSplitContractList)
        const contracts = []
        if (Array(splitContractList) && !isEmpty(splitContractList)) {
          for (const contract of splitContractList) {
            contracts.push(contract)
          }
        }
        if (Array(unSplitContractList) && !isEmpty(unSplitContractList)) {
          for (const contract of unSplitContractList) {
            contracts.push(contract)
          }
        }

        for (const mainContract of contracts) {
          const generatingInvoice = invoiceTransformation(item, oneInvoceOfBills, mainContract)
          generatingInvoice.processId = process.processId
          generatingInvoice.billCycle = process.invoiceCycleNo
          generatingInvoice.createdBy = userId
          generatingInvoice.updatedBy = userId
          // generatingInvoice.customerUuid = invoiceData?.customerUuid

          const generateInvoice = await conn.Invoice.create(generatingInvoice, { transaction: t })
          if (!generateInvoice) {
            logger.error('Failed to create invoice')
            return {
              status: statusCodeConstants.ERROR,
              message: 'Failed to create invoice'
            }
          }
          let invAmt = 0
          let invOsAmt = 0
          let advAmount = 0
          let sumPaid = 0
          if (monthlyContractByBillRefNo.length > 0) {
            logger.info('Monthly contracts found executing Main loop')
            for (const contract of monthlyContractByBillRefNo) {
              if (Number(mainContract.contractId) === Number(contract.contractId)) {
                logger.info('Generating individual Invoice object')
                logger.info('Creating new billed Deatils', generateInvoice.invoiceId)
                const generateInvoiceDetails = invoiceDtlTransformation(item, generateInvoice, contract, userId)
                generateInvoiceDetails.createdBy = userId
                generateInvoiceDetails.processId = process.processId
                generateInvoiceDetails.updatedBy = userId
                if (generateInvoiceDetails.chargeName !== 'Adjustment') {
                  const chargeAmt = Math.round((Number(contract.chargeAmt) + Number.EPSILON) * 100) / 100
                  let paidAmt = 0
                  let totOsAmt
                  const invoiceAmt = chargeAmt

                  for (const adjustment of adjustmentMap.keys()) {
                    creditAdjAmt = adjustmentMap.get(adjustment).adjustmentType === 'ADJ_TYP_CREDIT' ? adjustmentMap.get(adjustment).adjAmount : 0
                    debitAdjAmt = adjustmentMap.get(adjustment).adjustmentType === 'ADJ_TYP_DEBIT' ? adjustmentMap.get(adjustment).adjAmount : 0
                    if (adjustmentMap.get(adjustment).contractDtlId === generateInvoiceDetails.contractDtlId) {
                      generateInvoiceDetails.debitAdj = Number(debitAdjAmt) + Number(generateInvoiceDetails.debitAdj)
                      generateInvoiceDetails.creditAdj = Number(creditAdjAmt) + Number(generateInvoiceDetails.creditAdj)
                    }

                    await conn.AdjustmentDtl.update({ status: 'PENDING' }, {
                      where: { adjustmentDtlId: adjustment }, transaction: t
                    })
                    await conn.Adjustment.update({ status: 'PENDING' }, {
                      where: { adjustmentId: adjustmentMap.get(adjustment).adjustmentId },
                      transaction: t
                    })
                    debitAdjAmt = 0
                    creditAdjAmt = 0
                  }
                  const totinvAmt = invoiceAmt + (generateInvoiceDetails.debitAdj - generateInvoiceDetails.creditAdj)
                  totOsAmt = invoiceAmt + (generateInvoiceDetails.debitAdj - generateInvoiceDetails.creditAdj)
                  for (const advance of advanceAmount.keys()) {
                    if (paymentId === null) {
                      paymentId = advance
                      initialAdvAmt = advanceAmount.get(advance)
                    }
                    if (initialAdvAmt > 0) {
                      if (advAmt === 0) {
                        advAmt = initialAdvAmt
                      }
                      let found = false
                      if (contract.chargeType !== null) {
                        if (totOsAmt < advAmt) {
                          initialAdvAmt = advAmt - totOsAmt
                          sumPaid = totOsAmt
                          totOsAmt = 0
                          advAmt = initialAdvAmt
                          if (paymentInvArr.length === 0) {
                            paymentInvArr.push({
                              invoiceId: generateInvoiceDetails.invoiceId,
                              paymentId,
                              paymentAmount: sumPaid,
                              invAmt: totinvAmt,
                              invOsAmt: totOsAmt,
                              status: 'OPEN',
                              createdBy: userId,
                              createdAt: new Date()
                            })
                          } else {
                            for (const r of paymentInvArr) {
                              if (r.paymentId === paymentId) {
                                found = true
                                r.paymentAmount = r.paymentAmount + sumPaid
                              }
                            }
                            if (!found) {
                              paymentInvArr.push({
                                invoiceId: generateInvoiceDetails.invoiceId,
                                paymentId,
                                paymentAmount: sumPaid,
                                invAmt: totinvAmt,
                                invOsAmt: totOsAmt,
                                status: 'OPEN',
                                createdBy: userId,
                                createdAt: new Date()
                              })
                            }
                          }
                          if (!paidAmount.get(paymentId)) {
                            paidAmount.set(paymentId, sumPaid)
                          } else {
                            paidAmount.set(paymentId, Number(paidAmount.get(paymentId)) + Number(sumPaid))
                          }
                        } else {
                          totOsAmt = totOsAmt - advAmt
                          sumPaid = Number(advAmt)
                          advAmt = 0
                          initialAdvAmt = 0
                          if (paymentInvArr.length === 0) {
                            paymentInvArr.push({
                              invoiceId: generateInvoiceDetails.invoiceId,
                              paymentId,
                              paymentAmount: sumPaid,
                              invAmt: totinvAmt,
                              invOsAmt: totOsAmt,
                              status: 'OPEN',
                              createdBy: userId,
                              createdAt: new Date()
                            })
                          } else {
                            for (const r of paymentInvArr) {
                              if (r.paymentId === paymentId) {
                                found = true
                                r.paymentAmount = r.paymentAmount + sumPaid
                              }
                            }
                            if (!found) {
                              paymentInvArr.push({
                                invoiceId: generateInvoiceDetails.invoiceId,
                                paymentId,
                                paymentAmount: sumPaid,
                                invAmt: totinvAmt,
                                invOsAmt: totOsAmt,
                                status: 'OPEN',
                                createdBy: userId,
                                createdAt: new Date()
                              })
                            }
                          }

                          if (!paidAmount.get(paymentId)) {
                            paidAmount.set(paymentId, sumPaid)
                          } else {
                            paidAmount.set(paymentId, Number(paidAmount.get(paymentId)) + Number(sumPaid))
                          }
                        }
                        const balanceAmount = Number(initialAdvAmt) + Number(advAmt)
                        paidAmt += sumPaid

                        if (balanceAmount <= 0) {
                          advanceAmount.delete(paymentId)
                          paymentId = null
                        } else {
                          advanceAmount.set(paymentId, balanceAmount)
                        }
                      }
                    } else {
                      advanceAmount.delete(paymentId)
                      paymentId = null
                    }
                    if (totOsAmt <= 0) {
                      break
                    } else {
                      continue
                    }
                  }
                  generateInvoiceDetails.paidAmount = paidAmt
                  generateInvoiceDetails.invAmt = totinvAmt
                  generateInvoiceDetails.invOsAmt = totOsAmt
                  generateInvoiceDetails.chargeAmt = chargeAmt

                  if (totOsAmt === 0) {
                    generateInvoiceDetails.invoiceStatus = 'INV-CLOSED'
                  }
                  monthlyContractDtlBulkData.push(generateInvoiceDetails)

                  contractIds.push(contract.monthlyContractId)
                  invAmt += totinvAmt
                  invOsAmt += totOsAmt
                  advAmount += paidAmt
                  const invoiceStatus = invOsAmt === 0 ? 'INV-CLOSED' : 'OPEN'
                  invoiceUpdateArr.set(generateInvoiceDetails.invoiceId, {
                    invAmt,
                    invOsAmt,
                    advAmount,
                    invoiceStatus
                  })
                }
              }
            }
          }
          invAmt = 0
          invOsAmt = 0
          await conn.PaymentInvoiceTxn.bulkCreate(paymentInvArr, {
            transaction: t
          })

          for (const paymentId of paidAmount.keys()) {
            await conn.AdvancePayment.update(
              { appliedAmount: paidAmount.get(paymentId), status: 'PENDING' },
              { where: { paymentId }, transaction: t }
            )
          }
        }
      }

      monthlyContractDtlBulkData =
        [...new Map(monthlyContractDtlBulkData.map(item => [item.monthlyContractDtlId, item])).values()]

      logger.info('Creating monthly Invoices details of monthly contract details in bulk')
      const createBulkMonthlyDtl = await conn.InvoiceDtl.bulkCreate(monthlyContractDtlBulkData, { transaction: t })
      if (!createBulkMonthlyDtl) {
        logger.info('Failed to create monthly invoice data')
        return {
          status: statusCodeConstants.ERROR,
          message: 'Invoice creation failed!!'
        }
      }

      const previousBalance = await conn.Invoice.findAll({
        attributes: [[conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invOsAmount'], 'customerUuid', 'contractId'],
        where: {
          invoiceStatus: 'OPEN',
          billingStatus: 'BILLED'
        },
        group: ['customer_uuid', 'contract_id'],
        transaction: t
      })

      for (const key of invoiceUpdateArr.keys()) {
        await conn.Invoice.update(invoiceUpdateArr.get(key), {
          where: { invoiceId: key }, transaction: t
        })

        const invoice = await conn.Invoice.findOne({ where: { invoiceId: key }, transaction: t })
        previousBalance.filter(async (e) => {
          if (e.contractId === invoice.contractId) {
            await conn.Invoice.update({ prevBalance: e.dataValues.invOsAmount }, { where: { invoiceId: key }, transaction: t })
          }
        })
      }
      logger.info('Updating monthly contract and monthly contract details')
      const monthlyUpdatedata = {
        status: 'PENDING',
        billMonth: new Date().getMonth() + 1,
        billYear: new Date().getFullYear(),
        billCycle: process.invoiceCycleNo
      }

      await conn.MonthlyContractDtl.update(monthlyUpdatedata, {
        where: { monthlyContractId: contractIds }, transaction: t
      })
      await conn.MonthlyContract.update(monthlyUpdatedata, {
        where: { monthlyContractId: contractIds }, transaction: t
      })
      // }

      logger.info('Looking for regenerated monthly contracts')

      const noOfContracts = await conn.MonthlyContract.count({ where: { status: 'PENDING' }, transaction: t, logging: true })
      const updateProcessedData = {
        totalProcessed: noOfContracts,
        successCount: noOfContracts
      }
      logger.info('Updating monthly contract with Sucess and faiilure counts')
      const updatePorcess = await conn.InvoiceProcessed.update(updateProcessedData, {
        where: {
          processId: process.processId
        },
        transaction: t
      })
      if (!updatePorcess) {
        logger.debug('Failed to update Process')
        return {
          status: statusCodeConstants.ERROR,
          message: 'Failed to update Process'
        }
      }

      logger.info('Find Processed Invoice')
      const updatedintialProcess = await conn.InvoiceProcessed.findOne({
        include: [{ model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] }],
        where: {
          processId: process.processId
        },
        transaction: t
      })
      await t.commit()
      logger.debug('Invoice created successfully')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Invoice created successfully',
        data: updatedintialProcess
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while creating invoice'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
      if (t2 && !t2.finished) {
        await t2.rollback()
      }
    }
  }

  async getInvoiceById(invoiceData, userId, conn) {
    try {
      const { invoiceId } = invoiceData
      if (!invoiceId) {
        logger.debug('Invoice ID not found')
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'No Invoice details found'
        }
      }
      const response = await invoiceQuery(invoiceId, conn)

      const responseData = invoiceTransform.invoicePDFdata(response) // servicesData
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Invoice details fetched Sucessfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while creating invoice'
      }
    }
  }

  async paymentHistory(body, params, userId, conn) {
    try {
      const { customerUuid, serviceUuid, accountUuid } = body
      const paymentHistory = await conn.Invoice.findAll({
        include: [{ model: conn.CustServices, attributes: ['serviceName'], as: 'paymentHistory' }],
        where: { customerUuid, serviceUuid, accountUuid, invoiceStatus:"CLOSED" }
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Payment History fetched Sucessfully',
        data: paymentHistory
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error while Fetching Payment history'
      }
    }
  }
}

const invoiceTransformation = (item, oneInvoceOfBills, contract) => {
  const data = {
    customerUuid: oneInvoceOfBills?.rows?.[0]?.customerUuid || '',
    accountUuid: oneInvoceOfBills?.rows?.[0]?.accountUuid || '',
    customerId: oneInvoceOfBills?.rows[0]?.customerId,
    billRefNo: oneInvoceOfBills?.rows[0]?.billRefNo,
    invStartDate: contract.startDate,
    invEndDate: contract.endDate,
    invDate: new Date(),
    dueDate: endOfMonth(
      new Date(new Date().setMonth(new Date(contract.endDate).getMonth() + 0))
    ),
    // invOsAmt: item.finalAmount > 0 ? item.finalAmount : 0,
    // invAmt: item.totalInvoice,
    invOsAmt: null,
    einvAmt: null,
    billingStatus: 'PENDING',
    invoiceStatus: 'OPEN',
    billMonth: new Date().getMonth() + 1,
    billYear: new Date().getFullYear(),
    contractId: contract.contractId,
    monthlyContractId: contract.monthlyContractId
  }
  return data
}

const invoiceDtlTransformation = (item, generateInvoice, contract) => {
  const data = {
    invoiceId: generateInvoice.invoiceId,
    billRefNo: item,
    connectionId: contract.connectionId,
    contractId: contract.contractId,
    invStartDate: contract.actualStartDate,
    invEndDate: contract.actualEndDate,
    invDate: generateInvoice.invDate,
    dueDate: null,
    chargeId: contract.chargeId,
    chargeCategory: contract?.chargeType,
    // invOsAmt: Number(contract.rcAmount) || 0 + Number(contract.otcAmount) || 0 +
    // Number(contract.usageAmount) || 0 + Number(contract.debitAdjAmount) || 0 - Number(contract.creditAdjAmount) || 0,
    // invAmt: Number(contract.rcAmount) || 0 + Number(contract.otcAmount) || 0 +
    // Number(contract.usageAmount) || 0 + Number(contract.debitAdjAmount) || 0 - Number(contract.creditAdjAmount) || 0,
    invOsAmt: null,
    invAmt: null,
    billingStatus: 'PENDING',
    invoiceStatus: 'OPEN',
    monthlyContractDtlId: contract.monthlyContractDtlId,
    contractDtlId: contract.contractDtlId,
    creditAdj: contract.creditAdjAmount === null ? 0 : Number(contract.creditAdjAmount),
    debitAdj: contract.debitAdjAmount === null ? 0 : Number(contract.debitAdjAmount),
    chargeName: contract.chargeName
    // chargeType: contract.chargeType
  }
  return data
}

const queryData = async (type, conn) => {
  const query = `with t1 as(        
    select mc.bill_ref_no, mc.customer_uuid, mc.contract_id, mc.next_bill_period as next_bill_period ,mc.status as status, mc.monthly_contract_id 
    from monthly_contract_hdr mc 
    where mc.status not in ('BILLED') ),
    t2 as( select count(*) as cnt,max(process_id) as process_id from invoice_processed ),
    t3 as( select 0 as invoice_cycle_no, 0 as invoice_regen_cnt,process_id  from t2 where t2.cnt =0
    union
    select invoice_cycle_no, invoice_regen_cnt, ip.process_id
    from invoice_processed ip, t2 where ip.process_id =(select max(process_id) from invoice_processed) and t2.cnt > 0 )
  select t1.*,t3.* from t1,t3`
  let billRefNos = await conn.sequelize.query(query, { type: QueryTypes.SELECT })
  billRefNos = camelCaseConversion(billRefNos)
  return billRefNos
}

const invoiceQuery = async (invoiceId, conn) => {
  const invoiceData = await conn.Invoice.findOne({
    attributes: ['invoiceId', 'invNo', 'billRefNo', 'invStartDate', 'invEndDate', 'invDate', 'dueDate', 'invAmt', 'advAmount', 'prevBalance',
      'invOsAmt', /* 'soNumber', */ 'contractId'],
    include: [{ model: conn.InvoiceDtl, as: 'invoiceDetails' },
    {
      model: conn.CustAccounts,
      as: 'accountDetail',
      attributes: ['firstName', 'lastName'],
      include: [
        {
          model: conn.Address,
          as: 'accountAddress'
          // attributes: ['hno', 'block', 'buildingName', 'street', 'road', 'city', 'town', 'state',
          //   'district', 'country', 'postCode']
        },
        { model: conn.CustServices, as: 'accountServices', attributes: ['planPayload'] }
      ]
    }],
    where: { invoiceId },
    raw: true,
    nest: true
  })
  // const outStanding = await conn.Invoice.findAll({
  //   attributes: [[conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invOsAmtTotal']],
  //   where: { billRefNo: invoiceData.billRefNo, contractId: invoiceData.contractId, invoiceStatus: 'OPEN' },
  //   raw: true,
  //   nest: true
  // })
  const invoiceDetails = await conn.InvoiceDtl.findAll({
    attributes: ['serviceId', 'chargeCategory', 'chargeAmt', 'creditAdj', 'debitAdj', /* 'chargeName', */ 'invStartDate',
      'invEndDate', 'invOsAmt', 'invAmt'],
    // include: [
    //   { model: conn.CustServices, as: 'connectionDetails', attributes: ['planPayload'] }
    //   // { model: conn.MonthlyContractDtl, as: 'monthlyContractDet', attributes: ['soNumber'] }
    // ],
    where: { invoiceId },
    raw: true,
    nest: true
  })
  const soNumber = []
  if (invoiceDetails.length > 0) {
    for (const i of invoiceDetails) {
      soNumber.push(i?.monthlyContractDet?.soNumber)
    }
    if (soNumber.length > 0) {
      invoiceData.soNumber = [...new Set(soNumber)].toString()
    }
  }
  const summery = await getSummery(invoiceDetails)
  const allServices = await allServicesQuery(invoiceDetails)
  const result = {
    invoiceData,
    totalOutstanding: (Number(invoiceData.invAmt) || 0) + (Number(invoiceData.prevBalance) || 0),
    summery,
    allServices
  }
  return result
}

const allServicesQuery = async invoiceDetails => {
  logger.debug('Execting to get all services data for Invoice PDF')
  const response = []
  for (const inv of invoiceDetails) {
    // const dataFromTable = await fromServicesTable(inv.connectionDetails.mappingPayload)
    if (inv.chargeCategory === 'CC_RC') {
      inv.monthlyRental = inv.invAmt
      inv.oneTimeCharge = 0
      inv.usageCharge = 0
    } else if (inv.chargeCategory === 'CC_NRC') {
      inv.monthlyRental = 0
      inv.oneTimeCharge = inv.invAmt
      inv.usageCharge = 0
    } else if (inv.chargeCategory === 'CC_USGC') {
      inv.monthlyRental = 0
      inv.oneTimeCharge = 0
      inv.usageCharge = inv.invAmt
    }
    inv.name = inv.chargeName
    // inv.frequency = dataFromTable.frequency
    delete inv.chargeCategory
    delete inv.connectionDetails
    delete inv.connectionId
    delete inv.chargeAmt
    response.push(inv)
  }
  return response
}

const getSummery = async invoiceDetails => {
  let totalRc = 0
  let totalNrc = 0
  let totalUsage = 0
  let totalDebit = 0
  let totalCredit = 0
  let total = 0
  for (const inv of invoiceDetails) {
    totalCredit += Number(inv.creditAdj)
    totalDebit += Number(inv.debitAdj)
  }
  for (const inv of invoiceDetails) {
    if (inv.chargeCategory === 'CC_RC') {
      totalRc += Number(inv.invAmt)
    } else if (inv.chargeCategory === 'CC_USGC') {
      totalUsage += Number(inv.invAmt)
    } else if (inv.chargeCategory === 'CC_NRC') {
      totalNrc += Number(inv.invAmt)
    }
  }
  total = totalRc + totalNrc + totalUsage + totalDebit - totalCredit
  const summery = {
    monthlyRental: totalRc,
    oneTimeCharge: totalNrc,
    usageCharge: totalUsage,
    debitAdjustment: totalDebit,
    creditAdjustment: totalCredit,
    total
  }
  return summery
}

module.exports = CatalogService
