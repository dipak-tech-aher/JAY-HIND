import { statusCodeConstants, constantCode, logger, entityCategory, EmailHelper, SMSHelper, defaultMessage, defaultStatus, interactionFlowAction } from '@utils'
import notificationResources from '@resources'
import { Op, QueryTypes } from 'sequelize'
const ST = require('stjs')

let instance
class NotificationService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async createUpdateNotification(notificationData, conn, t) {
    try {
      console.log('notificationData------->', notificationData)
      const { email, contactNo, contactNoPfx, notifiationSource, referenceId, referenceSubId, customerId, departmentId, roleId, userId, channel, contactPreference } = notificationData

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
          templateCategory: ["TC_EMAIL", "TC_SMS"],
          entity: "TMC_INTERACTION",
          eventType: notificationData.eventType,
          status: defaultStatus.TPLACTIVE
        },
        raw: true
      })
      console.log("templateHdrs ===> ", templateHdrs);
      const mappedTemplates = await conn.TemplateMapping.findAll({
        where: {
          templateId: templateHdrs.map(x => x.templateId),
          status: defaultStatus.TPLACTIVE
        },
        raw: true
      });

      console.log('notificationData------>', notificationData);

      const emailTemplates = templateHdrs.filter(x => {
        let condition = x.templateCategory == "TC_EMAIL";
        condition = condition && mappedTemplates.filter(y =>
          y.templateId == x.templateId &&
          y.mapCategory == notificationData.mapCategory &&
          y.tranCategory == notificationData.tranCategory &&
          y.tranType == notificationData.tranType &&
          y.serviceCategory == notificationData.serviceCategory &&
          y.serviceType == notificationData.serviceType
        ).length > 0;
        return condition;
      });

      console.log("emailTemplates------->", emailTemplates);

      const smsTemplates = templateHdrs.filter(x => {
        let condition = x.templateCategory == "TC_SMS";
        condition = condition && mappedTemplates.filter(y =>
          y.templateId == x.templateId &&
          y.mapCategory == notificationData.mapCategory &&
          y.tranCategory == notificationData.tranCategory &&
          y.tranType == notificationData.tranType &&
          y.serviceCategory == notificationData.serviceCategory &&
          y.serviceType == notificationData.serviceType
        ).length > 0;
        return condition;
      });

      console.log("smsTemplates------>", smsTemplates);

      // template header entity - event type
      const allTemplates = await conn.NotificationTemplate.findAll({
        where: {
          templateHdrId: [...emailTemplates.map(x => x.templateId), ...smsTemplates.map(x => x.templateId)]
        }
      })
      console.log('email notify called... 4')
      if (!allTemplates.length) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Email template not found, Please create template'
        }
      }

      console.log("contactPreference ===>", contactPreference);

      if (email && (contactPreference?.includes('CNT_PREF_EMAIL') || contactPreference?.includes('CNT_PREF_ANY'))) {
        console.log("email contact preference there...")
        const emailHelper = new EmailHelper()

        const templates = allTemplates.filter(x => x.templateType === 'TC_EMAIL')

        for (let index = 0; index < templates.length; index++) {
          const notificationTemplate = templates[index]
          // const data = {
          //   ticketId: referenceId,
          //   name
          // }
          const data = await conn.sequelize.query(`SELECT * FROM ${notificationTemplate.dataSource} WHERE "intxnNo" = '${referenceId}';`, { type: QueryTypes.SELECT });
          console.log("data for email ==> ", data);
          const htmlContent = ST.select(data[0]).transformWith(notificationTemplate?.body).root()
          const subjectContent = ST.select(data[0]).transformWith(notificationTemplate?.subject).root();
          const response = await emailHelper.sendMail({
            to: [email],
            subject: subjectContent,
            message: htmlContent
          })
          await notificationLog(notifyTypes[notificationTemplate?.templateType].key, notifiationSource, channel, referenceId, referenceSubId, userId, response.status, notificationTemplate.subject,
            htmlContent, email, customerId, departmentId, roleId, conn)
        }
      }

      if (contactNo && contactNoPfx && (contactPreference?.includes('CNT_PREF_SMS') || contactPreference?.includes('CNT_PREF_ANY'))) {
        console.log("sms contact preference there...")
        const smsHelper = new SMSHelper()
        const templates = allTemplates.filter(x => x.templateType === 'TC_SMS')

        for (let index = 0; index < templates.length; index++) {
          const notificationTemplate = templates[index]
          // const data = {
          //   ticketId: referenceId,
          //   name
          // }
          const data = await conn.sequelize.query(`SELECT * FROM ${notificationTemplate.dataSource} WHERE "intxnNo" = '${referenceId}';`, { type: QueryTypes.SELECT });
          console.log("data for sms ==> ", data);
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
  }

  async getNotification(payload, conn) {
    try {
      logger.debug('Start fetching Notification List')
      const { limit = constantCode.common.lIMIT, page = constantCode.common.PAGE, sortBy = constantCode.common.DATEDESC, isRead = false } = payload

      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      if (limit > 100) {
        return {
          status: statusCodeConstants.UN_PROCESSIBLE_ENTITY,
          message: 'Please use limit less than 100'
        }
      }

      const whereClause = {}
      const order = []
      if (payload && payload?.category && payload?.category === 'SELF') {
        if (!payload?.userId) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Please provide user details for self-notification.'
          }
        } else {
          whereClause.userId = payload.userId
        }
      } else {
        whereClause.userId = null
      }

      if (payload && payload?.roleId) {
        whereClause.roleId = payload.roleId
      }

      if (payload && payload?.departmentId) {
        whereClause.departmentId = payload.departmentId
      }

      if (payload && payload?.type) {
        whereClause.notificationType = payload.type
      }

      if (payload && payload?.entity) {
        whereClause.notificationSource = payload.entity
      }

      if (sortBy) {
        if (sortBy === constantCode.common.DATEDESC) {
          order.push(['notificationId', 'DESC'])
        } else if (sortBy === constantCode.common.DATEASC) {
          order.push(['notificationId', 'ASC'])
        }
      }

      // logger.debug('notification whereClause', whereClause)

      const count = await conn.Notification.count({
        include: [{
          model: conn.NotificationUserEvents,
          as: 'notificationEvents',
          attributes: ['notificationUserEventId'],
          where: { isRead, userId: payload?.userId }
        }, {
          model: conn.Interaction,
          as: 'interactionDetails'
        }, {
          model: conn.Orders,
          as: 'orderDetails'
        },
        // {
        //   model: conn.AppointmentTxn,
        //   as: 'appointmentDetails'
        // },
        {
          model: conn.Request,
          as: 'requestDetails'
        }
        ],
        where: { ...whereClause }
      })
      // logger.debug('notification count', count)

      let response = await conn.Notification.findAll({
        attributes: ['notificationId', 'notificationType', 'subject', 'body', 'referenceNo', 'createdAt', 'category', 'payload'],
        include: [{
          model: conn.NotificationUserEvents,
          as: 'notificationEvents',
          attributes: {
            exclude: ['updatedAt', 'updatedBy', 'createdAt', 'createdBy', 'createdRoleId', 'createdDeptId', 'notificationUserEventId']
          },
          where: { isRead, isPinned: false, userId: payload?.userId }
        }, {
          model: conn.BusinessEntity,
          as: 'notificationSourceDesc',
          attributes: ['code', 'description']
        }, {
          model: conn.Role,
          as: 'roleDetails',
          attributes: ['roleId', 'roleDesc']
        }, {
          model: conn.BusinessUnit,
          as: 'businessUnitDetails',
          attributes: ['unitId', 'unitDesc']
        }, {
          model: conn.Interaction,
          as: 'interactionDetails'
        }, {
          model: conn.Orders,
          as: 'orderDetails'
        }, {
          model: conn.AppointmentTxn,
          as: 'appointmentDetails'
        },
        {
          model: conn.Request,
          as: 'requestDetails'
        }],
        where: { ...whereClause },
        ...params,
        order
      })
      // logger.debug('fetched notification list', response)
      const pinnedNotification = await conn.Notification.findAll({
        attributes: ['notificationId', 'notificationType', 'subject', 'body', 'referenceNo', 'createdAt', 'category', 'payload'],
        include: [{
          model: conn.NotificationUserEvents,
          as: 'notificationEvents',
          attributes: {
            exclude: ['updatedAt', 'updatedBy', 'createdAt', 'createdBy', 'createdRoleId', 'createdDeptId', 'notificationUserEventId']
          },
          where: { isRead, isPinned: true, userId: payload?.userId }
        }, {
          model: conn.BusinessEntity,
          as: 'notificationSourceDesc',
          attributes: ['code', 'description']
        }, {
          model: conn.Role,
          as: 'roleDetails',
          attributes: ['roleId', 'roleDesc']
        }, {
          model: conn.BusinessUnit,
          as: 'businessUnitDetails',
          attributes: ['unitId', 'unitDesc']
        }, {
          model: conn.Interaction,
          as: 'interactionDetails'
        }, {
          model: conn.Orders,
          as: 'orderDetails'
        }, {
          model: conn.AppointmentTxn,
          as: 'appointmentDetails'
        },
        {
          model: conn.Request,
          as: 'requestDetails'
        }],
        where: { ...whereClause },
        order
      })

      response = notificationResources.transformNotificationDetails(response, payload?.departmentId, payload?.roleId, payload?.userId)

      const data = {
        count: count || 0,
        rows: response || [],
        pinned: pinnedNotification
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Notification Fetched Successfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetch Notification list'
      }
    }
  }

  /**
   * Get Notification Count
   * @param {object} payload
   * @param {number} payload.userId
   * @param {number} payload.roleId
   * @param {number} payload.departmentId
   * @param {boolean} payload.isRead
   * @param {string} payload.type
   * @param {instance} conn
   * @returns {object}
   */
  async getNotificationCount(payload, conn) {
    try {
      const { isRead = false, departmentId, roleId } = payload

      if (!departmentId || !roleId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Please provide departmentId and roleId and isRead'
        }
      }
      const whereClause = {}
      const entityClause = {}
      if (payload && payload?.category && payload?.category === 'SELF') {
        if (!payload?.userId) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Please provide user details for self-notification.'
          }
        } else {
          entityClause.userId = payload.userId
        }
      } else {
        entityClause.userId = null
      }

      if (payload && payload?.roleId) {
        whereClause.roleId = payload.roleId
      }

      if (payload && payload?.departmentId) {
        whereClause.departmentId = payload.departmentId
      }

      if (payload && payload?.type) {
        whereClause.notificationType = payload.type
      }

      // Total Count
      const count = await conn.Notification.count({
        where: {
          ...whereClause
        }
      })

      // get only unread count
      // const unreadCount = await conn.Notification.count({
      //   include: [{
      //     model: conn.NotificationUserEvents,
      //     as: 'notificationEvents',
      //     where: {
      //       isRead
      //     }
      //   }],
      //   where: { ...whereClause }
      // })

      // get notification Source
      let notificationSource = await conn.Notification.findAll({
        attributes: ['notificationSource',
          [conn.sequelize.fn('COUNT', conn.sequelize.col('notification_source')), 'notificationCount']
        ],
        include: [{
          model: conn.NotificationUserEvents,
          as: 'notificationEvents',
          attributes: [],
          where: {
            userId: payload.userId,
            isRead
          }
        }],
        distinct: true,
        group: ['notificationSource'],
        where: { ...whereClause, ...entityClause }
      })

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          codeType: entityCategory.ENTITY_CATEGORY
        }
      })
      notificationSource = notificationResources.transformNotificationSource(notificationSource, businessEntityInfo)

      const selfCount = await conn.Notification.count({
        include: [{
          model: conn.NotificationUserEvents,
          as: 'notificationEvents',
          where: {
            userId: payload.userId,
            isRead
          }
        }],
        where: {
          ...whereClause,
          userId: payload.userId || undefined
        }
      })

      const poolCount = await conn.Notification.count({
        include: [{
          model: conn.NotificationUserEvents,
          as: 'notificationEvents',
          where: {
            userId: payload.userId,
            isRead
          }
        }],
        where: {
          ...whereClause,
          userId: null
        }
      })

      const response = {
        total: count || 0,
        // unread: unreadCount || 0,
        self: selfCount || 0,
        pool: poolCount || 0,
        notificationSource: notificationSource || []
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Notification Fetched Successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in file uploading'
      }
    }
  }

  /**
   * @param {*} payload
   * @param {number} payload.userId
   * @param {number} payload.roleId
   * @param {number} payload.departmentId
   * @param {instance} conn
   * @param {*} t
   * @returns {object}
   */
  async updateNotificationSeen(payload, conn, t) {
    try {
      const { userId, roleId, departmentId, notificationStatus } = payload

      if (!userId || !roleId || !departmentId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Please provide userId, roleId and departmentId'
        }
      }

      if (!notificationStatus) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Please provide notificationStatus'
        }
      }

      const whereClause = {
        roleId,
        departmentId
      }

      const updateData = {}

      if (payload && payload?.notificationId) {
        whereClause.notificationId = payload.notificationId
      }

      if (payload && payload?.notificationStatus) {
        if (payload?.notificationStatus === 'read') {
          updateData.isRead = true
        } else {
          updateData.isRead = false
        }
      }

      if (payload && payload?.category && payload?.category === 'SELF') {
        if (!payload?.userId) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Please provide user details for self-notification.'
          }
        } else {
          whereClause.userId = payload.userId
        }
      } else if (payload && payload?.category && payload?.category === 'POOL') {
        whereClause.userId = null
      }

      let notificationIds = await conn.Notification.findAll({
        include: [{
          model: conn.NotificationUserEvents,
          as: 'notificationEvents',
          attributes: [],
          where: {
            userId: payload.userId,
            isRead: !payload?.notificationStatus === 'read'
          }
        }],
        attributes: ['notificationId'],
        where: {
          ...whereClause
        }
      })

      if (notificationIds.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Notification Found'
        }
      }

      notificationIds = notificationIds.map(n => n.notificationId)

      if (payload?.notificationStatus === 'unread' && notificationIds.length > 0) {
        const checkPinnedCount = await conn.NotificationUserEvents.count({
          where: {
            notificationId: notificationIds,
            userId: payload?.userId,
            isPinned: true
          }
        })

        if (checkPinnedCount > 0) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'You can pin only one notification at a time. please unpin the notification first'
          }
        }
      }

      console.log('updateData', updateData, payload?.userId)
      await conn.NotificationUserEvents.update({
        ...updateData
      }, {
        where: {
          userId: payload?.userId,
          notificationId: notificationIds
        },
        logging: console.log,
        transaction: t
      })

      // logger.debug('notificationSeen response', response)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Notification Seen Updated Successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in updat eNotification Seen'
      }
    }
  }

  async updateNotificationPinned(payload, conn, t) {
    try {
      const { notificationId, userId, notificationPinned } = payload

      if (!notificationId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Please provide notificationId'
        }
      }

      if (notificationPinned === 'pin') {
        const checkPinnedCount = await conn.NotificationUserEvents.count({
          where: {
            userId,
            isRead: false,
            isPinned: true
          }
        })
        if (checkPinnedCount > 0) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'You can pin only one notification at a time.'
          }
        }
      }

      await conn.NotificationUserEvents.update({
        isPinned: notificationPinned === 'pin'
      }, {
        where: {
          userId,
          notificationId
        },
        transaction: t
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Notification Pinned Updated Successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in file uploading'
      }
    }
  }
}

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
      templateStatus: defaultStatus.ACTIVE,
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

const notificationLog = async (notificationType, notifiationSource, channel, referenceId, referenceSubId, userId, status, subject, body, ccEmail, contactNo, customerId, departmentId, roleId, conn) => {
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
      departmentId,
      roleId
    }
    await conn.Notification.create(emailNotification)
  } catch (error) {
    return {
      status: 'ERROR',
      message: 'Internal server error'
    }
  }
}

module.exports = NotificationService
