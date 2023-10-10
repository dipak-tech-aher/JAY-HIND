import { logger } from '@utils'
import { processAutomatedResponseStart, continueAutomatedResponseExecution, assignWFToEntity } from '../services/workflow.service'
import jsonata from 'jsonata'
import { Op } from 'sequelize'

export async function processTheCurrentFlow (data, entityId, callAgainFlag, flowId, conn, t) {
  let callAgain = false
  let whatsAppResp
  const response = {}
  response.status = 'Created'
  // if (!callAgainFlag.callAgain) {
  //   return { callAgain: false, livechat: whatsAppResp }
  // }

  if (response.status === 'Created') {
    const workflowResponse = await startWorkFlowChat(entityId, data.msg, data.source, flowId, data, conn, t)
    const wfResponse = workflowResponse
    console.log('wfResponse...>>>>>', wfResponse)

    if (wfResponse?.executeSendMessageTaskResult !== 'WORKFLOWEND' && wfResponse?.executeSendMessageTaskResult === undefined) {
    // console.log('hereeeee............>>>>')
      callAgain = true
      return { callAgain }
    }

    if (typeof (wfResponse.executeSendMessageTaskResult) === 'object') {
      if (wfResponse?.executeSendMessageTaskResult?.type === 'SENDMESSAGE' || wfResponse?.type === 'API') {
        callAgain = true
      }

      if (wfResponse?.executeSendMessageTaskResult?.taskContextPrefix !== undefined) {
      // console.log('here....')
        const separatedStr = wfResponse?.executeSendMessageTaskResult?.taskContextPrefix.split('$.')
        if (separatedStr[1] !== undefined) {
          const expr = '$.' + separatedStr[1]
          // console.log('expr', expr)
          //  console.log('wfResponse?.message?.inputContext.context', wfResponse?.message?.inputContext?.context)
          const expression = jsonata(expr)
          const value = expression.evaluate(wfResponse?.inputContext)
          // console.log('value.......', value);
          const respOfWhatsapp = separatedStr[0].replace('--@#@--', value)
          whatsAppResp = respOfWhatsapp
        } else {
        // console.log('1111111111111111111...send msg......')
          whatsAppResp = wfResponse?.executeSendMessageTaskResult?.taskContextPrefix
        }
      } else {
        whatsAppResp = wfResponse?.taskContextPrefix
      }
    }
    if (wfResponse?.message !== 'WORKFLOWEND') {
      whatsAppResp = {
        entityId,
        message: whatsAppResp || wfResponse?.message,
        SmsStatus: 'sent'
      }
    }
  }
  return { callAgain, livechat: whatsAppResp }
}

export async function startWorkFlowChat (entityId, msg, source, flowId, commonAttrib, conn) {
  try {
    const workflowCount = await conn.WorkflowHdr.count({ // we are checking workflow already assigned or not
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
        // Finding the wfJSON for current wfHdr id
        const wfDfn = await conn.Workflow.findOne({ where: { workflowId: wfHdr.wfDefnId } })
        // Finding WFJSON have definitions and process or not
        if (wfDfn?.wfDefinition && wfDfn?.wfDefinition?.definitions && wfDfn?.wfDefinition?.definitions?.process) {
          // console.log('Checking start activity', wfHdr.wfStatus, wfHdr.nextActivityId)
          if (wfHdr.wfStatus === 'CREATED') {
            console.log('wfHdr.nextActivityId===>', wfHdr.nextActivityId)
            if (!wfHdr.nextActivityId) {
              await processAutomatedResponseStart(wfHdr, wfDfn.wfDefinition, source, conn)
              return await startWorkFlowChat(entityId, msg, source, flowId, commonAttrib, conn)
            } else if (wfHdr.nextActivityId) {
              // If already wf started and continuing remaining tasks
              return await continueAutomatedResponseExecution(wfDfn.wfDefinition, wfHdr.nextActivityId, wfHdr.wfContext, entityId, msg, conn)
            }
          }
        } else {
          logger.debug('Workflow JSON not found in workflow definition table')
          return 'Please wait for allocation'
        }
      }
    } else {
      logger.debug('No records to execute the workflow hdr01')
      return 'Please wait for allocation'
    }
  } catch (err) {
    logger.debug(err, 'No records to execute the workflow hdr02')
  }
}
