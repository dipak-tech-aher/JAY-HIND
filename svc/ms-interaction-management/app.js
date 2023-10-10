const express = require('express')

const interactionRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/interaction', interactionRoute)

module.exports = mainRouter
