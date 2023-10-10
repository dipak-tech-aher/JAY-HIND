import OrderService from '@services/order.service'
import { statusCodeConstants, logger, ResponseHelper } from '@utils'
import {
  createOrderValidator, createWebSelfCareOrderValidator, assignOrderValidator, getOrderHistoryValidator, searchOrderValidator, editOrderValidator,
  addFollowUpValidator, getCountsValidator, cancelOrderValidator, getOrderFlowValidator, getCustomerOrderHistoryCountValidator,
  getCustomerOrderHistoryValidator
} from '@validators'
const { getConnection } = require('@services/connection-service')

export class OrderController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.OrderService = new OrderService()
  }

  async createOrUpdateAddress (req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.OrderService.createOrUpdateAddress(body, userId, roleId, departmentId, conn, t)
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

  async getServiceTypeCategory (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getServiceTypeCategory(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createOrderWebSelfCare (req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req
      const { error } = createWebSelfCareOrderValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const authData = {
        authorization: req.headers.authorization,
        tenantId: req.headers['x-tenant-id']
      }
      const response = await this.OrderService.createOrderWebSelfCare(body, authData, userId, roleId, departmentId, conn, t)
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

  async createOrder (req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req
      const { error } = createOrderValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const authData = {
        authorization: req.headers.authorization,
        tenantId: req.headers['x-tenant-id']
      }
      const response = await this.OrderService.createOrder(body, authData, userId, roleId, departmentId, conn, t)
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

  async getMyProducts (req, res) {
    try {
      const { body } = req

      const conn = await getConnection()
      const response = await this.OrderService.getMyProducts(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async assignOrder (req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req
      const { error } = assignOrderValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.OrderService.assignOrder(body, userId, roleId, departmentId, conn, t)
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

  async getOrderHistory (req, res) {
    try {
      const { params, query, userId, roleId, departmentId } = req
      const data = {
        ...params,
        ...query
      }
      const { error } = getOrderHistoryValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.OrderService.getOrderHistory(data, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async searchOrderByQuery (req, res) {
    try {
      const { query } = req
      const conn = await getConnection()
      const response = await this.OrderService.searchOrderByQuery(query, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async searchOrder (req, res) {
    try {
      const { body, query, userId, roleId, departmentId } = req
      const data = {
        ...body,
        ...query
      }
      const { error } = searchOrderValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.OrderService.searchOrder(data, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getMyOrders (req, res) {
    try {
      const { body, query, userId, roleId, departmentId } = req
      const data = {
        ...body,
        ...query
      }
      const conn = await getConnection()
      const response = await this.OrderService.getMyOrders(data, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateShippingAddress (req, res) {
    let t
    try {
      const { body, query, userId, roleId, departmentId } = req
      const data = {
        ...body,
        ...query
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.OrderService.updateShippingAddress(data, userId, roleId, departmentId, conn, t)
      if (response.status === 200) t.commit()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async editOrder (req, res) {
    let t
    try {
      const { body, params, userId, roleId, departmentId } = req
      const data = {
        ...params,
        ...body
      }
      const { error } = editOrderValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.OrderService.editOrder(data, userId, roleId, departmentId, conn, t)
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

  async addFollowUp (req, res) {
    let t
    try {
      const { body, params, userId, roleId, departmentId } = req
      const data = {
        ...params,
        ...body
      }
      const { error } = addFollowUpValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.OrderService.addFollowUp(data, userId, roleId, departmentId, conn, t)
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

  async getCounts (req, res) {
    try {
      const { body, query, userId, roleId, departmentId } = req
      const data = {
        ...body,
        ...query
      }
      const { error } = getCountsValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.OrderService.getCounts(data, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async cancelOrder (req, res) {
    let t
    try {
      const { body, params, userId, roleId, departmentId } = req
      const data = {
        ...params,
        ...body
      }
      const { error } = cancelOrderValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.OrderService.cancelOrder(data, userId, roleId, departmentId, conn, t)
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

  /**
   * @description: This function is for canceling orders form workflow
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async cancelOrders (req, res) {
    let t
    try {
      const { body, params, userId, roleId, departmentId } = req
      const data = {
        ...params,
        ...body
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.OrderService.cancelOrders(data, userId, roleId, departmentId, conn, t)
      if (response) t.commit()
      return res.json({ response })
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getOrderListbasedOnConversationId (req, res) {
    try {
      const { body, userId } = req
      const conn = await getConnection()
      const response = await this.OrderService.getOrderListbasedOnConversationId(body, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAddressbasedOnOrderId (req, res) {
    try {
      const { body, userId } = req
      const conn = await getConnection()
      const response = await this.OrderService.getAddressbasedOnOrderId(body, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async UpdateOrderAddress (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.OrderService.UpdateOrderAddress(body, userId, departmentId, roleId, conn, t)
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

  async getOrderFlow (req, res) {
    try {
      const { params } = req
      const { error } = getOrderFlowValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.OrderService.getOrderFlow(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerOrderHistoryCount (req, res) {
    try {
      const { params } = req
      const { error } = getCustomerOrderHistoryCountValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.OrderService.getCustomerOrderHistoryCount(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getMyOrderHistory (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getMyOrderHistory(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTeamOrderHistory (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getTeamOrderHistory(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async handlingTime (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.handlingTime(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async handlingTimeTeam (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.handlingTimeTeam(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerOrderHistory (req, res) {
    try {
      const { params, query } = req
      const data = {
        ...params,
        ...query
      }
      const { error } = getCustomerOrderHistoryValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.OrderService.getCustomerOrderHistory(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getOrderCategoryPerformance (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getOrderCategoryPerformance(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopPerformance (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getTopPerformance(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRelatedCategoryTypeInfo (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getRelatedCategoryTypeInfo(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTotalOrdersByChannel (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getTotalOrdersByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getOrderCorner (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getOrderCorner(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRevenueByChannel (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getRevenueByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getOverAllRevenueCount (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getOverAllRevenueCount(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppoinmentCount (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getAppoinmentCount(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getNewOrderCount (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getNewOrderCount(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getLiveSales (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getLiveSales(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTotalSales (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getTotalSales(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getSalesByChannel (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getSalesByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getSalesByLocation (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getSalesByLocation(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getMonthlySales (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getMonthlySales(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getSalesMetric (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getSalesMetric(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAnnualContractValue (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getAnnualContractValue(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerLifetimeValue (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getCustomerLifetimeValue(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getLeadsPipeline (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getLeadsPipeline(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getLiveSalesTrack (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getLiveSalesTrack(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getChurnRatePercent (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getChurnRatePercent(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getPositiveNegativeReplyCount (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getPositiveNegativeReplyCount(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getDealsByAge (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getDealsByAge(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAvgLeadResponseTime (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getAvgLeadResponseTime(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getSalesGrowth (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.OrderService.getSalesGrowth(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

}
