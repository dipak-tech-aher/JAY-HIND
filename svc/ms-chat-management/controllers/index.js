import ChatService from '@services/chat.service'
import { logger, ResponseHelper, statusCodeConstants, defaultMessage, constantCode, chatConstants, camelCaseConversion } from '@utils'
import { sendLiveChatValidator } from '@validators'
import { Op, QueryTypes } from 'sequelize'
import { config } from '@config/env.config'
const { getConnection } = require('@services/connection-service')
const { v4: uuidv4 } = require('uuid')
const NodeCache = require('node-cache')
const myCache = new NodeCache()

const { systemUserId, systemRoleId, systemDeptId, chatRoleId } = config

export class ChatController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.chatService = new ChatService()
  }

  async sendLivechatMessage (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      const { data } = req.body
      const tenantId = req.headers['x-tenant-id']
      const { error } = sendLiveChatValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const { senderID } = data
      let callAgainFlag = { callAgain: false }
      const inbound = await conn.InboundMessages.findOne({
        where: {
          messageFrom: senderID,
          status: constantCode.status.INPROGRESS,
          chatSource: chatConstants.sourceLiveChat
        },
        order: [['inbound_id', 'DESC']]
      })

      if (inbound != null) {
        const inboundId = inbound.inboundId
        await conn.InboundMessages.update({ status: 'closed' }, {
          where: {
            inboundId,
            status: constantCode.status.INPROGRESS,
            chatSource: chatConstants.sourceLiveChat
          },
          transaction: t
        })
      }
      callAgainFlag = await this.chatService.createLiveChat(data, senderID, callAgainFlag, tenantId, conn)
      while (callAgainFlag.callAgain && callAgainFlag?.livechat === undefined) {
        callAgainFlag = await this.chatService.createLiveChat(data, senderID, callAgainFlag, tenantId, conn)
      }
      await t.commit()

      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.SUCCESS, message: 'SUCCESS', data: callAgainFlag })
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async chatByWorkflow (req, res) {
    try {
      const { mobileNumber, msg, source } = req?.body
      const tenantId = req.headers['x-tenant-id']
      if (!mobileNumber || mobileNumber === '' || mobileNumber == null) {
        return this.responseHelper.onSuccess(res, 'Mobile Number is required')
      }
      const conn = await getConnection()
      const response = await this.chatService.startWorkFlowChat(mobileNumber, msg, source, tenantId, conn)
      return this.responseHelper.onSuccess(res, response)
    } catch (error) {
      logger.error(error, 'Error while creating new chat user')
      return this.responseHelper.onError(res, new Error('Error while creating new chat user'))
    }
  }

  async updateChatSocket (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      logger.info('Assigning ticket to user')
      const { id } = req.params
      const { userId, body } = req
      console.log('body....', body)
      if (!id) {
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      const findTicket = await conn.Chat.findOne({
        where: { chatId: id }
      })
      if (!findTicket) {
        logger.debug(defaultMessage.NOT_FOUND)
        return this.responseHelper.notFound(res, new Error(defaultMessage.NOT_FOUND))
      }
      await conn.Chat.update({ socketId: body.socketId, status: 'ASSIGNED', userId, startAt: new Date() }, { where: { chatId: id }, transaction: t })
      await t.commit()
      logger.debug('Successfully assigned ticket to user')
      return this.responseHelper.onSuccess(res, 'Ticket Assigned Successfully')
    } catch (error) {
      logger.error(error, 'Error while assigning ticket to user')
      return this.responseHelper.onError(res, new Error('Error while assigning ticket to user'))
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getServiceTypes (req, res) {
    try {
      logger.debug('Fetching Service Types')
      const conn = await getConnection()
      const serviceTypeResponse = await conn.BusinessEntity.findAll({
        where: { codeType: 'CHAT_MENU', status: 'AC' },
        order: [['createdAt', 'ASC']]
      })
      logger.debug('Successfully fetch Service Types')
      return this.responseHelper.onSuccess(res, 'SUCCESS', serviceTypeResponse)
    } catch (error) {
      logger.error(error, 'Error while fetching Service Types')
      return this.responseHelper.onError(res, new Error('Error while fetching Service Types'))
    }
  }

  async getEnquiries (req, res) {
    try {
      logger.debug('Fetching Enquiries')
      const conn = await getConnection()
      const enquiryResponse = await conn.ChatResponse.findAll({
        where: { menuId: 'CM_ENQ', menuStatus: 'AC' },
        order: [['menu_seq_no', 'ASC']]
      })
      logger.debug('Successfully fetch enquirys')
      return this.responseHelper.onSuccess(res, 'SUCCESS', enquiryResponse)
    } catch (error) {
      logger.error(error, 'Error while fetching enquirys')
      return this.responseHelper.onError(res, new Error('Error while fetching enquirys'))
    }
  }

  async getBoosterPlans (req, res) {
    try {
      logger.debug('Fetching Booster Plans')
      const conn = await getConnection()
      const planBootserResponse = await conn.BoosterPlans.findAll({
        where: { status: 'ACTIVE' },
        order: [['plan_id', 'ASC']]
      })
      logger.debug('Successfully fetch booster plans')
      return this.responseHelper.onSuccess(res, 'SUCCESS', planBootserResponse)
    } catch (error) {
      logger.error(error, 'Error while fetching booster plans')
      return this.responseHelper.onError(res, new Error('Error while fetching booster plans'))
    }
  }

  async getImagineGo (req, res) {
    try {
      logger.debug('Fetching Enquiries')
      const conn = await getConnection()
      const imagineGoResponse = await conn.ChatResponse.findAll({
        where: { menuId: 'CM_IMAGINEGO', menuStatus: 'AC' },
        order: [['menu_seq_no', 'ASC']]
      })
      logger.debug('Successfully fetch enquirys')
      return this.responseHelper.onSuccess(res, 'SUCCESS', imagineGoResponse)
    } catch (error) {
      logger.error(error, 'Error while fetching enquirys')
      return this.responseHelper.onError(res, new Error('Error while fetching enquirys'))
    }
  }

  async chatCleanUp (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      if (!req?.body) {
        logger.info(defaultMessage.MANDATORY_FIELDS_MISSING)
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      logger.debug('Cleaning the chat..')
      const entityId = req?.body?.contactNo
      if (!entityId) {
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      const workflowHdrData = await conn.WorkflowHdr.findOne({
        attributes: ['wfHdrId'],
        where: {
          entityId
        },
        raw: true
      })
      if (workflowHdrData) {
        const cleanTxn = await conn.WorkflowTxn.destroy({
          where: {
            wfHdrId: workflowHdrData?.wfHdrId
          },
          transaction: t
        })
        if (cleanTxn > 0) {
          const cleanHdr = await conn.WorkflowHdr.destroy({
            where: {
              wfHdrId: workflowHdrData?.wfHdrId
            },
            transaction: t
          })
          if (cleanHdr > 0) {
            await conn.InboundMessages.destroy({
              where: {
                waId: entityId
              },
              transaction: t
            })
          }
        }
        await t.commit()
        logger.debug('Chat Clean up done Successfully')
        return this.responseHelper.onSuccess(res, 'SUCCESS')
      } else {
        logger.debug('Nothing to clean')
        return this.responseHelper.onSuccess(res, 'Nothing to clean')
      }
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return this.responseHelper.onError(res, new Error('Error while Cleaning the chat'))
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getTarrifName (req, res) {
    try {
      logger.debug('Fetching Tarrif Name')
      if (!req?.body) {
        logger.info(defaultMessage.MANDATORY_FIELDS_MISSING)
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      const conn = await getConnection()
      const tarrifNameResponse = await conn.Plan.findOne({
        attributes: ['planName'],
        where: { refPlanCode: req.body.tarrifCode }
      })
      logger.debug('Successfully fetch Tarrif Name')
      return this.responseHelper.onSuccess(res, 'SUCCESS', tarrifNameResponse)
    } catch (error) {
      logger.error(error, 'Error while fetching Tarrif Name')
      return this.responseHelper.onError(res, new Error('Error while fetching Tarrif Name'))
    }
  }

  async getCustomerSummary (req, res) {
    try {
      logger.debug('Getting realtime data')
      const { identifier, accessNumber, senderID } = req.body
      const reqBody = {
        accessNumber,
        identifier: (identifier == 'Prepaid' || identifier == 'Postpaid') ? 'MOBILE' : 'FIXEDLINE',
        trackingId: senderID
      }
      if (!identifier || !accessNumber || !senderID || !reqBody) {
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      const response = await got.put({
        headers: { Authorization: 'Basic ' + Buffer.from('Aios' + ':' + '$Tibc0@Aios$').toString('base64') },
        url: tibco.customerAPIEndPoint + tibco.customerSummaryAPI,
        body: JSON.stringify(reqBody),
        retry: 0
      })

      logger.debug('Successfully fetched realtime data')
      if (!response || !response?.body) {
        logger.debug(defaultMessage.NOT_FOUND)
        return this.responseHelper.notFound(res, new Error(defaultMessage.NOT_FOUND))
      }
      res.json(JSON.parse(response.body))
    } catch (error) {
      logger.error(error, 'Error while fetching realtime data')
      return this.responseHelper.onError(res, new Error('Error while fetching realtime data'))
    }
  }

  async getAgentInfo (req, res) {
    try {
      logger.debug('Fetching Agent Info')
      const chatId = req?.body?.data
      if (!chatId) {
        return this.responseHelper.validationError(res, new Error(defaultMessage?.MANDATORY_FIELDS_MISSING))
      }
      const conn = await getConnection()
      const response = await conn.Chat.findOne({
        include: [
          {
            model: conn.User,
            attributes: ['firstName', 'lastName'],
            as: 'user'
          }],
        attributes: ['socketId'],
        where: { chatId }
      })
      logger.debug('Successfully fetch Agent Info')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Agent Info')
      return this.responseHelper.onError(res, new Error('Error while fetching Agent Info'))
    }
  }

  async createChat (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      if (!req?.body) {
        logger.info(defaultMessage.MANDATORY_FIELDS_MISSING)
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      const chatExists = await conn.Chat.findOne({ where: { contactNo: req.body.data.contactNo, status: ['NEW', 'ASSIGNED'] } })
      let response
      if (chatExists) {
        response = {
          message: 'Your Previous Chat is not closed. Please contact admin'
        }
      } else {
        const commonAttrib = {
          tranId: uuidv4(),
          createdDeptId: systemDeptId,
          createdRoleId: systemRoleId,
          createdBy: systemUserId,
          updatedBy: systemUserId
        }
        const payload = req?.body?.data
        const chat = {
          contactNo: payload?.contactNo,
          botReq: payload?.contactNo,
          chatSource: payload?.source,
          status: 'NEW',
          // category: 'Enquiries',
          emailId: payload?.emailId || '',
          customerName: payload?.customerName || '',
          customerInfo: payload?.customerInfo || {},
          ...commonAttrib
        }
        console.log('chat--xxxxxxx--->', chat)
        response = await conn.Chat.create(chat, { transaction: t })
      }
      await t.commit()
      return res.json(response)
    } catch (error) {
      console.log('error-----xxxxxxx--->', error)
      return res.json('Error while creating Chat')
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateBotChatSocket (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      logger.info('Updating socket')
      const { id } = req.params
      const { userId, body } = req
      if (!id) {
        logger.info(defaultMessage.MANDATORY_FIELDS_MISSING)
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      const findTicket = await conn.Chat.findOne({
        where: { chatId: id }
      })
      if (!findTicket) {
        logger.debug(defaultMessage.NOT_FOUND)
        return this.responseHelper.notFound(res, new Error(defaultMessage.NOT_FOUND))
      }
      await conn.Chat.update({ socketId: body.socketId, status: 'NEW', userId, startAt: new Date() }, { where: { chatId: id }, transaction: t })
      await t.commit()
      logger.debug('Successfully assigned ticket to user')
      return this.responseHelper.onSuccess(res, 'Ticket Assigned Successfully')
    } catch (error) {
      logger.error(error, 'Error while assigning ticket to user')
      return this.responseHelper.onError(res, new Error('Error while assigning ticket to user'))
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  // WORKFLOW SERVICES

  async inboundMsg (req, res) {
    try {
      logger.debug('Getting Inbound msges')
      const conn = await getConnection()
      const { waId } = req?.body
      if (!waId) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const inboundMsgData = await conn.InboundMessages.findOne({
        attributes: ['body', 'profile_name'],
        where: { waId, status: { [Op.ne]: 'CLOSED' }, smsStatus: 'received' },
        order: [
          ['inboundId', 'DESC']
        ]
      })

      if (!inboundMsgData) {
        logger.debug(defaultMessage.NOT_FOUND)
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.NOT_FOUND
            }
          })
      }
      logger.debug('Successfully fetch inbound msg data')
      return this.responseHelper.onSuccess(res, 'SUCCESS', inboundMsgData)
    } catch (error) {
      logger.error(error, 'Error while fetching inbound msg data')
      return res.json(
        {
          data: {
            status: 'FAILED',
            message: 'Error while fetching inbound msg data'
          }
        })
    }
  }

  async registration (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      if (!req?.body?.body) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const { userName, userEmail, contactNo, passportID, serviceNumber, identifier } = JSON.parse(req.body.body)
      if (!contactNo) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      logger.debug('Checking customer is already exist or not')
      const customer = await conn.Customer.findOne({
        include: [
          {
            model: conn.Contact,
            as: 'contact',
            where: { contactNo: Number(contactNo), altEmail: identifier }
          }
        ]
      })
      if (!customer) {
        logger.debug('Createing customer')
        if (!userName || !userEmail || !contactNo || !passportID || !identifier) {
          logger.debug('validation error...')
          return res.json(
            {
              data: {
                status: 'FAILED',
                message: defaultMessage.MANDATORY_FIELDS_MISSING
              }
            })
        }
        logger.debug('validated')

        const contactDet = {
          firstName: userName,
          contactType: 'CNTMOB',
          email: userEmail,
          altEmail: identifier,
          contactNo: Number(contactNo),
          altContactNo1: Number(serviceNumber) || 0,
          createdBy: 546,
          updatedBy: 546
        }
        const contact = await conn.Contact.create(contactDet, { transaction: t })
        const customerDet = {
          firstName: userName,
          contactId: contact.contactId,
          idType: 'PASSPORT',
          idValue: passportID,
          custType: 'RESIDENTIAL',
          status: 'TEMP',
          createdBy: 546,
          updatedBy: 546
        }
        const customerResponse = await conn.Customer.create(customerDet, { transaction: t })
        await t.commit()
        logger.debug('Successfully created customer')
        return this.responseHelper.onSuccess(res, 'SUCCESS', customerResponse)
      }
      await t.commit()
      logger.debug('Successfully fetch customer data')
      return this.responseHelper.onSuccess(res, 'SUCCESS', customer)
    } catch (error) {
      logger.error(error, 'Error while Registration of Customer data')
      return res.json(
        {
          data: {
            status: 'FAILED',
            message: 'Error while Registration of Customer data'
          }
        })
    } finally {
      if (t && !t.finished) { await t.rollback() }
    }
  }

  async validateAccessNumber (req, res) {
    try {
      logger.debug('Getting realtime data')
      if (!req?.body?.accessNumber) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const { identifier, accessNumber, senderID } = JSON.parse(req?.body?.accessNumber)
      const reqBody = {
        accessNumber,
        identifier: (identifier === 'Prepaid' || identifier === 'Postpaid') ? 'MOBILE' : 'FIXEDLINE',
        trackingId: senderID
      }
      if (!identifier || !accessNumber || !senderID || !reqBody) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const response = await got.put({
        headers: { Authorization: 'Basic ' + Buffer.from('Aios' + ':' + '$Tibc0@Aios$').toString('base64') },
        url: tibco?.customerAPIEndPoint + tibco?.customerSummaryAPI,
        body: JSON.stringify(reqBody),
        retry: 0
      })
      logger.debug('Successfully fetched realtime data')
      if (!response || !response?.body) {
        logger.debug(defaultMessage.NOT_FOUND)
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.NOT_FOUND
            }
          })
      }
      return res.json(JSON.parse(response.body))
    } catch (error) {
      logger.error(error, 'Error while fetching realtime data')
      return res.json(
        {
          data: {
            status: 'FAILED',
            message: 'Error while fetching realtime data'
          }
        })
    }
  }

  async sendOtp (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      logger.debug('Into sending otp')
      if (!req?.body?.reference) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const type = 'mobile'
      const { accessNumber } = JSON.parse(req?.body?.reference)
      const reference = accessNumber
      if (!reference) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const response = await conn.Otp.findAll({
        where: { reference }
      })
      if (response) {
        await conn.Otp.update({ status: 'INACTIVE' }, {
          where: { reference }
        })
      }
      const OTP = Math.floor(100000 + Math.random() * 900000)
      const newOTP = {
        otp: OTP,
        reference,
        status: 'ACTIVE'
      }
      const responseNEW = await conn.Otp.create(newOTP, { transaction: t })
      if (responseNEW) {
        if (type === 'mobile') {
          const reference1 = `+673${reference}`
          const msg = `Please enter the One-Time Password (OTP) ${OTP} to proceed with your transaction via Chat2Us. Need any help? Simply Talk2Us at 111.`
          let response = await got.get({
            url: sms.URL + '?app=' + sms.app + '&u=' + sms.u + '&h=' + sms.h + '&op=' +
              sms.op + '&to=' + reference1 + '&msg=' + encodeURI(msg),
            retry: 0
          })
          if (!response?.body) {
            logger.debug(defaultMessage.NOT_FOUND)
            return res.json(
              {
                data: {
                  status: 'FAILED',
                  message: defaultMessage.NOT_FOUND
                }
              })
          }
          response = JSON.parse(response.body)
        }
      }
      await t.commit()
      logger.debug('otp created successfully')
      return this.responseHelper.onSuccess(res, 'otp created successfully')
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return res.json(
        {
          data: {
            status: 'FAILED',
            message: 'Error while creating otp'
          }
        })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async validateOtp (req, res) {
    const conn = await getConnection()
    try {
      logger.debug('Into validating otp')
      if (!req?.body?.body || !req?.body?.otp) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const { accessNumber } = JSON.parse(req?.body?.body)
      const { otp } = JSON.parse(req.body.otp)
      const reference = accessNumber
      if (!reference || !accessNumber || !otp) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const response = await conn.Otp.findAll({
        where: { reference, otp, status: 'ACTIVE' },
        raw: true
      })
      let validationResppnse = ''
      if (response.length != 0) {
        logger.debug('otp verified successfully')
        validationResppnse = 'valid'
        await conn.Otp.update({ status: 'INACTIVE' }, {
          where: { reference }
        })
      } else {
        logger.debug('otp not verified')
        validationResppnse = 'inValid'
      }
      return this.responseHelper.onSuccess(res, validationResppnse)
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return res.json(
        {
          data: {
            status: 'FAILED',
            message: 'Error while verifying otp'
          }
        })
    }
  }

  async validateIcNumber (req, res) {
    try {
      const dbIcNumber = req?.body?.payload
      if (!req?.body?.enteredIcNumber) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const { icNumber } = JSON.parse(req?.body?.enteredIcNumber)
      if (!icNumber && !dbIcNumber) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      let validationResponse = ''
      if ((dbIcNumber != '' && icNumber != '') && (dbIcNumber != null && icNumber != null) && (dbIcNumber && icNumber) && (dbIcNumber).trim() == icNumber.trim()) {
        validationResponse = 'valid'
      } else {
        validationResponse = 'Invalid'
      }
      return res.json(validationResponse)
    } catch (error) {
      logger.error(error, 'Error while validating ic number')
      return res.json(
        {
          data: {
            status: 'FAILED',
            message: 'Error while validating ic number'
          }
        })
    }
  }

  async addBalance (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      if (!req?.body?.payload || !req?.body?.accessNumber) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const { refillId, offerId, price, productComercialName } = JSON.parse(req?.body?.payload)
      const boosterPurchasePayload = req?.body?.info
      const { accessNumber } = JSON.parse(req?.body?.accessNumber)
      if (!boosterPurchasePayload || !refillId || !offerId || !price || !productComercialName || !accessNumber) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const unique_id = uuid()
      const boosterTopupType = 'Booster'
      const purpose = 'D'
      const balanceTxnCode = 'MA'
      const accessNumberNew = `673${accessNumber}`
      const tibcoResponse = await mobileAddBalanceServiceImagine(
        boosterTopupType,
        unique_id,
        accessNumberNew,
        offerId,
        purpose,
        refillId,
        balanceTxnCode,
        price
      )
      const boosterPayload = {
        accessNumber,
        customerName: boosterPurchasePayload && boosterPurchasePayload.filter((ele) => ele?.name == 'CustomerName')[0].value?.stringValue || '',
        contactNo: accessNumber,
        emailId: boosterPurchasePayload && (boosterPurchasePayload.filter((ele) => ele?.name == 'PrimaryContactEmailAddress')[0].value?.stringValue).split(';')[0] || '',
        boosterName: productComercialName,
        purchaseDate: new Date(),
        status: 'Success',
        createdBy: 546,
        updatedBy: 546
      }
      if (tibcoResponse.status === 'failure') {
        boosterPayload.status = 'Failed'
      }
      await conn.BoosterPurchase.create(boosterPayload, { transaction: t })
      await t.commit()
      res.json(tibcoResponse)
    } catch (error) {
      logger.error(error, defaultMessage.ERROR)
      return res.json(
        {
          data: {
            status: 'FAILED',
            message: 'Error while verifying otp'
          }
        })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateChat (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      const waId = req?.body?.waId
      if (!req.body.body || !waId) {
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const body = JSON.parse(req.body.body)

      const chat = {
        contactNo: body.contactNo,
        emailId: body.userEmail,
        customerName: body.userName
      }
      const response = await conn.Chat.update(chat, {
        where: {
          contactNo: waId
        },
        transaction: t
      })
      await t.commit()
      return res.json(response)
    } catch (error) {
      return res.json(
        {
          data: {
            status: 'FAILED',
            message: 'Error while updating Chat'
          }
        })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateChatExistingCustomer (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      if (!req?.body) {
        logger.info(defaultMessage.MANDATORY_FIELDS_MISSING)
        return res.json(
          {
            data: {
              status: 'FAILED',
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          })
      }
      const waId = req?.body?.waId
      const identifire = req?.body?.identifire
      const info = req?.body?.info
      const body = req?.body?.body
      const userName = body && body.filter((e) => e.name == 'CustomerName')[0].value.stringValue
      const contactNo = body && body.filter((e) => e.name == 'AccessNo')[0].value.stringValue
      const userEmail = body && body.filter((e) => e.name == 'PrimaryContactEmailAddress')[0].value.stringValue
      const chat = {
        contactNo,
        emailId: userEmail,
        customerName: userName,
        identifier: identifire,
        customerInfo: info
      }
      const response = await conn.Chat.update(chat, {
        where: {
          botReq: waId
        },
        transaction: t
      })
      await t.commit()
      return res.json(response)
    } catch (error) {
      return res.json('Error while updating Chat', error)
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  // APPLICATION SERVICES

  async getChatInfo (req, res) {
    try {
      logger.debug('Fetching Chat Info')
      const chatId = req?.body?.chatId
      if (!chatId) {
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      const conn = await getConnection()
      const response = await conn.Chat.findOne({
        where: { chatId }
      })
      logger.debug('Successfully fetch Chat Info')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat Info')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat Info'))
    }
  }

  async saveChatMessages (req, res) {
    try {
      logger.debug('Saving chat messages in cache')
      const userId = req.userId
      const reqData = req.body
      if (!reqData || !reqData.message) {
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      myCache.set(String(userId + ',' + reqData.chatId), reqData.message)
      logger.debug('Successfully saved chat message in cache')
      return this.responseHelper.onSuccess(res, 'SUCCESS')
    } catch (error) {
      logger.error(error, 'Error while saving chat message')
      return this.responseHelper.onError(res, new Error('Error while saving chat message'))
    }
  }

  async getChatMessages (req, res) {
    try {
      logger.debug('Fetching chat messages in cache')
      const userId = req.userId
      const { email, id } = req.query
      const response = myCache.get(String(userId + ',' + id))
      logger.debug('Successfully fetch chat message in cache')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching chat message')
      return this.responseHelper.onError(res, new Error('Error while fetching chat message'))
    }
  }

  async getNewChats (req, res) {
    try {
      logger.debug('Fetching new chats list')
      const { limit = 10, page = 0 } = req.query
      const conn = await getConnection()
      let obj
      if (req.query) {
        obj = {
          where: { status: 'NEW' },
          order: [['chatId', 'DESC']],
          offset: (page * limit),
          limit
        }
      } else {
        obj = {
          where: { status: 'NEW' },
          order: [['chatId', 'DESC']]
        }
      }
      console.log('obj------>', obj)
      const response = await conn.Chat.findAndCountAll(obj)
      logger.debug('Successfully fetch new chats list')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching new customer list')
      return this.responseHelper.onError(res, new Error('Error while fetching new customer list'))
    }
  }

  async availableAgents (req, res) {
    try {
      logger.debug('Fetching new chats list')
      const conn = await getConnection()
      const query = `select distinct u.user_id, u.first_name, u.last_name, u.email, u.profile_picture, count(distinct c.*) as connected
      from user_session us 
      join ad_users u on u.user_id =us.user_id
      left join cc_chat c on c.user_id = us.user_id and c.status='ASSIGNED'
      where us.curr_role_id= ${chatRoleId}
      group by u.user_id, u.last_name, u.email, u.first_name, u.profile_picture`

      const resp = await conn.sequelize.query(query,
        {
          type: QueryTypes.SELECT
        }
      )
      const responseData = camelCaseConversion(resp)

      logger.debug('Successfully fetch new chats list')
      return this.responseHelper.onSuccess(res, 'SUCCESS', responseData)
    } catch (error) {
      logger.error(error, 'Error while fetching new customer list')
      return this.responseHelper.onError(res, new Error('Error while fetching new customer list'))
    }
  }

  async getChatMonitorCounts (req, res) {
    logger.debug('Getting the chat monitor counts')
    try {
      const conn = await getConnection()
      const { date } = req.query
      const createdAt = format(new Date(), 'yyyy-MM-dd')
      const query = `SELECT COUNT(*) AS queue,
        (SELECT COUNT(*) AS currently_served FROM chat WHERE status ='ASSIGNED' AND created_at::date ='${createdAt}'),
        (SELECT COUNT(*) AS abandoned_chat FROM chat WHERE status ='ABANDONED' AND created_at::date ='${createdAt}'),
        (SELECT AVG(start_at - created_at) AS wait_average FROM chat WHERE status !='ABANDONED' AND created_at::date ='${createdAt}'),
        (SELECT MAX(start_at - created_at) AS wait_Longest FROM chat WHERE status !='ABANDONED' AND created_at::date ='${createdAt}'),
        (SELECT AVG(end_at - start_at) AS chat_duration_average FROM chat WHERE status!='ABANDONED' AND created_at::date ='${createdAt}'),
        (SELECT MAX(end_at - start_at) AS chat_duration_Longest FROM chat WHERE status!='ABANDONED' AND created_at::date ='${createdAt}'),
        (SELECT COUNT(distinct user_id) AS no_of_agents FROM chat WHERE status !='ABANDONED' AND created_at::date ='${createdAt}'),
        (SELECT COUNT(user_id) AS chat_per_agent_avg FROM chat WHERE status != 'ABANDONED' AND created_at::date ='${createdAt}'),
        (SELECT COUNT(user_id) AS logged_in_agents FROM user_session WHERE created_at::date = '${createdAt}' AND curr_role_id=${chatRoleId})
        FROM chat WHERE status ='NEW' AND created_at::date ='${createdAt}'`

      const counts = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      const response = camelCaseConversion(counts)
      logger.debug('Successfully fetch Chat Monitor Count')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat Monitor Count')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat Monitor Count'))
    }
  }

  async getAssignedChats (req, res) {
    try {
      const conn = await getConnection()
      logger.debug('Fetching assigned chat list')
      const userId = req.userId
      const response = await conn.Chat.findAll({
        where: {
          userId,
          status: 'ASSIGNED'
        }
      })
      logger.debug('Successfully fetch assigned chats list')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching assigned chats')
      return this.responseHelper.onError(res, new Error('Error while fetching assigned chats'))
    }
  }

  async getNewChatCount (req, res) {
    const conn = await getConnection()
    logger.debug('Getting the new chat count')
    try {
      const response = await conn.Chat.count({
        where: {
          status: 'NEW'
        }
      })
      logger.debug('Successfully fetch New Chat Count')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat Count')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat Count'))
    }
  }

  async updateCustomerChatTime (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    logger.debug('Updating the chat')
    try {
      const socketId = req?.body?.data
      if (!socketId) {
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      const response = await conn.Chat.findOne({
        where: {
          socketId
        }
      })
      if (!response) {
        return this.responseHelper.validationError(res, new Error('Chat Not Found'))
      }
      const chat = {
        customerCloseAt: new Date()
      }
      const chatResponse = await conn.Chat.update(chat, {
        where: {
          socketId
        },
        transaction: t
      })
      await t.commit()
      logger.debug('Successfully Updated the Chat')
      return this.responseHelper.onSuccess(res, 'SUCCESS', chatResponse)
    } catch (error) {
      logger.error(error, 'Error while updating chat')
      return this.responseHelper.onError(res, new Error('Error while updating chat'))
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async assignChat (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      logger.debug('Assign chat to Agent')
      const { id } = req.params
      const userId = req.userId
      if (!id) {
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      const chat = await conn.Chat.findOne({ where: { chatId: id, status: 'NEW' } })
      if (!chat) {
        logger.debug(defaultMessage.NOT_FOUND)
        return this.responseHelper.notFound(res, new Error('Chat not found with given chat id'))
      }
      // const cutomerDetails = await getCustomerDetails(chat?.accessNo, chat.type, id)
      // // console.log('cutomerDetails==>',cutomerDetails)
      // if (!cutomerDetails) {
      //   logger.debug(defaultMessage.NOT_FOUND)
      //   return this.responseHelper.notFound(res, new Error('Customer details not found in Tibco'))
      // }
      // let plan
      // if (chat.customerInfo && chat.customerInfo.currentPlanCode) {
      //   plan = await conn.Plan.findOne({
      //     attributes: ['planName'],
      //     where: {
      //       refPlanCode: chat.customerInfo.currentPlanCode
      //     }
      //   })
      //   if (!plan) {
      //     logger.debug(defaultMessage.NOT_FOUND)
      //     return this.responseHelper.notFound(res, new Error('Plan not found'))
      //   }
      // }
      const data = {
        chatId: id,
        status: 'ASSIGNED',
        userId,
        startAt: new Date()
      }
      await conn.Chat.update(data, {
        where: {
          chatId: id,
          status: 'NEW'
        },
        transaction: t
      })
      await t.commit()
      logger.debug('Successfully assign the chat to Agent')
      return this.responseHelper.onSuccess(res, 'SUCCESS')
    } catch (error) {
      logger.error(error, 'Error when assign the chat to Agent ')
      return this.responseHelper.onError(res, new Error('Error when assign the chat to Agent'))
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async endChat (req, res) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      logger.debug('Ending Chat')
      const reqData = req.body
      const userId = req.userId
      if (!reqData || !reqData.chatId) {
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }
      const chat = await conn.Chat.findOne({ where: { chatId: reqData.chatId, userId } })
      if (!chat) {
        logger.debug('Chat not found with given chat id')
        return this.responseHelper.notFound(res, new Error('Chat not found with given chat id'))
      }
      const chatMessage = myCache.get(String(userId + ',' + chat.chatId))

      const data = {
        chatId: reqData.chatId,
        status: 'CLOSED',
        message: chatMessage,
        messageFrom: reqData.messageFrom,
        endAt: new Date()
      }
      await conn.Chat.update(data, {
        where: {
          chatId: reqData.chatId
        },
        transaction: t
      })
      myCache.del(String(userId + ',' + chat.chatId))
      await t.commit()
      logger.debug('Chat ended successfully')
      return this.responseHelper.onSuccess(res, 'Chat ended successfully')
    } catch (error) {
      logger.error(error, 'Error while ending chat')
      return this.responseHelper.onError(res, new Error('Error while ending chat'))
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getChatCount (req, res) {
    logger.debug('Getting the current chat count')
    const conn = await getConnection()
    let query
    const { selfDept, chatFromDate, chatToDate } = req.body
    if (!chatFromDate && !chatToDate) {
      return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
    }
    const userId = req.userId
    if (selfDept === 'self') {
      query = `select status,user_id, COUNT (chat_id) as count from chat where created_at::DATE >='${chatFromDate}'and created_at::DATE <='${chatToDate}' GROUP by status,user_id having 1= 1 and user_id=${userId}`
    } else {
      query = `select status, COUNT (chat_id) as count from chat where created_at::DATE >='${chatFromDate}'and created_at::DATE <='${chatToDate}' GROUP by status`
    }
    try {
      let count = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      count = camelCaseConversion(count)
      logger.debug('Successfully fetch Chat Count')
      return this.responseHelper.onSuccess(res, 'SUCCESS', count)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat Count')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat Count'))
    }
  }

  async searchChat (req, res) {
    try {
      const conn = await getConnection()
      logger.debug('Search chat list')
      const { limit = 10, page = 1 } = req.query
      const offSet = (page * limit)
      const userId = req.userId
      const { chatId, customerName, serviceNo, chatFromDate, chatToDate, status, selfDept, filters } = req.body
      let response
      let query = `SELECT ch.*,CONCAT(us.first_name ,' ',us.last_name) AS agent_name FROM chat ch 
                 LEFT JOIN users AS us ON us.user_id = ch.user_id `
      let whereClause = ' where  '

      if (selfDept && selfDept !== '' && selfDept !== undefined && selfDept === 'self') {
        whereClause = whereClause + `us.user_id =${userId}  and `
      }
      if (status && status !== '' && status !== undefined) {
        whereClause = whereClause + `ch.status ='${status.toUpperCase()}'  and `
      }
      if (chatId && chatId !== '' && chatId !== undefined) {
        whereClause = whereClause + `cast( chat_id as varchar) Ilike '%${chatId}%' and `
      }
      if (customerName && customerName !== '' && customerName !== undefined) {
        whereClause = whereClause + `customer_name Ilike '%${customerName}%' and `
      }
      if (serviceNo && serviceNo !== '' && serviceNo !== undefined) {
        whereClause = whereClause + `cast( service_no as varchar) Ilike '%${serviceNo}%' and `
      }
      if (chatFromDate && chatToDate && chatFromDate !== '' && chatToDate !== '' && chatFromDate !== undefined && chatToDate !== undefined) {
        whereClause = whereClause + `ch.created_at::DATE >= '${chatFromDate}' and ch.created_at:: DATE <= '${chatToDate}' and `
      }

      if (filters && Array.isArray(filters) && !isEmpty(filters)) {
        const filter = searchChatWithFilters(filters)
        if (filter !== '') {
          query = query + whereClause + filter + ' order by chat_id DESC'
        }
      } else {
        whereClause = whereClause.substring(0, whereClause.lastIndexOf('and'))
        query = query + whereClause + ' order by chat_id DESC'
      }
      const count = await sequelize.query('select COUNT(*) FROM (' + query + ') t', {
        type: QueryTypes.SELECT
      })
      if (req.query.page && req.query.limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }
      let rows = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      rows = camelCaseConversion(rows)

      if (rows.length > 0 & count.length > 0) {
        response = {
          rows,
          count: count[0].count
        }
      }
      logger.debug('Successfully fetch chat list')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat list')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat list'))
    }
  }

  async getChatPerAgent (req, res) {
    logger.debug('Getting the chat Per Agent')
    const conn = await getConnection()
    try {
      const { date } = req.query
      const createdAt = date === undefined ? format(new Date(), 'yyyy-MM-dd') : date
      const chatList = await conn.sequelize.query(`SELECT (u.first_name||' '||u.last_name) as user_name ,COUNT(*) AS chat_count FROM chat c
          join users u on u.user_id=c.user_id
          WHERE c.status != 'ABANDONED' and c.user_id is not null AND c.created_at::date ='${createdAt}'
          group by (u.first_name||' '||u.last_name)`,
      {
        type: QueryTypes.SELECT
      })

      const response = camelCaseConversion(chatList)
      logger.debug('Successfully fetch Chat Per Agent')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat Per Agent')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat Per Agent View'))
    }
  }

  async getLoggedInAgent (req, res) {
    logger.debug('Getting the Loggedin Agent')
    const conn = await getConnection()
    try {
      const { date } = req.query
      const createdAt = date === undefined ? format(new Date(), 'yyyy-MM-dd') : date
      const chatList = await conn.sequelize.query(`SELECT (u.first_name||' '||u.last_name) as user_name FROM user_session c
          join users u on u.user_id=c.user_id
          WHERE cast(c.created_at as date) ='${createdAt}' AND curr_role_id=${chatRoleId}`,
      {
        type: QueryTypes.SELECT
      })

      const response = camelCaseConversion(chatList)
      logger.debug('Successfully fetch Loggedin Agent')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Loggedin Agent')
      return this.responseHelper.onError(res, new Error('Error while fetching Loggedin Agent View'))
    }
  }

  async getAbandonedChatCount (req, res) {
    const conn = await getConnection()
    logger.debug('Fetching Abandoned Chat Count')
    try {
      const { searchParams } = req.body
      const query = 'select count(*) ,be_desc(cc.chat_source ) as channel from cc_chat cc '
      let whereClause = ' WHERE  cc.status=\'ABANDONED\' '
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' and CAST(cc.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(cc.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      const response = await conn.sequelize.query(query + whereClause + ' group by  cc.chat_source ', {
        type: QueryTypes.SELECT
      })
      logger.debug('Successfully Fetched Abandoned Chat Count')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Abandoned Chat Count')
      return this.responseHelper.onError(res, new Error('Error while fetching Abandoned Chat Count'))
    }
  }

  //   async getTotalChatsByChannel(req, res) {
  //     const conn = await getConnection()
  //     logger.debug('Fetching Total Chats by channel')
  //     try {
  //       const { searchParams } = req.body
  //       let query = `SELECT COUNT(*) AS count,
  //       be_desc(cc.chat_source) AS chat_source,created_at
  // FROM cc_chat cc

  // `
  //       let whereClause = ' WHERE  '
  //       if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
  //         whereClause = whereClause + 'CAST(cc.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
  //       }
  //       if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
  //         whereClause = whereClause + ' CAST(cc.created_at as DATE) <= \'' + searchParams.endDate + '\' '
  //       }
  //       if (searchParams.startDate || searchParams.endDate) {
  //         query = query + whereClause
  //       }
  //       const response = await conn.sequelize.query(query + ' GROUP BY cc.chat_source, created_at order by created_at  ', {
  //         type: QueryTypes.SELECT
  //       })
  //       logger.debug('Successfully Fetched Total Chats by channel')
  //       return this.responseHelper.onSuccess(res, 'SUCCESS', response)
  //     } catch (error) {
  //       logger.error(error, 'Error while fetching Total Chats by channel')
  //       return this.responseHelper.onError(res, new Error('Error while fetching Total Chats by channel'))
  //     }
  //   }

  async getTotalChatsByChannel (req, res) {
    const conn = await getConnection()
    logger.debug('Fetching Total Chats by channel')
    try {
      const { searchParams } = req.body
      let query = 'select count(*) ,be_desc(cc.chat_source )from cc_chat cc '
      let whereClause = ' WHERE  '
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + 'CAST(cc.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(cc.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      if (searchParams.startDate || searchParams.endDate) {
        query = query + whereClause
      }
      const response = await conn.sequelize.query(query + ' group by  cc.chat_source ', {
        type: QueryTypes.SELECT
      })
      logger.debug('Successfully Fetched Total Chats by channel')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Total Chats by channel')
      return this.responseHelper.onError(res, new Error('Error while fetching Total Chats by channel'))
    }
  }

  async getLiveSupportByChannel (req, res) {
    const conn = await getConnection()
    logger.debug('Fetching Live support by channel')
    try {
      const { searchParams } = req.body
      const query = 'select count(*), be_desc(cch.chat_source) as channel from cc_chat_hdr cch  '
      let whereClause = ' WHERE  cch.is_live_chat =\'Y\' '
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' AND CAST(cch.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(cch.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      console.log('query + whereClause +  group by  cch.chat_source ------>', query + whereClause + ' group by  cch.chat_source ')
      const response = await conn.sequelize.query(query + whereClause + ' group by  cch.chat_source ', {
        type: QueryTypes.SELECT
      })
      logger.debug('Successfully Fetched Live Support by channel')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Live Support by channel')
      return this.responseHelper.onError(res, new Error('Error while fetching Live Support by channel'))
    }
  }

  // need to get the logic
  async getTopCustomersByChannel (req, res) {
    const conn = await getConnection()
    logger.debug('Fetching Live support by channel')
    try {
      const { searchParams } = req.body
      let query = 'select count(*) from cust_customers cc  '
      let whereClause = ' WHERE  '
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + 'CAST(cc.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(cc.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      if (searchParams.startDate || searchParams.endDate) {
        query = query + whereClause
      }
      // need to get the logic
      const response = await conn.sequelize.query(query + ' group by   order by count desc limit 5', {
        type: QueryTypes.SELECT
      })
      logger.debug('Successfully Fetched Live Support by channel')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Live Support by channel')
      return this.responseHelper.onError(res, new Error('Error while fetching Live Support by channel'))
    }
  }

  async getAverageHandlingTime (req, res) {
    const conn = await getConnection()
    logger.debug('Fetching Live support by channel')
    try {
      const { searchParams } = req.body
      let query = 'SELECT * from bcae_chat_handling_fn(null,null)'
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined &&
        searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        query = `SELECT * from bcae_chat_handling_fn('${searchParams.startDate}','${searchParams.endDate}') `
      }
      const response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        logging: true
      })
      // response = camelCaseConversion(response)
      console.log('response--------->', response)
      logger.debug('Successfully Fetched Average Handling Time')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Average Handling Time')
      return this.responseHelper.onError(res, new Error('Error while fetching Average Handling Time'))
    }
  }

  async getAverageResponseTime (req, res) {
    const conn = await getConnection()
    logger.debug('Fetching Average Response Time')
    try {
      const { searchParams } = req.body
      let query = 'SELECT * from bcae_chat_frt_fn(null,null)'
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined &&
        searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        query = `SELECT * from bcae_chat_frt_fn('${searchParams.startDate}','${searchParams.endDate}') `
      }
      const response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        logging: true
      })
      // response = camelCaseConversion(response)
      console.log('response----->', response)
      logger.debug('Successfully Fetched Average Response Time')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Average Response Time')
      return this.responseHelper.onError(res, new Error('Error while fetching Average Response Time'))
    }
  }

  async getAverageResponseTimeData (req, res) {
    const conn = await getConnection()
    logger.debug('-----Fetching Average Response Time-----')
    try {
      const { searchParams } = req.body
      let query = 'SELECT * from bcae_chat_frt_fn(null,null)'
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined &&
        searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        query = `SELECT * from bcae_chat_frt_fn('${searchParams.startDate}','${searchParams.endDate}') `
      }
      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        logging: true
      })
      response = camelCaseConversion(response)
      // console.log('response----->',response)
      logger.debug('Successfully Fetched Average Response Time----->')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Average Response Time')
      return this.responseHelper.onError(res, new Error('Error while fetching Average Response Time'))
    }
  }

  async getTurnAroundTime (req, res) {
    const conn = await getConnection()
    logger.debug('Fetching Turn Around Time')
    try {
      const { searchParams } = req.body
      let query = 'SELECT * from bcae_chat_tat_fn(null,null)'
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined &&
        searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        query = `SELECT * from bcae_chat_tat_fn('${searchParams.startDate}','${searchParams.endDate}') `
      }
      const response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        logging: true
      })
      // response = camelCaseConversion(response)
      console.log('response-------TAT----->', response)
      logger.debug('Successfully Fetched Turn Around Time')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Turn Around Time')
      return this.responseHelper.onError(res, new Error('Error while fetching Turn Around Time'))
    }
  }

  async getProducts (req, res) {
    try {
      const { body } = req

      // const { error } = getEventsValidator.validate(query)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.chatService.getProducts(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while getting product List')
      return this.responseHelper.onError(res, new Error('Error while getting product List'))
    }
  }

  async getChatHistory (req, res) {
    const conn = await getConnection()
    logger.debug('Fetching Chat History')
    try {
      const { searchParams } = req.body
      let query = 'SELECT * from bcae_chat_fn(null,null,null)'
      if (searchParams?.startDate || searchParams?.endDate || searchParams?.channel) {
        if (!searchParams?.startDate && !searchParams?.endDate && searchParams?.channel !== '') {
          if (searchParams?.channel !== 'skel-channel-all') {
            query = `SELECT * FROM bcae_chat_fn('${searchParams?.channel}', null, null)`
          } else {
            query = 'SELECT * FROM bcae_chat_fn(null, null, null)'
          }
        } else {
          if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined && searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
            query = `SELECT * FROM bcae_chat_fn(null, '${searchParams.startDate}', '${searchParams.endDate}')`
          }

          if (searchParams.channel && searchParams.channel !== '' && searchParams.channel !== undefined) {
            if (searchParams?.channel !== 'skel-channel-all') {
              query = `SELECT * FROM bcae_chat_fn('${searchParams?.channel}', '${searchParams.startDate}', '${searchParams.endDate}')`
            } else {
              query = `SELECT * FROM bcae_chat_fn(null, '${searchParams.startDate}', '${searchParams.endDate}')`
            }
          }
        }
      }

      console.log('chat histort query------>', query)

      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        logging: true
      })
      response = camelCaseConversion(response)
      logger.debug('Successfully Fetched Chat History')
      return this.responseHelper.onSuccess(res, 'SUCCESS', response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat History')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat History'))
    }
  }

  async getChatMenu (req, res) {
    try {
      const { body } = req

      // const { error } = getEventsValidator.validate(query)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.chatService.getChatMenu(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching main menu')
      return this.responseHelper.onError(res, new Error('Error while fetching main menu'))
    }
  }

  async getLookup (req, res) {
    try {
      const { body } = req

      // const { error } = getEventsValidator.validate(query)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.chatService.getLookup(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching main menu')
      return this.responseHelper.onError(res, new Error('Error while fetching main menu'))
    }
  }

  async getServiceDetails (req, res) {
    try {
      const { body } = req

      // const { error } = getEventsValidator.validate(query)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.chatService.getServiceDetails(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching Turn Around Time')
      return this.responseHelper.onError(res, new Error('Error while fetching Turn Around Time'))
    }
  }

  async createCustomer (req, res) {
    let t
    try {
      const { body } = req

      // const { error } = getEventsValidator.validate(query)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()

      const response = await this.chatService.createCustomer(body, conn, t)
      if (response.status === 200) t.commit()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while creating create customer')
      return this.responseHelper.onError(res, new Error('Error while creating create customer'))
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getChatDashboardMonitorCounts (req, res) {
    try {
      const { query, body, roleId, departmentId } = req
      const data = {
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.chatService.getChatDashboardMonitorCounts(data, departmentId, roleId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat Monitor Count')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat Monitor Count'))
    }
  }

  async getChatAgentSummary (req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.chatService.getChatAgentSummary(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat Monitor Count')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat Monitor Count'))
    }
  }

  async availableChatAgents (req, res) {
    try {
      const { query, departmentId, roleId } = req
      const data = {
        ...query
      }
      const conn = await getConnection()
      const response = await this.chatService.availableChatAgents(data, departmentId, roleId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat Monitor Count')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat Monitor Count'))
    }
  }

  async getChatDetails (req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.chatService.getChatDetails(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat Monitor Count')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat Monitor Count'))
    }
  }

  async getAllChatCount (req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.chatService.getAllChatCount(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching Chat Monitor Count')
      return this.responseHelper.onError(res, new Error('Error while fetching Chat Monitor Count'))
    }
  }

  async createContact (req, res) {
    let t
    try {
      const { body } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()

      const response = await this.chatService.createContact(body, conn, t)
      if (response.status === 200) t.commit()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while creating create customer')
      return this.responseHelper.onError(res, new Error('Error while creating create customer'))
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async chatAbandonedJob (req, res) {
    try {
      const { params } = req
      const conn = await getConnection()
      const response = await this.chatService.chatAbandonedJob(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while creating create customer')
      return this.responseHelper.onError(res, new Error('Error stating Chat Abandoned Job'))
    }
  }
}

const searchChatWithFilters = (filters) => {
  let query = ''
  for (const record of filters) {
    if (record.value) {
      if (record.id === 'contactNo') {
        if (record.filter === 'contains') {
          query = query + ' cast(ch.contact_no as varchar) Ilike \'%' + record.value.toString() + '%\''
        } else {
          query = query + ' cast(ch.contact_no as varchar) not Ilike \'%' + record.value.toString() + '%\''
        }
      } else if (record.id === 'status') {
        if (record.filter === 'contains') {
          query = query + ' ch.status Ilike \'%' + record.value.toUpperCase() + '%\''
        } else {
          query = query + ' ch.status not Ilike \'%' + record.value.toUpperCase() + '%\''
        }
      } else if (record.id === 'email') {
        if (record.filter === 'contains') {
          query = query + ' ch.email_id Ilike \'%' + record.value + '%\''
        } else {
          query = query + ' ch.email_id not Ilike \'%' + record.value + '%\''
        }
      } else if (record.id === 'agentName') {
        if (record.filter === 'contains') {
          query = query + ' (us.first_name Ilike \'%' + record.value + '%\' or us.last_name Ilike \'%' + record.value + '%\' or concat(us.first_name,\' \',us.last_name) Ilike \'%' + record.value + '%\')'
        } else {
          query = query + ' (us.first_name not Ilike \'%' + record.value + '%\' and us.last_name not Ilike \'%' + record.value + '%\' or concat(us.first_name,\' \',us.last_name) not Ilike \'%' + record.value + '%\')'
        }
      } else if (record.id === 'idValue') {
        if (record.filter === 'contains') {
          query = query + ' ch.id_value Ilike \'%' + record.value + '%\''
        } else {
          query = query + ' ch.id_value not Ilike \'%' + record.value + '%\''
        }
      } else if (record.id === 'category') {
        if (record.filter === 'contains') {
          query = query + ' ch.category Ilike \'%' + record.value + '%\''
        } else {
          query = query + ' ch.category not Ilike \'%' + record.value + '%\''
        }
      }
      query = query + ' and '
    }
  }
  query = query.substring(0, query.lastIndexOf('and'))
  return query
}
