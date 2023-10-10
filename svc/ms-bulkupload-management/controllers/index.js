import { ResponseHelper, logger, statusCodeConstants } from '@utils'
import BulkuploadService from '@services/bulkupload.service'
const { getConnection } = require('@services/connection-service')
const { v4: uuidv4 } = require('uuid')

export class BulkuploadController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.bulkuploadService = new BulkuploadService()
  }

  async verifyUsers (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyUsers(data, userObj, conn, t)
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

  async verifyEntityTransactionMapping (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyEntityTransactionMapping(data, userObj, conn, t)
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

  async createBulkEntityTransactionMapping (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkEntityTransactionMapping(data, userObj, conn, t)
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

  async createBulkUsers (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkUsers(data, userObj, conn, t)
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

  async verifyRequestStatement (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyRequestStatement(data, userObj, conn, t)
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

  async createBulkRequestStatement (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkRequestStatement(data, userObj, conn, t)
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

  async verifyProfiles (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyProfiles(data, userObj, conn, t)
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

  async createBulkProfile (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkProfile(data, userObj, conn, t)
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

  async verifyOrders (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyOrders(data, userObj, conn, t)
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

  async createBulkOrder (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkOrder(data, userObj, conn, t)
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

  async verifyProducts (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const prodObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyProducts(data, prodObj, conn, t)
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

  async createBulkProduct (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const prodObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkProduct(data, prodObj, conn, t)
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

  async verifyServices (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyServices(data, userObj, conn, t)
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

  async verifyCustomers (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const customerObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyCustomers(data, customerObj, conn, t)
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

  async createBulkCustomer (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const customerObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkCustomer(data, customerObj, conn, t)
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

  async createBulkService (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkService(data, userObj, conn, t)
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

  async bulkUploadSearch (req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.bulkUploadSearch(data, conn, t)
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

  async verifyInteractions (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyInteractions(data, userObj, conn, t)
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

  async createBulkInteraction (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkInteraction(data, userObj, conn, t)
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

  async verifyCharge (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyCharge(data, userObj, conn, t)
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

  async createBulkCharge (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkCharge(data, userObj, conn, t)
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

  async getDetails (req, res) {
    let t
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.getDetails(data, conn, t)
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

  async createBulkBusinessUnits (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = { departmentId, roleId, userId, ...query, ...body }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createBulkBusinessUnits(data, userObj, conn, t)
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

  async verifyBulkBusinessUnits (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = { departmentId, roleId, userId, ...query, ...body }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyBulkBusinessUnits(data, userObj, conn, t)
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

  async verifyCalendar (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = { departmentId, roleId, userId, ...query, ...body }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyCalendar(data, userObj, conn, t)
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

  async createCalendar (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createCalendar(data, userObj, conn, t)
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

  async verifyHolidayCalendar (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = { departmentId, roleId, userId, ...query, ...body }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyHolidayCalendar(data, userObj, conn, t)
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

  async createHolidayCalendar (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createHolidayCalendar(data, userObj, conn, t)
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

  async createShift (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = { departmentId, roleId, userId, ...query, ...body }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createShift(data, userObj, conn, t)
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

  async verifyShift (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = { departmentId, roleId, userId, ...query, ...body }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyShift(data, userObj, conn, t)
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

  async verifySkill (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifySkill(data, userObj, conn, t)
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

  async createSkill (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createSkill(data, userObj, conn, t)
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

  async verifyUserSkill (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyUserSkill(data, userObj, conn, t)
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

  async createUserSkill (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        departmentId,
        roleId,
        userId,
        ...query,
        ...body
      }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createUserSkill(data, userObj, conn, t)
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

  async verifyAppointment (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = { ...params, ...query, ...body }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyAppointment(data, userObj, conn, t)
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

  async createAppointment (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = { departmentId, roleId, userId, ...query, ...body }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createAppointment(data, userObj, conn, t)
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

  async createContract (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = { departmentId, roleId, userId, ...query, ...body }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createContract(data, userObj, conn, t)
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

  async verifyContract (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = { ...params, ...query, ...body }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyContract(data, userObj, conn, t)
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

  async createInvoice (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = { departmentId, roleId, userId, ...query, ...body }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createInvoice(data, userObj, conn, t)
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

  async verifyInvoice (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = { ...params, ...query, ...body }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyInvoice(data, userObj, conn, t)
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

  async createPayment (req, res) {
    let t
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = { departmentId, roleId, userId, ...query, ...body }
      const userObj = {
        tranId: body.tranId,
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.createPayment(data, userObj, conn, t)
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

  async verifyPayment (req, res) {
    let t
    try {
      const { body, query, userId, params, roleId, departmentId } = req
      const data = { ...params, ...query, ...body }
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId,
        updatedBy: userId,
        userId,
        createdRoleId: roleId,
        createdDeptId: departmentId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.bulkuploadService.verifyPayment(data, userObj, conn, t)
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
