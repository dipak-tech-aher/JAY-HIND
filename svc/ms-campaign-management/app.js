const express = require('express')

const campaignRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/campaign', campaignRoute)

module.exports = mainRouter
