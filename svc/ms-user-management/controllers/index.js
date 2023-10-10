import UserService from '@services/user.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import { approveNewUserValidator, createUserValidator, getUserDepartmentAndRolesValidator, getUserListValidator, getUserValidator, updateUserValidator, verifyEmailsValidator, verifyUsersValidator, getUsersRoleIdValidator } from '@validators'
const { getConnection } = require('@services/connection-service')

export class UserController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.userService = new UserService()
  }

  async createUser (req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req
      const { error } = createUserValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const authData = {
        authorization: req.headers.authorization,
        tenantId: req.headers['x-tenant-id']
      }
      const response = await this.userService.createUser(authData, body, userId, roleId, departmentId, conn, t)
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

  async getSkillsList(req, res) {
    try {
      const conn = await getConnection()
      const response = await this.userService.getSkillsList(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getMyTeamMembers (req, res) {
    try {
      const { userId } = req
      const conn = await getConnection()
      const response = await this.userService.getMyTeamMembers(userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async approveNewUser (req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req
      const { error } = approveNewUserValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.userService.approveNewUser(body, userId, roleId, departmentId, conn, t)
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

  async getUserDepartmentAndRoles (req, res) {
    try {
      const userId = req.userId
      const data = {
        userId
      }
      const { error } = getUserDepartmentAndRolesValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.userService.getUserDepartmentAndRoles(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getManagerList (req, res) {
    try {
      const data={}
      const conn = await getConnection()
      const response = await this.userService.getManagerList(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
  
  async updateUser (req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId, params } = req
      const data = {
        ...body,
        ...params
      }
      const { error } = updateUserValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.userService.updateUser(data, userId, roleId, departmentId, params, conn, t)
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
  async updateUserStatus (req, res) {
    let t
    try {
      const { body, userId, params } = req
      const data = {
        ...body,
        ...params
      }
      
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.userService.updateUserStatus(data, userId, params, conn, t)
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

  async getUserList (req, res) {
    try {
      const { query, body, params } = req
      const data = {
        ...query,
        ...body,
        ...params
      }
      const { error } = getUserListValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.userService.getUserList(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getUser (req, res) {
    try {
      const { params } = req
      const { error } = getUserValidator.validate(params)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.userService.getUser(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async verifyUsers (req, res) {
    try {
      const { body } = req
      const { error } = verifyUsersValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.userService.verifyUsers(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async verifyEmails (req, res) {
    try {
      const { body } = req
      const { error } = verifyEmailsValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.userService.verifyEmails(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getUsersRoleId (req, res) {
    try {
      const { query } = req
      const { error } = getUsersRoleIdValidator.validate(query)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.userService.getUsersRoleId(query, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRolesAndDepartments (req, res) {
    try {  
      const conn = await getConnection()
      const response = await this.userService.getRolesAndDepartments(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
