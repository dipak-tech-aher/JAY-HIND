const express = require('express')

const { businessParameterRouter, knowledgeBaseRouter } = require('./route')
const mainRouter = express.Router()

mainRouter.use('/master', businessParameterRouter)
mainRouter.use('/knowledge-Base', knowledgeBaseRouter)

module.exports = mainRouter
