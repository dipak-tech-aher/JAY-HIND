import {
  AppointmentsController
} from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@utils'
import express from 'express'

const router = express.Router()
const appointmentsController = new AppointmentsController()

const { connectionRequest } = require('@middlewares/db-connection')
router.use([connectionRequest])
  .post('/create-meeting-link-chat', appointmentsController.createMeetingLink.bind(appointmentsController))
  .post('/get-halls', appointmentsController.getHalls.bind(appointmentsController))
  .post('/get-hall-slots-availability', appointmentsController.getHallSlotsAvailability.bind(appointmentsController))
  .post('/get-booked-appointments', appointmentsController.getBookedAppointments.bind(appointmentsController))

router.use([validateToken])
router
  // :for => customer, user, my-team
  .get('/:for/:id', appointmentsController.getAppointments.bind(appointmentsController))
  .post('/get-upcoming-appoinments', appointmentsController.getUpcomingAppointments.bind(appointmentsController))
  .post('/get-consumer-upcoming-appoinments', appointmentsController.getConsumersUpcomingAppointments.bind(appointmentsController))
  .post('/get-closed-appoinments', appointmentsController.getClosedAppointments.bind(appointmentsController))
  .post('/get-appoinments-by-query', appointmentsController.getAppointmentsByQuery.bind(appointmentsController))
  .post('/get-appoinments-reminder', appointmentsController.getAppointmentsReminder.bind(appointmentsController))
  .post('/get-slots', appointmentsController.getSlots.bind(appointmentsController))
  .post('/get-appoinment-events', appointmentsController.getAppoinmentEvents.bind(appointmentsController))
  .post('/get-top-performance', appointmentsController.getTopPerformance.bind(appointmentsController))
  .post('/re-assign-appoinment', appointmentsController.reAssignAppoinment.bind(appointmentsController))
  .post('/update-appoinment-status', appointmentsController.updateAppoinmentStatus.bind(appointmentsController))
  .post('/available-agent', appointmentsController.availableAgents.bind(appointmentsController))
  .post('/available-slot', appointmentsController.availableSlot.bind(appointmentsController))
  .post('/re-schedule-appoinment', appointmentsController.reScheduleAppoinment.bind(appointmentsController))
  .post('/agent-success-percentage', appointmentsController.agentSuccessPercentage.bind(appointmentsController))
  .post('/appoinment-history', appointmentsController.appoinmentHistory.bind(appointmentsController))
  .post('/get-appointment-locations', appointmentsController.appoinmentLocationData.bind(appointmentsController))
  .post('/get-team-past-history-graph', appointmentsController.getTeamPastHistoryGraph.bind(appointmentsController))
  .post('/get-past-history-graph', appointmentsController.getPastHistoryGraph.bind(appointmentsController))
  .post('/get-performance', appointmentsController.getPerformance.bind(appointmentsController))
  .post('/get-based-on-type', appointmentsController.getAppointmentByType.bind(appointmentsController))
  .post('/get-based-on-user-group', appointmentsController.getAppointmentByUserGroup.bind(appointmentsController))

  .post('/create-meeting-link', appointmentsController.createMeetingLink.bind(appointmentsController))
  .post('/get-signature', appointmentsController.getSignature.bind(appointmentsController))

  .post('/total-count-by-channel', appointmentsController.getTotalAppoinmentByChannel.bind(appointmentsController))
  .post('/get-calendar-events', appointmentsController.getCalendarEvents.bind(appointmentsController))
  .post('/get-order-appointmnets', appointmentsController.getOrderAppointments.bind(appointmentsController))

module.exports = router
