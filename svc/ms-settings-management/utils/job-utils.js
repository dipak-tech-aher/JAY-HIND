
import {
  sequelize, Attachment, Interaction, InteractionTask,
  Catalog, Plan, Service, AssetMst, AddonMst,
  Customer, Account, Connection, ConnectionPlan,
  BusinessEntity, Notification, Chat
} from '../model/index'
import { Op } from 'sequelize'
import { isEmpty } from 'lodash'
import { workflowDefinitions } from './workflow-sample'
import {
  getRealtimeServiceDetails, allocateAccessNumber,
  ocsBarUnBarSubscription, ocsCustomerStatus, getTicketDetails
} from '../tibco/tibco-utils'
import {  } from 'config'
import { EmailHelper, SMSHelper } from '.'
import { format, differenceInMinutes } from 'date-fns'

import {
  Contract, ContractDtl, MonthlyContract, MonthlyContractDtl, ContractScheduler, sequelize
  // Plan, PlanCharge, AssetMst, AssetCharge, Service, ServiceCharge, sequelize, Connection, Account, Charge
  //, Adjustment, AdjustmentDtl,
} from '../model/index'
import { systemUserId } from 'config'
import { isEmpty, map } from 'lodash'
import { getFutureDates, getOlderDates, getQuarter, getWeeksDiff, logger } from '@utils' // getLastDateOfMonth, noOfMonthsBetween2Dates
// import { transformContractDetail, transformContract } from '../transforms/contract-servicce'
import { Op, QueryTypes } from 'sequelize'
import { format, endOfMonth, startOfMonth } from 'date-fns'
import { calculateInvoice } from '../utils/busiiness-helper'
import { camelCaseConversion } from '../utils/string'
import moment from 'moment'

import { Attachment, NotificationTemplate, Helpdesk, Interaction, HelpdeskTxn, Notification, Chat, sequelize } from '../model/index'
import { Azure } from '../config/azureConfig'
import { azureProperties, systemUserId, abandonedChatTimeout, complaintPrefix, inquiryPrefix, adjustmentPrefix, refundPrefix } from 'config'


import {
  sequelize, DTIntegration
} from '../model/index'

import { DTUtils } from '../dropthought/dt-utils'

import { camelCaseConversion } from '../utils/string'
const azure = new Azure()
const Got = require('got')
const ST = require('stjs')
const emailHelper = new EmailHelper()

const smsHelper = new SMSHelper()

const COUNTRYCODE_PREFIX = '673'

export const processWorkflowEngine = async () => {
  // logger.debug('Processing Service Requests')
  try {
    // Fetching all NEW and WIP records from the table
    const interactions = await Interaction.findAll({
      where: {
        currStatus: { [Op.notIn]: ['FAILED', 'CLOSED', 'DONE', 'UNFULFILLED', 'PEND-CLOSE'] },
        woType: ['WONC', 'WONC-ACCSER', 'WONC-SER', 'TERMINATE', 'BAR', 'UNBAR', 'UPGRADE', 'DOWNGRADE', 'VASACT', 'VASDEACT', 'RELOCATE', 'TELEPORT', 'FAULT'],
        intxnType: ['REQSR', 'REQCOMP'],
        intxnId: {
          [Op.gt]: 0
        }
      }
    })
    if (!isEmpty(interactions)) {
      for (const interaction of interactions) {
        if (interaction.intxnType === 'REQSR') {
          if (interaction.currStatus === 'CREATED') {
            await processCreatedInteraction(interaction)
          } else if (interaction.currStatus === 'WIP') {
            await processWIPInteraction(interaction)
          } else {
            // Fetching all the task which are belongs to interaction id
            // continue
            const tasks = await InteractionTask.findAll({
              include: [
                { model: BusinessEntity, as: 'taskIdLookup', attributes: ['code', 'description', 'mappingPayload'] },
                { model: Interaction, as: 'data', attributes: ['description', 'curr_status'] }
              ],
              where: {
                intxnId: interaction.intxnId
              }
            })
            if (!isEmpty(tasks)) {
              let completeStatus = 0
              let failedStatus = false
              let WIPStatus = false
              // If task found and all task status is CLOSED then update integration status as CLOSED
              // If task found and one task status is FAILED then update integration status as FAILED
              for (const task of tasks) {
                if (task.status === 'DONE' || task.status === 'DONE-INCOMPLETE') {
                  completeStatus = completeStatus + 1
                } else if (task.status === 'FAILED') {
                  failedStatus = true
                } else if (task.status === 'WIP') {
                  WIPStatus = true
                }
              }
              let status
              if (completeStatus === tasks.length && !failedStatus) {
                status = 'DONE'
              } else if (completeStatus !== tasks.length && WIPStatus) {
                status = 'WIP'
              } else if (failedStatus) {
                status = 'FAILED'
              }
              if (status) {
                interaction.currStatus = status
                await Interaction.update(interaction.dataValues, { where: { intxnId: interaction.intxnId } })
                logger.debug('Service request data updated successfully')
              }
            }
          }
        } else if (interaction.intxnType === 'REQCOMP') {
          if (interaction.isBotReq === 'N') {
            await processCreatedInteraction(interaction)
          } else if (interaction.isBotReq === 'Y') {
            await processWIPInteraction(interaction)
          }
        }
      }
    }
  } catch (error) {
    logger.error(error, 'Error while updating service request')
  }
}

export const processDeleteTempAttachments = async () => {
  // logger.debug('Deleting temporary attachments ')
  try {
    await Attachment.destroy({
      where: {
        status: 'TEMP',
        createdAt: {
          [Op.lt]: new Date(),
          [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
        }
      }
    })
    // logger.debug('Successfully deleted the temporary attachments')
  } catch (error) {
    logger.error(error, 'Error while deleting the temporary attachments')
  }
}

export const generateMonthlyUnBilledContracts = async (currentMonth = 0) => {
  logger.debug('Generating monthly bill')
  const t = await sequelize.transaction()
  try {
    const billPeriod = format(startOfMonth(getFutureDates(new Date(), Number(currentMonth))), 'yyyy-MM-dd')
    const endOfbillPeriodMonth = format(endOfMonth(getFutureDates(new Date(), Number(currentMonth))), 'yyyy-MM-dd')

    const mContracts = await MonthlyContract.findAll({
      where: {
        nextBillPeriod: { [Op.gte]: billPeriod, [Op.lte]: endOfbillPeriodMonth },
        status: 'SCHEDULED'
      },
      transaction: t,
      raw: true
    })

    const mdContracts = await MonthlyContractDtl.findAll({
      where: {
        nextBillPeriod: { [Op.gte]: billPeriod, [Op.lte]: endOfbillPeriodMonth },
        status: 'SCHEDULED'
      },
      transaction: t,
      raw: true
    })

    const schContracts = await ContractScheduler.findAll({
      where: {
        scheduleDatetime: { [Op.gte]: billPeriod, [Op.lte]: endOfbillPeriodMonth },
        scheduleStatus: 'SCHEDULED'
      },
      transaction: t,
      raw: true
    })

    if (Array.isArray(mContracts) && !isEmpty(mContracts)) {
      const monthlyContractIds = map(mContracts, 'monthlyContractId')
      if (!isEmpty(monthlyContractIds)) {
        await MonthlyContract.update({ status: 'UNBILLED' }, {
          where: { monthlyContractId: monthlyContractIds }, transaction: t
        })
      }
    }
    if (Array.isArray(mdContracts) && !isEmpty(mdContracts)) {
      const monthlyContractDtlIds = map(mdContracts, 'monthlyContractDtlId')

      if (!isEmpty(monthlyContractDtlIds)) {
        await MonthlyContractDtl.update({ status: 'UNBILLED' }, {
          where: { monthlyContractDtlId: monthlyContractDtlIds }, transaction: t
        })
      }
    }
    if (Array.isArray(schContracts) && !isEmpty(schContracts)) {
      for (const dtl of schContracts) {
        const lastBill = dtl.scheduleDatetime

        const billPending = await ContractScheduler.findOne({
          where: {
            contractDtlId: dtl.contractDtlId,
            scheduleDatetime: { [Op.gt]: dtl.scheduleDatetime }
          },
          transaction: t
        })

        const contractDtlValue = await ContractDtl.findOne({
          where: { contractDtlId: dtl.contractDtlId },
          attributes: ['balanceAmount', 'contractId', 'contractDtlId', 'frequency'],
          transaction: t
        })

        let nextMonth = null
        if (contractDtlValue?.frequency === 'FREQ_MONTH') {
          nextMonth = billPending ? format(startOfMonth(new Date(getFutureDates(lastBill, 1))), 'yyyy-MM-dd') : null
        } else if (contractDtlValue?.frequency === 'FREQ_QUARTER') {
          nextMonth = billPending ? format(startOfMonth(new Date(getFutureDates(lastBill, 3))), 'yyyy-MM-dd') : null
        } else if (contractDtlValue?.frequency === 'FREQ_HALF_YEAR') {
          nextMonth = billPending ? format(startOfMonth(new Date(getFutureDates(lastBill, 6))), 'yyyy-MM-dd') : null
        } else if (contractDtlValue?.frequency === 'FREQ_YEAR') {
          nextMonth = billPending ? format(startOfMonth(new Date(getFutureDates(lastBill, 12))), 'yyyy-MM-dd') : null
        }
        // const nextMonth = billPending ? format(startOfMonth(new Date(getFutureDates(lastBill, 3))), 'yyyy-MM-dd') : null

        // const monthlyContractDtl = mdContracts.find((mdtl) => mdtl?.contractDtlId === dtl.contractDtlId)

        const detailData = {
          lastBillPeriod: lastBill,
          nextBillPeriod: nextMonth
          // balanceAmount: Number(contractDtlValue.balanceAmount) - Number(monthlyContractDtl?.chargeAmt)
        }

        await ContractDtl.update(detailData, { where: { contractDtlId: dtl.contractDtlId }, transaction: t })
        await ContractDtl.destroy({ where: { itemName: 'Adjument Record', contractDtlId: dtl.contractDtlId }, transaction: t })
        await ContractScheduler.update({ scheduleStatus: 'UNBILLED' }, { where: { monthlyContractDtlId: dtl.monthlyContractDtlId }, transaction: t })

        let billPendingContract
        if (!billPending) {
          billPendingContract = await ContractScheduler.findOne({
            where: {
              contractId: dtl.contractId,
              scheduleDatetime: { [Op.gt]: dtl.scheduleDatetime }
            },
            transaction: t
          })
        }

        const updateContract = {
          lastBillPeriod: lastBill,
          nextBillPeriod: (billPendingContract || billPending) ? format(startOfMonth(new Date(getFutureDates(lastBill, 1))), 'yyyy-MM-dd') : null
        }

        await Contract.update(updateContract, {
          where: {
            contractId: dtl.contractId
            // nextBillPeriod: {
            //   [Op.gte]: billPeriod,
            //   [Op.lte]: endOfbillPeriodMonth
            // }
          },
          transaction: t
        })
      }
    }

    await t.commit()
    logger.info('Successfully Generated Monthly bill')
  } catch (error) {
    logger.error(error, 'Error while getnerating monthly bill')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

export const generateScheduledMonthlyContracts = async () => {
  logger.debug('Generating Monthly scheduled contracts')
  const t = await sequelize.transaction()
  try {
    const billPeriod = format(startOfMonth(getFutureDates(new Date(), 0)), 'yyyy-MM-dd')
    logger.info('Fetching Contract for the period::' + billPeriod)

    await createRCAndNRCMonthlyContractdtl(t)
    await createUsageMonthlyContractdtl(t)
    await createMonthlyContract(t)

    await t.commit()
    logger.debug('Successfully generated Monthly scheduled contracts')
  } catch (error) {
    logger.error(error, 'Error while generating monthly scheduled contracts')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

export const FacebookPost = async () => {
  const fbURL = 'https://graph.facebook.com/' + FB_PAGE_ID + '/feed?fields=message,id,created_time,from,comments{message,id,created_time,from,comments{message,id,from}}&access_token=' + FB_PAGE_ACCESS_TOKEN
  const t = await sequelize.transaction()
  try {
      const response = await Got.get({
          // headers: { 'content-type': 'application/json' },
          url: fbURL,
          retry: 1
      })

      if (response.statusCode === 200) {
          const { data } = JSON.parse(response.body)
          // console.log(data)
          for (const d of data) {
              // console.log('Main POST===>', d.message, ' ::: ', d.id)
              const id = d.id.split('_')
              const pageId = id[0]
              const postId = id[1]
              let helpdesk = await Helpdesk.findOne({ where: { referenceId: d.id } })
              // console.log('helpdesk ==>', helpdesk)
              if (!helpdesk) {
                  const data = {
                      source: 'FACEBOOK',
                      name: d.from ? d.from?.name : 'Facebook User',
                      title: 'Facebook Post Comments',
                      content: d.message,
                      referenceId: d.id,
                      status: 'NEW',
                      postId,
                      createdBy: systemUserId,
                      updatedBy: systemUserId
                  }
                  await Helpdesk.create(data, { transaction: t })
              }
              if (d.comments) {
                  const comments = d.comments.data
                  for (const c of comments) {
                      // console.log('Comments level 1===>', c.message, '::', c.id)
                      helpdesk = await Helpdesk.findOne({ where: { referenceId: c.id } })
                      if (!helpdesk) {
                          const data = {
                              source: 'FACEBOOK',
                              name: c.from ? c.from?.name : 'Facebook User',
                              title: 'Facebook Post Comments',
                              content: c.message,
                              referenceId: c.id,
                              status: 'NEW',
                              postId,
                              createdBy: systemUserId,
                              updatedBy: systemUserId
                          }
                          await Helpdesk.create(data, { transaction: t })
                      }
                      if (c.comments) {
                          const iComments = c.comments.data
                          for (const i of iComments) {
                              // console.log('Comments level 2===>', i.message, '::', i.id)
                              helpdesk = await Helpdesk.findOne({ where: { referenceId: i.id } })
                              if (!helpdesk) {
                                  const data = {
                                      source: 'FACEBOOK',
                                      name: i.from ? i.from?.name : 'Facebook User',
                                      title: 'Facebook Post Comments',
                                      content: i.message,
                                      referenceId: i.id,
                                      status: 'NEW',
                                      postId,
                                      createdBy: systemUserId,
                                      updatedBy: systemUserId
                                  }
                                  await Helpdesk.create(data, { transaction: t })
                              }
                          }
                      }
                  }
              }
          }
      }
      await t.commit()
  } catch (err) {
      await t.rollback()
  } finally {
      if (t && !t.finished) {
          await t.rollback()
      }
  }
}

// export const processContractForActiveService = async () => {
//   try {
//     const connectionList = await sequelize.query(`select connection_id, identification_no, mapping_payload,
//     service_start_date, service_stop_date, account_id from connections c  where c.status ='ACTIVE' and not exists
//     (select 'x' from contract_dtl c2 where c.connection_id=c2.connection_id)`, {
//       type: QueryTypes.SELECT,
//       model: Connection,
//       mapToModel: true
//     }
//     )
//     if (Array.isArray(connectionList) && !isEmpty(connectionList)) {
//       for (const connections of connectionList) {
//         if (!(connections && connections.mappingPayload)) {
//           return false
//         }
//         // const catalog = connections.mappingPayload.catalogId || null
//         const asset = connections.mappingPayload?.assetId || null
//         const service = connections.mappingPayload?.serviceId || null
//         const plan = connections.mappingPayload?.planId || null
//         const addons = connections.mappingPayload?.addonId || null

//         if (connections.accountId) {
//           const t = await sequelize.transaction()
//           const accountDetails = await Account.findOne({
//             where: {
//               accountId: connections.accountId
//             }
//           })
//           let data = null; let contract = null
//           if ((addons || asset || service || plan)) {
//             data = {
//               contractName: (accountDetails.firstName + ' ' + accountDetails.firstName),
//               contractDesc: (accountDetails.firstName + ' ' + accountDetails.firstName),
//               customerId: accountDetails.customerId,
//               accountId: accountDetails.accountId,
//               billRefNo: accountDetails.accountNo,
//               startDate: connections.serviceStartDate,
//               endDate: null,
//               nextBillPeriod: getLastDateOfMonth(connections.serviceStartDate),
//               status: 'ACTIVE'
//             }
//             contract = await Contract.create(data, { transaction: t })
//           }

//           if (!contract) {
//             logger.log('Error while creating contract')
//             t.rollback()
//           } else {
//             /*
//             let assetItems=[], serviceItems=[], planItems=[], addonItems=[];
//             const catDetails= await Catalog.findAll({
//               include:[
//                 {model: CatalogAssetMap, as:'assetMap'},
//                 {model: CatalogServiceMap, as:'serviceMap'},
//                 {model: CatalogPlanMap, as:'planMap'},
//                 {model: CatalogAddonMap, as:'addonMap'}
//                 ],

//               where:{
//                 catalogId:catalogId
//               }
//             })
//             const assets= catDetails[0].assetMap.assetId;
//             */
//             if (asset) {
//               const assetDet = await AssetMst.findOne({
//                 include: [
//                   {
//                     model: AssetCharge,
//                     as: 'assetCharges',
//                     include: [{ model: Charge, as: 'chargeDet' }]
//                   }
//                 ],
//                 where: {
//                   assetId: asset
//                 }
//               })
//               const assetData = transformContract(assetDet)
//               const data = transformContractDetail(contract, assetData, connections)
//               await ContractDtl.create(data, { transaction: t })
//             }

//             // const services = catDetails[0].serviceMap;
//             if (service) {
//               const serviceDet = await Service.findOne({
//                 include: [
//                   {
//                     model: ServiceCharge,
//                     as: 'serviceCharges',
//                     include: [{ model: Charge, as: 'chargeDet' }]
//                   }
//                 ],
//                 where: {
//                   serviceId: service
//                 }
//               })

//               const serviceData = transformContract(serviceDet)
//               const data = transformContractDetail(contract, serviceData, connections)
//               await ContractDtl.create(data, { transaction: t })
//             }

//             // const plans=catDetails[0].planMap;
//             if (plan) {
//               const planDet = await Plan.findOne({
//                 include: [
//                   {
//                     model: PlanCharge,
//                     as: 'planCharges',
//                     include: [{ model: Charge, as: 'chargeDet' }]
//                   }
//                 ],
//                 where: {
//                   planId: plan
//                 }
//               })
//               const planData = transformContract(planDet)
//               const data = transformContractDetail(contract, planData, connections)
//               await ContractDtl.create(data, { transaction: t })
//             }

//             t.commit()
//           }
//         }
//       }

//       const chargeAmt = await ContractDtl.findAll({
//         attributes: ['contractId', 'chargeType', [sequelize.fn('sum', sequelize.col('charge_amt')), 'chargeAmt']],
//         group: ['contractId', 'chargeType']
//       })

//       for (const chargeUpdate of chargeAmt) {
//         const t = await sequelize.transaction()

//         const data = {
//           rcAmount: (chargeUpdate.chargeType === 'CC_RC' ? chargeUpdate.chargeAmt : 0),
//           otcAmount: (chargeUpdate.chargeType === 'CC_NRC' ? chargeUpdate.chargeAmt : 0),
//           usageAmount: (chargeUpdate.chargeType === 'CC_USGC' ? chargeUpdate.chargeAmt : 0)
//         }

//         const chargeRes = await Contract.update(data, {
//           where: {
//             contractId: chargeUpdate.contractId
//           },
//           transaction: t
//         })

//         if (!chargeRes) {
//           t.rollback()
//         }
//         t.commit()
//       }
//     }
//   } catch (error) {
//     logger.error(error, 'Error while creating contract')
//   }
// }

// export const activateAdjustment = async () => {
//   const adjustmentList = await Adjustment.findAll({
//     include: [
//       { model: AdjustmentDtl, as: 'adjustmentDetails' }
//     ],

//     where: {
//       status: 'CREATED' // should be marked as active when workflow has been implemented
//     }
//   })

//   // console.log(adjustmentList)

//   const t = await sequelize.transaction()
//   for (const adjustment of adjustmentList) {
//     /** *******************************************This is temporary********************************/
//     await Adjustment.update({ status: 'ACTIVE' },
//       {
//         where: {
//           adjustmentId: adjustment.adjustmentId
//         },
//         transaction: t
//       })

//     await AdjustmentDtl.update({ status: 'ACTIVE' },
//       {
//         where: {
//           adjustmentId: adjustment.adjustmentDetails[0].adjustmentId
//         },
//         transaction: t
//       })
//     /** *******************************************This is temporary********************************/

//     if (adjustment.adjustmentDetails[0].contractDtlId && adjustment.adjustmentDetails[0].contractDtlId !== null) {
//       const data = {
//         creditAdjAmount: adjustment.adjustmentDetails[0].adjustmentType === 'ADJ_TYP_CREDIT' ? adjustment.adjustmentDetails[0].adjAmount : null,
//         debitAdjAmount: adjustment.adjustmentDetails[0].adjustmentType === 'ADJ_TYP_DEBIT' ? adjustment.adjustmentDetails[0].adjAmount : null
//       }

//       await MonthlyContractDtl.update(data, {
//         where: {
//           contractDtlId: adjustment.adjustmentDetails[0].contractDtlId
//         },
//         transaction: t
//       })
//     } else {
//       const data = {
//         contractId: adjustment.contractId,
//         itemName: 'Adjustment',
//         creditAdjAmount: adjustment.adjustmentDetails[0].adjustmentType === 'ADJ_TYP_CREDIT' ? adjustment.adjustmentDetails[0].adjAmount : null,
//         debitAdjAmount: adjustment.adjustmentDetails[0].adjustmentType === 'ADJ_TYP_DEBIT' ? adjustment.adjustmentDetails[0].adjAmount : null,
//         status: 'UNBILLED'
//       }

//       await MonthlyContractDtl.create(data, { transaction: t })
//     }
//   }
//   t.commit()
// }

export const processFetchingHelpdeskMails = async () => {
  logger.debug('Processing fetch recodrs from Helpdesk mail box')
  const t = await sequelize.transaction()
  try {
    const { accessToken } = await azure.init()
    logger.debug('Fetching unread mails from the Inbox')
    const url = azureProperties.inboxUrl + '/mailFolders/Inbox/messages?$filter=isRead ne true'
    let unReadMessages = await Got.get({
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken },
      url,
      retry: 0
    })
    unReadMessages = JSON.parse(unReadMessages.body)
    logger.debug('Count of unread Emails:', unReadMessages.value.length)
    if (unReadMessages && Array.isArray(unReadMessages.value) && !isEmpty(unReadMessages.value)) {
      for (const message of unReadMessages.value) {
        const messageId = message.id
        const email = message.sender.emailAddress.address
        const customerName = message.sender.emailAddress.name
        const content = message.bodyPreview
        const receivedDateTime = message.receivedDateTime
        const subject = message.subject

        let helpdeskId
        let hasInteraction
        let isNewEmail = false
        let emailSubject = message.subject.split('Re: ')[1]
        if (!emailSubject) {
          emailSubject = message.subject.split('RE: ')[1]
          if (!emailSubject) {
            emailSubject = message.subject
            isNewEmail = true
          }
        }

        const hasHelpdesk = await Helpdesk.findOne({
          where: {
            email: {
              [Op.and]: [
                sequelize.where(sequelize.fn('UPPER', sequelize.col('Helpdesk.email')),
                  { [Op.eq]: email.toUpperCase() }
                )]
            },
            title: {
              [Op.and]: [
                sequelize.where(sequelize.fn('UPPER', sequelize.col('Helpdesk.title')),
                  { [Op.eq]: emailSubject.toUpperCase() }
                )]
            },
            status: {
              [Op.or]: ['NEW', 'HOLD', 'CLOSED', 'WIP']
            }
          }
        })
        if (hasHelpdesk) {
          helpdeskId = hasHelpdesk.helpdeskId
          hasInteraction = await Interaction.findOne({
            where: { helpdeskId }
          })
        }

        if (!hasHelpdesk && !hasInteraction && isNewEmail) {
          const helpdesk = await createHelpdesk(messageId, content, email, customerName, receivedDateTime, subject, t)
          helpdeskId = helpdesk.helpdeskId
          await markAsRead(messageId, accessToken)
          await acknowledgeCustomer(email, customerName, messageId, helpdeskId, accessToken, 'NEW')
        } else if (hasHelpdesk && (hasHelpdesk.status === 'NEW' || hasHelpdesk.status === 'WIP' ||
          hasHelpdesk.status === 'HOLD') && !hasInteraction && !isNewEmail) {
          await createNotification(email, subject, helpdeskId, t)
          await createHelpdeskTxn(helpdeskId, messageId, content, email, receivedDateTime, t)
          await markAsRead(messageId, accessToken)
          await acknowledgeCustomer(email, customerName, messageId, helpdeskId, accessToken, 'WIP')
        } else if (hasHelpdesk && hasHelpdesk.status === 'CLOSED' && !hasInteraction && !isNewEmail) {
          await markAsRead(messageId, accessToken)
          await acknowledgeCustomer(email, customerName, messageId, helpdeskId, accessToken, 'CLOSED')
        } else if (hasHelpdesk && hasHelpdesk.status === 'CLOSED' && hasInteraction && hasInteraction.currStatus !== 'CLOSED' && !isNewEmail) {
          await createNotification(email, subject, helpdeskId, t)
          await createHelpdeskTxn(helpdeskId, messageId, content, email, receivedDateTime, t)
          await markAsRead(messageId, accessToken)
          await acknowledgeCustomer(email, customerName, messageId, helpdeskId, accessToken, 'WIP')
        } else if (hasHelpdesk && hasHelpdesk.status === 'CLOSED' && hasInteraction && hasInteraction.currStatus === 'CLOSED' && !isNewEmail) {
          await markAsRead(messageId, accessToken)
          await acknowledgeCustomer(email, customerName, messageId, helpdeskId, accessToken, 'CLOSED')
        }

        if (message.hasAttachments) {
          await createAttachments(messageId, accessToken, helpdeskId, t)
        }
      }
    }
    await t.commit()
  } catch (error) {
    logger.error(error, 'Error while creating help desk ticket')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

export const processReplyingEmail = async () => {
  logger.debug('Processing pending email replies...')
  let t
  try {
    const { accessToken } = await azure.init()
    const messages = await HelpdeskTxn.findAll({
      where: {
        status: 'REPLY',
        inOut: 'OUT'
      }
    })
    logger.debug('Count of emails to reply:', messages?.length)
    if (Array.isArray(messages) & !isEmpty(messages)) {
      for (const msg of messages) {
        try {
          if ((msg.payload && msg.payload?.internal && msg.payload?.internal?.status === 'N')) {
            const toAddr = []
            for (const t of msg.payload.internal.users) {
              toAddr.push(t.email)
            }

            await sendMail(msg, toAddr, 'Update on ticket ' + (msg.helpdeskId || msg.chatId))
            msg.payload.internal.status = 'Y'
          }

          if ((!msg.chatId && msg.payload && msg.payload?.customer && msg.payload?.customer?.status === 'N')) {
            let chatData
            if (msg.chatId) {
              chatData = await Chat.findOne({ where: { chatId: msg?.chatId } })
            }
            if (chatData) {
              await sendMail(msg, chatData.emailId)
              msg.payload.internal.status = 'Y'
            }
          }
          if (msg.payload === null || !msg.payload || isEmpty(msg.payload) || (msg.payload?.customer?.status === 'N')) {
            const attachments = await Attachment.findAll({
              where: {
                entityId: msg.helpdeskTxnId.toString(),
                entityType: 'HELPDESKTXN'
              }
            })
            logger.debug('No of helpdeskTxnId: ', msg.helpdeskTxnId)
            logger.debug('No of attachments: ', attachments.length)
            const attachmentslength = attachments.length
            // let attachmentBody
            // let fileName
            const attachmentDetails = []
            if (Array.isArray(attachments) & !isEmpty(attachments)) {
              for (const attachment of attachments) {
                attachmentDetails.push({
                  '@odata.type': '#microsoft.graph.fileAttachment',
                  name: attachment.fileName,
                  contentType: 'text/plain',
                  contentBytes: attachment.content.split('base64,')[1]
                })
              }
            }
            const helpdesk = await Helpdesk.findOne({ where: { helpdeskId: msg?.helpdeskId } })
            if (helpdesk) {
              const reqBody = {
                message: {
                  toRecipients: [
                    {
                      emailAddress: {
                        address: helpdesk?.email,
                        name: helpdesk?.name
                      }
                    }
                  ],
                  attachments: attachmentslength > 0
                    ? [
                        ...attachmentDetails
                      ]
                    : []
                },
                comment: msg.content
              }
              logger.debug('Sending reply email to user')
              const replyUrl = azureProperties.inboxUrl + '/mailFolders/Inbox/messages/' + helpdesk.referenceId + '/reply'
              const replyResponse = await Got.post({
                headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken },
                url: replyUrl,
                body: JSON.stringify(reqBody),
                retry: 0
              })
            }
          }

          t = await sequelize.transaction()
          const data = {
            payload: msg.payload,
            status: 'SENT',
            messageDateTime: new Date()
          }
          await HelpdeskTxn.update(data, {
            where: {
              helpdeskTxnId: msg.helpdeskTxnId
            },
            transaction: t
          })
          await t.commit()
        } catch (error) {
          logger.error(error, 'Unexpected error while sending email')
        }
      }
    }
    logger.debug('Finished processing pending email replies.')
  } catch (error) {
    logger.error(error, 'Error while processing reply emails')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

export const sendMail = async (msg, emailId, subject) => {
  try {
    const { accessToken } = await azure.init()
    const body = {
      message: {
        subject: subject || 'No reply',
        body: {
          contentType: 'HTML',
          content: msg.content
        },
        toRecipients: []
      },
      saveToSentItems: 'false'
    }

    if (Array.isArray(emailId)) {
      for (const r of emailId) {
        body.message.toRecipients.push({
          emailAddress: {
            address: r
          }
        })
      }
    } else {
      body.message.toRecipients.push({
        emailAddress: {
          address: emailId
        }
      })
    }

    const url = azureProperties.inboxUrl + '/sendMail'
    const mail = await Got.post({
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken },
      url,
      body: JSON.stringify(body),
      retry: 0
    })
    return mail
  } catch (error) {
    logger.error(error, 'Error while processing replying emails')
  }
}

export const dropThoughtIntegrationJob = async () => {
  logger.debug('Starting dropThoughtIntegrationJob')

  try {
    const dtUtils = new DTUtils()

    const query = `select i.intxn_id,
    i.intxn_type,
    i.intxn_cat_type,
    concat(cu.first_name ,' ',cu.last_name) as customer_name,
    cnt.email,
    cnt.contact_no,
    i.updated_at,
    p.prod_type,
    i.identification_no
    from interaction as i
    inner join customers cu on cu.customer_id =  i.customer_id
    inner join accounts acc on i.account_id = acc.account_id
    inner join contacts cnt on cu.contact_id = cnt.contact_id
    inner join connections conn on i.connection_id = conn.connection_id
    inner join plan p on CAST(conn.mapping_payload->'plans'->0->'planId' as INT) = p.plan_id
    inner join business_entity be on i.intxn_type = be.code
    inner join business_entity be2 on i.wo_type = be2.code
    inner join business_entity be3 on i.intxn_cat_type = be3.code
    where intxn_type IN ('REQCOMP', 'REQINQ') and survey_req = 'Y' and cu.customer_id = acc.customer_id
    and acc.account_id = conn.account_id
    and i.intxn_id not in (select intxn_id FROM intg_dropthought_results)`

    let rows = await sequelize.query(query, {
      type: QueryTypes.SELECT
    })

    rows = camelCaseConversion(rows)

    if (rows && rows.length > 0) {
      logger.debug('Processing Drop Thought Integration - ' + rows.length + ' rows')

      for (const r of rows) {
        try {
          const tktPrefix = (r.intxnType === 'REQCOMP')
            ? ((r.intxnCatType === 'CATCOMP')
                ? complaintPrefix
                : ((r.intxnCatType === 'CATADJ')
                    ? adjustmentPrefix
                    : ((r.intxnCatType === 'refundPrefix')
                        ? refundPrefix
                        : ''
                      )
                  ))
            : ((r.intxnType === 'REQINQ')
                ? inquiryPrefix
                : ''
              )

          const recType = (r.intxnType === 'REQCOMP')
            ? ((r.intxnCatType === 'CATCOMP')
                ? 'Complaints'
                : ((r.intxnCatType === 'CATADJ')
                    ? 'Adjustments'
                    : ((r.intxnCatType === 'refundPrefix')
                        ? 'Refunds'
                        : ''
                      )
                  ))
            : ((r.intxnType === 'REQINQ')
                ? 'Inquiries'
                : ''
              )

          const contactNbr = (r.contactNo.length <= 7) ? COUNTRYCODE_PREFIX + r.contactNo : r.contactNo

          let response
          let errorFlag = false
          try {
            // console.log({
            //   a: r.customerName,
            //   b: r.email,
            //   c: contactNbr,
            //   d: tktPrefix + r.intxnId,
            //   e: recType,
            //   f: r.updatedAt,
            //   g: r.prodType,
            //   h: r.identificationNo
            // })

            response = await dtUtils.createSurveyParticipant(r.customerName,
              r.email,
              contactNbr,
              tktPrefix + r.intxnId,
              recType,
              r.updatedAt,
              r.prodType,
              r.identificationNo)

            // response = {
            //   status: 'success',
            //   message: 'Test Message',
            //   result: [
            //     {
            //       "id": 2,
            //       "data": "[\"Imagine-1\", \"sudhakar.dropthought.com\", \"112233\", \"Img1000\", \"Service Request\", \"Ser_Type-1\", \"Ser100\"]",
            //       "header": "[\"Account Name\", \"Primary Email ID\", \"Primary Contact Number\", \"Ticket ID\", \"Ticket Type\", \"Service Type\", \"Service Number\"]",
            //       "meta_data": "[\"NAME\", \"EMAIL\", \"PHONE\", \"String\", \"String\", \"String\", \"String\"]",
            //       "question_metadata": null,
            //       "participant_uuid": "e4cb6d2a-d02e-4204-8178-931abe7fb091",
            //       "created_by": 355,
            //       "created_time": "2020-11-03 08:42:56.0",
            //       "modified_by": null,
            //       "modified_time": null
            //     }
            //   ]
            // }
          } catch (error) {
            logger.error(error, 'Error calling createSurveyParticipant')
            errorFlag = true
          }

          const t = await sequelize.transaction()

          try {
            if (errorFlag) {
              await DTIntegration.create({
                intxnId: r.intxnId,
                callStatus: 'F',
                callMessage: response,
                callTime: sequelize.literal('CURRENT_TIMESTAMP'),
                createdBy: systemUserId,
                updatedBy: systemUserId
              },
              {
                transaction: t
              })
            } else {
              if (response && response.status === 'success') {
                await DTIntegration.create({
                  intxnId: r.intxnId,
                  callResult: response.result,
                  callStatus: 'S',
                  callTime: sequelize.literal('CURRENT_TIMESTAMP'),
                  createdBy: systemUserId,
                  updatedBy: systemUserId
                },
                {
                  transaction: t
                })
              } else {
                await DTIntegration.create({
                  intxnId: r.intxnId,
                  callStatus: 'F',
                  callMessage: response,
                  callTime: sequelize.literal('CURRENT_TIMESTAMP'),
                  createdBy: systemUserId,
                  updatedBy: systemUserId
                },
                {
                  transaction: t
                })
              }
            }
            t.commit()
          } catch (error) {
            t.rollback()
            logger.error(error)
          }
        } catch (error) {
          logger.error(error)
        }
      }

      logger.debug('Finished processing Drop Thought Integration')
    }
  } catch (error) {
    logger.error(error, 'Error while updating service request')
  }
}

const acknowledgeCustomer = async (address, name, messageId, ticketId, accessToken, source) => {
  logger.debug('Acknowledgeing customer')
  let templateName
  if (source === 'NEW') {
    templateName = 'Acknowledge New Ticket'
  } else if (source === 'WIP') {
    templateName = 'Acknowledge WIP Ticket'
  } else if (source === 'CLOSED') {
    templateName = 'Acknowledge Closed Ticket'
  }
  const template = await NotificationTemplate.findOne({
    where: {
      templateName,
      templateType: 'TC_EMAIL'
    }
  })
  if (template) {
    const data = {
      name,
      ticketId
    }
    const body = ST.select(data).transformWith(template.body).root()
    const reqBody = {
      message: { toRecipients: [{ emailAddress: { address, name } }] },
      comment: body
    }
    const url = azureProperties.inboxUrl + '/mailFolders/Inbox/messages/' + messageId + '/reply'
    await Got.post({
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken },
      url,
      body: JSON.stringify(reqBody),
      retry: 0
    })
  } else {
    logger.debug('Email template not found,Please create acknowledge template')
  }
  logger.debug('Successfully acknowledged customer')
}

const createNotification = async (email, subject, helpdeskId, t) => {
  logger.debug('Helpdesk has already has record, creating Notification record')
  const reqBody = {
    email,
    subject,
    body: 'Duplicate helpdesk mail has raised by customer, Here is the helpdesk id: ' + helpdeskId,
    referenceId: helpdeskId,
    notificationType: 'Email',
    status: 'SENT',
    source: 'HELPDESK',
    createdBy: systemUserId,
    updatedBy: systemUserId
  }
  await Notification.create(reqBody, { transaction: t })
  logger.debug('Successfully created notification record')
}

const createHelpdeskTxn = async (helpdeskId, messageId, content, email, receivedDateTime, t) => {
  logger.debug('Creating helpdesk txn record')
  const helpdeskTxn = {
    helpdeskId,
    referenceId: messageId,
    content,
    email,
    source: 'E-MAIL',
    status: 'SENT',
    inOut: 'IN',
    messageDateTime: receivedDateTime,
    createdBy: systemUserId,
    updatedBy: systemUserId
  }
  await HelpdeskTxn.create(helpdeskTxn, { transaction: t })
  logger.debug('Successfully created helpdesk txn record')
}

const createHelpdesk = async (messageId, content, email, customerName, receivedDateTime, subject, t) => {
  logger.debug('Creating helpdesk record')
  const helpdesk = {
    referenceId: messageId,
    content,
    email,
    source: 'E-MAIL',
    status: 'NEW',
    name: customerName,
    messageDateTime: receivedDateTime,
    title: subject || '(No subject)',
    createdBy: systemUserId,
    updatedBy: systemUserId
  }
  const response = await Helpdesk.create(helpdesk, { transaction: t })
  logger.debug('Successfully created helpdesk record')
  return response
}

const markAsRead = async (messageId, accessToken) => {
  logger.debug('Updating mail status as read')
  const updateUrl = azureProperties.inboxUrl + '/mailFolders/Inbox/messages/' + messageId
  await Got.patch({
    headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken },
    url: updateUrl,
    body: JSON.stringify({ isRead: true }),
    retry: 0
  })
  logger.debug('Successfully updated mail status as read')
}

const createAttachments = async (messageId, accessToken, helpdeskId, t) => {
  logger.debug('Fetching attachments from mail')
  const attachmentUrl = azureProperties.inboxUrl + '/mailFolders/Inbox/messages/' + messageId + '/attachments'
  let attachments = await Got.get({
    headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken },
    url: attachmentUrl,
    retry: 0
  })
  attachments = JSON.parse(attachments.body)
  logger.debug('Mail attachments count: ', attachments.value.length)
  if (attachments && Array.isArray(attachments.value) && !isEmpty(attachments.value)) {
    for (const attachment of attachments.value) {
      const attachmentData = {
        fileName: attachment.name,
        content: 'data:' + attachment.contentType + ';' + 'base64,' + attachment.contentBytes,
        fileType: attachment.contentType,
        entityId: helpdeskId,
        entityType: 'HELPDESK',
        status: 'FINAL',
        createdBy: systemUserId,
        updatedBy: systemUserId
      }
      logger.debug('Creating attachment record')
      await Attachment.create(attachmentData, { transaction: t })
      logger.debug('Attachment created successfully ')
    }
  }
}

const createRCAndNRCMonthlyContractdtl = async (t) => {
  // and status = 'ACTIVE'
  logger.debug('Creating Monthly contract details for RC and NRC')
  const contractDetails = await sequelize.query(
    `select * from contract_dtl where contract_dtl_id not in ( select contract_dtl_id from contract_scheduler cs where contract_dtl_id is not null)
    and status not in ('CREATED','CANCEL') and charge_type in ('CC_RC') and status = case when is_migrated ='N' then 'ACTIVE' else status end
    union
    select * from contract_dtl where contract_dtl_id not in ( select contract_dtl_id from contract_scheduler cs where contract_dtl_id is not null)
    and charge_type = 'CC_NRC' and status not in ('CREATED','CANCEL') and status = case when is_migrated ='N' then 'ACTIVE' else status end
    order by actual_start_date `, {
    type: QueryTypes.SELECT,
    model: ContractDtl,
    mapToModel: true,
    transaction: t
  })
  if (Array.isArray(contractDetails) && !isEmpty(contractDetails)) {
    let totalAmount = 0
    for (let contractDtl of contractDetails) {
      contractDtl = contractDtl.dataValues
      const startDate = new Date(contractDtl.actualStartDate)
      const endDate = new Date(contractDtl.actualEndDate)
      const chargeAmt = Math.round((Number(contractDtl.chargeAmt) + Number.EPSILON) * 100) / 100
      let contractDtlStartDate, contractDtlEndDate, actualStartDate, actualEndDate, nextBill, status, lastMonthBillPeriod
      if (contractDtl.chargeType === 'CC_RC' && contractDtl.frequency === 'FREQ_MONTH') {
        // const noOfMonths = noOfMonthsBetween2Dates(startDate, endDate)
        const noOfMonths = Number(contractDtl?.durationMonth)
        logger.debug('NoOfMonths: ', noOfMonths)
        totalAmount = chargeAmt
        for (let q = 0; q < noOfMonths; q++) {
          const m = 1 * q
          contractDtlStartDate = moment.utc(getFutureDates(startDate, m)).startOf('month').format('YYYY-MM-DD')
          contractDtlEndDate = moment.utc(contractDtlStartDate).endOf('month').format('YYYY-MM-DD')
          // format(endOfMonth(contractDtlStartDate), 'yyyy-MM-dd')
          if (moment.utc(startDate).format('YYYY-MM-DD') > moment.utc(contractDtlStartDate).format('YYYY-MM-DD')) {
            actualStartDate = moment.utc(startDate).format('YYYY-MM-DD')
          } else {
            actualStartDate = contractDtlStartDate
          }
          if (moment.utc(endDate).format('YYYY-MM-DD') < moment(contractDtlEndDate).format('YYYY-MM-DD')) {
            actualEndDate = moment.utc(endDate).format('YYYY-MM-DD')
          } else {
            actualEndDate = contractDtlEndDate
          }

          const nextMonthBillPeriod = moment.utc(actualStartDate).startOf('month').format('YYYY-MM-DD')

          const ret = await calculateInvoice(chargeAmt, totalAmount, contractDtl, actualStartDate, actualEndDate, noOfMonths)
          const balanceAmount = Number(ret.balanceAmount)
          logger.debug('Monthly amount: ', ret.invoiceAmt)

          nextBill = balanceAmount === 0 ? null : nextMonthBillPeriod

          contractDtl.lastBillPeriod = lastMonthBillPeriod
          // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= format(startDate, 'yyyy-MM-dd') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd')
          if (contractDtl.upfrontPayment === 'N') {
            contractDtl.nextBillPeriod = moment.utc(getFutureDates(actualStartDate, 1)).startOf('month').format('YYYY-MM-DD')
          } else {
            contractDtl.nextBillPeriod = moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') >= moment.utc(startDate).format('YYYY-MM-DD') ? moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') : moment.utc(startDate).format('YYYY-MM-DD')
          }
          console.log(contractDtl.nextBillPeriod, '=============::===============', format(new Date(), 'yyyy-MM-dd'))
          if (contractDtl.nextBillPeriod < format(new Date(), 'yyyy-MM-dd')) {
            status = 'BILLED'
          } else {
            status = 'SCHEDULED'
          }

          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = ret.invoiceAmt
          contractDtl.balanceAmount = balanceAmount
          contractDtl.status = status
          contractDtl.createdAt = new Date()
          logger.debug('Creating Monthly contractdtl for charge type RC')

          const dtl = await MonthlyContractDtl.create(contractDtl, { transaction: t })
          totalAmount = balanceAmount
          lastMonthBillPeriod = contractDtl.nextBillPeriod
          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: contractDtl.nextBillPeriod,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Scheduled Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }
          await ContractScheduler.create(sch, { transaction: t })
        }
      } else if (contractDtl.chargeType === 'CC_RC' && contractDtl.frequency === 'FREQ_QUARTER') {
        const noOfQuarters = getQuarter(startDate, endDate)
        logger.debug('NoOfQuarters: ', noOfQuarters)
        totalAmount = chargeAmt
        for (let q = 0; q < noOfQuarters; q++) {
          const m = 3 * q
          contractDtlStartDate = moment.utc(getFutureDates(startDate, m)).startOf('month').format('YYYY-MM-DD')
          contractDtlEndDate = moment.utc(getFutureDates(contractDtlStartDate, 2)).endOf('month').format('YYYY-MM-DD')

          if (moment.utc(startDate).format('YYYY-MM-DD') > moment.utc(contractDtlStartDate).format('YYYY-MM-DD')) {
            actualStartDate = moment.utc(startDate).format('YYYY-MM-DD')
          } else {
            actualStartDate = contractDtlStartDate
          }
          if (moment.utc(endDate).format('YYYY-MM-DD') < moment.utc(contractDtlEndDate).format('YYYY-MM-DD')) {
            actualEndDate = moment.utc(endDate).format('YYYY-MM-DD')
          } else {
            actualEndDate = contractDtlEndDate
          }
          const nextMonthBillPeriod = moment.utc(actualStartDate).startOf('month').format('YYYY-MM-DD')

          const ret = await calculateInvoice(chargeAmt, totalAmount, contractDtl, actualStartDate, actualEndDate, noOfQuarters)
          const balanceAmount = Number(ret.balanceAmount)
          logger.debug('Monthly amount: ', ret.invoiceAmt)

          nextBill = balanceAmount === 0 ? null : nextMonthBillPeriod

          contractDtl.lastBillPeriod = lastMonthBillPeriod

          if (contractDtl.upfrontPayment === 'N') {
            contractDtl.nextBillPeriod = moment.utc(getFutureDates(actualStartDate, 3)).startOf('month').format('YYYY-MM-DD')
          } else {
            contractDtl.nextBillPeriod = moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') >= moment.utc(startDate).format('YYYY-MM-DD') ? moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') : moment.utc(startDate).format('YYYY-MM-DD')
          }

          if (contractDtl.nextBillPeriod < format(new Date(), 'yyyy-MM-dd')) {
            status = 'BILLED'
            // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= moment.utc(startDate).format('YYYY-MM-DD') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : moment.utc(startDate).format('YYYY-MM-DD')
          } else {
            status = 'SCHEDULED'
            // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= moment.utc(startDate).format('YYYY-MM-DD') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : moment.utc(startDate).format('YYYY-MM-DD')
          }

          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = ret.invoiceAmt
          contractDtl.balanceAmount = balanceAmount
          contractDtl.status = status
          contractDtl.createdAt = new Date()
          logger.debug('Creating Monthly contractdtl for charge type RC')

          const dtl = await MonthlyContractDtl.create(contractDtl, { transaction: t })
          totalAmount = balanceAmount
          lastMonthBillPeriod = contractDtl.nextBillPeriod
          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: contractDtl.nextBillPeriod,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Migrated main Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }
          await ContractScheduler.create(sch, { transaction: t })
        }
        const remainingMonths = (Number(contractDtl.durationMonth) - Number(noOfQuarters) * 3)
        if (remainingMonths > 0) {
          status = 'SCHEDULED'
          actualStartDate = format(startOfMonth(new Date(getFutureDates(startOfMonth(new Date(actualEndDate)), 1))), 'yyyy-MM-dd')
          actualEndDate = format(new Date(endDate), 'yyyy-MM-dd')
          contractDtl.status = status
          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = totalAmount
          contractDtl.balanceAmount = 0
          contractDtl.lastBillPeriod = contractDtl.nextBillPeriod
          contractDtl.nextBillPeriod = actualStartDate
          contractDtl.createdAt = new Date()
          const dtl = await MonthlyContractDtl.create(contractDtl, { transaction: t })

          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: actualStartDate,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Migrated main Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }

          await ContractScheduler.create(sch, { transaction: t })
        }
      } else if (contractDtl.chargeType === 'CC_RC' && contractDtl.frequency === 'FREQ_HALF_YEAR') {
        // const noOfMonths = noOfMonthsBetween2Dates(startDate, endDate)
        const noOfMonths = Number(contractDtl?.durationMonth)
        const noOfHalfYears = Number(contractDtl?.durationMonth) / 6
        logger.debug('NoOfMonths: ', noOfMonths)
        logger.debug('noOfHalfYears: ', noOfHalfYears)
        totalAmount = chargeAmt
        for (let q = 0; q < noOfHalfYears; q++) {
          const m = 6 * q
          contractDtlStartDate = moment.utc(getFutureDates(startDate, m)).startOf('month').format('YYYY-MM-DD')
          contractDtlEndDate = moment.utc(getFutureDates(contractDtlStartDate, 5)).endOf('month').format('YYYY-MM-DD')

          if (moment.utc(startDate).format('YYYY-MM-DD') > moment.utc(contractDtlStartDate).format('YYYY-MM-DD')) {
            actualStartDate = moment.utc(startDate).format('YYYY-MM-DD')
          } else {
            actualStartDate = contractDtlStartDate
          }
          if (moment.utc(endDate).format('YYYY-MM-DD') < moment.utc(contractDtlEndDate).format('YYYY-MM-DD')) {
            actualEndDate = moment.utc(endDate).format('YYYY-MM-DD')
          } else {
            actualEndDate = contractDtlEndDate
          }
          const nextMonthBillPeriod = moment.utc(actualStartDate).startOf('month').format('YYYY-MM-DD')

          const ret = await calculateInvoice(chargeAmt, totalAmount, contractDtl, actualStartDate, actualEndDate, noOfHalfYears)
          const balanceAmount = Number(ret.balanceAmount)
          logger.debug('Monthly amount: ', ret.invoiceAmt)

          nextBill = balanceAmount === 0 ? null : nextMonthBillPeriod

          contractDtl.lastBillPeriod = lastMonthBillPeriod
          // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= moment.utc(startDate).format('YYYY-MM-DD') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : moment.utc(startDate).format('YYYY-MM-DD')
          if (contractDtl.upfrontPayment === 'N') {
            contractDtl.nextBillPeriod = moment.utc(getFutureDates(actualStartDate, 6)).startOf('month').format('YYYY-MM-DD')
          } else {
            contractDtl.nextBillPeriod = moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') >= moment.utc(startDate).format('YYYY-MM-DD') ? moment.utc(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') : moment.utc(startDate).format('YYYY-MM-DD')
          }

          if (contractDtl.nextBillPeriod < format(new Date(), 'yyyy-MM-dd')) {
            status = 'BILLED'
          } else {
            status = 'SCHEDULED'
          }

          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = ret.invoiceAmt
          contractDtl.balanceAmount = balanceAmount
          contractDtl.status = status
          contractDtl.createdAt = new Date()
          logger.debug('Creating Monthly contractdtl for charge type RC')

          const dtl = await MonthlyContractDtl.create(contractDtl, { transaction: t })
          totalAmount = balanceAmount
          lastMonthBillPeriod = contractDtl.nextBillPeriod
          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: contractDtl.nextBillPeriod,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Scheduled Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }
          await ContractScheduler.create(sch, { transaction: t })
        }
      } else if (contractDtl.chargeType === 'CC_RC' && contractDtl.frequency === 'FREQ_YEAR') {
        // const noOfMonths = noOfMonthsBetween2Dates(startDate, endDate)
        const noOfMonths = Number(contractDtl?.durationMonth)
        const noOfYears = Number(contractDtl?.durationMonth) / 12
        logger.debug('NoOfMonths: ', noOfMonths)
        logger.debug('noOfYears: ', noOfYears)
        totalAmount = chargeAmt
        for (let q = 0; q < noOfYears; q++) {
          const m = 12 * q
          contractDtlStartDate = moment(getFutureDates(startDate, m)).startOf('month').format('YYYY-MM-DD')
          contractDtlEndDate = moment(getFutureDates(contractDtlStartDate, 11)).endOf('month').format('YYYY-MM-DD')

          if (moment(startDate).format('YYYY-MM-DD') > moment(contractDtlStartDate).format('YYYY-MM-DD')) {
            actualStartDate = moment(startDate).format('YYYY-MM-DD')
          } else {
            actualStartDate = contractDtlStartDate
          }
          if (moment(endDate).format('YYYY-MM-DD') < moment(contractDtlEndDate).format('YYYY-MM-DD')) {
            actualEndDate = moment(endDate).format('YYYY-MM-DD')
          } else {
            actualEndDate = contractDtlEndDate
          }
          const nextMonthBillPeriod = moment(actualStartDate).startOf('month').format('YYYY-MM-DD')

          const ret = await calculateInvoice(chargeAmt, totalAmount, contractDtl, actualStartDate, actualEndDate, noOfYears)
          const balanceAmount = Number(ret.balanceAmount)
          logger.debug('Monthly amount: ', ret.invoiceAmt)

          nextBill = balanceAmount === 0 ? null : nextMonthBillPeriod

          contractDtl.lastBillPeriod = lastMonthBillPeriod
          // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= moment.utc(startDate).format('YYYY-MM-DD') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : moment.utc(startDate).format('YYYY-MM-DD')
          if (contractDtl.upfrontPayment === 'N') {
            contractDtl.nextBillPeriod = moment(getFutureDates(actualStartDate, 12)).startOf('month').format('YYYY-MM-DD')
          } else {
            contractDtl.nextBillPeriod = moment(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') >= moment.utc(startDate).format('YYYY-MM-DD') ? moment(nextMonthBillPeriod).startOf('month').format('YYYY-MM-DD') : moment.utc(startDate).format('YYYY-MM-DD')
          }

          if (contractDtl.nextBillPeriod < format(new Date(), 'yyyy-MM-dd')) {
            status = 'BILLED'
          } else {
            status = 'SCHEDULED'
          }

          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = ret.invoiceAmt
          contractDtl.balanceAmount = balanceAmount
          contractDtl.status = status
          contractDtl.createdAt = new Date()
          logger.debug('Creating Monthly contractdtl for charge type RC')

          const dtl = await MonthlyContractDtl.create(contractDtl, { transaction: t })
          totalAmount = balanceAmount
          lastMonthBillPeriod = contractDtl.nextBillPeriod
          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: contractDtl.nextBillPeriod,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Scheduled Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }
          await ContractScheduler.create(sch, { transaction: t })
        }
      } else if (contractDtl.chargeType === 'CC_RC' && contractDtl.frequency === 'FREQ_WEEKLY') {
        // const noOfMonths = noOfMonthsBetween2Dates(startDate, endDate)
        const noOfWeeks = getWeeksDiff(startDate,endDate)
        logger.debug('noOfWeeks: ', noOfWeeks)
        totalAmount = chargeAmt
        for (let q = 0; q < noOfWeeks; q++) {
          const m = 7 * q
          //contractDtlStartDate = format(startOfMonth(new Date(getFutureDates(startDate, m))), 'yyyy-MM-dd')
          contractDtlStartDate = moment().add(m,'days').format('YYYY-MM-DD')
          contractDtlEndDate = format(endOfMonth(new Date(contractDtlStartDate)), 'yyyy-MM-dd')

          if (format(new Date(startDate), 'yyyy-MM-dd') > format(new Date(contractDtlStartDate), 'yyyy-MM-dd')) {
            actualStartDate = format(new Date(startDate), 'yyyy-MM-dd')
          } else {
            actualStartDate = contractDtlStartDate
          }
          if (format(new Date(endDate), 'yyyy-MM-dd') < format(new Date(contractDtlEndDate), 'yyyy-MM-dd')) {
            actualEndDate = format(new Date(endDate), 'yyyy-MM-dd')
          } else {
            actualEndDate = contractDtlEndDate
          }
          const nextMonthBillPeriod = new Date(getFutureDates(startOfMonth(new Date(actualStartDate)), 0))

          const ret = await calculateInvoice(chargeAmt, totalAmount, contractDtl, actualStartDate, actualEndDate, noOfWeeks)
          const balanceAmount = Number(ret.balanceAmount)
          logger.debug('Monthly amount: ', ret.invoiceAmt)

          nextBill = balanceAmount === 0 ? null : nextMonthBillPeriod

          contractDtl.lastBillPeriod = lastMonthBillPeriod
          // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= format(startDate, 'yyyy-MM-dd') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd')
          if (contractDtl.upfrontPayment === 'N') {
            //contractDtl.nextBillPeriod = format(startOfMonth(new Date(getFutureDates(actualStartDate, 1))), 'yyyy-MM-dd')
            contractDtl.nextBillPeriod = moment().add(7,'days').format('YYYY-MM-DD')
          } else {
            contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= format(startDate, 'yyyy-MM-dd') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd')
          }

          if (contractDtl.nextBillPeriod < format(new Date(), 'yyyy-MM-dd')) {
            status = 'BILLED'
          } else {
            status = 'SCHEDULED'
          }

          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = ret.invoiceAmt
          contractDtl.balanceAmount = balanceAmount
          contractDtl.status = status
          contractDtl.createdAt = new Date()
          logger.debug('Creating Monthly contractdtl for charge type RC')

          const dtl = await MonthlyContractDtl.create(contractDtl, { transaction: t })
          totalAmount = balanceAmount
          lastMonthBillPeriod = contractDtl.nextBillPeriod
          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: contractDtl.nextBillPeriod,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Scheduled Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }
          await ContractScheduler.create(sch, { transaction: t })
        }
      } else if (contractDtl.chargeType === 'CC_RC' && contractDtl.frequency === 'FREQ_DAILY') {
        // const noOfMonths = noOfMonthsBetween2Dates(startDate, endDate)
        const noOfMonths = Number(contractDtl?.durationMonth)
        logger.debug('NoOfMonths: ', noOfMonths)
        totalAmount = chargeAmt
        for (let q = 0; q < noOfMonths; q++) {
          const m = 1 * q
          contractDtlStartDate = format(startOfMonth(new Date(getFutureDates(startDate, m))), 'yyyy-MM-dd')
          contractDtlEndDate = format(endOfMonth(new Date(contractDtlStartDate)), 'yyyy-MM-dd')

          if (format(new Date(startDate), 'yyyy-MM-dd') > format(new Date(contractDtlStartDate), 'yyyy-MM-dd')) {
            actualStartDate = format(new Date(startDate), 'yyyy-MM-dd')
          } else {
            actualStartDate = contractDtlStartDate
          }
          if (format(new Date(endDate), 'yyyy-MM-dd') < format(new Date(contractDtlEndDate), 'yyyy-MM-dd')) {
            actualEndDate = format(new Date(endDate), 'yyyy-MM-dd')
          } else {
            actualEndDate = contractDtlEndDate
          }
          const nextMonthBillPeriod = new Date(getFutureDates(startOfMonth(new Date(actualStartDate)), 0))

          const ret = await calculateInvoice(chargeAmt, totalAmount, contractDtl, actualStartDate, actualEndDate, noOfMonths)
          const balanceAmount = Number(ret.balanceAmount)
          logger.debug('Monthly amount: ', ret.invoiceAmt)

          nextBill = balanceAmount === 0 ? null : nextMonthBillPeriod

          contractDtl.lastBillPeriod = lastMonthBillPeriod
          // contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= format(startDate, 'yyyy-MM-dd') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd')
          if (contractDtl.upfrontPayment === 'N') {
            contractDtl.nextBillPeriod = format(startOfMonth(new Date(getFutureDates(actualStartDate, 1))), 'yyyy-MM-dd')
          } else {
            contractDtl.nextBillPeriod = format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') >= format(startDate, 'yyyy-MM-dd') ? format(startOfMonth(nextMonthBillPeriod), 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd')
          }

          if (contractDtl.nextBillPeriod < format(new Date(), 'yyyy-MM-dd')) {
            status = 'BILLED'
          } else {
            status = 'SCHEDULED'
          }

          contractDtl.actualStartDate = actualStartDate
          contractDtl.actualEndDate = actualEndDate
          contractDtl.chargeAmt = ret.invoiceAmt
          contractDtl.balanceAmount = balanceAmount
          contractDtl.status = status
          contractDtl.createdAt = new Date()
          logger.debug('Creating Monthly contractdtl for charge type RC')

          const dtl = await MonthlyContractDtl.create(contractDtl, { transaction: t })
          totalAmount = balanceAmount
          lastMonthBillPeriod = contractDtl.nextBillPeriod
          const sch = {
            schedulerName: 'Scheduler for Contracts',
            scheduleDatetime: contractDtl.nextBillPeriod,
            billPeriod: actualStartDate.toString() + '-' + actualEndDate.toString(),
            scheduleStatus: status,
            remarks: 'Scheduled Contracts',
            soId: contractDtl.soId,
            contractId: contractDtl.contractId,
            contractDtlId: contractDtl.contractDtlId,
            createdBy: systemUserId,
            monthlyContractDtlId: dtl.monthlyContractDtlId
          }
          await ContractScheduler.create(sch, { transaction: t })
        }
      } else if (contractDtl.chargeType === 'CC_NRC') {
        const lastMonthBillPeriod = null
        const nextMonthBillPeriod = format(new Date(startDate), 'yyyy-MM-dd')
        let balanceAmount = 0
        /// frequcny changes
        if (format(startDate, 'yyyy-MM-dd') < format(startOfMonth(new Date()), 'yyyy-MM-dd')) {
          status = 'BILLED'
          // contractDtl.isMigrated = 'Y'
        } else {
          status = 'SCHEDULED'
          balanceAmount = chargeAmt
        }
        // if(contractDtl.frequency === 'FREQ_QUARTER')  {
        //   if (format(startDate, 'yyyy-MM-dd') < format(startOfMonth(new Date()), 'yyyy-MM-dd')) {
        //     status = 'BILLED'
        //     contractDtl.isMigrated = 'Y'
        //   } else {
        //     status = 'SCHEDULED'
        //     balanceAmount = chargeAmt
        //   }
        // } else if (contractDtl.frequency === 'FREQ_MONTH') {
        //   status = 'SCHEDULED'
        //   balanceAmount = chargeAmt
        // }
        contractDtl.actualStartDate = startDate
        contractDtl.actualEndDate = endDate
        contractDtl.chargeAmt = chargeAmt
        contractDtl.balanceAmount = balanceAmount
        contractDtl.nextBillPeriod = nextMonthBillPeriod
        contractDtl.lastBillPeriod = lastMonthBillPeriod
        contractDtl.status = status
        contractDtl.createdAt = new Date()
        // if(contractDtl.upfrontPayment === 'N') {
        //   contractDtl.nextBillPeriod = format(startOfMonth(new Date(getFutureDates(actualStartDate, 1))), 'yyyy-MM-dd')
        // } else {
        //   contractDtl.nextBillPeriod = format(new Date(startDate), 'yyyy-MM-dd')
        // }
        logger.debug('Creating Monthly contractdtl for charge type NRC')
        const dtl = await MonthlyContractDtl.create(contractDtl, { transaction: t })
        console.log('=========================================')

        const sch = {
          schedulerName: 'Scheduler for Contracts',
          scheduleDatetime: format(new Date(nextMonthBillPeriod), 'yyyy-MM-dd'),
          billPeriod: format(new Date(startDate), 'yyyy-MM-dd').toString() + '-' + format(new Date(endDate), 'yyyy-MM-dd').toString(),
          scheduleStatus: status,
          remarks: 'Migrated main Contracts',
          soId: contractDtl.soId,
          contractId: contractDtl.contractId,
          contractDtlId: contractDtl.contractDtlId,
          createdBy: systemUserId,
          monthlyContractDtlId: dtl.monthlyContractDtlId
        }
        console.log('=========================================', sch)
        await ContractScheduler.create(sch, { transaction: t })
      }
    }
  }
  logger.debug('Succesfully created Monthly contract details for RC and NRC')
}

const createUsageMonthlyContractdtl = async (t) => {
  logger.debug('Creating Monthly contract details for USAGE')
  const usageContractDetails = await sequelize.query(
    `select * from contract_dtl where contract_dtl_id not in (select contract_dtl_id from contract_scheduler cs where contract_dtl_id is not null) 
          and status='ACTIVE' and charge_type in ('CC_USGC')            
        `, {
    type: QueryTypes.SELECT,
    model: ContractDtl,
    mapToModel: true,
    transaction: t
  })
  if (usageContractDetails && !isEmpty(usageContractDetails)) {
    let minCommitment = 0; let soNumber
    const soNumbers = []
    // const nextMonthBillPeriod = startOfMonth(new Date(getFutureDates(usageContractDetails[0].nextBillPeriod, 3)))
    const lastBill = usageContractDetails[0].nextBillPeriod
    let contractBillMonth
    for (const contractDtl of usageContractDetails) {
      if (contractDtl.chargeType === 'CC_USGC') {
        minCommitment += Number(contractDtl.dataValues.minCommitment)
        soNumbers.push(contractDtl.dataValues.soNumber)
        if (soNumbers.length > 0) {
          soNumber = [...new Set(soNumbers)].toString()
        }
      }
    }
    for (let i = 1; i <= 3; i++) {
      contractBillMonth = getOlderDates(lastBill, i)
      const billStartDate = format(startOfMonth(new Date(contractBillMonth)), 'yyyy-MM-dd')
      const billEndDate = format(endOfMonth(new Date(contractBillMonth)), 'yyyy-MM-dd')
      const data = {
        minCommitment,
        soNumber,
        isMigrated: 'Y',
        createdBy: systemUserId,
        updatedBy: systemUserId,
        status: 'SCHEDULED',
        actualStartDate: billStartDate,
        endDate: billEndDate,
        actualEndDate: billEndDate,
        itemName: usageContractDetails[0].itemName,
        itemId: usageContractDetails[0].itemId,
        contractId: usageContractDetails[0].contractId,
        contractDtlId: usageContractDetails[0].contractDtlId,
        frequency: usageContractDetails[0].frequency,
        prorated: usageContractDetails[0].prorated,
        chargeName: usageContractDetails[0].chargeName,
        chargeType: usageContractDetails[0].chargeType,
        upfrontPayment: usageContractDetails[0].upfrontPayment,
        quantity: minCommitment,
        durationMonth: usageContractDetails[0].durationMonth,
        soId: usageContractDetails[0].soId,
        nextBillPeriod: usageContractDetails[0].nextBillPeriod,
        lastBillPeriod: usageContractDetails[0].lastBillPeriod
      }
      logger.debug('Creating monthly dtl contracts')
      const dtl = await MonthlyContractDtl.create(data, { transaction: t })

      const sch = {
        schedulerName: 'Scheduler for Contracts',
        scheduleDatetime: format(new Date(lastBill), 'yyyy-MM-dd'),
        billPeriod: format(startOfMonth(new Date(getOlderDates(lastBill, 1))), 'yyyy-MM-dd').toString() + '-' + format(startOfMonth(new Date(getOlderDates(lastBill, 3))), 'yyyy-MM-dd').toString(),
        scheduleStatus: 'SCHEDULED',
        remarks: 'Migrated Usage Contracts',
        soId: usageContractDetails[0].soId,
        contractId: usageContractDetails[0].contractId,
        contractDtlId: usageContractDetails[0].contractDtlId,
        createdBy: systemUserId,
        monthlyContractDtlId: dtl.monthlyContractDtlId
      }
      await ContractScheduler.create(sch, { transaction: t })
    }
  }
  logger.debug('Succesfully created Monthly contract details for USAGE')
}

const createMonthlyContract = async (t) => {
  logger.debug('Creating Monthly contracts ')
  const contracts = await sequelize.query(`select * from contract where contract_id in 
                    (select contract_id from contract_scheduler cs where contract_id is not null and monthly_contract_id is null) 
                    and status not in ('CREATED','CANCEL')
                    and status = case when is_migrated ='N' then 'ACTIVE' else status end`, {
    type: QueryTypes.SELECT,
    model: Contract,
    mapToModel: true,
    transaction: t
  })

  if (Array.isArray(contracts) && !isEmpty(contracts)) {
    for (const contract of contracts) {
      const sql = `select * from GET_MONTHLY_CONTRACT_JOB('BILLED',${contract.contractId})`

      let billedContractDetails = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      billedContractDetails = camelCaseConversion(billedContractDetails)
      let noOfBillings = 0
      logger.debug('Count of billed monthly contract details: ', billedContractDetails.length)
      if (Array.isArray(billedContractDetails) && !isEmpty(billedContractDetails)) {
        for (const contractDtl of billedContractDetails) {
          noOfBillings = noOfBillings + 1
          // const contractStart = format(new Date(contractDtl.actualStartDate), 'yyyy-MM-dd')
          // const contractEnd = format(new Date(contractDtl.actualEndDate), 'yyyy-MM-dd')
          // const nextMonthBillPeriod = startOfMonth(new Date(getFutureDates(startOfMonth(new Date(contractDtl.actualEndDate)), 1)))
          // const lastBill = startOfMonth(new Date(contractDtl.actualEndDate))
          contract.isNew = 'N'
          contract.status = 'BILLED'
          contract.startDate = contractDtl.actualStartDate
          contract.endDate = contractDtl.actualEndDate
          contract.actualEndDate = contractDtl.actualEndDate
          // contract.nextBillPeriod = nextMonthBillPeriod
          // contract.lastBillPeriod = lastBill
          contract.nextBillPeriod = contractDtl.nextBillPeriod
          contract.lastBillPeriod = contractDtl.lastBillPeriod
          contract.contractId = contractDtl.contractId
          const rcAmount = contractDtl.rcAmount
          const otcAmount = contractDtl.otcAmount

          contract.rcAmount = rcAmount
          contract.otcAmount = otcAmount
          contract.createdAt = new Date()
          contract.dataValues.noOfBillings = noOfBillings

          logger.debug('Creating Monthly Contract Record')
          const contractId = await MonthlyContract.create(contract.dataValues, { transaction: t })

          await MonthlyContractDtl.update({
            monthlyContractId: contractId.monthlyContractId
          },
            {
              where: {
                actualStartDate: contractDtl.actualStartDate,
                // actualEndDate: contractDtl.actualEndDate,
                status: 'BILLED',
                contractId: contractDtl.contractId
              },
              transaction: t
            })
          await ContractScheduler.update({
            monthlyContractId: contractId.monthlyContractId
          },
            {
              where: {
                billPeriod: {
                  [Op.like]: `${contractDtl.actualStartDate}%`
                },
                scheduleStatus: 'BILLED',
                contractId: contractDtl.contractId,
                monthlyContractId: null
              },
              transaction: t
            })
        }
      }

      const schSql = `select * from GET_MONTHLY_CONTRACT_JOB('SCHEDULED',${contract.contractId})`

      let scheduledContractDetails = await sequelize.query(schSql, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      scheduledContractDetails = camelCaseConversion(scheduledContractDetails)
      // console.log('scheduledContractDetails',scheduledContractDetails)
      // console.log(aaa)
      logger.debug('Count of scheduled monthly contract details: ', scheduledContractDetails.length)
      if (Array.isArray(scheduledContractDetails) && !isEmpty(scheduledContractDetails)) {
        for (const contractDtl of scheduledContractDetails) {
          // console.log('contractDtl',contractDtl)
          noOfBillings = noOfBillings + 1
          // const contractStart = format(new Date(contractDtl.actualStartDate), 'yyyy-MM-dd')
          // const contractEnd = format(new Date(contractDtl.actualEndDate), 'yyyy-MM-dd')
          contract.isNew = 'N'
          contract.status = 'SCHEDULED'
          contract.startDate = contractDtl.actualStartDate
          contract.endDate = contractDtl.actualEndDate
          contract.actualEndDate = null
          contract.nextBillPeriod = contractDtl.nextBillPeriod
          contract.lastBillPeriod = contractDtl.lastBillPeriod
          contract.contractId = contractDtl.contractId
          contract.rcAmount = contractDtl.rcAmount
          contract.otcAmount = contractDtl.otcAmount
          contract.dataValues.noOfBillings = noOfBillings
          // console.log('contractDtl',contract)
          logger.debug('Creating scheduled monthly contacts')
          const contractId = await MonthlyContract.create(contract.dataValues, { transaction: t })
          await MonthlyContractDtl.update({
            monthlyContractId: contractId.monthlyContractId
          },
            {
              where: {
                // isMigrated: 'Y',
                actualStartDate: contractDtl.actualStartDate,
                // actualEndDate: contractDtl.actualEndDate,
                status: 'SCHEDULED',
                contractId: contractDtl.contractId
              },
              transaction: t
            })

          await ContractScheduler.update({
            monthlyContractId: contractId.monthlyContractId
          },
            {
              where: {
                billPeriod: {
                  [Op.like]: `${contractDtl.actualStartDate}%`
                },
                scheduleStatus: 'SCHEDULED',
                contractId: contractDtl.contractId,
                monthlyContractId: null
              },
              transaction: t
            })
        }
      }
      const scheduledUsageContract = await sequelize.query(`select * from Contract where contract_id in (select contract_id 
                                      from monthly_contract_dtl where status='SCHEDULED' and charge_type='CC_USGC')`, {
        type: QueryTypes.SELECT,
        model: Contract,
        mapToModel: true,
        transaction: t
      })
      logger.debug('Count of scheduled monthly usage contract: ', scheduledUsageContract.length)
      if (Array.isArray(scheduledUsageContract) && !isEmpty(scheduledUsageContract)) {
        for (const contract of scheduledUsageContract) {
          contract.isNew = 'N'
          contract.status = 'SCHEDULED'
          logger.debug('Creating scheduled monthly contacts for usage')
          const contractId = await MonthlyContract.create(contract.dataValues, { transaction: t })
          await MonthlyContractDtl.update({ monthlyContractId: contractId.monthlyContractId }, {
            where: {
              chargeType: 'CC_USGC',
              status: 'SCHEDULED',
              nextBillPeriod: contract.dataValues.nextBillPeriod
            },
            transaction: t
          })
          const dtl = await MonthlyContractDtl.findAll({
            where: {
              chargeType: 'CC_USGC',
              status: 'SCHEDULED',
              nextBillPeriod: contract.dataValues.nextBillPeriod,
              monthlyContractId: contractId.monthlyContractId
            },
            transaction: t
          })
          const monthlyContractIds = map(dtl, 'monthlyContractDtlId')
          await ContractScheduler.update({ monthlyContractId: contractId.monthlyContractId },
            {
              where: {
                monthlyContractDtlId: monthlyContractIds,
                scheduleStatus: 'SCHEDULED',
                monthlyContractId: null
              },
              transaction: t
            })
        }
      }
    }
  }
  logger.debug('Succesfully created Monthly contracts')
}

async function mergeMonthlyContractDtl(contractIds, billPeriod, endOfbillPeriodMonth, contractType, t) {
  contractIds = [...new Set(contractIds)]
  logger.info('Inside onhold existing unbilled contract merge')
  const monthlyContractIds = await MonthlyContract.findAll({
    where: {
      contractId: contractIds,
      status: {
        [Op.ne]: 'BILLED'
      }
    }
  })
  if (monthlyContractIds.length > 0) {
    let data
    for (const monthlyContractId of monthlyContractIds) {
      let rcAmount = 0; let otcAmount = 0; let usageAmount = 0
      await MonthlyContractDtl.update({ monthlyContractId: monthlyContractId.monthlyContractId }, {
        where: {
          contractId: monthlyContractId.contractId,
          status: 'UNBILLED'
        },
        transaction: t
      })
      const res = await MonthlyContractDtl.findAll({
        where: {
          contractId: monthlyContractId.contractId,
          status: 'UNBILLED'
        }
      })
      for (const rec of res) {
        rcAmount += rec.chargeType === 'CC_RC' ? Number(rec.chargeAmt) : 0
        otcAmount += rec.chargeType === 'CC_NRC' ? Number(rec.chargeAmt) : 0
        usageAmount += rec.chargeType === 'CC_USGC' ? Number(rec.chargeAmt) : 0
      }
      data = {
        rcAmount,
        otcAmount,
        usageAmount
      }
      await MonthlyContract.update(data, { where: { monthlyContractId: monthlyContractId.monthlyContractId }, transaction: t })
    }
  } else {
    for (const contractId of contractIds) {
      const contracts = await Contract.findOne({
        where: {
          contractId
        }
      })
      let detailsRecords
      if (contractType === 'OLD') {
        detailsRecords = await MonthlyContractDtl.findAll({
          where: {
            contractId,
            nextBillPeriod: {
              [Op.lt]: billPeriod
            },
            status: 'UNBILLED'
          }
        })
      } else {
        detailsRecords = await MonthlyContractDtl.findAll({
          where: {
            contractId: contractId,
            nextBillPeriod: {
              [Op.gte]: billPeriod,
              [Op.lte]: endOfbillPeriodMonth
            },
            status: 'UNBILLED'
          }
        })
      }

      const data = {}
      for (const contract of detailsRecords) {
        let rcAmount = 0; let otcAmount = 0; let usageAmount = 0
        rcAmount += contract.chargeType === 'CC_RC' ? Number(contract.chargeAmt) : 0
        otcAmount += contract.chargeType === 'CC_NRC' ? Number(contract.chargeAmt) : 0
        usageAmount += contract.chargeType === 'CC_USGC' ? Number(contract.chargeAmt) : 0

        data.isNew = contract.lastBillPeriod === null ? 'Y' : 'N'
        data.createdBy = systemUserId
        data.updatedBy = systemUserId
        data.status = 'UNBILLED'
        data.startDate = format(new Date(contract.actualStartDate), 'yyyy-MM-dd')
        data.endDate = format(new Date(contract.actualEndDate), 'yyyy-MM-dd')
        data.rcAmount = rcAmount
        data.otcAmount = contract.lastBillPeriod === null ? otcAmount : 0
        data.usageAmount = usageAmount
        data.contractId = contracts.contractId
        data.customerId = contracts.customerId
        data.billRefNo = contracts.billRefNo
        data.nextBillPeriod = contract.nextBillPeriod

        const monthContract = await MonthlyContract.create(data, { transaction: t })
        await MonthlyContractDtl.update({ monthlyContractId: monthContract.monthlyContractId }, {
          where: { monthlyContractDtlId: contract.monthlyContractDtlId },
          transaction: t
        })
      }
    }
  }
}

const processCreatedInteraction = async (interaction) => {
  try {
    const connectionData = await Connection.findOne({
      where: {
        connectionId: interaction.connectionId
      }
    })

    for (const wd of workflowDefinitions) {
      if (wd.woType === interaction.woType && wd.intxnType === interaction.intxnType) {
        const t = await sequelize.transaction()
        try {
          for (const step of wd.steps) {
            if (step.stepName === 'SETMANUAL' && connectionData.assignSimLater !== 'Y') {
              continue
            }
            const taskData = {
              intxnId: interaction.intxnId,
              taskId: step.stepName,
              status: step.status,
              createdBy: systemUserId,
              updatedBy: systemUserId
            }

            await InteractionTask.create(taskData, { transaction: t })
          }
          if (interaction.intxnType === 'REQSR') {
            await Interaction.update({ currStatus: 'NEW' }, {
              where: {
                intxnId: interaction.intxnId
              },
              transaction: t
            })
          } else if (interaction.intxnType === 'REQCOMP') {
            await Interaction.update({ isBotReq: 'Y' }, {
              where: {
                intxnId: interaction.intxnId
              },
              transaction: t
            })
          }
          await t.commit()
        } catch (error) {
          await t.rollback()
          logger.error(error, 'Error creating tasks for Workflow definition')
        }
      }
    }
  } catch (error) {
    logger.error(error, 'Unexpected error creating tasks for Workflow definition')
  }
}

const processWIPInteraction = async (interaction) => {
  const tasks = await InteractionTask.findAll({
    include: [
      { model: BusinessEntity, as: 'taskIdLookup', attributes: ['code', 'description', 'mappingPayload'] }
    ],
    where: {
      intxnId: interaction.intxnId
    },
    order: [
      ['intxnTaskId', 'ASC']
    ]
  })
  // const taskCount = tasks.length
  // let closedTaskCount = 0
  // const tasksList = []
  for (const task of tasks) {
    logger.debug(interaction.woType, task.taskId)
    if ((interaction.woType === 'WONC' && task.taskId === 'CREATECUSTACCT') ||
      (interaction.woType === 'WONC-ACCSER' && task.taskId === 'CREATEACCT')) {
      await processCreateCustAndAccount(interaction, task)
    }
    if ((interaction.woType === 'WONC' || interaction.woType === 'WONC-ACCSER' || interaction.woType === 'WONC-SER') && task.taskId === 'CREATESERVICE') {
      await processCreateService(interaction, task)
    }
    if ((interaction.woType === 'WONC' || interaction.woType === 'WONC-ACCSER') && task.taskId === 'SETMANUAL') {
      await processSetManual(interaction, task, tasks)
    }
    if ((interaction.woType === 'BAR' || interaction.woType === 'UNBAR') && task.taskId === 'CREATEBARUNBAR') {
      await processTaskPayload(interaction, task)
    }
    if ((interaction.woType === 'BAR' || interaction.woType === 'UNBAR') && task.taskId === 'PROCESSBARUNBAR') {
      await processBarUnBar(interaction, task, tasks)
    }
    if ((interaction.woType === 'BAR' || interaction.woType === 'UNBAR') && task.taskId === 'RETRY') {
      await processRetry(interaction, task, tasks)
    }
    if (interaction.woType === 'UPGRADE' && task.taskId === 'CREATEPLANCHNG') {
      await processTaskPayload(interaction, task)
    }
    if (interaction.woType === 'DOWNGRADE' && task.taskId === 'CREATEPLANCHNG') {
      await processTaskPayload(interaction, task)
    }
    if (interaction.woType === 'TERMINATE' && task.taskId === 'CREATETERMINATE') {
      await processTaskPayload(interaction, task)
    }
    if (interaction.woType === 'TERMINATE' && task.taskId === 'CLOSESR') {
      await terminateService(interaction, task, tasks)
    }
    if (interaction.woType === 'VASACT' && (task.taskId === 'CREATEVASCER' || task.taskId === 'CREATEVASOMS')) {
      await processTaskPayload(interaction, task)
    }
    if (interaction.woType === 'VASDEACT' && (task.taskId === 'CREATEVASCER' || task.taskId === 'CREATEVASOMS')) {
      await processTaskPayload(interaction, task)
    }
    if (interaction.woType === 'RELOCATE' && task.taskId === 'CREATERELOCATE') {
      await processCreateService(interaction, task)
    }
    if (interaction.woType === 'TELEPORT' && task.taskId === 'CREATETELEPORT') {
      await processTaskPayload(interaction, task)
    }
    if (task.taskId === 'CLOSESR') {
      await processCloseSR(interaction, task, tasks)
    }
    if (interaction.woType === 'FAULT' && task.taskId === 'CREATEFAULT') {
      await processFaultPayload(interaction, task)
    }

    if (task.status === 'WIP') {
      break
    }
    if (task.status === 'CLOSED' || task.status === 'CLOSED-INCOMPLETE') {
      // closedTaskCount++
      continue
    }

    if (task.status === 'DONE' || task.status === 'DONE-INCOMPLETE' || task.status === 'FAILED') {
      // Need to check with Ilango what to implement here - Eswar
    }
  }
}

const processCreateCustAndAccount = async (interaction, task) => {
  logger.debug('processCreateCustAndAccount', interaction.intxnId, task.taskId, task.status)

  if (task.status === 'NEW' || task.status === 'WIP' || task.status === 'CLOSED' || task.status === 'RESOLVED') {
    return true
  }

  if (task.status === 'FAILED') {
    const t = await sequelize.transaction()
    try {
      let message
      if (!task.payload || !task.payload.remarks) {
        message = 'Task status is FAILED, but source system did not return any error message'
      } else {
        message = 'Task failed. Please check BOTS response for details.'
      }

      await InteractionTask.update({
        status: 'ERROR',
        message: message,
        updatedBy: systemUserId
      },
      {
        where: {
          intxnTaskId: task.intxnTaskId,
          intxnId: interaction.intxnId
        },
        transaction: t
      }
      )
      await Interaction.update(
        { currStatus: 'FAILED' },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
      )
      await t.commit()
    } catch (error) {
      t.rollback()
      logger.error(error, 'processCreateCustAndAccount - Error in updating interaction and task status for failed task - ' + task.intxnTaskId + ', ' + interaction.intxnId)
    }
  } else if (!task.payload || (interaction.woType === 'WONC' && !task.payload.customerNbr) || !task.payload.accountNbr ||
    (interaction.woType === 'WONC' && task.payload.customerNbr === '') || task.payload.accountNbr === '') {
    let message
    if (!task.payload || !task.payload.remarks) {
      message = 'Data returned by BOTS is missing all required fields'
    } else {
      message = 'Task error. Please check BOTS response for details'
    }

    const t = await sequelize.transaction()
    try {
      await InteractionTask.update({
        status: 'ERROR',
        message: message,
        updatedBy: systemUserId
      },
      {
        where: {
          intxnTaskId: task.intxnTaskId,
          intxnId: interaction.intxnId
        },
        transaction: t
      }
      )
      await Interaction.update(
        { currStatus: 'FAILED' },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
      )
      await t.commit()
    } catch (error) {
      t.rollback()
      logger.error(error, '1 - Error updating task in processCreateCustAndAccount')
    }
  } else {
    const t = await sequelize.transaction()
    try {
      if (interaction.woType === 'WONC') {
        await updateCustAndAcctNbr(interaction.customerId, interaction.accountId,
          task.payload.customerNbr, task.payload.accountNbr, t)
      }

      if (interaction.woType === 'WONC-ACCSER') {
        await updateAcctNbr(interaction.accountId, task.payload.accountNbr, t)
      }

      await InteractionTask.update({
        status: 'CLOSED',
        updatedBy: systemUserId
      },
      {
        where: {
          intxnTaskId: task.intxnTaskId,
          intxnId: interaction.intxnId
        },
        transaction: t
      }
      )
      await t.commit()
    } catch (error) {
      t.rollback()
      logger.error(error, '2 - Error updating task in processCreateCustAndAccount')
    }
  }
}

const processCreateService = async (interaction, task) => {
  logger.debug('processCreateService', interaction.intxnId, task.taskId, task.status)

  if (task.status === 'NEW' || task.status === 'WIP' || task.status === 'CLOSED' || task.status === 'RESOLVED') {
    return false
  }

  if (task.status === 'FAILED') {
    const t = await sequelize.transaction()
    try {
      let message
      if (!task.payload || !task.payload.remarks) {
        message = 'Task status is FAILED, but source system did not return any error message'
      } else {
        message = 'Task failed. Please check BOTS response for details'
      }

      await InteractionTask.update({
        status: 'ERROR',
        message: message,
        updatedBy: systemUserId
      },
      {
        where: {
          intxnTaskId: task.intxnTaskId,
          intxnId: interaction.intxnId
        },
        transaction: t
      }
      )
      await Interaction.update(
        { currStatus: 'FAILED' },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
      )
      await t.commit()
    } catch (error) {
      t.rollback()
      logger.error(error, 'processCreateService - Error in updating interaction and task status for failed task - ' + task.intxnTaskId + ', ' + interaction.intxnId)
    }
  } else {
    const { connectionData, planData } = await getConnectionAndPlan(interaction)

    if (connectionData.connectionSelection === 'auto' && (!task.payload || !task.payload.accessNbr || task.payload.accessNbr === '' ||
      !task.payload.external_ref_sys || !task.payload.external_ref_no ||
      task.payload.external_ref_sys === '' || task.payload.external_ref_no === '')) {
      const t = await sequelize.transaction()
      try {
        let message
        if (!task.payload) {
          message = 'Payload is missing'
        } else {
          if (!task.payload.remarks) {
            message = 'Payload is not valid. It may be missing required fields or may not be in the right format'
          } else {
            message = 'Task error. Please check BOTS response for details'
          }
        }
        await InteractionTask.update({
          status: 'ERROR',
          message: message,
          updatedBy: systemUserId
        },
        {
          where: {
            intxnTaskId: task.intxnTaskId,
            intxnId: interaction.intxnId
          },
          transaction: t
        }
        )
        await Interaction.update(
          { currStatus: 'FAILED' },
          {
            where: {
              intxnId: interaction.intxnId
            },
            transaction: t
          }
        )
        await t.commit()
      } catch (error) {
        t.rollback()
        logger.error(error, '1 - Error updating task in processCreateService')
      }
    } else if (connectionData.connectionSelection === 'manual' && (!task.payload || !task.payload.external_ref_sys || !task.payload.external_ref_no ||
      task.payload.external_ref_sys === '' || task.payload.external_ref_no === '')) {
      const t = await sequelize.transaction()
      try {
        await InteractionTask.update({
          status: 'ERROR',
          message: '2 - Task update data is invalid and cannot be processed further - processCreateService',
          updatedBy: systemUserId
        },
        {
          where: {
            intxnTaskId: task.intxnTaskId,
            intxnId: interaction.intxnId
          },
          transaction: t
        }
        )
        await Interaction.update(
          { currStatus: 'FAILED' },
          {
            where: {
              intxnId: interaction.intxnId
            },
            transaction: t
          }
        )
        await t.commit()
      } catch (error) {
        t.rollback()
        logger.error(error, '1 - Error updating task in processCreateService')
      }
    } else {
      let iccid
      if (planData.prodType === 'Fixed') {
        iccid = 'FIXEDLINE'
      } else {
        iccid = connectionData.iccid
      }

      // if (connectionData.connectionSelection === 'auto') {
      //   accessNbr = task.payload.accessNbr
      //   await blockAccessNumber(accessNbr, iccid)
      // } else {
      const accessNbr = connectionData.identificationNo
      //  }

      const status = await allocateAccessNumber(accessNbr, iccid)
      // const status = true

      if (status) {
        const t = await sequelize.transaction()
        try {
          if (connectionData.connectionSelection === 'auto') {
            await Connection.update({
              identificationNo: task.payload.accessNbr,
              updatedBy: systemUserId
            },
            {
              where: {
                connectionId: interaction.connectionId
              },
              transaction: t
            }
            )
          }
          const interactionData = {}
          let found = false
          if (!interaction.externalRefSys1 || interaction.externalRefSys1 === task.payload.external_ref_sys) {
            interactionData.externalRefNo1 = task.payload.external_ref_no
            interactionData.externalRefSys1 = task.payload.external_ref_sys
            found = true
          } else if (!interaction.externalRefSys2 || interaction.externalRefSys2 === task.payload.external_ref_sys) {
            interactionData.externalRefNo2 = task.payload.external_ref_no
            interactionData.externalRefSys2 = task.payload.external_ref_sys
            found = true
          } else if (interaction.externalRefSys3 || interaction.externalRefSys3 === task.payload.external_ref_sys) {
            interactionData.externalRefNo3 = task.payload.external_ref_no
            interactionData.externalRefSys3 = task.payload.external_ref_sys
            found = true
          } else if (!interaction.externalRefSys4 || interaction.externalRefSys4 === task.payload.external_ref_sys) {
            interactionData.externalRefNo4 = task.payload.external_ref_no
            interactionData.externalRefSys4 = task.payload.external_ref_sys
            found = true
          }
          if (found) {
            await Interaction.update(
              interactionData,
              {
                where: {
                  intxnId: interaction.intxnId
                },
                transaction: t
              }
            )
            await InteractionTask.update({
              status: 'CLOSED',
              updatedBy: systemUserId
            },
            {
              where: {
                intxnTaskId: task.intxnTaskId,
                intxnId: interaction.intxnId
              },
              transaction: t
            }
            )
          } else {
            await InteractionTask.update({
              status: 'ERROR',
              message: 'processCreateService - No empty external references found to update',
              updatedBy: systemUserId
            },
            {
              where: {
                intxnTaskId: task.intxnTaskId,
                intxnId: interaction.intxnId
              },
              transaction: t
            }
            )
            await Interaction.update(
              { currStatus: 'FAILED' },
              {
                where: {
                  intxnId: interaction.intxnId
                },
                transaction: t
              }
            )
          }
          await t.commit()
        } catch (error) {
          t.rollback()
          logger.error(error, 'processCreateService - Error while updating external references')
        }
      } else {
        const t = await sequelize.transaction()
        try {
          await InteractionTask.update({
            status: 'ERROR',
            message: 'Unable to allocate access number in TIBCO',
            updatedBy: systemUserId
          },
          {
            where: {
              intxnTaskId: task.intxnTaskId,
              intxnId: interaction.intxnId
            },
            transaction: t
          }
          )
          await Interaction.update(
            { currStatus: 'FAILED' },
            {
              where: {
                intxnId: interaction.intxnId
              },
              transaction: t
            }
          )
          await t.commit()
        } catch (error) {
          t.rollback()
          logger.error(error, 'Error while allocating access number in TIBCO')
        }
      }
    }
  }
}

const processSetManual = async (interaction, task, tasks) => {
  console.log('processSetManual', interaction.intxnId, task.taskId, task.status)

  if (task.status === 'CLOSED') {
    return true
  }

  let taskCloseCount = 0
  let taskCount = 0

  for (const t of tasks) {
    if (t.intxnTaskId >= task.intxnTaskId) {
      break
    }
    if (t.status === 'CLOSED') {
      taskCloseCount++
    }
    taskCount++
  }

  if (taskCloseCount !== taskCount) {
    return true
  }

  const { planData } = await getConnectionAndPlan(interaction)

  if (['Fixed'].includes(planData.planType)) {
    if (['NEW', 'WIP'].includes(task.status)) {
      return true
    }
  }
  const t = await sequelize.transaction()
  try {
    await InteractionTask.update({
      status: 'CLOSED',
      message: 'This interaction needs to be resolved manually',
      updatedBy: systemUserId
    },
    {
      where: {
        intxnTaskId: task.intxnTaskId,
        intxnId: interaction.intxnId
      },
      transaction: t
    }
    )
    await Interaction.update(
      { currStatus: 'MANUAL' },
      {
        where: {
          intxnId: interaction.intxnId
        },
        transaction: t
      }
    )
    await t.commit()
  } catch (error) {
    t.rollback()
    logger.error(error, 'processCreateService - Error in updating interaction and task status for failed task - ' + task.intxnTaskId + ', ' + interaction.intxnId)
  }
}

const processBarUnBar = async (interaction, task, tasks) => {
  console.log('processBarUnBar', interaction.intxnId, task.taskId, task.status)

  if (task.status === 'CLOSED') {
    return true
  }

  let taskCloseCount = 0
  let taskCount = 0

  for (const t of tasks) {
    if (t.intxnTaskId >= task.intxnTaskId) {
      break
    }
    if (t.status === 'CLOSED') {
      taskCloseCount++
    }
    taskCount++
  }

  if (taskCloseCount !== taskCount) {
    return true
  }

  const { connectionData, planData } = await getConnectionAndPlan(interaction)

  const realtimeStatus = await getRealtimeServiceDetails(connectionData.identificationNo, planData.prodType, 'true')
  // const realtimeStatus = {serviceLevel: 'UNBAR'}

  console.log('realtimeStatus', realtimeStatus)
  if (interaction.woType === 'BAR') {
    if (!realtimeStatus || !realtimeStatus.serviceLevel || realtimeStatus.serviceLevel.trim() !== 'BSER') {
      return true
    }
  }

  if (interaction.woType === 'UNBAR') {
    if (!realtimeStatus || !realtimeStatus.serviceLevel || realtimeStatus.serviceLevel.trim() !== 'FULL') {
      return true
    }
  }

  let message
  if (planData.prodType === 'Prepaid' || planData.prodType === 'Postpaid') {
    const ocsResp = await ocsBarUnBarSubscription(interaction.woType, connectionData.identificationNo, interaction.intxnId)
    // const ocsResp = {status: true}
    console.log('ProcessBarUnbarocsResp', ocsResp)

    if (ocsResp && ocsResp.status !== undefined && ocsResp.status === 'success') {
      message = 'OCS invocation succeeded'
    } else if (ocsResp && ocsResp.status !== undefined && ocsResp.status === 'failure') {
      message = ocsResp.message
      const t1 = await sequelize.transaction()
      try {
        await InteractionTask.update({
          status: 'ERROR',
          message: message,
          updatedBy: systemUserId
        },
        {
          where: {
            intxnTaskId: task.intxnTaskId,
            intxnId: interaction.intxnId
          },
          transaction: t1
        }
        )
        await Interaction.update(
          { currStatus: 'FAILED' },
          {
            where: {
              intxnId: interaction.intxnId
            },
            transaction: t1
          }
        )
        await t1.commit()
      } catch (error) {
        await t1.rollback()
        logger.error(error, 'Error while setting Bar/UnBar task to manual resolution')
      }
      return true
    }
  } else {
    return true
  }

  const t = await sequelize.transaction()
  try {
    if (interaction.woType === 'BAR') {
      deActivateService(interaction, t)
    }

    if (interaction.woType === 'UNBAR') {
      activateService(interaction, t)
    }

    await InteractionTask.update({
      status: 'CLOSED',
      message: message,
      updatedBy: systemUserId
    },
    {
      where: {
        intxnTaskId: task.intxnTaskId,
        intxnId: interaction.intxnId
      },
      transaction: t
    }
    )

    await Interaction.update(
      { currStatus: 'CLOSED' },
      {
        where: {
          intxnId: interaction.intxnId
        },
        transaction: t
      }
    )

    await t.commit()
  } catch (error) {
    t.rollback()
    logger.error(error, 'processBarUnBar - Error in updating interaction and task status for failed task - ' + task.intxnTaskId + ', ' + interaction.intxnId)
  }
}

const processRetry = async (interaction, task, tasks) => {
  console.log('processRetry', interaction.intxnId, task.taskId, task.status)

  if (task.status === 'CLOSED' || task.status === 'ERROR') {
    return true
  }

  try {
    const retryTime = task.taskIdLookup.mappingPayload[interaction.woType]

    const currentRetryCount = task.retryCount + 1

    // const currentRetryCount = 1

    const currentTime = new Date()

    const timeDiff = (currentTime.getTime() - task.createdAt.getTime()) / (1000 * 60)
    // const timeDiff = 999

    console.log(task.createdAt.getTime(), currentTime.getTime(), retryTime.length, currentRetryCount, retryTime[currentRetryCount - 1])

    const { connectionData } = await getConnectionAndPlan(interaction)

    let taskData
    let interactionData
    let checkOCSStatus
    let skip = false

    if (currentRetryCount <= retryTime.length) {
      if (timeDiff >= retryTime[currentRetryCount - 1]) {
        try {
          checkOCSStatus = await checkOCS(interaction, connectionData)
        } catch (error) {
          checkOCSStatus = false
          logger.error(error, 'Unexpected error checking OCS Customer Status')
        }
        if (checkOCSStatus === true) {
          taskData = {
            status: 'CLOSED',
            message: 'Closing Request as during OCS Customer Status Check found service to be in ' + interaction.woType + ' Status after ' + currentRetryCount + ' attempt(s).',
            retryCount: currentRetryCount,
            updatedBy: systemUserId
          }
          interactionData = {
            currStatus: 'CLOSED',
            updatedBy: systemUserId
          }
        } else {
          try {
            const ocsResp = await ocsBarUnBarSubscription(interaction.woType, connectionData.identificationNo, interaction.intxnId)
            console.log('Retry ocsResp', ocsResp)
            if (ocsResp && ocsResp.status !== undefined) {
              if (ocsResp.status === 'success') {
                taskData = {
                  status: 'CLOSED',
                  message: 'OCS ' + interaction.woType + ' completed in ' + currentRetryCount + ' attempt(s).',
                  retryCount: currentRetryCount,
                  updatedBy: systemUserId
                }
                interactionData = {
                  currStatus: 'CLOSED',
                  updatedBy: systemUserId
                }
              } else {
                taskData = {
                  status: (currentRetryCount >= retryTime.length) ? 'ERROR' : 'WIP',
                  message: ocsResp.message + ' after ' + currentRetryCount + ' attempt(s).' +
                    ((currentRetryCount < retryTime.length) ? ' System will try again.' : ' All attempts done, system will not try again.'),
                  retryCount: currentRetryCount,
                  updatedBy: systemUserId
                }
                if (currentRetryCount >= retryTime.length) {
                  interactionData = {
                    currStatus: 'FAILED',
                    updatedBy: systemUserId
                  }
                }
              }
            } else {
              taskData = {
                status: (currentRetryCount >= retryTime.length) ? 'ERROR' : 'WIP',
                message: 'No response from OCS after ' + currentRetryCount + ' attempt(s)' +
                  ((currentRetryCount < retryTime.length) ? ' System will try again.' : ' All attempts done, system will not try again.'),
                retryCount: currentRetryCount,
                updatedBy: systemUserId
              }
              if (currentRetryCount >= retryTime.length) {
                interactionData = {
                  currStatus: 'FAILED',
                  updatedBy: systemUserId
                }
              }
            }
          } catch (error) {
            taskData = {
              status: (currentRetryCount >= retryTime.length) ? 'ERROR' : 'WIP',
              message: 'Unexpected error invoking OCS during ' + currentRetryCount + ' attempt(s)' +
                ((currentRetryCount < retryTime.length) ? ' System will try again.' : ' All attempts done, system will not try again.'),
              retryCount: currentRetryCount,
              updatedBy: systemUserId
            }
            if (currentRetryCount >= retryTime.length) {
              interactionData = {
                currStatus: 'FAILED',
                updatedBy: systemUserId
              }
            }
          }
          // const ocsResp = { status: 'failure', message: 'OCS Error' }
        }
      } else {
        skip = true
      }
    } else {
      taskData = {
        status: (currentRetryCount >= retryTime.length) ? 'ERROR' : 'WIP',
        message: 'No response from OCS after ' + currentRetryCount + ' attempt(s)' +
          ((currentRetryCount < retryTime.length) ? ' System will try again.' : ' All attempts done, system will not try again.'),
        retryCount: currentRetryCount,
        updatedBy: systemUserId
      }
      interactionData = {
        currStatus: 'FAILED',
        updatedBy: systemUserId
      }
    }
    if (!skip) {
      const t = await sequelize.transaction()
      try {
        await InteractionTask.update(taskData,
          {
            where: {
              intxnTaskId: task.intxnTaskId,
              intxnId: interaction.intxnId
            },
            transaction: t
          }
        )
        if (interactionData) {
          await Interaction.update(interactionData,
            {
              where: {
                intxnId: interaction.intxnId
              },
              transaction: t
            }
          )
          if (interactionData.currStatus === 'CLOSED') {
            await Connection.update({
              status: ((interaction.woType === 'BAR') ? 'TOS' : 'ACTIVE'),
              updatedBy: systemUserId
            },
            {
              where: {
                connectionId: interaction.connectionId
              },
              transaction: t
            }
            )
          }
        }
        await t.commit()
      } catch (error) {
        t.rollback()
        logger.error(error, 'Unexpected error updating data, while process BAR/UNBAR Retry Step')
      }
    }
  } catch (error) {
    logger.error(error, 'Error while processing retry for ' + interaction.woType)
  }
}

const processCloseSR = async (interaction, task, tasks) => {
  console.log('processCloseSR', interaction.intxnId, task.taskId, task.status)

  if (task.status === 'CLOSED' || task.status === 'CLOSED-INCOMPLETE') {
    return true
  }

  let taskCloseCount = 0
  let taskCount = 0

  for (const t of tasks) {
    if (t.intxnTaskId >= task.intxnTaskId) {
      break
    }
    if (t.status === 'CLOSED' || t.status === 'RESOLVED') {
      taskCloseCount++
    }
    taskCount++
  }

  if (taskCloseCount !== taskCount) {
    return true
  }

  const { connectionData, planData } = await getConnectionAndPlan(interaction)

  if (['Fixed'].includes(planData.planType)) {
    if (['NEW', 'WIP'].includes(task.status)) {
      return true
    }
  }

  if (task.status === 'FAILED') {
    const t = await sequelize.transaction()
    try {
      let message
      if (!task.payload || !task.payload.remarks) {
        message = 'Task status is FAILED, but source system did not return any error message'
      } else {
        message = 'Task failed. Please check BOTS response for details'
      }

      await InteractionTask.update({
        status: 'ERROR',
        message: message,
        updatedBy: systemUserId
      },
      {
        where: {
          intxnTaskId: task.intxnTaskId,
          intxnId: interaction.intxnId
        },
        transaction: t
      }
      )
      await Interaction.update(
        { currStatus: 'FAILED' },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
      )
      await t.commit()
    } catch (error) {
      t.rollback()
      logger.error(error, 'processCloseSR - Error in updating interaction and task status for failed task - ' + task.intxnTaskId + ', ' + interaction.intxnId)
    }
  } else if (task.status === 'DONE-INCOMPLETE') {
    const t = await sequelize.transaction()
    try {
      let done = false
      let message = ''
      if (interaction.woType === 'WONC') {
        done = await deActivateNewCustomer(interaction, t)
        message = 'New customer, account and service de-activated as service request is unfulfilled'
      } else if (interaction.woType === 'WONC-ACCSER') {
        done = await deActivateNewAcctService(interaction, t)
        message = 'New Account and service de-activated as service request is unfulfilled'
      } else if (interaction.woType === 'WONC-SER') {
        done = await deActivateNewService(interaction, t)
        message = 'New Service de-activated as service request is unfulfilled'
      }
      if (done) {
        await Interaction.update({
          currStatus: 'UNFULFILLED',
          updatedBy: systemUserId
        },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
        )
        await InteractionTask.update({
          status: 'CLOSED-INCOMPLETE',
          message: message,
          updatedBy: systemUserId
        },
        {
          where: {
            intxnTaskId: task.intxnTaskId,
            intxnId: interaction.intxnId
          },
          transaction: t
        }
        )
        await t.commit()
      } else {
        await t.rollback()
      }
    } catch (error) {
      t.rollback()
      logger.error(error, 'Error updating task in processCloseSR')
    }
  } else if (((task.status === 'DONE' || task.status === 'NEW') && ['Prepaid', 'Postpaid'].includes(planData.prodType)) ||
    ((task.status === 'DONE') && ['Fixed'].includes(planData.prodType))) {
    const t = await sequelize.transaction()
    try {
      let done = false
      let message = ''
      if (interaction.woType === 'WONC') {
        done = await activateNewCustomer(connectionData, planData, interaction, t)
        message = 'New customer, account and service activated successfully'
      } else if (interaction.woType === 'WONC-ACCSER') {
        done = await activateNewAcctService(connectionData, planData, interaction, t)
        message = 'New Account and service activated successfully'
      } else if (interaction.woType === 'WONC-SER') {
        done = await activateNewService(connectionData, planData, interaction, t)
        message = 'New Service activated successfully'
      } else if (interaction.woType === 'UPGRADE' || interaction.woType === 'DOWNGRADE') {
        console.log('Processing Upgrade')
        done = await activatePlan(connectionData, planData, interaction, t)
        message = 'New plan activated successfully'
      } else if (interaction.woType === 'VASACT' || interaction.woType === 'VASDEACT') {
        console.log('Processing ' + interaction.woType)
        done = await activateDeactivateVAS(interaction, t)
        message = interaction.woType + ' completed successfully'
      } else if (interaction.woType === 'TELEPORT' || interaction.woType === 'RELOCATE') {
        console.log('Processing ' + interaction.woType)
        done = await switchService(connectionData, planData, interaction, t)
        message = interaction.woType + ' completed successfully'
      } else if (interaction.woType === 'TERMINATE') {
        console.log('Processing ' + interaction.woType)
        done = await terminateService(interaction, task, tasks)
        message = interaction.woType + ' completed successfully'
      }
      if (done) {
        await Interaction.update({
          currStatus: 'CLOSED',
          updatedBy: systemUserId
        },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
        )
        await InteractionTask.update({
          status: 'CLOSED',
          message: message,
          updatedBy: systemUserId
        },
        {
          where: {
            intxnTaskId: task.intxnTaskId,
            intxnId: interaction.intxnId
          },
          transaction: t
        }
        )
        await t.commit()
      } else {
        await t.rollback()
      }
    } catch (error) {
      t.rollback()
      logger.error(error, 'Error updating task in processCloseSR')
    }
  }
}

const updateCustAndAcctNbr = async (customerId, accountId, customerNbr, accountNbr, t) => {
  await Customer.update({
    crmCustomerNo: customerNbr,
    updatedBy: systemUserId
  },
  {
    where: {
      customerId: customerId
    },
    transaction: t
  }
  )
  await Account.update({
    accountNo: accountNbr,
    updatedBy: systemUserId
  },
  {
    where: {
      accountId: accountId
    },
    transaction: t
  }
  )
}

const updateAcctNbr = async (accountId, accountNbr, t) => {
  await Account.update({
    accountNo: accountNbr,
    updatedBy: systemUserId
  },
  {
    where: {
      accountId: accountId
    },
    transaction: t
  }
  )
}

const getConnectionAndPlan = async (interaction) => {
  const connectionData = await Connection.findOne({
    where: {
      connectionId: interaction.connectionId
    }
  })
  const planId = connectionData.mappingPayload.plans[0].planId
  const planData = await Plan.findOne({
    where: {
      planId: planId
    }
  })

  return { connectionData: connectionData, planData: planData }
}

const processTaskPayload = async (interaction, task) => {
  logger.debug('processTaskPayload', interaction.intxnId, interaction.woType, task.taskId, task.status)

  if (task.status === 'NEW' || task.status === 'WIP' || task.status === 'CLOSED') {
    return false
  }

  if (task.status === 'FAILED') {
    const t = await sequelize.transaction()
    try {
      let message
      if (!task.payload || !task.payload.remarks) {
        message = 'Task status is FAILED, but source system did not return any error message'
      } else {
        message = 'Task failed. Please check BOTS response for details'
      }

      await InteractionTask.update({
        status: 'ERROR',
        message: message,
        updatedBy: systemUserId
      },
      {
        where: {
          intxnTaskId: task.intxnTaskId,
          intxnId: interaction.intxnId
        },
        transaction: t
      }
      )
      await Interaction.update(
        { currStatus: 'FAILED' },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
      )
      await t.commit()
    } catch (error) {
      t.rollback()
      logger.error(error, 'processTaskPayload - Error in updating interaction and task status for failed task - ' + task.intxnTaskId + ', ' + interaction.intxnId)
    }
  } else {
    // const { connectionData, planData } = await getConnectionAndPlan(interaction)

    if (!task.payload || !task.payload.external_ref_sys || !task.payload.external_ref_no ||
      task.payload.external_ref_sys === '' || task.payload.external_ref_no === '') {
      const t = await sequelize.transaction()
      try {
        await InteractionTask.update({
          status: 'ERROR',
          message: 'processBarService - Task update data is invalid and cannot be processed further',
          updatedBy: systemUserId
        },
        {
          where: {
            intxnTaskId: task.intxnTaskId,
            intxnId: interaction.intxnId
          },
          transaction: t
        }
        )
        await Interaction.update(
          { currStatus: 'FAILED' },
          {
            where: {
              intxnId: interaction.intxnId
            },
            transaction: t
          }
        )
        await t.commit()
      } catch (error) {
        t.rollback()
        logger.error(error, 'processTaskPayload - Task update data is invalid and cannot be processed further')
      }
    } else {
      const t = await sequelize.transaction()
      try {
        const interactionData = {}
        let found = false
        if (!interaction.externalRefSys1 || interaction.externalRefSys1 === task.payload.external_ref_sys) {
          interactionData.externalRefNo1 = task.payload.external_ref_no
          interactionData.externalRefSys1 = task.payload.external_ref_sys
          found = true
        } else if (!interaction.externalRefSys2 || interaction.externalRefSys2 === task.payload.external_ref_sys) {
          interactionData.externalRefNo2 = task.payload.external_ref_no
          interactionData.externalRefSys2 = task.payload.external_ref_sys
          found = true
        } else if (interaction.externalRefSys3 || interaction.externalRefSys3 === task.payload.external_ref_sys) {
          interactionData.externalRefNo3 = task.payload.external_ref_no
          interactionData.externalRefSys3 = task.payload.external_ref_sys
          found = true
        } else if (!interaction.externalRefSys4 || interaction.externalRefSys4 === task.payload.external_ref_sys) {
          interactionData.externalRefNo4 = task.payload.external_ref_no
          interactionData.externalRefSys4 = task.payload.external_ref_sys
          found = true
        }

        if (found) {
          await Interaction.update(
            interactionData,
            {
              where: {
                intxnId: interaction.intxnId
              },
              transaction: t
            }
          )
          await InteractionTask.update({
            status: 'CLOSED',
            updatedBy: systemUserId
          },
          {
            where: {
              intxnTaskId: task.intxnTaskId,
              intxnId: interaction.intxnId
            },
            transaction: t
          }
          )
        } else {
          await InteractionTask.update({
            status: 'ERROR',
            message: 'processTaskPayload - No empty external references found to update',
            updatedBy: systemUserId
          },
          {
            where: {
              intxnTaskId: task.intxnTaskId,
              intxnId: interaction.intxnId
            },
            transaction: t
          }
          )
          await Interaction.update(
            { currStatus: 'FAILED' },
            {
              where: {
                intxnId: interaction.intxnId
              },
              transaction: t
            }
          )
        }
        await t.commit()
      } catch (error) {
        t.rollback()
        logger.error(error, 'processTaskPayload - Error while updating external references')
      }
    }
  }
}

const activateNewCustomer = async (connectionData, planData, interaction, t) => {
  const realtimeStatus = await getRealtimeServiceDetails(connectionData.identificationNo, planData.prodType, 'true')
  // const realtimeStatus = {connectionStatus: 'CU'}
  console.log('activateNewCustomer', interaction.intxnId, realtimeStatus.connectionStatus)

  if (realtimeStatus && realtimeStatus.connectionStatus === 'CU') {
    await Customer.update({
      status: 'ACTIVE',
      updatedBy: systemUserId
    },
    {
      where: {
        customerId: interaction.customerId
      },
      transaction: t
    })

    await Account.update({
      status: 'ACTIVE',
      updatedBy: systemUserId
    },
    {
      where: {
        accountId: interaction.accountId
      },
      transaction: t
    })

    await Connection.update({
      status: 'ACTIVE',
      updatedBy: systemUserId
    },
    {
      where: {
        connectionId: interaction.connectionId
      },
      transaction: t
    })

    return true
  } else {
    return false
  }
}

const activateNewAcctService = async (connectionData, planData, interaction, t) => {
  const realtimeStatus = await getRealtimeServiceDetails(connectionData.identificationNo, planData.prodType, 'true')
  // const realtimeStatus = {connectionStatus: 'CU'}

  console.log('activateNewAcctService', interaction.intxnId, realtimeStatus.connectionStatus)

  if (realtimeStatus && realtimeStatus.connectionStatus === 'CU') {
    await Account.update({
      status: 'ACTIVE',
      updatedBy: systemUserId
    },
    {
      where: {
        accountId: interaction.accountId
      },
      transaction: t
    })

    await Connection.update({
      status: 'ACTIVE',
      updatedBy: systemUserId
    },
    {
      where: {
        connectionId: interaction.connectionId
      },
      transaction: t
    })

    return true
  } else {
    return false
  }
}

const activateNewService = async (connectionData, planData, interaction, t) => {
  const realtimeStatus = await getRealtimeServiceDetails(connectionData.identificationNo, planData.prodType, 'true')
  // const realtimeStatus = {connectionStatus: 'CU'}

  console.log('activateNewService', interaction.intxnId, realtimeStatus.connectionStatus)

  if (realtimeStatus && realtimeStatus.connectionStatus === 'CU') {
    await Connection.update({
      status: 'ACTIVE',
      updatedBy: systemUserId
    },
    {
      where: {
        connectionId: interaction.connectionId
      },
      transaction: t
    })

    return true
  } else {
    return false
  }
}

const deActivateService = async (interaction, t) => {
  await Connection.update({
    status: 'TOS',
    updatedBy: systemUserId
  },
  {
    where: {
      connectionId: interaction.connectionId
    },
    transaction: t
  }
  )
}

const activateService = async (interaction, t) => {
  await Connection.update({
    status: 'ACTIVE',
    updatedBy: systemUserId
  },
  {
    where: {
      connectionId: interaction.connectionId
    },
    transaction: t
  }
  )
}

const activatePlan = async (connectionData, planData, interaction, t) => {
  const realtimeStatus = await getRealtimeServiceDetails(connectionData.identificationNo, planData.prodType, 'true')
  console.log('activatePlan', interaction.intxnId, realtimeStatus.currentPlanCode)
  if (!realtimeStatus.currentPlanCode || realtimeStatus.currentPlanCode === undefined) {
    await Interaction.update({ currStatus: 'FAILED' }, { where: { intxnId: interaction.intxnId } })
    const update = {
      status: 'ERROR',
      message: 'Unable to retrive service details'
    }
    await InteractionTask.update(update, { where: { intxnId: interaction.intxnId, taskId: 'CLOSESR' } })
  }
  const newPlanData = await Plan.findOne({
    where: {
      planId: interaction.planId
    }
  })

  if (connectionData && connectionData.mappingPayload &&
    connectionData.mappingPayload.plans && connectionData.mappingPayload.plans[0].planId &&
    newPlanData.refPlanCode === realtimeStatus.currentPlanCode) {
    console.log('Switching plans')

    const oldPlanId = connectionData.mappingPayload.plans[0].planId

    connectionData.mappingPayload.plans[0].planId = interaction.planId

    await Connection.update({
      mappingPayload: connectionData.mappingPayload,
      updatedBy: systemUserId
    },
    {
      where: {
        connectionId: interaction.connectionId
      },
      transaction: t
    }
    )

    await ConnectionPlan.update({
      status: 'ACTIVE',
      updatedBy: systemUserId
    },
    {
      where: {
        connectionId: interaction.connectionId,
        planId: interaction.planId
      },
      transaction: t
    })

    await ConnectionPlan.update({
      status: 'INACTIVE',
      updatedBy: systemUserId
    },
    {
      where: {
        connectionId: interaction.connectionId,
        planId: oldPlanId
      },
      transaction: t
    })

    return true
  } else {
    console.log('Plan change not yet done')
    return false
  }
}

const terminateService = async (interaction, task, tasks) => {
  console.log('processTerminate', interaction.intxnId, task.taskId, task.status)
  const t = await sequelize.transaction()
  if (task.status === 'CLOSED') {
    return true
  }

  let taskCloseCount = 0
  let taskCount = 0

  for (const t of tasks) {
    if (t.intxnTaskId >= task.intxnTaskId) {
      break
    }
    if (t.status === 'CLOSED') {
      taskCloseCount++
    }
    taskCount++
  }

  if (taskCloseCount !== taskCount) {
    return true
  }

  const { connectionData, planData } = await getConnectionAndPlan(interaction)

  const realtimeStatus = await getRealtimeServiceDetails(connectionData.identificationNo, planData.prodType, 'true')
  // const realtimeStatus = {serviceLevel: 'UNBAR'}

  console.log('realtimeStatus', realtimeStatus)
  if (interaction.woType === 'TERMINATE') {
    if (realtimeStatus?.serviceLevel?.trim() === 'RE') {
      await deActivateNewService(interaction, t)
      await InteractionTask.update({
        status: 'CLOSED',
        message: 'Termination Successful',
        updatedBy: systemUserId
      },
      {
        where: {
          intxnTaskId: task.intxnTaskId,
          intxnId: interaction.intxnId
        },
        transaction: t
      }
      )
      await Interaction.update(
        { currStatus: 'CLOSED' },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
      )
    } else {
      await InteractionTask.update({
        status: 'ERROR',
        message: 'The service is not in Recovery status in Cerillion',
        updatedBy: systemUserId
      },
      {
        where: {
          intxnTaskId: task.intxnTaskId,
          intxnId: interaction.intxnId
        },
        transaction: t
      }
      )

      await Interaction.update(
        { currStatus: 'FAILED' },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
      )
    }
  }

  await t.commit()
}

const checkOCS = async (interaction, connectionData) => {
  let accessNbr
  if (connectionData.identificationNo.length <= 7) {
    accessNbr = COUNTRYCODE_PREFIX + connectionData.identificationNo
  } else {
    accessNbr = connectionData.identificationNo
  }

  const resp = await ocsCustomerStatus(interaction.intxnId, accessNbr)
  // const resp = {status: 'TEMPORARY BLOCKED', message: ''}
  if (interaction.woType === 'BAR') {
    if (resp.status.toUpperCase() === 'TEMPORARY BLOCKED') {
      return true
    }
  }
  if (interaction.woType === 'UNBAR') {
    if (resp.status.toUpperCase() === 'ACTIVATED') {
      return true
    }
  }

  return false
  // const t = await sequelize.transaction()
  // try {
  //   if (interaction.woType === 'BAR') {
  //     await Connection.update({
  //       status: 'TOS',
  //       updatedBy: systemUserId
  //     },
  //     {
  //       where: {
  //         connectionId: interaction.connectionId
  //       },
  //       transaction: t
  //     }
  //     )
  //   }

  //   if (interaction.woType === 'UNBAR') {
  //     await Connection.update({
  //       status: 'ACTIVE',
  //       updatedBy: systemUserId
  //     },
  //     {
  //       where: {
  //         connectionId: interaction.connectionId
  //       },
  //       transaction: t
  //     }
  //     )
  //   }

  //   await Interaction.update(
  //     {
  //       currStatus: 'CLOSED',
  //       resolutionReason: failure
  //     },
  //     {
  //       where: {
  //         intxnId: interaction.intxnId
  //       },
  //       transaction: t
  //     }
  //   )

  //   await t.commit()

  //   return true
  // } catch (error) {
  //   t.rollback()
  //   logger.error(error, 'processBarUnBar - Error in updating interaction - ' + interaction.intxnId)
  //   return false
  // }
}

const activateDeactivateVAS = async (interaction, t) => {
  // const realtimeStatus = await getRealtimeServiceDetails(connectionData.identificationNo, planData.prodType, 'true')
  // const realtimeStatus = { currentPlanCode: 'GSM111' }
  // console.log('activateDeactivateVAS', interaction.intxnId, interaction.planIdList, realtimeStatus.currentPlanCode)

  if (interaction.planIdList && interaction.planIdList !== '') {
    const planIds = interaction.planIdList.split(',')

    let status
    if (interaction.woType === 'VASACT') {
      console.log(2)
      status = 'ACTIVE'
    }

    if (interaction.woType === 'VASDEACT') {
      console.log(3)
      status = 'INACTIVE'
    }

    for (const p of planIds) {
      console.log(4, p, interaction.connectionId)
      const connPlanResp = await ConnectionPlan.update({
        status: status,
        updatedBy: systemUserId
      },
      {
        where: {
          connectionId: interaction.connectionId,
          planId: p,
          status: 'PENDING'
        },
        transaction: t
      })
      console.log(JSON.stringify(connPlanResp, null, 2))
      if (connPlanResp[0] !== 1) {
        return false
      }
    }
    return true
  } else {
    return false
  }
}

const switchService = async (connectionData, planData, interaction, t) => {
  const realtimeStatus = await getRealtimeServiceDetails(connectionData.identificationNo, planData.prodType, 'true')
  // const realtimeStatus = {connectionStatus: 'CU'}

  console.log('switchService', interaction.intxnId, realtimeStatus.connectionStatus)

  if (realtimeStatus && realtimeStatus.connectionStatus === 'CU') {
    await Connection.update({
      status: 'ACTIVE',
      updatedBy: systemUserId
    },
    {
      where: {
        connectionId: interaction.connectionId
      },
      transaction: t
    })

    await Connection.update({
      status: 'PD-TR',
      updatedBy: systemUserId
    },
    {
      where: {
        connectionId: interaction.existingConnectionId
      },
      transaction: t
    })

    return true
  } else {
    return false
  }
}

const deActivateNewCustomer = async (interaction, t) => {
  console.log('deActivateNewCustomer', interaction.intxnId)

  await Customer.update({
    status: 'ACTIVE',
    updatedBy: systemUserId
  },
  {
    where: {
      customerId: interaction.customerId
    },
    transaction: t
  })

  await Account.update({
    status: 'ACTIVE',
    updatedBy: systemUserId
  },
  {
    where: {
      accountId: interaction.accountId
    },
    transaction: t
  })

  await Connection.update({
    status: 'PD',
    updatedBy: systemUserId
  },
  {
    where: {
      connectionId: interaction.connectionId
    },
    transaction: t
  })

  return true
}

const deActivateNewAcctService = async (interaction, t) => {
  console.log('deActivateNewAcctService', interaction.intxnId)

  await Account.update({
    status: 'ACTIVE',
    updatedBy: systemUserId
  },
  {
    where: {
      accountId: interaction.accountId
    },
    transaction: t
  })

  await Connection.update({
    status: 'PD',
    updatedBy: systemUserId
  },
  {
    where: {
      connectionId: interaction.connectionId
    },
    transaction: t
  })

  return true
}

const deActivateNewService = async (interaction, t) => {
  console.log('deActivateNewService', interaction.intxnId)

  await Connection.update({
    status: 'PD',
    updatedBy: systemUserId
  },
  {
    where: {
      connectionId: interaction.connectionId
    },
    transaction: t
  })

  return true
}

const processFaultPayload = async (interaction, task) => {
  logger.debug('processFaultPayload', interaction.intxnId, interaction.woType, task.taskId, task.status)

  if (task.status === 'NEW' || task.status === 'WIP' || task.status === 'ERROR' || task.status === 'CLOSED' || task.status === 'RESOLVED') {
    return false
  }

  if (task.status === 'FAILED') {
    const t = await sequelize.transaction()
    try {
      let message
      if (!task.payload || !task.payload.remarks) {
        message = 'Task status is FAILED, but BOTS did not return any error message'
      } else {
        message = 'Task failed. Please check BOTS response for details'
      }

      await InteractionTask.update({
        status: 'ERROR',
        message: message,
        updatedBy: systemUserId
      },
      {
        where: {
          intxnTaskId: task.intxnTaskId,
          intxnId: interaction.intxnId
        },
        transaction: t
      }
      )
      await Interaction.update(
        { currStatus: 'FAILED' },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
      )
      await t.commit()
    } catch (error) {
      t.rollback()
      logger.error(error, 'processFaultPayload - Error in updating interaction and task status for failed task - ' + task.intxnTaskId + ', ' + interaction.intxnId)
    }
  } else if (!task.payload || !task.payload.external_ref_sys || !task.payload.external_ref_no ||
    task.payload.external_ref_sys === '' || task.payload.external_ref_no === '') {
    const t = await sequelize.transaction()
    try {
      await InteractionTask.update({
        status: 'ERROR',
        message: 'processFaultPayload - Task update data is invalid and cannot be processed further',
        updatedBy: systemUserId
      },
      {
        where: {
          intxnTaskId: task.intxnTaskId,
          intxnId: interaction.intxnId
        },
        transaction: t
      })
      await Interaction.update(
        { currStatus: 'FAILED' },
        {
          where: {
            intxnId: interaction.intxnId
          },
          transaction: t
        }
      )
      await t.commit()
    } catch (error) {
      t.rollback()
      logger.error(error, 'processFaultPayload - Task update data is invalid and cannot be processed further')
    }
  } else {
    const t = await sequelize.transaction()
    try {
      const ticketResponse = await getTicketDetails(task.payload.external_ref_no, interaction.intxnType)
      if (!ticketResponse || !ticketResponse.ticketNumber || ticketResponse.ticketNumber === '') {
        await InteractionTask.update({
          status: 'ERROR',
          message: 'processFaultPayload - Ticket Number provided by BOTS not found in OMS',
          updatedBy: systemUserId
        },
        {
          where: {
            intxnTaskId: task.intxnTaskId,
            intxnId: interaction.intxnId
          },
          transaction: t
        })
        await Interaction.update(
          { currStatus: 'FAILED' },
          {
            where: {
              intxnId: interaction.intxnId
            },
            transaction: t
          }
        )
      } else {
        const interactionData = {}
        let found = false
        if (!interaction.externalRefSys1 || interaction.externalRefSys1 === task.payload.external_ref_sys) {
          interactionData.externalRefNo1 = task.payload.external_ref_no
          interactionData.externalRefSys1 = task.payload.external_ref_sys
          found = true
        } else if (!interaction.externalRefSys2 || interaction.externalRefSys2 === task.payload.external_ref_sys) {
          interactionData.externalRefNo2 = task.payload.external_ref_no
          interactionData.externalRefSys2 = task.payload.external_ref_sys
          found = true
        } else if (interaction.externalRefSys3 || interaction.externalRefSys3 === task.payload.external_ref_sys) {
          interactionData.externalRefNo3 = task.payload.external_ref_no
          interactionData.externalRefSys3 = task.payload.external_ref_sys
          found = true
        } else if (!interaction.externalRefSys4 || interaction.externalRefSys4 === task.payload.external_ref_sys) {
          interactionData.externalRefNo4 = task.payload.external_ref_no
          interactionData.externalRefSys4 = task.payload.external_ref_sys
          found = true
        }

        if (found) {
          await Interaction.update(
            interactionData,
            {
              where: {
                intxnId: interaction.intxnId
              },
              transaction: t
            }
          )
          await InteractionTask.update({
            status: 'CLOSED',
            updatedBy: systemUserId
          },
          {
            where: {
              intxnTaskId: task.intxnTaskId,
              intxnId: interaction.intxnId
            },
            transaction: t
          }
          )
        } else {
          await InteractionTask.update({
            status: 'ERROR',
            message: 'processFaultPayload - No empty external references found to update',
            updatedBy: systemUserId
          },
          {
            where: {
              intxnTaskId: task.intxnTaskId,
              intxnId: interaction.intxnId
            },
            transaction: t
          })
          await Interaction.update(
            { currStatus: 'FAILED' },
            {
              where: {
                intxnId: interaction.intxnId
              },
              transaction: t
            }
          )
        }
      }
      await t.commit()
    } catch (error) {
      t.rollback()
      logger.error(error, 'processFaultPayload - Error while updating external references')
    }
  }
}

export const processSendNotificationEmail = async () => {
  try {
    console.log('im here in send emails')
    const notifications = await Notification.findAll({
      where: {
        status: 'NEW',
        notificationType: 'Email'
      }
    })
    if (Array.isArray(notifications)) {
      for (const notification of notifications) {
        const response = await emailHelper.sendMail({
          to: [notification.email],
          subject: notification.subject,
          message: notification.body
        })
        let data
        if (response) {
          data = {
            status: 'SENT'
          }
        } else {
          data = {
            status: 'RETRY',
            retries: notification.retries + 1
          }
        }
        if (data) {
          await Notification.update(data, {
            where: {
              notificationId: notification.notificationId
            }
          })
        }
      }
    }
  } catch (error) {
    logger.error(error, 'Error while sending notification email')
  }
}

export const processRetrieSendNotificationEmail = async () => {
  try {
    const notifications = await Notification.findAll({
      where: {
        retries: {
          [Op.lte]: 3
        },
        status: {
          [Op.or]: ['RETRY']
        },
        notificationType: 'Email'
      }
    })
    if (Array.isArray(notifications)) {
      for (const notification of notifications) {
        const response = await emailHelper.sendMail({
          to: [notification.email],
          subject: notification.subject,
          message: notification.body
        })
        let data
        if (response) {
          data = {
            status: 'SENT'
          }
        } else {
          data = {
            status: 'RETRY',
            retries: notification.retries + 1
          }
        }
        if (data) {
          if (data.retries === 3) {
            data = {
              status: 'FAILED'
            }
          }
          await Notification.update(data, {
            where: {
              notificationId: notification.notificationId
            }
          })
        }
      }
    }
  } catch (error) {
    logger.error(error, 'Error while retrie sending notification email')
  }
}

export const processSendNotificationSMS = async () => {
  try {
    const notifications = await Notification.findAll({
      where: {
        status: 'NEW',
        notificationType: 'SMS'
      }
    })
    if (Array.isArray(notifications)) {
      for (const notification of notifications) {
        const response = await smsHelper.sendSMS({
          to: notification.mobileNo,
          message: notification.body
        })
        let data
        if (response.status === 'OK') {
          data = {
            status: 'SENT'
          }
        } else {
          data = {
            status: 'FAILED'
          }
        }
        if (data) {
          await Notification.update(data, {
            where: {
              notificationId: notification.notificationId
            }
          })
        }
      }
    }
  } catch (error) {
    logger.error(error, 'Error while sending notification sms')
  }
}

export const statusJobOfallServices = async () => {
  try {
    logger.debug('Stating catalog update')
    const today = format(new Date(), 'yyyy-MM-dd')
    await updateServiceStartDate(today)
    logger.debug('Services starts today are activted')
    await updateServiceEndDate(today)
    logger.debug('Services ends today are inactivated')
  } catch (error) {
    logger.error(error, 'Error while updating service')
  }
}

const updateServiceStartDate = async (today) => {
  try {
    await Catalog.update({ status: 'ACTIVE' }, {
      attributes: ['status', 'startDate'],
      where: {
        [Op.and]: [{ status: 'NEW' }, [
          sequelize.where(sequelize.fn('date', sequelize.col('start_date')), '=', today)
        ]]
      }
    })
    logger.debug('Catalog starts today are activted')
    await Plan.update({ status: 'ACTIVE' }, {
      attributes: ['status', 'startDate'],
      where: {
        [Op.and]: [{ status: 'NEW' }, [
          sequelize.where(sequelize.fn('date', sequelize.col('start_date')), '=', today)
        ]]
      }
    })
    logger.debug('Plan starts today are activted')
    await Service.update({ status: 'ACTIVE' }, {
      attributes: ['status', 'startDate'],
      where: {
        [Op.and]: [{ status: 'NEW' }, [
          sequelize.where(sequelize.fn('date', sequelize.col('start_date')), '=', today)
        ]]
      }
    })
    logger.debug('Service starts today are activted')
    await AssetMst.update({ status: 'ACTIVE' }, {
      attributes: ['status', 'startDate'],
      where: {
        [Op.and]: [{ status: 'NEW' }, [
          sequelize.where(sequelize.fn('date', sequelize.col('start_date')), '=', today)
        ]]
      }
    })
    logger.debug('Asset starts today are activted')
    await AddonMst.update({ status: 'ACTIVE' }, {
      attributes: ['status', 'startDate'],
      where: {
        [Op.and]: [{ status: 'NEW' }, [
          sequelize.where(sequelize.fn('date', sequelize.col('start_date')), '=', today)
        ]]
      }
    })
    logger.debug('Add on starts today are activted')
  } catch (error) {
    logger.error(error, 'Error while updating service')
  }
}

const updateServiceEndDate = async (today) => {
  try {
    const where = { endDate: sequelize.where(sequelize.fn('date', sequelize.col('end_date')), '<', today) }

    await Catalog.update({ status: 'PD' }, {
      attributes: ['status', 'startDate'],
      where
    })
    logger.debug('Catalog Ends today are terminated')
    await Plan.update({ status: 'PD' }, {
      attributes: ['status', 'endDate'],
      where
    })
    logger.debug('Plan Ends today are terminated')
    await Service.update({ status: 'PD' }, {
      attributes: ['status', 'endDate'],
      where
    })
    logger.debug('Service Ends today are terminated')
    await AssetMst.update({ status: 'PD' }, {
      attributes: ['status', 'endDate'],
      where
    })
    logger.debug('Asset Ends today are terminated')
    await AddonMst.update({ status: 'PD' }, {
      attributes: ['status', 'endDate'],
      where
    })
    logger.debug('Add on Ends today are terminated')
  } catch (error) {
    logger.error(error, 'Error while updating service')
  }
}

export const processAbandonedChat = async () => {
  const t = await sequelize.transaction()
  try {
    const chats = await Chat.findAll({ where: { status: ['NEW'] } })
    if (chats && !isEmpty(chats)) {
      const chatList = []
      for (const chat of chats) {
        if (differenceInMinutes(new Date(), chat?.createdAt) >= abandonedChatTimeout) {
          chatList.push(chat.chatId)
        }
      }
      await Chat.update({ status: 'ABANDONED' }, {
        where: {
          chatId: chatList
        },
        transaction: t
      })
      await t.commit()
    }
  } catch (error) {
    logger.error(error, 'Error while sending notification sms')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}
