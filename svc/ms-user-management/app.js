const express = require('express')

const userRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/users', userRoute)

module.exports = mainRouter
