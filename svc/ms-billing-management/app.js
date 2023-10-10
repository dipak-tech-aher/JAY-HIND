const express = require('express')

const billingRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/billing', billingRoute)

module.exports = mainRouter
