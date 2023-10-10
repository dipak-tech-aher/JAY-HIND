import {
  defaultMessage, logger, NEGATIVE_INTXN_TYPES, NEUTRAL_INTXN_TYPES,
  POSITIVE_INTXN_TYPES, statusCodeConstants, constantCode, DateDifference, camelCaseConversion
} from '@utils'
import { each, get, isEmpty, subtract } from 'lodash'
import { QueryTypes, Op } from 'sequelize'
import { config } from '@config/env.config'
import IntelligenceResource from '@resources'

const { v4: uuidv4 } = require('uuid')
const emoji = require('node-emoji')
const moment = require('moment')
const { systemUserId, chatCount, chatRoleId, userLoginAttempts, DomainURL, systemDeptId, systemRoleId } = config
const _ = require('lodash')
let instance

class IntelligenceCornerService {
  constructor(conn) {
    if (!instance) {
      instance = this
    }
    instance.conn = conn
    return instance
  }

  async getCustomerCalendarEvents(payload, userId) {
    try {
      const { customerUuid } = payload
      const customer = await this.conn.Customer.findOne({ where: { customerUuid } })
      if (customer) {
        const customerHistory = await this.conn.CustomerHistory.findOne({ where: { customerUuid, status: 'CS_ACTIVE' } })
        let services = await this.conn.CustServices.findAll({ where: { customerId: customer.customerId } })
        let customerContracts = await this.conn.ContractHdr.findAll({
          where: { customerId: customer.customerId },
          include: [
            { model: this.conn.CustServices, as: 'customerServiceContract' }
          ]
        })
        const customerMonthlyContracts = await this.conn.MonthlyContract.findAll({
          where: { customerUuid, status: 'SCHEDULED' }
        })

        const events = []
        const businessEntityInfo = await this.conn.BusinessEntity.findAll()

        const newDate = new Date()
        const birthDateFull = new Date(customer.birthDate)
        const currentYear = newDate.getFullYear()
        const birthMonth = birthDateFull.getMonth()
        const birthDate = birthDateFull.getDate()

        const birthDay = this.eventObject({
          title: `Happy BirthDay ${emoji.get('partying_face')} ${emoji.get('cake')}.`,
          start: `${currentYear}-${birthMonth}-${birthDate}`,
          end: `${currentYear}-${birthMonth}-${birthDate}`,
          eventCat: 'POSITIVE'
        })

        events.push({ ...birthDay, allDay: true })

        if (customerHistory) {
          const customerActivated = this.eventObject({
            title: `Happy to have you as active customer today ${emoji.get('partying_face')}.`,
            start: customerHistory.createdAt,
            end: customerHistory.createdAt,
            eventCat: 'POSITIVE'
          })
          events.push({ ...customerActivated, allDay: true })
        }

        // Transform Service
        services = IntelligenceResource.transformServiceEvents(services, businessEntityInfo)
        services.forEach(service => {
          events.push({
            ...this.eventObject({
              title: `Hey! your service got activated today ${service.serviceName}.`,
              start: service.activationDate,
              end: service.activationDate,
              eventCat: 'POSITIVE'
            }),
            allDay: true,
            extendedProps: service
          })

          events.push({
            ...this.eventObject({
              title: `Oops! your service getting expire today ${service.serviceName}.`,
              start: service.expiryDate,
              end: service.expiryDate,
              eventCat: 'NEGATIVE'
            }),
            allDay: true,
            extendedProps: service
          })
        })

        customerContracts = IntelligenceResource.transformContractEvents(customerContracts, businessEntityInfo)
        customerContracts.forEach(customerContract => {
          if (customerContract.serviceName) {
            events.push({
              ...this.eventObject({
                title: `Your contract starts today for ${customerContract.serviceName}`,
                start: customerContract.actualStartDate,
                end: customerContract.actualStartDate,
                eventCat: 'POSITIVE',
                extendedProps: customerContract
              })
            })

            events.push({
              ...this.eventObject({
                title: `Your contract ends today for ${customerContract.serviceName}`,
                start: customerContract.actualEndDate,
                end: customerContract.actualEndDate,
                eventCat: 'NEGATIVE',
                extendedProps: customerContract
              })
            })
          }
        })

        customerMonthlyContracts.forEach(customerContract => {
          events.push({
            ...this.eventObject({
              title: `Bill Date for ${customerContract.contractName}`,
              start: customerContract.nextBillPeriod,
              end: customerContract.nextBillPeriod,
              eventCat: 'POSITIVE',
              extendedProps: customerContract
            })
          })

          events.push({
            ...this.eventObject({
              title: `Payment Date for ${customerContract.contractName}`,
              start: moment(new Date(customerContract.nextBillPeriod)).add(config.paymentConfigurationDate, 'day'),
              end: moment(new Date(customerContract.nextBillPeriod)).add(config.paymentConfigurationDate, 'day'),
              eventCat: 'POSITIVE',
              extendedProps: customerContract
            })
          })
        })

        // Interaction

        let customerInteraction = await this.conn.Interaction.findAll({
          where: {
            customerId: customer?.customerId
          }
        })
        customerInteraction = IntelligenceResource.transformInteractionEvents(customerInteraction, businessEntityInfo)

        if (customerInteraction && Array.isArray(customerInteraction) && customerInteraction.length > 0) {
          customerInteraction.forEach(interaction => {
            events.push({
              ...this.eventObject({
                title: `#${interaction.intxnNo} - ${interaction.requestStatement}`,
                start: interaction.createdAt,
                end: interaction.createdAt,
                eventCat: 'POSITIVE',
                extendedProps: interaction
              })
            })
          })
        }

        // Order

        let customerOrder = await this.conn.Orders.findAll({
          include: [
            {
              model: this.conn.OrdersDetails,
              as: 'orderProductDtls',
              include: {
                model: this.conn.Product,
                as: 'productDetails',
                attributes: [
                  'productUuid', 'productId', 'productNo', 'status', 'productImage',
                  'productName', 'productFamily', 'productCategory', 'productSubCategory', 'provisioningType',
                  'productType', 'serviceType', 'chargeType', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'
                ]
              }
            }
          ],
          where: {
            customerId: customer?.customerId,
            parentFlag: 'N'
          }
        })
        customerOrder = IntelligenceResource.transformOrderEvents(customerOrder, businessEntityInfo)
        if (customerOrder && Array.isArray(customerOrder) && customerOrder.length > 0) {
          customerOrder.forEach(order => {
            events.push({
              ...this.eventObject({
                title: `#${order.orderNo}`,
                start: order.createdAt,
                end: order.createdAt,
                eventCat: 'POSITIVE',
                extendedProps: order
              })
            })
          })
        }

        // invoice

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Customer events fetched',
          data: events
        }
      }

      return {
        status: statusCodeConstants.NOT_FOUND,
        message: 'Customer not found'
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching customer details'
      }
    }
  }

  eventObject({ title, start, end, description, eventCat, extendedProps = {} }) {
    const eventType = {
      POSITIVE: {
        backgroundColor: '#14A44D', borderColor: '#14A44D', textColor: '#FBFBFB'
      },
      BELOW_POSITIVE: {
        backgroundColor: '#3B71CA', borderColor: '#3B71CA', textColor: '#FBFBFB'
      },
      NEUTRAL: {
        backgroundColor: '#9FA6B2', borderColor: '#9FA6B2', textColor: '#FBFBFB'
      },
      BELOW_NEUTRAL: {
        backgroundColor: '#E4A11B', borderColor: '#E4A11B', textColor: '#FBFBFB'
      },
      NEGATIVE: {
        backgroundColor: '#DC4C64', borderColor: '#DC4C64', textColor: '#FBFBFB'
      }
    }
    return {
      id: uuidv4(),
      title,
      start,
      end,
      extendedProps,
      description,
      ...eventType[eventCat]
    }
  }

  async getBillInfoEx(customerUuid, billMonth, conn) {
    try {
      let whereClause = 'where i.invoice_status not in (\'CLOSED\') '
      if (!billMonth) {
        whereClause += `and b.customer_uuid ='${customerUuid}' `
      } else {
        whereClause += `and b.customer_uuid ='${customerUuid}' and b.bill_month ='${billMonth}'`
      }
      const getBillQuery = `select b.tot_adv_amt,b.bill_id,i.invoice_id,b.bill_month,b.bill_year ,i.invoice_status ,i.billing_status,b.bill_date,b.tot_inv_amount,b.tot_outstand_amt, c.contract_name, c.rc_amount, c.otc_amount, c.usage_amount, c.credit_adj_amount, c.debit_adj_amount from billing b left join invoice i on cast(i.bill_ref_no AS VARCHAR)  =cast(b.bill_id AS VARCHAR) left join contract_hdr c on c.contract_id =i.contract_id ${whereClause}`
      console.log('getBillQuery------>', getBillQuery)
      const response = await conn.sequelize.query(getBillQuery, {
        type: QueryTypes.SELECT,
        bind: {
          customerUuid,
          billMonth
        },
        raw: true
      })

      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'There is no Bill Info for your Account'
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

  async getBillMonths(customerUuid, conn) {
    try {
      const whereClause = `where i.billing_status='PENDING' and i.customer_uuid ='${customerUuid}' `

      const getBillQuery = `select i.bill_month,i.bill_year ,i.invoice_status  from invoice i ${whereClause}`

      const response = await conn.sequelize.query(getBillQuery, {
        type: QueryTypes.SELECT,
        raw: true
      })
      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'There is no Bill Months for your Account'
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

  async getBillInfo(customerUuid, billMonth, conn) {
    try {
      const whereClauseCalculation = {
        billingStatus: 'PENDING',
        customerUuid
      }

      const whereClause = {
        invoiceStatus: 'OPEN',
        billingStatus: 'BILLED',
        customerUuid
      }

      if (billMonth) {
        whereClause.billMonth = billMonth
        whereClauseCalculation.billMonth = billMonth
      }

      const coutntableDatas = await conn.Invoice.findAndCountAll({
        attributes: [
          [conn.sequelize.fn('sum', conn.sequelize.col('adv_amount')), 'advanceTotal'],
          [conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invOsAmtTotal'],
          [conn.sequelize.fn('sum', conn.sequelize.col('inv_amt')), 'invAmtTotal']
        ],
        where: whereClauseCalculation,
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
        where: whereClause,
        raw: true
      })
      coutntableDatas.rows[0].PreviousBalance = Number(sumOfPrevious[0].invAmtTotal) || 0
      coutntableDatas.rows[0].totalOutstanding = (Number(coutntableDatas.rows[0].invOsAmtTotal) -
        Number(coutntableDatas.rows[0].advanceTotal) || 0) <= 0
        ? 0
        : (Number(coutntableDatas.rows[0].invOsAmtTotal) -
          Number(coutntableDatas.rows[0].advanceTotal)) + Number(sumOfPrevious[0].invAmtTotal) || 0
      logger.debug('Successfully fetch Invoice counts')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch Invoice counts',
        data: coutntableDatas
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getEvents(payload, userId) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { customerUuid } = payload
      // todo: Need to check birthDay
      let checkExistingCustomer = await this.conn.Customer.findOne({
        attributes: ['birthDate'],
        where: {
          customerUuid
        }
      })

      if (!checkExistingCustomer) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `The customer details are not available for the provided Id - ${customerUuid}`
        }
      }
      checkExistingCustomer = checkExistingCustomer?.dataValues ? checkExistingCustomer.dataValues : checkExistingCustomer
      const data = []

      // Checking BirthDay
      const checkBirthDate = await getBirthDate(checkExistingCustomer)
      if (checkBirthDate) {
        data.push({
          type: 'BirthDay',
          message: checkBirthDate?.message || null,
          data: checkBirthDate?.data || []
        })
      }
      // CHecking customer Emotion
      const CustomerEmotion = await checkCustomerEmotion(customerUuid, this.conn)
      if (CustomerEmotion) {
        data.push({
          type: 'CustomerEmotion',
          message: CustomerEmotion?.message || null,
          data: CustomerEmotion?.data || []
        })
      }

      const getServiceExpiryDetails = await checkCustomerServiceExpiry(customerUuid, this.conn)
      data.push({
        type: 'ServiceExpiry',
        message: 'We have some exciting plans specially for you',
        data: getServiceExpiryDetails
      })

      // const popularProductPlan = await checkPopularPlan(customerUuid, this.conn)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Event details fetched Successfully',
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

  async predictInteractionSolution(searchParam) {
    const { conversationUid } = searchParam
    if (!conversationUid) {
      return {
        status: statusCodeConstants.VALIDATION_ERROR,
        message: defaultMessage.MANDATORY_FIELDS_MISSING
      }
    }
    const metaData = searchParam

    const checkExistingConversation = await this.conn.smartAssist.findOne({
      where: {
        smartAssistConversationId: metaData?.conversationUid,
        conversationActionType: 'INTIAL_CONFIG'
      }
    })

    // const intxnDetails = await this.conn.KnowledgeBase.findOne({ where: { requestId } })
    let response
    const smartAssistValue = checkExistingConversation?.smartAssistValue
    const { intxnCategory, intxnType } = smartAssistValue

    if (intxnCategory === 'BILLING_RELATED' && intxnType === 'APPEALS') {
      response = await this.billingRelatedSolution(smartAssistValue)
    } else if (intxnCategory === 'SERVICE_RELATED' && intxnType === 'APPEALS') {
      response = await this.serviceDataRelatedSolution(smartAssistValue)
    } else if (intxnCategory === 'DELIVERY_RELATED' && intxnType === 'REQUEST') {
      response = await this.deliveryRelatedIntelegenceSolution(smartAssistValue)
    } else if (intxnCategory === 'SERVICE_RELATED' && (intxnType === 'RECOMMENDATION' || intxnType === 'SUGGESTION')) {
      response = await this.serviceRelatedIntelegenceSolution(smartAssistValue)
    }

    // switch (intxnCategory) {
    //   case 'PRODUCT_RELATED':
    //     response = await this.productRelatedSolution(smartAssistValue)
    //     break
    //   case 'OFFERS_RELATED':
    //     response = await this.offersRelatedSolution(smartAssistValue)
    //     break
    //   case 'CONTRACT_RELATED':
    //     response = await this.contractRelatedSolution(smartAssistValue)
    //     break
    //   case 'ACCOUNT_RELATED':
    //     response = await this.accountRelatedSolution(smartAssistValue)
    //     break
    //   case 'SERVICE_RELATED':
    //     response = await this.serviceRelatedSolution(smartAssistValue)
    //     break
    //   case 'BILLING_RELATED':
    //     response = await this.billingRelatedSolution(smartAssistValue)
    //     break
    //   case 'DELIVERY_RELATED':
    //     response = await this.deliveryRelatedSolution(smartAssistValue)
    //     break
    //   case 'SUPPORT_RELATED':
    //     response = await this.supportRelatedSolution(smartAssistValue)
    //     break
    //   case 'PAYMENT_RELATED':
    //     response = await this.paymentRelatedSolution(smartAssistValue)
    //     break
    //   case 'APPOINTMENT_RELATED':
    //     response = await this.appointmentRelatedSolution(smartAssistValue)
    //     break
    //   case 'NOTIFICATION_RELATED':
    //     response = await this.notificationRelatedSolution(smartAssistValue)
    //     break
    //   case 'FAULT_RELATED':
    //     response = await this.faultRelatedSolution(smartAssistValue)
    //     break
    //   case 'ACCESS_RELATED':
    //     response = await this.accessRelatedSolution(smartAssistValue)
    //     break
    //   default:
    //     response = { status: false, message: 'Category not in the list' }
    // }
    return response
  }

  async serviceDataRelatedSolution(intxnDetails) {
    try {
      const { serviceUuid } = intxnDetails

      let serviceData = await this.conn.CustServices.findOne({
        where: {
          serviceUuid
        }
      })
      serviceData = serviceData?.dataValues ? serviceData?.dataValues : serviceData
      if (serviceData?.serviceUsage >= serviceData?.serviceLimit) {
        serviceData.consumptionStatus = 'exceeded'
      } else {
        serviceData.consumptionStatus = 'normal'
      }
      const formattedService = formatServiceConsumptionDetails(serviceData, null)
      console.log('formattedService', formattedService)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: formattedService
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async getServicesCount(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      const smartAssistValue = checkExistingConversation.smartAssistValue
      console.log('smartAssistValue', smartAssistValue)
      const { serviceUuid } = smartAssistValue

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const response = await this.conn.CustServices.count({
        where: {
          serviceUuid
        }
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service details fetched Successfully',
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

  async getAccountStatus(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      const smartAssistValue = checkExistingConversation.smartAssistValue
      console.log('smartAssistValue', smartAssistValue)
      const { accountUuid } = smartAssistValue

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      let response = await this.conn.CustAccounts.findOne({
        attributes: ['status'],
        where: {
          accountUuid
        }
      })
      response = response?.dataValues ? response?.dataValues : response
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Account status fetched Successfully',
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

  async getOrders(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      const smartAssistValue = checkExistingConversation.smartAssistValue
      console.log('smartAssistValue', smartAssistValue)
      const { serviceUuid } = smartAssistValue

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      let response = await this.conn.CustServices.findOne({
        where: {
          serviceUuid
        }
      })
      response = response?.dataValues ? response?.dataValues : response
      console.log('response----', response)
      let responseOrderData = await this.conn.Orders.findOne({
        where: {
          accountId: response?.accountId
        }
      })
      responseOrderData = responseOrderData?.dataValues ? responseOrderData?.dataValues : responseOrderData

      console.log('responseOrderData------>', responseOrderData)
      const orderData = await this.conn.Orders.findOne({
        where: {
          orderNo: responseOrderData.orderNo.split('_')[0]
        }
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Account status fetched Successfully',
        data: orderData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getServicesStatus(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      console.log('checkExistingConversation-------->', checkExistingConversation)
      const smartAssistValue = checkExistingConversation.smartAssistValue
      console.log('smartAssistValue------', smartAssistValue)
      const { serviceUuid } = smartAssistValue

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      let response = await this.conn.CustServices.findOne({
        include: [
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceTypeDesc'
          }, {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceStatusDesc'
          }],
        where: {
          serviceUuid
        }
      })
      response = response?.dataValues ? response?.dataValues : response
      const currentDate = new Date()

      // Create a new Date object with the expiration date
      const expirationDate = new Date(response?.expiryDate)
      console.log('expirationDate----->', expirationDate)
      // Compare the current date to the expiration date
      if (currentDate.getTime() > expirationDate.getTime()) {
        console.log('The expiration date has passed.')
        response.isExpired = 'Y'
      } else {
        console.log('The expiration date has not yet passed.')
        response.isExpired = 'N'
      }
      console.log('response?.serviceStatusReason-------->', response?.serviceStatusReason)
      if (response?.serviceStatusReason === null || response?.serviceStatusReason === '') {
        response.isNeIssue = 'N'
      } else {
        response.isNeIssue = 'Y'
      }

      console.log('response------>', response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service detailsxx fetched Successfully',
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

  async getExistingServices(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      console.log('checkExistingConversation-------->', checkExistingConversation)
      const smartAssistValue = checkExistingConversation.smartAssistValue
      console.log('smartAssistValue------', smartAssistValue)
      const { customerUuid } = smartAssistValue

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const response = await this.conn.CustServices.findAndCountAll({
        include: [
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceTypeDesc'
          }, {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceStatusDesc'
          }],
        where: {
          status: 'SS_AC',
          customerUuid
        }
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Existing Services fetched Successfully',
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

  async getPaymentStatus(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })
      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation.smartAssistValue
      const { accountUuid, serviceUuid } = smartAssistValue
      // console.log('accountUuid------>', accountUuid)
      // console.log('serviceUuid------>', serviceUuid)
      const payments = await this.conn.Payment.findAll({
        where: {
          accountUuid,
          serviceUuid
        }
      })
      const response = {}
      if (payments.length > 0) {
        response.paymentStatus = 'Pending'
      } else {
        response.paymentStatus = 'Done'
      }

      console.log('response------>', response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Payment status fetched Successfully',
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

  async getInvoices(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })
      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation.smartAssistValue
      const { accountUuid, serviceUuid } = smartAssistValue
      // console.log('accountUuid------>', accountUuid)
      // console.log('serviceUuid------>', serviceUuid)
      const response = await this.conn.Invoice.findAndCountAll({
        where: {
          accountUuid,
          serviceUuid,
          invoiceStatus: 'OPEN'
        }
      })
      console.log('response------>', response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Invoices fetched Successfully',
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

  async getRecentInteractions(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Interactions fetched Successfully',
          data: {
            count: 0
          }
        }
      }
      const { accountUuid, serviceUuid, customerUuid } = smartAssistValue
      const response = await this.conn.Interaction.findAndCountAll({
        // attributes: ['intxnId', 'intxnType', 'intxnNo', 'requestStatement', 'createdAt'],
        where: {
          customerUuid
        },
        order: [['createdAt', 'DESC']],
        limit: 7
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched Successfully',
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

  async getRecentSubscriptions(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'subscriptions fetched Successfully',
          data: {
            count: 0
          }
        }
      }
      const { accountUuid, serviceUuid, customerUuid } = smartAssistValue
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

      const response = await this.conn.CustServices.findAndCountAll({
        where: {
          customerUuid,
          status: constantCode?.status?.SERVICE_ACTIVE,
          createdAt: {
            [Op.gte]: fiveDaysAgo
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'subscriptions fetched Successfully',
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

  async getRecentInvoices(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'invoice payment fetched Successfully',
          data: {
            count: 0
          }
        }
      }
      const { accountUuid, serviceUuid, customerUuid } = smartAssistValue
      const response = await this.conn.PaymentInvoiceTxn.findAndCountAll({
        where: {
          customerUuid
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'invoice payment fetched Successfully',
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

  async getRecentBills(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'bill fetched Successfully',
          data: {
            count: 0
          }
        }
      }
      const { accountUuid, serviceUuid, customerUuid } = smartAssistValue

      let customerResponse = await this.conn.Customer.findOne({
        where: {
          customerUuid
        }
      })
      customerResponse = customerResponse?.dataValues ? customerResponse?.dataValues : customerResponse

      const response = await this.conn.Invoice.findAndCountAll({
        where: {
          customerId: customerResponse?.customerId
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'bill fetched Successfully',
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

  async getRecentOrders(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'orders fetched Successfully',
          data: {
            count: 0
          }
        }
      }

      const { accountUuid, serviceUuid, customerUuid } = smartAssistValue
      let custResponse = await this.conn.Customer.findOne({
        where: {
          customerUuid
        }
      })
      custResponse = custResponse?.dataValues ? custResponse?.dataValues : custResponse
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      console.log('custResponse?.customerId------->', custResponse?.customerId)
      const response = await this.conn.Orders.findAndCountAll({
        include: [
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderChannelDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderStatusDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCategoryDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderPriorityDesc'
          }],
        where: {
          customerId: custResponse?.customerId,
          parentFlag: 'Y',
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'orders fetched Successfully',
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

  async getRecentOrder(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'orders fetched Successfully',
          data: {
            count: 0
          }
        }
      }

      const { accountUuid, serviceUuid, customerUuid } = smartAssistValue
      let custResponse = await this.conn.Customer.findOne({
        where: {
          customerUuid
        }
      })
      custResponse = custResponse?.dataValues ? custResponse?.dataValues : custResponse
      const thirtyDaysAgo = new Date()
      // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 5)
      console.log('custResponse?.customerId------->', custResponse?.customerId)

      const response = await this.conn.Orders.findAndCountAll({
        attributes: [
          'orderDescription', 'createdAt', 'orderNo', 'billAmount',
          [
            this.conn.sequelize.literal('(SELECT order_no FROM order_hdr WHERE parent_flag = \'Y\' AND customer_id = ' + custResponse?.customerId + ')'),
            'parentOrderNo'
          ]
          // [
          //   this.conn.sequelize.literal('(SELECT bill_amount FROM order_hdr WHERE parent_flag = \'Y\' AND customer_id = ' + custResponse?.customerId + ')'),
          //   'billAmount'
          // ]
        ],
        include: [
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderChannelDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderStatusDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCategoryDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderPriorityDesc'
          },
          {
            model: this.conn.CustServices,
            attributes: ['service_name'],
            as: 'serviceDesc'
          }],
        where: {
          parentFlag: 'N',
          customerId: custResponse?.customerId,
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          },
          orderStatus: {
            [Op.notIn]: ['CLOSED', 'CANCELLED']
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 5,
        logging: true
      })

      console.log('response------->', response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'orders fetched Successfully',
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

  async serviceOrder(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'orders fetched Successfully',
          data: {
            count: 0
          }
        }
      }

      const { accountUuid, serviceUuid, customerUuid, serviceId } = smartAssistValue

      const response = await this.conn.Orders.findOne({
        include: [
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderChannelDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderStatusDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCategoryDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderPriorityDesc'
          },
          {
            model: this.conn.CustServices,
            attributes: ['service_name'],
            as: 'serviceDesc'
          }],
        where: {
          serviceId
        }
      })

      console.log('response------->', response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'service orders fetched Successfully',
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

  async checkBillingOfService(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'orders fetched Successfully',
          data: {
            count: 0
          }
        }
      }

      const { accountUuid, serviceUuid, customerUuid, serviceId } = smartAssistValue
      console.log('serviceUuid--------->', serviceUuid)

      const response = await this.conn.Invoice.findOne({
        include: [
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'invoiceStatusDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'billingStatusDesc'
          },
          {
            model: this.conn.ContractHdr,
            as: 'contractDesc'
          },
          {
            model: this.conn.CustServices,
            as: 'serviceDataDesc',
            include: [
              {
                model: this.conn.Orders,
                as: 'orderDesc',
                include: [{
                  model: this.conn.ContractDtl,
                  as: 'contractDtlsDesc',
                  include: [
                    {
                      attributes: ['code', 'description'],
                      model: this.conn.BusinessEntity,
                      as: 'frequencyDesc'
                    },
                    {
                      attributes: ['code', 'description'],
                      model: this.conn.BusinessEntity,
                      as: 'contractStatusDesc'
                    }
                  ]
                }]
              },
              {
                model: this.conn.BusinessEntity,
                attributes: ['code', 'description'],
                as: 'serviceStatusDesc'
              },
              {
                model: this.conn.BusinessEntity,
                attributes: ['code', 'description'],
                as: 'serviceCatDesc'
              },
              {
                model: this.conn.BusinessEntity,
                attributes: ['code', 'description'],
                as: 'serviceTypeDesc'
              }
            ]
          }
        ],
        where: {
          serviceUuid
        }
      })

      console.log('response------->', response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'billing details fetched Successfully',
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

  async checkAllActivities(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'orders fetched Successfully',
          data: {
            count: 0
          }
        }
      }

      const { accountUuid, serviceUuid, customerUuid } = smartAssistValue
      const recentIntxns = await this.conn.Interaction.findAndCountAll({
        where: {
          customerUuid
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      const channelListSql = `select * from bcae_rc_channel_list_fn ('${customerUuid}')`

      const recentChannels = await this.conn.sequelize.query(channelListSql, {
        type: QueryTypes.SELECT
      })

      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

      const recentSubscriptions = await this.conn.CustServices.findAndCountAll({
        where: {
          customerUuid,
          status: constantCode?.status?.SERVICE_ACTIVE,
          createdAt: {
            [Op.gte]: fiveDaysAgo
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      let customerResponse = await this.conn.Customer.findOne({
        where: {
          customerUuid
        }
      })
      customerResponse = customerResponse?.dataValues ? customerResponse?.dataValues : customerResponse

      const recentBills = await this.conn.Invoice.findAndCountAll({
        where: {
          customerId: customerResponse?.customerId
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      const recentPayment = await this.conn.PaymentInvoiceTxn.findAndCountAll({
        where: {
          customerUuid
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      let custResponse = await this.conn.Customer.findOne({
        where: {
          customerUuid
        }
      })
      custResponse = custResponse?.dataValues ? custResponse?.dataValues : custResponse
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      console.log('custResponse?.customerId------->', custResponse?.customerId)
      const recentOrders = await this.conn.Orders.findAndCountAll({
        include: [
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderChannelDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderStatusDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCategoryDesc'
          },
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderPriorityDesc'
          }],
        where: {
          customerId: custResponse?.customerId,
          parentFlag: 'Y',
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      const response = {
        recentIntxns,
        recentChannels,
        recentSubscriptions,
        recentBills,
        recentPayment,
        recentOrders
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'All activities fetched successfully',
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

  async checkContractOfOrder(serviceData, userId) {
    try {
      const { orderId } = serviceData
      if (!orderId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const response = await this.conn.ContractDtl.findAll({
        where: {
          orderId
        }
      })

      const respData = {}
      if (response?.length > 0) {
        respData.contractGenerated = 'Y'
      } else {
        respData.contractGenerated = 'N'
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Contract generated status fetched Successfully',
        data: respData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateRequest(serviceData, userId) {
    const t = await this.conn.sequelize.transaction()
    try {
      const { requestNo, requestStatus } = serviceData
      console.log('requestNo---->', requestNo)
      console.log('requestStatus---->', requestStatus)
      if (!requestNo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const response = await this.conn.Request.update({ requestStatus }, {
        where: {
          requestNo
        },
        transaction: t
      })
      await t.commit()
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'request updated Successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getRepeatedRequest(serviceData, userId) {
    try {
      const { serviceNo } = serviceData

      const requestListSql = `SELECT
      cs.service_id,
      cs.service_no,
      oh.order_id,
      oh.order_no,
      rh.request_id,
      rh.request_no,
      rh.request_description,
      rh.request_status,
      be_desc(rh.request_status) AS request_status_desc,
      rh.request_date,
      CASE WHEN req_counts.has_duplicate = 'Y' THEN 'Y' ELSE 'N' END AS has_duplicate
  FROM
      cust_services cs
  LEFT OUTER JOIN order_hdr oh ON oh.service_id = cs.service_id 
  LEFT OUTER JOIN request_hdr rh ON rh.entity_value = oh.order_no
                                  AND rh.entity_type = 'ORDER'
  LEFT OUTER JOIN (
      SELECT
          request_description,
          MAX(CASE WHEN req_count > 1 THEN 'Y' ELSE 'N' END) AS has_duplicate
      FROM (
          SELECT
              request_description,
              COUNT(*) AS req_count
          FROM
              request_hdr
          WHERE
              entity_type = 'ORDER'
          GROUP BY
              request_description
          HAVING
              COUNT(*) > 1
      ) req_counts
      GROUP BY
          request_description
  ) req_counts ON req_counts.request_description = rh.request_description
  WHERE
      cs.service_id = oh.service_id 
      AND cs.service_no = '${serviceNo}' 
      AND rh.request_status = 'REQ_PENDING'`

      console.log('requestListSql----->', requestListSql)

      let responseData = await this.conn.sequelize.query(requestListSql, {
        type: QueryTypes.SELECT
      })

      const count = responseData?.length || 0
      console.log('response------->', responseData)

      const hasY = _.some(responseData, { has_duplicate: 'Y' })
      if (hasY) {
        responseData = responseData.filter((ele) => ele.has_duplicate === 'Y')
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'request fetched Successfully',
        data: { responseData, count, flag: hasY ? 'Y' : 'N' }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async checkExistingCustomer(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'orders fetched Successfully',
          data: {
            count: 0
          }
        }
      }
      console.log('smartAssistValue----->', smartAssistValue)

      const { accountUuid, serviceUuid, customerUuid } = smartAssistValue

      let response = await this.conn.Customer.findOne({
        where: {
          customerUuid
          // status: constantCode?.customerStatus?.ACTIVE
        }
      })
      response = response?.dataValues ? response?.dataValues : response
      let responseData
      if (response) {
        const serviceResponse = await this.conn.CustServices.findAll({
          where: {
            customerId: response?.customerId,
            status: constantCode?.custServiceStatus?.ACTIVE
          }
        })
        if (serviceResponse?.length > 0) {
          responseData = {
            existance: 'exist',
            data: response
          }
        } else {
          responseData = {
            existance: 'not-exist',
            data: response
          }
        }
      } else {
        responseData = {
          existance: 'not-exist',
          data: response
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'customer fetched Successfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getProductFamily(serviceData, userId) {
    try {
      const response = await this.conn.BusinessEntity.findAndCountAll({
        attributes: ['code', 'description'],
        where: {
          codeType: 'PRODUCT_FAMILY',
          status: constantCode?.status?.ACTIVE
        }
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'prodcut family fetched Successfully',
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

  async getProductFamilyProducts(serviceData, userId) {
    try {
      const response = await this.conn.Product.findAll({
        attributes: {
          exclude: ['productImage']
        },
        where: {
          productFamily: serviceData?.productFamily,
          status: constantCode?.status?.ACTIVE
        }
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'products fetched Successfully',
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

  async getRecentChannels(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'channels fetched Successfully',
          count: 0
        }
      }
      const { accountUuid, serviceUuid, customerUuid } = smartAssistValue

      const channelListSql = `select * from bcae_rc_channel_list_fn ('${customerUuid}')`

      const responseData = await this.conn.sequelize.query(channelListSql, {
        type: QueryTypes.SELECT
      })
      console.log('responseData--------->', responseData.length)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'channel list fetched Successfully',
        data: responseData,
        count: responseData.length
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getRecentChannelActivity(serviceData, userId) {
    try {
      console.log('serviceData-------->', serviceData)
      const { conversationUid, channelCode } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation?.smartAssistValue
      if (!smartAssistValue) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'channels fetched Successfully',
          count: 0
        }
      }
      const { accountUuid, serviceUuid, customerUuid } = smartAssistValue

      const channelActivityListSql = `select * from bcae_rc_all_channel_txn_list_fn ('${channelCode}','${customerUuid}')`

      console.log('channelActivityListSql------>', channelActivityListSql)
      const responseData = await this.conn.sequelize.query(channelActivityListSql, {
        type: QueryTypes.SELECT
      })
      console.log('responseData--------->', responseData.length)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'channel list fetched Successfully',
        data: responseData,
        count: responseData.length
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async saveInteractionStatement(serviceData, userId) {
    const t = await this.conn.sequelize.transaction()
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const biResponseData = await this.conn.BusinessEntity.findAll({
        where: {
          description: serviceData?.statement,
          codeType: 'INTXN_STATEMENT'
        }
      })
      console.log('biResponseData------->', biResponseData)
      if (biResponseData && biResponseData?.length > 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Interaction statement already exist',
          data: biResponseData
        }
      }

      const businessEntityPayload = {
        description: serviceData?.statement.toUpperCase(),
        codeType: 'INTXN_STATEMENT',
        createdBy: systemUserId,
        updatedBy: systemUserId,
        createdDeptId: systemDeptId,
        createdRoleId: systemRoleId
      }
      console.log('businessEntityPayload----------->', businessEntityPayload)
      const businessEntityData = await this.conn.BusinessEntity.create(businessEntityPayload, { transaction: t })
      if (!businessEntityData) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Interaction statement not created',
          data: []
        }
      }
      console.log('businessEntityData-------->', businessEntityData)
      const knowledgeBaseData = {
        requestStatement: serviceData?.statement.toUpperCase(),
        serviceType: serviceData?.serviceType,
        intxnCategory: serviceData?.interactionCategory,
        intxnType: serviceData?.interactionType,
        serviceCategory: serviceData?.serviceCategory,
        serviceType: serviceData?.serviceType,
        status: constantCode?.status?.TEMPORARY,
        createdBy: systemUserId
      }
      const clonedData = { ...knowledgeBaseData }
      delete clonedData.createdBy
      console.log('knowledgeBaseData--------->',knowledgeBaseData)
      const responseData = await this.conn.KnowledgeBase.findAll({
        where: clonedData
      })
      if (responseData && responseData?.length > 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Interaction statement already exist',
          data: []
        }
      }
      let response = await this.conn.KnowledgeBase.create(knowledgeBaseData, { transaction: t })
      await t.commit()
      response = response?.dataValues ? response?.dataValues : response
      response.code = businessEntityData?.code

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interaction statement saved Successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getOrderDetails(serviceData, userId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      const smartAssistValue = checkExistingConversation.smartAssistValue
      console.log('smartAssistValue------', smartAssistValue)
      const { serviceUuid } = smartAssistValue

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      let response = await this.conn.CustServices.findOne({
        where: {
          serviceUuid
        }
      })
      response = response?.dataValues ? response?.dataValues : response
      console.log('response------>', response)

      let orderResponse = await this.conn.Orders.findAll({
        include: [
          {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderStatusDesc'
          }, {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderChannelDesc'
          }, {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCategoryDesc'
          }, {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderTypeDesc'
          }, {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceTypeDesc'
          }, {
            model: this.conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderFamilyDesc'
          }, {
            model: this.conn.OrdersDetails,
            as: 'orderProductDtls',
            include: {
              model: this.conn.Product,
              as: 'productDetails',
              attributes: [
                'productUuid', 'productId', 'productNo', 'status',
                'productName', 'productFamily', 'productCategory', 'productSubCategory',
                'productType', 'serviceType', 'chargeType', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'
              ],
              include: [{
                model: this.conn.BusinessEntity,
                attributes: ['code', 'description'],
                as: 'serviceTypeDesc'
              },
              {
                model: this.conn.BusinessEntity,
                attributes: ['code', 'description'],
                as: 'productTypeDesc'
              },
              {
                model: this.conn.BusinessEntity,
                attributes: ['code', 'description'],
                as: 'productCategoryDesc'
              },
              {
                model: this.conn.BusinessEntity,
                attributes: ['code', 'description'],
                as: 'chargeTypeDesc'
              }]
            }
          }],
        where: {
          // accountId: response?.accountId
          serviceId: response?.serviceId,
          parentFlag: 'N'
        }
      })

      let exactOrderId = await this.conn.Orders.findOne({
        attributes: ['orderNo'],
        where: {
          serviceId: response?.serviceId
        }
      })

      exactOrderId = exactOrderId?.dataValues ? exactOrderId?.dataValues : exactOrderId
      orderResponse = orderResponse?.dataValues ? orderResponse?.dataValues : orderResponse

      let orderResponseData = {}
      if (orderResponse.length > 0) {
        orderResponseData = await this.conn.Orders.findOne({
          include: [
            {
              model: this.conn.BusinessEntity,
              attributes: ['code', 'description'],
              as: 'orderStatusDesc'
            },
            {
              model: this.conn.BusinessEntity,
              attributes: ['code', 'description'],
              as: 'orderChannelDesc'
            },
            {
              model: this.conn.Customer,
              as: 'customerDetails',
              required: false,
              include: [{
                model: this.conn.Address,
                as: 'customerAddress',
                required: false
              }, {
                model: this.conn.Contact,
                as: 'customerContact',
                required: false
              }]
            }
          ],
          where: {
            orderNo: orderResponse[0]?.orderNo.split('_')[0]
          }
        })
        orderResponseData = orderResponseData?.dataValues ? orderResponseData?.dataValues : orderResponseData

        orderResponseData.childOrder = orderResponse
        orderResponseData.exactOrderId = exactOrderId?.orderNo
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order details fetched Successfully',
        data: orderResponseData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCustomerCurrentInformation(serviceData, departmentId, userId, roleId) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      console.log('conversationUid', conversationUid)
      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })
      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation
      console.log('checkExistingConversation', checkExistingConversation)

      const smartAssistValue = checkExistingConversation.smartAssistValue
      const { serviceUuid, customerUuid } = smartAssistValue

      const getCustomerDetails = await this.conn.Customer.findOne({
        include: [{
          model: this.conn.BusinessEntity,
          as: 'statusDesc',
          attributes: ['code', 'description']
        }],
        where: {
          customerUuid
        }
      })

      let serviceResponse = await this.conn.CustServices.findOne({
        include: [{
          model: this.conn.BusinessEntity,
          as: 'serviceStatusDesc',
          attributes: ['code', 'description']
        },
        {
          model: this.conn.BusinessEntity,
          as: 'serviceTypeDesc',
          attributes: ['code', 'description']
        }, {
          model: this.conn.BusinessEntity,
          as: 'serviceCatDesc',
          attributes: ['code', 'description']
        }
        ],
        where: {
          serviceUuid
        }
      })

      serviceResponse = serviceResponse?.dataValues ? serviceResponse?.dataValues : serviceResponse

      const paymentStatus = await this.getPaymentStatus(serviceData)
      const getInvoices = await this.getInvoices(serviceData)
      const getorderDetails = await this.conn.Orders.findAll({
        where: {
          serviceId: serviceResponse?.serviceId,
          orderStatus: {
            [Op.notIn]: ['CNCLED', 'CLS', 'RJTD']
          }
        }
      })

      const getContract = await this.conn.ContractHdr.count({
        where: {
          serviceUuid,
          status: 'CONTR_ST_OPEN'
        }
      })

      // if (response?.serviceUsage >= response?.serviceLimit) {
      //   response.consumptionStatus = 'exceeded'
      // } else {
      //   response.consumptionStatus = 'normal'
      // }
      const response = {
        customer: {
          customerUuid: serviceResponse ? serviceResponse?.customerUuid : '',
          customerStatus: serviceResponse ? serviceResponse?.serviceStatusDesc?.description : 'NA'
        },
        payment: {
          // outstanding: paymentStatus?.data?.paymentStatus ? paymentStatus?.data?.paymentStatus === 'Pending' ? 'Yes' : 'No' : 'No',
          outstanding: getInvoices?.data?.count > 0 ? 'Yes' : 'No',
          message: `We understand that the Customer has the pending payment with reference to the ${getInvoices?.data?.rows?.[0]?.invNo || 0} against the  ${serviceResponse?.serviceCatDesc?.description} & ${serviceResponse?.serviceTypeDesc?.description},`
        },
        order: {
          openOrder: getorderDetails?.count ? getorderDetails?.count > 0 ? 'Yes' : 'No' : 'No'
        },
        serviceUsage: {
          consumptionStatus: serviceResponse && serviceResponse?.serviceLimit ? serviceResponse?.serviceUsage >= serviceResponse?.serviceLimit ? 'Exceeded' : 'Normal' : 'Normal',
          message: serviceResponse ? `We found that the Customer current usage of this ${serviceResponse?.serviceCatDesc?.description} ${serviceResponse?.serviceTypeDesc?.description} is higher than the limit. ` : ''
        },
        contract: {
          contractStatus: getContract ? getContract > 0 ? 'Valid' : 'Expired' : 'Expired'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'customer details fetched successfully',
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

  async updateCustomerService(serviceData, t) {
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      await this.conn.CustServices.update({ status: 'SS_AC' }, {
        logging: console.log,
        where: {
          serviceUuid: serviceData?.serviceUuid
        },
        transaction: t
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service details updated successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getAddonList(serviceData) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })
      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation.smartAssistValue
      const { serviceCategory, serviceType } = smartAssistValue

      const getProductDetails = await this.conn.Product.findAll({
        attributes: ['productId', 'productNo', 'productName', 'productFamily', 'productCategory', 'productSubCategory'],
        where: {
          productCategory: 'PC_ADDON',
          productSubType: serviceCategory,
          serviceType,
          status: 'AC'
        },
        logging: console.log,
        order: [['createdAt', 'DESC']]
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched Product Details successfully',
        data: getProductDetails
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async purchaseAddon(serviceData, t) {
    try {
      const { conversationUid, productNo } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await this.conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })
      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const smartAssistValue = checkExistingConversation.smartAssistValue
      const { serviceUuid } = smartAssistValue

      const getProductDetails = await this.conn.Product.findOne({
        where: {
          productNo
        }
      })

      await this.conn.CustServices.update({ planPayload: getProductDetails?.productId }, {
        logging: console.log,
        where: {
          serviceUuid
        },
        transaction: t
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Addon Activation successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  // PRODUCT RELATED SOLUTIONS AND DATA STARTS HERE
  async productRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnCategory, intxnType, serviceCategory, serviceType, intxnResolution } = intxnDetails
      const { customerUuid, actionCount, location } = metaData
      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })
      const customerDetails = await this.conn.Customer.findOne({ where: { code: customerUuid } })

      if (actionCount === 1) {
        const orConditions = []
        let whereObj = {
          status: defaultStatus.ACTIVE,
          [Op.or]: orConditions
        }

        if (!NEGATIVE_INTXN_TYPES.includes(intxnType)) {
          if (location) {
            orConditions.push({ productLocation: { [Op.contains]: [location] } })
            whereObj = {
              ...whereObj,
              [Op.or]: orConditions
            }
          }
        }

        const productCatsServicetypes = [serviceType]
        const intxnIds = []
        const orderTxnIds = []
        let interactions = []

        if (!NEGATIVE_INTXN_TYPES.includes(intxnType)) {
          interactions = await this.conn.Interaction.findAll({
            where: {
              customerUuid, intxnCategory, intxnType, serviceCategory
            }
          })
          if (interactions.length > 0) {
            interactions.forEach(interaction => {
              productCatsServicetypes.push(interaction.serviceType)
              intxnIds.push(interaction.intxnId)
            })
          }

          orConditions.push({
            [Op.and]: [
              { productSubCategory: `PSC_${customerDetails.customerCategory}` },
              { serviceType: { [Op.in]: productCatsServicetypes } }
            ]
          })

          whereObj = {
            ...whereObj,
            [Op.or]: orConditions
          }
        }

        const orderTxns = await this.conn.OrdersTxnHdr.findAll({
          where: {
            [Op.or]: [
              { customerId: customerDetails.customerId },
              {
                intxnId: {
                  [Op.in]: intxnIds
                }
              }
            ]
          }
        })

        if (orderTxns.length > 0) {
          orderTxns.forEach(orderTxn => {
            orderTxnIds.push(orderTxn.orderTxnId)
          })

          const OrdersTxnDtls = await this.conn.OrdersTxnDtl.findAll({
            where: {
              orderTxnId: {
                [Op.in]: orderTxnIds
              }
            }
          })

          if (OrdersTxnDtls.length) {
            const productIds = OrdersTxnDtls.map(OrdersTxnDtl => OrdersTxnDtl.productId)
            orConditions.push({ productId: { [Op.in]: productIds } })
            whereObj = {
              ...whereObj,
              [Op.or]: orConditions
            }
          }
        }

        const products = await this.conn.Product.findAll({
          where: whereObj,
          include: [
            { model: this.conn.ProductCharge, as: 'productChargesList' },
            { model: this.conn.BusinessEntity, as: 'productFamilyDesc' },
            { model: this.conn.BusinessEntity, as: 'productCategoryDesc' },
            { model: this.conn.BusinessEntity, as: 'productSubCategoryDesc' },
            { model: this.conn.BusinessEntity, as: 'productTypeDesc' },
            { model: this.conn.BusinessEntity, as: 'serviceTypeDesc' },
            { model: this.conn.BusinessEntity, as: 'provisioningTypeDesc' },
            { model: this.conn.BusinessEntity, as: 'chargeTypeDesc' }
          ]
        })

        products.forEach(product => {
          const tempArr = []
          tempArr.push({
            name: 'Product name',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.productName
          })
          tempArr.push({
            name: 'Product category',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.productCategoryDesc?.description
          })
          tempArr.push({
            name: 'Service type',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.serviceTypeDesc?.description
          })
          tempArr.push({
            name: 'Warranty period',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.warrantyPeriod
          })
          data.push({
            confirmMessage: 'Would you like to proceed to order screen?',
            message: 'We have found excellent offers for you.',
            displayType: 'SELECTABLE',
            result: tempArr
          })
        })
      } else if (actionCount === 2) {
        data = {
          message: resolutionInformation.description,
          autoCreate: true
        }
      }

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: true,
          interactionCreation: false
        }
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount === 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }
  // PRODUCT RELATED SOLUTIONS AND DATA ENDS HERE

  // SERVICE RELATED SOLUTIONS AND DATA STARTS HERE
  async serviceRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnType, intxnResolution, serviceType } = intxnDetails
      const { customerUuid, serviceUuid, actionCount } = metaData

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: true,
          interactionCreation: false
        }
        const products = await this.conn.Product.findAll({
          where: { serviceType },
          include: [
            { model: this.conn.ProductCharge, as: 'productChargesList' },
            { model: this.conn.BusinessEntity, as: 'productFamilyDesc' },
            { model: this.conn.BusinessEntity, as: 'productCategoryDesc' },
            { model: this.conn.BusinessEntity, as: 'productSubCategoryDesc' },
            { model: this.conn.BusinessEntity, as: 'productTypeDesc' },
            { model: this.conn.BusinessEntity, as: 'serviceTypeDesc' },
            { model: this.conn.BusinessEntity, as: 'provisioningTypeDesc' },
            { model: this.conn.BusinessEntity, as: 'chargeTypeDesc' }
          ]
        })

        products.forEach(product => {
          const tempArr = []
          tempArr.push({
            name: 'Product name',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.productName
          })
          tempArr.push({
            name: 'Product category',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.productCategoryDesc?.description
          })
          tempArr.push({
            name: 'Service type',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.serviceTypeDesc?.description
          })
          tempArr.push({
            name: 'Warranty period',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.warrantyPeriod
          })
          data.push({
            confirmMessage: 'Would you like to proceed to order screen?',
            message: 'We have found excellent offers for you.',
            displayType: 'SELECTABLE',
            result: tempArr
          })
        })
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
        if (actionCount === 1) {
          const service = await this.conn.CustServices.findOne({
            where: { customerUuid, serviceUuid },
            include: [
              { model: this.conn.BusinessEntity, as: 'serviceStatusDesc' },
              { model: this.conn.BusinessEntity, as: 'serviceCatDesc' },
              { model: this.conn.BusinessEntity, as: 'serviceTypeDesc' }
            ]
          })
          let message = ''
          const usedPercentage = (Number(service.serviceUsage) / Number(service.serviceLimit)) * 100
          if (usedPercentage >= 90) {
            message = `It looks like ${usedPercentage.toFixed(2)}% of your available data. Kindly top-up to continue your service smoothly, else proceed to raise a complaint to proceed further.`
          } else {
            message = `You have consumed only ${usedPercentage.toFixed(2)}% of data. Still good to go. If you feel any disputes, please raise a complaint to proceed further.`
          }
          data = [
            {
              confirmMessage: 'Is your query resolved?',
              message,
              displayType: 'READ-ONLY',
              result: [
                {
                  name: 'Service Name',
                  type: 'text',
                  entity: 'SERVICE',
                  value: service.serviceName
                },
                {
                  name: 'Service Category',
                  type: 'text',
                  entity: 'SERVICE',
                  value: service.serviceCatDesc.description
                },
                {
                  name: 'Service Type',
                  type: 'text',
                  entity: 'SERVICE',
                  value: service.serviceTypeDesc.description
                },
                {
                  name: 'Service Status',
                  type: 'text',
                  entity: 'SERVICE',
                  value: service.serviceStatusDesc.description
                },
                {
                  name: 'Service Usage',
                  type: 'text',
                  entity: 'SERVICE',
                  value: `${service.serviceUsage} ${service.serviceUnit}`
                },
                {
                  name: 'Service limit',
                  type: 'text',
                  entity: 'SERVICE',
                  value: service.serviceLimit
                },
                {
                  name: 'Available balance',
                  type: 'text',
                  entity: 'SERVICE',
                  value: `${service.serviceBalance} ${service.serviceUnit}`
                }
              ]
            }
          ]
        } else if (actionCount == 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount = 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }
  // SERVICE RELATED SOLUTIONS AND DATA ENDS HERE

  // BILLING RELATED SOLUTIONS AND DATA STARTS HERE
  /* async billingRelatedSolution(intxnDetails) {
     try {
       const { customerUuid, serviceUuid, accountUuid } = intxnDetails
       const checkExistingCustomer = await this.conn.Customer.findOne({
         where: {
           customerUuid: customerUuid
         }
       })
       console.log('intxnDetails-------->', intxnDetails)
       // const billing = await this.conn.Billing.findOne({
       //   where: { customerUuid, serviceUuid, accountUuid }
       // })

       let response = {}
       if (intxnDetails && checkExistingCustomer) {
         response = {
           statementId: intxnDetails?.requestId,
           customerId: checkExistingCustomer?.dataValues?.customerId,
           contactPreference: JSON.parse(checkExistingCustomer?.dataValues?.contactPreferences),
           customerUuid: intxnDetails?.customerUuid,
           statement: intxnDetails?.requestStatement,
           serviceType: intxnDetails?.serviceType,
           problemCause: intxnDetails?.intxnCause,
           interactionType: intxnDetails?.intxnType,
           statementSolution: intxnDetails?.intxnResolution,
           //  customerUuid: intxnDetails?.customerUuid,
           serviceCategory: intxnDetails?.serviceCategory,
           interactionCategory: intxnDetails?.intxnCategory,
           // billAmount: billing?.totInvAmount,
           // billDate: billing?.billDate,
           downloadUrl: 'https://comquestbrunei1.sharepoint.com/_layouts/15/download.aspx?UniqueId=8563662d-445f-413c-b8ad-13ff7ee3bdc1&Translate=false&tempauth=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvY29tcXVlc3RicnVuZWkxLnNoYXJlcG9pbnQuY29tQDU3NDU4M2IxLTBkOWEtNGMyNC1iOTdjLTBkOTc5ZDkzNWU5YyIsImlzcyI6IjAwMDAwMDAzLTAwMDAtMGZmMS1jZTAwLTAwMDAwMDAwMDAwMCIsIm5iZiI6IjE2Nzk5MjM2ODkiLCJleHAiOiIxNjc5OTI3Mjg5IiwiZW5kcG9pbnR1cmwiOiI4WnUxUjB5Rk1ob3J0MC96bXVtY1BNamhBSlc3UWNFSGVMVGNYUFlKcktVPSIsImVuZHBvaW50dXJsTGVuZ3RoIjoiMTI2IiwiaXNsb29wYmFjayI6IlRydWUiLCJjaWQiOiJaVEExTm1FellUQXRPREJsTXkweU1EQXdMVEpsT0RrdE1UUmtObUV6TWpZeU9HWTUiLCJ2ZXIiOiJoYXNoZWRwcm9vZnRva2VuIiwic2l0ZWlkIjoiWldRMk5XTXdaVFV0WkdWbFl5MDBaRFJpTFRrM09USXRORFl4WmpnelkySTBNVFF3IiwiYXBwX2Rpc3BsYXluYW1lIjoiQkNBRSBBcHAiLCJuYW1laWQiOiJhODFlMWEyOC0zNjAxLTRlNzAtYjcwYi1kYjViYTIxNWI0YTRANTc0NTgzYjEtMGQ5YS00YzI0LWI5N2MtMGQ5NzlkOTM1ZTljIiwicm9sZXMiOiJzZWxlY3RlZHNpdGVzIGFsbHNpdGVzLnJlYWQgYWxsc2l0ZXMud3JpdGUgYWxsc2l0ZXMubWFuYWdlIGFsbGZpbGVzLndyaXRlIGFsbGZpbGVzLnJlYWQgYWxsc2l0ZXMuZnVsbGNvbnRyb2wiLCJ0dCI6IjEiLCJ1c2VQZXJzaXN0ZW50Q29va2llIjpudWxsLCJpcGFkZHIiOiIyMDIuMTYwLjUuNDIifQ.VzBVaG0waVdMUUpDY1ZyN1RLb0N3MHM3aHJDdWtRTnVUaHJJcUNCakNuND0&ApiVersion=2.0'
         }
       }

       return {
         status: statusCodeConstants.SUCCESS,
         message: 'Data retrived',
         data: response
       }
     } catch (error) {
       logger.error(error)
       return {
         status: statusCodeConstants.ERROR,
         message: 'Error occured'
       }
     }
   } */

  async billingRelatedSolution(intxnDetails) {
    try {
      const { serviceUuid } = intxnDetails

      let serviceData = await this.conn.CustServices.findOne({
        where: {
          serviceUuid
        }
      })
      serviceData = serviceData?.dataValues ? serviceData?.dataValues : serviceData
      if (serviceData?.serviceUsage >= serviceData?.serviceLimit) {
        serviceData.consumptionStatus = 'exceeded'
      } else {
        serviceData.consumptionStatus = 'normal'
      }
      const formattedService = formatServiceConsumptionDetails(serviceData, null)
      console.log('formattedService', formattedService)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: formattedService
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  // BILLING RELATED SOLUTIONS AND DATA ENDS HERE

  // DELIVERY RELATED SOLUTIONS AND DATA STARTS HERE
  async deliveryRelatedIntelegenceSolution(intxnDetails) {
    try {
      const { customerUuid, serviceUuid, accountUuid } = intxnDetails
      const checkExistingCustomer = await this.conn.Customer.findOne({
        where: {
          customerUuid
        }
      })
      console.log('intxnDetails-------->', intxnDetails)

      let response = {}
      if (intxnDetails && checkExistingCustomer) {
        response = {
          statementId: intxnDetails?.requestId,
          customerId: checkExistingCustomer?.dataValues?.customerId,
          contactPreference: JSON.parse(checkExistingCustomer?.dataValues?.contactPreferences),
          customerUuid: intxnDetails?.customerUuid,
          statement: intxnDetails?.requestStatement,
          serviceType: intxnDetails?.serviceType,
          problemCause: intxnDetails?.intxnCause,
          interactionType: intxnDetails?.intxnType,
          statementSolution: intxnDetails?.intxnResolution,
          serviceCategory: intxnDetails?.serviceCategory,
          interactionCategory: intxnDetails?.intxnCategory,
          downloadUrl: 'https://comquestbrunei1.sharepoint.com/_layouts/15/download.aspx?UniqueId=8563662d-445f-413c-b8ad-13ff7ee3bdc1&Translate=false&tempauth=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvY29tcXVlc3RicnVuZWkxLnNoYXJlcG9pbnQuY29tQDU3NDU4M2IxLTBkOWEtNGMyNC1iOTdjLTBkOTc5ZDkzNWU5YyIsImlzcyI6IjAwMDAwMDAzLTAwMDAtMGZmMS1jZTAwLTAwMDAwMDAwMDAwMCIsIm5iZiI6IjE2Nzk5MjM2ODkiLCJleHAiOiIxNjc5OTI3Mjg5IiwiZW5kcG9pbnR1cmwiOiI4WnUxUjB5Rk1ob3J0MC96bXVtY1BNamhBSlc3UWNFSGVMVGNYUFlKcktVPSIsImVuZHBvaW50dXJsTGVuZ3RoIjoiMTI2IiwiaXNsb29wYmFjayI6IlRydWUiLCJjaWQiOiJaVEExTm1FellUQXRPREJsTXkweU1EQXdMVEpsT0RrdE1UUmtObUV6TWpZeU9HWTUiLCJ2ZXIiOiJoYXNoZWRwcm9vZnRva2VuIiwic2l0ZWlkIjoiWldRMk5XTXdaVFV0WkdWbFl5MDBaRFJpTFRrM09USXRORFl4WmpnelkySTBNVFF3IiwiYXBwX2Rpc3BsYXluYW1lIjoiQkNBRSBBcHAiLCJuYW1laWQiOiJhODFlMWEyOC0zNjAxLTRlNzAtYjcwYi1kYjViYTIxNWI0YTRANTc0NTgzYjEtMGQ5YS00YzI0LWI5N2MtMGQ5NzlkOTM1ZTljIiwicm9sZXMiOiJzZWxlY3RlZHNpdGVzIGFsbHNpdGVzLnJlYWQgYWxsc2l0ZXMud3JpdGUgYWxsc2l0ZXMubWFuYWdlIGFsbGZpbGVzLndyaXRlIGFsbGZpbGVzLnJlYWQgYWxsc2l0ZXMuZnVsbGNvbnRyb2wiLCJ0dCI6IjEiLCJ1c2VQZXJzaXN0ZW50Q29va2llIjpudWxsLCJpcGFkZHIiOiIyMDIuMTYwLjUuNDIifQ.VzBVaG0waVdMUUpDY1ZyN1RLb0N3MHM3aHJDdWtRTnVUaHJJcUNCakNuND0&ApiVersion=2.0'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }
  // DELIVERY RELATED SOLUTIONS AND DATA ENDS HERE

  // SERVICE RELATED SOLUTIONS AND DATA STARTS HERE
  async serviceRelatedIntelegenceSolution(intxnDetails) {
    try {
      const { customerUuid, serviceUuid, accountUuid } = intxnDetails
      const checkExistingCustomer = await this.conn.Customer.findOne({
        where: {
          customerUuid
        }
      })
      console.log('intxnDetails-------->', intxnDetails)

      let response = {}
      if (intxnDetails && checkExistingCustomer) {
        response = {
          statementId: intxnDetails?.requestId,
          customerId: checkExistingCustomer?.dataValues?.customerId,
          contactPreference: JSON.parse(checkExistingCustomer?.dataValues?.contactPreferences),
          customerUuid: intxnDetails?.customerUuid,
          statement: intxnDetails?.requestStatement,
          serviceType: intxnDetails?.serviceType,
          problemCause: intxnDetails?.intxnCause,
          interactionType: intxnDetails?.intxnType,
          statementSolution: intxnDetails?.intxnResolution,
          serviceCategory: intxnDetails?.serviceCategory,
          interactionCategory: intxnDetails?.intxnCategory,
          downloadUrl: 'https://comquestbrunei1.sharepoint.com/_layouts/15/download.aspx?UniqueId=8563662d-445f-413c-b8ad-13ff7ee3bdc1&Translate=false&tempauth=eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvY29tcXVlc3RicnVuZWkxLnNoYXJlcG9pbnQuY29tQDU3NDU4M2IxLTBkOWEtNGMyNC1iOTdjLTBkOTc5ZDkzNWU5YyIsImlzcyI6IjAwMDAwMDAzLTAwMDAtMGZmMS1jZTAwLTAwMDAwMDAwMDAwMCIsIm5iZiI6IjE2Nzk5MjM2ODkiLCJleHAiOiIxNjc5OTI3Mjg5IiwiZW5kcG9pbnR1cmwiOiI4WnUxUjB5Rk1ob3J0MC96bXVtY1BNamhBSlc3UWNFSGVMVGNYUFlKcktVPSIsImVuZHBvaW50dXJsTGVuZ3RoIjoiMTI2IiwiaXNsb29wYmFjayI6IlRydWUiLCJjaWQiOiJaVEExTm1FellUQXRPREJsTXkweU1EQXdMVEpsT0RrdE1UUmtObUV6TWpZeU9HWTUiLCJ2ZXIiOiJoYXNoZWRwcm9vZnRva2VuIiwic2l0ZWlkIjoiWldRMk5XTXdaVFV0WkdWbFl5MDBaRFJpTFRrM09USXRORFl4WmpnelkySTBNVFF3IiwiYXBwX2Rpc3BsYXluYW1lIjoiQkNBRSBBcHAiLCJuYW1laWQiOiJhODFlMWEyOC0zNjAxLTRlNzAtYjcwYi1kYjViYTIxNWI0YTRANTc0NTgzYjEtMGQ5YS00YzI0LWI5N2MtMGQ5NzlkOTM1ZTljIiwicm9sZXMiOiJzZWxlY3RlZHNpdGVzIGFsbHNpdGVzLnJlYWQgYWxsc2l0ZXMud3JpdGUgYWxsc2l0ZXMubWFuYWdlIGFsbGZpbGVzLndyaXRlIGFsbGZpbGVzLnJlYWQgYWxsc2l0ZXMuZnVsbGNvbnRyb2wiLCJ0dCI6IjEiLCJ1c2VQZXJzaXN0ZW50Q29va2llIjpudWxsLCJpcGFkZHIiOiIyMDIuMTYwLjUuNDIifQ.VzBVaG0waVdMUUpDY1ZyN1RLb0N3MHM3aHJDdWtRTnVUaHJJcUNCakNuND0&ApiVersion=2.0'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }
  // SERVICE RELATED SOLUTIONS AND DATA ENDS HERE

  async offersRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnType, intxnResolution, serviceType } = intxnDetails
      const { actionCount } = metaData

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: true,
          interactionCreation: false
        }
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
        if (actionCount === 1) {
          const products = await this.conn.Product.findAll({
            where: { serviceType },
            include: [
              { model: this.conn.ProductCharge, as: 'productChargesList' },
              { model: this.conn.BusinessEntity, as: 'productFamilyDesc' },
              { model: this.conn.BusinessEntity, as: 'productCategoryDesc' },
              { model: this.conn.BusinessEntity, as: 'productSubCategoryDesc' },
              { model: this.conn.BusinessEntity, as: 'productTypeDesc' },
              { model: this.conn.BusinessEntity, as: 'serviceTypeDesc' },
              { model: this.conn.BusinessEntity, as: 'provisioningTypeDesc' },
              { model: this.conn.BusinessEntity, as: 'chargeTypeDesc' }
            ]
          })

          products.forEach(product => {
            const tempArr = []
            tempArr.push({
              name: 'Product name',
              type: 'text',
              entity: 'PRODUCT',
              value: product?.productName
            })
            tempArr.push({
              name: 'Product category',
              type: 'text',
              entity: 'PRODUCT',
              value: product?.productCategoryDesc?.description
            })
            tempArr.push({
              name: 'Service type',
              type: 'text',
              entity: 'PRODUCT',
              value: product?.serviceTypeDesc?.description
            })
            tempArr.push({
              name: 'Warranty period',
              type: 'text',
              entity: 'PRODUCT',
              value: product?.warrantyPeriod
            })
            data.push({
              confirmMessage: 'Would you like to proceed to order screen?',
              message: 'We have found excellent offers for you.',
              displayType: 'SELECTABLE',
              result: tempArr
            })
          })
        } else if (actionCount === 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount === 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async contractRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnType, intxnResolution } = intxnDetails
      const { customerUuid, accountUuid, actionCount } = metaData

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: true,
          interactionCreation: false
        }
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
        if (actionCount === 1) {
          const account = await this.conn.CustAccounts.findOne({
            where: { customerUuid, accountUuid },
            include: [
              {
                model: this.conn.BusinessEntity,
                as: 'accountStatusDesc'
              }
            ]
          })
          data = [
            {
              confirmMessage: 'Is your query resolved?',
              message: 'Below are the contract details. If any disputes, kindly raise the interaction.',
              displayType: 'READ-ONLY',
              result: [
                {
                  name: 'Account name',
                  type: 'text',
                  entity: 'ACCOUNT',
                  value: `${account.firstName} ${account.lastName}`
                },
                {
                  name: 'Account status',
                  type: 'text',
                  entity: 'ACCOUNT',
                  value: account.accountStatusDesc.description
                }
              ]
            }
          ]
        } else if (actionCount === 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount === 1) {
          data = [
            {
              confirmMessage: 'Please click YES to proceed',
              message: resolutionInformation.description,
              displayType: 'READ-ONLY'
            }
          ]
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Erro occured'
      }
    }
  }

  async accountRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnType, intxnResolution, serviceType } = intxnDetails
      const { customerUuid, accountUuid, actionCount } = metaData

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: true,
          interactionCreation: false
        }
        const products = await this.conn.Product.findAll({
          where: { serviceType },
          include: [
            { model: this.conn.ProductCharge, as: 'productChargesList' },
            { model: this.conn.BusinessEntity, as: 'productFamilyDesc' },
            { model: this.conn.BusinessEntity, as: 'productCategoryDesc' },
            { model: this.conn.BusinessEntity, as: 'productSubCategoryDesc' },
            { model: this.conn.BusinessEntity, as: 'productTypeDesc' },
            { model: this.conn.BusinessEntity, as: 'serviceTypeDesc' },
            { model: this.conn.BusinessEntity, as: 'provisioningTypeDesc' },
            { model: this.conn.BusinessEntity, as: 'chargeTypeDesc' }
          ]
        })

        products.forEach(product => {
          const tempArr = []
          tempArr.push({
            name: 'Product name',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.productName
          })
          tempArr.push({
            name: 'Product category',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.productCategoryDesc?.description
          })
          tempArr.push({
            name: 'Service type',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.serviceTypeDesc?.description
          })
          tempArr.push({
            name: 'Warranty period',
            type: 'text',
            entity: 'PRODUCT',
            value: product?.warrantyPeriod
          })
          data.push({
            confirmMessage: 'Would you like to proceed to order screen?',
            message: 'We have found excellent offers for you.',
            displayType: 'SELECTABLE',
            result: tempArr
          })
        })
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
        if (actionCount === 1) {
          const account = await this.conn.CustAccounts.findOne({
            where: { customerUuid, accountUuid },
            include: [
              {
                model: this.conn.BusinessEntity,
                as: 'accountStatusDesc'
              }
            ]
          })
          data = [
            {
              confirmMessage: 'Is your query resolved?',
              displayType: 'READ-ONLY',
              result: [
                {
                  name: 'Account name',
                  type: 'text',
                  entity: 'ACCOUNT',
                  value: `${account.firstName} ${account.lastName}`
                },
                {
                  name: 'Account status',
                  type: 'text',
                  entity: 'ACCOUNT',
                  value: account.accountStatusDesc.description
                }
              ]
            }
          ]
        } else if (actionCount == 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount == 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async deliveryRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnType, intxnResolution } = intxnDetails
      const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: true,
          interactionCreation: false
        }
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
        if (actionCount == 1) {
          const billing = await this.conn.Billing.findOne({
            where: { customerUuid, serviceUuid, accountUuid }
          })
          data = [
            {
              confirmMessage: 'Is your query resolved?',
              displayType: 'READ-ONLY',
              result: [
                {
                  name: 'Bill Amount',
                  type: 'text',
                  entity: 'BILLING',
                  value: billing.totInvAmount
                },
                {
                  name: 'Bill Date',
                  type: 'text',
                  entity: 'BILLING',
                  value: billing.billDate
                },
                {
                  name: 'Download latest bill',
                  type: 'media',
                  entity: 'BILLING',
                  value: '#'
                }
              ]
            }
          ]
        } else if (actionCount == 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount == 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async supportRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnResolution, intxnType } = intxnDetails
      const { customerUuid } = metaData

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (metaData.actionCount == 1) {
          const interactions = await this.conn.Interaction.findAll({
            where: {
              customerUuid
            },
            order: [['createdBy', 'DESC']],
            limit: 5
          })

          const orders = await this.conn.OrdersTxnDtl.findAll({
            where: {
              customerUuid
            },
            include: [
              {
                model: this.conn.Product,
                as: 'productTxnDtls'
              }
            ],
            order: [['createdBy', 'DESC']],
            limit: 5
          })
          if (interactions.length) {
            interactions.forEach(interaction => {
              const tempArr = []
              tempArr.push({
                name: 'Interaction no',
                type: 'text',
                entity: 'INTERACTION',
                value: interaction.intxnNo
              })
              tempArr.push({
                name: 'Interaction statement',
                type: 'text',
                entity: 'INTERACTION',
                value: interaction.requestStatement
              })
              tempArr.push({
                name: 'Interaction date',
                type: 'text',
                entity: 'INTERACTION',
                value: interaction.createdAt
              })
              data.push({
                confirmMessage: 'Would you like to proceed to order screen?',
                displayType: 'SELECTABLE',
                result: tempArr
              })
            })
          }

          if (orders.length) {
            orders.forEach(order => {
              const tempArr = []
              tempArr.push({
                name: 'Order no',
                type: 'text',
                entity: 'ORDER',
                value: order.orderTxnId
              })
              tempArr.push({
                name: 'Ordered product',
                type: 'text',
                entity: 'ORDER',
                value: order.productTxnDtls.productName
              })
              tempArr.push({
                name: 'Order date',
                type: 'text',
                entity: 'ORDER',
                value: order.createdAt
              })
              data.push({
                confirmMessage: 'Would you like to proceed to order screen?',
                displayType: 'SELECTABLE',
                result: tempArr
              })
            })
          }

          if (!interactions.length && !orders.length) {
            data = {
              message: resolutionInformation.description,
              autoCreate: true
            }
          }
        } else if (metaData.actionCount == 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (metaData.actionCount == 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async paymentRelatedSolution(intxnDetails) {
    let outcome = {}
    let data = []
    try {
      const { intxnType, intxnResolution } = intxnDetails
      const { customerUuid, serviceUuid, accountUuid, actionCount } = metaDats

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: true,
          interactionCreation: false
        }
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
        if (actionCount == 1) {
          const billing = await this.conn.Billing.findOne({
            where: { customerUuid, serviceUuid, accountUuid }
          })
          data = [
            {
              confirmMessage: 'Is your query resolved?',
              displayType: 'READ-ONLY',
              result: [
                {
                  name: 'Bill Amount',
                  type: 'text',
                  value: billing.totInvAmount
                },
                {
                  name: 'Bill Date',
                  type: 'text',
                  value: billing.billDate
                },
                {
                  name: 'Download latest bill',
                  type: 'media',
                  value: '#'
                }
              ]
            }
          ]
        } else if (actionCount == 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount == 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async appointmentRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnType, intxnResolution } = intxnDetails
      const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: true,
          interactionCreation: false
        }
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
        if (actionCount == 1) {
          const billing = await this.conn.Billing.findOne({
            where: { customerUuid, serviceUuid, accountUuid }
          })
          data = [
            {
              displayType: 'READ-ONLY',
              result: [
                {
                  name: 'Bill Amount',
                  type: 'text',
                  value: billing.totInvAmount
                },
                {
                  name: 'Bill Date',
                  type: 'text',
                  value: billing.billDate
                },
                {
                  name: 'Download latest bill',
                  type: 'media',
                  value: '#'
                }
              ]
            }
          ]
        } else if (actionCount == 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount == 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async notificationRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnType, intxnResolution } = intxnDetails
      const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: true,
          interactionCreation: false
        }
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
        if (actionCount == 1) {
          const billing = await this.conn.Billing.findOne({
            where: { customerUuid, serviceUuid, accountUuid }
          })
          data = [
            {
              displayType: 'READ-ONLY',
              result: [
                {
                  name: 'Bill Amount',
                  type: 'text',
                  value: billing.totInvAmount
                },
                {
                  name: 'Bill Date',
                  type: 'text',
                  value: billing.billDate
                },
                {
                  name: 'Download latest bill',
                  type: 'media',
                  value: '#'
                }
              ]
            }
          ]
        } else if (actionCount == 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount == 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  // fault, service status check and return respective message
  async faultRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnType, intxnResolution } = intxnDetails
      const { customerUuid, actionCount } = metaData

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
        if (actionCount == 1) {
          const service = await this.conn.CustServices.findOne({
            where: { customerUuid },
            order: [['createdAt', 'DESC']],
            include: [
              {
                model: this.conn.BusinessEntity,
                as: 'serviceStatusDesc'
              }
            ]
          })
          data = [
            {
              confirmMessage: 'Is your query resolved?',
              message: (service.status == 'SS_AC') ? 'Looks like your service is active. If you still face issue in accessing the service, kindly raise your complaince.' : 'We are sorry is down due to the following reason,',
              displayType: 'READ-ONLY',
              result: [
                {
                  name: 'Service Status',
                  type: 'text',
                  entity: 'SERVICE',
                  value: service.serviceStatusDesc.description
                },
                {
                  name: 'Service Usage',
                  type: 'text',
                  entity: 'SERVICE',
                  value: `${service.serviceUsage} ${service.serviceUnit}`
                },
                {
                  name: 'Service limit',
                  type: 'text',
                  entity: 'SERVICE',
                  value: service.serviceLimit
                },
                {
                  name: 'Available balance',
                  type: 'text',
                  entity: 'SERVICE',
                  value: service.serviceBalance
                }
              ]
            }
          ]
        } else if (actionCount == 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount == 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async accessRelatedSolution(intxnDetails, metaData) {
    let outcome = {}
    let data = []
    try {
      const { intxnType, intxnResolution } = intxnDetails
      const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData

      const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

      if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: true,
          interactionCreation: false
        }
      } else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: true,
          orderCreation: false,
          interactionCreation: false
        }
        if (actionCount == 1) {
          const billing = await this.conn.Billing.findOne({
            where: { customerUuid, serviceUuid, accountUuid }
          })
          data = [
            {
              displayType: 'READ-ONLY',
              result: [
                {
                  name: 'Bill Amount',
                  type: 'text',
                  entity: 'BILLING',
                  value: billing.totInvAmount
                },
                {
                  name: 'Bill Date',
                  type: 'text',
                  entity: 'BILLING',
                  value: billing.billDate
                },
                {
                  name: 'Download latest bill',
                  type: 'media',
                  entity: 'BILLING',
                  value: '#'
                }
              ]
            }
          ]
        } else if (actionCount == 2) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      } else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
        outcome = {
          appointmentRequired: false,
          orderCreation: false,
          interactionCreation: true
        }
        if (actionCount == 1) {
          data = {
            message: resolutionInformation.description,
            autoCreate: true
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Data retrived',
        data: { outcome, data }
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }
}

module.exports = IntelligenceCornerService

const getBirthDate = async (payload) => {
  try {
    let message
    if (!payload?.birthDate || typeof payload?.birthDate.getMonth === 'function') {
      return {
        status: 'ERROR',
        message: 'The customer details are not available'
      }
    }

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()

    const birthDate = new Date(payload?.birthDate)
    const birthYear = birthDate.getFullYear()

    let data
    if ((birthDate.getMonth() + 1) === (currentDate.getMonth() + 1)) {
      if (currentDate.getDate() === birthDate.getDate()) {
        data = [{ birthDate: payload?.birthDate, age: subtract(birthYear, currentYear) < 0 ? subtract(currentYear, birthYear) : subtract(birthYear, currentYear) }]
        message = `Happy BirthDay ${emoji.get('partying_face')}. It\'s {age} Birthday.`
      } else if (subtract(currentDate.getDate(), birthDate.getDate()) < 0 && subtract(currentDate.getDate(), birthDate.getDate()) >= -30) {
        data = [{ birthDate: payload?.birthDate, age: subtract(birthYear, currentYear) < 0 ? subtract(currentYear, birthYear) : subtract(birthYear, currentYear) }]
        message = `Advance Happy birthDay. Your birth day is in less then ${Math.abs(subtract(currentDate.getDate(), birthDate.getDate()))} day`
      } else if (subtract(currentDate.getDate(), birthDate.getDate()) > 0 && subtract(currentDate.getDate(), birthDate.getDate()) <= 30) {
        data = [{ birthDate: payload?.birthDate, age: subtract(birthYear, currentYear) < 0 ? subtract(currentYear, birthYear) : subtract(birthYear, currentYear) }]
        message = `Belated Happy Birthday! ${emoji.get('cake')}. Your birth day is gone in ${Math.abs(subtract(currentDate.getDate(), birthDate.getDate()))} days.`
      }
      return {
        status: 'SUCCESS',
        message,
        data
      }
    }
    return {
      status: 'SUCCESS',
      message: 'This is not your birth Day Month'
    }
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR,
      message: 'Internal server error'
    }
  }
}

const checkCustomerEmotion = async (customerUuid, conn) => {
  try {
    const interactionDetails = await conn.Interaction.findAll({
      where: {
        customerUuid
      }
    })
    if (!interactionDetails) {
      return {
        status: 'ERROR',
        message: 'There is no Interacion details available'
      }
    }

    const postiveInteraction = await conn.Interaction.findAndCountAll({
      where: {
        intxnType: POSITIVE_INTXN_TYPES,
        customerUuid
      }
    })

    const negativeInteraction = await conn.Interaction.findAndCountAll({
      where: {
        intxnType: NEGATIVE_INTXN_TYPES,
        customerUuid
      }
    })

    const neutralInteraction = await conn.Interaction.findAndCountAll({
      where: {
        intxnType: NEUTRAL_INTXN_TYPES,
        customerUuid
      }
    })

    let data = []
    let message
    if (postiveInteraction.count > negativeInteraction.count && postiveInteraction.count > neutralInteraction.count) {
      data = [{ interactionCount: postiveInteraction.count, emoji: emoji.get('smile'), emotion: 'Happy' }]
      message = 'Customer is satistifed with the service'
    } else if (negativeInteraction.count > neutralInteraction.count && negativeInteraction.count > postiveInteraction.count) {
      data = [{ interactionCount: negativeInteraction.count, emoji: emoji.get('rage'), emotion: 'Angry' }]
      message = 'Customer is not sastified with the service'
    } else {
      data = [{ interactionCount: neutralInteraction.count, emoji: emoji.get('neutral_face'), emotion: 'Neutral' }]
      message = 'Customer is neutral with the service'
    }
    return {
      status: 'SUCCESS',
      message,
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

const checkCustomerServiceExpiry = async (customerUuid, conn) => {
  try {
    const checkServiceDetails = await conn.CustServices.findAll({
      // attributes: ['serviceName', 'serviceUuid', 'expiryDate', 'planPayload'],
      where: {
        customerUuid,
        status: {
          [Op.notIn]: [constantCode.status.IN_ACTIVE]
        }
      }
    })

    const getProductDetails = await conn.Product.findAll({
      where: {
        productCategory: 'PC_ADDON'
      },
      order: [['createdAt', 'DESC']]
    })

    // const currentDate = new Date()
    const ServiceDetails = []
    if (checkServiceDetails) {
      for (const e of checkServiceDetails) {
        let formattedService = {}
        if (e.expiryDate) {
          formattedService = formatServiceDetails(e, getProductDetails, conn)
          ServiceDetails.push(formattedService)
          // if ((DateDifference(currentDate, e.expiryDate) < 0 && DateDifference(currentDate, e.expiryDate) > -30)) {
          //   formattedService = formatServiceDetails(e, getProductDetails, conn)
          //   ServiceDetails.push(formattedService)
          // } else if ((DateDifference(currentDate, e.expiryDate) > 0 && DateDifference(currentDate, e.expiryDate) < 30)) {
          //   formattedService = formatServiceDetails(e, getProductDetails, conn)
          //   ServiceDetails.push(formattedService)
          // }
        }
      }
    }
    return ServiceDetails
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR,
      message: 'Internal server error'
    }
  }
}

// const getProductDetails = async (conn, productId) => {
//   try {
//     let productMaster = []
//     productMaster = await conn.Product.findAll({
//       where: {
//         productId,
//         status: constantCode.status.ACTIVE
//       }
//     })

//     return productMaster
//   } catch (error) {
//     logger.error(error)
//     return {
//       status: statusCodeConstants.ERROR,
//       message: 'Internal server error'
//     }
//   }
// }

/*
 message: (serviceUsgPercentage === 100)
      ? 'You Data is exhausted. You can top up to continue enjoying the service.'
      : (serviceUsgPercentage > 75 && serviceUsgPercentage < 100)
          ? `More than ${serviceUsgPercentage}% of your quota ${payload.serviceLimit} is consumed. You can top up to continue enjoying the service.`
          : (serviceUsgPercentage > 50 && serviceUsgPercentage <= 75)
              ? `More than ${serviceUsgPercentage}% of your quota ${payload.serviceLimit} is consumed. We have some exciting TopUp plans specially for you.`
              : (serviceUsgPercentage > 25 && serviceUsgPercentage <= 50)
                  ? `You consumed ${serviceUsgPercentage} of your quota ${payload.serviceLimit}. We have some exciting TopUp plans specially for you.`
                  : '',
*/

const formatServiceDetails = (payload, getProductDetails) => {
  const serviceUsgPercentage = Math.abs((Number(payload.serviceUsage) / Number(payload.serviceLimit)) * 100).toFixed(0)
  return {
    serviceName: get(payload, 'serviceName', ''),
    serviceUuid: get(payload, 'serviceUuid', ''),
    expiryDate: get(payload, 'expiryDate', ''),
    serviceLimit: get(payload, 'serviceLimit', ''),
    serviceBalance: get(payload, 'serviceBalance', ''),
    serviceUsage: get(payload, 'serviceUsage', ''),
    dataUsagePercentage: serviceUsgPercentage,
    message: (serviceUsgPercentage === 100)
      ? 'You Data is exhausted.'
      : (serviceUsgPercentage > 75 && serviceUsgPercentage < 100)
        ? `More than ${serviceUsgPercentage}% of your quota ${payload.serviceLimit} is consumed.`
        : (serviceUsgPercentage > 50 && serviceUsgPercentage <= 75)
          ? `More than ${serviceUsgPercentage}% of your quota ${payload.serviceLimit} is consumed.`
          : (serviceUsgPercentage > 25 && serviceUsgPercentage <= 50)
            ? `You consumed ${serviceUsgPercentage} of your quota ${payload.serviceLimit}.`
            : '',
    remainingDate: DateDifference(new Date(), get(payload, 'expiryDate', ''))
    //  recommendedProduct: formatProductDetails(getProductDetails) || []
    // productDetails: await formatProductDetails(get(payload, 'planPayload', ''), conn)
  }
}

const formatServiceConsumptionDetails = (payload, getProductDetails) => {
  const serviceUsgPercentage = Math.abs((Number(payload.serviceUsage) / Number(payload.serviceLimit)) * 100).toFixed(0)
  return {
    consumptionStatus: get(payload, 'consumptionStatus', ''),
    serviceName: get(payload, 'serviceName', ''),
    serviceUuid: get(payload, 'serviceUuid', ''),
    expiryDate: get(payload, 'expiryDate', ''),
    serviceLimit: get(payload, 'serviceLimit', ''),
    serviceBalance: get(payload, 'serviceBalance', ''),
    serviceUsage: get(payload, 'serviceUsage', ''),
    dataUsagePercentage: serviceUsgPercentage,
    message: (serviceUsgPercentage === 100)
      ? 'You Data is exhausted.'
      : (serviceUsgPercentage > 75 && serviceUsgPercentage < 100)
        ? `More than ${serviceUsgPercentage}% of your quota ${payload.serviceLimit} is consumed.`
        : (serviceUsgPercentage > 50 && serviceUsgPercentage <= 75)
          ? `More than ${serviceUsgPercentage}% of your quota ${payload.serviceLimit} is consumed.`
          : (serviceUsgPercentage > 25 && serviceUsgPercentage <= 50)
            ? `You consumed ${serviceUsgPercentage} of your quota ${payload.serviceLimit}.`
            : '',
    remainingDate: DateDifference(new Date(), get(payload, 'expiryDate', ''))
    //  recommendedProduct: formatProductDetails(getProductDetails) || []
    // productDetails: await formatProductDetails(get(payload, 'planPayload', ''), conn)
  }
}

const formatProductDetails = (payload) => {
  let response = []
  if (Array.isArray(payload) && payload.length > 0) {
    response = []
    each(payload, (payload) => {
      response.push(formatProductDetails(payload))
    })
  } else {
    return {
      productId: get(payload, 'productId', ''),
      productName: get(payload, 'productName', ''),
      productUuid: get(payload, 'productUuid', '')
    }
  }
  return response
}
