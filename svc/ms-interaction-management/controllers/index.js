import InteractionService from '@services/interaction.service'
import { statusCodeConstants, logger, ResponseHelper, CryptoHelper } from '@utils'
import {
  createInteractionValidator, updateInteractionValidator, addFollowUpValidator, assignInteractionValidator,
  searchInteractionValidator, getHistoryValidator, cancelInteractionValidator, getCountsValidator, frequentKnowledgeBaseValidator,
  getCustomerInteractionHistoryCountValidator, getInteractionFlowValidator, getCustomerInteractionValidation, getCustomerInteractionHistoryValidator,
  getInteractionAppointmentValidator, getInteractionInsightValidator, recentInteractionValidator
} from '@validators'
import { isEmpty } from 'lodash'
const { getConnection } = require('@services/connection-service')
const cryptoHelper = new CryptoHelper()

export class InteractionController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.interactionService = new InteractionService()
  }

  async interactionPriorityStatusWiseList(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.interactionPriorityStatusWiseList(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async interactionPriorityStatusWise(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.interactionPriorityStatusWise(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async locationWise(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.locationWise(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async interactionAvgWise(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.interactionAvgWise(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async customerWise(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.customerWise(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async liveCustomerWise(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.liveCustomerWise(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async liveInteractionsByStatus(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.liveInteractionsByStatus(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async liveProjectWise(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.liveProjectWise(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async npsCsatChamp(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.npsCsatChamp(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async resolutionMttrWaiting(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.resolutionMttrWaiting(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopStatements(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTopStatements(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopStatementList(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTopStatementList(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopInteractionsByChannel(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTopInteractionsByChannel(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopInteractionsByChannelList(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTopInteractionsByChannelList(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getDeptInteractions(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.getDeptInteractions(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getDeptVsRolesInteractions(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.getDeptVsRolesInteractions(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async interactionByAgeing(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.interactionByAgeing(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async interactionByFollowups(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.interactionByFollowups(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopInteractions(req, res) {
    try {
      const { body, params, userId, roleId, departmentId } = req
      const payload = { ...body, ...params }
      const conn = await getConnection()
      const response = await this.interactionService.getTopInteractions(payload, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async interactionByStatus(req, res) {
    try {
      const { body, params, userId, roleId, departmentId } = req
      const payload = { ...body, ...params, attr: 'status' }
      const conn = await getConnection()
      const response = await this.interactionService.interactionByStatusType(payload, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async interactionByType(req, res) {
    try {
      const { body, params, userId, roleId, departmentId } = req
      const payload = { ...body, ...params, attr: 'type' }
      const conn = await getConnection()
      const response = await this.interactionService.interactionByStatusType(payload, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async interactionByProject(req, res) {
    try {
      const { body, params, userId, roleId, departmentId } = req
      const payload = { ...body, ...params, attr: 'project' }
      const conn = await getConnection()
      const response = await this.interactionService.interactionByProjectAgent(payload, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async interactionByAgent(req, res) {
    try {
      const { body, params, userId, roleId, departmentId } = req
      const payload = { ...body, ...params, attr: 'agent' }
      const conn = await getConnection()
      const response = await this.interactionService.interactionByProjectAgent(payload, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getByPriority(req, res) {
    try {
      const { body, userId, roleId, departmentId } = req
      const conn = await getConnection()
      const response = await this.interactionService.getByPriority(body, userId, roleId, departmentId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInteractionDetails(req, res) {
    try {
      const { params } = req
      const authData = {
        authorization: req.headers.authorization,
        tenantId: req.headers['x-tenant-id']
      }
      const conn = await getConnection()
      const response = await this.interactionService.getInteractionDetails(params, authData, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createInteraction(req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req
      const { error } = createInteractionValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const authData = {
        authorization: req.headers.authorization,
        tenantId: req.headers['x-tenant-id']
      }
      const response = await this.interactionService.createInteraction(body, authData, userId, roleId, departmentId, conn, t)
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

  async createInteractionWebSelfCare(req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req
      const { error } = createInteractionValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const authData = {
        authorization: req.headers.authorization,
        tenantId: req.headers['x-tenant-id']
      }
      const response = await this.interactionService.createInteractionWebSelfCare(body, authData, userId, roleId, departmentId, conn, t)
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

  async updateInteraction(req, res) {
    let t
    try {
      const { body, userId, params, roleId, departmentId } = req
      const data = {
        ...body,
        ...params
      }
      const { error } = updateInteractionValidator.validate(data)

      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.interactionService.updateInteraction(data, userId, roleId, departmentId, conn, t)
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

  async searchInteractionByQuery(req, res) {
    try {
      const { query, permissions, email } = req
      const conn = await getConnection()
      const response = await this.interactionService.searchInteractionByQuery(query, permissions, email, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async searchInteraction(req, res) {
    try {
      const { body, query, userId, permissions, email } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = searchInteractionValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.searchInteractions(data, userId, email, permissions, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async addFollowUp(req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req

      const { error } = addFollowUpValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.interactionService.addFollowUp(body, userId, roleId, departmentId, conn, t)
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

  async assignInteraction(req, res) {
    let t
    try {
      const { params, body, userId, roleId, departmentId } = req
      const data = {
        ...params,
        ...body
      }
      const { error } = assignInteractionValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.interactionService.assignInteraction(data, userId, roleId, departmentId, conn, t)
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

  async getHistory(req, res) {
    try {
      const { query, params } = req
      const data = {
        ...params,
        ...query
      }
      const { error } = getHistoryValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.getHistory(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async cancelInteraction(req, res) {
    let t
    try {
      const { body, userId, params, roleId, departmentId } = req
      const data = {
        ...body,
        ...params
      }
      const { error } = cancelInteractionValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.interactionService.cancelInteraction(data, userId, roleId, departmentId, conn, t)
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

  async getCounts(req, res) {
    try {
      const me = req.originalUrl.split('/').includes('me') || false
      const { query, userId } = req
      const data = {
        ...query,
        me
      }
      const { error } = getCountsValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.getCounts(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async frequentKnowledgeBase(req, res) {
    try {
      const { query, body } = req
      const data = {
        ...query,
        ...body
      }
      const { error } = frequentKnowledgeBaseValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.frequentKnowledgeBase(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async frequentTopCatagory(req, res) {
    try {
      const { query } = req
      const conn = await getConnection()
      const response = await this.interactionService.frequentTopCatagory(query, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async workFlowTest(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.workFlowTest(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async testWhatsapp(req, res) {
    try {
      const conn = await getConnection()
      const response = await this.interactionService.testWhatsapp(conn)
      res.status(200).send(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async conversationInteraction(req, res) {
    let t
    try {
      let { userId, roleId, departmentId } = req
      // eslint-disable-next-line prefer-const

      const { body } = req
      body.customerId = body?.customerId ? Number(body?.customerId) : body?.referenceId ? Number(body?.referenceId) : ''
      const { contactPreference } = body

      if (!contactPreference || contactPreference === '-') {
        body.contactPreference = []
      } else if (body?.contactPreference && typeof body?.contactPreference === 'string') {
        const b = body?.contactPreference.slice(1, -1)?.split(',')
        body.contactPreference = [...b]
      }

      const { error } = createInteractionValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }

      const conn = await getConnection()
      t = await conn.sequelize.transaction()

      if (body && body?.customerNo) {
        const checkExistingCustomer = await conn.Customer.findOne({
          where: {
            customerNo: body?.customerNo
          }
        })
        body.customerId = checkExistingCustomer?.customerId || null
      }

      const { authorization } = req.headers
      if (authorization) {
        let decodedToken
        try {
          decodedToken = cryptoHelper.verifyJWT(authorization)
        } catch (error) {
          logger.error(error, 'JWT Token signature error')
        }
        const decryptedToken = cryptoHelper.decrypt(decodedToken)
        const user = await conn.UserSession.findOne({
          where: { sessionId: decryptedToken.sid }
        })

        if (user) {
          userId = user?.userId
          roleId = user.currRoleId
          departmentId = user.currDeptId
        }
      }

      if (body?.isManagerialAssign && body?.customerId) {
        let userDetails = await conn.User.findOne({
          where: {
            customerId: String(body.customerId)
          }
        })
        if (userDetails) {
          userDetails = userDetails?.dataValues ?? userDetails
          body.currUser = userDetails?.managerId || null
        }
      }

      const response = await this.interactionService.createInteraction(body, authorization, userId, roleId, departmentId, conn, t)
      if (response.status === 200) t.commit()
      return res.json(response)
      // return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createRequest(req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req
      console.log('body-------->', body)
      body.customerId = Number(body.customerId)
      console.log('body---xxxxxxx----->', body)
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.interactionService.createRequest(body, userId, roleId, departmentId, conn, t)
      if (response.status === 200) t.commit()
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createSmartRequest(req, res) {
    let t
    try {
      const { body, userId, roleId, departmentId } = req
      console.log('body-------->', body)
      body.customerId = Number(body.customerId)
      console.log('body---xxxxxxx----->', body)
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.interactionService.createSmartRequest(body, userId, roleId, departmentId, conn, t)
      if (response.status === 200) t.commit()
      return res.json(response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerInteractionHistoryCount(req, res) {
    try {
      const { params } = req
      const { error } = getCustomerInteractionHistoryCountValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.getCustomerInteractionHistoryCount(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerInteractionHistory(req, res) {
    try {
      const { params, query } = req
      const data = {
        ...params,
        ...query
      }
      const { error } = getCustomerInteractionHistoryValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.getCustomerInteractionHistory(data, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInteractionFlow(req, res) {
    try {
      const { params } = req
      const { error } = getInteractionFlowValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.getInteractionFlow(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCustomerInteraction(req, res) {
    try {
      const { body, query, userId, params } = req
      const data = {
        ...params,
        ...query,
        ...body
      }
      const { error } = await getCustomerInteractionValidation.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.getCustomerInteraction(data, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  // Operation dashboard

  async assignedInteractions(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.assignedInteractions(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async pooledInteractions(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.pooledInteractions(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async assignedOrders(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.assignedOrders(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async pooledOrders(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.pooledOrders(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async assignedToMeTicketes(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.assignedToMeTicketes(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async assignedAppoinments(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.assignedAppoinments(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async myTeamAssignedInteractions(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.myTeamAssignedInteractions(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async myTeamAssignedOrders(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.myTeamAssignedOrders(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async myTeamAssignedAppoinments(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.myTeamAssignedAppoinments(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getUserInfomativeDetails(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getUserInfomativeDetails(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTeamInfomativeDetails(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTeamInfomativeDetails(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async handlingTimeTeam(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.handlingTimeTeam(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async handlingTime(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.handlingTime(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getMyInteractionHistoryGraph(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getMyInteractionHistoryGraph(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTeamInteractionHistoryGraph(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTeamInteractionHistoryGraph(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopFivePerformer(req, res) {
    try {
      const { body, userId } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTopFivePerformer(body, conn, userId)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopFivePerformerChat(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTopFivePerformerChat(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInteractionAppointment(req, res) {
    try {
      const { params } = req
      const { error } = getInteractionAppointmentValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.getInteractionAppointment(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInteractionInsight(req, res) {
    try {
      const { body } = req
      const { error } = getInteractionInsightValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.getInteractionInsight(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInteractionOverview(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getInteractionOverview(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getAppointmentOverview(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getAppointmentOverview(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTeamInteractionOverview(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTeamInteractionOverview(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInteractionCategoryPerformance(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getInteractionCategoryPerformance(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTeamCategoryPerformance(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTeamCategoryPerformance(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopPerformance(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTopPerformance(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getHelpdeskInteraction(req, res) {
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        ...body,
        ...query
      }
      const conn = await getConnection()
      const response = await this.interactionService.getHelpdeskInteraction(data, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRelatedStatementInfo(req, res) {
    try {
      const { params } = req
      console.log('params ', params)
      const conn = await getConnection()
      const response = await this.interactionService.getRelatedStatementInfo(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRelatedCategoryTypeInfo(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getRelatedCategoryTypeInfo(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTotalInteractionByChannel(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTotalInteractionByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopPerformingByChannel(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTopPerformingByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getIssuesSolvedByChannel(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getIssuesSolvedByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopProblemSolvingByChannel(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTopProblemSolvingByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTopSalesByChannel(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getTopSalesByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getLiveSupportByChannel(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getLiveSupportByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getChannelsByOrder(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getChannelsByOrder(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async saveInteractionStatement(req, res) {
    let t
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.saveInteractionStatement(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getProspectGeneratedByChannel(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getProspectGeneratedByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInteractionCategory(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getInteractionCategory(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getInteractionCorner(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getInteractionCorner(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async avgPerformanceByChannel(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.avgPerformanceByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async recentInteractionsByCustomers(req, res) {
    try {
      const { body, userId, query } = req
      console.log('params----->', query)
      const { error } = recentInteractionValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.interactionService.recentInteractionsByCustomers(body, query, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async myTeamPooledOrders(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.myTeamPooledOrders(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async myTeamPooledInteractions(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.myTeamPooledInteractions(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getNewInteractionCount(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.interactionService.getNewInteractionCount(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getRequests(req, res) {
    try {
      const { body, query, departmentId, roleId, userId } = req
      const data = {
        ...body,
        ...query
      }
      const conn = await getConnection()
      const response = await this.interactionService.getRequests(data, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateRequestStatus(req, res) {
    try {
      const { body, params, departmentId, roleId, userId } = req
      const data = {
        ...body,
        ...params
      }
      const conn = await getConnection()
      const response = await this.interactionService.updateRequestStatus(data, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }
}
