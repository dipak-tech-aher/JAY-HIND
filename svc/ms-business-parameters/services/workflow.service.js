/* eslint-disable no-tabs */
import { logger, camelCaseConversion, entityCategory } from '@utils'
import { isEmpty } from 'lodash'
import { QueryTypes, Op } from 'sequelize'
import { config } from '@config/env.config'
import jsonata from 'jsonata'
import { formateSelectQuery, formateInsertQuery, formateUpdateQuery } from '@utils/query-builder'
import axios from 'axios'
const https = require('https')
const { systemUserId } = config

export const assignWFToEntity = async (entityId, entity, workflowId, commonAttrib, conn) => {
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
    console.log(error)
  } finally {
    if (t && !t.finished) {
      // console.log('here in rollback..........')
      await t.rollback()
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
	  and entity not in ('knowledgeBase')`, {
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
            await processStartStep(wfHdr, wfDfn.wfDefinition, {}, conn, t)
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

export const startWorkFlowEngineManual = async (entityId, options, conn, t) => {
  try {
    let response

    logger.debug(`Order WorkFlow Engine Run - ${entityId}`)
    const wfHdr = await conn.WorkflowHdr.findOne({
      where: {
        [Op.or]: [{ wfStatus: 'CREATED', entity: entityCategory.KB }],
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
      response = await processStartStep(wfHdr, wfDfn.wfDefinition, options, conn, t)
    } else if (wfHdr.nextActivityId) {
      response = await continueWFExecution(wfDfn.wfDefinition, wfHdr.nextActivityId, wfHdr.wfContext, conn, t)
    }
    const hasWaitRecord = await conn.WorkflowTxn.findOne({
      where: {
        wfHdrId: wfHdr.wfHdrId,
        [Op.or]: [{ wfTxnStatus: 'USER_WAIT' }, { wfTxnStatus: 'SYS_WAIT' }]
      },
      transaction: t
    })
    if (!hasWaitRecord && response?.status === 'SUCCESS') {
      await startWorkFlowEngineManual(entityId, options, conn, t)
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

export const processStartStep = async (wfHdr, wfJson, options, conn, t) => {
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
        entityType: wfHdr.entityType,
        ...options
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

          if (!hasTask && task.type === 'DB' && task.taskId > 1) {
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
    // const data = {
    //   wfHdrId: inputContext.wfHdrId,
    //   activityId:
    // }
    // await conn.WorkflowHdr.create(wfData, )
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

const executeAPITask = async (APITask, context, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn) => {
  logger.debug('Executing API Task')
  if (APITask.api.method === 'POST') {
    await executePost(APITask, context, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
  } else if (APITask.api.method === 'PUT') {
    await executePut(APITask, context, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
  } else if (APITask.api.method === 'GET') {
    await executeGet(APITask, context, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
  } else if (APITask.api.method === 'DELETE') {
    await executeDelete(APITask, context, t, activityPrefix, taskActivityPrefix, hasMoreTask, conn)
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
  logger.debug('Executing POST')
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

const executeSendMessageTask = async (SendMessageTask, inputContext, t, activityPrefix, taskActivityPrefix, conn) => {
  return SendMessageTask
}

const executeCollectInputTask = async (collectInputTask, inputContext, t, activityPrefix, taskActivityPrefix, mobileNumber, msg, txnData, nextActivityId, conn) => {
  // console.log('im in collect input');
  if (msg === '') {
    txnData.wfTxnStatus = 'DONE'
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
    // console.log('msg form user', msg)
    txnData.wfTxnStatus = 'DONE'
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
    // if users are matching with our descisions then we can proceed
  }
}

export const processAutomatedResponseStart = async (wfHdr, wfJson, source, conn) => {
  logger.debug('Performing start step for new record')
  console.log('source....problem....', source)

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
          // console.log('nextActivityId in start process...', nextActivityId)
          let inputContext
          // Storing the activitie id's in context
          const context = {
            [startActivityPrefix]: startActivityPrefix
          }
          const hasStartRec = await conn.WorkflowTxn.findOne({ where: { wfHdrId: wfHdr.wfHdrId, activityId: startActivityId, wfTxnStatus: { [Op.ne]: 'DONE' } } })
          console.log('hasStartRec===>', hasStartRec)
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

export const continueAutomatedResponseExecution = async (wfJson, currentActivityId, inputContext, mobileNumber, msg, conn) => {
  logger.debug('Continue chat workflow Execution')
  const t = await conn.sequelize.transaction()
  try {
    const process = wfJson?.definitions?.process
    const activities = process?.activities
    const transitions = process?.transitions
    const transition = transitions.find(e => e.from === currentActivityId)
    const nextActivityId = transition?.to
    const currentActivity = activities.find(e => e.activityId === currentActivityId)
    const hasWaitRecord = await findUserWaitRecordById(currentActivityId, inputContext.wfHdrId, conn, t)
    console.log('hasWaitRecord001...', hasWaitRecord)
    if (hasWaitRecord) {
      logger.debug('A - Some task are in wait state or not yet done, So can`t prcess End step now')
      return currentActivity.tasks[0].taskContextPrefix
    } else {
      // Finding tasks based on nextActivityId in the activities array
      const activityPrefix = currentActivity.activityContextPrefix
      console.log('currentActivity.type...', currentActivity.type)
      if (currentActivity.type === 'END') {
        // console.log('im in end workflow');
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
        await processEndStep(currentActivity.activityId, inputContext) // update the status as closed
        return 'WORKFLOWEND'
      } else if (currentActivity.type === 'DECISION') {
        // console.log('im in descision...', currentActivity.activityId)
        let decision = false
        let transitionId
        for (const rule01 of currentActivity.condition) {
          if (rule01.ruleType === 'DEFAULT') {
            // console.log('im in deafault condition....')
            decision = true
            transitionId = rule01.transitionId
          }
          for (const rule02 of rule01.rules) {
            for (const rule03 of rule02.rules) {
              if (rule03.valueType === 'EXPR') {
                const expression = jsonata(rule03.value)
                rule03.value = expression.evaluate(inputContext)
                // console.log('rule03.value.....',rule03.value)
              }
              if (rule03.fieldType === 'EXPR') {
                // console.log('rule03.field......rule03.field', rule03.field)
                const expression = jsonata(rule03.field)
                rule03.field = expression.evaluate(inputContext)
                // console.log('rule03 field....', rule03.field)
                // console.log('rule03 field....', typeof (rule03.field))
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
              if ((rule03.operator === '-' || rule03.operator === '=') && !decision) {
                // console.log('heeeeeeeeeeeeeeeeeeee..')
                if (typeof (rule03.field) === 'object') {
                  // console.log('rule03.field[0]type....', typeof (rule03?.field))
                  // console.log('rule03.valueType....', typeof (rule03.value))
                  // console.log('rule03.field[0]....', rule03?.field)
                  // console.log('rule03.value....', rule03.value)
                  if (rule03.field === rule03.value && (rule03.field !== undefined || rule03.value !== undefined)) {
                    // console.log('rule01.transitionId...', rule01.transitionId)
                    transitionId = rule01.transitionId
                    decision = true
                    break
                  }
                } else {
                  // console.log('heerrrrrrrrrr', rule03.field)
                  // console.log('heerrrrrrrrrr................', rule03.value)
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
              // console.log('rule03.operator....', rule03.operator)
              if (rule03.operator === '>' && !decision) {
                // console.log('im here in greater than condition...type...field...', typeof (rule03.field))
                // console.log('im here in greater than condition...field...', rule03.field)
                // console.log('im here in greater than condition..type...value...', typeof (rule03.value))
                // console.log('im here in greater than condition..value...', rule03.value)
                if (rule03.field > rule03.value && (rule03.field !== undefined || rule03.value !== undefined)) {
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
          // console.log('here......', transitionId)
          const transition = transitions.find(e => e.transitionId === transitionId)
          const nextActivityId = transition.to
          // console.log('nextActivityId......', nextActivityId)

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
            // updating the wfHdr table
            // console.log('updating the wfHdr table...')
            const data = {
              nextActivityId,
              wfContext: inputContext
            }
            // console.log('data....XXXX', data)
            await conn.WorkflowHdr.update(data, { where: { wfHdrId: inputContext.wfHdrId }, transaction: t })
          }
          await t.commit()
          return await continueAutomatedResponseExecution(wfJson, nextActivityId, inputContext, mobileNumber, msg, conn)
        } else {
          await t.commit()
          return 'Please enter help to go main menu'
        }
      } else {
        let noTaskFound = false
        if (currentActivity?.tasks?.length > 0) {
          for (const task of currentActivity?.tasks) {
            // console.log('Processing task ' + task.taskName)
            // Finding any wait record in txn table and continueExecution
            const hasWaitRecord = await findUserWaitRecordById(currentActivityId, inputContext.wfHdrId, conn, t)
            // console.log('hasWaitRecord002...', hasWaitRecord)
            if (hasWaitRecord) {
              logger.debug('B - Some task are in wait state or not yet done, So can`t prcess End step now')
              return currentActivity.tasks[0].taskContextPrefix
            } else {
              console.log('inputContext.wfHdrId...', inputContext.wfHdrId)
              console.log('currentActivityId...', currentActivityId)
              console.log('task.taskId...', task.taskId)
              const hasTask = await conn.WorkflowTxn.findOne({
                where: { wfHdrId: inputContext.wfHdrId, activityId: currentActivityId, taskId: task.taskId.toString() }
              })
              console.log('hasTask..............', hasTask)
              if (!hasTask) {
                // console.log('i have task........')
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
                // console.log('inputContext.wfHdrId.........>>>>>>>>>>>', inputContext.wfHdrId)
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
                  // console.log('task.type...', task.type)
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
                  // console.log('executeSendMessageTaskResult.....', executeSendMessageTaskResult);
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

                  const executeCollectInputTaskResult = await executeCollectInputTask(task, inputContext, t, activityPrefix, taskActivityPrefix, mobileNumber, msg, txnData, nextActivityId)
                  // console.log('executeCollectInputTaskResult......', executeCollectInputTaskResult)
                  await conn.WorkflowTxn.destroy({
                    where: {
                      wfHdrId: inputContext.wfHdrId
                    },
                    transaction: t
                  })
                  await t.commit()
                  return executeCollectInputTaskResult
                } else if (task.type === 'API') {
                  // console.log('im here in api tasks');
                  const txnData = {
                    wfHdrId: inputContext.wfHdrId,
                    activityId: currentActivity.activityId,
                    taskId: task.taskId,
                    txnContext: inputContext,
                    wfTxnStatus: 'SYS_WAIT',
                    createdBy: systemUserId,
                    updatedBy: systemUserId
                  }
                  return await executeAPIForAutomatedResponse(task, inputContext, t, activityPrefix, taskActivityPrefix, mobileNumber, msg, txnData, nextActivityId)
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
          // console.log('im in No tasklist.........')
          // continueExecution for next activities and transitions
          const transition = transitions.find(e => e.from === currentActivityId)
          if (transition) {
            const nextActivityId = transition.to
            // console.log('nextActivityId.......', nextActivityId)
            // console.log('inputContext.......', inputContext)
            // Here nextActivityId become current activityid
            return await continueAutomatedResponseExecution(wfJson, nextActivityId, inputContext, mobileNumber, msg, conn)
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

export const executeAPIForAutomatedResponse = async (APITask, context, t, activityPrefix, taskActivityPrefix, mobileNumber, msg, txnData, nextActivityId) => {
  logger.debug('Executing API Task')
  if (APITask.api.method === 'POST') {
    await executePost(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData)
  } else if (APITask.api.method === 'PUT') {
    await executePut(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData)
  } else if (APITask.api.method === 'GET') {
    // console.log('GET API')
    return await executeGet(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData)
  } else if (APITask.api.method === 'DELETE') {
    await executeDelete(APITask, context, t, activityPrefix, taskActivityPrefix, nextActivityId, txnData)
  } else {
    logger.debug('No API Task found')
  }
  logger.debug('Successfully Executed API Task')
}
