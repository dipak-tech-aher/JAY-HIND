const express = require('express')

const catalogRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/catalog', catalogRoute)

module.exports = mainRouter
