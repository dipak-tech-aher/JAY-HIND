import { logger, ResponseHelper } from '@utils'
import OrganizationService from '@services/organization.service'
import { createOrganizationValidator, updateOrganizationValidator } from '@validators/organization.validator'
import { statusCodeConstants } from '@utils/constant'

const { getConnection } = require('@services/connection-service')

export class OrganizationController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.organizationService = new OrganizationService()
  }

  async createOrganization (req, res) {
    let t
    try {
      const { body, departmentId, roleId, userId } = req
      const { error } = createOrganizationValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.organizationService.createOrganization(body, departmentId, roleId, userId, conn, t)
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

  async updateOrganization (req, res) {
    let t
    try {
      const { body, departmentId, roleId, userId } = req
      const { id } = req.params
      const { error } = updateOrganizationValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.organizationService.updateOrganization(body, departmentId, roleId, userId, id, conn, t)
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

  async getOrganization (req, res) {
    try {
      const unitId = req.params.id
      const unitType = req.query.unitType
      const conn = await getConnection()
      const response = await this.organizationService.getOrganization(unitId, unitType, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error, 'Error while fetching Organization list')
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
