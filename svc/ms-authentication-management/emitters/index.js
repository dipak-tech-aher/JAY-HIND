import { config } from '@config/env.config'
import { EmailHelper, SMSHelper, statusCodeConstants } from '@utils'
import { defaultStatus, logger } from '../utils'
const { getConnection } = require('@services/connection-service')

// get the reference of EventEmitter class of events module
const events = require('events')
const ST = require('stjs')

// create an object of EventEmitter class by using above reference
const em = new events.EventEmitter()
const { domainURL } = config

// Subscribe for USER_CREATED
em.on('USER_CREATED', async (user) => {
  const emailHelper = new EmailHelper()
  const conn = await getConnection()

  const template = await conn.NotificationTemplate.findOne({
    where: {
      templateName: 'User Registration',
      templateType: 'TC_EMAIL'
    }
  })
  if (!template) {
    return {
      status: statusCodeConstants.VALIDATION_ERROR,
      message: 'Email template not found,Please create template'
    }
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
  const conn = await getConnection()

  const template = await conn.NotificationTemplate.findOne({
    where: {
      templateName: data?.type === 'email' ? 'Email OTP' : 'SMS To User',
      templateType: data?.type === 'email' ? 'TC_EMAIL' : 'TC_SMS'
    }
  })
  if (!template) {
    return {
      status: statusCodeConstants.VALIDATION_ERROR,
      message: 'Email template not found,Please create template'
    }
  }
  const htmlContent = ST.select(data).transformWith(template.body).root()
  //console.log(data);
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
  const conn = await getConnection()
  const { firstName, email, hashPassword, forgotPasswordToken, aisoDomainURL, userId } = data
  const template = await conn.NotificationTemplate.findOne({
    where: { templateName: 'Forgot Password', templateType: 'TC_EMAIL', templateStatus: defaultStatus.ACTIVE }
  })

  if (!template) {
    logger.debug('Email template not found,Please create template')
    return {
      status: statusCodeConstants.VALIDATION_ERROR,
      message: 'Email template not found,Please create template'
    }
  }
  const emailData = {
    firstName,
    aisoDomainURL,
    email,
    hashPassword,
    forgotPasswordToken
  }

  const htmlContent = ST.select(emailData).transformWith(template.body).root()
  const response = await emailHelper.sendMail({
    to: [email],
    subject: template.subject,
    message: htmlContent
  })
  const notificationData = {
    email,
    subject: template.subject,
    body: template.subject,
    notificationType: 'Email',
    sentAt: new Date(),
    status: response.status,
    source: 'Forgot Password',
    channel: 'WEB',
    referenceId: userId,
    createdBy: userId,
    updatedBy: userId
  }
  await conn.Notification.create(notificationData)
})

em.on('SEND_REGISTER_WELCOME_EMAIL', async (user) => {
  const emailHelper = new EmailHelper()
  const conn = await getConnection()
  const template = await conn.NotificationTemplate.findOne({
    where: { templateName: 'Onboard User', templateType: 'TC_EMAIL', templateStatus: defaultStatus.ACTIVE }
  })

  //console.log(template,  "ddas dasd adas dasd");

  if (!template) {
    logger.debug('Email template not found,Please create template')
    return {
      status: statusCodeConstants.VALIDATION_ERROR,
      message: 'Email template not found,Please create template'
    }
  }

  const data = {
    userId: user.userId,
    firstName: user?.firstName + ' ' +user?.lastName,
    aisoDomainURL: domainURL,
    email: user.email,
    loginPassword: user.loginPassword
  }

//  console.log(data);

  const htmlContent = ST.select(data).transformWith(template.body).root()
  await emailHelper.sendMail({
    to: [user.email],
    subject: template.subject,
    message: htmlContent
  })

});

module.exports = em
