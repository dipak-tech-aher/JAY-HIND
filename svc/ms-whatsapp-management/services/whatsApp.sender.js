//import { logger } from '../config/logger'
import { statusCodeConstants, logger, camelCaseConversion, constantCode } from '@utils'
import { config } from '@config/env.config'
import { isEmpty } from 'lodash'
import { db } from '@models'
import { v4 as uuidv4 } from 'uuid'
import jsonata from 'jsonata'
import { Op } from 'sequelize'
import moment from 'moment'
import { getMobileNumber } from './whatsApp.service'
const { WHATSAPP, systemUserId, tibco } = config
const port = config.bcae.port
const interactionPort = config.bcae.interactionPort
const WASource = 'WHATSAPP'
const WAIHubSource = 'WHATSAPP-IHUB'

const Got = require('got')
const https = require('https');

const buttons = [
  {
    "type": "reply",
    "reply": {
      "id": "HELP",
      "title": "Help"
    }
  }
];

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
}


export const sendTestInteractiveWhatsappReply = async () => {
  try {
    const to = '919834122529'
    // const json = {
    //   messaging_product: 'whatsapp',
    //   to: to,
    //   text: { body: replyMessage }
    // }
    const json = {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": to,
      "type": "interactive",
      "interactive": {
        "type": "list",
        "body": {
          "text": "Please select an option"
        },
        "action": {
          "button": "Options",
          "sections": [
            {
              "title": "List 1",
              "rows": [
                {
                  "id": "1",
                  "title": "Option 1"
                },
                {
                  "id": "2",
                  "title": "Option 2"
                },
                {
                  "id": "3",
                  "title": "Option 3"
                },
                {
                  "id": "4",
                  "title": "Option 4"
                },
                {
                  "id": "5",
                  "title": "Option 5"
                },
                {
                  "id": "6",
                  "title": "Option 6"
                },
                {
                  "id": "7",
                  "title": "Option 7"
                },
                {
                  "id": "8",
                  "title": "Option 8"
                },
                {
                  "id": "9",
                  "title": "Option 9"
                },
                {
                  "id": "10",
                  "title": "Option 10"
                }
              ]
            }
          ]
        }
      }
    }


    const data = JSON.stringify(json)
    const phoneNumberId = '120049871095288'
    const token = WHATSAPP.WA_TOKEN
    const version = WHATSAPP.WA_VERSION
    const path = '/' + version + '/' + phoneNumberId + '/messages?access_token=' + token
    const options = {
      host: 'graph.facebook.com',
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }
    const callback = (response) => {
      let str = ''
      response.on('data', (chunk) => {
        str += chunk
      })
      response.on('end', () => {
      })
    }
    const req = https.request(options, callback)
    req.on('error', (e) => {
      logger.info('Error occurred while sending whatsapp reply message')
    })
    req.write(data)
    req.end()
    logger.info('Successfully sent whatsapp reply')
    return 'Sent'
  } catch (error) {
    logger.error(error, 'Error while creating chat record')
    return 'Error'
  }
}

export const sendInteractiveWhatsappReply = async (phoneNumberId, to, replyMessage, reportId, conn, source, type, env) => {
  // const t = await conn.sequelize.transaction()
  try {
    let whatsAppConfig = await getWhatsappConfig(type, env, conn)
    if (!whatsAppConfig || isEmpty(whatsAppConfig) || whatsAppConfig?.status === statusCodeConstants?.ERROR) {
      logger.info('Please configure whatsapp configuration in Settings')
      return
    }
    whatsAppConfig = whatsAppConfig?.data ?? whatsAppConfig
    // const data1 = {
    //   reportId,
    //   msgTo: to,
    //   msgFrom: source === WASource ? WHATSAPP.WHATSAPP_NUMBER : WHATSAPP.WA_IHUB_NUMBER,//WHATSAPP.WHATSAPP_NUMBER,
    //   message: JSON.stringify(replyMessage),
    //   msgSource: source === WASource ? WASource : WAIHubSource,
    //   createdBy: systemUserId,
    //   tranId: uuidv4(),
    // }
    const data1 = {
      reportId,
      msgTo: to,
      msgFrom: whatsAppConfig?.whatsappNumber,//WHATSAPP.WHATSAPP_NUMBER,
      message: JSON.stringify(replyMessage),
      msgSource: source === WASource ? WASource : WAIHubSource,
      createdBy: systemUserId,
      tranId: uuidv4(),
    }
    //  { transaction: t }
    await conn.WhatsAppChatHistory.create(data1);
    let interactive = {}
    if (replyMessage?.msgType === 'list') {
      interactive = {
        "type": "list",
        "body": {
          "text": replyMessage?.text
        },
        "action": {
          "button": replyMessage?.buttonName,
          "sections": [
            {
              "rows": replyMessage?.rows
            }
          ]
        }
      }
      if (replyMessage && replyMessage?.headers) {
        interactive.headers = replyMessage?.headers
      }
      if (replyMessage && replyMessage?.footer) {
        interactive.footer = replyMessage?.footer
      }
    } else if (replyMessage?.msgType === 'callToActionButton') {
      interactive = {
        "type": "button",
        "body": {
          "text": replyMessage?.text
        },
        "action": {
          "buttons": replyMessage?.buttons
        }
      }
    }

    const data = JSON.stringify({
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": to,
      "type": "interactive",
      "interactive": interactive
    })
    // const token = source === WASource ? WHATSAPP.WA_TOKEN : WHATSAPP.WA_IHUB_TOKEN
    // const version = source === WASource ? WHATSAPP.WA_VERSION : WHATSAPP.WA_IHUB_VERSION
    // const path = '/' + version + '/' + phoneNumberId + '/messages?access_token=' + token
    const path = `/${whatsAppConfig?.version}/${whatsAppConfig?.phoneNumberId}/messages?access_token=${whatsAppConfig?.whatsappToken}`
    const options = {
      host: whatsAppConfig?.url,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }

    const callback = (response) => {
      let str = ''
      response.on('data', (chunk) => {
        str += chunk
      })
      response.on('end', () => {
      })
    }
    const req = https.request(options, callback)
    req.on('error', (e) => {
      logger.info('Error occurred while sending whatsapp reply message')
    })
    req.write(data)
    req.end()
    logger.info('Successfully sent whatsapp reply')
    return 'Sent'
  } catch (error) {
    logger.error(error, 'Error while creating chat record')
    return 'Error'
  } 
  // finally {
  //   if (t && !t.finished) {
  //     await t.rollback()
  //   }
  // }
}

export async function createChat(body, senderID, callAgainFlag, pageObjectId, source, tenantId, conn, tr, payload, type, env) {
  logger.info(senderID)
  let callAgain = false
  let response = {}
  response.status = 'Created'
  let sourceResponse, wfResponse

  let whatsappSessionData = await conn.WhatsAppReport.findOne({
    where: {
      whatsappNumber: senderID,
      status: 'CREATED'
    },
    raw: true
  })

  if (!whatsappSessionData) {
    const reportData = {
      whatsappNumber: senderID,
      status: 'CREATED',
      createdBy: systemUserId
    }
    whatsappSessionData = await conn.WhatsAppReport.create(reportData)
  }

  if (!callAgainFlag.callAgain) {
    body.smsStatus = 'received'
    response = await storeChat(body, senderID, source, whatsappSessionData.reportId, conn)
  }
  if (response.status === 'Created') {
    let data = {
      mobileNumber: senderID,
      msg: body.type === 'text' ? body.text.body : body?.interactive?.type === 'list_reply' ? body?.interactive?.list_reply?.id : body?.interactive?.type === 'button_reply' ? body?.interactive?.button_reply?.id : body[body.type]?.id || '',
      // msg: body.type === 'text' ? body.text.body : body[body.type]?.id || body?.interactive?.body[body.type].type?.id,
      source
    }
    logger.info('Initiating Whatsapp workflow')
    const { userGroup, userFamily } = payload
    const workflowResponse = await Got.post({
      headers: { 'content-type': 'application/json' },
      url: `http://localhost:${port}/api/whatsapp?tenant-id=${tenantId}&userGroup=${userGroup}&userFamily=${userFamily}`, // whatsAppWorkflow is calling from here
      body: JSON.stringify(data),
      retry: 0
    }, {
      https: { rejectUnauthorized: false }
    })
    wfResponse = JSON.parse(workflowResponse?.body)// current step

    if (wfResponse.status === 200 && response?.inboundId) {
      let taskName = ''
      if (wfResponse?.message) {
        const key = Object.keys(wfResponse?.message)
        if (wfResponse && wfResponse?.message && key.length > 0) {
          taskName = wfResponse.message[key[0]].taskName
          if (!taskName) {
            taskName = wfResponse.message.taskName
          }
        }
      }
      const ss = await updateChat({ taskName: taskName, body }, senderID, response?.inboundId, conn)
    }

    if (wfResponse?.message !== 'WORKFLOWEND' && wfResponse?.message === undefined) {
      callAgain = true
      return { callAgain: callAgain }
    }

    if (wfResponse?.message === 'Please enter help to go main menu') {
      sourceResponse = wfResponse?.message
    }
    if (typeof (wfResponse.message) === 'object') {
      if (wfResponse?.message?.executeSendMessageTaskResult?.taskContextPrefix !== undefined) {
        const separatedStr = wfResponse?.message?.executeSendMessageTaskResult?.taskContextPrefix.split('$')

        if (separatedStr[1] !== undefined) {
          const expr = '$' + separatedStr[1]
          const expression = jsonata(expr);
          const value = await expression.evaluate(wfResponse?.message?.inputContext)

          const respOfWhatsapp = separatedStr[0]?.replace("--@#@--", value) || value;
          sourceResponse = respOfWhatsapp
        } else {
          sourceResponse = wfResponse?.message?.executeSendMessageTaskResult?.taskContextPrefix
        }
      } else {
        sourceResponse = wfResponse?.message?.taskContextPrefix
      }
    }

    if (wfResponse?.message !== 'WORKFLOWEND') {
      const sourceResponseonse = {}
      let sendResponse
	  
	  console.log('sourceResponse============>', sourceResponse)
	  
      if (sourceResponse === 'SHOW FIXEDLINE CONNECTION STATUS' || sourceResponse === 'SHOW FIXEDLINE CONNECTION STATUS_NEW') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });
        const expr = sourceResponse === 'SHOW FIXEDLINE CONNECTION STATUS' ? '$.context.Activity_0sv7k67.task_1.response.value.body' : '$.context.Activity_0fbw2wm.task_1.response.value.body';
        const expression = jsonata(expr);
        const value = expression.evaluate(workflowHdrData?.wfContext);

        const fixedlineConnectionResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/get-customer-summary-fixedline?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: value }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const list = JSON.parse(fixedlineConnectionResponse.body) || []
        const accessNumber = value
        sendResponse = await sendfixedlineConnectionStatus(pageObjectId, senderID, list, whatsappSessionData, accessNumber, conn)
      } else if (sourceResponse === 'SHOW MOBILE CONNECTION STATUS' || sourceResponse === 'SHOW MOBILE CONNECTION STATUS_NEW') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });
        const expr = sourceResponse === 'SHOW MOBILE CONNECTION STATUS' ? '$.context.Activity_0bb97d9.task_1.response.value.body' : '$.context.Activity_0hujge0.task_1.response.value.body';

        const expression = jsonata(expr);
        const value = expression.evaluate(workflowHdrData?.wfContext);

        const mobileConnectionResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/get-customer-summary-mobile?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: value }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })

        const list = JSON.parse(mobileConnectionResponse.body) || []
        const accessNumber = value
        sendResponse = await sendmobileConnectionStatus(pageObjectId, senderID, list, whatsappSessionData, accessNumber, conn)
      } else if (sourceResponse === 'SHOW_OFFERS' || sourceResponse === 'SHOW OFFERS') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });
        const expr = sourceResponse === 'SHOW OFFERS' ? '$.context.Activity_0mq8joe.task_1.response.value.results' : '$.context.Activity_103mbxm.task_1.response.value.results';

        const accessNumberExpr = sourceResponse === 'SHOW OFFERS' ? '$.context.Activity_0jdzml8.task_1.response.value.body' : '$.context.Activity_0va8kcl.task_1.response.value.body';

        const expression = jsonata(expr);
        const accessNumberExpression = jsonata(accessNumberExpr);
        const offers = expression.evaluate(workflowHdrData?.wfContext);
        const accessNumber = accessNumberExpression.evaluate(workflowHdrData?.wfContext);

        sendResponse = await sendOffers(pageObjectId, senderID, offers, whatsappSessionData, tr, accessNumber, conn)
      } else if (sourceResponse === 'SHOW OPEN TKTS' || sourceResponse === 'SHOW_OPEN_TKTS') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });
        const expr = sourceResponse === 'SHOW OPEN TKTS' ? '$.context.Activity_1w1htx4.task_1.response.value.data' : '$.context.Activity_1seeaqj.task_1.response.value.data';

        const accessNumberExpr = sourceResponse === 'SHOW OPEN TKTS' ? '$.context.Activity_1l6ikk1.task_1.response.value.body' : '$.context.Activity_0a4qym4.task_1.response.value.body';

        const expression = jsonata(expr);
        const accessNumberExpression = jsonata(accessNumberExpr);
        const offers = expression.evaluate(workflowHdrData?.wfContext);
        const accessNumber = accessNumberExpression.evaluate(workflowHdrData?.wfContext);

        sendResponse = await sendOpenTkts(pageObjectId, senderID, offers, whatsappSessionData, tr, accessNumber, conn)
      } else if (sourceResponse === 'SHOW CONNECTION STATUS' || sourceResponse === 'SHOW_CONNECTION_STATUS') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });

        const expr = sourceResponse === 'SHOW CONNECTION STATUS' ? '$.context.Activity_0i9cw2u.task_1.response.value' : '$.context.Activity_0uqpib9.task_1.response.value';

        const accessNumberExpr = sourceResponse === 'SHOW CONNECTION STATUS' ? '$.context.Activity_0xjq82o.task_1.response.value.body' : '$.context.Activity_19vcgey.task_1.response.value.body';

        const expression = jsonata(expr);
        const accessNumberExpression = jsonata(accessNumberExpr);
        const offers = expression.evaluate(workflowHdrData?.wfContext);
        const accessNumber = accessNumberExpression.evaluate(workflowHdrData?.wfContext);

        sendResponse = await sendConnectionStaus(pageObjectId, senderID, offers, whatsappSessionData, tr, accessNumber, conn)
      } else if (sourceResponse === 'COLLECT_INPUT') {
        sendResponse = 'Sent'
      } else if (sourceResponse === 'SHOW_COMPLAINTS') {
        const complaintResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/complaint/list?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const list = JSON.parse(complaintResponse.body)?.data || []
        // console.log('SHOW_COMPLAINTS list-->', list)
        sendResponse = await sendComplaintList(pageObjectId, senderID, list, whatsappSessionData, conn, source)
      } else if (sourceResponse === 'SHOW_CATEGORY_LIST') {
        const categoriesResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/list-categories?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const list = JSON.parse(categoriesResponse.body)?.data || []
        list.map((x) => {
          x.serviceType = x.service_type
          return x
        })
        list.sort(function (a, b) {
          const nameA = a.serviceType.toUpperCase()
          const nameB = b.serviceType.toUpperCase()
          if (nameB < nameA) {
            return -1
          }
          if (nameB > nameA) {
            return 1
          }
          return 0
        })
        let index = 1
        list.map((x) => {
          x.indexId = index
          index = index + 1
          return x
        });


        // let msg = 'Please choose your service category\n'
        let i = 1;
        let rowsArr = [];
        for (const l of list) {
          // msg = msg + `Type ${i} for ${l.service_name} - ${l.service_no}\n`
          rowsArr.push(
            {
              "id": i,
              "title": "" + l.service_no + "",
              "description": "Select " + i + " for " + l.service_name + " - " + l.service_no + ""
            },
          )
          i = i + 1
        }

        rowsArr.push({
          "id": "HELP",
          "title": "Help",
          "description": "HELP to return back to menu"
        })
        // msg = msg + '\n \nType HELP to return back to menu'
        const workflowHdrResponse = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true,
          attributes: ['wfHdrId', 'wfContext']
        })
        const context = workflowHdrResponse.wfContext
        context.categoryList = list
        await conn.WorkflowHdr.update({ wfContext: context }, { where: { wfHdrId: workflowHdrResponse.wfHdrId } });

        // let interactivePayload = {
        //   msgType: "list",
        //   text: "Please choose your service category",
        //   buttonName: "Main Menu",
        //   rows: rowsArr
        // }

        const chunkedArray = chunkArray(rowsArr, 10);
        // console.log(chunkedArray);

        for (let i = 0; i < chunkedArray?.length; i++) {
          // console.log('chunkedArray[i]------->', chunkedArray[i])
          let interactivePayload = {
            msgType: "list",
            text: "Please choose your service category",
            buttonName: "Main Menu",
            rows: chunkedArray[i]
          }
          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)

        }


        // sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'PREPAID_MENU') {
        const accountDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/account-details?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const accountDetailsData = JSON.parse(accountDetailsResponse.body)?.data || {}
        const accountDetailsDataStatusCode = JSON.parse(accountDetailsResponse.body)?.statusCode
        const prepaidCreditDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/prepaid-credit-details?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const prepaidCreditDetailsData = JSON.parse(prepaidCreditDetailsResponse.body)?.data || {}
        // console.log('prepaidCreditDetailsData*******', prepaidCreditDetailsData)

        // let msg = ''
        if (accountDetailsData && accountDetailsDataStatusCode === 'SUCCESS') {
          // msg = msg + `Hello, ${accountDetailsData?.name || ''}!\n`
          // msg = msg + `Your Main Credit is BND ${prepaidCreditDetailsData && prepaidCreditDetailsData?.balance && Number(prepaidCreditDetailsData?.balance).toFixed(2) || ''}\n\n`
          // msg = msg + 'For more options, choose from the menu below:\n'
          // msg = msg + 'Type 1 for Account Details\n'
          // msg = msg + 'Type 2 for Active Booster Details\n'
          // msg = msg + 'Type 3 for Mobile Prepaid Service Status\n'
          rowsArr.push(
            {
              "id": "1",
              "title": "Account",
              "description": "Account Details"
            },
            {
              "id": "2",
              "title": "Booster",
              "description": "Active Booster Details"
            },
            {
              "id": "3",
              "title": "Service",
              "description": "Mobile Prepaid Service Status"
            },
          )
        } else {
          // msg = msg + 'Hello!\n'
          // msg = msg + 'For more options, choose from the menu below:\n'
          // msg = msg + 'Type 1 for Account Details\n'
          // msg = msg + 'Type 2 for Active Booster Details\n'
          // msg = msg + 'Type 3 for Mobile Prepaid Service Status\n'
          rowsArr.push(
            {
              "id": "1",
              "title": "Help",
              "description": "Account Details"
            },
            {
              "id": "2",
              "title": "Booster",
              "description": "Active Booster Details"
            },
            {
              "id": "3",
              "title": "Service",
              "description": "Mobile Prepaid Service Status"
            },
            {
              "id": "HELP",
              "title": "Help",
              "description": "HELP to return back to menu"
            }
          )

        }

        let interactivePayload = {
          msgType: "list",//"callToActionButton"
          text: accountDetailsData && accountDetailsDataStatusCode === 'SUCCESS' ? `Hello${accountDetailsData?.name ? ',' : '!'} ${accountDetailsData?.name || ''}\n Your Main Credit is BND ${prepaidCreditDetailsData && prepaidCreditDetailsData?.balance && Number(prepaidCreditDetailsData?.balance).toFixed(2) || ''}` : 'Hello!\nFor more options, choose from the menu below',
          buttonName: 'Main Menu',
          rows: rowsArr
        }


        // msg = msg + '\nType HELP to return to back to menu'
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'ACCOUNT_DETAILS') {
        const accountDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/account-details?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const accountDetailsData = JSON.parse(accountDetailsResponse.body)?.data || {}
        let msg = ''
        if (accountDetailsData?.accountNo) {
          msg = msg + 'Your Account Details:\n\n'
          msg = msg + `Name: ${accountDetailsData?.name || ''}\n`
          msg = msg + `Account Number: ${accountDetailsData?.accountNo || ''}\n`
          msg = msg + `Customer Status: ${accountDetailsData?.customerStatus === 'CU' ? 'Active' : accountDetailsData?.customerStatus === 'FA' ? 'Pending' : accountDetailsData?.customerStatus || ''}\n`
          msg = msg + `Email ID: ${accountDetailsData?.emailId || ''}\n`
        } else {
          msg = msg + 'Oh no! Your account details are currently unavailable.\nKindly Talk2Us at 111 for more info.'
        }

        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons
        }


        // msg = msg + '\n\nType HELP to return back to menu'
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'BOOSTER_DETAILS_PREPAID') {
        const boosterDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/booster-details-prepaid?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const boosterDetailsData = JSON.parse(boosterDetailsResponse.body)?.data || {}
        const statusCode = JSON.parse(boosterDetailsResponse.body).statusCode
        if (boosterDetailsData?.list && statusCode === 'SUCCESS') {
          let msg = 'Your Data Booster Details:\n\n'
          for (const booster of boosterDetailsData?.list) {
            const endDate = booster?.end_date ? moment(booster?.end_date).format('DD-MMM-YYYY') : ''
            msg = msg + `Booster Name: ${booster?.product_name || ''}\n`
            msg = msg + `Booster Balance: ${(Number(booster?.charge_amount) / (1024 * 1024 * 1024)).toFixed(1)} GB\n`
            msg = msg + `Booster Start Date: ${moment(booster?.start_date).format('DD-MMM-YYYY') || ''}\n`
            msg = msg + `Booster Expiry Date: ${endDate || ''}\n\n`
          }
          // msg = msg + '\nType HELP to return back to menu'


          let interactivePayload = {
            msgType: "callToActionButton",//"callToActionButton"
            text: msg,
            buttonName: 'Main Menu',
            buttons
          }


          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
          // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
        } else {
          let msg = ''
          msg = msg + 'No active booster available at the moment.\nPurchase your booster via imagineGo or via SMS.\nPlease visit our website at https://imagine.com.bn/ \n\nKindly Talk2Us at 111 for more info.'
          // msg = msg + '\n\nType HELP to return back to menu';

          let interactivePayload = {
            msgType: "callToActionButton",//"callToActionButton"
            text: msg,
            buttonName: 'Main Menu',
            buttons
          }

          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)

          // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
        }
      } else if (sourceResponse === 'PREPAID_POSTPAID_SERVICE_STATUS') {
        const serviceStatusResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/prepaid-postpaid-service-status?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const serviceStatusData = JSON.parse(serviceStatusResponse.body)?.data || {}
        logger.info('serviceStatusData--', serviceStatusData)
        let msg = ''
        if (serviceStatusData) {
          msg = msg + 'Service Status Found\n'
        } else {
          msg = msg + 'No Account Details Available\n'
        }

        // msg = msg + '\nType HELP to return to this menu'

        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons
        }


        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)

        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'CREATE_COMPLAINT') {
        const complaintResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/complaint?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })

        const complaintData = JSON.parse(complaintResponse.body)?.data || {}
        const statusCode = JSON.parse(complaintResponse.body).statusCode
        let msg = ''
        if (complaintData && statusCode === 'SUCCESS') {
          // msg = msg + 'Oh no! We sincerely apologize for the inconvenience. your service status is \n\n'
          msg = msg + 'Rest assured that we are working towards resolving this issue immediately.\n\n'
          msg = msg + `Here is your complaint ticket number for your reference: ${complaintData?.intxnId || ''}. Our team will keep in touch with you accordingly.`
        } else {
          msg = complaintData?.msg || ''
        }

        // msg = msg + '\n\nType HELP to return back to menu'

        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons
        }

        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)

        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'POSTPAID_MENU') {
        const accountDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/account-details?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const accountDetailsData = JSON.parse(accountDetailsResponse.body)?.data || {}
        // const accountDetailsDataStatusCode = JSON.parse(accountDetailsResponse.body)?.statusCode
        // let msg = ''
        rowsArr.push(
          {
            "id": "1",
            "title": "Account",
            "description": "Account Details"
          },
          {
            "id": "2",
            "title": "Plan",
            "description": "Plan Info"
          },
          {
            "id": "3",
            "title": "Bill",
            "description": "Bill Info"
          },
          {
            "id": "4",
            "title": "Service",
            "description": "Mobile Postpaid Service Status"
          },
        )

        // if (accountDetailsData && accountDetailsDataStatusCode === 'SUCCESS') {
        //   msg = msg + `Hello, ${accountDetailsData?.name || ''}!\n`
        //   msg = msg + 'For more options, choose from the menu below:\n'
        //   msg = msg + 'Type 1 for Account Details\n'
        //   msg = msg + 'Type 2 for Plan Info\n'
        //   // msg = msg + 'Type 3 for Active Booster Details\n'
        //   msg = msg + 'Type 3 for Bill Info\n'
        //   msg = msg + 'Type 4 for Mobile Postpaid Service Status\n'
        // } else {
        //   msg = msg + 'Hello!\n'
        //   msg = msg + 'For more options, choose from the menu below:\n'
        //   msg = msg + 'Type 1 for Account Details\n'
        //   msg = msg + 'Type 2 for Plan Info\n'
        //   // msg = msg + 'Type 3 for Active Booster Details\n'
        //   msg = msg + 'Type 3 for Bill Info\n'
        //   msg = msg + 'Type 4 for Mobile Postpaid Service Status\n'
        // }

        // msg = msg + '\nType HELP to return to back to menu'
        let interactivePayload = {
          msgType: "list",//"callToActionButton"
          text: `Hello${accountDetailsData?.name ? ', ' : '!'}, ${accountDetailsData?.name || ''}`,
          buttonName: 'Main Menu',
          rows: rowsArr
        }

        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'ACCOUNT_CONTRACT_DETAILS') {

        const contractDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/contract-details?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const contractDetailsInfo = ''//JSON.parse(contractDetailsResponse.body)?.data || {}
        logger.info('contractDetailsInfo', contractDetailsInfo)

        const accountDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/account-details?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const accountDetailsData = JSON.parse(accountDetailsResponse.body)?.data || {}
        logger.info('accountDetailsData', accountDetailsData)
        let msg = ''
        if (accountDetailsData?.accountNo) {
          msg = msg + 'Your Account Details:\n\n'
          msg = msg + `Name: ${accountDetailsData?.name || ''} \n`
          msg = msg + `Account Number: ${accountDetailsData?.accountNo || ''} \n`
          msg = msg + `Customer Status: ${accountDetailsData?.customerStatus === 'CU' ? 'Active' : accountDetailsData?.customerStatus === 'FA' ? 'Pending' : accountDetailsData?.customerStatus || ''} \n`
          msg = msg + `Email ID: ${accountDetailsData?.emailId || ''} \n`
          // msg = msg + 'Oh no! Your account details are currently unavailable.\nKindly Talk2Us at 111 for more info.'
        } else {
          //\nKindly Talk2Us at 111 for more info.
          msg = msg + 'Oh no! Your account details are currently unavailable.'
        }

        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons
        }


        // msg = msg + '\n\nType HELP to return back to menu'
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'POSTPAID_PLAN_INFO') {
        const accountDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/postpaid-plan-info?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const accountDetailsData = JSON.parse(accountDetailsResponse.body)?.data || {}
        let msg = ''
        if (!isEmpty(accountDetailsData)) {
          if (accountDetailsData?.charge === 'DEFAULT_PLAN') {
            msg = msg + 'Your Plan Info:\n\n'
            msg = msg + `Plan Name: ${accountDetailsData?.productName || ''}\n`
          } else {
            msg = msg + 'Your Plan Info:\n\n'
            msg = msg + `Plan Name: ${accountDetailsData?.productName || ''}\n`
            msg = msg + `Monthly Rental: BND ${Number(accountDetailsData?.chargeAmount).toFixed(2) || Number(0).toFixed(2)}\n`
          }
        } else {
          //\nKindly Talk2Us at 111 for more info.
          msg = msg + 'Oh no! Your plan details are currently unavailable.'
        }

        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons
        }

        // msg = msg + '\n\nType HELP to return back to menu'
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'BILL_INFO') {
        let msg = ''

        const workflowHdrResponse = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true,
          attributes: ['wfHdrId', 'nextTaskId']
        })
        const serviceNo = workflowHdrResponse.nextTaskId

        let getExistingService = await conn.CustServices.findOne({
          where: {
            serviceNo: serviceNo
          }
        })
        getExistingService = getExistingService?.dataValues ?? getExistingService
        let checkPostpaidService = ''
        if (getExistingService) {
          const checkCustomerPostpaidService = await conn.CustServices.findAll({
            include: [{
              model: conn.BusinessEntity,
              as: "serviceStatusDesc",
              attributes: ['description']
            }],
            where: {
              customerUuid: getExistingService.customerUuid,
              serviceCategory: {
                [Op.notIn]: ['PST_PRE']
              }
            }
          })
          if (checkCustomerPostpaidService && Array.isArray(checkCustomerPostpaidService) && checkCustomerPostpaidService.length > 0) {
            checkCustomerPostpaidService.forEach((ele) => {
              checkPostpaidService = checkPostpaidService + `${ele?.serviceName} - ${ele?.serviceNo} - (${ele?.serviceStatusDesc?.description})\n`
            })
          }
        }


        if (getExistingService?.serviceCategory === 'PST_PRE') {
          msg = `It looks like you requested bill information for Prepaid Service. Kindly try with your postpaid service.\n ${checkPostpaidService}`
        }

        if (!msg) {
          const billInfoResponse = await Got.post({
            headers: { 'content-type': 'application/json' },
            url: `http://localhost:${port}/api/whatsapp/bill-info?tenant-id=${tenantId}`,
            body: JSON.stringify({ accessNumber: senderID }),
            retry: 0
          }, {
            https: { rejectUnauthorized: false }
          })
          const billInfoData = JSON.parse(billInfoResponse.body)?.data || {}
          if (billInfoData?.invStartDate) {
            msg = msg + 'Your Bill Info:\n\n'
            msg = msg + `Current Bill Amount: BND ${Number(billInfoData?.invAmt).toFixed(2) || ''}\n`
            msg = msg + `Bill Period: ${moment(billInfoData?.invStartDate).format('DD-MMM-YYYY') + '-' + moment(billInfoData?.invEndDate).format('DD-MMM-YYYY') || ''}\n`
            msg = msg + `Due Date: ${moment(billInfoData?.dueDate).format('DD-MMM-YYYY') || ''}\n`
            msg = msg + `Last Payment Amount: BND ${Number(billInfoData?.invOsAmt) ? Number(billInfoData?.invOsAmt).toFixed(2) : ''}\n`
            msg = msg + `Last Payment Date: ${moment(billInfoData?.invDate).format('DD-MMM-YYYY hh:mm:ss A') || ''}\n`
            msg = msg + `Total Outstanding: BND ${Number(billInfoData?.invOsAmt).toFixed(2) || ''}\n`
          } else {
            msg = msg + `Looks like you don't have billing information at the moment`
          }
        }

        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons
        }

        // msg = msg + '\n\nType HELP to return back to menu'
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'HOW_CAN_HELP') {

        // const msg = 'How can we help you?\n' +
        //   'Type 1 Follow Up\n' +
        //   'Type 2 Service Category\n'
        // logger.info('msg', msg)

        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons: [
            {
              "type": "reply",
              "reply": {
                "id": "1",
                "title": "Follow Up"
              }
            },
            {
              "type": "reply",
              "reply": {
                "id": "2",
                "title": "Service Category"
              }
            },
            {
              "type": "reply",
              "reply": {
                "id": "HELP",
                "title": "Help"
              }
            }
          ]
        }


        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'FOLLOWUP_CREATION_SUCCESS') {
        const inboundMsgData = await conn.InboundMessages.findOne({
          attributes: ['body', 'profile_name'],
          where: { messageFrom: senderID, status: { [Op.ne]: 'CLOSED' }, smsStatus: 'received' },
          order: [
            ['inboundId', 'DESC']
          ]
        })
        const msg = 'Thank you for your follow up. \n' +
          `Your ticket number ${inboundMsgData.body} has been updated.\n` +
          'Our team will be in touch with you accordingly.\n' +
          'Thank you and have a good day!\n'

        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons
        }
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'FIXEDLINE_MENU') {
        const accountDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/account-details?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const accountDetailsData = JSON.parse(accountDetailsResponse.body)?.data || {}
        logger.info('accountDetailsData', accountDetailsData)

        // let msg = ''
        let rowsArr = [{
          "id": "1",
          "title": "Account",
          "description": "Account Details"
        },
        {
          "id": "2",
          "title": "Plan",
          "description": "Plan Info"
        },
        {
          "id": "3",
          "title": "Booster",
          "description": "Active Booster Details"
        },
        {
          "id": "4",
          "title": "Bill",
          "description": "Bill Info"
        },
        {
          "id": "5",
          "title": "Service",
          "description": "Fixed-line Broadband Service Status"
        }]


        let interactivePayload = {
          msgType: "list",//"callToActionButton"
          text: `Hello${accountDetailsData?.name ? ',' : '!'} ${accountDetailsData?.name || ''}`,
          buttonName: 'Main Menu',
          rows: rowsArr
        }

        // msg = msg + '\nType HELP to return to back to menu'
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'FIXEDLINE_PLAN_INFO') {
        const planInfoResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/fixedline-plan-info?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })

        const planInfoData = JSON.parse(planInfoResponse.body)?.data || {}
        const planInfoStatusCode = JSON.parse(planInfoResponse.body)?.statusCode || {}
        logger.info('planInfoData', planInfoData)
        let msg = ''
        if (planInfoData && planInfoStatusCode === 'SUCCESS') {
          if (planInfoData?.charge === 'DEFAULT_PLAN') {
            msg = msg + 'Your Plan Info:\n\n'
            msg = msg + `Plan Name: ${planInfoData?.productName || ''}\n`
            msg = msg + `Plan Status: ${planInfoData?.planStatus || ''}\n`
            msg = msg + `Data Usage: ${Number((planInfoData?.dataUsage || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB\n`
            msg = msg + `Data Limit: ${Number((planInfoData?.dataLimit || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB\n`
          } else {
            msg = msg + 'Your Plan Info:\n\n'
            msg = msg + `Plan Name: ${planInfoData?.productName || ''}\n`
            msg = msg + `Monthly Rental: BND ${Number(planInfoData?.charge).toFixed(2) || Number(0).toFixed(2)}\n`
            msg = msg + `Plan Status: ${planInfoData?.planStatus || ''}\n`
            msg = msg + `Data Usage: ${Number((planInfoData?.dataUsage || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB\n`
            msg = msg + `Data Limit: ${Number((planInfoData?.dataLimit || 0) / (1024 * 1024 * 1024)).toFixed(1)} GB\n`
          }
        } else {
          //\nKindly Talk2Us at 111 for more info.
          msg = msg + 'Oh no! Your plan details are currently unavailable.'
        }
        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons
        }
        // msg = msg + '\n\nType HELP to return back to menu'
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'BOOSTER_DETAILS_FIXEDLINE') {
        const boosterDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/booster-details-fixedline?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const boosterDetailsData = JSON.parse(boosterDetailsResponse.body)?.data || {}
        const statusCode = JSON.parse(boosterDetailsResponse.body)?.statusCode || {}

        if (boosterDetailsData && Array.isArray(boosterDetailsData) && boosterDetailsData.length > 0 && statusCode === 'SUCCESS') {
          let msg = 'Your Data Booster Details:\n\n'
          for (const booster of boosterDetailsData) {
            msg = msg + `Booster Name: ${booster?.product_name || ''}\n`
            // msg = msg + `Booster Balance: ${Number(Number(Number(booster?.Limit) / (1024 * 1024 * 1024)).toFixed(1) - Number(Number(booster?.AccumulatedUsage) / (1024 * 1024 * 1024)).toFixed(1)).toFixed(1) || ''} GB\n`
            msg = msg + `Booster Start Date: ${booster?.start_date || ''}\n`
            msg = msg + `Booster Expiry Date: ${booster?.expiry_date || ''}\n`
            //}
          }

          let interactivePayload = {
            msgType: "callToActionButton",//"callToActionButton"
            text: msg,
            buttonName: 'Main Menu',
            buttons
          }


          // msg = msg + '\n\nType HELP to return back to menu'
          // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        } else {
          let msg = ''
          msg = msg + 'No active booster available at the moment.'
          let interactivePayload = {
            msgType: "callToActionButton",//"callToActionButton"
            text: msg,
            buttonName: 'Main Menu',
            buttons
          }
          //\nPurchase your booster via imagineGo or via SMS.\nPlease visit our website at https://imagine.com.bn/ \n\nKindly Talk2Us at 111 for more info.
          // msg = msg + '\n\nType HELP to return back to menu'
          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
          // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
        }
      } else if (sourceResponse === 'COMMON_MENU') {
        const accountDetailsResponse = await Got.post({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/account-details?tenant-id=${tenantId}`,
          body: JSON.stringify({ accessNumber: senderID }),
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
        const accountDetailsData = JSON.parse(accountDetailsResponse.body)?.data || {}
        logger.info('accountDetailsData', accountDetailsData)

        // let msg = ''
        let rowsArr = []
        if (accountDetailsData?.accountNo) {
          rowsArr.push(
            {
              "id": "1",
              "title": "Account",
              "description": "Account Details"
            },
            {
              "id": "2",
              "title": "Plan",
              "description": "Plan Info"
            },
            {
              "id": "3",
              "title": "Booster",
              "description": "Active Booster Details"
            },
            {
              "id": "4",
              "title": "Bill",
              "description": "Bill Info"
            },
            {
              "id": "5",
              "title": "Service",
              "description": "Service Status"
            }
          )
          // msg = msg + `Hello, ${accountDetailsData?.name || ''}!\n`
          // msg = msg + 'For more options, choose from the menu below:\n'
          // msg = msg + 'Type 1 for Account Details\n'
          // msg = msg + 'Type 2 for Plan Info\n'
          // msg = msg + 'Type 3 for Active Booster Details\n'
          // msg = msg + 'Type 4 for Bill Info\n'
          // msg = msg + 'Type 5 for Service Status\n'
        } else {
          rowsArr.push(
            {
              "id": "1",
              "title": "Account",
              "description": "Account Details"
            },
            {
              "id": "2",
              "title": "Plan",
              "description": "Plan Info"
            },
            {
              "id": "3",
              "title": "Booster",
              "description": "Active Booster Details"
            },
            {
              "id": "4",
              "title": "Bill",
              "description": "Bill Info"
            },
            {
              "id": "5",
              "title": "Broadband Service",
              "description": "Fixed-line Broadband Service Status"
            }
          )
          // msg = msg + 'Hello!\n'
          // msg = msg + 'For more options, choose from the menu below:\n'
          // msg = msg + 'Type 1 for Account Details\n'
          // msg = msg + 'Type 2 for Plan Info\n'
          // msg = msg + 'Type 3 for Active Booster Details\n'
          // msg = msg + 'Type 4 for Bill Info\n'
          // msg = msg + 'Type 5 for Fixed-line Broadband Service Status\n'
        }

        rowsArr.push(
          {
            "id": "HELP",
            "title": "Help",
            "description": "HELP to return to back to menu"
          }
        )

        // msg = msg + '\nType HELP to return to back to menu'
        let interactivePayload = {
          msgType: "list",
          text: `Hello${accountDetailsData?.name ? ',' : '!'} ${accountDetailsData?.name || ''}`,
          buttonName: "Main Menu",
          rows: rowsArr
        }
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'CREATE_COMPLAINT_CHOICE') {
        let msg = ''

        const workflowHdrResponse = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true,
          attributes: ['wfHdrId', 'nextTaskId']
        })
        const serviceNo = workflowHdrResponse.nextTaskId

        let getExistingService = await conn.CustServices.findOne({
          include: [{
            model: conn.BusinessEntity,
            as: "serviceStatusDesc",
            attributes: ['description']
          }],
          where: {
            serviceNo: serviceNo
          }
        })
        getExistingService = getExistingService?.dataValues ?? getExistingService

        msg = `We sincerely apologise for the inconvenience.\n Your service is currently ${getExistingService?.serviceStatusDesc.description}.\n\n`
        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons: [
            {
              "type": "reply",
              "reply": {
                "id": "1",
                "title": "Create Interaction"
              }
            },
            {
              "type": "reply",
              "reply": {
                "id": "HELP",
                "title": "Help"
              }
            }
          ]
        }

        // msg = msg + ` Type 1 for Create Interaction`
        // msg = msg + '\n\nType HELP to return back to menu'


        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        // sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source)
      } else if (sourceResponse === 'SERVICE_HEALTH_MSG') {
        let msg = `Your service status looks excellent! If there is any further issues`;
        let interactivePayload = {
          msgType: "callToActionButton",//"callToActionButton"
          text: msg,
          buttonName: 'Main Menu',
          buttons
        }
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)

      } else if (sourceResponse === 'GET_INTERACTION_LIST') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });

        const expr = '$.context.Activity_1i7sfw7.task_1.response.value.data';
        const expression = jsonata(expr);
        const list = await expression.evaluate(workflowHdrData?.wfContext);

        // let msg = 'Please choose your service category\n'
        let i = 1;
        let rowsArr = [];
        for (const l of list?.data) {
          // msg = msg + `Type ${i} for ${l.service_name} - ${l.service_no}\n`
          rowsArr.push(
            {
              "id": l.intxnNo,
              "title": "" + l.intxnNo + "",
              "description": `${l?.departmentDetails?.unitDesc} - ${l?.roleDetails?.roleDesc} `
            },
          )
          i = i + 1
        }

        rowsArr = [...rowsArr, {
          "id": "SEARCH",
          "title": "Search",
          "description": "Search Interaction with Interaction Number"
        }, {
          "id": "HELP",
          "title": "Help",
          "description": "HELP to return back to menu"
        }]
        // msg = msg + '\n \nType HELP to return back to menu'
        const workflowHdrResponse = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true,
          attributes: ['wfHdrId', 'wfContext']
        })
        const context = workflowHdrResponse.wfContext
        context.interactionList = list
        await conn.WorkflowHdr.update({ wfContext: context }, { where: { wfHdrId: workflowHdrResponse.wfHdrId } });

        // let interactivePayload = {
        //   msgType: "list",
        //   text: "Please choose your service category",
        //   buttonName: "Main Menu",
        //   rows: rowsArr
        // }

        const chunkedArray = chunkArray(rowsArr, 10);

        for (let i = 0; i < chunkedArray?.length; i++) {
          let interactivePayload = {
            msgType: "list",
            text: "Please choose your Interaction",
            buttonName: "Interaction List",
            rows: chunkedArray[i]
          }
          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)

        }
      } else if (sourceResponse === 'SEND INTERACTION CHOICE') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });
        const expr = '$.context.Activity_0mhpvjs.task_1.response.value.body'

        const expression = jsonata(expr);
        const interactionNo = await expression.evaluate(workflowHdrData?.wfContext);

        let checkInteraction = await conn.Interaction.findOne({
          where: {
            intxnNo: interactionNo
          }
        })
        checkInteraction = checkInteraction?.dataValues ?? checkInteraction

        let list = [];

        if (checkInteraction && checkInteraction?.intxnStatus === 'NEW' && !checkInteraction?.currUser) {
          list = [{
            "type": "reply",
            "reply": {
              "id": "CANCEL",
              "title": "Cancel Interaction"
            }
          }, {
            "type": "reply",
            "reply": {
              "id": "FOLLOWUP",
              "title": "FollowUp Interaction"
            }
          }]
        } else if (checkInteraction && checkInteraction?.intxnStatus !== 'NEW') {
          list = [{
            "type": "reply",
            "reply": {
              "id": "FOLLOWUP",
              "title": "FollowUp Interaction"
            }
          }]
        }

        // let interactivePayload = {
        //   msgType: "callToActionButton",
        //   text: "Please choose Interaction Action",
        //   buttonName: "Interaction Menu",
        //   rows: list
        // }

        let interactivePayload = {
          msgType: "callToActionButton",
          text: "Please choose Interaction Action",
          buttonName: 'Interaction Menu',
          buttons: list
        }

        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
      } else if (sourceResponse === 'CANCEL REASON') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });

        const expr = '$.context.Activity_18l45jw.task_1.response.value.data.INTXN_STATUS_REASON';
        const expression = jsonata(expr);
        const list = await expression.evaluate(workflowHdrData?.wfContext);

        // let msg = 'Please choose your service category\n'
        let i = 1;
        let rowsArr = [];
        for (const l of list) {
          // msg = msg + `Type ${i} for ${l.service_name} - ${l.service_no}\n`
          rowsArr.push(
            {
              "id": l.code,
              "title": "" + l.code + "",
              "description": `${l.description}`
            },
          )
          i = i + 1
        }

        rowsArr.push({
          "id": "HELP",
          "title": "Help",
          "description": "HELP to return back to menu"
        })
        // msg = msg + '\n \nType HELP to return back to menu'
        const workflowHdrResponse = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true,
          attributes: ['wfHdrId', 'wfContext']
        })
        const context = workflowHdrResponse.wfContext
        context.cancelReason = list
        await conn.WorkflowHdr.update({ wfContext: context }, { where: { wfHdrId: workflowHdrResponse.wfHdrId } });

        // let interactivePayload = {
        //   msgType: "list",
        //   text: "Please choose your service category",
        //   buttonName: "Main Menu",
        //   rows: rowsArr
        // }

        const chunkedArray = chunkArray(rowsArr, 10);

        for (let i = 0; i < chunkedArray?.length; i++) {
          let interactivePayload = {
            msgType: "list",
            text: "Please choose Interaction cancel reason",
            buttonName: "Cancel Reason",
            rows: chunkedArray[i]
          }
          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        }
      } else if (sourceResponse === 'CANCEL CONFIRM') {
        // let list = [
        //   {
        //     "id": "YES",
        //     "title": "Yes",
        //     "description": "Confirm to Cancel Interaction"
        //   },
        //   {
        //     "id": "NO",
        //     "title": "No",
        //     "description": "No to cancel Interaction"
        //   }
        // ];

        let list = [{
          "type": "reply",
          "reply": {
            "id": "YES",
            "title": "Yes"
          }
        }, {
          "type": "reply",
          "reply": {
            "id": "NO",
            "title": " No"
          }
        }]

        // let interactivePayload = {
        //   msgType: "list",
        //   text: "Please choose Confrim Cancel",
        //   buttonName: "Confirm Menu",
        //   rows: list
        // }

        let interactivePayload = {
          msgType: "callToActionButton",
          text: "Please choose Confrim Cancel",
          buttonName: 'Confirm Menu',
          buttons: list
        }
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)

      } else if (sourceResponse === 'CANCEL INTERACTION') {

        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });
        const expr = '$.context.Activity_0mhpvjs.task_1.response.value.body'
        const cancelReasonExpr = '$.context.Activity_0sq4601.task_1.response.value.body'

        const expression = jsonata(expr);
        const cancelReasonexpression = jsonata(cancelReasonExpr);

        const interaction = await expression.evaluate(workflowHdrData?.wfContext);
        const cancelReason = await cancelReasonexpression.evaluate(workflowHdrData?.wfContext);
        const url = `http://localhost:${interactionPort}/api/interaction/cancel/whatsapp/${interaction}`
        let cancelInteractionResponse
        let cancelInteractionStatusCode
        try {
          cancelInteractionResponse = await Got.put({
            headers: {
              'content-type': 'application/json',
              'x-tenant-id': tenantId
            },
            url: url,
            body: JSON.stringify({ cancelReason: cancelReason }),
            retry: 0
          }, {
            https: { rejectUnauthorized: false }
          })

          // const accountDetailsData = JSON.parse(cancelInteractionResponse.body)?.data || {}
          cancelInteractionStatusCode = cancelInteractionResponse ? JSON?.parse(cancelInteractionResponse?.body)?.status : ''

        } catch (error) {
          console.error(error)
        }
        let msg = ''
        if (cancelInteractionStatusCode === 200) {
          msg = `Interaction has been cancelled Successfully - ${interaction}. Thanks You! if you have any question or need help with anything, feel free to ask, I am here to assist you!! \n\n_Note: Type *Help* at for main menu_`
        } else {
          msg = `We are facing a technical error. Please try again later.\n\n_Note: Type *"Help"* at for main menu_`
        }

        sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source, type, env)
      } else if (sourceResponse === 'WELCOME') {
        const userContactNo = getMobileNumber(senderID)
        let checkExistingUser = await conn.User.findOne({
          where: {
            contactNo: userContactNo
          }
        })
        checkExistingUser = checkExistingUser?.dataValues ?? checkExistingUser
        let msg = `Hi *${checkExistingUser?.firstName || ''}*, Let's Keep the postivity flowing always! 😀.\nWhat would you like to explore...`
        const menuList = await conn.ChatMenu.findAll({
          where: {
            menuName: 'WHATSAPP_MAIN_MENU'
          }
        })
        if (!menuList) {
          msg = 'Sorry for the inconvenience. Currently we are facing a technical issue. Please try again after some time.'
          sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source, type, env)
        }
        const list = menuList.map((l) => ({ id: l?.jsonString?.value, title: l?.jsonString?.label, description: l?.jsonString?.description }))

        let interactivePayload = {
          msgType: "list",
          text: msg,
          buttonName: "Menu",
          rows: list
        }
        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
      } else if (sourceResponse === 'LIST_SERVICE_CATEGORY') {

        const listDepartment = await conn.BusinessEntity.findAll({
          where: {
            codeType: 'PROD_SUB_TYPE',
            status: 'AC'
          }
        })
        let msg = 'Please select which Service the request should be routed to'
        if (!listDepartment) {
          msg = 'Sorry for the inconvenience. Currently we are facing a technical issue. Please try again after some time.'
          sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source, type, env)
        }
        const list = listDepartment.map((l) => ({ id: l.code, title: l.description, description: l.description }))
        list.push({
          "id": "HELP",
          "title": "Help",
          "description": "HELP to return back to menu"
        })

        const chunkedArray = chunkArray(list, 9);

        for (let i = 0; i < chunkedArray?.length; i++) {
          let interactivePayload = {
            msgType: "list",
            text: msg,
            buttonName: "Service",
            rows: chunkedArray[i]
          }
          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        }
      } else if (sourceResponse === 'LIST_FREQ_KB') {

        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });
        const expr = '$.context.Activity_10abw5p.task_1.response.value.body'

        const expression = jsonata(expr);
        const serviceCategory = await expression.evaluate(workflowHdrData?.wfContext);

        const url = `http://localhost:${interactionPort}/api/interaction/frequent`
        let cancelInteractionResponse
        let frequenctStatement
        try {
          cancelInteractionResponse = await Got.post({
            headers: {
              'content-type': 'application/json',
              'x-tenant-id': tenantId
            },
            url: url,
            body: JSON.stringify({ serviceCategory: serviceCategory, limit: 8 }),
            retry: 0
          }, {
            https: { rejectUnauthorized: false }
          })
        } catch (error) {
          logger.error(error)
        }

        // const accountDetailsData = JSON.parse(cancelInteractionResponse.body)?.data || {}
        frequenctStatement = cancelInteractionResponse ? JSON?.parse(cancelInteractionResponse?.body)?.data : ''
        const list = frequenctStatement && frequenctStatement.map((l) => ({ id: l.requestId, title: l.requestStatement.slice(0, 20) + '...', description: l?.requestStatement?.slice(0, 69) + '...' }))

        list.push({
          "id": "OTHERS",
          "title": "Others",
          "description": "To search on specific Keyword"
        })

        list.push({
          "id": "HELP",
          "title": "Help",
          "description": "HELP to return back to menu"
        })

        const headerMsg = await conn.ChatMenu.findOne({
          where: {
            menuName: 'WHATSAPP_LIST_HEADER_MSG'
          }
        })        
       
        const msg = headerMsg.jsonString.description ? headerMsg.jsonString.description : 'Please choose your statement'

        const chunkedArray = chunkArray(list, 10);

        const buttonName = await conn.ChatMenu.findOne({
          where: {
            menuName: 'WHATSAPP_LIST_BUTTON_NAME'
          }
        })

        for (let i = 0; i < chunkedArray?.length; i++) {
          let interactivePayload = {
            msgType: "list",
            text: msg,
            buttonName: buttonName.jsonString.description ? buttonName.jsonString.description : 'Statements',
            rows: chunkedArray[i]
          }
          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        }
      } else if (sourceResponse === 'SEND_KB_LIST') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });
        const expr = '$.context.Activity_0pp8kad.task_1.response.value.data.rows'

        const expression = jsonata(expr);
        const statementList = await expression.evaluate(workflowHdrData?.wfContext);
        let list = []
        if (statementList && Array.ArrayList(statementList) && statementList?.length > 0) {
          list = statementList && statementList?.map((l) => ({ id: l.requestId, title: l?.shortStatement?.slice(0, 24), description: l?.requestStatement?.slice(0, 69) + '...' }))
        }
        const headerMsg = await conn.ChatMenu.findOne({
          where: {
            menuName: 'WHATSAPP_LIST_HEADER_MSG'
          }
        })        

        const msg = headerMsg.jsonString.description ? headerMsg.jsonString.description : 'Please choose your statement'

        list.push({
          "id": "HELP",
          "title": "Help",
          "description": "HELP to return back to menu"
        })
        const chunkedArray = chunkArray(list, 10);

        // list.push({
        //   "id": "DIFFERENT",
        //   "title": "New Keyword",
        //   "description": "Try with new key words"
        // })
        const buttonName = await conn.ChatMenu.findOne({
          where: {
            menuName: 'WHATSAPP_LIST_BUTTON_NAME'
          }
        })

        for (let i = 0; i < chunkedArray?.length; i++) {
          let interactivePayload = {
            msgType: "list",
            text: msg,
            buttonName: buttonName.jsonString.description ? buttonName.jsonString.description : 'Statements',
            rows: chunkedArray[i]
          }
          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        }
      } else if (sourceResponse === 'CREATE_INTERACTION') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });

        const expr = '$.context.Activity_0rwb6qa.task_1.response.value.data'
        const custExpr = '$.context.Activity_0qplvqm.task_1.response.value.user.customer'
        const remarksContext = '$.context.Activity_075hfu1.task_1.response.value.body'
        const expression = jsonata(expr);
        const customerExpr = jsonata(custExpr)
        const remarksExpr = jsonata(remarksContext)
        const interactionData = await expression.evaluate(workflowHdrData?.wfContext);
        const customerData = await customerExpr.evaluate(workflowHdrData?.wfContext);
        const remarks = await remarksExpr.evaluate(workflowHdrData?.wfContext);

        const url = `http://localhost:${interactionPort}/api/interaction/conversation-interaction`
        let createInteractionResponse
        let createInteraction

        const requestBody = {
          channel: 'WTSAPP',
          remarks: remarks || interactionData?.requestStatement,
          statement: interactionData?.requestStatement,
          customerId: customerData?.customerId,
          serviceType: interactionData?.serviceType,
          statementId: interactionData?.requestId,
          customerUuid: customerData?.customerUuid,
          isResolvedBy: 'HUMAN',
          priorityCode: 'PRTYMED',
          problemCause: interactionData?.intxnCause,
          interactionType: interactionData?.intxnType,
          serviceCategory: interactionData?.serviceCategory,
          contactPreference: '[CNT_PREF_WHATSAPP,CNT_PREF_EMAIL,CNT_PREF_SMS]',
          statementSolution: '-',
          interactionCategory: interactionData?.intxnCategory
        }

        logger.debug(requestBody)

        try {
          createInteractionResponse = await Got.post({
            headers: {
              'content-type': 'application/json',
              'x-tenant-id': tenantId
            },
            url: url,
            body: JSON.stringify(requestBody),
            retry: 0
          }, {
            https: { rejectUnauthorized: false }
          })
          createInteraction = createInteractionResponse ? JSON?.parse(createInteractionResponse?.body) : ''
        } catch (error) {
          logger.error(error)
        }
        let msg = ''
        logger.debug('Interaction Created response', createInteraction)
        if (createInteraction?.status === 200) {
          msg = `Here is the Interaction ID *#${createInteraction?.data?.intxnNo}*.\nThanks You! if you have any question or need help with anything, feel free to ask, I am here to assist you!! \n\n_Note: Type *Help* at for main menu_`
        } else {
          msg = `We are facing a technical error. Please try again later.\n\n_Note: Type "Help" at for main menu_`
        }
        sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source, type, env)
        await backMenu(pageObjectId, senderID, whatsappSessionData.reportId, conn, source, type, env)
      } else if (sourceResponse === 'CREATE_FOLLOWUP') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });

        const expr = '$.context.Activity_1rb83rz.task_1.response.value.body'
        const custExpr = '$.context.Activity_0mhpvjs.task_1.response.value.body'
        const expression = jsonata(expr);
        const interactionExpr = jsonata(custExpr)
        const remarks = await expression.evaluate(workflowHdrData?.wfContext);
        const interactionNumber = await interactionExpr.evaluate(workflowHdrData?.wfContext);

        const url = `http://localhost:${interactionPort}/api/interaction/whatsapp/followUp`

        const requestBody = {
          interactionNumber: interactionNumber,
          remarks: remarks,
          priorityCode: 'PRTYMED',
          source: 'WTSAPP'
        }

        let createInteractionResponse
        let createInteraction
        try {
          createInteractionResponse = await Got.post({
            headers: {
              'content-type': 'application/json',
              'x-tenant-id': tenantId
            },
            url: url,
            body: JSON.stringify(requestBody),
            retry: 0
          }, {
            https: { rejectUnauthorized: false }
          })
          createInteraction = createInteractionResponse ? JSON?.parse(createInteractionResponse?.body) : ''
        } catch (error) {
          logger.error(error)
        }
        let msg = ''
        if (createInteraction?.status === 200) {
          msg = createInteraction?.message + ' Thanks You! if you have any question or need help with anything, feel free to ask, I am here to assist you!! \n\n_Note: Type *Help* at for main menu_'
        } else {
          msg = `We are facing a technical error. Please try again later.\n\n_Note: Type "Help" at for main menu_`
        }
        sendResponse = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source, type, env)

      } else if (sourceResponse === 'BACK_TO_MENU') {
        const list = [{
          "type": "reply",
          "reply": {
            "id": "HELP",
            "title": "return back to main menu"
          }
        }]

        let interactivePayload = {
          msgType: "callToActionButton",
          text: "Back to Main Menu",
          buttonName: 'Menu',
          buttons: list
        }

        sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
      } else if (sourceResponse === 'GET_SERVICE_LIST') {
        let workflowHdrData = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true
        });

        const expr = '$.context.Activity_1c3f965.task_1.response.value.data.rows.serviceDetails';
        const reservationExpr = '$.context.Activity_1c3f965.task_1.response.value.data.rows.reservation';
        const expression = jsonata(expr);
        const reservationExpression = jsonata(reservationExpr)
        const serviceList = await expression.evaluate(workflowHdrData?.wfContext);
        const reservationList = await reservationExpression.evaluate(workflowHdrData?.wfContext)

        let i = 1;
        let rowsArr = [];
        let resvArr = []
        for (const l of serviceList) {
          rowsArr.push(
            {
              "id": l.serviceNo,
              "title": "" + l.serviceName + "",
              "description": `${l?.serviceCatDesc?.description} - ${l?.serviceTypeDesc?.description} `
            },
          )
          i = i + 1
        }

        resvArr = reservationList.map((r) => ({ id: r.appointmentTxnNo, title: "" + r.appointModeDesc.description + "", description: "" + r.appointModeValueDesc.description + "" }))
        resvArr = [...resvArr, {
          "id": "HELP",
          "title": "Help",
          "description": "HELP to return back to menu"
        }]

        rowsArr.push({
          "id": "HELP",
          "title": "Help",
          "description": "HELP to return back to menu"
        })
        // msg = msg + '\n \nType HELP to return back to menu'
        const workflowHdrResponse = await conn.WorkflowHdr.findOne({
          where: {
            entityId: senderID,
            wfStatus: 'CREATED'
          },
          raw: true,
          attributes: ['wfHdrId', 'wfContext']
        })
        const context = workflowHdrResponse.wfContext
        context.interactionList = rowsArr
        await conn.WorkflowHdr.update({ wfContext: context }, { where: { wfHdrId: workflowHdrResponse.wfHdrId } });

        // let interactivePayload = {
        //   msgType: "list",
        //   text: "Please choose your service category",
        //   buttonName: "Main Menu",
        //   rows: rowsArr
        // }

        if (serviceList && serviceList?.length > 0) {
          const chunkedArray = chunkArray(rowsArr, 10);

          for (let i = 0; i < chunkedArray?.length; i++) {
            let interactivePayload = {
              msgType: "list",
              text: "Please choose your Service",
              buttonName: "Service List",
              rows: chunkedArray[i]
            }
            sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
          }
        }

        if (reservationList && reservationList?.length) {
          const revChunkedArray = chunkArray(resvArr, 10);

          for (let i = 0; i < revChunkedArray?.length; i++) {
            let revInteractivePayload = {
              msgType: "list",
              text: "Please choose your Reservation",
              buttonName: "Reservation List",
              rows: revChunkedArray[i]
            }
            sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, revInteractivePayload, whatsappSessionData.reportId, conn, source, type, env)
          }
        }
      } else if (sourceResponse === 'LIST_CUSTOMERS') {
        const detailsResponse = await Got.get({
          headers: { 'content-type': 'application/json' },
          url: `http://localhost:${port}/api/whatsapp/customer-list?tenant-id=${tenantId}`,
          retry: 0
        }, {
          https: { rejectUnauthorized: false }
        })
		
        const detailsData = JSON.parse(detailsResponse.body)?.data || {}
        const list = detailsData && detailsData.map((l) => ({ id: l.customerNo, title: (l.firstName + l.lastName).slice(0, 20) + '...', description: (l.firstName + l.lastName)?.slice(0, 69) + '...' }))
		
		const msg = 'Please select any one'
		
        list.push({
          "id": "HELP",
          "title": "Help",
          "description": "HELP to return back to menu"
        })
        const chunkedArray = chunkArray(list, 10);

        for (let i = 0; i < chunkedArray?.length; i++) {
          let interactivePayload = {
            msgType: "list",
            text: msg,
            buttonName: 'List',
            rows: chunkedArray[i]
          }	  

          sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, whatsappSessionData.reportId, conn, source, type, env)
        }
      }      
      else {
        sendResponse = await sendWhatsappReply(pageObjectId, senderID, sourceResponse, whatsappSessionData.reportId, conn, source, type, env)
      }
      if (sendResponse === 'Sent') {
        const body = {
          from: source === WASource ? WHATSAPP.WHATSAPP_NUMBER : WHATSAPP.WA_IHUB_NUMBER,
          to: senderID,
          type: 'text',
          body: sourceResponse,
          smsStatus: 'sent',
          chatSource: source || '',
          payload: sourceResponseonse?.payload || {}
        }
        const resp = await storeSentChat(body, conn)
        if (wfResponse?.status === 200) {
          let taskName = ''
          const key = Object.keys(wfResponse?.message)
          if (wfResponse && wfResponse?.message && key.length > 0) {
            taskName = wfResponse.message[key[0]].taskName
            if (!taskName) {
              taskName = wfResponse.message.taskName
            }
          }
          await updateChat({ taskName: taskName, body }, senderID, resp?.inboundId, conn)
        }
        if (resp.status === 'Created' && typeof (wfResponse.message) === 'object') {
          if (wfResponse?.message?.executeSendMessageTaskResult?.type === 'SENDMESSAGE' || wfResponse?.message?.type === 'API') {
            callAgain = true
          }
        }
      }
    }
  }
  return { callAgain: callAgain }
}

export const storeChat = async (body, senderID, source, reportId, conn) => {
  // console.log('body------->', JSON.stringify(body))
  // console.log('body?.interactive?.type------->', body?.interactive?.type)
  const t = await conn.sequelize.transaction()
  try {
    logger.info('Creating Inbound Chat Record')
    let flag
    const data = {
      waId: senderID,
      smsStatus: 'received',
      body: body.type === 'text' ? body.text.body : body?.interactive?.type === 'list_reply' ? body?.interactive?.list_reply?.id : body?.interactive?.type === 'button_reply' ? body?.interactive?.button_reply?.id : body[body.type]?.id || '',
      // body: body.type === 'text' ? body?.text?.body : body[body.type]?.id || '',
      messageTo: source === WASource ? WHATSAPP.WHATSAPP_NUMBER : WHATSAPP.WA_IHUB_NUMBER,
      messageFrom: senderID,
      // createdAt: new Date(),
      createdBy: systemUserId,
      status: 'in progress',
      flag: flag || '',
      chatSource: source
    }
    // console.log("InboundMessages Data:", data)
    const resp = await conn.InboundMessages.create(data, { transaction: t })
    // console.log('Successfully created Inbound message')
    const data1 = {
      reportId,
      msgFrom: senderID,
      msgTo: source === WASource ? WHATSAPP.WHATSAPP_NUMBER : WHATSAPP.WA_IHUB_NUMBER,
      message: body.type === 'text' ? body.text.body : body?.interactive?.type === 'list_reply' ? body?.interactive?.list_reply?.id : body?.interactive?.type === 'button_reply' ? body?.interactive?.button_reply?.id : body[body.type]?.id || '',

      // message: body.type === 'text' ? body?.text?.body : body[body.type]?.id || '',
      msgSource: 'USER',
      createdBy: systemUserId,
      tranId: uuidv4()
    }
    // console.log('WhatsAppChatHistory data:', data1)
    const resp1 = await conn.WhatsAppChatHistory.create(data1, { transaction: t })

    let response
    if (resp && resp1) {
      response = { status: 'Created', inboundId: resp?.inboundId }
    }
    await t.commit()
    logger.debug('Successfully created chat')
    return response
  } catch (error) {
    logger.error(error, 'Error while creating chat record')
    return 'Error'
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

export const updateChat = async (body, senderID, inboundId, conn) => {
  logger.info('Updating chat record')
  const t = await conn.sequelize.transaction()
  try {
    const menuValue = {}
    if (!isEmpty(body?.taskName)) {
      if (body.body && body.body?.smsStatus !== 'received') {
      } else {
        const inbound = await conn.InboundMessages.findAndCountAll({
          attributes: ['menuItem'],
          where: {
            waId: senderID,
            smsStatus: 'sent'
          },
          order: [['inbound_id', 'DESC']]
        })
        if (inbound?.count > 0) {
          menuValue.menuId = inbound.rows[0]?.dataValues?.menuItem || ''
        }
      }
    } else {
      if (body.body && body.body?.smsStatus === 'received') {
        const inbound = await conn.InboundMessages.findAndCountAll({
          attributes: ['menuItem'],
          where: {
            waId: senderID,
            smsStatus: 'sent'
          },
          order: [['inbound_id', 'DESC']]
        })
        if (inbound?.count > 0) {
          menuValue.menuId = inbound.rows[0]?.dataValues?.menuItem || ''
        }
      }
    }
    if (inboundId !== null && inboundId !== undefined) {
      const data = { menuItem: menuValue?.menuId || '' }
      await conn.InboundMessages.update(data, { where: { inboundId }, transaction: t })
    }
    await t.commit()
    logger.debug('Successfully Updated chat')
    return 'Updated'
  } catch (error) {
    logger.error(error, 'Error while updating Chat')
    return 'Error'
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

export const storeSentChat = async (body, conn) => {
  const t = await conn.sequelize.transaction()
  try {
    logger.info('Creating sent chat..problem')
    const data = {
      smsMessageSid: '',
      numMedia: '',
      profileName: '',
      waId: body.to,
      smsStatus: body.smsStatus,
      body: body.type === 'text' ? body.body : '',
      messageTo: body.to,
      messageFrom: body.from,
      accountSid: '',
      createdAt: new Date(),
      status: 'in progress',
      tableName: '',
      payload: body.payload || {},
      flag: '',
      createdBy: systemUserId
    }
    const resp = await conn.InboundMessages.create(data, { transaction: t })
    await t.commit()
    let response
    if (resp) {
      response = { status: 'Created', inboundId: resp?.inboundId }
    }
    logger.debug('Successfully created sent chat...')
    return response
  } catch (error) {
    logger.error(error, error)
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

export const setInboundMessages = async (senderID, options) => {
  const t = await sequelize.transaction()
  try {
    const { message, payload, menuId } = options
    const data = {
      waId: senderID,
      smsStatus: 'received',
      body: message || '',
      messageTo: WHATSAPP.WHATSAPP_NUMBER,
      messageFrom: senderID,
      createdAt: new Date(),
      status: 'in progress',
      flag: message || '',
      payload: payload,
      menuItem: menuId
    }
    const resp = await InboundMessages.create(data, { transaction: t })
    await t.commit()
    let response
    if (resp) {
      response = { status: 'Created', inboundId: resp?.inboundId }
    }
    return response
  } catch (error) {
    logger.info(error)
    return error
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

const sendOffers = async (pageObjectId, senderID, list, whatsappSessionData, tr, accessNumber, conn) => {
  let t;
  let msg = `Please see the best offer(s) for the Service Number: ${accessNumber && accessNumber || ''} \n\n`
  for (let i = 0; i < list.length; i++) {
    msg = msg + `${i + 1}. Offer Name - ${list[i]?.camp_name && list[i]?.camp_name || ''} \n`
    msg = msg + `Tariff - ${list[i]?.camp_description && list[i]?.camp_description || ''} \n`
    msg = msg + `Valid From - ${list[i]?.valid_from && moment(list[i]?.valid_from).format('DD-MMM-YYYY') || ''} \n`
    msg = msg + `Valid To - ${list[i]?.valid_to && moment(list[i]?.valid_to).format('DD-MMM-YYYY') || ''} \n\n`
  }
  msg = msg + '\nType *Help* to return back to menu'
  t = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, WAIHubSource, type, env)
  return t
}

const sendOpenTkts = async (pageObjectId, senderID, list, whatsappSessionData, tr, accessNumber, conn) => {
  let t;
  let msg = ` Current status of Open tickets of Service Number: ${accessNumber} \n\n`
  for (let i = 0; i < list.length; i++) {
    msg = msg + `${i + 1}. Ticket ID - ${list[i]?.intxnId && list[i]?.intxnId || ''} \n`
    msg = msg + `Service Type - ${list[i]?.serviceType && list[i]?.serviceTypeDesc?.description || ''} \n`
    msg = msg + `Ticket Type - ${list[i]?.intxnType || ''} \n`
    // msg = msg + `Problem Type - ${list[i]?.interactionCauseDescription?.description || ''} \n`
    msg = msg + `Description - ${list[i]?.intxnDescription && list[i]?.intxnDescription.trim() || ''} \n`
    msg = msg + `Date of Creation - ${list[i]?.createdAt && moment(list[i]?.createdAt).format('DD-MMM-YYYY') || ''} \n`
    msg = msg + `Current Status - ${list[i]?.intxnStatus && list[i]?.currStatusDesc?.description || ''} \n\n`
  }
  msg = msg + '\nType *Help* to return back to menu'
  t = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, WAIHubSource, type, env)
  return t
}

const sendConnectionStaus = async (pageObjectId, senderID, list, whatsappSessionData, tr, accessNumber, conn) => {
  let t;
  let planName;
  let msg;
  try {
    let customerInfo
    let planInfo
    let contractInfo
    let billingInfo
    const serviceInfo = await conn.CustServices.findOne({
      include: [
        { model: conn.BusinessEntity, as: 'serviceStatusDesc', attributes: ['description'] },
        { model: conn.BusinessEntity, as: 'serviceCatDesc', attributes: ['description'] },
        { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['description'] }
      ],
      where: {
        serviceNo: accessNumber
      },
    });

    if (serviceInfo) {
      customerInfo = await conn.Customer.findOne({
        include: [
          { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
          {
            model: conn.CustAccounts, as: 'customerAccounts',
            include: [
              { model: conn.BusinessEntity, as: 'accountStatus', attributes: ['description'] },
            ]
          }
        ],
        where: {
          customerId: serviceInfo.customerId
        }
      })

      planInfo = await conn.Product.findOne({
        where: {
          productId: serviceInfo?.planPayload
        }
      })
      contractInfo = await conn.Contract.findOne({
        include: [
          { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] }
        ],
        where: {
          customerId: serviceInfo.customerId,
          serviceId: serviceInfo.serviceId
        },
        logging: true
      })
      billingInfo = await conn.Invoice.findOne({
        include: [{ model: conn.BusinessEntity, as: 'invoiceStatusDesc', attributes: ['description'] }],
        where: {
          customerId: serviceInfo.customerId
        }
      })
    }
    const contractDetails = ''//JSON.parse(response.body);
    let latestMonthData;
    let outstandingAmount;
    let type = serviceInfo?.serviceCategory
    let customerName = customerInfo?.firstName + ' ' + customerInfo?.lastName
    let customerStatus = customerInfo?.statusDesc?.description
    let accountStatus = customerInfo?.customerAccounts[0]?.accountStatus?.description
    let unnServiceStatus;
    let mainBalance;
    let voice = '';
    let sms = '';
    let prepaidData = '';

    msg = `Customer Details of Service Number: ${accessNumber && accessNumber || ''} \n\n`
    msg = msg + `* Customer Details *\n`
    if (list?.customerSummary?.status?.code?.includes('ERROR')) {
      msg = msg + 'We are facing some technical issue. Please try again later.\n\n'
    } else {
      msg = msg + `Type - ${serviceInfo?.serviceStatusDesc?.description || ''} \n`
      //msg = msg + `Customer Name - ${ list?.customerSummary && list?.customerSummary?.return?.context?.contextElements?.filter((e) => e?.name === 'CustomerName') && list?.customerSummary?.return?.context?.contextElements?.filter((e) => e?.name === 'CustomerName')[0]?.value?.stringValue || '' } \n`
      msg = msg + `Customer Name - ${customerName || ''} \n`
      msg = msg + `Customer Status - ${customerStatus || ''} \n`
      msg = msg + `Account Status - ${accountStatus || ''} \n`
      // msg = msg + `UNN Service Status - ${ unnServiceStatus && (unnServiceStatus == 'ACTIVATED' || unnServiceStatus == 'ACTIVE') ? 'Active' : 'Inactive' || '' } \n`
      msg = msg + `Plan Name - ${planInfo && planInfo.productName || ''} \n\n`
    }

    if (type === 'PST_PRE') {
      msg = msg + `* Balance *\n`
      if (list?.serviceStatus?.mobile?.prepaid?.code?.includes('ERROR')) {
        msg = msg + 'We are facing some technical issue. Please try again later.\n\n'
      } else {
        msg = msg + `Main Balance - ${mainBalance && mainBalance || 'N/A'} \n`
        msg = msg + `Voice - ${voice && voice || 'N/A'} \n`
        msg = msg + `SMS - ${sms && sms || 'N/A'} \n`
        msg = msg + `Data - ${prepaidData && prepaidData || 'N/A'} \n`
      }
    } else {
      msg = msg + `* Contract Details *\n`
      if (contractInfo?.Status?.toUpperCase()?.includes('ERROR')) {
        msg = msg + 'We are facing some technical issue. Please try again later.\n\n'
      } else {
        msg = msg + `Contract name - ${contractInfo?.contractName && contractInfo?.contractName || 'N/A'} \n`
        msg = msg + `Contract Start Date - ${contractInfo?.plannedStartDate && moment(contractInfo?.plannedStartDate).format('DD-MMM-YYYY') || 'N/A'} \n`
        msg = msg + `Contract Expiry Date - ${contractInfo?.plannedEndDate && moment(contractInfo?.plannedEndDate).format('DD-MMM-YYYY') || 'N/A'} \n`
        msg = msg + `Contract Status - ${contractInfo?.statusDesc?.description || 'N/A'} \n`
        msg = msg + `Contract Penalty Amount - ${contractInfo?.penaltyAmount && contractInfo?.penaltyAmount === '0.0E0' ? 'BND 0.0' : contractDetails?.penaltyAmount ? 'BND ' + contractDetails?.penaltyAmount : 'N/A' || 'N/A'} \n\n`
      }

      msg = msg + `* Bill Details *\n`

      if (!billingInfo) {
        // msg = msg + 'We are facing some technical issue. Please try again later.\n\n'
        msg = msg + `We are not Find any invoice for this service ${accessNumber}.\n\n`
      }
      // else if (!latestMonthData || latestMonthData.length < 0) {
      //   msg = msg + 'We are facing some technical issue. Please try again later.\n\n'
      // }
      else {
        msg = msg + `Bill ID - ${billingInfo.invNo || 'N/A'} \n`
        msg = msg + `Total Outstanding Amount - ${'BND ' + billingInfo.invOsAmt || 'N/A'} \n`
        //msg = msg + `Last Bill Month - ${ latestMonthData && latestMonthData.length > 0 && latestMonthData[0]?.billMonth || 'N/A' } \n`
        msg = msg + `Bill Date - ${moment(billingInfo.invDate).format('DD-MMM-YYYY') || 'N/A'} \n`
        msg = msg + `Due Date - ${moment(billingInfo.dueDate).format('DD-MMM-YYYY') || 'N/A'} \n`
        msg = msg + `Bill Status - ${billingInfo?.invoiceStatusDesc?.description || 'N/A'} \n`
        //msg = msg + `Paid Date - ${ latestMonthData && latestMonthData.length > 0 && latestMonthData[0]?.paidDate.includes('0001-01-01') ? 'UNPAID' : moment(latestMonthData[0]?.paidDate).format('DD-MMM-YYYY') || 'N/A' } \n`
        //msg = msg + `Paid Amount - ${ latestMonthData && latestMonthData.length > 0 && 'BND ' + latestMonthData[0]?.paidAmount || 'N/A' } \n`
        //msg = msg + `Unpaid Amount - ${ latestMonthData && latestMonthData.length > 0 && 'BND ' + latestMonthData[0]?.unpaidAmount || 'N/A' } \n`
        //msg = msg + `Dispute Amount - ${ latestMonthData && latestMonthData.length > 0 && 'BND ' + latestMonthData[0]?.disputeAmount || 'N/A' } \n`
        //msg = msg + `Refund Amount - ${ latestMonthData && latestMonthData.length > 0 && 'BND ' + latestMonthData[0]?.refundAmount || 'N/A' } \n`
      }
    }
    msg = msg + '\n\nType *Help* to return back to menu'
  } catch (error) {
    logger.debug('error--->', error)
    msg = msg + 'We are facing some technical issue. Please try again later.'
  }
  t = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, WAIHubSource, type, env)
  return t
}

const sendfixedlineConnectionStatus = async (pageObjectId, senderID, list, whatsappSessionData, accessNumber, conn) => {
  let msg;
  let customerInfo

  const serviceInfo = await conn.CustServices.findOne({
    include: [
      { model: conn.BusinessEntity, as: 'serviceStatusDesc', attributes: ['description'] },
      { model: conn.BusinessEntity, as: 'serviceCatDesc', attributes: ['description'] },
      { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['description'] }
    ],
    where: {
      serviceNo: accessNumber,
      serviceType: 'ST_FIXED'
    },
  });
  if (serviceInfo) {
    customerInfo = await conn.Customer.findOne({
      include: [
        { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
        {
          model: conn.CustAccounts, as: 'customerAccounts',
          include: [
            { model: conn.BusinessEntity, as: 'accountStatus', attributes: ['description'] },
          ]
        }
      ],
      where: {
        customerId: serviceInfo.customerId
      }
    })
  }
  let type = serviceInfo?.serviceTypeDesc?.description
  let customerName = customerInfo?.firstName + ' ' + customerInfo?.lastName
  let customerStatus = customerInfo?.statusDesc?.description
  let accountStatus = customerInfo?.customerAccounts[0]?.accountStatus?.description
  if (list && list?.serviceStatus?.fixedLine?.code?.includes('ERROR')) {
    msg = 'We are facing some technical issue. Please try again later.\n'
  } else {
    msg = `Fixedline Service Connection Status for: ${list?.serviceStatus && list?.serviceStatus?.fixedLine?.serviceNumber && list?.serviceStatus?.fixedLine?.serviceNumber || ''} \n`

    if (list && list?.customerSummary?.status?.code?.includes('ERROR')) {
      msg = msg + 'We are facing some technical issue. Please try again later.\n'
    } else {
      msg = msg + `Service Type - FIXEDLINE\n`
      msg = msg + `Customer name - ${customerName || ''} \n`
      msg = msg + `Customer Status - ${customerStatus || ''} \n`
      msg = msg + `Account Status - ${accountStatus || ''} \n`
    }
    //msg = msg + `UNN Service Status - ${ list?.serviceStatus?.fixedLine?.status && (list?.serviceStatus?.fixedLine?.status === 'ACTIVATED' || list?.serviceStatus?.fixedLine?.status === 'ACTIVE') ? 'Active' : 'Inactive' || '' } \n\n`
  }
  msg = msg + `Type * Help * to return back to main menu`
  logger.info('msg', msg)
  let t = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, WAIHubSource, type, env)
  return t
}

const sendmobileConnectionStatus = async (pageObjectId, senderID, list, whatsappSessionData, accessNumber, conn) => {
  let customerInfo

  const serviceInfo = await conn.CustServices.findOne({
    include: [
      { model: conn.BusinessEntity, as: 'serviceStatusDesc', attributes: ['description'] },
      { model: conn.BusinessEntity, as: 'serviceCatDesc', attributes: ['description'] },
      { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['description'] }
    ],
    where: {
      serviceNo: accessNumber
    },
  });
  if (serviceInfo) {
    customerInfo = await conn.Customer.findOne({
      include: [
        { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
        {
          model: conn.CustAccounts, as: 'customerAccounts',
          include: [
            { model: conn.BusinessEntity, as: 'accountStatus', attributes: ['description'] },
          ]
        }
      ],
      where: {
        customerId: serviceInfo.customerId
      }
    })
  }

  let type = serviceInfo?.serviceTypeDesc?.description
  let customerName = customerInfo?.firstName + ' ' + customerInfo?.lastName
  let customerStatus = customerInfo?.statusDesc?.description
  let accountStatus = customerInfo?.customerAccounts[0]?.accountStatus?.description
  let msg;
  if (list && list?.status.includes('ERROR')) {
    msg = 'We are facing some technical issue. Please try again later.\n'
  } else {
    msg = `Service Connection Status for: ${list?.customerSummary && list?.customerSummary?.return?.context?.contextElements?.filter((e) => e?.name === 'AccessNo') && list?.customerSummary?.return?.context?.contextElements?.filter((e) => e?.name === 'AccessNo')[0]?.value?.stringValue || ''} \n`

    msg = msg + `Service Type - ${type || ''} \n`

    msg = msg + `Customer name - ${customerName || ''} \n`
    msg = msg + `Customer Status - ${customerStatus || ''} \n`
    msg = msg + `Account Status - ${accountStatus || ''} \n`
  }
  if (list && list?.serviceStatus?.mobile?.code?.includes('ERROR')) {
    msg = 'We are facing some technical issue. Please try again later.\n\n'
  } else {
    // console.log('list?.serviceStatus?.mobile?.subscriberStatus----problem-->', list?.serviceStatus?.mobile?.subscriberStatus)
    //msg = msg + `UNN Service Status - ${ list?.serviceStatus?.mobile?.subscriberStatus && list?.serviceStatus?.mobile?.subscriberStatus == 'ACTIVATED' ? 'Active' : 'Inactive' || '' } \n\n`
  }
  msg = msg + `Type * Help * to return back to main menu`

  logger.info('msg', msg)
  let t = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, WAIHubSource, type, env)
  return t
}

const sendWhatsappReply = async (phoneNumberId, to, replyMessage, reportId, conn, source, type, env) => {
  // const t = await conn.sequelize.transaction()
  try {
    logger.info('Sening whatsapp reply,Source:', source)
    let whatsAppConfig = await getWhatsappConfig(type, env, conn)
    if (!whatsAppConfig || isEmpty(whatsAppConfig) || whatsAppConfig?.status === statusCodeConstants?.ERROR) {
      logger.info('Please configure whatsapp configuration in Settings')
      return
    }
    whatsAppConfig = whatsAppConfig?.data ?? whatsAppConfig

    const whatsAppHistoryObj = {
      reportId,
      msgTo: to,
      msgFrom: whatsAppConfig?.whatsappNumber,//WHATSAPP.WHATSAPP_NUMBER,
      message: JSON.stringify(replyMessage),
      msgSource: source === WASource ? WASource : WAIHubSource,
      createdBy: systemUserId,
      tranId: uuidv4(),
    }

    // , { transaction: t }
    await conn.WhatsAppChatHistory.create(whatsAppHistoryObj)

    const data = JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      text: { body: replyMessage }
    })

    const path = `/${whatsAppConfig?.version}/${whatsAppConfig?.phoneNumberId}/messages?access_token=${whatsAppConfig?.whatsappToken}`
    const options = {
      host: whatsAppConfig?.url,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }
    const callback = (response) => {
      let str = ''
      response.on('data', (chunk) => {
        str += chunk
      })
      response.on('end', () => {
      })
    }
    const req = https.request(options, callback)
    req.on('error', (e) => {
      logger.info('Error occurred while sending whatsapp reply message')
    })
    req.write(data)
    req.end()
    logger.info('Successfully sent whatsapp reply')
    // await t.commit()
    return 'Sent'
  } catch (error) {
    logger.error(error, 'Error while creating chat record')
    return 'Error'
  }
  // finally {
  //   if (t && !t.finished) {
  //     await t.rollback()
  //   }
  // }
}

export const sendComplaintList = async (pageObjectId, senderID, list, whatsappSessionData, conn, source) => {
  let t
  for (const complaint of list) {
    const msg = `Current status of open ticket for Access Number: ${complaint?.service_no} \n` +
      `Ticket ID - ${complaint.intxn_id} \n` +
      `Service Type - ${complaint.service_type} \n` +
      `Date Of Creation - ${moment(complaint.created_at).format('DD-MMM-YYYY hh:mm:ss A')} \n` +
      `Current Status - ${complaint.curr_status} \n`
    logger.info('msg', msg)
    t = await sendWhatsappReply(pageObjectId, senderID, msg, whatsappSessionData.reportId, conn, source, type, env)
  }
  return t
}

const backMenu = async (pageObjectId, senderID, reportId, conn, source, type, env) => {
  let interactivePayload = {
    msgType: "callToActionButton",
    text: "Go to Main Menu",
    buttonName: 'Menu',
    buttons: [{
      "type": "reply",
      "reply": {
        "id": "HELP",
        "title": "return back to main menu"
      }
    }]
  }
  const sendResponse = await sendInteractiveWhatsappReply(pageObjectId, senderID, interactivePayload, reportId, conn, source, type, env)
}

const getWhatsappConfig = async (type, env, conn) => {
  try {
    let response = {}
    let configResponse = await conn.BcaeAppConfig.findOne({
      attributes: ['portalSetupPayload'],
      where: {
        status: constantCode?.status?.ACTIVE
      }
    })

    configResponse = configResponse?.dataValues ?? configResponse
    response = configResponse?.portalSetupPayload?.whatsappPortalSetting?.filter((f) => f?.type === type && f?.environment === env && f?.status === 'AC')
    response = response?.[0] ?? {}
    return { status: statusCodeConstants.SUCCESS, data: response }
  } catch (error) {
    logger.error(error)
    return { status: statusCodeConstants?.ERROR }
  }
}