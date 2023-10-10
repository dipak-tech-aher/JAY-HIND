import { AjustmentController } from '@controllers'
import { validateToken } from '@middlewares'
import { validatePermission } from '@utils'
import express from 'express'

const adjustmentRouter = express.Router()
const adjustmentController = new AjustmentController()


module.exports = adjustmentRouter
