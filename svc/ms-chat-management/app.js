const express = require('express')

const chatRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/chat', chatRoute)

module.exports = mainRouter
