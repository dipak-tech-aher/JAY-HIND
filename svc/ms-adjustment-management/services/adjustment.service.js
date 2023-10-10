import { config } from '@config/env.config'
import em from '@emitters'
import { BusinessUnit, Otp, Role, sequelize, User, UserSession } from '@models'
import userResources from '@resources'
import { CryptoHelper, defaultStatusCode, logger, defaultStatus, defaultCode } from '@utils'
import { get, isEmpty, map } from 'lodash'
import { Op } from 'sequelize'

// import required dependency
const generatePassword = require('generate-password')

const { systemUserId, chatCount, chatRoleId, userLoginAttempts, DomainURL } = config
let instance

class UserService {
  constructor () {
    if (!instance) {
      instance = this
    }
    this.cryptoHelper = new CryptoHelper()
    return instance
  }

  async createUser (user) {
    logger.info('Creating User')
    const t = await sequelize.transaction()
    try {
      let status = defaultStatusCode.ERROR
      let message = 'Error while creating user'
      let data = {}

      const userInfo = await User.findOne({ where: { email: user.email } })
      if (userInfo) {
        return new Error('Email already exist in the System', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }
      const inviteToken = this.cryptoHelper.createHmac(user)
      const password = generatePassword.generate({ length: defaultCode.PASSWORD_LENGTH, numbers: true })
      user = {
        ...user,
        loginPassword: password,
        status: user.status === true ? defaultStatus.TEMP : defaultStatus.IN_ACTIVE,
        biAccess: user.biAccess === true ? defaultCode.YES : defaultCode.NO,
        whatsappAccess: user.whatsappAccess === true ? defaultCode.YES : defaultCode.NO,
        inviteToken,
        createdBy: systemUserId,
        updatedBy: systemUserId
      }

      const createdUser = await User.create(user, { transaction: t })

      if (createdUser) {
        logger.debug('Successfully creates new user')
        logger.debug('Sending Email')

        user.userId = createdUser.userId

        // SEND INVITE EMAIL ON USER_CREATED
        em.emit('USER_CREATED', user)

        status = defaultStatusCode.SUCCESS
        message = 'Successfully created new user'
        data = userResources.transform(createdUser)
      }

      await t.commit()
      return ({ status, message, data })
    } catch (error) {
      logger.error('Error while creating user', error)
      return new Error('Error while creating user', { cause: { code: defaultStatusCode.ERROR } })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async registerUser (user) {
    const t = await sequelize.transaction()
    try {
      const status = defaultStatusCode.ERROR
      const message = 'Error while register user'
      const data = {}
      const userInfo = await User.findOne({ where: { email: user.email } })
      if (userInfo) {
        logger.debug('Email already exist in the System')
        return new Error('Email already exist in the System', { cause: { code: defaultStatusCode.CONFLICT } })
      }
      const inviteToken = this.cryptoHelper.createHmac(user)
      const password = generatePassword.generate({ length: defaultCode.PASSWORD_LENGTH, numbers: true })
      user = {
        ...user,
        loginPassword: password,
        status: defaultStatus.PENDING,
        inviteToken,
        createdBy: systemUserId,
        updatedBy: systemUserId
      }
      await User.create(user, { transaction: t })
      await t.commit()
      logger.debug('Successfully Register new user')
      return ({ status, message, data })
    } catch (error) {
      logger.error('Error while creating user', error)
      return new Error('Error while creating user', { cause: { code: defaultStatusCode.ERROR } })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  /** Method used for login
   * @param {object} userData
   * @param {any} userData.loginId
   * @param {password} userData.password
   * @returns {object}
   */
  async login (userData) {
    logger.info('Attempt to login User')
    const t = await sequelize.transaction()
    try {
      const { loginId, password } = userData
      let whereClauseQuery
      if (Number(loginId)) {
        whereClauseQuery = {
          [Op.or]: [
            { contactNo: loginId },
            { userId: loginId }
          ]
        }
      } else {
        whereClauseQuery = {
          [Op.or]: [
            { email: loginId },
            { loginid: loginId.toLowerCase() },
            { loginid: loginId.toUpperCase() }
          ]
        }
      }
      const user = await User.findOne({
        where: whereClauseQuery
      })
      if (!user) {
        logger.info('Please enter valid Email Id/ User Id')
        return new Error('Please enter valid Email Id/ User Id', { cause: { code: defaultStatusCode.notFound } })
      }
      if (user.status === defaultStatus.IN_ACTIVE) {
        logger.info('You account is In-active, please contact admin')
        return new Error('You account is In-active, please contact admin', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }
      if (user.expiryDate) {
        if (new Date(user.expiryDate) < new Date()) {
          logger.info('You account is Expired, please contact admin')
          return new Error('You account is Expired, please contact admin', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
        }
      }
      if (user.mappingPayload === null) {
        logger.info('No roles assigned, please contact admin')
        return new Error('No roles assigned, please contact admin', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      } else if (user.status === defaultStatus.TEMP) {
        if (password !== user.loginPassword) {
          await this.updateFailAttempts(user, t)
          logger.info('Incorrect password.Please check')
          return new Error('Incorrect password.Please check', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
        }
        const data = {
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          email: user.email,
          inviteToken: user.inviteToken
        }
        logger.info('Please reset your password')
        return ({ status: defaultStatusCode.SUCCESS, message: 'Please reset your password', data })
      } else if (user.status === defaultStatus.PENDING) {
        logger.info('You account is yet to activate by Admin, Thanks')
        return new Error('You account is yet to activate by Admin, Thanks!', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }
      const validPassword = this.cryptoHelper.verifyHash(password, user.loginPassword)
      if (!validPassword) {
        await this.updateFailAttempts(user, t)
        logger.info('Incorrect password.Please check')
        return new Error('Incorrect password.Please check', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }
      if (user.multipleSession === defaultCode.NO) {
        const userSessionInfo = await UserSession.findOne({ attributes: ['userId'], where: { userId: user.userId } })
        if (userSessionInfo) {
          const data = { userId: user.userId, anotherSession: true }
          logger.debug('your account has logged in another device will you continue to login here')
          return ({ status: defaultStatusCode.SUCCESS, message: 'your account has logged in another device will you continue to login here ?', data })
        }
      }
      logger.debug('Getting user department and role mapping')
      let currRole; let currDept; let permissions
      let currRoleId; let currDeptId; let currRoleDesc; let currDeptDesc
      if (user.mappingPayload && user.mappingPayload.userDeptRoleMapping) {
        currRoleId = user.mappingPayload.userDeptRoleMapping[0].roleId[0]
        currDeptId = user.mappingPayload.userDeptRoleMapping[0].unitId
        const roleInfo = await Role.findOne({ where: { roleId: currRoleId } })
        if (roleInfo) {
          permissions = roleInfo.mappingPayload.permissions
          currRole = roleInfo.roleName
          currRoleDesc = roleInfo.roleDesc
        }
        const org = await BusinessUnit.findOne({ where: { unitId: currDeptId } })
        if (org) {
          currDept = org.unitName
          currDeptDesc = org.unitDesc
        }
      }
      const sessionData = {
        userId: user.userId,
        payload: user,
        createdBy: user.userId,
        updatedBy: user.userId,
        permissions,
        currRole,
        currRoleId,
        currDept,
        currDeptId,
        location: user.location
      }
      logger.debug('Creating user session data')
      const session = await UserSession.create(sessionData, { transaction: t })
      const rawData = {
        userId: user.userId,
        sessionId: session.sessionId
      }
      const accessToken = this.cryptoHelper.createAccessToken(rawData)
      console.log('accessToken', accessToken)
      await session.update({ accessToken }, { where: { sessionId: session.sessionId }, transaction: t })

      const response = {
        accessToken,
        user,
        currRole,
        currDept,
        currDeptId,
        currRoleId,
        currDeptDesc,
        currRoleDesc,
        permissions,
        chatCount,
        chatRoleId
      }
      if (user.loginAttempts > 0) {
        logger.debug('user login Attempts reset')
        await this.resetFailAttempts(loginId, user.userId, t)
      }

      await t.commit()
      logger.info('user authenticated successfully')
      return ({ status: defaultStatusCode.SUCCESS, message: 'user authenticated successfully', data: response })
    } catch (error) {
      logger.error('Error while creating user', error)
      return new Error('Error while creating user', { cause: { code: defaultStatusCode.ERROR } })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
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
  async updateFailAttempts (user, t) {
    try {
      logger.debug('update login failed attempts')
      const data = {
        loginAttempts: user.loginAttempts === undefined ? 1 : user.loginAttempts + 1,
        updatedBy: user.userId
      }
      if (data.loginAttempts >= userLoginAttempts) {
        data.status = defaultStatus.IN_ACTIVE
      }
      await User.update(data, { where: { email: user.email }, transaction: t })
      await t.commit()
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
  async resetFailAttempts (email, userId, t) {
    try {
      logger.debug('Reset login failed attempts')
      const data = {
        loginAttempts: 0,
        updatedBy: userId
      }
      await User.update(data, { where: { email }, transaction: t })
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
  async logout (user) {
    const t = await sequelize.transaction()
    try {
      const { id } = user
      logger.debug('Logout user')
      await UserSession.destroy({ where: { userId: id }, transaction: t })
      await t.commit()
      logger.debug('user logout successfully')
      return ({ status: defaultStatusCode.SUCCESS, message: 'user logout successfully' })
    } catch (error) {
      logger.error('Error while logout', error)
      return new Error('Error while logout', { cause: { code: defaultStatusCode.ERROR } })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  /** Method used for verifying the user's email list
   * @param {Array} user
   * @param {string} user.email
   * @returns {object} Checked user list
   */
  async verifyUsers (user) {
    try {
      const emails = map(user.list, 'email')
      const response = []
      logger.info('Finding users in db')
      if (!isEmpty(emails)) {
        const users = await User.findAll({
          attributes: ['email'],
          where: { email: emails }
        })
        if (!isEmpty(users)) {
          for (const i of emails) {
            let found = false
            for (const j of users) {
              if (i === j.email) {
                response.push({
                  email: i,
                  validationStatus: defaultStatus.FAILED,
                  validationRemark: 'User Already Exists'
                })
                found = true
              }
            }
            if (found === false) {
              response.push({
                email: i,
                validationStatus: defaultStatus.SUCCESS
              })
            }
          }
        }
      }
      logger.debug('Users fetched successfully')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Users Verified successfully', data: response })
    } catch (error) {
      logger.error('Error while Verifing users', error)
      return new Error('Error while Verifing users', { cause: { code: defaultStatusCode.ERROR } })
    }
  }

  /** Method for validating user email
   * @param {Array} userData
   * @param {string} userData [email]
   * @returns {object}
   */
  async verifyEmails (userData) {
    try {
      const roles = map(userData.list, 'roleDescription')
      const units = map(userData.list, 'departmentDescription')
      const response = []
      const emails = map(userData.list, 'email')
      logger.info('Finding users in db')
      if (!isEmpty(emails) && !isEmpty(roles)) {
        let users = await User.findAll({
          attributes: ['email', 'mappingPayload'],
          where: { email: emails }
        })
        const userResponse = users
        users = map(users, 'email')

        let rolesResp = await Role.findAll({
          attributes: ['roleDesc', 'roleId'],
          where: { roleDesc: roles }
        })
        const roleResponse = rolesResp
        rolesResp = map(rolesResp, 'roleDesc')

        let deptResp = await BusinessUnit.findAll({
          attributes: ['unitDesc', 'mappingPayload', 'unitId'],
          where: { unitDesc: units }
        })
        const deptResponse = deptResp
        deptResp = map(deptResp, 'unitDesc')
        for (const i of userData.list) {
          if (users.includes(i.email)) {
            const user = userResponse.find((u) => u.email === i.email)
            if (deptResp.includes(i.departmentDescription)) {
              const dept = deptResponse.find((e) => e.unitDesc === i.departmentDescription)
              if (rolesResp.includes(i.roleDescription)) {
                const role = roleResponse.find((e) => e.roleDesc === i.roleDescription)
                if (dept?.mappingPayload.unitroleMapping && dept?.mappingPayload.unitroleMapping.includes(role.roleId)) {
                  const obj = user?.mappingPayload?.userDeptRoleMapping.find((g) => g.unitId === dept.unitId)

                  if (!obj || !obj.roleId.includes(role.roleId)) {
                    response.push({
                      email: i.email,
                      validationStatus: defaultStatus.SUCCESS

                    })
                  } else {
                    response.push({
                      email: i.email,
                      validationStatus: defaultStatus.FAILED,
                      validationRemark: 'User Role Mapping Already Exists'
                    })
                  }
                } else {
                  response.push({
                    email: i.email,
                    validationStatus: defaultStatus.FAILED,
                    validationRemark: 'Role Does Not Exists Under Selected Department'
                  })
                }
              } else {
                response.push({
                  email: i.email,
                  validationStatus: defaultStatus.FAILED,
                  validationRemark: 'Role Does Not Exists'
                })
              }
            } else {
              response.push({
                email: i.email,
                validationStatus: defaultStatus.FAILED,
                validationRemark: 'Department Does Not Exists'
              })
            }
          } else {
            response.push({
              email: i.email,
              validationStatus: defaultStatus.FAILED,
              validationRemark: 'User Does Not Exists'
            })
          }
        }
      }

      logger.info('Users updated successfully')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Users updated successfully', data: response })
    } catch (error) {
      logger.error('Error while Verifing users', error)
      return new Error('Error while Verifing users', { cause: { code: defaultStatusCode.ERROR } })
    }
  }

  /** Method used for approving new users
   * @param {object} user
   * @returns
   */
  async approveNewUser (user) {
    const t = await sequelize.transaction()
    try {
      const userInfo = await User.findOne({ where: { userId: user.userId } })
      if (!userInfo) {
        logger.info('User Details not available')
        return new Error('User Details not available', { cause: { code: defaultStatusCode.notFound } })
      }
      const data = {
        activationDate: user.activationDate === '' ? null : get(user, 'activationDate', null),
        expiryDate: user.expiryDate === '' ? null : get(user, 'expiryDate', null),
        adminRemark: user.adminRemark,
        updatedBy: user.userId,
        status: (user.status === defaultStatus.ACTIVE || user.status === defaultStatus.PENDING) ? defaultStatus.TEMP : defaultStatus.IN_ACTIVE,
        mappingPayload: user.mappingPayload === null ? null : user.mappingPayload
      }
      const response = await User.update(data, { where: { userId: user.userId }, transaction: t })
      if (response && data.status === defaultStatus.IN_ACTIVE) {
        await t.commit()
        return ({ status: defaultStatusCode.SUCCESS, message: 'Successfully deactivated new user' })
      }

      logger.info('Successfully approved new user')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Successfully approved new user', data: response })
    } catch (error) {
      logger.error('Error while approve New users', error)
      return new Error('Error while approve New users', { cause: { code: defaultStatusCode.ERROR } })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  /** Method used for updating user details
   * @param {number} id
   * @param {object} user
   * @returns {object}
   */
  async updateUser (id, user) {
    const t = await sequelize.transaction()
    try {
      const userInfo = await User.findOne({ where: { userId: id } })
      if (!userInfo) {
        logger.info('User Details not available')
        return new Error('User Details not available', { cause: { code: defaultStatusCode.notFound } })
      }

      user.updatedBy = id
      // user.loginPassword = userInfo.loginPassword
      user.biAccess = user.biAccess === true ? defaultCode.YES : defaultCode.NO
      user.whatsappAccess = user.whatsappAccess === true ? defaultCode.YES : defaultCode.NO
      user.email = userInfo.email
      user.profilePicture = user.image || null
      await User.update(user, { where: { userId: id }, transaction: t })
      await t.commit()

      logger.info('Successfully updated user details')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Successfully updated user details' })
    } catch (error) {
      logger.error('Error while Updating users', error)
      return new Error('Error while Updating users', { cause: { code: defaultStatusCode.ERROR } })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  /** Obtaining a user based on their UserId
   * @param {Object} userData
   * @param {number} userData.id
   * @returns
   */
  async getUser (userData) {
    try {
      logger.info('Fetching user details by id')
      const { userId } = userData

      const user = await User.findOne({
        where: { userId }
      })

      if (!user) {
        logger.info('User Details not available')
        return new Error('User Details not available', { cause: { code: defaultStatusCode.notFound } })
      }

      logger.debug('Successfully fetched user details')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Successfully fetched user details' })
    } catch (error) {
      logger.error('Error while fetching user details', error)
      return new Error('Error while fetching user details', { cause: { code: defaultStatusCode.ERROR } })
    }
  }

  async getUserList (userData) {
    try {
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE, source } = userData
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      const whereClause = {}
      if (source === defaultCode.NEW) {
        whereClause.status = defaultStatus.PENDING
      }
      if (userData.filters && Array.isArray(userData.filters) && !isEmpty(userData.filters)) {
        for (const record of userData.filters) {
          if (record.value) {
            if (record.id === 'userId') {
              whereClause.userId = {
                [Op.and]: [sequelize.where(sequelize.cast(sequelize.col('User.user_id'), 'varchar'), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toString()}%`
                })]
              }
            } else if (record.id === 'firstName') {
              whereClause.firstName = {
                [Op.and]: [sequelize.where(sequelize.col('User.first_name'), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'lastName') {
              whereClause.lastName = {
                [Op.and]: [sequelize.where(sequelize.col('User.last_name'), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'email') {
              whereClause.email = {
                [Op.and]: [sequelize.where(sequelize.col('User.email'), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'contactNo') {
              whereClause.contactNo = {
                [Op.and]: [sequelize.where(sequelize.cast(sequelize.col('User.contact_no'), 'varchar'), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toString()}%`
                })]
              }
            } else if (record.id === 'userType') {
              whereClause.userType = {
                [Op.and]: [sequelize.where(sequelize.fn('UPPER', sequelize.col('User.user_type')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            }
          }
        }
      }

      const user = await User.findAndCountAll({
        where: whereClause,
        distinct: true,
        order: [
          ['firstName', 'ASC']
        ],
        ...params
      })

      if (!user) {
        logger.info('User Details not available')
        return new Error('User Details not available', { cause: { code: defaultStatusCode.notFound } })
      }
      logger.debug('Successfully fetched user list')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Successfully fetched user list', data: user })
    } catch (error) {
      logger.error('Error while fetching user details', error)
      return new Error('Error while fetching user details', { cause: { code: defaultStatusCode.ERROR } })
    }
  }

  async forgotPassword (userData) {
    const t = await sequelize.transaction()
    try {
      const { loginId } = userData

      let whereClauseQuery
      if (Number(loginId)) {
        whereClauseQuery = {
          [Op.or]: [
            { contactNo: loginId },
            { userId: loginId }
          ]
        }
      } else {
        whereClauseQuery = {
          [Op.or]: [
            { email: loginId },
            { loginid: loginId.toLowerCase() }
          ]
        }
      }
      const user = await User.findOne({ where: whereClauseQuery })
      if (!user) {
        logger.info('User Details not available')
        return new Error('User Details not available', { cause: { code: defaultStatusCode.notFound } })
      }
      const hashPassword = generatePassword.generate({ length: defaultCode.PASSWORD_LENGTH, numbers: true })
      // const oneTimePassword = this.cryptoHelper.hashPassword(hashPassword)
      const forgotPasswordToken = this.cryptoHelper.createHmac(user)
      const data = {
        userId: user.userId,
        inviteToken: forgotPasswordToken,
        updatedBy: user.userId,
        loginPassword: hashPassword,
        status: defaultStatus.TEMP
      }
      const response = await User.update(data, { where: whereClauseQuery, transaction: t })
      if (response) {
        logger.debug('Successfully reset the password')
        logger.debug('Sending Email')

        const data = {
          user,
          hashPassword,
          forgotPasswordToken,
          aisoDomainURL: DomainURL
        }
        // SEND CREATED OTP
        em.emit('SEND_FORGOT_PASSWORD', data)
      }
      await t.commit()
      logger.debug('Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Check your email for a link to reset your password. If it doesn’t appear within a few minutes' })
    } catch (error) {
      logger.error('Error while changing password', error)
      return new Error('Error while changing password', { cause: { code: defaultStatusCode.ERROR } })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async resetPassword (userData) {
    const t = await sequelize.transaction()
    try {
      const { email, oldPassword, password, confirmPassword, forceChangePwd } = userData
      if (password !== confirmPassword) {
        logger.info('Passwords do not match')
        return new Error('Passwords do not match', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }
      if (oldPassword === confirmPassword) {
        logger.info('New password can not be same as old password')
        return new Error('New password can not be same as old password', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }
      const user = await User.findOne({ where: { email } })
      if (!user) {
        logger.info('Please enter valid Email Id/ User Id')
        return new Error('Please enter valid Email Id/ User Id', { cause: { code: defaultStatusCode.notFound } })
      }
      if (user && user.loginPassword === null) {
        logger.info('Your temporary password has been expired')
        return new Error('Your temporary password has been expired', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }
      let validPassword
      if (forceChangePwd) {
        validPassword = oldPassword === user.loginPassword
      } else {
        validPassword = this.cryptoHelper.verifyHash(oldPassword, user.loginPassword)
      }
      if (!validPassword) {
        await this.updateFailAttempts(user, t)
        logger.info('Temporary password does not match')
        return new Error('Temporary password does not match', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }
      const hashPassword = this.cryptoHelper.hashPassword(password)
      const data = {
        updatedBy: user.userId,
        loginPassword: hashPassword,
        inviteToken: null,
        status: defaultStatus.ACTIVE
      }
      await User.update(data, { where: { email }, transaction: t })
      await t.commit()
      logger.info('Successfully set the reset password change')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Successfully set the reset password change' })
    } catch (error) {
      logger.error('Error while resetPassword password', error)
      return new Error('Error while resetPassword password', { cause: { code: defaultStatusCode.ERROR } })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateUserSession (id, userData) {
    const t = await sequelize.transaction()
    try {
      logger.debug('Updating the user session details')

      const role = await Role.findOne({
        where: {
          roleId: userData.currRoleId
        }
      })
      if (!role) {
        logger.debug('Role not found in DB')
        return new Error('Role not found in DB', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }

      let response = {}
      if (role.mappingPayload && role.mappingPayload.permissions && role.mappingPayload.permissions.length > 0) {
        const permissions = role.mappingPayload.permissions
        const data = {
          ...userData,
          updatedBy: id,
          permissions
        }
        response = await UserSession.update(data, { where: { userId: id }, transaction: t })
        response = {
          ...response,
          permissions
        }
      }
      await t.commit()
      logger.debug('User Session data updated successfully')
      return ({ status: defaultStatusCode.SUCCESS, message: 'User Session data updated successfully', data: response })
    } catch (error) {
      logger.error('Error while resetPassword password', error)
      return new Error('Error while resetPassword password', { cause: { code: defaultStatusCode.ERROR } })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getUserByToken (inviteToken) {
    try {
      logger.debug('Get user by token')
      const user = await User.findOne({
        where: {
          inviteToken
        }
      })
      if (!user) {
        logger.info('Change Password link is expired')
        return new Error('Change Password link is expired', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }
      const response = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender
      }
      logger.debug('Successfully fetched user detail by invite token')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Successfully fetched token details', response })
    } catch (error) {
      logger.error('Error while fetching user by invite token', error)
      return new Error('Error while fetching user by invite token', { cause: { code: defaultStatusCode.ERROR } })
    }
  }

  async getUserDepartmentAndRoles (id) {
    try {
      logger.info('Getting user departments and roles list  by user id')
      const user = await User.findOne({
        attributes: ['userId', 'mappingPayload'],
        where: { userId: id, status: defaultStatus.ACTIVE }
      })

      if (!user) {
        logger.error('User details not found')
        return new Error('User details not found', { cause: { code: defaultStatusCode.NOT_FOUND } })
      }
      const response = []
      if (user.mappingPayload && Array.isArray(user.mappingPayload.userDeptRoleMapping)) {
        for (const role of user.mappingPayload.userDeptRoleMapping) {
          const roles = await Role.findAll({
            attributes: ['roleId', 'roleName', 'roleDesc'],
            where: {
              roleId: role.roleId,
              status: defaultStatus.ACTIVE
            }
          })
          const department = await BusinessUnit.findOne({
            attributes: ['unitId', 'unitName', 'unitDesc', 'unitType'],
            where: {
              unitId: role.unitId,
              status: defaultStatus.ACTIVE
            }
          })
          if (department) {
            const unitId = department.unitId
            const unitName = department.unitName
            const unitType = department.unitType
            const unitDesc = department.unitDesc
            response.push({ unitId, unitName, unitType, unitDesc, roles })
          }
        }
      }
      logger.info('Successfully fetched user departments and roles list')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Successfully fetched user departments and roles list', data: response })
    } catch (error) {
      logger.error('Error while fetched user departments and roles list', error)
      return new Error('Error while fetched user departments and roles list', { cause: { code: defaultStatusCode.ERROR } })
    }
  }

  async sendOTP (userData) {
    const t = await sequelize.transaction()
    try {
      logger.debug('Into sending otp')
      const { type, source, reference, firstName, extn } = userData
      if (type === 'mobile' && source === 'REGISTER') {
        const isExist = await User.findOne({
          where: { contactNo: reference }
        })
        if (isExist) {
          logger.debug('Mobile number already exist in the System')
          return new Error('Mobile number already exist in the System', { cause: { code: defaultStatusCode.CONFLICT } })
        }
      } else if (type === 'email' && source === 'REGISTER') {
        const isExist = await User.findOne({
          where: { email: reference }
        })
        if (isExist) {
          logger.debug('Email already exist in the System')
          return new Error('Email already exist in the System', { cause: { code: defaultStatusCode.CONFLICT } })
        }
      }
      const response = await Otp.findAll({
        where: { reference }
      })
      if (response) {
        await Otp.update({ status: defaultStatus.IN_ACTIVE }, {
          where: { reference }
        })
      }
      const OTP = Math.floor(100000 + Math.random() * 900000)
      const newOTP = {
        otp: OTP,
        reference,
        status: defaultStatus.ACTIVE
      }
      const responseNEW = await Otp.create(newOTP, { transaction: t })
      if (responseNEW) {
        logger.debug('Successfully creates OTP')
        logger.debug('Sending Email')

        const data = {
          type,
          OTP,
          firstName,
          reference,
          DomainURL,
          extn
        }
        // SEND CREATED OTP
        em.emit('SEND_OTP', data)
      }
      await t.commit()
      logger.debug('otp created successfully')
      return ({ status: defaultStatusCode.SUCCESS, message: 'otp created successfully' })
    } catch (error) {
      logger.error('Error while creating otp', error)
      return new Error('Error while creating otp', { cause: { code: defaultStatusCode.ERROR } })
    }
  }

  async validateOTP (userData) {
    try {
      logger.debug('Into sending otp')
      const { reference, otp } = userData

      const response = await Otp.findOne({
        where: {
          reference,
          status: defaultStatus.ACTIVE
        }
      })
      if (response.otp !== otp) {
        logger.debug('Provied OTP is not matched')
        return new Error('Provied OTP is not matched', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
      }
      logger.debug('Successfully fetch otp data')
      return ({ status: defaultStatusCode.SUCCESS, message: 'Successfully Validated otp data' })
    } catch (error) {
      logger.error(error, 'Error while fetching otp data')
      return new Error('Error while fetched user departments and roles list', { cause: { code: defaultStatusCode.ERROR } })
    }
  }
}

module.exports = UserService
