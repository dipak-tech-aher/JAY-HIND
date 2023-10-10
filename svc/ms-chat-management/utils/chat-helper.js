import { config } from '@config/env.config'
import { logger } from '@utils'
import jsonata from 'jsonata'
import { constantCode } from '@utils/constant'
import { isEmpty } from 'lodash'
import { Op } from 'sequelize'

const Got = require('got');
const { getConnection } = require('@services/connection-service')
const { systemUserId } = config

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
        const mapping = findMapping(requestSchema, p, 0)
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
  // Finding query params
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
    const reqBody = await findRequestBodyObj(task.api.requestSchema, context);
    if (reqBody) {
      response.reqBody = reqBody
    }
  }
  return response
}

export const executeSendMessageTask = async (SendMessageTask) => {
  return SendMessageTask
}

export const executeCollectInputTask = async (collectInputTask, inputContext, t, msg, txnData, nextActivityId, conn) => {
  if (msg === '') {
    txnData.wfTxnStatus = constantCode.status.DONE
    const wfTxn = await conn.WorkflowTxn.create(txnData, { transaction: t }, { logging: true })
    if (wfTxn) {
      // updating the wfHdr table
      inputContext.wfHdrId = wfTxn.wfHdrId
      const data = {
        nextActivityId,
        wfContext: inputContext
      }
      await conn.WorkflowHdr.update(data, { where: { wfHdrId: wfTxn.wfHdrId }, transaction: t })
    }
    // await t.commit()
    return collectInputTask
  } else {
    txnData.wfTxnStatus = constantCode.status.DONE
    const wfTxn = await conn.WorkflowTxn.create(txnData, { transaction: t }, { logging: true })
    if (wfTxn) {
      // updating the wfHdr table
      inputContext.wfHdrId = wfTxn.wfHdrId
      const data = {
        nextActivityId,
        wfContext: inputContext
      }
      await conn.WorkflowHdr.update(data, { where: { wfHdrId: wfTxn.wfHdrId }, transaction: t })
    }
    return collectInputTask
  }
}

const executePost = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, tenantId, conn) => {
  logger.debug('Executing POST')
  const properties = await findUrlParamsAndBody(task, inputContext)
  console.log('properties--->', properties)
  const response = await Got.post({
    headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
    url: properties.url,
    body: JSON.stringify(properties.reqBody),
    retry: 0
  }, {
    https: {
      rejectUnauthorized: false
    }
  })
  if (response.body) {
    await updateContextWhatsApp(JSON.parse(response.body), inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
  }
}

const executePut = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, txnData, tenantId) => {
  logger.debug('Executing PUT')
  const properties = findUrlParamsAndBody(task, inputContext)

  const response = await Got.put({
    headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
    url: properties.url,
    body: JSON.stringify(properties.reqBody),
    retry: 0
  }, {
    https: {
      rejectUnauthorized: false
    }
  })
  if (response.body) {
    await updateContext(JSON.parse(response.body), inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask)

    // const validate = ajv.compile(task.api.responseSchema)
    // const valid = validate(response)
    // if (!valid) {
    //   logger.debug('Response structure is not matched', validate.errors)
    // } else {
    //   return true
    // }
  }
}

const executeGet = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, txnData, tenantId) => {
  logger.debug('Executing GET')
  const properties = findUrlParamsAndBody(task, inputContext)

  const response = await Got.get({
    headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
    url: properties.url,
    retry: 1
  })
  if (response.body) {
    await updateContext(JSON.parse(response.body), inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask)
    // const validate = ajv.compile(task.api.responseSchema)
    // const valid = validate(response)
    // if (!valid) {
    //   logger.debug('Response structure is not matched', validate.errors)
    // } else {
    //   return true
    // }
  }
}

const executeDelete = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, txnData, tenantId) => {
  logger.debug('Executing DELETE')
  const properties = findUrlParamsAndBody(task, inputContext)
  const response = await Got.delete({
    headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
    url: properties.url,
    retry: 0
  })
  if (response.body) {
    await updateContext(JSON.parse(response.body), inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask)
    // const validate = ajv.compile(task.api.responseSchema)
    // const valid = validate(response)
    // if (!valid) {
    //   logger.debug('Response structure is not matched', validate.errors)
    // } else {
    //   return true
    // }
  }
}

export const executeAPITask = async (APITask, context, t, activityPrefix, taskActivityPrefix, mobileNumber, msg, txnData, nextActivityId, tenantId, conn) => {
  logger.debug('Executing API Task')
  if (APITask.api.method === 'POST') {
    await executePost(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, tenantId, conn)
  } else if (APITask.api.method === 'PUT') {
    await executePut(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, tenantId, conn)
  } else if (APITask.api.method === 'GET') {
    // console.log('GET API')
    return await executeGet(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, tenantId, conn)
  } else if (APITask.api.method === 'DELETE') {
    await executeDelete(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, tenantId, conn)
  } else {
    logger.debug('No API Task found')
  }
  logger.debug('Successfully Executed API Task')
}

const updateContext = async (data, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask) => {
  const conn = await getConnection();
  if (hasMoreTask) {
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
  const wfData = {
    updatedBy: systemUserId,
    wfContext: inputContext
  }
  await conn.WorkflowHdr.update(wfData, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
  await t.commit()
}

const updateContextWhatsApp = async (data, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  if (hasMoreTask) {
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
    updatedBy: systemUserId,
    wfContext: inputContext
  }
  await conn.WorkflowHdr.update(wfData, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
  await t.commit()
}

export const continueWFExecution = async (wfJson, currentActivityId, inputContext, mobileNumber, msg, tenantId, conn) => {
  logger.debug('Continue chat workflow Execution');
  const t = await conn.sequelize.transaction();
  try {
    const process = wfJson?.definitions?.process
    const activities = process?.activities
    const transitions = process?.transitions
    const transition = transitions.find(e => e.from === currentActivityId)
    const nextActivityId = transition?.to
    const currentActivity = activities.find(e => e.activityId === currentActivityId)
    const hasWaitRecord = await findUserWaitRecordById(currentActivityId, inputContext.wfHdrId, conn)
    if (hasWaitRecord) {
      logger.debug('A - Some task are in wait state or not yet done, So can`t prcess End step now')
      return currentActivity.tasks[0].taskContextPrefix
    } else {
      // Finding tasks based on nextActivityId in the activities array
      const activityPrefix = currentActivity.activityContextPrefix
      if (currentActivity.type === 'END') {
        await conn.WorkflowTxn.destroy({
          where: {
            wfHdrId: inputContext.wfHdrId
          },
          transaction: t
        })
        const data = {
          nextActivityId: '',
          wfContext: {},
          wfStatus: 'CREATED'
        }
        await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
        await t.commit()
        await processEndStep(currentActivity.activityId, inputContext, conn) // update the status as closed
        return 'WORKFLOWEND'
      } else if (currentActivity.type === 'DECISION') {
        let decision = false
        let transitionId;
        for (const rule01 of currentActivity.condition) {
          if (rule01.ruleType == 'DEFAULT') {
            decision = true
            transitionId = rule01.transitionId
          }
          for (const rule02 of rule01.rules) {
            for (const rule03 of rule02.rules) {
              if (rule03.valueType == 'TEXT') {
                rule03.value = rule03.value
              }
              if (rule03.fieldType == 'TEXT') {
                rule03.field = rule03.field
              }

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
              if ((rule03.operator == '-' || rule03.operator == '=') && !decision) {
                if (typeof (rule03.field) === 'object') {
                  if (rule03.field == rule03.value && (rule03.field != undefined || rule03.value != undefined)) {
                    transitionId = rule01.transitionId
                    decision = true
                    break
                  }
                } else {
                  if (rule03.field == rule03.value && (rule03.field != undefined || rule03.value != undefined)) {
                    transitionId = rule01.transitionId
                    decision = true
                    break
                  }
                }
              }

              if (rule03.operator == '!=' && !decision) {
                if (rule03.field != rule03.value && (rule03.field != undefined || rule03.value != undefined)) {
                  transitionId = rule01.transitionId
                  decision = true
                  break
                }
              }
              if (rule03.operator == '>' && !decision) {
                if (rule03.field > rule03.value && (rule03.field != undefined || rule03.value != undefined)) {
                  transitionId = rule01.transitionId
                  decision = true
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
            break
          }
        }
        if (decision) {
          const transition = transitions.find(e => e.transitionId === transitionId)
          const nextActivityId = transition.to
          const txnData = {
            wfHdrId: inputContext.wfHdrId,
            activityId: currentActivity.activityId,
            txnContext: inputContext,
            wfTxnStatus: 'DONE',
            createdBy: systemUserId,
            updatedBy: systemUserId
          }
          const wfTxn = await conn.WorkflowTxn.create(txnData, { transaction: t }, { logging: true })
          if (wfTxn) {
            // updating the wfHdr table
            inputContext.wfHdrId = inputContext.wfHdrId
            const data = {
              nextActivityId,
              wfContext: inputContext
            }
            await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
          }
          await t.commit()
          return await continueWFExecution(wfJson, nextActivityId, inputContext, mobileNumber, msg, tenantId, conn)
        } else {
          await t.commit()
          return 'Please enter help to go main menu'
        }
      } else {
        let noTaskFound = false
        if (currentActivity?.tasks?.length > 0) {
          for (const task of currentActivity?.tasks) {
            // Finding any wait record in txn table and continueExecution
            const hasWaitRecord = await findUserWaitRecordById(currentActivityId, inputContext.wfHdrId, conn)
            if (hasWaitRecord) {
              logger.debug('B - Some task are in wait state or not yet done, So can`t prcess End step now')
              return currentActivity.tasks[0].taskContextPrefix
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
                const wfTxn = await conn.WorkflowTxn.create(txnData, { transaction: t }, { logging: true })
                // Finding taskContextPrefix and storing under current activity
                const taskActivityPrefix = task.taskContextPrefix
                if (task.type === 'SENDMESSAGE') {
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
                    inputContext.wfHdrId = inputContext.wfHdrId
                    const data = {
                      nextActivityId,
                      wfContext: inputContext
                    }
                    await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
                  }
                  const executeSendMessageTaskResult = await executeSendMessageTask(task, inputContext, t, activityPrefix, taskActivityPrefix)
                  await conn.WorkflowTxn.destroy({
                    where: {
                      wfHdrId: inputContext.wfHdrId
                    },
                    transaction: t
                  })
                  await t.commit()
                  return { executeSendMessageTaskResult, inputContext }
                } else if (task.type === 'COLLECTINPUT') {
                  const txnData = {
                    wfHdrId: inputContext.wfHdrId,
                    activityId: currentActivity.activityId,
                    taskId: task.taskId,
                    txnContext: inputContext,
                    wfTxnStatus: 'USER_WAIT',
                    createdBy: systemUserId,
                    updatedBy: systemUserId
                  }

                  const executeCollectInputTaskResult = await executeCollectInputTask(task, inputContext, t, msg, txnData, nextActivityId, conn)
                  await conn.WorkflowTxn.destroy({
                    where: {
                      wfHdrId: inputContext.wfHdrId
                    },
                    transaction: t
                  })
                  await t.commit()
                  return executeCollectInputTaskResult
                } else if (task.type === 'API') {
                  const txnData = {
                    wfHdrId: inputContext.wfHdrId,
                    activityId: currentActivity.activityId,
                    taskId: task.taskId,
                    txnContext: inputContext,
                    wfTxnStatus: 'SYS_WAIT',
                    createdBy: systemUserId,
                    updatedBy: systemUserId
                  }
                  return await executeAPITask(task, inputContext, t, activityPrefix, taskActivityPrefix, mobileNumber, msg, txnData, nextActivityId, tenantId, conn)
                } else if (task.type === 'DB') {
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
            return await continueWFExecution(wfJson, nextActivityId, inputContext, mobileNumber, msg, tenantId, conn)
          } else {
            logger.debug('No transition found')
          }
        }
      }
    }
  } catch (error) {
    logger.error(error, 'Error while continue workflow execution step')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

const findUserWaitRecordById = async (activityId, wfHdrId, conn) => {
  const hasWaitRecord = await conn.WorkflowTxn.findOne({
    where: {
      wfHdrId,
      activityId,
      [Op.or]: [{ wfTxnStatus: 'USER_WAIT' }, { wfTxnStatus: 'SYS_WAIT' }]
    }
  })
  return hasWaitRecord
}

export const processStartStep = async (wfHdr, wfJson, conn) => {
  logger.debug('Performing start step for new record')
  const t = await conn.sequelize.transaction()
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
          const hasStartRec = await conn.WorkflowTxn.findOne({ where: { wfHdrId: wfHdr.wfHdrId, activityId: startActivityId, wfTxnStatus: { [Op.ne]: constantCode.status.DONE } } })
          if (!hasStartRec) {
            inputContext = {
              context
            }
            // Inserting data into conn.WorkflowTxn table
            const wfTxnData = {
              wfHdrId: wfHdr.wfHdrId,
              activityId: startActivityId,
              taskId: null, // No task id for the start step
              wfTxnStatus: constantCode.status.DONE,
              txnContext: inputContext,
              createdBy: systemUserId,
              updatedBy: systemUserId
            }
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
            await t.commit();
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
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

const processEndStep = async (activityId, inputContext, conn) => {
  const t = await conn.sequelize.transaction()
  logger.debug('Processing End step')
  try {
    const hasRecord = await conn.WorkflowTxn.findOne({
      where: {
        wfHdrId: inputContext.wfHdrId,
        activityId,
        wfTxnStatus: { [Op.ne]: constantCode.status.DONE }
      }
    })
    if (!hasRecord) {
      const wfTxnData = {
        wfHdrId: inputContext.wfHdrId,
        activityId,
        taskId: null, // No task id for the start step
        wfTxnStatus: constantCode.status.DONE,
        txnContext: inputContext,
        createdBy: systemUserId,
        updatedBy: systemUserId
      }
      const wfTxn = await conn.WorkflowTxn.create(wfTxnData, { transaction: t })
      if (wfTxn) {
        // updating the wfHdr table  for end step
        const data = {
          nextActivityId: activityId,
          // wfContext: inputContext,
          wfStatus: constantCode.status.DONE,
          updatedBy: systemUserId
        }
        await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
      }
    } else {
      logger.debug('Some task are in wait state')
    }
    await t.commit()
    logger.debug('Successfully processed End step')
  } catch (error) {
    logger.error(error, 'Error while processing end step')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}