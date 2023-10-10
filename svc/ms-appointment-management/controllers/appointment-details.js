import AppointmentDetailsService from '@services/appointment-details.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import { createAppointmentDetailsValidator } from '@validators'
import { getConnection } from '@services/connection-service'

const hapiErrorQuotes = {
  errors: {
    wrap: {
      label: ''
    }
  }
}

class AppointmentDetailsController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.appointmentDetailsService = new AppointmentDetailsService()
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
      const response = await this.appointmentDetailsService.getCustomer(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppointmentDetails(req, res) {
    try {
      const conn = await getConnection()
      const response = await this.appointmentDetailsService.getAppointmentDetails(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppointmentDetailById(req, res) {
    try {
      const appointmentDetailId = req.params.id
      const conn = await getConnection()
      const response = await this.appointmentDetailsService.getAppointmentDetails(appointmentDetailId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createAppointmentDetail(req, res) {
    try {
      const { body } = req
      const { error } = await createAppointmentDetailsValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.appointmentDetailsService.createAppointmentDetail(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateAppointmentDetail(req, res) {
    try {
      const { body } = req
      const { error } = await createAppointmentDetailsValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const appointmentDetailId = req.params.id
      const response = await this.appointmentDetailsService.updateAppointmentDetail(appointmentDetailId, body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async deleteAppointmentDetail(req, res) {
    try {
      const conn = await getConnection()
      const appointmentDetailId = req.params.id
      const response = await this.appointmentDetailsService.deleteAppointmentDetail(appointmentDetailId, body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

}

module.exports = AppointmentDetailsController