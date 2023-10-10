import { InventoryController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const inventoryController = new InventoryController()

const inventoryRouter = express.Router()


inventoryRouter.use([connectionRequest])
// inventoryRouter
//   .get('/', inventoryController.getProducts.bind(inventoryController))
//   .post('/mapping-list', inventoryController.getProductBundleMapping.bind(inventoryController))
//   .post('/web-self-care-mapping-list', inventoryController.getProductBundleMappingWebSelfCare.bind(inventoryController))
//   .post('/recommended-plans', inventoryController.getRecommendedPlans.bind(inventoryController))
//   .get('/promo-details', inventoryController.getPromoDetails.bind(inventoryController))
//   .post('/get-terms', inventoryController.getTermsDetails.bind(inventoryController))

inventoryRouter.use([validateToken])
inventoryRouter
  // .post('/get-inventory-details', inventoryController.getProductsDetail.bind(inventoryController))
  .post('/search', inventoryController.getInventoryItemList.bind(inventoryController))
  .post('/create', validateToken, inventoryController.createInventoryItem.bind(inventoryController))
  .put('/update/:inventoryUuid', validateToken, inventoryController.updateInventoryItem.bind(inventoryController))
  // .get('/:type/list/:serviceUuid', inventoryController.getProductDetails.bind(inventoryController))

module.exports = inventoryRouter
