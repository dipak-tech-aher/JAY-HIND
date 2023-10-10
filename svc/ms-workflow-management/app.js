const express = require('express')

const { workflowRoute } = require('./route')
const mainRouter = express.Router()

mainRouter.use('/workflow', workflowRoute)

module.exports = mainRouter
