import ProfileService from '@services/profile.service'
import { statusCodeConstants, logger, ResponseHelper } from '@utils'
import { createProfileValidator, updateProfileValidator, searchProfileValidator, helpdeskProfileValidator } from '@validators'

const { getConnection } = require('@services/connection-service')

const hapiErrorQuotes = {
  errors: {
    wrap: {
      label: ''
    }
  }
}

export class ProfilController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.profileService = new ProfileService()
  }

  async createProfile (req, res) {
    let t
    try {
      const { body, roleId, departmentId, userId } = req
      const { error } = createProfileValidator.validate(body, hapiErrorQuotes)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.profileService.createProfile(body, departmentId, roleId, userId, conn, t)
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

  async updateProfile (req, res) {
    let t
    try {
      const { body, query, roleId, departmentId, userId } = req
      const data = { ...body, ...query }
      const { error } = updateProfileValidator.validate(data, hapiErrorQuotes)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.profileService.updateProfile(data, departmentId, roleId, userId, conn, t)
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

  async searchProfile (req, res) {
    try {
      const { body, query, roleId, departmentId, userId } = req
      const data = { ...body, ...query }
      const { error } = searchProfileValidator.validate(data, hapiErrorQuotes)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.profileService.searchProfile(data, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async temp_centralMasterProfile(req, res) {
    try {
      const { query } = req
      const data = { ...query }
      const response = await this.profileService.temp_centralMasterProfile(data)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async temp_patientProfile(req, res) {
    try {
      const { query } = req
      const data = { ...query }
      const response = await this.profileService.temp_patientProfile(data)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
  async temp_patientVisitHistory(req, res) {
    try {
      const { query } = req
      const data = { ...query }
      const response = await this.profileService.temp_patientVisitHistory(data)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async temp_patientBill(req, res) {
    try {
      const { query } = req
      const data = { ...query }
      const response = await this.profileService.temp_patientBill(data)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async temp_drProfile(req, res) {
    try {
      const { query } = req
      const data = { ...query }
      const response = await this.profileService.temp_drProfile(data)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async temp_hospitalProfile(req, res) {
    try {
      const { query } = req
      const data = { ...query }
      const response = await this.profileService.temp_hospitalProfile(data)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
  async temp_LabReport(req, res) {
    try {
      const { query } = req
      const data = { ...query }
      const response = await this.profileService.temp_LabReport(data)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
  async temp_ImagingResultReport(req, res) {
    try {
      const { query } = req
      const data = { ...query }
      const response = await this.profileService.temp_ImagingResultReport(data)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
