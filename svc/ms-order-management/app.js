const express = require('express')

const orderRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/order', orderRoute)

module.exports = mainRouter
