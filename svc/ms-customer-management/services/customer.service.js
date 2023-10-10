import { config } from '@config/env.config'
import em from '@emitters'
import { db } from '@models'
import { compareRecords, transformRecord } from '@resources'
import { CryptoHelper, camelCaseConversion, constantCode, customerInteractionEmoji, defaultCode, defaultMessage, defaultStatus, entityCategory, logger, statusCodeConstants } from '@utils'
import { addressFields, contactFields, customerFields } from '@utils/constant'
import { isEmpty } from 'lodash'
import { Op, QueryTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import customerResources from '../resources/index'

const moment = require('moment')
const emoji = require('node-emoji')
// const axios = require('axios')

const { systemUserId, systemRoleId, systemDeptId, roleProperties, bcae, bcaeConfig, webSelfCareURL, tenantId } = config

let instance
class CustomerService {
  constructor() {
    if (!instance) {
      instance = this
    }
    instance.cryptoHelper = new CryptoHelper()
    return instance
  }

  async searchCustomer(query, conn) {
    try {
      if (!query.q || query?.q == '') {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const customerClauses = []
      const contactClauses = []
      const serviceClauses = []
      const accountClauses = []
      const sequelize = db.sequelize

      serviceClauses.push({
        serviceNo: sequelize.where(
          sequelize.cast(sequelize.col('service_no'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      const services = await conn.CustServices.findAll({
        where: {
          [Op.or]: serviceClauses
        }
      })

      if (services.length) {
        const customerIds = services.map(x => x.customerId)
        customerClauses.push({
          customerId: { [Op.in]: customerIds }
        })
      }

      accountClauses.push({
        accountNo: sequelize.where(
          sequelize.cast(sequelize.col('account_no'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      const accounts = await conn.CustAccounts.findAll({
        where: {
          [Op.or]: accountClauses
        }
      })

      if (accounts.length) {
        const customerIds = accounts.map(x => x.customerId)
        customerClauses.push({
          customerId: { [Op.in]: customerIds }
        })
      }

      contactClauses.push({
        mobileNo: sequelize.where(
          sequelize.cast(sequelize.col('mobile_no'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      contactClauses.push({
        contactNo: sequelize.where(
          sequelize.cast(sequelize.col('contact_no'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      contactClauses.push({
        emailId: sequelize.where(
          sequelize.cast(sequelize.col('email_id'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      const contacts = await conn.Contact.findAll({
        where: {
          [Op.or]: contactClauses
        }
      })

      if (contacts.length) {
        const customerNos = contacts.map(x => x.contactCategoryValue)
        customerClauses.push({
          customerNo: { [Op.in]: customerNos }
        })
      }

      customerClauses.push({
        customerUuid: sequelize.where(
          sequelize.cast(sequelize.col('Customer.customer_uuid'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })
      customerClauses.push({
        customerNo: sequelize.where(
          sequelize.cast(sequelize.col('Customer.customer_no'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })
      customerClauses.push({
        status: sequelize.where(
          sequelize.cast(sequelize.col('Customer.status'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      const customerNameParts = query.q.split(' ')
      customerNameParts.forEach(customerNamePart => {
        customerClauses.push({
          firstName: sequelize.where(
            sequelize.cast(sequelize.col('Customer.first_name'), 'varchar'),
            { [Op.iLike]: `%${customerNamePart}%` }
          )
        })
        customerClauses.push({
          lastName: sequelize.where(
            sequelize.cast(sequelize.col('Customer.last_name'), 'varchar'),
            { [Op.iLike]: `%${customerNamePart}%` }
          )
        })
      })

      const response = await conn.Customer.findAll({
        attributes: [
          'customerId', 'customerNo', 'customerUuid', 'customerRefNo', 'status', 'firstName',
          'lastName', 'customerAge', 'gender', 'birthDate', 'idType', 'idValue', 'customerCategory',
          'customerClass', 'customerMaritalStatus', 'occupation', 'registeredNo', 'registeredDate',
          'nationality', 'customerPhoto', 'taxNo', 'billable', 'customerStatusReason', 'contactPreferences'
        ],
        include: [
          {
            model: conn.BillableDetails,
            as: 'billableDetails'
          },
          {
            model: conn.BusinessEntity,
            as: 'genderDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'idTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'customerCatDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'customerClassDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.User,
            as: 'createdByName',
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.User,
            as: 'updatedByName',
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.Contact,
            attributes: ['contactNo', 'status', 'title', 'contactType', 'isPrimary', 'firstName', 'lastName', 'emailId', 'mobilePrefix', 'mobileNo', 'telephonePrefix', 'telephoneNo', 'whatsappNoPrefix', 'whatsappNo', 'fax', 'facebookId', 'instagramId', 'telegramId', 'secondaryEmail', 'secondaryContactNo'],
            as: 'customerContact',
            include: [
              {
                model: conn.BusinessEntity,
                as: 'statusDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'contactTypeDesc',
                attributes: ['code', 'description']
              }
            ],
            required: false
          },
          {
            model: conn.Address,
            as: 'customerAddress',
            required: false,
            attributes: ['addressNo', 'status', 'addressType', 'isPrimary', 'address1', 'address2', 'address3', 'addrZone', 'city', 'district', 'state', 'postcode', 'country', 'latitude', 'longitude'],
            include: [
              { model: conn.BusinessEntity, as: 'countryDesc', attributes: ['description'] }
            ]
          }
        ],
        where: {
          [Op.or]: customerClauses
          // status: {
          //   [Op.ne]: constantCode.customerStatus.TEMPORARY
          // }
        }
      })

      if (response.length === 0) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Customer Details is not found'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Customer Details fetched Successfully',
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

  async getCustomer(customerData, userId, conn) {
    try {
      userId = userId || systemUserId

      if (!customerData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE } = customerData
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }
      let whereclauses = {}
      const contactClauses = {}

      if (customerData && !isEmpty(customerData?.customerUuid)) {
        whereclauses = {
          ...whereclauses,
          customerUuid: { [Op.iLike]: `%${customerData.customerUuid}%` }
        }
      }

      if (customerData && !isEmpty(customerData?.customerRefNo)) {
        whereclauses = {
          ...whereclauses,
          customerRefNo: { [Op.iLike]: `%${customerData.customerRefNo}%` }
        }
      }

      if (customerData && !isEmpty(customerData?.customerNo)) {
        whereclauses = {
          ...whereclauses,
          customerNo: { [Op.iLike]: `%${customerData.customerNo}%` }
        }
      }

      if (customerData && !isEmpty(customerData?.status)) {
        whereclauses.status = customerData.status
      }

      if (customerData && !isEmpty(customerData?.customerName)) {
        const customerNameParts = customerData.customerName.split(' ')
        // customerNameParts.forEach(customerNamePart => {
        // console.log('customerNameParts ', customerNameParts[1])
        if (customerNameParts[1] && customerNameParts[1] !== null) {
          whereclauses = {
            ...whereclauses,
            [Op.and]: {
              firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".first_name')), 'LIKE', '%' + customerNameParts?.[0].toLowerCase() + '%'),
              lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".last_name')), 'LIKE', '%' + customerNameParts[1].toLowerCase() + '%')
            }
          }
        } else {
          whereclauses = {
            ...whereclauses,
            [Op.or]: {
              firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".first_name')), 'LIKE', '%' + customerNameParts?.[0].toLowerCase() + '%'),
              lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".last_name')), 'LIKE', '%' + customerNameParts?.[0].toLowerCase() + '%')
            }
          }
        }

        // })
      }

      if (customerData && !isEmpty(customerData?.emailId)) {
        contactClauses.emailId = customerData?.emailId
      }

      if (customerData && !isEmpty(customerData?.mobileNo)) {
        contactClauses.mobileNo = customerData?.mobileNo
      }

      if (customerData && !isEmpty(customerData?.contactNo)) {
        contactClauses.mobileNo = customerData?.contactNo
      }

      if (customerData && !isEmpty(customerData?.emailId)) {
        contactClauses.emailId = customerData?.emailId
      }

      if (customerData && !isEmpty(customerData?.idType) && !isEmpty(customerData?.idValue)) {
        whereclauses.idType = customerData.idType
        whereclauses.idValue = customerData.idValue
      }

      if (customerData && !isEmpty(customerData?.status)) {
        whereclauses.status = customerData.status
      }

      if (customerData.filters && Array.isArray(customerData.filters) && !isEmpty(customerData.filters)) {
        for (const record of customerData.filters) {
          if (record.value) {
            if (record.id === 'customerName') {
              const customerNameParts = record?.value?.split(' ')
              // customerNameParts.forEach(customerNamePart => {
              if (customerNameParts[1] && customerNameParts[1] !== null) {
                whereclauses = {
                  ...whereclauses,
                  [Op.and]: {
                    firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".first_name')), 'LIKE', '%' + customerNameParts?.[0].toLowerCase() + '%'),
                    lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".last_name')), 'LIKE', '%' + customerNameParts[1].toLowerCase() + '%')
                  }
                }
              } else {
                whereclauses = {
                  ...whereclauses,
                  [Op.and]: {
                    firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".first_name')), 'LIKE', '%' + customerNameParts?.[0].toLowerCase() + '%')
                  }
                }
              }
              // })
            } else if (record.id === 'emailId') {
              contactClauses.emailId = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"customerContact".email_id'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'mobileNo') {
              contactClauses.mobileNo = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('"customerContact".mobile_no'), 'varchar'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toString()}%`
                })]
              }
            } else if (record.id === 'customerNo') {
              whereclauses.customerNo = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"Customer".customer_no'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            }
          }
        }
      }

      // console.log('contactClauses====', contactClauses)
      // console.log('whereclauses====', whereclauses)
      const custCount = await conn.Customer.count({
        include: [{
          model: conn.Contact,
          as: 'customerContact',
          where: { ...contactClauses, contactCategory: entityCategory.CUSTOMER }, // isPrimary: true,
          required: !isEmpty(contactClauses)
        }],
        where: { ...whereclauses }
      })

      const custDet = await conn.Customer.findAll({
        attributes: [
          'customerId', 'customerNo', 'customerUuid', 'customerRefNo', 'status', 'firstName',
          'lastName', 'customerAge', 'gender', 'birthDate', 'idType', 'idValue', 'customerCategory',
          'customerClass', 'customerMaritalStatus', 'occupation', 'registeredNo', 'registeredDate',
          'nationality', 'customerPhoto', 'taxNo', 'billable', 'customerStatusReason', 'contactPreferences', 'businessName'
        ],
        include: [
          {
            model: conn.BillableDetails,
            as: 'billableDetails'
          },
          {
            model: conn.BusinessEntity,
            as: 'genderDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'idTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'customerCatDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'customerClassDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.User,
            as: 'createdByName',
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.User,
            as: 'updatedByName',
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.Contact,
            attributes: ['contactNo', 'status', 'title', 'contactType', 'isPrimary', 'firstName', 'lastName', 'emailId', 'mobilePrefix', 'mobileNo', 'telephonePrefix', 'telephoneNo', 'whatsappNoPrefix', 'whatsappNo', 'fax', 'facebookId', 'instagramId', 'telegramId', 'secondaryEmail', 'secondaryContactNo'],
            as: 'customerContact',
            include: [
              {
                model: conn.BusinessEntity,
                as: 'statusDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'contactTypeDesc',
                attributes: ['code', 'description']
              }
            ],
            where: { ...contactClauses, contactCategory: entityCategory.CUSTOMER }, // isPrimary: true,
            required: !isEmpty(contactClauses)
          },
          {
            model: conn.Address,
            as: 'customerAddress',
            required: false,
            attributes: ['addressNo', 'status', 'addressType', 'isPrimary', 'address1', 'address2', 'address3', 'addrZone', 'city', 'district', 'state', 'postcode', 'country', 'latitude', 'longitude'],
            include: [
              { model: conn.BusinessEntity, as: 'countryDesc', attributes: ['description'] }
            ],
            where: {
              isPrimary: true
            }
          },
          {
            model: conn.CustAccounts,
            as: 'customerAccounts',
            include: [
              {
                model: conn.CustServices,
                as: 'accountServices',
                include: [
                  {
                    model: conn.Contact,
                    attributes: ['contactNo', 'status', 'title', 'contactType', 'isPrimary', 'firstName', 'lastName', 'emailId', 'mobilePrefix', 'mobileNo', 'telephonePrefix', 'telephoneNo', 'whatsappNoPrefix', 'whatsappNo', 'fax', 'facebookId', 'instagramId', 'telegramId', 'secondaryEmail', 'secondaryContactNo'],
                    as: 'serviceContact',
                    required: false,
                    include: [
                      {
                        model: conn.BusinessEntity,
                        as: 'statusDesc',
                        attributes: ['code', 'description']
                      },
                      {
                        model: conn.BusinessEntity,
                        as: 'contactTypeDesc',
                        attributes: ['code', 'description']
                      }
                    ]
                    // where: { isPrimary: true }
                  },
                  {
                    model: conn.Address,
                    as: 'serviceAddress',
                    required: false,
                    attributes: ['addressNo', 'status', 'addressType', 'isPrimary', 'address1', 'address2', 'address3', 'addrZone', 'city', 'district', 'state', 'postcode', 'country', 'latitude', 'longitude'],
                    include: [
                      { model: conn.BusinessEntity, as: 'countryDesc', attributes: ['description'] }
                    ],
                    where: { isPrimary: true }
                  }
                ]
              },
              {
                model: conn.Contact,
                attributes: ['contactNo', 'status', 'title', 'contactType', 'isPrimary', 'firstName', 'lastName', 'emailId', 'mobilePrefix', 'mobileNo', 'telephonePrefix', 'telephoneNo', 'whatsappNoPrefix', 'whatsappNo', 'fax', 'facebookId', 'instagramId', 'telegramId', 'secondaryEmail', 'secondaryContactNo'],
                as: 'accountContact',
                required: false,
                include: [
                  {
                    model: conn.BusinessEntity,
                    as: 'statusDesc',
                    attributes: ['code', 'description']
                  },
                  {
                    model: conn.BusinessEntity,
                    as: 'contactTypeDesc',
                    attributes: ['code', 'description']
                  }
                ]
                // where: { isPrimary: true }
              },
              {
                model: conn.Address,
                as: 'accountAddress',
                required: false,
                attributes: ['addressNo', 'status', 'addressType', 'isPrimary', 'address1', 'address2', 'address3', 'addrZone', 'city', 'district', 'state', 'postcode', 'country', 'latitude', 'longitude'],
                include: [
                  { model: conn.BusinessEntity, as: 'countryDesc', attributes: ['description'] }
                ],
                where: { isPrimary: true }
              }
            ]
          }
        ],
        where: {
          ...whereclauses
        },
        ...params,
        logging: false
      })

      // console.log(response)

      // const customerUuids = response.rows.map(f => f.customerUuid)
      // const reqBody = {
      //   customerUuid: customerUuids.join(',')
      // }
      // const account = await axios.post(`${apiURL}/api/accounts/get-account-list`, reqBody,{
      //   headers: {
      //     Authorization: authorization,
      //     'x-tenant-id': tenantId,
      //     'content-type': 'application/json'
      //   }
      // })
      // console.log('account details ', account)
      // const accountsList = account.data.data.rows
      const response = {
        rows: custDet,
        count: custCount
      }
      if (custCount === 0) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Customer Details is not found'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Customer Details fetched Successfully',
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

  async getCustomerMiniInfo(customerData, userId, conn) {
    try {
      userId = userId || systemUserId

      if (!customerData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE } = customerData
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }
      let whereclauses = {}
      const contactClauses = {}

      if (customerData && !isEmpty(customerData?.customerUuid)) {
        whereclauses = {
          ...whereclauses,
          customerUuid: { [Op.iLike]: `%${customerData.customerUuid}%` }
        }
      }

      if (customerData && !isEmpty(customerData?.customerRefNo)) {
        whereclauses = {
          ...whereclauses,
          customerRefNo: { [Op.iLike]: `%${customerData.customerRefNo}%` }
        }
      }

      if (customerData && !isEmpty(customerData?.customerNo)) {
        whereclauses = {
          ...whereclauses,
          customerNo: { [Op.iLike]: `%${customerData.customerNo}%` }
        }
      }

      if (customerData && !isEmpty(customerData?.status)) {
        whereclauses.status = customerData.status
      }

      if (customerData && !isEmpty(customerData?.customerName)) {
        const customerNameParts = customerData.customerName.split(' ')
        // customerNameParts.forEach(customerNamePart => {
        // console.log('customerNameParts ', customerNameParts[1])
        if (customerNameParts[1] && customerNameParts[1] !== null) {
          whereclauses = {
            ...whereclauses,
            [Op.and]: {
              firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".first_name')), 'LIKE', '%' + customerNameParts?.[0].toLowerCase() + '%'),
              lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".last_name')), 'LIKE', '%' + customerNameParts[1].toLowerCase() + '%')
            }
          }
        } else {
          whereclauses = {
            ...whereclauses,
            [Op.or]: {
              firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".first_name')), 'LIKE', '%' + customerNameParts?.[0].toLowerCase() + '%'),
              lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".last_name')), 'LIKE', '%' + customerNameParts?.[0].toLowerCase() + '%')
            }
          }
        }

        // })
      }

      if (customerData && !isEmpty(customerData?.emailId)) {
        contactClauses.emailId = customerData?.emailId
      }

      if (customerData && !isEmpty(customerData?.mobileNo)) {
        contactClauses.mobileNo = customerData?.mobileNo
      }

      if (customerData && !isEmpty(customerData?.contactNo)) {
        contactClauses.mobileNo = customerData?.contactNo
      }

      if (customerData && !isEmpty(customerData?.emailId)) {
        contactClauses.emailId = customerData?.emailId
      }

      if (customerData && !isEmpty(customerData?.idType) && !isEmpty(customerData?.idValue)) {
        whereclauses.idType = customerData.idType
        whereclauses.idValue = customerData.idValue
      }

      if (customerData && !isEmpty(customerData?.status)) {
        whereclauses.status = customerData.status
      }

      if (customerData.filters && Array.isArray(customerData.filters) && !isEmpty(customerData.filters)) {
        for (const record of customerData.filters) {
          if (record.value) {
            if (record.id === 'customerName') {
              const customerNameParts = record?.value?.split(' ')
              // customerNameParts.forEach(customerNamePart => {
              if (customerNameParts[1] && customerNameParts[1] !== null) {
                whereclauses = {
                  ...whereclauses,
                  [Op.and]: {
                    firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".first_name')), 'LIKE', '%' + customerNameParts?.[0].toLowerCase() + '%'),
                    lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".last_name')), 'LIKE', '%' + customerNameParts[1].toLowerCase() + '%')
                  }
                }
              } else {
                whereclauses = {
                  ...whereclauses,
                  [Op.and]: {
                    firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".first_name')), 'LIKE', '%' + customerNameParts?.[0].toLowerCase() + '%')
                  }
                }
              }
              // })
            } else if (record.id === 'emailId') {
              contactClauses.emailId = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"customerContact".email_id'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'mobileNo') {
              contactClauses.mobileNo = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('"customerContact".mobile_no'), 'varchar'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toString()}%`
                })]
              }
            } else if (record.id === 'customerNo') {
              whereclauses.customerNo = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"Customer".customer_no'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            }
          }
        }
      }

      const custDet = await conn.Customer.findAll({
        attributes: [
          'customerId', 'customerNo', 'customerUuid', 'customerRefNo', 'status', 'firstName',
          'lastName', 'customerAge', 'gender', 'birthDate', 'idType', 'idValue', 'customerCategory',
          'customerClass', 'customerMaritalStatus', 'occupation', 'registeredNo', 'registeredDate',
          'nationality', 'customerPhoto', 'taxNo', 'billable', 'customerStatusReason', 'contactPreferences', 'businessName'
        ],
        where: {
          ...whereclauses
        },
        ...params,
        logging: false
      })

      const response = {
        rows: custDet
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Customer Details fetched Successfully',
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

  async recentActivities({ customerUuid }, userId, conn) {
    try {
      const now = new Date()

      const lastWeekDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)

      const whereObj = {
        updatedAt: {
          [Op.gte]: lastWeekDate
        }
      }

      const includes = [
        [conn.Contact, 'customerContact', 'Contact'], [conn.Address, 'customerAddress', 'Address'],
        [conn.CustAccounts, 'customerAccounts', 'Account'],
        [conn.CustServices, 'customerServices', 'Service'], [conn.Interaction, 'interactionDetails', 'Interaction'],
        [conn.BillableDetails, 'billableDetails', 'Billing details']
      ]

      const customer = await conn.Customer.findOne({
        where: {
          customerUuid
        },
        include: includes.map(include => ({ model: include[0], required: false, as: include[1], where: whereObj, limit: 1 }))
      })

      let data = []
      includes.forEach(include => {
        if (customer[include[1]].length) {
          const status = customer[include[1]][0].createdAt === customer[include[1]][0].updatedAt ? 'created' : 'updated'
          data.push({
            message: `${include[2]} ${status}`,
            date: customer[include[1]][0].updatedAt
          })
        }
      })

      data.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date)
      })

      data = data.map(item => ({ ...item, date: moment(item.date).fromNow() }))

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Recent activities fetched',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getTopCustomerByChannel(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload

      let query = `select 
      sub.customer_name,
      sub.customer_id,
      sub.customer_no,
      sub.customer_category,
      sub.registered_date,
      sub.status,
      be_desc(sub.order_channel) as channel,
      sub.created_at 
  from 
  (
  select distinct cc.customer_id  ,oh.order_channel , concat(cc.first_name,' ',cc.last_name) as customer_name,
        cc.customer_no,
        coalesce(be_desc(cc.customer_category),cc.customer_category) as customer_category,
        be_desc (cc.status) as status,
        cc.registered_date,
        cc.created_at
  from cust_customers cc ,order_hdr oh 
  where cc.customer_id =oh.customer_id 
  )sub
  `

      let whereClause = ' where sub.order_channel = coalesce(null,sub.order_channel) '

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' and CAST(sub.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(sub.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      if (searchParams.startDate || searchParams.endDate) {
        query = query + whereClause
      } else {
        query = query + whereClause
      }

      // console.log('query----channel wise customers--->', query)

      const resp = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      // console.log('resp', resp)

      // response = camelCaseConversion(response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Top Sales By Channel',
        data: resp || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async searchCustomerDetailsHistory(data, userId, conn) {
    try {
      logger.debug('Search Customer details history')
      const searchParams = data.body
      const { limit = 10, page = 0 } = data.query
      const offSet = (page * limit)

      const whereClause = {}
      if (searchParams.customerUuid) {
        whereClause.customerUuid = searchParams.customerUuid
      }
      if (searchParams.customerNo) {
        whereClause.customerNo = searchParams.customerNo
      }
      let userWhereClause
      if (searchParams.filters && Array.isArray(searchParams.filters) && !isEmpty(searchParams.filters)) {
        for (const record of searchParams.filters) {
          if (record.value) {
            if (record.id === 'idType') {
              if (record.filter === 'contains') {
                whereClause.idType = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.idType = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'idValue') {
              if (record.filter === 'contains') {
                whereClause.idValue = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.idValue = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'emailId') {
              if (record.filter === 'contains') {
                whereClause.emailId = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.emailId = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'contactType') {
              if (record.filter === 'contains') {
                whereClause.contactType = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.contactType = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'mobileNo') {
              if (record.filter === 'contains') {
                whereClause.mobileNo = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.mobileNo = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'modifiedBy') {
              if (record.filter === 'contains') {
                userWhereClause = {
                  [Op.or]: {
                    firstName: {
                      [Op.iLike]: `%${record.value}%`
                    },
                    lastName: {
                      [Op.iLike]: `%${record.value}%`
                    }
                  }
                }
              } else {
                userWhereClause = {
                  [Op.or]: {
                    firstName: {
                      [Op.notILike]: `%${record.value}%`
                    },
                    lastName: {
                      [Op.notILike]: `%${record.value}%`
                    }
                  }
                }
              }
            }
          }
        }
      }
      const includeModels = [
        {
          model: conn.User,
          attributes: ['firstName', 'lastName'],
          as: 'updatedByName',
          required: !!userWhereClause,
          where: userWhereClause
        },
        {
          model: conn.User,
          attributes: ['firstName', 'lastName'],
          as: 'createdByName'
        },
        { model: conn.BusinessEntity, attributes: ['description'], as: 'customerCatDesc' },
        { model: conn.BusinessEntity, attributes: ['description'], as: 'idTypeDesc' }

      ]
      let response = await conn.CustomerHistory.findAndCountAll({
        include: [...includeModels, {
          model: conn.ContactHistory,
          as: 'customerContact'
        }],
        where: whereClause,
        offset: offSet,
        limit: Number(limit)
      })
      if (response.count === 0) {
        response = await conn.Customer.findAndCountAll({
          include: [...includeModels,
          {
            model: conn.Contact,
            as: 'customerContact'
          }
          ],
          where: whereClause
        })
      }
      // response.rows.forEach((ele, idx) => {
      //   if (!ele.updatedByName) {
      //     console.log(ele.createdByName)
      //     response.rows[idx].updatedByDesc = ele.createdByName
      //   }
      // })
      logger.debug('Successfully fetch customer details history')
      return {
        message: 'Successfully fetch customer details history',
        data: response,
        status: statusCodeConstants.SUCCESS
      }
    } catch (error) {
      logger.error(error, 'Error while fetching Customer details history')
      return {
        message: 'Error while fetching Customer details history',
        status: statusCodeConstants.ERROR
      }
    }
  }

  async searchCustomerAddressHistory(data, userId, conn) {
    try {
      logger.debug('Search Customer address history')
      const searchParams = data.body
      const { limit = 10, page = 0 } = data.query
      const offSet = (page * limit)

      let userWhereClause
      const whereClause = {
        addressCategoryValue: searchParams.customerNo
      }
      if (searchParams.filters && Array.isArray(searchParams.filters) && !isEmpty(searchParams.filters)) {
        for (const record of searchParams.filters) {
          if (record.value) {
            if (record.id === 'hno') {
              if (record.filter === 'contains') {
                whereClause.hno = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.hno = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'buildingName') {
              if (record.filter === 'contains') {
                whereClause.buildingName = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.buildingName = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'street') {
              if (record.filter === 'contains') {
                whereClause.street = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.street = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'city') {
              if (record.filter === 'contains') {
                whereClause.city = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.city = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'state') {
              if (record.filter === 'contains') {
                whereClause.state = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.state = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'district') {
              if (record.filter === 'contains') {
                whereClause.district = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.district = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'country') {
              if (record.filter === 'contains') {
                whereClause.country = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.country = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'zip') {
              if (record.filter === 'contains') {
                whereClause.zip = { [Op.iLike]: `%${record.value}%` }
              } else {
                whereClause.zip = { [Op.notILike]: `%${record.value}%` }
              }
            } else if (record.id === 'modifiedBy') {
              if (record.filter === 'contains') {
                userWhereClause = {
                  [Op.or]: {
                    firstName: {
                      [Op.iLike]: `%${record.value}%`
                    },
                    lastName: {
                      [Op.iLike]: `%${record.value}%`
                    }
                  }
                }
              } else {
                userWhereClause = {
                  [Op.or]: {
                    firstName: {
                      [Op.notILike]: `%${record.value}%`
                    },
                    lastName: {
                      [Op.notILike]: `%${record.value}%`
                    }
                  }
                }
              }
            }
          }
        }
      }
      const response = await conn.AddressHistory.findAndCountAll({
        include: [
          {
            model: conn.User,
            attributes: ['firstName', 'lastName'],
            as: 'modifiedBy',
            required: !!userWhereClause,
            where: userWhereClause
          },
          {
            model: conn.BusinessEntity,
            attributes: ['description'],
            as: 'countryDesc'
          },
          {
            model: conn.BusinessEntity,
            attributes: ['description'],
            as: 'stateDesc'
          },
          {
            model: conn.BusinessEntity,
            attributes: ['description'],
            as: 'postCodeDesc'
          },
          {
            model: conn.BusinessEntity,
            attributes: ['description'],
            as: 'districtDesc'
          }
        ],
        where: whereClause,
        offset: offSet,
        limit: Number(limit)
      })
      logger.debug('Successfully fetch customer address history')
      return {
        message: 'Successfully fetch customer address history',
        data: response,
        status: statusCodeConstants.SUCCESS
      }
    } catch (error) {
      logger.error(error, 'Error while fetching Customer address history')
      return {
        message: 'Error while fetching customer address history',
        status: statusCodeConstants.ERROR
      }
    }
  }

  async registerCustomer(payload, authorization, tenantId, conn, t) {
    try {
      const { accountType } = payload
      let userObj, customer
      /* personal, existing
       * if personal, check for email/mobile in customer contact, if exists, return already customer error
       * else, create customer and address and check for user using email/mobile, if exists, return already registered
       * else, create user and return registered successfully
       * if existing, check for email/mobile in customer contact, if exists, check for user using email/mobile,
       * if exists, return already registered, else create user and return registered
       */

      const contactPref = await conn.BusinessEntity.findOne({ where: { codeType: 'CONTACT_PREFERENCE' } })

      let registerFrom

      if (accountType === 'personal') {
        const {
          mobileNo, extNo, emailId, title, firstName, lastName, gender,
          birthDate, idType, idValue, address, password, customerPhoto,
          registerFrom: registerFromProp, otp, userGroup
        } = payload
        const user = await conn.User.findOne({
          where: {
            [Op.or]: [{ contactNo: mobileNo }, { email: emailId }],
            userGroup
          }
        })
        const customerContact = await conn.Contact.findOne({
          where: {
            [Op.or]: [{ mobileNo }, { emailId }]
          }
        })

        customer = await conn.Customer.findOne({ where: { idValue } })

        if (user || customer || customerContact) {
          return {
            status: statusCodeConstants.CONFLICT,
            message: 'Customer already exists'
          }
        }

        // if (registerFromProp && ["UAM_SELFCARE", "UAM_MOBILE"].includes(registerFromProp)) {
        //   const isValidOTP = await conn.Otp.findOne({
        //     where: {
        //       reference: mobileNo,
        //       otp,
        //       status: defaultStatus.ACTIVE
        //     }
        //   })

        //   if (!isValidOTP) {
        //     return {
        //       status: statusCodeConstants.VALIDATION_ERROR,
        //       message: 'Oops, provided OTP is incorrect'
        //     }
        //   }
        // }

        const commonAttrs = {
          tranId: uuidv4(),
          createdBy: systemUserId,
          createdDeptId: roleProperties.dept.unitId,
          createdRoleId: systemRoleId
        }

        const customerObj = {
          // title,
          customerCategory: payload?.customerCategory,
          firstName,
          lastName,
          birthDate,
          gender,
          idType,
          idValue,
          contactPreferences: [contactPref.code],
          customerUuid: uuidv4(),
          status: constantCode.customerStatus.TEMPORARY,
          ...commonAttrs
        }

        if (registerFromProp && ['UAM_SELFCARE', 'UAM_MOBILE'].includes(registerFromProp)) {
          customerObj.customerPhoto = customerPhoto
        }

        const createdCustomer = await conn.Customer.create(customerObj, { transaction: t })

        const addressObj = {
          ...address,
          isPrimary: true,
          status: constantCode.status.ACTIVE,
          addressCategory: entityCategory.CUSTOMER,
          addressCategoryValue: createdCustomer.customerNo,
          ...commonAttrs
        }

        const createdAddress = await conn.Address.create(addressObj, { transaction: t })

        const contactObj = {
          // title,
          firstName,
          lastName,
          birthDate,
          emailId,
          isPrimary: true,
          mobileNo,
          status: constantCode.status.ACTIVE,
          contactCategory: entityCategory.CUSTOMER,
          contactCategoryValue: createdCustomer.customerNo,
          ...commonAttrs
        }

        // console.log('contactObj==============>', contactObj)

        const createdContact = await conn.Contact.create(contactObj, { transaction: t })

        console.log('contactObj created')

        userObj = {
          // title: createdCustomer.title,
          firstName: createdCustomer.firstName,
          lastName: createdCustomer.lastName,
          gender,
          email: createdContact.emailId,
          dob: createdCustomer.birthDate,
          country: createdAddress.country,
          contactNo: createdContact.mobileNo,
          extn: extNo,
          loginPassword: password,
          customerId: createdCustomer.customerId,
          customerUuid: createdCustomer.customerUuid
        }

        registerFrom = registerFromProp
      } else if (accountType === 'existing') {
        const { customerNo, birthDate, emailId, mobileNo, extNo, idType, idValue, password } = payload

        customer = await conn.Customer.findOne({
          where: { customerNo, idValue, idType }
        })

        if (!customer) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: 'Customer not found'
          }
        }

        const contact = await conn.Contact.findOne({
          where: { mobileNo, emailId, contactCategory: entityCategory.CUSTOMER, contactCategoryValue: customer.customerNo }
        })

        if (!contact) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: 'Provided details not match with the customer'
          }
        }

        if (!customer?.contactPreferences) {
          await conn.Customer.update({ contactPreferences: [contactPref.code] }, { where: { customerUuid: customer.customerUuid } })
        }

        const user = await conn.User.findOne({
          where: {
            [Op.or]: [{ contactNo: mobileNo }, { email: emailId }]
          }
        })

        if (user) {
          return {
            status: statusCodeConstants.CONFLICT,
            message: 'Customer already registered'
          }
        }

        const address = await conn.Address.findOne({
          where: { addressCategoryValue: customer.customerNo }
        })

        userObj = {
          // title: customer.title,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: emailId,
          dob: birthDate,
          extn: extNo,
          country: address.country,
          gender: customer.gender,
          contactNo: mobileNo,
          loginPassword: password,
          customerId: customer.customerId,
          customerUuid: customer.customerUuid
        }
      }

      userObj.userType = 'UT_CONSUMER'
      userObj.userGroup = 'UG_CONSUMER'
      if (!Array.isArray(payload?.userFamily)) payload.userFamily = [payload.userFamily]
      userObj.userFamily = payload.userFamily
      userObj.userSource = payload.userSource

      const userCreated = await this.createUser(userObj, conn, t)

      return {
        status: userCreated ? statusCodeConstants.SUCCESS : statusCodeConstants.ERROR,
        message: userCreated ? 'Customer get registered' : 'Error in customer registration'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async registerWebselfcareCustomer(payload, conn, t) {
    try {
      let userObj, customer
      const contactPref = await conn.BusinessEntity.findOne({ where: { codeType: 'CONTACT_PREFERENCE' } })
      const { mobileNo, extNo, emailId, firstName, password } = payload
      const user = await conn.User.findOne({
        where: {
          [Op.or]: [{ contactNo: mobileNo }, { email: emailId }]
        }
      })
      const customerContact = await conn.Contact.findOne({
        where: {
          [Op.or]: [{ mobileNo }, { emailId }]
        }
      })
      if (user || customerContact) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Customer already exists'
        }
      }
      const commonAttrs = {
        tranId: uuidv4(),
        createdBy: systemUserId,
        createdDeptId: roleProperties.dept.unitId,
        createdRoleId: systemRoleId
      }
      const customerObj = {
        firstName,
        contactPreferences: [contactPref.code],
        customerUuid: uuidv4(),
        status: constantCode.customerStatus.PROSPECT,
        ...commonAttrs
      }
      const createdCustomer = await conn.Customer.create(customerObj, { transaction: t })
      const contactObj = {
        firstName,
        emailId,
        mobileNo,
        status: constantCode.status.ACTIVE,
        contactCategory: entityCategory.CUSTOMER,
        contactCategoryValue: createdCustomer.customerNo,
        ...commonAttrs
      }
      const createdContact = await conn.Contact.create(contactObj, { transaction: t })
      userObj = {
        firstName: createdCustomer.firstName,
        lastName: createdCustomer.firstName,
        gender: 'M',
        email: createdContact.emailId,
        dob: new Date(),
        country: 'Brunei',
        contactNo: createdContact.mobileNo,
        extn: extNo,
        loginPassword: password,
        customerId: createdCustomer.customerId,
        customerUuid: createdCustomer.customerUuid
      }
      userObj.userType = 'UT_CONSUMER'
      userObj.userGroup = 'UG_CONSUMER'
      if (!Array.isArray(payload?.userFamily)) payload.userFamily = [payload.userFamily]
      userObj.userFamily = payload?.userFamily
      userObj.userSource = payload?.userSource

      const userCreated = await this.createUser(userObj, conn, t)
      return {
        status: userCreated ? statusCodeConstants.SUCCESS : statusCodeConstants.ERROR,
        message: userCreated ? 'Webselfcare Customer get registered' : 'Error in webselfcare customer registration'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async registerWebselfcare(payload, conn, t) {
    try {
      const { mobileNo, extNo, emailId, firstName, lastName, password, accountType } = payload
      if (!mobileNo || !emailId || !accountType) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      /** Check Existing User */
      const checkExistingUser = await conn.User.findOne({
        where: {
          [Op.or]: [{ contactNo: mobileNo }, { email: emailId }]
        }
      })

      /** Check Existing Customer */
      const checkExistingCustomer = await conn.Customer.findOne({
        include: [{
          model: conn.Contact,
          as: 'customerContact',
          where: {
            [Op.or]: [{ mobileNo }, { emailId }]
          }
        },
        {
          model: conn.CustServices,
          as: 'customerServices'
        }
        ]
      })

      /** Check Existing Profile */
      const checkExistingProfile = await conn.Profile.findOne({
        include: [{
          model: conn.Contact,
          as: 'profileContact',
          where: {
            [Op.or]: [{ mobileNo }, { emailId }]
          }
        }]
      })

      const commonAttrs = {
        tranId: uuidv4(),
        createdBy: systemUserId,
        createdDeptId: roleProperties.dept.unitId,
        createdRoleId: systemRoleId
      }

      if (checkExistingUser) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'The user is already registered. Please login'
        }
      }

      if (!checkExistingUser && checkExistingCustomer && accountType === constantCode.common.PERSONAL) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Customer already exists. Please try to register with existing'
        }
      }

      if (!checkExistingUser && checkExistingProfile && accountType === constantCode.common.EXISTING) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Profile already exists. Please try to register as a new user.'
        }
      }

      if (!checkExistingUser && !checkExistingCustomer && accountType === constantCode.common.EXISTING) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'We did not find any accounts related to you. Please register with us.'
        }
      }

      // if (!checkExistingUser && checkExistingProfile && accountType === constantCode.common.EXISTING) {
      //   return {
      //     status: statusCodeConstants.CONFLICT,
      //     message: 'Customer is already exist, Please try with personal type'
      //   }
      // }

      if (accountType === constantCode.common.PERSONAL && !checkExistingCustomer && !checkExistingProfile) {
        const profileObj = {
          firstName,
          lastName,
          nationality: 'Brunei',
          ...commonAttrs
        }
        const createProfile = await conn.Profile.create(profileObj, { transaction: t })
        if (createProfile) {
          const contactObj = {
            firstName,
            lastName,
            emailId,
            mobileNo,
            status: constantCode.status.ACTIVE,
            contactCategory: entityCategory.PROFILE,
            contactCategoryValue: createProfile.profileNo,
            isPrimary: true,
            ...commonAttrs
          }
          const contact = await conn.Contact.create(contactObj, { transaction: t })
        }
      }

      const userObj = {
        firstName: checkExistingCustomer?.firstName || checkExistingProfile?.firstName || firstName,
        lastName: checkExistingCustomer?.lastName || checkExistingProfile?.lastName || lastName,
        gender: checkExistingCustomer?.gender || checkExistingProfile?.gender || payload?.gender || 'NTP',
        email: emailId,
        dob: new Date(),
        activationDate: new Date(),
        country: 'Brunei',
        contactNo: mobileNo,
        extn: extNo,
        loginPassword: password,
        customerId: checkExistingCustomer?.customerId || null,
        customerUuid: checkExistingCustomer?.customerUuid || null,
        userType: 'UT_CONSUMER',
        userGroup: 'UG_CONSUMER',
        userSource: payload?.userSource,
        userFamily: !(Array.isArray(payload?.userFamily)) ? [payload.userFamily] : payload.userFamily
      }
      // if (!Array.isArray(payload?.userFamily)) payload.userFamily = [payload.userFamily]
      // userObj.userFamily = payload?.userFamily
      // userObj.userSource = payload?.userSource

      const userCreated = await this.createUser(userObj, conn, t)
      return {
        status: userCreated ? statusCodeConstants.SUCCESS : statusCodeConstants.ERROR,
        message: userCreated ? 'Webselfcare Customer get registered' : 'Error in webselfcare customer registration'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async validateWebselfCare(payload, conn) {
    try {
      const { mobileNo, emailId, accountType } = payload
      if (!mobileNo || !emailId || !accountType) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      /** Check Existing User */
      const checkExistingUser = await conn.User.findOne({
        where: {
          [Op.or]: [{ contactNo: mobileNo }, { email: emailId }]
        }
      })

      /** Check Existing Customer */
      const checkExistingCustomer = await conn.Customer.findOne({
        include: [{
          model: conn.Contact,
          as: 'customerContact',
          where: {
            [Op.or]: [{ mobileNo }, { emailId }]
          }
        },
        {
          model: conn.CustServices,
          as: 'customerServices'
        }
        ]
      })

      /** Check Existing Profile */
      const checkExistingProfile = await conn.Profile.findOne({
        include: [{
          model: conn.Contact,
          as: 'profileContact',
          where: {
            [Op.or]: [{ mobileNo }, { emailId }]
          }
        }]
      })

      if (checkExistingUser) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'The user is already registered. Please login'
        }
      }

      if (!checkExistingUser && checkExistingCustomer && accountType === constantCode.common.PERSONAL) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Customer already exists. Please try to register with existing'
        }
      }

      if (!checkExistingUser && checkExistingProfile && accountType === constantCode.common.EXISTING) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Profile already exists. Please try to register as a new user.'
        }
      }

      if (!checkExistingUser && !checkExistingCustomer && accountType === constantCode.common.EXISTING) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'We did not find any accounts related to you. Please register with us.'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Verified'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateCustomer(payload, customerUuid, userObj, conn, t) {
    try {
      if (!userObj?.userId) userObj.userId = systemUserId
      if (!userObj?.createdRoleId) userObj.createdRoleId = systemRoleId
      if (!userObj?.createdDeptId) userObj.createdDeptId = systemDeptId

      const includes = [
        [conn.Contact, 'customerContact', 'Contact'], [conn.Address, 'customerAddress', 'Address'],
        [conn.BusinessEntity, 'statusDesc', 'Status']
      ]

      const customer = await conn.Customer.findOne({
        where: {
          customerUuid
        },
        include: includes.map(include => ({ model: include[0], required: false, as: include[1] }))
      })

      if (!customer) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Customer not found'
        }
      }

      if (payload?.contact) {
        if ((customer?.customerContact[0]?.mobileNo && payload?.contact?.mobileNo !== customer?.customerContact[0]?.mobileNo) || (customer?.customerContact[0]?.emailId && payload?.contact?.emailId !== customer?.customerContact[0]?.emailId)) {
          const checkExistingUser = await conn.User.findOne({
            where: {
              [Op.or]: [{ contactNo: payload?.contact?.mobileNo /* customer?.customerContact[0]?.mobileNo */ }, { email: payload?.contact?.emailId /* customer?.customerContact[0]?.emailId */ }, { customerId: customer?.customerId }],
              userCategory: 'UC_CONSUMER',
              status: constantCode.status.ACTIVE
            }
          })

          if (checkExistingUser) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'This customer is already associated with the login'
            }
          }
        }
      }
      // console.log('payload.contact.mobileNo------->', payload?.contact?.mobileNo)
      if (payload?.contact?.mobileNo && payload?.contact?.emailId && !payload?.details?.source) {
        const checkExistingContact = await conn.Contact.findOne({
          where: {
            [Op.or]: [
              { mobileNo: payload.contact.mobileNo },
              { emailId: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email_id')), '=', payload.contact.emailId.toLowerCase()) }
            ],
            contactCategoryValue: {
              [Op.ne]: customer.customerNo
            },
            contactCategory: entityCategory.CUSTOMER,
            status: [defaultStatus.ACTIVE, defaultStatus.PENDING]
          },
          logging: true
        })

        if (checkExistingContact) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'There is an existing customer with same Email / Mobile Number'
          }
        }
      }

      let { userId, createdRoleId, createdDeptId } = userObj

      createdRoleId = createdRoleId || systemRoleId
      createdDeptId = createdDeptId || roleProperties.dept.unitId || systemDeptId

      const tranId = uuidv4()

      const historyAttrs = {
        historyInsertedDate: new Date(),
        tranId,
        historyTranId: tranId
      }

      if (customer.status !== constantCode.customerStatus.TEMPORARY) {
        if (payload.details?.idType || payload.details?.idValue) {
          if (customer?.idType !== payload.details?.idType && customer?.idValue !== payload.details?.idValue) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `Id Type and Value update is not allowed when customer in ${customer.Status?.description} status`
            }
          }
        }
      }

      if (payload.details) {
        if (customer.idType) {
          delete payload.details.idType
        }
        if (customer.idValue) {
          delete payload.details.idValue
        }
        const notSameDetails = compareRecords(customer, payload.details, customerFields)
        if (notSameDetails) {
          const customerData = transformRecord(customer, payload.details, customerFields)
          customerData.updatedBy = userObj.userId
          const updatedCustomer = await conn.Customer.update(customerData, { where: { customerUuid }, returning: true, plain: true, transaction: t })
          updatedCustomer._previousDataValues = updatedCustomer[1]._previousDataValues
          updatedCustomer._previousDataValues = { ...updatedCustomer._previousDataValues, ...historyAttrs }
          await conn.CustomerHistory.create(updatedCustomer._previousDataValues, { transaction: t })
        }
      }

      let addressUpdate
      let contactUpdate
      if (payload.address) {
        const addCats = {
          tranId,
          addressCategory: entityCategory.CUSTOMER,
          addressCategoryValue: customer.customerNo
        }
        addressUpdate = await this.createOrUpdateAddress(payload.address, addCats, customer, conn, userId, createdRoleId, createdDeptId, historyAttrs, t)
      }

      if (payload.contact) {
        const conCats = {
          tranId,
          contactCategory: entityCategory.CUSTOMER,
          contactCategoryValue: customer.customerNo
        }
        contactUpdate = await this.createOrUpdateContact(payload.contact, conCats, customer, conn, userId, createdRoleId, createdDeptId, historyAttrs, t)
      }

      if (payload?.attachment) {
        if (Array.isArray(payload?.attachment) && payload?.attachment.length > 0) {
          for (const entityId of payload?.attachment) {
            console.log(entityId, customer.customerNo, entityCategory.CUSTOMER)
            await findAndUpdateAttachment(entityId, customer.customerNo, entityCategory.CUSTOMER, conn, t)
          }
        }
      }

      const data = {
        customerNo: customer.customerNo,
        addressNo: addressUpdate?.addressNo || payload?.address?.addressNo,
        contactNo: contactUpdate?.contactNo || payload?.contact?.contactNo
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Customer Details updated',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCustomerRevenue(payload, conn) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const getAllservice = await conn.CustServices.findAll({
        where: {
          customerUuid: payload?.customerUuid
        }
      })
      if (getAllservice?.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No service is mapped to customer'
        }
      }
      // console.log('getAllservice', getAllservice)
      const getAllProduct = getAllservice.map((e) => { return e.planPayload })
      const getProductCharge = await conn.ProductCharge.findAll({
        include: [{
          model: conn.Charge,
          as: 'chargeDetails',
          attributes: ['currency'],
          include: [{
            model: conn.BusinessEntity, as: 'currencyDesc', attributes: ['code', 'description']
          }]
        }],
        where: {
          productId: getAllProduct || []
        }
      })
      // console.log('getProductCharge==', JSON.stringify(getProductCharge))
      const totalAmount = getProductCharge.reduce((acc, o) => acc + parseInt(o.chargeAmount), 0)
      let currency

      getProductCharge.filter((curr) => {
        currency = curr?.chargeDetails?.currencyDesc?.description
      })
      const averageAmount = totalAmount / getProductCharge.length
      // console.log('currency==', currency)
      const data = {
        totalAmount: totalAmount || 0,
        averageAmount: averageAmount || 0,
        currency
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully fetched customer revenue details',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyCustomers(payload, conn) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      // console.log('payload',payload)
      const emailIds = payload.list.map((x) => x.emailId)
      // console.log('emailIds',emailIds)
      const mobileNos = payload.list.map((x) => x.mobileNo)
      // console.log('mobileNos',mobileNos)
      const idValues = payload.list.map((x) => String(x.idValue))
      // console.log('idValues',idValues)
      const postcodes = payload.list.map((x) => String(x.postcode))
      // console.log('postcodes',postcodes)
      const getAllIdValues = await conn.Customer.findAll({
        attributes: ['customerId', 'idValue'],
        where: {
          idValue: idValues
        },
        raw: true
      })

      const getAllEmailIds = await conn.Contact.findAll({
        attributes: ['contactId', 'emailId'],
        where: {
          emailId: emailIds
        },
        raw: true
      })

      const getAllMobileNos = await conn.Contact.findAll({
        attributes: ['contactId', 'mobileNo'],
        where: {
          mobileNo: mobileNos
        },
        raw: true
      })

      const getAllPostcodes = await conn.AddressLookup.findAll({
        where: {
          postCode: postcodes
        },
        raw: true
      })

      const oldIdValues = getAllIdValues.map((x) => x.idValue)
      // console.log('oldIdValues',oldIdValues)
      const oldMobileNos = getAllMobileNos.map((x) => x.mobileNo)
      // console.log('oldMobileNos',oldMobileNos)
      const oldEmailIds = getAllEmailIds.map((x) => x.emailId)
      // console.log('oldEmailIds',oldEmailIds)
      const oldPostcodes = getAllPostcodes.map((x) => x.postCode)
      // console.log('oldPostcodes',oldPostcodes)

      const businessEntityCodes = await conn.BusinessEntity.findAll({
        attributes: ['code', 'description'],
        where: {
          codeType: ['CUSTOMER_CATEGORY', 'GENDER', 'CUSTOMER_CLASS', 'MARITAL_STATUS', 'CUSTOMER_ID_TYPE', 'CONTACT_PREFERENCE', 'ADDRESS_TYPE']
        },
        raw: true
      })

      const response = []

      for (const cust of payload.list) {
        let status = 'SUCCESS'
        let remark = null
        let addressData = {}
        const customerData = { ...cust, codes: {} }
        if (oldIdValues.includes(String(cust.idValue))) {
          status = 'FAILED'
          remark = 'Duplicate ID Value'
        }
        if (status === 'SUCCESS' && oldMobileNos.includes(cust.mobileNo)) {
          status = 'FAILED'
          remark = 'Duplicate Mobile No'
        }
        if (status === 'SUCCESS' && oldEmailIds.includes(cust.emailId)) {
          status = 'FAILED'
          remark = 'Duplicate Email ID'
        }
        if (status === 'SUCCESS' && !oldPostcodes.includes(String(cust.postcode))) {
          status = 'FAILED'
          remark = 'Postcode Not Availale'
        }
        if (status === 'SUCCESS' && cust?.customerCategory) {
          const customerCategoryData = businessEntityCodes.find((x) => x.description === cust?.customerCategory)
          if (customerCategoryData) {
            customerData.codes.customerCategoryCode = customerCategoryData.code
          } else {
            status = 'FAILED'
            remark = 'Customer Category Not Availale'
          }
        }
        if (status === 'SUCCESS' && cust?.gender) {
          const genderData = businessEntityCodes.find((x) => x.description === cust?.gender)
          if (genderData) {
            customerData.codes.genderCode = genderData.code
          } else {
            status = 'FAILED'
            remark = 'Gender Not Availale'
          }
        }
        if (status === 'SUCCESS' && cust?.customerClass) {
          const customerClassData = businessEntityCodes.find((x) => x.description === cust?.customerClass)
          if (customerClassData) {
            customerData.codes.customerClassCode = customerClassData.code
          } else {
            status = 'FAILED'
            remark = 'Customer Class Not Availale'
          }
        }
        if (status === 'SUCCESS' && cust?.customerMaritalStatus) {
          const customerMaritalStatusData = businessEntityCodes.find((x) => x.description === cust?.customerMaritalStatus)
          if (customerMaritalStatusData) {
            customerData.codes.customerMaritalStatusCode = customerMaritalStatusData.code
          } else {
            status = 'FAILED'
            remark = 'Martial Status Not Availale'
          }
        }
        if (status === 'SUCCESS' && cust?.idType) {
          const idTypeData = businessEntityCodes.find((x) => x.description === String(cust?.idType))
          if (idTypeData) {
            customerData.codes.idTypeCode = idTypeData.code
          } else {
            status = 'FAILED'
            remark = 'ID Type Not Availale'
          }
        }
        if (status === 'SUCCESS' && cust?.contactPreference) {
          const contactPreferenceData = businessEntityCodes.find((x) => x.description === cust?.contactPreference)
          if (contactPreferenceData) {
            customerData.codes.contactPreferenceCode = contactPreferenceData.code
          } else {
            status = 'FAILED'
            remark = 'Contact Preference Not Availale'
          }
        }
        if (status === 'SUCCESS' && cust?.addressType) {
          const addressTypeData = businessEntityCodes.find((x) => x.description === cust?.addressType)
          if (addressTypeData) {
            customerData.codes.addressTypeCode = addressTypeData.code
          } else {
            status = 'FAILED'
            remark = 'Address Type Not Availale'
          }
        }
        if (status === 'SUCCESS' && cust.postcode) {
          addressData = getAllPostcodes.find((x) => x.postCode === String(cust.postcode))
        }
        response.push({
          ...customerData,
          addressData,
          validationStatus: status,
          validationRemark: remark
        })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully fetched customer revenue details',
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

  async createBulkCustomer(payload, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      // console.log('payload',payload)
      const bulkUploadData = {
        uploadTableName: 'CUSTOMER',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: payload?.userId
      }
      // console.log('bulkUploadData',bulkUploadData)
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      // console.log('bulkUploadCreate',bulkUploadCreate)

      for (const cust of payload.list) {
        const requestBody = {
          details: {
            customerRefNo: cust?.customerRefNo,
            customerMaritalStatusCode: cust?.codes?.customerMaritalStatusCode,
            source: 'CREATE_CUSTOMER',
            firstName: cust?.firstName,
            lastName: cust?.lastName,
            gender: cust?.codes?.genderCode,
            birthDate: cust?.birthDate,
            idType: cust?.codes?.idTypeCode,
            idValue: String(cust?.idValue),
            customerCategory: cust?.codes?.customerCategoryCode,
            registeredNo: cust?.registeredNo || null,
            registeredDate: cust?.registeredDate || null,
            customerClass: cust?.codes?.customerClassCode,
            nationality: cust?.nationality,
            contactPreferences: [cust?.codes?.contactPreferenceCode]
          },
          address: {
            isPrimary: true,
            addressType: cust?.codes?.addressTypeCode,
            address1: cust?.address1,
            address2: cust?.address2,
            address3: cust?.address3,
            city: cust?.addressData?.city,
            state: cust?.addressData?.state,
            district: cust?.addressData?.district,
            country: cust?.addressData?.country,
            postcode: cust?.addressData?.postCode,
            latitude: cust?.latitude,
            longitude: cust?.longitude
          },
          contact: {
            isPrimary: true,
            firstName: cust?.firstName,
            lastName: cust?.lastName,
            emailId: cust?.emailId,
            mobilePrefix: cust?.mobilePrefix,
            mobileNo: cust?.mobileNo,
            telephonePrefix: cust?.telephonePrefix,
            telephoneNo: cust?.telephoneNo,
            whastappNoPrefix: cust?.whastappNoPrefix,
            whastappNo: cust?.whastappNo,
            fax: cust?.fax,
            facebookId: cust?.facebookId,
            instagramId: cust?.instagramId,
            telegramId: cust?.telegramId
          }
        }
        // console.log('requestBody',requestBody)
        const customerResponse = await this.createCustomer(requestBody, payload.departmentId, payload.roleId, payload.userId, conn, t)
        if (customerResponse) {
          const bulkUploadCustTempData = {
            ...cust,
            status: 'CS_ACTIVE',
            customerTranId: customerResponse?.data?.customerTranId,
            customerCreatedDeptId: payload?.departmentId,
            customerCreatedRoleId: payload?.roleId,
            customerCreateBy: payload?.userId,
            customerUuid: customerResponse?.data?.customerUuid
          }
          // console.log('bulkUploadCustTempData',bulkUploadCustTempData)
          await conn.BulkCustomerTemp.create(bulkUploadCustTempData, { transaction: t })
        }
        // console.log('customerResponse',customerResponse)
      }
      // console.log('bulkUploadCreate',bulkUploadCreate)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully fetched customer revenue details',
        data: bulkUploadCreate
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async deactivateCustomer(payload, customerUuid, userObj, conn, t) {
    try {
      const includes = [
        [conn.Contact, 'customerContact', 'Contact'], [conn.Address, 'customerAddress', 'Address'],
        [conn.BusinessEntity, 'statusDesc', 'Status']
      ]

      const customer = await conn.Customer.findOne({
        where: {
          customerUuid
        },
        include: includes.map(include => ({ model: include[0], required: false, as: include[1] }))
      })

      if (!customer) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Customer not found'
        }
      }

      const currentActiveServices = await conn.CustServices.findOne({
        where: {
          customerId: customer?.customerId,
          status: constantCode.serviceStatus.ACTIVE
        },
        raw: true
      })

      if (currentActiveServices) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'There are active services available for the customer'
        }
      }
      const whereClauseCalculation = {
        billingStatus: 'PENDING',
        customerUuid
      }

      const whereClause = {
        invoiceStatus: 'OPEN',
        billingStatus: 'BILLED',
        customerUuid
      }

      const coutntableDatas = await conn.Invoice.findAndCountAll({
        attributes: [
          [conn.sequelize.fn('sum', conn.sequelize.col('adv_amount')), 'advanceTotal'],
          [conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invOsAmtTotal'],
          [conn.sequelize.fn('sum', conn.sequelize.col('inv_amt')), 'invAmtTotal']
        ],
        where: whereClauseCalculation,
        raw: true
      })

      if (coutntableDatas?.count !== 0) {
        const sumOfPrevious = await conn.Invoice.findAll({
          attributes: [
            [conn.sequelize.fn('sum', conn.sequelize.col('inv_os_amt')), 'invAmtTotal']
          ],
          where: whereClause,
          raw: true
        })
        const totalOutstanding = (Number(coutntableDatas.rows[0].invOsAmtTotal) -
          Number(coutntableDatas.rows[0].advanceTotal) || 0) <= 0
          ? 0
          : (Number(coutntableDatas.rows[0].invOsAmtTotal) -
            Number(coutntableDatas.rows[0].advanceTotal)) + Number(sumOfPrevious[0].invAmtTotal) || 0

        if (totalOutstanding > 0) {
          return {
            status: statusCodeConstants.ERROR,
            message: 'Cannot De-Activate Customer as there is an outstanding amount to pay'
          }
        }
      }
      let { userId, createdRoleId, createdDeptId } = userObj
      createdRoleId = createdRoleId || systemRoleId
      createdDeptId = createdDeptId || roleProperties.dept.unitId

      const tranId = uuidv4()

      const historyAttrs = {
        historyInsertedDate: new Date(),
        tranId,
        historyTranId: tranId
      }

      if (payload.details) {
        const customerData = transformRecord(customer, payload.details, customerFields)
        customerData.updatedBy = userObj.userId
        customerData.status = constantCode.customerStatus.IN_ACTIVE
        const updatedCustomer = await conn.Customer.update(customerData, { where: { customerUuid }, returning: true, plain: true, transaction: t })
        updatedCustomer._previousDataValues = updatedCustomer[1]._previousDataValues
        updatedCustomer._previousDataValues = { ...updatedCustomer._previousDataValues, ...historyAttrs, status: constantCode.status.IN_ACTIVE }
        await conn.CustomerHistory.create(updatedCustomer._previousDataValues, { transaction: t })
      }

      await conn.Address.update({ status: constantCode.status.IN_ACTIVE }, { where: { addressCategoryValue: customer.customerNo }, returning: true, plain: true, transaction: t })
      await conn.Contact.update({ status: constantCode.status.IN_ACTIVE }, { where: { contactCategoryValue: customer.customerNo }, returning: true, plain: true, transaction: t })
      await conn.CustAccounts.update({ status: constantCode.customerStatus.IN_ACTIVE }, { where: { customerId: customer?.customerId }, returning: true, plain: true, transaction: t })
      await conn.CustServices.update({ status: constantCode.serviceStatus.IN_ACTIVE }, { where: { customerId: customer?.customerId }, returning: true, plain: true, transaction: t })

      const data = {
        customerNo: customer.customerNo
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Customer De-Activated Successfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createOrUpdateAddress(addressObj, addCats, customer, conn, userId, createdRoleId, createdDeptId, historyAttrs, t) {
    let updatedAddress
    if (addressObj.addressNo) {
      const existingAddress = customer.customerAddress.find(x => x.addressNo === addressObj.addressNo)
      const notSameAddress = compareRecords(existingAddress, addressObj, addressFields)
      // console.log('existingAddress ', existingAddress)
      // console.log('notSameAddress ', notSameAddress)
      if (notSameAddress) {
        const transformedAddress = transformRecord(existingAddress, addressObj, addressFields)
        const address = {
          ...transformedAddress, ...addCats, updatedBy: userId
        }
        // console.log('address ', address)
        if (address.hasOwnProperty('isPrimary')) {
          await conn.Address.update({ isPrimary: false }, { where: { addressCategoryValue: customer.customerNo }, transaction: t })
        }
        updatedAddress = await conn.Address.update(address, { where: { addressNo: addressObj.addressNo }, returning: true, plain: true, transaction: t })
        updatedAddress._previousDataValues = { ...updatedAddress[1]._previousDataValues, ...historyAttrs }
        await conn.AddressHistory.create(updatedAddress._previousDataValues, { transaction: t })
      }
    } else {
      addressObj = {
        ...addressObj, ...addCats, status: constantCode.status.ACTIVE, createdBy: userId, createdRoleId, createdDeptId, isPrimary: true
      }
      await conn.Address.update({ isPrimary: false }, { where: { addressCategoryValue: customer.customerNo }, transaction: t })
      updatedAddress = await conn.Address.create(addressObj, { transaction: t })
      updatedAddress.dataValues = { ...updatedAddress.dataValues, ...historyAttrs }
      await conn.AddressHistory.create(updatedAddress.dataValues, { transaction: t })
    }
    return updatedAddress
  }

  async createOrUpdateContact(contactObj, conCats, customer, conn, userId, createdRoleId, createdDeptId, historyAttrs, t) {
    let updatedContact
    if (contactObj.contactNo) {
      const existingContact = customer.customerContact.find(x => x.contactNo === contactObj.contactNo)
      const notSameContact = compareRecords(existingContact, contactObj, contactFields)
      if (notSameContact) {
        const transformedContact = transformRecord(existingContact, contactObj, contactFields)
        const contact = {
          ...transformedContact, ...conCats, updatedBy: userId
        }
        if (contact.hasOwnProperty('isPrimary')) {
          await conn.Contact.update({ isPrimary: false }, { where: { contactCategoryValue: conCats.contactCategoryValue }, transaction: t })
        }
        updatedContact = await conn.Contact.update(contact, { where: { contactNo: contactObj.contactNo }, returning: true, plain: true, transaction: t })
        updatedContact._previousDataValues = { ...updatedContact[1]._previousDataValues, ...historyAttrs }
        await conn.ContactHistory.create(updatedContact._previousDataValues, { transaction: t })
      }
    } else {
      contactObj = {
        ...contactObj, ...conCats, status: constantCode.status.ACTIVE, createdBy: userId, createdRoleId, createdDeptId, isPrimary: true
      }
      await conn.Contact.update({ isPrimary: false }, { where: { contactCategoryValue: conCats.contactCategoryValue }, transaction: t })

      updatedContact = await conn.Contact.create(contactObj, { transaction: t })
      updatedContact.dataValues = { ...updatedContact.dataValues, ...historyAttrs }
      await conn.ContactHistory.create(updatedContact.dataValues, { transaction: t })
    }
    return updatedContact
  }

  async deleteAddressContactValidator(payload, customerUuid, userObj, conn, t) {
    try {
      const customer = await conn.Customer.findOne({
        where: {
          customerUuid
        }
      })

      if (!customer) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Customer not found'
        }
      }

      let message
      // const { userId, createdRoleId, createdDeptId } = userObj;
      // const tranId = uuidv4();

      // const historyAttrs = {
      //   historyInsertedDate: new Date(),
      //   tranId,
      //   historyTranId: tranId
      // }
      if (payload.address) {
        const whereObj = { where: { addressNo: payload.address.addressNo } }
        const address = await conn.Address.findOne(whereObj)
        if (address.isPrimary) {
          return {
            status: statusCodeConstants.ERROR,
            message: 'Primary address cannot be deleted'
          }
        }
        await conn.Address.destroy(whereObj)

        message = 'Address deleted'
      }

      if (payload.contact) {
        const whereObj = { where: { contactNo: payload.contact.contactNo } }
        const contact = await conn.Contact.findOne(whereObj)
        if (contact.isPrimary) {
          return {
            status: statusCodeConstants.ERROR,
            message: 'Primary contact cannot be deleted'
          }
        }
        await conn.Contact.destroy(whereObj)
        message = 'Contact deleted'
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createUser(user, conn, t) {
    try {
      const response = await conn.BcaeAppConfig.findOne({
        attributes: ['appDefaultRole', 'appDefaultDepartment'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })
      console.log('response----->', response)
      const inviteToken = this.cryptoHelper.createHmac(user)
      const loginid = await generateUserId(user.email, conn)
      const password = this.cryptoHelper.hashPassword(user.loginPassword)
      const mappingPayload = { userDeptRoleMapping: [{ roleId: [response?.appDefaultRole], unitId: response?.appDefaultDepartment }] }
      // const mappingPayload = { userDeptRoleMapping: [{ roleId: [roleProperties.role.unitId], unitId: roleProperties.dept.unitId }] }

      const users = {
        ...user,
        status: constantCode.status.ACTIVE,
        loginid,
        loginPassword: password,
        mappingPayload,
        biAccess: user.biAccess === true ? constantCode.common.YES : constantCode.common.NO,
        whatsappAccess: user.whatsappAccess === true ? constantCode.common.YES : constantCode.common.NO,
        createdBy: systemUserId,
        updatedBy: systemUserId
      }

      const createdUser = await conn.User.create(users, { transaction: t })

      if (createdUser) {
        logger.debug('Sending Email')

        const notificationData =
        {
          userId: createdUser.userId,
          loginId: createdUser.loginid,
          firstName: user.firstName,
          domainURL: webSelfCareURL,
          email: user.email,
          loginPassword: user.loginPassword,
          inviteToken,
          type: 'CREATE-USER',
          channel: 'WEB',
          notifiationSource: 'USER',
          createdBy: systemUserId,
          tranId: uuidv4(),
          createdDeptId: roleProperties.dept.unitId,
          createdRoleId: systemRoleId
        }

        em.emit('USER_CREATED', notificationData, conn)
        return true
      }
      return false
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async createCustomer(payload, departmentId, roleId, userId, conn, t) {
    try {
      departmentId = departmentId || systemDeptId
      userId = userId || systemUserId
      roleId = roleId || systemRoleId

      if (!payload.details) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const payloads = payload.details
      if (payloads?.idValue) {
        let checkExistingCustomer = await conn.Customer.findOne({
          where: {
            idType: payloads.idType,
            idValue: payloads.idValue
          },
          order: [['customerId', 'DESC']]
        })
        checkExistingCustomer = checkExistingCustomer?.dataValues ?? checkExistingCustomer

        if (checkExistingCustomer && checkExistingCustomer.status !== constantCode.customerStatus.TEMPORARY) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'There is an customer available with provided Id type and Value'
          }
        }
        // else if (checkExistingCustomer && checkExistingCustomer.status === constantCode.customerStatus.TEMPORARY) {
        //   await conn.CustAccounts.destroy({
        //     where: {
        //       customerId: checkExistingCustomer.customerId
        //     }
        //   })
        //   await conn.Contact.destroy({
        //     where: {
        //       contactCategoryValue: checkExistingCustomer.customerNo
        //     }
        //   })

        //   await conn.Address.destroy({
        //     where: {
        //       addressCategoryValue: checkExistingCustomer.customerNo
        //     }
        //   })

        //   await conn.Customer.destroy({
        //     where: {
        //       idType: payloads.idType,
        //       idValue: payloads.idValue
        //     }
        //   })
        // }
      }

      if (payload?.contact?.mobileNo || payload?.contact?.emailId) {
        const whereClause = []
        if (payload?.contact?.mobileNo) whereClause.push({ mobileNo: payload.contact.mobileNo })
        if (payload?.contact?.mobileNo) whereClause.push({ emailId: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email_id')), '=', payload.contact.emailId.toLowerCase()) })
        const checkExistingContact = await conn.Contact.findOne({
          logging: true,
          where: {
            [Op.or]: whereClause,
            contactCategory: entityCategory.CUSTOMER,
            status: [defaultStatus.ACTIVE, defaultStatus.PENDING]
          }
        })

        if (checkExistingContact) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'There is an active customer for provided Email / Mobile Number'
          }
        }
      }

      const tranId = uuidv4()
      const commonAttrs = {
        tranId,
        createdBy: userId || systemUserId || 1,
        createdDeptId: departmentId || roleProperties.dept.unitId,
        createdRoleId: roleId || systemRoleId || 1
      }

      const historyAttrs = {
        historyInsertedDate: new Date(),
        tranId: commonAttrs.tranId,
        historyTranId: commonAttrs.tranId
      }

      const customerData = {
        customerUuid: uuidv4(),
        status: payloads.status ?? constantCode.customerStatus.TEMPORARY,
        title: payloads.title,
        firstName: payloads.firstName,
        lastName: payloads.lastName,
        customerAge: payloads?.customerAge || null,
        gender: payloads.gender,
        birthDate: payloads.birthDate,
        idType: payloads.idType,
        idValue: payloads.idValue,
        customerCategory: payloads?.customerCategory || null,
        customerClass: payloads?.customerClass || null,
        registeredNo: payloads?.registeredNo || null,
        registeredDate: payloads?.registeredDate || null,
        nationality: payloads?.nationality || null,
        customerPhoto: payloads?.customerPhoto || null,
        taxNo: payloads?.taxNo || null,
        billable: payloads?.billable || null,
        contactPreferences: payloads?.contactPreferences || null,
        customerRefNo: payloads?.customerRefNo || null,
        customerMaritalStatus: payloads?.customerMaritalStatus || null,
        occupation: payloads?.occupation || null,
        ...commonAttrs
      }
      let customerInfo = await conn.Customer.create(customerData, { transaction: t })
      customerInfo = customerInfo?.dataValues ?? customerInfo
      if (customerInfo && payload?.address) {
        const addressPayload = payload?.address
        const addCats = {
          tranId,
          addressCategory: entityCategory.CUSTOMER,
          addressCategoryValue: customerInfo.customerNo
        }

        const addressData = {
          isPrimary: true,
          addressType: addressPayload.addressType,
          address1: addressPayload?.address1 || null,
          address2: addressPayload?.address2 || null,
          address3: addressPayload?.address3 || null,
          addrZone: addressPayload?.addrZone || null,
          city: addressPayload.city,
          district: addressPayload.district,
          state: addressPayload.state,
          postcode: addressPayload.postcode,
          country: addressPayload.country,
          latitude: addressPayload?.latitude || null,
          longitude: addressPayload?.longitude || null,
          billFlag: addressPayload.billFlag || 'N'
        }

        await this.createOrUpdateAddress(addressData, addCats, customerData, conn, userId, roleId, departmentId, historyAttrs, t)
      }

      if (customerInfo && payload?.contact) {
        const contactPayload = payload?.contact
        const conCats = {
          tranId,
          contactCategory: entityCategory.CUSTOMER,
          contactCategoryValue: customerInfo.customerNo
        }

        const contactData = {
          isPrimary: true,
          contactType: contactPayload.contactType,
          title: contactPayload.title,
          firstName: contactPayload.firstName,
          lastName: contactPayload.lastName,
          emailId: contactPayload.emailId,
          mobilePrefix: contactPayload.mobilePrefix,
          mobileNo: contactPayload.mobileNo,
          telephonePrefix: contactPayload?.telephonePrefix || null,
          telephoneNo: contactPayload?.telephoneNo || null,
          whatsappNoPrefix: contactPayload?.whatsappNoPrefix || null,
          whatsappNo: contactPayload?.whatsappNo || null,
          fax: contactPayload?.fax || null,
          facebookId: contactPayload?.facebookId || null,
          instagramId: contactPayload?.instagramId || null,
          telegramId: contactPayload?.telegramId || null,
          secondaryEmail: contactPayload?.secondaryEmail || null,
          secondaryContactNo: contactPayload?.secondaryContactNo || null
        }

        await this.createOrUpdateContact(contactData, conCats, customerInfo, conn, userId, roleId, departmentId, historyAttrs, t)
      }

      if (customerInfo && payload?.attachment) {
        if (Array.isArray(payload?.attachment) && payload?.attachment.length > 0) {
          for (const entityId of payload?.attachment) {
            await findAndUpdateAttachment(entityId, customerInfo.customerNo, entityCategory.CUSTOMER, conn, t)
          }
        }
      }

      const data = {
        customerUuid: customerInfo.customerUuid,
        customerNo: customerInfo.customerNo,
        customerId: customerInfo.customerId,
        customerTranId: tranId
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Customer Created Successfully - ${customerInfo.customerNo}`,
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateStatus(payload, departmentId, roleId, userId, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { getQuote } = payload

      let checkExistingCustomer, checkExistingAccount, checkExistingService

      if (payload && payload?.customerUuid) {
        checkExistingCustomer = await conn.Customer.findOne({
          where: {
            customerUuid: payload.customerUuid
            // status: constantCode.customerStatus.TEMPORARY
          }
        })

        if (!checkExistingCustomer) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Unable to find the customer details'
          }
        }
        await conn.Customer.update({ status: getQuote ? constantCode.customerStatus.PROSPECT : constantCode.customerStatus.PENDING }, { where: { customerId: checkExistingCustomer.customerId, status: constantCode.customerStatus.TEMPORARY }, transaction: t })
      }
      if (payload && payload?.accountUuid && !payload?.getQuote) {
        checkExistingAccount = await conn.CustAccounts.findOne({
          where: {
            accountUuid: payload?.accountUuid,
            customerId: checkExistingCustomer?.customerId
            // status: constantCode.customerStatus.TEMPORARY
          }
        })

        if (!checkExistingAccount) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Unable to find the account details for this customer'
          }
        }
        const account = checkExistingAccount?.dataValues ? checkExistingAccount?.dataValues : checkExistingAccount
        if (account?.status !== 'CS_ACTIVE') {
          await conn.CustAccounts.update({ status: getQuote ? constantCode.customerStatus.PROSPECT : constantCode.customerStatus.PENDING }, { where: { accountId: checkExistingAccount.accountId }, transaction: t })
        }
      }

      if (payload && Array.isArray(payload.service) && payload?.service.length > 0 && checkExistingCustomer?.customerId) {
        checkExistingService = await conn.CustServices.findAll({
          where: {
            customerId: checkExistingCustomer?.customerId,
            // accountId: checkExistingAccount?.accountId,
            serviceUuid: payload?.service,
            status: constantCode.serviceStatus.TEMPORARY
          }
        })

        if (checkExistingService.length !== 0) {
          // return {
          //   status: statusCodeConstants.VALIDATION_ERROR,
          //   message: 'Unable to find the service details for this customer'
          // }

          const serviceIds = checkExistingService.map(a => a.serviceId)
          await conn.CustServices.update({ status: getQuote ? constantCode.serviceStatus.PROSPECT : constantCode.serviceStatus.PENDING }, { where: { serviceId: serviceIds }, transaction: t })
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Your ${payload.getQuote ? 'Quote' : 'Order'} has been placed successfully!!`,
        data: payload
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCustomerInteraction(payload, userId, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const limit = constantCode.common.INTERACTION_LIMIT

      const checkExistingCustomer = await conn.Customer.findOne({
        where: {
          customerUuid: payload.customerUuid
        }
      })

      if (!checkExistingCustomer) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'unable to find the customer details'
        }
      }

      let customerInteraction = []
      const getInteractionList = await conn.Interaction.findAll({
        attributes: ['intxnId', 'intxnType', 'intxnNo', 'requestStatement', 'createdAt', 'intxnChannel', 'intxnCategory', 'serviceCategory', 'serviceType'],
        include: [{
          model: conn.BusinessEntity, as: 'currStatusDesc', attributes: ['code', 'description']
        }],
        where: {
          customerId: checkExistingCustomer.customerId
        },
        order: [['createdAt', 'DESC']]
        // limit
      })

      const getOrderList = await conn.Orders.findAll({
        attributes: ['orderNo', 'createdAt'],
        include: [{
          model: conn.BusinessEntity, as: 'orderStatusDesc', attributes: ['code', 'description']
        }, {
          model: conn.BusinessEntity, as: 'orderTypeDesc', attributes: ['code', 'description']
        }],
        where: {
          customerId: checkExistingCustomer.customerId,
          intxnId: {
            [Op.eq]: null
          },
          parentOrderId: { [Op.is]: null }
        },
        order: [['createdAt', 'DESC']]
        // limit
      })

      customerInteraction = getInteractionList.concat(getOrderList)
      customerInteraction.sort((a, b) => {
        return (new Date(a.createdAt) - new Date(b.createdAt))
      })

      const finalCustomerInteraction = []
      const separator = '--SPTR--'
      if (Array.isArray(customerInteraction) && customerInteraction.length > 0) {
        for (let c of customerInteraction) {
          c = c?.dataValues ? c?.dataValues : c
          if (c && c.hasOwnProperty('intxnType')) {
            const getCustomerEmoji = customerInteractionEmoji.filter(e => e.code === c.intxnType)
            const p = {
              id: 'Interaction #:-' + c.intxnNo,
              date: 'Created Date :-' + moment(new Date(c.createdAt)).format('DD-MM-YYYY'),
              emotion: getCustomerEmoji && getCustomerEmoji.length > 0 ? emoji.get(getCustomerEmoji[0].emoji) : null,
              emotionURI: getCustomerEmoji && getCustomerEmoji.length > 0 ? emoji.get(getCustomerEmoji[0].emoji) ? Buffer.from(emoji.get(getCustomerEmoji[0].emoji)).toString('base64') : null : null,
              event: 'Interaction Created',
              statement: c.requestStatement || `Interaction # - ${c.intxnNo}`,
              status: 'Status :-' + c.currStatusDesc?.description,
              percentage: getCustomerEmoji && getCustomerEmoji.length > 0 ? getCustomerEmoji[0].percentage : 0,
              separator
            }
            finalCustomerInteraction.push(p)
          } else {
            const getCustomerEmoji = customerInteractionEmoji.filter(e => e.code === 'PURCHASE')
            const statement = await getProductDetails(c?.orderId, separator, conn)
            const p = {
              id: 'Order #:-' + c.orderNo,
              date: 'Created Date :-' + moment(new Date(c.createdAt)).format('DD-MM-YYYY'),
              emotion: getCustomerEmoji && getCustomerEmoji.length > 0 ? emoji.get(getCustomerEmoji[0].emoji) : null,
              emotionURI: getCustomerEmoji && getCustomerEmoji.length > 0 ? emoji.get(getCustomerEmoji[0].emoji) ? Buffer.from(emoji.get(getCustomerEmoji[0].emoji)).toString('base64') : null : null,
              event: c?.orderTypeDesc?.description,
              statement: statement.substring(8) || '',
              status: 'Status :-' + c.orderStatusDesc?.description,
              percentage: getCustomerEmoji && getCustomerEmoji.length > 0 ? getCustomerEmoji[0].percentage : 0,
              separator
            }
            finalCustomerInteraction.push(p)
          }
        }
        // finalCustomerInteraction = finalCustomerInteraction.slice(-10)
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Customer Interaction fetched successfully',
        data: finalCustomerInteraction
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async customerChannelActivity(payload, userId, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const checkExistingCustomer = await conn.Customer.findOne({
        where: {
          customerUuid: payload.customerUuid
        }
      })

      if (!checkExistingCustomer) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Customer does not exist. Kindly check the customer number'
        }
      }

      let customerInteraction = []
      const getInteractionList = await conn.Interaction.findAll({
        attributes: ['intxnNo'],
        include: [{
          model: conn.BusinessEntity, as: 'srType', attributes: ['description', 'code']
        },
        {
          model: conn.BusinessEntity, as: 'channleDescription', attributes: ['description', 'code']
        },
        {
          model: conn.BusinessEntity, as: 'intxnCategoryDesc', attributes: ['description', 'code']
        },
        {
          model: conn.BusinessEntity, as: 'categoryDescription', attributes: ['description', 'code']
        },
        {
          model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['description', 'code']
        },
        {
          model: conn.BusinessEntity, as: 'currStatusDesc', attributes: ['description', 'code']
        },
        {
          model: conn.BusinessEntity, as: 'priorityDescription', attributes: ['description', 'code']
        }
        ],
        where: {
          customerId: checkExistingCustomer.customerId
        }
      })

      const getOrderList = await conn.Orders.findAll({
        attributes: ['orderNo'],
        include: [{
          model: conn.BusinessEntity, as: 'orderStatusDesc', attributes: ['description']
        }, {
          model: conn.BusinessEntity, as: 'orderTypeDesc', attributes: ['description']
        }, {
          model: conn.BusinessEntity, as: 'orderChannelDesc', attributes: ['description']
        }],
        where: {
          customerId: checkExistingCustomer.customerId,
          intxnId: {
            [Op.eq]: null
          },
          parentOrderId: { [Op.is]: null }
        }
      })

      customerInteraction = getInteractionList.concat(getOrderList)
      customerInteraction.sort((a, b) => {
        return (new Date(a.createdAt) - new Date(b.createdAt))
      })

      const finalCustomerInteraction = []

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Customer Interaction fetched successfully',
        data: customerInteraction
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCustomerConversionRate(payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      // const userId = payload?.userId ? `'${payload?.userId}'` : null
      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      // const location = payload?.location ? `'${payload?.location}'` : null

      const sdConversionSql = `select * from dtworks_sd_conversion_rate(${fromDate},${toDate})`
      const sdConversionPercentSql = `select * from dtworks_sd_conversion_rate_perc(${fromDate},${toDate})`

      let sdConversionData = []
      if (sdConversionSql) {
        sdConversionData = await conn.sequelize.query(sdConversionSql, {
          type: QueryTypes.SELECT
        })
      }

      let sdConversionPercentData = []
      if (sdConversionPercentSql) {
        sdConversionPercentData = await conn.sequelize.query(sdConversionPercentSql, {
          type: QueryTypes.SELECT
        })
      }

      sdConversionData = camelCaseConversion(sdConversionData)
      sdConversionPercentData = camelCaseConversion(sdConversionPercentData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)
      //! Need to Sort the Response Based on Month

      const percent = sdConversionPercentData.map(item => item.vCustConvRate).reduce((prev, next) => prev + next)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: {
          list: sdConversionData,
          percent
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

  async getCustomerRetentionRate(payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      // const userId = payload?.userId ? `'${payload?.userId}'` : null
      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      // const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_customer_retention_rate(${fromDate},${toDate})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCustomerFollowup(payload, conn) {
    try {
      if (!payload || !payload?.customerUuid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.VALIDATION_ERROR
        }
      }

      const whereClause = {}

      if (payload && payload?.customerUuid) {
        const checkExistingCustomer = await conn.Customer.findOne({
          where: {
            customerUuid: payload?.customerUuid
          }
        })
        if (checkExistingCustomer) {
          whereClause.customerId = checkExistingCustomer?.customerId
        } else {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Customer details not found'
          }
        }
      }

      const interactionFollowup = await conn.InteractionTxn.findAll({
        include: [{
          model: conn.Interaction,
          as: 'intxnDetails',
          where: {
            ...whereClause
          }
        }],
        where: {
          isFollowup: 'Y'
        }
      })

      const orderFollowup = await conn.OrdersTxnHdr.findAll({
        include: [{
          model: conn.Orders,
          as: 'orderDetails',
          where: {
            ...whereClause
          }
        }],
        where: {
          isFollowup: 'Y'
        }
      })
      let rows = [...interactionFollowup, ...orderFollowup]
      const businessEntityInfo = await conn.BusinessEntity.findAll()
      const businessUnitInfo = await conn.BusinessUnit.findAll({
        attributes: ['unitId', 'unitName', 'unitDesc'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })
      const roleinfo = await conn.Role.findAll({
        attributes: ['roleId', 'roleName', 'roleDesc'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })
      rows = customerResources.transformFollowup(rows, businessEntityInfo, businessUnitInfo, roleinfo)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Followup detail fetched Successfully',
        data: {
          count: rows?.length || 0,
          rows: rows || []
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

const findAndUpdateAttachment = async (entityId, customerNo, entityCategory, conn, t) => {
  try {
    let attachment = await conn.Attachments.findAll({ where: { entityId, entityType: entityCategory, status: constantCode.status.TEMPORARY } })
    if (attachment) {
      const checkExistingAttachment = await conn.Attachments.findAll({
        where: {
          entityType: entityCategory,
          status: constantCode.status.FINAL
        }
      })
      if (checkExistingAttachment) {
        await conn.Attachments.update({ status: constantCode.status.IN_ACTIVE }, { where: { entityType: entityCategory, status: constantCode.status.FINAL }, transaction: t })
      }
      const data = {
        status: constantCode.status.FINAL,
        entityId: customerNo
      }
      attachment = attachment?.dataValues ? attachment?.dataValues : attachment
      await conn.Attachments.update(data, { where: { entityId, entityType: entityCategory, status: constantCode.status.TEMPORARY }, transaction: t })
    }
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR,
      message: 'Internal server error'
    }
  }
}

const getProductDetails = async (orderId, separator, conn) => {
  try {
    if (!orderId) {
      return ''
    }

    const response = await conn.OrdersDetails.findAll({
      include: [
        {
          model: conn.Product,
          as: 'productDetails'
        }
      ],
      where: {
        orderId,
        productStatus: constantCode.status.ACTIVE
      },
      raw: true
    })
    if (response.length === 0) {
      return ''
    }

    let productName = ''
    for (const p of response) {
      productName = productName + separator + p['productDetails.productName']
    }
    return productName
  } catch (error) {
    logger.error(error)
    return ''
  }
}

module.exports = CustomerService
