const express = require('express')

const profileRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/profile', profileRoute)

module.exports = mainRouter
