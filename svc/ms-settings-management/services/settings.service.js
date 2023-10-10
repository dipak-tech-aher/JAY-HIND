// import { logger } from '../config/logger'
import { CryptoHelper, ResponseHelper, logger, statusCodeConstants } from '@utils'
// import { PortalSetting, User, sequelize } from '../model'
// import { defaultMessage } from '../utils/constant'
// import { findAndUpdateAttachment } from '../attachments/service'
// import got from 'got'
// const nodemailer = require('nodemailer')

export class SettingService {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.cryptoHelper = new CryptoHelper()
  }

  async getAllJobs (payload, conn) {
    try {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Success'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  // async createPortalSetting (inputData, userId, conn) {
  //   const t = await sequelize.transaction()
  //   try {
  //     logger.info('Creating new portal setting')
  //     let requestBody = inputData.body
  //     const userId = userId
  //     if (!requestBody) {
  //       return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
  //     }
  //     requestBody = {
  //       ...requestBody,
  //       createdBy: userId
  //     }
  //     let response = await PortalSetting.create(requestBody, { transaction: t })

  //     if (requestBody.attachment === true) {
  //       const ldapClientCertificate = []
  //       const ldapCaCertificate = []
  //       const chatLogo = []
  //       const settingId = response.settingId

  //       if (Array.isArray(requestBody.mappingPayload.ldapClientCertificate)) {
  //         for (const e of requestBody.mappingPayload.ldapClientCertificate) {
  //           ldapClientCertificate.push({ ...e, entityId: settingId.toString() })
  //           await findAndUpdateAttachment(e.entityId, settingId.toString(), e.entityType, t)
  //         }
  //       }

  //       if (Array.isArray(requestBody.mappingPayload.ldapCaCertificate)) {
  //         for (const e of requestBody.mappingPayload.ldapCaCertificate) {
  //           ldapCaCertificate.push({ ...e, entityId: settingId.toString() })
  //           await findAndUpdateAttachment(e.entityId, settingId.toString(), e.entityType, t)
  //         }
  //       }

  //       if (Array.isArray(requestBody.mappingPayload.logo)) {
  //         for (const e of requestBody.mappingPayload.logo) {
  //           chatLogo.push({ ...e, entityId: settingId.toString() })
  //           await findAndUpdateAttachment(e.entityId, settingId.toString(), e.entityType, t)
  //         }
  //       }

  //       if (ldapClientCertificate && ldapCaCertificate) {
  //         requestBody.mappingPayload = ({ ...requestBody.mappingPayload, ldapClientCertificate: ldapClientCertificate, ldapCaCertificate: ldapCaCertificate })
  //       } else {
  //         requestBody.mappingPayload = ({ ...requestBody.mappingPayload, logo: chatLogo })
  //       }
  //       response = await PortalSetting.update(requestBody, { where: { settingId: response.settingId }, transaction: t })
  //     }
  //     await t.commit()
  //     logger.debug('Portal Setting created successfully')
  //     return this.responseHelper.onSuccess(res, 'Portal Setting created successfully', response)
  //   } catch (error) {
  //     logger.error(error, defaultMessage.ERROR)
  //     return this.responseHelper.onError(res, new Error('Error while creating Portal Setting'))
  //   } finally {
  //     if (t && !t.finished) {
  //       await t.rollback()
  //     }
  //   }
  // }

  // async getPortalSettingList (inputData, userId, conn) {
  //   try {
  //     logger.info('Getting the Portal Setting List')
  //     const { limit = 10, page = 0 } = req.query
  //     const offSet = page * limit
  //     const response = await PortalSetting.findAndCountAll({
  //       order: [['settingId', 'DESC']],
  //       offset: offSet,
  //       limit: Number(limit)
  //     })
  //     logger.debug('Portal Setting List Fetched  successfully')
  //     return this.responseHelper.onSuccess(res, 'Portal Setting List Fetched successfully', response)
  //   } catch (error) {
  //     logger.error(error, defaultMessage.ERROR)
  //     return this.responseHelper.onError(res, new Error('Error while fetching Portal Setting List '))
  //   }
  // }

  // async updatePortalSetting (inputData, userId, conn) {
  //   const t = await sequelize.transaction()
  //   try {
  //     logger.info('Updating Portal Setting')
  //     const requestBody = inputData.body
  //     const userId = userId
  //     if (!requestBody && !requestBody.settingId) {
  //       return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
  //     }
  //     const portalSettingInfo = await PortalSetting.findOne({ where: { settingId: requestBody.settingId } })
  //     if (!portalSettingInfo) {
  //       logger.debug(defaultMessage.NOT_FOUND)
  //       return this.responseHelper.notFound(res, new Error(defaultMessage.NOT_FOUND))
  //     }
  //     const portalSettingBody = {
  //       ...requestBody,
  //       updatedBy: userId
  //     }
  //     if (Array.isArray(requestBody.mappingPayload.ldapClientCertificate)) {
  //       for (const e of requestBody.mappingPayload.ldapClientCertificate) {
  //         await findAndUpdateAttachment(e.entityId, requestBody.settingId, e.entityType, t)
  //       }
  //     }

  //     if (Array.isArray(requestBody.mappingPayload.ldapCaCertificate)) {
  //       for (const e of requestBody.mappingPayload.ldapCaCertificate) {
  //         await findAndUpdateAttachment(e.entityId, requestBody.settingId, e.entityType, t)
  //       }
  //     }

  //     if (Array.isArray(requestBody.mappingPayload.logo)) {
  //       for (const e of requestBody.mappingPayload.logo) {
  //         await findAndUpdateAttachment(e.entityId, requestBody.settingId, e.entityType, t)
  //       }
  //     }

  //     delete portalSettingBody.settingId
  //     let response = await PortalSetting.update(portalSettingBody, { where: { settingId: requestBody.settingId }, transaction: t })
  //     await t.commit()
  //     response = await PortalSetting.findOne({ where: { settingId: requestBody.settingId } })
  //     logger.debug('Portal Setting updated successfully')
  //     return this.responseHelper.onSuccess(res, 'Portal Setting updated successfully', response)
  //   } catch (error) {
  //     logger.error(error, defaultMessage.ERROR)
  //     return this.responseHelper.onError(res, new Error('Error while updating Portal Setting'))
  //   } finally {
  //     if (t && !t.finished) {
  //       await t.rollback()
  //     }
  //   }
  // }

  // async sendSmtpMail (inputData, userId, conn) {
  //   try {
  //     logger.debug('Sending mail to user')
  //     const { to, testMessage, smtpServer, smtpPort, smtpUserName, smtpPassword, smtpEmailAddress } = inputData.body
  //     const transporter = nodemailer.createTransport({
  //       host: smtpServer,
  //       port: smtpPort,
  //       auth: {
  //         user: smtpUserName,
  //         pass: smtpPassword
  //       }
  //     })
  //     const response = await transporter.sendMail({
  //       from: smtpEmailAddress,
  //       to: to,
  //       subject: 'Test Mail Sent',
  //       html: `<h1>${testMessage}</h1>`
  //     })
  //     logger.debug('Successfully send email')
  //     return this.responseHelper.onSuccess(res, 'Mail sent successfully', response)
  //   } catch (error) {
  //     logger.error(error, defaultMessage.ERROR)
  //     return this.responseHelper.onError(res, new Error('Error while sending mail '))
  //   }
  // }

  // async sendSms (inputData, userId, conn) {
  //   try {
  //     logger.debug('Sending sms to user')
  //     const { to, testMessage, smsServer, smsPort, smsUserName, smsPassword, smsAppId } = inputData.body
  //     let response = await got.get({
  //       url: smsServer + '?app=' + smsAppId + '&u=' + smsUserName + '&h=' + smsPassword + '&op=' + smsPort + '&to=' + Number(to) + '&msg=' + testMessage,
  //       retry: 0
  //     })
  //     // response = JSON.parse(response.body)
  //     logger.debug('Successfully send sms')
  //     return this.responseHelper.onSuccess(res, 'sms sent successfully', response)
  //   } catch (error) {
  //     logger.error(error, defaultMessage.ERROR)
  //     return this.responseHelper.onError(res, new Error('Error while sending sms '))
  //   }
  // }

  // async getPortalSetting (inputData, userId, conn) {
  //   try {
  //     logger.debug('Fetching portal setting details')
  //     const { type } = req.params
  //     if (!type) {
  //       return this.responseHelper.validationError(res, new Error(defaultMessage.MANDATORY_FIELDS_MISSING))
  //     }
  //     const portalSetting = await PortalSetting.findOne({
  //       where: { settingType: type },
  //       include: [
  //         {
  //           model: User,
  //           as: 'createdByName',
  //           attributes: ['firstName', 'lastName']
  //         },
  //         {
  //           model: User,
  //           as: 'updatedByName',
  //           attributes: ['firstName', 'lastName']
  //         }
  //       ]
  //     })
  //     if (!portalSetting) {
  //       logger.debug(defaultMessage.NOT_FOUND)
  //       return this.responseHelper.onSuccess(res, 'portal setting Details Not found', portalSetting)
  //     }
  //     logger.debug('Successfully fetched portal setting details')
  //     return this.responseHelper.onSuccess(res, 'Successfully fetched portal setting details', portalSetting)
  //   } catch (error) {
  //     logger.error(error, defaultMessage.ERROR)
  //     return this.responseHelper.onError(res, new Error('Error while fetching portal setting details'))
  //   }
  // }
}
module.exports = SettingService
