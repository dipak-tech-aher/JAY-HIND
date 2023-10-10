import { defaultMessage, EmailHelper, statusCodeConstants, logger, constantCode, entityCategory, SMSHelper, orderFlowAction, defaultStatus } from '@utils'
import { Op, QueryTypes } from 'sequelize'
const events = require('events')
const ST = require('stjs')
const em = new events.EventEmitter()
const { getConnection } = require('@services/connection-service')

em.on('SEND_CREATE_ORDER_NOTIFICATION', async (notificationData, conn) => {
  try {
    const conn = await getConnection()

    const { email, contactNo, contactNoPfx, notifiationSource, referenceId, referenceSubId, customerId, departmentId, roleId, userId, channel, type, contactPreference, name } = notificationData

    const notifyTypes = {
      TC_EMAIL: {
        key: 'Email'
      },
      TC_SMS: {
        key: 'SMS'
      }
    }

    const templateHdrs = await conn.TemplateHdr.findAll({
      where: {
        templateCategory: ['TC_EMAIL', 'TC_SMS'],
        entity: 'TMC_ORDER',
        eventType: notificationData.eventType,
        status: defaultStatus.TPLACTIVE
      },
      raw: true
    })
    const mappedTemplates = await conn.TemplateMapping.findAll({
      where: {
        templateId: templateHdrs.map(x => x.templateId),
        status: defaultStatus.TPLACTIVE
      },
      raw: true
    })

    console.log("defaultStatus.TPLACTIVE ===> ", defaultStatus.TPLACTIVE);
    console.log("mappedTemplates ===> ", mappedTemplates);
    console.log("notificationData ===> ", notificationData);

    const emailTemplates = templateHdrs.filter(x => {
      let condition = x.templateCategory == 'TC_EMAIL'
      // condition = condition && mappedTemplates.filter(y =>
      //   y.templateId == x.templateId &&
      //   y.mapCategory == notificationData.mapCategory &&
      //   y.tranCategory == notificationData.tranCategory &&
      //   y.tranType == notificationData.tranType &&
      //   // y.serviceCategory == notificationData.serviceCategory &&
      //   y.serviceType == notificationData.serviceType
      // ).length > 0
      return condition
    })

    const smsTemplates = templateHdrs.filter(x => {
      let condition = x.templateCategory == 'TC_SMS'
      // condition = condition && mappedTemplates.filter(y =>
      //   y.templateId == x.templateId &&
      //   y.mapCategory == notificationData.mapCategory &&
      //   y.tranCategory == notificationData.tranCategory &&
      //   y.tranType == notificationData.tranType &&
      //   // y.serviceCategory == notificationData.serviceCategory &&
      //   y.serviceType == notificationData.serviceType
      // ).length > 0
      return condition
    })

    // template header entity - event type
    const allTemplates = await conn.NotificationTemplate.findAll({
      where: {
        templateHdrId: [...emailTemplates.map(x => x.templateId), ...smsTemplates.map(x => x.templateId)]
      }
    })

    if (!allTemplates.length) {
      return {
        status: statusCodeConstants.VALIDATION_ERROR,
        message: 'Email template not found, Please create template'
      }
    }

    if (email && (contactPreference?.includes('CNT_PREF_EMAIL') || contactPreference?.includes('CNT_PREF_ANY'))) {
      const emailHelper = new EmailHelper()

      const templates = allTemplates.filter(x => x.templateType === 'TC_EMAIL')

      for (let index = 0; index < templates.length; index++) {
        const notificationTemplate = templates[index]
        // const data = {
        //   ticketId: referenceId,
        //   name
        // }
        const data = await conn.sequelize.query(`SELECT * FROM ${notificationTemplate.dataSource} WHERE "orderNo" = '${referenceId}';`, { type: QueryTypes.SELECT })
        const htmlContent = ST.select(data[0]).transformWith(notificationTemplate?.body).root()
        const subjectContent = ST.select(data[0]).transformWith(notificationTemplate?.subject).root();
        const response = await emailHelper.sendMail({
          to: [email],
          subject: subjectContent,
          message: htmlContent
        })
        await notificationLog(notifyTypes[notificationTemplate?.templateType].key, notifiationSource, channel, referenceId, referenceSubId, userId, response?.status, notificationTemplate.subject,
          htmlContent, email, customerId, departmentId, roleId, conn)
      }
    }

    if (contactNo && contactNoPfx && (contactPreference?.includes('CNT_PREF_SMS') || contactPreference?.includes('CNT_PREF_ANY'))) {
      const smsHelper = new SMSHelper()
      const templates = allTemplates.filter(x => x.templateType === 'TC_SMS')

      for (let index = 0; index < templates.length; index++) {
        const notificationTemplate = templates[index]
        // const data = {
        //   ticketId: referenceId,
        //   name
        // }
        const data = await conn.sequelize.query(`SELECT * FROM ${notificationTemplate.dataSource} WHERE "orderNo" = '${referenceId}';`, { type: QueryTypes.SELECT })
        const htmlContent = ST.select(data[0]).transformWith(notificationTemplate?.body).root()
        const response = await smsHelper.sendSMS({
          to: contactNo,
          extn: contactNoPfx,
          subject: notificationTemplate?.subject,
          message: htmlContent
        })
        await notificationLog('SMS', notifiationSource, channel, referenceId, referenceSubId, userId, response?.status, notificationTemplate.subject,
          htmlContent, null, contactNo, customerId, departmentId, roleId, conn)
      }
    }
    // if (contactNo && contactNoPfx && (contactPreference.includes('CNT_PREF_WHATSAPP') || contactPreference.includes('CNT_PREF_ANY'))) {

    // }
    // TODO: IMPLEMENT WHATSAPP SEND MESSAGE FOR CREATE INTERACTION
  } catch (error) {
    logger.error(error)
  }
})

em.on('USER_CREATED', async (user, conn) => {
  try {
    const { userId, loginId, firstName, domainURL, email, loginPassword, inviteToken, type, channel, notifiationSource, createdDeptId, createdRoleId, tranId, createdBy } = user
    if (email) {
      const emailHelper = new EmailHelper()
      const notificationTemplate = await getNotificationTemplate(type, channel, 'TC_EMAIL', conn)
      if (notificationTemplate.status === 'SUCCESS') {
        const data = {
          loginId,
          firstName,
          aisoDomainURL: domainURL,
          email,
          loginPassword,
          inviteToken
        }

        const htmlContent = ST.select(data).transformWith(notificationTemplate.data.body).root()

        const response = await emailHelper.sendMail({
          to: [user.email],
          subject: notificationTemplate.data.subject,
          message: htmlContent
        }, conn)
        await notificationLog('Email', notifiationSource, channel, userId, null, userId, response.status, notificationTemplate.data.subject,
          htmlContent, email, null, null, createdDeptId, createdRoleId, tranId, createdBy, conn)
      } else {
        logger.debug(notificationTemplate.message)
      }
    } else {
      logger.debug('The Email is not present for this user')
    }
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR,
      message: 'Error while sending Email'
    }
  }
})

em.on('UPDATE_CREATE_POPUP_NOTIFICATION', async (notificationData) => {
  const conn = await getConnection()
  const t = await conn.sequelize.transaction()
  try {
    const {
      notificationType, subject, channel, body, orderId, userId, roleId, departmentId, orderNumber,
      status, priority, customerNo, assignedUserId, assignedDepartmentId, assignedRoleId, orderStatus, userList, type, notificationSource
    } = notificationData

    if (type !== orderFlowAction.FOLLOWUP) {
      const checkExistingPopUpIds = await conn.Notification.findAll({
        attributes: ['notificationId'],
        include: [{
          model: conn.NotificationUserEvents,
          as: 'notificationEvents',
          attributes: [],
          where: { isRead: false }
        }],
        where: {
          referenceNo: orderNumber
        },
        distinct: true
      })

      if (checkExistingPopUpIds?.length > 0) {
        const Ids = checkExistingPopUpIds.map(item => item.notificationId)
        await conn.NotificationUserEvents.update({ isRead: true }, {
          where: {
            notificationId: Ids
          },
          transaction: t
        })
      }
    }

    if (orderStatus !== constantCode.status.CLOSED) {
      const notificationObj = {
        notificationType,
        subject,
        channel,
        body,
        userId: assignedUserId,
        roleId: assignedRoleId,
        departmentId: assignedDepartmentId,
        referenceId: orderId,
        notificationSource: notificationSource || entityCategory.ORDER,
        sentAt: new Date(),
        status,
        createdBy: userId,
        payload: {
          entity: {
            entityId: orderNumber,
            priority,
            customerNo
          }
        },
        referenceNo: orderNumber
      }
      const createNotification = await conn.Notification.create(notificationObj, { transaction: t })
      const notificationId = createNotification?.dataValues?.notificationId ?? createNotification?.notificationId
      const notificationEventArray = []
      if (notificationId) {
        if (userList && !assignedUserId && Array.isArray(userList) && userList.length > 0) {
          userList.forEach(e => {
            notificationEventArray.push({
              notificationId,
              userId: e.userId,
              isRead: false,
              isPinned: false,
              createdDeptId: departmentId,
              createdRoleId: roleId,
              createdBy: userId
            })
          })
        } else {
          notificationEventArray.push({
            notificationId,
            userId: assignedUserId || userId,
            isRead: false,
            isPinned: false,
            createdDeptId: departmentId,
            createdRoleId: roleId,
            createdBy: userId
          })
        }
        await conn.NotificationUserEvents.bulkCreate(notificationEventArray, { transaction: t })
      }
    }
    t.commit()
  } catch (error) {
    logger.error(error)
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
})

module.exports = em

const getNotificationTemplate = async (type, channel, templateType, conn) => {
  if (!type && !templateType && !channel) {
    return {
      status: 'ERROR',
      message: defaultMessage.VALIDATION_ERROR
    }
  }
  const template = await conn.NotificationTemplate.findOne({
    where: {
      templateType,
      templateStatus: constantCode.status.ACTIVE,
      [Op.and]: [conn.sequelize.literal(`mapping_payload->>'channel' =  '${channel}'`),
        conn.sequelize.literal(`mapping_payload->> 'type' = '${type}'`)
      ]
    }
  })
  if (!template) {
    return { status: 'ERROR', message: 'No Email Template found' }
  }
  return { status: 'SUCCESS', data: template }
}

const notificationLog = async (notificationType, notifiationSource, channel, referenceId, referenceSubId, userId, status, subject, body, ccEmail, contactNo, customerId, createdDeptId, createdRoleId, tranId, createdBy, conn) => {
  try {
    /** Adding Notification Log */
    const emailNotification = {
      notificationType,
      notifiationSource,
      channel,
      referenceId,
      referenceSubId,
      userId,
      status,
      subject,
      body,
      ccEmail,
      contactNo,
      sentAt: new Date(),
      customerId,
      createdDeptId,
      createdRoleId,
      tranId,
      createdBy
    }
    await conn.Notification.create(emailNotification)
  } catch (error) {
    return {
      status: 'ERROR',
      message: 'Internal server error'
    }
  }
}
