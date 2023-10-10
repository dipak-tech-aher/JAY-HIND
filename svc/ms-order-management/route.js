import { OrderController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const orderRoute = express.Router()
const orderController = new OrderController()

orderRoute.use([connectionRequest])

orderRoute
  .post('/create-update-address', validateToken, orderController.createOrUpdateAddress.bind(orderController))
  .get('/search', validateToken, orderController.searchOrderByQuery.bind(orderController))
  .post('/create-order-web-self-care', validateToken, orderController.createOrderWebSelfCare.bind(orderController))
  .post('/create', validateToken, orderController.createOrder.bind(orderController))
  .put('/edit/:orderNo', validateToken, orderController.editOrder.bind(orderController)) // need to check
  .post('/search', validateToken, orderController.searchOrder.bind(orderController))// --
  .put('/assignSelf', validateToken, orderController.assignOrder.bind(orderController))
  .get('/history/:orderNo?', validateToken, orderController.getOrderHistory.bind(orderController))
  .post('/followUp', validateToken, orderController.addFollowUp.bind(orderController))
  .get('/counts', validateToken, orderController.getCounts.bind(orderController))
  .put('/cancel/:orderNo', validateToken, orderController.cancelOrder.bind(orderController))
  .post('/cancel', orderController.cancelOrders.bind(orderController))
  .post('/list', orderController.getOrderListbasedOnConversationId.bind(orderController))
  .post('/order-address', orderController.getAddressbasedOnOrderId.bind(orderController))
  .post('/update-order-address', orderController.UpdateOrderAddress.bind(orderController))
  .post('/flow/:orderNo', validateToken, orderController.getOrderFlow.bind(orderController))

  .get('/get-customer-history-count/:customerUid', validateToken, orderController.getCustomerOrderHistoryCount.bind(orderController))
  .get('/get-customer-history/:customerUid', validateToken, orderController.getCustomerOrderHistory.bind(orderController))

  .post('/order-history-graph', validateToken, orderController.getMyOrderHistory.bind(orderController))
  .post('/order-history-graph-team', validateToken, orderController.getTeamOrderHistory.bind(orderController))

  .post('/get-handling-time', validateToken, orderController.handlingTime.bind(orderController))
  .post('/get-team-handling-time', validateToken, orderController.handlingTimeTeam.bind(orderController))

  .post('/get-order-category-performance', validateToken, orderController.getOrderCategoryPerformance.bind(orderController))
  .post('/get-top-performance', validateToken, orderController.getTopPerformance.bind(orderController))
  .post('/get-related-category-info', validateToken, orderController.getRelatedCategoryTypeInfo.bind(orderController))

  .post('/total-count-by-channel', validateToken, orderController.getTotalOrdersByChannel.bind(orderController))

  .post('/corner', validateToken, orderController.getOrderCorner.bind(orderController))
  .post('/revenue-by-channel', validateToken, orderController.getRevenueByChannel.bind(orderController))
  .post('/overall-revenue-count', validateToken, orderController.getOverAllRevenueCount.bind(orderController))
  .post('/appoinment-count', validateToken, orderController.getAppoinmentCount.bind(orderController))

  // customer-engagement-dashboard
  .post('/count/new', validateToken, orderController.getNewOrderCount.bind(orderController))
  .post('/my-products', validateToken, orderController.getMyProducts.bind(orderController))
  .post('/my-orders', validateToken, orderController.getMyOrders.bind(orderController))
  .post('/get-service-category-type', validateToken, orderController.getServiceTypeCategory.bind(orderController))
  .put('/update-shipping-address', validateToken, orderController.updateShippingAddress.bind(orderController))

  // Sales Dashboard
  .post('/sales/live', validateToken, orderController.getLiveSales.bind(orderController))
  .post('/sales/total', validateToken, orderController.getTotalSales.bind(orderController))
  .post('/sales/channel', validateToken, orderController.getSalesByChannel.bind(orderController))
  .post('/sales/location', validateToken, orderController.getSalesByLocation.bind(orderController))
  .post('/sales/monthly', validateToken, orderController.getMonthlySales.bind(orderController))
  .post('/sales/metric', validateToken, orderController.getSalesMetric.bind(orderController))

  .post('/sales/annual-contract-value', validateToken, orderController.getAnnualContractValue.bind(orderController))
  .post('/sales/customer-lifetime-value', validateToken, orderController.getCustomerLifetimeValue.bind(orderController))
  .post('/sales/leads-pipeline', validateToken, orderController.getLeadsPipeline.bind(orderController))

  .post('/sales/live-track', validateToken, orderController.getLiveSalesTrack.bind(orderController))
  .post('/sales/churn-rate-percent', validateToken, orderController.getChurnRatePercent.bind(orderController))

  .post('/sales/positive-negative-reply-count', validateToken, orderController.getPositiveNegativeReplyCount.bind(orderController))
  .post('/sales/deals-by-age', validateToken, orderController.getDealsByAge.bind(orderController))
  .post('/sales/avg-leads-response-time', validateToken, orderController.getAvgLeadResponseTime.bind(orderController))
  .post('/sales/growth', validateToken, orderController.getSalesGrowth.bind(orderController))

module.exports = orderRoute
