import InventoryService from '@services/inventory.service'
import { statusCodeConstants, logger, ResponseHelper } from '@utils'
const { getConnection } = require('@services/connection-service')

export class InventoryController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.inventoryService = new InventoryService()
  }

  async getVendorList(req, res) {
    try {
      const { query } = req
      const conn = await getConnection();
      const response = await this.inventoryService.getVendorList(conn, query)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }  
  async getInventoryItemList(req, res) {
    try {
      const { query } = req
      const conn = await getConnection();
      const response = await this.inventoryService.getInventoryItemList(conn, query)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
  async createInventoryItem(req, res) {
    let t
    try {
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const { body, userId, roleId, departmentId } = req
      const response = await this.inventoryService.createInventoryItem(body, userId, roleId, departmentId, conn, t)
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

  async updateInventoryItem(req, res) {
    let t
    try {
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const { body, userId, roleId, departmentId } = req
      const response = await this.inventoryService.updateInventoryItem(body, userId, roleId, departmentId, conn, t)
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
}
