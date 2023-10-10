const express = require('express')

const intelligenceCornerRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/intelligence-corner', intelligenceCornerRoute)

module.exports = mainRouter
