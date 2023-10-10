const express = require('express')

const invoiceRouter = require('./route')
const mainRouter = express.Router()

mainRouter.use('/invoice', invoiceRouter)

module.exports = mainRouter
