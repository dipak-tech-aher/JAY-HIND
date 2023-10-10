import workFlowResource from '@resources'
import { camelCaseConversion, constantCode, defaultMessage, logger, statusCodeConstants } from '@utils'
import { getWFState, processTheCurrentFlow, storeConversation } from '@utils/workflow-engine'
import { Op, QueryTypes } from 'sequelize'
// import { processTheCurrentFlow } from '../utils/workflow-utils'
import { isEmpty } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { config } from '@config/env.config'
const { systemUserId, systemRoleId, systemDeptId } = config

let instance

class WorkflowService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  /** Method for Create Workflow Definition
   * @param {object} workflowData
   * @param {number} userId
   * @returns
   */
  async createWorkflow(workflowData, userId, conn, t) {
    try {
      if (!workflowData || !workflowData.wfDefinition) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const duplicateNameCheck = await conn.WorkflowDefinition.findOne({
        attributes: ['workflowName'],
        where: {
          workflowName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('workflow_name')), '=', workflowData.workflowName.toLowerCase()),
          status: constantCode.status.ACTIVE
        }
      })
      if (duplicateNameCheck) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'workflow template name is already exists'
        }
      }

      const workflow = {
        ...workflowData,
        createdBy: userId,
        updatedBy: userId
      }
      const response = await conn.WorkflowDefinition.create(workflow, { transaction: t })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Workflow created successfully',
        data: response
      }
    } catch (error) {
      console.log('error------->', error)
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method for Updating Workflow Definition
   * @param {object} workflowData
   * @param {number} id
   * @param {number} userId
   * @returns
   */
  async updateWorkflow(workflowData, userId, conn, t) {
    try {
      if (!workflowData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { workflowId } = workflowData
      const workflowInfo = await conn.WorkflowDefinition.findOne({ where: { workflowId, status: constantCode.status.ACTIVE } })
      if (!workflowInfo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `Workflow details for #${workflowId} not found`
        }
      }
      const workflowUpdate = {
        workflowName: workflowData.workflowName || workflowInfo.workflowName,
        intxnType: workflowData.intxnType || workflowInfo.intxnType,
        intxnCategory: workflowData.intxnCategory || workflowInfo.intxnCategory,
        wfDefinition: workflowData.wfDefinition || workflowInfo.wfDefinition,
        status: workflowData.status || workflowInfo.status,
        updatedBy: userId
      }

      await conn.WorkflowDefinition.update(workflowUpdate, { where: { workflowId }, transaction: t })

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Workflow Id #${workflowId} has been updated successfully`
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Get Workflow Definition by id
   * @param {object} workflowData
   * @param {number} workflowData.id
   * @returns
   */
  async getWorkflow(workflowData, conn) {
    try {
      const { workflowId } = workflowData
      if (!workflowId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const response = await conn.WorkflowDefinition.findOne({
        include: [
          {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'intxnTypeDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'intxnCatDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'statusDesc'
          }, {
            model: conn.User,
            attributes: ['firstName', 'lastName'],
            as: 'createdByName'
          }, {
            model: conn.User,
            attributes: ['firstName', 'lastName'],
            as: 'updatedByName'
          }
        ],
        where: {
          workflowId,
          status: constantCode.status.ACTIVE
        }
      })
      if (!response) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `Workflow Id #${workflowId} details not found`
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Workflow fetched successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getTaskList(conn) {
    try {
      const response = await conn.Tasks.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })
      if (!response) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Task details not found'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Tasks fetched successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getTaskDetails(workflowData, conn) {
    try {
      const { entityId, entity } = workflowData

      if (!entityId || !entity) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      console.log({ entityId, entity, status: constantCode.workflow.hdr.status.CREATE })

      logger.debug('Fetching workflow target Deparments and Roles')
      const workflowHdr = await conn.WorkflowHdr.findOne({
        where: {
          entityId,
          entity,
          wfStatus: constantCode.workflow.hdr.status.CREATE
        }
      })

      if (!workflowHdr) {
        return {
          status: statusCodeConstants.SUCCESS,
          code: '201',
          message: 'Workflow details not Found'
        }
      }

      const workflowTxns = await conn.WorkflowTxn.findAll({
        where: {
          wfHdrId: workflowHdr.wfHdrId
        },
        order: [['wfTxnId', 'DESC']]
      })

      if (workflowTxns.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          code: '201',
          message: 'Workflow transaction details not Found'
        }
      }

      if (workflowTxns[0].wfTxnStatus !== constantCode.workflow.txn.status.USERWAIT) {
        return {
          status: statusCodeConstants.SUCCESS,
          code: '201',
          message: 'There not Workflow transaction wait for Manual Action'
        }
      }

      logger.debug('Finding target department and roles')

      const workflowDfn = await conn.WorkflowDefinition.findOne({
        where: {
          workflowId: workflowHdr.wfDefnId,
          status: constantCode.status.ACTIVE
        }
      })

      if (!workflowDfn || !workflowDfn?.wfDefinition || !workflowDfn?.wfDefinition?.definitions ||
        !workflowDfn?.wfDefinition?.definitions?.process) {
        return {
          status: statusCodeConstants.SUCCESS,
          code: '201',
          message: 'There is no workflow process to perform the action.'
        }
      }

      const activities = workflowDfn?.wfDefinition?.definitions?.process?.activities
      if (!activities) {
        return {
          status: statusCodeConstants.SUCCESS,
          code: '201',
          message: 'There is no Workflow activities to perform the action'
        }
      }

      const obj = activities.find(e => e?.type === constantCode.workflow.task.name && workflowTxns.length > 0 && e?.activityId === workflowTxns[0]?.activityId)
      if (!obj || !obj?.tasks) {
        return {
          status: statusCodeConstants.SUCCESS,
          code: '201',
          message: 'There is no task is assigned in Workflow to perform the action'
        }
      }
      const manualTask = obj.tasks.find(e => (e?.type === constantCode.workflow.task.type.MANUAL && workflowTxns.length > 0 && (e.taskId + '') === workflowTxns[0]?.taskId))
      if (!manualTask || !manualTask?.assignments) {
        return {
          status: statusCodeConstants.SUCCESS,
          code: '201',
          message: 'There is no manual task is assigned in Workflow to perform the action'
        }
      }

      const rolesOutput = await conn.Role.findAll({
        attributes: ['roleId', 'roleName', 'roleDesc'],
        where: {
          status: constantCode.status.ACTIVE
        },
        order: [
          ['roleId', 'ASC']
        ]
      })

      const buOutput = await conn.BusinessUnit.findAll({
        attributes: ['unitId', 'unitName', 'unitDesc'],
        where: {
          status: constantCode.status.ACTIVE
        },
        order: [
          ['unitId', 'ASC']
        ]
      })

      const beOutput = await conn.BusinessEntity.findAll({
        attributes: ['code', 'description'],
        where: {
          status: constantCode.status.ACTIVE,
          codeType: 'INTERACTION_STATUS'
        },
        order: [
          ['code', 'ASC']
        ]
      })

      const entities = []
      for (const asmt of manualTask.assignments) {
        if (asmt?.targetDeptRoles && asmt.targetDeptRoles.length > 0) {
          for (const t of asmt.targetDeptRoles) {
            const entry = {
              roles: [],
              entity: [],
              status: [],
              task: []
            }
            if (t.roleId) {
              for (const r of rolesOutput) {
                if (t.roleId === r.roleId) {
                  entry.roles.push({
                    roleId: r.roleId,
                    roleName: r.roleName,
                    roleDesc: r.roleDesc
                  })
                  break
                }
              }
            }
            if (t.unitId) {
              for (const u of buOutput) {
                if (t.unitId === u.unitId) {
                  entry.entity.push({
                    unitId: u.unitId,
                    unitName: u.unitName,
                    unitDesc: u.unitDesc
                  })
                  break
                }
              }
            }
            if (t.status && t.status.length > 0) {
              for (const s1 of t.status) {
                for (const s2 of beOutput) {
                  if (s1 === s2.code) {
                    entry.status.push({
                      code: s2.code,
                      description: s2.description
                    })
                    break
                  }
                }
              }
            }
            if (t.task && t.task.length > 0) {
              const taskOutput = await conn.Tasks.findAll({
                attributes: ['taskId', 'taskName', 'taskNo', 'taskOptions', 'isMandatoryFla'],
                where: {
                  taskId: { [Op.in]: t.task }
                }
              })
              entry.task = taskOutput
            }
            entities.push(entry)
          }
        }
      }

      const data = {
        entities
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Workflow status fetch successfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Get all Workflow Definition
   * @param {object} workflowData
   * @param {number} workflowData.limit
   * @param {number} workflow.page
   * @returns
   */
  async getWorkflowList(workflowData, conn) {
    try {
      const { limit = constantCode.common.lIMIT, page = constantCode.common.PAGE } = workflowData
      const response = await conn.WorkflowDefinition.findAndCountAll({
        attributes: ['workflowId', 'intxnType', 'intxnCategory', 'status', 'updatedBy', 'updatedAt', 'workflowName'],
        include: [
          { model: conn.BusinessEntity, as: 'intxnTypeDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'intxnCatDesc', attributes: ['code', 'description'] },
          { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['code', 'description'] },
          { model: conn.User, as: 'updatedByName', attributes: ['firstName', 'lastName'] }
        ],
        order: [
          ['workflowId', 'DESC']
        ],
        offset: (page * limit),
        limit: Number(limit),
        where: {
          status: constantCode.status.ACTIVE
        }
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Workflow details fetched successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Delete the Workflow Definition
   * @param {object} workflowData
   * @param {number} workflowData.id
   * @param {number} userId
   * @returns {object}
   */
  async deleteWorkflow(workflowData, userId, conn, t) {
    try {
      const { workflowId } = workflowData
      if (!workflowId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const workflow = await conn.WorkflowDefinition.findOne({
        where: {
          workflowId,
          status: constantCode.status.ACTIVE
        }
      })
      const workflowMappingValidation = await conn.WorkflowMapping.findOne({ where: { workflowId } })
      if (!workflow) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Workflow Id not found'
        }
      }

      if (workflowMappingValidation) {
        return {
          status: statusCodeConstants.UN_PROCESSIBLE_ENTITY,
          message: 'Workflow is mapped with ' + workflowMappingValidation.mappingName + ' Template'
        }
      }

      const workflowDetails = {
        status: constantCode.status.IN_ACTIVE,
        updatedBy: userId
      }

      await conn.WorkflowDefinition.update(workflowDetails, { where: { workflowId }, transaction: t })
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Workflow Id #${workflowId} has been deleted successfully`
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method for Creating worklow Mapping
   * @param {object} workflowData
   * @param {number} userId
   * @returns
   */
  async createWorkflowMapping(workflowData, userId, conn, t) {
    try {
      if (!workflowData || !workflowData.module || !workflowData.templateMapName || !workflowData.workflowId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const duplicatNameValidation = await conn.WorkflowMapping.findOne({
        attributes: ['mappingName'],
        where: {
          mappingName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('mapping_name')), '=', workflowData.templateMapName.toLowerCase()),
          status: constantCode.status.ACTIVE
        }
      })
      if (duplicatNameValidation) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'workflow template name is already exists'
        }
      }

      const findWorkflow = await conn.WorkflowDefinition.findOne({ where: { workflowId: workflowData.workflowId } })
      if (!findWorkflow) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: `No workflow found with id: ${workflowData.workflowId}`
        }
      }

      const mappedWorkFlow = await conn.WorkflowMapping.findAll({
        where: {
          workflowId: workflowData.workflowId,
          status: constantCode.status.ACTIVE
        }
      })

      if (mappedWorkFlow) {
        const filteredMappedWorkFlow = []
        for (const mWF of mappedWorkFlow) {
          const mapping = mWF.mapping
          if (workflowData.module === 'HELPDESK') {
            if (mapping.serviceType === workflowData.serviceType) {
              filteredMappedWorkFlow.push(mWF)
            }
          } else {
            if ((mapping && mapping.hasOwnProperty('serviceType') && mapping?.serviceType === workflowData.serviceType) &&
              (mapping.hasOwnProperty('intxnType') && mapping?.intxnType === workflowData.intxnType) &&
              (mapping.hasOwnProperty('interactionCategory') && mapping?.interactionCategory === workflowData.interactionCategory) &&
              (mapping.hasOwnProperty('serviceCategory') && mapping?.serviceCategory === workflowData.serviceCategory)) {
              filteredMappedWorkFlow.push(mWF)
            }
          }
        }
        if (filteredMappedWorkFlow.length > 0) {
          return {
            status: statusCodeConstants.CONFLICT,
            message: 'Workflow already mapped with request combinations'
          }
        }
      }

      const mappingWorkflowData = {
        workflowId: workflowData.workflowId,
        mappingName: workflowData.templateMapName,
        moduleName: workflowData.module,
        status: workflowData.status,
        createdBy: userId,
        updatedBy: userId
      }

      if (workflowData.module === 'HELPDESK') {
        mappingWorkflowData.mappingPayload = {
          serviceType: workflowData.serviceType
        }
      } else {
        mappingWorkflowData.mappingPayload = {
          serviceType: workflowData?.serviceType,
          serviceCategory: workflowData?.serviceCategory,
          interactionType: workflowData?.interactionType,
          interactionCategory: workflowData?.interactionCategory,
          intxnType: workflowData?.interactionType,
          intxnCategory: workflowData?.interactionCategory,
          customerCategory: workflowData?.customerCategory,
          customerType: workflowData?.customerType,
          orderType: workflowData?.orderType,
          orderCategory: workflowData?.orderCategory,
          priority: workflowData?.priority,
          userFamily: workflowData?.userFamily,
          userGroup: workflowData?.userGroup,
        }
      }

      const createMapping = await conn.WorkflowMapping.create(mappingWorkflowData, { transaction: t })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Workflow mapped sucessfully',
        data: createMapping
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method for updating workflow mapping
   * @param {object} WorkflowData
   * @param {number} userId
   * @returns
   */
  async updatedMappedWorkflow(WorkflowData, userId, conn, t) {
    try {
      if (!WorkflowData.workflowId && !WorkflowData.mappingId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const findrequestMapping = await conn.WorkflowMapping.findOne({ where: { mappingId: WorkflowData.mappingId }, transaction: t })
      if (!findrequestMapping) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'No mapped workflow found with Id:' + WorkflowData.mappingId
        }
      }
      const mappingData = {
        workflowId: WorkflowData.workflowId,
        updatedBy: userId
      }
      await conn.WorkflowMapping.update(mappingData, {
        where: { mappingId: WorkflowData.mappingId },
        transaction: t
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Sucessfully updated mapped workflow'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method for deleting Workflow mapping
   * @param {Array} workflowData [number]
   * @param {number} userId
   * @returns
   */
  async deleteMappedWorkflow(workflowData, userId, conn, t) {
    try {
      if (!Array.isArray(workflowData) && !workflowData.length < 0) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'No data found to update workflow mapping'
        }
      }
      const workflowMappingDetails = await conn.WorkflowMapping.findAll({
        where: {
          mappingId: workflowData,
          status: constantCode.status.ACTIVE
        }
      })

      if (!workflowMappingDetails) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Workflow mapping id not found'
        }
      }

      // TODO: Need to check any open helpdesk or interaction for selected workflow Mapping id
      // FIXME: Need to confirm below logic for open interaction count
      for (const wf of workflowMappingDetails) {
        if (wf.module === 'INTXN') {
          const interactiondetails = await conn.Interaction.findAll({
            where: {
              intxnType: wf.mapping.intxnType,
              serviceCategory: wf.mapping.serviceCategory,
              serviceType: wf.mapping.serviceType,
              intxnCategory: wf.mapping.intxnCategory,
              currStatus: {
                [Op.notIn]: [constantCode.interaction.status.CLOSED]
              }
            }
          })

          if (interactiondetails) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `There is an open interaction for workflow mapping id ${wf.mappingId}`
            }
          }
        }

        if (wf.module === 'ORDER') {
          const orderDetails = await conn.Orders.findAll({
            where: {
              orderType: wf.mapping.intxnType,
              customerCategory: wf.mapping.serviceCategory,
              serviceType: wf.mapping.serviceType,
              orderCategory: wf.mapping.intxnCategory,
              orderStatus: {
                [Op.notIn]: [constantCode.interaction.status.CLOSED]
              }
            }
          })

          if (orderDetails) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `There is an open order for workflow mapping id ${wf.mappingId}`
            }
          }
        }
      }

      await conn.WorkflowMapping.update({ status: constantCode.status.IN_ACTIVE, updatedBy: userId }, {
        where: {
          mappingId: workflowData,
          status: constantCode.status.ACTIVE
        },
        transaction: t
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Workflow mapping details deleted sucessfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method to get all unmapped workflow Definition
   * @param {*} workflowData
   * @param {*} userId
   * @param {*} query
   * @returns
   */
  async unMappedWorkflowList(workflowData, query, userId, conn) {
    try {
      const maps = workflowData
      const { editMapped } = query

      const workFlows = await conn.WorkflowDefinition.findAll({
        attributes: { exclude: ['wfDefinition'] },
        include: [
          { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] },
          { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] }
        ],
        where: { status: constantCode.status.ACTIVE },
        order: [['workflowId', 'ASC']]
      })
      if (!workFlows) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'No workflow found'
        }
      }
      if (editMapped) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Sucessfully fetched unmapped workflow list',
          data: workFlows
        }
      }

      logger.info('Checking validtions')
      if (!maps || !maps.module) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      if (maps.module === 'INTXN') {
        if (!maps.serviceType || !maps.intxnType || !maps.priority || !maps.customerType) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: defaultMessage.MANDATORY_FIELDS_MISSING
          }
        } else if (maps.module === 'HELPDESK') {
          if (!maps.serviceType) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: defaultMessage.MANDATORY_FIELDS_MISSING
            }
          }
        }
      }

      const mappedWorkFlow = await conn.WorkflowMapping.findAll({ where: { status: constantCode.status.ACTIVE, module: maps.module } })
      if (!mappedWorkFlow) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'There is no workflow Mapping is available in Workflow'
        }
      }

      const filteredMappedWorkFlow = []
      for (const mWF of mappedWorkFlow) {
        const mapping = mWF.mapping
        if (maps.module === 'HELPDESK') {
          if (mapping.serviceType === maps.serviceType) {
            filteredMappedWorkFlow.push(mWF)
          }
        } else if (maps.module === 'INTXN') {
          if (mapping.serviceType === maps.serviceType && mapping.intxnType === maps.intxnType &&
            mapping.priority === maps.priority && mapping.customerType === maps.customerType) {
            filteredMappedWorkFlow.push(mWF)
          }
        }
      }
      if (filteredMappedWorkFlow.length > 0) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Workflow exist with request combination'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Sucessfully fetched not mapped workflows',
        data: workFlows
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async listMappedWorkflow(workflowData, query, userId, conn) {
    try {
      logger.info('Fetching mapped workflow list')
      const { limit = constantCode.common.lIMIT, page = constantCode.common.PAGE } = query
      const searchInput = workflowData
      const offSet = (page * limit)
      console.log('offSet------>', offSet)
      const where = {}

      if (searchInput.mappingName) {
        where.mappingName = searchInput.mappingName
      }

      const workflowList = await conn.WorkflowMapping.findAndCountAll({
        attributes: { exclude: ['updatedBy', 'updatedAt'] },
        include: [
          { model: conn.BusinessEntity, as: 'moduleDescription', attributes: ['description'] },
          { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] }
        ],
        where: {
          ...where,
          status: constantCode.status.ACTIVE
        },
        limit,
        offset: offSet,
        order: [['mappingId', 'DESC']],
        logging: true
      })

      if (!workflowList) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'No workflow found'
        }
      }

      const lookups = await conn.BusinessEntity.findAll({
        attributes: ['code', 'description'],
        where: {
          codeType: ['WORKFLOW_MODULE', 'TICKET_CHANNEL', 'PROD_TYPE',
            'INTXN_TYPE', 'CUSTOMER_TYPE']
        }
      })

      for (const workflow of workflowList.rows) {
        if (workflow.mapping) {
          for (const key in workflow.mapping) {
            let bElookup = lookups.filter(e => { return e.code === workflow.mapping[key] })
            bElookup = bElookup[0]?.dataValues?.description
            workflow.mapping[`${key}Description`] = bElookup
          }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'workflow list fetched sucessfully',
        data: workflowList
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getWorkflowState(workflowData, conn) {
    try {
      const { entityId, entity } = workflowData
      if (!entityId || !entity) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const response = await getWFState(entityId, entity, conn)
      console.log(response)
      // if (response?.status === 'ERROR') {
      //   return {
      //     status: statusCodeConstants.ERROR,
      //     message: 'Error While Finding the status in Workflow'
      //   }
      // }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Workflow status fetch successfully',
        data: response?.data || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getDBViewSchemaInfo(conn) {
    try {
      const viewsAndColumns = await conn.sequelize.query(`
        SELECT attrelid::regclass as view_name, attname AS column_name, format_type(atttypid, atttypmod) AS dataType
        FROM pg_attribute as pga
        WHERE attrelid in (SELECT COALESCE(viewname::regclass) as view_name FROM pg_views 
        WHERE schemaname = '${conn.sequelize.options.schema}' and viewname ilike 'nt_%');
        `, { type: QueryTypes.SELECT }
      );

      let tablesAndColumns = [];
      let viewNames = viewsAndColumns.map(x => x.view_name);
      for (let index = 0; index < viewNames.length; index++) {
        const viewName = viewNames[index];
        let columns = viewsAndColumns.filter(x => x.view_name == viewName).map(x => ({ columnName: x.column_name }));
        tablesAndColumns.push({ tableName: viewName, columns })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched Schema details',
        data: tablesAndColumns
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getDBSchemaInfo(conn) {
    try {
      const response = []
      for (const t of Object.keys(conn.sequelize.models)) {
        response.push({
          tableName: conn[t].tableName,
          displayName: t,
          columns: []
        })

        const idx = response.length - 1

        for (const c of Object.keys(conn.sequelize.models[t].rawAttributes)) {
          response[idx].columns.push({
            columnName: conn.sequelize.models[t].rawAttributes[c].field,
            displayName: conn.sequelize.models[t].rawAttributes[c].fieldName
          })
          const cIdx = response[idx].columns.length - 1

          if (['STRING', 'JSONB'].includes(conn.sequelize.models[t].rawAttributes[c].type.toSql())) {
            response[idx].columns[cIdx].dataType = 'TEXT'
          }

          if (conn.sequelize.models[t].rawAttributes[c].type.toSql() === 'INTEGER') {
            response[idx].columns[cIdx].dataType = 'NUMBER'
          }

          if (conn.sequelize.models[t].rawAttributes[c].primaryKey &&
            (conn.sequelize.models[t].rawAttributes[c].autoIncrement) === true) {
            response[idx].columns[cIdx].allowedOps = ['SELECT', 'UPDATE']
          } else {
            response[idx].columns[cIdx].allowedOps = ['SELECT', 'UPDATE', 'INSERT']
          }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched Schema details',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getOrgHierarchyWithRoles(conn) {
    try {
      const orgHierarchy = []

      const rolesOutput = await conn.Role.findAll({
        attributes: ['roleId', 'roleName', 'roleDesc'],
        where: {
          status: constantCode.status.ACTIVE
        },
        order: [['roleId', 'ASC']]
      })

      const rolesMaster = workFlowResource.transformRole(rolesOutput)

      const output = await conn.sequelize.query(`WITH RECURSIVE org_hier_dept AS (
        select 1 as lvl,
          unit_id,
          unit_name,
          unit_type,
          parent_unit,
          unit_desc,
          mapping_payload
        FROM
          ad_business_units
        WHERE
          parent_unit is null and status = 'AC'
        UNION
          select s.lvl + 1 as level,
            e.unit_id,
                e.unit_name,
                 e.unit_type,
              e.parent_unit,
                 e.unit_desc,
              e.mapping_payload
          FROM
            ad_business_units e 
          INNER JOIN org_hier_dept s ON s.unit_id = e.parent_unit
          where status = 'AC'
      ) SELECT
        *
      FROM
        org_hier_dept`, {
        type: QueryTypes.RAW
      })
      const hierarchyResult = camelCaseConversion(output[0])

      for (const u1 of hierarchyResult) {
        const unitRoles = []
        if (u1.mappingPayload && u1.mappingPayload.unitroleMapping && u1.mappingPayload.unitroleMapping.length > 0) {
          for (const r1 of u1.mappingPayload.unitroleMapping) {
            for (const r2 of rolesMaster) {
              if (Number(r1) === Number(r2.roleId)) {
                unitRoles.push({
                  roleId: r2.roleId,
                  roleName: r2.roleName,
                  roleDesc: r2.roleDesc
                })
              }
            }
          }
        }

        if (u1.unitType === 'ORG') {
          orgHierarchy.push({
            level: u1.lvl,
            unitId: u1.unitId,
            unitName: u1.unitName,
            unitType: u1.unitType,
            unitDesc: u1.unitDesc,
            children: [],
            roles: unitRoles,
            show: 'true'
          })
        } else {
          const stack = []

          stack.push(orgHierarchy)

          while (stack.length) {
            for (const c1 of stack[0]) {
              if (c1.unitId === u1.parentUnit) {
                c1.children.push({
                  level: u1.lvl,
                  unitId: u1.unitId,
                  parentUnitId: u1.parentUnit,
                  unitName: u1.unitName,
                  unitType: u1.unitType,
                  unitDesc: u1.unitDesc,
                  children: [],
                  roles: unitRoles,
                  show: 'true'
                })
                stack.length = 0
                break
              } else {
                if (c1.children.length > 0) {
                  stack.push(c1.children)
                }
              }
            }
            stack.shift()
          }
        }
      }

      const data = {
        orgHierarchy,
        rolesMaster
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched Hierarchy details',
        data
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getResolution(payload, departmentId, roleId, userId, conn, authorization) {
    const t = await conn.sequelize.transaction()
    try {
      if (!payload?.conversationUid || !payload?.flowId || !payload?.data?.source) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { conversationUid, flowId } = payload
      const checkExistingConversationCount = await conn.WorkflowHdr.count({
        where: {
          entityId: conversationUid,
          wfStatus: constantCode.workflow.txn.status.DONE
        }
      })

      if (checkExistingConversationCount > 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          // message: `Conversation ${conversationUid} is already completed.`
          message: `Conversation has been closed.`
        }
      }

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId || systemDeptId,
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId,
        source: 'KnowledgeBase'
      }
      let response = { callAgain: false }
      let counter = 1
      response = await processTheCurrentFlow(payload?.data, conversationUid, response, flowId, commonAttrib, conn, authorization)
      while (response.callAgain && response?.conversation === undefined && counter <= 10) {
        console.log("I'm keep running here...")
        response = await processTheCurrentFlow(payload?.data, payload?.conversationUid, response, flowId, commonAttrib, conn, authorization)
        counter++
      }
      // console.log('respose', response)
      await t.commit()
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully sent automated response',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateResolution(payload, departmentId, roleId, userId, conn, t) {
    try {
      const checkExistingConversation = await conn.WorkflowHdr.findOne({
        where: {
          entityId: payload.conversationUid,
          wfStatus: {
            [Op.notIn]: [constantCode.workflow.hdr.status.DONE]
          }
        }
      })
      if (!checkExistingConversation) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Unable to find the conversation'
        }
      }

      const checkExistingConversationDetails = await conn.WorkflowTxn.findAll({
        where: {
          wfHdrId: checkExistingConversation.wfHdrId,
          wfTxnStatus: {
            [Op.notIn]: [constantCode.workflow.txn.status.DONE]
          }
        }
      })

      if (checkExistingConversationDetails) {
        const WorkflowTxnId = checkExistingConversationDetails.map((wf) => { return wf.wfTxnId })
        await conn.WorkflowTxn.update({ wfTxnStatus: constantCode.workflow.txn.status.DONE }, { where: { wfTxnId: WorkflowTxnId }, transaction: t })
      }
      await conn.WorkflowHdr.update({ wfStatus: constantCode.workflow.txn.status.DONE }, { where: { wfHdrId: checkExistingConversation.wfHdrId }, transaction: t })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully updated conversation'
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getLastConversationAction(payload, conn) {
    try {
      if (isEmpty(payload) || !payload?.conversationUid || !payload?.actionType || !payload?.assistType) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      // console.log('payload----->', payload)
      const { conversationUid, actionType, assistType } = payload

      const response = await conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: conversationUid,
          conversationActionType: actionType,
          smartAssistType: assistType
        },
        order: [['smartAssistTxnId', 'DESC']]
      })
      // console.log('response----->', response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: defaultMessage.SUCCESS,
        data: response
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async addConversation(body, params, departmentId, roleId, userId, conn) {
    try {
      const { inputValue, conversationUid } = body
      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId || 'COMQUEST.BCT',
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId,
        source: 'KnowledgeBase'
      }

      console.log('commonAttrib--------->', commonAttrib)
      await storeConversation(conversationUid, 'RECEIVED', inputValue, 'ORDER_CONFIG', commonAttrib, conn)

      return {
        status: statusCodeConstants.SUCCESS,
        message: defaultMessage.SUCCESS
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }
}

module.exports = WorkflowService
