const express = require('express')

const reportRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/report', reportRoute)
mainRouter.use('/bi', reportRoute)

module.exports = mainRouter
