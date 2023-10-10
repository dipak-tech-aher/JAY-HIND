import em from '@emitters'
import helpdeskResource from '@resources'
import { constantCode, defaultMessage, isDefined, logger, statusCodeConstants, camelCaseConversion } from '@utils'
import { isEmpty, map } from 'lodash'
import { Op, QueryTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { processFetchingHelpdeskMails, processReplyingEmail } from '@jobs/helpdesk.job'
const cron = require('node-cron')

let instance

class HelpdeskService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  // Helpdesk Dashboard services

  async projectWiseOpenHelpdesk(searchParams, departmentId, roleId, userId, conn) {
    // console.log('searchParams--------->', searchParams)
    try {
      let whereClause = {
        status: {
          [Op.not]: [constantCode.status.CLOSED, constantCode.status.CANCELLED]
        }
      }

      if (searchParams?.status && searchParams?.status?.length > 0) {
        whereClause.status = searchParams?.status?.map((ele) => ele?.value)
      }

      if (searchParams?.fromDate && searchParams?.toDate) {
        whereClause.createdAt = {
          [Op.gte]: new Date(searchParams.fromDate),
          [Op.lte]: new Date(searchParams.toDate)
          // [Op.between]: [body.startDate, body.endDate]
        }
      } else if (searchParams && searchParams?.fromDate) {
        whereClause.createdAt = searchParams?.fromDate
      } else if (searchParams && searchParams?.toDate) {
        whereClause.createdAt = searchParams?.toDate
      }

      if (searchParams?.project && searchParams?.project?.length > 0) {
        whereClause.project = searchParams?.project?.map((ele) => ele?.value)
      }

      if (searchParams?.priority && searchParams?.priority?.length > 0) {
        whereClause.priority = searchParams?.priority?.map((ele) => ele?.value)
      }

      if (searchParams?.severity && searchParams?.severity?.length > 0) {
        whereClause.severity = searchParams?.severity?.map((ele) => ele?.value)
      }

      if (searchParams?.user) {
        whereClause.currUser = searchParams?.currUser
      }
      console.log('searchParams?.filters---------->', searchParams?.filters)
      if (searchParams?.filters && Array.isArray(searchParams?.filters) && !isEmpty(searchParams?.filters)) {
        for (const record of searchParams?.filters) {
          if (record.value) {
            if (record.id === 'helpdeskNo') {
              whereClause.helpdeskNo = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('"Helpdesk".helpdesk_no'), 'varchar'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toString()}%`
                })]
              }
            } else if (record.id === 'mailId') {
              whereClause.mailId = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"Helpdesk".mail_id'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'helpdeskSourceDesc') {
              whereClause.helpdeskSource = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"Helpdesk".helpdesk_source'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'projectDesc') {
              whereClause.project = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"Helpdesk".project'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            }
          }
        }
      }

      const helpdeskDetails = await conn.Helpdesk.findAndCountAll({
        include: [
          {
            model: conn.User,
            as: 'assignedAgentDetails',
            attributes: ['firstName', 'lastName', 'userId']
          },
          {
            model: conn.BusinessUnit,
            as: 'currDeptDesc',
            attributes: ['unitId', 'unitName', 'unitDesc']
          },
          {
            model: conn.Role,
            as: 'currRoleDesc',
            attributes: ['roleId', 'roleName']
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'severityDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'projectDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'helpdeskSourceDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'priorityDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'userCategoryDesc',
            attributes: ['code', 'description']
          },
        ],
        where: whereClause,
        order: [['createdAt', 'DESC']],
        // logging: true
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'open helpdesk project wise details fetched Successfully',
        data: helpdeskDetails
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async helpdeskByType(searchParams, departmentId, roleId, userId, conn) {
    try {
      let whereClause = {}

      if (searchParams?.status && searchParams?.status?.length > 0) {
        whereClause.status = searchParams?.status?.map((ele) => ele?.value)
      }

      if (searchParams?.fromDate && searchParams?.toDate) {
        whereClause.createdAt = {
          [Op.gte]: new Date(searchParams.fromDate),
          [Op.lte]: new Date(searchParams.toDate)
          // [Op.between]: [body.startDate, body.endDate]
        }
      } else if (searchParams && searchParams?.fromDate) {
        whereClause.createdAt = searchParams?.fromDate
      } else if (searchParams && searchParams?.toDate) {
        whereClause.createdAt = searchParams?.toDate
      }

      if (searchParams?.project && searchParams?.project?.length > 0) {
        whereClause.project = searchParams?.project?.map((ele) => ele?.value)
      }

      if (searchParams?.priority && searchParams?.priority?.length > 0) {
        whereClause.priority = searchParams?.priority?.map((ele) => ele?.value)
      }

      if (searchParams?.user) {
        whereClause.currUser = searchParams?.currUser
      }

      const helpdeskDetails = await conn.Helpdesk.findAndCountAll({
        include: [
          {
            model: conn.User,
            as: 'assignedAgentDetails',
            attributes: ['firstName', 'lastName', 'userId']
          },
          {
            model: conn.BusinessUnit,
            as: 'currDeptDesc',
            attributes: ['unitId', 'unitName', 'unitDesc']
          },
          {
            model: conn.Role,
            as: 'currRoleDesc',
            attributes: ['roleId', 'roleName']
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'projectDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'helpdeskSourceDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'priorityDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'userCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'helpdeskTypeDesc',
            attributes: ['code', 'description']
          },
        ],
        where: whereClause,
        order: [['createdAt', 'DESC']],
        // logging: true
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'open helpdesk project wise details fetched Successfully',
        data: helpdeskDetails
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async agentWiseOpenHelpdesk(searchParams, departmentId, roleId, userId, conn) {
    try {
      let whereClause = {
        status: {
          [Op.not]: [constantCode.status.CLOSED, constantCode.status.CANCELLED, constantCode.status.NEW]
        }
      }
      if (searchParams?.status && searchParams?.status?.length > 0) {
        whereClause.status = searchParams?.status?.map((ele) => ele?.value)
      }

      if (searchParams?.fromDate && searchParams?.toDate) {
        whereClause.createdAt = {
          [Op.gte]: new Date(searchParams.fromDate),
          [Op.lte]: new Date(searchParams.toDate)
          // [Op.between]: [body.startDate, body.endDate]
        }
      } else if (searchParams && searchParams?.fromDate) {
        whereClause.createdAt = searchParams?.fromDate
      } else if (searchParams && searchParams?.toDate) {
        whereClause.createdAt = searchParams?.toDate
      }

      if (searchParams?.project && searchParams?.project?.length > 0) {
        whereClause.project = searchParams?.project?.map((ele) => ele?.value)
      }

      if (searchParams?.priority && searchParams?.priority?.length > 0) {
        whereClause.priority = searchParams?.priority?.map((ele) => ele?.value)
      }

      if (searchParams?.severity && searchParams?.severity?.length > 0) {
        whereClause.severity = searchParams?.severity?.map((ele) => ele?.value)
      }

      const helpdeskDetails = await conn.Helpdesk.findAndCountAll({
        include: [
          {
            model: conn.User,
            as: 'assignedAgentDetails',
            attributes: ['firstName', 'lastName', 'userId']
          },
          {
            model: conn.BusinessUnit,
            as: 'currDeptDesc',
            attributes: ['unitId', 'unitName', 'unitDesc']
          },
          {
            model: conn.Role,
            as: 'currRoleDesc',
            attributes: ['roleId', 'roleName']
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'severityDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'projectDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'helpdeskSourceDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'priorityDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'userCategoryDesc',
            attributes: ['code', 'description']
          },
        ],
        where: whereClause,
        order: [['createdAt', 'DESC']]
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'open helpdesk agent wise details fetched Successfully',
        data: helpdeskDetails
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async openHelpdeskByAging(searchParams, departmentId, roleId, userId, conn) {
    try {
      let whereClause = ` h.status not in ('${constantCode.status.CLOSED}','${constantCode.status.CANCELLED}') `
      if (searchParams?.project) {
        whereClause += `and h.project='${searchParams?.project}' `
      }

      if (searchParams?.priority) {
        whereClause += `and h.priority='${searchParams?.priority}' `

      }
      if (searchParams?.user) {
        whereClause += `and h.currUser='${searchParams?.currUser}' `
      }

      const detailsSql = `SELECT
          CASE
          WHEN AGE(h.created_at) <= interval '3 days' THEN '0 - 3 days'
          WHEN AGE(h.created_at) <= interval '7 days' THEN '4 - 7 days'
          WHEN AGE(h.created_at) <= interval '10 days' THEN '8 - 10 days'
          ELSE '> 10 days'
        END as aging_category,
        *,
        be_desc(h.priority) as priorityDesc,
         be_desc(h.status) as statusDesc,
         be_desc(h.helpdesk_source) as helpdeskSourceDesc,
         be_desc(h.helpdesk_type) as helpdeskTypeDesc,
         be_desc(h.user_category) as userCategoryDesc,
         be_desc(h.project) as projectDesc,
         be_desc(h.severity) as severityDesc,
         user_name(h.curr_user) as current_user
      FROM helpdesk h
        WHERE ${whereClause}
        GROUP BY aging_category,helpdesk_id`

      let responseData = await conn.sequelize.query(detailsSql, {
        type: QueryTypes.SELECT,
        // logging: true
      })
      responseData = camelCaseConversion(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async helpdeskByStatus(searchParams, departmentId, roleId, userId, conn) {
    try {
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId?.length ? searchParams?.userId.map(x => x.value) : null

      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date

      const i_status = searchParams?.status ? Array.isArray(searchParams?.status) ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : `array['${searchParams?.status}']::text[]` : 'array[]::text[]' // character varying

      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]'

      const i_severity = searchParams?.severity ? `array[${searchParams?.severity.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]'

      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_helpdesk_type = searchParams?.helpdeskType ? `array['${searchParams?.helpdeskType}']::text[]` : 'array[]::text[]' // character varying


      const countsSql = `select * from dtworks_helpdesk_by_status_fn(
        ${i_entity_id},
        ${i_role_id},
        ${i_user_id},
        ${i_from_date},
        ${i_to_date},
        ${i_status},
        ${i_channel},
        ${i_severity},
        ${i_project},
        ${i_helpdesk_type},
        ${i_intxn_type},
        ${i_intxn_category},
        ${i_service_type},
        ${i_service_category},
        '${searchParams?.type}')`

      let responseData = await conn.sequelize.query(countsSql, {
        type: QueryTypes.SELECT,
        // logging: true
      })
      responseData = camelCaseConversion(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async helpdeskBySeverity(searchParams, departmentId, roleId, userId, conn) {
    try {

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_severity_str = searchParams?.i_severity_str ? `'${searchParams?.i_severity_str}'` : null // character varying
      const i_category = searchParams?.category ?? null // integer
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId?.length ? searchParams?.userId.map(x => x.value) : null

      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date

      const i_status = searchParams?.status?.length > 0 ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]'

      const i_severity = searchParams?.severity ? `array[${searchParams?.severity.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]'

      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_helpdesk_type = searchParams?.helpdeskType ? `array['${searchParams?.helpdeskType}']::text[]` : 'array[]::text[]' // character varying


      const countsSql = `select * from dtworks_helpdesk_by_severity_fn(
        ${i_entity_id},
        ${i_role_id},
        ${i_user_id},
        ${i_from_date},
        ${i_to_date},
        ${i_status},
        ${i_channel},
        ${i_severity},
        ${i_project},
        ${i_helpdesk_type},
        ${i_intxn_type},
        ${i_intxn_category},
        ${i_service_type},
        ${i_service_category},
        '${searchParams?.type}',${i_severity_str})`

      console.log('severity countsSql--xxx------>', countsSql)


      let responseData = await conn.sequelize.query(countsSql, {
        type: QueryTypes.SELECT,
        // logging: true
      })

      responseData = camelCaseConversion(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'severity details Fetched succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async tktPendingWith(searchParams, departmentId, roleId, userId, conn) {
    console.log('searchParams--------->', searchParams)
    try {
      let whereClause = {
        status: {
          [Op.not]: [constantCode.status.CLOSED, constantCode.status.CANCELLED, constantCode?.status?.HOLD]
        }
      }

      if (searchParams?.status && searchParams?.status?.length > 0) {
        whereClause.status = searchParams?.status?.map((ele) => ele?.value)
      }

      if (searchParams?.fromDate && searchParams?.toDate) {
        whereClause.createdAt = {
          [Op.gte]: new Date(searchParams.fromDate),
          [Op.lte]: new Date(searchParams.toDate)
          // [Op.between]: [body.startDate, body.endDate]
        }
      } else if (searchParams && searchParams?.fromDate) {
        whereClause.createdAt = searchParams?.fromDate
      } else if (searchParams && searchParams?.toDate) {
        whereClause.createdAt = searchParams?.toDate
      }

      if (searchParams?.project && searchParams?.project?.length > 0) {
        whereClause.project = searchParams?.project?.map((ele) => ele?.value)
      }

      if (searchParams?.priority && searchParams?.priority?.length > 0) {
        whereClause.priority = searchParams?.priority?.map((ele) => ele?.value)
      }

      if (searchParams?.user) {
        whereClause.currUser = searchParams?.currUser
      }


      if (searchParams?.severity && searchParams?.severity?.length > 0) {
        whereClause.severity = searchParams?.severity?.map((ele) => ele?.value)
      }

      const helpdeskDetails = await conn.Helpdesk.findAndCountAll({
        include: [
          {
            model: conn.User,
            as: 'assignedAgentDetails',
            attributes: ['firstName', 'lastName', 'userId']
          },
          {
            model: conn.BusinessUnit,
            as: 'currDeptDesc',
            attributes: ['unitId', 'unitName', 'unitDesc']
          },
          {
            model: conn.Role,
            as: 'currRoleDesc',
            attributes: ['roleId', 'roleName']
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'projectDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'helpdeskSourceDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'priorityDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'severityDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'userCategoryDesc',
            attributes: ['code', 'description']
          },
        ],
        where: whereClause,
        order: [['createdAt', 'DESC']]
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'open helpdesk project wise details fetched Successfully',
        data: helpdeskDetails
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async monthlyTrend(searchParams, departmentId, roleId, userId, conn) {
    try {
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_category = searchParams?.category ?? null // integer
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId?.length ? searchParams?.userId.map(x => x.value) : null

      const i_status = searchParams?.status?.length > 0 ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]'

      const i_severity = searchParams?.severity ? `array[${searchParams?.severity.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]'

      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_helpdesk_type = searchParams?.helpdeskType ? `array['${searchParams?.helpdeskType}']::text[]` : 'array[]::text[]' // character varying

      const countsSql = `select * from dtworks_helpdesk_month_daily_trends_fn (${i_entity_id},${i_role_id},${i_user_id},'${searchParams?.startDate}','${searchParams?.endDate}',${i_status},${i_channel},${i_severity},${i_project},${i_helpdesk_type},${i_intxn_type},${i_intxn_category},${i_service_type},${i_service_category},${i_category})`

      let responseData = await conn.sequelize.query(countsSql, {
        type: QueryTypes.SELECT,
        // logging: true
      })
      responseData = camelCaseConversion(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched Monthly trend succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async hourlyTickets(searchParams, departmentId, roleId, userId, conn) {
    try {

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_category = searchParams?.category ?? null // integer
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId?.length ? searchParams?.userId.map(x => x.value) : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date

      const i_status = searchParams?.status?.length > 0 ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_intxn_cat = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]'

      const i_severity = searchParams?.severity ? `array[${searchParams?.severity.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]'

      const i_helpdesk_type = searchParams?.helpdeskType ? `array['${searchParams?.helpdeskType}']::text[]` : 'array[]::text[]' // character varying

      const countsSql = `select * from dtworks_helpdesk_today_tickets_fn(
        ${i_entity_id},${i_role_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_channel},${i_severity},${i_project},${i_helpdesk_type},${i_intxn_type},${i_intxn_cat},${i_service_type},${i_service_category},${i_category})`

      let responseData = await conn.sequelize.query(countsSql, {
        type: QueryTypes.SELECT,
        // logging: true
      })
      responseData = camelCaseConversion(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async summary(searchParams, departmentId, roleId, userId, conn) {
    try {
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId?.length ? searchParams?.userId.map(x => x.value) : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_helpdesk_type = searchParams?.helpdeskType ? `array['${searchParams?.helpdeskType}']::text[]` : 'array[]::text[]' // character varying
      const i_status = searchParams?.status?.length > 0 ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_cat = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]'
      const i_severity = searchParams?.severity ? `array[${searchParams?.severity.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]'

      const countsSql = `select * from dtworks_helpdesk_summary_fn(
        ${i_entity_id},
        ${i_role_id},
        ${i_user_id},
        ${i_from_date},
        ${i_to_date},
        ${i_status},
        ${i_channel},
        ${i_severity},
        ${i_project},
        ${i_helpdesk_type},
        ${i_intxn_type},
        ${i_intxn_cat},
        ${i_service_type},
        ${i_service_cat},
        '${searchParams?.type}')`

      let responseData = await conn.sequelize.query(countsSql, {
        type: QueryTypes.SELECT,
        // logging: true
      })
      responseData = camelCaseConversion(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  /** Create Helpdesk Ticket
   * @param {object} helpdeskData
   * @param {string} departmentId
   * @param {number} roleId
   * @param {number} userId
   * @param {instance} conn
   * @param {transaction} t
   * @returns
   */
  async createHelpDeskTicket(helpdeskData, departmentId, roleId, userId, conn, t) {
    try {
      if (!helpdeskData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const commonAttrib = {
        helpdeskUuid: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId,
        tranId: uuidv4()
      }

      const helpdesk = {
        ...helpdeskData,
        helpdeskSource: helpdeskData.helpdeskSource,
        helpdeskContent: helpdeskData.content,
        status: constantCode.status.NEW,
        ...commonAttrib
      }

      const response = await conn.Helpdesk.create(helpdesk, { transaction: t })
      if (response) {
        const helpdeskTxnData = {
          ...helpdeskData,
          statusChngDate: new Date(),
          helpdeskTxnUuid: uuidv4(),
          helpdeskId: response.helpdeskId,
          helpdeskContent: helpdeskData.content,
          helpdeskActionRemark: constantCode.helpdesk.CREATED,
          ...commonAttrib
        }
        await conn.HelpdeskTxn.create(helpdeskTxnData, { transaction: t })
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Helpdesk Ticket created successfully with helpdesk ID - ${response.helpdeskId}`,
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method for update helpdesk Ticket
   * @param {object} helpdeskData
   * @param {string} helpdeskData.status
   * @param {string} departmentId
   * @param {number} roleId
   * @param {number} userId
   * @param {number} helpdeskId
   * @param {instance} conn
   * @returns
   */
  async updateHelpdeskTicket(helpdeskData, departmentId, roleId, userId, helpdeskId, conn, t) {
    try {
      const { status, project } = helpdeskData
      if (!helpdeskId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const helpdeskDetails = await conn.Helpdesk.findOne({
        where: { helpdeskId }
      })
      if (!helpdeskDetails) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Helpdesk number is not found'
        }
      }

      if (helpdeskDetails?.project != null) {
        logger.debug('Project already assigned ')
      }

      if (helpdeskDetails?.currUser !== userId) {
        return {
          status: statusCodeConstants.UN_PROCESSIBLE_ENTITY,
          message: `Helpdesk Ticket ${helpdeskId} is not assigned to you`
        }
      }

      if (helpdeskDetails?.status === constantCode.status.CLOSED) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `Helpdesk Ticket ${helpdeskId} is already in closed status`
        }
      }

      if (!helpdeskDetails?.contactId && !helpdeskData?.contactId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Please provide the profile details'
        }
      }

      if (helpdeskData?.contactId) {
        const checkExistingContactDetails = await conn.Contact.findOne({
          attributes: ['contactId', 'contactNo', 'contactCategory', 'contactCategoryValue', 'status'],
          where: {
            contactId: helpdeskData?.contactId,
            status: constantCode.status.ACTIVE
          }
        })

        if (isEmpty(checkExistingContactDetails)) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Provided Profile details not exist in system'
          }
        }
      }

      console.log("helpdeskData ==> ", helpdeskData)
      const helpdeskUpdateData = {
        helpdeskType: helpdeskData?.helpdeskType || helpdeskDetails.helpdeskType,
        severity: helpdeskData?.severity || helpdeskDetails.severity,
        status,
        contactId: helpdeskData?.contactId || helpdeskDetails.contactId,
        statusChngDate: new Date(),
        updatedBy: userId,
        cancelReason: helpdeskData?.cancelReason || '',
        project,
        pendingWith: helpdeskData?.pending,
        complitionDate: helpdeskData?.complitionDate
      }
      console.log("helpdeskUpdateData ==> ", helpdeskUpdateData)

      const response = await conn.Helpdesk.update(helpdeskUpdateData, {
        where: { helpdeskId },
        transaction: t
      })

      if (response) {
        const helpdeskTxn = {
          helpdeskId: helpdeskDetails.helpdeskId,
          status,
          helpdeskTxnUuid: uuidv4(),
          helpdeskActionRemark: constantCode.helpdesk.UPDATE_RECORD,
          statusChngDate: new Date(),
          cancelReason: helpdeskData?.cancelReason || null,
          currUser: userId,
          createdDeptId: departmentId,
          createdRoleId: roleId,
          createdBy: userId,
          updatedBy: userId,
          tranId: uuidv4()
        }

        await conn.HelpdeskTxn.create(helpdeskTxn, { transaction: t })
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Helpdesk Ticket updated successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method for Helpdesk List
   * @param {object} helpdeskData
   * @param {integer} userId
   * @param {instance} conn
   * @returns
   */
  async getHelpdeskList(helpdeskData, deptId, userId, conn) {
    try {
      let limit
      let page
      let offSet
      if (!helpdeskData?.excel) {
        limit = helpdeskData?.limit || constantCode.common.lIMIT
        page = helpdeskData?.page || constantCode.common.PAGE
        offSet = (page * limit)
      }

      let whereClause = {}
      const profileClause = {}
      const customerClause = {}
      let contactClause = {}
      let customerIds = []

      if (helpdeskData && helpdeskData?.userCategoryValue) {
        whereClause.userCategoryValue = helpdeskData?.userCategoryValue
      }

      if (helpdeskData && helpdeskData?.helpdeskId) {
        whereClause.helpdeskId = helpdeskData?.helpdeskId
      }

      if (helpdeskData && helpdeskData?.helpdeskNo) {
        whereClause.helpdeskNo = helpdeskData?.helpdeskNo
      }

      if (helpdeskData && helpdeskData?.helpdeskSource && helpdeskData?.helpdeskSource !== 'ALL') {
        whereClause.helpdeskSource = helpdeskData.helpdeskSource
      }
      console.log('helpdeskData?.from-------->', helpdeskData?.from)
      console.log('helpdeskData?.tktWithLoggedIn-------->', helpdeskData?.tktWithLoggedIn)
      console.log('helpdeskData?.assigned-------->', helpdeskData?.assigned);

      if (helpdeskData?.from === "DASHBOARD") {
        console.log('im inside if-----------')

        if (helpdeskData?.tktWithLoggedIn) {
          if (helpdeskData && helpdeskData?.assigned) {
            whereClause.currUser = userId
            whereClause.status = { [Op.or]: [constantCode.status.WIP, constantCode.status.HOLD, constantCode.status.ASSIGNED] }
          }
        }

      } else {
        console.log('im inside else-----------')
        if (helpdeskData && helpdeskData?.assigned) {
          whereClause.currUser = userId
          whereClause.status = { [Op.or]: [constantCode.status.WIP, constantCode.status.HOLD, constantCode.status.ASSIGNED] }
        } else if (helpdeskData && helpdeskData?.assigned === false) {
          whereClause.status = constantCode.status.NEW
        }
      }


      if (helpdeskData.project && helpdeskData.project !== '') {
        whereClause.project = helpdeskData.project
      }

      if (helpdeskData && helpdeskData?.mailId) {
        // contactClause = {
        //   ...contactClause,
        //   emailId: helpdeskData.mailId
        // }
        whereClause.mailId = helpdeskData.mailId
      }

      if (helpdeskData && helpdeskData?.phoneNo) {
        contactClause = {
          ...contactClause,
          mobileNo: helpdeskData.phoneNo
        }
        // whereClause.phoneNo = helpdeskData.phoneNo
      }

      if (helpdeskData && helpdeskData?.profileNo) {
        whereClause = {
          ...whereClause,
          userCategoryValue: helpdeskData?.profileNo
        }
      }

      /**
       ** Helpdesk Date Filter based on created Date
       */
      if (helpdeskData && helpdeskData?.startDate && helpdeskData && helpdeskData?.endDate) {
        whereClause = {
          ...whereClause,
          [Op.and]: [
            [conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('Helpdesk.created_at')), '>=', helpdeskData.startDate)],
            [conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('Helpdesk.created_at')), '<=', helpdeskData.endDate)]
          ]
        }
      } else if (helpdeskData && helpdeskData?.startDate) {
        whereClause = {
          ...whereClause,
          createdAt: conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('Helpdesk.created_at')), '>=', helpdeskData.startDate)
        }
      } else if (helpdeskData && helpdeskData?.endDate) {
        whereClause = {
          ...whereClause,
          createdAt: conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('Helpdesk.created_at')), '<=', helpdeskData.endDate)
        }
      }

      if (helpdeskData && helpdeskData?.profileId) {
        profileClause.profileId = helpdeskData?.profileId
        customerClause.customerId = helpdeskData?.profileId
      }

      if (helpdeskData && helpdeskData?.profileName) {
        whereClause = {
          ...whereClause,
          [Op.or]: [
            {
              userName: { [Op.iLike]: `%${helpdeskData?.profileName}%` }
            }
          ]
        }
        // profileClause = {
        //   ...profileClause,
        //   [Op.or]: [
        //     {
        //       firstName: { [Op.iLike]: `%${helpdeskData?.profileName}%` }
        //     },
        //     {
        //       lastName: { [Op.iLike]: `%${helpdeskData?.profileName}%` }
        //     }
        //   ]
        // }

        // customerClause = {
        //   ...customerClause,
        //   [Op.or]: [
        //     {
        //       firstName: { [Op.iLike]: `%${helpdeskData?.profileName}%` }

        //     }, {
        //       lastName: { [Op.iLike]: `%${helpdeskData?.profileName}%` }

        //     }
        //   ]
        // }
      }

      if (helpdeskData?.project?.length > 0 && !helpdeskData?.project?.includes(constantCode.common.ALL) && helpdeskData?.contain?.includes(constantCode.entityCategory.CUSTOMER)) {
        const list = []
        for (const p of helpdeskData?.project) {
          const custResponse = await conn.sequelize.query(`select customer_id from cust_customers c where project_mapping @> '[{"project": ["${p}"], "entity": "${deptId}"}]'`, {
            type: QueryTypes.SELECT,
            // logging: true
          })
          list.push(...custResponse)
        }
        customerIds = [...new Set(map(list, 'customer_id'))]
        customerClause.customerId = customerIds
      }

      let orderBy = ['helpdeskId', 'DESC']
      if (helpdeskData && helpdeskData?.sort && helpdeskData?.sort !== 'NEW') {
        orderBy = ['helpdeskId', 'ASC']
      }

      const include = [{
        model: conn.HelpdeskTxn,
        as: 'txnDetails',
        where: {
          helpdeskActionRemark: [constantCode.helpdesk.CREATED, constantCode.helpdesk.FOLLOW_UP, constantCode.helpdesk.REPLY]
        },
        // limit: 10,
        // offSet: 0,
        order: [['helpdeskTxnId', 'ASC']]
      }]

      // # Customer Included in Model
      if (helpdeskData && helpdeskData?.contain && helpdeskData?.contain.length > 0 && helpdeskData.contain.includes(constantCode.entityCategory.CUSTOMER)) {
        const customerModule = {
          model: conn.Contact,
          as: 'contactDetails',
          required: !isEmpty(contactClause),
          attributes: {
            exclude: ['createdRoleId', 'createdDeptId', 'secondaryContactNo', 'secondaryEmail', 'telegramId',
              'instagramId', 'facebookId', 'fax', 'whatsappNo', 'whatsappNoPrefix', 'telephoneNo', 'telephonePrefix']
          },
          where: { ...contactClause },
          distinct: true,
          include: [
            {
              model: conn.Customer,
              as: 'customerDetails',
              attributes: {
                exclude: ['birthDate', 'customerClass', 'customerMaritalStatus', 'occupation', 'nationality', 'customerPhoto', 'taxNo']
              },
              required: false,
              distinct: true,
              where: { ...customerClause },
              include: [
                {
                  model: conn.Interaction,
                  as: 'customerIntxnDtls',
                  attributes: {
                    exclude: ['createdRoleId', 'createdDeptId', 'tranId', 'slaLastAlertDate', 'slaCode', 'intxnRefNo', 'intxnMode', 'intxnFamily', 'childIntxn', 'chatId']
                  },
                  required: false,
                  distinct: true,
                  where: {
                    helpdeskId: {
                      [Op.not]: null
                    }
                  }
                }
              ]
            }, {
              model: conn.Profile,
              as: 'profileDetails',
              required: false,
              distinct: true,
              where: { ...profileClause },
              include: [
                {
                  model: conn.Interaction,
                  as: 'profileIntxnDtls',
                  required: false,
                  distinct: true,
                  where: {
                    helpdeskId: {
                      [Op.not]: null
                    }
                  }
                }
              ]
            }
          ]
        }
        include.push(customerModule)
      }
      console.log('whereClause-------->', whereClause)
      const response = await conn.Helpdesk.findAndCountAll({
        include,
        where: { ...whereClause },
        distinct: true,
        offset: !helpdeskData?.excel ? Number(offSet) : null,
        limit: !helpdeskData?.excel ? Number(limit) : null,
        order: [orderBy],
        // logging: true
      })

      if (response?.rows?.length === 0) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Helpdesk ticket details not found'
        }
      }

      /** Not added status because of old helpdesk ticket */
      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          // codeType: ['TICKET_CHANNEL', 'GENDER', 'ID_TYPE', 'STATUS',
          //   'INTXN_CATEGORY', 'INTERACTION_STATUS', 'INTXN_FAMILY',
          //   'CONTACT_PREFERENCE', 'INTXN_STATUS_REASON', 'PRIORITY', 'INTXN_TYPE',
          //   'SERVICE_TYPE', 'INTXN_STATEMENT', 'INTXN_FLOW', 'SERVICE_CATEGORY', 'INTXN_CAUSE', 'CUSTOMER_CATEGORY', 'SERVICE_STATUS',
          //   'PROJECT', 'HELPDESK_STATUS'
          // ]
          status: constantCode.status.ACTIVE
        }
      })

      const data = {
        count: response.count, rows: helpdeskResource.transformHelpdeskSearch(response.rows, businessEntityInfo)
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Helpdesk ticket fetched successfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method for Assign helpdesk Ticket
   * @param {object} helpdeskData
   * @param {string} helpdeskData.status
   * @param {string} departmentId
   * @param {number} roleId
   * @param {number} userId
   * @param {number} helpdeskId
   * @param {instance} conn
   * @returns
   */
  async assignHelpdeskTicket(helpdeskData, departmentId, roleId, userId, helpdeskId, conn, t) {
    try {
      const { status } = helpdeskData
      if (!helpdeskId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const helpdeskDetails = await conn.Helpdesk.findOne({
        where: { helpdeskId }
      })
      if (!helpdeskDetails) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Helpdesk id not found'
        }
      }

      if (helpdeskDetails?.currUser === userId) {
        return {
          status: statusCodeConstants.UN_PROCESSIBLE_ENTITY,
          message: 'Helpdesk Ticket already assigned to your inbox'
        }
      } else if (isDefined(helpdeskDetails?.currUser)) {
        return {
          status: statusCodeConstants.UN_PROCESSIBLE_ENTITY,
          message: 'Helpdesk Ticket already assigned to another user'
        }
      }

      if (helpdeskDetails.status === constantCode.status.CLOSED) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `Helpdesk Ticket ${helpdeskId} is already in closed status`
        }
      }

      const updateData = {
        helpdeskType: helpdeskData?.helpdeskType || helpdeskDetails.helpdeskType,
        severity: helpdeskData?.severity || helpdeskDetails.severity,
        status,
        selfassignedAt: new Date(),
        statusChngDate: new Date(),
        currUser: userId,
        updatedBy: userId,
        tranId: uuidv4()
      }
      const response = await conn.Helpdesk.update(updateData,
        {
          where: { helpdeskId, currUser: null },
          transaction: t
        })

      if (response) {
        const helpdeskTxn = {
          helpdeskId: helpdeskDetails.helpdeskId,
          status,
          helpdeskTxnUuid: uuidv4(),
          helpdeskActionRemark: constantCode.helpdesk.SELF_ASSIGNED,
          statusChngDate: new Date(),
          currUser: userId,
          tranId: uuidv4(),
          createdDeptId: departmentId,
          createdRoleId: roleId,
          createdBy: userId,
          updatedBy: userId
        }

        await conn.HelpdeskTxn.create(helpdeskTxn, { transaction: t })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Helpdesk Ticket assigned successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Get Count based on Helpdesk Source
   * @param {object} helpdeskData
   * @param {integer} userId
   * @param {instance} conn
   * @returns
   */
  async countBySource(helpdeskData, userId, conn) {
    try {
      const { helpdeskSource, assign } = helpdeskData

      const whereClause = {}

      if (isDefined(helpdeskSource) && helpdeskSource !== constantCode.common.ALL) {
        whereClause.helpdeskSource = helpdeskSource
      }

      if (helpdeskData.startDate && helpdeskData.endDate) {
        whereClause.createdAt = {
          [Op.gte]: new Date(helpdeskData.startDate),
          [Op.lte]: new Date(helpdeskData.endDate)
          // [Op.between]: [body.startDate, body.endDate]
        }
      }

      if (assign === constantCode.status.ASSIGNED) {
        whereClause.currUser = userId
        whereClause.status = { [Op.or]: [constantCode.status.WIP, constantCode.status.HOLD] }
      } else if (assign === constantCode.status.NEW) {
        whereClause.status = constantCode.status.NEW
      } else if (assign === constantCode.status.CLOSED) {
        whereClause.status = constantCode.status.CLOSED
      } else if (assign === constantCode.common.AVAILABLE) {
        whereClause.status = { [Op.notIn]: [constantCode.status.CLOSED, constantCode.status.CLOSED] }
      }

      // const counts = await conn.Helpdesk.findAll({
      //   attributes: ['helpdeskSource', [conn.sequelize.fn('COUNT', 'helpdeskSource'), 'count']],
      //   where: { ...whereClause },
      //   distinct: true,
      //   group: ['helpdeskSource']
      // })
      const counts = await conn.Helpdesk.findAll({
        attributes: ['helpdeskSource', 'helpdeskId'],
        include: [
          {
            model: conn.Contact,
            as: 'contactDetails',
            attributes: ['contactNo', 'emailId', 'contactId'],
            include: [{
              model: conn.Customer,
              as: 'customerDetails',
              attributes: ['projectMapping']
            }]
          }
        ],
        raw: true,
        nest: true,
        where: whereClause,
        // logging: true
      })

      let helpdeskList = []
      if (helpdeskData.project && helpdeskData.project.length > 0 && counts.length > 0) {
        if (helpdeskData.project.includes(constantCode.common.ALL)) {
          helpdeskList = counts || []
        } else {
          counts.filter((f) => {
            let found = false
            helpdeskData?.project.map((p) => {
              if (f?.contactDetails?.[0]?.customerDetails?.[0]?.project && f?.contactDetails?.[0]?.customerDetails?.[0]?.project.length > 0) {
                const currDeptProj = f.contactDetails?.[0]?.customerDetails[0]?.project.find((f) => f.entity === helpdeskData.departmentId)?.project || []
                if (currDeptProj.includes(p)) {
                  found = true
                }
              }
              return found
            })

            if (found) {
              helpdeskList.push(f)
            }
            return found
          })
        }
      }
      const unique = [...new Map(helpdeskList.map((m) => [m.helpdeskId, m])).values()]
      const sources = []
      const response = []
      for (const c of unique) {
        sources.push(c.helpdeskSource)
      }

      const ex = []

      sources.forEach((ele) => {
        if (!ex.includes(ele)) {
          const totalEmail = unique.filter((f) => f.helpdeskSource === ele)
          ex.push(ele)
          response.push({
            source: ele,
            count: totalEmail.length
          })
        }
      })

      // if (!sources.includes('CHNL004')) {
      //   response.push({
      //     source: 'CHNL004',
      //     counts: 0
      //   })
      // } else {
      //   const totalEmail = unique.filter((f) => f.helpdeskSource === 'CHNL004')

      //   response.push({
      //     source: 'CHNL004',
      //     count: totalEmail.length
      //   })
      // }

      if (isEmpty(response)) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Helpdesk ticket details not found'
        }
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          codeType: 'TICKET_CHANNEL',
          status: constantCode.status.ACTIVE
        }
      })

      if (!businessEntityInfo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Helpdesk Channel Description not found'
        }
      }

      const data = helpdeskResource.transformHelpdeskCount(response, businessEntityInfo) || null

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Helpdesk ticket count based on source fetched successfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Method for reply helpdesk Ticket
   * @param {object} helpdeskData
   * @param {string} departmentId
   * @param {number} roleId
   * @param {number} userId
   * @param {instance} conn
   * @returns
   */
  async replyHelpdeskTicket(helpdeskData, departmentId, roleId, userId, conn, t) {
    try {
      const { helpdeskId, project } = helpdeskData
      if (!helpdeskId) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: 'Please provide Helpdesk Id'
        }
      }
      let payload = {}

      if (helpdeskData?.toCustomer === true) {
        payload = {
          customer: {
            status: constantCode.common.NO
          }
        }
      }
      if (helpdeskData?.toCustomer === false) {
        if (helpdeskData && helpdeskData.payload && helpdeskData.payload.length > 0) {
          payload.internal = {
            users: [],
            status: constantCode.common.NO
          }
          for (const x of helpdeskData.payload) {
            payload.internal.users.push(x)
          }
        }
      }

      // if (!helpdeskData.helpdeskId && !helpdeskData.chatId) {
      //   return {
      //     status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
      //     message: 'Helpdesk or chat id missing'
      //   }
      // }

      let helpdeskDetails = await conn.Helpdesk.findOne({
        include: [
          {
            model: conn.HelpdeskTxn,
            as: 'txnDetails'
          }
        ],
        where: { helpdeskId }
      })
      helpdeskDetails = helpdeskDetails?.dataValues ? helpdeskDetails.dataValues : helpdeskDetails

      if (isEmpty(helpdeskDetails)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `Helpdesk details for ${helpdeskId} not found`
        }
      }

      if (helpdeskDetails.status === constantCode.status.CLOSED) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `Helpdesk Ticket ${helpdeskId} is already in closed status`
        }
      }

      if (!helpdeskDetails?.contactId && !helpdeskData?.contactId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Please provide the profile details'
        }
      }

      if (helpdeskData?.contactId) {
        const checkExistingContactDetails = await conn.Contact.findOne({
          attributes: ['contactId', 'contactNo', 'contactCategory', 'contactCategoryValue', 'status'],
          where: {
            contactId: helpdeskData?.contactId,
            status: constantCode.status.ACTIVE
          }
        })

        if (isEmpty(checkExistingContactDetails)) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'Provided Profile details not exist in system'
          }
        }
      }

      if (helpdeskData.content === '<p><br></p>' || !isDefined(helpdeskData.content)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'A reply to customer is mandatory with some content'
        }
      }

      const tranId = uuidv4()

      const updateData = {
        helpdeskType: helpdeskData?.helpdeskType || helpdeskDetails.helpdeskType,
        severity: helpdeskData?.severity || helpdeskDetails.severity,
        status: helpdeskData.status,
        cancelReason: helpdeskData?.cancelReason || '',
        project,
        pendingWith: helpdeskData?.pending,
        complitionDate: helpdeskData?.complitionDate
      }

      await conn.Helpdesk.update(updateData,
        {
          where: { helpdeskId },
          transaction: t
        })

      const data = {
        helpdeskId: helpdeskDetails.helpdeskId,
        helpdeskTxnUuid: uuidv4(),
        helpdeskContent: helpdeskData.content,
        status: helpdeskData.status,
        statusChngDate: new Date(),
        currUser: userId,
        payload,
        cancelReason: helpdeskData?.cancelReason || '',
        createdDeptId: departmentId,
        createdRoleId: roleId,
        helpdeskActionRemark: constantCode.helpdesk.REPLY,
        createdBy: userId,
        updatedBy: userId,
        tranId
        // referenceId: helpdeskDetails.referenceId
      }
      const response = await conn.HelpdeskTxn.create(data, { transaction: t })

      if (helpdeskData?.attachments?.length > 0) {
        for (const entityId of helpdeskData.attachments) {
          await findAndUpdateAttachment(entityId, response.helpdeskTxnId, helpdeskData.entityType, conn, t)
        }
      }

      const notificationData = {
        name: helpdeskDetails?.userName,
        mailId: helpdeskDetails?.mailId,
        notifiationSource: helpdeskDetails.helpdeskSource,
        referenceId: helpdeskDetails.helpdeskId,
        referenceSubId: response.helpdeskTxnId,
        helpdeskContent: helpdeskData.status === constantCode.status.CLOSED ? null : { content: helpdeskData?.content, subject: helpdeskDetails?.helpdeskSubject },
        customerId: null,
        departmentId: null,
        roleId: null,
        userId,
        channel: 'WEB',
        type: helpdeskData.status === constantCode.status.CLOSED ? 'CLOSE-HELPDESK' : 'REPLY-HELPDESK',
        createdDeptmentId: departmentId,
        createdRoleId: roleId,
        tranId
      }

      if (helpdeskData.status === constantCode.status.CLOSED) {
        /** Send Helpdesk Close Notification */
        em.emit('SEND_HELPDESK_NOTIFICATION', notificationData)
      } else {
        logger.debug('calling send helpesk reply')
        em.emit('SEND_HELPDESK_REPLY', notificationData)
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully replied'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** to start Helpdesk Job
   * @param {object} helpdeskData
   * @returns
   */
  async helpdeskJob(helpdeskData) {
    try {
      if (isEmpty(helpdeskData)) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: 'Please provide state'
        }
      }

      const { state } = helpdeskData
      if (state === 'start') {
        helpdeskMailBox.start()
        ReplyingEmail.start()
      } else if (state === 'stop') {
        helpdeskMailBox.stop()
        ReplyingEmail.stop()
      }

      console.log(`Helpdesk Job ${state === 'start' ? 'started' : 'stopped'}`);

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Helpdesk Job ${state === 'start' ? 'started' : 'stopped'}`
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** Get Profile details based on contact
   * @param {object} helpdeskData
   * @param {number} userId
   * @param {instance} conn
   * @returns
   */
  async getprofileContact(helpdeskData, userId, conn) {
    try {
      if (isEmpty(helpdeskData)) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: 'Please provide email or phone number'
        }
      }

      const { searchParam } = helpdeskData
      let whereClause = {}
      if (Number(searchParam)) {
        whereClause = {
          ...whereClause,
          mobileNo: searchParam
        }
      } else {
        whereClause = {
          ...whereClause,
          // emailId: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email_id')), '=', searchParam.toLowerCase())
          emailId: { [Op.iLike]: `%${searchParam}%` }
        }
      }

      const contactDetails = await conn.Contact.findOne({
        attributes: ['contactId', 'contactNo', 'contactCategory', 'contactCategoryValue', 'status'],
        where: {
          ...whereClause,
          status: constantCode.status.ACTIVE
        },
        order: [['contactId', 'DESC']]
      })

      let response
      if (contactDetails && contactDetails?.contactCategory === constantCode.entityCategory.PROFILE) {
        response = await conn.Contact.findOne({
          //   attributes: ['contactId', 'contactNo', 'contactCategory', 'contactCategoryValue', 'status'],
          include: [
            {
              model: conn.Profile,
              as: 'profileDetails'
            }
          ],
          where: {
            ...whereClause,
            contactCategory: constantCode.entityCategory.PROFILE
          },
          order: [['contactId', 'DESC']]
        })
      } else {
        response = await conn.Contact.findOne({
          //  attributes: ['contactId', 'contactNo', 'contactCategory', 'contactCategoryValue', 'status'],
          include: [
            {
              model: conn.Customer,
              as: 'customerDetails'
            }
          ],
          where: {
            ...whereClause,
            contactCategory: constantCode.entityCategory.CUSTOMER
          },
          order: [['contactId', 'DESC']]
        })
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        // where: {
        //   codeType: ['TICKET_CHANNEL', 'GENDER', 'ID_TYPE', 'STATUS',
        //     'INTERACTION_STATUS', 'CONTACT_PREFERENCE', 'INTXN_STATUS_REASON', 'PRIORITY',
        //     'SERVICE_TYPE', 'INTXN_STATEMENT', 'SERVICE_CATEGORY', 'CUSTOMER_CATEGORY']
        // }
        status: constantCode.status.ACTIVE
      })

      const data = helpdeskResource.getProfileContact(response, businessEntityInfo)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Profile details fetched Successfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async mapHelpdeskCustomer(helpdeskData, userId, conn, t) {
    try {
      if (!helpdeskData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const checkExistingHelpdesk = await conn.Helpdesk.findOne({
        where: {
          helpdeskNo: helpdeskData?.helpdeskNo
        }
      })

      if (!checkExistingHelpdesk) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Provided Helpdesk Id is not found'
        }
      }

      const updateData = {
        helpdeskType: helpdeskData?.helpdeskType || checkExistingHelpdesk.helpdeskType,
        severity: helpdeskData?.severity || checkExistingHelpdesk.severity,
        userCategoryValue: helpdeskData?.profileNo,
        userCategory: helpdeskData?.profileType,
        contactId: helpdeskData?.contactId
      }

      await conn.Helpdesk.update(updateData, { where: { helpdeskNo: helpdeskData?.helpdeskNo }, transaction: t })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Helpdesk Profile mapped Successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async similarHelpdesk(helpdeskData, conn) {
    try {
      logger.info('Fectching similar interaction tickets')
      const { limit = 10, page = 0 } = helpdeskData
      const offSet = (page * limit)
      const { userInput } = helpdeskData
      const records = await conn.Helpdesk.findAndCountAll({
        include: [
          { model: conn.User, as: 'createdByDetails', attributes: ['firstName', 'lastName'] },
          { model: conn.User, as: 'updatedByDetails', attributes: ['firstName', 'lastName'] },
          { model: conn.User, as: 'assignedAgentDetails', attributes: ['firstName', 'lastName'] },
          { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] }
        ],
        where: isNaN(userInput)
          ? {
            [Op.or]: {
              title: {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Helpdesk.helpdesk_subject')), {
                  [Op.like]: `%${userInput.toUpperCase()}%`
                })]
              },
              source: {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Helpdesk.helpdesk_source')), {
                  [Op.like]: `%${userInput.toUpperCase()}%`
                })]
              },
              name: {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Helpdesk.user_name')), {
                  [Op.like]: `%${userInput.toUpperCase()}%`
                })]
              },
              email: {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Helpdesk.mail_id')), {
                  [Op.like]: `%${userInput.toUpperCase()}%`
                })]
              }
            }
          }
          : { helpdeskId: userInput },
        limit,
        offSet
      })

      if (!records || records.count === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No record found',
          data: records
        }
      }
      records.catagoryCounts = records.count
      records.count = records.rows.length
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Profile details fetched Successfully',
        data: records
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getHelpdeskMonitorCounts(payloads, conn) {
    try {
      const { date: createdAt } = payloads

      const query = `SELECT h1."helpdesk_source",
      (SELECT COUNT(*) AS queue FROM helpdesk as h2 WHERE status ='HS_NEW' AND cast(created_at as date) ='${createdAt}'::date and h2."helpdesk_source"=h1."helpdesk_source"),
      (SELECT COUNT(*) AS assigned FROM helpdesk as h2 WHERE status in ('HS_ASSGN', 'HS_WIP', 'HS_ESCALATED', 'HS_HOLD') AND cast(created_at as date) ='${createdAt}'::date and h2."helpdesk_source"=h1."helpdesk_source"),
      (SELECT COUNT(*) AS served FROM helpdesk as h2 WHERE status  in ('HS_CLS', 'HS_CANCE') AND cast(created_at as date) ='${createdAt}'::date and h2."helpdesk_source"=h1."helpdesk_source"),
      (SELECT AVG(selfassigned_at - created_at) AS wait_average FROM helpdesk as h2 WHERE status !='ABANDONED' AND cast(created_at as date) ='${createdAt}'::date),
      (SELECT MAX(selfassigned_at - created_at) AS wait_longest FROM helpdesk as h2 WHERE status !='ABANDONED' AND cast(created_at as date) ='${createdAt}'::date)
      FROM helpdesk as h1 where "helpdesk_source" in ('E-MAIL','WEBPORTAL') group by h1."helpdesk_source"`

      const query1 = `SELECT * FROM dtworks_cad_helpdek_queue_wait_fn('${createdAt}')`
      let counts = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      let helpdeskQueueWaitTime = await conn.sequelize.query(query1, {
        type: QueryTypes.SELECT
      })
      counts = camelCaseConversion(counts)
      helpdeskQueueWaitTime = camelCaseConversion(helpdeskQueueWaitTime)

      const response = { counts, helpdeskQueueWaitTime }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully retrived Chat summary Agent',
        data: response || []
      }
      // return this.responseHelper.onSuccess(res, defaultMessage.SUCCESS, response)
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getHelpdeskAgentSummary(payloads, conn) {
    try {
      const { date: createdAt, limit = 10, page = 0, excel = false } = payloads
      const offSet = (page * limit)

      let query = `SELECT * FROM dtworks_cad_agent_helpdesk_detail_fn ('${createdAt}')`
      let count = await conn.sequelize.query('select COUNT(*) FROM (' + query + ') t2')

      if (!excel && payloads.page && payloads.limit && conn.sequelize.options.dialect !== 'mssql') {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }
      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })

      if (!response) {
        const data = {
          count: 0,
          rows: []
        }
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No records found',
          data: data || []
        }
      }
      response = camelCaseConversion(response)
      if (Array.isArray(count) && count.length > 0) {
        count = Number(count?.[0]?.[0]?.count)
      }
      const data = {
        rows: response,
        count
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully retrived Chat summary Agent',
        data: data || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getHelpdeskDetails(payloads, conn) {
    try {
      const { limit = constantCode.common.lIMIT, page = constantCode.common.PAGE } = payloads
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      if (!payloads) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let whereClause = {}

      if (payloads && payloads?.source) {
        whereClause.helpdeskSource = payloads.source
      }

      if (payloads && payloads?.type) {
        if (payloads?.type === 'SERVED') {
          whereClause.status = ['HS_CLS', 'HS_CANCE']
        } else if (payloads?.type === 'QUEUE') {
          whereClause.status = ['HS_NEW']
        } else if (payloads?.type === 'ABOND') {
          whereClause.status = ['ABANDONED']
        } else if (payloads?.type === 'SERVING') {
          whereClause.status = ['HS_ASSGN', 'HS_WIP', 'HS_ESCALATED', 'HS_HOLD']
        }
      }

      if (payloads && payloads?.createdAt) {
        whereClause = {
          ...whereClause,
          createdAt: conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('Helpdesk.created_at')), '=', payloads?.createdAt)
        }
      }

      const response = await conn.Helpdesk.findAndCountAll({
        attributes: ['helpdeskNo', 'mailId', 'helpdeskSubject', 'helpdeskContent', 'createdAt'],
        include: [
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['description']
          }, {
            model: conn.BusinessEntity,
            as: 'helpdeskSourceDesc',
            attributes: ['code', 'description']
          }],
        where: { ...whereClause },
        ...params,
        logging: console.log
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully retrived chat Details',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
}
module.exports = HelpdeskService

/** Function for find and update Attachment
 * @param {any} entityId
 * @param {number} newEntityId
 * @param {string} entityType
 * @param {transaction} t
 * @param {instance} conn
 */
const findAndUpdateAttachment = async (entityId, newEntityId, entityType, conn, t) => {
  const attachment = await conn.Attachment.findOne({
    attributes: ['entityId', 'attachmentId'],
    where: {
      entityId,
      entityType,
      status: constantCode.status.TEMPORARY
    }
  })
  if (attachment) {
    const data = {
      attachmentId: attachment.dataValues.attachmentId,
      status: constantCode.common.FINAL,
      entityId: newEntityId
    }
    await conn.Attachment.update(data, {
      where: {
        entityId,
        entityType
      },
      transaction: t
    })
    logger.debug('Successfully updated attachment status')
  }
}

export const helpdeskMailBox = cron.schedule('* * * * *', () => {
  logger.debug('Starting helpdesk mails Job')
  processFetchingHelpdeskMails()
}, {
  scheduled: false
})

export const ReplyingEmail = cron.schedule('* * * * *', () => {
  logger.debug('Starting helpdesk mails Job')
  processReplyingEmail()
}, {
  scheduled: false
})
