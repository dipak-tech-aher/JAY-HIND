const express = require('express')

const addonRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/auth', addonRoute)

module.exports = mainRouter
