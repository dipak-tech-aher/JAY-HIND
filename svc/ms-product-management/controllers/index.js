import ProductService from '@services/product.service'
import { statusCodeConstants, logger, ResponseHelper } from '@utils'
const { getConnection } = require('@services/connection-service')

export class ProductController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.productService = new ProductService()
  }

  async getProducts(req, res) {
    try {
      const { query } = req
      const conn = await getConnection();
      const response = await this.productService.getProducts(conn, query)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getProductsbyLimit(req, res) {
    try {
      const { body, query, userId } = req
      const data = {
        ...body,
        ...query,
        userId
      }
      const conn = await getConnection();
      const response = await this.productService.getProductsbyLimit(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getProductsDetail(req, res) {
    try {
      const { body, query, userId } = req
      const data = {
        ...body,
        ...query,
        userId
      }
      const conn = await getConnection();
      const response = await this.productService.getProductsDetail(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTaskProductMapping(req, res) {
    try {
      const { body } = req
      const conn = await getConnection();
      const response = await this.productService.getTaskProductMapping(conn, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getProductBundleMapping(req, res) {
    try {
      const { body, query } = req

      const conn = await getConnection()
      const response = await this.productService.getProductBundleMapping({ ...body, ...query }, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getProductBundleMappingWebSelfCare(req, res) {
    try {
      const { body, query } = req

      const conn = await getConnection()
      const response = await this.productService.getProductBundleMappingWebSelfCare({ ...body, ...query }, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRecommendedPlans(req, res) {
    try {
      const { body, query } = req

      const conn = await getConnection()
      const response = await this.productService.getRecommendedPlans({ ...body, ...query }, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createProduct(req, res) {
    let t
    try {
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const { body, userId, roleId, departmentId } = req
      const response = await this.productService.createProduct(body, userId, roleId, departmentId, conn, t)
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

  async updateProduct(req, res) {
    let t
    try {
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const { body, userId, roleId, departmentId } = req
      const response = await this.productService.updateProduct(body, userId, roleId, departmentId, conn, t)
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

  async getPromoDetails(req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.productService.getPromoDetails(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getProductDetails(req, res) {
    try {
      const { params, query, userId } = req
      const data = {
        ...params,
        ...query
      }
      const conn = await getConnection()
      const response = await this.productService.getProductDetails(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTermsDetails(req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.productService.getTermsDetails(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
