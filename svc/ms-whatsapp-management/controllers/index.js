import WADashboardService from '@services/wadashboard.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import { } from '@validators'
const { getConnection } = require('@services/connection-service')

export class WADashboardController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.waDashboardService = new WADashboardService()
  }

  async getWhatsAppCounts (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.waDashboardService.getWhatsAppCounts(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getWhatsAppCountsDetails (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.waDashboardService.getWhatsAppCountsDetails(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getWhatsAppReports (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.waDashboardService.getWhatsAppReports(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getWhatsAppHistory (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.waDashboardService.getWhatsAppHistory(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getWhatsAppGraphDataByDay (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.waDashboardService.getWhatsAppGraphDataByDay(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getWhatsAppGraphDataByTime (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.waDashboardService.getWhatsAppGraphDataByTime(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getWhatsAppGraphComplaintData (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.waDashboardService.getWhatsAppGraphComplaintData(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getWhatsAppGraphFollowUpData (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.waDashboardService.getWhatsAppGraphFollowUpData(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
