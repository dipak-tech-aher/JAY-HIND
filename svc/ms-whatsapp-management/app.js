const express = require('express')

const route = require('./route')
const mainRouter = express.Router()

mainRouter.use('/whatsapp', route)

module.exports = mainRouter
