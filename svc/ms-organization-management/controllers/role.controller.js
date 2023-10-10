import RoleService from '@services/role.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import { bulkUploadRolesValidator, createRoleValidator, getRoleValidator, updateRoleValidator, verifyRolesValidator } from '@validators/role.validator'
import { isEmpty } from 'lodash'
const { getConnection } = require('@services/connection-service')

export class RoleController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.roleService = new RoleService()
  }

  async createRole (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      console.log(body)
      const { error } = createRoleValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.roleService.createRole(body, departmentId, roleId, userId, conn, t)
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

  async updateRole (req, res) {
    let t
    try {
      const { body, params, userId } = req
      const { id } = params
      const { error } = updateRoleValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.roleService.updateRole(body, id, userId, conn, t)
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

  async getRole (req, res) {
    try {
      const id = req.params.id
      if (!isEmpty(id)) {
        const { error } = getRoleValidator.validate(req.params)
        if (error) {
          logger.debug('Validating Input with validation Schema')
          return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
        }
      }
      const conn = await getConnection()
      const response = await this.roleService.getRole(req.params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRoles (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.roleService.getRoles(req.params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRoleFamily (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.roleService.getRoleFamily(req.params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async verifyRoles (req, res) {
    try {
      const { body } = req
      const { error } = verifyRolesValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.roleService.verifyRoles(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async bulkUploadRoles (req, res) {
    let t
    try {
      const { body } = req
      const { error } = bulkUploadRolesValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.roleService.bulkUploadRoles(body, conn, t)
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

  async getModuleScreens (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.roleService.getModuleScreens(req.params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
