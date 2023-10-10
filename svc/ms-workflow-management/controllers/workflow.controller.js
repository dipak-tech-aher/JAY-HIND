import WorkflowService from '@services/workflow.service'
import { statusCodeConstants, logger, ResponseHelper } from '@utils'
import {
  createUserValidator, updateWorkflowValidator, getWorkflowValidator, getWorkflowListValidator, deleteWorkflowValidator, getWorkflowStateValidator,
  unMappedWorkflowListValidator, createWorkflowMappingValidator, listMappedWorkflowValidator, updatedMappedWorkflowValidator, updateResolutionValidator
  // getWorkflowStatusValidator, assignWorkflowToEntityValidator, updateWorkflowStateValidator,
  // assignToSelfValidator
} from '@validators/workflow.validator'
const { getConnection } = require('@services/connection-service')

export class WorkflowController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.workflowService = new WorkflowService()
  }

  async createWorkflow(req, res) {
    let t
    try {
      const { body, userId } = req
      const { error } = createUserValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.workflowService.createWorkflow(body, userId, conn, t)
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

  async updateWorkflow(req, res) {
    let t
    try {
      const { body, params, userId } = req
      const data = {
        ...body,
        ...params
      }
      const { error } = updateWorkflowValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.workflowService.updateWorkflow(data, userId, conn, t)
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

  async getWorkflow(req, res) {
    try {
      const { params } = req
      const { error } = getWorkflowValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }

      const conn = await getConnection()
      const response = await this.workflowService.getWorkflow(params, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTaskList(req, res) {
    try {
      const conn = await getConnection()
      const response = await this.workflowService.getTaskList(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getTaskDetails(req, res) {
    try {
      const { query } = req
      const { error } = getWorkflowStateValidator.validate(query)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection();
      const response = await this.workflowService.getTaskDetails(query, conn)
      return res.json({
        status: statusCodeConstants.SUCCESS,
        message: response.message,
        data: response.data,
        code: response.code,
        refreshToken: res.refreshToken
      })
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getWorkflowList(req, res) {
    try {
      const { query } = req
      const { error } = getWorkflowListValidator.validate(query)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.workflowService.getWorkflowList(query, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async deleteWorkflow(req, res) {
    let t
    try {
      const { params, userId } = req
      const { error } = deleteWorkflowValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.workflowService.deleteWorkflow(params, userId, conn, t)
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

  async getWorkflowState(req, res) {
    try {
      const { query } = req
      const { error } = getWorkflowStateValidator.validate(query)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.workflowService.getWorkflowState(query, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getDBSchemaInfo(req, res) {
    try {
      const conn = await getConnection()
      const schemaType = req.query.schemaType;
      let response;
      if (schemaType && schemaType == "view") {
        response = await this.workflowService.getDBViewSchemaInfo(conn)
      } else {
        response = await this.workflowService.getDBSchemaInfo(conn)
      }
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getOrgHierarchyWithRoles(req, res) {
    try {
      const conn = await getConnection()
      const response = await this.workflowService.getOrgHierarchyWithRoles(conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async createWorkflowMapping(req, res) {
    let t
    try {
      const { body, userId } = req
      // const { error } = createWorkflowMappingValidator.validate(body)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.workflowService.createWorkflowMapping(body, userId, conn, t)
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

  async unMappedWorkflowList(req, res) {
    try {
      const { body, query, userId } = req
      const data = {
        ...body,
        ...query
      }
      // const { error } = unMappedWorkflowListValidator.validate(data)
      // if (error) {
      //   return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      // }
      const conn = await getConnection()
      const response = await this.workflowService.unMappedWorkflowList(body, query, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async listMappedWorkflow(req, res) {
    try {
      const { body, query, userId } = req
      const { error } = listMappedWorkflowValidator.validate(body)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      const response = await this.workflowService.listMappedWorkflow(body, query, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updatedMappedWorkflow(req, res) {
    let t
    try {
      const { body, params, userId } = req
      const data = {
        ...body,
        ...params
      }
      const { error } = updatedMappedWorkflowValidator.validate(data)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.workflowService.updatedMappedWorkflow(data, userId, conn, t)
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

  async getResolution(req, res) {
    try {
      const { body, departmentId, roleId, userId, headers } = req;
      const { authorization } = headers
      const conn = await getConnection()
      const response = await this.workflowService.getResolution(body, departmentId, roleId, userId, conn, authorization)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getResolutionChat(req, res) {
    try {
      const { body } = req
      const conn = await getConnection()
      const response = await this.workflowService.getResolution(body, null, null, null, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async updateResolution(req, res) {
    let t
    try {
      const { params, departmentId, roleId, userId } = req
      const { error } = updateResolutionValidator.validate(params)
      if (error) {
        return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
      }
      const conn = await getConnection()
      t = await conn.sequelize.transaction()
      const response = await this.workflowService.updateResolution(params, departmentId, roleId, userId, conn, t)
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

  async getLastConversationAction(req, res) {
    try {
      const { body } = req
      console.log('query', body)
      const conn = await getConnection()
      const response = await this.workflowService.getLastConversationAction(body, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async addConversation(req, res) {
    try {
      const { body, params, departmentId, roleId, userId } = req
      console.log('query', body)
      const conn = await getConnection()
      const response = await this.workflowService.addConversation(body, params, departmentId, roleId, userId, conn)
      return this.responseHelper.sendResponse(req, res, response)
    } catch (error) {
      logger.error(error)
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  // async getWorkflowStatus (req, res) {
  //   try {
  //     const { params, userId } = req
  //     const { error } = getWorkflowStatusValidator.validate(params)
  //     if (error) {
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const conn = await getConnection()
  //     const response = await this.workflowService.getWorkflowStatus(params, userId, conn)
  //     return this.responseHelper.sendResponse(req, res, response)
  //   } catch (error) {
  //     logger.error(error)
  //     return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
  //   }
  // }

  // async assignWorkflowToEntity (req, res) {
  //   let t
  //   try {
  //     const { body, userId } = req
  //     const { error } = assignWorkflowToEntityValidator.validate(body)
  //     if (error) {
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const conn = await getConnection()
  //     t = await conn.sequelize.transaction()
  //     const response = await this.workflowService.assignWorkflowToEntity(body, userId, conn, t)
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

  // async updateWorkflowState (req, res) {
  //   let t
  //   try {
  //     const { query, userId, body } = req
  //     const { error } = updateWorkflowStateValidator.validate(body)
  //     if (error) {
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const conn = await getConnection()
  //     t = await conn.sequelize.transaction()
  //     const response = await this.workflowService.updateWorkflowState(body, query, userId, conn, t)
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

  // async assignToSelf (req, res) {
  //   let t
  //   try {
  //     const { userId, body } = req
  //     const { error } = assignToSelfValidator.validate(body)
  //     if (error) {
  //       return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.VALIDATION_ERROR, message: error.message })
  //     }
  //     const conn = await getConnection()
  //     t = await conn.sequelize.transaction()
  //     const response = await this.workflowService.assignToSelf(body, userId, conn)
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
}
