import { ReportController } from '@controllers'
import { validateToken, DTAuthVerification } from '@middlewares/authentication-helper'
import express from 'express'

const { connectionRequest } = require('@middlewares/db-connection')
const userRouter = express.Router()
const reportController = new ReportController()

userRouter.use([connectionRequest])
userRouter
  .post('/create-survey', DTAuthVerification, reportController.createSurvey.bind(reportController))
  .get('/guest-token/:dashboardObj', reportController.getBIToken.bind(reportController))
  .get('/get-iframe-link', reportController.getiFrameLink.bind(reportController))
  .get('/get-survey-stats/:surveyRefNo', reportController.getSurveyStats.bind(reportController))
  .get('/survey-export', reportController.getSurveyExportExcel.bind(reportController))
  .get('/survey/aggregation', reportController.getAggregationData.bind(reportController))

userRouter.use([connectionRequest, validateToken])

userRouter
  // BCAE 2.0 ROUTES
  .post('/open-interactions', reportController.getOpenInteractions.bind(reportController))
  .post('/closed-interactions', reportController.getClosedInteractions.bind(reportController))
  .post('/created-interactions', reportController.getCreatedInteractions.bind(reportController))

  .post('/open-orders', reportController.getOpenOrders.bind(reportController))
  .post('/closed-orders', reportController.getClosedOrders.bind(reportController))
  .post('/created-orders', reportController.getCreatedOrders.bind(reportController))

  .post('/created-Customer', reportController.getCreatedCustomer.bind(reportController))

// AIOS ROUTES
  .post('/interactions', reportController.getOpenOrClosedInteractions.bind(reportController))
  .post('/chats', reportController.getChatInteractions.bind(reportController))
  .post('/chat-daily-report-new-customer-req', reportController.dailyChatReportNewCustomers.bind(reportController))
  .post('/chat-daily-report-booster-purchase', reportController.dailyChatReportBoosterPurchase.bind(reportController))
  .post('/chat-daily-report-counts', reportController.dailyChatReportCounts.bind(reportController))

  // BASE PRODUCT ROUTES
  .post('/login-search', reportController.loginSearch.bind(reportController))
  .post('/open-interaction-search', reportController.openClosedInteractionSearch.bind(reportController))
  .post('/closed-interaction-search', reportController.openClosedInteractionSearch.bind(reportController))
  .post('/chat-search', reportController.chatSearch.bind(reportController))
  .post('/audit-trail-search', reportController.auditTrailSearch.bind(reportController))
  .post('/product-search', reportController.productSearch.bind(reportController))
  .post('/sla-search', reportController.slaSearch.bind(reportController))
  .post('/dept-interaction-search', reportController.deptwiseInteractionSearch.bind(reportController))
  .post('/sales-search', reportController.auditTrailSearch.bind(reportController))
  .post('/invoice-search', reportController.invoiceSearch.bind(reportController))
  .post('/billing-search', reportController.billingSearch.bind(reportController))
  .post('/follow-up-count', reportController.followupCount.bind(reportController))
  .post('/follow-up', reportController.followup.bind(reportController))
  .post('/follow-up-interaction', reportController.followupInteraction.bind(reportController))
  .post('/tat-report', reportController.tatReport.bind(reportController))
  .post('/fcr-mis-report', reportController.fcrMisReport.bind(reportController))
  .post('/created-interaction-search', reportController.createdInteractionSearch.bind(reportController))
  .post('/fcr-search', reportController.fcrReport.bind(reportController))
  .post('/fcr-agent-search', reportController.fcrAgentReport.bind(reportController))
  .post('/ticket-statistics', reportController.ticketStatistics.bind(reportController))
  .post('/follow-up-count-details', reportController.followupCountdtl.bind(reportController))

// BI ROUTES

module.exports = userRouter
