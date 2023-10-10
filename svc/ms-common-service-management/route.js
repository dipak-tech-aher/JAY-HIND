import { CommonController } from '@controllers'
import { NotificationController } from '@controllers/Notification.controller'

import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@utils'
import express from 'express'

const commonRouter = express.Router()
const notificationRouter = express.Router()

const commonController = new CommonController()
const notificationController = new NotificationController()

const { connectionRequest } = require('@middlewares/db-connection')
commonRouter.use([connectionRequest])
notificationRouter.use([connectionRequest, validateToken])

commonRouter
  .post('/scan-document', commonController.scanCustomerDocument.bind(commonController))
  .post('/face-compare', commonController.faceCompare.bind(commonController))
  .post('/upload-files/:type', validateToken, commonController.uploadFiles.bind(commonController))
  .get('/scan-ID', commonController.scanDocument.bind(commonController))
  .post('/external-notification', commonController.externalNotification.bind(commonController))
  .get('/download-files/:uid', validateToken, commonController.downloadFile.bind(commonController))
  .get('/attachment/:uid', validateToken, commonController.getAttachmentList.bind(commonController))

notificationRouter
  .post('/notification-create-update', notificationController.createUpdateNotification.bind(notificationController))
  .get('/list', notificationController.getNotification.bind(notificationController))
  .get('/count', notificationController.getNotificationCount.bind(notificationController))
  .put('/update/status/:notificationStatus', notificationController.updateNotificationSeen.bind(notificationController))
  .put('/update/pinned/:notificationPinned', notificationController.updateNotificationPinned.bind(notificationController))
module.exports = { commonRouter, notificationRouter }
