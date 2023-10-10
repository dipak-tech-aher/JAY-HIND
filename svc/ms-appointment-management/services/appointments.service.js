/* eslint-disable array-callback-return */
import { config } from '@config/env.config'
import {
  CryptoHelper, entityCategory, statusCodeConstants, interactionStatus, constantCode, orderStatus, logger,
  defaultMessage, POSITIVE_INTXN_TYPES, NEGATIVE_INTXN_TYPES, NEUTRAL_INTXN_TYPES, camelCaseConversion
} from '@utils'
import { QueryTypes, Op } from 'sequelize'
import _, { isEmpty } from 'lodash'

// const { v4: uuidv4 } = require('uuid')
import appointmentResources from '@resources'

const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const { systemUserId, systemRoleId, systemDeptId } = config

let instance
class AppointmentService {
  constructor(conn) {
    if (!instance) {
      instance = this
    }
    instance.conn = conn
    instance.cryptoHelper = new CryptoHelper()
    return instance
  }

  async getHalls(payload) {
    try {
      let { customerId } = payload;
      customerId = typeof customerId == 'string' ? customerId : customerId?.toFixed(0);
      const getCustomerLocation = await this.conn.User.findOne({ where: { customerId: customerId } });
      const locations = await this.conn.BusinessEntity.findOne({ where: { codeType: 'LOCATION', code: getCustomerLocation?.loc } });
      const halls = await this.conn.BusinessEntity.findAll({ where: { codeType: 'WORK_TYPE', code: locations?.mappingPayload?.workType }, raw: true });

      const response = halls.map(x => ({ ...x, value: x.description }));

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Halls retrived',
        data: response
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching slot details'
      }
    }
  }

  async getBookedAppointments(payload) {
    try {
      let { interactionNo } = payload;

      let response = await this.conn.AppointmentTxn.findOne(
        {
          where: { tranCategoryNo: interactionNo }, include: [
            {
              model: this.conn.BusinessEntity,
              as: 'appointModeValueDesc',
              attributes: ['code', 'description']
            }
          ]
        },
      );
      response = response?.dataValues ? response?.dataValues : response
      console.log('response------->', response?.appointStartTime)
      const xx = {
        status: statusCodeConstants.SUCCESS,
        message: `Your booking is successful for ${moment(response?.appointDate).format('DD MMMM YYYY')} ${response?.appointStartTime}-${response?.appointEndTime} in ${response?.appointModeValueDesc?.description}</br>Good luck! Have a great day ahead.</br> Your request has been submitted successfully`,
        data: response
      }
      console.log('xx------>', xx)

      return xx
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching slot details'
      }
    }
  }

  async getHallSlotsAvailability(payload) {
    try {
      let { customerId, workType } = payload;
      customerId = typeof customerId == 'string' ? customerId : customerId?.toFixed(0);
      const getCustomerLocation = await this.conn.User.findOne({ where: { customerId: customerId } });
      const templates = await this.conn.TemplateHdr.findAll({ where: { templateCategory: "TC_APPOINT" } })
      // here need to check the template mapping
      const templateIds = templates.map(x => x.templateId);
      console.log("templateIds ===> ", templateIds);
      console.log("getCustomerLocation?.loc ==> ", getCustomerLocation?.loc);
      const appointHdr = await this.conn.AppointmentHdr.findOne({ where: { templateId: templateIds, location: getCustomerLocation?.loc } });
      console.log("appointHdr?.appointId ===> ", appointHdr?.appointId);

      const rosters = await this.conn.AppointmentDtl.findAll({
        where: {
          workType: workType,
          appointId: appointHdr?.appointId,
          status: "AS_SCHED"
        },
        logging: true
      })

      if (rosters.length === 0) {
        return {
          status: 404,
          message: 'No slots event found'
        }
      }

      let slots = [];
      rosters.map((ele, index) => {
        slots.push({
          ...this.eventObject({
            // title: `Slot ${index + 1}`,
            start: ele.appointDate + ' ' + ele.appointStartTime,
            end: ele.appointDate + ' ' + ele.appointEndTime,
            extendedProps: {
              slotId: ele.appointDtlId,
              interval: ele.appointInterval
            }
          })
        })
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Slots retrived',
        data: slots
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching slot details'
      }
    }
  }

  async getSlotDetails(payload) {
    try {
      const slotDetails = await this.conn.AppointmentDtl.findOne({
        where: {
          appointDtlId: payload?.appointDtlId
        },
        include: [
          {
            model: this.conn.AppointmentHdr,
            as: 'appoinmentDesc',
            include: [
              {
                model: this.conn.BusinessEntity,
                as: 'locationDetails',
                attributes: ['code', 'description']
              }
            ]
          }
        ]
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'slots retrived',
        data: slotDetails
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching slot details'
      }
    }
  }

  async getAppointments(payload) {
    try {
      let whereObj = {}
      let data = {}

      if (payload && payload?.for === 'customer') {
        whereObj = {
          appointUserId: payload.id
        }
      } else if (payload && payload?.for === 'user') {
        whereObj = {
          appointAgentId: payload.id
        }
      } else if (payload && payload?.for === 'my-team') {
        const myTeamUserIds = [
          ...(await this.conn.User.findAll({
            where: {
              managerId: payload.id
            },
            attributes: ['userId'],
            raw: true
          }))
        ].map(user => user.userId)
        whereObj = {
          appointAgentId: myTeamUserIds
        }
      } else if (payload && payload?.for === 'interaction') {
        whereObj = {
          tranCategoryType: entityCategory.INTERACTION,
          tranCategoryNo: payload.id
        }
      } else if (payload && payload?.for === 'order') {
        whereObj = {
          tranCategoryType: entityCategory.ORDER,
          tranCategoryNo: payload.id
        }
      }

      const appointments = await this.conn.AppointmentTxn.findAll({
        where: whereObj,
        attributes: {
          exclude: ['createdDeptId', 'createdRoleId', 'createdBy', 'updatedBy', 'updatedAt']
        },
        include: [
          {
            model: this.conn.Customer,
            as: 'appointmentCustomer',
            attributes: ['firstName', 'lastName'],
            include: [
              {
                model: this.conn.Contact,
                as: 'customerContact',
                attributes: ['mobileNo', 'isPrimary', 'mobilePrefix']
              }
            ]
          },
          {
            model: this.conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: this.conn.User,
            as: 'appointmentAgent',
            attributes: ['firstName', 'lastName']
          }
        ]
      })

      if (appointments.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appointments found'
        }
      }

      const businessEntityInfo = await this.conn.BusinessEntity.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      if ((payload?.for === 'interaction' || payload?.for === 'order') && payload?.id) {
        let insight = {}
        let transactionDetails = {}
        if (payload?.for === 'interaction') {
          transactionDetails = this.conn.Interaction.findOne({
            where: {
              intxnNo: payload?.id,
              intxnStatus: interactionStatus.CLOSED
            }
          })
        } else if (payload?.for === 'order') {
          transactionDetails = this.conn.Orders.findOne({
            where: {
              orderNo: payload?.id,
              orderStatus: orderStatus.CLOSED
            }
          })
        }
        if (!isEmpty(transactionDetails) && Array.isArray(appointments) && appointments.length > 0 && appointments?.[0]?.appointDate) {
          const level = moment(transactionDetails.updatedAt).diff(moment(appointments?.[0]?.appointDate), 'days')
          if (level > -1) {
            if (level <= 1) {
              insight = {
                emotion: 'GOOD',
                message: `The ${payload?.for} is closed on same day of appointment.`
              }
            } else if (level >= 1 && level <= 5) {
              insight = {
                emotion: 'NETURAL',
                message: `The ${payload?.for} is closed after ${level} day's of appointment.`
              }
            } else {
              insight = {
                emotion: 'IMPROVE',
                message: `The ${payload?.for} is closed after ${level} day's of appointment.`
              }
            }
          }
        }

        const rows = appointmentResources.transformAppointment(appointments, businessEntityInfo) || {}
        data = {
          rows,
          insight
        }
      } else {
        data = appointmentResources.transformAppointment(appointments, businessEntityInfo) || {}
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointment retrived',
        data
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching appointments'
      }
    }
  }

  async reAssignAppoinment(params, body, userId) {
    const t = await this.conn.sequelize.transaction()
    try {
      let appointment = await this.conn.AppointmentTxn.findOne({
        where: {
          appointTxnId: body?.appointTxnId
        }
      })

      appointment = appointment?.dataValues ? appointment?.dataValues : appointment

      await this.conn.AppointmentTxn.update({
        status: 'AS_ASSIGN',
        appointStatusReason: body?.statusReason
      }, {
        where: {
          appointTxnId: appointment?.appointTxnId
        },
        transaction: t
      })

      const guid1 = uuidv4()
      const commonAttribAppointment = {
        tranId: guid1,
        createdDeptId: body?.departmentId || systemDeptId,
        createdRoleId: body?.roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      const appointmentTxnData = {
        appointDtlId: appointment?.appointDtlId,
        appointId: appointment?.appointId,
        appointDate: appointment?.appointDate,
        status: 'AS_SCHED',
        appointUserCategory: appointment?.appointUserCategory,
        appointUserId: appointment?.appointUserId,
        appointAgentId: body?.agentId,
        appointMode: appointment?.appointMode,
        appointStartTime: appointment?.appointStartTime,
        appointEndTime: appointment?.appointEndTime,
        tranCategoryType: appointment?.tranCategoryType,
        tranCategoryNo: appointment?.tranCategoryNo,
        tranCategoryUuid: appointment?.tranCategoryUuid,
        ...commonAttribAppointment
      }

      console.log('appointmentTxnData', appointmentTxnData)
      const rescheduleAppt = await this.conn.AppointmentTxn.create(appointmentTxnData, { transaction: t }, { logging: true })
      await t.commit()

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Appointments re-assigned successfully ',
        data: rescheduleAppt
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in re-assigning appointments'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async reScheduleAppoinment(params, body, userId) {
    const t = await this.conn.sequelize.transaction()
    try {
      let appointment = await this.conn.AppointmentTxn.findOne({
        where: {
          appointTxnId: body?.appointTxnId
        }
      })

      appointment = appointment?.dataValues ? appointment?.dataValues : appointment

      await this.conn.AppointmentTxn.update({
        status: 'AS_RESCH',
        appointStatusReason: body?.statusReason
      }, {
        where: {
          appointTxnId: appointment?.appointTxnId
        },
        transaction: t
      })

      const guid1 = uuidv4()
      const commonAttribAppointment = {
        tranId: guid1,
        createdDeptId: body?.departmentId || systemDeptId,
        createdRoleId: body?.roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      const appointmentTxnData = {
        appointDtlId: body?.slot?.appoint_dtl_id || body?.slot?.appointDtlId,
        appointId: appointment?.appointId,
        appointDate: body?.slot?.appoint_date || body?.slot?.appointDate,
        status: 'AS_SCHED',
        appointUserCategory: appointment?.appointUserCategory,
        appointUserId: appointment?.appointUserId,
        appointAgentId: appointment?.appointAgentId,
        appointMode: appointment?.appointMode,
        appointStartTime: body?.slot?.appoint_start_time || body?.slot?.appointStartTime,
        appointEndTime: body?.slot?.appoint_end_time || body?.slot?.appointEndTime,
        tranCategoryType: appointment?.tranCategoryType,
        tranCategoryNo: appointment?.tranCategoryNo,
        tranCategoryUuid: appointment?.tranCategoryUuid,
        ...commonAttribAppointment
      }

      console.log('appointmentTxnData', appointmentTxnData)
      const rescheduleAppt = await this.conn.AppointmentTxn.create(appointmentTxnData, { transaction: t }, { logging: true })
      await t.commit()

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Appointments re-scheduled successfully ',
        data: rescheduleAppt
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in re-scheduling appointments'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async updateAppoinmentStatus(params, body, userId) {
    const t = await this.conn.sequelize.transaction()
    try {
      let appointment = await this.conn.AppointmentTxn.findOne({
        where: {
          appointTxnId: body?.appointTxnId
        }
      })

      appointment = appointment?.dataValues ? appointment?.dataValues : appointment
      let updatPayload = {
        status: body?.status
      }
      if (body?.statusReason) {
        updatPayload.appointStatusReason = body?.statusReason
      }
      await this.conn.AppointmentTxn.update(updatPayload, {
        where: {
          appointTxnId: appointment?.appointTxnId
        },
        transaction: t
      })

      await t.commit()

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Appointment status updated successfully',
        data: []
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in appointment status update'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async availableAgents(payload, body) {
    try {

      let query = `select
      distinct au.user_id,      
      au.first_name,      
      au.last_name,      
      ad.appoint_start_time,      
      ad.appoint_end_time,      
      ad.status      
      from      
      appointment_dtl ad      
      left join ad_users au on      
      ad.user_id = au.user_id      
      left join appointment_hdr ah on      
      ah.appoint_id = ad.appoint_id      
      where      
      ad.user_id not in (      
      select      
      appoint_agent_id      
      from      
      appointment_txn at2      
      where appoint_txn_id in ( select max(appoint_txn_id) from appointment_txn at2      
      where appoint_id = '${body?.appointId}'      
      and appoint_agent_id is not null )      
      )      
      and appoint_date = '${body?.date}'      
      and ad.appoint_start_time = '${body?.startTime}'      
      and ad.appoint_end_time = '${body?.endTime}'      
      and ad.appoint_mode = '${body?.mode}'`

      if (body?.mode === 'CUST_VISIT') {
        query = query + ` and ah."location" = '${body?.location}'`
      }

      const resp = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (resp.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No agents found'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'agents retrived',
        data: resp
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching agents'
      }
    }
  }

  async getPerformance(payload, body, userId) {
    try {
      // let query = `select * from bcae_app_infor_appointment_performance_fn(
      // COALESCE(CAST($userId AS integer),null),
      // COALESCE($entity, NULL),
      // COALESCE(CAST($fromDate AS date), NULL),
      // COALESCE(CAST($toDate AS date), NULL))`

      // const bind = {
      //   userId: userId,
      //   entity: body?.filterParams?.tran_category_type && body?.filterParams?.tran_category_type === 'All' ? null : body?.filterParams?.tran_category_type || null,
      //   toDate: body?.searchParams?.toDate || null,
      //   fromDate: body?.searchParams?.fromDate || null
      // }

      // let resp = await this.conn.sequelize.query(query,
      //   {
      //     bind,
      //     type: QueryTypes.SELECT
      //   }
      // )
      let whereClause = {
        appointAgentId: userId
      }
      if (body?.searchParams?.tran_category_type) {
        whereClause.tranCategoryType = body?.searchParams?.tran_category_type
      }
      if (body?.searchParams?.fromDate && body?.searchParams?.toDate) {
        whereClause.appointDate = {
          [Op.gte]: moment(new Date(body?.searchParams?.fromDate)).format('YYYY-MM-DD'),
          [Op.lte]: moment(new Date(body?.searchParams?.toDate)).format('YYYY-MM-DD')
        }
      }
      console.log('whereClause ', whereClause)
      let resp = await this.conn.AppointmentTxn.findAll({
        include: [
          {
            model: this.conn.AppointmentHdr, as: 'appointmentHdrDetails', attributes: ['appointName', 'location']
          },
          {
            model: this.conn.Customer, as: 'appointmentCustomer', attributes: ['firstName', 'lastName']
          },
          {
            model: this.conn.BusinessEntity, as: 'appoinmentModeDesc', attributes: ['description', 'code']
          },
          {
            model: this.conn.BusinessEntity, as: 'tranCategoryTypeDesc', attributes: ['description', 'code']
          },
          {
            model: this.conn.BusinessEntity, as: 'statusDesc', attributes: ['description', 'code']
          }
        ],
        where: {
          ...whereClause
        },
        // logging: true
      })

      const tranNos = resp.map(e => e.tranCategoryNo)
      const intxnList = await this.conn.Interaction.findAll({
        attributes: ['intxnNo', 'intxnStatus', 'createdAt'],
        include: [
          {
            model: this.conn.BusinessEntity, as: 'srType', attributes: ['description', 'code'],
            plain: true
          },
          {
            model: this.conn.BusinessEntity, as: 'intxnCategoryDesc', attributes: ['description', 'code'],
            plain: true
          }
        ],
        where: {
          intxnNo: tranNos
        }
      })

      const orderList = await this.conn.Orders.findAll({
        attributes: ['orderNo', 'orderStatus', 'createdAt'],
        include: [
          {
            model: this.conn.BusinessEntity, as: 'orderTypeDesc', attributes: ['description', 'code'],
            plain: true
          },
          {
            model: this.conn.BusinessEntity, as: 'orderCategoryDesc', attributes: ['description', 'code'],
            plain: true
          }
        ],
        where: {
          orderNo: tranNos
        }
      })

      const scheduled = [], completed = [], success = [], unsuccess = [], cancelled = [], upcoming = [], entityList = []

      for (const r of resp) {
        let obj
        for (const i of intxnList) {
          if (i.intxnNo === r.tranCategoryNo) {
            obj = {
              ...r.dataValues,
              category: i.intxnCategoryDesc.description,
              type: i.srType.description
            }
          }
        }
        for (const i of orderList) {
          if (i.orderNo === r.tranCategoryNo) {
            obj = {
              ...r.dataValues,
              category: i.orderCategoryDesc.description,
              type: i.orderTypeDesc.description
            }
          }
        }
        entityList.push(obj)
      }
      // console.log(entityList)

      entityList.map(f => {
        if (f) {
          scheduled.push(f)
          if (['AS_COMP_SUCCESS', 'AS_COMP_UNSUCCESS'].includes(f?.status)) {
            completed.push(f)

            if (['AS_COMP_SUCCESS'].includes(f?.status)) {
              success.push(f)
            }
            if (['AS_COMP_UNSUCCESS'].includes(f?.status)) {
              unsuccess.push(f)
            }
          }

          if (['AS_CANCEL'].includes(f?.status)) {
            cancelled.push(f)
          }
          if (!['AS_CANCEL', 'AS_COMP_SUCCESS', 'AS_COMP_UNSUCCESS'].includes(f?.status)) {
            upcoming.push(f)
          }
        }

      })

      const response = {
        scheduled,
        completed,
        success,
        unsuccess,
        cancelled,
        upcoming
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'performance retrived',
        data: response
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching performance'
      }
    }
  }

  async getAppointmentByType(payload, body, userId) {
    try {
      let query = `SELECT * FROM bcae_app_infor_status_vs_appointtype_fn (
          COALESCE(CAST($userId AS integer), NULL),
          COALESCE($entity, NULL),
          COALESCE(CAST($fromDate AS date), NULL),
          COALESCE(CAST($toDate AS date), NULL)
      );`

      const bind = {
        userId: userId,
        entity: body?.filterParams?.tran_category_type && body?.filterParams?.tran_category_type === 'All' ? null : body?.filterParams?.tran_category_type || null,
        toDate: body?.searchParams?.toDate || null,
        fromDate: body?.searchParams?.fromDate || null
      }

      let resp = await this.conn.sequelize.query(query,
        {
          bind,
          type: QueryTypes.SELECT,
          logging: true
        }
      )

      if (resp.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appointments found'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments by types retrived',
        data: resp
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching agents'
      }
    }
  }

  async getAppointmentByUserGroup(payload, body, userId) {
    try {
      let query = `SELECT *
      FROM bcae_app_infor_status_vs_usergroup_fn (
          COALESCE(CAST($userId AS integer), NULL),
          COALESCE($entity, NULL),
          COALESCE(CAST($fromDate AS date), NULL),
          COALESCE(CAST($toDate AS date), NULL)
      );`

      const bind = {
        userId: userId,
        entity: body?.filterParams?.tran_category_type && body?.filterParams?.tran_category_type === 'All' ? null : body?.filterParams?.tran_category_type || null,
        toDate: body?.searchParams?.toDate || null,
        fromDate: body?.searchParams?.fromDate || null
      }

      let resp = await this.conn.sequelize.query(query,
        {
          bind,
          type: QueryTypes.SELECT
        }
      )

      if (resp.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appointments found'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments by types retrived',
        data: resp
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching agents'
      }
    }
  }

  async getUpcomingAppointments(payload, userId, body) {
    try {
      console.log('body------>', body)
      let status
      if (payload?.valueParam?.includes(',')) {
        status = payload?.valueParam.split(',')
      } else {
        status = [payload?.valueParam]
      }
      let tuple
      if (status.length === 1) {
        tuple = `('${status[0]}')`
      } else {
        tuple = `('${status.join("', '")}')`
      }

      let pagination
      if (payload?.page && payload?.limit) {
        pagination = {
          offset: payload?.page * payload?.limit,
          limit: Number(payload?.limit)
        }
      }

      let query

      let tran_category_type_cond = '1 = 1'
      let dateRangeCondition = '1 = 1'
      if (body?.searchParams?.dateRange) {
        dateRangeCondition = ` appoint_date >= '${body?.searchParams?.fromDate}' AND appoint_date <= '${body?.searchParams?.toDate}'`
      } else {
        dateRangeCondition = ` appoint_date <= DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '6 MONTH'`
      }
      if (body?.filterParams?.tran_category_type) {
        if (body?.filterParams?.tran_category_type === 'All') {
          tran_category_type_cond = ' tran_category_type in (\'INTERACTION\',\'ORDER\')'
        } else {
          tran_category_type_cond = ` tran_category_type in ('${body?.filterParams?.tran_category_type}')`
        }
      }

      query = `SELECT
      at2.*,
        cc.first_name,
        cc.last_name,
        cc.customer_no,
        ah.location,
        abe1.description AS status_description,
        abe2.description AS appoint_mode_description,
        abe3.description AS tran_category_type_description,
        CASE
          WHEN at2.tran_category_type = 'INTERACTION' then
          (
          	SELECT abe.description FROM interaction i 
          	join ad_business_entity abe on abe.code =i.intxn_category 
          	WHERE i.intxn_no = at2.tran_category_no
          ) 
          WHEN at2.tran_category_type = 'ORDER' then
          (
          	SELECT abe.description FROM order_hdr oh 
          	join ad_business_entity abe on abe.code =oh.order_category
          	WHERE oh.order_no = at2.tran_category_no
          ) 
          ELSE NULL
        END AS category_details,
        CASE
          WHEN at2.tran_category_type = 'INTERACTION' then
          (
          	SELECT abe.description FROM interaction i 
          	join ad_business_entity abe on abe.code =i.intxn_type 
          	WHERE i.intxn_no = at2.tran_category_no
          ) 
          WHEN at2.tran_category_type = 'ORDER' then
          (
          	SELECT abe.description FROM order_hdr oh 
          	join ad_business_entity abe on abe.code =oh.order_type
          	WHERE oh.order_no = at2.tran_category_no
          ) 
          ELSE NULL
        END AS type_details
      FROM
        appointment_txn at2
        LEFT JOIN cust_customers cc ON cc.customer_id = at2.appoint_user_id
        LEFT JOIN appointment_hdr ah ON ah.appoint_id = at2.appoint_id 
        LEFT JOIN ad_business_entity abe1 ON at2.status = abe1.code 
        LEFT JOIN ad_business_entity abe2 ON at2.appoint_mode = abe2.code 
        LEFT JOIN ad_business_entity abe3 ON at2.tran_category_type = abe3.code 
      WHERE
      at2.appoint_agent_id = ${userId}
        and ${tran_category_type_cond}
        and ${dateRangeCondition}
        AND at2.status IN('AS_SCHED')  ORDER BY
      at2.appoint_start_time DESC
     `
      //  at2.appoint_date >= '${body?.date}' 
      //  AND (at2.appoint_date = CURRENT_DATE AND at2.appoint_start_time >= CURRENT_TIME OR at2.appoint_date > CURRENT_DATE)
      console.log('query--------->', query)

      const respCounts = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (pagination) {
        query = query + ` LIMIT ${pagination?.limit} OFFSET ${pagination?.offset} `
      }

      const resp = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (resp.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appointments found'
        }
      }

      const responseData = {
        rows: resp,
        count: respCounts.length
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments retrived',
        data: responseData
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching upcoming appointments'
      }
    }
  }

  async getConsumersUpcomingAppointments(payload, userId, body) {
    try {
      console.log('body------>', body)
      let status
      if (payload?.valueParam?.includes(',')) {
        status = payload?.valueParam.split(',')
      } else {
        status = [payload?.valueParam]
      }
      let tuple
      if (status.length === 1) {
        tuple = `('${status[0]}')`
      } else {
        tuple = `('${status.join("', '")}')`
      }

      let pagination
      if (payload?.page && payload?.limit) {
        pagination = {
          offset: payload?.page * payload?.limit,
          limit: Number(payload?.limit)
        }
      }

      let query

      let tran_category_type_cond = '1 = 1'

      if (body?.filterParams?.tran_category_type) {
        if (body?.filterParams?.tran_category_type === 'All') {
          tran_category_type_cond = ' tran_category_type in (\'INTERACTION\',\'ORDER\')'
        } else {
          tran_category_type_cond = ` tran_category_type in ('${body?.filterParams?.tran_category_type}')`
        }
      }

      query = `SELECT
      at2.*,
        cc.first_name,
        cc.last_name,
        cc.customer_no,
        ah.location,
        ah.template_id,
        abe1.description AS status_description,
        abe2.description AS appoint_mode_description,
        abe3.description AS tran_category_type_description,
         CASE
        WHEN at2.tran_category_type = 'INTERACTION' then
        (
         SELECT i.service_category  FROM interaction i 
         WHERE i.intxn_no = at2.tran_category_no
        )
        WHEN at2.tran_category_type = 'ORDER' then
        (select 	 pm.product_sub_type as prod_sub_type
          from    order_hdr oh,
                  order_dtl od ,
                  product_mst pm 
          where   oh.order_id = od.order_id
          and     od.product_id =pm.product_id
          and     oh.order_no =at2.tran_category_no )
        ELSE null
         END AS service_category,
           CASE
        WHEN at2.tran_category_type = 'INTERACTION' then
        (
         SELECT i.service_type  FROM interaction i 
         WHERE i.intxn_no = at2.tran_category_no
        )
        WHEN at2.tran_category_type = 'ORDER' then
        (
         SELECT oh.service_type   FROM order_hdr oh 
         WHERE oh.order_no = at2.tran_category_no
        )
        ELSE null
         END AS service_type,
         CASE
        WHEN at2.tran_category_type = 'INTERACTION' then
        (
         SELECT i.intxn_category  FROM interaction i 
         WHERE i.intxn_no = at2.tran_category_no
        )
        WHEN at2.tran_category_type = 'ORDER' then
        (
         SELECT oh.order_category   FROM order_hdr oh 
         WHERE oh.order_no = at2.tran_category_no
        )
        ELSE null
         END AS intxn_category,
          CASE
        WHEN at2.tran_category_type = 'INTERACTION' then
        (
         SELECT i.intxn_type  FROM interaction i 
         WHERE i.intxn_no = at2.tran_category_no
        )
        WHEN at2.tran_category_type = 'ORDER' then
        (
         SELECT oh.order_type  FROM order_hdr oh 
         WHERE oh.order_no = at2.tran_category_no
        )
        ELSE null
         END AS intxn_type,
          CASE
        WHEN at2.tran_category_type = 'INTERACTION' then
        (
         SELECT i.intxn_priority  FROM interaction i 
         WHERE i.intxn_no = at2.tran_category_no
        )
        WHEN at2.tran_category_type = 'ORDER' then
        (
         SELECT oh.order_priority FROM order_hdr oh 
         WHERE oh.order_no = at2.tran_category_no
        )
        ELSE NULL
          END AS priority_code,
        CASE
        WHEN at2.tran_category_type = 'INTERACTION' then
        (
         SELECT i.request_statement  FROM interaction i
         join ad_business_entity abe on abe.code =i.intxn_category
         WHERE i.intxn_no = at2.tran_category_no
        )
        WHEN at2.tran_category_type = 'ORDER' then
        (
         SELECT oh.request_statement  FROM order_hdr oh
         join ad_business_entity abe on abe.code =oh.order_category
         WHERE oh.order_no = at2.tran_category_no
        )
        ELSE NULL
      END AS request_statement_appt,
        CASE
          WHEN at2.tran_category_type = 'INTERACTION' then
          (
          	SELECT abe.description FROM interaction i 
          	join ad_business_entity abe on abe.code =i.intxn_category 
          	WHERE i.intxn_no = at2.tran_category_no
          ) 
          WHEN at2.tran_category_type = 'ORDER' then
          (
          	SELECT abe.description FROM order_hdr oh 
          	join ad_business_entity abe on abe.code =oh.order_category
          	WHERE oh.order_no = at2.tran_category_no
          ) 
          ELSE NULL
        END AS category_details,
        CASE
          WHEN at2.tran_category_type = 'INTERACTION' then
          (
          	SELECT abe.description FROM interaction i 
          	join ad_business_entity abe on abe.code =i.intxn_type 
          	WHERE i.intxn_no = at2.tran_category_no
          ) 
          WHEN at2.tran_category_type = 'ORDER' then
          (
          	SELECT abe.description FROM order_hdr oh 
          	join ad_business_entity abe on abe.code =oh.order_type
          	WHERE oh.order_no = at2.tran_category_no
          ) 
          ELSE NULL
        END AS type_details
      FROM
        appointment_txn at2
        LEFT JOIN cust_customers cc ON cc.customer_id = at2.appoint_user_id
        LEFT JOIN appointment_hdr ah ON ah.appoint_id = at2.appoint_id 
        LEFT JOIN ad_business_entity abe1 ON at2.status = abe1.code 
        LEFT JOIN ad_business_entity abe2 ON at2.appoint_mode = abe2.code 
        LEFT JOIN ad_business_entity abe3 ON at2.tran_category_type = abe3.code
      WHERE
      at2.created_by = ${userId}
        and ${tran_category_type_cond}
        AND appoint_date >= CURRENT_DATE
        AND at2.status IN('AS_SCHED')  ORDER BY
      at2.appoint_start_time DESC
     `

      const respCounts = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (pagination) {
        query = query + ` LIMIT ${pagination?.limit} OFFSET ${pagination?.offset} `
      }

      const resp = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (resp.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appointments found'
        }
      }

      const responseData = {
        rows: resp,
        count: respCounts.length
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments retrived',
        data: responseData
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching upcoming appointments'
      }
    }
  }

  async getClosedAppointments(payload, userId, body) {
    try {
      let status
      if (payload?.valueParam?.includes(',')) {
        status = payload?.valueParam.split(',')
      } else {
        status = [payload?.valueParam]
      }
      let tuple
      if (status.length === 1) {
        tuple = `('${status[0]}')`
      } else {
        tuple = `('${status.join("', '")}')`
      }

      let pagination
      if (payload?.page && payload?.limit) {
        pagination = {
          offset: payload?.page * payload?.limit,
          limit: Number(payload?.limit)
        }
      }

      // let dateRangeCondition = '1 = 1'
      // if (body?.searchParams?.dateRange) {
      //   dateRangeCondition = ` at2.appoint_date >= '${body?.searchParams?.fromDate}' AND at2.appoint_date <= '${body?.searchParams?.toDate}'`
      // } else {
      //   dateRangeCondition = ` at2.appoint_date <= DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '6 MONTH'`
      // }

      let tran_category_type_cond = '1 = 1'
      let dateRangeCondition = '1 = 1'
      if (body?.searchParams?.dateRange) {
        dateRangeCondition = ` at2.appoint_date >= '${body?.searchParams?.fromDate}' AND at2.appoint_date <= '${body?.searchParams?.toDate}'`
      } else {
        dateRangeCondition = ` at2.appoint_date <= DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '6 MONTH'`
      }
      if (body?.filterParams?.tran_category_type) {
        if (body?.filterParams?.tran_category_type === 'All') {
          tran_category_type_cond = ' tran_category_type in (\'INTERACTION\',\'ORDER\')'
        } else {
          tran_category_type_cond = ` tran_category_type in ('${body?.filterParams?.tran_category_type}')`
        }
      }

      let query = `SELECT
      at2.*,
        cc.first_name,
        cc.last_name,
        cc.customer_no,
        ah.location,
        abe1.description AS status_description,
        abe2.description AS appoint_mode_description,
        abe3.description AS tran_category_type_description,
        CASE
        WHEN at2.tran_category_type = 'INTERACTION' then
        (
          SELECT abe.description FROM interaction i 
          join ad_business_entity abe on abe.code =i.intxn_category 
          WHERE i.intxn_no = at2.tran_category_no
        ) 
        WHEN at2.tran_category_type = 'ORDER' then
        (
          SELECT abe.description FROM order_hdr oh 
          join ad_business_entity abe on abe.code =oh.order_category
          WHERE oh.order_no = at2.tran_category_no
        ) 
        ELSE NULL
      END AS category_details,
      CASE
        WHEN at2.tran_category_type = 'INTERACTION' then
        (
          SELECT abe.description FROM interaction i 
          join ad_business_entity abe on abe.code =i.intxn_type 
          WHERE i.intxn_no = at2.tran_category_no
        ) 
        WHEN at2.tran_category_type = 'ORDER' then
        (
          SELECT abe.description FROM order_hdr oh 
          join ad_business_entity abe on abe.code =oh.order_type
          WHERE oh.order_no = at2.tran_category_no
        ) 
        ELSE NULL
      END AS type_details
      FROM
      appointment_txn at2
      LEFT JOIN cust_customers cc ON cc.customer_id = at2.appoint_user_id
      LEFT JOIN appointment_hdr ah ON ah.appoint_id = at2.appoint_id 
      LEFT JOIN ad_business_entity abe1 ON at2.status = abe1.code 
      LEFT JOIN ad_business_entity abe2 ON at2.appoint_mode = abe2.code 
      LEFT JOIN ad_business_entity abe3 ON at2.tran_category_type = abe3.code 
    WHERE  at2.appoint_agent_id = ${userId}
      AND at2.status IN ${tuple} 
      and ${dateRangeCondition}
      and ${tran_category_type_cond}
       ORDER BY at2.appoint_date DESC
   `

      console.log('query0--------->', query)
      const respCounts = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (pagination) {
        query = query + ` LIMIT ${pagination?.limit} OFFSET ${pagination?.offset} `
      }

      const resp = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (resp.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appointments found'
        }
      }

      const responseData = {
        rows: resp,
        count: respCounts.length
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'closed appointments retrived',
        data: responseData
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching closed appointments'
      }
    }
  }

  async getAppointmentsByQuery(payload, userId, body) {
    try {
      let status
      if (payload?.valueParam?.includes(',')) {
        status = payload?.valueParam.split(',')
      } else {
        status = [payload?.valueParam]
      }
      let tuple
      if (status.length === 1) {
        tuple = `('${status[0]}')`
      } else {
        tuple = `('${status.join("', '")}')`
      }

      let pagination
      if (payload?.page && payload?.limit) {
        pagination = {
          offset: payload?.page * payload?.limit,
          limit: Number(payload?.limit)
        }
      }

      let tran_category_type_cond = '1=1'
      let dateRangeCondition = '1 = 1'
      if (body?.searchParams?.dateRange) {
        dateRangeCondition = ` appoint_date >= '${body?.searchParams?.fromDate}' AND appoint_date <= '${body?.searchParams?.toDate}'`
      }
      if (body?.filterParams?.tran_category_type) {
        if (body?.filterParams?.tran_category_type === 'All') {
          tran_category_type_cond = ' tran_category_type in (\'INTERACTION\',\'ORDER\')'
        } else {
          tran_category_type_cond = ` tran_category_type in ('${body?.filterParams?.tran_category_type}')`
        }
      }

      let query = `SELECT
      at2.*,
        cc.first_name,
        cc.last_name,
        cc.customer_no,
        ah.location,
        abe1.description AS status_description,
        abe2.description AS appoint_mode_description,
        abe3.description AS tran_category_type_description,
        CASE
        WHEN at2.tran_category_type = 'INTERACTION' then
        (
          SELECT abe.description FROM interaction i 
          join ad_business_entity abe on abe.code =i.intxn_category 
          WHERE i.intxn_no = at2.tran_category_no
        ) 
        WHEN at2.tran_category_type = 'ORDER' then
        (
          SELECT abe.description FROM order_hdr oh 
          join ad_business_entity abe on abe.code =oh.order_category
          WHERE oh.order_no = at2.tran_category_no
        ) 
        ELSE NULL
      END AS category_details,
      CASE
        WHEN at2.tran_category_type = 'INTERACTION' then
        (
          SELECT abe.description FROM interaction i 
          join ad_business_entity abe on abe.code =i.intxn_type 
          WHERE i.intxn_no = at2.tran_category_no
        ) 
        WHEN at2.tran_category_type = 'ORDER' then
        (
          SELECT abe.description FROM order_hdr oh 
          join ad_business_entity abe on abe.code =oh.order_type
          WHERE oh.order_no = at2.tran_category_no
        ) 
        ELSE NULL
      END AS type_details,
      CASE
        WHEN at2.tran_category_type = 'INTERACTION' THEN(
        SELECT i.intxn_type
            FROM interaction i
            WHERE i.intxn_no = at2.tran_category_no
      )
        WHEN at2.tran_category_type = 'ORDER' THEN(
        SELECT oh.order_type
            FROM order_hdr oh
            WHERE oh.order_no = at2.tran_category_no
      )
        ELSE NULL
      END AS group_type
      FROM
      appointment_txn at2
  LEFT JOIN cust_customers cc ON cc.customer_id = at2.appoint_user_id
  LEFT JOIN appointment_hdr ah ON ah.appoint_id = at2.appoint_id
  LEFT JOIN ad_business_entity abe1 ON at2.status = abe1.code
  LEFT JOIN ad_business_entity abe2 ON at2.appoint_mode = abe2.code
  LEFT JOIN ad_business_entity abe3 ON at2.tran_category_type = abe3.code
      WHERE
      at2.appoint_agent_id = ${userId}
      and ${tran_category_type_cond}
      and ${dateRangeCondition}
      AND at2.status IN ${tuple}
  ORDER BY
      at2.appoint_start_time DESC
  `
      // at2.appoint_date >= '${body?.date}'
      console.log('query----by query---->', query)
      const respCounts = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (pagination) {
        query = query + ` LIMIT ${pagination?.limit} OFFSET ${pagination?.offset} `
      }

      const resp = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (resp.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appointments found'
        }
      }

      const responseData = {
        rows: resp,
        count: respCounts.length
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments retrived',
        data: responseData
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching upcoming appointments'
      }
    }
  }

  async appoinmentHistory(payload, userId, body) {
    try {
      let query
      let tran_category_type_cond = '1=1'
      if (body?.tran_category_type) {
        if (body?.tran_category_type === 'All') {
          tran_category_type_cond = ' tran_category_type in (\'INTERACTION\',\'ORDER\')'
        } else {
          tran_category_type_cond = ` tran_category_type in ('${body?.tran_category_type}')`
        }
      }
      query = `SELECT COUNT(*) AS count, appoint_mode, TO_CHAR(appoint_date, 'Month') AS month, abe.description
        FROM appointment_txn at2 left join ad_business_entity abe on code = appoint_mode 
        WHERE appoint_agent_id = ${userId} and ${tran_category_type_cond}
      AND(at2.status = 'AS_COMP_SUCCESS' or at2.status = 'AS_COMP_UNSUCCESS')
        GROUP BY appoint_mode, TO_CHAR(appoint_date, 'Month'), abe.description
        ORDER BY appoint_mode, TO_CHAR(appoint_date, 'Month')
        `
      const respCounts = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (respCounts.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appointments history found'
        }
      }
      const resData = {
        rows: respCounts
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments history retrived',
        data: resData
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching appointments history'
      }
    }
  }

  async appoinmentLocationData(payload, userId, body) {
    try {
      let query
      let tran_category_type_cond = '1=1'
      if (body?.tran_category_type) {
        if (body?.tran_category_type === 'All') {
          tran_category_type_cond = ' tran_category_type in (\'INTERACTION\',\'ORDER\')'
        } else {
          tran_category_type_cond = ` tran_category_type in ('${body?.tran_category_type}')`
        }
      }

      query = `select
      COUNT(at2.*) as count,
        ah."location",
          abe.description,
          at2.appoint_user_id,
          cc2.first_name,
          cc2.last_name, 
       case
        when at2.appoint_user_category = 'BUSINESS' then(
            select
          ca.latitude
        from
          cust_customers cc
        left join cmn_address ca on
          ca.address_category_value = cc.customer_no
        where
          cc.customer_id = at2.appoint_user_id
          and ca.is_primary = true
          )
        else '0'
      end as latitude,
      case
        when at2.appoint_user_category = 'BUSINESS' then(
            select
          ca.longitude
        from
          cust_customers cc
        left join cmn_address ca on
          ca.address_category_value = cc.customer_no
        where
          cc.customer_id = at2.appoint_user_id
          and ca.is_primary = true
          )
        else '0'
end as longitude
from
      appointment_txn at2
    left join appointment_hdr ah on
ah.appoint_id = at2.appoint_id
    left join ad_business_entity abe on
ah."location" = abe.code
    left join cust_customers cc2 on
cc2.customer_id = at2.appoint_user_id
where
at2.appoint_agent_id = ${userId}
      and ${tran_category_type_cond}
    group by
ah."location",
  abe.description,
  at2.appoint_user_category,
  at2.appoint_user_id,
  cc2.first_name,
  cc2.last_name`

      const respCounts = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (respCounts.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appointments locations found'
        }
      }

      let locationsData = []
      respCounts.map((ele) => {
        locationsData.push({ position: [Number(ele?.latitude), Number(ele?.longitude)], name: ele?.description, info: ele?.first_name + ' ' + ele?.last_name + ' ' + ele?.count + ' Appointments' })
      })
      const resData = {
        rows: locationsData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments locations retrived',
        data: resData
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching appointments locations'
      }
    }
  }

  async agentSuccessPercentage(payload, userId, body) {
    try {
      const query0 = `select count(*) as total_success from appointment_txn at2 where at2.appoint_agent_id = '${userId}' and status = 'AS_COMP_SUCCESS'`

      const query1 = `select count(*) as total_success from appointment_txn at2 where at2.appoint_agent_id = '${userId}' and(status = 'AS_COMP_SUCCESS' or status = 'AS_COMP_UNSUCCESS') `

      const successCount = await this.conn.sequelize.query(query0, {
        type: QueryTypes.SELECT
      })

      const totalCount = await this.conn.sequelize.query(query1, {
        type: QueryTypes.SELECT
      })
      console.log('totalCount---->', totalCount)
      console.log('successCount---->', successCount)
      const percentage = (successCount[0]?.total_success / totalCount[0]?.total_success) * 100

      const responseData = {
        percentage: percentage?.toFixed(2)
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments retrived',
        data: responseData?.percentage
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching upcoming appointments'
      }
    }
  }

  async getAppointmentsReminder(payload, userId, body) {
    try {
      let date = body?.date
      if (body?.searchParams?.dateRange) {
        date = body?.searchParams?.fromDate
      }

      const query = `SELECT
at2.*,
  cc.first_name,
  cc.last_name
FROM
      appointment_txn at2
    LEFT JOIN cust_customers cc ON cc.customer_id = appoint_user_id
WHERE
appoint_date = '${date}' AND appoint_agent_id = '${userId}'
      AND appoint_start_time >= CURRENT_TIME
    ORDER BY
      appoint_start_time DESC
    LIMIT 2`

      console.log('reminder query------->', query)

      const resp = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      if (resp.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appointments reminders found'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments reminder retrived',
        data: resp
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching appointments reminder'
      }
    }
  }

  async getSlots(params, userId, body) {
    try {
      console.log('body------->', body)
      let query = `select
      distinct ad.appoint_start_time,
  ad.appoint_end_time,
  ad.user_id,
      case
        when exists(
    select
          1
        from
          appointment_txn at2
        where
          ad.user_id in (
      select
            appoint_agent_id
          from
            appointment_txn at3
          where
            at3.appoint_start_time = ad.appoint_start_time
            and at3.appoint_end_time = ad.appoint_end_time
            and ad.appoint_date = at3.appoint_date)
            ) then 'N'
        else 'Y'
end as flag
from
      appointment_dtl ad
    left join appointment_hdr ah on
ah.appoint_id = ad.appoint_id
WHERE
ad.appoint_date >= '${body?.date}'
      AND ad.appoint_mode = '${body?.mode}'`
      if (moment(body?.date).format('DD-MM-YYYY') == moment().format('DD-MM-YYYY')) {
        query = query + ' and ad.appoint_start_time >=current_time '
      }

      if (body?.mode === 'CUST_VISIT') {
        query = query + ` and ah."location" = '${body?.location}'`
      }
      const resp = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments slots retrived',
        data: resp
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching appointments slots'
      }
    }
  }

  async availableSlot(params, userId, body) {
    try {
      // console.log('body------->', body)
      const query = `select * from appointment_dtl ad where user_id = ${userId} and appoint_date = '${body?.date}' ` //and appoint_start_time >= CURRENT_TIME and appoint_start_time >= '${body?.startTime}'
      const resp = await this.conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointments slots retrived',
        data: resp
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching appointments slots'
      }
    }
  }

  eventObject({ title, start, end, url, description, eventCat, extendedProps = {} }) {
    const eventType = {
      POSITIVE: {
        backgroundColor: '#14A44D', borderColor: '#14A44D', textColor: '#FBFBFB'
      },
      BELOW_POSITIVE: {
        backgroundColor: '#3B71CA', borderColor: '#3B71CA', textColor: '#FBFBFB'
      },
      NEUTRAL: {
        backgroundColor: '#9FA6B2', borderColor: '#9FA6B2', textColor: '#FBFBFB'
      },
      BELOW_NEUTRAL: {
        backgroundColor: '#E4A11B', borderColor: '#E4A11B', textColor: '#FBFBFB'
      },
      NEGATIVE: {
        backgroundColor: '#DC4C64', borderColor: '#DC4C64', textColor: '#FBFBFB'
      }
    }
    return {
      id: uuidv4(),
      title,
      start,
      end,
      url,
      extendedProps,
      description,
      ...eventType[eventCat]
    }
  }

  async getAppoinmentEvents(body, userId) {
    try {
      let whereClause = {
        appointAgentId: userId
      }
      let dateRangeCondition = '1 = 1'
      if (body?.searchParams?.dateRange) {
        whereClause.appointDate = {
          [Op.and]: {
            [Op.gte]: body?.searchParams?.fromDate,
            [Op.lte]: body?.searchParams?.toDate
          }
        }

        // dateRangeCondition = ` at2.appoint_date >= '${body?.searchParams?.fromDate}' 
        // AND at2.appoint_date <= '${body?.searchParams?.toDate}'`
      } else {
        whereClause.appointDate = {
          [Op.gte]: moment(new Date()).subtract(6, 'M').format('YYYY-MM-DD')
        }
        //dateRangeCondition = ` at2.appoint_date <= DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '6 MONTH'`
      }
      if (body?.appoinmentTxnId) {
        whereClause.appointTxnId = body?.appoinmentTxnId
        // query = query + ` and appoint_txn_id = '${body?.appoinmentTxnId}'`
      }

      console.log('whereClause=========>', whereClause)
      const appoinmentEvents = []

      const appointments = await this.conn.AppointmentTxn.findAll({
        include: [
          {
            model: this.conn.AppointmentHdr, as: 'appointmentHdrDetails', attributes: ['appointName', 'location']
          },
          {
            model: this.conn.Customer, as: 'appointmentCustomer', attributes: ['firstName', 'lastName']
          },
          {
            model: this.conn.BusinessEntity, as: 'appoinmentModeDesc', attributes: ['description', 'code']
          },
          {
            model: this.conn.BusinessEntity, as: 'tranCategoryTypeDesc', attributes: ['description', 'code']
          },
          {
            model: this.conn.BusinessEntity, as: 'statusDesc', attributes: ['description', 'code']
          }
        ],
        where: {
          ...whereClause
        },
        //logging: true
      })
      //console.log('appointments ', appointments)
      //       let query = `SELECT
      // at2.appoint_start_time,
      //   at2.appoint_end_time,
      //   at2.appoint_mode_value,
      //   at2.appoint_mode,
      //   at2.appoint_date,
      //   at2.tran_category_type,
      //   CASE
      //           WHEN at2.tran_category_type = 'ORDER' THEN(SELECT order_description FROM order_hdr oh WHERE oh.order_no = at2.tran_category_no)
      //           WHEN at2.tran_category_type = 'INTERACTION' THEN(SELECT intxn_description FROM interaction i WHERE i.intxn_no = at2.tran_category_no)
      //           ELSE 'result'
      //       END AS result,
      //   CASE
      //           WHEN at2.tran_category_type = 'ORDER' THEN(SELECT oh.order_type  FROM order_hdr oh WHERE oh.order_no = at2.tran_category_no)
      //           WHEN at2.tran_category_type = 'INTERACTION' THEN(SELECT i.intxn_type  FROM interaction i WHERE i.intxn_no = at2.tran_category_no)
      //           ELSE 'result'
      //       END AS result1
      //   FROM appointment_txn at2   
      // WHERE  at2.appoint_agent_id = ${userId} and ${dateRangeCondition} `


      // console.log('events query--------->', query)
      // const resp = await this.conn.sequelize.query(query, {
      //   type: QueryTypes.SELECT,
      //   raw: true
      // })

      if (appointments.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appoinments event found'
        }
      }

      let colorCode
      appointments.map((ele) => {
        // console.log('ele ', ele)
        // if (POSITIVE_INTXN_TYPES?.includes(ele?.result1)) {
        //   colorCode = 'POSITIVE'
        // }
        // if (NEGATIVE_INTXN_TYPES?.includes(ele?.result1)) {
        //   colorCode = 'NEGATIVE'
        // }
        // if (NEUTRAL_INTXN_TYPES?.includes(ele?.result1)) {
        //   colorCode = 'NEUTRAL'
        // }
        appoinmentEvents.push({
          ...this.eventObject({
            title: ele.appointmentHdrDetails?.appointName,
            start: ele.appointDate + ' ' + ele.appointStartTime,
            end: ele.appointDate + ' ' + ele.appointEndTime,
            extendedProps: {
              appointDate: ele.appointDate, appointStartTime: ele.appointStartTime,
              appointEndTime: ele.appointEndTime, status: ele.statusDesc?.description,
              customerName: ele.appointmentCustomer?.firstName + ' ' + ele.appointmentCustomer?.lastName,
              location: ele.appointmentHdrDetails?.location, appointMode: ele.appointMode,
              appoinmentMode: ele.appoinmentModeDesc?.description, appointCategory: ele.tranCategoryTypeDesc?.description,
              tranCategoryNo: ele.tranCategoryNo, url: ele.appointModeValue
            }
          })
        })
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointment events retrived',
        data: appoinmentEvents
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching events of appointments'
      }
    }
  }

  async getCalendarEvents(body, userId) {
    try {
      let whereClause = {
        appointUserId: body?.customerId,
        status: {
          [Op.ne]: "AS_TEMP"
        }
      };
      let dateRangeCondition = '1 = 1'
      if (body?.searchParams?.dateRange) {
        whereClause.appointDate = {
          [Op.and]: {
            [Op.gte]: body?.searchParams?.fromDate,
            [Op.lte]: body?.searchParams?.toDate
          }
        }
      } else {
        whereClause.appointDate = {
          [Op.gte]: moment(new Date()).subtract(6, 'M').format('YYYY-MM-DD')
        }
      }
      if (body?.appoinmentTxnId) {
        whereClause.appointTxnId = body?.appoinmentTxnId
      }

      console.log('whereClause=========>', whereClause)
      const appoinmentEvents = []

      const appointments = await this.conn.AppointmentTxn.findAll({
        include: [
          {
            model: this.conn.AppointmentHdr, as: 'appointmentHdrDetails', attributes: ['appointName', 'location', 'templateId', 'appointType']
          },
          {
            model: this.conn.Customer, as: 'appointmentCustomer', attributes: ['firstName', 'lastName']
          },
          {
            model: this.conn.BusinessEntity, as: 'appoinmentModeDesc', attributes: ['description', 'code']
          },
          {
            model: this.conn.BusinessEntity, as: 'tranCategoryTypeDesc', attributes: ['description', 'code']
          },
          {
            model: this.conn.BusinessEntity, as: 'statusDesc', attributes: ['description', 'code']
          }
        ],
        where: {
          ...whereClause
        },
        //logging: true
      })

      if (appointments.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appoinments event found'
        }
      }

      let colorCode
      appointments.map((ele) => {
        appoinmentEvents.push({
          ...this.eventObject({
            title: ele.appointmentHdrDetails?.appointName,
            start: ele.appointDate + ' ' + ele.appointStartTime,
            end: ele.appointDate + ' ' + ele.appointEndTime,
            extendedProps: {
              templateId: ele.appointmentHdrDetails?.templateId,
              appointType: ele.appointmentHdrDetails?.appointType,
              appointTxnId: ele.appointTxnId,
              appointDate: ele.appointDate,
              appointStartTime: ele.appointStartTime,
              appointEndTime: ele.appointEndTime,
              status: ele.statusDesc?.description,
              customerName: ele.appointmentCustomer?.firstName + ' ' + ele.appointmentCustomer?.lastName,
              location: ele.appointmentHdrDetails?.location,
              appointMode: ele.appointMode,
              appoinmentMode: ele.appoinmentModeDesc?.description,
              appointCategory: ele.tranCategoryTypeDesc?.description,
              tranCategoryNo: ele.tranCategoryNo,
              url: ele.appointModeValue
            }
          })
        })
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointment events retrived',
        data: appoinmentEvents
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching events of appointments'
      }
    }
  }

  async getTopPerformance(payload) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload

      // const whereClause = {}

      // if (searchParams && searchParams?.teamMemberId && Array.isArray(searchParams?.teamMemberId) && searchParams?.teamMemberId?.length > 0) {
      //   const teamMemberIds = searchParams?.teamMemberId.map(e => e.value)
      //   whereClause.createdBy = teamMemberIds
      // } else {
      //   const getUserlist = await this.conn.User.findAll({
      //     where: {
      //       managerId: searchParams?.userId
      //     }
      //   })

      //   if (getUserlist.length > 0) {
      //     const userList = getUserlist.map((u) => u.userId)
      //     whereClause.appointAgentId = userList
      //   }
      // }

      // const response = await this.conn.AppointmentTxn.findAll({
      //   attributes: ['createdBy', [this.conn.sequelize.fn('count', this.conn.sequelize.col('created_by')), 'count']],
      //   where: {
      //     ...whereClause,
      //     status: [constantCode.status.CLOSED]
      //   },
      //   group: ['createdBy'],
      //   order: [['createdBy', 'DESC']],
      //   limit: 5
      // })

      // const userList = response && response.map((e) => { return e.createdBy })

      // const getUserDetails = await this.conn.User.findAll({
      //   attributes: ['firstName', 'lastName', 'profilePicture'],
      //   where: {
      //     userId: userList
      //   }
      // })
      // const data = appointmentResources.transformTopPerformance(getUserDetails)
      const userId = searchParams?.userId ? `'${searchParams?.userId}'` : null
      const fromDate = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const toDate = searchParams?.toDate ? `'${searchParams?.toDate}'` : null
      const limit = searchParams?.limit ? `'${searchParams?.limit}'` : 5

      const handlingSql = `select * from bcae_ops_infor_appoint_top_closure_performers_fn(${userId},${fromDate},${toDate},${limit})`

      let responseData
      if (handlingSql) {
        responseData = await this.conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      const userList = responseData && responseData.map((e) => { return e.oUserId })
      const getUserDetails = await this.conn.User.findAll({
        attributes: ['userId', 'firstName', 'lastName', 'profilePicture'],
        where: {
          userId: userList
        },
        distinct: true
      })
      const resp = []

      responseData.forEach(element => {
        const getUserDetail = getUserDetails.filter(e => e.userId === element.oUserId)

        const Users = getUserDetail.map((e) => {
          if (e.userId === element.oUserId) {
            return {
              firstName: e.firstName,
              lastName: e?.lastName,
              profilePicture: e?.profilePicture,
              alias: '',
              rating: (Number(element?.oClosedPercentage) / 20).toFixed(1)
            }
          }
        })
        if (Array.isArray(Users) && Users.length > 0) { resp.push(Users?.[0]) }
      })

      const data = appointmentResources.transformTopPerformance(resp)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: data || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getTeamPastHistoryGraph(payload) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      const whereClause = {
        status: [constantCode.status.SUCCESSFULLY_CLOSED, constantCode.status.UNSUCCESSFULLY_CLOSED]
      }

      if (searchParams && searchParams?.teamMemberId && Array.isArray(searchParams?.teamMemberId) && searchParams?.teamMemberId?.length > 0) {
        const teamMemberIds = searchParams?.teamMemberId.map(e => e.value)
        whereClause.appointAgentId = teamMemberIds
      } else {
        const getUserlist = await this.conn.User.findAll({
          where: {
            managerId: searchParams?.userId
          }
        })

        if (getUserlist.length > 0) {
          const userList = getUserlist.map((u) => u.userId)
          whereClause.appointAgentId = userList
        }
      }

      if (searchParams?.fromDate && searchParams?.toDate) {
        whereClause.appointDate = {
          [Op.gte]: new Date(searchParams.fromDate),
          [Op.lte]: new Date(searchParams.toDate)
          // [Op.between]: [body.startDate, body.endDate]
        }
      } else if (searchParams && searchParams?.fromDate) {
        whereClause.appointDate = searchParams?.fromDate
      } else if (searchParams && searchParams?.toDate) {
        whereClause.appointDate = searchParams?.toDate
      }

      const appointments = await this.conn.AppointmentTxn.findAll({
        attributes: {
          exclude: ['createdDeptId', 'createdRoleId', 'createdBy', 'updatedBy', 'updatedAt']
        },
        include: [
          {
            model: this.conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          }, {
            model: this.conn.BusinessEntity,
            as: 'appoinmentModeDesc',
            attributes: ['code', 'description']
          }
        ],
        logging: console.log,
        where: {
          ...whereClause
        }
      })
      const respose = appointmentResources.transformPastHistory(appointments)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: respose || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getPastHistoryGraph(payload) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      const whereClause = {
        status: [constantCode.status.SUCCESSFULLY_CLOSED, constantCode.status.UNSUCCESSFULLY_CLOSED]
      }

      if (searchParams && searchParams?.userId) {
        whereClause.appointAgentId = searchParams?.userId
      }

      if (searchParams?.fromDate && searchParams?.toDate) {
        whereClause.appointDate = {
          [Op.gte]: new Date(searchParams.fromDate),
          [Op.lte]: new Date(searchParams.toDate)
          // [Op.between]: [body.startDate, body.endDate]
        }
      } else if (searchParams && searchParams?.fromDate) {
        whereClause.appointDate = searchParams?.fromDate
      } else if (searchParams && searchParams?.toDate) {
        whereClause.appointDate = searchParams?.toDate
      }

      const appointments = await this.conn.AppointmentTxn.findAll({
        attributes: {
          exclude: ['createdDeptId', 'createdRoleId', 'createdBy', 'updatedBy', 'updatedAt']
        },
        include: [
          {
            model: this.conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          }, {
            model: this.conn.BusinessEntity,
            as: 'appoinmentModeDesc',
            attributes: ['code', 'description']
          }
        ],
        where: {
          ...whereClause
        }
      })
      const respose = appointmentResources.transformPastHistory(appointments)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: respose || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getTotalAppoinmentByChannel(payload) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let searchParams;
      if (payload?.searchParams) {
        searchParams = payload?.searchParams
      }
      let query1 = `
          SELECT
          be_desc (i.intxn_category) as intxn_category,
          be_desc (i.intxn_type) as intxn_type,
          at2.tran_category_no,
          be_desc( at2.tran_category_type) as tran_category_type,
          be_desc( at2.status) as status,
          be_desc (at2.appoint_mode) as appoint_mode,
          COALESCE(be_desc(i.intxn_channel),
          i.intxn_channel) AS channel,
          concat(cc.first_name,' ', cc.last_name) as customer_name,
          concat(at2.appoint_end_time,' - ',
          at2.appoint_start_time) as appoint_time,
          at2.appoint_date
          FROM
              appointment_txn at2
          INNER JOIN interaction i ON
              i.intxn_no = at2.tran_category_no
          left join cust_customers cc on cc.customer_id  = at2.appoint_user_id
              AND at2.tran_category_type = 'INTERACTION' `

      let whereClause1 = ' WHERE  1=1 '

      if (searchParams?.serviceCategory) {
        const serviceCategories = searchParams.serviceCategory.join("', '");
        whereClause1 = whereClause1 + ` AND i.service_category IN ('${serviceCategories}')`;
      }

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '");
        whereClause1 = whereClause1 + ` AND i.service_type IN ('${serviceTypes}')`;
      }

      if (searchParams?.startDate && searchParams?.startDate !== '' && searchParams?.startDate !== undefined) {
        whereClause1 = whereClause1 + ' and CAST(i.created_at as DATE) >=\'' + searchParams?.startDate + '\' AND '
      }
      if (searchParams?.endDate && searchParams?.endDate !== '' && searchParams?.endDate !== undefined) {
        whereClause1 = whereClause1 + ' CAST(i.created_at as DATE) <= \'' + searchParams?.endDate + '\' '
      }
      if (searchParams?.startDate || searchParams?.endDate) {
        query1 = query1 + whereClause1
      } else {
        query1 = query1
      }

      let query2 = ` UNION ALL

      SELECT
      
      be_desc (oh.order_category) as intxn_category,
      be_desc (oh.order_type) as intxn_type,
      at2.tran_category_no,
      be_desc( at2.tran_category_type) as tran_category_type,
      be_desc( at2.status) as status,
      be_desc (at2.appoint_mode) as appoint_mode,
      COALESCE(be_desc(oh.order_channel),
      oh.order_channel) AS channel,
      concat(cc.first_name,' ', cc.last_name) as customer_name,
     concat(at2.appoint_end_time,' - ',
      at2.appoint_start_time) as appoint_time,
      at2.appoint_date
      FROM
          appointment_txn at2
      INNER JOIN order_hdr oh ON
          oh.order_no = at2.tran_category_no
      left join cust_customers cc on cc.customer_id  = at2.appoint_user_id
          AND at2.tran_category_type = 'ORDER'
     `

      let whereClause2 = ' WHERE  '
      if (searchParams?.startDate && searchParams?.startDate !== '' && searchParams?.startDate !== undefined) {
        whereClause2 = whereClause2 + 'CAST(oh.created_at as DATE) >=\'' + searchParams?.startDate + '\' AND '
      }
      if (searchParams?.endDate && searchParams?.endDate !== '' && searchParams?.endDate !== undefined) {
        whereClause2 = whereClause2 + ' CAST(oh.created_at as DATE) <= \'' + searchParams?.endDate + '\' '
      }
      if (searchParams?.startDate || searchParams?.endDate) {
        query2 = query2 + whereClause2
      } else {
        query2 = query2
      }
      const finalQuery = query1 + query2
      console.log('finalQuery----------Appointment--->', finalQuery)
      const response = await this.conn.sequelize.query(finalQuery, {
        type: QueryTypes.SELECT
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Appoinments Count By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }


  async getOrderAppointments(body, userId) {
    try {
      const appointments = await this.conn.AppointmentTxn.findAll({
        include: [
          {
            model: this.conn.AppointmentHdr, as: 'appointmentHdrDetails', attributes: ['appointName', 'location', 'templateId', 'appointType']
          },
          {
            model: this.conn.Customer, as: 'appointmentCustomer', attributes: ['firstName', 'lastName']
          },
          {
            model: this.conn.BusinessEntity, as: 'appoinmentModeDesc', attributes: ['description', 'code']
          },
          {
            model: this.conn.BusinessEntity, as: 'tranCategoryTypeDesc', attributes: ['description', 'code']
          },
          {
            model: this.conn.BusinessEntity, as: 'statusDesc', attributes: ['description', 'code']
          }
        ],
        where: {
          tranCategoryNo: body?.orderNo
        }
      })

      if (appointments.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No appoinments event found'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'appointment retrived',
        data: appointments
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching appointments'
      }
    }
  }
}

module.exports = AppointmentService
