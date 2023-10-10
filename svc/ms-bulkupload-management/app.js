const express = require('express')

const bulkuploadRoute = require('./route')
const mainRouter = express.Router()

mainRouter.use('/bulk-upload', bulkuploadRoute)

module.exports = mainRouter
