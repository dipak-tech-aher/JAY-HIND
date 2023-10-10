import { config } from '@config/env.config'
import moment from 'moment'
import em from '@emitters'
import useragent from 'express-useragent'
import { isAfter } from 'date-fns'
import { CryptoHelper, defaultCode, defaultStatus, statusCodeConstants, logger, defaultMessage } from '@utils'
// import { entityCodes } from '@utils/constant'
import { isValidEmail } from '@utils/helpers'
import { Op } from 'sequelize'
const generatePassword = require('generate-password')
const { systemUserId, /* userLoginAttempts, */ domainURL, chatCount, chatRoleId } = config
// const { PERSONAL_CUSTOMER, BUSINESS_CUSTOMER } = entityCodes

let instance

class AuthenticationService {
  constructor() {
    if (!instance) {
      instance = this
    }
    instance.cryptoHelper = new CryptoHelper()
    return instance
  }

  async getSessionInfo(userId, conn) {
    try {
      logger.debug('get session info');
      console.log('userId----->', userId)
      const sessionInfo = await conn.UserSession.findOne({
        attributes: ['createdAt'],
        where: {
          userId: userId,
          status: defaultStatus.ACTIVE
        },
        order: [['sessionId', 'DESC']]
      })
      return { status: statusCodeConstants.SUCCESS, message: "session info fetched successfully", data: sessionInfo }
    } catch (error) {
      logger.error('Error while updating login Failed Attempts')
      throw error
    }
  }

  async registerUser(user, conn, t, forMobile = false) {
    try {
      let message = 'Error while register user'
      const userInfo = await conn.User.findOne({
        where: {
          email: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email')), '=', user.email.toLowerCase())
        }
      })
      if (userInfo) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Email Already Registered, request to Login'
        }
      }

      const userInfoMobile = await conn.User.findOne({
        where: {
          contactNo: user.contactNo
        }
      })

      if (userInfoMobile) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Mobile Number already exists, request to Login'
        }
      }

      const loginid = await generateUserId(user.email, conn)

      // const checkUserId = await conn.User.findOne({
      //   where:{
      //     loginid: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('loginid')), 'LIKE', '%' + loginid.toLowerCase() + '%')
      //   }
      // })

      const inviteToken = this.cryptoHelper.createHmac(user)
      const password = generatePassword.generate({ length: defaultCode.PASSWORD_LENGTH, numbers: true })
      const oneTimePassword = this.cryptoHelper.hashPassword(password)

      user = {
        ...user,
        loc: user.location,
        loginid,
        loginPassword: oneTimePassword,
        status: defaultStatus.PENDING,
        inviteToken,
        createdBy: systemUserId,
        updatedBy: systemUserId
      }
      await conn.User.create(user, { transaction: t })
      message = 'User register Successfully'

      if (!forMobile) {
        delete user.loginPassword
        user.userId = user.loginid
        user.loginPassword = password
        em.emit('SEND_REGISTER_WELCOME_EMAIL', user)
      } else {
        user.loginPassword = password
      }

      return { status: statusCodeConstants.SUCCESS, message, data: user }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async registerUserViaMobile(user, conn, t) {
    try {
      // check customer available
      // if available, then only register, =>
      // else return customer not available

      user.userType = 'UT_CONSUMER'
      user.userGroup = 'UG_CONSUMER'
      user.userSource = 'US_MOBILEAPP'
      user.firstName = user.email.split('@')[0]
      user.lastName = user.email.split('@')[0]
      user.gender = 'M'
      user.dob = new Date('12-07-1987')
      user.country = 'IND'

      const createdUser = await this.registerUser(user, conn, t, true)

      if (createdUser.status === statusCodeConstants.SUCCESS) em.emit('SEND_REGISTER_WELCOME_EMAIL', createdUser.data)

      delete createdUser.loginPassword

      return createdUser
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method used for login
   * @param {object} userData
   * @param {any} userData.loginId
   * @param {password} userData.password
   * @returns {object}
   */
  async login(userData, ip, headers, conn, t) {
    try {
      let systemConfig
      await getSystemConfiguration(conn).then((e) => {
        if (e.status === 200) {
          systemConfig = e?.data
        }
      })

      if (!systemConfig) {
        logger.debug('System Configuration is not available')
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { loginId, password, channel, userGroup, loginType } = userData

      const ua = useragent.parse(headers['user-agent'])
      const whereClauseQuery = {
        [Op.or]: [
          { email: loginId },
          { loginid: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('loginid')), '=', loginId.toLowerCase()) }
        ]
      }

      if (parseInt(loginId)) {
        whereClauseQuery[Op.or].push({ contactNo: parseInt(loginId) })
      }

      if (userGroup) {
        whereClauseQuery.userGroup = userGroup
      }

      const user = await conn.User.findOne({
        where: whereClauseQuery,
        logging: true
      })
      let otpVerified = false
      if (['UAM_MOBILE', 'UAM_SELFCARE'].includes(channel) && loginType === 'OTP') {
        const userData = {
          reference: (parseInt(loginId) || isValidEmail(loginId)) ? loginId : user.contactNo,
          otp: password
        }
        const otpValidated = await this.validateOTP(userData, conn)
        if (otpValidated.status === statusCodeConstants.SUCCESS) {
          otpVerified = true
        } else {
          return otpValidated
        }
      }
      if (!user) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Oops, looks like the Email ID/User ID that you entered is not registered with us. Can you check and retry. If the issue is still persisting, reach out to your Admin.'
        }
      }
      if (user.status === defaultStatus.IN_ACTIVE) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'You account is In-active, please contact admin'
        }
      }
      if (user.expiryDate) {
        if (new Date(user.expiryDate) < new Date()) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'You account is Expired, please contact admin'
          }
        }
      }
      if (user.status === defaultStatus.TEMPORARY && !otpVerified) {
        const validTempPassword = this.cryptoHelper.verifyHash(password, user.loginPassword)
        if (!validTempPassword) {
          await this.updateFailAttempts(user, conn, t)
          return {
            commit: true,
            status: statusCodeConstants.UN_PROCESSIBLE_ENTITY,
            message: `Oops, looks like you entered the wrong password, can you retry with a valid password? For more assistance ${channel !== 'UAM_MOBILE' ? ', click "Need help"' : ''}`
          }
        }
        const data = {
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          email: user.email,
          loginId: user.loginid,
          inviteToken: user.inviteToken,
          resetPassoword: true
        }
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Please reset your password',
          data
        }
      }
      if (user.status === defaultStatus.PENDING) {
        return {
          status: statusCodeConstants.UN_PROCESSIBLE_ENTITY,
          message: 'Your account is yet to activate by Admin, Thanks!'
        }
      }
      if (user.status === defaultStatus.PASSWORD_EXPIRED) {
        const data = {
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          email: user.email,
          loginId: user.loginid,
          inviteToken: user.inviteToken,
          resetPassoword: true
        }
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Password is expired. Please reset the password',
          data
        }
      }

      if (!otpVerified) {
        const validPassword = this.cryptoHelper.verifyHash(password, user.loginPassword)
        if (!validPassword) {
          await this.updateFailAttempts(user, conn, t)
          return {
            commit: true,
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `Oops, looks like you entered the wrong password, can you retry with a valid password? For more assistance ${channel !== 'UAM_MOBILE' ? ', click "Need help"' : ''}`
          }
        }
      }

      if (!user?.userFamily?.includes(channel)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Oops, you are not authorized to access this application, can you please reach out to your Admin.'
        }
      }
      if (user.mappingPayload === null) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Oops, you are not authorized to access this application, can you please reach out to your Admin.'
        }
      }
      const userSession = await conn.UserSession.findOne({
        where: {
          userId: user.userId,
          channel,
          status: defaultStatus.ACTIVE
        },
        order: [['sessionId', 'DESC']]
      })

      if (userSession) {
        const cs = await checkSessionExpiry(userSession.accessToken)
        if (cs.status === 'NOT-EXPIRED') {
          return {
            status: statusCodeConstants.SUCCESS,
            message: 'your account has logged in another device will you continue to login here?',
            data: { userId: user.userId, anotherSession: true }
          }
        } else {
          await conn.UserSession.update({ status: defaultStatus.IN_ACTIVE }, {
            where: {
              userId: user.userId,
              channel,
              status: defaultStatus.ACTIVE
            },
            transaction: t
          })
        }
      }

      // if (user.multipleSession === defaultCode.NO) {
      //   const userSessionInfo = await conn.UserSession.findOne({ attributes: ['userId'], where: { userId: user.userId } })
      //   if (userSessionInfo) {
      //     const data = { userId: user.userId, anotherSession: true }
      //     return {
      //       status: statusCodeConstants.SUCCESS,
      //       message: 'your account has logged in another device will you continue to login here ?',
      //       data
      //     }
      //   }
      // }

      logger.debug('Getting user department and role mapping')
      let currRole; let currDept; let permissions
      let currRoleId; let currDeptId; let currRoleDesc; let currDeptDesc
      if (user.mappingPayload && user.mappingPayload.userDeptRoleMapping) {
        currRoleId = user.mappingPayload.userDeptRoleMapping[0].roleId[0]
        currDeptId = user.mappingPayload.userDeptRoleMapping[0].unitId
        const roleInfo = await conn.Role.findOne({ where: { roleId: currRoleId } })
        if (roleInfo) {
          permissions = roleInfo?.mappingPayload?.permissions ? roleInfo?.mappingPayload?.permissions : {}
          currRole = roleInfo.roleName
          currRoleDesc = roleInfo.roleDesc
        }
        const org = await conn.BusinessUnit.findOne({ where: { unitId: currDeptId } })
        if (org) {
          currDept = org.unitName
          currDeptDesc = org.unitDesc
        }
      }
      const sessionData = {
        userId: user.userId,
        payload: user,
        ip,
        deviceId: ua.source,
        deviceType: ua.platform,
        channel,
        permissions,
        currRole,
        currRoleId,
        currDept,
        currDeptId,
        status: defaultStatus.ACTIVE,
        createdBy: user.userId,
        updatedBy: user.userId
      }
      logger.debug('Creating user session data')
      const session = await conn.UserSession.create(sessionData, { transaction: t })
      let sessionTimeOut; let refreshSessionTimeOut
      if (systemConfig?.dataValues?.maxSessionTimeout && systemConfig?.dataValues?.maxSessionTimeout?.type === 'MIN') {
        sessionTimeOut = systemConfig?.dataValues?.maxSessionTimeout?.value * 60000
      } else if (systemConfig?.dataValues?.maxSessionTimeout && systemConfig?.dataValues?.maxSessionTimeout?.type === 'SEC') {
        sessionTimeOut = systemConfig?.dataValues?.maxSessionTimeout?.value * 1000
      }

      if (systemConfig?.dataValues?.maxRefreshSessionTimeout && systemConfig?.dataValues?.maxRefreshSessionTimeout?.type === 'MIN') {
        refreshSessionTimeOut = systemConfig?.dataValues?.maxRefreshSessionTimeout?.value * 60000
      } else if (systemConfig?.dataValues?.maxRefreshSessionTimeout && systemConfig?.dataValues?.maxRefreshSessionTimeout?.type === 'SEC') {
        refreshSessionTimeOut = systemConfig?.dataValues?.maxRefreshSessionTimeout?.value * 1000
      }

      if (!sessionTimeOut || !refreshSessionTimeOut) {
        return {
          status: statusCodeConstants?.VALIDATION_ERROR,
          message: defaultMessage?.MANDATORY_FIELDS_MISSING
        }
      }

      const rawData = {
        userId: user.userId,
        sessionId: session.sessionId
      }
      const accessToken = this.cryptoHelper.createAccessToken(rawData, sessionTimeOut)
      const refreshToken = this.cryptoHelper.createAccessToken(rawData, refreshSessionTimeOut)
      await conn.UserSession.update({ accessToken, refreshToken }, { where: { sessionId: session.sessionId }, transaction: t })

      const tokenExpiresAt = (moment().add(this.cryptoHelper.millisToMinutes(sessionTimeOut), 'minutes')).valueOf()

      const response = {
        accessToken,
        user,
        channel,
        currRole,
        currDept,
        currDeptId,
        currRoleId,
        currDeptDesc,
        currRoleDesc,
        permissions,
        chatCount,
        chatRoleId,
        tokenExpiresAt,
        refreshToken
      }
      if (user.loginAttempts > 0) {
        logger.debug('user login Attempts reset')
        await this.resetFailAttempts(loginId, user.userId, conn, t)
      }
      return { status: statusCodeConstants.SUCCESS, message: 'user authenticated successfully', data: response }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method used for updatting user login attempts
   * @param {object} user
   * @param {number} user.loginAttempts
   * @param {number} user.userId
   * @param {transaction} t
   * @internal
   */
  async updateFailAttempts(user, conn, t) {
    try {
      logger.debug('update login failed attempts')
      let systemConfig
      await getSystemConfiguration(conn).then((e) => {
        if (e.status === 200) {
          systemConfig = e?.data
        }
      })

      // get System Configuration
      const userLoginAttempts = systemConfig?.maxPasswordRetry
      const data = {
        loginAttempts: user.loginAttempts === undefined ? 1 : user.loginAttempts + 1,
        updatedBy: user.userId
      }
      if (data.loginAttempts >= userLoginAttempts) {
        data.status = defaultStatus.IN_ACTIVE
      }
      await conn.User.update(data, { where: { email: user.email }, transaction: t })
    } catch (error) {
      logger.error('Error while updating login Failed Attempts')
      throw error
    }
  }

  /** Method used for resetting user login attempts
   * @param {string} email
   * @param {number} userId
   * @param {transaction} t
   * @internal
   */
  async resetFailAttempts(email, userId, conn, t) {
    try {
      logger.debug('Reset login failed attempts')
      const data = {
        loginAttempts: 0,
        updatedBy: userId
      }
      await conn.User.update(data, { where: { email }, transaction: t })
    } catch (error) {
      logger.error('Error while reseting login Failed Attempts')
      throw error
    }
  }

  /** A method for terminating a user session.
   * @param {object} user
   * @param {number} user.id
   * @returns
   */
  async logout(user, conn, t) {
    try {
      const { userId } = user
      await conn.UserSession.destroy({ where: { userId }, transaction: t })
      return { status: statusCodeConstants.SUCCESS, message: 'user logout successfully' }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method used for forgot password
   * @param {*} userData
   * @param {number} userData.loginId
   * @returns {object}
   */
  async forgotPassword(userData, conn, t) {
    try {
      const { loginId, dob, lastName } = userData

      let whereClauseQuery = {}

      whereClauseQuery = {
        [Op.or]: [
          { email: loginId },
          { loginid: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('loginid')), '=', loginId.toLowerCase()) }
        ]
      }

      if (dob) {
        whereClauseQuery.dob = moment(dob).format('YYYY-MM-DD')
      }

      if (lastName) {
        whereClauseQuery.lastName = conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('last_name')), '=', lastName.toLowerCase())
      }

      const user = await conn.User.findOne({ where: whereClauseQuery })
      if (!user) {
        const message = isValidEmail(loginId) ? 'Oops, looks like the Email ID that you entered is not registered with us. Can you check and retry. If the issue is still persisting, reach out to your Admin.' : 'Oops, Details entered seems to be incorrect, For more assistance please contact admin'
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message
        }
      }

      if (user.status === defaultStatus.IN_ACTIVE) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'You account is In-active, please contact admin'
        }
      }

      if (user.status === defaultStatus.PENDING) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'You account is not approved yet. Please contact admin'
        }
      }

      if (user && !user.email) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'There are no email details associated with the provided user.'
        }
      }
      const hashPassword = generatePassword.generate({ length: defaultCode.PASSWORD_LENGTH, numbers: true })
      const oneTimePassword = this.cryptoHelper.hashPassword(hashPassword)
      const forgotPasswordToken = this.cryptoHelper.createHmac(user)
      const data = {
        userId: user.userId,
        inviteToken: forgotPasswordToken,
        updatedBy: user.userId,
        loginPassword: oneTimePassword,
        status: defaultStatus.TEMPORARY
      }
      const response = await conn.User.update(data, { where: whereClauseQuery, transaction: t })
      if (response) {
        logger.debug('Successfully reset the password')
        logger.debug('Sending Email')

        const Emaildata = {
          userId: user.userId,
          firstName: user.firstName,
          email: user.email,
          hashPassword,
          forgotPasswordToken,
          aisoDomainURL: domainURL
        }
        // SEND CREATED OTP
        em.emit('SEND_FORGOT_PASSWORD', Emaildata)
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Forgot password Successfully '
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /**
   * Method used for reset Password
   * @param {object} userData
   * @param {string || email} userData.email
   * @param {string} userData.oldPassword
   * @param {string} userData.password
   * @param {string} userData.confirmPassword
   * @param {boolean} userData.forceChangePwd
   * @returns {object}
   */
  async resetPassword(userData, conn, t) {
    try {
      const { email, oldPassword, password, confirmPassword, forceChangePwd } = userData

      const user = await conn.User.findOne({ where: { email } })
      if (!user) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Oops, looks like the Email ID/User ID that you entered is not registered with us. Can you check and retry. If the issue is still persisting, reach out to your Admin.'
        }
      }

      const validPassword = this.cryptoHelper.verifyHash(oldPassword, user.loginPassword)

      if (!validPassword) {
        await this.updateFailAttempts(user, conn, t)
        return {
          commit: true,
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `Oops, ${forceChangePwd ? 'temporary password' : 'current password'}  provided is incorrect or inactive. Kindly click forget password again`
        }
      }

      if (password !== confirmPassword) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Provided password doesn\'t match'
        }
      }
      if (oldPassword === confirmPassword) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'New password can not be same as old password'
        }
      }

      // if (user && user.loginPassword === null) {
      //   return {
      //     status: statusCodeConstants.VALIDATION_ERROR,
      //     message: 'Your temporary password has been expired'
      //   }
      // }

      const lastPwdTxn = await conn.PwdHistory.findAll({
        where: {
          userId: user.userId
        },
        order: [['histId', 'DESC']],
        limit: defaultCode.PASSWORD_TXN_LIMIT
      })

      const hashPassword = this.cryptoHelper.hashPassword(password)
      if (lastPwdTxn) {
        for (const p of lastPwdTxn) {
          if (this.cryptoHelper.verifyHash(password, p.oldPassword)) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'Oops, Provided password is one among your last 3 passwords, request to create a new password'
            }
          }
        }
      }

      const data = {
        updatedBy: user.userId,
        loginPassword: hashPassword,
        inviteToken: null,
        status: defaultStatus.ACTIVE
      }
      await conn.User.update(data, { where: { email }, transaction: t })

      const passwordHistory = {
        histInsertedDate: new Date(),
        userId: user.userId,
        oldPassword: hashPassword,
        pwdChangedBy: user.userId
      }
      await conn.PwdHistory.create(passwordHistory, { transaction: t })
      logger.info('Successfully set the reset password change')
      return { status: statusCodeConstants.SUCCESS, message: 'Successfully set the reset password change' }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /**
  * Method used for change Password
  * @param {object} userData
  * @param {string || email} userData.email
  * @param {string || mobileNo} userData.mobileNo
  * @param {string} userData.password
  * @param {string} userData.confirmPassword
  * @returns {object}
  */
  async changePassword(userData, conn, t) {
    try {
      const { email, mobileNo, password, confirmPassword, type } = userData
      let whereClause
      if (type === 'email') {
        whereClause = { email }
      } else {
        whereClause = { contactNo: mobileNo }
      }
      const user = await conn.User.findOne({ where: whereClause })
      if (!user) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Oops, looks like the Email ID/Mobile NO that you entered is not registered with us. Can you check and retry. If the issue is still persisting, reach out to your Admin.'
        }
      }
      if (password !== confirmPassword) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Provided password doesn\'t match'
        }
      }
      const lastPwdTxn = await conn.PwdHistory.findAll({
        where: {
          userId: user.userId
        },
        order: [['histId', 'DESC']],
        limit: defaultCode.PASSWORD_TXN_LIMIT
      })

      const hashPassword = this.cryptoHelper.hashPassword(password)
      if (lastPwdTxn) {
        for (const p of lastPwdTxn) {
          if (this.cryptoHelper.verifyHash(password, p.oldPassword)) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'Oops, Provided password is one among your last 3 passwords, request to create a new password'
            }
          }
        }
      }

      const data = {
        updatedBy: user.userId,
        loginPassword: hashPassword,
        inviteToken: null,
        status: defaultStatus.ACTIVE
      }
      await conn.User.update(data, { where: whereClause, transaction: t })

      const passwordHistory = {
        histInsertedDate: new Date(),
        userId: user.userId,
        oldPassword: hashPassword,
        pwdChangedBy: user.userId
      }
      await conn.PwdHistory.create(passwordHistory, { transaction: t })
      logger.info('Successfully set the reset password change')
      return { status: statusCodeConstants.SUCCESS, message: 'Successfully set the reset password change' }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method used for get user details based on invite token
   * @param {object} userData
   * @param {string} userData.inviteToken
   * @returns {object}
   */
  async getUserByToken(userData, conn) {
    try {
      const { inviteToken } = userData

      const user = await conn.User.findOne({
        where: {
          inviteToken
        }
      })
      if (!user) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Change Password link is expired'
        }
      }

      const response = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        loginId: user.loginid
      }
      return { status: statusCodeConstants.SUCCESS, message: 'Successfully fetched token details', data: response }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method used for update user session
   * @param {Object} userData
   * @returns
   */
  async updateUserSession(userData, sessionId, conn, t) {
    try {
      logger.debug('Updating the user session details')

      const role = await conn.Role.findOne({
        where: {
          roleId: userData.currRoleId
        }
      })
      if (!role) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Role not found in DB'
        }
      }

      let response = {}
      if (role.mappingPayload && role.mappingPayload.permissions && role.mappingPayload.permissions.length > 0) {
        const permissions = role.mappingPayload.permissions
        const data = {
          ...userData,
          updatedBy: userData.userId,
          permissions
        }
        response = await conn.UserSession.update(data, { where: { userId: userData.userId, sessionId }, transaction: t })
        response = {
          ...response,
          permissions
        }
      }
      return ({ status: statusCodeConstants.SUCCESS, message: 'User Session data updated successfully', data: response })
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method used for send OTP for customer for validating details in create user
   * @param {object} userData
   * @param {string} userData.type
   * @param {string} userData.source
   * @param {string} userData.reference
   * @param {string} userData.firstName
   * @param {number} userData.extn
   * @returns {object}
   */
  async sendOTP(userData, conn, t) {
    try {
      let { type, source, reference, firstName, extn, userGroup } = userData
      if (source === 'REGISTER') {
        if (type === 'mobile') {
          const isExist = await conn.User.findOne({
            where: { contactNo: reference, userGroup }
          })
          if (isExist) {
            return {
              status: statusCodeConstants.CONFLICT,
              message: 'Mobile Number already exists, request to Login'
            }
          }
        } else if (type === 'email') {
          const isExist = await conn.User.findOne({
            where: { email: reference }
          })
          if (isExist) {
            return {
              status: statusCodeConstants.CONFLICT,
              message: 'Email Already Registered, request to Login'
            }
          }
        }
      } else if (source === 'LOGIN') {
        // if (!parseInt(reference)) { // && !isValidEmail(reference)

        let whereClause
        if (type === 'email') {
          whereClause = {
            [Op.or]: [
              { loginid: reference },
              { email: reference }
            ]
          }
        } else {
          whereClause = {
            [Op.or]: [
              { loginid: reference },
              { contactNo: reference }
            ]
          }
        }
        const user = await conn.User.findOne({
          where: whereClause
          // {
          //   [Op.or]: [
          //     { loginid: reference },
          //     { email: reference },
          //     { contactNo: reference }
          //   ]
          // }
        })
        reference = type === 'email' ? user?.email : user?.contactNo
        firstName = user?.firstName
        // }
        if (!user) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: type === 'email' ? 'Email Not exists, request to Signup' : 'Mobile Number Not exists, request to Signup'
          }
        }
      }
      const response = await conn.Otp.findAll({
        where: { reference }
      })
      if (response) {
        await conn.Otp.update({ status: defaultStatus.IN_ACTIVE }, {
          where: { reference }, transaction: t
        })
      }
      const OTP = Math.floor(100000 + Math.random() * 900000)
      const newOTP = {
        otp: OTP,
        reference,
        status: defaultStatus.ACTIVE,
        createdBy: systemUserId
      }
      const responseNEW = await conn.Otp.create(newOTP, { transaction: t })
      if (responseNEW) {
        logger.debug('Sending Email')

        const data = {
          type,
          OTP,
          firstName,
          reference,
          DomainURL: domainURL,
          extn
        }
        // SEND CREATED OTP
        em.emit('SEND_OTP', data)
      }
      logger.debug('OTP created successfully')
      return { status: statusCodeConstants.SUCCESS, message: 'OTP created successfully' }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method used for validating OTP form customer for create user
   * @param {object} userData
   * @param {email || mobile} userData.reference
   * @param {number} userData.otp
   * @returns {object}
   */
  async validateOTP(userData, conn) {
    try {
      logger.debug('Into sending otp')
      const { reference, otp } = userData
      const response = await conn.Otp.findOne({
        where: {
          reference,
          otp,
          status: defaultStatus.ACTIVE
        }
      })
      if (!response) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Oops, Provided OTP is incorrect, provide the correct OTP or click resend OTP'
        }
      }

      let systemConfig
      await getSystemConfiguration(conn).then((e) => {
        if (e.status === 200) {
          systemConfig = e?.data
        }
      })

      // get System Configuration
      const otpExpirationDuration = systemConfig?.otpExpirationDuration?.email_sms

      const startTime = moment(response.createdAt)
      const endTime = moment()
      const minutes = endTime.diff(startTime, 'minutes')

      await conn.Otp.update({ status: defaultStatus.IN_ACTIVE }, {
        where: {
          reference
        }
      })

      if (minutes > otpExpirationDuration) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Oops, Your OTP has been expired'
        }
      }

      return { status: statusCodeConstants.SUCCESS, message: 'Successfully Validated OTP data' }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getAccessToken(userData, conn, t) {
    try {
      if (!userData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let systemConfig
      await getSystemConfiguration(conn).then((e) => {
        if (e.status === 200) {
          systemConfig = e?.data
        }
      })

      if (!systemConfig) {
        logger.debug('System Configuration are not available')
        return {
          status: statusCodeConstants.NOT_AUTHORIZED,
          message: 'System Configuration are not available'
        }
      }
      const getExistingRefreshToken = await conn.UserSession.findOne({
        where: {
          refreshToken: userData?.refreshToken,
          // accessToken: userData?.accessToken,
          status: defaultStatus.ACTIVE
        },
        order: [['sessionId', 'DESC']]
      })

      if (!getExistingRefreshToken) {
        return {
          status: statusCodeConstants.NOT_AUTHORIZED,
          message: 'Provided refresh token is not available in the system'
        }
      }

      // const checkSessionTokenExpiry = await checkSessionExpiry(userData?.accessToken)
      // if (checkSessionTokenExpiry.status === 'NOT-EXPIRED') {
      //   return {
      //     status: statusCodeConstants.VALIDATION_ERROR,
      //     message: 'your access token is not expired. please try to use same access token'
      //   }
      // }

      // need to check refresh token expiry
      const checkRefreshTokenExpiry = await checkSessionExpiry(userData?.refreshToken)
      if (checkRefreshTokenExpiry.status === 'EXPIRED') {
        await conn.UserSession.update({ status: defaultStatus.IN_ACTIVE }, {
          where: {
            refreshToken: userData?.refreshToken,
            status: defaultStatus.ACTIVE
          },
          transaction: t
        })

        return {
          status: statusCodeConstants.NOT_AUTHORIZED,
          message: 'Refresh token is expired. please try to login',
          commit: true
        }
      }

      let sessionTimeOut
      if (systemConfig?.dataValues?.maxSessionTimeout && systemConfig?.dataValues?.maxSessionTimeout?.type === 'MIN') {
        sessionTimeOut = systemConfig?.dataValues?.maxSessionTimeout?.value * 60000
      } else if (systemConfig?.dataValues?.maxSessionTimeout && systemConfig?.dataValues?.maxSessionTimeout?.type === 'SEC') {
        sessionTimeOut = systemConfig?.dataValues?.maxSessionTimeout?.value * 1000
      }

      if (!sessionTimeOut) {
        return {
          status: statusCodeConstants?.VALIDATION_ERROR,
          message: defaultMessage?.MANDATORY_FIELDS_MISSING
        }
      }

      // generate new access token
      const rawData = {
        userId: getExistingRefreshToken.userId,
        sessionId: getExistingRefreshToken.sessionId
      }
      const accessToken = this.cryptoHelper.createAccessToken(rawData, sessionTimeOut)
      const tokenExpiresAt = (moment().add(this.cryptoHelper.millisToMinutes(sessionTimeOut), 'minutes')).valueOf()

      await conn.UserSession.update({ accessToken }, { where: { sessionId: getExistingRefreshToken.sessionId }, transaction: t })

      const response = {
        accessToken,
        refreshToken: userData?.refreshToken,
        expireAt: tokenExpiresAt
      }
      return {
        status: statusCodeConstants?.SUCCESS,
        message: 'successfully got refresh token',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
}

module.exports = AuthenticationService

const generateUserId = async (emailId, conn) => {
  const e = emailId.split('@')[0]
  const userData = await conn.User.findAndCountAll({
    where: {
      loginid: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('loginid')), 'LIKE', e.toLowerCase() + '%')
    }
  })
  let userCount = userData.count + 1
  userCount = userCount < 100 ? '00' + userCount.toString().substr('00' + userCount.toString().length - 2) : userCount
  const userId = e.toLowerCase() + `_${userCount}`
  return userId
}

const checkSessionExpiry = async (accessToken) => {
  const cryptoHelper = new CryptoHelper()
  try {
    let decodedToken
    try {
      decodedToken = cryptoHelper.verifyJWT(accessToken)
    } catch (error) {
      logger.error(error)
      return {
        status: 'EXPIRED',
        message: 'JWT Token signature error'
      }
    }

    const decryptedToken = cryptoHelper.decrypt(decodedToken)
    if (decryptedToken) {
      const date = new Date()
      const expireTime = new Date(decryptedToken.expiresIn)
      const currentTime = new Date(date.getTime())
      // const fiveMinutesAgo = new Date(expireTime.getTime() - 5000 * 60)
      if ((isAfter(expireTime, currentTime))) {
        return {
          status: 'NOT-EXPIRED',
          message: 'Session token not expired'
        }
      }
    }
    return {
      status: 'EXPIRED',
      message: 'Session token expired'
    }
  } catch (error) {
    return {
      status: 'EXPIRED',
      message: 'Internal server error'
    }
  }
}

export const getSystemConfiguration = async (conn) => {
  try {
    const systemConfig = await conn.BcaeAppConfig.findOne({
      where: {
        status: defaultStatus.ACTIVE
      },
      order: [['configId', 'DESC']]
    })
    if (!systemConfig) {
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'No system configuration is available'
      }
    }

    return {
      status: statusCodeConstants.SUCCESS,
      message: 'System configuration fetched successfully',
      data: systemConfig
    }
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR,
      message: 'Internal server error'
    }
  }
}
