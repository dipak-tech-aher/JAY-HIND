import AccountService from '@services/account.service'
import { getConnection } from '@services/connection-service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import {
  createAccountValidator, createServiceValidator, getAccountIdsValidator, getAccountsValidator,
  getExpiryServicesValidator, getServicesValidator, updateAccountValidator, updateServiceValidator
} from '@validators'
import { config } from '@config/env.config'
const { systemUserId, systemRoleId, systemDeptId } = config

const { v4: uuidv4 } = require('uuid')

const hapiErrorQuotes = {
  errors: {
    wrap: {
      label: ''
    }
  }
}
export class AccountController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.accountService = new AccountService()
  }

  async createAccount (req, res) {
    let t
    try {
      const { body: payload, userId, roleId, departmentId } = req
      const { error } = await createAccountValidator.validate(payload, hapiErrorQuotes)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId,
        userId: userId || systemUserId,
        createdRoleId: roleId || systemRoleId,
        createdDeptId: departmentId || systemDeptId
      }
      const response = await this.accountService.createAccount(payload, userObj, conn, t)
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

  async updateAccount (req, res) {
    let t
    try {
      const { body: payload, params: { accountUuid } } = req
      const { error } = await updateAccountValidator.validate(payload, hapiErrorQuotes)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const userObj = {
        userId: req.userId,
        createdRoleId: req.roleId,
        createdDeptId: req.departmentId
      }
      const response = await this.accountService.updateAccount(payload, accountUuid, userObj, conn, t)
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

  async getAccounts (req, res) {
    try {
      console.log(req.headers)

      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = getAccountsValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.accountService.getAccounts(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getServiceDetails (req, res) {
    try {
      console.log(req.headers)

      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.accountService.getServiceDetails(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCurrentBill (req, res) {
    try {
      console.log(req.headers)

      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.accountService.getCurrentBill(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAccountIds (req, res) {
    try {
      const { query, userId, params } = req
      const data = {
        ...query,
        ...params
      }
      const { error } = getAccountIdsValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.accountService.getAccountIds(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createService (req, res) {
    let t
    try {
      const { body: payload, userId, roleId, departmentId } = req
      const { error } = await createServiceValidator.validate(payload, hapiErrorQuotes)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId,
        userId: userId || systemUserId,
        createdRoleId: roleId || systemRoleId,
        createdDeptId: departmentId || systemDeptId
      }
      const response = await this.accountService.createService(payload, userObj, conn, t)
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

  async createServiceAI (req, res) {
    let t
    try {
      const { body: payload, userId, roleId, departmentId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const userObj = {
        tranId: uuidv4(),
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId,
        userId: userId || systemUserId,
        createdRoleId: roleId || systemRoleId,
        createdDeptId: departmentId || systemDeptId
      }
      const response = await this.accountService.createServiceAI(payload, userObj, conn, t)
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

  async updateServiceAI (req, res) {
    let t
    try {
      console.log('payload----->', req?.body)
      const payload = req.body
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.accountService.updateServiceAI(payload, conn, t)
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

  async getMappedServiceAI (req, res) {
    let t
    try {
      console.log('payload----->', req?.body)
      const payload = req.body
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.accountService.getMappedServiceAI(payload, conn, t)
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

  async getCustomerAssestList (req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.accountService.getCustomerAssestList(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async renewServiceAI (req, res) {
    let t
    try {
      const { body: payload, userId, roleId, departmentId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.accountService.renewServiceAI(payload, conn, t)
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

  async vpnExpiry (req, res) {
    let t
    try {
      const { body: payload, userId, roleId, departmentId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()

      const response = await this.accountService.vpnExpiry(payload, conn, t)
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

  async updateService (req, res) {
    let t
    try {
      const { body: payload } = req
      const { error } = await updateServiceValidator.validate(payload, hapiErrorQuotes)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const userObj = {
        userId: req.userId,
        createdRoleId: req.roleId,
        createdDeptId: req.departmentId
      }
      const response = await this.accountService.updateService(payload, userObj, conn, t)
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

  async getServices (req, res) {
    try {
      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = getServicesValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.accountService.getServices(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getServicesAI (req, res) {
    try {
      console.log('req-----xxxx----->', req?.headers)
      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }

      const conn = await getConnection()
      const response = await this.accountService.getServicesAI(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAssetList (req, res) {
    try {
      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.accountService.getAssetList(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAssetInventory (req, res) {
    try {
      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.accountService.getAssetInventory(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async assignAssetInventory (req, res) {
    let t
    try {
      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.accountService.assignAssetInventory(data, conn, t)
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

  async getProductsAI (req, res) {
    try {
      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }

      const conn = await getConnection()
      const response = await this.accountService.getProductsAI(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInventoryAI (req, res) {
    try {
      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }

      const conn = await getConnection()
      const response = await this.accountService.getInventoryAI(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getExpiryServices (req, res) {
    try {
      const { body, query, userId } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = getExpiryServicesValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.accountService.getExpiryServices(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async searchAccountDetailsHistory (req, res) {
    try {
      const { params, body, query, userId } = req
      const conn = await getConnection()
      const response = await this.accountService.searchAccountDetailsHistory({ ...params, ...body, ...query }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async searchAccountAddressHistory (req, res) {
    try {
      const { params, body, query, userId } = req
      const conn = await getConnection()
      const response = await this.accountService.searchAccountAddressHistory({ ...params, ...body, ...query }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getServiceBadge (req, res) {
    try {
      const { params, body, query, userId } = req
      // !impelement: Validation Condition
      const conn = await getConnection()
      const response = await this.accountService.getServiceBadge({ ...params, ...body, ...query }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
