const express = require('express')

const contractRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/contract', contractRoute)

module.exports = mainRouter
