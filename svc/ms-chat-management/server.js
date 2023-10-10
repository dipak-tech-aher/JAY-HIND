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
const { db } = require('@models')

app.use(cors())
app.use(i18nextMiddleware.handle(i18next))
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

bootstrap()

app.use('/api', routes)

const server = require('http').createServer(app)
const SocketIdArr = []

server.listen(port, (err) => {
  if (err) {
    logger.error('Error occured while starting server: ', err)
    return
  }
  logger.info('Using Configuration ' + config.dbProperties.host + '/' + config.dbProperties.database)
  logger.debug('Chat Bot Server started in port no: ' + port)
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

const io = require('socket.io')(server, {
  cors: {
    origin: ['*', 'http://localhost:2002', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:2001'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['my-custom-header'],
    credentials: true
  }
})

io.on('connection', (socket) => {
  // socket object may be used to send specific messages to the new connected client
  socket.on('channel-join', (email) => {
    return email
  })

  socket.on('messageByBot', (msg) => {
    io.emit(msg.split('^^')[1] + '-CLIENT-2', msg.split('^^')[0])
    return msg
  })

  // Message from client-1
  socket.on(socket.id, (message) => {
    // Receive the msg from client-1 and send into client-2
    io.emit(socket.id + '-CLIENT-2', message)
    if (!SocketIdArr.includes(socket.id)) {
      SocketIdArr.push(socket.id)
    }
    return message
  })

  // Message from client-2
  socket.on('CLIENT-2', (message) => {
    // Receive the msg from client-2 and send into client-1
    const arr = message.split('^^')
    io.emit(arr[1], arr[0])
    if (!SocketIdArr.includes(socket.id)) {
      SocketIdArr.push(socket.id)
    }
    return message
  })

  socket.on('disconnection', () => {
    logger.debug('disconnect the socket...')
    socket.disconnect()
  })
})
