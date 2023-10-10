import { InvoiceController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const invoiceRouter = express.Router()
const invoiceController = new InvoiceController()

invoiceRouter.use([connectionRequest])

invoiceRouter
  .post('/search', invoiceController.getInvoices.bind(invoiceController))
  .post('/create', validateToken, invoiceController.createInvoice.bind(invoiceController))
  .post('/counts', validateToken, invoiceController.invoiceCount.bind(invoiceController))
  .post('/final-submit', validateToken, invoiceController.finalSubmit.bind(invoiceController))
  .post('/invoice-count', validateToken, invoiceController.revenueCountByMonth.bind(invoiceController))
  .post('/invoice-count-history', validateToken, invoiceController.revenueCountHistory.bind(invoiceController))
  .post('/counts-history', validateToken, invoiceController.monthlyContractHistory.bind(invoiceController))
  .get('/ar-bill/:customerUuid', validateToken, invoiceController.arBillCountsbyBillRefNo.bind(invoiceController))
  .get('/ar-bills/:customerId', validateToken, invoiceController.arBillCountsbyBillRefNos.bind(invoiceController))
  .get('/adjustment/:customerUuid', validateToken, invoiceController.postBillAdjustment.bind(invoiceController))
  .get('/payment/:invoiceId', validateToken, invoiceController.invoicePayment.bind(invoiceController))
  .get('/:invoiceId', validateToken, invoiceController.getInvoiceById.bind(invoiceController))
  .post('/payment-history', validateToken, invoiceController.paymentHistory.bind(invoiceController))

module.exports = invoiceRouter
