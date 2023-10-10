const express = require('express')

const inventoryRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/inventory', inventoryRoute)

module.exports = mainRouter
