import { NotificationTemplate } from '@models'
import { config } from '@config/env.config'
import { EmailHelper, logger, defaultStatusCode, SMSHelper } from '@utils'
// get the reference of EventEmitter class of events module
const events = require('events')
const ST = require('stjs')

// create an object of EventEmitter class by using above reference
const em = new events.EventEmitter()
const { domainURL } = config

// Subscribe for USER_CREATED
em.on('USER_CREATED', async (user) => {
  const emailHelper = new EmailHelper()

  const template = await NotificationTemplate.findOne({
    where: {
      templateName: 'User Registration',
      templateType: 'TC_EMAIL'
    }
  })
  if (!template) {
    logger.debug('Email template not found,Please create template')
    return new Error('Email template not found,Please create template', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
  }
  const data = {
    userId: user.userId,
    firstName: user.firstName,
    aisoDomainURL: domainURL,
    email: user.email,
    loginPassword: user.loginPassword
  }
  const htmlContent = ST.select(data).transformWith(template.body).root()
  // KAFKA OR ANY JOB
  await emailHelper.sendMail({
    to: [user.email],
    subject: template.subject,
    message: htmlContent
  })
  // KAFKA OR ANY JOB
})

em.on('SEND_OTP', async (data) => {
  const emailHelper = new EmailHelper()
  const smsHelper = new SMSHelper()

  const template = await NotificationTemplate.findOne({
    where: {
      templateName: data?.type === 'email' ? 'Email OTP' : 'SMS To User',
      templateType: data?.type === 'email' ? 'TC_EMAIL' : 'TC_SMS'
    }
  })
  if (!template) {
    logger.debug('Email template not found,Please create template')
    return new Error('Email template not found,Please create template', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
  }
  const htmlContent = ST.select(data).transformWith(template.body).root()
  if (data?.type === 'email') {
    await emailHelper.sendMail({
      to: data?.reference,
      subject: template.subject.replace('{{OTP}}', data?.OTP),
      message: htmlContent
    })
  } else if (data?.type === 'mobile') {
    await smsHelper.sendSMS({
      to: data?.reference,
      extn: data?.extn,
      subject: template.subject.replace('{{OTP}}', data?.OTP),
      message: htmlContent
    })
  }
})

em.on('SEND_FORGOT_PASSWORD', async (data) => {
  const emailHelper = new EmailHelper()
  const { user, hashPassword, forgotPasswordToken, aisoDomainURL } = data

  const template = await NotificationTemplate.findOne({
    where: { templateName: 'Forgot Password', templateType: 'TC_EMAIL' }
  })
  if (!template) {
    logger.debug('Email template not found,Please create template')
    return new Error('Email template not found,Please create template', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
  }
  const emailData = {
    firstName: user.firstName,
    aisoDomainURL,
    email: user.email,
    hashPassword,
    forgotPasswordToken
  }

  const htmlContent = ST.select(emailData).transformWith(template.body).root()
  await emailHelper.sendMail({
    to: [user.email],
    subject: template.subject,
    message: htmlContent
  })
})

module.exports = em
