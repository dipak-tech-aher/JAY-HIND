import { HelpdeskController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const helpdeskRoute = express.Router()
const helpdeskController = new HelpdeskController()

helpdeskRoute.use([connectionRequest, validateToken])

helpdeskRoute
  .post('/create', helpdeskController.createHelpDeskTicket.bind(helpdeskController))
  .put('/update/:id/:type?', helpdeskController.updateHelpdeskTicket.bind(helpdeskController))
  .post('/search', helpdeskController.getHelpdeskList.bind(helpdeskController))

  .put('/assign/:id', helpdeskController.assignTicket.bind(helpdeskController))
  .post('/source-counts', helpdeskController.countBySource.bind(helpdeskController))
  // .post('/reply', helpdeskController.replyHelpdeskTicket.bind(helpdeskController))

  .post('/job/:state', helpdeskController.helpdeskJob.bind(helpdeskController))
  .get('/profile', helpdeskController.getprofileContact.bind(helpdeskController))
  .put('/map/:helpdeskNo', helpdeskController.mapHelpdeskCustomer.bind(helpdeskController))

  .post('/similar-tickets', helpdeskController.similarHelpdesk.bind(helpdeskController))

  // Agent Chat Dashboard
  .get('/monitor', helpdeskController.getHelpdeskMonitorCounts.bind(helpdeskController))
  .get('/agent-summary', helpdeskController.getHelpdeskAgentSummary.bind(helpdeskController))
  .post('/helpdesk-details', helpdeskController.getHelpdeskDetails.bind(helpdeskController))

  // Helpdesk Dashboard
  .post('/project-wise', helpdeskController.projectWiseOpenHelpdesk.bind(helpdeskController))// Sequlize fn
  .post('/agent-wise', helpdeskController.agentWiseOpenHelpdesk.bind(helpdeskController))// Sequlize fn
  .post('/open-helpdesk-by-aging', helpdeskController.openHelpdeskByAging.bind(helpdeskController))// Sequlize fn
  .post('/support-tkt-pending', helpdeskController.tktPendingWith.bind(helpdeskController))// Sequlize fn
  .post('/helpdesk-by-type', helpdeskController.helpdeskByType.bind(helpdeskController))// Sequlize fn
  .post('/helpdesk-by-status', helpdeskController.helpdeskByStatus.bind(helpdeskController))
  .post('/helpdesk-by-severity', helpdeskController.helpdeskBySeverity.bind(helpdeskController))
  .post('/monthly-trend', helpdeskController.monthlyTrend.bind(helpdeskController))
  .post('/hourly-tkts', helpdeskController.hourlyTickets.bind(helpdeskController))
  .post('/summary', helpdeskController.summary.bind(helpdeskController))

module.exports = helpdeskRoute
