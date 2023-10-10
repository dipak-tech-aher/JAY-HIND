import '@babel/polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import { config } from '@config/env.config'
import { i18nextMiddleware, i18next } from '@config/i18next.config'
import { logger } from '@utils'

const app = express()
const port = config.bcae.port
const routes = require('./app')
const cors = require('cors')
const { destroyNamespace } = require('continuation-local-storage')
const { bootstrap } = require('@services/connection-service')
const HelpdeskService = require('@services/helpdesk.service')
const { db } = require('@models')

app.use(cors())
app.use(i18nextMiddleware.handle(i18next))
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ extended: true }))
bootstrap()

try {
  setTimeout(() => {
    const helpdeskService = new HelpdeskService();
    helpdeskService.helpdeskJob({ state: 'start' });
  }, 60000)
} catch (error) {
  console.log("Error in starting job ==> ", error);
}

app.use('/api', routes)

app.listen(port, (err) => {
  if (err) {
    logger.error('Error occured while starting server: ', err)
    return
  }
  logger.info('Using Configuration ' + config.dbProperties.host + '/' + config.dbProperties.database)
  logger.debug('Server started in port no: ' + port)
})

const cleanUpServer = async () => {
  try {
    destroyNamespace('tenants')
    await db.sequelize.close()
    console.log('tenants namespace destroyed')
  } catch (error) {
    console.log(error)
  }
}

['beforeExit'].forEach((eventType) => {
  process.on(eventType, cleanUpServer.bind(null, eventType))
})
