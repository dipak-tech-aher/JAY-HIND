import ReportService from '@services/report.service'
import { ResponseHelper, defaultMessage, logger, statusCodeConstants } from '@utils'
import {
  getClosedInteractionsValidator,
  getClosedOrdersValidator,
  getCreatedInteractionsValidator,
  getCreatedOrdersValidator,
  getOpenInteractionsValidator,
  getOpenOrdersValidator,
  getCreatedCustomerValidator
} from '@validators'

const { getConnection } = require('@services/connection-service')

export class ReportController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.reportService = new ReportService()
  }

  /** BCAE 2.0 SERVICES */
  async getOpenInteractions (req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = getOpenInteractionsValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.reportService.getOpenInteractions(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getClosedInteractions (req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = getClosedInteractionsValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.reportService.getClosedInteractions(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCreatedInteractions (req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = getCreatedInteractionsValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.reportService.getCreatedInteractions(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getOpenOrders (req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = getOpenOrdersValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.reportService.getOpenOrders(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getClosedOrders (req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = getClosedOrdersValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.reportService.getClosedOrders(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCreatedOrders (req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = getCreatedOrdersValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.reportService.getCreatedOrders(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCreatedCustomer (req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = getCreatedCustomerValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.reportService.getCreatedCustomer(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  // AIOS SERVICES

  async getOpenOrClosedInteractions (req, res) {
    logger.debug('Fetching open/close interactions')
    try {
      const searchParams = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.getOpenOrClosedInteractions(searchParams, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getChatInteractions (req, res) {
    try {
      logger.debug('Fetching chat Interactions')
      const { limit = 10, page = 1 } = req.query
      const offSet = (page * limit)
      const {
        chatId, accessNumber, email, agent, contactNo, customerName, serviceType, chatFromDate,
        chatToDate, chatStatus, filters
      } = req.body
      const response = await this.reportService.getChatInteractions(chatId, accessNumber, email, agent, contactNo, customerName, serviceType, chatFromDate, chatToDate, chatStatus, filters, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async dailyChatReportNewCustomers (req, res) {
    try {
      logger.debug('Fetching daily chat report new customers')
      const { limit = 10, page = 1 } = req.query
      const offSet = (page * limit)
      const { chatFromDate, chatToDate } = req.body
      const response = await this.reportService.dailyChatReportNewCustomers(chatFromDate, chatToDate, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async dailyChatReportBoosterPurchase (req, res) {
    try {
      logger.debug('Fetching daily chat report for booster purchase')
      const { limit = 10, page = 0 } = req.query
      const offSet = (page * limit)
      const { chatFromDate, chatToDate } = req.body
      const response = await this.reportService.dailyChatReportBoosterPurchase(chatFromDate, chatToDate, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching Daily Chat Report For Booster Purchase')
      return this.responseHelper.onError(res, new Error('Error while fetching Daily Chat Report For Booster Purchase'))
    }
  }

  async dailyChatReportCounts (req, res) {
    try {
      logger.debug('Fetching Daily Visited & Connected To Agent Chat Report Counts')
      const { chatFromDate, chatToDate } = req.body
      const response = await this.reportService.dailyChatReportCounts(chatFromDate, chatToDate)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching Daily Visited & Connected To Agent Chat Report Counts')
      return this.responseHelper.onError(res, new Error('Error while fetching Daily Visited & Connected To Agent Chat Report Counts'))
    }
  }

  // BASE PRODUCT SERVICES

  async loginSearch (req, res) {
    try {
      logger.debug('Getting login detailed list')
      const { userID, userName, loginDateTime, logoutDateTime } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit
      const response = await this.reportService.loginSearch(userID, userName, loginDateTime, logoutDateTime, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async openClosedInteractionSearch (req, res) {
    try {
      const {
        interactionID, interactionType, woType, intxnstatus, customerType,
        problemType, customerNo, customerName, billRefNumber, serviceNo,
        dateFrom, dateTo, reportType, entity
      } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit
      const response = await this.reportService.openClosedInteractionSearch(interactionID, interactionType, woType, intxnstatus, customerType,
        problemType, customerNo, customerName, billRefNumber, serviceNo,
        dateFrom, dateTo, reportType, entity, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async chatSearch (req, res) {
    try {
      logger.debug('Getting chat Details Search list')
      const { chatType, serviceNo, customerName, agentName, chatStartDateTime, chatEndDateTime } = req.body
      const { limit, page } = req.query
      const offSet = page * limit
      const response = await this.reportService.chatSearch(chatType, serviceNo, customerName, agentName, chatStartDateTime, chatEndDateTime, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async auditTrailSearch (req, res) {
    try {
      logger.debug('Getting audit Trail list')
      const { userID, userName, fromDateTime, toDateTime } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit
      const response = await this.reportService.auditTrailSearch(userID, userName, fromDateTime, toDateTime, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async productSearch (req, res) {
    try {
      logger.debug('Getting product list')
      const { productType, productName, productServiceType, productStatus } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit
      const bind = {
        productName: productName || null,
        productServiceType: productServiceType || null,
        productStatus: productStatus || null
      }
      const response = await this.reportService.productSearch(productType, productName, productServiceType, productStatus, bind, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async slaSearch (req, res) {
    try {
      logger.debug('Getting SLA detailed list')
      const {
        interactionID, interactionType, woType, status, customerNo, customerName, billRefNumber, serviceNo,
        dateFrom, dateTo, aging, sla, reportType
      } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit
      const response = await this.reportService.slaSearch(interactionID, interactionType, woType, status, customerNo, customerName, billRefNumber, serviceNo, dateFrom, dateTo, aging, sla, reportType, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async deptwiseInteractionSearch (req, res) {
    try {
      logger.debug('Getting departmentwise Interaction detailed list')
      const {
        interactionID, interactionType, woType, status, customerType, customerNo, customerName, billRefNumber, serviceNo,
        dateFrom, dateTo, aging, sla, reportType
      } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.deptwiseInteractionSearch(interactionID, interactionType, woType, status, customerType, customerNo, customerName, billRefNumber, serviceNo,
        dateFrom, dateTo, aging, sla, reportType, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async invoiceSearch (req, res) {
    try {
      logger.debug('Getting invoice detailed list')
      const {
        customerNo, customerName, customerType, billRefNumber,
        invoiceNumber, invoiceDate, invoiceStatus
      } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.invoiceSearch(customerNo, customerName, customerType, billRefNumber, invoiceNumber, invoiceDate, invoiceStatus, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async billingSearch (req, res) {
    try {
      logger.debug('Getting Billing detailed list')
      const {
        customerNo, customerName, customerType, billRefNumber,
        serviceNo, contractID, contractStartDate, contractEndDate,
        contractStatus
      } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.billingSearch(customerNo, customerName, customerType, billRefNumber, serviceNo, contractID, contractStartDate, contractEndDate, contractStatus, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async followupCount (req, res) {
    try {
      logger.debug('Getting FollowUp Count Report')
      const { entity, reportType } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.followupCount(entity, reportType, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async followup (req, res) {
    try {
      logger.debug('Getting FollowUp Report')
      const { frequency, reportType, entity } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.followup(frequency, reportType, entity, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async followupInteraction (req, res) {
    try {
      logger.debug('Getting TAT Report')
      const { reportType, frequency, entity } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.followupInteraction(reportType, frequency, entity, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async tatReport (req, res) {
    try {
      logger.debug('Getting TAT Report')
      const { reportType } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.tatReport(reportType, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async fcrMisReport (req, res) {
    try {
      logger.debug('Getting fcr mis Report')
      const { reportType } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.fcrMisReport(reportType, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createdInteractionSearch (req, res) {
    try {
      logger.debug('Getting Created Interaction detailed list')
      const {
        interactionID, interactionType, woType, intxnstatus, customerType,
        problemType, customerNo, customerName, billRefNumber, serviceNo,
        dateFrom, dateTo, reportType, entity
      } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.createdInteractionSearch(interactionID, interactionType, woType, intxnstatus, customerType,
        problemType, customerNo, customerName, billRefNumber, serviceNo,
        dateFrom, dateTo, reportType, entity, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async fcrReport (req, res) {
    try {
      logger.debug('Getting FCR Report')
      const {
        interactionID, interactionType, problemType, serviceType,
        dateFrom, dateTo, reportType, role, compliance
      } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.fcrReport(interactionID, interactionType, problemType, serviceType, dateFrom, dateTo, reportType, role, compliance, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async fcrAgentReport (req, res) {
    try {
      logger.debug('Getting fcr agent Report')
      const { reportType, interactionType } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit
      const response = await this.reportService.fcrAgentReport(reportType, interactionType, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async ticketStatistics (req, res) {
    try {
      logger.debug('Getting Ticket Statistics Report')
      const { reportType, dateFrom, dateTo, dateRange } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      if (!dateFrom) {
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }

      if (!dateTo) {
        return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
      }

      const response = await this.reportService.ticketStatistics(reportType, interactionType, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async followupCountdtl (req, res) {
    try {
      logger.debug('Getting FollowUp Count Details Report')
      const { entity, reportType } = req.body
      const { limit = 10, page = 0 } = req.query
      const offSet = page * limit

      const response = await this.reportService.followupCountdtl(entity, reportType, limit, page, offSet)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createSurvey (req, res) {
    let t
    try {
      logger.debug('Getting FollowUp Count Details Report')
      const body = req.body
      const userId = req.userId
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.reportService.createSurvey(body, userId, conn, t)
      if (response.status === 200) t.commit()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getBIToken (req, res) {
    try {
      logger.info('Getting the Token ')
      const { dashboardObj } = req.params
      let originIP = req.get('x-forwarded-for')
      if (!originIP || originIP === null) {
        if (req.socket && req.socket.remoteAddress) {
          originIP = req.socket.remoteAddress
        }
      }
      const userAgent = req.get('user-agent')
      const body = {
        'X-FORWARDED-FOR': originIP,
        'user-agent': userAgent
      }
      const response = await this.reportService.fetchGuestToken(dashboardObj)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getiFrameLink (req, res) {
    try {
      logger.info('Getting the Token ')
      const { dashboardObj } = req.params
      const response = await this.reportService.getiFrameLink()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getSurveyStats (req, res) {
    try {
      logger.info('Getting the Token ')
      const params = req.params
      const conn = await getConnection()
      const response = await this.reportService.getSurveyStats(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getSurveyExportExcel (req, res) {
    try {
      logger.info('Getting the Token ')
      const params = req.params
      const query = req.query
      const conn = await getConnection()
      const response = await this.reportService.getSurveyExportExcel({ ...query, ...params }, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAggregationData (req, res) {
    try {
      const { params, query } = req
      const conn = await getConnection()
      const response = await this.reportService.getAggregationData({ ...query, ...params }, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
