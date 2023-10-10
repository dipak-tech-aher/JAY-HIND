import KnowledgeBaseService from '@services/KnowledgeBase.service'
import { ResponseHelper, statusCodeConstants, logger } from '@utils'
import { searchKnowledgeBaseValidator, getKnowledgeBaseValidator, searchKnowledgeBaseByHelpdeskValidator, AddRequestStatementValidator } from '@validators/knowledgeBase.validator'
const { getConnection } = require('@services/connection-service')

export class KnowledgeBaseController {
  constructor() {
    this.responseHelper = new ResponseHelper()
  }

  async initKnowledgeBaseService() {
    const conn = await getConnection()
    return {
      conn,
      knowledgeBaseService: new KnowledgeBaseService(conn)
    }
  }

  async searchKnowledgeBase(req, res) {
    try {
      const { query, roleId, departmentId, ouId } = req;
      const { error } = searchKnowledgeBaseValidator.validate(query)
      if (error) {
        return this.responseHelper.sendResponse(req, res, {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: error.message
        })
      }
      const { conn, knowledgeBaseService } = await this.initKnowledgeBaseService()
      const response = await knowledgeBaseService.searchKnowledgeBase(
        req,
        query,
        ouId,
        departmentId,
        roleId,
        conn
      )
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      })
    }
  }

  async getKnowledgeBase(req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { error } = getKnowledgeBaseValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: error.message
        })
      }
      const { conn, knowledgeBaseService } =
        await this.initKnowledgeBaseService()
      t = await conn.sequelize.transaction()
      const response = await knowledgeBaseService.getKnowledgeBase(
        body,
        departmentId,
        userId,
        roleId,
        t
      )
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

  async createRequestStatement(req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      // const { error } = createRequestStatementValidator.validate(body)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const { conn, knowledgeBaseService } =
        await this.initKnowledgeBaseService()
      t = await conn.sequelize.transaction()
      const response = await knowledgeBaseService.createRequestStatement(
        body,
        departmentId,
        userId,
        roleId,
        t
      )
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

  async editRequestStatement(req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId, params } = req
      // const { error } = editRequestStatementValidator.validate(body)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const { conn, knowledgeBaseService } =
        await this.initKnowledgeBaseService()
      t = await conn.sequelize.transaction()
      const response = await knowledgeBaseService.editRequestStatement(
        body,
        params,
        departmentId,
        userId,
        roleId,
        t
      )
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

  async requestStatementList(req, res) {
    try {
      const { body, query } = req
      // const { error } = requestStatementListValidator.validate(query)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const { conn, knowledgeBaseService } =
        await this.initKnowledgeBaseService()
      const response = await knowledgeBaseService.requestStatementList(
        body,
        query,
        conn
      )
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      })
    }
  }

  async searchKnowledgeBaseByHelpdesk(req, res) {
    try {
      const { query } = req
      const { error } = searchKnowledgeBaseByHelpdeskValidator.validate(query)
      if (error) {
        return this.responseHelper.sendResponse(req, res, {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: error.message
        })
      }
      const { conn, knowledgeBaseService } =
        await this.initKnowledgeBaseService()
      const response = await knowledgeBaseService.searchKnowledgeBaseByHelpdesk(
        query,
        conn
      )
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      })
    }
  }

  async AddRequestStatement(req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      const { error } = AddRequestStatementValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const { conn, knowledgeBaseService } = await this.initKnowledgeBaseService()
      t = await conn.sequelize.transaction()
      const response = await knowledgeBaseService.AddRequestStatement(body, departmentId, roleId, userId, t)
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

  async getKnowledgeBaseConsumer(req, res) {
    try {
      const { knowledgeBaseService } = await this.initKnowledgeBaseService()
      const response = await knowledgeBaseService.getKnowledgeBaseConsumer()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      })
    }
  }

  async searchKnowledgeBaseConsumer(req, res) {
    try {
      const { query } = req
      const { conn, knowledgeBaseService } =
        await this.initKnowledgeBaseService()
      const response = await knowledgeBaseService.searchKnowledgeBaseConsumer(
        query,
        conn
      )
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      })
    }
  }

  async checkSmartAssist(req, res) {
    let t
    try {
      const { body } = req
      const { conn, knowledgeBaseService } = await this.initKnowledgeBaseService()
      t = await conn.sequelize.transaction()
      const response = await knowledgeBaseService.checkSmartAssist(body, conn, t)
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
}
