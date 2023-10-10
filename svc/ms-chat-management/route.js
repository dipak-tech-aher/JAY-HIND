import { ChatController } from '@controllers'
import express from 'express'
import { validateToken } from '@middlewares/authentication-helper'

const { connectionRequest } = require('@middlewares/db-connection')
const chatRouter = express.Router()
const chatController = new ChatController()

chatRouter.use([connectionRequest])

chatRouter

  // Chatbot Routes
  .post('/', chatController.chatByWorkflow.bind(chatController))
  .post('/send-message', chatController.sendLivechatMessage.bind(chatController))
  .get('/get-service-types', chatController.getServiceTypes.bind(chatController))
  .get('/get-enquiries', chatController.getEnquiries.bind(chatController))
  .get('/booster-plans', chatController.getBoosterPlans.bind(chatController))
  .get('/get-imagine-go', chatController.getImagineGo.bind(chatController))
  .post('/chat-cleanup', chatController.chatCleanUp.bind(chatController))
  .post('/get-tarrif-name', chatController.getTarrifName.bind(chatController))
  .post('/get-customer-summary', chatController.getCustomerSummary.bind(chatController))
  .post('/get-agent-info', chatController.getAgentInfo.bind(chatController))
  .post('/create-chat', chatController.createChat.bind(chatController))
  .put('/update-socket-chat-bot/:id', chatController.updateBotChatSocket.bind(chatController))
  .post('/get-chat-info', chatController.getChatInfo.bind(chatController))
  .get('/availableAgents', chatController.availableAgents.bind(chatController))
  .get('/get-new-chats', chatController.getNewChats.bind(chatController))
  .get('/count/new', chatController.getNewChatCount.bind(chatController))

  // Workflow Routes
  .post('/inbound-msg', chatController.inboundMsg.bind(chatController))
  .post('/customer-registration', chatController.registration.bind(chatController))
  .post('/validate-access-number', chatController.validateAccessNumber.bind(chatController))
  .post('/send-otp', chatController.sendOtp.bind(chatController))
  .post('/validate-otp', chatController.validateOtp.bind(chatController))
  .post('/validate-ic-number', chatController.validateIcNumber.bind(chatController))
  .post('/add-balance', chatController.addBalance.bind(chatController))
  .post('/update-chat', chatController.updateChat.bind(chatController))
  .post('/update-chat-existing-customer', chatController.updateChatExistingCustomer.bind(chatController))
  .post('/get-product-list', chatController.getProducts.bind(chatController))
  .post('/get-menu-list', chatController.getChatMenu.bind(chatController))
  .post('/get-lookup-list', chatController.getLookup.bind(chatController))
  .post('/get-service-details', chatController.getServiceDetails.bind(chatController))
  .post('/create-customer', chatController.createCustomer.bind(chatController))
  .post('/create-contact', chatController.createContact.bind(chatController))
  .get('/abandoned-job/:state', chatController.chatAbandonedJob.bind(chatController))

// Application Routes
chatRouter.use([validateToken])

  .post('/message', chatController.saveChatMessages.bind(chatController))
  .get('/monitor', chatController.getChatMonitorCounts.bind(chatController))
  .get('/message', chatController.getChatMessages.bind(chatController))
  .get('/assigned', chatController.getAssignedChats.bind(chatController))
  .put('/update-customer-chat-time', chatController.updateCustomerChatTime.bind(chatController))
  .put('/assign/:id', chatController.assignChat.bind(chatController))
  .put('/end', chatController.endChat.bind(chatController))
  .post('/count', chatController.getChatCount.bind(chatController))
  .post('/search', chatController.searchChat.bind(chatController))
  .get('/chat-per-agent', chatController.getChatPerAgent.bind(chatController))
  .get('/loggedin-agent', chatController.getLoggedInAgent.bind(chatController))
  .put('/update-socket/:id', chatController.updateChatSocket.bind(chatController))

  .post('/count/abandoned', chatController.getAbandonedChatCount.bind(chatController))
  .post('/total-count-by-channel', chatController.getTotalChatsByChannel.bind(chatController))
  .post('/live-support-by-channel', chatController.getLiveSupportByChannel.bind(chatController))
  .post('/top-customers-by-channel', chatController.getTopCustomersByChannel.bind(chatController))

  .post('/average-handling-time', chatController.getAverageHandlingTime.bind(chatController))
  // .post('/average-response-time', chatController.getAverageResponseTime.bind(chatController))
  .post('/average-response-time', chatController.getAverageResponseTimeData.bind(chatController))
  .post('/turn-around-time', chatController.getTurnAroundTime.bind(chatController))
  .post('/history', chatController.getChatHistory.bind(chatController))

  // Agent Chat dashboard
  .post('/chat-monitor-counts', validateToken, chatController.getChatDashboardMonitorCounts.bind(chatController))
  .post('/agent-summary', validateToken, chatController.getChatAgentSummary.bind(chatController))
  .get('/available-chat-agents', validateToken, chatController.availableChatAgents.bind(chatController))
  .post('/chat-details', validateToken, chatController.getChatDetails.bind(chatController))
  .post('/all-chat-count', validateToken, chatController.getAllChatCount.bind(chatController))

module.exports = chatRouter
