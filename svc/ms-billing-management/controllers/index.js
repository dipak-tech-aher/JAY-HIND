import { } from '@validators'
import { ResponseHelper, statusCodeConstants, logger } from '@utils'
import BillingService from '@services/billing.service'
const { getConnection } = require('@services/connection-service')

export class BillingController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.billingService = new BillingService()
  }

  async getBillingDetails(req, res) {
    try {
      const { query, userId } = req
      //   const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      //   if (error) {
      //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: 'Missing customer information' })
      //   }
      const conn = await getConnection()
      const response = await this.billingService.getBillingDetails(query, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCurrentBill(req, res) {
    try {
      const { query, userId, body } = req
      const conn = await getConnection()
      const response = await this.billingService.getCurrentBill(body, query, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getPreviousBill(req, res) {
    try {
      const { query, userId, body } = req
      const conn = await getConnection()
      const response = await this.billingService.getPreviousBill(body, query, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getBillMonths(req, res) {
    try {
      const { customerUuid } = req.body
      const userId = req
      if (!customerUuid) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: 'Missing customer information' })
      }
      const conn = await getConnection()
      const response = await this.billingService.getBillMonths(customerUuid, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async paymentBill(req, res) {
    try {
      const { customerUuid } = req.body
      const { userId, roleId, departmentId } = req
      if (!customerUuid) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: 'Missing customer information' })
      }
      const conn = await getConnection()
      const response = await this.billingService.paymentBill(req.body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createPayment(req, res) {
    try {
      const { customerUuid } = req.body
      const { userId, roleId, departmentId } = req
      if (!customerUuid) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: 'Missing customer information' })
      }
      const conn = await getConnection()
      const response = await this.billingService.createPayment(req.body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async paymentHistory(req, res) {
    try {
      const { customerUuid } = req.body
      const userId = req
      if (!customerUuid) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: 'Missing customer information' })
      }
      const conn = await getConnection()
      const response = await this.billingService.paymentHistory(req.body, req.query, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getLookUpData(req, res) {
    try {
      const { userId } = req
      const conn = await getConnection()
      const response = await this.billingService.getLookUpData(userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCurrentBillCycle(req, res) {
    try {
      const { customerUuid } = req.body
      const userId = req
      // if (!customerUuid) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: 'Missing customer information' })
      // }
      const conn = await getConnection()
      const response = await this.billingService.getCurrentBillCycle(customerUuid, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
