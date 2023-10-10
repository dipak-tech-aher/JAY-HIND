import { logger, statusCodeConstants, entityCategory, defaultStatus, defaultMessage } from '@utils'
import { Op } from 'sequelize'

let instance

class TemplateService {
  constructor (conn) {
    if (!instance) {
      instance = this
    }
    this.conn = conn
    return instance
  }

  async createTemplateMaster (details, conn) {
    console.log('details ', details)
  }
}

module.exports = TemplateService
