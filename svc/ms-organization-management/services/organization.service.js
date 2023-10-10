import { transformAddress, transformResponseAddress } from '@resources'
// eslint-disable-next-line no-unused-vars
import { logger, statusCodeConstants, MODULE_NAME, constantCode } from '@utils'
import { v4 as uuidv4 } from 'uuid'

class OrganizationService {
  async createOrganization (organization, departmentId, roleId, userId, conn, t) {
    try {
      const response = {}

      const entityNames = {
        ORG: "Organization", OU: "Operational Unit", DEPT: "Department"
      }

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }

      /** Get System configuration */
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

      const { maxEntityLimit } = systemConfig
      const getBuCount = await conn.BusinessUnit.count({
        where: {
          unitType: constantCode?.unitType?.DEPARTMENT,
          status: constantCode.status.ACTIVE
        }
      })

      if (organization.unitType === constantCode.unitType.DEPARTMENT &&
        getBuCount && maxEntityLimit && getBuCount >= maxEntityLimit) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Entity creation max limit has been reached. Please contact system admin.'
        }
      }

      if (organization?.parentUnit) {
        const parent = await conn.BusinessUnit.findOne({ where: { unitId: organization.parentUnit } })
        if (!parent) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: 'Parent not available'
          }
        }
      }

      const unitId = organization.parentUnit ? organization.unitName.toUpperCase() + '.' + organization.parentUnit : organization.unitName.toUpperCase()
      const organizationInfo = await conn.BusinessUnit.findOne({
        where: { unitId }
      })

      if (organizationInfo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `${entityNames[organization.unitType]} exists`
        }
      }

      organization = {
        ...organization,
        unitId,
        ...commonAttrib
      }
      const businessCreated = await conn.BusinessUnit.create(organization, { transaction: t })

      // If organization has address, creating new address
      // if (organization.address) {
      //   const addressInfo = {
      //     ...organization.address,
      //     addressCategory: MODULE_NAME,
      //     addressCategoryValue: businessCreated.unitId
      //   }
      //   const address = await createAddress(addressInfo, commonAttrib, conn, t)
      //   if (address) {
      //     organization.addressId = address.addressId
      //     response.address = address
      //   }
      // }

      // If organization has contact, creating new contact
      // if (organization.contact) {
      //   const contactInfo = {
      //     ...organization.contact,
      //     status: constantCode.status.ACTIVE,
      //     contactCategory: MODULE_NAME,
      //     contactCategoryValue: businessCreated.unitId
      //   }

      //   const contact = await createContact(contactInfo, commonAttrib, conn, t)
      //   if (contact) {
      //     organization.contactId = contact.contactId
      //     response.contact = contact
      //   }
      // }

      const data = {
        ...response,
        ...businessCreated.dataValues
      }

      const status = statusCodeConstants.SUCCESS
      // ORG, OU, DEPT

      const message = `${entityNames[organization.unitType]} created`

      return ({ status, message, data })
    } catch (error) {
      logger.error(error)
      if (error.response && error.response.status === 404) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Parent not available'
        }
      } else {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Internal server error'
        }
      }
    }
  }

  async updateOrganization (organization, departmentId, roleId, userId, id, conn, t) {
    try {
      const entityNames = {
        ORG: "Organization", OU: "Operational Unit", DEPT: "Department"
      }

      const organizationInfo = await conn.BusinessUnit.findOne({ where: { unitId: id } })

      if (!organizationInfo) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: `${entityNames[organization.unitType]} not found`
        }
      }

      if (organization.parentUnit) {
        const parent = await conn.BusinessUnit.findOne({ where: { unitId: organization.parentUnit } })
        if (!parent) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: 'Parent not available'
          }
        }
      }
      let checkExistingUnit = conn.BusinessUnit.findOne({
        where: {
          unitId: id
        }
      })
      checkExistingUnit = checkExistingUnit?.dataValues ? checkExistingUnit?.dataValues : checkExistingUnit
      if (checkExistingUnit && checkExistingUnit.unitType === constantCode.unitType.DEPARTMENT && organization.unitType === constantCode.unitType.DEPARTMENT &&
        checkExistingUnit.status !== statusCodeConstants.status.ACTIVE && organization.status === statusCodeConstants.status.ACTIVE) {
        /** Get System configuration */
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

        const { maxEntityLimit } = systemConfig
        const getBuCount = await conn.BusinessUnit.count({
          where: {
            unitType: constantCode?.unitType?.DEPARTMENT
          }
        })

        if (getBuCount && maxEntityLimit && getBuCount >= maxEntityLimit) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Entity creation max limit has been reached. Please contact the system admin.'
          }
        }
      }

      // const commonAttrib = {
      //   tranId: uuidv4(),
      //   createdDeptId: departmentId,
      //   createdRoleId: roleId,
      //   createdBy: userId,
      //   updatedBy: userId
      // }

      // If organization has address, updating or creating new address
      // if (organizationInfo.addressId && organization.address) {
      //   await updateAddress(organization.address, organizationInfo.addressId, userId, conn, t)
      //   organization.addressId = organizationInfo.addressId
      // } else if (organization.address) {
      //   const addressInfo = {
      //     ...organization.address,
      //     addressCategory: MODULE_NAME,
      //     addressCategoryValue: id
      //   }

      //   const address = await createAddress(addressInfo, commonAttrib, conn, t)

      //   if (address) {
      //     organization.addressId = address.addressId
      //   }
      // }

      // If organization has contact, updating or creating new contact
      // if (organizationInfo.contactId && organization.contact) {
      //   await updateContact(organization.contact, organizationInfo.contactId, userId, conn, t)
      //   organization.contactId = organizationInfo.contactId
      // } else if (organization.contact) {
      //   const contactInfo = {
      //     ...organization.contact,
      //     status: constantCode.status.ACTIVE,
      //     contactCategory: MODULE_NAME,
      //     contactCategoryValue: id
      //   }

      //   const contact = await createContact(contactInfo, commonAttrib, conn, t)

      //   if (contact) {
      //     organization.contactId = contact.contactId
      //   }
      // }

      organization = {
        ...organization,
        updatedBy: userId
      }

      console.log(id, organization);

      await conn.BusinessUnit.update(organization, { where: { unitId: id }, transaction: t })

      const status = statusCodeConstants.SUCCESS
      const message = `${entityNames[organization.unitType]} updated`

      return ({ status, message })
    } catch (error) {
      logger.error(error)
      if (error.response && error.response.status === 404) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Organization not found'
        }
      } else {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Internal server error'
        }
      }
    }
  }

  async getOrganization (unitId, unitType, conn) {
    try {
      let queryObj = {
        attributes: ['unitId', 'unitName', 'unitDesc', 'unitType', 'parentUnit', 'status', 'mappingPayload']
        // include: [{
        //   attributes: ['addressId', ['hno', 'flatHouseUnitNo'], 'block', ['building_name', 'building'],
        //     'street', 'road', 'district', 'state', ['town', 'village'], ['city', 'cityTown'], 'country', 'postcode'],
        //   model: conn.Address,
        //   as: 'address',
        //   where: {
        //     addressCategory: MODULE_NAME
        //   }
        // }, {
        //   attributes: ['contactId', 'title', 'firstName', 'lastName', 'contactType', 'contactNo'],
        //   model: conn.Contact,
        //   as: 'contact',
        //   where: {
        //     contactCategory: MODULE_NAME
        //   }
        // }]
      }
      if (unitType) {
        queryObj = { ...queryObj, where: { unitType } }
      }
      if (unitId) {
        queryObj = { ...queryObj, where: { unitId } }
      }

      let data = {}

      if (unitId) {
        data = await conn.BusinessUnit.findOne(queryObj)
      } else {
        data = await conn.BusinessUnit.findAll(queryObj)
      }
      if (data) {
        const status = statusCodeConstants.SUCCESS
        const message = 'Records retrived'

        return ({ status, message, data })
      }

      return {
        status: statusCodeConstants.NOT_FOUND,
        message: 'Records not found'
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

// eslint-disable-next-line no-unused-vars
const createAddress = async (address, commonAttrib, conn, t) => {
  const data = { ...transformAddress(address), ...commonAttrib }
  console.log('data', data)
  let response = await conn.Address.create(data, { transaction: t })
  response = transformResponseAddress(response)
  return response
}

// eslint-disable-next-line no-unused-vars
const createContact = async (contactInfo, commonAttrib, conn, t) => {
  const data = { ...contactInfo, ...commonAttrib }
  const contact = await conn.Contact.create(data, { transaction: t })
  return contact
}

// eslint-disable-next-line no-unused-vars
const updateAddress = async (address, addressId, userId, conn, t) => {
  const data = transformAddress(address)
  data.createdBy = userId
  data.addressId = addressId
  await conn.Address.update(data, { where: { addressId }, transaction: t })
}

// eslint-disable-next-line no-unused-vars
const updateContact = async (data, contactId, userId, conn, t) => {
  data.userId = userId
  data.contactId = contactId
  await conn.Contact.update(data, { where: { contactId }, transaction: t })
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

module.exports = OrganizationService
