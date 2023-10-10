import TemplateService from '@services/TemplateService.service'
import { ResponseHelper, statusCodeConstants, logger } from '@utils'
import { searchKnowledgeBaseValidator, getKnowledgeBaseValidator } from '@validators/knowledgeBase.validator'
const { getConnection } = require('@services/connection-service')

export class TemplateController {
  constructor () {
    this.responseHelper = new ResponseHelper()
  }

  async init () {
    const conn = await getConnection()
    return {
      conn,
      templateService: new TemplateService(conn)
    }
  }

  async createTemplateMaster (req, res) {
    try {
      const { query, body } = req
      // const { error } = searchKnowledgeBaseValidator.validate(query)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const { conn, templateService } = await this.init()
      const response = await templateService.createTemplateMaster({ ...query, ...body }, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async searchTemplateMaster (req, res) {
    let t
    try {
      const { body, departmentId, userId, roleId } = req
      // const { error } = getKnowledgeBaseValidator.validate(body)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const { conn, templateService } = await this.init()
      t = await conn.sequelize.transaction()
      const response = await templateService.searchTemplateMaster(body, departmentId, userId, roleId, t)
      if (response.status === 200) t.commit()
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
