import NotificationService from '@services/notification.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import { getNotificationValidator, getNotificationCountValidator, updateNotificationSeenValidator, updateNotificationPinnedValidator } from '@validators/notification.validator'

const { getConnection } = require('@services/connection-service')

export class NotificationController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.notificationService = new NotificationService()
  }

  async getNotification (req, res) {
    try {
      const { query, userId, roleId, departmentId } = req
      const data = { ...query, userId, roleId, departmentId }
      const { error } = getNotificationValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.notificationService.getNotification(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getNotificationCount (req, res) {
    try {
      const { query, userId, roleId, departmentId } = req
      const data = { ...query, userId, roleId, departmentId }
      const { error } = getNotificationCountValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.notificationService.getNotificationCount(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateNotificationSeen (req, res) {
    let t
    try {
      const { body, params, userId, roleId, departmentId } = req
      const data = { ...params, ...body, userId, roleId, departmentId }
      const { error } = updateNotificationSeenValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.notificationService.updateNotificationSeen(data, conn, t)
      if (response.status === 200) t.commit()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateNotificationPinned (req, res) {
    let t
    try {
      const { body, params, userId } = req
      const data = { ...params, ...body, userId }
      const { error } = updateNotificationPinnedValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.notificationService.updateNotificationPinned(data, conn, t)
      if (response.status === 200) t.commit()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
  
  async createUpdateNotification (req, res) {
    let t
    try {
      const { body, params, userId, roleId, departmentId } = req
      const data = { ...params, ...body, userId, roleId, departmentId }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.notificationService.createUpdateNotification(data, conn, t)
      if (response.status === 200) t.commit()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }
}
