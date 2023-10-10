import { BulkuploadController } from '@controllers'
// import { validateToken } from '@middlewares'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')
const { validateToken } = require('@middlewares/authentication-helper')

const bulkuploadRouter = express.Router()
bulkuploadRouter.use([connectionRequest])

const bulkuploadController = new BulkuploadController()
bulkuploadRouter

  .post('/search', validateToken, bulkuploadController.bulkUploadSearch.bind(bulkuploadController))
  .post('/details', validateToken, bulkuploadController.getDetails.bind(bulkuploadController))

  .post('/user/verify', validateToken, bulkuploadController.verifyUsers.bind(bulkuploadController))
  .post('/user', validateToken, bulkuploadController.createBulkUsers.bind(bulkuploadController))

  .post('/entity-transaction-mapping/verify', validateToken, bulkuploadController.verifyEntityTransactionMapping.bind(bulkuploadController))
  .post('/entity-transaction-mapping', validateToken, bulkuploadController.createBulkEntityTransactionMapping.bind(bulkuploadController))

  .post('/request-statement', validateToken, bulkuploadController.createBulkRequestStatement.bind(bulkuploadController))
  .post('/request-statement/verify', validateToken, bulkuploadController.verifyRequestStatement.bind(bulkuploadController))

  .post('/profile', validateToken, bulkuploadController.createBulkProfile.bind(bulkuploadController))
  .post('/profile/verify', validateToken, bulkuploadController.verifyProfiles.bind(bulkuploadController))

  .post('/order', validateToken, bulkuploadController.createBulkOrder.bind(bulkuploadController))
  .post('/order/verify', validateToken, bulkuploadController.verifyOrders.bind(bulkuploadController))

  .post('/product', validateToken, bulkuploadController.createBulkProduct.bind(bulkuploadController))
  .post('/product/verify', validateToken, bulkuploadController.verifyProducts.bind(bulkuploadController))

  .post('/customer', validateToken, bulkuploadController.createBulkCustomer.bind(bulkuploadController))
  .post('/customer/verify', validateToken, bulkuploadController.verifyCustomers.bind(bulkuploadController))

  .post('/service', validateToken, bulkuploadController.createBulkService.bind(bulkuploadController))
  .post('/service/verify', validateToken, bulkuploadController.verifyServices.bind(bulkuploadController))

  .post('/interaction', validateToken, bulkuploadController.createBulkInteraction.bind(bulkuploadController))
  .post('/interaction/verify', validateToken, bulkuploadController.verifyInteractions.bind(bulkuploadController))

  .post('/charge', validateToken, bulkuploadController.createBulkCharge.bind(bulkuploadController))
  .post('/charge/verify', validateToken, bulkuploadController.verifyCharge.bind(bulkuploadController))

  .post('/business-units', validateToken, bulkuploadController.createBulkBusinessUnits.bind(bulkuploadController))
  .post('/business-units/verify', validateToken, bulkuploadController.verifyBulkBusinessUnits.bind(bulkuploadController))

  .post('/calendar', validateToken, bulkuploadController.createCalendar.bind(bulkuploadController))
  .post('/calendar/verify', validateToken, bulkuploadController.verifyCalendar.bind(bulkuploadController))

  .post('/holiday/calendar', validateToken, bulkuploadController.createHolidayCalendar.bind(bulkuploadController))
  .post('/holiday/calendar/verify', validateToken, bulkuploadController.verifyHolidayCalendar.bind(bulkuploadController))

  .post('/shift', validateToken, bulkuploadController.createShift.bind(bulkuploadController))
  .post('/shift/verify', validateToken, bulkuploadController.verifyShift.bind(bulkuploadController))

  .post('/skill', validateToken, bulkuploadController.createSkill.bind(bulkuploadController))
  .post('/skill/verify', validateToken, bulkuploadController.verifySkill.bind(bulkuploadController))

  .post('/user/skill', validateToken, bulkuploadController.createUserSkill.bind(bulkuploadController))
  .post('/user/skill/verify', validateToken, bulkuploadController.verifyUserSkill.bind(bulkuploadController))

  .post('/appointment', validateToken, bulkuploadController.createAppointment.bind(bulkuploadController))
  .post('/appointment/verify', validateToken, bulkuploadController.verifyAppointment.bind(bulkuploadController))

  .post('/contract', validateToken, bulkuploadController.createContract.bind(bulkuploadController))
  .post('/contract/verify', validateToken, bulkuploadController.verifyContract.bind(bulkuploadController))

  .post('/invoice', validateToken, bulkuploadController.createInvoice.bind(bulkuploadController))
  .post('/invoice/verify', validateToken, bulkuploadController.verifyInvoice.bind(bulkuploadController))

  .post('/payment', validateToken, bulkuploadController.createPayment.bind(bulkuploadController))
  .post('/payment/verify', validateToken, bulkuploadController.verifyPayment.bind(bulkuploadController))

module.exports = bulkuploadRouter
