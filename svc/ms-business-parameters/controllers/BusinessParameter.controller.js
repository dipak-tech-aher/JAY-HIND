import BusinessParameterService from '@services/BusinessParameter.service'
import { statusCodeConstants, logger, ResponseHelper, defaultMessage } from '@utils'
import {
  createBusinessParameterValidator, updateBusinessParameterValidator,
  getBusinessParameterValidator, getBusinessParameterListValidator,
  getChannelSettingByIdValidator, verifyBusinessParameterRecordsValidator,
  // createChannelSettingValidator, createEmailTemplateValidator,
  getBusinessParameterLookupValidator, updateOrCreateBusinessDetailsValidator
} from '@validators/BusinessParameter.validator'
const { getConnection } = require('@services/connection-service')

export class BusinessParameterController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.businessParameterService = new BusinessParameterService()
  }

  async getFAQs (req, res) {
    try {
      const { query } = req
      const conn = await getConnection()
      const response = await this.businessParameterService.getFAQs(query, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createOrUpdateFAQs (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.createOrUpdateFAQs(body, conn, departmentId, userId, roleId, t)
      if (response.status === 200) await t.commit()
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

  async deleteFAQs (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.deleteFAQs(body, conn, departmentId, userId, roleId, t)
      if (response.status === 200) await t.commit()
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

  async saveCard (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.saveCard(body, conn, departmentId, userId, roleId, t)
      if (response.status === 200) await t.commit()
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

  async getBusinessParameterLookup (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body
      }
      if (!data) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: defaultMessage.VALIDATION_ERROR })
      }
      const { error } = getBusinessParameterLookupValidator.validate(data)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }

      const conn = await getConnection()
      const response = await this.businessParameterService.getBusinessParameterLookup(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRecords (req, res) {
    try {
      const response = {
        status: statusCodeConstants.SUCCESS,
        message: 'success',
        data: [{
          code: 'ST_LAPTOP',
          value: 'Laptop'
        }]
      }
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAddressLookup (req, res) {
    try {
      const { query, params } = req
      const data = {
        ...query,
        ...params
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getAddressLookup(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getMainMenuByRole (req, res) {
    try {
      const { query, params } = req
      const data = {
        ...query,
        ...params,
        roleId: req.roleId
      }
      // const { error } = getBusinessParameterListValidator.validate(data)
      // if (error) {
      //   logger.debug('Validating Input with validation Schema')
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.businessParameterService.getMainMenuByRole(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createTemplateMaster (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.createTemplateMaster(body, conn, departmentId, userId, roleId, t)
      if (response.status === 200) await t.commit()
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

  async updateTemplateMaster (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.updateTemplateMaster(body, conn, departmentId, userId, roleId, t)
      if (response.status === 200) await t.commit()
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

  async getModulesList (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.businessParameterService.getModulesList(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async checkRoster (req, res) {
    try {
      const { query, userId, departmentId, roleId } = req
      const conn = await getConnection()
      const response = await this.businessParameterService.checkRoster(query, conn, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async businessDetails (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const { error } = updateOrCreateBusinessDetailsValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.businessDetails(body, conn, departmentId, userId, roleId, t)
      if (response.status === 200) await t.commit()
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

  async setPinnedStatus (req, res) {
    let t
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.setPinnedStatus(data, conn, t)
      if (response.status === 200) await t.commit()
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

  async createTemplateMapping (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      // const { error } = createBusinessParameterValidator.validate(body)
      // if (error) {
      //   logger.debug('Validating Input with validation Schema')
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.createTemplateMapping(body, conn, departmentId, userId, roleId, t)
      if (response.status === 200) await t.commit()
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

  async updateTemplateMapping (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      // const { error } = createBusinessParameterValidator.validate(body)
      // if (error) {
      //   logger.debug('Validating Input with validation Schema')
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.updateTemplateMapping(body, conn, departmentId, userId, roleId, t)
      if (response.status === 200) await t.commit()
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

  async getCalendarMaster (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getCalendarMaster(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getMappedUnmappedTemplate (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getMappedUnmappedTemplate(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTemplateDetails (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getTemplateDetails(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInteractionTemplateDetails (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getInteractionTemplateDetails(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAvailableAppointment (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getAvailableAppointment(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAvailableAppointmentWebSelfCare (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getAvailableAppointmentWebSelfCare(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async tempAppointmentCreate (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const authData = {
        tenantId: req.headers['x-tenant-id']
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.tempAppointmentCreate(body, authData, conn, departmentId, userId, roleId, t)
      if (response.status === 200) await t.commit()
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

  async getHolidayMaster (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      // const { error } = getBusinessParameterListValidator.validate(data)
      // if (error) {
      //   logger.debug('Validating Input with validation Schema')
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.businessParameterService.getHolidayMaster(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async calculateAppointmentSlots (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.calculateAppointmentSlots(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getNotificationHeaders (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.businessParameterService.getNotificationHeaders(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getShiftMasters (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.businessParameterService.getShiftMasters(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createBusinessParameter (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const { error } = createBusinessParameterValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.createBusinessParameter(body, userId, departmentId, roleId, conn, t)
      if (response.status === 200) await t.commit()
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

  async updateBusinessParameter (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const { error } = updateBusinessParameterValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.updateBusinessParameter(body, userId, departmentId, roleId, conn, t)
      if (response.status === 200) await t.commit()
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

  async updateBcaeAppConfig (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId, params } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.updateBcaeAppConfig(body, params, userId, departmentId, roleId, conn, t)
      if (response.status === 200) await t.commit()
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

  async getBusinessParameterCodeTypeList (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.businessParameterService.getBusinessParameterCodeTypeList(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getBusinessParameter (req, res) {
    try {
      const { code } = req.params
      const { error } = getBusinessParameterValidator.validate(code)
      const conn = await getConnection()
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const response = await this.businessParameterService.getBusinessParameter(code, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getBusinessParameterList (req, res) {
    try {
      const { query, body, params } = req
      const data = {
        ...query,
        ...params,
        ...body
      }
      const { error } = getBusinessParameterListValidator.validate(data)
      const conn = await getConnection()
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const response = await this.businessParameterService.getBusinessParameterList(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createBusinessParameterBulk (req, res) {
    try {
      const { body, userId } = req
      const { error } = createBusinessParameterBulkValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.createBusinessParameterBulk(body, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async verifyBusinessParameterRecords (req, res) {
    try {
      const { body } = req
      const { error } = verifyBusinessParameterRecordsValidator.validate(body)
      if (error) {
        logger.debug('Validating Input with validation Schema')
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.verifyBusinessParameterRecords(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createBcaeAppConfigRecord (req, res) {
    let t
    try {
      const { body, userId, departmentId, roleId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.createBcaeAppConfigRecord(body, conn, departmentId, userId, roleId, t)
      if (response.status === 200) await t.commit()
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

  async getBcaeAppConfigRecord (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.businessParameterService.getBcaeAppConfigRecord(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      console.log('error------->', error)
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async addToCart (req, res) {
    try {
      const { body, userId } = req
      const conn = await getConnection()
      const response = await this.businessParameterService.addToCart(conn, body, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCart (req, res) {
    let t
    try {
      const { body, userId } = req
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.businessParameterService.getCart(conn, body)
      if (response.status === 200) t.commit()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      })
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getCurrentCount (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.businessParameterService.getCurrentCount(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTotalCount (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.businessParameterService.getTotalCount(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAvailableAppointmentChat (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getAvailableAppointmentChat(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTermsAndConditions (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getTermsAndConditions(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  // async createChannelSetting (req, res) {
  //   try {
  //     const { body, userId } = req
  //     const { error } = createChannelSettingValidator.validate(body)
  //     if (error) {
  //       logger.debug('Validating Input with validation Schema')
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const response = await this.businessParameterService.createChannelSetting(body, userId)
  //     return this.responseHelper.sendResponse(req, res, response)
  //   } catch (error) {
  //     logger.error(error)
  //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //   }
  // }

  // async getchannelSettingList (req, res) {
  //   try {
  //     const { query, body } = req
  //     const data = {
  //       ...query,
  //       ...body
  //     }
  //     const { error } = getBusinessParameterListValidator.validate(data)
  //     if (error) {
  //       logger.debug('Validating Input with validation Schema')
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const response = await this.businessParameterService.getchannelSettingList(data)
  //     return this.responseHelper.sendResponse(req, res, response)
  //   } catch (error) {
  //     logger.error(error)
  //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //   }
  // }

  // async updatechannelSetting (req, res) {
  //   try {
  //     const { body, userId } = req
  //     const { error } = createChannelSettingValidator.validate(body)
  //     if (error) {
  //       logger.debug('Validating Input with validation Schema')
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const response = await this.businessParameterService.updateChannelSetting(body, userId)
  //     return this.responseHelper.sendResponse(req, res, response)
  //   } catch (error) {
  //     logger.error(error)
  //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //   }
  // }

  // async getchannelSetting (req, res) {
  //   try {
  //     const { params, query } = req
  //     const data = {
  //       ...params,
  //       ...query
  //     }
  //     const { error } = getChannelSettingByIdValidator.validate(data)
  //     if (error) {
  //       logger.debug('Validating Input with validation Schema')
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const response = await this.businessParameterService.getchannelSetting(data)
  //     return this.responseHelper.sendResponse(req, res, response)
  //   } catch (error) {
  //     logger.error(error)
  //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //   }
  // }

  // async createEmailTemplate (req, res) {
  //   try {
  //     const { body, userId } = req
  //     const { error } = createEmailTemplateValidator.validate(body)
  //     if (error) {
  //       logger.debug('Validating Input with validation Schema')
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const response = await this.businessParameterService.createEmailTemplate(body, userId)
  //     return this.responseHelper.sendResponse(req, res, response)
  //   } catch (error) {
  //     logger.error(error)
  //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //   }
  // }

  // async getEmailTemplateList (req, res) {
  //   try {
  //     const { query, body } = req
  //     const data = {
  //       ...query,
  //       ...body
  //     }
  //     const { error } = getBusinessParameterListValidator.validate(data)
  //     if (error) {
  //       logger.debug('Validating Input with validation Schema')
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const response = await this.businessParameterService.getEmailTemplateList(data)
  //     return this.responseHelper.sendResponse(req, res, response)
  //   } catch (error) {
  //     logger.error(error)
  //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //   }
  // }

  // async updateEmailTemplate (req, res) {
  //   try {
  //     const { body, userId } = req
  //     const { error } = createEmailTemplateValidator.validate(body)
  //     if (error) {
  //       logger.debug('Validating Input with validation Schema')
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const response = await this.businessParameterService.updateEmailTemplate(body, userId)
  //     return this.responseHelper.sendResponse(req, res, response)
  //   } catch (error) {
  //     logger.error(error)
  //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //   }
  // }

  async getFutureAvailableAppointmentChat (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getFutureAvailableAppointmentChat(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getMenus (req, res) {
    try {
      const { query, params, body } = req
      const data = {
        ...query,
        ...params,
        ...body,
        roleId: req.roleId
      }
      const conn = await getConnection()
      const response = await this.businessParameterService.getMenus(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
