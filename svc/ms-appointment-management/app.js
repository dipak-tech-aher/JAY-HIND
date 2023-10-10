const express = require('express')

const appointmentRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/appointment', appointmentRoute)

module.exports = mainRouter
