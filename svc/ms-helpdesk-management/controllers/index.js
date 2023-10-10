import HelpdeskService from '@services/helpdesk.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import {
  assignTicketValidator, countBySourceValidator, createHelpDeskTicketValidator, getHelpdeskListValidator, replyHelpdeskTicketValidator,
  updateHelpdeskTicketValidator, helpdeskJobValidator, getprofileContactValidator, mapHelpdeskCustomerValidator
} from '@validators'

const { getConnection } = require('@services/connection-service')

export class HelpdeskController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.helpdeskService = new HelpdeskService()
  }

  async projectWiseOpenHelpdesk(req, res) {
    try {
      const { body, departmentId, roleId, userId } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.projectWiseOpenHelpdesk(body, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async helpdeskByType(req, res) {
    try {
      const { body, departmentId, roleId, userId } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.helpdeskByType(body, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async agentWiseOpenHelpdesk(req, res) {
    try {
      const { body, departmentId, roleId, userId } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.agentWiseOpenHelpdesk(body, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async openHelpdeskByAging(req, res) {
    try {
      const { body, departmentId, roleId, userId } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.openHelpdeskByAging(body, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async helpdeskByStatus(req, res) {
    try {
      const { body, departmentId, roleId, userId } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.helpdeskByStatus(body, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async helpdeskBySeverity(req, res) {
    try {
      const { body, departmentId, roleId, userId } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.helpdeskBySeverity(body, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async tktPendingWith(req, res) {
    try {
      const { body, departmentId, roleId, userId } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.tktPendingWith(body, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async monthlyTrend(req, res) {
    try {
      const { body, departmentId, roleId, userId } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.monthlyTrend(body, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async hourlyTickets(req, res) {
    try {
      const { body, departmentId, roleId, userId } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.hourlyTickets(body, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async summary(req, res) {
    try {
      const { body, departmentId, roleId, userId } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.summary(body, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createHelpDeskTicket(req, res) {
    let t
    try {
      const { body, departmentId, roleId, userId } = req
      const { error } = createHelpDeskTicketValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.helpdeskService.createHelpDeskTicket(body, departmentId, roleId, userId, conn, t)
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

  async updateHelpdeskTicket(req, res) {
    let t
    try {
      const { body, departmentId, roleId, userId, params } = req
      const { id, type } = params

      const data = {
        ...body,
        helpdeskId: id
      }

      let response

      if (type === 'REPLY') {
        const { error } = replyHelpdeskTicketValidator.validate(data)
        if (error) {
          return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
        }
        const conn = await getConnection()
        t = await conn.sequelize.transaction()
        response = await this.helpdeskService.replyHelpdeskTicket(data, departmentId, roleId, userId, conn, t)
      } else {
        const { error } = updateHelpdeskTicketValidator.validate(data)
        if (error) {
          return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
        }
        const conn = await getConnection()
        t = await conn.sequelize.transaction()
        response = await this.helpdeskService.updateHelpdeskTicket(body, departmentId, roleId, userId, id, conn, t)
      }

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

  async getHelpdeskList(req, res) {
    try {
      const { body, query, deptId, userId } = req
      const data = {
        ...body,
        ...query
      }
      const { error } = getHelpdeskListValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.helpdeskService.getHelpdeskList(data, deptId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  // async replyHelpdeskTicket (req, res) {
  //   let t
  //   try {
  //     const { body, departmentId, roleId, userId } = req
  //     const { error } = replyHelpdeskTicketValidator.validate(body)
  //     if (error) {
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const conn = await getConnection()
  //     t = await conn.sequelize.transaction()
  //     const response = await this.helpdeskService.replyHelpdeskTicket(body, departmentId, roleId, userId, conn, t)
  //     if (response.status === 200) t.commit()

  //     return this.responseHelper.sendResponse(req, res, response)
  //   } catch (error) {
  //     logger.error(error)
  //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //   } finally {
  //     if (t && !t.finished) {
  //       await t.rollback()
  //     }
  //   }
  // }

  async assignTicket(req, res) {
    let t
    try {
      const { body, departmentId, roleId, userId } = req
      const { id } = req.params
      const data = {
        helpdeskId: id,
        ...body
      }
      const { error } = assignTicketValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.helpdeskService.assignHelpdeskTicket(body, departmentId, roleId, userId, id, conn, t)
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

  async countBySource(req, res) {
    try {
      const { query, userId, body } = req
      const data = {
        ...body,
        ...query
      }
      const { error } = countBySourceValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.helpdeskService.countBySource(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async helpdeskJob(req, res) {
    try {
      const { params } = req
      const { error } = helpdeskJobValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const response = await this.helpdeskService.helpdeskJob(params)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getprofileContact(req, res) {
    try {
      const { query, userId } = req
      const { error } = getprofileContactValidator.validate(query)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.helpdeskService.getprofileContact(query, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async mapHelpdeskCustomer(req, res) {
    let t
    try {
      const { params, body, userId } = req
      const data = {
        ...params,
        ...body
      }
      const { error } = mapHelpdeskCustomerValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.helpdeskService.mapHelpdeskCustomer(data, userId, conn, t)
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

  async similarHelpdesk(req, res) {
    try {
      const { body, query } = req
      const data = {
        ...body,
        ...query
      }
      // const { error } = getprofileContactValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.helpdeskService.similarHelpdesk(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getHelpdeskMonitorCounts(req, res) {
    try {
      const { query } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.getHelpdeskMonitorCounts(query, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getHelpdeskAgentSummary(req, res) {
    try {
      const { query } = req
      const conn = await getConnection()
      const response = await this.helpdeskService.getHelpdeskAgentSummary(query, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getHelpdeskDetails(req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const conn = await getConnection()
      const response = await this.helpdeskService.getHelpdeskDetails(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
