/* eslint-disable no-tabs */
import { logger, camelCaseConversion, constantCode, hasDuplicates, statusCodeConstants } from '@utils'
import { isEmpty } from 'lodash'
import { QueryTypes, Op } from 'sequelize'
import { config } from '@config/env.config'
import jsonata from 'jsonata'
import { formateSelectQuery, formateInsertQuery, formateUpdateQuery } from '@utils/query-builder'
import axios from 'axios'
const https = require('https')
const { systemUserId } = config

export const assignWFToEntity = async (entityId, entity, workflowId, commonAttrib, conn, t) => {
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
    }
  }
}

export const updateWFState = async (entityId, entity, data, userId, conn, t) => {
  logger.debug('Updating workflow state')
  const workflowTxn = await findRecentUserWaitRecord(entityId, entity, null, conn)
  if (!isEmpty(workflowTxn)) {
    let txnData
    if (data.status && !data.dept && !data.userId && !data.role) {
      txnData = {
        userStatus: data.status || null,
        updatedBy: userId
      }
    } else {
      txnData = {
        currEntity: data.dept || null,
        currRole: data.role || null,
        currUser: data.userId || null,
        userStatus: data.status || null,
        fromEntity: workflowTxn.currEntity || null,
        fromRole: workflowTxn.currRole || null,
        fromUser: workflowTxn.currUser || null,
        fromUserStatus: workflowTxn.userStatus || null,
        updatedBy: userId,
        wfTxnStatus: 'DONE'
      }
    }
    await conn.WorkflowTxn.update(txnData, { where: { wfTxnId: workflowTxn.wfTxnId }, transaction: t })
  }
  logger.debug('Successfully updated workflow state')
}

const findRecentUserWaitRecord = async (entityId, entity, wfHdrId, conn) => {
  let wfTxn = {}
  let workflowHdrData
  if (wfHdrId) {
    workflowHdrData = await conn.WorkflowHdr.findOne({ where: { wfHdrId } })
  } else {
    workflowHdrData = await conn.WorkflowHdr.findOne({ where: { entityId, entity } })
  }
  if (workflowHdrData) {
    const workflowTxns = await conn.WorkflowTxn.findAll({
      where: { wfHdrId: workflowHdrData.wfHdrId },
      order: [['wfTxnId', 'DESC']]
    })
    if (workflowTxns.length > 0) {
      if (workflowTxns[0].wfTxnStatus === 'USER_WAIT') {
        wfTxn = workflowTxns[0]
      }
    }
  }
  return wfTxn
}

export const startWorkFlowEngine = async (conn, t) => {
  logger.debug('Starting WorkFlow Engine')

  let workflowHrd = await conn.sequelize.query(`
  select * from workflow_hdr wh
  where wf_hdr_id not in ( select wf_hdr_id from workflow_txn wt
	  where wt.wf_txn_status in ('USER_WAIT', 'SYS_WAIT'))
	  and wf_status in ('CREATED', 'USER_WAIT', 'SYS_WAIT')
	  and entity not in ('ORDER')`, {
    type: QueryTypes.SELECT,
    raw: true
  })
  workflowHrd = camelCaseConversion(workflowHrd)
  if (Array.isArray(workflowHrd) && workflowHrd.length > 0) {
    for (const wfHdr of workflowHrd) {
      logger.debug('Processing Entity ID : ', wfHdr.entityId)
      let interactionStatus
      try {
        interactionStatus = await conn.Interaction.findOne({ where: { intxnId: wfHdr.entityId, currStatus: 'CLOSED' }, transaction: t })
      } catch (err) {
        interactionStatus = null
      }
      if (interactionStatus) {
        const wftxnData = {
          wfTxnStatus: 'DONE'
        }
        const wfStatus = {
          wfStatus: 'DONE'
        }
        await conn.WorkflowTxn.update(wftxnData, { where: { wfHdrId: wfHdr.wfHdrId, wfTxnStatus: { [Op.ne]: 'DONE' } }, transaction: t })
        await conn.WorkflowHdr.update(wfStatus, { where: { wfHdrId: wfHdr.wfHdrId }, transaction: t })
        // }
        continue
      }
      const wfDfn = await conn.Workflow.findOne({ where: { workflowId: wfHdr.wfDefnId } })
      if (wfDfn.wfDefinition && wfDfn.wfDefinition.definitions && wfDfn.wfDefinition.definitions.process) {
        if (wfHdr.wfStatus === 'CREATED') {
          if (!wfHdr.nextActivityId) {
            await processStartStep(wfHdr, wfDfn.wfDefinition, conn, t)
          } else if (wfHdr.nextActivityId) {
            await continueWFExecution(wfDfn.wfDefinition, wfHdr.nextActivityId, wfHdr.wfContext, conn, t)
          }
        }
      } else {
        logger.debug('Workflow JSON not found in workflow definition table')
      }
    }
  } else {
    logger.debug('No records to execute the workflow hdr')
  }
}

export const startWorkFlowEngineManual = async (entityId, conn, t) => {
  try {
    let response

    logger.debug(`Order WorkFlow Engine Run - ${entityId}`)
    const wfHdr = await conn.WorkflowHdr.findOne({
      where: {
        [Op.or]: [{ wfStatus: 'CREATED', entity: 'ORDER' }],
        entityId
      },
      transaction: t
    })

    if (isEmpty(wfHdr)) {
      return {
        status: 'ERROR',
        message: 'There is no workflow details available for the Order'
      }
    }

    const wfDfn = await conn.Workflow.findOne({ where: { workflowId: wfHdr.wfDefnId } })
    if (!wfDfn?.wfDefinition || !wfDfn?.wfDefinition?.definitions || !wfDfn?.wfDefinition?.definitions?.process) {
      return {
        status: 'ERROR',
        message: `Workflow JSON not found in workflow definition available for Workflow Template  - ${wfHdr.wfDefnId}`
      }
    }
    if (!wfHdr.nextActivityId) {
      response = await processStartStep(wfHdr, wfDfn.wfDefinition, conn, t)
    } else if (wfHdr.nextActivityId) {
      response = await continueWFExecution(wfDfn.wfDefinition, wfHdr.nextActivityId, wfHdr.wfContext, conn, t)
    }

    // console.log('response', response)
    const hasWaitRecord = await conn.WorkflowTxn.findOne({
      where: {
        wfHdrId: wfHdr.wfHdrId,
        [Op.or]: [{ wfTxnStatus: 'USER_WAIT' }, { wfTxnStatus: 'SYS_WAIT' }]
      },
      transaction: t
    })
    if (!hasWaitRecord && response?.status === 'SUCCESS') {
      await startWorkFlowEngineManual(entityId, conn, t)
    }
    return response
  } catch (error) {
    logger.error(error)
    return {
      status: 'ERROR',
      message: 'Error while processing start step'
    }
  }
}

export const processStartStep = async (wfHdr, wfJson, conn, t) => {
  logger.debug('Performing start step for new record')
  // const t = await conn.sequelize.transaction()
  try {
    const process = wfJson?.definitions?.process
    if (!process || !process?.activities || !process?.transitions) {
      return {
        status: 'ERROR',
        message: 'No process found in the wfDefinition'
      }
    }

    // if (!process?.activities || !process?.transitions) {
    //   return {
    //     status: 'ERROR',
    //     message: 'No activities/transitions found in the wfDefinition'
    //   }
    // }

    const activities = process?.activities
    const transitions = process?.transitions
    const startActivity = activities && activities?.find(e => e.type === 'START')

    if (!startActivity || !startActivity?.activityId || !startActivity?.activityContextPrefix) {
      return {
        status: 'ERROR',
        message: 'No start activity found'
      }
    }

    const startActivityId = startActivity?.activityId
    const startActivityPrefix = startActivity?.activityContextPrefix
    const transition = transitions?.find(e => e.from === startActivityId)

    if (!transition || !transition?.to) {
      return {
        status: 'ERROR',
        message: 'No transitions found for start activity'
      }
    }

    const nextActivityId = transition.to
    const context = {
      [startActivityPrefix]: startActivityPrefix
    }

    const hasStartRecord = await conn.WorkflowTxn.findOne({
      where: { wfHdrId: wfHdr.wfHdrId, activityId: startActivityId },
      transaction: t
    })
    if (hasStartRecord) {
      return {
        status: 'ERROR',
        message: 'Start activitiy is already Exists'
      }
    }

    const wfTxnData = {
      wfHdrId: wfHdr.wfHdrId,
      activityId: startActivityId,
      taskId: null, // No task id for the start step
      wfTxnStatus: 'DONE',
      txnContext: {
        context,
        entity: wfHdr.entityId,
        entityType: wfHdr.entityType
      },
      createdBy: systemUserId,
      updatedBy: systemUserId
    }
    const wfTxn = await conn.WorkflowTxn.create(wfTxnData, { transaction: t })
    if (wfTxn) {
      const inputContext = {
        entity: wfHdr.entityId,
        entityType: wfHdr.entityType,
        wfHdrId: wfHdr.wfHdrId,
        context: {
          entity: wfHdr.entityId,
          entityType: wfHdr.entityType
        }
      }

      const data = {
        nextActivityId,
        wfContext: inputContext
      }
      const WorkflowHdr = await conn.WorkflowHdr.update(data, { where: { wfHdrId: wfHdr.wfHdrId }, transaction: t })
      if (WorkflowHdr) {
        return {
          status: 'SUCCESS',
          message: 'Start step perform completed'
        }
      }
    }

    return {
      status: 'ERROR',
      message: 'Error while perform start Step Process'
    }
  } catch (error) {
    logger.error(error, 'Error while processing start step')
  }
}

const continueWFExecution = async (wfJson, currentActivityId, inputContext, conn, t) => {
  logger.debug('starting Continue workflow Execution')
  try {
    const hasWaitRecord = await findUserWaitRecordById(currentActivityId, inputContext.wfHdrId, conn, t)
    if (hasWaitRecord) {
      return {
        status: 'ERROR',
        message: 'Some task are in wait state or not yet done, So can`t process further step now'
      }
    }
    const activities = wfJson?.definitions?.process?.activities
    const transitions = wfJson?.definitions?.process?.transitions

    if (!activities || !transitions) {
      return {
        status: 'ERROR',
        message: 'There were no activities or transitions found for processing the next steps.'
      }
    }

    const currentActivity = activities?.find(e => e.activityId === currentActivityId)
    const activityPrefix = currentActivity?.activityContextPrefix

    if (!currentActivity && isEmpty(currentActivity)) {
      logger.debug(`There were no task found for activity ${currentActivityId}`)
      return {
        status: 'ERROR',
        message: 'There were no task found for activity'
      }
    }
    // console.log('currentActivity.type', currentActivity.type)
    if (currentActivity.type === 'END') {
      await processEndStep(currentActivity.activityId, inputContext, conn, t)
    } else if (currentActivity.type === 'DECISION') {
      let decision = false
      let transitionId
      for (const rule01 of currentActivity?.condition) {
        if (rule01.ruleType === 'DEFAULT') {
          decision = true
          transitionId = rule01.transitionId
        }
        for (const rule02 of rule01.rules) {
          for (const rule03 of rule02.rules) {

            if (rule03.rules && typeof (rule03) === 'object') {
              const resultArray = []
              for (const rule04 of rule03.rules) {
                let decisionRules = false
                if (rule04.valueType === 'EXPR') {
                  const expression = jsonata(rule04.value)
                  rule04.value = await expression.evaluate(inputContext)
                }
                if (rule04.fieldType === 'EXPR') {
                  const expression = jsonata(rule04.field)
                  // console.log('rule04.field', rule04.field)

                  // console.log('inputContext', JSON.stringify(inputContext))
                  rule04.field = await expression.evaluate(inputContext)

                  if (rule04.field) {
                    if (String(rule04.field).toUpperCase() === 'HELP') {
                      await conn.WorkflowTxn.destroy({
                        where: {
                          wfHdrId: inputContext.wfHdrId
                        },
                        transaction: t
                      })
                    }
                  }
                  if ((rule04.operator === '-' || rule04.operator === '=') && !decisionRules) {
                    // console.log('rule04 -------->', rule04)
                    // console.log('rule04 -------->', JSON.stringify(rule04))

                    if (typeof (rule04.field) === 'object') {
                      if (rule04.field[0] === rule04.value[0] && (rule04.field[0] !== undefined || rule04.value[0] !== undefined)) {
                        transitionId = rule01.transitionId
                        decisionRules = true
                      }
                    } else {
                      if (String(rule04?.field) === String(rule04?.value) && (rule04.field !== undefined || rule04.value !== undefined ||
                        rule04.field !== null || rule04.value !== null)) {
                        transitionId = rule01.transitionId
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
                rule03.field = expression.evaluate(inputContext)
                if (rule03.field) {
                  if (rule03.field.toString().toUpperCase() === 'HELP') {
                    await conn.WorkflowTxn.destroy({
                      where: {
                        wfHdrId: inputContext.wfHdrId
                      }
                    })
                  }
                }
              }
              if ((rule03.operator === '-' || rule03.operator === '=') && !decision) {
                if (typeof (rule03.field) === 'object') {
                  if (rule03.field[0] === rule03.value[0] && (rule03.field[0] !== undefined || rule03.value[0] !== undefined)) {
                    transitionId = rule01.transitionId
                    decision = true
                    break
                  }
                } else {
                  if (rule03.field === rule03.value && (rule03.field !== undefined || rule03.value !== undefined)) {
                    transitionId = rule01.transitionId
                    decision = true
                    break
                  }
                }
              }
              if (rule03.operator === '!=' && !decision) {
                if (rule03.field !== rule03.value && (rule03.field !== undefined || rule03.value !== undefined)) {
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
      // console.log('decision------------->', decision)
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
          // inputContext.wfHdrId = inputContext.wfHdrId
          const data = {
            nextActivityId,
            wfContext: inputContext
          }
          await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
        }
        await continueWFExecution(wfJson, nextActivityId, inputContext, conn, t)
      }
    } else {
      let noTaskFound = false
      for (const task of currentActivity.tasks) {
        let hasMoreTask = false
        if (currentActivity.tasks.length > 1) {
          hasMoreTask = true
        }

        const hasWaitRecord = await findUserWaitRecordById(currentActivityId, inputContext.wfHdrId, conn, t)
        if (hasWaitRecord) {
          noTaskFound = false
          return {
            status: 'ERROR',
            message: 'Some task are in wait state or not yet done, So can`t process End step now'
          }
        } else {
          let payload = { skip: true }
          let hasTask = await conn.WorkflowTxn.findOne({
            where: { wfHdrId: inputContext.wfHdrId, activityId: currentActivityId, taskId: task.taskId.toString() },
            order: [['createdAt', 'DESC']],
            transaction: t
          })
          const hasTaskCopy = hasTask
          if (hasTask?.dataValues?.payload?.skip === false && hasTask?.dataValues.wfTxnStatus === 'DONE') {
            hasTask = false
          } else if (hasTask?.dataValues?.payload?.skip === true && hasTask?.dataValues.wfTxnStatus === 'DONE') {
            hasTask = true
          }

          if (!hasTask && task.type === 'DB' /* && task.taskId > 1 */) {
            noTaskFound = true
            payload = { skip: false }
          }

          if (!hasTask) {
            const txnData = {
              wfHdrId: inputContext.wfHdrId,
              activityId: currentActivity.activityId,
              taskId: task.taskId,
              txnContext: inputContext,
              wfTxnStatus: 'DONE',
              payload,
              createdBy: systemUserId,
              updatedBy: systemUserId
            }
            const wfTxn = await conn.WorkflowTxn.create(txnData, { transaction: t }, { logging: true })

            const taskActivityPrefix = task.taskContextPrefix
            if (task.type === 'DB') {
              await executeDatabaseTask(task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)

              const updatedWfHdr = await conn.WorkflowHdr.findOne({
                where: {
                  [Op.or]: [{ wfStatus: 'CREATED', entity: 'ORDER' }],
                  wfHdrId: inputContext.wfHdrId
                },
                transaction: t
              })

              inputContext = updatedWfHdr?.wfContext
              // noTaskFound = true
            } else if (task.type === 'MANUAL') {
              await executeManualTask(task, inputContext, wfTxn, t, activityPrefix, taskActivityPrefix, conn)
              noTaskFound = false
              break
            } else if (task.type === 'API') {
              await executeAPITask(task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
            }
          } else {
            const wfTxnData = {
              payload: { skip: false }
            }
            await conn.WorkflowTxn.update(wfTxnData, {
              where: {
                wfTxnId: hasTaskCopy.dataValues.wfTxnId,
                wfHdrId: inputContext.wfHdrId,
                activityId: currentActivityId,
                taskId: task.taskId.toString()
              },
              transaction: t
            })
            logger.debug('No tasks found')
            noTaskFound = true
          }
        }
      }
      // console.log('noTaskFound', noTaskFound)
      if (noTaskFound) {
        const transition = transitions.find(e => e.from === currentActivityId)
        if (transition) {
          const nextActivityId = transition.to
          await continueWFExecution(wfJson, nextActivityId, inputContext, conn, t)
        } else {
          return {
            status: 'ERROR',
            message: `There is no transition found for this activity ${currentActivityId}`
          }
        }
      }
    }
  } catch (error) {
    logger.error(error, 'Error while continue workflow execution step')
  }
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
      let query, params, waitClause
      await formateSelectQuery(task, inputContext).then((e) => {
        // console.log(e)
        query = e.query
        params = e?.params
        waitClause = e?.waitClause
      })
      logger.debug('Generated Select Query :', query)

      if (waitClause) { /* empty */ }

      // Fetching the results based generated query
      const response = await conn.sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT,
        logging: true,
        transaction: t
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

const updateContext = async (data, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, tables, conn) => {
  try {
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
    inputContext.context[activityPrefix][taskActivityPrefix] = data
    const wfData = {
      updatedBy: systemUserId,
      wfContext: inputContext
    }
    await conn.WorkflowHdr.update(wfData, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
  } catch (error) {
    logger.error(error)
  }
}

const executeManualTask = async (manualTask, inputContext, wfTxn, t, activityPrefix, taskActivityPrefix, conn) => {
  try {
    logger.debug('Execute Manual Task', manualTask.taskName)
    let wfTxnData
    let hasMoreManualTask = false

    if (Array.isArray(manualTask.assignments) && manualTask.assignments.length > 0) {
      for (const assignment of manualTask.assignments) {
        // Evaluate condition
        let condition = false
        const noOfItems = manualTask.assignments.length
        if (noOfItems === 1) {
          condition = true
        } else if (noOfItems > 1) {
          const rules = assignment.rules[0].rules
          for (const r of rules) {
            if (r.fieldType === 'EXPR') {
              const expression = jsonata(r.field)
              const expValue = expression.evaluate(inputContext)
              if (expValue === r.value) {
                condition = true
                hasMoreManualTask = true
              }
            }
          }
        }

        if (condition) {
          if (assignment.assignmentType === 'BYHIERARCHY') {
            logger.debug('Assignment to Dept Roles Found')
            const obj = assignment.assignedToDeptRoles[0]
            wfTxnData = {
              currEntity: obj.unitId,
              currRole: obj.roleId,
              userStatus: obj.status[0],
              wfTxnStatus: 'USER_WAIT'
            }
          } else if (assignment.assignmentType === 'BYTASK') {
            const activityId = assignment.assignByTask.activityId
            const taskId = assignment.assignByTask.taskId.toString()
            const hasRecord = await conn.WorkflowTxn.findOne({
              where: { wfHdrId: inputContext.wfHdrId, activityId, taskId },
              transaction: t
            })
            if (hasRecord) {
              wfTxnData = {
                currEntity: hasRecord.currEntity,
                currRole: hasRecord.currRole,
                userStatus: hasRecord.userStatus,
                currUser: hasRecord.currUser,
                wfTxnStatus: 'USER_WAIT'
              }
            }
          }
          break
        }
      }
    }
    if (wfTxnData) {
      if (hasMoreManualTask) {
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

      inputContext.context[activityPrefix][taskActivityPrefix] = wfTxnData
      const data = {
        updatedBy: systemUserId,
        wfContext: inputContext
      }
      await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })

      wfTxnData.txnContext = JSON.parse(JSON.stringify(inputContext))
      await conn.WorkflowTxn.update(wfTxnData, { where: { wfTxnId: wfTxn.wfTxnId }, transaction: t })
    }
    logger.debug('Successfully Executed Manual Task')
  } catch (error) {
    logger.error(error)
  }
}

const executeAPITask = async (APITask, context, t, activityPrefix, taskActivityPrefix, hasMoreTask) => {
  logger.debug('Executing API Task')
  if (APITask.api.method === 'POST') {
    await executePost(APITask, context, t, activityPrefix, taskActivityPrefix, hasMoreTask)
  } else if (APITask.api.method === 'PUT') {
    await executePut(APITask, context, t, activityPrefix, taskActivityPrefix, hasMoreTask)
  } else if (APITask.api.method === 'GET') {
    await executeGet(APITask, context, t, activityPrefix, taskActivityPrefix, hasMoreTask)
  } else if (APITask.api.method === 'DELETE') {
    await executeDelete(APITask, context, t, activityPrefix, taskActivityPrefix, hasMoreTask)
  } else {
    logger.debug('No API Task found')
  }
  logger.debug('Successfully Executed API Task')
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

const findRequestBodyObj = (requestSchema, context) => {
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
            mapping.value = expression.evaluate(context)

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

const findUrlParamsAndBody = (task, context) => {
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
    const reqBody = findRequestBodyObj(task.api.requestSchema, context)
    if (reqBody) {
      response.reqBody = reqBody
    }
  }
  return response
}

const executePost = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  logger.debug('Executing POST');
  const configResponse = await conn.BcaeAppConfig.findOne({
    attributes: ['appTenantId'],
    where: {
      status: defaultStatus.ACTIVE,
    },
  });
  const tenantId = configResponse?.dataValues ? configResponse?.dataValues?.tenantId : configResponse?.tenantId
  const properties = findUrlParamsAndBody(task, inputContext)
  let response
  try {
    response = await axios.post(properties.url, {
      headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
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
    await updateContextWhatsApp(JSON.parse(response.body), inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
  }
}

const executePut = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  logger.debug('Executing PUT')
  const properties = findUrlParamsAndBody(task, inputContext)
  let response
  try {
    response = await axios.put(properties.url, {
      headers: { 'content-type': 'application/json', 'x-tenant-id': 'a89d6593-3aa8-437b-9629-9fcbaa201da6' },
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

const executeGet = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  logger.debug('Executing GET')
  const properties = findUrlParamsAndBody(task, inputContext)

  let response
  try {
    response = await axios.get(properties.url, {
      headers: { 'content-type': 'application/json', 'x-tenant-id': 'a89d6593-3aa8-437b-9629-9fcbaa201da6' },
      retry: 0,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
  } catch (error) {
    logger.error(error)
  }
  if (response.data) {
    await updateContext(response?.data, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, null, conn)
  }
}

const executeDelete = async (task, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  const properties = findUrlParamsAndBody(task, inputContext)
  let response
  try {
    response = await axios.delete(properties.url, {
      headers: { 'content-type': 'application/json' },
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

const updateContextWhatsApp = async (data, inputContext, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  try {
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
  } catch (error) {
    logger.error(error)
  }
}

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
      wfStatus: constantCode.status.CREATED
    }
  })

  if (!workflowHdr) {
    return {
      status: 'ERROR',
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
      status: 'ERROR',
      message: 'Workflow transaction details not Found'
    }
  }

  if (workflowTxns[0].wfTxnStatus !== constantCode.status.USER_WAIT) {
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

  const activities = workflowDfn?.wfDefinition?.definitions?.process?.activities
  if (!activities) {
    return {
      status: 'ERROR',
      message: 'There is no Workflow activities to perform the action'
    }
  }

  const obj = activities.find(e => e?.type === constantCode.common.TASK && workflowTxns.length > 0 && e?.activityId === workflowTxns[0]?.activityId)
  if (!obj || !obj?.tasks) {
    return {
      status: 'ERROR',
      message: 'There is no task is assigned in Workflow to perform the action'
    }
  }
  const manualTask = obj.tasks.find(e => (e?.type === constantCode.common.MANUAL && workflowTxns.length > 0 && (e.taskId + '') === workflowTxns[0]?.taskId))
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
    attributes: ['code', 'description'],
    where: {
      status: constantCode.status.ACTIVE,
      codeType: 'INTERACTION_STATUS'
    },
    order: [
      ['code', 'ASC']
    ]
  })

  const beTasks = await conn.Tasks.findAll({
    where: {
      status: constantCode.status.ACTIVE
    }
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
          for (const t1 of t.task) {
            for (const t2 of beTasks) {
              if (t1 === t2.taskId) {
                entry.task.push({
                  taskId: t2.taskId,
                  taskName: t2.taskName,
                  taskNo: t2.taskNo,
                  taskOptions: t2.taskOptions
                })
                break
              }
            }
          }
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

export const getOrderWF = async (entityId, entity, conn) => {
  logger.debug('Fetching workflow target Deparments and Roles')
  const workflowHdr = await conn.WorkflowHdr.findOne({
    where: {
      entityId,
      entity
    }
  })

  logger.debug('Finding target department and roles')
  if (workflowHdr) {
    const workflowDfn = await conn.WorkflowDefinition.findOne({
      where: {
        workflowId: workflowHdr.wfDefnId
      }
    })

    const transitions = workflowDfn?.wfDefinition?.definitions?.process?.transitions

    const activities = workflowDfn?.wfDefinition?.definitions?.process?.activities

    const obj = []
    transitions && transitions.forEach(t => {
      obj.push(activities.find(e => e?.type === constantCode.common.TASK && e?.activityId === t.to))
    })
    // console.log('Obj==>', obj)
    const manualTask = []
    for (const o of obj) {
      if (o && o.tasks) {
        for (const e of o.tasks) {
          if ((e?.type === constantCode.common.MANUAL)) {
            manualTask.push({
              ...e,
              activityId: o.activityId
            })
          }
        }
      }
    }

    //     const fromToActivityMap = new Map();

    //     transitions.forEach(t => {
    //       const fromActivity = activities.find(a => a.activityId === t.from);
    //       const toActivity = activities.find(a => a.activityId === t.to);

    //       console.log('fromActivity ', fromActivity)
    //       console.log('toActivity ', toActivity)
    //       if (fromActivity && toActivity) {
    //         fromToActivityMap.set(t.transitionId, {
    //           fromActivityId: fromActivity.activityId,
    //           toActivityId: toActivity.activityId,
    //         });
    //       }
    //     });

    //     const manualTasks = [];

    //     function findManualTasks(activity, transitionId) {
    //       if (activity.type === "TASK" && activity.tasks && !activity.tasks.some(task => task.type === "DB")) {
    //         manualTasks.push({
    //           ...activity.tasks[0],
    //           activityId: activity.activityId,
    //           fromActivityId: fromToActivityMap.get(transitionId)?.fromActivityId || null,
    //           transitionId: transitionId,
    //         });
    //       }

    //       if (activity.transitions) {
    //         activity.transitions.forEach(t => {
    //           const toActivity = activities.find(e => e?.activityId === t.to);
    //           if (toActivity) {
    //             findManualTasks(toActivity, t.transitionId);
    //           }
    //         });
    //       }
    //     }

    //     findManualTasks(process, null);
    //     console.log('manualTasks==>', manualTasks);
    //     console.log('Obj==>', obj);

    //     const manualTask = [];
    //     for (const o of obj) {
    //       if (o && o.activityId) {
    //         const activity = activities.find(e => e.activityId === o.activityId);
    //         if (activity && activity.tasks) {
    //           for (const e of activity.tasks) {
    //             if (e?.type === constantCode.common.MANUAL) {
    //               manualTask.push({
    //                 ...e,
    //                 activityId: o.activityId,
    //                 fromActivityId: o.fromActivityId,
    //                 transitionId: o.transitionId,
    //               });
    //             }
    //           }
    //         }
    //       }
    //     }


    // console.log('manualTask==>', manualTask);


    // obj && obj.forEach(o => { manualTask.push(o && o.tasks.find(e => (e?.type === constantCode.common.MANUAL))) })

    // console.log('manualTask====>', JSON.stringify(manualTask))

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
        codeType: ['INTERACTION_STATUS', 'ORDER_STATUS']
      },
      order: [
        ['code', 'ASC']
      ]
    })

    const beTasks = await conn.Tasks.findAll({
      where: {
        status: constantCode.status.ACTIVE
      }
    })

    const entities = []
    for (const mtask of manualTask) {
      if (mtask) {
        // console.log(mtask.assignments.length)
        for (const asmt of mtask.assignments) {
          const mainArr = []; let mainObj
          const entry = {
            roles: [],
            entity: [],
            status: [],
            task: []
          }
          if (Array.isArray(asmt?.targetDeptRoles) && Array.isArray(asmt?.assignedToDeptRoles) && asmt?.targetDeptRoles && asmt?.targetDeptRoles?.length > 0) {
            for (const from of asmt?.assignedToDeptRoles) {
              let fromObj
              let toObj
              const toArr = []; const childArr = []
              // roleArr=[], entityArr=[], statusArr=[]
              // console.log('from=========>',from.roleId, '&&' ,from.unitId ,'&&' ,from.status)
              if (from.roleId && from.unitId && from.status && from.status.length > 0) {
                for (const r of rolesOutput) {
                  if (from.roleId === r.roleId) {
                    fromObj = {
                      role: r.roleDesc
                    }
                    // console.log('fromObj role=====================================', fromObj)
                  }

                  asmt.targetDeptRoles.forEach(to => {
                    // console.log('to============>',to.roleId, '&&' ,to.unitId ,'&&' ,to.status)
                    for (const r2 of rolesOutput) {
                      if (to.roleId === r2.roleId) {
                        toObj = {
                          ...toObj,
                          role: r2.roleDesc
                        }

                        for (const u of buOutput) {
                          if (to.unitId === u.unitId) {
                            toObj = {
                              ...toObj,
                              entity: u.unitDesc
                            }

                            if (to.status && to.status.length > 0) {
                              for (const s1 of to.status) {
                                for (const s2 of beOutput) {
                                  if (s1 === s2.code) {
                                    // console.log('to status===============', s2.description)
                                    toObj = {
                                      ...toObj,
                                      status: s2.description
                                    }
                                    // console.log('toObjtoObjtoObjtoObjtoObjtoObj==', toObj)
                                    if (to.task && to.task.length > 0) {
                                      for (const t1 of to.task) {
                                        for (const t2 of beTasks) {
                                          if (t1 === t2.taskId) {
                                            toObj = {
                                              ...toObj,
                                              taskName: t2.taskName,
                                              provisioning: t2.taskOptions?.provisioning
                                            }
                                            break
                                          }
                                        }
                                      }
                                    }
                                    toObj.activityId = mtask.activityId
                                    childArr.push(toObj)
                                    if (!hasDuplicates(childArr)) {
                                      // console.log('toObjtoObjtoObjtoObjtoObjtoObj==', toObj)
                                      toArr.push(toObj)
                                    }
                                  }
                                }
                              }
                            }

                          }
                        }
                      }
                    }
                  })
                }
                for (const u of buOutput) {
                  if (from.unitId === u.unitId) {
                    fromObj = {
                      ...fromObj,
                      entity: u.unitDesc
                    }
                  }
                }

                for (const s1 of from.status) {
                  for (const s2 of beOutput) {
                    if (s1 === s2.code) {
                      fromObj = {
                        ...fromObj,
                        status: s2.description
                      }
                      break
                    }
                  }
                }
              }

              if (from.task && from.task.length > 0) {
                for (const t1 of from.task) {
                  for (const t2 of beTasks) {
                    if (t1 === t2.taskId) {
                      fromObj = {
                        ...fromObj,
                        taskName: t2.taskName,
                        provisioning: t2.taskOptions?.provisioning
                      }
                      break
                    }
                  }
                }
              }
              // toArr.push(toObj)
              fromObj.activityId = mtask.activityId
              fromObj.children = toArr
              mainArr.push(fromObj)
            }

            // for (const to of asmt.targetDeptRoles) {
            //  // roleArr=[], entityArr=[], statusArr=[]
            //  let obj
            //     if (to.roleId) {
            //       for (const r of rolesOutput) {
            //         if (to.roleId === r.roleId ) {
            //             obj={
            //               toRoleId: r.roleId,
            //               toRoleDesc: r.roleDesc
            //             }

            //             break
            //           }
            //       }
            //     }
            //     if (to.unitId) {
            //       for (const u of buOutput) {
            //         if (to.unitId === u.unitId) {
            //           obj = {
            //             ...obj,
            //             toUnitId: u.unitId,
            //             toUnitDesc: u.unitDesc
            //           }
            //           break
            //         }
            //       }
            //     }
            //     if (to.status && to.status.length > 0) {
            //       for (const s1 of to.status) {
            //         for (const s2 of beOutput) {
            //           if (s1 === s2.code) {
            //             obj = {
            //               ...obj,
            //               toStatusCode: s2.code,
            //               toStatusDescription: s2.description
            //             }
            //             break
            //           }
            //         }
            //       }
            //     }
            //     if (to.task && to.task.length > 0) {
            //       for (const t1 of to.task) {
            //         for (const t2 of beTasks) {
            //           if (t1 === t2.taskId) {
            //             obj = {
            //               ...obj,
            //               toTaskId: t2.taskId,
            //               toTaskName: t2.taskName,
            //               toTaskNo: t2.taskNo,
            //               toTaskOptions: t2.taskOptions
            //             }
            //             break
            //           }
            //         }
            //       }
            //   }
            //   roleArr.push(obj)
            // }

            // entry.roles.push(...roleArr)
            // entry.entity.push(...entityArr)
            // entry.status.push(...statusArr)
            // entry.task.push(...taskArr)

            entities.push(mainArr)
          }
        }
      }
    }

    // console.log('entities====>', entities)
    const data = {
      entities
    }

    return {
      status: 'SUCCESS',
      message: 'Workflow details fetched Successfully',
      data
    }
  }
  return {
    status: statusCodeConstants.SUCCESS,
    message: 'No records found',
    data: {}
  }
}

export const getWFTask = async (entityId, entity, conn, t) => {
  logger.debug('Fetching workflow target Task')
  const workflowHdr = await conn.WorkflowHdr.findOne({
    where: {
      entityId,
      entity,
      wfStatus: constantCode.status.CREATED
    },
    transaction: t
  })

  if (!workflowHdr) {
    return {
      status: 'ERROR',
      message: 'Workflow details not Found'
    }
  }

  const workflowTxns = await conn.WorkflowTxn.findAll({
    where: {
      wfHdrId: workflowHdr.wfHdrId
    },
    order: [['wfTxnId', 'DESC']],
    transaction: t
  })

  if (workflowTxns.length === 0) {
    return {
      status: 'ERROR',
      message: 'Workflow transaction details not Found'
    }
  }

  if (workflowTxns[0].wfTxnStatus !== constantCode.status.USER_WAIT) {
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
    },
    transaction: t
  })

  if (!workflowDfn || !workflowDfn?.wfDefinition || !workflowDfn?.wfDefinition?.definitions ||
    !workflowDfn?.wfDefinition?.definitions?.process) {
    return {
      status: 'ERROR',
      message: 'There is no workflow process to perform the action.'
    }
  }

  const activities = workflowDfn?.wfDefinition?.definitions?.process?.activities
  if (!activities) {
    return {
      status: 'ERROR',
      message: 'There is no Workflow activities to perform the action'
    }
  }

  const obj = activities.find(e => e?.type === constantCode.common.TASK && workflowTxns.length > 0 && e?.activityId === workflowTxns[0]?.activityId)
  if (!obj || !obj?.tasks) {
    return {
      status: 'ERROR',
      message: 'There is no task is assigned in Workflow to perform the action'
    }
  }
  const manualTask = obj.tasks.find(e => (e?.type === constantCode.common.MANUAL && workflowTxns.length > 0 && (e.taskId + '') === workflowTxns[0]?.taskId))
  if (!manualTask || !manualTask?.assignments) {
    return {
      status: 'ERROR',
      message: 'There is no manual task is assigned in Workflow to perform the action'
    }
  }

  const entities = []
  for (const asmt of manualTask.assignments) {
    if (asmt?.targetDeptRoles && asmt.targetDeptRoles.length > 0) {
      for (const t of asmt.targetDeptRoles) {
        const entry = {
          task: []
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
    status: 'SUCCESS',
    message: 'Workflow details fetched Successfully',
    data
  }
}
