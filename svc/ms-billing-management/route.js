import { BillingController } from '@controllers'
import express from 'express'
import { validateToken } from '@middlewares/authentication-helper'

const { connectionRequest } = require('@middlewares/db-connection')

const route = express.Router()
const controller = new BillingController()

route.use([connectionRequest, validateToken])

route
  .get('/billing-details', controller.getBillingDetails.bind(controller))
  .post('/get-bill-months', controller.getBillMonths.bind(controller))
  .post('/payBill', controller.paymentBill.bind(controller))
  .get('/lookup', controller.getLookUpData.bind(controller))
  .get('/current/cycle', controller.getCurrentBillCycle.bind(controller))
  .post('/paymentHistory', controller.paymentHistory.bind(controller))
  .post('/create-payment', controller.createPayment.bind(controller))
  .post('/get-current-bill', controller.getCurrentBill.bind(controller))
  .post('/get-previous-bill', controller.getPreviousBill.bind(controller))

module.exports = route
