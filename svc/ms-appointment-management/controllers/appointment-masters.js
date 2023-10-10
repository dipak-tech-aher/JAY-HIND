import AppointmentMasterService from '@services/appointment-masters.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import { createSlotsValidator } from '@validators'
import { getConnection } from '@services/connection-service'

const hapiErrorQuotes = {
  errors: {
    wrap: {
      label: ''
    }
  }
}

class AppointmentMasterController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.appointmentMasterService = new AppointmentMasterService()
  }

  async templatefunc(req, res) {
    try {
      const { body, userId } = req
      const data = {
        ...body
      }
      const { error } = await createSlotsValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.appointmentService.getCustomer(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppointmentMasters(req, res) {
    try {
      const conn = await getConnection()
      const response = await this.appointmentMasterService.getAppointmentMasters()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppointmentMasterById(req, res) {
    try {
      const conn = await getConnection()
      const response = await this.appointmentMasterService.getAppointmentMasterById()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createAppointmentMaster(req, res) {
    try {
      const { body, userId } = req
      const data = {
        ...body
      }
      const { error } = await createAppointmentMasterValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.appointmentMasterService.createAppointmentMaster(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateAppointmentMaster(req, res) {
    try {
      const { body, userId } = req
      const data = {
        ...body
      }
      const { error } = await updateAppointmentMasterValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.appointmentMasterService.updateAppointmentMasterValidator(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async deleteAppointmentMaster(req, res) {
    try {
      const conn = await getConnection()
      const response = await this.appointmentMasterService.deleteAppointmentMaster()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

}

module.exports = AppointmentMasterController