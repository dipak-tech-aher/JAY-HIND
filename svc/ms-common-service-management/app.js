const express = require('express')

const { commonRouter, notificationRouter } = require('./route')

const mainRouter = express.Router()

mainRouter.use('/common', commonRouter)
mainRouter.use('/notification', notificationRouter)

module.exports = mainRouter
