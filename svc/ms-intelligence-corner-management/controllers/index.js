import IntelligenceCornerService from '@services/intelligenceCorner.service'
import { statusCodeConstants, logger, ResponseHelper } from '@utils'
import { getEventsValidator, getKnowledgeBaseValidator, getServiceCountValidator } from '@validators'
import { getConnection } from '@services/connection-service'

export class IntelligenceCornerController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    // this.intelligenceCornerService = new IntelligenceCornerService()
  }

  async getEvents (req, res) {
    try {
      const { query, userId } = req

      const { error } = getEventsValidator.validate(query)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      let response
      if (query?.for === 'calendar') {
        response = await intelligenceCornerService.getCustomerCalendarEvents(query, userId)
      } else {
        response = await intelligenceCornerService.getEvents(query, userId)
      }
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async initIntelligenceCornerService () {
    const conn = await getConnection()
    return {
      conn,
      intelligenceCornerService: new IntelligenceCornerService(conn)
    }
  }

  async getBillMonths (req, res) {
    try {
      const { customerUuid } = req.body
      if (!customerUuid) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()

      const response = await intelligenceCornerService.getBillMonths(customerUuid, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getBillInfo (req, res) {
    try {
      const { customerUuid, billMonth } = req.body
      if (!customerUuid) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()

      const response = await intelligenceCornerService.getBillInfo(customerUuid, billMonth, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getIntelligence (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { error } = getKnowledgeBaseValidator.validate(body)

      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error?.message })
      }
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.predictInteractionSolution(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getServicesCount (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req

      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getServicesCount(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAccountStatus (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req

      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getAccountStatus(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getOrders (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req

      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getOrders(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getServicesStatus (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getServicesStatus(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getPaymentStatus (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getPaymentStatus(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInvoices (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getInvoices(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getOrderDetails (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { error } = getServiceCountValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getOrderDetails(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRecentInteractions (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getRecentInteractions(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRecentSubscriptions (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getRecentSubscriptions(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRecentBills (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getRecentBills(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRecentInvoices (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getRecentInvoices(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRecentOrders (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getRecentOrders(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async serviceOrder (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.serviceOrder(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async checkContractOfOrder (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.checkContractOfOrder(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async checkBillingOfService (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.checkBillingOfService(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async checkAllActivities (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.checkAllActivities(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRecentOrder (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getRecentOrder(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRecentChannels (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getRecentChannels(body, departmentId, userId, roleId)
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRecentChannelActivity (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getRecentChannelActivity(body, departmentId, userId, roleId)
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async checkExistingCustomer (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.checkExistingCustomer(body, departmentId, userId, roleId)
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getProductFamily (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getProductFamily(body, departmentId, userId, roleId)
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getProductFamilyProducts (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getProductFamilyProducts(body, departmentId, userId, roleId)
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getExistingServices (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getExistingServices(body, departmentId, userId, roleId)
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRepeatedRequest (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getRepeatedRequest(body, departmentId, userId, roleId)
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateRequest (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.updateRequest(body, departmentId, userId, roleId)
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async saveInteractionStatement (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { conn, intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.saveInteractionStatement(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerCurrentInformation (req, res) {
    try {
      const { body, departmentId, userId, roleId } = req
      const { intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getCustomerCurrentInformation(body, departmentId, userId, roleId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateCustomerService (req, res) {
    let t
    try {
      const { body } = req
      const { intelligenceCornerService, conn } = await this.initIntelligenceCornerService()
      t = await conn.sequelize.transaction()
      const response = await intelligenceCornerService.updateCustomerService(body, t)
      if (response.status === 200) t.commit()
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

  async getAddonList (req, res) {
    try {
      const { body } = req
      const { intelligenceCornerService } = await this.initIntelligenceCornerService()
      const response = await intelligenceCornerService.getAddonList(body)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async purchaseAddon (req, res) {
    let t
    try {
      const { body } = req
      const { intelligenceCornerService, conn } = await this.initIntelligenceCornerService()
      t = await conn.sequelize.transaction()
      const response = await intelligenceCornerService.purchaseAddon(body, t)
      if (response.status === 200) t.commit()
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
}
