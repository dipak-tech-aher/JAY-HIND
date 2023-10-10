import InvoiceService from '@services/invoice.service'
import { statusCodeConstants, logger, ResponseHelper } from '@utils'
import { getInvoicesValidator } from '@validators'
const { getConnection } = require('@services/connection-service')

export class InvoiceController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.invoiceService = new InvoiceService()
  }

  async getInvoices(req, res) {
    try {
      const { body, query, userId } = req
      const data = { ...query, ...body }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.getInvoices(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async finalSubmit(req, res) {
    try {
      const { body, query, userId } = req
      const data = { ...query, ...body, userId }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.finalSubmit(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async invoiceCount(req, res) {
    try {
      const { body, query, userId } = req
      const data = { ...query, ...body, userId }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.invoiceCount(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async revenueCountByMonth(req, res) {
    try {
      const { body, query, userId } = req
      const data = { ...query, ...body, userId }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.revenueCountByMonth(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async monthlyContractHistory(req, res) {
    try {
      const { body, query, userId } = req
      const data = { ...query, ...body, userId }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.monthlyContractHistory(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async revenueCountHistory(req, res) {
    try {
      const { body, query, userId } = req
      const data = { ...query, ...body, userId }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.revenueCountHistory(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async arBillCountsbyBillRefNo(req, res) {
    try {
      const { body, query, userId, params } = req
      const data = { ...query, ...body, userId, ...params }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.arBillCountsbyBillRefNo(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async arBillCountsbyBillRefNos(req, res) {
    try {
      const { body, query, userId, params } = req
      const data = { ...query, ...body, userId, ...params }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.arBillCountsbyBillRefNos(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async postBillAdjustment(req, res) {
    try {
      const { body, query, userId, params } = req
      const data = { ...query, ...body, userId, ...params }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.postBillAdjustment(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async invoicePayment(req, res) {
    try {
      const { body, query, userId, params } = req
      const data = { ...query, ...body, userId, ...params }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.invoicePayment(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createInvoice(req, res) {
    try {
      const { body, query, userId } = req
      const data = { ...query, ...body, userId }
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.invoiceService.createInvoice(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInvoiceById(req, res) {
    try {
      const { params, userId } = req
      // const { error } = getInvoicesValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }

      const conn = await getConnection()
      const response = await this.invoiceService.getInvoiceById(params, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async paymentHistory(req, res) {
    try {
      const { params, userId, body } = req

      const conn = await getConnection()
      const response = await this.invoiceService.paymentHistory(body, params, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
