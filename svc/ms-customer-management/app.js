const express = require('express')

const {customerRouter, aiRouter} = require('./route')
const mainRouter = express.Router()

mainRouter.use('/customer', customerRouter)
mainRouter.use('/ai-service', aiRouter)

module.exports = mainRouter
