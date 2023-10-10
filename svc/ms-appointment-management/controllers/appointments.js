import AppointmentService from '@services/appointments.service'
import ZoomService from '@services/zoom.service'
import MsTeamsService from '@services/ms-teams.service';
import GoogleMeetService from '@services/google-meet.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
// import { createSlotsValidator } from '@validators'
import { getConnection } from '@services/connection-service'

// const hapiErrorQuotes = {
//   errors: {
//     wrap: {
//       label: ''
//     }
//   }
// }

class AppointmentsController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.appointmentService = new AppointmentService()
  }

  async initAppointmentService() {
    const conn = await getConnection()
    return {
      conn,
      appointmentService: new AppointmentService(conn)
    }
  }

  async initService(appointmentMedium = "TEAMS") {
    const conn = await getConnection()
    let service = "";

    if (appointmentMedium == "ZOOM") {
      service = new ZoomService(conn)
    } else if (appointmentMedium == "G_MEET") {
      service = new GoogleMeetService(conn)
    } else {
      service = new MsTeamsService(conn)
    }

    return {
      conn, service
    }
  }

  async getHalls(req, res) {
    try {
      const { body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getHalls(body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getBookedAppointments(req, res) {
    try {
      const { body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getBookedAppointments(body)
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getHallSlotsAvailability(req, res) {
    try {
      const { body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getHallSlotsAvailability(body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createMeetingLink(req, res) {
    try {
      const { body } = req
      const { service } = await this.initService(body.appointmentMedium)
      const response = await service.createMeeting(body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getSignature(req, res) {
    try {
      const { body: { appointTxnId }, email: loggedEmail } = req
      const { service } = await this.initService(body.appointmentMedium)
      const response = await service.getSignature({ appointTxnId, loggedEmail })
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppointments(req, res) {
    try {
      const { params } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getAppointments(params)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async reAssignAppoinment(req, res) {
    try {
      const { params, body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.reAssignAppoinment(params, body, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getPerformance(req, res) {
    try {
      const { params, body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getPerformance(params, body, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppointmentByType(req, res) {
    try {
      const { params, body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getAppointmentByType(params, body, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppointmentByUserGroup(req, res) {
    try {
      const { params, body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getAppointmentByUserGroup(params, body, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async reScheduleAppoinment(req, res) {
    try {
      const { params, body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.reScheduleAppoinment(params, body, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateAppoinmentStatus(req, res) {
    try {
      const { params, body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.updateAppoinmentStatus(params, body, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async availableAgents(req, res) {
    try {
      const { params, body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.availableAgents(params, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getUpcomingAppointments(req, res) {
    try {
      const { query, userId, body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getUpcomingAppointments(query, userId, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getConsumersUpcomingAppointments(req, res) {
    try {
      const { query, userId, body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getConsumersUpcomingAppointments(query, userId, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getClosedAppointments(req, res) {
    try {
      const { query, userId, body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getClosedAppointments(query, userId, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async agentSuccessPercentage(req, res) {
    try {
      const { query, userId, body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.agentSuccessPercentage(query, userId, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async appoinmentHistory(req, res) {
    try {
      const { query, userId, body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.appoinmentHistory(query, userId, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async appoinmentLocationData(req, res) {
    try {
      const { query, userId, body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.appoinmentLocationData(query, userId, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppointmentsByQuery(req, res) {
    try {
      const { query, userId, body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getAppointmentsByQuery(query, userId, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getSlots(req, res) {
    try {
      const { query, userId, body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getSlots(query, userId, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async availableSlot(req, res) {
    try {
      const { query, userId, body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.availableSlot(query, userId, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppointmentsReminder(req, res) {
    try {
      const { query, body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getAppointmentsReminder(query, userId, body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppoinmentEvents(req, res) {
    try {
      const { body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getAppoinmentEvents(body, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCalendarEvents(req, res) {
    try {
      const { body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getCalendarEvents(body, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getOrderAppointments(req, res) {
    try {
      const { body, userId } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getOrderAppointments(body, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }


  async getTopPerformance(req, res) {
    try {
      const { body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getTopPerformance(body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTeamPastHistoryGraph(req, res) {
    try {
      const { body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getTeamPastHistoryGraph(body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getPastHistoryGraph(req, res) {
    try {
      const { body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getPastHistoryGraph(body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
  async getTotalAppoinmentByChannel(req, res) {
    try {
      const { body } = req
      const { appointmentService } = await this.initAppointmentService()
      const response = await appointmentService.getTotalAppoinmentByChannel(body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}

module.exports = AppointmentsController
