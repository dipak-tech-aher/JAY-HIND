import { config } from '@config/env.config'
import em from '@emitters'
import userResources from '@resources'
import { camelCaseConversion, constantCode, CryptoHelper, defaultMessage, logger, statusCodeConstants } from '@utils'
import { get, isEmpty, map } from 'lodash'
import { Op, QueryTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

// import required dependency
const generatePassword = require('generate-password')
const { domainURL, bcae: bcaeConfig } = config
let instance

class UserService {
  constructor() {
    if (!instance) {
      instance = this
    }
    this.cryptoHelper = new CryptoHelper()
    return instance
  }

  /** Method used for Creating new User
   * @param {object} user
   * @param {string} user.title
   * @param {string} user.firstName
   * @param {string} user.lastName
   * @param {string} user.gender
   * @param { string || email}user.email
   * @param {date} user.dob
   * @param {string} user.userType
   * @param {string} user.notificationType
   * @param {string} user.country
   * @param {string} user.location
   * @param {number} user.extn
   * @param {number} user.contactNo
   * @param {boolean} user.whatsappAccess
   * @param {boolean} user.biAccess
   * @param {boolean} user.status
   * @param {date} user.activationDate
   * @param {object} user.mappingPayload
   * @param {transaction} t
   * @returns {object}
   */
  async createUser(authData, user, userId, roleId, departmentId, conn, t) {
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while creating user'
      let data = {}

      // Check Max user limit
      const getUserLimit = await checkMaxUserLimit(conn)
      if (getUserLimit?.status !== 200) {
        return {
          ...getUserLimit
        }
      }

      // check UserType limit
      const getUserTypeLimit = await checkUserTypeLimit(user, conn)
      if (getUserTypeLimit?.status !== 200 && getUserTypeLimit?.status !== 100) {
        return {
          ...getUserTypeLimit
        }
      }

      const userInfo = await conn.User.findOne({
        where: {
          email: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email')), '=', user.email.toLowerCase())
        }
      })

      if (userInfo) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Email already exist in the System'
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

      if (user.userGroup === 'UG_CONSUMER') {
        const checkCustomerEmail = await conn.Contact.findOne({
          include: [
            {
              model: conn.Customer,
              as: 'customerDetails',
              where: {
                status: ['CS_PEND', 'CS_ACTIVE', 'CS_PROSPECT']
              }
            }
          ],
          where: {
            emailId: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email_id')), '=', user.email.toLowerCase()),
            mobileNo: user.contactNo
          }
        })

        console.log('checkCustomerEmail==>', checkCustomerEmail)
        if (!checkCustomerEmail) {
          return {
            status: statusCodeConstants.CONFLICT,
            message: 'There is no relevant service matched to this email and contact number in the System.'
          }
        }
      }

      // if (user.userGroup === 'UG_BUSINESS' && ["UC_CONTRACT", "UC_FULLTIME"].includes(user.userCategory) && !user.userSkills?.length) {
      //   return {
      //     status: statusCodeConstants.ERROR,
      //     message: 'Please select skills.'
      //   }
      // }

      const commonAttrib = {
        tranId: uuidv4(),
        userUuid: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }

      const loginid = await generateUserId(user.email, conn)

      const inviteToken = this.cryptoHelper.createHmac(user)
      const password = generatePassword.generate({ length: constantCode.common.PASSWORD_LENGTH, numbers: true })
      const oneTimePassword = this.cryptoHelper.hashPassword(password)

      const userSkills = user.userSkills;
      delete user.userSkills;

      user = {
        ...user,
        loginid,
        loginPassword: oneTimePassword,
        inviteToken,
        ...commonAttrib
      }

      // console.log('user==>', user)
      const createdUser = await conn.User.create(user, { transaction: t })

      if (createdUser && user.userGroup === 'UG_BUSINESS' && ["UC_CONTRACT", "UC_FULLTIME"].includes(user.userCategory) && userSkills?.length) {

        await createCustomer(authData, user, conn, t);

        console.log(userSkills, "before map");
        const userSkillMappings = [];

        let skills = (await conn.SkillMst.findAll({ where: { skillId: userSkills } })).map((skill) => skill.get({ plain: true }));
        console.log(skills);

        userSkills.map(x => {
          let skill = skills.find(y => y.skillId == x);
          console.log(skill)
          userSkillMappings.push({
            userId: createdUser.userId,
            skillId: x,
            status: constantCode.status.ACTIVE,
            userSkillMapUuid: uuidv4(),
            userUuid: commonAttrib.userUuid,
            skillUuid: skill.skillUuid,
            createdDeptId: departmentId,
            createdRoleId: roleId,
            createdBy: userId,
            updatedBy: userId
          })
        })
        console.log(userSkillMappings, "after map")
        await conn.UserSkillMap.bulkCreate(userSkillMappings, { transaction: t });
      }

      /** commented by sibi - for register we need to send login details in email */
      //   if (createdUser && !user.userFamily.includes('UAM_WHATS')) {
      logger.debug('Sending Email')

      const notificationData =
      {
        userId: createdUser.userId,
        loginId: createdUser.loginid,
        firstName: user.firstName,
        domainURL,
        email: user.email,
        loginPassword: password,
        inviteToken,
        type: 'CREATE-USER',
        channel: 'WEB',
        notifiationSource: 'USER',
        createdBy: userId,
        ...commonAttrib
      }

      em.emit('USER_CREATED', notificationData, conn)

      status = statusCodeConstants.SUCCESS
      message = 'Successfully created new user'
      data = userResources.transform(createdUser)
      // } else
      if (createdUser && user.userFamily.includes('UAM_WHATS')) {
        logger.debug('Sending Whatsapp')

        const notificationData =
        {
          to: user.contactNo,
          type: 'CREATE-USER',
          channel: 'WHATSAPP',
          notifiationSource: 'USER',
          createdBy: userId,
          ...commonAttrib
        }

        em.emit('USER_CREATED_WHATAPP', notificationData, conn)

        status = statusCodeConstants.SUCCESS
        message = 'Successfully created new user'
        data = userResources.transform(createdUser)
      }
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getMyTeamMembers(userId, conn) {
    try {
      const myTeamMembers = await conn.User.findAll({
        attributes: ['userId', 'email', 'firstName', 'lastName'],
        where: { managerId: userId }
      })
      if (!myTeamMembers.length) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Team members not available'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Team members available',
        data: myTeamMembers
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getSkillsList(conn) {
    try {
      const skillsList = await conn.SkillMst.findAll({
        attributes: ['skillId', 'skillDesc'],
        where: { status: constantCode.status.ACTIVE }
      })
      if (!skillsList.length) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Skills list not available'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Skills list available',
        data: skillsList
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method used for approving new users
   * @param {object} user
   * @returns
   */
  async approveNewUser(user, userId, roleId, departmentId, conn, t) {
    try {
      // Check Max user limit
      const checkUserLimit = await checkMaxUserLimit(conn)
      if (checkUserLimit?.status !== 200) {
        return {
          ...checkUserLimit
        }
      }

      // check UserType limit
      const getUserTypeLimit = await checkUserTypeLimit(user, conn)
      if (getUserTypeLimit?.status !== 200 && getUserTypeLimit?.status !== 100) {
        return {
          ...getUserTypeLimit
        }
      }

      const userInfo = await conn.User.findOne({ where: { userId: user.userId } })
      if (!userInfo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'User Details not available'
        }
      }

      const inviteToken = this.cryptoHelper.createHmac(user)
      const password = generatePassword.generate({ length: constantCode.common.PASSWORD_LENGTH, numbers: true })
      const oneTimePassword = this.cryptoHelper.hashPassword(password)

      const data = {
        managerId: user.managerId,
        userGroup: user?.userGroup,
        userCategory: user?.userCategory,
        userFamily: user?.userFamily,
        userSource: user?.userSource,
        userType: user?.userType,
        notificationType: user?.notificationType,
        inviteToken,
        loginPassword: oneTimePassword,
        activationDate: user.activationDate === '' ? null : get(user, 'activationDate', null),
        expiryDate: user.expiryDate === '' ? null : get(user, 'expiryDate', null),
        adminRemark: user?.adminRemark || null,
        updatedBy: user.userId,
        status: constantCode.status.TEMPORARY, // user.status,
        mappingPayload: user.mappingPayload === null ? null : user?.mappingPayload
      }
      const response = await conn.User.update(data, { where: { userId: user.userId }, transaction: t })
      if (response && data.status === constantCode.status.IN_ACTIVE) {
        return { status: statusCodeConstants.SUCCESS, message: 'Successfully deactivated new user' }
      }

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }

      const notificationData =
      {
        userId: user.userId,
        firstName: user.firstName,
        domainURL,
        loginId: userInfo.loginid,
        email: user.email,
        loginPassword: password,
        inviteToken,
        type: 'CREATE-USER',
        channel: 'WEB',
        notifiationSource: 'USER',
        createdBy: userId,
        ...commonAttrib
      }

      console.log(notificationData)

      em.emit('USER_CREATED', notificationData, conn)

      return { status: statusCodeConstants.SUCCESS, message: 'Successfully approved new user', data: response }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** obtaining a switch user details based on userId
   * @param {object} userData
   * @param {number} userData.userId
   * @returns
   */
  async getUserDepartmentAndRoles(userData, conn) {
    try {
      const { userId } = userData
      const user = await conn.User.findOne({
        attributes: ['userId', 'mappingPayload'],
        where: { userId, status: constantCode.status.ACTIVE }
      })

      if (!user) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'User details not found'
        }
      }
      const response = []
      if (user.mappingPayload && Array.isArray(user.mappingPayload.userDeptRoleMapping)) {
        for (const role of user.mappingPayload.userDeptRoleMapping) {
          const roles = await conn.Role.findAll({
            attributes: ['roleId', 'roleName', 'roleDesc'],
            where: {
              roleId: role.roleId,
              status: constantCode.status.ACTIVE
            }
          })
          const department = await conn.BusinessUnit.findOne({
            attributes: ['unitId', 'unitName', 'unitDesc', 'unitType'],
            where: {
              unitId: role.unitId,
              status: constantCode.status.ACTIVE
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
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched user departments and roles list',
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

  /** Method used for updating user details
   * @param {number} id
   * @param {object} user
   * @param {object} params
   * @param {number} params.id
   * @returns {object}
   */
  async updateUser(user, userId, roleId, departmentId, params, conn, t) {
    try {
      const { id } = params
      const userInfo = await conn.User.findOne({ where: { userId: id } })
      if (!userInfo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'User Details not available'
        }
      }
      if (userInfo?.status && userInfo?.status !== constantCode.status.ACTIVE && user?.status && user?.status === constantCode.status.ACTIVE) {
        // Check Max user limit
        const checkUserLimit = await checkMaxUserLimit(conn)
        if (checkUserLimit?.status !== 200) {
          return {
            ...checkUserLimit
          }
        }
      }

      if (userInfo?.userType && user?.userType && userInfo?.userType !== user?.userType) {
        // check UserType limit
        const getUserTypeLimit = await checkUserTypeLimit(user, conn)
        if (getUserTypeLimit?.status !== 200 && getUserTypeLimit?.status !== 100) {
          return {
            ...getUserTypeLimit
          }
        }
      }

      if (userInfo.email.toLowerCase() !== user.email.toLowerCase()) {
        const userInfoEmail = await conn.User.findOne({
          where: {
            email: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email')), '=', user.email.toLowerCase())
          }
        })

        if (userInfoEmail) {
          return {
            status: statusCodeConstants.CONFLICT,
            message: 'Email already exist in the System'
          }
        }
      }
      if (userInfo.contactNo !== user.contactNo) {
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
      }
      if (user.userGroup === 'UG_CONSUMER') {
        const checkCustomerEmail = await conn.Contact.findOne({
          include: [
            {
              model: conn.Customer,
              as: 'customerDetails',
              where: {
                status: ['CS_PEND', 'CS_ACTIVE', 'CS_PROSPECT']
              }
            }
          ],
          where: {
            emailId: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email_id')), '=', user.email.toLowerCase()),
            mobileNo: user.contactNo
          }
        })

        console.log('checkCustomerEmail==>', checkCustomerEmail)
        if (!checkCustomerEmail) {
          return {
            status: statusCodeConstants.CONFLICT,
            message: 'There is no relevant service matched to this email and contact number in the System.'
          }
        }
      }

      // if (user.userGroup === 'UG_BUSINESS' && ["UC_CONTRACT", "UC_FULLTIME"].includes(user.userCategory) && !user.userSkills?.length) {
      //   return {
      //     status: statusCodeConstants.ERROR,
      //     message: 'Please select skills.'
      //   }
      // }

      const userSkills = user.userSkills;
      delete user.userSkills;

      user.updatedBy = userId
      user.email = userInfo.email
      await conn.User.update(user, { where: { userId: id }, transaction: t })

      if (user.userGroup === 'UG_BUSINESS' && ["UC_CONTRACT", "UC_FULLTIME"].includes(user.userCategory) && userSkills?.length) {
        console.log(userSkills, "before map");

        await conn.UserSkillMap.update({ status: constantCode.status.IN_ACTIVE }, { where: { userId: id } });

        const userSkillMappings = [];

        let skills = (await conn.SkillMst.findAll({ where: { skillId: userSkills } })).map((skill) => skill.get({ plain: true }));

        for (let index = 0; index < userSkills.length; index++) {
          const skillId = userSkills[index];
          const skill = skills.find(y => y.skillId == skillId);
          const defaults = {
            status: constantCode.status.ACTIVE,
            userSkillMapUuid: uuidv4(),
            userUuid: userInfo.userUuid,
            skillUuid: skill.skillUuid,
            createdDeptId: departmentId,
            createdRoleId: roleId,
            createdBy: userId,
            updatedBy: userId
          }
          const where = { userId: id, skillId: skillId };
          const [usm, created] = await conn.UserSkillMap.findOrCreate({ where, defaults });
          console.log({ created })
          if (!created) {
            await conn.UserSkillMap.update(defaults, { where })
          }
        }
        console.log(userSkillMappings, "after map");
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully updated user details'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateUserStatus(user, userId, params, conn, t) {
    try {
      const { id } = params
      const userInfo = await conn.User.findOne({ where: { userId: id } })
      if (!userInfo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'User not available'
        }
      }
      if (userInfo?.status && userInfo?.status !== constantCode.status.ACTIVE && user?.status && user?.status === constantCode.status.ACTIVE) {
        // Check Max user limit
        const checkUserLimit = await checkMaxUserLimit(conn)
        if (checkUserLimit?.status !== 200) {
          return {
            ...checkUserLimit
          }
        }
      }

      if (userInfo?.userType && user?.userType && userInfo?.userType !== user?.userType) {
        // check UserType limit
        const getUserTypeLimit = await checkUserTypeLimit(user, conn)
        if (getUserTypeLimit?.status !== 200 && getUserTypeLimit?.status !== 100) {
          return {
            ...getUserTypeLimit
          }
        }
      }

      user.updatedBy = userId
      await conn.User.update(user, { where: { userId: id }, transaction: t })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'User status updated!'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Obtaining a user based on their UserId
   * @param {Object} userData
   * @param {number} userData.id
   * @returns
   */
  async getUser(userData, conn) {
    try {
      const { userId } = userData

      const user = await conn.User.findOne({
        attributes: ['userId', 'contactNo', 'email', 'userType', 'photo', 'title', 'firstName', 'lastName', 'gender', 'dob', 'loginid', 'officeNo', 'extn', 'notificationType', 'biAccess', 'waAccess', 'status', 'mappingPayload', 'profilePicture', 'loc', 'country', 'activationDate', 'expiryDate', 'managerId', 'userFamily', 'userSource', 'userCategory', 'userGroup'],
        include: [
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'userGroupDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.SkillMst,
            as: 'userSkills',
            required: false,
            through: {
              where: { status: constantCode.status.ACTIVE },
              attributes: []
            },
            exclude: ["userSkillMap"],
            attributes: ['skillId', 'skillDesc']
          },
          {
            model: conn.User,
            as: 'managerDetail',
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.BusinessEntity,
            as: 'genderDesc',
            attributes: ['code', 'description']
          }
        ],
        where: { userId, status: constantCode.status.ACTIVE }
      })

      if (!user) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'User Details not available'
        }
      }

      return { status: statusCodeConstants.SUCCESS, message: 'Successfully fetched user details', data: user }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** obtaining a user based on user id
   * @param {object} userData
   * @returns
   */
  async getUserList(userData, conn) {
    try {
      const { limit = constantCode.common.lIMIT, page = constantCode.common.PAGE, source, newUserRequest } = userData
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      const whereClause = {}

      if (source === constantCode.status.NEW || newUserRequest) {
        whereClause.status = constantCode.status.PENDING
      } else {
        whereClause.status = { [Op.ne]: constantCode.status.PENDING }
      }

      if (userData.filters && Array.isArray(userData.filters) && !isEmpty(userData.filters)) {
        for (const record of userData.filters) {
          if (record.value) {
            if (record.id === 'userId') {
              whereClause.userId = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('"User".user_id'), 'varchar'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toString()}%`
                })]
              }
            } else if (record.id === 'firstName') {
              whereClause.firstName = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"User".first_name'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'lastName') {
              whereClause.lastName = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"User".last_name'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'email') {
              whereClause.email = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"User".email'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'contactNo') {
              whereClause.contactNo = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('"User".contact_no'), 'varchar'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toString()}%`
                })]
              }
            } else if (record.id === 'userType') {
              whereClause.userType = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('"User".user_type')), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toUpperCase()}%`
                })]
              }
            }
          }
        }
      }

      const user = await conn.User.findAndCountAll({
        attributes: ['userId', 'contactNo', 'email', 'userType', 'photo', 'title', 'firstName', 'lastName', 'gender', 'dob', 'loginid', 'officeNo', 'extn', 'notificationType', 'biAccess', 'waAccess', 'status', 'mappingPayload', 'profilePicture', 'loc', 'country', 'activationDate', 'expiryDate', 'managerId', 'userFamily', 'userSource', 'userCategory', 'userGroup'],
        where: whereClause,
        distinct: true,
        include: [
          {
            model: conn.SkillMst,
            as: 'userSkills',
            required: false,
            through: {
              where: { status: constantCode.status.ACTIVE },
              attributes: []
            },
            exclude: ["userSkillMap"],
            attributes: ['skillId', 'skillDesc']
          }
        ],
        order: [
          ['firstName', 'ASC']
        ],
        ...params
      })

      if (!user) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'User Details not available'
        }
      }
      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          codeType: ['STATUS', 'USER_TYPE', 'USER_GROUP', 'USER_FAMILY', 'USER_CATEGORY', 'LOCATION'],
          status: constantCode.status.ACTIVE
        }
      })
      const data = {
        count: user.count,
        rows: userResources.transformUserSearch(user.rows, businessEntityInfo)
      }
      return { status: statusCodeConstants.SUCCESS, message: 'Successfully fetched user list', data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method used for verifying the user's email list
   * @param {Array} user
   * @param {string} user.email
   * @returns {object} Checked user list
   */
  async verifyUsers(user, conn) {
    try {
      const emails = map(user.list, 'email')
      const response = []
      if (!isEmpty(emails)) {
        const users = await conn.User.findAll({
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
                  validationStatus: constantCode.common.FAILED,
                  validationRemark: 'User Already Exists'
                })
                found = true
              }
            }
            if (found === false) {
              response.push({
                email: i,
                validationStatus: constantCode.common.SUCCESS
              })
            }
          }
        }
      }
      return { status: statusCodeConstants.SUCCESS, message: 'Users Verified successfully', data: response }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method for validating user email
   * @param {Array} userData
   * @param {string} userData [email]
   * @returns {object}
   */
  async verifyEmails(userData, conn) {
    try {
      const roles = map(userData.list, 'roleDescription')
      const units = map(userData.list, 'departmentDescription')
      const response = []
      const emails = map(userData.list, 'email')
      if (!isEmpty(emails) && !isEmpty(roles)) {
        let users = await conn.User.findAll({
          attributes: ['email', 'mappingPayload'],
          where: { email: emails }
        })
        const userResponse = users
        users = map(users, 'email')

        let rolesResp = await conn.Role.findAll({
          attributes: ['roleDesc', 'roleId'],
          where: { roleDesc: roles }
        })
        const roleResponse = rolesResp
        rolesResp = map(rolesResp, 'roleDesc')

        let deptResp = await conn.BusinessUnit.findAll({
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
                      validationStatus: constantCode.common.SUCCESS

                    })
                  } else {
                    response.push({
                      email: i.email,
                      validationStatus: constantCode.common.FAILED,
                      validationRemark: 'User Role Mapping Already Exists'
                    })
                  }
                } else {
                  response.push({
                    email: i.email,
                    validationStatus: constantCode.common.FAILED,
                    validationRemark: 'Role Does Not Exists Under Selected Department'
                  })
                }
              } else {
                response.push({
                  email: i.email,
                  validationStatus: constantCode.common.FAILED,
                  validationRemark: 'Role Does Not Exists'
                })
              }
            } else {
              response.push({
                email: i.email,
                validationStatus: constantCode.common.FAILED,
                validationRemark: 'Department Does Not Exists'
              })
            }
          } else {
            response.push({
              email: i.email,
              validationStatus: constantCode.common.FAILED,
              validationRemark: 'User Does Not Exists'
            })
          }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Users updated successfully',
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

  async getUsersRoleId(userData, conn) {
    try {
      logger.debug('Getting users list')
      const { roleId, deptId } = userData

      if (!roleId || !deptId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response = []
      const roleInfo = await conn.Role.findOne({
        where: {
          roleId
        }
      })
      if (roleInfo) {
        response = await conn.sequelize.query(`SELECT user_id, user_type, title, first_name, last_name FROM ad_users
        WHERE mapping_payload @> '{"userDeptRoleMapping":[{"roleId":[` + roleId + '] , "unitId" :"' + deptId + '"}]}\'', {
          type: QueryTypes.SELECT
        })
        if (response) {
          response = camelCaseConversion(response)
        }
      }
      logger.debug('Successfully fetch users list')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Users details fetched successfully',
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

  async getManagerList(userData, conn) {
    try {
      const user = await conn.User.findAll({
        attributes: ['userId', 'firstName', 'lastName', 'userFamily', 'userSource', 'userCategory', 'userGroup'],
        where: {
          status: constantCode.status.ACTIVE,
          userGroup: "UG_BUSINESS",
          userCategory: "UC_FULLTIME"
        },
        distinct: true,
        order: [
          ['firstName', 'ASC']
        ]
      })
      return { status: statusCodeConstants.SUCCESS, message: 'Successfully fetched user list', data: user }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getRolesAndDepartments(conn) {
    try {

      const roles = await conn.Role.findAll({
        attributes: ['roleId', 'roleName', 'roleDesc', 'status'],
        where: {
          status: constantCode.status.ACTIVE
        },
        distinct: true,
        order: [
          ['roleName', 'ASC']
        ]
      })

      const departments = await conn.BusinessUnit.findAll({
        attributes: ['unitId', 'unitName', 'unitDesc', 'status', 'mappingPayload'],
        where: {
          status: constantCode.status.ACTIVE
        },
        distinct: true,
        order: [
          ['unitName', 'ASC']
        ]
      })

      return {
        status: statusCodeConstants.SUCCESS, message: 'Successfully fetched role and department list', data: {
          roles,
          departments
        }
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

module.exports = UserService

const generateUserId = async (emailId, conn) => {
  const e = emailId.split('@')[0] + '_'
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

export const getSystemConfiguration = async (conn) => {
  try {
    const systemConfig = await conn.BcaeAppConfig.findOne({
      where: {
        status: constantCode.status.ACTIVE
      }
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
    return {
      status: statusCodeConstants.ERROR,
      message: 'Internal server error'
    }
  }
}

const createCustomer = async (authData, user, conn, t) => {
  try {
    let systemConfig

    await getSystemConfiguration(conn).then((e) => {
      if (e.status === 200) {
        systemConfig = e?.data
      }
    })

    console.log("customer creation ==> ", systemConfig?.clientConfig);
    console.log("customer creation user==> ", user);
    if (systemConfig?.clientConfig?.ON_USER_CREATION?.CREATE_CUSTOMER?.isActive) {
      const customerPayload = {
        details: {
          customerRefNo: user.userNo,
          source: user.userSource,
          firstName: user.firstName,
          lastName: user.lastName,
          // customerAge: Joi.number().allow(null).label('Customer Age'),
          gender: user.gender,
          birthDate: user.dob,
          idType: "CIT_IC",
          idValue: user.userNo,
          status: "CS_PEND",
          // customerCategory: Joi.string().allow(null).label('Customer Category'),
          // customerClass: Joi.string().allow(null).label('Customer Class'),
          // registeredNo: Joi.string().allow(null, '', ' ').label('Register Number'),
          // businessName: Joi.string().allow(null, '').label('Business Name'),
          // registeredDate: Joi.date().allow(null, '', ' ').label('Register Date'),
          // nationality: Joi.string().allow(null).label('Nationality'),
          // customerPhoto: Joi.string().allow(null).label('Customer Photo'),
          // taxNo: Joi.string().allow(null).label('Tax No'),
          // billable: Joi.string().valid('Y', 'N').label('Billable'),
          // occupation: Joi.string().allow('').label('Occupation'),
          // customerMaritalStatus: Joi.string().allow('').label('Customer Marital Status'),
          contactPreferences: user.notificationType
        },
        contact: {
          // contactType: Joi.string().label('Contact type'),
          isPrimary: true,
          // title: Joi.string().label('Title'),
          firstName: user.firstName,
          lastName: user.lastName,
          emailId: user.email,
          mobilePrefix: user.extn,
          mobileNo: user.contactNo,
          // telephonePrefix: Joi.when('telephoneNo', { is: Joi.exist(), then: Joi.string().label('Telephone prefix') }),
          // telephoneNo: Joi.number().label('Telephone no'),
          // whatsappNoPrefix: Joi.when('whatsappNo', { is: Joi.exist(), then: Joi.string().label('Whatsapp no prefix') }),
          // whatsappNo: Joi.number().label('Whatsapp no'),
          // fax: Joi.string().label('Fax'),
          // facebookId: Joi.string().label('Facebook ID'),
          // instagramId: Joi.string().label('Instagram ID'),
          // telegramId: Joi.string().label('Telegram ID'),
          // secondaryEmail: Joi.string().email().label('Secondary email'),
          // secondaryContactNo: Joi.number().label('Secondary contact no')
        }
      }

      const { authorization, tenantId } = authData
      const headers = {
        'Content-Type': 'application/json',
        'X-TENANT-ID': tenantId,
        Authorization: authorization
      }
      const method = 'post'
      const path = 'customer/create'
      const { result, error } = await externalApiCall(path, method, headers, customerPayload);
      if (result?.data?.customerId) {
        console.log('result---------->', result)
        const response = await conn.User.update({ customerId: result?.data?.customerId, customerUuid: result?.data?.customerUuid }, { where: { userUuid: user?.userUuid }, transaction: t })
      }
      return;
    } else {
      console.log("Customer creation on user creation config data is not available or disabled");
    }
  } catch (error) {
    console.log("Error in creating customer creation", error);
  }
}

const externalApiCall = async (path, method, headers, data) => {
  const url = `${bcaeConfig.host}:${bcaeConfig.gatewayPort}/api/${path}`

  if (method === 'post') headers['Content-Type'] = 'application/json'

  return new Promise((resolve, reject) => {
    axios.request({ url, method, headers, data })
      .then((response) => {
        console.log("API call response", response?.data);
        resolve({ result: response?.data })
      })
      .catch((error) => {
        console.log('API call error', error)
        resolve({ error })
      })
  })
}

const checkMaxUserLimit = async (conn) => {
  try {
    let systemConfig

    await getSystemConfiguration(conn).then((e) => {
      if (e.status === 200) {
        systemConfig = e?.data
      }
    })

    if (!systemConfig) {
      return {
        status: statusCodeConstants.VALIDATTION_ERROR,
        message: systemConfig.message
      }
    }

    /** Checking System Configuration - Start */

    const getOverAllCount = await conn.User.count({
      where: {
        status: {
          [Op.notIn]: [constantCode.status.IN_ACTIVE]
        }
      }
    })

    if (systemConfig && getOverAllCount && systemConfig?.maxUserLimit <= getOverAllCount) {
      return {
        status: statusCodeConstants.VALIDATTION_ERROR,
        message: 'Your user creation max limit has been reached. Please contact the system admin.'
      }
    }
    return {
      status: statusCodeConstants.SUCCESS,
      message: `You not reached your maximum user creation limit. you have remainig ${systemConfig?.maxUserLimit - getOverAllCount} user's`
    }

    /** Checking System Configuration - End */
  } catch (error) {
    return {
      status: statusCodeConstants.ERROR,
      message: 'Internal server error'
    }
  }
}

const checkUserTypeLimit = async (payload, conn) => {
  try {
    if (!payload) {
      return {
        status: statusCodeConstants.VALIDATTION_ERROR,
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
      return {
        status: statusCodeConstants.VALIDATTION_ERROR,
        message: systemConfig.message
      }
    }

    const getUserTypeLimit = systemConfig?.userLimitPayload && Array.isArray(systemConfig?.userLimitPayload) && payload?.userType
      ? systemConfig?.userLimitPayload.filter((e) => payload?.userType === e.userType)
      : []

    if (isEmpty(getUserTypeLimit)) {
      return {
        status: statusCodeConstants.CONTINUE,
        message: 'UserType Limit is not available in system'
      }
    }

    const getOverAllCount = await conn.User.count({
      where: {
        userType: payload?.userType,
        status: {
          [Op.notIn]: [constantCode.status.IN_ACTIVE]
        }
      }
    })

    if (systemConfig && getOverAllCount && getUserTypeLimit?.[0]?.count <= getOverAllCount) {
      return {
        status: statusCodeConstants.VALIDATTION_ERROR,
        message: 'Your maximum user Type limit has been reached. Please contact the system admin.'
      }
    }
    return {
      status: statusCodeConstants.SUCCESS,
      message: `You not reached your maximum user Type limit. you have remainig ${getUserTypeLimit?.[0]?.count - getOverAllCount} user's creation`
    }
  } catch (error) {
    return {
      status: statusCodeConstants.ERROR,
      message: 'Internal server error'
    }
  }
}
