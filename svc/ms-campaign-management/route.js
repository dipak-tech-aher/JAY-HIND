import { campaignController } from '@controllers'
import { validateToken } from '@middlewares'
import { validatePermission } from '@utils'
import express from 'express'

const campaignRouter = express.Router()
const campaignController = new CampaignController()

cmodule.exports = campaignRouter
