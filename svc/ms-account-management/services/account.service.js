import { compareRecords, transformRecord /*, createAccountTransform */ } from '@resources'
import { defaultCode, defaultMessage, logger, statusCodeConstants } from '@utils'
import { accountFields, addressFields, constantCode, contactFields, entityCategory, serviceFields, orderConstanst, defaultStatus } from '@utils/constant'
import { isEmpty } from 'lodash'
import moment from 'moment'
import { Op } from 'sequelize'
import { config } from '@config/env.config'

const { systemUserId, systemRoleId, systemDeptId } = config

const { v4: uuidv4 } = require('uuid')
const commonExcludableAttrs = ['createdDeptId', 'createdRoleId', 'tranId', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']

let instance

class AccountService {
  constructor () {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async createAccount (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const payloads = payload?.details ? payload?.details : payload

      if (payloads && !payloads?.customerUuid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Customer details is required.'
        }
      }

      const checkExistingCustomer = await conn.Customer.findOne({
        where: {
          customerUuid: payloads.customerUuid,
          status: {
            [Op.notIn]: [constantCode.customerStatus.IN_ACTIVE]
          }
        }
      })

      if (isEmpty(checkExistingCustomer)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'The provided customer details for account creation are not available.'
        }
      }

      // ! can we need to check there is an existing account in temp or pending status before create another account

      const accountInfo = {
        status: constantCode.customerStatus.PENDING,
        customerId: checkExistingCustomer.customerId,
        customerUuid: payloads.customerUuid,
        firstName: payloads.firstName,
        lastName: payloads.lastName,
        gender: payloads.lastName,
        accountCategory: payloads.accountCategory || null,
        accountType: payloads.accountType || checkExistingCustomer?.customerCategory,
        accountClass: payloads.accountClass || checkExistingCustomer?.customerClass,
        accountLevel: payloads.accountLevel || null,
        expiryDate: payloads.expiryDate || null,
        registeredNo: payloads.registeredNo || null,
        registeredDate: payloads.registeredDate || null,
        idType: payloads.idType,
        idValue: payloads.idValue,
        notificationPreference: payloads.notificationPreference || checkExistingCustomer?.contactPreferences,
        // accountPriority: payloads.accountPriority || null,
        currency: payloads.currency,
        billLanguage: payloads.billLanguage,
        accountUuid: uuidv4(),
        ...userObj
      }

      // if (checkExistingCustomer.status === constantCode.status.PENDING) {
      //   await conn.Customer.update({ status: constantCode.status.PENDING }, {
      //     where: {
      //       customerNo: checkExistingCustomer.customerNo
      //     },
      //     transaction: t
      //   })
      // }

      const accountDetails = await conn.CustAccounts.create(accountInfo, { transaction: t })

      const historyAttrs = {
        historyInsertedDate: new Date(),
        tranId: userObj.tranId,
        historyTranId: userObj.tranId
      }

      let contactUpdated
      let addressUpdated
      if (accountDetails && payload.address) {
        const addressCategoryDetails = {
          ...userObj,
          addressCategory: entityCategory.ACCOUNT,
          addressCategoryValue: accountDetails?.accountNo
        }
        addressUpdated = await this.createOrUpdateAddress(payload.address, addressCategoryDetails, null, conn, userObj.userId, userObj.createdRoleId, userObj.createdDeptId, historyAttrs, t)
      }

      if (accountDetails && payload.contact) {
        const contactCategoryDetails = {
          ...userObj,
          contactCategory: entityCategory.ACCOUNT,
          contactCategoryValue: accountDetails.accountNo
        }
        contactUpdated = await this.createOrUpdateContact(payload.contact, contactCategoryDetails, null, conn, userObj.userId, userObj.createdRoleId, userObj.createdDeptId, historyAttrs, t)
      }

      if (isEmpty(accountDetails)) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Error while creating the account'
        }
      }

      // const data = createAccountTransform(accountDetails)
      const data = {
        accountNo: accountDetails?.accountNo,
        accountUuid: accountDetails?.accountUuid,
        accountId: accountDetails?.accountId,
        contactNo: contactUpdated?.contactNo || null,
        addressNo: addressUpdated?.addressNo || null
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Account Created Successfully - ${accountDetails.accountNo}`,
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

  async updateAccount (payload, accountUuid, userObj, conn, t) {
    try {
      if (!accountUuid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Please provide Account Number'
        }
      }

      const accounts = await conn.CustAccounts.findAll({
        include: [{
          model: conn.Contact,
          as: 'accountContact'
        }, {
          model: conn.Address,
          as: 'accountAddress'
        }],
        where: {
          accountUuid,
          status: {
            [Op.notIn]: [constantCode.customerStatus.IN_ACTIVE]
          }
        }
      })

      if (isEmpty(accounts)) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Account not found'
        }
      }

      const { userId, createdRoleId, createdDeptId } = userObj
      const tranId = uuidv4()

      const historyAttrs = {
        ...userObj,
        historyInsertedDate: new Date(),
        tranId,
        historyTranId: tranId
      }

      if (payload.details.action === 'UPDATE' || payload.details.action === 'REMOVE') {
        payload.details.accountUuid = accountUuid
      }

      let accountDetails
      if (payload.details) {
        accountDetails = await this.createorUpdateAccount(payload.details, accounts, userObj, historyAttrs, conn, t)
      }

      if (accountDetails?.status === 'ERROR') {
        throw new Error(accountDetails?.message)
      }
      accountDetails = accountDetails?.data ? accountDetails?.data : accountDetails
      // if (payload.details) {
      //   const notSameDetails = compareRecords(account, payload.details, accountFields)
      //   if (notSameDetails) {
      //     const accountData = transformRecord(account, payload.details, accountFields)
      //     accountData.updatedBy = userObj.userId
      //     const updatedAccount = await conn.CustAccounts.update(accountData, { where: { accountUuid }, returning: true, plain: true, transaction: t })
      //     updatedAccount._previousDataValues = updatedAccount[1]._previousDataValues
      //     updatedAccount._previousDataValues = { ...updatedAccount._previousDataValues, ...historyAttrs }
      //     await conn.AccountDetailsHistory.create(updatedAccount._previousDataValues, { transaction: t })
      //   }
      // }
      let addressUpdate
      let contactUpdate
      if (payload.address) {
        if (!payload.address.addressNo && payload.address?.addressType) {
          const checkExistingAddress = await conn.Address.findOne({
            where: {
              addressCategory: entityCategory.ACCOUNT,
              addressCategoryValue: accountDetails.accountNo || accounts[0].accountNo,
              addressType: payload.address?.addressType
            }
          })
          if (checkExistingAddress) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `Address mapping already exists for the address type specified for this account ${accountDetails.accountUuid || accounts[0].accountUuid}.`
            }
          }
        } else {
          const checkExistingAddress = await conn.Address.findOne({
            where: {
              addressCategoryValue: accountDetails.accountNo || accounts[0].accountNo,
              addressNo: payload.address?.addressNo
            }
          })

          if (!checkExistingAddress) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `Address details is not available for provided address number ${payload?.address?.addressNo}.`
            }
          }
        }
        const addCats = {
          tranId,
          addressCategory: entityCategory.ACCOUNT,
          addressCategoryValue: accountDetails.accountNo || accounts[0].accountNo
        }
        addressUpdate = await this.createOrUpdateAddress(payload.address, addCats, accounts[0], conn, userId, createdRoleId, createdDeptId, historyAttrs, t)
      }
      if (payload.contact) {
        if (!payload.contact.contactNo && payload.contact?.contactType) {
          const checkExistingContact = await conn.Contact.findOne({
            where: {
              contactCategory: entityCategory.ACCOUNT,
              contactCategoryValue: accountDetails.accountNo || accounts[0].accountNo,
              contactType: payload.contact?.contactType
            }
          })
          if (checkExistingContact) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `contact mapping already exists for the contact type specified for this account ${accountDetails.accountUuid || accounts[0].accountNo}.`
            }
          }
        } else {
          const checkExistingContact = await conn.Contact.findOne({
            where: {
              contactCategory: entityCategory.ACCOUNT,
              contactNo: payload.contact.contactNo
            }
          })

          if (!checkExistingContact) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `contact details is not available for provided contact number ${payload?.contact?.contactNo}.`
            }
          }
        }

        const conCats = {
          tranId,
          contactCategory: entityCategory.ACCOUNT,
          contactCategoryValue: accountDetails.accountNo || accounts[0].accountNo
        }
        contactUpdate = await this.createOrUpdateContact(payload.contact, conCats, accounts, conn, userId, createdRoleId, createdDeptId, historyAttrs, t)
      }

      let data
      if (payload.action !== 'REMOVE') {
        data = {
          accountNo: accountDetails?.accountNo || accounts[0].accountNo,
          addressNo: addressUpdate?.addressNo || payload?.address?.addressNo,
          contactNo: contactUpdate?.contactNo || payload?.contact?.contactNo
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Details updated',
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

  async getAccounts (accountData, userId, conn) {
    try {
      if (!accountData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const params = {}

      if (accountData.limit) {
        params.limit = accountData.limit
      }

      if (accountData.page) {
        params.offset = accountData.page * (params.limit ? params.limit : defaultCode.lIMIT)
      }

      let whereclauses = {}

      if (accountData && accountData?.accountUuid) {
        whereclauses.accountUuid = accountData.accountUuid
      }

      if (accountData && accountData?.customerUuid) {
        whereclauses.customerUuid = accountData.customerUuid.split(',')
      }

      if (accountData && accountData?.accountNo) {
        whereclauses = {
          ...whereclauses,
          [Op.or]: {
            accountNo: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('CustAccounts.account_no')), 'LIKE', '%' + accountData.accountNo.toLowerCase() + '%')
          }
        }
      }

      if (accountData && accountData?.accountName) {
        whereclauses = {
          ...whereclauses,
          [Op.or]: {
            firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('CustAccounts.first_name')), 'LIKE', '%' + accountData.accountName.toLowerCase() + '%'),
            lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('CustAccounts.last_name')), 'LIKE', '%' + accountData.accountName.toLowerCase() + '%')
          }
        }
      }

      if (accountData && accountData?.status) {
        whereclauses.status = accountData.status
      }

      const response = await conn.CustAccounts.findAndCountAll({
        attributes: ['customerUuid', 'accountUuid', 'accountNo', 'status', 'accountRefNo', 'customerId', 'firstName', 'lastName',
          'gender', 'accountCategory', 'accountType', 'accountClass', 'accountLevel', 'expiryDate',
          'registeredNo', 'registeredDate', 'idType', 'idValue', 'notificationPreference', 'accountPriority',
          'creditLimit', 'accountBalance', 'accountOutstanding', 'accountStatusReason', 'currency', 'createdAt'],
        include: [
          { model: conn.BusinessEntity, as: 'accountCatagoryDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'accountClassDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'accountPriorityDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'idTypeDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'billLanguageDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'accountLevelDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'accountStatus', attributes: ['code', 'description'] },
          { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] },
          {
            model: conn.CustServices,
            as: 'accountServices',
            attributes: ['serviceId', 'serviceNo', 'serviceName', 'status', 'serviceCategory', 'serviceUnit', 'serviceType', 'serviceClass',
              'planPayload', 'quantity', 'activationDate', 'expiryDate', 'notificationPreference', 'serviceLimit', 'serviceUsage',
              'serviceBalance', 'serviceStatusReason', 'serviceProvisioningType', 'createdAt'],
            include: [
              // {
              //   model: conn.Orders, as: 'orderHdrDetails', attributes: ['billAmount', 'rcAmount', 'nrcAmount'],
              //   include: [
              //     {
              //       model: conn.OrdersDetails, as: 'orderDetails',
              //     },
              //   ]
              // },
              { model: conn.BusinessEntity, as: 'srvcCatDesc', attributes: ['description'] },
              { model: conn.BusinessEntity, as: 'srvcTypeDesc', attributes: ['description'] },
              { model: conn.BusinessEntity, as: 'srvcClassDesc', attributes: ['description'] }
            ],
            required: false
          },
          {
            model: conn.Address,
            as: 'accountAddress',
            attributes: ['addressNo', 'status', 'addressType', 'address1', 'address2', 'address3', 'addrZone',
              'city', 'district', 'state', 'postcode', 'country', 'latitude', 'longitude'],
            include: [
              { model: conn.BusinessEntity, as: 'stateDesc', attributes: ['description'] },
              { model: conn.BusinessEntity, as: 'districtDesc', attributes: ['description'] },
              { model: conn.BusinessEntity, as: 'countryDesc', attributes: ['description'] },
              { model: conn.BusinessEntity, as: 'postCodeDesc', attributes: ['description'] }
            ],
            where: {
              addressCategory: entityCategory.ACCOUNT
            },
            required: false
          },
          {
            model: conn.Contact,
            attributes: ['contactNo', 'status', 'contactType', 'title', 'firstName', 'lastName', 'emailId', 'mobilePrefix', 'mobileNo', 'telephonePrefix', 'telephoneNo', 'whatsappNoPrefix', 'whatsappNo', 'fax', 'facebookId', 'instagramId', 'telegramId', 'secondaryEmail', 'secondaryContactNo'],
            as: 'accountContact',
            include: [
              {
                model: conn.BusinessEntity,
                as: 'statusDesc',
                attributes: ['code', 'description']
              }
            ],
            where: { contactCategory: entityCategory.ACCOUNT },
            required: false
          }
        ],
        where: {
          ...whereclauses
        },
        ...params,
        logging: true
      })

      if (response.count === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Account not available',
          data: []
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Account details fetched Successfully',
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

  async getServiceDetails (serviceData, userId, conn) {
    try {
      const { serviceNo } = serviceData
      const response = await conn.CustServices.findAll({
        attributes: [
          'customerUuid',
          'serviceUuid',
          'accountUuid',
          'serviceNo',
          'serviceName',
          'serviceUsage',
          'serviceLimit',
          'serviceBalance',
          'serviceUnit',
          'expiryDate',
          'activationDate',
          'serviceStatusReason'
        ],
        include: [{
          model: conn.Orders,
          as: 'orderHdrDetails',
          attributes: ['orderNo', 'billAmount', 'rcAmount', 'nrcAmount'],
          include: [
            {
              model: conn.OrdersDetails,
              as: 'orderDetails',
              attributes: ['productId', 'contractMonths'],
              include: [
                {
                  model: conn.Product, as: 'productDetails', attributes: ['productFamily', 'productName', 'productType', 'serviceType', 'productBenefit', 'contractFlag']
                }
              ]
            }
          ]
        }],
        where: {
          serviceNo
        },
        logging: true
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service details fetched Successfully',
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

  async getAccountIds (accountData, userId, conn) {
    try {
      let whereclauses = {
        status: {
          [Op.notIn]: [constantCode.customerStatus.IN_ACTIVE]
        }
      }

      if (accountData && accountData?.accountUuid) {
        whereclauses.accountUuid = accountData.accountUuid
      }

      if (accountData && accountData?.customerUuid) {
        whereclauses.customerUuid = accountData.customerUuid
      }

      if (accountData && accountData?.accountNo) {
        whereclauses.accountNo = accountData.accountNo
      }

      if (accountData && accountData?.accountName) {
        whereclauses = {
          ...whereclauses,
          [Op.or]: {
            firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('CustAccounts.first_name')), 'LIKE', '%' + accountData.accountName.toLowerCase() + '%'),
            lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('CustAccounts.last_name')), 'LIKE', '%' + accountData.accountName.toLowerCase() + '%')
          }
        }
      }

      const response = await conn.CustAccounts.findAll({
        attributes: ['customerUuid', 'accountUuid', 'accountNo', 'status'],
        where: {
          ...whereclauses
        }
      })

      if (response.count === 0) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Account Id details not found'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Account Ids details fetched Successfully',
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

  async createService (payloads, userObj, conn, t) {
    try {
      if (!userObj?.createdBy) userObj.createdBy = systemUserId
      if (!userObj?.updatedBy) userObj.updatedBy = systemUserId
      if (!userObj?.userId) userObj.userId = systemUserId
      if (!userObj?.createdRoleId) userObj.createdRoleId = systemRoleId
      if (!userObj?.createdDeptId) userObj.createdDeptId = systemDeptId

      if (isEmpty(payloads) || !Array.isArray(payloads?.service) || payloads?.service.length === 0) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const result = []
      for (const payloadInfo of payloads?.service) {
        const payloadDet = payloadInfo?.details ? payloadInfo?.details : payloadInfo
        for (const payload of payloadDet) {
          let accountInfo = {}
          let customerServiceInfo = {}
          if (payload && !payload?.customerUuid) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'Customer details is required.'
            }
          }

          const checkExistingCustomer = await conn.Customer.findOne({
            where: {
              customerUuid: payload.customerUuid,
              status: {
                [Op.notIn]: [constantCode.customerStatus.IN_ACTIVE]
              }
            },
            transaction: t
          })

          if (isEmpty(checkExistingCustomer)) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'The provided customer details for Service creation are not available.'
            }
          }

          const checkExistingProduct = await conn.Product.findOne({
            where: {
              productId: payload?.planPayload?.productId
            }
          })

          if (isEmpty(checkExistingProduct)) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'The provided product details for Service creation are not available.'
            }
          }

          let accountCategoryDetails = await getBusinessEntityDetails(checkExistingProduct.productType, constantCode.businessEntity.ACCOUNTCATEGORY, conn)
          accountCategoryDetails = accountCategoryDetails.data
          if (!accountCategoryDetails) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'Product configuration not available in system'
            }
          }

          const historyAttrs = {
            ...userObj,
            historyInsertedDate: new Date(),
            historyTranId: userObj?.tranId || uuidv4()
          }

          let checkExistingAccount, accountDetails, addressDetails, contactDetails
          if (payload && checkExistingCustomer && accountCategoryDetails) {
            checkExistingAccount = await conn.CustAccounts.findOne({
              where: {
                customerUuid: payload.customerUuid,
                accountCategory: accountCategoryDetails,
                status: {
                  [Op.notIn]: [constantCode.customerStatus.IN_ACTIVE]
                }
              },
              transaction: t
            })
            accountDetails = checkExistingAccount?.dataValues ? checkExistingAccount?.dataValues : checkExistingAccount
            if (accountDetails) {
              const checkExistingAddress = await conn.Address.findOne({
                where: {
                  addressCategoryValue: checkExistingAccount.accountNo,
                  addressCategory: entityCategory.ACCOUNT,
                  status: {
                    [Op.notIn]: [constantCode.status.IN_ACTIVE]
                  }
                },
                transaction: t
              })

              const checkExistingContact = await conn.Contact.findOne({
                where: {
                  contactCategoryValue: checkExistingAccount.accountNo,
                  contactCategory: entityCategory.ACCOUNT,
                  status: {
                    [Op.notIn]: [constantCode.status.IN_ACTIVE]
                  }
                },
                transaction: t
              })
              if (checkExistingAddress) {
                addressDetails = checkExistingAddress?.dataValues ? checkExistingAddress?.dataValues : checkExistingAddress
              } else {
                addressDetails = await customerAddressToAccount(checkExistingCustomer?.customerNo, accountDetails?.accountNo, userObj, historyAttrs, conn, t)
                if (addressDetails?.status === 'ERROR') {
                  throw new Error(addressDetails?.message)
                }
              }
              if (checkExistingContact) {
                contactDetails = checkExistingContact?.dataValues ? checkExistingContact?.dataValues : checkExistingContact
              } else {
                contactDetails = await customerContactToAccount(checkExistingCustomer?.customerNo, accountDetails?.accountNo, userObj, historyAttrs, conn, t)
                if (contactDetails?.status === 'ERROR') {
                  throw new Error(contactDetails?.message)
                }
              }
            } else {
              const accountObj = {
                action: payload.action,
                status: constantCode.customerStatus.PENDING,
                customerId: checkExistingCustomer.customerId,
                customerUuid: checkExistingCustomer.customerUuid,
                firstName: checkExistingCustomer.firstName,
                lastName: checkExistingCustomer.lastName,
                gender: checkExistingCustomer.lastName,
                accountCategory: accountCategoryDetails || null,
                idType: checkExistingCustomer.idType,
                idValue: checkExistingCustomer.idValue,
                currency: payload.currency,
                billLanguage: payload.billLanguage,
                accountUuid: uuidv4(),
                accountType: checkExistingCustomer.customerCategory,
                accountClass: checkExistingCustomer.customerClass,
                notificationPreference: checkExistingCustomer.contactPreferences,
                ...userObj
              }
              accountDetails = await this.createorUpdateAccount(accountObj, null, userObj, historyAttrs, conn, t)
              if (accountDetails.status === 'SUCCESS') {
                addressDetails = await customerAddressToAccount(checkExistingCustomer?.customerNo, accountDetails?.data?.accountNo, userObj, historyAttrs, conn, t)
                if (addressDetails?.status === 'ERROR') {
                  throw new Error(addressDetails?.message)
                }

                contactDetails = await customerContactToAccount(checkExistingCustomer?.customerNo, accountDetails?.data?.accountNo, userObj, historyAttrs, conn, t)
                if (contactDetails?.status === 'ERROR') {
                  throw new Error(contactDetails?.message)
                }
              }
            }

            accountInfo = {
              ...accountInfo,
              accountNo: accountDetails?.data?.accountNo ? accountDetails?.data?.accountNo : accountDetails?.accountNo,
              accountUuid: accountDetails?.data?.accountUuid ? accountDetails?.data?.accountUuid : accountDetails?.accountUuid,
              accountId: accountDetails?.data?.accountId ? accountDetails?.data?.accountId : accountDetails?.accountId,
              addressNo: (addressDetails?.data?.addressNo ? addressDetails?.data?.addressNo : addressDetails?.addressNo) || null,
              contactNo: (contactDetails?.data?.contactNo ? contactDetails?.data?.contactNo : contactDetails?.contactNo) || null
            }
          }

          const serviceDetails = {
            action: payload.action,
            serviceName: payload?.serviceName,
            // status: constantCode.serviceStatus.PENDING,
            status: constantCode.serviceStatus.TEMPORARY,
            customerId: checkExistingCustomer.customerId,
            customerUuid: payload?.customerUuid,
            accountId: accountDetails?.data?.accountId ? accountDetails?.data?.accountId : accountDetails?.accountId || null,
            accountUuid: accountDetails?.data?.accountUuid ? accountDetails?.data?.accountUuid : accountDetails?.accountUuid,
            serviceCategory: payload?.serviceCategory || checkExistingProduct?.productFamily,
            serviceType: payload?.serviceType || checkExistingProduct?.serviceType,
            serviceClass: payload?.serviceClass || checkExistingProduct?.productClass,
            // serviceProvisioningType: checkExistingProduct?.deliveryMode || null,
            planPayload: payload?.planPayload?.productId,
            quantity: payload?.quantity || null,
            notificationPreference: JSON.stringify(payload?.notificationPreference) || JSON.stringify(checkExistingCustomer.contactPreferences),
            serviceAgreement: payload?.serviceAgreement || null,
            serviceUuid: uuidv4(),
            prodBundleId: Number(payload.planPayload?.bundleId) || null,
            promoCode: payload.planPayload?.promoCode,
            contractMonths: Number(payload.planPayload?.contract) || 1,
            promoContractMonths: Number(payload.planPayload?.promoContract) || null,
            actualContractMonths: Number(payload.planPayload?.actualContract) || 1,
            serviceLimit: Number(payload.planPayload?.serviceLimit) || null,
            promoServiceLimit: Number(payload.planPayload?.promoServiceLimit) || null,
            actualServiceLimit: Number(payload.planPayload?.actualServiceLimit) || null,
            productBenefit: payload.planPayload?.productBenefit,
            promoBenefit: payload.planPayload?.promoBenefit,
            actualProductBenefit: payload.planPayload?.actualProductBenefit,
            upfrontCharge: payload.planPayload?.upfrontCharge,
            advanceCharge: payload.planPayload?.advanceCharge
          }
          const serviceInfo = await this.createOrUpdateService(serviceDetails, null, userObj, historyAttrs, conn, t)

          let addressUpdated
          if (serviceInfo && serviceInfo.status === 'SUCCESS' && payloadInfo.address) {
            const addressDetails = {
              ...payloadInfo.address,
              ...userObj,
              status: constantCode.status.ACTIVE,
              addressCategory: entityCategory.SERVICE,
              addressCategoryValue: serviceInfo?.data?.serviceNo ? serviceInfo?.data?.serviceNo : serviceInfo?.serviceNo
            }

            addressUpdated = await conn.Address.create(addressDetails, { transaction: t })
          }

          customerServiceInfo = {
            serviceNo: serviceInfo?.data?.serviceNo ? serviceInfo?.data?.serviceNo : serviceInfo?.serviceNo,
            serviceUuid: serviceInfo?.data?.serviceUuid ? serviceInfo?.data?.serviceUuid : serviceInfo?.serviceUuid,
            serviceId: serviceInfo?.data?.serviceId ? serviceInfo?.data?.serviceId : serviceInfo?.serviceId,
            productUuid: payload?.planPayload?.productUuid,
            addressNo: (addressUpdated?.dataValues ? addressUpdated?.dataValues?.addressNo : addressUpdated?.addressNo) || null
          }
          if (payload.action !== 'REMOVE') {
            result.push({
              account: accountInfo,
              service: customerServiceInfo
            })
          }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'The service has been created Successfully',
        data: result
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createServiceAI (payloads, userObj, conn, t) {
    try {
      const configResponse = await conn.BcaeAppConfig.findOne({
        attributes: ['systemDefaultRole', 'systemUserId', 'systemDefaultDepartment', 'appTenantId'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })
      const systemDefaultValues = configResponse?.dataValues ? configResponse?.dataValues : configResponse
      // console.log('systemDefaultValues------->', systemDefaultValues)
      if (!userObj?.createdBy) userObj.createdBy = systemDefaultValues?.systemUserId
      if (!userObj?.updatedBy) userObj.updatedBy = systemDefaultValues?.systemUserId
      if (!userObj?.userId) userObj.userId = systemDefaultValues?.systemUserId
      if (!userObj?.createdRoleId) userObj.createdRoleId = systemDefaultValues?.systemDefaultRole
      if (!userObj?.createdDeptId) userObj.createdDeptId = systemDefaultValues?.systemDefaultDepartment
      // console.log('systemRoleId------->', systemRoleId)
      // console.log('systemDeptId------->', systemDeptId)

      if (isEmpty(payloads) || !Array.isArray(payloads?.plans) || payloads?.plans?.length === 0) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const result = []
      const payloadDet = []
      const payloadInfo = {
        isPrimary: true,
        addressType: 'ADDRESIDENTIAL',
        address1: 'address1',
        address2: 'address12',
        address3: 'address13',
        city: 'city',
        district: 'district',
        state: 'state',
        postcode: 'postcode',
        country: 'country'
      }
      for (const payloadInfoData of payloads?.plans) {
        payloadDet.push({
          action: 'ADD',
          serviceName: payloadInfoData?.code ?? payloads?.serviceName,
          serviceCategory: payloads?.serviceCategory,
          serviceType: payloads?.serviceType,
          planPayload: {
            productId: payloads?.productId,
            productUuid: payloads?.productUuId
          },
          serviceClass: 'SC_BOTH',
          quantity: '1',
          serviceAgreement: 'NA',
          customerUuid: payloads?.customerUuid,
          interactionUuid: payloads?.interactionUuid,
          currency: 'INR',
          billLanguage: 'INR'
        })
      }

      for (const payload of payloadDet) {
        let accountInfo = {}
        let customerServiceInfo = {}
        if (payloads && !payloads?.customerUuid) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Customer details is required.'
          }
        }

        const checkExistingCustomer = await conn.Customer.findOne({
          where: {
            customerUuid: payloads.customerUuid,
            status: {
              [Op.notIn]: [constantCode.customerStatus.IN_ACTIVE]
            }
          },
          transaction: t
        })

        if (isEmpty(checkExistingCustomer)) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'The provided customer details for Service creation are not available.'
          }
        }

        const checkExistingProduct = await conn.Product.findOne({
          where: {
            productId: payload?.planPayload?.productId
          }
        })

        if (isEmpty(checkExistingProduct)) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'The provided product details for Service creation are not available.'
          }
        }

        let accountCategoryDetails = await getBusinessEntityDetails(checkExistingProduct.productType, constantCode.businessEntity.ACCOUNTCATEGORY, conn)
        accountCategoryDetails = accountCategoryDetails.data
        if (!accountCategoryDetails) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Product configuration not available in system'
          }
        }

        const historyAttrs = {
          ...userObj,
          historyInsertedDate: new Date(),
          historyTranId: userObj?.tranId || uuidv4()
        }

        let checkExistingAccount, accountDetails, addressDetails, contactDetails
        if (payload && checkExistingCustomer && accountCategoryDetails) {
          checkExistingAccount = await conn.CustAccounts.findOne({
            where: {
              customerUuid: payload.customerUuid,
              accountCategory: accountCategoryDetails,
              status: {
                [Op.notIn]: [constantCode.customerStatus.IN_ACTIVE]
              }
            },
            transaction: t
          })
          accountDetails = checkExistingAccount?.dataValues ? checkExistingAccount?.dataValues : checkExistingAccount
          if (accountDetails) {
            const checkExistingAddress = await conn.Address.findOne({
              where: {
                addressCategoryValue: checkExistingAccount.accountNo,
                addressCategory: entityCategory.ACCOUNT,
                status: {
                  [Op.notIn]: [constantCode.status.IN_ACTIVE]
                }
              },
              transaction: t
            })

            const checkExistingContact = await conn.Contact.findOne({
              where: {
                contactCategoryValue: checkExistingAccount.accountNo,
                contactCategory: entityCategory.ACCOUNT,
                status: {
                  [Op.notIn]: [constantCode.status.IN_ACTIVE]
                }
              },
              transaction: t
            })
            if (checkExistingAddress) {
              addressDetails = checkExistingAddress?.dataValues ? checkExistingAddress?.dataValues : checkExistingAddress
            } else {
              addressDetails = await customerAddressToAccount(checkExistingCustomer?.customerNo, accountDetails?.accountNo, userObj, historyAttrs, conn, t)
              if (addressDetails?.status === 'ERROR') {
                throw new Error(addressDetails?.message)
              }
            }
            if (checkExistingContact) {
              contactDetails = checkExistingContact?.dataValues ? checkExistingContact?.dataValues : checkExistingContact
            } else {
              contactDetails = await customerContactToAccount(checkExistingCustomer?.customerNo, accountDetails?.accountNo, userObj, historyAttrs, conn, t)
              if (contactDetails?.status === 'ERROR') {
                throw new Error(contactDetails?.message)
              }
            }
          } else {
            const accountObj = {
              action: payload.action,
              status: constantCode.customerStatus.PENDING,
              customerId: checkExistingCustomer.customerId,
              customerUuid: checkExistingCustomer.customerUuid,
              firstName: checkExistingCustomer.firstName,
              lastName: checkExistingCustomer.lastName,
              gender: checkExistingCustomer.lastName,
              accountCategory: accountCategoryDetails || null,
              idType: checkExistingCustomer.idType,
              idValue: checkExistingCustomer.idValue,
              currency: payload.currency,
              billLanguage: payload.billLanguage,
              accountUuid: uuidv4(),
              accountType: checkExistingCustomer.customerCategory,
              accountClass: checkExistingCustomer.customerClass,
              notificationPreference: checkExistingCustomer.contactPreferences,
              ...userObj
            }
            accountDetails = await this.createorUpdateAccount(accountObj, null, userObj, historyAttrs, conn, t)
            if (accountDetails.status === 'SUCCESS') {
              addressDetails = await customerAddressToAccount(checkExistingCustomer?.customerNo, accountDetails?.data?.accountNo, userObj, historyAttrs, conn, t)
              if (addressDetails?.status === 'ERROR') {
                throw new Error(addressDetails?.message)
              }

              contactDetails = await customerContactToAccount(checkExistingCustomer?.customerNo, accountDetails?.data?.accountNo, userObj, historyAttrs, conn, t)
              if (contactDetails?.status === 'ERROR') {
                throw new Error(contactDetails?.message)
              }
            }
          }

          accountInfo = {
            ...accountInfo,
            accountNo: accountDetails?.data?.accountNo ? accountDetails?.data?.accountNo : accountDetails?.accountNo,
            accountUuid: accountDetails?.data?.accountUuid ? accountDetails?.data?.accountUuid : accountDetails?.accountUuid,
            accountId: accountDetails?.data?.accountId ? accountDetails?.data?.accountId : accountDetails?.accountId,
            addressNo: (addressDetails?.data?.addressNo ? addressDetails?.data?.addressNo : addressDetails?.addressNo) || null,
            contactNo: (contactDetails?.data?.contactNo ? contactDetails?.data?.contactNo : contactDetails?.contactNo) || null
          }
        }

        const serviceDetails = {
          action: payload.action,
          serviceName: payload?.serviceName,
          // status: constantCode.serviceStatus.PENDING,
          status: constantCode.serviceStatus.TEMPORARY,
          customerId: checkExistingCustomer.customerId,
          customerUuid: payload?.customerUuid,
          accountId: accountDetails?.data?.accountId ? accountDetails?.data?.accountId : accountDetails?.accountId || null,
          accountUuid: accountDetails?.data?.accountUuid ? accountDetails?.data?.accountUuid : accountDetails?.accountUuid,
          serviceCategory: payload?.serviceCategory || checkExistingProduct?.productFamily,
          serviceType: payload?.serviceType || checkExistingProduct?.serviceType,
          serviceClass: payload?.serviceClass || checkExistingProduct?.productClass,
          // serviceProvisioningType: checkExistingProduct?.deliveryMode || null,
          planPayload: payload?.planPayload?.productId,
          quantity: payload?.quantity || null,
          notificationPreference: JSON.stringify(payload?.notificationPreference) || JSON.stringify(checkExistingCustomer.contactPreferences),
          serviceAgreement: payload?.serviceAgreement || null,
          serviceUuid: uuidv4(),
          prodBundleId: Number(payload.planPayload?.bundleId) || null,
          promoCode: payload.planPayload?.promoCode,
          contractMonths: Number(payload.planPayload?.contract) || 1,
          promoContractMonths: Number(payload.planPayload?.promoContract) || null,
          actualContractMonths: Number(payload.planPayload?.actualContract) || 1,
          serviceLimit: Number(payload.planPayload?.serviceLimit) || null,
          promoServiceLimit: Number(payload.planPayload?.promoServiceLimit) || null,
          actualServiceLimit: Number(payload.planPayload?.actualServiceLimit) || null,
          productBenefit: payload.planPayload?.productBenefit,
          promoBenefit: payload.planPayload?.promoBenefit,
          actualProductBenefit: payload.planPayload?.actualProductBenefit,
          upfrontCharge: payload.planPayload?.upfrontCharge,
          advanceCharge: payload.planPayload?.advanceCharge,
          interactionUuid: payload?.interactionUuid
        }
        const serviceInfo = await this.createOrUpdateService(serviceDetails, null, userObj, historyAttrs, conn, t)

        let addressUpdated
        if (serviceInfo && serviceInfo.status === 'SUCCESS' && payloadInfo?.address) {
          const addressDetails = {
            ...payloadInfo?.address,
            ...userObj,
            status: constantCode.status.ACTIVE,
            addressCategory: entityCategory.SERVICE,
            addressCategoryValue: serviceInfo?.data?.serviceNo ? serviceInfo?.data?.serviceNo : serviceInfo?.serviceNo
          }

          addressUpdated = await conn.Address.create(addressDetails, { transaction: t })
        }

        customerServiceInfo = {
          serviceNo: serviceInfo?.data?.serviceNo ? serviceInfo?.data?.serviceNo : serviceInfo?.serviceNo,
          serviceUuid: serviceInfo?.data?.serviceUuid ? serviceInfo?.data?.serviceUuid : serviceInfo?.serviceUuid,
          serviceId: serviceInfo?.data?.serviceId ? serviceInfo?.data?.serviceId : serviceInfo?.serviceId,
          productUuid: payload?.planPayload?.productUuid,
          addressNo: (addressUpdated?.dataValues ? addressUpdated?.dataValues?.addressNo : addressUpdated?.addressNo) || null
        }
        if (payload.action !== 'REMOVE') {
          result.push({
            account: accountInfo,
            service: customerServiceInfo
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'The service has been created Successfully',
        data: result
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateService (payloads, userObj, conn, t) {
    // console.log(dfd)
    try {
      if (isEmpty(payloads) || !Array.isArray(payloads?.service) || payloads?.service.length === 0) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const result = []
      for (const servicePayload of payloads?.service) {
        for (const details of servicePayload?.details) {
          const payloads = details || servicePayload
          if (payloads && !payloads?.customerUuid) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'Customer details is required.'
            }
          }

          const checkExistingCustomer = await conn.Customer.findOne({
            where: {
              customerUuid: payloads.customerUuid,
              status: {
                [Op.notIn]: [constantCode.customerStatus.IN_ACTIVE]
              }
            }
          })

          if (isEmpty(checkExistingCustomer)) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'The provided customer details for service update are not available.'
            }
          }

          if (payloads && payloads?.accountUuid) {
            const checkExistingAccount = await conn.CustAccounts.findOne({
              where: {
                customerUuid: payloads.customerUuid,
                accountUuid: payloads.accountUuid,
                status: {
                  [Op.notIn]: [constantCode.customerStatus.IN_ACTIVE]
                }
              },
              transaction: t
            })

            if (isEmpty(checkExistingAccount)) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: 'The provided account details for Service update are not available.'
              }
            }
          }

          let services
          // console.log('payloads=============', payloads)
          if (payloads && payloads?.serviceUuid) {
            services = await conn.CustServices.findAll({
              include: [
                {
                  model: conn.Address,
                  as: 'serviceAddress',
                  required: false
                }
              ],
              where: {
                customerUuid: payloads.customerUuid,
                serviceUuid: payloads.serviceUuid,
                status: {
                  [Op.notIn]: [constantCode.serviceStatus.IN_ACTIVE]
                }
              },
              transaction: t,
              logging: false
            })

            if (isEmpty(services)) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: 'The provided service details for Service update are not available.'
              }
            }
          }
          let checkExistingProduct
          let accountCategoryDetails
          if (payloads.action !== 'REMOVE') {
            checkExistingProduct = await conn.Product.findOne({
              where: {
                productId: payloads?.planPayload?.productId
              }
            })

            if (isEmpty(checkExistingProduct)) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: 'The provided product details for Service update are not available.'
              }
            }

            accountCategoryDetails = await getBusinessEntityDetails(checkExistingProduct.productType, constantCode.businessEntity.ACCOUNTCATEGORY, conn)
            accountCategoryDetails = accountCategoryDetails?.data

            if (!accountCategoryDetails) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: 'Product configuration not available in system'
              }
            }
          }
          // const { userId, createdRoleId, createdDeptId } = userObj
          const tranId = uuidv4()

          const historyAttrs = {
            historyInsertedDate: new Date(),
            tranId,
            historyTranId: tranId
          }

          if (payloads.action === 'ADD' || payloads.action === 'UPGRADE') {
            userObj = {
              ...userObj,
              createdBy: userObj.userId,
              tranId
            }
          }

          let accountInfo, addressDetails, accountDetails, contactDetails
          if (payloads && checkExistingCustomer && accountCategoryDetails) {
            const checkExistingAccount = await conn.CustAccounts.findOne({
              where: {
                customerUuid: payloads.customerUuid,
                accountCategory: accountCategoryDetails,
                status: {
                  [Op.notIn]: [constantCode.customerStatus.IN_ACTIVE]
                }
              },
              transaction: t
            })
            accountDetails = checkExistingAccount?.dataValues ? checkExistingAccount?.dataValues : checkExistingAccount || null
            if (checkExistingAccount) {
              const checkExistingAddress = await conn.Address.findOne({
                where: {
                  addressCategoryValue: checkExistingAccount.accountNo,
                  addressCategory: entityCategory.ACCOUNT,
                  status: {
                    [Op.notIn]: [constantCode.status.IN_ACTIVE]
                  }
                },
                transaction: t
              })

              const checkExistingContact = await conn.Contact.findOne({
                where: {
                  contactCategoryValue: checkExistingAccount.accountNo,
                  contactCategory: entityCategory.ACCOUNT,
                  status: {
                    [Op.notIn]: [constantCode.status.IN_ACTIVE]
                  }
                },
                transaction: t
              })

              if (checkExistingAddress) {
                addressDetails = checkExistingAddress?.dataValues ? checkExistingAddress?.dataValues : checkExistingAddress
              } else {
                userObj.tranId = tranId
                addressDetails = await customerAddressToAccount(checkExistingCustomer?.customerNo, accountDetails?.accountNo, userObj, historyAttrs, conn, t)
                if (addressDetails?.status === 'ERROR') {
                  throw new Error(addressDetails?.message)
                }
              }

              if (checkExistingContact) {
                contactDetails = checkExistingContact?.dataValues ? checkExistingContact?.dataValues : checkExistingContact
              } else {
                contactDetails = await customerContactToAccount(checkExistingCustomer?.customerNo, accountDetails?.accountNo, userObj, historyAttrs, conn, t)
                if (contactDetails?.status === 'ERROR') {
                  throw new Error(contactDetails?.message)
                }
              }
            } else {
              const accountObj = {
                action: payloads.action,
                status: constantCode.customerStatus.PENDING,
                customerId: checkExistingCustomer.customerId,
                customerUuid: checkExistingCustomer.customerUuid,
                firstName: checkExistingCustomer.firstName,
                lastName: checkExistingCustomer.lastName,
                gender: checkExistingCustomer.lastName,
                accountCategory: accountCategoryDetails || null,
                idType: checkExistingCustomer.idType,
                idValue: checkExistingCustomer.idValue,
                currency: payloads.currency,
                billLanguage: payloads.billLanguage,
                accountUuid: uuidv4(),
                accountType: checkExistingCustomer.customerCategory,
                accountClass: checkExistingCustomer.customerClass,
                notificationPreference: checkExistingCustomer.contactPreferences,
                createdBy: userObj.userId,
                tranId,
                ...userObj
              }
              accountDetails = await this.createorUpdateAccount(accountObj, null, userObj, historyAttrs, conn, t)
              if (accountDetails.status === 'ERROR') {
                throw new Error(accountDetails.message)
              }
              if (accountDetails.status === 'SUCCESS') {
                addressDetails = await customerAddressToAccount(checkExistingCustomer?.customerNo, accountDetails?.data?.accountNo, userObj, historyAttrs, conn, t)
                if (addressDetails?.status === 'ERROR') {
                  throw new Error(addressDetails?.message)
                }

                contactDetails = await customerContactToAccount(checkExistingCustomer?.customerNo, accountDetails?.data?.accountNo, userObj, historyAttrs, conn, t)
                if (contactDetails?.status === 'ERROR') {
                  throw new Error(contactDetails?.message)
                }
              }
            }
            accountInfo = {
              ...accountInfo,
              accountNo: accountDetails?.data?.accountNo ? accountDetails?.data?.accountNo : accountDetails?.accountNo,
              accountUuid: accountDetails?.data?.accountUuid ? accountDetails?.data?.accountUuid : accountDetails?.accountUuid,
              accountId: accountDetails?.data?.accountId ? accountDetails?.data?.accountId : accountDetails?.accountId,
              addressNo: (addressDetails?.data?.addressNo ? addressDetails?.data?.addressNo : addressDetails?.addressNo) || null,
              contactNo: (contactDetails?.data?.contactNo ? contactDetails?.data?.contactNo : contactDetails?.contactNo) || null
            }
          }
          console.log('payloads------->', payloads)
          const serviceDetails = {
            serviceAgreement: payloads?.serviceAgreement, // added by dipak
            action: payloads.action,
            serviceName: payloads?.serviceName,
            status: constantCode.serviceStatus.PENDING,
            customerId: checkExistingCustomer.customerId,
            customerUuid: payloads?.customerUuid,
            accountId: accountDetails?.data?.accountId ? accountDetails?.data?.accountId : accountDetails?.accountId || null,
            accountUuid: accountDetails?.data?.accountUuid ? accountDetails?.data?.accountUuid : accountDetails?.accountUuid,
            serviceCategory: payloads?.serviceCategory || checkExistingProduct?.productSubType,
            serviceType: payloads?.serviceType || checkExistingProduct?.serviceType,
            serviceClass: payloads?.serviceClass || checkExistingProduct?.productClass,
            // serviceProvisioningType: checkExistingProduct?.deliveryMode || null,
            planPayload: payloads?.planPayload?.productId,
            quantity: payloads?.quantity || null,
            notificationPreference: payloads?.notificationPreference || checkExistingCustomer.contactPreferences,
            serviceUuid: payloads.action === 'ADD' ? uuidv4() : payloads.serviceUuid,
            prodBundleId: Number(payloads.planPayload?.bundleId) || null,
            promoCode: payloads.planPayload?.promoCode,
            contractMonths: Number(payloads.planPayload?.contract) || 1,
            promoContractMonths: Number(payloads.planPayload?.promoContract) || null,
            actualContractMonths: Number(payloads.planPayload?.actualContract) || 1,
            serviceLimit: Number(payloads.planPayload?.serviceLimit) || null,
            promoServiceLimit: Number(payloads.planPayload?.promoServiceLimit) || null,
            actualServiceLimit: Number(payloads.planPayload?.actualServiceLimit) || null,
            productBenefit: payloads.planPayload?.productBenefit,
            promoBenefit: payloads.planPayload?.promoBenefit,
            actualProductBenefit: payloads.planPayload?.actualProductBenefit,
            upfrontCharge: payloads.planPayload?.upfrontCharge,
            advanceCharge: payloads.planPayload?.advanceCharge,
            ...userObj
          }

          console.log('serviceDetails------------->', serviceDetails)
          // console.log(dsfd)
          let serviceInfo = await this.createOrUpdateService(serviceDetails, services, userObj, historyAttrs, conn, t)
          if (serviceInfo.status === 'ERROR') {
            throw new Error(serviceInfo?.message)
          }
          serviceInfo = serviceInfo?.data ? serviceInfo?.data : serviceInfo
          // if (payloads) {
          //   const notSameDetails = compareRecords(service, payloads, serviceFields)
          //   if (notSameDetails) {
          //     let accountData = transformRecord(service, payloads, serviceFields)
          //     accountData = {
          //       ...accountData,
          //       productId: payloads?.planPayload,
          //       updatedBy: userObj.userId
          //     }
          //     const updatedAccount = await conn.CustServices.update(accountData, { where: { serviceUuid: payloads.serviceUuid }, returning: true, plain: true, transaction: t })
          //     updatedAccount._previousDataValues = updatedAccount[1]._previousDataValues
          //     updatedAccount._previousDataValues = { ...updatedAccount._previousDataValues, ...historyAttrs }
          //     await conn.CustServicesHistory.create(updatedAccount._previousDataValues, { transaction: t })
          //   }
          // }
          let addressUpdate

          if (serviceInfo && servicePayload.address) {
            if (!servicePayload.address.addressNo && servicePayload.address?.addressType) {
              const checkExistingAddress = await conn.Address.findOne({
                where: {
                  addressCategory: entityCategory.SERVICE,
                  addressCategoryValue: serviceInfo?.serviceNo,
                  addressType: servicePayload.address?.addressType
                },
                transaction: t
              })
              if (checkExistingAddress) {
                return {
                  status: statusCodeConstants.VALIDATION_ERROR,
                  message: `Address mapping already exists for the address type specified for this account ${serviceInfo.serviceUuid}.`
                }
              }
            }
            const addCats = {
              tranId,
              addressCategory: entityCategory.SERVICE,
              addressCategoryValue: serviceInfo.serviceNo
            }
            console.log('serviceInfo ', serviceInfo)
            addressUpdate = await this.createOrUpdateAddressService(servicePayload.address, addCats, serviceInfo, conn, userObj.userId, userObj.createdRoleId, userObj.createdDeptId, historyAttrs, t)
          }
          const customerServiceInfo = {
            serviceNo: serviceInfo?.data?.serviceNo ? serviceInfo?.data?.serviceNo : serviceInfo?.serviceNo,
            serviceUuid: serviceInfo?.data?.serviceUuid ? serviceInfo?.data?.serviceUuid : serviceInfo?.serviceUuid,
            serviceId: serviceInfo?.data?.serviceId ? serviceInfo?.data?.serviceId : serviceInfo?.serviceId,
            productUuid: payloads?.planPayload?.productUuid,
            addressNo: addressUpdate?.addressNo || null
          }

          if (payloads.action !== 'REMOVE') {
            result.push({
              account: accountInfo,
              service: customerServiceInfo
            })
          }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service details updated',
        data: result
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateServiceAI (payloads, conn, t) {
    try {
      const result = []
      let services
      console.log('payloads========xxx=====', payloads)
      if (payloads && payloads?.intxnUuid) {
        services = await conn.CustServices.findAll({
          where: {
            interactionUuid: payloads?.intxnUuid
          },
          logging: false
        })
        if (services?.length > 0) {
          const currentDate = moment()
          const expiryDate = moment().add(90, 'days')
          console.log('currentDate------>', currentDate.format('YYYY-MM-DD'))
          console.log('expiryDate------>', expiryDate.format('YYYY-MM-DD'))
          await conn.CustServices.update({
            status: payloads?.custStatus,
            activationDate: currentDate.format('YYYY-MM-DD'),
            expiryDate: expiryDate.format('YYYY-MM-DD')
          }, {
            where: {
              interactionUuid: payloads.intxnUuid
            },
            plain: true,
            transaction: t
          })
          for (const ele of services) {
            await conn.CustAccounts.update(
              { status: 'CS_ACTIVE' },
              {
                where: {
                  accountUuid: ele?.accountUuid
                },
                plain: true,
                transaction: t
              }
            )
          }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service details updated',
        data: result
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async renewServiceAI (payloads, conn, t) {
    try {
      const result = []
      let services
      console.log('payloads========renewal=====', payloads)
      if (payloads && payloads?.interactionUuid && payloads?.serviceNo) {
        services = await conn.CustServices.findAll({
          where: {
            serviceNo: payloads?.serviceNo
          },
          logging: false
        })
        if (services?.length > 0) {
          await conn.CustServices.update({ interactionUuid: payloads?.interactionUuid }, {
            where: {
              serviceNo: payloads?.serviceNo
            },
            plain: true,
            transaction: t
          })
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service Renewal details updated',
        data: result
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async vpnExpiry (payloads, conn, t) {
    try {
      const vpnList = payloads?.vpnList
      console.log('payloads?.selectedVpn-------->', payloads)
      const filteredVpn = vpnList?.filter((ele) => ele?.value === payloads?.selectedVpn)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Vpn expiry details updated',
        data: filteredVpn
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getServices (serviceData, userId, conn) {
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE } = serviceData

      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      let whereclauses = {}
      if (serviceData && serviceData?.accountUuid) {
        whereclauses.accountUuid = serviceData.accountUuid
      }

      if (serviceData && serviceData?.customerUuid) {
        whereclauses.customerUuid = serviceData.customerUuid
      }

      if (serviceData && serviceData?.serviceUuid) {
        whereclauses.serviceUuid = serviceData.serviceUuid
      }

      if (serviceData && serviceData?.serviceNo) {
        whereclauses = {
          ...whereclauses,
          [Op.or]: {
            serviceNo: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('CustServices.service_no')), 'LIKE', '%' + serviceData?.serviceNo.toLowerCase() + '%')
          }
        }
      }

      if (serviceData && serviceData?.serviceName) {
        whereclauses = {
          ...whereclauses,
          [Op.or]: {
            firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('CustServices.service_name')), 'LIKE', '%' + serviceData.serviceName.toLowerCase() + '%')
          }
        }
      }

      if (serviceData && serviceData?.status) {
        whereclauses.status = serviceData.status
      }

      console.log('I came to get services')
      const response = await conn.CustServices.findAndCountAll({
        attributes: ['serviceNo', 'serviceName', 'status', 'planPayload',
          'quantity', 'activationDate', 'expiryDate', 'notificationPreference', 'serviceLimit',
          'serviceUsage', 'serviceUnit', 'serviceBalance', 'serviceStatusReason', 'serviceProvisioningType',
          'paymentMethod', 'customerUuid', 'accountUuid', 'serviceUuid', 'createdDeptId', 'createdRoleId',
          'contractMonths', 'prodBundleId', 'productBenefit', 'actualProductBenefit'/*, 'promoCode' */],
        include: [
          { model: conn.BusinessEntity, as: 'srvcCatDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'srvcTypeDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'paymentMethodDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'serviceStatus', attributes: ['code', 'description'] },
          { model: conn.Address, as: 'serviceAddress' }
        ],
        where: {
          ...whereclauses
        },
        ...params,
        logging: false
      })

      response.rows = response.rows.map(x => ({ ...x.dataValues, productBenefit: JSON.parse(x?.dataValues?.productBenefit ?? '[]'), actualProductBenefit: JSON.parse(x?.dataValues?.actualProductBenefit ?? '[]') }))

      const productDet = []
      for (const svc of response.rows) {
        let productDetails = []
        // if (Array.isArray(svc.planPayload)) {
        productDetails = await conn.Product.findAll({
          attributes: [
            'productNo', 'status', 'productName', 'productFamily', 'productCategory',
            'productType', 'productImage', 'productVariant', 'provisioningType', 'productLine',
            'volumeAllowed', 'multipleSelection', 'revenueGlCode', 'receivableGlCode', 'activationDate',
            'expiryDate', 'chargeType', 'isTaxable', 'taxablePercentage', 'warrantyPeriod', 'productLocation',
            'productUuid'
          ],
          include: [
            {
              model: conn.BusinessEntity, as: 'serviceTypeDescription', attributes: ['description']
            },
            {
              model: conn.BusinessEntity, as: 'productTypeDescription', attributes: ['description']
            },
            {
              model: conn.ProductCharge,
              as: 'productChargesList',
              include: [
                {
                  model: conn.BusinessEntity, as: 'frequencyDesc', attributes: ['description']
                },
                {
                  model: conn.Charge,
                  as: 'chargeDetails',
                  include: [
                    {
                      model: conn.BusinessEntity, as: 'chargeCatDesc', attributes: ['description']
                    },
                    {
                      model: conn.BusinessEntity, as: 'currencyDesc', attributes: ['description']
                    }
                  ]
                }
              ]
            }
          ],
          where: {
            productId: svc.planPayload
          },
          raw: true
        })
        // }
        productDet.push({ ...svc, productDetails })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service details fetched Successfully',
        data: productDet
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getMappedServiceAI (serviceData, conn, t) {
    // console.log('serviceData--------->', serviceData?.status)
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const whereclauses = {}

      if (serviceData && serviceData?.customerUuid) {
        whereclauses.customerUuid = serviceData.customerUuid
      }

      if (serviceData && serviceData?.serviceType) {
        whereclauses.serviceType = serviceData.serviceType
      }

      if (serviceData && serviceData?.customerId) {
        whereclauses.customerId = serviceData?.customerId
      }

      if (serviceData && serviceData?.serviceUuid) {
        whereclauses.serviceUuid = serviceData.serviceUuid
      }

      if (serviceData && serviceData?.status) {
        whereclauses.status = {
          [Op.in]: ['SS_ACTIVE']
        }
      }

      // console.log("I came to get services");
      const response = await conn.CustServices.findAndCountAll({
        attributes: ['serviceNo', 'serviceName', 'status', 'planPayload',
          'quantity', 'activationDate', 'expiryDate', 'notificationPreference', 'serviceLimit',
          'serviceUsage', 'serviceUnit', 'serviceBalance', 'serviceStatusReason', 'serviceProvisioningType',
          'paymentMethod', 'customerUuid', 'accountUuid', 'serviceUuid', 'createdDeptId', 'createdRoleId',
          'contractMonths', 'prodBundleId', 'productBenefit', 'actualProductBenefit', 'customProperties' ],
        where: {
          ...whereclauses
        },
        logging: false
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service details fetched Successfully',
        data: response?.rows?.length > 0 ? response : { rows: [], count: 0 }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getServicesAI (serviceData, userId, conn) {
    // console.log('serviceData--------->', serviceData?.status)
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const whereclauses = {}

      if (serviceData && serviceData?.customerUuid) {
        whereclauses.customerUuid = serviceData.customerUuid
      }

      if (serviceData && serviceData?.serviceType) {
        whereclauses.serviceType = serviceData.serviceType
      }

      if (serviceData && serviceData?.customerId) {
        whereclauses.customerId = serviceData?.customerId
      }

      if (serviceData && serviceData?.serviceUuid) {
        whereclauses.serviceUuid = serviceData.serviceUuid
      }

      if (serviceData && serviceData?.status) {
        whereclauses.status = {
          [Op.in]: [serviceData?.status]
        }
      }

      // console.log("I came to get services");
      const response = await conn.CustServices.findAndCountAll({
        attributes: ['serviceNo', 'serviceName', 'status', 'planPayload',
          'quantity', 'activationDate', 'expiryDate', 'notificationPreference', 'serviceLimit',
          'serviceUsage', 'serviceUnit', 'serviceBalance', 'serviceStatusReason', 'serviceProvisioningType',
          'paymentMethod', 'customerUuid', 'accountUuid', 'serviceUuid', 'createdDeptId', 'createdRoleId',
          'contractMonths', 'prodBundleId', 'productBenefit', 'actualProductBenefit'/*, 'promoCode' */],
        where: {
          ...whereclauses
        },
        raw: true,
        logging: false
      })

      const productDet = []
      if (response?.rows?.length > 0) {
        for (const svc of response?.rows) {
          let productDetails = []
          productDetails = await conn.Product.findAll({
            attributes: [
              'productNo', 'status', 'productName', 'productFamily', 'productCategory',
              'productType', 'productImage', 'productVariant', 'provisioningType', 'productLine',
              'volumeAllowed', 'multipleSelection', 'revenueGlCode', 'receivableGlCode', 'activationDate',
              'expiryDate', 'chargeType', 'isTaxable', 'taxablePercentage', 'warrantyPeriod', 'productLocation',
              'productUuid'
            ],
            where: {
              productId: svc.planPayload
            },
            raw: true
          })
          productDet.push({ ...svc, productDetails })
        }
      }
      // console.log('productDet-------->', productDet)
      const checkExpiry = (expirydate, activationdate) => {
        if (expirydate) {
          const expiryDate = moment(expirydate)
          const activation = moment(activationdate)

          const currentDate = moment()
          const expDaysDifference = expiryDate.diff(currentDate, 'days')
          const actDaysDifference = activation.diff(currentDate, 'days')

          if (expDaysDifference < 7 || actDaysDifference > 90) {
            return 'EXPIRED'
          } else {
            return 'ACTIVE'
          }
        } else {
          return 'ABANDONED'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service details fetched Successfully',
        data: { count: productDet?.length, data: productDet?.length > 0 ? productDet?.map((ele) => ({ ...ele, code: ele?.serviceNo, value: ele?.serviceName, expiryStatus: checkExpiry(ele?.expiryDate, ele?.activationDate) })) : [] }
      }
    } catch (error) {
      logger.error('error-------->', error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getInventoryAI (serviceData, userId, conn) {
    console.log('serviceData--------->', JSON.stringify(serviceData))
    console.log('serviceData?.serviceNos?.project--------->', serviceData?.serviceNos?.radio)
    console.log('intxnCategory--------->', serviceData?.intxnCategory)
    console.log('serviceType--------->', serviceData?.serviceType)
    console.log('serviceUuid--------->', serviceData?.serviceUuid)
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const whereclauses = {}

      if (serviceData?.serviceNos?.project) {
        whereclauses.serviceNo = {
          [Op.in]: serviceData?.serviceNos?.project?.map((ele) => ele?.code)
        }
      } else {
        whereclauses.serviceNo = {
          [Op.in]: serviceData?.serviceNos?.radio?.map((ele) => ele?.code)
        }
      }

      console.log('I came to get products')
      const response = await conn.CustServices.findAndCountAll({
        where: {
          ...whereclauses
        },
        logging: false
      })
      const responseAllServices = await conn.CustServices.findAll({
        where: { customerId: response.rows[0]?.customerId },
        logging: false
      })
      console.log('response------>', response)

      const productIds = response.rows?.map((ele) => ele?.planPayload)

      const productDetails = await conn.Product.findAll({
        attributes: ['productNo', 'productName', 'productId', 'productUuid'],
        where: {
          productId: productIds
        }
      })
      const obj = []
      productDetails?.map((ele02) => {
        obj?.push({ projectNo: ele02?.productNo, projectName: ele02?.productName, projectId: ele02?.productId, projectUuid: ele02?.productUuid })
      })

      let assetProductHdrDetails
      if (productDetails?.length > 0) {
        assetProductHdrDetails = await conn.AssetInvProductHdr.findAll({
          where: {
            productNo: productDetails?.map((ele) => ele?.productNo)
          },
          raw: true
        })
      }

      assetProductHdrDetails?.map((ele) => {
        obj?.map((ele1) => {
          if (ele1?.projectNo === ele?.productNo) {
            ele.projectNo = ele1?.projectNo
            ele.productId = ele1?.projectId
            ele.productUuId = ele1?.projectUuid
            ele.projectName = ele1?.projectName
            ele.code = ele?.productName
            ele.value = ele1?.projectName + ' - ' + ele?.productName
            // if (!ele1['mappedproducts']?.length) {
            //   ele1['mappedproducts'] = []
            // }
            // ele1['mappedproducts'].push(ele)
          }
        })
      })

      const productsNotInServices = assetProductHdrDetails?.filter((ele) => {
        const isProductNameNotInServices = responseAllServices?.every((ele03) => {
          return ele03?.serviceName !== ele?.productName
        })
        return isProductNameNotInServices
      })

      console.log('productsNotInServices:', productsNotInServices)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Products fetched Successfully',
        data: obj.length > 0 ? { count: productsNotInServices?.length, rows: productsNotInServices } : { count: 0, rows: [] }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getAssetList (serviceData, conn) {
    console.log('serviceData--------->', JSON.stringify(serviceData))
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const whereclauses = {
        status: defaultStatus.ACTIVE
      }

      const assestWhereClauses = {}

      if (serviceData?.serviceType) {
        whereclauses.serviceType = serviceData?.serviceType
      }

      if (serviceData && serviceData?.productSubType) {
        assestWhereClauses.prodSubType = serviceData?.productSubType
      }

      console.log('serviceData------>', serviceData)
      const response = await conn.Product.findAll({
        attributes: ['productNo', 'productName', 'productId', 'productUuid'],
        where: {
          ...whereclauses
        },
        raw: true,
        logging: false
      })

      const productNos = response?.map((ele) => ele?.productNo)
      console.log('productNos------>', productNos)

      if (productNos?.length > 0) {
        const assetProductHdrDetails = await conn.AssetInvProductHdr.findAndCountAll({
          where: {
            productNo: productNos,
            [Op.or]: [
              { currentAvailQuantity: { [Op.ne]: 0 } },
              { currentAvailQuantity: null }
            ],
            assetInvPrdStatus: defaultStatus.ACTIVE,
            ...assestWhereClauses
          },
          raw: true
        })

        if (serviceData && serviceData?.isFormatted === 'true') {
          assetProductHdrDetails.rows = assetProductHdrDetails && assetProductHdrDetails.rows?.map((m) => ({ code: m.assetInvPrdNo, value: m.productName }))
        }

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Asset details fetched successfully.',
          data: assetProductHdrDetails
        }
      } else {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Assets Found',
          data: {
            count: 0,
            rows: []
          }
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

  async getAssetInventory (serviceData, conn) {
    console.log('serviceData--------->', JSON.stringify(serviceData))
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const whereclauses = {
        assetInvPrdDtlStatus: defaultStatus.NEW
      }

      if (serviceData?.assetInvPrdId) {
        whereclauses.assetInvPrdId = serviceData?.assetInvPrdId
      }

      const assetProductInventoryDetails = await conn.AssetInvProductDtl.findAll({
        where: {
          ...whereclauses
        },
        raw: true
      })
      if (assetProductInventoryDetails) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Asset details fetched successfully.',
          data: assetProductInventoryDetails
        }
      } else {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Assets Inventory Found',
          data: []
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

  async assignAssetInventory (serviceData, conn, t) {
    console.log('serviceData--------->', JSON.stringify(serviceData))
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { asset, inventory, assignedTo, assignReferNo, assignReferType } = serviceData

      const updatePayload = {
        assignedTo: assignedTo,
        assignedDate: new Date(),
        assignReferNo: assignReferNo,
        assignReferType: assignReferType
      }

      const assetProductInventoryDetails = await conn.AssetInvProductDtl.update(updatePayload, { where: { assetInvPrdDtlId: inventory }, transaction: t });

      const assetProductAssetDetails = await conn.AssetInvProductHdr.update({
        usedQuantity: conn.sequelize.literal('COALESCE(used_quantity, 0) + 1'),
        currentAvailQuantity: conn.sequelize.literal('COALESCE(total_quantity, 0) - COALESCE(used_quantity, 0) - 1')
      }, { where: { assetInvPrdId: asset }, transaction: t, logging: true });

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Inventory assigned.',
        data: assetProductAssetDetails
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getProductsAI (serviceData, userId, conn) {
    console.log('serviceData--------->', serviceData)
    console.log('intxnCategory--------->', serviceData?.intxnCategory)
    console.log('serviceType--------->', serviceData?.serviceType)
    console.log('serviceUuid--------->', serviceData?.serviceUuid)
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const whereclauses = {}

      if (serviceData && serviceData?.customerUuid) {
        whereclauses.customerUuid = serviceData.customerUuid
      }
      if (serviceData && serviceData?.serviceUuid) {
        whereclauses.serviceUuid = serviceData.serviceUuid
      }

      whereclauses.status = {
        [Op.in]: ['SS_PEND', 'SS_ACTIVE']
      }

      console.log('I came to get services')
      const response = await conn.CustServices.findAndCountAll({
        attributes: ['serviceNo', 'serviceName', 'status', 'planPayload',
          'quantity', 'activationDate', 'expiryDate', 'notificationPreference', 'serviceLimit',
          'serviceUsage', 'serviceUnit', 'serviceBalance', 'serviceStatusReason', 'serviceProvisioningType',
          'paymentMethod', 'customerUuid', 'accountUuid', 'serviceUuid', 'createdDeptId', 'createdRoleId',
          'contractMonths', 'prodBundleId', 'productBenefit', 'actualProductBenefit'/*, 'promoCode' */],
        include: [
          { model: conn.BusinessEntity, as: 'srvcCatDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'srvcTypeDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'paymentMethodDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'serviceStatus', attributes: ['code', 'description'] },
          { model: conn.Address, as: 'serviceAddress' }
        ],
        where: {
          ...whereclauses
        },
        logging: false
      })
      console.log('response------>', response)
      response.rows = response.rows.map(x => ({ ...x.dataValues, productBenefit: JSON.parse(x?.dataValues?.productBenefit ?? '[]'), actualProductBenefit: JSON.parse(x?.dataValues?.actualProductBenefit ?? '[]') }))

      const productDet = []
      for (const svc of response.rows) {
        let productDetails = []
        // if (Array.isArray(svc.planPayload)) {
        productDetails = await conn.Product.findAll({
          attributes: [
            'productId', 'productNo', 'status', 'productName', 'productFamily', 'productCategory',
            'productType', 'productImage', 'productVariant', 'provisioningType', 'productLine',
            'volumeAllowed', 'multipleSelection', 'revenueGlCode', 'receivableGlCode', 'activationDate',
            'expiryDate', 'chargeType', 'isTaxable', 'taxablePercentage', 'warrantyPeriod', 'productLocation',
            'productUuid'
          ],
          include: [
            {
              model: conn.BusinessEntity, as: 'serviceTypeDescription', attributes: ['description']
            },
            {
              model: conn.BusinessEntity, as: 'productTypeDescription', attributes: ['description']
            },
            {
              model: conn.ProductCharge,
              as: 'productChargesList',
              include: [
                {
                  model: conn.BusinessEntity, as: 'frequencyDesc', attributes: ['description']
                },
                {
                  model: conn.Charge,
                  as: 'chargeDetails',
                  include: [
                    {
                      model: conn.BusinessEntity, as: 'chargeCatDesc', attributes: ['description']
                    },
                    {
                      model: conn.BusinessEntity, as: 'currencyDesc', attributes: ['description']
                    }
                  ]
                }
              ]
            }
          ],
          where: {
            productId: svc.planPayload
          },
          raw: true
        })
        // }
        productDet.push({ ...svc, productDetails })
      }
      const whereclauseProduct = {
        status: constantCode.status.ACTIVE
      }

      const productIds = []
      productDet?.map((ele) => {
        ele?.productDetails?.map((e) => {
          productIds?.push(e?.productId)
        })
      })
      const uniqueProductIds = [...new Set(productIds)]
      console.log('uniqueProductIds------>', uniqueProductIds)
      if (uniqueProductIds?.length > 0) {
        whereclauseProduct.productId = { [Op.notIn]: uniqueProductIds }
      }

      // if (["PRODUCT_RELATED", "ASSET_RELATED"].includes(serviceData?.intxnCategory)) {
      //   whereclauseProduct.productCategory = "PC_ASSET"
      // } else{
      //   whereclauseProduct.productCategory = "PC_SERVICE"
      // }

      {
        whereclauseProduct.serviceType = serviceData?.serviceType
      }
      console.log('whereclauseProduct---->', whereclauseProduct)

      const productsList = await conn.Product.findAll({
        include: [
          {
            model: conn.BusinessEntity,
            as: 'serviceTypeDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productTypeDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productSubTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productSubCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.ProductCharge,
            as: 'productChargesList',
            attributes: {
              exclude: [...commonExcludableAttrs, 'glcode']
            },
            include: [
              {
                model: conn.Charge,
                as: 'chargeDetails',
                attributes: {
                  exclude: [...commonExcludableAttrs]
                },
                include: [
                  {
                    model: conn.BusinessEntity,
                    as: 'chargeCatDesc',
                    attributes: ['code', 'description']
                  },
                  {
                    model: conn.BusinessEntity,
                    as: 'currencyDesc',
                    attributes: ['code', 'description']
                  }
                ]
              }
            ]
          }
        ],
        where: whereclauseProduct,
        logging: true,
        order: [['product_id', 'DESC']]
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Products fetched Successfully',
        data: productsList
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getExpiryServices (serviceData, userId, conn) {
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE } = serviceData

      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      let whereclauses = {
        expiryDate: {
          [Op.lt]: moment(new Date()).format('YYYY-MM-DD')
        }
      }
      if (serviceData && serviceData?.accountUuid) {
        whereclauses.accountUuid = serviceData.accountUuid
      }

      if (serviceData && serviceData?.customerUuid) {
        whereclauses.customerUuid = serviceData.customerUuid
      }

      if (serviceData && serviceData?.serviceUuid) {
        whereclauses.serviceUuid = serviceData.serviceUuid
      }

      if (serviceData && serviceData?.serviceNo) {
        whereclauses.serviceNo = serviceData.serviceNo
      }

      if (serviceData && serviceData?.serviceName) {
        whereclauses = {
          ...whereclauses,
          [Op.or]: {
            firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('Account.service_name')), 'LIKE', '%' + serviceData.accountName.toLowerCase() + '%')
          }
        }
      }

      const response = await conn.CustServices.findAndCountAll({
        attributes: ['serviceNo', 'serviceName', 'status', 'planPayload',
          'quantity', 'activationDate', 'expiryDate', 'notificationPreference', 'serviceLimit',
          'serviceUsage', 'serviceUnit', 'serviceBalance', 'serviceStatusReason', 'serviceProvisioningType',
          'paymentMethod', 'customerUuid', 'accountUuid', 'serviceUuid', 'createdDeptId', 'createdRoleId'],
        include: [
          { model: conn.BusinessEntity, as: 'srvcCatDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'srvcTypeDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'paymentMethodDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'serviceStatus', attributes: ['code', 'description'] }
        ],
        where: {
          ...whereclauses
        },
        ...params
      })

      const productDet = []
      for (const svc of response.rows) {
        let productDetails = []
        if (Array.isArray(svc.planPayload)) {
          productDetails = await conn.Product.findAll({
            attributes: [
              'productNo', 'status', 'productName', 'productQuantity', 'productFamily', 'productCategory',
              'productType', 'productImage', 'productVariant', 'provisioningType', 'productLine',
              'volumeAllowed', 'multipleSelection', 'revenueGlCode', 'receivableGlCode', 'activationDate',
              'expiryDate', 'chargeType', 'isTaxable', 'taxablePercentage', 'warrantyPeriod', 'productLocation',
              'productUuid'
            ],
            where: {
              productId: svc.planPayload
            },
            raw: true
          })
        }
        productDet.push({ ...svc.dataValues, productDetails })
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service details fetched Successfully',
        data: productDet
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createOrUpdateAddress (addressObj, addCats, customer, conn, userId, createdRoleId, createdDeptId, historyAttrs, t) {
    let updatedAddress
    if (addressObj.addressNo) {
      const existingAddress = customer.accountAddress.find(x => x.addressNo === addressObj.addressNo)
      if (existingAddress) {
        const notSameAddress = compareRecords(existingAddress, addressObj, addressFields)
        if (notSameAddress) {
          const address = {
            ...transformRecord(existingAddress, addressObj, addressFields), ...addCats, updatedBy: userId
          }
          updatedAddress = await conn.Address.update(address, { where: { addressNo: addressObj.addressNo }, returning: true, plain: true, transaction: t })
          updatedAddress._previousDataValues = { ...updatedAddress[1]._previousDataValues, ...historyAttrs }
          await conn.AddressHistory.create(updatedAddress._previousDataValues, { transaction: t })
        }
      }
    } else {
      addressObj = {
        ...addressObj, ...addCats, status: constantCode.status.ACTIVE, createdBy: userId, createdRoleId, createdDeptId
      }
      updatedAddress = await conn.Address.create(addressObj, { transaction: t })
      updatedAddress.dataValues = { ...updatedAddress.dataValues, ...historyAttrs }
      await conn.AddressHistory.create(updatedAddress.dataValues, { transaction: t })
    }
    return updatedAddress
  }

  async createOrUpdateContact (contactObj, conCats, customer, conn, userId, createdRoleId, createdDeptId, historyAttrs, t) {
    let updatedContact
    if (contactObj.contactNo) {
      const contactArr = customer?.dataValues ? customer?.dataValues?.accountContact : customer?.accountContact || customer[0]?.dataValues ? customer[0]?.dataValues?.accountContact : customer[0]?.accountContact
      let existingContact = contactArr?.find(x => x.contactNo === contactObj.contactNo)
      existingContact = existingContact?.dataValues ? existingContact?.dataValues : existingContact
      const notSameContact = compareRecords(existingContact, contactObj, contactFields)
      if (notSameContact) {
        const contact = {
          ...transformRecord(existingContact, contactObj, contactFields), ...conCats, updatedBy: userId
        }
        updatedContact = await conn.Contact.update(contact, { where: { contactNo: contactObj.contactNo }, returning: true, plain: true, transaction: t })
        updatedContact._previousDataValues = { ...updatedContact[1]._previousDataValues, ...historyAttrs }
        await conn.ContactHistory.create(updatedContact._previousDataValues, { transaction: t })
      }
    } else {
      contactObj = {
        ...contactObj, ...conCats, status: constantCode.status.ACTIVE, createdBy: userId, createdRoleId, createdDeptId
      }
      updatedContact = await conn.Contact.create(contactObj, { transaction: t })
      updatedContact.dataValues = { ...updatedContact.dataValues, ...historyAttrs }
      await conn.ContactHistory.create(updatedContact.dataValues, { transaction: t })
    }
    return updatedContact
  }

  async createOrUpdateAddressService (addressObj, addCats, customer, conn, userId, createdRoleId, createdDeptId, historyAttrs, t) {
    let updatedAddress
    if (addressObj.addressNo) {
      const existingAddress = customer?.serviceAddress?.find(x => x.addressNo === addressObj.addressNo)
      if (existingAddress) {
        const notSameAddress = compareRecords(existingAddress, addressObj, addressFields)
        if (notSameAddress) {
          const address = {
            ...transformRecord(existingAddress, addressObj, addressFields), ...addCats, updatedBy: userId
          }
          updatedAddress = await conn.Address.update(address, { where: { addressNo: addressObj.addressNo }, returning: true, plain: true, transaction: t })
          updatedAddress._previousDataValues = { ...updatedAddress[1]._previousDataValues, ...historyAttrs }
          await conn.AddressHistory.create(updatedAddress._previousDataValues, { transaction: t })
        }
      }
    } else {
      addressObj = {
        ...addressObj, ...addCats, status: constantCode.status.ACTIVE, createdBy: userId, createdRoleId, createdDeptId
      }
      updatedAddress = await conn.Address.create(addressObj, { transaction: t })
      updatedAddress.dataValues = { ...updatedAddress.dataValues, ...historyAttrs }
      await conn.AddressHistory.create(updatedAddress.dataValues, { transaction: t })
    }
    return updatedAddress
  }

  async createorUpdateAccount (accountObj, oldPayload, commonAttrib, historyAttrs, conn, t) {
    let updatedAccount

    try {
      if (!accountObj || !accountObj?.action) {
        return {
          status: 'ERROR',
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      if (accountObj.action === 'ADD') {
        const createAccount = { ...accountObj, ...commonAttrib, status: constantCode.customerStatus.PENDING }
        updatedAccount = await conn.CustAccounts.create(createAccount, { transaction: t })
        updatedAccount.dataValues = { ...updatedAccount.dataValues, ...historyAttrs }
        await conn.CustAccountsHistory.create(updatedAccount.dataValues, { transaction: t })
      } else if (accountObj.action === 'UPDATE' && accountObj.accountUuid) {
        let existingAccount = oldPayload.find(x => x.accountUuid === accountObj.accountUuid)
        existingAccount = existingAccount?.dataValues ? existingAccount?.dataValues : existingAccount
        if (existingAccount) {
          const notSameAccount = compareRecords(existingAccount, accountObj, accountFields)
          if (notSameAccount) {
            const updateAccount = {
              ...transformRecord(oldPayload, accountObj, accountFields), updatedBy: commonAttrib?.userId
            }
            updatedAccount = await conn.CustAccounts.update(updateAccount, { where: { accountId: existingAccount.accountId }, returning: true, plain: true, transaction: t })
            updatedAccount.dataValues = { ...updatedAccount[1]._previousDataValues, ...historyAttrs }
            await conn.CustAccountsHistory.create(updatedAccount.dataValues, { transaction: t })
          } else {
            updatedAccount = existingAccount
          }
        }
      } else if (accountObj.action === 'DELETE' && accountObj.accountUuid) {
        const existingAccount = oldPayload.find(x => x.accountUuid === accountObj?.accountUuid)
        if (existingAccount) {
          const checkExistingService = await conn.CustServices.findAndCountAll({
            where: {
              accountUuid: accountObj.accountUuid,
              status: {
                [Op.notIn]: [constantCode.serviceStatus.IN_ACTIVE]
              }
            },
            transaction: t
          })
          if (checkExistingService.count === 0) {
            updatedAccount = await conn.CustAccounts.update({ status: constantCode.customerStatus.IN_ACTIVE }, { where: { accountId: existingAccount.accountId }, returning: true, plain: true, transaction: t })
            updatedAccount.dataValues = { ...updatedAccount[1]._previousDataValues, ...historyAttrs }
            await conn.CustAccountsHistory.create(updatedAccount.dataValues, { transaction: t })
          }
        }
      }
      return {
        status: 'SUCCESS',
        message: 'Account create or update successfully',
        data: updatedAccount?.dataValues ? updatedAccount?.dataValues : updatedAccount
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error-account creation'
      }
    }
  }

  async createOrUpdateService (serviceObj, oldPayload, commonAttrib, historyAttrs, conn, t) {
    let updatedService
    try {
      if (!serviceObj || !serviceObj?.action) {
        return {
          status: 'ERROR',
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      if (serviceObj?.action === 'ADD') {
        const createService = {
          ...serviceObj,
          ...commonAttrib,
          status: constantCode.serviceStatus.TEMPORARY
        }

        updatedService = await conn.CustServices.create(createService, { transaction: t })

        updatedService.dataValues = {
          ...updatedService.dataValues,
          ...historyAttrs
        }

        await conn.CustServicesHistory.create(updatedService.dataValues, { transaction: t })
      } else if (serviceObj?.action === 'UPDATE' && serviceObj.serviceUuid) {
        const existingService = oldPayload.find(x => x.serviceUuid === serviceObj.serviceUuid).dataValues
        if (existingService) {
          const notSameAccount = compareRecords(existingService, serviceObj, serviceFields)
          console.log('notSameAccount ', notSameAccount)
          // console.log(dff)
          if (notSameAccount) {
            console.log('oldPayload--------->', oldPayload)
            console.log('serviceObj--------->', serviceObj)
            console.log('serviceFields--------->', serviceFields)
            const updateservice = {
              ...transformRecord(oldPayload, serviceObj, serviceFields),
              updatedBy: commonAttrib?.userId
            }
            console.log('updateservice-------->', updateservice)
            updatedService = await conn.CustServices.update(updateservice, {
              where:
                { serviceId: existingService.serviceId },
              returning: true,
              plain: true,
              transaction: t
            })

            updatedService.dataValues = {
              ...updatedService[1]._previousDataValues,
              ...historyAttrs
            }

            await conn.CustServicesHistory.create(updatedService.dataValues, { transaction: t })
          } else {
            updatedService = existingService
          }
        }
      } else if (serviceObj?.action === 'REMOVE' && serviceObj.serviceUuid) {
        // TODO: need to check in overall payload for any service added to the account. which request for remove
        const existingService = oldPayload.find(x => x.serviceUuid === serviceObj.serviceUuid)
        if (existingService) {
          updatedService = await conn.CustServices.update({ status: constantCode.serviceStatus.IN_ACTIVE }, {
            where: { serviceId: existingService.serviceId },
            returning: true,
            plain: true,
            transaction: t
          })

          updatedService.dataValues = {
            ...updatedService[1]._previousDataValues,
            ...historyAttrs
          }

          await conn.CustServicesHistory.create(updatedService.dataValues, { transaction: t })

          const checkExistingService = await conn.CustServices.findAndCountAll({
            where: {
              accountId: existingService.accountId,
              status: {
                [Op.notIn]: [constantCode.serviceStatus.IN_ACTIVE]
              }
            },
            transaction: t
          })

          if (checkExistingService.count === 0) {
            const updatedAccount = await conn.CustAccounts.update({ status: constantCode.customerStatus.IN_ACTIVE }, {
              where: { accountId: existingService.accountId },
              returning: true,
              plain: true,
              transaction: t
            })
            updatedAccount.dataValues = { ...updatedAccount[1]._previousDataValues, ...historyAttrs }
            await conn.CustAccountsHistory.create(updatedAccount.dataValues, { transaction: t })
          }
        }
      } else if (serviceObj?.action === 'UPGRADE' && serviceObj?.serviceUuid) {
        const existingService = oldPayload.find(x => x.serviceUuid === serviceObj.serviceUuid).dataValues
        const checkExistingAddress = await conn.Address.findOne({
          attributes: { exclude: ['addressId', 'addressNo', 'createdDeptId', 'createdRoleId', 'tranId', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'] },
          where: {
            addressCategoryValue: existingService?.serviceNo,
            status: 'AC'
          },
          order: [['addressId', 'DESC']]
        })

        const checkExistingContact = await conn.Contact.findOne({
          attributes: {
            exclude: ['contactId', 'contactNo', 'createdDeptId', 'createdRoleId', 'tranId', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
          },
          where: {
            status: 'AC',
            contactCategoryValue: existingService?.serviceNo
          },
          order: [['contactId', 'DESC']]
        })

        const createService = {
          ...serviceObj,
          ...commonAttrib,
          status: constantCode.serviceStatus.TEMPORARY
        }
        const requestObj = { ...createService, serviceUuid: uuidv4() }
        updatedService = await conn.CustServices.create(requestObj, { transaction: t })

        if (checkExistingAddress && updatedService) {
          const addressObj = checkExistingAddress?.dataValues ? checkExistingAddress?.dataValues : checkExistingAddress
          updatedService = updatedService?.dataValues ? updatedService?.dataValues : updatedService
          addressObj.addressCategoryValue = updatedService?.serviceNo
          await conn.Address.create({ ...addressObj, ...commonAttrib }, { transaction: t })
        }

        if (checkExistingContact && updatedService) {
          const contactObj = checkExistingContact?.dataValues ? checkExistingContact?.dataValues : checkExistingContact
          updatedService = updatedService?.dataValues ? updatedService?.dataValues : updatedService
          contactObj.contactCategoryValue = updatedService?.serviceNo
          await conn.Contact.create({ ...contactObj, ...commonAttrib }, { transaction: t })
        }
      }
      return {
        status: 'SUCCESS',
        message: 'Service create or update successfully',
        data: updatedService?.dataValues ? updatedService?.dataValues : updatedService
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error--service error'
      }
    }
  }

  async searchAccountDetailsHistory (searchParams, userId, conn) {
    try {
      const { limit = 10, page = 0 } = searchParams
      const offSet = (page * limit)
      if (!searchParams || !searchParams.accountUuid) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const checkExistingAccount = await conn.CustAccounts.findOne({
        where: {
          accountUuid: searchParams.accountUuid
        }
      })

      if (!checkExistingAccount) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: 'we are unable to find the account details'
        }
      }

      const whereClause = {
        accountId: checkExistingAccount.accountId
      }

      let userWhereClause
      if (searchParams.filters && Array.isArray(searchParams.filters) && !isEmpty(searchParams.filters)) {
        for (const record of searchParams.filters) {
          if (record.value) {
            if (record.id === 'email') {
              if (record.filter === 'contains') {
                whereClause.email = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.email = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'title') {
              if (record.filter === 'contains') {
                whereClause.title = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.title = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'contactNo') {
              if (record.filter === 'contains') {
                whereClause.contactNo = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.contactNo = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'firstName') {
              if (record.filter === 'contains') {
                whereClause.firstName = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.firstName = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'lastName') {
              if (record.filter === 'contains') {
                whereClause.lastName = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.lastName = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'modifiedBy') {
              if (record.filter === 'contains') {
                userWhereClause = {
                  [Op.or]: {
                    firstName: {
                      [Op.like]: `%${record.value}%`
                    },
                    lastName: {
                      [Op.like]: `%${record.value}%`
                    }
                  }
                }
              } else {
                userWhereClause = {
                  [Op.or]: {
                    firstName: {
                      [Op.notLike]: `%${record.value}%`
                    },
                    lastName: {
                      [Op.notLike]: `%${record.value}%`
                    }
                  }
                }
              }
            }
          }
        }
      }
      const response = await conn.AccountDetailsHistory.findAndCountAll({
        include: [{
          model: conn.User,
          attributes: ['firstName', 'lastName'],
          as: 'modifiedBy',
          required: !!userWhereClause,
          where: userWhereClause
        }],
        where: whereClause,
        offset: offSet,
        limit: Number(limit)
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Account details fetched Successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error--service error'
      }
    }
  }

  async searchAccountAddressHistory (searchParams, userId, conn) {
    try {
      const { limit = 10, page = 0 } = searchParams
      const offSet = (page * limit)
      if (!searchParams || !searchParams.accountUuid) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const checkExistingAccount = await conn.CustAccounts.findOne({
        where: {
          accountUuid: searchParams.accountUuid
        }
      })

      if (!checkExistingAccount) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: 'we are unable to find the account details'
        }
      }

      let userWhereClause
      const whereClause = {
        addressCategoryValue: checkExistingAccount.accountNo
      }
      if (searchParams.filters && Array.isArray(searchParams.filters) && !isEmpty(searchParams.filters)) {
        for (const record of searchParams.filters) {
          if (record.value) {
            if (record.id === 'hno') {
              if (record.filter === 'contains') {
                whereClause.hno = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.hno = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'buildingName') {
              if (record.filter === 'contains') {
                whereClause.buildingName = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.buildingName = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'street') {
              if (record.filter === 'contains') {
                whereClause.street = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.street = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'city') {
              if (record.filter === 'contains') {
                whereClause.city = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.city = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'state') {
              if (record.filter === 'contains') {
                whereClause.state = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.state = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'district') {
              if (record.filter === 'contains') {
                whereClause.district = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.district = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'country') {
              if (record.filter === 'contains') {
                whereClause.country = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.country = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'zip') {
              if (record.filter === 'contains') {
                whereClause.zip = { [Op.like]: `%${record.value}%` }
              } else {
                whereClause.zip = { [Op.notLike]: `%${record.value}%` }
              }
            } else if (record.id === 'modifiedBy') {
              if (record.filter === 'contains') {
                userWhereClause = {
                  [Op.or]: {
                    firstName: {
                      [Op.like]: `%${record.value}%`
                    },
                    lastName: {
                      [Op.like]: `%${record.value}%`
                    }
                  }
                }
              } else {
                userWhereClause = {
                  [Op.or]: {
                    firstName: {
                      [Op.notLike]: `%${record.value}%`
                    },
                    lastName: {
                      [Op.notLike]: `%${record.value}%`
                    }
                  }
                }
              }
            }
          }
        }
      }
      const response = await conn.AddressHistory.findAndCountAll({
        include: [{
          model: conn.User,
          attributes: ['firstName', 'lastName'],
          as: 'modifiedBy',
          required: !!userWhereClause,
          where: userWhereClause
        }],
        where: whereClause,
        offset: offSet,
        limit: Number(limit)
      })
      logger.debug('Successfully fetch Account address history')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Account details fetched Successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error--service error'
      }
    }
  }

  /**
   * @author: Sibichakravarthi
   * @description: Get Service Badge
   * @Date: 02-July-2023
   * */
  async getServiceBadge (payload, userId, conn) {
    try {
      const { customerUuid, accountUuid, serviceUuid } = payload
      if (!customerUuid || !accountUuid || !serviceUuid) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingAccount = await conn.CustAccounts.findOne({
        where: {
          accountUuid
        }
      })

      let checkExistingCustomer = await conn.Customer.findOne({
        where: {
          customerUuid
        }
      })

      let checkExistingService = await conn.CustServices.findOne({
        where: {
          serviceUuid
        }
      })

      if (!checkExistingAccount || !checkExistingCustomer || !checkExistingService) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: `${!checkExistingAccount ? 'Account' : !checkExistingCustomer ? 'Customer' : 'Service'} details not available`
        }
      }
      checkExistingAccount = checkExistingAccount?.dataValues ? checkExistingAccount?.dataValues : checkExistingAccount
      checkExistingCustomer = checkExistingCustomer?.dataValues ? checkExistingCustomer?.dataValues : checkExistingCustomer
      checkExistingService = checkExistingService?.dataValues ? checkExistingService?.dataValues : checkExistingService

      const badge = await getServiceBadge(checkExistingCustomer, checkExistingAccount, checkExistingService, conn)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Service Badge Details Fetched Successfully',
        data: { badge }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error--service error'
      }
    }
  }

  async getCustomerAssestList (payload, conn) {
    try {
      const whereClause = {}

      if (!payload || !payload?.customerId) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Details Found',
          data: {
            count: 0,
            rows: []
          }
        }
      }

      if (payload && payload?.customerId) {
        whereClause.customerId = payload?.customerId
      }

      const businessEntityObj = await conn.BusinessEntity.findAll({
        where: {
          codeType: 'SERVICE_TYPE',
          status: 'AC'
        }
      })

      if (!businessEntityObj) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Details Found',
          data: {
            count: 0,
            rows: []
          }
        }
      }

      const serviceTypes = businessEntityObj && businessEntityObj.filter((b) => b?.mappingPayload?.isWifi).map((m) => m?.code)
      console.log('serviceTypes ------------------->', serviceTypes)
      if (!serviceTypes) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Details Found',
          data: {
            count: 0,
            rows: []
          }
        }
      }
      const custServicesDetails = await conn.CustServices.findAll({
        where: {
          ...whereClause,
          serviceType: serviceTypes
        }
      })
      console.log('custServicesDetails ------------------->', custServicesDetails)

      if (!custServicesDetails) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Details Found',
          data: {
            count: 0,
            rows: []
          }
        }
      }

      const productIds = custServicesDetails?.map((p) => p.planPayload)
      console.log('productIds ------------------->', productIds)

      if (!custServicesDetails) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Details Found',
          data: {
            count: 0,
            rows: []
          }
        }
      }

      const productDetails = await conn.Product.findAll({
        where: {
          productId: productIds
        }
      })

      const ProductNos = await productDetails?.map((p) => p.productNo)
      console.log('ProductNos ------------------->', ProductNos)

      if (!custServicesDetails) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Details Found',
          data: {
            count: 0,
            rows: []
          }
        }
      }

      const response = await conn.AssetInvProductDtl.findAndCountAll({
        where: {
          productNo: ProductNos,
          assignedTo: payload?.customerId
        }
      })

      if (payload && payload?.isFormatted === 'true') {
        response.rows = response?.rows?.map((r) => ({ code: r?.assetInvPrdDtlNo, value: r?.productDesc }))
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Assest Details Fetched successfully',
        data: response
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error--service error'
      }
    }
  }
}

const customerAddressToAccount = async (customerNo, accountNo, userObj, historyAttrs, conn, t) => {
  try {
    let addressDetails
    const checkExistingAddress = await conn.Address.findOne({
      where: {
        addressCategoryValue: customerNo,
        addressCategory: entityCategory.CUSTOMER
      },
      transaction: t
    })
    if (checkExistingAddress) {
      const addressCategoryDetails = {
        addressCategoryValue: accountNo,
        addressCategory: entityCategory.ACCOUNT
      }
      const addressPayload = {
        isPrimary: true,
        addressType: checkExistingAddress?.addressType,
        address1: checkExistingAddress?.address1,
        address2: checkExistingAddress?.address2,
        address3: checkExistingAddress?.address3,
        city: checkExistingAddress?.city,
        state: checkExistingAddress?.state,
        district: checkExistingAddress?.district,
        country: checkExistingAddress?.country,
        billFlag: checkExistingAddress?.billFlag,
        postcode: checkExistingAddress?.postcode,
        latitude: checkExistingAddress?.latitude,
        longitude: checkExistingAddress?.longitude,
        ...userObj
      }

      const accountInstance = new AccountService()
      addressDetails = await accountInstance.createOrUpdateAddressService(addressPayload, addressCategoryDetails, null, conn, userObj?.userId, userObj?.createdRoleId, userObj?.createdDeptId, historyAttrs, t)
      return { status: 'SUCCESS', data: addressDetails }
    }
  } catch (error) {
    logger.error(error)
    return {
      status: 'ERROR',
      message: 'Internal server error'
    }
  }
}

const customerContactToAccount = async (customerNo, accountNo, userObj, historyAttrs, conn, t) => {
  try {
    let contactDetails
    const checkExistingContact = await conn.Contact.findOne({
      where: {
        contactCategoryValue: customerNo,
        contactCategory: entityCategory.CUSTOMER
      },
      transaction: t
    })
    if (checkExistingContact) {
      const contactCategoryDetails = {
        contactCategoryValue: accountNo,
        contactCategory: entityCategory.ACCOUNT
      }
      const contactPayload = {
        isPrimary: checkExistingContact?.isPrimary,
        firstName: checkExistingContact?.firstName,
        lastName: checkExistingContact?.lastName,
        emailId: checkExistingContact?.emailId,
        mobilePrefix: checkExistingContact?.mobilePrefix,
        mobileNo: checkExistingContact?.mobileNo,
        ...userObj
      }

      const accountInstance = new AccountService()
      contactDetails = await accountInstance.createOrUpdateContact(contactPayload, contactCategoryDetails, null, conn, userObj?.userId, userObj?.createdRoleId, userObj?.createdDeptId, historyAttrs, t)
      return { status: 'SUCCESS', data: contactDetails }
    }
  } catch (error) {
    logger.error(error)
    return {
      status: 'ERROR',
      message: 'Internal server error'
    }
  }
}

const getBusinessEntityDetails = async (code, key, conn) => {
  try {
    const response = await conn.BusinessEntity.findOne({
      attributes: ['code', 'description', 'codeType', 'mappingPayload'],
      where: {
        code,
        status: constantCode.status.ACTIVE
      }
    })

    if (isEmpty(response)) {
      return {
        status: 'ERROR',
        message: 'Error while fetching business entity details'
      }
    }

    const mapping = response?.dataValues?.mappingPayload ? response?.dataValues?.mappingPayload : response?.mappingPayload
    let value
    if (mapping && mapping.hasOwnProperty(key)) {
      value = mapping[key]
    }

    return {
      status: 'SUCCESS',
      message: 'Business Entity fetched Successfully',
      data: value
    }
  } catch (error) {
    logger.error(error)
    return {
      status: 'ERROR',
      message: 'Internal server error'
    }
  }
}

/**
 * Author: Sibichakravarthi
 * Title: Get Service Badge
 * Date: 02-July-2023
 **/

const getServiceBadge = async (checkExistingCustomer, checkExistingAccount, checkExistingService, conn) => {
  const interactions = await conn.Orders.findAll({
    // attributes: ['intxnId', 'description', 'currStatus', 'intxnType', 'woType', 'createdAt'],
    include: [
      { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['code', 'description'] },
      { model: conn.BusinessEntity, as: 'orderTypeDesc', attributes: ['code', 'description'] }
    ],
    where: {
      customerId: checkExistingCustomer?.customerId,
      accountId: checkExistingAccount?.accountId,
      serviceId: checkExistingService?.serviceId,
      orderStatus: {
        [Op.notIn]: [orderConstanst.orderStatus.CLOSED, orderConstanst.orderStatus.CANCELLED, orderConstanst.orderStatus.RETURN]
      },
      orderType: [orderConstanst.orderType.UPGRADE, orderConstanst.orderType.DOWNGRADE, orderConstanst.orderType.SIGNUP, orderConstanst.orderType.SIGNOUT]
    },
    order: [
      ['orderId', 'DESC']
    ]
  })

  let bar
  let unbar
  let upgrade
  let downgrade
  let newConn
  let teleport
  let relocate
  let terminate
  // let planData
  for (const intr of interactions) {
    // if (intr.orderType === 'BAR') {
    //   bar = true
    // } else if (intr.orderType === 'UNBAR') {
    //   unbar = true
    // } else
    if (intr.orderType === orderConstanst.orderType.UPGRADE) {
      // planData = await Plan.findOne({
      //   where: {
      //     planId: intr.planId
      //   }
      // })
      upgrade = true
    } else if (intr.orderType === orderConstanst.orderType.DOWNGRADE) {
      // downgrade = true
      // planData = await Plan.findOne({
      //   where: {
      //     planId: intr.planId
      //   }
      // })
      downgrade = true
    }
    // else if (intr.orderType === 'WONC' || intr.orderType === 'WONC-ACCSER' || intr.orderType === 'WONC-SER') {
    //   newConn = true
    // } else if (intr.orderType === 'TELEPORT') {
    //   teleport = true
    // } else if (intr.orderType === 'RELOCATE') {
    //   relocate = true
    // }
    else if (intr.orderType === orderConstanst.orderType.SIGNOUT) {
      terminate = true
    }
  }

  // console.log('getServiceBadge-----------------------------------------------', bar, unbar, upgrade, downgrade, newConn, teleport, relocate, terminate)

  if (bar) {
    return 'BAR'
  } else if (unbar) {
    return 'UNBAR'
  } else if (upgrade) {
    return 'UPGRADE'
  } else if (downgrade) {
    return 'DOWNGRADE'
  } else if (newConn) {
    return 'WONC'
  } else if (teleport) {
    return 'TELEPORT'
  } else if (relocate) {
    return 'RELOCATE'
  } else if (terminate) {
    return 'TERMINATE'
  } else {
    return ''
  }
}

module.exports = AccountService
