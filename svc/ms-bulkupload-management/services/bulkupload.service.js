import { CryptoHelper, defaultMessage, logger, statusCodeConstants, constantCode } from '@utils'
import { isEmpty } from 'lodash'
import { QueryTypes, Op } from 'sequelize'
import { db } from '@models'
import em from '@emitters'

const generatePassword = require('generate-password')

let instance

class BulkuploadService {
  constructor () {
    if (!instance) {
      instance = this
    }
    this.cryptoHelper = new CryptoHelper()
    return instance
  }

  async verifyEntityTransactionMapping (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'ENTITY_TRANSACTION_MAPPING',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        const reqBody = []
        // unique payload
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            txnTranId: userObj.tranId,
            txnCreatedDeptId: userObj.createdDeptId,
            txnCreatedRoleId: userObj.createdRoleId,
            txnCreatedBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        const createdBulkETMTemp = await conn.BulkEntityTransactionMappingTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bulk_entity_transaction_mapping_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })

        await t.commit()
        if (createdBulkETMTemp) {
          const bulkTxnIds = createdBulkETMTemp.map((x) => x.bulkTxnId)
          response = await conn.BulkEntityTransactionMappingTemp.findAll({
            where: {
              bulkTxnId: bulkTxnIds
            }
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully verified entity transaction details',
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

  async createBulkEntityTransactionMapping (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_entity_txn_mapping('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Entity Transaction Mapping details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyUsers (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'USERS',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }

      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        const reqBody = []
        const passwords = {}
        for (const rec of payload.list) {
          let password
          let oneTimePassword
          const inviteToken = this.cryptoHelper.createHmac(rec)
          if (passwords[rec.emailId]) {
            password = passwords[rec.emailId].password
            oneTimePassword = passwords[rec.emailId].oneTimePassword
          } else {
            password = generatePassword.generate({ length: constantCode.common.PASSWORD_LENGTH, numbers: true })
            oneTimePassword = this.cryptoHelper.hashPassword(password.toString())
            passwords[rec.emailId] = {
              password: '',
              oneTimePassword: ''
            }
            passwords[rec.emailId].password = password
            passwords[rec.emailId].oneTimePassword = oneTimePassword
          }
          // console.log(rec.emailId, password)
          // console.log('passwords ----------->', passwords)
          const obj = {
            userGroup: 'Business',
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            usersTranId: userObj.tranId,
            usersCreatedDeptId: userObj.createdDeptId,
            usersCreatedRoleId: userObj.createdRoleId,
            usersCreatedBy: userObj.userId,
            encryptedPassword: oneTimePassword,
            tempPassword: password,
            inviteToken
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('reqBody', reqBody)
        const createdBulkUserTemp = await conn.BulkUserTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_users_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })

        await t.commit()
        if (createdBulkUserTemp) {
          const bulkUsersIds = createdBulkUserTemp.map((x) => x.bulkUsersId)
          response = await conn.BulkUserTemp.findAll({
            where: {
              bulkUsersId: bulkUsersIds
            }
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified User details',
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

  async createBulkUsers (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      // console.log('payload==>', payload)
      const query = `SELECT bcae_bulk_user_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      // Generating Email and send to customer

      const notificationData =
      {
        tranId: userObj.tranId,
        createdDeptId: userObj.createdDeptI,
        createdRoleId: userObj.createdRoleId,
        createdBy: userObj.createdBy
      }

      em.emit('USER_CREATED', notificationData, conn)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created User details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyRequestStatement (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'REQUEST_STATEMENT',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }

      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        // console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            reqStatTranId: userObj.tranId,
            reqStatCreatedDeptId: userObj.createdDeptId,
            reqStatCreatedRoleId: userObj.createdRoleId,
            reqStatCreateBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('reqBody', reqBody)
        const responseTemp = await conn.BulkRequestStatementTemp.bulkCreate(reqBody, { transaction: t })
        // console.log('createdBulkUserTemp', responseTemp)
        if (responseTemp) {
          const query = `SELECT bcae_bulk_request_statement_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
          await conn.sequelize.query(query, {
            type: QueryTypes.SELECT,
            transaction: t
          })
          await t.commit()
          if (responseTemp) {
            const bulkReqStatIds = responseTemp.map((x) => x.bulkReqStatId)
            response = await conn.BulkRequestStatementTemp.findAll({
              where: {
                bulkReqStatId: bulkReqStatIds
              }
            })
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Request Statement details',
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

  async createBulkRequestStatement (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_request_statement_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Request statement',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyProfiles (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'PROFILE',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }

      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        // console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            profTranId: userObj.tranId,
            profCreatedDeptId: userObj.createdDeptId,
            profCreatedRoleId: userObj.createdRoleId,
            profCreateBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('reqBody', reqBody)
        const responseTemp = await conn.BulkProfileTemp.bulkCreate(reqBody, { transaction: t })
        // console.log('createdBulkUserTemp', responseTemp)
        if (responseTemp) {
          const query = `SELECT bcae_bulk_profile_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
          await conn.sequelize.query(query, {
            type: QueryTypes.SELECT,
            transaction: t
          })
          await t.commit()
          if (responseTemp) {
            const bulkProfileIds = responseTemp.map((x) => x.bulkProfileId)
            response = await conn.BulkProfileTemp.findAll({
              where: {
                bulkProfileId: bulkProfileIds
              }
            })
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Profile',
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

  async createBulkProfile (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_profile_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Profile',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyProducts (payload, prodObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'PRODUCT',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: prodObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        // console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            prodTranId: prodObj.tranId,
            prodCreatedDeptId: prodObj.createdDeptId,
            prodCreatedRoleId: prodObj.createdRoleId,
            prodCreatedBy: prodObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('reqBody', reqBody)
        const createdBulkProductTemp = await conn.BulkProductTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_product_validations ('${prodObj.tranId}','${prodObj.createdDeptId}', '${prodObj.createdRoleId}', '${prodObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        await t.commit()
        if (createdBulkProductTemp) {
          const bulkProductIds = createdBulkProductTemp.map((x) => x.bulkProductId)
          response = await conn.BulkProductTemp.findAll({
            where: {
              bulkProductId: bulkProductIds
            }
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Product details',
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

  async createBulkProduct (payload, prodObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_product_migration('${prodObj.tranId}','${prodObj.createdDeptId}','${prodObj.createdRoleId}', '${prodObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })

      const tempProducts = (await conn.BulkProductTemp.findAll({
        where: {
          prodTranId: prodObj.tranId,
          productBenefits: {
            [Op.ne]: null
          }
        }
      })).map(el => el.get({ plain: true }))

      if (tempProducts.length) {
        // console.log(tempProducts)
        // console.log(tempProducts.map(x => x.productName))
        const products = (await conn.Product.findAll({ where: { productName: tempProducts.map(x => x.productName) } })).map(el => el.get({ plain: true }))
        const benefits = tempProducts.map(x => x.productBenefits).join(';').split(';').map(prodBenefit => ({ prodBenefit }))
        await conn.ProductBenefit.bulkCreate(benefits, { ignoreDuplicates: true })
        const productBenefits = await conn.ProductBenefit.findAll({ where: { prodBenefit: benefits.map(x => x.prodBenefit) } })
        const productBenefitMappings = []
        // eslint-disable-next-line array-callback-return
        benefits.map(x => {
          const productBenefitId = productBenefits.find(prodBenefit => prodBenefit.dataValues.prodBenefit === x.prodBenefit)?.productBenefitId
          const productName = tempProducts.find(tempProduct => tempProduct.productBenefits.split(';').includes(x.prodBenefit))?.productName
          const productId = products.find(product => product.productName === productName)?.productId
          productBenefitMappings.push({ productBenefitId, productId })
        })
        await conn.ProductBenefitMap.bulkCreate(productBenefitMappings, { ignoreDuplicates: true })
      }

      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Product details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyServices (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'SERVICE',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            serviceTranId: userObj.tranId,
            serviceCreatedDeptId: userObj.createdDeptId,
            serviceCreatedRoleId: userObj.createdRoleId,
            serviceCreatedBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        const createdBulkServiceTemp = await conn.BulkServiceTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_service_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        await t.commit()
        if (createdBulkServiceTemp) {
          const bulkServiceIds = createdBulkServiceTemp.map((x) => x.bulkServiceId)
          response = await conn.BulkServiceTemp.findAll({
            where: {
              bulkServiceId: bulkServiceIds
            }
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Service details',
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

  async createBulkService (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_service_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Service details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyCustomers (payload, customerObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'CUSTOMER',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: customerObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            customerTranId: customerObj.tranId,
            customerCreatedDeptId: customerObj.createdDeptId,
            customerCreatedRoleId: customerObj.createdRoleId,
            customerCreatedBy: customerObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        const createdBulkCustomerTemp = await conn.BulkCustomerTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_customer_validations ('${customerObj.tranId}','${customerObj.createdDeptId}', '${customerObj.createdRoleId}', '${customerObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        await t.commit()
        if (createdBulkCustomerTemp) {
          const bulkCustomerIds = createdBulkCustomerTemp.map((x) => x.bulkCustomerId)
          response = await conn.BulkCustomerTemp.findAll({
            where: {
              bulkCustomerId: bulkCustomerIds
            }
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Customer details',
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

  async createBulkCustomer (payload, customerObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_customer_migration('${customerObj.tranId}','${customerObj.createdDeptId}','${customerObj.createdRoleId}', '${customerObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Customer details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async bulkUploadSearch (payload, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let { limit = 10, page = 0, excel = false } = payload
      let offSet = (page * limit)
      if (excel) {
        offSet = undefined
        limit = undefined
      }
      let whereClause = {}
      let userWhere = {}
      const sequelize = db.sequelize
      if (payload?.uploadedDate) {
        whereClause = {
          [Op.and]: [{ createdAt: { [Op.gte]: payload?.uploadedDate } }]
        }
      }
      if (payload?.processId) {
        whereClause.bulkUploadId = {
          [Op.and]: [sequelize.where(sequelize.cast(sequelize.col('BulkUploadDetail.bulk_upload_id'), 'varchar'), {
            [Op.like]: `%${payload?.processId.toString()}%`
          })]
        }
      }
      if (payload?.uploadType) {
        whereClause.uploadTableName = payload?.uploadType
      }
      if (payload?.uploadedBy) {
        userWhere = {
          [Op.and]: [sequelize.where(sequelize.fn('concat', sequelize.fn('UPPER', sequelize.col('first_name')), ' ',
            sequelize.fn('UPPER', sequelize.col('last_name'))), {
            [Op.like]: `%${payload?.uploadedBy.toUpperCase()}%`
          })]
        }
      }
      const response = await conn.BulkUploadDetail.findAndCountAll({
        include: [
          {
            model: conn.User,
            as: 'createdByUser',
            attributes: ['firstName', 'lastName'],
            where: userWhere
          }
        ],
        where: whereClause,
        offset: offSet,
        limit: excel === false ? Number(limit) : limit,
        transaction: t
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully fetched bulk upload details',
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

  async getDetails (payload, conn, t) {
    try {
      if (isEmpty(payload) || !payload.type || !payload.bulkuploadId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let { limit = 10, page = 0, excel = false, type, bulkuploadId } = payload
      let offSet = (page * limit)
      if (excel) {
        offSet = undefined
        limit = undefined
      }
      let response
      if (type === 'CUSTOMER') {
        response = await conn.BulkCustomerTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          order: [['bulkUploadId', 'ASC']],
          limit: Number(limit),
          logging: true
        })
      } else if (type === 'USER') {
        response = await conn.BulkUserTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'REQUEST_STATEMENT') {
        response = await conn.BulkRequestStatementTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'CHARGE') {
        response = await conn.BulkChargeTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'PRODUCT') {
        response = await conn.BulkProductTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'ORDER') {
        response = await conn.BulkOrderTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'PROFILE') {
        response = await conn.BulkProfileTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'SERVICE') {
        response = await conn.BulkServiceTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'INTERACTION') {
        response = await conn.BulkInteractionTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'ENTITY_TRANSACTION_MAPPING') {
        response = await conn.BulkEntityTransactionMappingTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'BUSINESS_UNITS') {
        response = await conn.BulkBusinessUnitTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'SKILL') {
        response = await conn.BulkSkillTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'CALENDAR') {
        response = await conn.BulkCalendarTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'HOLIDAY_CALENDAR') {
        response = await conn.BulkHolidayCalendarTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'USER_SKILL') {
        response = await conn.BulkUserSkillTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'APPOINTMENT') {
        response = await conn.BulkAppointmentTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'CONTRACT') {
        response = await conn.BulkContractTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'INVOICE') {
        response = await conn.BulkInvoiceTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      } else if (type === 'PAYMENT') {
        response = await conn.BulkPaymentTemp.findAndCountAll({
          where: { bulkUploadId: Number(bulkuploadId) },
          offset: offSet,
          limit: Number(limit),
          order: [['bulkUploadId', 'ASC']],
          logging: true
        })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully fetched bulk upload details',
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

  async verifyInteractions (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'INTERACTION',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            interactionTranId: userObj.tranId,
            interactionCreatedDeptId: userObj.createdDeptId,
            interactionCreatedRoleId: userObj.createdRoleId,
            createdBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        const createdBulkInteractionTemp = await conn.BulkInteractionTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_interaction_validations('${userObj.tranId}','${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        await t.commit()
        if (createdBulkInteractionTemp) {
          const bulkInteractionIds = createdBulkInteractionTemp.map((x) => x.bulkInteractionId)
          response = await conn.BulkInteractionTemp.findAll({
            where: {
              bulkInteractionId: bulkInteractionIds
            }
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Interaction details',
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

  async createBulkInteraction (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_interaction_migration('${userObj.tranId}','${userObj.createdBy}')`
      const response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Interaction details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyCharge (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'CHARGE',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }

      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            chargeTranId: userObj.tranId,
            chargeCreatedDeptId: userObj.createdDeptId,
            chargeCreatedRoleId: userObj.createdRoleId,
            chargeCreatedBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        const createdBulkChargeTemp = await conn.BulkChargeTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_charge_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })

        await t.commit()
        if (createdBulkChargeTemp) {
          const bulkChargeIds = createdBulkChargeTemp.map((x) => x.bulkChargeId)
          response = await conn.BulkChargeTemp.findAll({
            where: {
              bulkChargeId: bulkChargeIds
            }
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Charge details',
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

  async createBulkCharge (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_charge_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Charge details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyOrders (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'ORDER',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: Number(bulkUploadCreate.bulkUploadId),
            orderTranId: userObj.tranId,
            createdDept: userObj.createdDeptId,
            createdRole: userObj.createdRoleId,
            createdBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        const createdBulkOrderTemp = await conn.BulkOrderTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_order_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        await t.commit()
        if (createdBulkOrderTemp) {
          const bulkOrderIds = createdBulkOrderTemp.map((x) => x.bulkOrderId)
          response = await conn.BulkOrderTemp.findAll({
            where: {
              bulkOrderId: bulkOrderIds
            }
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Order details',
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

  async createBulkOrder (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_order_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Order details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyBulkBusinessUnits (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'BUSINESS_UNITS',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        // console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: Number(bulkUploadCreate.bulkUploadId),
            buTranId: userObj.tranId,
            buCreatedDeptId: userObj.createdDeptId,
            buCreatedRoleId: userObj.createdRoleId,
            buCreatedBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('new reqBody', reqBody)
        const createdBulkBusinessUnitTemp = await conn.BulkBusinessUnitTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_bu_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        // await t.commit()
        if (createdBulkBusinessUnitTemp) {
          const bulkBuIds = createdBulkBusinessUnitTemp.map((x) => x.bulkBuId)
          response = await conn.BulkBusinessUnitTemp.findAll({
            where: {
              bulkBuId: bulkBuIds
            },
            transaction: t
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Business Unit details',
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

  async createBulkBusinessUnits (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_bu_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Order details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyCalendar (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'CALENDAR',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        // console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: Number(bulkUploadCreate.bulkUploadId),
            calendarTranId: userObj.tranId,
            calendarCreatedDeptId: userObj.createdDeptId,
            calendarCreatedRoleId: userObj.createdRoleId,
            calendarCreatedBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('new reqBody', reqBody)
        const createdBulkCalendarTemp = await conn.BulkCalendarTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_calendar_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        // await t.commit()
        if (createdBulkCalendarTemp) {
          const bulkCaledarIds = createdBulkCalendarTemp.map((x) => x.bulkCalendarId)
          response = await conn.BulkCalendarTemp.findAll({
            where: {
              bulkCalendarId: bulkCaledarIds
            },
            transaction: t
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Business Unit details',
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

  async createCalendar (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_calendar_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Order details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyHolidayCalendar (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'HOLIDAY_CALENDAR',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: Number(bulkUploadCreate.bulkUploadId),
            holidayTranId: userObj.tranId,
            createdDeptId: userObj.createdDeptId,
            createdRoleId: userObj.createdRoleId,
            createdBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        const createdBulkHolidayCalendarTemp = await conn.BulkHolidayCalendarTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_holiday_calendar_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        if (createdBulkHolidayCalendarTemp) {
          const bulkHolidayIds = createdBulkHolidayCalendarTemp.map((x) => x.bulkHolidayId)
          response = await conn.BulkHolidayCalendarTemp.findAll({
            where: {
              bulkHolidayId: bulkHolidayIds
            },
            transaction: t
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Holiday calendar',
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

  async createShift (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_shift_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Order details',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyShift (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'SHIFT',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        // console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: Number(bulkUploadCreate.bulkUploadId),
            shiftTranId: userObj.tranId,
            createdDeptId: userObj.createdDeptId,
            createdRoleId: userObj.createdRoleId,
            createdBy: userObj.userId,
            createdAt: new Date()
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('new reqBody', reqBody)
        const createdBulkShiftTemp = await conn.BulkShiftTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_shift_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        // await t.commit()
        if (createdBulkShiftTemp) {
          const bulkShiftIds = createdBulkShiftTemp.map((x) => x.bulkShiftId)
          response = await conn.BulkShiftTemp.findAll({
            where: {
              bulkShiftId: bulkShiftIds
            },
            transaction: t
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Business Unit details',
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

  async verifySkill (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'HOLIDAY_CALENDAR',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: Number(bulkUploadCreate.bulkUploadId),
            holidayTranId: userObj.tranId,
            createdDeptId: userObj.createdDeptId,
            createdRoleId: userObj.createdRoleId,
            createdBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        const createdBulkHolidayCalendarTemp = await conn.BulkHolidayCalendarTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_holiday_calendar_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        if (createdBulkHolidayCalendarTemp) {
          const bulkHolidayIds = createdBulkHolidayCalendarTemp.map((x) => x.bulkHolidayId)
          response = await conn.BulkHolidayCalendarTemp.findAll({
            where: {
              bulkHolidayId: bulkHolidayIds
            },
            transaction: t
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Holiday calendar',
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

  async createHolidayCalendar (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_holiday_calendar_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Holiday Calendar',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifySkill (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'SKILL',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }

      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            skillTranId: userObj.tranId,
            skillCreatedDeptId: userObj.createdDeptId,
            skillCreatedRoleId: userObj.createdRoleId,
            skillCreateBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        console.log('reqBody', reqBody)
        const responseTemp = await conn.BulkSkillTemp.bulkCreate(reqBody, { transaction: t })
        console.log('createdBulkSkillTemp', responseTemp)
        if (responseTemp) {
          const query = `SELECT bcae_bulk_skill_mst_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
          await conn.sequelize.query(query, {
            type: QueryTypes.SELECT,
            transaction: t
          })
          await t.commit()
          if (responseTemp) {
            const bulkSkillIds = responseTemp.map((x) => x.bulkSkillId)
            response = await conn.BulkSkillTemp.findAll({
              where: {
                bulkSkillId: bulkSkillIds
              }
            })
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Skill',
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

  async createSkill (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_skill_mst_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Skill',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyUserSkill (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'USER_SKILL',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }

      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: bulkUploadCreate.bulkUploadId,
            skillMapTranId: userObj.tranId,
            skillCreatedDeptId: userObj.createdDeptId,
            skillCreatedRoleId: userObj.createdRoleId,
            skillCreateBy: userObj.userId
          }
          reqBody.push({ ...rec, ...obj })
        }
        const responseTemp = await conn.BulkUserSkillTemp.bulkCreate(reqBody, { transaction: t })
        if (responseTemp) {
          const query = `SELECT  bcae_bulk_skill_mst_map_validations('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
          await conn.sequelize.query(query, {
            type: QueryTypes.SELECT,
            transaction: t
          })
          await t.commit()
          if (responseTemp) {
            const bulkUserSkillIds = responseTemp.map((x) => x.bulkSkillMapId)
            response = await conn.BulkUserSkillTemp.findAll({
              where: {
                bulkSkillMapId: bulkUserSkillIds
              }
            })
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified User Skill',
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

  async createUserSkill (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_skill_mst_map_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created User Skill',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyAppointment (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'APPOINTMENT',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        // console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: Number(bulkUploadCreate.bulkUploadId),
            appointmentTranId: userObj.tranId,
            createdDeptId: userObj.createdDeptId,
            createdRoleId: userObj.createdRoleId,
            createdBy: userObj.userId,
            createdAt: new Date()
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('new reqBody', reqBody)
        const createdBulkAppointmentTemp = await conn.BulkAppointmentTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_appointment_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        // await t.commit()
        if (createdBulkAppointmentTemp) {
          const bulkAppointmentIds = createdBulkAppointmentTemp.map((x) => x.bulkAppointmentId)
          response = await conn.BulkAppointmentTemp.findAll({
            where: {
              bulkAppointmentId: bulkAppointmentIds
            },
            transaction: t
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Business Unit details',
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

  async createAppointment (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_appointment_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created User Skill',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyContract (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'CONTRACT',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        // console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: Number(bulkUploadCreate.bulkUploadId),
            contractTranId: userObj.tranId,
            createdDeptId: userObj.createdDeptId,
            createdRoleId: userObj.createdRoleId,
            createdBy: userObj.userId,
            createdAt: new Date()
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('new reqBody', reqBody)
        const createdBulkContractTemp = await conn.BulkContractTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_contract_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        // await t.commit()
        if (createdBulkContractTemp) {
          const bulkContractIds = createdBulkContractTemp.map((x) => x.bulkContractId)
          response = await conn.BulkContractTemp.findAll({
            where: {
              bulkContractId: bulkContractIds
            },
            transaction: t
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Contract details',
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

  async createContract (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_contract_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Contract',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyInvoice (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'INVOICE',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        // console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: Number(bulkUploadCreate.bulkUploadId),
            invoiceTranId: userObj.tranId,
            invoiceCreatedDeptId: userObj.createdDeptId,
            invoiceCreatedRoleId: userObj.createdRoleId,
            // createdDeptId: userObj.createdDeptId,
            // createdRoleId: userObj.createdRoleId,
            createdBy: userObj.userId,
            createdAt: new Date()
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('new reqBody', reqBody)
        const createdBulkInvoiceTemp = await conn.BulkInvoiceTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_invoice_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        // await t.commit()
        if (createdBulkInvoiceTemp) {
          const bulkInvoiceIds = createdBulkInvoiceTemp.map((x) => x.bulkInvoiceId)
          response = await conn.BulkInvoiceTemp.findAll({
            where: {
              bulkInvoiceId: bulkInvoiceIds
            },
            transaction: t
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Invoice details',
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

  async createInvoice (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_invoice_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Contract',
        data: bulkUploadDetail
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async verifyPayment (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let response
      const bulkUploadData = {
        uploadTableName: 'PAYMENT',
        uploadFileName: payload?.fileName,
        uploadStatus: 'SUCCESS',
        createdBy: userObj?.createdBy
      }
      const bulkUploadCreate = await conn.BulkUploadDetail.create(bulkUploadData, { transaction: t })
      if (bulkUploadCreate) {
        // console.log('payload.list', payload.list)
        const reqBody = []
        for (const rec of payload.list) {
          const obj = {
            bulkUploadId: Number(bulkUploadCreate.bulkUploadId),
            paymentTranId: userObj.tranId,
            createdDeptId: userObj.createdDeptId,
            createdRoleId: userObj.createdRoleId,
            // createdDeptId: userObj.createdDeptId,
            // createdRoleId: userObj.createdRoleId,
            createdBy: userObj.userId,
            createdAt: new Date()
          }
          reqBody.push({ ...rec, ...obj })
        }
        // console.log('new reqBody', reqBody)
        const createdBulkPaymentTemp = await conn.BulkPaymentTemp.bulkCreate(reqBody, { transaction: t })
        const query = `SELECT bcae_bulk_payment_validations ('${userObj.tranId}','${userObj.createdDeptId}', '${userObj.createdRoleId}', '${userObj.createdBy}')`
        await conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        // await t.commit()
        if (createdBulkPaymentTemp) {
          const bulkPaymentIds = createdBulkPaymentTemp.map((x) => x.bulkPaymentId)
          response = await conn.BulkPaymentTemp.findAll({
            where: {
              bulkPaymentId: bulkPaymentIds
            },
            transaction: t
          })
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Verified Invoice details',
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

  async createPayment (payload, userObj, conn, t) {
    try {
      if (isEmpty(payload)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `SELECT bcae_bulk_payment_migration('${userObj.tranId}','${userObj.createdDeptId}','${userObj.createdRoleId}', '${userObj.createdBy}')`
      await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      const bulkUploadDetail = await conn.BulkUploadDetail.findOne({ where: { bulkUploadId: payload.bulkUploadId }, transaction: t, raw: true })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Succesfully Created Contract',
        data: bulkUploadDetail
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

module.exports = BulkuploadService
