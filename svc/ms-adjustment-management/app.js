const express = require('express')

const adjustmentRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/adjustments', adjustmentRoute)

module.exports = mainRouter
