import { ProductController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const productController = new ProductController()

const productRouter = express.Router()


productRouter.use([connectionRequest])
productRouter
  .get('/', productController.getProducts.bind(productController))
  .post('/mapping-list', productController.getProductBundleMapping.bind(productController))
  .post('/web-self-care-mapping-list', productController.getProductBundleMappingWebSelfCare.bind(productController))
  .post('/recommended-plans', productController.getRecommendedPlans.bind(productController))
  .get('/promo-details', productController.getPromoDetails.bind(productController))
  .post('/get-terms', productController.getTermsDetails.bind(productController))

productRouter.use([validateToken])
productRouter
  .post('/get-product-details', productController.getProductsDetail.bind(productController))
  .post('/search', productController.getProductsbyLimit.bind(productController))
  .post('/get-task-product-map', productController.getTaskProductMapping.bind(productController))
  .post('/create', validateToken, productController.createProduct.bind(productController))
  .put('/update/:productUuid', validateToken, productController.updateProduct.bind(productController))
  .get('/:type/list/:serviceUuid', productController.getProductDetails.bind(productController))

module.exports = productRouter
