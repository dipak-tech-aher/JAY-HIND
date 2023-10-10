const winston = require('winston')
const { combine, timestamp, errors, label } = winston.format

const errorFilter = winston.format((info, opts) => {
  return info.level === 'error' ? info : false
})

const infoFilter = winston.format((info, opts) => {
  return info.level === 'info' ? info : info.level === 'debug' ? info : false
})

let logger

if (process.env.NODE_ENV === 'production') {
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp(), winston.format.json()),
    transports: [
      new winston.transports.File({
        filename: 'Account-combined.log',
        format: combine(errorFilter(), label({ label: 'Addon' }), errors({ stack: true }), timestamp(), winston.format.json())

      }),
      new winston.transports.File({
        filename: 'Account-error.log',
        level: 'error',
        format: combine(errorFilter(), label({ label: 'Addon' }), errors({ stack: true }), timestamp(), winston.format.json())
      }),
      new winston.transports.File({
        filename: 'Account-info.log',
        level: 'info',
        format: combine(infoFilter(), label({ label: 'Addon' }), errors({ stack: true }), timestamp(), winston.format.json())
      })
    ]
  })
} else {
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: combine(
      label({ label: 'Account' }),
      errors({ stack: true }),
      timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A'
      }),
      winston.format.json()
    ),
    transports: [new winston.transports.Console()]
  })
}

module.exports = logger
