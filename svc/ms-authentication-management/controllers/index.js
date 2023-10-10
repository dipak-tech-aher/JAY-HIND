import AuthenticationService from '@services/authentication.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import {
  forgotPasswordValidator, getUserByTokenValidator, loginValidator /*, logoutValidator */,
  registerUserValidator, registerUserViaMobileValidator, resetPasswordValidator, sendOTPValidator,
  updateUserSessionValidator, validateOTPValidator, getAccessTokenValidator
} from '@validators'
const { getConnection } = require('@services/connection-service')

export class AuthenticationController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.AuthenticationService = new AuthenticationService()
  }

  async getSessionInfo(req, res) {
    try {
      const { userId } = req;
      console.log('userId------->', userId)
      const conn = await getConnection()
      const response = await this.AuthenticationService.getSessionInfo(userId, conn)
      if (response.status === 200)
        return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async registerUser(req, res) {
    let t
    try {
      const { body } = req
      const { error } = registerUserValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.AuthenticationService.registerUser(body, conn, t)
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

  async registerUserViaMobile(req, res) {
    let t
    try {
      const { body } = req
      const { error } = registerUserViaMobileValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.AuthenticationService.registerUserViaMobile(body, conn, t)
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

  async sendOTP(req, res) {
    let t
    try {
      const { reference, firstName, extn } = req.body
      const { type, source, userGroup } = req.query
      const data = {
        type,
        source,
        reference,
        firstName,
        extn,
		userGroup
      }
      const { error } = sendOTPValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.AuthenticationService.sendOTP(data, conn, t)
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

  async login(req, res) {
    let t
    try {
      const { body, ip, headers } = req
      const { error } = loginValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.AuthenticationService.login(body, ip, headers, conn, t)
      if ((response.status === 200) || (response?.commit)) t.commit()

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

  async forgotPassword(req, res) {
    let t
    try {
      const { body } = req
      const { error } = forgotPasswordValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.AuthenticationService.forgotPassword(body, conn, t)
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

  async resetPassword(req, res) {
    let t
    try {
      const { body } = req
      const { error } = resetPasswordValidator.validate(body)

      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.AuthenticationService.resetPassword(body, conn, t)
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

  async changePassword(req, res) {
    let t
    try {
      const conn = await getConnection()
      const { body, query, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      t = await conn.sequelize.transaction()
      const response = await this.AuthenticationService.changePassword(data, conn, t)
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

  async getUserByToken(req, res) {
    try {
      const { params } = req
      const { error } = getUserByTokenValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.AuthenticationService.getUserByToken(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async logout(req, res) {
    let t
    try {
      const { id } = req.params
      const data = {
        userId: parseInt(id)
      }
      // console.log(typeof data.userId)
      // const { error } = logoutValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.AuthenticationService.logout(data, conn, t)
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

  async updateUserSession(req, res) {
    let t
    try {
      const { body, userId, sessionId } = req
      const data = {
        ...body,
        userId
      }
      const { error } = updateUserSessionValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.AuthenticationService.updateUserSession(data, sessionId, conn, t)
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

  async validateOTP(req, res) {
    try {
      const { query, params } = req
      const data = {
        ...query,
        ...params
      }
      const { error } = validateOTPValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.AuthenticationService.validateOTP(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAccessToken(req, res) {
    let t
    try {
      const { body } = req
      const data = { ...body }
      const { error } = getAccessTokenValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.AuthenticationService.getAccessToken(data, conn, t)
      if ((response.status === 200) || (response?.commit)) t.commit()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {

    }
  }
}
