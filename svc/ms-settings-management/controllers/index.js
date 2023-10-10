import SettingService from '@services/settings.service'
import { statusCodeConstants, logger, ResponseHelper } from '@utils'
import { } from '@validators'

const { getConnection } = require('@services/connection-service')

const hapiErrorQuotes = {
  errors: {
    wrap: {
      label: ''
    }
  }
}

export class SettingsController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.settingService = new SettingService()
  }

  async getAllJobs (req, res) {
    try {
      // write code here
      const { body, query } = req
      const conn = await getConnection()
      const response = await this.productService.getAllJobs({ ...body, ...query }, conn, t)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  // async updateJobService (req, res) {
  //   const t = await sequelize.transaction()
  //   try {
  //     const { body, query } = req

  //     const conn = await getConnection()
  //     const response = await this.productService.updateJobService({ ...body, ...query }, conn, t)
  //     return this.responseHelper.sendResponse(req, res, response)
  //   } catch (error) {
  //     logger.error(error)
  //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //   }
  // }

  // async jobHelpdesk(req, res) {
  //     const t = await sequelize.transaction()
  //     try {
  //         const { body, query } = req

  //         const conn = await getConnection()
  //         const response = await this.productService.jobHelpdesk({...body,...query}, conn, t)
  //         return this.responseHelper.sendResponse(req, res, response)
  //       } catch (error) {
  //         logger.error(error)
  //         return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //       } finally {
  //         if (t && !t.finished) {
  //             await t.rollback()
  //         }
  //     }

  // }

  // async jobUnbilled(req, res) {
  //     const t = await sequelize.transaction()
  //     try {
  //         const { body, query } = req

  //         const conn = await getConnection()
  //         const response = await this.productService.jobUnbilled({...body,...query}, conn, t)
  //         return this.responseHelper.sendResponse(req, res, response)
  //       } catch (error) {
  //         logger.error(error)
  //         return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //       } finally {
  //         if (t && !t.finished) {
  //             await t.rollback()
  //         }
  //     }
  // }

  // async jobScheduled(req, res) {
  //     const t = await sequelize.transaction()
  //     try {
  //         const { body, query } = req

  //         const conn = await getConnection()
  //         const response = await this.productService.jobScheduled({...body,...query}, conn, t)
  //         return this.responseHelper.sendResponse(req, res, response)
  //       } catch (error) {
  //         logger.error(error)
  //         return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //       } finally {
  //         if (t && !t.finished) {
  //             await t.rollback()
  //         }
  //     }
  // }

  // async jobEmail(req, res) {
  //     const t = await sequelize.transaction()
  //     try {
  //         const { body, query } = req

  //         const conn = await getConnection()
  //         const response = await this.productService.jobEmail({...body,...query}, conn, t)
  //         return this.responseHelper.sendResponse(req, res, response)
  //       } catch (error) {
  //         logger.error(error)
  //         return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //       } finally {
  //         if (t && !t.finished) {
  //             await t.rollback()
  //         }
  //     }
  // }

  // async jobChat(req, res) {
  //     const t = await sequelize.transaction()
  //     try {
  //         const { body, query } = req

  //         const conn = await getConnection()
  //         const response = await this.productService.jobChat({...body,...query}, conn, t)
  //         return this.responseHelper.sendResponse(req, res, response)
  //       } catch (error) {
  //         logger.error(error)
  //         return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //       } finally {
  //         if (t && !t.finished) {
  //             await t.rollback()
  //         }
  //     }
  // }

  // async jobFBPost(req, res) {
  //     const t = await sequelize.transaction()
  //     try {
  //         const { body, query } = req

  //         const conn = await getConnection()
  //         const response = await this.productService.jobFBPost({...body,...query}, conn, t)
  //         return this.responseHelper.sendResponse(req, res, response)
  //       } catch (error) {
  //         logger.error(error)
  //         return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //       } finally {
  //         if (t && !t.finished) {
  //             await t.rollback()
  //         }
  //     }
  // }
}
