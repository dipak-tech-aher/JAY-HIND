import { config } from '@config/env.config'
import { sequelize } from '@models'
import {
  camelCaseConversion,
  defaultMessage,
  logger,
  statusCodeConstants,
  transformAuditTrailSearchResponse,
  transformBillingSearchResponse,
  transformChatSearchResponse,
  transformInvoiceSearchResponse,
  transformLoginSearchResponse, transformOpenClosedSLADeptInteractionSearchResponse,
  transformProductSearchResponse
} from '@utils'
import moment from 'moment'
import { Op, QueryTypes } from 'sequelize'

// import required dependency
const { getConnection } = require('@services/connection-service')
const Got = require('got')
const { bi } = config

let instance

class ReportService {
  constructor () {
    if (!instance) {
      instance = this
    }
    return instance
  }

  // BCAE 2.0 SERVICES

  async getOpenInteractions (payloadData, conn) {
    try {
      if (!payloadData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { limit, page } = payloadData
      const offSet = limit * page
      let query = `select * from bcae_mis_open_interaction_report_vw
      where coalesce("interactionNumber", null) = coalesce($interactionId, coalesce("interactionNumber" , null))
      and coalesce("IntxnType", null) = coalesce($interactionType, coalesce("IntxnType" , null))
      and coalesce("IntxnStatus", null) = coalesce($interactionStatus, coalesce("IntxnStatus" , null))
      and coalesce("customerNumber", null) = coalesce($customerNo, coalesce("customerNumber" , null))
      and (coalesce(lower("customerName"), null) like coalesce(lower($customerName), coalesce(lower("customerName"), null))
      or coalesce("customerName", '') like coalesce(lower($customerName), coalesce(lower("customerName"), null)))
      and coalesce("createdAt"::DATE) between coalesce($dateFrom, "createdAt"::DATE) and coalesce($dateTo, "createdAt"::DATE)
      order by "createdAt" desc`

      const bind = {
        interactionId: payloadData?.interactionId || null,
        interactionType: payloadData?.interactionType || null,
        interactionStatus: payloadData?.interactionStatus || null,
        customerCategory: payloadData?.customerCategory || null,
        customerNo: payloadData?.customerNo || null,
        customerName: payloadData?.customerName ? '%' + payloadData?.customerName + '%' : null,
        dateFrom: payloadData?.dateFrom || null,
        dateTo: payloadData?.dateTo || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }

      )
      count = count[0].count
      if (!payloadData?.excel && page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        count,
        rows
      }
      logger.debug('Successfully fetch opened interaction detailed list')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch opened interaction detailed list',
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

  async getClosedInteractions (payloadData, conn) {
    try {
      if (!payloadData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { limit, page } = payloadData
      const offSet = limit * page

      let query = `select * from bcae_mis_closed_interaction_report_vw
        where coalesce("interactionNumber", null) = coalesce($interactionId, coalesce("interactionNumber" , null))
        and coalesce("IntxnType", null) = coalesce($interactionType, coalesce("IntxnType" , null))
        and coalesce("IntxnStatus", null) = coalesce($interactionStatus, coalesce("IntxnStatus" , null))
        and coalesce("customerNumber", null) = coalesce($customerNo, coalesce("customerNumber" , null))
        and (coalesce(lower("customerName"), null) like coalesce(lower($customerName), coalesce(lower("customerName"), null))
          or coalesce("customerName", '') like coalesce(lower($customerName), coalesce(lower("customerName"), null)))
        and coalesce("closedAt"::DATE) between coalesce($dateFrom, "closedAt"::DATE) and coalesce($dateTo, "closedAt"::DATE)
         order by "closedAt" desc`

      const bind = {
        interactionId: payloadData?.interactionId || null,
        interactionType: payloadData?.interactionType || null,
        interactionStatus: payloadData?.interactionStatus || null,
        customerCategory: payloadData?.customerCategory || null,
        customerNo: payloadData?.customerNo || null,
        customerName: payloadData?.customerName ? '%' + payloadData?.customerName + '%' : null,
        dateFrom: payloadData?.dateFrom || null,
        dateTo: payloadData?.dateTo || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }

      )
      count = count[0].count
      if (!payloadData?.excel && page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }

      logger.debug('Successfully fetch closed interaction detailed list')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch closed interaction detailed list',
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

  async getCreatedInteractions (payloadData, conn) {
    try {
      if (!payloadData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { limit, page } = payloadData
      const offSet = limit * page

      let query = `select * from bcae_mis_created_interaction_report_vw
      where coalesce("interactionNumber", null) = coalesce($interactionId, coalesce("interactionNumber" , null))
      and coalesce("IntxnType", null) = coalesce($interactionType, coalesce("IntxnType" , null))
      and coalesce("IntxnStatus", null) = coalesce($interactionStatus, coalesce("IntxnStatus" , null))
      and coalesce("customerNumber", null) = coalesce($customerNo, coalesce("customerNumber" , null))
      and (coalesce(lower("customerName"), null) like coalesce(lower($customerName), coalesce(lower("customerName"), null))
        or coalesce("customerName", '') like coalesce(lower($customerName), coalesce(lower("customerName"), null)))
      and coalesce("createdAt"::DATE) between coalesce($dateFrom, "createdAt"::DATE) and coalesce($dateTo, "createdAt"::DATE)
       order by "createdAt" desc`

      const bind = {
        interactionId: payloadData?.interactionId || null,
        interactionType: payloadData?.interactionType || null,
        interactionStatus: payloadData?.interactionStatus || null,
        customerCategory: payloadData?.customerCategory || null,
        customerNo: payloadData?.customerNo || null,
        customerName: payloadData?.customerName ? '%' + payloadData?.customerName + '%' : null,
        dateFrom: payloadData?.dateFrom || null,
        dateTo: payloadData?.dateTo || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }

      )
      count = count[0].count
      if (!payloadData?.excel && page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch created interaction detailed list',
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

  async getOpenOrders (payloadData, conn) {
    try {
      if (!payloadData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let query = `select * from bcae_mis_order_open_report_vw where
      coalesce("OrderNo", null) = coalesce($orderNo, coalesce("OrderNo" , null))
      and coalesce("OrderStatus", null) = coalesce($orderStatus, coalesce("OrderStatus" , null))
      and coalesce("CurrEntity", null) = coalesce($currEntity, coalesce("CurrEntity" , null))
      and coalesce("CurrRole", null) = coalesce($currRole, coalesce("CurrRole" , null))
      and coalesce("CurrUser", null) = coalesce($currUser, coalesce("CurrUser" , null))
      and coalesce("OrderFamily", null) = coalesce($orderFamily, coalesce("OrderFamily" , null))
      and coalesce("OrderCategory", null) = coalesce($orderCategory, coalesce("OrderCategory" , null))
      and coalesce("OrderType", null) = coalesce($orderType, coalesce("OrderType" , null))
      and coalesce("ServiceType", null) = coalesce($serviceType, coalesce("ServiceType" , null))
      and coalesce("OrderPriority", null) = coalesce($orderPriority, coalesce("OrderPriority" , null))
      and coalesce("OrderSource", null) = coalesce($orderSource, coalesce("OrderSource" , null))
      and coalesce("OrderChannel", null) = coalesce($orderChannel, coalesce("OrderChannel" , null))
      and coalesce("CreatedAt"::DATE) between coalesce($dateFrom, "CreatedAt"::DATE) and coalesce($dateTo, "CreatedAt"::DATE)
      order by "CreatedAt" desc
      `
      const bind = {
        orderNo: payloadData?.orderNo || null,
        orderStatus: payloadData?.orderStatus || null,
        currEntity: payloadData?.currEntity || null,
        currRole: payloadData?.currRole || null,
        currUser: payloadData?.currUser || null,
        orderFamily: payloadData?.orderFamily || null,
        orderCategory: payloadData?.orderCategory || null,
        orderType: payloadData?.orderType || null,
        serviceType: payloadData?.serviceType || null,
        orderPriority: payloadData?.orderPriority || null,
        orderSource: payloadData?.orderSource || null,
        orderChannel: payloadData?.orderChannel || null,
        dateFrom: payloadData?.dateFrom || null,
        dateTo: payloadData?.dateTo || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }

      )
      count = count[0].count
      if (!payloadData?.excel && payloadData?.page && payloadData?.limit) {
        query = query + ' limit ' + payloadData?.limit + ' offset ' + (payloadData?.page * payloadData?.limit)
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch opened order detailed list',
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

  async getClosedOrders (payloadData, conn) {
    try {
      if (!payloadData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let query = `select * from bcae_mis_order_closed_report_vw where
      coalesce("OrderNo", null) = coalesce($orderNo, coalesce("OrderNo" , null))
      and coalesce("OrderStatus", null) = coalesce($orderStatus, coalesce("OrderStatus" , null))
      and coalesce("CurrEntity", null) = coalesce($currEntity, coalesce("CurrEntity" , null))
      and coalesce("CurrRole", null) = coalesce($currRole, coalesce("CurrRole" , null))
      and coalesce("CurrUser", null) = coalesce($currUser, coalesce("CurrUser" , null))
      and coalesce("OrderFamily", null) = coalesce($orderFamily, coalesce("OrderFamily" , null))
      and coalesce("OrderCategory", null) = coalesce($orderCategory, coalesce("OrderCategory" , null))
      and coalesce("OrderType", null) = coalesce($orderType, coalesce("OrderType" , null))
      and coalesce("ServiceType", null) = coalesce($serviceType, coalesce("ServiceType" , null))
      and coalesce("OrderPriority", null) = coalesce($orderPriority, coalesce("OrderPriority" , null))
      and coalesce("OrderSource", null) = coalesce($orderSource, coalesce("OrderSource" , null))
      and coalesce("OrderChannel", null) = coalesce($orderChannel, coalesce("OrderChannel" , null))
      and coalesce("CreatedAt"::DATE) between coalesce($dateFrom, "CreatedAt"::DATE) and coalesce($dateTo, "CreatedAt"::DATE)
      order by "CreatedAt" desc`

      const bind = {
        orderNo: payloadData?.orderNo || null,
        orderStatus: payloadData?.orderStatus || null,
        currEntity: payloadData?.currEntity || null,
        currRole: payloadData?.currRole || null,
        currUser: payloadData?.currUser || null,
        orderFamily: payloadData?.orderFamily || null,
        orderCategory: payloadData?.orderCategory || null,
        orderType: payloadData?.orderType || null,
        serviceType: payloadData?.serviceType || null,
        orderPriority: payloadData?.orderPriority || null,
        orderSource: payloadData?.orderSource || null,
        orderChannel: payloadData?.orderChannel || null,
        dateFrom: payloadData?.dateFrom || null,
        dateTo: payloadData?.dateTo || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }

      )
      count = count[0].count
      if (!payloadData?.excel && payloadData?.page && payloadData?.limit) {
        query = query + ' limit ' + payloadData?.limit + ' offset ' + (payloadData?.page * payloadData?.limit)
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch closed order detailed list',
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

  async getCreatedOrders (payloadData, conn) {
    try {
      if (!payloadData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let query = `select * from bcae_mis_order_created_report_vw where
      coalesce("OrderNo", null) = coalesce($orderNo, coalesce("OrderNo" , null))
      and coalesce("OrderStatus", null) = coalesce($orderStatus, coalesce("OrderStatus" , null))
      and coalesce("CurrEntity", null) = coalesce($currEntity, coalesce("CurrEntity" , null))
      and coalesce("CurrRole", null) = coalesce($currRole, coalesce("CurrRole" , null))
      and coalesce("CurrUser", null) = coalesce($currUser, coalesce("CurrUser" , null))
      and coalesce("OrderFamily", null) = coalesce($orderFamily, coalesce("OrderFamily" , null))
      and coalesce("OrderCategory", null) = coalesce($orderCategory, coalesce("OrderCategory" , null))
      and coalesce("OrderType", null) = coalesce($orderType, coalesce("OrderType" , null))
      and coalesce("ServiceType", null) = coalesce($serviceType, coalesce("ServiceType" , null))
      and coalesce("OrderPriority", null) = coalesce($orderPriority, coalesce("OrderPriority" , null))
      and coalesce("OrderSource", null) = coalesce($orderSource, coalesce("OrderSource" , null))
      and coalesce("OrderChannel", null) = coalesce($orderChannel, coalesce("OrderChannel" , null))
      and coalesce("CreatedAt"::DATE) between coalesce($dateFrom, "CreatedAt"::DATE) and coalesce($dateTo, "CreatedAt"::DATE)
      order by "CreatedAt" desc`

      const bind = {
        orderNo: payloadData?.orderNo || null,
        orderStatus: payloadData?.orderStatus || null,
        currEntity: payloadData?.currEntity || null,
        currRole: payloadData?.currRole || null,
        currUser: payloadData?.currUser || null,
        orderFamily: payloadData?.orderFamily || null,
        orderCategory: payloadData?.orderCategory || null,
        orderType: payloadData?.orderType || null,
        serviceType: payloadData?.serviceType || null,
        orderPriority: payloadData?.orderPriority || null,
        orderSource: payloadData?.orderSource || null,
        orderChannel: payloadData?.orderChannel || null,
        dateFrom: payloadData?.dateFrom || null,
        dateTo: payloadData?.dateTo || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }

      )
      count = count[0].count
      if (!payloadData?.excel && payloadData?.page && payloadData?.limit) {
        query = query + ' limit ' + payloadData?.limit + ' offset ' + (payloadData?.page * payloadData?.limit)
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        count,
        rows
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch created order detailed list',
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

  async getCreatedCustomer (payloadData, conn) {
    try {
      if (!payloadData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      let query = `select distinct * from bcae_mis_customer_dtl_vw where 
      coalesce("CustomerNo", null) = coalesce($customerNo, coalesce("CustomerNo" , null)) and
      coalesce("IdType", null) = coalesce($idType, coalesce("IdType" , null)) and
      coalesce("CustomerCategory", null) = coalesce($customerCategory, coalesce("CustomerCategory" , null)) and
      coalesce("CustomerStatus", null) = coalesce($customerStatus, coalesce("CustomerStatus" , null)) and
      coalesce("CreatedAt"::DATE) between coalesce($dateFrom, "CreatedAt"::DATE) and coalesce($dateTo, "CreatedAt"::DATE)
      order by "CreatedAt" desc
      `
      const bind = {
        customerNo: payloadData?.customerNo || null,
        idType: payloadData?.idType || null,
        customerCategory: payloadData?.customerCategory || null,
        customerStatus: payloadData?.customerStatus || null,
        dateFrom: payloadData?.dateFrom || null,
        dateTo: payloadData?.dateTo || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }

      )
      count = count[0].count
      if (!payloadData?.excel && payloadData?.page && payloadData?.limit) {
        query = query + ' limit ' + payloadData?.limit + ' offset ' + (payloadData?.page * payloadData?.limit)
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        count,
        rows
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch created customer detailed list',
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

  // AIOS SERVICES

  async getOpenOrClosedInteractions (searchParams, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while Fetching open/close interactions'
      let data
      let query = `select * from (
        with 
          crtbyroletxn as (
            select * from (
              select intxn_id, from_role as created_by_role, 
                     row_number() over (partition by intxn_id) as dup_id
                from interaction_txn
                 where flw_action = 'START') as dedupetxn
               where dup_id = 1
          ),
          pendclosetxn as (
            select * from (
              select intxn_id, intxn_status, flw_created_by as pending_close_by, flw_created_at as pending_close_date, 
                     row_number() over (partition by intxn_id) as dup_id
                from interaction_txn
                 where intxn_status = 'PEND-CLOSE' and flw_action!='Assign to self') as dedupetxn
               where dup_id = 1
          ),
          closedtxn as (
            select * from (
              select intxn_id, intxn_status, flw_created_by as closed_by, flw_created_at as closed_date, 
                     row_number() over (partition by intxn_id) as dup_id
                from interaction_txn
                 where intxn_status = 'CLOSED' and flw_action!='Assign to self') as dedupetxn
               where dup_id = 1
          ) 
        select intxn.intxn_id, intxn.created_at, 
               intxn.source_code, besc.description as source_code_desc, 
               intxn.chnl_code, bech.description as chnl_code_desc,
               ptxn.pending_close_date, intxn.cancelled_by,bcan.description as cancelled_reason,
               coalesce(cancelledBy.first_name, '', cancelledBy.first_name || ', ') || coalesce(cancelledBy.last_name, '') as cancelled_by_name,
               coalesce(pendingcloseuser.first_name, '', pendingcloseuser.first_name || ', ') || coalesce(pendingcloseuser.last_name, '') as pending_close_by_user_name,
               ctxn.closed_date, 
               coalesce(closedbyuser.first_name, '', closedbyuser.first_name || ', ') || coalesce(closedbyuser.last_name, '') as closed_by_user_name,
               cust.cust_type, bectype.description as cust_type_desc,
               coalesce(cust.first_name, '', cust.first_name || ', ') || coalesce(cust.last_name, '') as customer_name,
               cust.crm_customer_no,
               conn.identification_no, pln.prod_type,
               intxn.intxn_type, intxn.intxn_cat_type, tkttype.description as ticket_type_desc,
               intxn.comment_type, cmttype.description as comment_type_desc, 
               intxn.comment_cause, cmtcause.description as comment_cause_desc,
               coalesce(intxn.external_ref_no1, intxn.ref_intxn_id) ticket_id,
               intxn.description,
               intxn.priority_code, prty.description as priority_code_desc,
               intxn.created_by,        
               coalesce(crtbyusr.first_name, '', crtbyusr.first_name || ', ') || coalesce(crtbyusr.last_name, '') as created_by_user_name,
             intxn.curr_status, currsts.description as curr_status_desc,
             intxn.curr_role, currrole.role_desc as curr_role_name,
             intxn.curr_user,
               coalesce(curruser.first_name, '', curruser.first_name || ', ') || coalesce(curruser.last_name, '') as curr_user_name,
             case 
                 when intxn.survey_req = 'Y' then 'Yes'
                 when intxn.survey_req = 'N' or intxn.survey_req is null then 'No'
                end as survey_req,
             case 
                 when intxn.is_rebound = 'Y' then 'Yes'
                 when intxn.is_rebound = 'N' or intxn.is_rebound is null then 'No'
                end as is_rebound,   	   
                cntct.contact_no,
                cntct.email,
                intxn.wo_type, bewtype.description as wo_type_desc,
                crtdbyrole.role_desc as created_by_role,
                intxn.is_valid,
                intxn.problem_code
          from interaction intxn 
         inner join users crtbyusr on intxn.created_by = crtbyusr.user_id
         left outer join users cancelledBy on intxn.cancelled_by = cancelledBy.user_id
         left outer join business_entity bcan on intxn.cancelled_reason = bcan.code
         inner join business_entity currsts on intxn.curr_status = currsts.code
         inner join roles currrole on intxn.curr_role = currrole.role_id
         left outer join users curruser on intxn.curr_user = curruser.user_id
         left outer join crtbyroletxn on intxn.intxn_id = crtbyroletxn.intxn_id
         left outer join roles crtdbyrole on crtdbyrole.role_id = crtbyroletxn.created_by_role
         left outer join business_entity besc on intxn.source_code = besc.code
         left outer join business_entity bech on intxn.chnl_code = bech.code
         left outer join business_entity bewtype on intxn.wo_type = bewtype.code
         left outer join customers cust on intxn.customer_id = cust.customer_id 
         left outer join contacts cntct on cust.contact_id = cntct.contact_id 
         left outer join connections conn on intxn.connection_id = conn.connection_id
         left outer join plan pln on (conn.mapping_payload->'plans'->0->>'planId')::INTEGER = pln.plan_id
         left outer join business_entity bectype on cust.cust_type = bectype.code
         left outer join pendclosetxn ptxn on intxn.intxn_id = ptxn.intxn_id
         left outer join closedtxn ctxn on intxn.intxn_id = ctxn.intxn_id
         left outer join users pendingcloseuser on ptxn.pending_close_by = pendingcloseuser.user_id
         left outer join users closedbyuser on ctxn.closed_by = closedbyuser.user_id
         left outer join business_entity tkttype on intxn.intxn_cat_type = tkttype.code
         left outer join business_entity cmttype on intxn.comment_type = cmttype.code
         left outer join business_entity cmtcause on intxn.comment_cause = cmtcause.code
         left outer join business_entity prty on intxn.priority_code = prty.code) as ocintxn`

      let whereClause = ' where  '

      let paramIdx = 1
      const bindParams = {}

      if (searchParams.interactionId && searchParams.interactionId !== '' && searchParams.interactionId !== undefined) {
        whereClause = whereClause + ` ocintxn.intxn_id = $param${paramIdx}  and `
        bindParams[`param${paramIdx}`] = searchParams.interactionId
        paramIdx++
      }
      if (searchParams.interactionType && searchParams.interactionType !== '' && searchParams.interactionType !== undefined) {
        whereClause = whereClause + ` ocintxn.intxn_type = $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = searchParams.interactionType
        paramIdx++
      }
      if (searchParams.woType && searchParams.woType !== '' && searchParams.woType !== undefined) {
        whereClause = whereClause + ` ocintxn.wo_type = $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = searchParams.woType
        paramIdx++
      }
      if (searchParams.intxnStatus && searchParams.intxnStatus !== '' && searchParams.intxnStatus !== undefined) {
        whereClause = whereClause + ` ocintxn.curr_status = $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = searchParams.intxnStatus
        paramIdx++
      }
      if (searchParams.customerType && searchParams.customerType !== '' && searchParams.customerType !== undefined) {
        whereClause = whereClause + ` ocintxn.cust_type = $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = searchParams.customerType
        paramIdx++
      }
      if (searchParams.problemType && searchParams.problemType !== '' && searchParams.problemType !== undefined) {
        const beProblemType = await conn.BusinessEntity.findOne({
          where: {
            codeType: 'PROBLEM_TYPE',
            code: searchParams.problemType
          }
        })

        const beCodes = await conn.BusinessEntity.findAll({
          where: {
            codeType: ['PROBLEM_CAUSE', 'PROBLEM_CODE']
          }
        })

        const problemCauses = []
        for (const cd of beCodes) {
          if (cd.codeType === 'PROBLEM_CAUSE') {
            if (cd.mappingPayload && cd.mappingPayload.problemType && cd.mappingPayload.problemType.length > 0) {
              for (const pt of cd.mappingPayload.problemType) {
                if (pt === beProblemType.code) {
                  problemCauses.push(cd.code)
                }
              }
            }
          }
        }

        const problemCodes = []
        for (const cd of beCodes) {
          if (cd.codeType === 'PROBLEM_CODE') {
            if (cd.mappingPayload && cd.mappingPayload.problemCause && problemCauses.includes(cd.mappingPayload.problemCause)) {
              problemCodes.push(cd.code)
            }
          }
        }
        problemCodes.push(beProblemType.code)
        whereClause = whereClause + `ocintxn.problem_code IN ('${problemCodes.join("','")}') and `
      }
      if (searchParams.customerNo && searchParams.customerNo !== '' && searchParams.customerNo !== undefined) {
        whereClause = whereClause + ` ocintxn.crm_customer_no like $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = `%${searchParams.customerNo}%`
        paramIdx++
      }
      if (searchParams.customerName && searchParams.customerName !== '' && searchParams.customerName !== undefined) {
        whereClause = whereClause + ` ocintxn.customer_name ilike $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = `%${searchParams.customerName}%`
        paramIdx++
      }
      if (searchParams.serviceNo && searchParams.serviceNo !== '' && searchParams.serviceNo !== undefined) {
        whereClause = whereClause + ` ocintxn.identification_no like $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = `%${searchParams.serviceNo}%`
        paramIdx++
      }
      if (searchParams.dateFrom && searchParams.dateFrom !== '' && searchParams.dateFrom !== undefined) {
        whereClause = whereClause + ` ocintxn.created_at::DATE >= $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = searchParams.dateFrom
        paramIdx++
      }
      if (searchParams.dateTo && searchParams.dateTo !== '' && searchParams.dateTo !== undefined) {
        whereClause = whereClause + ` ocintxn.created_at::DATE <= $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = searchParams.dateTo
        paramIdx++
      }

      whereClause = whereClause.substring(0, whereClause.lastIndexOf('and'))

      query = query + whereClause + ' order by ocintxn.created_at desc'

      let count = await conn.sequelize.query('select COUNT(*) FROM (' + query + ') t', {
        bind: bindParams,
        type: QueryTypes.SELECT
      })
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      let rows = await conn.sequelize.query(query, {
        bind: bindParams,
        type: QueryTypes.SELECT
      })
      rows = transformOpenClosedSLADeptInteractionSearchResponse(rows)

      const response = { rows, count }
      logger.debug('Successfully fetch ' + searchParams.reportType + ' detailed list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch ' + searchParams.reportType + ' detailed list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getChatInteractions (chatId, accessNumber, email, agent, contactNo, customerName, serviceType, chatFromDate, chatToDate, chatStatus, filters, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching chat list'
      let data

      let response
      let query = `select
      ch.chat_id,
      ch.contact_no,
      ch.email_id,
      ch.customer_name,
      case
        when ch.start_at <= ch.created_at then null
        when (ch.status='ABANDONED') then null
        else round(extract(EPOCH from ch.start_at - ch.created_at)::int / 60, 0)
      end as response_min,
      case
        when ch.start_at <= ch.created_at then null
        when (ch.status='ABANDONED') then null
        else round(mod(extract(EPOCH from ch.start_at - ch.created_at)::numeric / 60, 1) * 60, 0)
      end as response_sec,
      coalesce(ch.start_at::timestamp at TIME zone 'Asia/Brunei', ch.created_at::timestamp at TIME zone 'Asia/Brunei') created_at,
      case
		when (ch.status='CLOSED') then coalesce(ch.customer_close_at::timestamp at TIME zone 'Asia/Brunei', ch.updated_at::timestamp at TIME zone 'Asia/Brunei')
		else null 
	end as end_at,
      ch.status,
      case
        ch.status
        when 'NEW' then 'New'
        when 'ASSIGNED' then 'Assigned'
        when 'CLOSED' then 'Closed'
        when 'ABANDONED' then 'Abandoned'
        else 'Unknown'
      end as status_desc,
      ch.message,
      ch.type,
      ch.access_no,
      ch.category,
      ch.id_value,
      concat(us.first_name , ' ', us.last_name) as agent_name,
      case
        when (ch.start_at <= ch.created_at) then null
        when (ch.status='ABANDONED') then '5'
        else round(extract(EPOCH from ch.start_at - ch.created_at)::int / 60, 0)
      end as queue_wait_min,
      case
        when ch.start_at <= ch.created_at then null
        when (ch.status='ABANDONED') then null
        else round(mod(extract(EPOCH from ch.start_at - ch.created_at)::numeric / 60, 1) * 60, 0)
      end as queue_wait_sec,
      case
        when coalesce(ch.end_at, ch.customer_close_at, ch.updated_at) <= coalesce(ch.start_at, ch.created_at) then null
        when (ch.status='ABANDONED') then null
        else round(extract(EPOCH from coalesce(ch.end_at, ch.customer_close_at, ch.updated_at) - coalesce(ch.start_at, ch.created_at))::int / 60, 0)
      end as chat_duration_min,
      case
        when coalesce(ch.end_at, ch.customer_close_at, ch.updated_at) <= coalesce(ch.start_at, ch.created_at) then null
        when (ch.status='ABANDONED') then null
        else round(mod(extract(EPOCH from coalesce(ch.end_at, ch.customer_close_at, ch.updated_at) - coalesce(ch.start_at, ch.created_at))::numeric / 60, 1) * 60, 0)
      end as chat_duration_sec
    from
      chat ch
    left outer join users as us on
      us.user_id = ch.user_id`
      let whereClause = ' where '

      let paramIdx = 1
      const bindParams = {}

      if (chatStatus && chatStatus !== '' && chatStatus !== undefined) {
        whereClause = whereClause + ` ch.status = $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = chatStatus
        paramIdx++
      }
      if (chatId && chatId !== '' && chatId !== undefined) {
        whereClause = whereClause + ` ch.chat_id = $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = chatId
        paramIdx++
      }
      if (agent && agent !== '' && agent !== undefined) {
        whereClause = whereClause + ` concat(us.first_name , ' ', us.last_name)  Ilike $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = `%${agent}%`
        paramIdx++
      }
      if (customerName && customerName !== '' && customerName !== undefined) {
        whereClause = whereClause + ` ch.customer_name  Ilike $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = `%${customerName}%`
        paramIdx++
      }
      if (email && email !== '' && email !== undefined) {
        whereClause = whereClause + ` ch.email_id  Ilike $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = `%${email}%`
        paramIdx++
      }
      if (serviceType && serviceType !== '' && serviceType !== undefined) {
        whereClause = whereClause + ` ch.type  ilike $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = `%${serviceType}%`
        paramIdx++
      }
      if (accessNumber && accessNumber !== '' && accessNumber !== undefined) {
        whereClause = whereClause + ` ch.access_no  like $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = `%${accessNumber}%`
        paramIdx++
      }
      if (contactNo && contactNo !== '' && contactNo !== undefined) {
        whereClause = whereClause + ` ch.contact_no::varchar  like $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = `%${contactNo}%`
        paramIdx++
      }

      if (chatFromDate && chatToDate && chatFromDate !== '' && chatToDate !== '' && chatFromDate !== undefined && chatToDate !== undefined) {
        whereClause = whereClause + ` ch.created_at::DATE >= $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = chatFromDate
        paramIdx++
        whereClause = whereClause + ` ch.created_at::DATE <= $param${paramIdx} and `
        bindParams[`param${paramIdx}`] = chatToDate
        paramIdx++
      }

      whereClause = whereClause.substring(0, whereClause.lastIndexOf('and'))
      query = query + whereClause + ' order by chat_id DESC'

      const count = await conn.sequelize.query('select COUNT(*) FROM (' + query + ') t', {
        type: QueryTypes.SELECT,
        bind: bindParams
      })

      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      let rows = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        bind: bindParams
      })
      rows = camelCaseConversion(rows)
      if (rows.length > 0 & count.length > 0) {
        response = {
          rows,
          count: count[0].count
        }
      }
      logger.debug('Successfully fetch chat list')

      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch chat list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async dailyChatReportNewCustomers (chatFromDate, chatToDate, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while Fetching Daily Chat Report For New Customers'
      let data

      let response
      const countQuery = `SELECT count(*) FROM customers c, contacts c2 WHERE c.contact_id = c2.contact_id AND c.status::text = 'TEMP'::text AND 
                          c.created_at::date >= '${chatFromDate}' and c.created_at::date <='${chatToDate}'`
      let count = await conn.sequelize.query(countQuery, {
        type: QueryTypes.SELECT,
        bind: {
          chatFromDate,
          chatToDate
        }
      })
      if (count.length > 0) {
        count = count[0].count
      }
      let query = `SELECT c.first_name AS customer_name, c2.email AS customer_email_id, c2.contact_no AS customer_mobile_number,
                   c.id_value AS id_number, CASE WHEN c2.alt_contact_no1 = 0::numeric THEN NULL::numeric ELSE c2.alt_contact_no1
                   END AS access_number,c2.alt_email AS service_type, to_char(c.created_at, 'dd-mm-yyyy hh12:mi AM'::text) AS created_date
                   FROM customers c,contacts c2 WHERE c.contact_id = c2.contact_id AND c.status::text = 'TEMP'::text AND
                   c.created_at::date >= '${chatFromDate}' and c.created_at::date <='${chatToDate}' order by c.created_at::date DESC`
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      let rows = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        bind: {
          chatFromDate,
          chatToDate
        }
      })
      rows = camelCaseConversion(rows)
      if (rows.length > 0) {
        response = {
          rows,
          count
        }
      }
      logger.debug('Successfully Fetched Daily Chat Report For New Customers')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched Daily Chat Report For New Customers'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async dailyChatReportBoosterPurchase (chatFromDate, chatToDate, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while Fetching Daily Chat Report For New Customers'
      let data
      let response
      const countQuery = `SELECT count(*) FROM booster_purchase  WHERE booster_purchase.purchase_date::date >= '${chatFromDate}' and booster_purchase.purchase_date::date <='${chatToDate}'`
      let count = await conn.sequelize.query(countQuery, {
        type: QueryTypes.SELECT,
        bind: {
          chatFromDate,
          chatToDate
        }
      })
      if (count.length > 0) {
        count = count[0].count
      }
      let query = `SELECT bp.access_number AS access_number,
        bp.customer_name AS customer_name,
        bp.contact_no AS contact_no,
        bp.email_id AS email_id,
        bp.booster_name,
        to_char(bp.purchase_date, 'dd-mm-yyyy hh12:mi AM'::text) AS purchase_date,
        bp.status AS status
       FROM booster_purchase as bp
      WHERE bp.purchase_date::date >= '${chatFromDate}' and bp.purchase_date::date <='${chatToDate}' order by bp.purchase_date::date DESC`
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      let rows = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        bind: {
          chatFromDate,
          chatToDate
        }
      })
      rows = camelCaseConversion(rows)
      if (rows.length > 0) {
        response = {
          rows,
          count
        }
      }
      logger.debug('Successfully Fetched Daily Chat Report For Booster Purchase')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched Daily Chat Report For Booster Purchase'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async dailyChatReportCounts (chatFromDate, chatToDate) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while Fetching Daily Chat Report For New Customers'

      const visitCountQuery = `SELECT chat.created_date, count(chat.chat_id) AS "COUNT"  FROM chat  WHERE chat.created_date >= '${chatFromDate}' and chat.created_date<='${chatToDate}'
      GROUP BY chat.created_date`

      const connectedToAgentCountQuery = `SELECT DISTINCT workflow_hdr.created_date, count(workflow_hdr.wf_hdr_id) AS "COUNT"
        FROM workflow_hdr
        WHERE workflow_hdr.created_date >= '${chatFromDate}' and workflow_hdr.created_date <= '${chatToDate}' AND workflow_hdr.entity::text = 'LIVECHAT'::text AND workflow_hdr.next_activity_id::text = 'Activity_1bvmsbm'::text
        GROUP BY workflow_hdr.created_date`

      const connectedWithLiveAgentCount = await conn.sequelize.query(connectedToAgentCountQuery, {
        type: QueryTypes.SELECT,
        bind: {
          chatFromDate,
          chatToDate
        }
      })

      const visitedCustomerCount = await conn.sequelize.query(visitCountQuery, {
        type: QueryTypes.SELECT
      })
      const response = []

      if (connectedWithLiveAgentCount.length > 0 || visitedCustomerCount.length > 0) {
        let connectedCount = 0
        for (const i of connectedWithLiveAgentCount) {
          connectedCount = Number(connectedCount) + Number(i.COUNT)
        }
        let visitedCount = 0
        for (const j of visitedCustomerCount) {
          visitedCount = Number(visitedCount) + Number(j.COUNT)
        }
        response.push({
          connectedWithLiveAgentCount: connectedCount,
          visitedCustomerCount: visitedCount
        })
      }
      const data = {
        rows: response.length > 0 ? response : [],
        count: response.length > 0 ? 1 : 0
      }
      logger.debug('Successfully Fetched Daily Visited & Connected To Agent Chat Report Counts')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched Daily Visited & Connected To Agent Chat Report Counts'
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  // BASE PRODUCT SERVICES

  async loginSearch (userID, userName, loginDateTime, logoutDateTime, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching login detailed list'
      let data
      let query = `select usrSes.session_id,usr.user_id,usr.loginid,concat(usr.first_name,usr.last_name) AS user_name,
      usrSes.ip,usrSes.created_at,usrSes.updated_at,
      to_char(usrSes.created_at,'DD-MON-YYYY HH24:MI') as created_at_format,
      to_char(usrSes.updated_at,'DD-MON-YYYY HH24:MI') as updated_at_format
      from user_session as usrSes
      inner join users usr on usrSes.user_id = usr.user_id 
      where coalesce(usr.user_id, -1) = coalesce($userId, coalesce(usr.user_id, -1))
      and coalesce(lower(concat(usr.first_name,usr.last_name)), null) like coalesce(lower($userName), coalesce(lower(concat(usr.first_name,usr.last_name)), null))
      and coalesce(usrSes.created_at::TIMESTAMP) >= coalesce($loginDateTime, usrSes.created_at::TIMESTAMP) 
      and coalesce(usrSes.updated_at::TIMESTAMP) <= coalesce($logoutDateTime, usrSes.updated_at::TIMESTAMP)
      order by usrSes.created_at desc`

      const bind = {
        userId: userID || null,
        userName: userName ? '%' + userName + '%' : null,
        loginDateTime: loginDateTime || null,
        logoutDateTime: logoutDateTime || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(t.user_id) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count

      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }
      let rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })
      rows = camelCaseConversion(rows)
      rows = transformLoginSearchResponse(rows)
      const response = {
        rows,
        count
      }
      logger.debug('Successfully fetch login detailed list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch login detailed list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async openClosedInteractionSearch (interactionID, interactionType, woType, intxnstatus, customerType,
    problemType, customerNo, customerName, billRefNumber, serviceNo,
    dateFrom, dateTo, reportType, entity, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching interactions'
      let data
      // Note : replace or to and condition after add the empty value of problem_code if not exists
      let query = `select * from vw_interaction_report irView
                where 1 = 1
                and coalesce(lower(irView.for_entity), null) like coalesce(lower($forEntity), coalesce(lower(irView.for_entity), null))
                and coalesce(irView.interaction_id, -1) = coalesce($interactionID, coalesce(irView.interaction_id, -1))
                and coalesce(irView.interaction_type_code, null) = coalesce($interactionType, coalesce(irView.interaction_type_code, null))
                and coalesce(irView.wo_type, null) = coalesce($woType, coalesce(irView.wo_type, null))
                and coalesce(lower(irView.ticket_status), null) = coalesce(lower($status), coalesce(lower(irView.ticket_status), null))
                and coalesce(irView.cust_type_code, null) = coalesce($customerType, coalesce(irView.cust_type_code, null))
                and coalesce(irView.problem_type, null) = coalesce($problemType, coalesce(irView.problem_type, null))
                and coalesce(irView.customer_no, null) = coalesce($customerNo, coalesce(irView.customer_no, null))
                and coalesce(lower(irView.customer_name), null) like coalesce(lower($customerName), coalesce(lower(irView.customer_name), null))
                and coalesce(irView.intxn_created_at::DATE) between coalesce($dateFrom, irView.intxn_created_at::DATE) AND coalesce($dateTo, irView.intxn_created_at::DATE)
                ${reportType === 'Open Interaction' ? 'and status_code not in (\'NAT-AI\',\'CLOSED\',\'NAT-NDCCY\')' : 'and status_code in (\'NAT-AI\',\'CLOSED\',\'NAT-NDCCY\')'}                
                order by intxn_created_at desc`

      const bind = {
        interactionID: interactionID || null,
        interactionType: interactionType || null,
        woType: woType || null,
        intxnstatus: intxnstatus || null,
        customerType: customerType || null,
        problemType: problemType || null,
        customerNo: customerNo || null,
        customerName: customerName ? '%' + customerName + '%' : null,
        billRefNumber: billRefNumber || null,
        serviceNo: serviceNo || null,
        forEntity: entity || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      let rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })
      rows = transformOpenClosedSLADeptInteractionSearchResponse(rows)
      const response = {
        rows,
        count
      }
      logger.debug('Successfully fetch ' + reportType + ' detailed list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch ' + reportType + ' detailed list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async chatSearch (chatType, serviceNo, customerName, agentName, chatStartDateTime, chatEndDateTime, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let rows = []
      const cond = {}
      const pagination = {}
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching Chat detail Search list'
      let data
      if (chatType) {
        cond.type = chatType
      }
      if (serviceNo) {
        cond.accessNo = serviceNo
      }
      if (customerName) {
        cond.customerName = { [Op.like]: `%${customerName}%` }
      }

      if (page && limit) {
        pagination.offset = offSet
        pagination.limit = limit
      }

      if (chatStartDateTime && chatEndDateTime) {
        cond.createdAt = { [Op.between]: [chatStartDateTime, chatEndDateTime] }
      }

      rows = await conn.Chat.findAll({
        include: [
          {
            model: conn.User,
            attributes: ['firstName'],
            as: 'user',
            where: {
              [Op.or]: [conn.sequelize.where(conn.sequelize.fn('lower', conn.sequelize.col('user.first_name')), { [Op.like]: conn.sequelize.fn('lower', `%${agentName}%`) })]
            }
          }
        ],
        where: {
          [Op.or]: [conn.sequelize.where(conn.sequelize.fn('lower', conn.sequelize.col('Chat.customer_name')), { [Op.like]: conn.sequelize.fn('lower', `%${customerName}%`) })],
          [Op.and]: cond
        },
        order: [['chatId', 'DESC']],
        pagination
      })

      let count = await Chat.findAndCountAll({
        include: [
          {
            model: User,
            attributes: ['firstName'],
            as: 'user',
            where: {
              [Op.or]: [conn.sequelize.where(conn.sequelize.fn('lower', conn.sequelize.col('user.first_name')), { [Op.like]: conn.sequelize.fn('lower', `%${agentName}%`) })]
            }
          }
        ],
        where: {
          [Op.or]: [conn.sequelize.where(conn.sequelize.fn('lower', conn.sequelize.col('Chat.customer_name')), { [Op.like]: conn.sequelize.fn('lower', `%${customerName}%`) })],
          [Op.and]: cond
        }
      })
      count = count.count
      rows = transformChatSearchResponse(rows)
      const response = {
        rows,
        count
      }
      logger.debug('Successfully fetch Chat detail Search list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch Chat detail Search list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async auditTrailSearch (userID, userName, fromDateTime, toDateTime, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while Fetching audit Trail list'
      let data = {}

      let query = `select usrSes.session_id,usr.user_id,usr.loginid,
      concat(usr.first_name,usr.last_name) AS user_name,
      usrSes.ip,'' as action,'' as action_details,
      usrSes.created_at,usrSes.updated_at,
      to_char(usrSes.created_at,'DD-MON-YYYY HH24:MI') as created_at_format,
      to_char(usrSes.updated_at,'DD-MON-YYYY HH24:MI') as updated_at_format
      from user_session as usrSes
      inner join users usr on usrSes.user_id = usr.user_id 
      where coalesce(usr.user_id, -1) = coalesce($userId, coalesce(usr.user_id, -1))
      and coalesce(lower( concat(usr.first_name,usr.last_name) ), null) like coalesce(lower($userName), coalesce(lower( concat(usr.first_name,usr.last_name) ), null))
      and coalesce(usrSes.created_at::TIMESTAMP) >= coalesce($fromDateTime, usrSes.created_at::TIMESTAMP) 
      and coalesce(usrSes.updated_at::TIMESTAMP) <= coalesce($toDateTime, usrSes.updated_at::TIMESTAMP)
      order by usrSes.created_at desc`
      const bind = {
        userId: userID || null,
        userName: userName ? '%' + userName + '%' : null,
        fromDateTime: fromDateTime || null,
        toDateTime: toDateTime || null
      }
      let count = await conn.sequelize.query(
        'select COUNT(t.user_id) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count

      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }
      let rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      rows = camelCaseConversion(rows)
      rows = transformAuditTrailSearchResponse(rows)
      const response = {
        rows,
        count
      }
      logger.debug('Successfully fetch audit Trail list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch audit Trail list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async auditTrailSearch (productType, productName, productServiceType, productStatus, bind, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while Fetching product list'
      let data = {}
      let _query
      if (productType === 'PT_PLAN_MST') {
        _query = `select distinct p.plan_id,p.plan_name,p.service_type,p.status,RC.Total_Recurring_Charge, NRC.Total_One_Time_Charge,
                cst.Subscribed_Customer_count,
                (cst.Subscribed_Customer_count::int*RC.Total_Recurring_Charge::int) as Total_Recurring_Charge_Revenue,
                (cst.Subscribed_Customer_count::int*NRC.Total_One_Time_Charge::int) as Total_One_time_Charge_Revenue
                from bcae_dev.plan_mst p
                left join (
                  select p2.plan_id,cm3.charge_cat,sum(pc2.charge_amount) as Total_One_Time_Charge
                  from plan_mst p2 
                  join plan_charge pc2 on pc2.plan_id =p2.plan_id 
                  join charge_mst cm3 on cm3.charge_id =pc2.charge_id 
                  where cm3.charge_cat ='CC_NRC'
                  group by p2.plan_id,cm3.charge_cat) NRC on NRC.plan_id=P.plan_id 
                left join (
                  select distinct p2.plan_id,sum(pc.charge_amount) as Total_Recurring_Charge
                  from plan_mst p2 
                  join plan_charge pc on pc.plan_id =p2.plan_id 
                  join charge_mst cm2 on cm2.charge_id =pc.charge_id
                  where cm2.charge_cat ='CC_RC'
                  group by p2.plan_id) RC on RC.plan_id=P.plan_id
                left JOIN(
                  select distinct p.plan_id,COUNT(c2.customer_id) as Subscribed_Customer_count 
                  from connections c 
                  left join accounts a2 on a2.account_id::int =c.account_id::int
                  left join customers c2 on c2.customer_id::int =a2.account_id::int
                  left join plan p on btrim(replace((c.mapping_payload->'planId')::text,'"',''),'[]')::text = p.plan_id::text
                  where btrim(replace((c.mapping_payload->'planId')::text,'"',''),'[]')::text is not NULL
                  group by p.plan_id ) cst on cst.plan_id=P.plan_id
                where 1 = 1 
                and coalesce(p.plan_name, null) = coalesce($productName, coalesce(p.plan_name, null))
                and coalesce(p.service_type, null) = coalesce($productServiceType, coalesce(p.service_type, null))
                and coalesce(p.status, null) = coalesce($productStatus, coalesce(p.status, null))`
      } else if (productType === 'PT_SERVICE_MST') {
        _query = `select distinct p.service_id,p.service_name,p.service_type,p.status,RC.Total_Recurring_Charge, NRC.Total_One_Time_Charge,
                cst.Subscribed_Customer_count,
                (cst.Subscribed_Customer_count::int*RC.Total_Recurring_Charge::int) as Total_Recurring_Charge_Revenue,
                (cst.Subscribed_Customer_count::int*NRC.Total_One_Time_Charge::int) as Total_One_time_Charge_Revenue
                from bcae_dev.service_mst p
                left join (
                  select p2.service_id,cm3.charge_cat,sum(pc2.charge_amount) as Total_One_Time_Charge
                  from service_mst p2 
                  join service_charge pc2 on pc2.service_id =p2.service_id 
                  join charge_mst cm3 on cm3.charge_id =pc2.charge_id 
                  where cm3.charge_cat ='CC_NRC'
                  group by p2.service_id,cm3.charge_cat) NRC on NRC.service_id=P.service_id 
                left join (
                  select distinct p2.service_id,sum(pc.charge_amount) as Total_Recurring_Charge
                  from service_mst p2 
                  join service_charge pc on pc.service_id =p2.service_id 
                  join charge_mst cm2 on cm2.charge_id =pc.charge_id
                  where cm2.charge_cat ='CC_RC'
                  group by p2.service_id) RC on RC.service_id=P.service_id
                left JOIN(
                  select distinct p.service_id,COUNT(c2.customer_id) as Subscribed_Customer_count 
                  from connections c 
                  left join accounts a2 on a2.account_id::int =c.account_id::int
                  left join customers c2 on c2.customer_id::int =a2.account_id::int
                  left join service_mst p on btrim(replace((c.mapping_payload->'serviceId')::text,'"',''),'[]')::text = p.service_id::text
                  where btrim(replace((c.mapping_payload->'serviceId')::text,'"',''),'[]')::text is not NULL
                  group by p.service_id) cst on cst.service_id=P.service_id
                where 1 = 1 
                and coalesce(p.service_name, null) = coalesce($productName, coalesce(p.service_name, null))
                and coalesce(p.service_type, null) = coalesce($productServiceType, coalesce(p.service_type, null))
                and coalesce(p.status, null) = coalesce($productStatus, coalesce(p.status, null))`
      } else if (productType === 'PT_ASSET_MST') {
        _query = `select distinct p.asset_id,p.asset_name,p.service_type,p.status,RC.Total_Recurring_Charge, NRC.Total_One_Time_Charge,
                cst.Subscribed_Customer_count,
                (cst.Subscribed_Customer_count::int*RC.Total_Recurring_Charge::int) as Total_Recurring_Charge_Revenue,
                (cst.Subscribed_Customer_count::int*NRC.Total_One_Time_Charge::int) as Total_One_time_Charge_Revenue
                from bcae_dev.asset_mst p
                left join (
                  select p2.asset_id,cm3.charge_cat,sum(pc2.charge_amount) as Total_One_Time_Charge
                  from asset_mst p2 
                  join asset_charge pc2 on pc2.asset_id =p2.asset_id 
                  join charge_mst cm3 on cm3.charge_id =pc2.charge_id 
                  where cm3.charge_cat ='CC_NRC'
                  group by p2.asset_id,cm3.charge_cat) NRC on NRC.asset_id=P.asset_id 
                left join (
                  select distinct p2.asset_id,sum(pc.charge_amount) as Total_Recurring_Charge
                  from asset_mst p2 
                  join asset_charge pc on pc.asset_id =p2.asset_id
                  join charge_mst cm2 on cm2.charge_id =pc.charge_id
                  where cm2.charge_cat ='CC_RC'
                  group by p2.asset_id) RC on RC.asset_id=P.asset_id
                left JOIN(
                  select distinct p.asset_id,COUNT(c2.customer_id) as Subscribed_Customer_count 
                  from connections c 
                  left join accounts a2 on a2.account_id::int =c.account_id::int
                  left join customers c2 on c2.customer_id::int =a2.account_id::int
                  left join asset_mst p on btrim(replace((c.mapping_payload->'assetId')::text,'"',''),'[]')::text = p.asset_id::text
                  where btrim(replace((c.mapping_payload->'assetId')::text,'"',''),'[]')::text is not NULL
                  group by p.asset_id ) cst on cst.asset_id=P.asset_id
                where 1 = 1 
                and coalesce(p.asset_name, null) = coalesce($productName, coalesce(p.asset_name, null))
                and coalesce(p.service_type, null) = coalesce($productServiceType, coalesce(p.service_type, null))
                and coalesce(p.status, null) = coalesce($productStatus, coalesce(p.status, null)) `
      } else if (productType === 'PT_ADDON_MST') {
        _query = `select distinct p.addon_id,p.addon_name,p.service_type,p.status,RC.Total_Recurring_Charge, NRC.Total_One_Time_Charge,
                cst.Subscribed_Customer_count,
                (cst.Subscribed_Customer_count::int*RC.Total_Recurring_Charge::int) as Total_Recurring_Charge_Revenue,
                (cst.Subscribed_Customer_count::int*NRC.Total_One_Time_Charge::int) as Total_One_time_Charge_Revenue
                from bcae_dev.addon_mst p
                left join (
                  select p2.addon_id,cm3.charge_cat,sum(pc2.charge_amount) as Total_One_Time_Charge
                  from addon_mst p2 
                  join addon_charge pc2 on pc2.addon_id =p2.addon_id 
                  join charge_mst cm3 on cm3.charge_id =pc2.charge_id 
                  where cm3.charge_cat ='CC_NRC'
                  group by p2.addon_id,cm3.charge_cat) NRC on NRC.addon_id=P.addon_id 
                left join (
                  select distinct p2.addon_id,sum(pc.charge_amount) as Total_Recurring_Charge
                  from addon_mst p2 
                  join addon_charge pc on pc.addon_id =p2.addon_id
                  join charge_mst cm2 on cm2.charge_id =pc.charge_id
                  where cm2.charge_cat ='CC_RC'
                  group by p2.addon_id) RC on RC.addon_id=P.addon_id
                left JOIN(
                  select distinct p.addon_id,COUNT(c2.customer_id) as Subscribed_Customer_count 
                  from connections c 
                  left join accounts a2 on a2.account_id::int =c.account_id::int
                  left join customers c2 on c2.customer_id::int =a2.account_id::int
                  left join addon_mst p on btrim(replace((c.mapping_payload->'addonId')::text,'"',''),'[]')::text = p.addon_id::text
                  where btrim(replace((c.mapping_payload->'addonId')::text,'"',''),'[]')::text is not NULL
                  group by p.addon_id ) cst on cst.addon_id=P.addon_id
                where 1 = 1 
                and coalesce(p.addon_name, null) = coalesce($productName, coalesce(p.addon_name, null))
                and coalesce(p.service_type, null) = coalesce($productServiceType, coalesce(p.service_type, null))
                and coalesce(p.status, null) = coalesce($productStatus, coalesce(p.status, null))`
      }

      let count = await conn.sequelize.query('select COUNT(t.*) FROM (' + _query + ') t', { type: QueryTypes.SELECT, bind })
      count = count[0].count

      if (page && limit) {
        _query = _query + ' limit ' + limit + ' offset ' + offSet
      }
      let rows = await conn.sequelize.query(_query, {
        bind,
        type: QueryTypes.SELECT
      })

      rows = camelCaseConversion(rows)
      rows = transformProductSearchResponse(rows, productType)
      const response = {
        rows,
        count
      }
      logger.debug('Successfully fetch product list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch product list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async slaSearch (interactionID, interactionType, woType, status, customerNo, customerName, billRefNumber, serviceNo, dateFrom, dateTo, aging, sla, reportType, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Successfully fetch ' + reportType + ' detailed list'
      let data = {}

      // Note : replace or to and condition after add the empty value of problem_code if not exists
      let query = `select * from vw_interaction_report irView
    where 1 = 1
    and coalesce(irView.interaction_id, -1) = coalesce($interactionID, coalesce(irView.interaction_id, -1))
    and coalesce(irView.interaction_type_code, null) = coalesce($interactionType, coalesce(irView.interaction_type_code, null))
    and coalesce(irView.wo_type, null) = coalesce($woType, coalesce(irView.wo_type, null))
    and coalesce(lower(irView.ticket_status), null) = coalesce(lower($status), coalesce(lower(irView.ticket_status), null))
    and coalesce(irView.customer_no, null) = coalesce($customerNo, coalesce(irView.customer_no, null))
    and coalesce(lower(irView.customer_name), null) like coalesce(lower($customerName), coalesce(lower(irView.customer_name), null))
    and coalesce(irView.bill_ref_no, -1) = coalesce($billRefNumber, coalesce(irView.bill_ref_no, -1))
    and coalesce(irView.identification_no, null) = coalesce($serviceNo, coalesce(irView.identification_no, null))
    and coalesce(irView.intxn_created_at::DATE) between coalesce($dateFrom, irView.intxn_created_at::DATE) AND coalesce($dateTo, irView.intxn_created_at::DATE)
    order by intxn_created_at desc`

      const bind = {
        interactionID: interactionID || null,
        interactionType: interactionType || null,
        woType: woType || null,
        status: status || null,
        customerNo: customerNo || null,
        customerName: customerName ? '%' + customerName + '%' : null,
        billRefNumber: billRefNumber || null,
        serviceNo: serviceNo || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        aging: aging || null,
        sla: sla || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      let rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      rows = transformOpenClosedSLADeptInteractionSearchResponse(rows)
      const response = {
        rows,
        count
      }

      logger.debug('Successfully fetch ' + reportType + ' detailed list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch ' + reportType + ' detailed list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async deptwiseInteractionSearch (interactionID, interactionType, woType, status, customerType, customerNo, customerName, billRefNumber, serviceNo, dateFrom, dateTo, aging, sla, reportType, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Successfully fetch ' + reportType + ' detailed list'
      let data = {}

      // Note : replace or to and condition after add the empty value of problem_code if not exists
      let query = `select * from vw_interaction_report irView
    where 1 = 1
    and coalesce(irView.interaction_id, -1) = coalesce($interactionID, coalesce(irView.interaction_id, -1))
    and coalesce(irView.interaction_type_code, null) = coalesce($interactionType, coalesce(irView.interaction_type_code, null))
    and coalesce(irView.wo_type, null) = coalesce($woType, coalesce(irView.wo_type, null))
    and coalesce(lower(irView.ticket_status), null) = coalesce(lower($status), coalesce(lower(irView.ticket_status), null))
    and coalesce(upper(irView.cust_type_code), null) = coalesce(upper($customerType), coalesce(upper(irView.cust_type_code), null))
    and coalesce(irView.customer_no, null) = coalesce($customerNo, coalesce(irView.customer_no, null))
    and coalesce(lower(irView.customer_name), null) like coalesce(lower($customerName), coalesce(lower(irView.customer_name), null))
    and coalesce(irView.bill_ref_no, -1) = coalesce($billRefNumber, coalesce(irView.bill_ref_no, -1))
    and coalesce(irView.identification_no, null) = coalesce($serviceNo, coalesce(irView.identification_no, null))
    and coalesce(irView.intxn_created_at::DATE) between coalesce($dateFrom, irView.intxn_created_at::DATE) AND coalesce($dateTo, irView.intxn_created_at::DATE)
    order by intxn_created_at desc`

      const bind = {
        interactionID: interactionID || null,
        interactionType: interactionType || null,
        woType: woType || null,
        status: status || null,
        customerType: customerType || null,
        customerNo: customerNo || null,
        customerName: customerName ? '%' + customerName + '%' : null,
        billRefNumber: billRefNumber || null,
        serviceNo: serviceNo || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        aging: aging || null,
        sla: sla || null
      }
      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      let rows = await sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      rows = transformOpenClosedSLADeptInteractionSearchResponse(rows)
      const response = {
        rows,
        count
      }

      logger.debug('Successfully fetch ' + reportType + ' detailed list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch ' + reportType + ' detailed list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async invoiceSearch (customerNo, customerName, customerType, billRefNumber, invoiceNumber, invoiceDate, invoiceStatus, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching Invoice detailed list'
      let data = {}

      let query = `select distinct concat(c.first_name, c.last_name) AS customer_name,c.crm_customer_no ,c.cust_type ,i.bill_ref_no,
                i.inv_no ,i.inv_date ,i.inv_start_date ,i.inv_end_date ,i.inv_amt , i.inv_os_amt, i.adv_amount ,i.invoice_status 
                from invoice i  
                inner join invoice_dtl id on i.invoice_id = id.invoice_id
                inner join customers c on i.customer_id = c.customer_id
                and coalesce(c.crm_customer_no, null) = coalesce($customerNo, coalesce(c.crm_customer_no, null))
                and coalesce(lower(concat(c.first_name, c.last_name)), null) like coalesce(lower($customerName), coalesce(lower(concat(c.first_name, c.last_name)), null))
                and coalesce(c.cust_type, null) = coalesce($customerType, coalesce(c.cust_type, null))
                and coalesce(i.bill_ref_no, -1) = coalesce($billRefNumber, coalesce(i.bill_ref_no, -1))
                and coalesce(i.inv_no, -1) = coalesce($invoiceNumber, coalesce(i.inv_no, -1))
                and coalesce(UPPER(i.invoice_status), null) = coalesce(UPPER($invoiceStatus), coalesce(UPPER(i.invoice_status), null))
                and coalesce(i.inv_date::DATE) = coalesce($invoiceDate, i.inv_date::DATE) `

      const bind = {
        customerNo: customerNo || null,
        customerName: customerName ? '%' + customerName + '%' : null,
        customerType: customerType || null,
        billRefNumber: billRefNumber || null,
        invoiceNumber: invoiceNumber || null,
        invoiceDate: invoiceDate || null,
        invoiceStatus: invoiceStatus || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      let rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })
      rows = camelCaseConversion(rows)

      rows = transformInvoiceSearchResponse(rows)
      const response = {
        rows,
        count
      }

      logger.debug('Successfully fetch Invoice detailed list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch Invoice detailed list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async billingSearch (customerNo, customerName, customerType, billRefNumber, serviceNo, contractID, contractStartDate, contractEndDate, contractStatus, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching Billing detailed list'
      let data = {}

      let query = `select distinct cc.crm_customer_no AS customer_no,concat(cc.first_name, cc.last_name) AS customer_name,cc.cust_type AS cust_type,
      bd.bill_ref_no,c.contract_id ,cd.identification_no  as service_no,c.contract_name ,c.start_date ,c.end_date ,c.status,cm.charge_name,
      cd.charge_type ,cd.charge_amt,bd.currency ,cd.frequency ,cd.prorated,cd.credit_adj_amount ,cd.debit_adj_amount,
      cd.last_bill_period ,cd.next_bill_period 
      from billable_details bd 
      LEFT JOIN customers cc ON cc.customer_id::text = bd.customer_id::text
      LEFT JOIN business_entity ctbe ON ctbe.code::text = cc.cust_type::text
      LEFT JOIN contract c ON c.bill_ref_no::text = bd.bill_ref_no::text
      LEFT JOIN monthly_contract_dtl cd ON cd.contract_id = c.contract_id
      LEFT JOIN charge_mst cm ON cd.charge_id = cm.charge_id
      where  1=1
      or coalesce(cc.crm_customer_no, null) = coalesce($customerNo, coalesce(cc.crm_customer_no, null))
      or coalesce(lower(concat(cc.first_name, cc.last_name)), null) like coalesce(lower($customerName), coalesce(lower(concat(cc.first_name, cc.last_name)), null))
      or coalesce(cc.cust_type, null) = coalesce($customerType, coalesce(cc.cust_type, null))
      or coalesce(bd.bill_ref_no, -1) = coalesce($billRefNumber, coalesce(bd.bill_ref_no, -1))
      or coalesce(cd.identification_no, null) = coalesce($serviceNo, coalesce(cd.identification_no, null))
      or coalesce(c.contract_id, -1) = coalesce($contractID, coalesce(c.contract_id, -1))
      or coalesce(c.start_date::DATE) = coalesce($contractStartDate, c.start_date::DATE) 
      or coalesce(c.end_date::DATE) = coalesce($contractEndDate, c.end_date::DATE)
      or coalesce(c.status, null) = coalesce($contractStatus, coalesce(c.status, null)) `

      const bind = {
        customerNo: customerNo || null,
        customerName: customerName ? '%' + customerName + '%' : null,
        customerType: customerType || null,
        billRefNumber: billRefNumber || null,
        serviceNo: serviceNo || null,
        contractID: contractID || null,
        contractStartDate: contractStartDate || null,
        contractEndDate: contractEndDate || null,
        contractStatus: contractStatus || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      let rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      rows = camelCaseConversion(rows)

      rows = transformBillingSearchResponse(rows)
      const response = {
        rows,
        count
      }

      logger.debug('Successfully fetch Billing detailed list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully fetch Invoice detailed list'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async followupCount (entity, reportType, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching ' + reportType + ' Report'
      let data = {}

      let query = `select * from follow_up_dept_report_vw flwView
      where 1 = 1
      and coalesce(lower(flwView.department), null) = coalesce(lower($entity), coalesce(lower(flwView.department), null))
      `

      const bind = {
        entity: entity || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      logger.debug('Successfully Fetched ' + reportType + ' Report')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched ' + reportType + ' Report'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async followup (frequency, reportType, entity, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching ' + reportType + ' Report'
      let data = {}

      let query = `select * from follow_up_freq_report_vw flwView
                where 1 = 1
                and coalesce(flwView.follow_up_frequency, null) = coalesce($frequency, coalesce(flwView.follow_up_frequency, null))
                and coalesce(lower(flwView.department), null) = coalesce(lower($entity), coalesce(lower(flwView.department), null))
                `

      const bind = {
        frequency: frequency || null,
        entity: entity || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      logger.debug('Successfully Fetched ' + reportType + ' Report')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched ' + reportType + ' Report'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async followupInteraction (reportType, frequency, entity, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching ' + reportType + ' Report'
      let data = {}

      let query = `select * from follow_up_freq_dtl_vw flwView where 1=1
      and coalesce(lower(flwView.department), null) = coalesce(lower($entity), coalesce(lower(flwView.department), null))
      and coalesce(lower(flwView.follow_up_frequency ::text), null) = coalesce(lower($frequency ::text ),
       coalesce(lower(flwView.follow_up_frequency ::text), null)) order by intxn_id desc
       `
      const bind = {
        frequency: frequency || null,
        entity: entity || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      logger.debug('Successfully Fetched ' + reportType + ' Report')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched ' + reportType + ' Report'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async tatReport (reportType, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching ' + reportType + ' Report'
      let data = {}

      const fnquery = `select tat_report_fn()
     `
      let query = `select * from tat_report
    order by order_seq
     `
      const executefn = await sequelize.query(fnquery, {
        type: QueryTypes.SELECT
      })

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      logger.debug('Successfully Fetched ' + reportType + ' Report')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched ' + reportType + ' Report'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async fcrMisReport (reportType, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching ' + reportType + ' Report'
      let data = {}

      const fnquery = `select get_fcr_report()
      `
      let query = `select * from fcr_report
      `

      const executefn = await conn.sequelize.query(fnquery, {
        type: QueryTypes.SELECT
      })

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      logger.debug('Successfully Fetched ' + reportType + ' Report')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched ' + reportType + ' Report'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async createdInteractionSearch (interactionID, interactionType, woType, intxnstatus, customerType,
    problemType, customerNo, customerName, billRefNumber, serviceNo,
    dateFrom, dateTo, reportType, entity, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching ' + reportType + ' Report'
      let data = {}

      let query = `select * from vw_interaction_report irView
      where 1 = 1
      and coalesce(lower(irView.for_entity), null) like coalesce(lower($forEntity), coalesce(lower(irView.for_entity), null))
      and coalesce(irView.interaction_id, -1) = coalesce($interactionID, coalesce(irView.interaction_id, -1))
      and coalesce(lower(irView.ticket_status), null) = coalesce(lower($intxnstatus), coalesce(lower(irView.ticket_status), null))
      and coalesce(irView.cust_type_code, null) = coalesce($customerType, coalesce(irView.cust_type_code, null))
      and coalesce(irView.problem_type, null) = coalesce($problemType, coalesce(irView.problem_type, null))
      and coalesce(irView.interaction_type_code, null) = coalesce($interactionType, coalesce(irView.interaction_type_code, null))
      and coalesce(lower(irView.customer_name), null) like coalesce(lower($customerName), coalesce(lower(irView.customer_name), null))
      and coalesce(irView.intxn_created_at::DATE) between coalesce($dateFrom, irView.intxn_created_at::DATE) AND coalesce($dateTo, irView.intxn_created_at::DATE)               
      order by intxn_created_at desc`

      const bind = {
        interactionID: interactionID || null,
        interactionType: interactionType || null,
        woType: woType || null,
        intxnstatus: intxnstatus || null,
        customerType: customerType || null,
        problemType: problemType || null,
        customerNo: customerNo || null,
        customerName: customerName ? '%' + customerName + '%' : null,
        billRefNumber: billRefNumber || null,
        serviceNo: serviceNo || null,
        forEntity: entity || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      let rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      rows = transformOpenClosedSLADeptInteractionSearchResponse(rows)
      const response = {
        rows,
        count
      }

      logger.debug('Successfully fetched ' + reportType + ' detailed list')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched ' + reportType + ' Report'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async fcrReport (interactionID, interactionType, problemType, serviceType, dateFrom, dateTo, reportType, role, compliance, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching ' + reportType + ' Report'
      let data = {}

      const fnquery = `select get_dept_fcr_report_tkt()
      `
      let query = `select * from dept_fcr_report fcr
     where 1 = 1
     and coalesce(fcr.intxn_id, null) = coalesce($interactionID, coalesce(fcr.intxn_id, null))
     and coalesce(fcr.intxn_type, null) = coalesce($interactionType, coalesce(fcr.intxn_type, null))
     and coalesce(fcr.prob_type, null) = coalesce($problemType, coalesce(fcr.prob_type, null))
     and coalesce(fcr.srvc_type, null) = coalesce($serviceType, coalesce(fcr.srvc_type, null))
     and coalesce(fcr.comp_ncomp, null) = coalesce($compliance, coalesce(fcr.comp_ncomp, null))
     and coalesce(fcr.role_name, null) = coalesce($role, coalesce(fcr.role_name, null))
     and coalesce(fcr.tkt_dt::DATE) between coalesce($dateFrom, fcr.tkt_dt::DATE) AND coalesce($dateTo, fcr.tkt_dt::DATE)               
     order by tkt_dt desc`

      const bind = {
        interactionID: interactionID || null,
        interactionType: interactionType || null,
        problemType: problemType || null,
        serviceType: serviceType || null,
        role: role || null,
        compliance: compliance || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null
      }

      const executefn = await conn.sequelize.query(fnquery, {
        type: QueryTypes.SELECT
      })

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      logger.debug('Successfully Fetched ' + reportType + ' Report')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched ' + reportType + ' Report'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async fcrAgentReport (reportType, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching ' + reportType + ' Report'
      let data = {}

      const fnquery = 'select get_agent_fcr_report($interactionType)'
      let query = 'select * from agent_fcr_report'
      const bind = {
        interactionType: interactionType || null
      }

      const executefn = await conn.sequelize.query(fnquery, {
        bind,
        type: QueryTypes.SELECT
      })

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      logger.debug('Successfully Fetched ' + reportType + ' Report')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched ' + reportType + ' Report'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async ticketStatistics (reportType, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching ' + reportType + ' Report'
      let data = {}

      const fnquery = 'select ct_stat_rpt(\'DAY\',$dateTo,$dateRange)'

      let query = ` select * from stat_rpt_temp1 tkts
    where to_date(tkts.curr_range,'DD-MM-YY') between coalesce(to_date($dateFrom,'YY-MM-DD'), to_date(tkts.curr_range,'DD-MM-YY')) 
    and coalesce(to_date($dateTo,'YY-MM-DD'), to_date(tkts.curr_range,'DD-MM-YY')) 
    order by tkts.curr_range desc
     `
      const bind = {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null
      }

      const fnbind = {
        dateTo: dateTo || null,
        dateRange: dateRange || null
      }

      const executefn = await conn.sequelize.query(fnquery, {
        bind: fnbind,
        type: QueryTypes.SELECT
      })

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      logger.debug('Successfully Fetched ' + reportType + ' Report')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched ' + reportType + ' Report'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async followupCountdtl (entity, reportType, limit, page, offSet) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      let status = statusCodeConstants.ERROR
      let message = 'Error while fetching ' + reportType + ' Report'
      let data = {}

      let query = `select * from follow_up_dept_report_dtl_vw flwView
      where 1 = 1
      and coalesce(lower(flwView.department), null) = coalesce(lower($entity), coalesce(lower(flwView.department), null))
      `

      const bind = {
        entity: entity || null
      }

      let count = await conn.sequelize.query(
        'select COUNT(*) FROM (' + query + ') t',
        {
          bind,
          type: QueryTypes.SELECT
        }
      )
      count = count[0].count
      if (page && limit) {
        query = query + ' limit ' + limit + ' offset ' + offSet
      }

      const rows = await conn.sequelize.query(query, {
        bind,
        type: QueryTypes.SELECT
      })

      const response = {
        rows,
        count
      }
      logger.debug('Successfully Fetched ' + reportType + ' Report')
      status = statusCodeConstants.SUCCESS
      message = 'Successfully Fetched ' + reportType + ' Report'
      data = response
      return { status, message, data }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async fetchGuestToken (dashboardObj) {
    let accessToken = await fetchAccessToken()
    accessToken = JSON.parse(accessToken)

    try {
      const body = {
        resources: [
          {
            type: 'dashboard',
            id: dashboardObj
          }
        ],
        rls: [],
        user: {
          username: 'Guest',
          first_name: 'Guest',
          last_name: 'User'
        }
      }
      const url = `${bi.endPoint}${bi.guestToken}`
      const tokenResponse = await Got.post({
        url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.access_token}`
        },
        body: JSON.stringify(body)
      })

      const response = tokenResponse?.body
      console.log('response========================>', JSON.parse(response)?.token)
      return { status: statusCodeConstants.SUCCESS, message: 'Success', data: JSON.parse(response)?.token }
    } catch (error) {
      console.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createSurvey (surveyData, userId, conn, t) {
    console.log(surveyData)
    let survey
    try {
      // for (const surveyEntry of resultArray) {
      const { metaData, responseDate } = surveyData
      survey = await conn.SurveyHdr.create({
        surveyName: surveyData.surveyName,
        surveyRefNo: surveyData.surveyId,
        emailId: metaData['Please enter your Email'],
        contactNo: metaData['Contact No.'],
        customerName: metaData.PRTNAME,
        manager: surveyData.businessName,
        success: surveyData.success,
        totalResponseCount: surveyData.totalResponseCount,
        totalPages: surveyData.totalPages,
        feedbacksCount: surveyData.feedbacksCount,
        responseDate,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date()
      },
      { transaction: t }
      )

      console.log('Survey entry inserted:', survey.surveyId)

      if (Array.isArray(surveyData.events)) {
        for (const event of surveyData.events) {
          const obj = {
            surveyId: survey.surveyId,
            questionRefId: event.questionId,
            answers: event.answers,
            category: event.category,
            sentiment: event.sentiment,
            questionText: event.questionText,
            npsText: event.npsText,
            npsValue: event.npsValue,
            questionType: event.questionType,
            subType: event.subType,
            metricName: event.metricName,
            metricId: event.metricId,
            metricScore: event.metricScore,
            metricScale: event.metricScale,
            npsName: event.npsName,
            createdBy: userId,
            createdAt: new Date(),
            updatedBy: userId,
            updatedAt: new Date()
          }

          await conn.SurveyDtl.create(obj, { transaction: t })
        }
      }

      await conn.sequelize.query(`SELECT "bcae_app".fens_summary_fn(${survey.surveyId})`, {
        type: QueryTypes.SELECT,
        transaction: t
      })
      return { status: statusCodeConstants.SUCCESS, message: 'Success', data: survey.surveyId }
    } catch (error) {
      console.error('Error inserting survey entry:', error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getiFrameLink () {
    // you will need to install via 'npm install jsonwebtoken' or in your package.json

    const jwt = require('jsonwebtoken')

    const METABASE_SITE_URL = 'http://192.168.201.150:8090'
    const METABASE_SECRET_KEY = 'be713989ac2b48b021247d932be513278eead7fb686a107ef96d86b783b90a06'

    const payload = {
      resource: { dashboard: 1 },
      params: {},
      exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
    }
    const token = jwt.sign(payload, METABASE_SECRET_KEY)

    const iframeUrl = METABASE_SITE_URL + '/embed/dashboard/' + token + '#bordered=true&titled=true&branding=false'

    return { status: statusCodeConstants.SUCCESS, message: 'Success', data: { iframeUrl } }
  }

  async getSurveyStats (inputData, conn) {
    const surveyDet = await conn.SurveyHdr.findAll({
      include: [
        { model: conn.SurveySummary, as: 'surveySummary', where: { status: 'AC' } }
      ],
      where: {
        status: 'AC',
        surveyRefNo: inputData.surveyRefNo
      },
      logging: true
    })

    return { status: statusCodeConstants.SUCCESS, message: 'Success', data: surveyDet }
  }

  async getSurveyExportExcel (inputData, conn) {
    const surveyDet = await conn.SurveyHdr.findOne({
      include: [
        {
          model: conn.SurveyDtl,
          as: 'surveyDtl',
          include: [
            {
              model: conn.Questionare,
              as: 'questions'
            }
          ]
        },
        { model: conn.SurveySummary, as: 'surveySummary', where: { status: 'AC' } }
      ],
      where: {
        status: 'AC',
        surveyRefNo: inputData.surveyRefNo,
        [Op.or]: {
          customerName: inputData.customerName,
          contactNo: inputData.contactNo === '' ? 0 : inputData.contactNo
        }
      },
      logging: true
    })

    console.log('surveyDet=========', JSON.stringify(surveyDet))

    const obj = {
      Name: surveyDet.customerName,
      Age: surveyDet.customerAge,
      Gender: surveyDet.gender,
      'Contact No.': surveyDet.contactNo,
      Email: surveyDet.emailId
    }

    for (const dtl of surveyDet.surveyDtl) {
      obj[dtl.questionText] = [
        dtl.answers,
        dtl.responseCalculatedValue
      ]
    }

    const sheet1 = Object.entries(obj).map(([key, value]) => ({
      property1: key,
      property2: Array.isArray(value) ? value[0] : value
    }))

    const sheet2 = Object.entries(obj).map(([key, value]) => ({
      property1: key,
      property2: Array.isArray(value) ? value[0] : value,
      property3: Array.isArray(value) ? value[1] : ''
    }))

    const obj2 = {}

    for (const dtl of surveyDet.surveySummary) {
      obj2[dtl.questionCategory] = dtl.fensScore
    }

    const sheet3 = Object.entries(obj2).map(([key, value]) => ({
      property1: key,
      property2: Array.isArray(value) ? value[0] : value
    }))

    const sheets = [
      {
        sheetName: 'Sheet1',
        data: sheet1
      },
      {
        sheetName: 'Sheet2',
        data: sheet2
      },
      {
        sheetName: 'Sheet3',
        data: sheet3
      }
    ]
    return { status: statusCodeConstants.SUCCESS, message: 'Success', data: sheets }
  }

  async getAggregationData (payload, conn) {
    try {
      const types = [
        { key: 'FENS', value: ['Functional', 'Emotional', 'Nutritional', 'Spiritual'] },
        { key: 'SNEF', value: ['Spiritual', 'Nutritional', 'Emotional', 'Functional'] }
      ]
      const surveyWhereClasus = {}
      let getServiceIds = []
      if (payload?.fromDate && payload?.toDate) {
        surveyWhereClasus.createdAt = {
          [Op.between]: [moment(payload?.fromDate).format('YYYY-MM-DD HH:mm:ss'), moment(payload?.toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')]
        }
      } else {
        surveyWhereClasus.createdAt = {
          [Op.between]: [moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('day').endOf('month').format('YYYY-MM-DD HH:mm:ss')]
        }
      }
      if (payload && payload?.surveyNo) {
        surveyWhereClasus.surveyRefNo = payload?.surveyNo
      }
      getServiceIds = await conn.SurveyHdr.findAll({
        attributes: ['surveyId'],
        where: { ...surveyWhereClasus }
      })
      const surveySummaryWhereClasus = { questionCategory: { [Op.ne]: null }, fensScore: { [Op.ne]: null } }

      if (getServiceIds && Array.isArray(getServiceIds) && getServiceIds.length > 0) {
        surveySummaryWhereClasus.surveyId = getServiceIds?.map((i) => i.surveyId)
      } else {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'No record Found',
          data: []
        }
      }

      const surverySummary = await conn.SurveySummary.findAll({
        attributes: ['questionCategory', 'fensScore', [conn.sequelize.fn('count', conn.sequelize.col('survey_sum_id')), 'surveyCount']],
        group: ['questionCategory', 'fensScore'],
        where: { ...surveySummaryWhereClasus }
      })

      if (!surverySummary || (Array.isArray(surverySummary) && surverySummary.length === 0)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'No record Found',
          data: []
        }
      }
      let dataOrder = []
      if (payload && payload?.type) {
        dataOrder = types?.filter((e) => e.key === payload?.type)?.map((r) => r?.value)
      }
      const getetXseries = [...new Set(surverySummary?.map(item => item?.fensScore))]?.sort((a, b) => (Number(a) > Number(b)) ? 1 : ((Number(b) > Number(a)) ? -1 : 0))
      const serviceData = []
      for (let x = getetXseries?.[0]; x <= getetXseries?.[getetXseries.length - 1]; x++) {
        const elementSeries = []
        dataOrder?.[0]?.forEach((y) => {
          const element = surverySummary?.filter((s) => {
            if (s?.questionCategory === y && s?.fensScore === x) {
              return s
            }
            return false
          })
          elementSeries.push(Number(element?.[0]?.dataValues?.surveyCount) || 0)
        })
        serviceData.push({ name: x, data: elementSeries })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Survey Details fetched successfully',
        data: {
          service: serviceData,
          yAxis: dataOrder?.[0] || []
        }
      }
    } catch (error) {
      logger.error('Error inserting survey entry:', error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
}

async function fetchAccessToken () {
  try {
    const url = `${bi.endPoint}${bi.login}`
    const body = {
      password: 'Test@123',
      provider: 'db',
      refresh: true,
      username: 'SRINIVASAN'
    }
    console.log('inside api')
    const tokenResponse = await Got.post({
      url,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const response = tokenResponse?.body
    logger.debug('Smarten Token got successfully')
    return response
  } catch (error) {
    logger.error(error)
    return statusCodeConstants.ERROR
  }
}

module.exports = ReportService
