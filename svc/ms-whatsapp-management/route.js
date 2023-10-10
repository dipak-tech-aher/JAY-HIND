import { WADashboardController } from '@controllers/'
import { WhatsAppController } from '@controllers/whatsApp.controller'

import { validateToken } from '@middlewares/authentication-helper'
import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'

const { connectionRequest } = require('@middlewares/db-connection')
const WADashboardRouter = express.Router()

const dashboardController = new WADashboardController()
const whatsAppcontroller = new WhatsAppController()

WADashboardRouter
  .post('/send-interactive-msg', whatsAppcontroller.sendInteractiveMsg.bind(whatsAppcontroller))


WADashboardRouter.use([connectionRequest])

WADashboardRouter
  .post('/count', validateToken, dashboardController.getWhatsAppCounts.bind(dashboardController))
  .post('/count-details', validateToken, dashboardController.getWhatsAppCountsDetails.bind(dashboardController))
  .post('/search', validateToken, dashboardController.getWhatsAppReports.bind(dashboardController))
  .post('/history', validateToken, dashboardController.getWhatsAppHistory.bind(dashboardController))
  .post('/graph/day', validateToken, dashboardController.getWhatsAppGraphDataByDay.bind(dashboardController))
  .post('/graph/time', validateToken, dashboardController.getWhatsAppGraphDataByTime.bind(dashboardController))
  .post('/graph/complaint', validateToken, dashboardController.getWhatsAppGraphComplaintData.bind(dashboardController))
  .post('/graph/followup', validateToken, dashboardController.getWhatsAppGraphFollowUpData.bind(dashboardController))


  // WhatsApp 
  .get('/webhook', whatsAppcontroller.fbGet.bind(whatsAppcontroller))
  .post('/webhook', whatsAppcontroller.fbPost.bind(whatsAppcontroller))

  .post('/inbound-msg', whatsAppcontroller.getInboundMessage.bind(whatsAppcontroller))
  .post('/', whatsAppcontroller.whatsAppWorkflow.bind(whatsAppcontroller))

  // APIS BY WORKFLOW ENGINE for WhatsApp I-hub
  .post('/validate-user', whatsAppcontroller.validateUser.bind(whatsAppcontroller))
  .post('/get-customer-summary', whatsAppcontroller.getCustomerSummary.bind(whatsAppcontroller))
  .post('/ihub/get-customer-summary', whatsAppcontroller.getIhubCustomerSummary.bind(whatsAppcontroller))
  .post('/get-customer-summary-fixedline', whatsAppcontroller.getCustomerSummaryFixedline.bind(whatsAppcontroller))
  .post('/get-customer-summary-mobile', whatsAppcontroller.getCustomerSummaryMobile.bind(whatsAppcontroller))
  .post('/get-open-tickets', whatsAppcontroller.getOpenTickets.bind(whatsAppcontroller))
  .post('/get-active-offers', whatsAppcontroller.getActiveOffers.bind(whatsAppcontroller))
  .post('/contract-details', whatsAppcontroller.contractDetails.bind(whatsAppcontroller))
  .get('/customer-list', whatsAppcontroller.getCustomerList.bind(whatsAppcontroller))
  .post('/get-customer-details', whatsAppcontroller.getCustomerDetails.bind(whatsAppcontroller))


  // APIS BY WORKFLOW ENGINE for WhatsApp
  .post('/complaint', whatsAppcontroller.createComplaint.bind(whatsAppcontroller))
  .post('/complaint/followUp', whatsAppcontroller.createfollowUp.bind(whatsAppcontroller))
  .post('/complaint/list', whatsAppcontroller.getComplaintsList.bind(whatsAppcontroller))
  .post('/categories', whatsAppcontroller.getNoOfCategories.bind(whatsAppcontroller))
  .post('/list-categories', whatsAppcontroller.getListOfCategories.bind(whatsAppcontroller))

  .post('/select-category', whatsAppcontroller.getServiceCategory.bind(whatsAppcontroller))
  .post('/service-type', whatsAppcontroller.getServiceType.bind(whatsAppcontroller))
  .post('/account-details', whatsAppcontroller.getAccountDetails.bind(whatsAppcontroller))
  .post('/fixedline-plan-info', whatsAppcontroller.getFixedlinePlanInfo.bind(whatsAppcontroller))
  .post('/booster-details-prepaid', whatsAppcontroller.getPrepaidBoosterDetails.bind(whatsAppcontroller))

  .post('/bill-info', whatsAppcontroller.getBillInfo.bind(whatsAppcontroller))
  .post('/prepaid-postpaid-service-status', whatsAppcontroller.getServiceStatus.bind(whatsAppcontroller))

  .post('/postpaid-plan-info', whatsAppcontroller.getPostpaidPlanInfo.bind(whatsAppcontroller))
  .post('/fixedline-service-status', whatsAppcontroller.getFixedlineServiceStatus.bind(whatsAppcontroller))
  .post('/booster-details-fixedline', whatsAppcontroller.getFixedlineBoosterDetails.bind(whatsAppcontroller))
  .post('/prepaid-credit-details', whatsAppcontroller.getPrepaidCreditDetails.bind(whatsAppcontroller))
  .post('/contract-details', whatsAppcontroller.getContractDetails.bind(whatsAppcontroller))
  .post('/help-inbound-msg', whatsAppcontroller.helpInboundMsg.bind(whatsAppcontroller))
  .post('/get-interaction-list', whatsAppcontroller.getInteractionList.bind(whatsAppcontroller))
  .post('/get-interaction', whatsAppcontroller.getInteractionDetails.bind(whatsAppcontroller))
  .post('/lookup', whatsAppcontroller.getBusinessParameterLookup.bind(whatsAppcontroller))
  .post('/get-knowledge-base', whatsAppcontroller.getRequestStatement.bind(whatsAppcontroller))
  .post('/get-knowledge-base/list', whatsAppcontroller.getRequestStatementList.bind(whatsAppcontroller))
  .post('/get-service-list', whatsAppcontroller.getServiceList.bind(whatsAppcontroller))
  .post('/get-service-details', whatsAppcontroller.getServiceDetails.bind(whatsAppcontroller))
  .post('/search-interaction', whatsAppcontroller.searchInteractionWithKeyword.bind(whatsAppcontroller))

module.exports = WADashboardRouter
