const express = require('express')

const assetRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/settings', assetRoute)

module.exports = mainRouter
