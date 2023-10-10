import CustomerService from '@services/customer.service'
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

export class CustomerController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.customerService = new CustomerService()
  }

  async searchCustomer(req, res) {
    try {
      const { query } = req
      const conn = await getConnection()
      const response = await this.customerService.searchCustomer(query, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomer(req, res) {
    try {
      const { body, query, userId, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const { error } = await getCustomerValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }

      const conn = await getConnection()
      const response = await this.customerService.getCustomer(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerById(req, res) {
    try {
      const { params, userId } = req
      const conn = await getConnection()
      const response = await this.customerService.getCustomer(params, userId, conn)
      if (response?.data?.rows?.length) response.data = response.data.rows[0]
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerMiniInfo(req, res) {
    try {
      const { params, userId } = req
      const conn = await getConnection()
      const response = await this.customerService.getCustomerMiniInfo(params, userId, conn)
      if (response?.data?.rows?.length) response.data = response.data.rows[0]
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopCustomerByChannel(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.customerService.getTopCustomerByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async recentActivities(req, res) {
    try {
      const { params, userId } = req
      const { error } = await recentActivitiesValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.customerService.recentActivities(params, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async searchCustomerDetailsHistory(req, res) {
    try {
      const { params, body, query, userId } = req
      const conn = await getConnection()
      const response = await this.customerService.searchCustomerDetailsHistory({ params, body, query }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async searchCustomerAddressHistory(req, res) {
    try {
      const { params, body, query, userId } = req
      const conn = await getConnection()
      const response = await this.customerService.searchCustomerAddressHistory({ params, body, query }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async registerCustomer(req, res) {
    let t
    try {
      const { body: payload } = req
      const { error } = await registerCustomerValidator.validate(payload, hapiErrorQuotes)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const { authorization } = req.headers
      const tenantId = req.headers['x-tenant-id']
      const response = await this.customerService.registerCustomer(payload, authorization, tenantId, conn, t)
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

  async registerWebselfcareCustomer(req, res) {
    let t
    try {
      const { body: payload } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.customerService.registerWebselfcare(payload, conn, t)
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

  async createCustomer(req, res) {
    let t
    try {
      const { body: payload, departmentId, roleId, userId } = req
      // axios to tibco
      if (payload?.details?.source === 'CREATE_CUSTOMER') {
        const { error } = await createCustomerValidator.validate(payload, hapiErrorQuotes)
        if (error) {
          return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
        }
      }

      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.customerService.createCustomer(payload, departmentId, roleId, userId, conn, t)
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

  async updateCustomer(req, res) {
    let t
    try {
      const { body: payload, params: { customerUuid } } = req
      const { error } = await updateCustomerValidator.validate(payload, hapiErrorQuotes)
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
      const response = await this.customerService.updateCustomer(payload, customerUuid, userObj, conn, t)
      if (response.status === 200) {
        console.log('going for commit')
        await t.commit()
      }
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        console.log('going for rollback')
        await t.rollback()
      }
    }
  }

  async deactivateCustomer(req, res) {
    let t
    try {
      const { body: payload, params: { customerUuid } } = req
      const { error } = await updateCustomerValidator.validate(payload, hapiErrorQuotes)
      if (error || !customerUuid) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const userObj = {
        userId: req.userId,
        createdRoleId: req.roleId,
        createdDeptId: req.departmentId
      }
      const response = await this.customerService.deactivateCustomer(payload, customerUuid, userObj, conn, t)
      if (response.status === 200) {
        console.log('going for commit')
        await t.commit()
      }
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        console.log('going for rollback')
        await t.rollback()
      }
    }
  }

  async deleteAddressContact(req, res) {
    let t
    try {
      const { body: payload, params: { customerUuid } } = req
      const { error } = await deleteAddressContactValidator.validate(payload, hapiErrorQuotes)
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
      const response = await this.customerService.deleteAddressContactValidator(payload, customerUuid, userObj, conn, t)
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

  async getCustomerByStatus(req, res) {
    try {
      const { params, userId } = req
      const conn = await getConnection()
      const response = await this.customerService.getCustomerByStatus(params, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateStatus(req, res) {
    let t
    try {
      const { body: payload, departmentId, roleId, userId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.customerService.updateStatus(payload, departmentId, roleId, userId, conn, t)
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

  async getCustomerInteraction(req, res) {
    try {
      const { body, query, userId, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const { error } = await getCustomerInteractionValidation.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.customerService.getCustomerInteraction(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async customerChannelActivity(req, res) {
    try {
      const { body, query, userId, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const { error } = await getCustomerInteractionValidation.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.customerService.customerChannelActivity(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerRevenue(req, res) {
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      // const { error } = await getCustomerInteractionValidation.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.customerService.getCustomerRevenue(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async verifyCustomers(req, res) {
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.customerService.verifyCustomers(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createBulkCustomer(req, res) {
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
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.customerService.createBulkCustomer(data, conn, t)
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

  async validateWebselfCare(req, res) {
    try {
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.customerService.validateWebselfCare(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerConversionRate(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.customerService.getCustomerConversionRate(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerRetentionRate(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.customerService.getCustomerRetentionRate(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerFollowup (req, res) {
    try {
      const { params } = req
      const conn = await getConnection()
      console.log('query ', params)
      const response = await this.customerService.getCustomerFollowup(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
