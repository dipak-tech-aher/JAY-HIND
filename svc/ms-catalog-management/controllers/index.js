import CatalogService from '@services/catalog.service'
import { statusCodeConstants, logger, ResponseHelper } from '@utils'
import { createCatalogValidator, updateCatalogItemValidator, getCatalogValidator, catalogByServiceTypeValidator, getCatalogByNameValidator } from '@validators'

export class CatalogController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.catalogService = new CatalogService()
  }

  async createCatalog (req, res) {
    try {
      const { body, userId } = req
      const data = {
        ...body,
        userId
      }
      const { error } = createCatalogValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(res, new Error(error.message, { cause: { code: statusCodeConstants.VALIDATION_ERROR } }))
      }
      const response = await this.catalogService.createCatalog(data)
      return this.responseHelper.sendResponse(res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateCatalog (req, res) {
    try {
      const { body, params, userId } = req
      const data = {
        ...body,
        ...params,
        userId
      }
      const { error } = updateCatalogItemValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(res, new Error(error.message, { cause: { code: statusCodeConstants.VALIDATION_ERROR } }))
      }
      const response = await this.catalogService.updateCatalog(data)
      return this.responseHelper.sendResponse(res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCatalog (req, res) {
    try {
      const { params, query } = req
      const data = {
        ...params,
        ...query
      }
      const { error } = getCatalogValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(res, new Error(error.message, { cause: { code: statusCodeConstants.VALIDATION_ERROR } }))
      }
      const response = await this.catalogService.getCatalog(data)
      return this.responseHelper.sendResponse(res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async catalogByServiceType (req, res) {
    try {
      const { params, query } = req
      const data = {
        ...params,
        ...query
      }
      const { error } = catalogByServiceTypeValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(res, new Error(error.message, { cause: { code: statusCodeConstants.VALIDATION_ERROR } }))
      }
      const response = await this.catalogService.catalogByServiceType(data)
      return this.responseHelper.sendResponse(res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCatalogByName (req, res) {
    try {
      const { body, query } = req
      const data = {
        ...body,
        ...query
      }
      const { error } = getCatalogByNameValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(res, new Error(error.message, { cause: { code: statusCodeConstants.VALIDATION_ERROR } }))
      }
      const response = await this.catalogService.getCatalogByName(data)
      return this.responseHelper.sendResponse(res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCatalogList (req, res) {
    try {
      const response = await this.catalogService.getCatalogList()
      return this.responseHelper.sendResponse(res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
