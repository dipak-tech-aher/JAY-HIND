import ContractService from '@services/contract.service'
import { ResponseHelper, statusCodeConstants, logger } from '@utils'
import { getUnbilledContractsValidator, getbilledContractsValidator } from '@validators'
const { getConnection } = require('@services/connection-service')

export class ContractController {
  constructor () {
    this.responseHelper = new ResponseHelper()
    this.contractService = new ContractService()
  }

  async getUnbilledContracts (req, res) {
    try {
      const { query, userId, body } = req
      const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.contractService.getUnbilledContracts({ ...query, ...body }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {

    }
  }

  async getBilledContracts (req, res) {
    try {
      const { query, userId, body } = req
      const { error } = getbilledContractsValidator.validate({ ...query, ...body })
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.contractService.getBilledContracts({ ...query, ...body }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getContractHistory (req, res) {
    try {
      const { query, userId, body } = req
      const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.contractService.getContractHistory({ ...query, ...body }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getMonthlyContractCounts (req, res) {
    let t
    try {
      const { query, userId, body } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.contractService.getMonthlyContractCounts({ ...query, ...body }, userId, conn, t)
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

  async getReGenerateContracts (req, res) {
    try {
      const { query, userId, body } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.contractService.getReGenerateContracts({ ...query, ...body }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createContract (req, res) {
    try {
      const { query, userId, body } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.contractService.createContract({ ...query, ...body }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateContract (req, res) {
    try {
      const { query, userId, body } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.contractService.updateContract({ ...query, ...body }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateContractDetail (req, res) {
    try {
      const { query, userId, body } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.contractService.updateContractDetail({ ...query, ...body }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateMonthlyContract (req, res) {
    let t
    try {
      const { query, userId, body, params } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.contractService.updateMonthlyContract({ ...query, ...body, ...params }, userId, conn, t)
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

  async updateMonthlyContractDetail (req, res) {
    let t
    try {
      const { query, userId, body, params } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.contractService.updateMonthlyContractDetail({ ...query, ...body, ...params }, userId, conn)
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

  async updateUnbilledContracts (req, res) {
    try {
      const { query, userId, body } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.contractService.updateUnbilledContracts({ ...query, ...body }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateUnbilledSplitContracts (req, res) {
    try {
      const { query, userId, body } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.contractService.updateUnbilledSplitContracts({ ...query, ...body }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async calculateUsage (req, res) {
    try {
      const { query, userId, body } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.contractService.calculateUsage({ ...query, ...body }, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async generateMonthlyUnBilledContract (req, res) {
    try {
      const { query, userId } = req
      const conn = await getConnection()
      const response = await this.contractService.generateMonthlyUnBilledContract(query, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async generateScheduledMonthlyContracts (req, res) {
    try {
      const conn = await getConnection()
      const response = await this.contractService.generateScheduledMonthlyContracts(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerContractsByService (req, res) {
    try {
      const { query } = req
      const conn = await getConnection()
      const response = await this.contractService.getCustomerContractsByService(query, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerScheduledMonthlyContracts (req, res) {
    try {
      const { params, query } = req
      const conn = await getConnection()
      const response = await this.contractService.getCustomerScheduledMonthlyContracts({...params, ...query}, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async contractJob (req, res) {
    try {
      const { params } = req
      const conn = await getConnection()
      const response = await this.contractService.contractJob(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async searchContracts (req, res) {
    try {
      const { query, body } = req
      // const { error } = getUnbilledContractsValidator.validate({ ...query, ...body })
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.contractService.searchContracts({ ...query, ...body }, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
