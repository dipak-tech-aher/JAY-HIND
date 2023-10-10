import { InteractionController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const interactionRouter = express.Router()
const interactionController = new InteractionController()

interactionRouter.use([connectionRequest])

interactionRouter
  .get('/get-interaction-details/:token', interactionController.getInteractionDetails.bind(interactionController))
  .get('/search', validateToken, interactionController.searchInteractionByQuery.bind(interactionController))
  .post('/create', validateToken, interactionController.createInteraction.bind(interactionController))
  .post('/create-interaction-web-self-care', validateToken, interactionController.createInteractionWebSelfCare.bind(interactionController))
  .put('/update/:interactionNumber', validateToken, interactionController.updateInteraction.bind(interactionController))
  .put('/update-via-notify-medium/:interactionNumber', interactionController.updateInteraction.bind(interactionController))
  .post('/search', validateToken, interactionController.searchInteraction.bind(interactionController))
  .post('/followUp', validateToken, interactionController.addFollowUp.bind(interactionController))
  .post('/whatsapp/followUp', interactionController.addFollowUp.bind(interactionController))
  .put('/assignSelf/:interactionNumber', validateToken, interactionController.assignInteraction.bind(interactionController))
  .get('/history/:interactionNumber?', validateToken, interactionController.getHistory.bind(interactionController))
  .put('/cancel/:interactionNumber', validateToken, interactionController.cancelInteraction.bind(interactionController))
  .put('/cancel/whatsapp/:interactionNumber', interactionController.cancelInteraction.bind(interactionController))
  .get('/counts', validateToken, interactionController.getCounts.bind(interactionController))
  .get('/frequent', validateToken, interactionController.frequentKnowledgeBase.bind(interactionController))
  .post('/frequent', interactionController.frequentKnowledgeBase.bind(interactionController))

  .get('/top-catagory', validateToken, interactionController.frequentTopCatagory.bind(interactionController))
  .post('/workFlowTest', interactionController.workFlowTest.bind(interactionController))
  .get('/get-customer-history-count/:customerUid', validateToken, interactionController.getCustomerInteractionHistoryCount.bind(interactionController))
  .get('/get-customer-history/:customerUid', validateToken, interactionController.getCustomerInteractionHistory.bind(interactionController))
  .post('/flow/:intxnNo', validateToken, interactionController.getInteractionFlow.bind(interactionController))
  .get('/customers-interaction/:customerUuid', validateToken, interactionController.getCustomerInteraction.bind(interactionController))
  // Convrsation Interaction
  .post('/conversation-interaction', interactionController.conversationInteraction.bind(interactionController))
  .post('/create-request', interactionController.createRequest.bind(interactionController))
  .post('/create-smart-request', interactionController.createSmartRequest.bind(interactionController))
  // Operations dashboard Routes
  .post('/get-assigned-interactions', validateToken, interactionController.assignedInteractions.bind(interactionController))
  .post('/get-pooled-interactions', validateToken, interactionController.pooledInteractions.bind(interactionController))
  .post('/get-assigned-orders', validateToken, interactionController.assignedOrders.bind(interactionController))
  .post('/get-pooled-orders', validateToken, interactionController.pooledOrders.bind(interactionController))
  .post('/get-assigned-appoinments', validateToken, interactionController.assignedAppoinments.bind(interactionController))
  .post('/get-assigned-to-me-tickets', validateToken, interactionController.assignedToMeTicketes.bind(interactionController))

  .post('/get-team-assigned-interactions', validateToken, interactionController.myTeamAssignedInteractions.bind(interactionController))
  .post('/get-team-pooled-interactions', validateToken, interactionController.myTeamPooledInteractions.bind(interactionController))

  .post('/get-team-assigned-orders', validateToken, interactionController.myTeamAssignedOrders.bind(interactionController))
  .post('/get-team-pooled-orders', validateToken, interactionController.myTeamPooledOrders.bind(interactionController))

  .post('/get-team-assigned-appoinments', validateToken, interactionController.myTeamAssignedAppoinments.bind(interactionController))
  .post('/get-infomative-details', validateToken, interactionController.getUserInfomativeDetails.bind(interactionController))
  .post('/get-team-infomative-details', validateToken, interactionController.getTeamInfomativeDetails.bind(interactionController))
  .post('/get-handling-time', validateToken, interactionController.handlingTime.bind(interactionController))
  .post('/get-team-handling-time', validateToken, interactionController.handlingTimeTeam.bind(interactionController))
  .post('/interaction-history-graph', validateToken, interactionController.getMyInteractionHistoryGraph.bind(interactionController))
  .post('/interaction-history-graph-team', validateToken, interactionController.getTeamInteractionHistoryGraph.bind(interactionController))
  .post('/get-topfive-performer', validateToken, interactionController.getTopFivePerformer.bind(interactionController))
  .post('/get-topfive-performer-chat', validateToken, interactionController.getTopFivePerformerChat.bind(interactionController))
  .get('/get-appointment/:interactionNumber', validateToken, interactionController.getInteractionAppointment.bind(interactionController))
  .post('/get-Interaction-insight', validateToken, interactionController.getInteractionInsight.bind(interactionController))
  .post('/get-interaction-overview', validateToken, interactionController.getInteractionOverview.bind(interactionController))
  .post('/get-appointment-overview', validateToken, interactionController.getAppointmentOverview.bind(interactionController))
  .post('/get-team-Interaction-overview', validateToken, interactionController.getTeamInteractionOverview.bind(interactionController))
  .post('/get-interaction-category-performance', validateToken, interactionController.getInteractionCategoryPerformance.bind(interactionController))
  .post('/get-team-category-performance', validateToken, interactionController.getTeamCategoryPerformance.bind(interactionController))
  .post('/get-top-performance', validateToken, interactionController.getTopPerformance.bind(interactionController))
  .post('/helpdesk', validateToken, interactionController.getHelpdeskInteraction.bind(interactionController))
  .get('/get-related-statement-info/:requestId', validateToken, interactionController.getRelatedStatementInfo.bind(interactionController))
  .post('/get-related-category-info', validateToken, interactionController.getRelatedCategoryTypeInfo.bind(interactionController))

  .post('/total-count-by-channel', validateToken, interactionController.getTotalInteractionByChannel.bind(interactionController))
  .post('/top-performing-channel', validateToken, interactionController.getTopPerformingByChannel.bind(interactionController))
  .post('/issues-solved-by-channel', validateToken, interactionController.getIssuesSolvedByChannel.bind(interactionController))
  .post('/top-problem-solving-by-channel', validateToken, interactionController.getTopProblemSolvingByChannel.bind(interactionController))
  .post('/top-sales-by-channel', validateToken, interactionController.getTopSalesByChannel.bind(interactionController))
  .post('/live-support-by-channel', validateToken, interactionController.getLiveSupportByChannel.bind(interactionController))
  .post('/top-channels-by-order', validateToken, interactionController.getChannelsByOrder.bind(interactionController))
  .post('/prospect-generated-by-channel', validateToken, interactionController.getProspectGeneratedByChannel.bind(interactionController))
  .post('/category', validateToken, interactionController.getInteractionCategory.bind(interactionController))
  .post('/corner', validateToken, interactionController.getInteractionCorner.bind(interactionController))
  .post('/average-performance-by-channel', validateToken, interactionController.avgPerformanceByChannel.bind(interactionController))
  .post('/recent-interactions', validateToken, interactionController.recentInteractionsByCustomers.bind(interactionController))
  .post('/save-interaction-statement', interactionController.saveInteractionStatement.bind(interactionController))
  //customer-engagement-dashboard
  .post('/count/new', validateToken, interactionController.getNewInteractionCount.bind(interactionController))
  .post('/get-requests', validateToken, interactionController.getRequests.bind(interactionController))
  .put('/request/:status', validateToken, interactionController.updateRequestStatus.bind(interactionController))
  .post('/test-whatsapp', interactionController.testWhatsapp.bind(interactionController))

  // interaction dashboard
  .post('/by-priority', interactionController.getByPriority.bind(interactionController))
  .post('/by-ageing', interactionController.interactionByAgeing.bind(interactionController))
  .post('/by-followups', interactionController.interactionByFollowups.bind(interactionController))
  // datatype => list, count
  .post('/project-wise/:datatype', interactionController.interactionByProject.bind(interactionController))
  .post('/agent-wise/:datatype', interactionController.interactionByAgent.bind(interactionController))
  // datatype => list, percent, count
  .post('/by-status/:datatype', interactionController.interactionByStatus.bind(interactionController))
  .post('/by-type/:datatype', interactionController.interactionByType.bind(interactionController))
  // mode => interaction, service
  // level => category, type
  // type => list, cnt
  .post('/:mode/:level/:type', interactionController.getTopInteractions.bind(interactionController))
  .post('/statement-wise', interactionController.getTopStatements.bind(interactionController))
  .post('/statement-wise-list', interactionController.getTopStatementList.bind(interactionController))
  .post('/channel-wise', interactionController.getTopInteractionsByChannel.bind(interactionController))
  .post('/channel-wise-list', interactionController.getTopInteractionsByChannelList.bind(interactionController))
  .post('/dept-interactions', interactionController.getDeptInteractions.bind(interactionController))
  .post('/dept-vs-roles-interactions', interactionController.getDeptVsRolesInteractions.bind(interactionController))
  .post('/nps-csat-champ', interactionController.npsCsatChamp.bind(interactionController))
  .post('/res-mttr-waiting', interactionController.resolutionMttrWaiting.bind(interactionController))
  .post('/live-interactions-by-status', interactionController.liveInteractionsByStatus.bind(interactionController))//Sequelize fn
  .post('/customer-wise', interactionController.customerWise.bind(interactionController))
  .post('/live-customer-wise', interactionController.liveCustomerWise.bind(interactionController))
  .post('/live-project-wise', interactionController.liveProjectWise.bind(interactionController))//sequelize
  .post('/location-wise', interactionController.locationWise.bind(interactionController))
  .post('/interaction-avg-wise', interactionController.interactionAvgWise.bind(interactionController))
  .post('/interaction-by-priority-status-wise', interactionController.interactionPriorityStatusWise.bind(interactionController))
  .post('/interaction-by-priority-status-wise-list', interactionController.interactionPriorityStatusWiseList.bind(interactionController))

module.exports = interactionRouter
