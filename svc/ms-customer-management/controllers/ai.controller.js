import AIService from '@services/ai.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import {
  getCustomerValidator, registerCustomerValidator, recentActivitiesValidator,
  updateCustomerValidator, deleteAddressContactValidator, createCustomerValidator,
  /* updateStatusValidator, */ getCustomerInteractionValidation
} from '@validators'
import { getConnection } from '@services/connection-service'

const hapiErrorQuotes = {
  errors: {
    wrap: {
      label: ''
    }
  }
}

export class AIController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.aiService = new AIService()
  }

  async trainModel (req, res) {
    try {
      const { body, query, userId, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      // const { error } = await getCustomerValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.aiService.trainModel(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
  async sentimentAnalysis (req, res) {
    try {
      const { body, query, userId, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      // const { error } = await getCustomerValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.aiService.sentimentAnalysis(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
  async prediction (req, res) {
    try {
      const { body, query, userId, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      // const { error } = await getCustomerValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.aiService.prediction(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
 }
