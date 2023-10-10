import { CatalogController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const catalogRouter = express.Router()
const catalogController = new CatalogController()

catalogRouter.use([connectionRequest, validateToken, validatePermission])

catalogRouter
  .post('/', catalogController.createCatalog.bind(catalogController))
  .put('/:id', catalogController.updateCatalog.bind(catalogController))
  .get('/:id', catalogController.getCatalog.bind(catalogController))
  .get('/upgrade-downgrade/:type', catalogController.catalogByServiceType.bind(catalogController))
  .post('/list', catalogController.getCatalogList.bind(catalogController))
  .post('/search/', catalogController.getCatalogByName.bind(catalogController))

module.exports = catalogRouter
