import { logger, statusCodeConstants, defaultMessage, businessEntityCode, defaultStatus, calender, removeDuplicates } from '@utils'
import { Op, QueryTypes } from 'sequelize'
import _, { map, isEmpty } from 'lodash'
import { getMonth, getYear } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

let instance
// const InvoiceGenerator = require('../utils/pdf-Generator')

class BillingService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async getBillingDetails(billdetails, userId, conn) {
    try {
      const { customerUuid, accountUuid } = billdetails

      const whereClause = {}

      if (billdetails && billdetails?.customerUuid) {
        whereClause.customerUuid = customerUuid
      }

      if (billdetails && billdetails?.accountUuid) {
        whereClause.accountUuid = accountUuid
      }

      if (billdetails && billdetails?.status) {
        whereClause.billingStatus = billdetails?.status
      }

      const response = await conn.Billing.findAll({
        attributes: ['billDate', 'invoicePeriod', 'totInvProcessed', 'totSuccess', 'totFailed',
          'totInvAmount', 'totAdvAmt', 'totPreBalAmt', 'totOutstandAmt', 'noOfContracts'],
        where: {
          customerUuid
          // accountUuid
        },
        order: [['billId', 'DESC']]
      })
      // TODO: generate PDF Here

      // const ig = new InvoiceGenerator(response)
      // ig.generate()

      // todo: and upload to Onedrive

      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'There is no Bill Details for you'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: `The prior invoice was for $${response.totInvAmount}. To download the bill, kindly visit this link.`,
        data: response
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getBillMonths(billingDetails, conn) {
    try {
      if (!billingDetails) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { customerUuid, accountUuid, serviceUuid } = billingDetails
      const response = await conn.Billing.findOne({
        attributes: ['billDate'],
        logging: console.log,
        where: {
          customerUuid,
          accountUuid,
          serviceUuid
        },
        order: [['billId', 'DESC']]
      })

      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: `There is no Bill Month for your Account - ${accountUuid}`
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Bill Months Fetched Successfully.',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getCurrentBill(body, query, userId, conn) {
    try {
      if (!body) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { customerUuid, serviceUuid, accountUuid } = body
      const response = await conn.Invoice.findOne({
        attributes: ['dueDate', 'invDate', 'invAmt'],
        logging: console.log,
        where: {
          customerUuid,
          accountUuid,
          serviceUuid
        },
        order: [['invDate', 'DESC']]
      })

      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: `There is no Invoice`
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Invoice Fetched Successfully.',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getPreviousBill(body, query, userId, conn) {
    try {
      if (!body) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { customerUuid, serviceUuid, accountUuid } = body
      const response = await conn.Payment.findAll({
        attributes: ['totalOutstanding', 'dueOutstanding', 'paymentAmount', 'createdAt'],
        logging: console.log,
        where: {
          customerUuid,
          accountUuid,
          serviceUuid
        },
        order: [['createdAt', 'DESC']]
      })

      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: `There is no Previous Bill`
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Previous Bill Fetched Successfully.',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async paymentBill(billdetails, userId, roleId, departmentId, conn) {
    let invoice
    let invoiceDetails
    const selectedInvIds = []
    const invIds = []
    const dtlIds = []
    let paymentAmount = 0
    let payBill = billdetails
    let msg
    let t
    try {
      // start-Payment txt
      logger.info('Pay Bill for the Billable Reference Number of', payBill.customerId)
      if (!payBill) {
        return { status: statusCodeConstants.ERROR, message: defaultMessage.MANDATORY_FIELDS_MISSING }
      }

      // End-Payment txt
      // start - Retrive the all the invoiceid from invoice table for the respective customer by bill ref no
      paymentAmount = Number(payBill.paymentAmount)
      console.log('---paymentAmount', paymentAmount)
      if (paymentAmount >= 0.01) {
        // End - Retrive the all the invoiceid from invoice table for the respective customer by bill ref no
        if (payBill.allocationLevel === 'AUTOALLOC') {
          // console.log('In AUTOALLOC')

          invoice = await conn.Invoice.findAll({
            where: {
              customerId: payBill.customerId,
              invoiceStatus: 'OPEN',
              billingStatus: 'BILLED'
            }
          })

          if (!invoice || invoice.length === 0) {
            msg = 'No outstanding found, amount has been credited as advance and will be adjusted against next invoice'
          } else {
            for (const i of invoice) {
              invIds.push(i.invoiceId)
            }

            // console.log('AUTOALLOC - getting details lines ', invIds)

            invoiceDetails = await conn.InvoiceDtl.findAll({
              include: [
                {
                  model: conn.Charge,
                  as: 'charge'
                },
                {
                  model: conn.Invoice,
                  as: 'invoice'
                }
              ],
              where: {
                invoiceId: invIds,
                invoiceStatus: 'OPEN',
                billingStatus: 'BILLED'
              },
              order: [
                ['invoice', 'dueDate', 'ASC'],
                ['invoice', 'invoiceId', 'ASC'],
                ['invOsAmt', 'ASC']
              ]
            })
          }

          // invIds = invoice.map(inv => _.pick(inv, ['invoiceId', inv.invoiceId]))
          // invIds = _.map(invIds, 'invoiceId')
          // invIds = _.sortBy(invIds)
        } else if (payBill.allocationLevel === 'INV') {
          for (const i of payBill.invoiceId) {
            selectedInvIds.push(i)
          }
          // console.log('invoice---------',invoice)
          invoice = await conn.Invoice.findAll({
            where: {
              customerUuid: payBill.customerUuid,
              invoiceStatus: 'OPEN',
              billingStatus: 'BILLED'
            }
          })
          // console.log('invoice---------',invoice)
          for (const i of invoice) {
            invIds.push(i.invoiceId)
          }

          if (!invoice || invoice.length === 0 || invoice.length < selectedInvIds.length) {
            return { status: statusCodeConstants.ERROR, message: 'No open invoices present for given Bill Reference No' }
          }
          console.log('invIds---------', invIds)
          invoiceDetails = await conn.InvoiceDtl.findAll({
            include: [
              {
                model: conn.Charge,
                as: 'charge'
              },
              {
                model: conn.Invoice,
                as: 'invoice'
              }
            ],
            where: {
              invoiceId: invIds,
              invoiceStatus: 'OPEN',
              billingStatus: 'BILLED'
            },
            order: [
              ['invoice', 'dueDate', 'ASC'],
              ['invoice', 'invoiceId', 'ASC'],
              ['invOsAmt', 'ASC']
            ]
          })
          // console.log('invoiceDetails---------',invoiceDetails)
          if (!invoiceDetails || invoiceDetails.length === 0) {
            return { status: statusCodeConstants.ERROR, message: 'No open charges available' }
          }
        } else if (payBill.allocationLevel === 'INVCHARGE') {
          for (const k in payBill.invoiceChargeIds) {
            if (payBill.invoiceChargeIds.hasOwnProperty(k)) {
              for (const i of payBill.invoiceChargeIds[k]) {
                dtlIds.push(i)
              }
            }
          }

          invoice = await conn.Invoice.findAll({
            where: {
              billRefNo: payBill.billRefNo,
              invoiceStatus: 'OPEN',
              billingStatus: 'BILLED'
            }
          })

          for (const i of invoice) {
            invIds.push(i.invoiceId)
          }

          // console.log(invIds, dtlIds)

          invoice = await conn.Invoice.findAll({
            where: {
              billRefNo: payBill.billRefNo,
              invoiceId: invIds,
              invoiceStatus: 'OPEN',
              billingStatus: 'BILLED'
            }
          })

          if (!invoice || invoice.length === 0 || invIds.length !== invoice.length) {
            return { status: statusCodeConstants.ERROR, message: 'Not all invoices selected are open' }
          }

          invoiceDetails = await conn.InvoiceDtl.findAll({
            include: [
              {
                model: conn.Charge,
                as: 'charge'
              },
              {
                model: conn.Invoice,
                as: 'invoice'
              }
            ],
            where: {
              invoiceId: invIds,
              invoiceStatus: 'OPEN',
              billingStatus: 'BILLED'
            },
            order: [
              ['invoice', 'dueDate', 'ASC'],
              ['invoice', 'invoiceId', 'ASC'],
              ['invOsAmt', 'ASC']
            ]
          })

          // console.log('invoiceDetails', invoiceDetails.length, JSON.stringify(invoiceDetails, null, 2))

          if (!invoiceDetails || invoiceDetails.length < dtlIds.length) {
            return { status: statusCodeConstants.ERROR, message: 'No open charge lines present' }
          }
        } else {
          return { status: statusCodeConstants.ERROR, message: 'Incorrect allocation level' }
        }

        // console.log('invoiceDetails', JSON.stringify(invoiceDetails, null, 2))
        console.log('invoiceDetails.length--------', invoiceDetails.length)
        t = await conn.sequelize.transaction()
        const guid = uuidv4()
        const commonAttrib = {
          tranId: guid,
          createdDeptId: departmentId,
          createdRoleId: roleId,
          createdBy: userId,
          updatedBy: userId
        }
        payBill = {
          ...payBill,
          billRefNo: payBill.customerNo,
          ...commonAttrib
        }
        // console.log('payBill------------',payBill)
        const payment = await conn.Payment.create(payBill, { transaction: t })
        console.log('payment--------', payment)
        if (invoiceDetails && invoiceDetails.length > 0) {
          console.log('selectedInvIds------------', selectedInvIds)
          console.log('dtlIds------------', dtlIds)
          await applyPayment(payBill.allocationLevel, selectedInvIds, dtlIds, payBill.customerUuid, payment.paymentId, invoiceDetails, paymentAmount, userId, roleId, departmentId, conn, t)
        } else {
          const commonAttrib1 = {
            tranId: uuidv4(),
            createdDeptId: departmentId,
            createdRoleId: roleId,
            createdBy: userId,
            updatedBy: userId
          }
          console.log('-------------------------')
          await conn.AdvancePayment.create({
            paymentId: payment.paymentId,
            advanceAmount: paymentAmount,
            advanceBalanceAmount: paymentAmount,
            billRefNo: payBill.billRefNo,
            status: 'OPEN',
            remarks: 'Advance Payment',
            ...commonAttrib1
          },
            {
              transaction: t
            })
        }
        // console.log(aaa)
        await t.commit()

        if (!msg) {
          msg = 'Payment Done Successfully'
        }
        // console.log('invoiceDetails', JSON.stringify(invoiceDetails, null, 2))
        return {
          status: statusCodeConstants.SUCCESS,
          data: invoiceDetails,
          message: msg
        }
      } else {
        return { status: statusCodeConstants.ERROR, message: 'Invalid payment amount' }
      }
    } catch (error) {
      logger.error(error, 'Error while paying bill')
      return { status: statusCodeConstants.ERROR, message: 'Error while paying bill' }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async createPayment(billdetails, userId, roleId, departmentId, conn) {
    let msg
    let t = await conn.sequelize.transaction()

    try {
      // start-Payment txt
      logger.info('Create payment', billdetails.customerId)
      if (!billdetails) {
        return { status: statusCodeConstants.ERROR, message: defaultMessage.MANDATORY_FIELDS_MISSING }
      }
      const guid = uuidv4()

      const commonAttrib = {
        tranId: guid,
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }
      console.log('payload--------->', { ...billdetails, ...commonAttrib })
      const payment = await conn.Payment.create({ ...billdetails, ...commonAttrib }, { transaction: t })

      await t.commit()

      if (payment) {
        msg = 'Payment Done Successfully'
      }

      return {
        status: statusCodeConstants.SUCCESS,
        data: payment,
        message: msg
      }
    } catch (error) {
      logger.error(error, 'Error while paying bill')
      return { status: statusCodeConstants.ERROR, message: 'Error while paying bill' }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async paymentHistory(body, query, userId, conn) {
    try {
      logger.info('Get the payment history details')
      let whereClause = {}
      let customerWhere = {}
      const searchParams = body
      const { limit = 10, page = 0 } = query
      const offSet = (page * limit)
      if (!searchParams) {
        // return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
        return { status: statusCodeConstants.ERROR, message: defaultMessage.MANDATORY_FIELDS_MISSING }
      }
      if (searchParams.customerUuid && searchParams.customerUuid !== '' && searchParams.customerUuid !== undefined) {
        whereClause.customerUuid = searchParams.customerUuid
      }
      if (searchParams.filters && Array.isArray(searchParams.filters) && !isEmpty(searchParams.filters)) {
        let paymentId; let billRefNo; let crmCustomerNo; let firstName; let lastName; let currency
        for (const record of searchParams.filters) {
          if (record.value) {
            if (record.id === 'paymentId') {
              if (record.filter === 'contains') {
                paymentId = {
                  [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Payment.payment_id'), 'varchar'), { [Op.like]: `%${record.value}%` })]
                }
              } else {
                paymentId = {
                  [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Payment.payment_id'), 'varchar'), { [Op.notLike]: `%${record.value}%` })]
                }
              }
            } else if (record.id === 'billRefNo') {
              if (record.filter === 'contains') {
                billRefNo = {
                  [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Payment.bill_ref_no'), 'varchar'), { [Op.like]: `%${record.value}%` })]
                }
              } else {
                billRefNo = {
                  [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Payment.bill_ref_no'), 'varchar'), { [Op.notLike]: `%${record.value}%` })]
                }
              }
            } else if (record.id === 'currency') {
              if (record.filter === 'contains') {
                currency = {
                  [Op.and]: [conn.sequelize.where(conn.sequelize.col('Payment.currency'), { [Op.like]: `%${record.value}%` })]
                }
              } else {
                currency = {
                  [Op.and]: [conn.sequelize.where(conn.sequelize.col('Payment.currency'), { [Op.notLike]: `%${record.value}%` })]
                }
              }
            } else if (record.id === 'customerNumber') {
              if (record.filter === 'contains') {
                crmCustomerNo = {
                  [Op.like]: `%${record.value}%`
                }
              } else {
                crmCustomerNo = {
                  [Op.notLike]: `%${record.value}%`
                }
              }
            } else if (record.id === 'customerName') {
              if (record.filter === 'contains') {
                firstName = {
                  [Op.like]: `%${record.value}%`
                }
                lastName = {
                  [Op.like]: `%${record.value}%`
                }
              } else {
                firstName = {
                  [Op.notLike]: `%${record.value}%`
                }
                lastName = {
                  [Op.notLike]: `%${record.value}%`
                }
              }
            }
          }
        }
        if (paymentId && billRefNo && currency) {
          whereClause = { paymentId, billRefNo, currency }
        } else if (billRefNo && !paymentId && !currency) {
          whereClause = { billRefNo }
        } else if (paymentId && !billRefNo && !currency) {
          whereClause = { paymentId }
        } else if (currency && !paymentId && !billRefNo) {
          whereClause = { currency }
        } else if (paymentId && billRefNo && !currency) {
          whereClause = { paymentId, billRefNo }
        } else if (paymentId && !billRefNo && currency) {
          whereClause = { paymentId, currency }
        } else if (billRefNo && paymentId && !currency) {
          whereClause = { billRefNo, paymentId }
        } else if (billRefNo && !paymentId && currency) {
          whereClause = { billRefNo, currency }
        } else if (currency && paymentId && !billRefNo) {
          whereClause = { paymentId, currency }
        } else if (currency && !paymentId && billRefNo) {
          whereClause = { billRefNo, currency }
        }

        if (crmCustomerNo && firstName) {
          customerWhere = { crmCustomerNo, firstName, lastName }
        } else if (crmCustomerNo && !firstName) {
          customerWhere = { crmCustomerNo }
        } else if (firstName && !crmCustomerNo) {
          customerWhere = { firstName, lastName }
        }
      }
      const paymentHistory = await conn.Payment.findAndCountAll({
        include: [
          {
            model: conn.Customer,
            attributes: ['firstName', 'lastName', 'customerNo']
            // as: 'customerDetails',
          },
          {
            model: conn.User,
            as: 'createdByName',
            required: true,
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.CustServices,
            attributes: ['serviceName'],
            as: 'servicePayments'
          },
          {
            model: conn.User,
            as: 'updatedByName',
            required: true,
            attributes: ['firstName', 'lastName']
          },
          { model: conn.BusinessEntity, as: 'currencyDesc', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'paymentModeDesc', attributes: ['description'] }
        ],
        distinct: true,
        where: whereClause,
        order: [['paymentId', 'DESC']],
        offset: offSet,
        limit: Number(limit)
      })
      logger.debug('Successfully fetch payment history details')
      return {
        status: statusCodeConstants.SUCCESS,
        data: paymentHistory,
        message: defaultMessage.SUCCESS
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return { status: statusCodeConstants.ERROR, message: 'Error while get the payment History details' }
    }
  }

  async getLookUpData(userId, conn) {
    try {
      const billPeriod = await conn.BusinessEntity.findAll({
        attributes: ['code', 'description', 'codeType'],
        where: {
          codeType: businessEntityCode.BILL_PERIOD,
          status: defaultStatus.ACTIVE
        },
        order: [['description', 'ASC']]
      })

      const contracts = await conn.MonthlyContract.findAll({
        attributes: ['billYear', 'billMonth', 'billCycle'],
        where: {
          status: businessEntityCode.BILLED
        },
        order: [['contractId', 'ASC']]
      })

      let billYear = map(contracts, 'billYear')
      billYear = _.uniq(billYear)
      billYear = billYear.filter(Boolean)
      contracts.sort((a, b) => (a.billMonth > b.billMonth ? 1 : -1))
      const billCycle = []
      for (const year of billYear) {
        let cycle = []
        // let billCycleMonth
        for (const con of contracts) {
          if (year === con.billYear) {
            //   if (billCycleMonth !== con.billMonth) {
            cycle.push({ [con.billMonth]: con.billCycle })
            // billCycleMonth = con.billMonth
            //    }
          }
        }
        cycle = removeDuplicates(cycle)
        billCycle.push({ [year]: cycle })
      }

      let billingCycle = []
      contracts.forEach(element => {
        if (element && element?.billCycle && !billingCycle.includes(element.billCycle)) {
          billingCycle.push(element.billCycle)
        }
      })
      billingCycle = billingCycle.sort((a, b) => (a < b ? 1 : -1))

      // const options = [{ month: 'Jan', value: '1' }, { month: 'Feb', value: '2' }, { month: 'Mar', value: '3' },
      //   { month: 'Apr', value: '4' }, { month: 'May', value: '5' }, { month: 'Jun', value: '6' },
      //   { month: 'July', value: '7' }, { month: 'Aug', value: '8' }, { month: 'Sep', value: '9' },
      //   { month: 'Otc', value: '10' }, { month: 'Nov', value: '11' }, { month: 'Dec', value: '12' }]

      const monthsCycle = await conn.MonthlyContract.findAll({
        attributes: ['billCycle'],
        order: [['createdAt', 'DESC']],
        limit: 6
      })
      const sixMonthsCycle = []
      if (monthsCycle && monthsCycle.length > 0) {
        for (const cycle of monthsCycle) {
          if (cycle.billCycle) {
            sixMonthsCycle.push(cycle.billCycle)
          }
          // if(cycle?.billCycle !== null)
          // {
          //   sixMonthsCycle.push(cycle?.billCycle)
          // }
        }
      }

      // console.log(sixMonthsCycle)
      const response = {
        billingCycle,
        billPeriod,
        billYear,
        calender,
        billCycle,
        sixMonthsCycle
      }
      return {
        status: statusCodeConstants.SUCCESS,
        data: response,
        message: 'Successfully fetched lookup data'
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return { status: statusCodeConstants.ERROR, message: 'Error while fetching lookup data' }
    }
  }

  async getCurrentBillCycle(billdetails, userId, conn) {
    try {
      logger.info('Fetching current bill cycle data')
      const montracts = await conn.sequelize.query('select max(coalesce(bill_cycle,0)) as bill_cycle from billing', {
        type: QueryTypes.SELECT
      })

      const response = {}
      if (!isEmpty(montracts)) {
        response.year = getYear(new Date())
        response.month = getMonth(new Date())
        response.cycle = montracts[0].bill_cycle + 1 || 0
      }

      logger.debug('Successfully fetched current bill cycle  data')
      return {
        status: statusCodeConstants.SUCCESS,
        data: response,
        message: 'Successfully fetched current bill cycle data'
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return { status: statusCodeConstants.ERROR, message: 'Error while fetching current bill cycle data' }
    }
  }
}

export const applyPayment = async (allocationLevel, selectedInvs, invChrgDtls, customerUuid, paymentId, invoiceDtls, paymentAmount, userId, roleId, departmentId, conn, t) => {
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
          if (d.invoiceId === i && d.chargeCategory === 'CC_RC') {
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

            if (d.invoiceId === i && d.chargeCategory === 'CC_NRC') {
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
                d.chargeCategory === 'CC_USGC')
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
        if (d.invoiceId === i && d.chargeCategory === 'CC_RC') {
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

          if (d.invoiceId === i && d.chargeCategory === 'CC_NRC') {
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
              d.chargeCategory === 'CC_USGC')
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
  console.log('invDtlUpdates', invDtlUpdates)
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
      const commonAttrib2 = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }
      data = {
        invoiceId: r.invoiceId,
        invoiceDtlId: r.invoiceDtlId,
        paymentId: r.paymentId,
        paymentAmount: r.paidAmount,
        invOsAmt: r.invOsAmt,
        customerUuid,
        status: 'CLOSED',
        ...commonAttrib2
      }
      console.log('data-----------------------', data)
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
      const commonAttrib2 = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }
      data = {
        invoiceId: r.invoiceId,
        invoiceDtlId: r.invoiceDtlId,
        paymentId: r.paymentId,
        paymentAmount: r.paidAmount,
        invOsAmt: r.invOsAmt,
        customerUuid,
        status: 'OPEN',
        ...commonAttrib2
      }
      console.log('data-----------------------', data)
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
  console.log('runningPaymentAmt', runningPaymentAmt)
  if (runningPaymentAmt >= 0.01) {
    const commonAttrib1 = {
      tranId: uuidv4(),
      createdDeptId: departmentId,
      createdRoleId: roleId,
      createdBy: userId,
      updatedBy: userId
    }
    console.log('h----------------------------------------')
    await conn.AdvancePayment.create(
      {
        paymentId,
        advanceAmount: runningPaymentAmt,
        advanceBalanceAmount: runningPaymentAmt,
        customerUuid,
        status: 'OPEN',
        remarks: 'Advance Payment',
        ...commonAttrib1
      },
      {
        transaction: t
      }
    )
  }
}

module.exports = BillingService
