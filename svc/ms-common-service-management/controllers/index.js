import CommonService from '@services/common.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import { downloadFileValidator } from '@validators'
const { getConnection } = require('@services/connection-service')

export class CommonController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.commonService = new CommonService()
  }

  async faceCompare (req, res) {
    try {
      try {
        const { files: { target }, body: { source } } = req
        const response = await this.commonService.faceCompare(source, target)
        return this.responseHelper.sendResponse(req, res, response)
      } catch (error) {
        logger.error(error)
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
      }
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async scanDocument (req, res) {
    try {
      try {
        const { files } = req
        const response = await this.commonService.scanDocument(files)
        return this.responseHelper.sendResponse(req, res, response)
      } catch (error) {
        logger.error(error)
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
      }
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async scanCustomerDocument (req, res) {
    try {
      try {
        const { files, body } = req
        console.log('files ===>', files)
        console.log('body ===>', body.scanIdType)
        const response = await this.commonService.scanCustomerDocument(files, body.scanIdType)
        // const response = ''
        return this.responseHelper.sendResponse(req, res, response)
      } catch (error) {
        logger.error(error)
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
      }
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async uploadFiles (req, res) {
    try {
      const { files, query, userId, roleId, departmentId, params } = req
      const conn = await getConnection()
      let response
      if (params && params?.type === 'storage') {
        response = await this.commonService.uploadFilesCloud(files, query, userId, roleId, departmentId, conn)
      } else {
        response = await this.commonService.uploadFiles(files, query, userId, roleId, departmentId, conn)
      }
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async downloadFile (req, res) {
    try {
      const { params } = req
      console.log('query', params)
      const { error } = downloadFileValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.commonService.downloadFilesCloud(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAttachmentList (req, res) {
    try {
      const { params } = req
      console.log('query', params)
      const { error } = downloadFileValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.commonService.getAttachmentList(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async externalNotification (req, res) {
    try {
      try {
        const { body } = req
        const conn = await getConnection()
        const response = await this.commonService.externalNotification(body, conn)
        return this.responseHelper.sendResponse(req, res, response)
      } catch (error) {
        logger.error(error)
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
      }
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
