import { ChargeController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const chargeRouter = express.Router()
const chargeController = new ChargeController()

chargeRouter.use([connectionRequest, validateToken])

chargeRouter
  .post('/', chargeController.createCharge.bind(chargeController))
  .get('/:id', chargeController.getChargeById.bind(chargeController))
  .post('/search', chargeController.getChargeByList.bind(chargeController))
  .put('/:id', chargeController.updateCharge.bind(chargeController))
  .get('/search/all', chargeController.getChargeByName.bind(chargeController))

module.exports = chargeRouter
