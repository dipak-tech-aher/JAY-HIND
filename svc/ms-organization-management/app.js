const express = require('express')
const { organizationRouter, roleRouter } = require('./route')
const mainRouter = express.Router()

mainRouter.use('/organization', organizationRouter)
mainRouter.use('/role', roleRouter)

module.exports = mainRouter
