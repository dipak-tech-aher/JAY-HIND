const express = require('express')

const productRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/product', productRoute)

module.exports = mainRouter
