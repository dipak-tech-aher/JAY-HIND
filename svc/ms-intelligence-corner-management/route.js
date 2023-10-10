import { IntelligenceCornerController } from '@controllers'
// import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const intelligenceCornerRoute = express.Router()
const intelligenceCornerController = new IntelligenceCornerController()

intelligenceCornerRoute.use([connectionRequest])

intelligenceCornerRoute
  .get('/get-events', intelligenceCornerController.getEvents.bind(intelligenceCornerController))
  .post('/based-on-interaction', intelligenceCornerController.getIntelligence.bind(intelligenceCornerController))
  .post('/get-service-count', intelligenceCornerController.getServicesCount.bind(intelligenceCornerController))
  .post('/get-bill-month', intelligenceCornerController.getBillMonths.bind(intelligenceCornerController))
  .post('/get-bill-info', intelligenceCornerController.getBillInfo.bind(intelligenceCornerController))
  .post('/get-account-status', intelligenceCornerController.getAccountStatus.bind(intelligenceCornerController))
  .post('/get-service-status', intelligenceCornerController.getServicesStatus.bind(intelligenceCornerController))
  .post('/get-payment-status', intelligenceCornerController.getPaymentStatus.bind(intelligenceCornerController))
  .post('/get-open-invoices', intelligenceCornerController.getInvoices.bind(intelligenceCornerController))
  .post('/get-order-details', intelligenceCornerController.getOrderDetails.bind(intelligenceCornerController))
  .post('/get-orders', intelligenceCornerController.getOrders.bind(intelligenceCornerController))
  .post('/save-interaction-statement', intelligenceCornerController.saveInteractionStatement.bind(intelligenceCornerController))
  //Recent Activities
  .post('/get-recent-interactions', intelligenceCornerController.getRecentInteractions.bind(intelligenceCornerController))
  .post('/get-recent-channel-activity', intelligenceCornerController.getRecentChannelActivity.bind(intelligenceCornerController))
  .post('/get-recent-subscriptions', intelligenceCornerController.getRecentSubscriptions.bind(intelligenceCornerController))
  .post('/get-recent-channels', intelligenceCornerController.getRecentChannels.bind(intelligenceCornerController))
  .post('/get-recent-bills', intelligenceCornerController.getRecentBills.bind(intelligenceCornerController))
  .post('/get-recent-invoices', intelligenceCornerController.getRecentInvoices.bind(intelligenceCornerController))
  .post('/get-recent-orders', intelligenceCornerController.getRecentOrders.bind(intelligenceCornerController))
  .post('/get-recent-order', intelligenceCornerController.getRecentOrder.bind(intelligenceCornerController))
  // Service related interest
  .post('/check-existing-customer', intelligenceCornerController.checkExistingCustomer.bind(intelligenceCornerController))
  .get('/get-product-family', intelligenceCornerController.getProductFamily.bind(intelligenceCornerController))
  .post('/get-product-family-products', intelligenceCornerController.getProductFamilyProducts.bind(intelligenceCornerController))
  .post('/get-existing-services', intelligenceCornerController.getExistingServices.bind(intelligenceCornerController))
  .post('/get-repeated-request', intelligenceCornerController.getRepeatedRequest.bind(intelligenceCornerController))
  .post('/update-request', intelligenceCornerController.updateRequest.bind(intelligenceCornerController))
  // Billing related ROUTES
  .post('/get-service-order', intelligenceCornerController.serviceOrder.bind(intelligenceCornerController))
  .post('/check-contract-of-order', intelligenceCornerController.checkContractOfOrder.bind(intelligenceCornerController))
  .post('/check-billing-status', intelligenceCornerController.checkBillingOfService.bind(intelligenceCornerController))
  .post('/check-activities', intelligenceCornerController.checkAllActivities.bind(intelligenceCornerController))
  // Service releated -appeals
  .post('/get-customer-analysis', intelligenceCornerController.getCustomerCurrentInformation.bind(intelligenceCornerController))
  .post('/update-customer-service', intelligenceCornerController.updateCustomerService.bind(intelligenceCornerController))
  .post('/get-addon-list', intelligenceCornerController.getAddonList.bind(intelligenceCornerController))
  .post('/purchase-addon', intelligenceCornerController.purchaseAddon.bind(intelligenceCornerController))

module.exports = intelligenceCornerRoute
