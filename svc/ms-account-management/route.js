import { AccountController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const accountRouter = express.Router()
const accountController = new AccountController()

accountRouter.use([connectionRequest])
  .post('/service/create/mobile', accountController.createService.bind(accountController))
  // chat
  .post('/chat-create', accountController.createAccount.bind(accountController))
  .post('/service/chat-create', accountController.createService.bind(accountController))
  .post('/get-services-ai', validateToken, accountController.getServicesAI.bind(accountController))
  .post('/get-products-ai', validateToken, accountController.getProductsAI.bind(accountController))
  .post('/get-inventory-ai', validateToken, accountController.getInventoryAI.bind(accountController))
  .post('/service/smart-ai-create', validateToken, accountController.createServiceAI.bind(accountController))
  .post('/service/smart-ai-update', accountController.updateServiceAI.bind(accountController))
  .post('/get-vpn-expiry-ai', validateToken, accountController.vpnExpiry.bind(accountController))
  .post('/renewal-service-ai', validateToken, accountController.renewServiceAI.bind(accountController))
  .post('/get-mapped-service-ai', validateToken, accountController.getMappedServiceAI.bind(accountController))
  .post('/get-asset-list'/*, validateToken*/, accountController.getAssetList.bind(accountController))
  .post('/get-asset-inventory'/*, validateToken*/, accountController.getAssetInventory.bind(accountController))
  .post('/assign-asset-inventory'/*, validateToken*/, accountController.assignAssetInventory.bind(accountController))
  .post('/get-customer-asset'/*, validateToken*/, accountController.getCustomerAssestList.bind(accountController))

accountRouter.use([validateToken])
  .post('/create', accountController.createAccount.bind(accountController))
  .put('/update/:accountUuid', accountController.updateAccount.bind(accountController))
  .get('/get-accountid-list/:customerUuid', accountController.getAccountIds.bind(accountController))
  .post('/get-account-list', accountController.getAccounts.bind(accountController))
  .post('/get-service-details', accountController.getServiceDetails.bind(accountController))

  .post('/get-service-list', accountController.getServices.bind(accountController))
  .post('/get-expiry-service-list', accountController.getExpiryServices.bind(accountController))

  .post('/service/create', accountController.createService.bind(accountController))
  .put('/service/update', accountController.updateService.bind(accountController))

  .post('/details/history', accountController.searchAccountDetailsHistory.bind(accountController))
  .post('/address/history', accountController.searchAccountAddressHistory.bind(accountController))

  .get('/service-badge/:customerUuid', accountController.getServiceBadge.bind(accountController))

module.exports = accountRouter
