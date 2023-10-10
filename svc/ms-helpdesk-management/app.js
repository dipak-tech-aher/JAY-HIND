const express = require('express')

const helpdeskRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/helpdesk', helpdeskRoute)

module.exports = mainRouter
