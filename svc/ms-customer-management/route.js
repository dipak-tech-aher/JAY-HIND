import { CustomerController } from '@controllers/index.js'
import { AIController } from '@controllers/ai.controller.js'
import { CustomerEngagementDashboardController } from '@controllers/customer-engagement-dashboard.controller.js'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@utils'
import express from 'express'

const customerRouter = express.Router()
const customerController = new CustomerController()

const aiRouter = express.Router()
const aiController = new AIController()

const engagementDashboardController = new CustomerEngagementDashboardController()

const { connectionRequest } = require('@middlewares/db-connection')
customerRouter.use([connectionRequest])
aiRouter.use([connectionRequest])

customerRouter
  .get('/search', validateToken, customerController.searchCustomer.bind(customerController))

  .get('/:customerUuid', validateToken, customerController.getCustomerById.bind(customerController))
  .get('/mobile/:customerUuid', customerController.getCustomerById.bind(customerController))

  .post('/get-customer/', validateToken, customerController.getCustomer.bind(customerController))
  .get('/recent-activities/:customerUuid', validateToken, customerController.recentActivities.bind(customerController))
  .post('/details/history', validateToken, customerController.searchCustomerDetailsHistory.bind(customerController))
  .post('/address/history', validateToken, customerController.searchCustomerAddressHistory.bind(customerController))
  .post('/register', customerController.registerCustomer.bind(customerController))
  .post('/register/webselfcare', customerController.registerWebselfcareCustomer.bind(customerController))
  .post('/register/validate', customerController.validateWebselfCare.bind(customerController))

  .put('/:customerUuid', validateToken, customerController.updateCustomer.bind(customerController))
  .put('/mobile/:customerUuid', customerController.updateCustomer.bind(customerController))

  .put('/address/:customerUuid', validateToken, customerController.updateCustomer.bind(customerController))
  .put('/contact/:customerUuid', validateToken, customerController.updateCustomer.bind(customerController))
  .put('/deactivate/:customerUuid', validateToken, customerController.deactivateCustomer.bind(customerController))
  .delete('/address/:customerUuid', validateToken, customerController.deleteAddressContact.bind(customerController))
  .delete('/contact/:customerUuid', validateToken, customerController.deleteAddressContact.bind(customerController))

  .post('/create', validateToken, customerController.createCustomer.bind(customerController))
  .post('/create/mobile', customerController.createCustomer.bind(customerController))

  .get('/get-customer', validateToken, customerController.getCustomerByStatus.bind(customerController))
  .post('/update-status', validateToken, customerController.updateStatus.bind(customerController))

  .get('/customers-interaction/:customerUuid', validateToken, customerController.getCustomerInteraction.bind(customerController))
  .get('/customers-channel-activity/:customerUuid', validateToken, customerController.customerChannelActivity.bind(customerController))
  .post('/top-customer-by-channel', validateToken, customerController.getTopCustomerByChannel.bind(customerController))

  .get('/getCustomerRevenue/:customerUuid', validateToken, customerController.getCustomerRevenue.bind(customerController))
  .post('/verify-customers', validateToken, customerController.verifyCustomers.bind(customerController))
  .post('/bulk-create', validateToken, customerController.createBulkCustomer.bind(customerController))
  .post('/create-chat', customerController.createCustomer.bind(customerController))
  .get('/get-customer-mini-info/:customerUuid', customerController.getCustomerMiniInfo.bind(customerController))
  .get('/followup/:customerUuid', customerController.getCustomerFollowup.bind(customerController))

  // Customer Engagement Dashboard Routes
  .post('/order-interaction-count', validateToken, engagementDashboardController.getCounts.bind(engagementDashboardController))
  .post('/order-interaction-count-data', validateToken, engagementDashboardController.getCountsData.bind(engagementDashboardController))
  .post('/recent-customers', engagementDashboardController.recentCustomers.bind(engagementDashboardController))
  .post('/top-performing-products', engagementDashboardController.topPerformingProducts.bind(engagementDashboardController))
  .post('/top-channels-grevience', engagementDashboardController.topChannelByGrevience.bind(engagementDashboardController))
  .post('/top-customer-issues', engagementDashboardController.topCustomerIssues.bind(engagementDashboardController))
  .post('/interactions-by-channels', engagementDashboardController.InteractionsByChannel.bind(engagementDashboardController))

  .post('/top-channel-by-sales', engagementDashboardController.InteractionsByChannel.bind(engagementDashboardController))
  .post('/top-channel-by-leads', engagementDashboardController.InteractionsByChannel.bind(engagementDashboardController))
  .post('/chat-update-status', customerController.updateStatus.bind(customerController))

  // Sales Dashboard
  .post('/sales/conversion-rate', validateToken, customerController.getCustomerConversionRate.bind(customerController))
  .post('/sales/rentention-rate', validateToken, customerController.getCustomerRetentionRate.bind(customerController))

aiRouter
  .post('/train-dataset', validateToken, aiController.trainModel.bind(aiController))
  .post('/s-analyzer', validateToken, aiController.sentimentAnalysis.bind(aiController))
  .post('/prediction', validateToken, aiController.prediction.bind(aiController))

module.exports = { customerRouter, aiRouter }
