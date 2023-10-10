import { config } from '@config/env.config'
import { logger, constantCode, chatConstants, continueWFExecution, processStartStep, statusCodeConstants, defaultMessage, camelCaseConversion } from '@utils'
import { Op, QueryTypes } from 'sequelize'
import jsonata from 'jsonata'
import chatResource from '@resources'
import moment from 'moment'
import { processAbandonedChat } from './job.service'
import { isEmpty } from 'lodash'

const cron = require('node-cron')
const { v4: uuidv4 } = require('uuid')
const Got = require('got')

// import required dependency
const { getConnection } = require('@services/connection-service')

const { systemUserId, systemRoleId, systemDeptId } = config
const commonAttrib = {
  tranId: uuidv4(),
  createdDeptId: systemDeptId,
  createdRoleId: systemRoleId,
  createdBy: systemUserId,
  updatedBy: systemUserId
}
let instance

class ChatService {
  constructor () {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async startWorkFlowChat (mobileNumber, msg, source, tenantId, conn) {
    const t = await conn.sequelize.transaction()
    try {
      const workflowHrdx = await conn.WorkflowHdr.findAll({
        where: {
          [Op.and]: [{ entity: source }, { entityId: mobileNumber }, { wfStatus: 'DONE' }]
        }
      })
      if (Array.isArray(workflowHrdx) && workflowHrdx.length > 0) { // Reseting the workflow hdr table
        for (const wfHdr of workflowHrdx) {
          await conn.WorkflowHdr.update({ wfStatus: 'CREATED', nextActivityId: '', wfContext: {} }, { where: { entityId: mobileNumber, entity: source }, transaction: t })
        }
      }
      const workflowCount = await conn.WorkflowHdr.count({
        where: {
          [Op.and]: [{ entityId: mobileNumber }, { entity: source }]
        }
      })
      if (workflowCount === 0) {
        if (source === chatConstants.sourceWhatsapp) {
          await assignWFToEntity(mobileNumber, source, chatConstants.whatsappWorkflowId, conn)
        } else if ((source === chatConstants.sourceLiveChat || source === chatConstants.sourceMobileChat)) {
          await assignWFToEntity(mobileNumber, source, chatConstants.chat2UsWorkflowId, conn)
        }
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
          const wfDfn = await conn.WorkflowNew.findOne({ where: { workflowId: wfHdr.wfDefnId } })
          // Finding WFJSON have definitions and process or not
          if (wfDfn?.wfDefinition && wfDfn?.wfDefinition?.definitions && wfDfn?.wfDefinition?.definitions?.process) {
            if (wfHdr.wfStatus === constantCode.status.CREATED) {
              if (!wfHdr.nextActivityId) {
                // Performing start step for new record
                await processStartStep(wfHdr, wfDfn.wfDefinition, conn)
                await t.commit()
                return await this.startWorkFlowChat(mobileNumber, msg, source, tenantId, conn)
              } else if (wfHdr.nextActivityId) {
                // If already wf started and continuing remaining tasks
                await t.commit()
                return await continueWFExecution(wfDfn.wfDefinition, wfHdr.nextActivityId, wfHdr.wfContext, mobileNumber, msg, tenantId, conn)
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
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async createLiveChat (body, senderID, callAgainFlag, tenantId, conn) {
    let callAgain = false
    let response = 'Created'
    let whatsAppResp
    if (!callAgainFlag.callAgain) {
      const chatData = {
        smsMessageSid: body.conversationId,
        waId: body.senderID, // Customer Mobile Number
        smsStatus: 'received', // recevied for receiving from Livechat
        body: body.msg,
        messageFrom: senderID, // Customer Mobile Number,
        payload: body
      }
      response = await storeChat(chatData, conn)
      console.log('response---->', response)
    }
    if (response === 'Created') {
      const data = {
        mobileNumber: senderID,
        msg: body.msg, // Msg from Livechat
        source: body?.source
      }
      const workflowResponse = await Got.post({
        headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
        url: `${config.bcae.host}:${config.bcae.port}/api/chat`, // chatByWorkflow is calling from here
        body: JSON.stringify(data),
        retry: 0
      }, {
        https: {
          rejectUnauthorized: false
        }
      })
      const wfResponse = JSON.parse(workflowResponse.body)
      console.log('workflowResponse ----------------->', wfResponse)

      if (wfResponse?.message !== 'WORKFLOWEND' && wfResponse?.message === undefined) {
        callAgain = true
        return { callAgain }
      }
      if (typeof (wfResponse.message) === 'object') {
        if (wfResponse?.message?.executeSendMessageTaskResult?.type === 'SENDMESSAGE' || wfResponse?.message?.type === 'API') {
          callAgain = true
        }

        if (wfResponse?.message?.executeSendMessageTaskResult?.taskContextPrefix !== undefined) {
          const separatedStr = wfResponse?.message?.executeSendMessageTaskResult?.taskContextPrefix.split('$.')
          console.log('separatedStr ------------------->', separatedStr)
          if (separatedStr[1] !== undefined) {
            const expr = '$.' + separatedStr[1]
            // console.log('value ----------------->', expr)
            const expression = jsonata(expr)
            const value = await expression.evaluate(wfResponse?.message?.inputContext)
            console.log('value ----------------->', value)
            const respOfWhatsapp = separatedStr[0]?.replace('--@#@--', value) || value
            console.log('respOfWhatsapp --------------->', respOfWhatsapp)
            whatsAppResp = respOfWhatsapp
          } else if (wfResponse?.message?.executeSendMessageTaskResult?.taskContextPrefix === 'Notification here..') {
            const data = JSON.parse(body?.msg)
            const problemCode = data?.problemCode
            const notification = await fetchNotification(problemCode)
            whatsAppResp = notification?.probNotification
          } else {
            whatsAppResp = wfResponse?.message?.executeSendMessageTaskResult?.taskContextPrefix
          }
        } else {
          whatsAppResp = wfResponse?.message?.taskContextPrefix
        }
      }
      if (wfResponse?.message !== 'WORKFLOWEND') {
        whatsAppResp = {
          senderID,
          message: typeof whatsAppResp === 'object' ? wfResponse?.message?.executeSendMessageTaskResult?.taskName : whatsAppResp,
          data: typeof whatsAppResp === 'object' ? whatsAppResp : '',
          SmsStatus: 'sent'
        }
      }
    }
    return { callAgain, livechat: whatsAppResp }
  }

  async getProducts (body, conn) {
    try {
      const whereObj = {
        serviceClass: [constantCode?.serviceClass?.CONSUMER, constantCode?.serviceClass?.BOTH],
        status: constantCode.status.ACTIVE
      }

      if (body && body?.serviceType) {
        whereObj.serviceType = body?.serviceType
        // whereObj.productType = body?.serviceType
      }

      if (body && body?.productCategory) {
        whereObj.productCategory = body?.productCategory
      }

      if (body && body?.productSubType) {
        whereObj.productSubType = body?.productSubType
      }

      const commonExcludableAttrs = ['createdDeptId', 'createdRoleId', 'tranId', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']

      let productsList = await conn.Product.findAll({
        where: whereObj,
        attributes: {
          exclude: [...commonExcludableAttrs, 'productVariant', 'provisioningType', 'productLine', 'volumeAllowed', 'revenueGlCode', 'receivableGlCode']
        },
        include: [
          // { model: conn.BusinessEntity, as: 'productTypeDesc', attributes: ['code', 'description'] },
          {
            model: conn.BusinessEntity,
            as: 'serviceTypeDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productTypeDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productSubTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productSubCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.ProductCharge,
            as: 'productChargesList',
            where: {
              objectReferenceId: {
                [Op.eq]: null
              }
            },
            attributes: {
              exclude: [...commonExcludableAttrs, 'glcode']
            },
            include: [
              {
                model: conn.Charge,
                as: 'chargeDetails',
                attributes: {
                  exclude: [...commonExcludableAttrs]
                },
                include: [
                  {
                    model: conn.BusinessEntity,
                    as: 'chargeCatDesc',
                    attributes: ['code', 'description']
                  },
                  {
                    model: conn.BusinessEntity,
                    as: 'currencyDesc',
                    attributes: ['code', 'description']
                  }
                ]
              }
            ]
          }
        ]
      })

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          status: 'AC'
        }
      })

      if (body?.type === 'SUB_TYPE') {
        const productSubTypeList = productsList.filter(f => f?.productSubTypeDesc && f?.productSubTypeDesc !== null).map(p => {
          if (p?.productSubTypeDesc && p?.productSubTypeDesc !== null) {
            return {
              label: p?.productSubTypeDesc?.description,
              value: p?.productSubTypeDesc?.code
            }
          }
        })
        productsList = [...new Map(productSubTypeList.map(item => [item?.label, item])).values()]
      } else if (body?.type === 'SERVICE_TYPE') {
        const productSubTypeList = productsList.map(p => {
          return {
            label: p?.serviceTypeDescription?.description,
            value: p?.serviceTypeDescription?.code
          }
        })
        // productsList = productSubTypeList
        productsList = [...new Map(productSubTypeList.map(item => [item.label, item])).values()]
      } else {
        productsList = await chatResource.transformProductList(productsList, businessEntityInfo) || []
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Products ${productsList.length > 0 ? 'retrived' : 'list empty'}`,
        data: productsList.length > 0 ? productsList : 0
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getChatMenu (body, conn) {
    try {
      const { menuName } = body
      if (!menuName) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Menu List list empty'
        }
      }
      let menuList = await conn.ChatMenu.findAll({
        where: {
          menuName,
          status: constantCode.status.ACTIVE
        }
      })
      menuList = await chatResource.transformChatMenuList(menuList) || []

      return {
        status: menuList.length > 0 ? statusCodeConstants.SUCCESS : statusCodeConstants.NOT_FOUND,
        message: `Menu List ${menuList.length > 0 ? 'retrived' : 'list empty'}`,
        data: menuList
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getLookup (body, conn) {
    try {
      const { type } = body
      if (!type) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'lookup list empty'
        }
      }

      let lookupList = await conn.BusinessEntity.findAll({
        where: {
          codeType: type,
          status: 'AC'
        }
      })

      lookupList = await chatResource.transformLookUpList(lookupList) || []

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Products ${lookupList.length > 0 ? 'retrived' : 'list empty'}`,
        data: lookupList
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getServiceDetails (payload, conn) {
    try {
      let { body } = payload

      if (!body) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'lookup list empty',
          data: {
            serviceExist: 'N'
          }
        }
      }
      body = JSON.parse(body)
      let response
      if (body?.type === 'ID_CARD') {
        response = await conn.Customer.findOne({
          include: [{
            model: conn.BusinessEntity,
            as: 'genderDesc',
            attributes: ['code', 'description']
          }, {
            model: conn.BusinessEntity,
            as: 'idTypeDesc',
            attributes: ['code', 'description']
          }, {
            model: conn.Contact,
            as: 'customerContact',
            required: true
          }],
          where: {
            idValue: body?.value
          },
          logging: true,
          order: [['createdAt', 'DESC']]
        })
      } else if (body?.type === 'ACCOUNT_NO') {
        response = await conn.Customer.findOne({
          include: [{
            model: conn.BusinessEntity,
            as: 'genderDesc',
            attributes: ['code', 'description']
          }, {
            model: conn.BusinessEntity,
            as: 'idTypeDesc',
            attributes: ['code', 'description']
          }, {
            model: conn.CustAccounts,
            as: 'customerAccounts',
            required: true,
            where: {
              accountNo: body?.value
            }
          }, {
            model: conn.Contact,
            as: 'customerContact',
            required: true
          }],
          logging: true,
          order: [['createdAt', 'DESC']]
        })
      } else if (body?.type === 'SERVICE_NUMBER') {
        response = await conn.Customer.findOne({
          include: [{
            model: conn.BusinessEntity,
            as: 'genderDesc',
            attributes: ['code', 'description']
          }, {
            model: conn.BusinessEntity,
            as: 'idTypeDesc',
            attributes: ['code', 'description']
          }, {
            model: conn.CustServices,
            as: 'customerServices',
            required: true,
            where: {
              serviceNo: body?.value
            }
          }, {
            model: conn.Contact,
            as: 'customerContact',
            required: true,
            where: {

            }
          }],
          // logging: true,
          order: [['createdAt', 'DESC']]
        })
      }
      let data = {}
      if (response) {
        data = {
          serviceExist: 'Y',
          customerId: response?.customerId,
          customerNo: response?.customerNo,
          customerUuid: response?.customerUuid,
          firstName: response?.firstName || '',
          lastName: response?.lastName || '',
          gender: response?.genderDesc?.description || '',
          idType: response?.idTypeDesc?.description || '',
          idValue: response?.idValue || '',
          mobileNo: response?.customerContact?.[0]?.mobileNo || '',
          email: response?.customerContact?.[0]?.emailId || ''
          // ...response
        }
      } else {
        data = {
          serviceExist: 'N'
          // ...response
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully retrived',
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

  async createCustomer (payloads, conn, t) {
    try {
      let { body } = payloads

      if (!body) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      body = JSON.parse(body)

      const payload = {
        details: {
          source: 'CREATE_INTERACTION',
          firstName: body.value.firstName,
          contactPayload: {
            mobileNo: body?.value.mobileNo,
            emailId: body?.value.emailId
          }
        }
      }

      const response = await registerCustomer(payload, conn, t)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully retrived',
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

  async getChatDashboardMonitorCounts (payloads, departmentId, roleId, conn) {
    try {
      const { date: createdAt, chatSource } = payloads

      // const query1 = `SELECT cc."source",
      // (SELECT COUNT(*) AS queue FROM chat as cc1 WHERE status ='NEW' AND cast(created_at as date) ='${createdAt}'::date and cc1."source"=cc."source"),
      // (SELECT COUNT(*) AS currently_serving FROM chat as cc1 WHERE status ='ASSIGNED'  AND cast(created_at as date) ='${createdAt}'::date and cc1."source"=cc."source"),
      // (SELECT COUNT(*) AS currently_served FROM chat as cc1 WHERE status ='CLOSED' AND cast(created_at as date) ='${createdAt}'::date and cc1."source"=cc."source"),
      // (SELECT COUNT(*) AS abandoned_chat FROM chat as cc1 WHERE status ='ABANDONED' AND cast(created_at as date) ='${createdAt}'::date and cc1."source"=cc."source"),
      // (SELECT AVG(start_at - created_at) AS wait_average FROM chat as cc1 WHERE status !='ABANDONED' AND cast(created_at as date) ='${createdAt}'::date and cc1."source"=cc."source"),
      // (SELECT MAX(start_at - created_at) AS wait_longest FROM chat as cc1 WHERE status !='ABANDONED' AND cast(created_at as date) ='${createdAt}'::date and cc1."source"=cc."source"),
      // (SELECT AVG(end_at - start_at) AS chat_duration_average FROM chat as cc1 WHERE status!='ABANDONED' AND cast(created_at as date) ='${createdAt}'::date and cc1."source"=cc."source"),
      // (SELECT MAX(end_at - start_at) AS chat_duration_Longest FROM chat as cc1 WHERE status!='ABANDONED' AND cast(created_at as date) ='${createdAt}'::date and cc1."source"=cc."source"),
      // (SELECT COUNT(distinct user_id) AS no_of_agents FROM chat as cc1 WHERE status !='ABANDONED' AND cast(created_at as date) ='${createdAt}'::date and cc1."source"=cc."source"),
      // (SELECT COUNT(user_id) AS chat_per_agent_avg FROM chat as cc1 WHERE status != 'ABANDONED' AND cast(created_at as date) ='${createdAt}'::date and cc1."source"=cc."source"),
      // (SELECT COUNT(distinct user_id) AS logged_in_agents FROM user_session WHERE  cast(created_at as date) = '${createdAt}'::date AND curr_role_id=26 AND curr_dept_id='DPT0000642.OPU0000006.ORG0000001')
      // FROM chat as cc group by cc."source"`

      const query1 = `SELECT * FROM dtworks_cad_agent_chat_count_fn('${createdAt}', array[${chatSource.map(x => `'${x}'`).join(',')}]::text[], '${departmentId}', '${roleId}')`
      const query2 = `SELECT * FROM dtworks_cad_chat_queue_wait_fn('${createdAt}' , array[${chatSource.map(x => `'${x}'`).join(',')}]::text[])`
      const query3 = `SELECT * FROM dtworks_cad_chat_duration_fn('${createdAt}' , array[${chatSource.map(x => `'${x}'`).join(',')}]::text[])`

      let counts = await conn.sequelize.query(query1, {
        type: QueryTypes.SELECT
      })
      let chatQueueWaitTime = await conn.sequelize.query(query2, {
        type: QueryTypes.SELECT
      })
      let agentChatDuration = await conn.sequelize.query(query3, {
        type: QueryTypes.SELECT
      })

      counts = camelCaseConversion(counts)
      chatQueueWaitTime = camelCaseConversion(chatQueueWaitTime)
      agentChatDuration = camelCaseConversion(agentChatDuration)

      const response = { counts, chatQueueWaitTime, agentChatDuration }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully retrived Chat Dashboard Monitor Counts',
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

  async getChatAgentSummary (payloads, conn) {
    try {
      const { date: createdAt, limit = 10, page = 0, excel = false, chatSource } = payloads
      const offSet = (page * limit)

      let query = `select * from dtworks_cad_agent_chat_detail_fn('${createdAt}', array[${chatSource.map(x => `'${x}'`).join(',')}]::text[])`
      let count = await conn.sequelize.query(`select COUNT(*) FROM (${query}) t2`)

      if (!excel && payloads.page && payloads.limit && conn.sequelize.options.dialect !== 'mssql') {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }
      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })

      if (!response) {
        const data = {
          count: 0,
          rows: []
        }
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No records found',
          data: data || []
        }
      }
      response = camelCaseConversion(response)

      if (Array.isArray(count) && count.length > 0) {
        count = Number(count?.[0]?.[0]?.count)
      }

      const data = {
        rows: response,
        count: count || 0
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully retrived Chat summary Agent',
        data: data || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async availableChatAgents (payloads, departmentId, roleId, conn) {
    try {
      const { date } = payloads
      const createdAt = moment().format('YYYY-MM-DD') || date
      const query = `select distinct u.user_id, u.first_name, u.last_name, (u.first_name||' '||u.last_name) as user_name, u.email, u.profile_picture, u.loginid as user_login_id
      from user_session us 
      inner join ad_users u on u.user_id = us.user_id
      where cast(us.created_at as date) ='${createdAt}' AND us.curr_role_id= ${roleId} AND us.curr_dept_id='${departmentId}'
      group by u.user_id, u.last_name, u.email, u.first_name, u.profile_picture`

      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      response = camelCaseConversion(response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully retrived available agents',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getChatDetails (payloads, conn) {
    try {
      const { limit = constantCode.common.lIMIT, page = constantCode.common.PAGE, filters } = payloads

      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      if (!payloads) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let whereClause = {}

      if (payloads && payloads?.source) {
        whereClause.chatSource = payloads.source
      }

      if (payloads && payloads?.type) {
        if (payloads?.type === 'SERVED') {
          whereClause.status = ['CLOSED']
        } else if (payloads?.type === 'QUEUE') {
          whereClause.status = ['NEW']
        } else if (payloads?.type === 'ABOND') {
          whereClause.status = ['ABANDONED']
        } else if (payloads?.type === 'SERVING') {
          whereClause.status = ['ASSIGNED']
        }
      }

      if (payloads && payloads?.createdAt) {
        whereClause = {
          ...whereClause,
          createdAt: conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('Chat.created_at')), '=', payloads?.createdAt)
        }
      }

      if (filters && Array.isArray(filters) && !isEmpty(filters)) {
        for (const record of filters) {
          if (record.value) {
            if (record.id === 'customerName') {
              whereClause.customerName = { [Op.iLike]: `%${record.value}%` }
            } else if (record.id === 'chatId') {
              // whereClause.chatId = { [Op.like]: `%${record.value}%` }
              whereClause.chatId = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Chat.chat_id'), 'varchar'), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toString()}%`
                })]
              }
            } else if (record.id === 'contactNo') {
              // whereClause.contactNo = { [Op.like]: `%${record.value}%` }
              whereClause.contactNo = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Chat.contact_no'), 'varchar'), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toString()}%`
                })]
              }
            }
          }
        }
      }

      console.log(whereClause)
      const response = await conn.Chat.findAndCountAll({
        attributes: ['chatId', 'contactNo', 'startAt', 'endAt', 'createdAt', 'abandonedDate', 'customerName', 'message',
          [conn.sequelize.literal('EXTRACT(EPOCH FROM (end_at - start_at))/60'),
            'chatDuration'
          ]],
        include: [{
          model: conn.User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        },
        {
          model: conn.BusinessEntity,
          as: 'statusDesc',
          attributes: ['code', 'description']
        }, {
          model: conn.BusinessEntity,
          as: 'chatSourceDesc',
          attributes: ['code', 'description']
        }],
        where: { ...whereClause },
        ...params
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully retrived chat Details',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getAllChatCount (payloads, conn) {
    try {
      const { date: createdAt, chatSource } = payloads

      const query1 = `SELECT * FROM dtworks_cad_agent_all_chat_count_fn('${createdAt}', array[${chatSource.map(x => `'${x}'`).join(',')}]::text[])`

      let response = await conn.sequelize.query(query1, {
        type: QueryTypes.SELECT
      })

      response = camelCaseConversion(response)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully retrived Chat Dashboard Monitor Counts',
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

  async createContact (payload, conn, t) {
    try {
      if (!payload?.firstName || !payload?.lastName || !payload?.emailId || !payload?.mobilePrefix || !payload?.mobileNo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Mandatory fields missing'
        }
      }
      const contactData = {
        isPrimary: true,
        firstName: payload.firstName,
        lastName: payload.lastName,
        emailId: payload.emailId,
        mobilePrefix: payload.mobilePrefix,
        mobileNo: payload.mobileNo,
        contactCategory: payload?.contactCategory || 'CUSTOMER',
        contactCategoryValue: payload?.contactCategoryValue,
        status: 'AC',
        createdDeptId: systemDeptId,
        createdRoleId: systemRoleId,
        tranId: uuidv4(),
        createdBy: systemUserId
      }
      const response = await conn.Contact.create(contactData, { transaction: t })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully created contact',
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

  async chatAbandonedJob (payload, conn) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: 'Please provide state'
        }
      }

      const { state } = payload
      if (state === 'start') {
        chatAbandonedCron.start()
      } else if (state === 'stop') {
        chatAbandonedCron.stop()
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Abandoned Job ${state === 'start' ? 'started' : 'stopped'}`
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

const chatAbandonedCron = cron.schedule('*/3 * * * *', () => {
  logger.debug('Starting Abandoned Job')
  processAbandonedChat()
},
{
  scheduled: false
})

const assignWFToEntity = async (entityId, entity, workflowId, conn) => {
  const t = await conn.sequelize.transaction()
  try {
    const workflow = await conn.WorkflowNew.findOne({ where: { workflowId } })
    if (workflow) {
      const wfhdr = await conn.WorkflowHdr.findOne({ where: { entity, entityId, wfDefnId: workflowId } })
      if (!wfhdr) {
        const data = {
          entity,
          entityId,
          wfDefnId: workflowId,
          wfContext: {},
          wfStatus: constantCode.status.CREATED,
          createdBy: systemUserId,
          updatedBy: systemUserId
        }
        await conn.WorkflowHdr.create(data, { transaction: t })
        await t.commit()
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

const storeChat = async (body, conn) => {
  const t = await conn.sequelize.transaction()
  try {
    logger.info('Creating Live chat Data')
    const data = {
      smsMessageSid: body.smsMessageSid, // Random First time Number
      waId: body.waId, // Customer Mobile Number
      smsStatus: body.smsStatus, // received for receiving from Livechat
      body: body.payload.msg ? body.body : JSON.stringify(body.payload),
      messageFrom: body.messageFrom, // Customer Mobile Number
      createdAt: new Date(),
      status: constantCode.status.INPROGRESS,
      flag: body.flag !== undefined ? body.flag : '',
      chatSource: body?.payload?.source,
      ...commonAttrib
    }
    console.log('data---------->', data)
    await conn.InboundMessages.create(data, { transaction: t }, { logging: true })
    await t.commit()
    logger.debug('Successfully created chat')
    return 'Created'
  } catch (error) {
    // logger.error(error, defaultMessage.NOT_FOUND)
    console.log('error------->', error)
    await t.rollback()
    return 'Error'
  }
}

const fetchNotification = async (body) => {
  try {
    const conn = await getConnection()
    logger.info('Fetching notifications..')
    const hasRecord = await conn.ProblemNotifyMap.findOne({
      attribute: ['probNotification'],
      where: {
        probCodeId: body
      },
      raw: true,
      logging: true
    })
    logger.debug('Successfully Fetched notifications')
    return hasRecord
  } catch (error) {
    // logger.error(error, defaultMessage.NOT_FOUND)
    return 'Error'
  }
}

const registerCustomer = async (payload, conn, t) => {
  try {
    if (!payload.details) {
      return {
        status: statusCodeConstants.VALIDATION_ERROR,
        message: defaultMessage.MANDATORY_FIELDS_MISSING
      }
    }

    const payloads = payload.details

    if (payload?.contact?.mobileNo && payload?.contact?.emailId) {
      const checkExistingContact = await conn.Contact.findOne({
        where: {
          [Op.or]: [
            { mobileNo: payload.contact.mobileNo },
            { emailId: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email_id')), '=', payload.contact.emailId.toLowerCase()) }
          ],
          contactCategory: entityCategory.CUSTOMER,
          status: constantCode.customerStatus.ACTIVE
        }
      })

      if (checkExistingContact) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'There is an active customer for provided Email / Mobile Number'
        }
      }
    }

    const tranId = uuidv4()
    const commonAttrs = {
      tranId,
      createdBy: systemUserId,
      createdDeptId: systemDeptId,
      createdRoleId: systemRoleId
    }

    const customerData = {
      customerUuid: uuidv4(),
      status: constantCode.customerStatus.TEMPORARY,
      title: payloads.title,
      firstName: payloads.firstName,
      lastName: payloads.lastName,
      customerAge: payloads?.customerAge || null,
      gender: payloads.gender,
      birthDate: payloads.birthDate,
      idType: payloads.idType,
      idValue: payloads.idValue,
      customerCategory: payloads?.customerCategory || null,
      customerClass: payloads?.customerClass || null,
      registeredNo: payloads?.registeredNo || null,
      registeredDate: payloads?.registeredDate || null,
      nationality: payloads?.nationality || null,
      customerPhoto: payloads?.customerPhoto || null,
      taxNo: payloads?.taxNo || null,
      billable: payloads?.billable || null,
      contactPreferences: payloads?.contactPreferences || null,
      customerRefNo: payloads?.customerRefNo || null,
      customerMaritalStatus: payloads?.customerMaritalStatus || null,
      occupation: payloads?.occupation || null,
      ...commonAttrs
    }
    const customerInfo = await conn.Customer.create(customerData, { transaction: t })

    if (customerInfo && payload?.contact) {
      const contactPayload = payload?.contact
      const conCats = {
        tranId,
        contactCategory: entityCategory.CUSTOMER,
        contactCategoryValue: customerInfo.customerNo
      }

      const contactData = {
        isPrimary: true,
        contactType: contactPayload.contactType,
        title: contactPayload.title,
        firstName: contactPayload.firstName,
        lastName: contactPayload.lastName,
        emailId: contactPayload.emailId,
        mobilePrefix: contactPayload.mobilePrefix,
        mobileNo: contactPayload.mobileNo,
        telephonePrefix: contactPayload?.telephonePrefix || null,
        telephoneNo: contactPayload?.telephoneNo || null,
        whatsappNoPrefix: contactPayload?.whatsappNoPrefix || null,
        whatsappNo: contactPayload?.whatsappNo || null,
        fax: contactPayload?.fax || null,
        facebookId: contactPayload?.facebookId || null,
        instagramId: contactPayload?.instagramId || null,
        telegramId: contactPayload?.telegramId || null,
        secondaryEmail: contactPayload?.secondaryEmail || null,
        secondaryContactNo: contactPayload?.secondaryContactNo || null
      }

      await this.createOrUpdateContact(contactData, conCats, customerData, conn, userId, roleId, departmentId, historyAttrs, t)
    }

    const data = {
      customerUuid: customerInfo.customerUuid,
      customerNo: customerInfo.customerNo,
      customerId: customerInfo.customerId,
      customerTranId: tranId
    }

    return {
      status: statusCodeConstants.SUCCESS,
      message: `Customer Created Successfully - ${customerInfo.customerNo}`,
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

module.exports = ChatService
