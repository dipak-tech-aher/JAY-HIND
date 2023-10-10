import WhatsAppService from '@services/whatsApp.service'

import { logger, ResponseHelper, statusCodeConstants } from '@utils'
const { getConnection } = require('@services/connection-service')

export class WhatsAppController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.whatsAppService = new WhatsAppService()
  }


  async sendInteractiveMsg(req, res) {
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }

      const response = await this.whatsAppService.sendInteractiveMsg(data)
      res.status(200).send(response)
      //return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }


  async fbGet(req, res) {
    try {
      const mode = req.query['hub.mode']
      const token = req.query['hub.verify_token']
      const challenge = req.query['hub.challenge']
      const tranId = req.query['tenant-id']
      const data = {
        mode,
        token,
        challenge,
        tranId
      }
      const conn = await getConnection()
      const response = await this.whatsAppService.fbGet(data, conn)
      if (response?.data !== false) {
        res.status(200).send(challenge)
      } else {
        res.sendStatus(403)
      }
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
  async fbPost(req, res) {
    try {
      const { body, query, params } = req
      const tranId = req.query['tenant-id']
      const data = {
        ...params,
        ...query,
        ...body,
        tranId
      }
      const conn = await getConnection()
      const response = await this.whatsAppService.fbPost(data, conn)
      res.status(200).send()
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
  async validateUser(req, res) {
    try {
      const { body, query, params } = req
      const tranId = req.query['tenant-id']
      const data = {
        ...params,
        ...query,
        ...body,
        tranId
      }
      if (!body.whatsappNumber) {
        res.json({ status: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      const serviceResponse = await this.whatsAppService.validateUser(data, conn)
      res.json({ user: serviceResponse.message, status: serviceResponse?.status })
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerSummary(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getCustomerSummary(data, conn, t)
      res.status(200).send(response)
      //return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getIhubCustomerSummary(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getIhubCustomerSummary(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getCustomerSummaryFixedline(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getCustomerSummaryFixedline(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getCustomerSummaryMobile(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getCustomerSummaryMobile(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getOpenTickets(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getOpenTickets(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getActiveOffers(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getActiveOffers(data, conn, t)
      res.status(200).send(response)
      //return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async contractDetails(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      //const { accessNumber } = req.body

      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.contractDetails(data, conn, t)
      res.status(200).send()
      //return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getInboundMessage(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.waId) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getInboundMessage(data, conn, t)
      if (response) {
        res.json(response.value)
      } else {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async whatsAppWorkflow(req, res) {
    let t
    try {
      const { body, query, params } = req
      const tranId = req.query['tenant-id']
      const data = {
        ...params,
        ...query,
        ...body,
        tranId
      }
      const { mobileNumber, msg, source } = req.body
      // console.log('Calling whatsAppWorkflow from controller', mobileNumber, msg, source, data)
      if (!mobileNumber || !msg || !source) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.whatsAppWorkflow(data, conn, t)
      // console.log('Response in the controller-->', response)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getComplaintsList(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getComplaintsList(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async createComplaint(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.createComplaint(data, conn, t);
      if (response.statusCode == "SUCCESS") await t.commit()
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async createfollowUp(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.createfollowUp(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getNoOfCategories(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getNoOfCategories(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getListOfCategories(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getListOfCategories(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getServiceCategory(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getServiceCategory(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getServiceType(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getServiceType(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getAccountDetails(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getAccountDetails(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getFixedlinePlanInfo(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getFixedlinePlanInfo(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getPrepaidBoosterDetails(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getPrepaidBoosterDetails(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getBillInfo(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getBillInfo(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getServiceStatus(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getServiceStatus(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getPostpaidPlanInfo(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getPostpaidPlanInfo(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getFixedlineServiceStatus(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getFixedlineServiceStatus(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getFixedlineBoosterDetails(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getFixedlineBoosterDetails(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getPrepaidCreditDetails(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getPrepaidCreditDetails(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  async getContractDetails(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.getContractDetails(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async helpInboundMsg(req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      if (!body.accessNumber) {
        res.json({ statusCode: statusCodeConstants.FAILED })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.whatsAppService.helpInboundMsg(data, conn, t)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getInteractionList(req, res) {
    try {
      const { body } = req
      const data = { ...body }
      // if (!body.accessNumber) {
      //   res.json({ statusCode: statusCodeConstants.FAILED })
      // }
      const conn = await getConnection()
      const response = await this.whatsAppService.getInteractionList(data, conn)
      // console.log('response', response)
      res.status(200).send(response);
    } catch (error) {
      logger.error(error)
      res.status(500).send("Internal Server Error");
      // return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInteractionDetails(req, res) {
    try {
      const { body, query, params } = req
      const data = { ...body }
      // if (!body.accessNumber) {
      //   res.json({ statusCode: statusCodeConstants.FAILED })
      // }
      const conn = await getConnection()
      const response = await this.whatsAppService.getInteractionDetails(data, conn)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      res.status(500).send("Internal Server Error");
      // return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getBusinessParameterLookup(req, res) {
    try {
      const { body } = req
      const data = { ...body }
      const conn = await getConnection()
      const response = await this.whatsAppService.getBusinessParameterLookup(data, conn)
      // console.log('response', response)
      res.status(200).send(response);
    } catch (error) {
      logger.error(error)
      res.status(500).send("Internal Server Error");
    }
  }

  async getRequestStatement(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.whatsAppService.getRequestStatement(body, conn)
      res.status(200).send(response);
    } catch (error) {
      logger.error(error)
      res.status(500).send("Internal Server Error");
    }
  }

  async getRequestStatementList(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.whatsAppService.getRequestStatementList(body, conn)
      res.status(200).send(response);
    } catch (error) {
      logger.error(error)
      res.status(500).send("Internal Server Error");
    }
  }

  async getServiceList(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.whatsAppService.getServiceList(body, conn)
      res.status(200).send(response);
    } catch (error) {
      logger.error(error)
      res.status(500).send("Internal Server Error");
    }
  }

  async getServiceDetails(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.whatsAppService.getServiceDetails(body, conn)
      res.status(200).send(response);
    } catch (error) {
      logger.error(error)
      res.status(500).send("Internal Server Error");
    }
  }

  async searchInteractionWithKeyword(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.whatsAppService.searchInteractionWithKeyword(body, conn)
      res.status(200).send(response);
    } catch (error) {
      logger.error(error)
      res.status(500).send("Internal Server Error");
    }
  }
  
  async getCustomerList(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.whatsAppService.getCustomerList(body, conn)
      res.status(200).send(response);
    } catch (error) {
      logger.error(error)
      res.status(500).send("Internal Server Error");
    }
  }

  async getCustomerDetails(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.whatsAppService.getCustomerDetails(body, conn)
      res.status(200).send(response);
    } catch (error) {
      logger.error(error)
      res.status(500).send("Internal Server Error");
    }
  }
}
