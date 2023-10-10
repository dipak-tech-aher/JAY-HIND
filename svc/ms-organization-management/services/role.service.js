import { defaultCode, defaultMessage, logger, statusCodeConstants, constantCode } from '@utils'
import { isEmpty, map } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

let instance

class RoleService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  /** Method Used for Create Role
   * @param {object} roleData
   * @param {string} roleData.roleName
   * @param {string} roleData.roleDesc
   * @param {boolean} roleData.isAdmin
   * @param {string} roleData.status
   * @param {object} roleData.mappingPayload
   * @param {number} userId
   * @returns {object}
   */
  async createRole(roleData, departmentId, roleId, userId, conn, t) {
    try {
      logger.info('Creating new Role')
      let role = roleData
      if (!role) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let systemConfig
      await getSystemConfiguration(conn).then((e) => {
        if (e.status === 200) {
          systemConfig = e?.data || ''
        }
      })
      if (!systemConfig) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'System Configuration is not available. please contact system admin'
        }
      }

      const { maxRolesLimit } = systemConfig

      const getRoleCount = await conn.Role.count({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      if (getRoleCount && maxRolesLimit && getRoleCount >= maxRolesLimit) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Role creation max limit has been reached. Please contact system admin.'
        }
      }

      role = {
        ...role,
        isAdmin: false,
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }
      const response = await conn.Role.create(role, { transaction: t })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Role created successfully',
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

  /** Method Used for Update Role
   * @param {object} roleData
   * @param {number} id
   * @param {number} userId
   * @returns {object}
   */
  async updateRole(roleData, id, userId, conn, t) {
    try {
      let role = roleData
      if (!role && !id) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const roleInfo = await conn.Role.findOne({
        where: {
          roleId: id
        }
      })

      if (!roleInfo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Role details not found'
        }
      }

      if (roleInfo && roleInfo.status !== constantCode.status.ACTIVE && role && role?.status && role?.status === constantCode.status.ACTIVE) {
        let systemConfig
        await getSystemConfiguration(conn).then((e) => {
          if (e.status === 200) {
            systemConfig = e?.data || ''
          }
        })
        if (!systemConfig) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'System Configuration is not available. please contact system admin'
          }
        }

        const { maxRolesLimit } = systemConfig

        const getRoleCount = await conn.Role.count({
          where: {
            status: constantCode.status.ACTIVE
          }
        })

        if (getRoleCount && maxRolesLimit && getRoleCount >= maxRolesLimit) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Role creation max limit has been reached. Please contact system admin.'
          }
        }
      }

      role = {
        ...role,
        isAdmin: false,
        updatedBy: userId
      }
      await conn.Role.update(role, {
        where: {
          roleId: id
        },
        transaction: t
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Role updated successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method Used for Get Role by Id
   * @param {object} roleData
   * @returns {object}
   */
  async getRole(roleData, conn) {
    try {
      const whereClause = {}
      if (roleData?.id) {
        whereClause.roleId = roleData.id
      }
      const response = await conn.Role.findAll({
        attributes: ['roleId', 'roleName', 'roleDesc', 'roleFamilyId', 'isAdmin', 'status', 'mappingPayload'],
        include: [{
          model: conn.RoleFamily,
          as: 'roleFamily',
          attributes: ['roleFamilyCode']
        }],
        where: {
          ...whereClause
        },
        order: [
          ['roleId', 'ASC']
        ]
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Role fetched successfully',
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

  /** Method Used for Get Role by Id
   * @param {object} roleData
   * @returns {object}
   */
  async getRoles(roleData, conn) {
    try {
      const response = await conn.Role.findAll({
        attributes: ['roleId', 'roleName', 'roleDesc', 'roleFamilyId', 'isAdmin', 'status', 'mappingPayload'],
        include: [{
          model: conn.RoleFamily,
          as: 'roleFamily',
          attributes: ['roleFamilyCode']
        }],
        order: [
          ['roleId', 'ASC']
        ]
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Role fetched successfully',
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

  /** Method used for Verify Role in Bulk Upload
   * @param {object} roleData
   * @returns {object}
   */
  async verifyRoles(roleData, conn) {
    try {
      const reqBody = roleData

      if (!reqBody || !reqBody.list) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const response = []
      const roleNames = map(reqBody.list, 'roleName')

      logger.info('Finding roles in db')

      if (!isEmpty(roleNames)) {
        const roles = await conn.Role.findAll({
          attributes: ['roleName'],
          where: { roleName: roleNames }
        })
        if (!isEmpty(roles)) {
          for (const i of roleNames) {
            let found = false
            for (const j of roles) {
              if (i === j.roleName) {
                response.push({
                  roleName: i,
                  validationStatus: 'FAILED',
                  validationRemark: 'Role Already Exists'
                })
                found = true
              }
            }
            if (found === false) {
              response.push({
                roleName: i,
                validationStatus: 'SUCCESS'

              })
            }
          }
        }
      }

      logger.debug('Roles fetched successfully')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Roles fetched successfully',
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

  /** Method used for Submit Role in Bulk upload
   * @param {object} roleData
   * @param {number} userId
   * @returns {object}
   */
  async bulkUploadRoles(roleData, userId, conn, t) {
    try {
      const requestBody = roleData

      if (!(Array.isArray(requestBody.list))) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const rolesFamilies = await conn.RoleFamily.findAll({
        order: [
          ['roleFamilyId', 'ASC']
        ]
      })

      requestBody.list.map((role) => {
        let roleFamilyId = rolesFamilies.find(x => x.roleFamilyCode == role.roleFamilyCode)?.roleFamilyId;
        role.roleName = role?.roleName || null
        role.roleDesc = role?.roleDescription || null
        role.roleFamilyId = roleFamilyId || null
        role.isAdmin = role?.isAdmin === 'Yes' ? 'true' : 'false' || null
        role.status = role?.status === 'Active' ? defaultCode.YES : defaultCode.NO || null
        role.createdBy = userId
        role.updatedBy = userId
        return role
      })

      const data = {
        bulkUploadType: requestBody.type,
        noOfRecordsAttempted: requestBody.counts.total,
        successfullyUploaded: requestBody.counts.success,
        failed: requestBody.counts.failed,
        createdBy: userId
      }

      const responsebulk = await conn.BulkUploadDtl.create(data, { transaction: t })

      if (!responsebulk) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Bulk Upload Failed'
        }
      }
      requestBody.list.map((record) => {
        record.bulkuploadId = responsebulk.uploadProcessId
        return record
      })

      const response = await conn.BulkUploadRole.bulkCreate(requestBody.list, { transaction: t })
      if (response) {
        await conn.Role.bulkCreate(requestBody.list, { transaction: t })
      }
      const bulkUploadResponse = await conn.BulkUploadDtl.findOne({
        where: {
          uploadProcessId: responsebulk.uploadProcessId
        },
        include: [
          { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] }
        ]
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Roles created successfully',
        data: bulkUploadResponse
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getRoleFamily(roleData, conn) {
    try {
      const response = await conn.RoleFamily.findAll({
        order: [
          ['roleFamilyId', 'ASC']
        ]
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Role Family fetched successfully',
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

  async getModuleScreens(params, conn) {
    try {
      logger.debug('Fetching list of module screens')
      const response = await conn.Mainmenu.findAll({
        attributes: ['menuId', 'menuName', 'moduleName', 'screenName'],
        where: {
          status: 'AC'
        },
        order: [['moduleName', 'ASC']]
      })
      logger.debug('Successfully fetched list of module screens')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched list of module screens',
        data: response
      }
    } catch (error) {
      logger.error(error, defaultMessage.NOT_FOUND)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
}

const getSystemConfiguration = async (conn) => {
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

module.exports = RoleService
