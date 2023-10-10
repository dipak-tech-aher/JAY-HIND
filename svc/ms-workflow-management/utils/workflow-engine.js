import { config } from '@config/env.config'
import { formateInsertQuery, formateSelectQuery, formateUpdateQuery } from '@utils/query-builder'
import axios from 'axios'
import jsonata from 'jsonata'
import { isEmpty } from 'lodash'
import { Op, QueryTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { constantCode } from './constant'
import logger from './logger'

const https = require('https')
const { systemUserId } = config

/** Function for get Interaction dropdown status/role/department based on current workflow
 * @param {number} entityId
 * @param {string} entity
 * @param {instance} conn
 * @returns
 */
export const getWFState = async (entityId, entity, conn) => {
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
      status: 'ERROR',
      message: 'Workflow details not Found'
    }
  }
  console.log('workflowHdr.wfHdrId ', workflowHdr.wfHdrId)
  const workflowTxns = await conn.WorkflowTxn.findAll({
    where: {
      wfHdrId: workflowHdr.wfHdrId
    },
    order: [['wfTxnId', 'DESC']]
  })
  if (workflowTxns.length === 0) {
    return {
      status: 'ERROR',
      message: 'Workflow transaction details not Found'
    }
  }

  if (workflowTxns[0].wfTxnStatus !== constantCode.workflow.txn.status.USERWAIT) {
    return {
      status: 'ERROR',
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
      status: 'ERROR',
      message: 'There is no workflow process to perform the action.'
    }
  }
  console.log('workflowDfn ', workflowDfn)

  const activities = workflowDfn?.wfDefinition?.definitions?.process?.activities
  if (!activities) {
    return {
      status: 'ERROR',
      message: 'There is no Workflow activities to perform the action'
    }
  }
  console.log('activities ', activities)

  const obj = activities.find(e => e?.type === constantCode.workflow.task.name && workflowTxns.length > 0 && e?.activityId === workflowTxns[0]?.activityId)
  if (!obj || !obj?.tasks) {
    return {
      status: 'ERROR',
      message: 'There is no task is assigned in Workflow to perform the action'
    }
  }
  console.log('obj ', obj)
  const manualTask = obj.tasks.find(e => (e?.type === constantCode.workflow.task.type.MANUAL && workflowTxns.length > 0 && (e.taskId + '') === workflowTxns[0]?.taskId))
  console.log('manualTask ', manualTask)
  if (!manualTask || !manualTask?.assignments) {
    return {
      status: 'ERROR',
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
    attributes: ['code', 'description', 'mappingPayload'],
    where: {
      status: constantCode.status.ACTIVE,
      codeType: ['INTERACTION_STATUS', 'ORDER_STATUS']
    },
    order: [
      ['code', 'ASC']
    ]
  })

  const entities = []
  for (const asmt of manualTask.assignments) {
    if (asmt?.targetDeptRoles && asmt.targetDeptRoles.length > 0) {
      for (const t of asmt.targetDeptRoles) {
        console.log('tttttttttt', t)
        const entry = {
          roles: [],
          entity: [],
          status: []
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
                  description: s2.description,
                  mappingPayload: s2.mappingPayload
                })
                break
              }
            }
          }
        }
        if (t.task && t.task.length > 0) {
          const taskOutput = await conn.Tasks.findAll({
            attributes: ['taskName', 'taskNo', 'taskOptions', 'isMandatoryFla'],
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
    status: 'SUCCESS',
    message: 'Workflow details fetched Successfully',
    data
  }
}

export const processTheCurrentFlow = async (data, conversationUid, callAgainFlag, flowId, commonAttrib, conn, authorization) => {
  try {
    console.log('callAgainFlag.callAgain------->', callAgainFlag.callAgain)
    logger.debug('Executing processTheCurrentFlow function')
    let response = { callAgain: callAgainFlag.callAgain }
    let message

    if (!callAgainFlag.callAgain) {
      logger.debug('Executing store Conversation')
      await storeConversation(conversationUid, 'RECEIVED', data, null, commonAttrib, conn)
    }

    const wfResponse = await startWorkFlowChat(conversationUid, data, flowId, commonAttrib, conn, authorization)

    if (wfResponse?.type !== 'WORKFLOWEND' && wfResponse === undefined) {
      return { ...response, callAgain: true, conversationUid }
    }

    // if (typeof (wfResponse?.executeSendMessageTaskResult) === 'object') {
    if (wfResponse?.type === 'SENDMESSAGE' || wfResponse?.type === 'API') {
      response = { ...response, callAgain: true, conversationUid }
    }

    if (wfResponse?.type === 'COLLECTINPUT' || wfResponse?.type === 'WAIT') {
      response = { ...response, callAgain: false, conversationUid }
    }

    if (wfResponse?.data?.executeTaskResult?.taskContextPrefix !== undefined) {
      let separatedStr
      if (wfResponse?.data?.executeTaskResult?.taskContextPrefix?.includes('$.')) {
        separatedStr = wfResponse?.data?.executeTaskResult?.taskContextPrefix?.split('$.')
      }
      if (separatedStr && separatedStr[1] !== undefined) {
        const expr = '$.' + separatedStr[1]
        console.log('expr', expr)
        const expression = jsonata(expr)
        const value = await expression.evaluate(wfResponse?.data?.inputContext)
        console.log('separatedStr---->', separatedStr)
        console.log('separatedStr[0]---->', separatedStr[0])
        if (!separatedStr[0]) {
          message = value
        } else {
          message = `${separatedStr[0]} ${value}`;
          if (message?.includes('--@#@--')) {
            message = separatedStr[0].replace('--@#@--', value)
          }
        }
        console.log('message------->', message)
      } else {
        message = wfResponse?.data?.executeTaskResult?.taskContextPrefix
      }
      if (wfResponse?.type === 'COLLECTINPUT') {
        message = {
          element: message || '',
          attributes: wfResponse?.data?.executeTaskResult?.properties || [],
          formMetaAttributes: wfResponse?.data?.executeTaskResult?.formMetaAttributes || []
        }
      }
    } else {
      message = wfResponse?.data?.executeTaskResult?.taskContextPrefix || null
    }
    // }
    // wfResponse?.type !== 'WORKFLOWEND' &&
    if (!['DECISION', 'API'].includes(wfResponse?.type)) {
      response = {
        ...response,
        conversation: {
          actionType: wfResponse?.type || null,
          description: wfResponse?.data?.executeTaskResult?.taskName || '',
          type: message ? typeof (message) : wfResponse?.message ? typeof (wfResponse?.message) : '',
          message: message || wfResponse?.message || ''
        }
      }
    }
    await storeConversation(conversationUid, 'SEND', response || null, wfResponse?.type, commonAttrib, conn)

    return response
  } catch (error) {
    logger.error('error', error)
  }
}

export const storeConversation = async (conversationUid, assistType, data, actionType, commonAttrib, conn) => {
  try {
    let checkExistingConversation = 0
    checkExistingConversation = await conn.smartAssist.findAll({ where: { smartAssistConversationId: conversationUid, conversationActionType: { [Op.notIn]: ['ORDER_CONFIG'] } }, order: [['smartAssistTxnId', 'DESC']] })
    const count = checkExistingConversation?.length || 0
    // let actionType
    if (!actionType) {
      if (count > 0) {
        actionType = checkExistingConversation[0].conversationActionType === 'INTIAL_CONFIG' ? 'WELCOME' : checkExistingConversation[0].conversationActionType
      } else {
        actionType = data.inputType
      }
    }

    const conversationData = {
      smartAssistConversationId: conversationUid,
      smartAssistType: assistType,
      smartAssistValue: data,
      smartAssistTxnUuid: uuidv4(),
      conversationActionType: data?.inputType === 'FORMDATA' ? data?.inputType : actionType,
      seqNo: count + 1,
      ...commonAttrib
    }
    await conn.smartAssist.create(conversationData)

    // console.log('assistType', assistType)
    // console.log('inputType', data?.inputType)

    // if (assistType === 'RECEIVED' && data?.inputType === 'FORMDATA') {
    //   let workflowContext = await conn.WorkflowHdr.findOne({
    //     where: {
    //       entityId: conversationUid
    //     }
    //   })

    //   workflowContext = workflowContext?.dataValues ?? workflowContext

    //   if (!isEmpty(workflowContext)) {
    //     const workflowCOntextData = { wfContext: { ...workflowContext?.wfContext?.context, [workflowContext?.nextActivityId]: data?.inputValue } }
    //     console.log('workflowCOntextData', workflowCOntextData)
    //     await conn.WorkflowHdr.update(workflowCOntextData, { where: { entityId: conversationUid } })
    //   }
    // }
  } catch (error) {
    logger.error(error)
  }
}

const startWorkFlowChat = async (entityId, data, flowId, commonAttrib, conn, authorization) => {
  try {
    /** we are checking workflow already assigned or not */
    logger.debug(`process start WorkFlow Chat - ${entityId}`)

    const { source } = data

    const workflowCount = await conn.WorkflowHdr.count({
      where: {
        [Op.and]: [{ entityId }, { entity: source }]
      }
    })
    if (workflowCount === 0) {
      await assignWFToEntity(entityId, source, flowId, commonAttrib, conn)
    }
    const workflowHrd = await conn.WorkflowHdr.findAll({
      where: {
        [Op.and]: [{ entityId }, { entity: source }],
        [Op.or]: [{ wfStatus: 'CREATED' }, { wfStatus: 'USER_WAIT' }, { wfStatus: 'SYS_WAIT' }]
      }
    })

    if (Array.isArray(workflowHrd) && workflowHrd.length > 0) {
      for (const wfHdr of workflowHrd) {
        const wfDfn = await conn.Workflow.findOne({ where: { workflowId: wfHdr.wfDefnId } })
        if (wfDfn?.wfDefinition && wfDfn?.wfDefinition?.definitions && wfDfn?.wfDefinition?.definitions?.process) {
          if (wfHdr.wfStatus === 'CREATED') {
            if (!wfHdr.nextActivityId) {
              await processAutomatedResponseStart(wfHdr, wfDfn.wfDefinition, source, conn)
              return await startWorkFlowChat(entityId, data, flowId, commonAttrib, conn, authorization)
            } else if (wfHdr.nextActivityId) {
              /** If already wf started and continuing remaining tasks */
              return await continueAutomatedResponseExecution(wfDfn.wfDefinition, wfHdr.nextActivityId, wfHdr.wfContext, entityId, data, conn, authorization)
            }
          }
        } else {
          logger.debug('Workflow JSON not found in workflow definition table')
          return 'There is no process assign from this Statement'
        }
      }
    } else {
      logger.debug('No records to execute the workflow hdr')
      return 'There is no process assign from this Statement'
    }
  } catch (err) {
    logger.error(err)
    logger.debug('No records to execute the workflow hdr02')
  }
}

const assignWFToEntity = async (entityId, entity, workflowId, commonAttrib, conn) => {
  const t = await conn.sequelize.transaction()
  try {
    const workflow = await conn.Workflow.findOne({ where: { workflowId } })
    if (workflow) {
      const wfhdr = await conn.WorkflowHdr.findOne({ where: { entity, entityId, wfDefnId: workflowId } })
      if (!wfhdr) {
        const data = {
          entity,
          entityId,
          wfDefnId: workflowId,
          wfContext: {},
          wfStatus: 'CREATED',
          ...commonAttrib
        }
        await conn.WorkflowHdr.create(data, { transaction: t })
        await t.commit()
      }
    }
  } catch (error) {
    logger.log(error)
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

const processAutomatedResponseStart = async (wfHdr, wfJson, source, conn) => {
  logger.debug('Performing start step for new record')

  try {
    const process = wfJson.definitions.process
    if (process) {
      const activities = process.activities
      const transitions = process.transitions
      // Finding START activitie and  current Activiti Id from the activities array
      const startActivity = activities.find(e => e.type === 'START')
      if (startActivity) {
        const startActivityId = startActivity.activityId
        const startActivityPrefix = startActivity.activityContextPrefix
        // Finding transition and next activiti id based on start Activiti Id in the transitions array
        const transition = transitions.find(e => e.from === startActivityId)
        if (transition) {
          const nextActivityId = transition.to
          let inputContext
          // Storing the activitie id's in context
          const context = {
            [startActivityPrefix]: startActivityPrefix
          }
          const hasStartRec = await conn.WorkflowTxn.findOne({ where: { wfHdrId: wfHdr.wfHdrId, activityId: startActivityId, wfTxnStatus: { [Op.ne]: 'DONE' } } })
          if (!hasStartRec) {
            inputContext = {
              context
            }
            // Inserting data into WorkflowTxn table
            const wfTxnData = {
              wfHdrId: wfHdr.wfHdrId,
              activityId: startActivityId,
              taskId: null, // No task id for the start step
              wfTxnStatus: 'DONE',
              txnContext: inputContext,
              createdBy: systemUserId,
              updatedBy: systemUserId
            }
            const t = await conn.sequelize.transaction()
            try {
              const wfTxn = await conn.WorkflowTxn.create(wfTxnData, { transaction: t })
              if (wfTxn) {
                // updating the wfHdr table
                inputContext.wfHdrId = wfHdr.wfHdrId
                inputContext.context.entity = wfHdr.entityId
                inputContext.context.entityType = wfHdr.entityType
                const data = {
                  nextActivityId,
                  entity: wfHdr.entity,
                  wfContext: inputContext
                }
                await conn.WorkflowHdr.update(data, { where: { wfHdrId: wfHdr.wfHdrId }, transaction: t })
              }
              await t.commit()
              logger.debug('Successfully saved the data in Workflow Txn')
            } catch (error) {
              logger.error(error, 'Error while processing start step')
            } finally {
              if (t && !t.finished) {
                await t.rollback()
              }
            }
          }
          logger.debug('Successfully processed start step')
        } else {
          logger.debug('No transitions found for start activitie')
          return 'No transitions found for start activitie'
        }
      } else {
        logger.debug('No start activitie found')
        return 'No start activitie found'
      }
    } else {
      logger.debug('No process found in the wfDefinition ')
      return 'No process found in the wfDefinition'
    }
  } catch (error) {
    logger.error(error, 'Error while processing start step')
  }
}

const continueAutomatedResponseExecution = async (wfJson, currentActivityId, inputContext, mobileNumber, data, conn, authorization) => {
  // console.log('authorization------continueAutomatedResponseExecution---->', authorization)
  logger.debug('Continue chat workflow Execution')
  let response = { type: '', data: {} }
  const t = await conn.sequelize.transaction()
  try {
    const process = wfJson?.definitions?.process
    const activities = process?.activities
    const transitions = process?.transitions
    const transition = transitions.find(e => e.from === currentActivityId)
    const nextActivityId = transition?.to

    const currentActivity = activities.find(e => e.activityId === currentActivityId)
    const hasWaitRecord = await findUserWaitRecordById(currentActivityId, inputContext.wfHdrId, conn, t)
    if (hasWaitRecord) {
      logger.debug('A - Some task are in wait state or not yet done, So can`t prcess End step now')
      response = { ...response, type: 'WAIT', data: { message: 'A - Some task are in wait state or not yet done, So can`t prcess End step now' } }
      //  return currentActivity.tasks[0].taskContextPrefix
      return response
    } else {
      // Finding tasks based on nextActivityId in the activities array
      const activityPrefix = currentActivity.activityContextPrefix
      if (currentActivity.type === 'END') {
        logger.debug('Processing the end Task')
        // await conn.WorkflowTxn.destroy({
        //   where: {
        //     wfHdrId: inputContext.wfHdrId
        //   },
        //   transaction: t
        // })
        // const data = {
        //   nextActivityId: '',
        //   wfContext: {},
        //   wfStatus: 'CREATED'
        // }
        // await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
        await processEndStep(currentActivity.activityId, inputContext, conn, t) // update the status as closed
        await t.commit()
        response = { ...response, type: 'WORKFLOWEND', data: { message: 'WORKFLOWEND' } }
        // return 'WORKFLOWEND'
        return response
      } else if (currentActivity.type === 'DECISION') {
        logger.debug('Processing the decision Task')
        let decision = false
        let transitionId
        for (const rule01 of currentActivity.condition) {
          if (rule01.ruleType === 'DEFAULT') {
            decision = true
            transitionId = rule01.transitionId
          }
          for (const rule02 of rule01.rules) {
            for (const rule03 of rule02.rules) {
              console.log(rule03.rules && typeof (rule03) === 'object')
              if (rule03.rules && typeof (rule03) === 'object') {
                const resultArray = []
                // console.log('log 4', rule03.rules)
                for (const rule04 of rule03.rules) {
                  let decisionRules = false
                  //   console.log('rules04 ----->>>>>', rule04, rule04.id)
                  if (rule04.valueType === 'EXPR') {
                    const expression = jsonata(rule04.value)
                    rule04.value = await expression.evaluate(inputContext)
                  }
                  if (rule04.fieldType === 'EXPR') {
                    const expression = jsonata(rule04.field)
                    // console.log('Expression' , rule04.field, rule04)
                    rule04.field = await expression.evaluate(inputContext)
                    // console.log('rule04.field line no 233 ===>', rule04.field)
                    // console.log('rule03.field......rule03.field', JSON.stringify(inputContext))
                    // console.log("transitionId", rule01.transitionId)
                    // console.log('rule04 ===>', rule04)
                    // console.log('rule04.operator ===>', rule04.operator)
                    // console.log('rule04.field ===>', rule04.field)
                    // console.log('rule04.value ===>', rule04.value)
                    // console.log('rule04.value ===>', rule04.value)

                    if (rule04.field) {
                      if (String(rule04.field).toUpperCase() === 'HELP') {
                        await conn.WorkflowTxn.destroy({
                          where: {
                            wfHdrId: inputContext.wfHdrId
                          }
                        })
                      }
                    }
                    if ((rule04.operator === '-' || rule04.operator === '=') && !decisionRules) {
                      if (typeof (rule04.field) === 'object') {
                        //   console.log('rule04.field[0]....', rule04.field[0])
                        if (rule04.field[0] === rule04.value[0] && (rule04.field[0] !== undefined || rule04.value[0] !== undefined)) {
                          transitionId = rule01.transitionId
                          decisionRules = true
                        }
                      } else {
                        if (String(rule04?.field) === String(rule04?.value) && (rule04.field !== undefined || rule04.value !== undefined ||
                          rule04.field !== null || rule04.value !== null)) {
                          transitionId = rule01.transitionId
                          //  console.log('else....', rule04.field, rule04.value, String(rule04.field) === String(rule04.value))
                          decisionRules = true
                        }
                      }
                    }
                    if (rule04.operator === '!=' && !decisionRules) {
                      if (rule04.field !== rule04.value && (rule04.field !== undefined || rule04.value !== undefined)) {
                        transitionId = rule01.transitionId
                        decisionRules = true
                      }
                    }
                    resultArray.push(decisionRules)
                  }
                }
                if (rule03.combinator === 'AND') {
                  for (const r of resultArray) {
                    if (!r) {
                      decision = false
                      break
                    } else {
                      decision = true
                    }
                  }
                } else {
                  for (const r of resultArray) {
                    if (r) {
                      decision = true
                      break
                    }
                  }
                }
                // console.log('resultArray', resultArray)
              } else {
                // if (rule03.valueType === 'TEXT') {
                //   rule03.value = rule03.value
                // }
                // if (rule03.fieldType === 'TEXT') {
                //   rule03.field = rule03.field
                // }
                if (rule03.valueType === 'EXPR') {
                  const expression = jsonata(rule03.value)
                  rule03.value = await expression.evaluate(inputContext)
                }
                if (rule03.fieldType === 'EXPR') {
                  const expression = jsonata(rule03.field)
                  rule03.field = await expression.evaluate(inputContext)
                  if (rule03.field) {
                    if (rule03.field.toString().toUpperCase() === 'HELP') {
                      await conn.WorkflowTxn.destroy({
                        where: {
                          wfHdrId: inputContext.wfHdrId
                        },
                        transaction: t
                      })
                    }
                  }
                }
                console.log('rule03', rule03)
                if ((rule03.operator === '-' || rule03.operator === '=') && !decision) {
                  if (typeof (rule03.field) === 'object') {
                    if (String(rule03.field) === String(rule03.value) && (rule03.field !== undefined || rule03.value !== undefined)) {
                      transitionId = rule01.transitionId
                      decision = true
                      break
                    }
                  } else {
                    if (String(rule03.field) === String(rule03.value) && (rule03.field !== undefined || rule03.value !== undefined)) {
                      transitionId = rule01.transitionId
                      decision = true
                      break
                    }
                  }
                }
                console.log('rule03', rule03)
                if (rule03.operator === '!=' && !decision) {
                  if (String(rule03.field) !== String(rule03.value) && (rule03.field !== undefined || rule03.value !== undefined)) {
                    transitionId = rule01.transitionId
                    decision = true
                    break
                  }
                }
                if (rule03.operator === '>' && !decision) {
                  if (String(rule03.field) > String(rule03.value) && (rule03.field !== undefined || rule03.value !== undefined)) {
                    transitionId = rule01.transitionId
                    decision = true
                    break
                  }
                }
              }
              if (decision) {
                break
              }
            }
            if (decision) {
              break
            }
          }
          if (decision) {
            break
          }
        }
        if (decision) {
          const transition = transitions.find(e => e.transitionId === transitionId)
          const nextActivityId = transition.to
          const txnData = {
            wfHdrId: inputContext.wfHdrId,
            activityId: currentActivity.activityId,
            // taskId: task.taskId,
            txnContext: inputContext,
            wfTxnStatus: 'DONE',
            createdBy: systemUserId,
            updatedBy: systemUserId
          }
          const wfTxn = await conn.WorkflowTxn.create(txnData, { transaction: t }, { logging: true })
          if (wfTxn) {
            const data = {
              nextActivityId,
              wfContext: inputContext
            }
            await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
          }
          await t.commit()
          return await continueAutomatedResponseExecution(wfJson, nextActivityId, inputContext, mobileNumber, data, conn, authorization)
        } else {
          await t.commit()
          response = { ...response, type: 'DECISION', data: { message: 'There is no matched decision' } }
          // return 'Please enter help to go main menu'
          return response
        }
      } else {
        let noTaskFound = false
        if (currentActivity?.tasks?.length > 0) {
          for (const task of currentActivity?.tasks) {
            // Finding any wait record in txn table and continueExecution
            const hasWaitRecord = await findUserWaitRecordById(currentActivityId, inputContext.wfHdrId, conn, t)
            if (hasWaitRecord) {
              logger.debug('B - Some task are in wait state or not yet done, So can`t prcess End step now')
              response = { ...response, type: 'WAIT', data: { message: 'B - Some task are in wait state or not yet done, So can`t prcess End step now', taskContextPrefix: currentActivity.tasks[0].taskContextPrefix } }

              // return currentActivity.tasks[0].taskContextPrefix
              return response
            } else {
              const hasTask = await conn.WorkflowTxn.findOne({
                where: { wfHdrId: inputContext.wfHdrId, activityId: currentActivityId, taskId: task.taskId.toString() }
              })
              if (!hasTask) {
                const txnData = {
                  wfHdrId: inputContext.wfHdrId,
                  activityId: currentActivity.activityId,
                  taskId: task.taskId,
                  txnContext: inputContext,
                  wfTxnStatus: 'DONE',
                  createdBy: systemUserId,
                  updatedBy: systemUserId
                }
                await conn.WorkflowTxn.create(txnData, { transaction: t }, { logging: true })
                // Finding taskContextPrefix and storing under current activity
                const taskActivityPrefix = task.taskContextPrefix
                if (task.type === 'SENDMESSAGE') {
                  logger.debug('Processing the send Task')
                  const txnData = {
                    wfHdrId: inputContext.wfHdrId,
                    activityId: currentActivity.activityId,
                    taskId: task.taskId,
                    txnContext: inputContext,
                    wfTxnStatus: 'DONE',
                    createdBy: systemUserId,
                    updatedBy: systemUserId
                  }

                  const wfTxn = await conn.WorkflowTxn.create(txnData, { transaction: t }, { logging: true })
                  if (wfTxn) {
                    // updating the wfHdr table
                    const data = {
                      nextActivityId,
                      wfContext: inputContext
                    }
                    await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
                  }

                  const executeSendMessageTaskResult = await executeSendMessageTask(task, inputContext, t, activityPrefix, taskActivityPrefix)
                  // await conn.WorkflowTxn.destroy({
                  //   where: {
                  //     wfHdrId: inputContext.wfHdrId
                  //   },
                  //   transaction: t
                  // })
                  await t.commit()

                  response = {
                    ...response,
                    type: 'SENDMESSAGE',
                    data: {
                      message: 'response from send message',
                      executeTaskResult: executeSendMessageTaskResult,
                      inputContext
                    }
                  }
                  return response
                } else if (task.type === 'COLLECTINPUT') {
                  logger.debug('Processing the collect input Task')
                  const txnData = {
                    wfHdrId: inputContext.wfHdrId,
                    activityId: currentActivity.activityId,
                    taskId: task.taskId,
                    txnContext: inputContext,
                    wfTxnStatus: 'USER_WAIT',
                    createdBy: systemUserId,
                    updatedBy: systemUserId
                  }

                  const executeCollectInputTaskResult = await executeCollectInputTask(task, inputContext, t, activityPrefix, taskActivityPrefix, mobileNumber, data?.inputValue || null, txnData, nextActivityId, conn)
                  // console.log('taskActivityPrefix', taskActivityPrefix)
                  // console.log('executeCollectInputTaskResult', executeCollectInputTaskResult)
                  await conn.WorkflowTxn.destroy({
                    where: {
                      wfHdrId: inputContext.wfHdrId
                    },
                    transaction: t
                  })
                  await t.commit()
                  response = {
                    ...response,
                    type: 'COLLECTINPUT',
                    data: {
                      message: 'response from Collect message',
                      executeTaskResult: executeCollectInputTaskResult,
                      inputContext
                    }
                  }
                  // return executeCollectInputTaskResult
                  return response
                } else if (task.type === 'API') {
                  logger.debug('Processing the api Task')
                  const txnData = {
                    wfHdrId: inputContext.wfHdrId,
                    activityId: currentActivity.activityId,
                    taskId: task.taskId,
                    txnContext: inputContext,
                    wfTxnStatus: 'SYS_WAIT',
                    createdBy: systemUserId,
                    updatedBy: systemUserId
                  }
                  const executeAPITaskResult = await executeAPIForAutomatedResponse(task, inputContext, t, activityPrefix, taskActivityPrefix, mobileNumber, txnData, nextActivityId, conn, authorization)
                  await t.commit()
                  response = {
                    ...response,
                    type: 'API',
                    data: {
                      message: 'response from API message',
                      executeTaskResult: executeAPITaskResult,
                      inputContext
                    }
                  }
                  // return executeAPITaskResult
                  return response
                } else if (task.type === 'DB') {
                  logger.debug('Processing the DB Task')
                  const hasMoreTask = false
                  await executeDatabaseTask(task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask)
                }
              } else {
                logger.debug('No tasks found')
                noTaskFound = true
              }
            }
          }
        }
        if (noTaskFound) {
          // continueExecution for next activities and transitions
          const transition = transitions.find(e => e.from === currentActivityId)
          if (transition) {
            const nextActivityId = transition.to
            // Here nextActivityId become current activityid
            return await continueAutomatedResponseExecution(wfJson, nextActivityId, inputContext, mobileNumber, data, conn,authorization)
          } else {
            logger.debug('No transition found')
          }
        }
      }
      // t.commit()
    }
  } catch (error) {
    logger.error(error, 'Error while continue workflow execution step')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

const executeAPIForAutomatedResponse = async (APITask, context, t, activityPrefix, taskActivityPrefix, mobileNumber, txnData, nextActivityId, conn, authorization) => {
  logger.debug('Executing API Task')
  if (APITask.api.method === 'POST') {
    await executePost(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData, conn, authorization)
  } else if (APITask.api.method === 'PUT') {
    await executePut(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData, conn, authorization)
  } else if (APITask.api.method === 'GET') {
    return await executeGet(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData, conn, authorization)
  } else if (APITask.api.method === 'DELETE') {
    await executeDelete(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData, conn, authorization)
  } else {
    logger.debug('No API Task found')
  }
  logger.debug('Successfully Executed API Task')
}

const findUserWaitRecordById = async (activityId, wfHdrId, conn, t) => {
  const hasWaitRecord = await conn.WorkflowTxn.findOne({
    where: {
      wfHdrId,
      activityId,
      [Op.or]: [{ wfTxnStatus: 'USER_WAIT' }, { wfTxnStatus: 'SYS_WAIT' }]
    },
    transaction: t
  })
  return hasWaitRecord
}

const processEndStep = async (activityId, inputContext, conn, t) => {
  logger.debug('Processing End step')
  try {
    const hasRecord = await conn.WorkflowTxn.findOne({
      where: {
        wfHdrId: inputContext.wfHdrId,
        activityId,
        wfTxnStatus: { [Op.ne]: 'DONE' }
      },
      transaction: t
    })
    if (!hasRecord) {
      const wfTxnData = {
        wfHdrId: inputContext.wfHdrId,
        activityId,
        taskId: null, // No task id for the start step
        wfTxnStatus: 'DONE',
        txnContext: inputContext,
        createdBy: systemUserId,
        updatedBy: systemUserId
      }
      const wfTxn = await conn.WorkflowTxn.create(wfTxnData, { transaction: t })
      if (wfTxn) {
        const data = {
          nextActivityId: activityId,
          wfStatus: 'DONE',
          updatedBy: systemUserId
        }
        await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
      }
    } else {
      logger.debug('Some task are in wait state')
    }
    logger.debug('Successfully processed End step')
  } catch (error) {
    logger.error(error, 'Error while processing end step')
  }
}

const executeDatabaseTask = async (dbTasks, context, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  logger.debug('Execute Database Task')
  if (dbTasks.queryType === 'SELECT') {
    await executeSelect(dbTasks, context, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
  } else if (dbTasks.queryType === 'INSERT') {
    await executeInsert(dbTasks, context, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
  } else if (dbTasks.queryType === 'UPDATE') {
    await executeUpdate(dbTasks, context, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
  } else {
    logger.debug('No Database Task found')
  }
  logger.debug('Successfully Executed DB Task')
}

const executeSelect = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  logger.debug('Executing Select')
  try {
    if (task.tables.length > 0 && task.columns.length > 0) {
      const { query, params, waitClause } = await formateSelectQuery(task, inputContext)
      logger.debug('Generated Select Query :', query)

      if (waitClause) { /* empty */ }

      // Fetching the results based generated query
      const response = await conn.sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT,
        logging: true
      })
      logger.debug('Select query response :', response)
      if (response) {
        await updateContextDB(response, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, task, conn)
      }
    }
  } catch (error) {
    logger.error(error, 'from Execute select')
  }
}

const executeInsert = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  logger.debug('Executing Insert')
  try {
    if (task.tables.length === 1 && task.columns.length > 0) {
      const query = await formateInsertQuery(task, inputContext)
      logger.debug('Generated Insert Query :', query)
      const response = await conn.sequelize.query(query, { transaction: t }, {
        type: QueryTypes.INSERT
      })
      if (response) {
        await updateContext(response, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
      }
    }
  } catch (error) {
    logger.error(error)
  }
}

const executeUpdate = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  logger.debug('Executing Update')
  try {
    if (task.tables.length === 1 && task.columns.length === 1) {
      const { query, params } = await formateUpdateQuery(task, inputContext)
      logger.debug('Generated Update Query :', query)
      // Updating data based generated query
      const response = await conn.sequelize.query(query, { transaction: t }, {
        replacements: params,
        type: QueryTypes.UPDATE
      })
      if (response) {
        await updateContext(response, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
      }
    }
  } catch (error) {
    logger.error(error)
  }
}

const updateContextDB = async (data, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, task, conn) => {
  try {
    let table = ''
    if (task.tables.length === 1) {
      table = task.tables[0]
    }
    if (hasMoreTask) {
      inputContext.context = {
        entity: inputContext.context.entity,
        [activityPrefix]: {
          ...inputContext.context[activityPrefix],
          [taskActivityPrefix]: taskActivityPrefix
        }
      }
    } else {
      inputContext.context[activityPrefix] = activityPrefix
      inputContext = JSON.parse(JSON.stringify(inputContext))
      inputContext.context[activityPrefix] = {
        [taskActivityPrefix]: taskActivityPrefix
      }
    }
    inputContext.context[activityPrefix][taskActivityPrefix] = {
      [table]: data
    }
    const wfData = {
      nextActivityId: activityPrefix,
      updatedBy: systemUserId,
      wfContext: inputContext
    }
    await conn.WorkflowHdr.update(wfData, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
  } catch (error) {
    logger.error(error)
  }
}

const updateContext = async (data, inputContext, t, activityPrefix, taskActivityPrefix, nextActivityId, conn) => {
  try {
    if (nextActivityId) {
      inputContext.context[activityPrefix] = {
        ...inputContext.context[activityPrefix],
        [taskActivityPrefix]: taskActivityPrefix
      }
    } else {
      inputContext.context[activityPrefix] = activityPrefix
      inputContext = JSON.parse(JSON.stringify(inputContext))
      inputContext.context[activityPrefix] = {
        [taskActivityPrefix]: taskActivityPrefix
      }
    }
    inputContext.context[activityPrefix][taskActivityPrefix] = data
    const wfData = {
      nextActivityId,
      updatedBy: systemUserId,
      wfContext: inputContext
    }

    await conn.WorkflowHdr.update(wfData, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
    // const data = {
    //   wfHdrId: inputContext.wfHdrId,
    //   activityId:
    // }
    // await conn.WorkflowHdr.create(wfData, )
  } catch (error) {
    logger.error(error)
  }
}

const findMapping = (schema, key, depth) => {
  let output = {}
  for (const p in schema.properties) {
    if (p === key) {
      output = {
        mapping: schema.properties[p].mapping,
        breakLoop: true
      }
      break
    } else {
      if (schema.properties[p].type === 'object') {
        output = findMapping(schema.properties[p], key, depth + 1)
        if (output.breakLoop) {
          break
        }
      }
    }
  }
  if (depth === 0) {
    return output.mapping
  } else {
    return output
  }
}

const findRequestBodyObj = async (requestSchema, context) => {
  const srcStack = []
  srcStack.push(requestSchema.properties)
  let response = {}
  while (srcStack.length) {
    for (const p in srcStack[0]) {
      if (srcStack[0][p].type === 'object') {
        srcStack.push(srcStack[0][p].properties)
      } else {
        const mapping = await findMapping(requestSchema, p, 0)
        if (mapping) {
          if (mapping.valueType === 'EXPR') {
            const expression = jsonata(mapping.value)
            mapping.value = await expression.evaluate(context)

            response = {
              ...response,
              [p]: mapping.value
            }
          } else {
            response = {
              ...response,
              [p]: mapping.value
            }
          }
        }
      }
    }
    srcStack.shift()
  }
  return response
}

const findUrlParamsAndBody = async (task, context) => {
  const response = {}
  let params
  let url = task.api.protocol + '://' + task.api.endpoint + task.api.path

  if (task.api.queryParams && Array.isArray(task.api.queryParams) && !isEmpty(task.api.queryParams)) {
    for (const param of task.api.queryParams) {
      params = param.parameterName + '=' + param.value + '&'
    }
    params = params.substring(0, params.lastIndexOf('&'))
  }
  if (params) {
    url = url + '?' + params
  }
  response.url = url
  if (task.api.requestSchema) {
    const reqBody = await findRequestBodyObj(task.api.requestSchema, context)
    if (reqBody) {
      response.reqBody = reqBody
    }
  }
  return response
}

const executePost = async (task, inputContext, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData, conn, authorization) => {
  logger.debug('Executing POST')
  const configResponse = await conn.BcaeAppConfig.findOne({
    attributes: ['appTenantId'],
    where: {
      status: constantCode.status.ACTIVE
    }
  })
  const dbTenantId = configResponse?.dataValues ? configResponse?.dataValues?.appTenantId : configResponse?.appTenantId

  const properties = await findUrlParamsAndBody(task, inputContext)
  let response
  try {
    response = await axios.post(properties.url, JSON.stringify(properties.reqBody),
      {
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': dbTenantId,
          authorization
        }
      })
  } catch (error) {
    logger.error(error)
  }
  if (response?.data) {
    await updateContextWhatsApp(response?.data, inputContext, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData, conn)
  }
}

const executePut = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, txnData, conn, authorization) => {
  logger.debug('Executing PUT')
  const configResponse = await conn.BcaeAppConfig.findOne({
    attributes: ['appTenantId'],
    where: {
      status: constantCode.status.ACTIVE
    }
  })
  console.log('configResponse------>', configResponse)
  const dbTenantId = configResponse?.dataValues ? configResponse?.dataValues?.appTenantId : configResponse?.appTenantId
  console.log('dbTenantId------->', dbTenantId)
  const properties = await findUrlParamsAndBody(task, inputContext)
  let response
  try {
    response = await axios.put(properties.url, {
      headers: { 'content-type': 'application/json', 'x-tenant-id': dbTenantId, authorization },
      body: JSON.stringify(properties.reqBody),
      retry: 0,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
  } catch (error) {
    logger.error(error)
  }

  if (response.body) {
    await updateContext(JSON.parse(response.body), inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
  }
}

const executeGet = async (task, inputContext, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData, conn, authorization) => {
  logger.debug('Executing GET')
  const configResponse = await conn.BcaeAppConfig.findOne({
    attributes: ['appTenantId'],
    where: {
      status: constantCode.status.ACTIVE
    }
  })
  const dbTenantId = configResponse?.dataValues ? configResponse?.dataValues?.appTenantId : configResponse?.appTenantId
  const properties = await findUrlParamsAndBody(task, inputContext)
  let response
  try {
    response = await axios.get(properties.url, {
      headers: { 'content-type': 'application/json', 'x-tenant-id': dbTenantId, authorization },
      retry: 0,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
  } catch (error) {
    logger.error(error)
  }
  if (response.data) {
    await updateContextWhatsApp(response?.data, inputContext, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData, conn)
  }
}

const executeDelete = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, txnData, conn, authorization) => {
  const configResponse = await conn.BcaeAppConfig.findOne({
    attributes: ['appTenantId'],
    where: {
      status: constantCode.status.ACTIVE
    }
  })
  const dbTenantId = configResponse?.dataValues ? configResponse?.dataValues?.appTenantId : configResponse?.appTenantId
  const properties = await findUrlParamsAndBody(task, inputContext)
  let response
  try {
    response = await axios.delete(properties.url, {
      headers: { 'content-type': 'application/json', 'x-tenant-id': dbTenantId, authorization },
      retry: 0,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
  } catch (error) {
    logger.error(error)
  }

  if (response.body) {
    await updateContext(JSON.parse(response.body), inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
  }
}

const updateContextWhatsApp = async (data, inputContext, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData, conn) => {
  try {
    if (nextActivityId) {
      inputContext.context[activityPrefix] = {
        ...inputContext.context[activityPrefix],
        [taskActivityPrefix]: taskActivityPrefix
      }
    } else {
      inputContext.context[activityPrefix] = activityPrefix
      inputContext = JSON.parse(JSON.stringify(inputContext))
      inputContext.context[activityPrefix] = {
        [taskActivityPrefix]: taskActivityPrefix
      }
    }
    inputContext.context[activityPrefix][taskActivityPrefix] = {
      response: {
        value: data
      }
    }
    // inputContext.context[activityPrefix][taskActivityPrefix] = data
    const wfData = {
      nextActivityId,
      updatedBy: systemUserId,
      wfContext: inputContext
    }
    await conn.WorkflowHdr.update(wfData, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
  } catch (error) {
    logger.error(error)
  }
}

const executeSendMessageTask = async (SendMessageTask, inputContext, t, activityPrefix, taskActivityPrefix, conn) => {
  return SendMessageTask
}

const executeCollectInputTask = async (collectInputTask, inputContext, t, activityPrefix, taskActivityPrefix, mobileNumber, msg, txnData, nextActivityId, conn) => {
  txnData.wfTxnStatus = 'DONE'
  const wfTxn = await conn.WorkflowTxn.create(txnData, { transaction: t }, { logging: true })
  if (wfTxn) {
    inputContext.wfHdrId = wfTxn.wfHdrId
    const data = {
      nextActivityId,
      wfContext: inputContext
    }
    await conn.WorkflowHdr.update(data, { where: { wfHdrId: wfTxn.wfHdrId }, transaction: t })
  }
  return collectInputTask
}
