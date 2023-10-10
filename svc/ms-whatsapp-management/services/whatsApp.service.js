import { statusCodeConstants, logger, camelCaseConversion, defaultCode, interactionFlowAction, defaultStatus, defaultMessage } from '@utils'
import { isEmpty, get } from 'lodash'
import { config } from '@config/env.config'
import { createChat, sendTestInteractiveWhatsappReply } from './whatsApp.sender.js'
import { Op, QueryTypes } from 'sequelize'
import { assignWFToEntity, continueChatWFExecution, processWhatsAppStartStep } from '../jobs/workflow-engine'
const { WHATSAPP, systemUserId, systemRoleId, systemDeptId, bcae: bcaeConfig } = config;
import { v4 as uuidv4 } from 'uuid'
import { customerStatus } from '../utils/constant.js'
import whatsaAppResources from '@resources'
const natural = require('natural')
import moment from 'moment'

let instance

class WhatsAppService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async sendInteractiveMsg(payload) {
    try {
      await sendTestInteractiveWhatsappReply(payload);

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }


  async fbGet(payload, conn) {
    try {
      logger.info('Verifying the Webhook Token', payload)
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response = false
      const mode = payload.mode
      const token = payload.token
      const challenge = payload.challenge
      if (mode === 'subscribe' && token === WHATSAPP.WA_IHUB_VERIFY_TOKEN) {
        logger.info('Successfully Verified WhatsApp I Hub Webhook')
        response = challenge
      } else if (mode === 'subscribe' && token === WHATSAPP.WA_VERIFY_TOKEN) {
        logger.info('Successfully Verified WhatsApp Webhook')
        response = challenge
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully verified Webhook',
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
  async fbPost(payload, conn) {
    try {
      // console.log('payload------->', JSON.stringify(payload))
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      //console.log('payload====>>', JSON.stringify(payload))
      const entries = payload.entry
      const tenantId = payload['tenant-id']
      const type = payload['type']
      const env = payload['env']
      if (Array.isArray(entries) && !isEmpty(entries)) {
        for (const entry of entries) {
          if (Array.isArray(entry.changes) && !isEmpty(entry.changes)) {
            for (const change of entry.changes) {
              const value = change.value
              if (value != null) {
                const phoneNumberId = value.metadata.phone_number_id
                const phoneNumber = value.metadata.display_phone_number
                const productType = payload.messaging_product
                if (Array.isArray(value.messages) && !isEmpty(value.messages) && value.messages != null) {
                  for (const message of value.messages) {
                    message.productType = productType || ''
                    message.phoneNumber = phoneNumber || ''
                    //console.log('Calling workflow execute')
                    // console.log(phoneNumber, '===', WHATSAPP.WHATSAPP_NUMBER.split("+")[1])
                    //if (phoneNumber === WHATSAPP.WHATSAPP_NUMBER.split("+")[1]) {
                    workflowExecute(message, phoneNumberId, message.from, 'WHATSAPP', tenantId, conn, payload, type, env)
                    // } else if (phoneNumber === WHATSAPP.WA_IHUB_NUMBER.split("+")[1]) {
                    //  workflowExecute(message, phoneNumberId, message.from, 'WHATSAPP-IHUB', tenantId, conn, payload, type, env)
                    //   }

                  }
                }
              }
            }
          }
        }
      }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async validateUser(payload, conn) {
    try {
      logger.debug('Validating User')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const mobileNo = getMobileNumber(payload.whatsappNumber)
      if (!mobileNo) {
        return {
          status: 'FAILED',
          message: 'User Not Found'
        }
      }
      let user = await conn.User.findOne({
        attributes: ['userId', 'customerId', 'userFamily', [conn.sequelize.literal("first_name || ' ' || last_name"), 'full_name'], 'mappingPayload'],
        where: {
          contactNo: mobileNo,
          userGroup: 'UG_BUSINESS',
          status: ['AC', 'ACTIVE']
        }
      })
      user = user?.userFamily && Array.isArray(user?.userFamily)
        && user?.userFamily?.length > 0
        && user?.userFamily?.includes('UAM_WHATS') ? user : undefined

      if (!user) {
        return {
          status: 'FAILED',
          message: 'User Not Found'
        }
      }
      user = user?.dataValues ?? user

      if (user && user?.customerId) {
        const checkExistingCusttomer = await conn.Customer.findOne({
          where: {
            customerId: user?.customerId
          }
        })
        user.customer = checkExistingCusttomer
      }

      //  const response = []
      //   if (user && user.mappingPayload && Array.isArray(user.mappingPayload.userDeptRoleMapping)) {
      //     for (const role of user.mappingPayload.userDeptRoleMapping) {
      //       const roles = await conn.Role.findAll({
      //         attributes: ['roleId', 'roleName', 'roleDesc'],
      //         where: {
      //           roleId: role.roleId
      //         }
      //       })
      //       const department = await conn.BusinessUnit.findOne({
      //         attributes: ['unitId', 'unitName', 'unitDesc', 'unitType'],
      //         where: {
      //           unitId: role.unitId
      //         }
      //       })
      //       if (department) {
      //         const unitId = department.unitId
      //         const unitName = department.unitName
      //         const unitType = department.unitType
      //         const unitDesc = department.unitDesc
      //         response.push({ unitId, unitName, unitType, unitDesc, roles })
      //       }
      //     }
      //   }
      //   let flag = 'FAILED';
      //console.log('WHATSAPP.DEPARTMENT_NAME', WHATSAPP.DEPARTMENT_NAME, WHATSAPP.ROLE_NAME)
      // const consumerSalesDeptRoles = response.filter((ele) => (ele?.unitName === WHATSAPP.DEPARTMENT_NAME));
      // if (consumerSalesDeptRoles && consumerSalesDeptRoles?.length > 0) {
      //   const data = consumerSalesDeptRoles[0].roles;
      //   for (let i = 0; i < data.length; i++) {
      //     if (data[i].roleName === WHATSAPP.ROLE_NAME) {
      //       flag = 'SUCCESS';
      //       break;
      //     }
      //   }
      // }
      return {
        status: 'SUCCESS',
        message: user
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCustomerSummary(payload, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let mobileNo = getMobileNumber(payload.accessNumber)
      if (!mobileNo) {
        return { status: 'FAILED' }
      }
      let customerInfo = await conn.Contact.findOne({
        where: {
          mobileNo,
          contactCategory: "CUSTOMER"
        },
        status: {
          [Op.notIn]: [customerStatus.TEMPORARY, customerStatus.PROSPECT]
        },
        logging: true
      })

      if (!customerInfo) {
        return { status: 'FAILED' }
      }

      customerInfo = customerInfo?.dataValues ?? customerInfo

      // console.log('customerInfo', customerInfo)

      const checkExistingCusttomer = await conn.Customer.findOne({
        include: [{
          model: conn.CustServices,
          as: "customerServices"
        }],
        where: {
          customerNo: customerInfo.contactCategoryValue
        }
      })
      logger.debug('Successfully fetched realtime data');
      if (!checkExistingCusttomer) {
        return { status: 'FAILED' }
      } else {
        return { status: 'SUCCESS' }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getIhubCustomerSummary(payload, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const workflowHdrData = await conn.CustServices.findOne({
        where: {
          serviceNo: payload.accessNumber
        },
        logging: true,
        raw: true
      });
      logger.debug('Successfully fetched realtime data');
      if (!workflowHdrData) {
        return { status: 'FAILED' }
      } else {
        return { status: 'SUCCESS' }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getCustomerSummaryFixedline(payload, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const customerInfo = await conn.CustServices.findOne({
        include: [
          { model: conn.BusinessEntity, as: 'serviceStatusDesc' },
          { model: conn.BusinessEntity, as: 'serviceCatDesc' },
          { model: conn.BusinessEntity, as: 'serviceTypeDesc' }
        ],
        where: {
          serviceNo: payload.accessNumber,
          serviceType: 'ST_FIXED'
        },
        logging: true
      });
      logger.debug('Successfully fetched realtime data');
      if (!customerInfo) {
        return { status: 'FAILED' }
      } else {
        customerInfo.status = 'SUCCESS'
      }
      return { status: 'SUCCESS' }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getCustomerSummaryMobile(payload, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const customerInfo = await conn.CustServices.findOne({
        include: [
          { model: conn.BusinessEntity, as: 'serviceStatusDesc' },
          { model: conn.BusinessEntity, as: 'serviceCatDesc' },
          { model: conn.BusinessEntity, as: 'serviceTypeDesc' }
        ],
        where: {
          serviceNo: payload.accessNumber
          //       ,serviceType: { [Op.in]: ['ST_PREPAID', 'ST_POSTPAID'] }
        }
      });
      logger.debug('Successfully fetched realtime data');
      if (!customerInfo) {
        return { status: 'FAILED' }
      } else {
        customerInfo.status = 'SUCCESS'
      }
      return { status: 'SUCCESS' }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getOpenTickets(payload, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const customerInfo = await conn.CustServices.findOne({
        where: {
          serviceNo: payload.accessNumber
        },
      });
      let status;
      if (!customerInfo) {
        return { status: 'FAILED' }
      }
      const openTickets = await conn.Interaction.findAll({
        include: [
          { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'currStatusDesc', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'interactionCauseDescription', attributes: ['description'] }
        ],
        where: {
          serviceId: customerInfo.serviceId,
          // customerUuid: customerInfo.customerUuid,
          intxnStatus: { [Op.notIn]: ['CLOSED', 'CANCELLED'] }
        },
        transaction: t
      })
      if (openTickets.length > 0) {
        status = 'SUCCESS'
      } else {
        status = 'FAILED'
      }
      logger.debug('Successfully fetched open tickets data')
      return {
        status,
        data: openTickets
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getActiveOffers(payload, conn, t) {
    try {
      logger.debug('Fetching active offers')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const rawQuery = `select * from campaign where service_no='${payload.accessNumber}' and valid_to > current_date  order by valid_from desc`

      const results = await conn.sequelize.query(rawQuery, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      let status = 'FAILED'
      if (results && results?.length > 0) {
        status = 'SUCCESS'
      }
      logger.debug('Successfully fetched active offers data')
      return {
        results,
        status
      }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async contractDetails(payload, conn, t) {

    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const entries = payload.entry
      // if (Array.isArray(entries) && !isEmpty(entries)) {
      //   for (const entry of entries) {
      //     if (Array.isArray(entry.changes) && !isEmpty(entry.changes)) {
      //       for (const change of entry.changes) {
      //         const value = change.value
      //         if (value != null) {
      //           const phoneNumberId = value.metadata.phone_number_id
      //           const phoneNumber = value.metadata.display_phone_number
      //           const productType = body.messaging_product
      //           if (Array.isArray(value.messages) && !isEmpty(value.messages) && value.messages != null) {
      //             for (const message of value.messages) {
      //               message.productType = productType || ''
      //               message.phoneNumber = phoneNumber || ''
      //               //console.log('Calling workflow execute')
      //               workflowExecute(message, phoneNumberId, message.from, 'WHATSAPP', conn, t)
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }
      // }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getInboundMessage(payload, conn, t) {
    try {
      logger.info('Fetching Inbound message data')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const response = await conn.InboundMessages.findOne({
        attributes: ['body', 'profileName'],
        where: { waId: payload.waId, status: { [Op.ne]: 'CLOSED' }, smsStatus: 'received' },
        order: [
          ['inboundId', 'DESC']
        ],
        logging: true
      })
      logger.info('Successfully fetch inbound message data')
      return {
        status: statusCodeConstants.SUCCESS,
        value: response.dataValues
      };
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async whatsAppWorkflow(payload, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { mobileNumber, msg, source, tranId, userFamily, userGroup } = payload

      // console.log('mobileNumber, msg, source===>', mobileNumber, msg, source, userFamily, userGroup)
      const response = await startWorkFlow(mobileNumber, msg, source, tranId, conn, t, userFamily, userGroup)
      //console.log('Response of whatsAppWorkflow in WA service $$$$$$$$$-->', response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getComplaintsList(payload, conn, t) {
    try {
      logger.info('Fetching open complaints list')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let mobileNo = getMobileNumber(payload.accessNumber)
      if (!mobileNo) {
        return { statusCode: 'FAILED' }
      }
      const query = `select cs.service_no ,i.intxn_id ,be_desc(i.service_type) as service_type,i.created_at, be_desc(i.intxn_status ) as curr_status from cmn_contact cc 
                      inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
                      inner join cust_services as cs on cus.customer_id =cs.customer_id 
                      inner join interaction as i on i.customer_id =cs.customer_id and i.account_id =cs.account_id and i.service_id =cs.service_id 
                      where mobile_no ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status ='CS_ACTIVE' and i.intxn_status not in ('CLOSED', 'CANCELLED')`

      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      // console.log('Successfully fetch open complaints list')
      if (!isEmpty(response)) {
        response = camelCaseConversion(response)
        return { statusCode: 'SUCCESS', data: response }
      } else {
        return { statusCode: 'FAILED' }

      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async createComplaint(payload, conn, t) {
    try {
      logger.info('Fetching open complaints list')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      // let mobileNo = getMobileNumber(payload.accessNumber)
      const { accessNumber } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'nextTaskId']
      })
      const mobileNo = workflowHdrResponse.nextTaskId
      if (!mobileNo) {
        return { statusCode: 'FAILED' }
      }


      // --  and cs.status ='SS_AC'
      const query = `select  * from cmn_contact cc 
      inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
      inner join cust_services as cs on cus.customer_id =cs.customer_id 
      where cs.service_No ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status not in ('CS_TEMP','CS_PROSPECT')`

      let interactionData = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })

      if (interactionData) {
        interactionData = camelCaseConversion(interactionData[0])
      }
      if (!interactionData) {
        return { statusCode: 'FAILED' }
      }
      const guid = uuidv4()
      const commonAttrib = {
        tranId: guid,
        createdDeptId: systemDeptId,
        createdRoleId: systemRoleId,
        createdBy: systemUserId,
        updatedBy: systemUserId
      }

      const intxnUid = uuidv4()
      const interaction = {
        intxnUuid: intxnUid,
        requestId: 42,//interactionData.statementId,
        customerId: interactionData?.customerId || null,
        intxnCategory: 'SERVICE_RELATED',
        requestStatement: 'MY SERVICE IS NOT WORKING',
        accountId: interactionData?.accountId || null,
        serviceId: interactionData?.serviceId || null,
        intxnDescription: 'MY SERVICE IS NOT WORKING',
        intxnType: 'APPEALS',
        serviceType: interactionData?.serviceType || null,
        serviceCategory: interactionData?.serviceCategory || null,
        intxnChannel: 'WHATSAPP-LIVECHAT',
        currUser: null,
        currEntity: interactionData?.createdDeptId,
        rcResolution: '',
        intxnStatus: 'NEW',
        currRole: interactionData?.createdRoleId,
        ...commonAttrib
      }
      const response = await conn.Interaction.create(interaction, { transaction: t })
      const addHistory = {
        intxnId: response.intxnId,
        intxnType: response.intxnType,
        intxnTxnUuid: uuidv4(),
        intxnUuid: intxnUid,
        serviceCategory: response.serviceCategory || null,
        serviceType: response.serviceType,
        intxnChannel: response.channel,
        fromEntityId: response.currEntity,
        fromRoleId: response.currRole,
        fromUserId: systemUserId,
        toEntityId: response.currEntity,
        toRoleId: response.currRole,
        toUserId: systemUserId,
        intxnFlow: 'INTXN_NEW',//interactionFlowAction.CREATED,
        flwCreatedBy: systemUserId,
        intxnTxnStatus: 'NEW', //defaultStatus.NEW,
        isFollowup: 'N',//defaultCode.NO,
        intxnCreatedDate: new Date(),
        intxnCreatedBy: systemUserId,
        intxnPriority: "PRTYHGH",
        intxnChannel: 'WHATSAPP-LIVECHAT',
        ...commonAttrib
      }
      await conn.InteractionTxn.create(addHistory, { transaction: t })

      logger.info('Successfully fetch open complaints list')
      if (!isEmpty(response)) {
        const intxnId = response.intxnId
        return { statusCode: 'SUCCESS', data: { intxnId } }
      } else {
        return { statusCode: 'FAILED' }

      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async createfollowUp(payload, conn, t) {
    try {
      logger.info('Fetching followUp')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let mobileNo = getMobileNumber(payload.accessNumber)
      if (!mobileNo) {
        return { statusCode: 'FAILED' }
      }

      const intxnId = payload.intxnId
      const followUp = {
        priorityCode: 'PR0001',
        slaCode: 'SRC020',
        remarks: 'Customer follow up on this Ticket',
        intxnStatus: 'NEW',
        intxnId: intxnId
      }
      const intxnData = await conn.Interaction.findOne({ where: { intxnId } })

      // const reportData = await conn.WhatsAppReport.findOne({
      //   where: {
      //     whatsappNumber: mobileNo,
      //     status: 'CREATED'
      //   },
      //   raw: true
      // })
      // console.log('reportData', reportData)
      // if (reportData) {
      //   const dtlReportData = await WhatsAppReportDtl.findOne({
      //     where: {
      //       whatsappNumber: mobileNo,
      //       accessNumber: intxnData?.identificationNo,
      //       status: 'CREATED',
      //       reportId: reportData.reportId
      //     },
      //     raw: true
      //   })
      //   console.log('dtlReportData', dtlReportData)
      //   if (!dtlReportData) {
      //     const mappingInfo = await CustomerAccContactDtl.findOne({
      //       where: {
      //         identificationNo: intxnData.identificationNo,
      //         status: 'ACTIVE'
      //       },
      //       raw: true
      //     })
      //     if (mappingInfo) {
      //       const createData = {
      //         contactNumber: mappingInfo.contactNo,
      //         accessNumber: mappingInfo.identificationNo,
      //         serviceType: mappingInfo.planType,
      //         whatsappNumber: req.body.accessNumber,
      //         createdBy: systemUserId,
      //         reportId: reportData.reportId,
      //         status: 'CREATED'
      //       }
      //       await WhatsAppReportDtl.create(createData, { where: { reportId: reportData.reportId }, transaction: t })
      //     }
      //   }
      // }

      if (intxnData) {
        const previousHistory = await conn.InteractionTxn.findOne({
          order: [['createdAt', 'DESC']],
          where: {
            intxnId: intxnId,
            isFollowup: 'N'//defaultCode.NO
          }
        })
        // console.log('previousHistorypreviousHistorypreviousHistory', previousHistory)
        const commonAttrib = {
          tranId: uuidv4(),
          createdDeptId: 'DEPT.OU.ORG',
          createdRoleId: systemRoleId,
          createdBy: systemUserId,
          updatedBy: systemUserId
        }
        const followUpData = {
          intxnId: previousHistory.intxnId,
          intxnType: previousHistory.intxnType,
          intxnTxnUuid: uuidv4(),
          intxnUuid: previousHistory.intxnUuid,
          intxnCause: previousHistory.problemCause,
          serviceCategory: previousHistory.serviceCategory,
          serviceType: previousHistory.serviceType,
          intxnPriority: 'PRTYHGH',
          intxnChannel: 'WHATSAPP',
          contactPreference: previousHistory.contactPreference,
          fromEntityId: previousHistory.fromEntityId,
          fromRoleId: previousHistory.fromRoleId,
          fromUserId: previousHistory.fromUserId,
          toEntityId: previousHistory.toEntityId,
          toRoleId: previousHistory.toRoleId,
          toUserId: previousHistory.toUserId,
          remarks: 'Customer follow up on this Ticket',
          intxnFlow: 'INTXN_FOLLOWUP',//interactionFlowAction.FOLLOWUP,
          flwCreatedBy: systemUserId,
          intxnTxnStatus: previousHistory.intxnTxnStatus,
          isFollowup: 'Y',//defaultCode.YES,
          intxnCreatedDate: new Date(),
          intxnCreatedBy: systemUserId,
          ...commonAttrib
        }
        const followUp = await conn.InteractionTxn.create(followUpData, { transaction: t })
        logger.info('Successfully fetch followUp')
        if (followUp) {
          return { statusCode: 'SUCCESS' }
        } else {
          return { statusCode: 'FAILED' }
        }
      } else {
        return { statusCode: 'FAILED' }
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }
  async getNoOfCategories(payload, conn, t) {
    try {
      logger.info('Fetching No Of Categories')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let mobileNo = getMobileNumber(payload.accessNumber)
      if (!mobileNo) {
        return { status: 'FAILED' }
      }
      const query = `select * from cmn_contact cc inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
      inner join cust_services as cs on cus.customer_id =cs.customer_id  where mobile_no ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status  not in ('CS_TEMP','CS_PROSPECT')`

      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      logger.info('Successfully fetch No Of Categories')
      return {
        status: 'SUCCESS',
        message: String(response.length)
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getListOfCategories(payload, conn, t) {
    try {
      logger.info('Fetching Categories list')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let mobileNo = getMobileNumber(payload.accessNumber)
      if (!mobileNo) {
        return { statusCode: 'FAILED' }
      }
      const query = `select *,be_desc(cs.service_type) as service_type, cs.service_no as service_no, cs.service_name as service_name  from cmn_contact cc inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
      inner join cust_services as cs on cus.customer_id =cs.customer_id  where mobile_no ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status not in ('CS_TEMP','CS_PROSPECT') `

      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      response = camelCaseConversion(response)
      return { statusCode: "SUCCESS", data: response }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getServiceType(payload, conn, t) {
    try {
      logger.info('Fetching open complaints list')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let mobileNo = getMobileNumber(payload.accessNumber)
      if (!mobileNo) {
        return { statusCode: 'FAILED' }
      }
      const query = `select *, cs.service_no as service_no from cmn_contact cc inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
      inner join cust_services as cs on cus.customer_id =cs.customer_id  where mobile_no ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status not in ('CS_TEMP','CS_PROSPECT') `

      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      response = camelCaseConversion(response)
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        attributes: ['wfHdrId'],
        where: {
          entityId: mobileNo,
          wfStatus: 'CREATED'
        },
        raw: true,
        logging: true
      })
      //console.log('workflowHdrResponse===>', workflowHdrResponse)
      const contextUpdate = await conn.WorkflowHdr.update({ nextTaskId: response[0]?.serviceNo },
        { where: { wfHdrId: workflowHdrResponse?.wfHdrId }, transaction: t })
      if (contextUpdate) {
        const reportData = await conn.WhatsAppReport.findOne({
          where: {
            whatsappNumber: mobileNo,
            status: 'CREATED'
          },
          raw: true
        })
        if (reportData) {
          const dtlReportData = await conn.WhatsAppReportDtl.findOne({
            where: {
              whatsappNumber: mobileNo,
              accessNumber: mobileNo.substring(3),
              status: 'CREATED',
              reportId: reportData.reportId
            },
            raw: true
          })
          if (!dtlReportData) {
            if (response.length > 0) {
              const createData = {
                contactNumber: response[0].mobileNo,
                accessNumber: response[0].serviceNo,
                serviceType: response[0].serviceType,
                whatsappNumber: mobileNo,
                createdBy: systemUserId,
                reportId: reportData.reportId,
                status: 'CREATED'
              }
              await conn.WhatsAppReportDtl.create(createData, { where: { reportId: reportData.reportId }, transaction: t })
            }
          }
        }
        logger.info('Successfully fetch open complaints list')
        return { statusCode: 'Common' }
      }
      logger.info('Successfully fetch open complaints list')
      return { statusCode: 'FAILED' }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getServiceCategory(payload, conn, t) {
    try {
      logger.info('Fetching Service Category')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { accessNumber, inputMsg } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'wfContext'],
      })
      const categoryList = workflowHdrResponse?.wfContext?.categoryList || []

      const categoryData = categoryList.find((x) => String(x.indexId) === String(inputMsg))

      //console.log('------->>Successfully fetch Service Category', categoryData)
      if (categoryData) {
        const contextUpdate = await conn.WorkflowHdr.update({ nextTaskId: categoryData.service_no },
          { where: { wfHdrId: workflowHdrResponse.wfHdrId }, transaction: t })
        //console.log('--------2342343')
        if (contextUpdate) {
          // const reportData = await conn.WhatsAppReport.findOne({
          //   where: {
          //     whatsappNumber: accessNumber,
          //     status: 'CREATED'
          //   },
          //   raw: true,
          //   logging:true
          // })
          // //console.log('reportData======>',reportData)
          // if (reportData) {
          //   const dtlReportData = await conn.WhatsAppReportDtl.findOne({
          //     where: {
          //       whatsappNumber: accessNumber,
          //       accessNumber: categoryData.identificationNo,
          //       status: 'CREATED',
          //       reportId: reportData.reportId
          //     },
          //     raw: true
          //   })
          //   console.log('dtlReportData==>',dtlReportData)
          //   if (!dtlReportData) {
          //     if (categoryData) {
          //       const createData = {
          //         contactNumber: categoryData.contactNo,
          //         accessNumber: categoryData.identificationNo,
          //         serviceType: categoryData.planType,
          //         whatsappNumber: accessNumber,
          //         createdBy: systemUserId,
          //         reportId: reportData.reportId,
          //         status: 'CREATED'
          //       }
          //       await conn.WhatsAppReportDtl.create(createData, { where: { reportId: reportData.reportId }, transaction: t })
          //     }
          //   }
          // }
          await t.commit()
          return { statusCode: 'Common' }
        } else {
          if (inputMsg && inputMsg.toUpperCase() === 'HELP') {
            await t.commit()
            return { statusCode: 'HELP' }
          } else {
            await t.commit()
            logger.debug(defaultMessage.NOT_FOUND)
            return { statusCode: 'FAILED' }
          }
        }
      } else {
        if (inputMsg && inputMsg.toUpperCase() === 'HELP') {
          await t.commit()
          return { statusCode: 'HELP' }
        } else {
          await t.commit()
          logger.debug(defaultMessage.NOT_FOUND)
          return { statusCode: 'FAILED' }
        }
      }
      return { statusCode: 'FAILED' }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getAccountDetails(payload, conn, t) {
    try {
      logger.info('Fetching Account Details')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { accessNumber } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'nextTaskId']
      })
      const mobileNo = workflowHdrResponse.nextTaskId
      const query = `select concat(ca.first_name,' ',ca.last_name) as name,ca.account_no as account_no,cc.email_id,be_desc(cus.status) as customer_status from cmn_contact cc 
                           inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
                           inner join cust_services as cs on cus.customer_id =cs.customer_id
                           inner join cust_accounts ca on ca.customer_id =cus.customer_id where cs.service_no ='${mobileNo}' 
                           and contact_category ='CUSTOMER' and  cus.status not in ('CS_TEMP','CS_PROSPECT') `

      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      if (response) {
        response = camelCaseConversion(response[0])
      }
      return { statusCode: "SUCCESS", data: response }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getPrepaidCreditDetails(payload, conn, t) {
    try {
      logger.info('Fetching Prepaid Credit Details')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { accessNumber } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'nextTaskId']
      })
      const mobileNo = workflowHdrResponse.nextTaskId
      const query = `select  cs.service_balance as balance from cmn_contact cc 
                     inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
                     inner join cust_services as cs on cus.customer_id =cs.customer_id 
                     where mobile_no ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status ='CS_ACTIVE'`

      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      if (response) {
        response = camelCaseConversion(response[0])
      }
      return { statusCode: "SUCCESS", data: response }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getPrepaidBoosterDetails(payload, conn, t) {
    try {
      logger.info('Fetching Prepaid Booster Details')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { accessNumber } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'nextTaskId']
      })
      const mobileNo = workflowHdrResponse.nextTaskId
      const query = `select pm.product_name ,pcm.charge_amount,pcm.start_date ,pcm.end_date ,cs.service_name,cs.service_type, cs.service_status, cs.service_id,cs.product_id from cmn_contact cc 
                           inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
                           inner join bcae_service_dtl_vw as cs on cus.customer_id =cs.customer_id
                           inner join product_mst pm on pm.product_id = cs.product_id::bigint 
                          inner join product_charge_map pcm on pcm.product_id =pm.product_id
                           where mobile_no ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status ='CS_ACTIVE'`

      let list = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      if (!isEmpty(list)) {
        list = camelCaseConversion(list)
      }
      return { statusCode: "SUCCESS", data: { list } }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getPostpaidPlanInfo(payload, conn, t) {
    try {
      logger.info('Fetching Postpaid Plan Info')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { accessNumber } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'nextTaskId']
      })
      const mobileNo = workflowHdrResponse.nextTaskId
      const query = `select pm.product_name ,pcm.charge_amount,pcm.start_date ,pcm.end_date ,cs.service_name,cs.service_type, cs.service_status, cs.service_id,cs.product_id from cmn_contact cc 
                      inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
                      inner join bcae_service_dtl_vw as cs on cus.customer_id =cs.customer_id
                      inner join product_mst pm on pm.product_id = cs.product_id::bigint 
                      inner join product_charge_map pcm on pcm.product_id =pm.product_id
                      where mobile_no ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status ='CS_ACTIVE'
                      and cs.service_type ='Postpaid' and pcm.status ='AC'`

      let list = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      if (!isEmpty(list)) {
        list = camelCaseConversion(list[0])
      }
      return { statusCode: "SUCCESS", data: list }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getFixedlinePlanInfo(payload, conn, t) {
    try {
      logger.info('Fetching Fixed Plan Info')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { accessNumber } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'nextTaskId']
      })
      const mobileNo = workflowHdrResponse.nextTaskId
      // console.log('--------------mobileNo', mobileNo)
      const query = `select pcm.charge_amount as charge ,pm.product_name ,be_desc(pm.status) as plan_status,pcm.charge_amount,pcm.start_date ,pcm.end_date ,cs.service_name,cs.service_type, cs.service_status, cs.service_id,cs.product_id 
      ,coalesce(cs.service_usage, 0)  as dataUsage, coalesce(cs.service_limit,0) as dataLimit from cmn_contact cc 
                      inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
                      inner join bcae_service_dtl_vw as cs on cus.customer_id =cs.customer_id
                      inner join product_mst pm on pm.product_id = cs.product_id::bigint 
                      inner join product_charge_map pcm on pcm.product_id =pm.product_id
                      where cs.service_no ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status not in ('CS_TEMP','CS_PROSPECT')
                      and pcm.status ='AC'`
      // console.log('------------------query', query)
      let list = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      if (!isEmpty(list)) {
        list = camelCaseConversion(list[0])
      }
      return { statusCode: "SUCCESS", data: list }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getFixedlineBoosterDetails(payload, conn, t) {
    try {
      logger.info('Fetching Fixed booster Info')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { accessNumber } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'nextTaskId']
      })
      const mobileNo = workflowHdrResponse.nextTaskId
      //  and cs.service_type ='Fixed'
      const query = `select pcm.charge_amount as charge ,pcm.end_date as expiry_date,pcm.start_date as start_date,pm.product_name ,pm.status as plan_status,pcm.charge_amount,pcm.start_date ,pcm.end_date ,cs.service_name,cs.service_type, cs.service_status, cs.service_id,cs.product_id from cmn_contact cc 
      inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
      inner join bcae_service_dtl_vw as cs on cus.customer_id =cs.customer_id
      inner join product_mst pm on pm.product_id = cs.product_id::bigint and pm.product_category ='PC_ADDON'
      inner join product_charge_map pcm on pcm.product_id =pm.product_id
      where cs.service_no ='${mobileNo}' and contact_category ='CUSTOMER' 
      and cus.status not in ('CS_TEMP','CS_PROSPECT')
      and pcm.status ='AC'`

      let list = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      if (!isEmpty(list)) {
        list = camelCaseConversion(list)
      }
      return { statusCode: "SUCCESS", data: list }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getServiceStatus(payload, conn, t) {
    try {
      logger.info('Fetching Service Status')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { accessNumber } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'nextTaskId']
      })
      const mobileNo = workflowHdrResponse.nextTaskId
      const query = `select  cs.service_balance as balance,be_desc(cs.status) as status from cmn_contact cc 
                     inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
                     inner join cust_services as cs on cus.customer_id =cs.customer_id 
                     where mobile_no ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status ='CS_ACTIVE' and cs.status ='SS_AC'`

      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      if (response) {
        response = camelCaseConversion(response[0])
        if (response.status === 'SS_AC') {
          return { statusCode: "SUCCESS", data: response }
        } else {
          return { statusCode: "FAILED", data: response }
        }
      } else {
        return { statusCode: "FAILED", data: response }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
  async getFixedlineServiceStatus(payload, conn, t) {
    try {
      logger.info('Fetching Fixed line Service Status')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { accessNumber } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'nextTaskId']
      })
      const mobileNo = workflowHdrResponse.nextTaskId
      // and cs.service_type ='ST_FIXED'
      const query = `select  cs.service_balance as balance,be_desc(cs.status) as status from cmn_contact cc 
                     inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
                     inner join cust_services as cs on cus.customer_id =cs.customer_id 
                     where cs.service_no ='${mobileNo}' and contact_category ='CUSTOMER' 
                     and cus.status not in ('CS_TEMP','CS_PROSPECT') 
                     `

      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      if (response) {
        response = camelCaseConversion(response)
        return { statusCode: "SUCCESS", data: response }
      } else {
        return { statusCode: "FAILED", data: response }
      }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getBillInfo(payload, conn, t) {
    try {
      logger.info('Fetching Bill Info')
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { accessNumber } = payload
      const workflowHdrResponse = await conn.WorkflowHdr.findOne({
        where: {
          entityId: accessNumber,
          wfStatus: 'CREATED'
        },
        raw: true,
        attributes: ['wfHdrId', 'nextTaskId']
      })
      const mobileNo = workflowHdrResponse.nextTaskId
      // console.log('-----------,mobileNo', mobileNo)
      const query = `select inc.*  from cmn_contact cc 
            inner join cust_customers as cus on cus.customer_no =cc.contact_category_value
            inner join cust_services as cs on cus.customer_id =cs.customer_id  
            inner join contract_hdr ch on ch.customer_id =cs.customer_id and cs.service_id =ch.service_id 
            inner join invoice inc on inc.contract_id =ch.contract_id 
            where cs.service_no ='${mobileNo}' and contact_category ='CUSTOMER' and cus.status not in ('CS_TEMP','CS_PROSPECT')`
      // console.log('-----------,query', query)
      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      if (response) {
        response = camelCaseConversion(response[0])
      } else {
        return { statusCode: "FAILED", data: response }
      }
      return { statusCode: "FAILED", data: response }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getInteractionList(payload, conn) {
    try {
      // let { phoneNumber } = payload

      // if (!phoneNumber) {
      //   return {
      //     status: statusCodeConstants?.SUCCESS,
      //     message: 'No Data found',
      //     data: {
      //       count: 0,
      //       data: []
      //     }
      //   }
      // }

      // phoneNumber = getMobileNumber(phoneNumber)
      let checkExistingUser
      if (payload && payload?.phoneNumber) {
        const phoneNumber = getMobileNumber(payload?.phoneNumber)
        checkExistingUser = await conn.User.findOne({
          attributes: ['userId', 'customerId'],
          where: {
            contactNo: phoneNumber,
            status: [defaultStatus?.ACTIVE]
          }
        })

        if (isEmpty(checkExistingUser)) {
          return {
            status: statusCodeConstants?.SUCCESS,
            message: 'No Data found',
            data: {
              count: 0,
              data: []
            }
          }
        }

        checkExistingUser = checkExistingUser?.dataValues ?? checkExistingUser
      }



      let whereClauses = {
        intxnStatus: {
          [Op.notIn]: ['CLOSED']
        }
      }

      if (payload && payload?.serviceCategory) {
        whereClauses.serviceCategory = payload?.serviceCategory
      }

      if (checkExistingUser && checkExistingUser?.customerId) {
        whereClauses.customerId = checkExistingUser?.customerId
      }

      if (payload && payload?.customerNo) {
        const checkExistingCusttomer = await conn.Customer.findOne({
          where: {
            customerNo: payload?.customerNo
          }
        })
        whereClauses.customerId = checkExistingCusttomer?.customerId
      }

      const interactionList = await conn.Interaction.findAll({
        attributes: ['intxnId', 'intxnNo', 'createdAt'],
        include: [{
          model: conn.BusinessUnit,
          as: 'departmentDetails',
          attributes: ['unitDesc']
        }, {
          model: conn.Role,
          as: 'roleDetails',
          attributes: ['roleDesc']
        }],
        where: {
          ...whereClauses
        },
        logging: true,
        limit: 8,
        order: [['createdAt', 'DESC']]
      })

      return {
        status: statusCodeConstants?.SUCCESS,
        message: 'Interaction List fetched Successfully',
        data: {
          count: interactionList?.length || 0,
          data: interactionList
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getInteractionDetails(payload, conn) {
    try {
      const { interactionNumber } = payload

      if (!interactionNumber) {
        return {
          status: statusCodeConstants?.SUCCESS,
          message: 'No Data found',
          data: {
            count: 0,
            data: []
          }
        }
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          codeType: ['INTXN_CATEGORY', 'INTERACTION_STATUS', 'INTXN_FAMILY',
            'CONTACT_PREFERENCE', 'INTXN_STATUS_REASON', 'TICKET_CHANNEL', 'PRIORITY', 'INTXN_TYPE',
            'SERVICE_TYPE', 'INTXN_STATEMENT', 'INTXN_FLOW', 'SERVICE_CATEGORY', 'INTXN_CAUSE', 'CUSTOMER_CATEGORY', 'CUSTOMER_STATUS']
        }
      })

      const businessUnitInfo = await conn.BusinessUnit.findAll({
        attributes: ['unitId', 'unitName', 'unitDesc'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const roleinfo = await conn.Role.findAll({
        attributes: ['roleId', 'roleName', 'roleDesc'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })


      const interactionDetails = await conn.Interaction.findAll({
        include: [{
          model: conn.Customer,
          as: "customerDetails"
        }],
        where: {
          intxnNo: interactionNumber
        }
      })

      let formattedResponse = whatsaAppResources.transformInteraction(interactionDetails, businessEntityInfo, businessUnitInfo, roleinfo)
      const data = formattedResponse?.[0]
      // \nType - ${data?.intxnType?.description || 'N/A'}\nService Type - ${data?.serviceType?.description || 'N/A'}\n
      // const response = `Interaction Details 🧑‍💻🧑‍💻\n\nName: ${data?.customerDetails?.firstName} ${data?.customerDetails?.lastName}\nInteraction Number - ${data?.intxnNo || 'N/A'}\nCategory - ${data?.intxnCategory?.description || 'N/A'}Priority - ${data?.intxnPriority?.description || 'N/A'}\nCurrent Deparment / Role - ${data?.currentDepartment?.description?.unitDesc || 'N/A'}/${data?.currentRole?.description?.roleName || 'N/A'}\ncurrent Status - ${data?.intxnStatus?.description}`
      const response = `Interaction Details 🧑‍💻🧑‍💻\n\nName - ${data?.customerDetails?.firstName} ${data?.customerDetails?.lastName}\nInteraction Number - ${data?.intxnNo || 'N/A'}\nCategory - ${data?.intxnCategory?.description || 'N/A'}\nExpected Date- ${data?.expectedDateofCompletion ? moment(data?.expectedDateofCompletion).format('DD-MM-YYYY') : '-'}\nDescription - ${data?.requestStatement || '-'} \nCreated Date - ${data?.createdAt ? moment(data?.createdAt).format('DD-MM-YYYY') : '-'} \nCurrent Status - ${data?.intxnStatus?.description}`

      return {
        status: statusCodeConstants?.SUCCESS,
        message: 'Interaction Details Fetched Successfully',
        data: {
          count: interactionDetails?.length || 0,
          data: formattedResponse || [],
          message: response
        }
      }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getBusinessParameterLookup(lookup, conn) {
    try {
      const codeTypes = lookup.valueParam.split(',');

      const response = {};

      for (const codeType of codeTypes) {
        const businessEntities = await conn.BusinessEntity.findAll({
          // include: [
          //   {
          //     model: conn.MetaTypeCodeLu, as: 'codeTypeDesc', attributes: ['description']
          //   }
          // ],
          where: {
            codeType,
            status: defaultStatus.ACTIVE,
          },
          order: [["description", "ASC"]],
        });

        response[codeType] = [];

        for (const row of businessEntities) {
          response[codeType].push({
            code: row.code,
            description: row.description,
            codeType: row.codeType,
            codeTypeDesc: row.codeTypeDesc,
            mapping: row.mappingPayload,
            status: row.status,
          });
        }
      }

      if (response.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: "Not Record found for your given search Param",
          data: response,
        };
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: "Successfully fetched Business Parameter data",
        data: response,
      };
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getRequestStatement(payload, conn) {
    try {

      const { requestId } = payload

      let response = await conn.KnowledgeBase.findOne({
        include: [
          {
            attributes: ['code', 'description'],
            model: conn.BusinessEntity,
            as: 'intxnResolutionDesc'
          }
        ],
        where: {
          requestId
        }
      })

      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: "Not Record found for your given search Param",
          data: response,
        };
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: "Successfully fetched Business Parameter data",
        data: response,
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getRequestStatementList(payload, conn) {
    try {
      const { keywords } = payload

      const stopwords = new Set(natural.stopwords)
      const tokenizer = new natural.WordTokenizer()
      const words = tokenizer.tokenize(keywords)
      const importantWords = words.filter((word) => !stopwords.has(word))

      const whereClause = {}

      if (importantWords) {
        whereClause.requestStatement = {
          [Op.iRegexp]: `(${importantWords.join('|')})`
        }
      }

      if (payload && payload?.serviceCategory) {
        whereClause.serviceCategory = payload?.serviceCategory
      }

      if (isEmpty(whereClause)) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: "Successfully fetched Business Parameter data",
          data: {
            count: 0,
            rows: []
          },
        }
      }

      let response = await conn.KnowledgeBase.findAndCountAll({
        include: [
          {
            attributes: ['code', 'description'],
            model: conn.BusinessEntity,
            as: 'intxnResolutionDesc'
          }
        ],
        where: {
          ...whereClause
        }
      })


      return {
        status: statusCodeConstants.SUCCESS,
        message: "Successfully fetched Business Parameter data",
        data: response,
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getServiceList(payload, conn) {
    try {
      const whereClause = {}

      if (payload && payload?.customerId) {
        whereClause.customerId = payload?.customerId
      }

      if (payload && payload?.serviceCategory) {
        whereClause.serviceCategory = payload?.serviceCategory
      }

      const serviceDetails = await conn.CustServices.findAll({
        attributes: ['serviceNo', 'serviceName'],
        include: [
          { model: conn.BusinessEntity, attributes: ['code', 'description'], as: 'serviceStatusDesc' },
          { model: conn.BusinessEntity, attributes: ['code', 'description'], as: 'serviceCatDesc' },
          { model: conn.BusinessEntity, attributes: ['code', 'description'], as: 'serviceTypeDesc' }
        ],
        where: {
          ...whereClause
        }
      })
      const currentDate = moment().format('YYYY-MM-DD')
      const reservation = await conn.AppointmentTxn.findAll({
        attributes: ['appointTxnId', 'appointDate', 'status', 'appointStartTime', 'appointEndTime', 'appointmentTxnNo'],
        include: [
          { model: conn.BusinessEntity, as: 'appointModeDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'appointModeValueDesc', attributes: ['code', 'description'] },
          {
            model: conn.Interaction,
            as: 'interactionDetails',
            attributes: ['intxnNo'],
            where: {
              ...whereClause
            }
          }
        ],
        where: {
          appointDate: {
            [Op.gte]: currentDate
          }
        }
      })
      const response = { serviceDetails, reservation }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service Details fetched sucessfully',
        data: {
          count: (serviceDetails?.length || 0) + (reservation?.length || 0),
          rows: response
        }
      }
    }
    catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getServiceDetails(payload, conn) {
    try {
      const { serviceNumber } = payload

      if (!serviceNumber) {
        return {
          status: statusCodeConstants?.SUCCESS,
          message: 'No Data found',
          data: {
            count: 0,
            data: []
          }
        }
      }

      const serviceDetails = await conn.CustServices.findOne({
        attributes: ['serviceNo', 'serviceName'],
        include: [
          { model: conn.BusinessEntity, attributes: ['code', 'description'], as: 'serviceStatusDesc' },
          { model: conn.BusinessEntity, attributes: ['code', 'description'], as: 'serviceCatDesc' },
          { model: conn.BusinessEntity, attributes: ['code', 'description'], as: 'serviceTypeDesc' }
        ],
        where: {
          serviceNo: payload?.serviceNumber
        },
        logging: true
      })

      const resvervationDetails = await conn.AppointmentTxn.findOne({
        attributes: ['appointTxnId', 'appointDate', 'status', 'appointStartTime', 'appointEndTime'],
        include: [
          { model: conn.BusinessEntity, as: 'appointModeDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'appointModeValueDesc', attributes: ['code', 'description'] }
        ],
        where: {
          appointmentTxnNo: payload?.serviceNumber // we can get appointmentTxnNo in serviceNumber variable
        }
      })

      let response

      if (serviceDetails) {
        response = `**** Service Details ****\n\nService Number - ${serviceDetails?.serviceNo || 'N/A'}\nCategory - ${serviceDetails?.serviceCatDesc?.description || 'N/A'}\nnService Type - ${serviceDetails?.serviceTypeDesc?.description || 'N/A'}\nStatus - ${serviceDetails?.serviceStatusDesc?.description}`
      }

      if (resvervationDetails) {
        response = `**** Reservation Details **** \n\n ${resvervationDetails?.appointModeValueDesc?.description ? '*' + resvervationDetails?.appointModeValueDesc?.description + '*' : '-'}\n\nReservation Date - ${resvervationDetails?.appointDate ? moment(resvervationDetails?.appointDate).format('DD-MM-YYYY') : ' - '}\nTime - ${(resvervationDetails?.appointStartTime || '-') + '-' + (resvervationDetails?.appointEndTime || '-')}\nType - ${(resvervationDetails?.appointModeDesc?.description || '-')}`
      }

      response = response + '\n\n_Note: Type *Help* for back to main menu_'

      return {
        status: statusCodeConstants?.SUCCESS,
        message: 'Service Details Fetched Successfully',
        data: {
          count: serviceDetails || resvervationDetails ? 1 : 0,
          data: { serviceDetails, resvervationDetails } || [],
          message: response
        }
      }

    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async searchInteractionWithKeyword(payload, conn) {
    try {

      let whereClauses = {
        intxnStatus: {
          [Op.notIn]: ['CLOSED']
        }
      }
      if (payload && payload?.interactionNumber) {
        whereClauses.intxnNo = { [Op.iLike]: `%${payload?.interactionNumber}%` }
      }

      const interactionList = await conn.Interaction.findAll({
        attributes: ['intxnId', 'intxnNo', 'createdAt'],
        include: [{
          model: conn.BusinessUnit,
          as: 'departmentDetails',
          attributes: ['unitDesc']
        }, {
          model: conn.Role,
          as: 'roleDetails',
          attributes: ['roleDesc']
        }],
        where: {
          ...whereClauses
        },
        logging: true,
        limit: 8,
        order: [['createdAt', 'DESC']]
      })

      return {
        status: statusCodeConstants?.SUCCESS,
        message: 'Interaction List fetched Successfully',
        data: {
          count: interactionList?.length || 0,
          data: interactionList
        }
      }
    } catch (error) {

    }
  }

  async getCustomerList(payload, conn, t) {
    try {
      const customerList = await conn.Customer.findAll({
        where: {
          status: [customerStatus.ACTIVE]
        }
      })
      logger.debug('Successfully fetched realtime data');
      if (!customerList) {
        return { status: 'FAILED' }
      } else {
        return {
          status: statusCodeConstants?.SUCCESS,
          count: customerList?.length || 0,
          data: customerList
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCustomerDetails(payload, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.FAILED,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const checkExistingCusttomer = await conn.Customer.findOne({
        include: [{
          model: conn.Contact,
          as: "customerContact"
        },
        {
          model: conn.BusinessEntity,
          as: "statusDesc"
        },
        {
          model: conn.BusinessEntity,
          as: "customerCatDesc"
        },
        {
          model: conn.BusinessEntity,
          as: "customerClassDesc"
        },
        {
          model: conn.BusinessEntity,
          as: "customerTypeDesc"
        }

        ],
        where: {
          customerNo: payload.customerNo
        }
      })

      let customerDetails = `Name: ${checkExistingCusttomer.firstName} ${checkExistingCusttomer.lastName} \nContact Details: ${checkExistingCusttomer?.customerContact?.map(val => `\nContact Name: ${val.firstName} ${val.lastName} \nContact No: ${val.contactNo}\nEmail: ${val.emailId}`).join('\n')}\nCreated Date: ${moment(checkExistingCusttomer.createdAt).format('DD-MM-YYYY')}\nCurrent Status: ${checkExistingCusttomer.statusDesc?.description}\nCategory: ${checkExistingCusttomer.customerCatDesc?.description}\nClass: ${checkExistingCusttomer.customerClassDesc?.description}\nType: ${checkExistingCusttomer.customerTypeDesc?.description}\n\n\n_Note: Type *Help* at for main menu_`

      console.log('customerDetails===========>', customerDetails)
      logger.debug('Successfully fetched realtime data');
      if (!checkExistingCusttomer) {
        return { status: 'FAILED' }
      } else {
        return {
          status: 'SUCCESS',
          data: customerDetails
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
}

module.exports = WhatsAppService

async function workflowExecute(message, phoneNumberId, senderID, source, tenantId, conn, payload, type, env) {
  logger.info('Executing workflow')
  const t = await conn.sequelize.transaction()
  try {
    if (message?.text?.body.toUpperCase() === 'HELP' || message?.interactive?.list_reply?.id.toUpperCase() === 'HELP' || message?.interactive?.button_reply?.id === "HELP") {
      const workflowHdrData = await conn.WorkflowHdr.findOne({
        attributes: ['wfHdrId'],
        where: {
          entityId: message?.from
        },
        raw: true
      });
      if (workflowHdrData) {
        await conn.WorkflowTxn.destroy({ where: { wfHdrId: workflowHdrData?.wfHdrId } })
        const hdrClear = await conn.WorkflowHdr.destroy({ where: { wfHdrId: workflowHdrData?.wfHdrId } })
        if (hdrClear > 0) {
          const inboundClear = await conn.InboundMessages.destroy({ where: { waId: senderID } })
          // if (inboundClear > 0) {
          //   //await conn.WorkflowTxn.destroy({ where: { wfHdrId: workflowHdrData?.wfHdrId } })
          //   //await conn.WorkflowHdr.destroy({ where: { wfHdrId: workflowHdrData?.wfHdrId } })
          // }
        }
        if (message?.text?.body) {
          message.text.body = 'hi'
        } else if (message?.interactive?.list_reply?.id) {
          message.interactive.list_reply.id = 'hi'
        } else if (message?.interactive?.button_reply?.id) {
          message.interactive.button_reply.id = 'hi'
        }
      }
    }
    // Workflow code started from here
    const body = message
    let callAgainFlag = { callAgain: false }
    const inbound = await conn.InboundMessages.findOne({
      where: { messageFrom: senderID, status: 'in progress' },
      order: [['inbound_id', 'DESC']]
    })
    if (inbound !== null) {
      const inboundId = inbound.inboundId
      await conn.InboundMessages.update({ status: 'closed' }, { where: { inboundId, status: 'in progress' }, transaction: t })
    }
    callAgainFlag = await createChat(body, message?.from, callAgainFlag, phoneNumberId, source, tenantId, conn, t, payload, type, env)
    while (callAgainFlag.callAgain) {
      logger.info('Executing again creat chat', callAgainFlag.callAgain)
      callAgainFlag = await createChat(body, message?.from, callAgainFlag, phoneNumberId, source, tenantId, conn, t, payload, type, env)
    }
    logger.info('Successfully Executed Workflow')
    await t.commit()
  } catch (error) {
    logger.error(error, 'Error while executing workflow')
    return false
  }

}
async function startWorkFlow(mobileNumber, msg, source, tranId, conn, t, userFamily, userGroup) {
  //to find current running task 
  logger.info('Executing the whatsApp workflow ')
  // console.log('userFamily, userGroup ------------>', userFamily, userGroup)
  try {
    const workflowHrdx = await conn.WorkflowHdr.findAll({ // checking whether workflow execution is done or not
      where: {
        [Op.and]: [{ entity: source }, { entityId: mobileNumber }, { wfStatus: 'DONE' }]
      },
      //logging: true
    })
    if (Array.isArray(workflowHrdx) && workflowHrdx.length > 0) { // Reseting the workflow hdr table
      const t = await conn.sequelize.transaction()
      try {
        for (const wfHdr of workflowHrdx) {
          await conn.WorkflowHdr.update({ wfStatus: 'CREATED', nextActivityId: '', wfContext: {} }, { where: { entityId: mobileNumber, entity: source }, transaction: t })
        }
        await t.commit()
      } catch (err) {
        logger.error(err, 'Error while updating hdr table')
      } finally {
        if (t && !t.finished) {
          await t.rollback()
        }
      }
    }
    const workflowCount = await conn.WorkflowHdr.count({ // we are checking workflow already assigned or not
      where: {
        [Op.and]: [{ entityId: mobileNumber }, { entity: source }]
      },
    })
    // console.log('SOURCE:::', source)
    if (workflowCount === 0) {

      const workflowMappings = await conn.WorkflowMapping.findAll({
        where: {
          moduleName: 'WHATSAPP',
          status: 'AC'
        }
      })

      let flwId
      for (const w of workflowMappings) {
        // console.log(mapping?.userFamily, mapping?.userFamily === userFamily,
        //   mapping?.userGroup, mapping?.userGroup === userGroup)
        const mapping = w.mappingPayload
        if (mapping?.userFamily && mapping?.userFamily === userFamily &&
          mapping?.userGroup && mapping?.userGroup === userGroup) {
          flwId = w.workflowId
          break
        }
      }
      if (!flwId) {
        logger.debug('Workflow not found. Please configure the workflow or contact admin')
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'We are facing technical challenges. Sorry for the inconvenience. please try after some time.'
        }
      }
      await assignWFToEntity(mobileNumber, source, flwId, conn)

      /** commented as we brought workflow id based on mapping */
      // if (source === 'WHATSAPP') {
      //   console.log('SOURCE & WF_ID:::', source, WHATSAPP.WA_WORKFLOW_ID)
      //   await assignWFToEntity(mobileNumber, source, WHATSAPP.WA_WORKFLOW_ID, conn)
      // } else {
      //   console.log('SOURCE & WF_ID::', source, WHATSAPP.WA_IHUB_WORKFLOW_ID)
      //   await assignWFToEntity(mobileNumber, source, WHATSAPP.WA_IHUB_WORKFLOW_ID, conn)
      // }
    }
    const workflowHrd = await conn.WorkflowHdr.findAll({
      where: {
        [Op.and]: [{ entityId: mobileNumber }, { entity: source }],
        [Op.or]: [{ wfStatus: 'CREATED' }, { wfStatus: 'USER_WAIT' }, { wfStatus: 'SYS_WAIT' }]
      }
    })
    if (Array.isArray(workflowHrd) && workflowHrd.length > 0) {
      for (const wfHdr of workflowHrd) {
        // Finding the wfJSON for current wfHdr id
        const wfDfn = await conn.Workflow.findOne({ where: { workflowId: wfHdr.wfDefnId } })
        // Finding WFJSON have definitions and process or not
        if (wfDfn?.wfDefinition && wfDfn?.wfDefinition?.definitions && wfDfn?.wfDefinition?.definitions?.process) {
          if (wfHdr.wfStatus === 'CREATED') {
            //console.log('wfHdr.nextActivityId:', wfHdr.nextActivityId)
            if (!wfHdr.nextActivityId) {
              logger.info('Process whatsapp start step')
              // Performing start step for new record
              await processWhatsAppStartStep(wfHdr, wfDfn.wfDefinition, source, conn)
              logger.info('Processing start workflow after process start step')
              return await startWorkFlow(mobileNumber, msg, source, tranId, conn)
            } else if (wfHdr.nextActivityId) {
              //console.log('Process continue workflow execution%%%%%', wfHdr.nextActivityId)
              // If already wf started and continuing remaining tasks
              return await continueChatWFExecution(wfDfn.wfDefinition, wfHdr.nextActivityId, wfHdr.wfContext, mobileNumber, msg, tranId, conn)
            }
          }
        } else {
          logger.debug('Workflow JSON not found in workflow definition table')
          return 'Please wait for allocation'
        }
      }
    } else {
      logger.debug('No records to execute the workflow hdr01')
      return 'Please wait for allocation'
    }
  } catch (err) {
    logger.debug(err, 'No records to execute the workflow hdr02')
  }

}

export const getMobileNumber = (mobileNumber) => {
  let mobileNo
  if (mobileNumber?.slice(0, 2) === '91') {
    //mobileNo = mobileNumber.split('91')[1]
    mobileNo = mobileNumber.substring(2, mobileNumber.length)
  } else if (mobileNumber.slice(0, 3) === '673') {
    //mobileNo = mobileNumber.split('673')[1]
    mobileNo = mobileNumber.substring(3, mobileNumber.length)
  } else {
    mobileNo = mobileNumber
  }
  return mobileNo
}

export const transformInteractionTxn = (complaint) => {
  const data = {
    intxnId: get(complaint, 'intxnId', null),
    fromEntity: get(complaint, 'fromEntity', 'IMAGINE'),
    fromRole: get(complaint, 'fromRole', null),
    fromUser: get(complaint, 'fromUser', null),
    causeCode: get(complaint, 'causeCode', null),
    toEntity: get(complaint, 'toEntity', 'IMAGINE'),
    toRole: get(complaint, 'toRole', null),
    toUser: get(complaint, 'toUser', null),
    intxnStatus: get(complaint, 'intxnStatus', null),
    flwId: get(complaint, 'flwId', 'A'),
    flwCreatedBy: get(complaint, 'flwCreatedBy', null),
    flwAction: get(complaint, 'flwAction', 'A'),
    businessEntityCode: get(complaint, 'businessEntityCode', null),
    priorityCode: get(complaint, 'priorityCode', null),
    problemCode: get(complaint, 'problemCode', null),
    natureCode: get(complaint, 'natureCode', null),
    currStatus: get(complaint, 'currStatus', 'NEW'),
    isFlwBypssd: get(complaint, 'isFlwBypssd', null),
    slaCode: get(complaint, 'slaCode', null),
    expctdDateCmpltn: get(complaint, 'expctdDateCmpltn', null),
    remarks: get(complaint, 'remarks', null)
  }
  return data
}