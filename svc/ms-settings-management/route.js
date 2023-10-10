import { SettingsController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
import express from 'express'
// import { validatePermission } from '../utils/permission-validator'
const { connectionRequest } = require('@middlewares/db-connection')

const settingRouter = express.Router()
const settingService = new SettingsController()
// const jobService = new JobService()

settingRouter.use([connectionRequest, validateToken])
settingRouter
// .post('/', validateToken, /* validatePermission, */ portalSettingService.createPortalSetting.bind(portalSettingService))
// .post('/list', validateToken, /* validatePermission, */ portalSettingService.getPortalSettingList.bind(portalSettingService))
// .post('/send-email', validateToken, /* validatePermission, */ portalSettingService.sendSmtpMail.bind(portalSettingService))
// .post('/send-sms', validateToken, /* validatePermission, */ portalSettingService.sendSms.bind(portalSettingService))
// .put('/', validateToken, /* validatePermission, */ portalSettingService.updatePortalSetting.bind(portalSettingService))
// .get('/:type', validateToken, /* validatePermission, */ portalSettingService.getPortalSetting.bind(portalSettingService))

  .get('/job', settingService.getAllJobs.bind(settingService))
// .put('/job/:jobId', jobService.updateJobService.bind(jobService))
// .get('/helpdesk/:state', jobService.jobHelpdesk.bind(jobService))
// .get('/unbilled/:state', jobService.jobUnbilled.bind(jobService))
// .get('/scheduled/:state', jobService.jobScheduled.bind(jobService))
// .get('/email/:state', jobService.jobEmail.bind(jobService))
// .get('/chat-cleanup/:state', jobService.jobChat.bind(jobService))
// .get('/facebook/getposts/:state', jobService.jobFBPost.bind(jobService))
module.exports = settingRouter
