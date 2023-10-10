const express = require('express')

const addonRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/charge', addonRoute)

module.exports = mainRouter
