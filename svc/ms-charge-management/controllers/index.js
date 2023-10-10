import ChargeService from '@services/charge.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import { createChargeValidator, getChargeByIdValidator, getChargeByListValidator, updateChargeValidator } from '@validators'

export class ChargeController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.chargeService = new ChargeService()
  }

  async createCharge(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const { error } = createChargeValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const response = await this.chargeService.createCharge(body, departmentId, roleId, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getChargeById(req, res) {
    try {
      const { params } = req

      const data = {
        ...params
      }
      const { error } = getChargeByIdValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const response = await this.chargeService.getChargeById(data)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getChargeByName(req, res) {
    try {
      // const { body } = req
      // const userId = req.userId
      // const { error } = getChargeByNameValidator.validate(body)
      // if (error) {
      //   logger.debug('Validating Input with validation Schema')
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const response = await this.chargeService.getChargeByName()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getChargeByList(req, res) {
    try {
      const { body, query } = req
      const userId = req.userId

      const data = {
        ...body,
        ...query
      }
      const { error } = getChargeByListValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const response = await this.chargeService.getChargeByList(data)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateCharge(req, res) {
    try {
      const { body, params } = req
      const userId = req.userId
      const data = {
        ...body,
        ...params
      }
      const { error } = updateChargeValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const response = await this.chargeService.updateCharge(data, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
