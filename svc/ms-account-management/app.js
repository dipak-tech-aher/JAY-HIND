const express = require('express')

const accountRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/accounts', accountRoute)

module.exports = mainRouter
