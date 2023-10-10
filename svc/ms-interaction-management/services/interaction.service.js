/* eslint-disable array-callback-return */
/* eslint-disable camelcase */
import { config } from '@config/env.config'
import em from '@emitters'
import { db } from '@models'
import interactionResources from '@resources'
import {
  businessEntity, camelCaseConversion, customerInteractionEmoji, defaultCode, defaultMessage,
  defaultStatus, entityCategory,
  getbusinessEntity,
  groupByCount, interactionFlowAction, logger,
  orderFlowAction,
  statusCodeConstants
} from '@utils'
import axios from 'axios'
import { isEmpty } from 'lodash'
import moment from 'moment'
import { Op, QueryTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { assignWFToEntity, getWFState, startWorkFlowEngineManual, updateWFState } from './workflow.service'
// import { properties } from '../../../web/src/properties'
const https = require('https')

const emoji = require('node-emoji')
let { systemUserId, systemRoleId, systemDeptId, bcae: bcaeConfig } = config

let instance

class InteractionService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async interactionPriorityStatusWiseList(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : null // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : null // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : null // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : null

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_intxn_by_priority_status_list_fn
        (
        ${i_entity_id},
        ${i_role_id},
        ${i_user_id},
        ${i_from_date},
        ${i_to_date},
        ${i_status},
        ${i_intxn_type},
        ${i_intxn_category},
        ${i_service_type},
        ${i_service_category},
        ${i_channel},
        ${i_priority},
        ${i_project},
        ${i_country},
        ${i_district},
        ${i_city},
        ${i_category}
        )`

      console.log('interactionSql----xxxxxx---->', interactionSql)
      let priorityStatusList = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      priorityStatusList = camelCaseConversion(priorityStatusList)

      const data = {
        count: {
          customerWiseCount: priorityStatusList?.length ? priorityStatusList?.length : 0
        },
        rows: priorityStatusList
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'priority and status list wise data fetched succesfully',
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

  async interactionPriorityStatusWise(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : null // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : null // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : null // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : null

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_intxn_by_priority_status_fn
        (
        ${i_entity_id},
        ${i_role_id},
        ${i_user_id},
        ${i_from_date},
        ${i_to_date},
        ${i_status},
        ${i_intxn_type},
        ${i_intxn_category},
        ${i_service_type},
        ${i_service_category},
        ${i_channel},
        ${i_priority},
        ${i_project},
        ${i_country},
        ${i_district},
        ${i_city},
        ${i_category}
        )`

      let priorityStatus = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      priorityStatus = camelCaseConversion(priorityStatus)

      const data = {
        count: {
          customerWiseCount: priorityStatus?.length ? priorityStatus?.length : 0
        },
        rows: priorityStatus
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'priority and status wise data fetched succesfully',
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

  async locationWise(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : null // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : null // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : null // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : null

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_id_intxn_by_location_fn
        (
        ${i_entity_id},
        ${i_role_id},
        ${i_user_id},
        ${i_from_date},
        ${i_to_date},
        ${i_status},
        ${i_intxn_type},
        ${i_intxn_category},
        ${i_service_type},
        ${i_service_category},
        ${i_channel},
        ${i_priority},
        ${i_project},
        ${i_country},
        ${i_district},
        ${i_city},
        ${i_category}
        )`

      let locationWiseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      locationWiseData = camelCaseConversion(locationWiseData)

      const data = {
        count: {
          customerWiseCount: locationWiseData?.length ? locationWiseData?.length : 0
        },
        rows: locationWiseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'location wise data fetched succesfully',
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

  async customerWise(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'COUNT\'' // text (LIST, COUNT)
      const i_category_type = searchParams?.categoryType ? `'${searchParams?.categoryType}'` : null

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_id_intxn_customer_type_fn
        (
        ${i_entity_id},
        ${i_role_id},
        ${i_user_id},
        ${i_from_date},
        ${i_to_date},
        ${i_status},
        ${i_intxn_type},
        ${i_intxn_category},
        ${i_service_type},
        ${i_service_category},
        ${i_channel},
        ${i_priority},
        ${i_project},
        ${i_country},
        ${i_district},
        ${i_city},
        ${i_category},
        ${i_category_type}
        )`

      console.log('interactionSql-----team wise---->', interactionSql)
      let customerWiseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      customerWiseData = camelCaseConversion(customerWiseData)

      const data = {
        count: {
          customerWiseCount: customerWiseData?.length ? customerWiseData?.length : 0
        },
        rows: {
          customerWiseData
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'customer wise data fetched succesfully',
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

  async liveCustomerWise(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'COUNT\'' // text (LIST, COUNT)
      const i_category_type_internal = '\'Internal\'' ?? null
      const i_category_type_external = '\'External\'' ?? null

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionInternalSql = `select * from dtworks_id_intxn_customer_type_fn
        (
        ${i_entity_id},
        ${i_role_id},
        ${i_user_id},
        ${i_from_date},
        ${i_to_date},
        ${i_status},
        ${i_intxn_type},
        ${i_intxn_category},
        ${i_service_type},
        ${i_service_category},
        ${i_channel},
        ${i_priority},
        ${i_project},
        ${i_country},
        ${i_district},
        ${i_city},
        ${i_category},
        ${i_category_type_internal}
        )`
      const interactionExternalSql = `select * from dtworks_id_intxn_customer_type_fn
        (
        ${i_entity_id},
        ${i_role_id},
        ${i_user_id},
        ${i_from_date},
        ${i_to_date},
        ${i_status},
        ${i_intxn_type},
        ${i_intxn_category},
        ${i_service_type},
        ${i_service_category},
        ${i_channel},
        ${i_priority},
        ${i_project},
        ${i_country},
        ${i_district},
        ${i_city},
        ${i_category},
        ${i_category_type_external}
        )`

      let customerWiseInternalData = await conn.sequelize.query(interactionInternalSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      let customerWiseExternalData = await conn.sequelize.query(interactionExternalSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      customerWiseInternalData = camelCaseConversion(customerWiseInternalData)
      customerWiseExternalData = camelCaseConversion(customerWiseExternalData)

      const data = {
        count: {
          customerWiseInternalData: customerWiseInternalData?.length ? customerWiseInternalData?.length : 0,
          customerWiseExternalData: customerWiseExternalData?.length ? customerWiseExternalData?.length : 0
        },
        rows: [...customerWiseInternalData, ...customerWiseExternalData]
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'live customer wise data fetched succesfully',
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

  async npsCsatChamp(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'CHANNEL\'' // text (LIST, COUNT)

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_intxn_dashboard_nps_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city},
      ${i_limit},
      ${i_offset}
      )`

      const champSql = `select * from dtworks_intxn_dashboard_automation_score_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city}
      )`

      let npsResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      let champResponseData = await conn.sequelize.query(champSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      npsResponseData = camelCaseConversion(npsResponseData)
      champResponseData = camelCaseConversion(champResponseData)

      const data = {
        count: {
          npsCount: npsResponseData?.length ? npsResponseData?.length : 0,
          champCount: champResponseData.length ? champResponseData.length : 0
        },
        rows: {
          champResponseData,
          npsResponseData
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'nps and champ data fetched succesfully',
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

  async liveInteractionsByStatus(searchParams, departmentId, roleId, userId, conn) {
    try {
      const whereClause = {}

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

      const interactionsDetails = await conn.Interaction.findAndCountAll({
        attributes: ['createdAt', 'intxnStatus'],
        include: [
          {
            model: conn.User,
            as: 'currUserDetails',
            attributes: ['firstName', 'lastName', 'userId']
          },
          {
            model: conn.BusinessEntity,
            as: 'currStatusDesc',
            attributes: ['code', 'description']
          }
        ],
        where: whereClause,
        order: [['createdAt', 'DESC']],
        logging: true
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions status wise details fetched Successfully',
        data: interactionsDetails
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async liveProjectWise(searchParams, departmentId, roleId, userId, conn) {
    try {
      const whereClause = {}

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

      const interactionsDetails = await conn.Interaction.findAndCountAll({
        attributes: ['createdAt', 'intxnStatus', 'project'],
        include: [
          {
            model: conn.User,
            as: 'currUserDetails',
            attributes: ['firstName', 'lastName', 'userId']
          },
          {
            model: conn.BusinessEntity,
            as: 'currStatusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'projectDesc',
            attributes: ['code', 'description']
          }
        ],
        where: whereClause,
        order: [['createdAt', 'DESC']],
        logging: true
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions project wise details fetched Successfully',
        data: interactionsDetails
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async resolutionMttrWaiting(interactionData, userId, roleId, departmentId, conn) {
    try {
      const searchParams = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'CHANNEL\'' // text (LIST, COUNT)

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const avgWaitingSql = `select * from dtworks_id_intxn_avg_wait_time_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city}
      )`

      const avgResolutionTimeSql = `select * from dtworks_id_intxn_avg_resolution_time_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city}
      )`

      const mttrSql = `select * from dtworks_id_intxn_mttr_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city}
      )`

      let avgWaitingData = await conn.sequelize.query(avgWaitingSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      let avgResolutionTimeData = await conn.sequelize.query(avgResolutionTimeSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      let mttrData = await conn.sequelize.query(mttrSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      avgWaitingData = camelCaseConversion(avgWaitingData)
      avgResolutionTimeData = camelCaseConversion(avgResolutionTimeData)
      mttrData = camelCaseConversion(mttrData)

      const data = {
        count: {
          avgWaitingCount: avgWaitingData?.length ? avgWaitingData?.length : 0,
          avgResolutionTimeCount: avgResolutionTimeData.length ? avgResolutionTimeData.length : 0,
          mttrCount: mttrData.length ? mttrData.length : 0
        },
        rows: {
          avgWaitingData,
          avgResolutionTimeData,
          mttrData
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'resoltion waiting and mttr data fetched succesfully',
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

  async getTopStatements(interactionData, userId, roleId, departmentId, conn) {
    try {
      const searchParams = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'CHANNEL\'' // text (LIST, COUNT)

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_id_top_category_cnt_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city},
      ${i_category})`
      console.log('interactionSql-----statement wise-------->', interactionSql)
      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData.length : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Statement wise Interactions fetched succesfully',
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

  async getTopStatementList(interactionData, userId, roleId, departmentId, conn) {
    try {
      const searchParams = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_statement = searchParams?.statement ? `'${searchParams?.statement}'` : `''`
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'STATEMENT\'' // text (LIST, COUNT)

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_id_top_category_list_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city},
      ${i_statement},
      ${i_category})`
      console.log('interactionSql-----statement wise list-------->', interactionSql)
      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData.length : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Statement wise List Interactions fetched succesfully',
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

  async getTopInteractionsByChannel(interactionData, userId, roleId, departmentId, conn) {
    try {
      const searchParams = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'CHANNEL\'' // text (LIST, COUNT)

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_id_top_category_cnt_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city},
      ${i_category})`

      console.log('interactionSql-------xx--------->', interactionSql)

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData.length : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Statement wise Interactions fetched succesfully',
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

  async getTopInteractionsByChannelList(interactionData, userId, roleId, departmentId, conn) {
    try {
      const searchParams = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_statement = searchParams?.statement ? `'${searchParams?.statement}'` : null // text (LIST, COUNT)
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'CHANNEL\'' // text (LIST, COUNT)

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_id_top_category_list_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city},
      ${i_statement},
      ${i_category})`

      console.log('interactionSql-------xx--yy11------->', interactionSql)

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData.length : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Statement wise Interactions fetched succesfully',
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

  async getDeptInteractions(interactionData, userId, roleId, departmentId, conn) {
    try {
      const searchParams = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'COUNT\'' // text (LIST, COUNT)

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_intxn_by_dept_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city},
      ${i_category})`

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData.length : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Dept Interactions fetched succesfully',
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

  async getDeptVsRolesInteractions(interactionData, userId, roleId, departmentId, conn) {
    try {
      const searchParams = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'LIST\'' // text (LIST, COUNT)

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_intxn_by_dept_role_fn
      (
      ${i_entity_id},
      ${i_role_id},
      ${i_user_id},
      ${i_from_date},
      ${i_to_date},
      ${i_status},
      ${i_intxn_type},
      ${i_intxn_category},
      ${i_service_type},
      ${i_service_category},
      ${i_channel},
      ${i_priority},
      ${i_project},
      ${i_country},
      ${i_district},
      ${i_city},
      ${i_category})`

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData.length : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Dept vs Roles Interactions fetched succesfully',
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

  async interactionByAgeing(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer

      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date

      const i_user_id = searchParams?.userId ? searchParams?.userId : null // character varying

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      let interactionSql
      if (searchParams?.category && ['0_3DAYS', '3_5DAYS', 'MORE_5DAYS'].includes(searchParams?.category)) {
        const i_category = `'${searchParams?.category}'` // text (0_3DAYS, 3_5DAYS, MORE_5DAYS)
        interactionSql = `select * from dtworks_intxn_dashboard_ageing_list_fn(${i_entity_id},${i_role_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_category},${i_service_type},${i_service_category},${i_channel},${i_priority},${i_project},${i_country},${i_district},${i_city},${i_category})`
      } else {
        interactionSql = `select * from dtworks_intxn_dashboard_ageing_fn(${i_entity_id},${i_role_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_category},${i_service_type},${i_service_category},${i_channel},${i_priority},${i_project},${i_country},${i_district},${i_city})`
      }

      console.log('interactionSql------->', interactionSql)
      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })


      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
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

  async interactionByFollowups(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      let interactionSql
      if (searchParams?.category && ['0_3DAYS', '3_5DAYS', 'MORE_5DAYS'].includes(searchParams?.category)) {
        const i_category = `'${searchParams?.category}'` // text (0_3DAYS, 3_5DAYS, MORE_5DAYS)
        interactionSql = `select * from dtworks_intxn_followup_ageing_list_fn(${i_entity_id},${i_role_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_category},${i_service_type},${i_service_category},${i_channel},${i_priority},${i_project},${i_country},${i_district},${i_city},${i_category})`
      } else {
        interactionSql = `select * from dtworks_intxn_followup_ageing_fn(${i_entity_id},${i_role_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_category},${i_service_type},${i_service_category},${i_channel},${i_priority},${i_project},${i_country},${i_district},${i_city})`
      }

      console.log('****************************************************************')
      console.log(interactionSql)
      console.log('****************************************************************')

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
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

  async getTopInteractions(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { mode, level, type, searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = `'${mode.toUpperCase()}_${level.toUpperCase()}'`

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_id_top_category_${type}_fn(${i_entity_id},${i_role_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_category},${i_service_type},${i_service_category},${i_channel},${i_priority},${i_project},${i_country},${i_district},${i_city},${i_category})`

      console.log('interactionSql-----category and type1---->', interactionSql)

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
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

  async interactionAvgWise(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { attr, searchParams } = interactionData

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const interactionSql = `select * from dtworks_id_intxn_avg_by_month_fn(${i_entity_id},${i_role_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_category},${i_service_type},${i_service_category},${i_channel},${i_priority},${i_project},${i_country},${i_district},${i_city})`

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
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

  async interactionByStatusType(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { attr, datatype, searchParams, listCountDatatype } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      let functionName = ''
      if (attr == 'status') {
        if (['list', 'count'].includes(datatype)) {
          functionName = 'dtworks_id_intxn_by_status_fn'
        } else if (datatype == 'percent') {
          functionName = 'dtworks_intxn_status_percentage_fn'
        }
      } else if (attr == 'type') {
        if (['list', 'count'].includes(datatype)) {
          functionName = 'dtworks_id_intxn_by_type_fn'
        } else if (datatype == 'percent') {
          functionName = 'dtworks_intxn_type_percentage_fn'
        }
      }
      console.log('********************************************')
      console.log(datatype, attr, functionName)
      console.log('********************************************')

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      let i_category = `'${datatype.toUpperCase()}'`
      if (listCountDatatype) {
        i_category = `'${listCountDatatype.toUpperCase()}'`
      }
      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from ${functionName}(${i_entity_id},${i_role_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_category},${i_service_type},${i_service_category},${i_channel},${i_priority},${i_project},${i_country},${i_district},${i_city},${i_category})`

      console.log('interactionSql------xxxxx----ss---->', interactionSql)

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
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

  async interactionByProjectAgent(interactionData, userId, roleId, departmentId, conn) {
    try {

      const { attr, datatype, searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      let functionName = ''
      if (attr == 'project') {
        functionName = 'dtworks_intxn_by_project_fn'
      } else if (attr == 'agent') {
        functionName = 'dtworks_intxn_by_agent_fn'
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = `'${datatype.toUpperCase()}'`

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from ${functionName}(${i_entity_id},${i_role_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_category},${i_service_type},${i_service_category},${i_channel},${i_priority},${i_project},${i_country},${i_district},${i_city},${i_category})`

      console.log('interactionSql------xxx12-------->', interactionSql)

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
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

  async getByPriority(interactionData, userId, roleId, departmentId, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_role_id = searchParams?.roleId || null // integer
      const i_user_id = searchParams?.userId ? searchParams?.userId : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_category = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_category = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_channel = searchParams?.channel?.length ? `array[${searchParams?.channel.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_priority = searchParams?.priority?.length ? `array[${searchParams?.priority.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_project = searchParams?.project?.length ? `array[${searchParams?.project.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_country = searchParams?.country?.length ? `array[${searchParams?.country.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_district = searchParams?.district?.length ? `array[${searchParams?.district.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_city = searchParams?.city?.length ? `array[${searchParams?.city.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.category ? `'${searchParams?.category}'` : '\'COUNT\'' // text (LIST, COUNT)

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from dtworks_id_intxn_by_priority_fn(${i_entity_id},${i_role_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_category},${i_service_type},${i_service_category},${i_channel},${i_priority},${i_project},${i_country},${i_district},${i_city},${i_category})`

      console.log('priority wise counts---------->', interactionSql)

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
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

  async getInteractionDetails(interactionData, authData, conn) {
    try {
      const { token } = interactionData

      let interactionDetails = await conn.Interaction.findOne({
        include: [
          {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'currStatusDesc'
          },
          {
            model: conn.Customer,
            attributes: ['customerId', 'firstName', 'lastName'],
            as: 'customerDetails'
          },
          {
            model: conn.KnowledgeBase,
            attributes: ['metaAttributes'],
            as: 'statementDetails'
          }
        ],
        where: { intxnToken: token }
      })

      if (interactionDetails) {
        interactionDetails = interactionDetails.get({ plain: true })

        const { authorization, tenantId } = authData
        const headers = {
          'Content-Type': 'application/json',
          'X-TENANT-ID': tenantId,
          Authorization: authorization
        }
        const method = 'get'
        const path = `workflow/get-status?entityId=${interactionDetails.intxnUuid}&entity=INTERACTION`
        const { result, error } = await this.externalAPICall(path, method, headers, {})
        if (error || !result?.data) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: 'Interaction details not available'
          }
        }

        interactionDetails.workflowDetails = result.data

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Interaction details available',
          data: interactionDetails
        }
      }

      return {
        status: statusCodeConstants.NOT_FOUND,
        message: 'Invalid access'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async testWhatsapp(conn) {
    try {
      const configResponse = await conn.BcaeAppConfig.findOne({
        attributes: ['notificationSetupPayload'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })
      const notificationSetupPayload = configResponse?.dataValues ? configResponse?.dataValues?.notificationSetupPayload?.notificationWhatsappSetting : configResponse?.notificationSetupPayload?.notificationWhatsappSetting
      const json = {
        messaging_product: 'whatsapp',
        to: '919834122529',
        type: 'text',
        text: {
          preview_url: false,
          body: 'Hi dipak...'
        }
      }
       console.log('notificationSetupPayload------xx->', notificationSetupPayload)
      const data = JSON.stringify(json)
      const version = notificationSetupPayload?.version
      const path = '/' + version + '/' + notificationSetupPayload?.phoneNumberId + '/messages?access_token=' + notificationSetupPayload?.token
      // console.log('path:', path)
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
      // console.log(req);
      req.on('success', (e) => {
        console.log('e---->', e)
      })
      req.on('error', (e) => {
        logger.info('Error occurred while sending whatsapp reply message')
      })
      req.write(data)
      req.end()
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createInteraction(interactionData, authData, userId, roleId, departmentId, conn, t) {
    try {
      // console.log('inside create interaction function 1')
      // console.log('userId---->', userId)
      // console.log('roleId---->', roleId)
      // console.log('departmentId-->', departmentId)
      // console.log('interactionData-------->', interactionData)
      if (!interactionData && (!interactionData.customerId || !interactionData.profileId)) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      // console.log('inside create interaction function 2')
      const configResponse = await conn.BcaeAppConfig.findOne({
        attributes: ['systemDefaultRole', 'systemUserId', 'systemDefaultDepartment', 'appTenantId', 'clientConfig'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })
      const systemDefaultValues = configResponse?.dataValues ? configResponse?.dataValues : configResponse
      // console.log('inside create interaction function 3')

      if (!roleId) {
        systemRoleId = interactionData?.currentRoleId ?? systemDefaultValues?.systemDefaultRole
        roleId = systemRoleId
      }

      if (!departmentId) {
        systemDeptId = interactionData?.currentDeptId ?? systemDefaultValues?.systemDefaultDepartment
        departmentId = systemDeptId
      }
      let systemUserId = null
      if (!userId) {
        systemUserId = systemDefaultValues?.systemUserId
        userId = systemUserId
      }
      // console.log('inside create interaction function 4')
      // console.log('systemUserId------>', systemUserId)
      // console.log('systemDeptId------>', systemDeptId)
      // console.log('systemRoleId------>', systemRoleId)
      // console.log('appTenantId------>', appTenantId)
      // console.log('departmentId------>', departmentId)
      // console.log('roleId------>', roleId)
      // console.log('interactionData------>', interactionData)
      let customerInfo
      if (interactionData && (interactionData?.customerId || interactionData?.customerUuid)) {
        const customerWhere = {}
        if (interactionData?.customerId) {
          customerWhere.customerId = Number(interactionData?.customerId)
        } else if (interactionData?.customerUuid) {
          customerWhere.customerUuid = interactionData?.customerUuid
        }
        // console.log('customerWhere----->', customerWhere)
        customerInfo = await conn.Customer.findOne({
          where: customerWhere
        })
      }
      // console.log('inside create interaction function 5')
      if (interactionData && interactionData?.profileId) {
        customerInfo = await conn.Profile.findOne({
          where: {
            profileId: interactionData.profileId
          }
        })
      }
      if (!customerInfo) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: `No customer found for id ${interactionData.customerId}`
        }
      }
      // console.log('inside create interaction function 6')
      // console.log('customerInfo-------xxx-->', customerInfo?.customerNo)

      customerInfo = customerInfo?.dataValues ? customerInfo?.dataValues : customerInfo
      // console.log('customerInfo--------->', customerInfo?.customerNo)

      // if (customerInfo && interactionData && interactionData.addressId) {
      //   const checkAddressInfo = await conn.Address.findOne({
      //     where: {
      //       addressId: interactionData.addressId
      //     }
      //   })
      //   if (!checkAddressInfo) {
      //     return {
      //       status: statusCodeConstants.NOT_FOUND,
      //       message: `No address found for id ${interactionData.addressId}`
      //     }
      //   }

      //   if (checkAddressInfo.customerId !== interactionData.customerId) {
      //     return {
      //       status: statusCodeConstants.VALIDATION_ERROR,
      //       message: 'Provided addressId and customer mapped addressId is not matched'
      //     }
      //   }
      // }
      // console.log('inside create interaction function 7')
      let checkHelpdeskData = {}
      if (interactionData && interactionData?.helpdeskId) {
        /** Checking Helpdesk Details are available */
        checkHelpdeskData = await conn.Helpdesk.findOne({
          where: { helpdeskId: interactionData?.helpdeskId }
        })
        if (!checkHelpdeskData) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `No helpdesk found for id ${interactionData.helpdeskId}`
          }
        }
        /** Checking for Interaction Details for helpdesk */
        const checkExistingInteraction = await conn.Interaction.findOne({
          where: {
            helpdeskId: interactionData?.helpdeskId
          }
        })
        if (checkExistingInteraction) {
          return {
            status: statusCodeConstants.CONFLICT,
            message: `Interaction already exists for this helpesk with id: ${interactionData?.helpdeskId}`
          }
        }
      }

      // console.log('inside create interaction function 8')
      let checkingExistingAccount
      if (interactionData && interactionData?.accountId) {
        checkingExistingAccount = await conn.CustAccounts.findOne({
          where: {
            accountId: interactionData.accountId,
            customerId: customerInfo.customerId
          }
        })
        if (!checkingExistingAccount) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `No Account is found for provided account id ${interactionData.accountId}`
          }
        }
      }
      // console.log('inside create interaction function 9')
      let checkingExistingService
      if (interactionData && interactionData?.serviceId) {
        checkingExistingService = await conn.CustServices.findOne({
          where: {
            serviceId: interactionData.serviceId,
            customerId: customerInfo.customerId
          }
        })
        if (!checkingExistingService) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `No service is found for provided service id ${interactionData.serviceId}`
          }
        }
      }
      // console.log('inside create interaction function 10')
      const workflowMappings = await conn.WorkflowMapping.findAll({
        where: {
          moduleName: 'INTXN',
          status: defaultStatus.ACTIVE
        }
      })
      // console.log('workflowMappings===', workflowMappings)
      // TODO: Need to check if given statementId and other mapping details are mapped
      let flwId
      for (const w of workflowMappings) {
        const mapping = w.mappingPayload
        // console.log('mapping.serviceType------->', interactionData.serviceType, mapping.serviceType)
        // console.log('mapping.serviceCategory------->', interactionData.serviceCategory, mapping.serviceCategory)
        // console.log('mapping.interactionCategory------->', interactionData.interactionCategory, mapping.interactionCategory)
        // console.log('mapping.interactionType------->', interactionData.interactionType, mapping.interactionType)
        // console.log('mapping?.requestStatementIds------->', interactionData?.statementId, mapping?.requestStatementIds)
        const hasRequestStatementIds = Array.isArray(mapping?.requestStatementIds) && mapping.requestStatementIds.length > 0
        // console.log('<-------------------------------------------INTXN------------------------------------->')
        if (
          (!mapping?.serviceType || mapping.serviceType === interactionData.serviceType) &&
          (!mapping?.serviceCategory || mapping.serviceCategory === interactionData.serviceCategory) &&
          (!mapping?.interactionCategory || mapping.interactionCategory === interactionData.interactionCategory) &&
          (!mapping?.interactionType || mapping.interactionType === interactionData.interactionType) &&
          (!hasRequestStatementIds || hasRequestStatementIds && mapping.requestStatementIds.includes(interactionData?.statementId))
        ) {
          flwId = w.workflowId
          break
        }
      }
      // console.log('flwId-----INTXN------->', flwId)
      if (!flwId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Workflow not found. Please configure the workflow or contact admin'
        }
      }
      // console.log('inside create interaction function 11')
      // console.log('systemDeptId', systemDeptId)
      // console.log('systemRoleId', systemRoleId)
      // console.log('systemUserId', systemUserId)
      const guid = uuidv4()
      const commonAttrib = {
        tranId: guid,
        createdDeptId: departmentId || systemDeptId,
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }
      const intxnUid = uuidv4()
      const interaction = {
        intxnUuid: intxnUid,
        project: interactionData?.project,
        isResolvedBy: interactionData.isResolvedBy,
        requestId: interactionData.statementId,
        customerId: interactionData?.customerId || null,
        customerUuid: interactionData?.customerId ? customerInfo.customerUuid : null,
        intxnCategory: interactionData.interactionCategory,
        helpdeskId: interactionData?.helpdeskId || null,
        chatId: interactionData.chatId || null,
        requestStatement: interactionData.statement,
        profileId: interactionData.profileId || null,
        accountId: interactionData.accountId || null,
        accountUuid: interactionData?.accountId ? checkingExistingAccount.accountUuid : null,
        serviceId: interactionData.serviceId || null,
        serviceUuid: interactionData?.serviceId ? checkingExistingService.serviceUuid : null,
        intxnDescription: interactionData.remarks,
        intxnType: interactionData.interactionType,
        serviceType: interactionData.serviceType,
        serviceCategory: interactionData.serviceCategory,
        intxnChannel: interactionData.channel,
        intxnCause: interactionData.problemCause,
        intxnPriority: interactionData.priorityCode,
        contactPreference: interactionData.contactPreference,
        responseSolution: interactionData.statementSolution,
        edoc: interactionData.edoc,
        intxnToken: intxnUid,
        assignedDate: new Date(),
        currUser: systemDefaultValues?.clientConfig?.intxnCreateByUser ? userId : interactionData?.currUser || null,
        currEntity: departmentId || systemDeptId,
        rcResolution: interactionData?.rcResolution || '',
        intxnStatus: interactionData.isResolvedBy === 'BOT' ? defaultStatus.CLOSED : defaultStatus.NEW,
        currRole: roleId || systemRoleId,
        formDetails: interactionData?.formDetails ?? null,
        ...commonAttrib
      }
      // console.log('inside create interaction function 12', interaction)
      // console.log(sdd)
      const response = await conn.Interaction.create(interaction, { transaction: t })
      // console.log('interaction created')
      let addHistory = []
      const intxnHistory = {
        intxnId: response.intxnId,
        intxnType: interactionData.interactionType,
        // intxnTxnUuid: uuidv4(),
        intxnUuid: intxnUid,
        serviceCategory: interactionData.serviceCategory || null,
        serviceType: interactionData.serviceType,
        // ticketType: interactionData.interactionType,
        intxnPriority: interactionData.priorityCode,
        intxnCause: interactionData.problemCause,
        intxnChannel: interactionData.channel,
        contactPreference: interactionData.contactPreference,
        fromEntityId: departmentId || systemDeptId,
        fromRoleId: roleId || systemRoleId,
        fromUserId: userId || systemUserId,
        toEntityId: departmentId || systemDeptId,
        toRoleId: roleId || systemRoleId,
        toUserId: interactionData?.currUser || userId || systemUserId,
        remarks: interactionData.remarks,
        intxnFlow: interactionFlowAction.CREATED,
        flwCreatedBy: userId || systemUserId,
        intxnTxnStatus: defaultStatus.NEW,
        isFollowup: defaultCode.NO,
        intxnCreatedDate: new Date(),
        intxnCreatedBy: userId || systemUserId,
        ...commonAttrib
      }
      if (interactionData.isResolvedBy === 'BOT') {
        addHistory = [{ ...intxnHistory }, { ...intxnHistory, intxnTxnStatus: interactionData.isResolvedBy === 'BOT' ? defaultStatus.CLOSED : defaultStatus.NEW }]
      } else {
        addHistory = [{ ...intxnHistory }]
      }
      addHistory = addHistory.map(x => ({ ...x, intxnTxnUuid: uuidv4() }))
      const interactionHistory = await conn.InteractionTxn.bulkCreate(addHistory, { transaction: t })
      // console.log('inside create interaction function 13')
      // Closing the Helpdesk

      if (!isEmpty(checkHelpdeskData)) {
        const updateHelpdeskData = {
          status: defaultStatus.HELPDESK_ESCALATED,
          project: interactionData?.projectType || null
        }

        await conn.Helpdesk.update(updateHelpdeskData, {
          where: {
            helpdeskId: interactionData?.helpdeskId
          }
        })
        const helpdeskHistory = {
          helpdeskId: interactionData?.helpdeskId,
          status: defaultStatus.HELPDESK_ESCALATED,
          helpdeskTxnUuid: uuidv4(),
          helpdeskActionRemark: interactionFlowAction.HELPDESK_UPDATE,
          statusChngDate: new Date(),
          currUser: userId,
          ...commonAttrib
        }
        await conn.HelpdeskTxn.create(helpdeskHistory, { transaction: t })
      }
      // console.log('inside create interaction function 14')
      const guidAddress = uuidv4()
      const commonAttribAddress = {
        tranId: guidAddress,
        createdDeptId: departmentId || systemDeptId,
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      if (interactionData?.appointAddress) {
        const addressData = {
          address1: interactionData?.appointAddress?.address1,
          address2: interactionData?.appointAddress?.address2,
          address3: interactionData?.appointAddress?.address3,
          city: interactionData?.appointAddress?.city,
          state: interactionData?.appointAddress?.state,
          district: interactionData?.appointAddress?.district,
          postcode: interactionData?.appointAddress?.postcode,
          country: interactionData?.appointAddress?.country,
          status: 'AC',
          isPrimary: true,
          addressCategory: 'INTERACTION',
          addressCategoryValue: response.intxnNo,
          ...commonAttribAddress
        }

        await conn.Address.create(addressData, { transaction: t })
      }
      // Appoinment creation starts
      const guid1 = uuidv4()
      const commonAttribAppointment = {
        tranId: guid1,
        createdDeptId: departmentId || systemDeptId,
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }
      let appoitmentObj
      let requestStatement = await conn.KnowledgeBase.findOne({
        where: {
          requestId: interactionData.statementId
        }
      })
      // console.log('inside create interaction function 15')
      requestStatement = requestStatement?.dataValues ?? requestStatement
      if (interactionData?.appointDtlId && interactionData?.appointUserId) {
        const appointmentData = await conn.AppointmentDtl.findOne({
          where: { appointDtlId: interactionData?.appointDtlId },
          raw: true
        })
        if (appointmentData) {
          const appointmentTxnData = {
            appointDtlId: interactionData?.appointDtlId,
            appointId: appointmentData?.appointId,
            appointDate: appointmentData?.appointDate,
            status: defaultStatus.SCHEDULED,
            appointUserCategory: 'CUSTOMER',
            appointUserId: interactionData?.customerId,
            appointAgentId: interactionData?.appointUserId,
            appointMode: appointmentData?.appointMode,
            appointModeValue: '',
            appointStartTime: appointmentData?.appointStartTime,
            appointEndTime: appointmentData?.appointEndTime,
            tranCategoryType: 'INTERACTION',
            tranCategoryNo: response.intxnNo,
            tranCategoryUuid: intxnUid,
            ...commonAttribAppointment
          }
          // console.log('appointmentTxnData', appointmentTxnData)
          // console.log('inside create interaction function 12')
          try {
            if (['AUDIO_CONF', 'VIDEO_CONF'].includes(appointmentTxnData.appointMode) && appointmentTxnData.appointAgentId && appointmentTxnData.appointUserId) {
              const hostDetail = await conn.User.findOne({ where: { userId: appointmentTxnData.appointAgentId } })
              const customerDetail = await conn.Contact.findOne({
                where: {
                  contactCategory: 'CUSTOMER',
                  contactCategoryValue: customerInfo?.customerNo
                }
              })
              const start = moment(`${appointmentTxnData.appointDate}T${appointmentTxnData.appointStartTime}Z`)// now
              const end = moment(`${appointmentTxnData.appointDate}T${appointmentTxnData.appointEndTime}Z`)

              const requestBody = {
                txnNo: response.intxnNo,
                agenda: 'Interaction related - ' + response.intxnNo,
                hostEmail: hostDetail?.email,
                hostUserGroup: hostDetail?.userGroup,
                hostMobilePrefix: hostDetail?.extn,
                hostMobileNo: hostDetail?.contactNo,
                duration: end.diff(start, 'minutes'),
                customerEmail: customerDetail?.emailId,
                customerMobilePrefix: customerDetail?.mobilePrefix,
                customerMobileNo: customerDetail?.mobileNo,
                customerUserGroup: customerDetail?.userGroup ?? 'UG_CONSUMER',
                topic: 'Interaction related - ' + response.intxnNo,
                appointDateTime: `${appointmentTxnData.appointDate}T${appointmentTxnData.appointStartTime}Z`,
                tranEntity: 'TMC_INTERACTION',
                eventType: 'ET_CREATION',
                tranCategory: interactionData?.interactionCategory,
                tranType: interactionData?.interactionType,
                serviceCategory: interactionData?.serviceCategory,
                serviceType: interactionData?.serviceType
              } // "2022-03-25T07:32:55Z"
              const { authorization, tenantId } = authData
              const headers = {
                'Content-Type': 'application/json',
                'X-TENANT-ID': tenantId,
                Authorization: authorization
              }
              const method = 'post'
              const path = 'appointment/create-meeting-link'
              // console.log({ path, method, headers, requestBody }, 'for appointment')
              const { result } = await this.externalAPICall(path, method, headers, requestBody)
              // console.log('<================== from appointment ==================>')
              // console.log({ result, error })
              // console.log('<================== from appointment ==================>')
              appointmentTxnData.medium = result?.data?.medium
              appointmentTxnData.mediumData = result?.data?.mediumData
              appointmentTxnData.appointModeValue = result?.data?.meetingUrl
            } else {
              appointmentTxnData.appointModeValue = interactionData?.appointModeValue
            }
          } catch (error) {
            console.log(error, 'appointment medium create error')
          }

          const createAppointmentTxn = await conn.AppointmentTxn.create(appointmentTxnData, { transaction: t })
          appoitmentObj = {
            notificationType: defaultCode.POPUP,
            subject: requestStatement?.requestStatement ? `Appointment created for ${response.intxnNo} - ${requestStatement?.requestStatement}` : 'Interaction is Assigned to your Role',
            channel: interactionData?.channel ? interactionData?.channel : 'WEB',
            body: requestStatement?.requestStatement ? `Appointment created for ${response.intxnNo} - ${requestStatement?.requestStatement}` : 'Interaction is Assigned to your Role',
            intxnId: createAppointmentTxn.appointDtlId,
            userId,
            roleId,
            departmentId,
            status: 'SENT',
            interactionNumber: createAppointmentTxn.appointmentTxnNo,
            intxnPriority: interactionData.priorityCode,
            customerNo: customerInfo.customerNo,
            assignedUserId: interactionData?.appointAgentId,
            assignedDepartmentId: interactionData?.departmentId || systemDeptId,
            assignedRoleId: interactionData?.roleId || systemRoleId,
            intxnStatus: defaultStatus.NEW,
            notificationSource: entityCategory.APPOINTMENT,
            link: ['AUDIO_CONF', 'VIDEO_CONF'].includes(appointmentTxnData?.appointMode) ? appointmentTxnData.appointModeValue : ''
          }
        }
      } else {
        if (interactionData.slotIds) {
          const appointmentDtls = await conn.AppointmentDtl.findAll({
            where: { appointDtlId: interactionData.slotIds },
            raw: true
          })
          const customerId = typeof interactionData?.customerId === 'string' ? interactionData?.customerId : interactionData?.customerId?.toFixed(0)
          const user = await conn.User.findOne({
            where: { customerId },
            raw: true
          })
          const appointmentTxns = []
          for (let index = 0; index < appointmentDtls.length; index++) {
            const element = appointmentDtls[index]
            appointmentTxns.push({
              appointDtlId: element?.appointDtlId,
              appointId: element?.appointId,
              appointDate: element?.appointDate,
              status: defaultStatus.SCHEDULED,
              appointUserCategory: 'CUSTOMER', // need to bring from app config
              appointUserId: interactionData?.customerId,
              appointAgentId: user?.userId,
              appointMode: element?.appointMode,
              appointModeValue: element?.workType,
              appointStartTime: element?.appointStartTime,
              appointEndTime: element?.appointEndTime,
              tranCategoryType: 'INTERACTION',
              tranCategoryNo: response.intxnNo,
              tranCategoryUuid: intxnUid,
              ...commonAttribAppointment
            })
          }

          console.log('appointmentTxns', appointmentTxns)

          await conn.AppointmentTxn.bulkCreate(appointmentTxns, { transaction: t })
        }
      }
      // console.log('inside create interaction function 16')
      // Appoinment creation ends
      // TODO: CREATE Attachment Here
      if (Array.isArray(interactionData?.attachments) && interactionData?.attachments?.length > 0) {
        // console.log('-------------here in attachemnet section----------------')
        for (const entityId of interactionData.attachments) {
          await findAndUpdateAttachment(entityId, response.intxnUuid, entityCategory.INTERACTION, conn, t)
        }
      }
      // console.log('inside create interaction function 17')
      if (interactionData.isResolvedBy !== 'BOT') {
        await assignWFToEntity(intxnUid, entityCategory.INTERACTION, flwId, commonAttrib, conn, t)
        //   em.emit('INTERACTION_WORFKFLOW_ENGINE', { intxnId: response?.intxnUuid, ...commonAttrib })
        const workflowExecute = await startWorkFlowEngineManual(response?.intxnUuid, conn, t)
        /** **** Interaction Update based on workflow  start *******/
        const workflowDetails = await getWorkflowEntity(response?.intxnUuid, 'INTERACTION', { departmentId, isManagerialAssign: interactionData?.isManagerialAssign }, conn, t)
        if (workflowDetails && !isEmpty(workflowDetails) && workflowDetails?.status === 'SUCCESS') {
          await conn.Interaction.update({ currRole: workflowDetails?.data?.roleId, currEntity: workflowDetails?.data?.unitId }, { where: { intxnUuid: response?.intxnUuid }, transaction: t })
          await conn.InteractionTxn.update({ toEntityId: workflowDetails?.data?.unitId, toRoleId: workflowDetails?.data?.roleId }, { where: { intxnId: response.intxnId }, transaction: t })
          roleId = workflowDetails?.data?.roleId || systemRoleId
          departmentId = workflowDetails?.data?.unitId || systemDeptId
        }

        if (workflowExecute?.status === 'ERROR') {
          return {
            status: statusCodeConstants.ERROR,
            message: workflowExecute.message
          }
        }
      }
      const source = await conn.BusinessEntity.findOne({
        attributes: ['description'],
        where: {
          code: interactionData.interactionType
        }
      })

      /** Getting Customer contact information */
      let contactWhereClause = {}

      if (!interactionData.customerContactNo) {
        if ((interactionData?.customerId || interactionData?.customerUuid) && customerInfo) {
          contactWhereClause = {
            contactCategoryValue: customerInfo.customerNo,
            status: defaultStatus.ACTIVE,
            contactCategory: entityCategory.CUSTOMER
          }
        } else {
          contactWhereClause = {
            contactCategoryValue: customerInfo.profileNo,
            status: defaultStatus.ACTIVE,
            contactCategory: entityCategory.PROFILE
          }
        }
      } else {
        contactWhereClause.contactNo = interactionData.customerContactNo
      }

      // console.log('contactWhereClause-------->', contactWhereClause)
      let contactInfo = await conn.Contact.findOne({
        where: { ...contactWhereClause },
        order: [['contactId', 'DESC']]
      })

      contactInfo = contactInfo?.dataValues ? contactInfo?.dataValues : contactInfo
      const contactPayload = contactInfo
      // console.log('contactInfo ==> ', contactInfo)
      /* Creating Contact with Interaction start */
      delete contactPayload.contactId
      delete contactPayload.contactNo
      await conn.Contact.create({
        ...contactPayload,
        contactCategory: entityCategory.INTERACTION,
        contactCategoryValue: response.intxnNo,
        // contactNo: contactInfo?.contactNo,
        // emailId: contactInfo?.emailId,
        // mobileNo: contactInfo?.mobileNo,
        // mobilePrefix: contactInfo?.mobilePrefix,
        // firstName: contactInfo?.firstName,
        // lastName: contactInfo?.lastName,
        status: defaultStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...commonAttribAppointment
      }, { transaction: t })

      /* Creating Contact with Interaction start */

      /* Creating Notification request information */
      logger.debug('Creating Notification request information')

      let email, contactNo, contactNoPfx
      if (contactInfo) {
        email = contactInfo.emailId || null
        contactNo = contactInfo.mobileNo || null
        contactNoPfx = contactInfo.mobilePrefix || null
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      let businessUser
      if (interaction?.currUser) {
        businessUser = await conn.User.findOne({ where: { userId: interaction?.currUser } })
      }

      const notificationData = {
        consumerUser: {
          name: customerInfo.firstName,
          email,
          contactNo,
          contactNoPfx
        },
        businessUser: {
          name: businessUser?.firstName,
          email: businessUser?.email,
          contactNo: businessUser?.contactNo,
          contactNoPfx: businessUser?.extn
        },
        notifiationSource: source.description,
        referenceId: response.intxnNo,
        referenceSubId: interactionHistory.intxnTxnNo,
        userId: userId || systemUserId,
        customerId: interaction.customerId || interaction.profileId,
        departmentId: departmentId || systemDeptId,
        roleId: roleId || systemRoleId,
        channel: interaction.channel,
        type: 'CREATE-INTERACTION',
        contactPreference: interaction.contactPreference,
        mapCategory: 'TMC_INTERACTION',
        eventType: 'ET_CREATION',
        tranCategory: interaction.intxnCategory,
        tranType: interaction.intxnType,
        serviceCategory: interaction?.serviceCategory,
        serviceType: interaction?.serviceType,
        replyMessage: `Hi ${customerInfo.firstName}, You have raised an interaction ${response.intxnNo} successfully. Please use this ID to track your interaction status.`,
        conn,
        ...commonAttrib
      }

      /** Sending Create Interaction Noification */
      logger.debug('Sending Create Interaction Noification')
      em.emit('SEND_INTERACTION_NOTIFICATION', notificationData)
      // Create notification for Department
      const emailList = await getUsersByRole(roleId || systemRoleId, departmentId || systemDeptId, defaultCode.EMAIL, conn)
      let emailIds
      emailList.forEach(emailId => {
        emailIds = (emailId.email + ',' + emailIds)
      })

      const serviceType = interactionResources.getbusinessEntity(businessEntityInfo, interactionData?.serviceType)
      const intxnCause = interactionResources.getbusinessEntity(businessEntityInfo, interactionData?.problemCause)
      const priority = interactionResources.getbusinessEntity(businessEntityInfo, interactionData?.priorityCode)

      const departmentNotification = {
        email: emailIds,
        notifiationSource: source.description,
        referenceId: response.intxnNo,
        referenceSubId: interactionHistory.intxnTxnNo,
        userId: userId || systemUserId,
        customerId: interactionData.customerId || interactionData.profileId,
        departmentId: departmentId || systemDeptId,
        roleId: roleId || systemRoleId,
        interactionDescription: interactionData.remarks,
        serviceType: serviceType?.description,
        intxnCause: intxnCause?.description,
        status: defaultStatus.NEW,
        primaryContact: email,
        priority: priority?.description,
        customerName: customerInfo.firstName,
        channel: interactionData?.channel,
        type: 'CREATE-INTERACTION-DEPT',
        contactPreference: interactionData.contactPreference,
        ...commonAttrib
      }
      em.emit('SEND_INTERACTION_NOTIFICATION_DEPT', departmentNotification)

      // if (interactionData.isResolvedBy !== 'BOT') {
      //   em.emit('INTERACTION_WORFKFLOW_ENGINE', { intxnId: response?.intxnUuid, ...commonAttrib })
      // }
      // Create New PopUp Notification

      const userList = await getUsersByRole(roleId, departmentId, defaultCode.POPUP, conn) || []
      const notificationObj = {
        notificationType: defaultCode.POPUP,
        subject: interactionData?.statement ? interactionData.statement : requestStatement?.requestStatement ?? 'Interaction is Assigned to your Role',
        channel: interactionData?.channel ? interactionData?.channel : 'WEB',
        body: interactionData?.statement ? interactionData.statement : requestStatement?.requestStatement ?? 'Interaction is Assigned to your Role',
        intxnId: response.intxnId,
        userId: userId || systemUserId,
        roleId: roleId || systemRoleId,
        departmentId: departmentId || systemDeptId,
        status: 'SENT',
        interactionNumber: response.intxnNo,
        intxnPriority: interactionData.priorityCode,
        customerNo: customerInfo.customerNo,
        assignedUserId: interactionData?.userId || null,
        assignedDepartmentId: interactionData?.departmentId || systemDeptId,
        assignedRoleId: interactionData?.roleId || systemRoleId,
        intxnStatus: defaultStatus.NEW,
        userList
      }
      logger.debug('Interaction PopUp Notification', notificationObj)
      em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', notificationObj)
      // console.log('appoitmentObj ------------------->', appoitmentObj)
      if (!isEmpty(appoitmentObj)) {
        logger.debug('Appointment PopUp Notification', appoitmentObj)
        em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', appoitmentObj)
      }
      // console.log('inside create interaction function 18')
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Interaction created Successfully with Id - ${response.intxnNo}`,
        data: {
          intxnNo: response.intxnNo,
          intxnId: response.intxnId,
          intxnUuid: response.intxnUuid
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async createInteractionWebSelfCare(interactionData, authData, userId, roleId, departmentId, conn, t) {
    try {
      roleId = systemRoleId
      departmentId = systemDeptId
      // console.log('departmentId------------>', departmentId)
      // console.log('roleId------------>', roleId)

      // console.log('systemRoleId------------>', systemRoleId)
      // console.log('systemDeptId------------>', systemDeptId)

      // console.log('systemDeptId------departmentId------>', departmentId || systemDeptId)
      // console.log('systemDeptId------roleId------>', systemRoleId || systemDeptId)

      if (!interactionData && (!interactionData.customerId || !interactionData.profileId)) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let customerInfo
      if (interactionData && interactionData?.customerId) {
        customerInfo = await conn.Customer.findOne({
          where: {
            customerId: interactionData.customerId
          },
          logging: true
        })
      }

      if (interactionData && interactionData?.profileId) {
        customerInfo = await conn.Profile.findOne({
          where: {
            profileId: interactionData.profileId
          }
        })
      }

      if (!customerInfo) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: `No customer found for id ${interactionData.customerId}`
        }
      }
      // if (customerInfo && interactionData && interactionData.addressId) {
      //   const checkAddressInfo = await conn.Address.findOne({
      //     where: {
      //       addressId: interactionData.addressId
      //     }
      //   })
      //   if (!checkAddressInfo) {
      //     return {
      //       status: statusCodeConstants.NOT_FOUND,
      //       message: `No address found for id ${interactionData.addressId}`
      //     }
      //   }

      //   if (checkAddressInfo.customerId !== interactionData.customerId) {
      //     return {
      //       status: statusCodeConstants.VALIDATION_ERROR,
      //       message: 'Provided addressId and customer mapped addressId is not matched'
      //     }
      //   }
      // }
      let checkHelpdeskData = {}
      if (interactionData && interactionData?.helpdeskId) {
        /** Checking Helpdesk Details are available */
        checkHelpdeskData = await conn.Helpdesk.findOne({
          where: { helpdeskId: interactionData?.helpdeskId }
        })
        if (!checkHelpdeskData) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `No helpdesk found for id ${interactionData.helpdeskId}`
          }
        }
        /** Checking for Interaction Details for helpdesk */
        const checkExistingInteraction = await conn.Interaction.findOne({
          where: {
            helpdeskId: interactionData?.helpdeskId
          }
        })
        if (checkExistingInteraction) {
          return {
            status: statusCodeConstants.CONFLICT,
            message: `Interaction already exists for this helpesk with id: ${interactionData?.helpdeskId}`
          }
        }
      }

      let checkingExistingAccount
      if (interactionData && interactionData?.accountId) {
        checkingExistingAccount = await conn.CustAccounts.findOne({
          where: {
            accountId: interactionData.accountId,
            customerId: customerInfo.customerId
          }
        })
        if (!checkingExistingAccount) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `No Account is found for provided account id ${interactionData.accountId}`
          }
        }
      }

      let checkingExistingService
      if (interactionData && interactionData?.serviceId) {
        checkingExistingService = await conn.CustServices.findOne({
          where: {
            serviceId: interactionData.serviceId,
            customerId: customerInfo.customerId
          }
        })
        if (!checkingExistingService) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `No service is found for provided service id ${interactionData.serviceId}`
          }
        }
      }

      const workflowMappings = await conn.WorkflowMapping.findAll({
        where: {
          moduleName: 'INTXN',
          status: defaultStatus.ACTIVE
        }
      })
      // TODO: Need to check if given statementId and other mapping details are mapped
      let flwId
      for (const w of workflowMappings) {
        const mapping = w.mappingPayload
        if (
          mapping.serviceType && mapping.serviceType === interactionData.serviceType &&
          mapping.serviceCategory && mapping.serviceCategory === interactionData.serviceCategory &&
          mapping.interactionCategory && mapping.interactionCategory === interactionData.interactionCategory &&
          mapping.interactionType && mapping.interactionType === interactionData.interactionType) {
          flwId = w.workflowId
          break
        }
      }
      if (!flwId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Workflow not found. Please configure the workflow or contact admin'
        }
      }
      const guid = uuidv4()
      const commonAttrib = {
        tranId: guid,
        createdDeptId: departmentId || systemDeptId,
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }
      const intxnUid = uuidv4()
      const interaction = {
        intxnUuid: intxnUid,
        isResolvedBy: interactionData.isResolvedBy,
        requestId: interactionData.statementId,
        customerId: interactionData?.customerId || null,
        customerUuid: interactionData?.customerId ? customerInfo.customerUuid : null,
        intxnCategory: interactionData.interactionCategory,
        helpdeskId: interactionData?.helpdeskId || null,
        chatId: interactionData.chatId || null,
        requestStatement: interactionData.statement,
        profileId: interactionData.profileId || null,
        accountId: interactionData.accountId || null,
        accountUuid: interactionData?.accountId ? checkingExistingAccount.accountUuid : null,
        serviceId: interactionData.serviceId || null,
        serviceUuid: interactionData?.serviceId ? checkingExistingService.serviceUuid : null,
        intxnDescription: interactionData.remarks,
        intxnType: interactionData.interactionType,
        serviceType: interactionData.serviceType,
        serviceCategory: interactionData.serviceCategory,
        intxnChannel: interactionData.channel,
        intxnCause: interactionData.problemCause,
        intxnPriority: interactionData.priorityCode,
        contactPreference: interactionData.contactPreference,
        responseSolution: interactionData.statementSolution,
        intxnToken: intxnUid,
        // assignedDate: (new Date()),
        currUser: null,
        currEntity: departmentId || systemDeptId,
        rcResolution: interactionData?.rcResolution || '',
        intxnStatus: interactionData.isResolvedBy === 'BOT' ? defaultStatus.CLOSED : defaultStatus.NEW,
        currRole: roleId || systemRoleId,
        ...commonAttrib
      }
      // console.log('interaction----->', interaction)

      const response = await conn.Interaction.create(interaction, { transaction: t })
      const addHistory = {
        intxnId: response.intxnId,
        intxnType: interactionData.interactionType,
        intxnTxnUuid: uuidv4(),
        intxnUuid: intxnUid,
        serviceCategory: interactionData.serviceCategory || null,
        serviceType: interactionData.serviceType,
        // ticketType: interactionData.interactionType,
        intxnPriority: interactionData.priorityCode,
        intxnCause: interactionData.problemCause,
        intxnChannel: interactionData.channel,
        contactPreference: interactionData.contactPreference,
        fromEntityId: departmentId || systemDeptId,
        fromRoleId: roleId || systemRoleId,
        fromUserId: userId || systemUserId,
        toEntityId: departmentId || systemDeptId,
        toRoleId: roleId || systemRoleId,
        toUserId: userId || systemUserId,
        remarks: interactionData.remarks,
        intxnFlow: interactionFlowAction.CREATED,
        flwCreatedBy: userId || systemUserId,
        intxnTxnStatus: defaultStatus.NEW,
        isFollowup: defaultCode.NO,
        intxnCreatedDate: new Date(),
        intxnCreatedBy: userId || systemUserId,
        ...commonAttrib
      }
      // console.log('addHistory-------->', addHistory)
      const interactionHistory = await conn.InteractionTxn.create(addHistory, { transaction: t })

      // Closing the Helpdesk

      if (!isEmpty(checkHelpdeskData)) {
        const updateHelpdeskData = {
          status: defaultStatus.HELPDESK_ESCALATED,
          project: interactionData?.projectType || null
        }

        await conn.Helpdesk.update(updateHelpdeskData, {
          where: {
            helpdeskId: interactionData?.helpdeskId
          }
        })
        const helpdeskHistory = {
          helpdeskId: interactionData?.helpdeskId,
          status: defaultStatus.HELPDESK_ESCALATED,
          helpdeskTxnUuid: uuidv4(),
          helpdeskActionRemark: interactionFlowAction.HELPDESK_UPDATE,
          statusChngDate: new Date(),
          currUser: userId,
          ...commonAttrib
        }
        await conn.HelpdeskTxn.create(helpdeskHistory, { transaction: t })
      }

      const guidAddress = uuidv4()
      const commonAttribAddress = {
        tranId: guidAddress,
        createdDeptId: departmentId || systemDeptId,
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      if (interactionData?.appointAddress) {
        const addressData = {
          address1: interactionData?.appointAddress?.address1,
          address2: interactionData?.appointAddress?.address2,
          address3: interactionData?.appointAddress?.address3,
          city: interactionData?.appointAddress?.city,
          state: interactionData?.appointAddress?.state,
          district: interactionData?.appointAddress?.district,
          postcode: interactionData?.appointAddress?.postcode,
          country: interactionData?.appointAddress?.country,
          status: 'AC',
          isPrimary: true,
          addressCategory: 'INTERACTION',
          addressCategoryValue: response.intxnNo,
          ...commonAttribAddress
        }

        await conn.Address.create(addressData, { transaction: t })
      }
      // Appoinment creation starts
      const guid1 = uuidv4()
      const commonAttribAppointment = {
        tranId: guid1,
        createdDeptId: departmentId || systemDeptId,
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }
      if (interactionData?.appointDtlId && interactionData?.appointUserId) {
        const appointmentData = await conn.AppointmentDtl.findOne({
          where: { appointDtlId: interactionData?.appointDtlId },
          raw: true
        })
        if (appointmentData) {
          const appointmentTxnData = {
            appointDtlId: interactionData?.appointDtlId,
            appointId: appointmentData?.appointId,
            appointDate: appointmentData?.appointDate,
            status: defaultStatus.SCHEDULED,
            appointUserCategory: 'CUSTOMER',
            appointUserId: interactionData?.customerId,
            appointAgentId: interactionData?.appointUserId,
            appointMode: appointmentData?.appointMode,
            appointModeValue: '',
            appointStartTime: appointmentData?.appointStartTime,
            appointEndTime: appointmentData?.appointEndTime,
            tranCategoryType: 'INTERACTION',
            tranCategoryNo: response.intxnNo,
            tranCategoryUuid: intxnUid,
            ...commonAttribAppointment
          }
          // console.log('appointmentTxnData', appointmentTxnData)

          try {
            if (['AUDIO_CONF', 'VIDEO_CONF'].includes(appointmentTxnData.appointMode) && appointmentTxnData.appointAgentId && appointmentTxnData.appointUserId) {
              const hostDetail = await conn.User.findOne({ where: { userId: appointmentTxnData.appointAgentId } })
              const customerDetail = await conn.Contact.findOne({
                where: {
                  contactCategory: 'CUSTOMER',
                  contactCategoryValue: customerInfo?.customerNo
                }
              })
              const start = moment(`${appointmentTxnData.appointDate}T${appointmentTxnData.appointStartTime}Z`)// now
              const end = moment(`${appointmentTxnData.appointDate}T${appointmentTxnData.appointEndTime}Z`)

              const requestBody = {
                agenda: 'Interaction related - ' + response.intxnNo,
                hostEmail: hostDetail?.email,
                duration: end.diff(start, 'minutes'),
                customerEmail: customerDetail?.emailId,
                topic: 'Interaction related - ' + response.intxnNo,
                appointDateTime: `${appointmentTxnData.appointDate}T${appointmentTxnData.appointStartTime}Z`
              } // "2022-03-25T07:32:55Z"
              const { authorization, tenantId } = authData
              const headers = {
                'Content-Type': 'application/json',
                'X-TENANT-ID': tenantId,
                Authorization: authorization
              }
              const method = 'post'
              const path = 'appointment/create-meeting-link'
              // console.log({ path, method, headers, requestBody }, 'for appointment')
              const { result } = await this.externalAPICall(path, method, headers, requestBody)
              // console.log('<================== from appointment ==================>')
              // console.log({ result, error })
              // console.log('<================== from appointment ==================>')
              appointmentTxnData.medium = result?.data?.medium
              appointmentTxnData.mediumData = result?.data?.mediumData
              appointmentTxnData.appointModeValue = result?.data?.meetingUrl
            }
          } catch (error) {
            console.log(error, 'appointment medium create error')
          }

          await conn.AppointmentTxn.create(appointmentTxnData, { transaction: t })
        }
      }
      // Appoinment creation ends
      // TODO: CREATE Attachment Here
      if (Array.isArray(interactionData?.attachments) && interactionData?.attachments?.length > 0) {
        // console.log('-------------here in attachemnet section----------------')
        for (const entityId of interactionData.attachments) {
          await findAndUpdateAttachment(entityId, response.intxnUuid, entityCategory.INTERACTION, conn, t)
        }
      }

      if (interactionData.isResolvedBy !== 'BOT') {
        await assignWFToEntity(intxnUid, entityCategory.INTERACTION, flwId, commonAttrib, conn, t)
        //   em.emit('INTERACTION_WORFKFLOW_ENGINE', { intxnId: response?.intxnUuid, ...commonAttrib })
        const workflowExecute = await startWorkFlowEngineManual(response?.intxnUuid, conn, t)
        if (workflowExecute?.status === 'ERROR') {
          return {
            status: statusCodeConstants.ERROR,
            message: workflowExecute.message
          }
        }
      }

      const source = await conn.BusinessEntity.findOne({
        attributes: ['description'],
        where: {
          code: interactionData.interactionType
        }
      })

      /** Getting Customer contact information */
      let contactWhereClause = {}
      if (interactionData?.customerId && customerInfo) {
        contactWhereClause = {
          contactCategoryValue: customerInfo.customerNo,
          status: defaultStatus.ACTIVE,
          contactCategory: entityCategory.CUSTOMER
        }
      } else {
        contactWhereClause = {
          contactCategoryValue: customerInfo.profileNo,
          status: defaultStatus.ACTIVE,
          contactCategory: entityCategory.PROFILE
        }
      }
      console.log('contactWhereClause ==> ', contactWhereClause)
      let contactInfo = await conn.Contact.findOne({
        where: { ...contactWhereClause },
        order: [['contactId', 'DESC']]
      })

      contactInfo = contactInfo?.dataValues ? contactInfo?.dataValues : contactInfo

      console.log('contactInfo ==> ', contactInfo)

      let email, contactNo, contactNoPfx
      if (contactInfo) {
        email = contactInfo.emailId || null
        contactNo = contactInfo.mobileNo || null
        contactNoPfx = contactInfo.mobilePrefix || null
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      let businessUser
      if (interactionData?.currUser) {
        businessUser = await conn.User.findOne({ where: { userId: interactionData?.currUser } })
      }

      /* Creating Notification request information */
      logger.debug('Creating Notification request information')
      const notificationData = {
        consumerUser: {
          name: customerInfo.firstName,
          email,
          contactNo,
          contactNoPfx
        },
        businessUser: {
          name: businessUser?.firstName,
          email: businessUser?.email,
          contactNo: businessUser?.contactNo,
          contactNoPfx: businessUser?.extn
        },
        notifiationSource: source.description,
        referenceId: response.intxnNo,
        referenceSubId: interactionHistory.intxnTxnNo,
        userId: userId || systemUserId,
        customerId: interactionData.customerId || interactionData.profileId,
        departmentId: interactionData.departmentId,
        roleId: interactionData.roleId,
        channel: interactionData.channel,
        type: 'CREATE-INTERACTION',
        contactPreference: interactionData.contactPreference,
        mapCategory: 'TMC_INTERACTION',
        eventType: 'ET_CREATION',
        tranCategory: interactionData.interactionCategory,
        tranType: interactionData.interactionType,
        serviceCategory: interactionData?.serviceCategory,
        serviceType: interactionData?.serviceType,
        conn,
        ...commonAttrib
      }

      /** Sending Create Interaction Noification */
      logger.debug('Sending Create Interaction Noification')
      em.emit('SEND_INTERACTION_NOTIFICATION', notificationData)
      // Create notification for Department
      const emailList = await getUsersByRole(roleId || systemRoleId, departmentId || systemDeptId, defaultCode.EMAIL, conn)
      let emailIds
      emailList.forEach(emailId => {
        emailIds = (emailId.email + ',' + emailIds)
      })

      const serviceType = interactionResources.getbusinessEntity(businessEntityInfo, interactionData?.serviceType)
      const intxnCause = interactionResources.getbusinessEntity(businessEntityInfo, interactionData?.problemCause)
      const priority = interactionResources.getbusinessEntity(businessEntityInfo, interactionData?.priorityCode)

      const departmentNotification = {
        email: emailIds,
        notifiationSource: source.description,
        referenceId: response.intxnNo,
        referenceSubId: interactionHistory.intxnTxnNo,
        userId: userId || systemUserId,
        customerId: interactionData.customerId || interactionData.profileId,
        departmentId,
        roleId,
        interactionDescription: interactionData.remarks,
        serviceType: serviceType?.description,
        intxnCause: intxnCause?.description,
        status: defaultStatus.NEW,
        primaryContact: email,
        priority: priority?.description,
        customerName: customerInfo.firstName,
        channel: interactionData?.channel,
        type: 'CREATE-INTERACTION-DEPT',
        ...commonAttrib
      }
      em.emit('SEND_INTERACTION_NOTIFICATION_DEPT', departmentNotification)

      // if (interactionData.isResolvedBy !== 'BOT') {
      //   em.emit('INTERACTION_WORFKFLOW_ENGINE', { intxnId: response?.intxnUuid, ...commonAttrib })
      // }

      // Create New PopUp Notification
      const userList = getUsersByRole(interactionData?.roleId, interactionData?.departmentId, defaultCode.POPUP, conn) || []
      const notificationObj = {
        notificationType: defaultCode.POPUP,
        subject: 'Interaction is Assigned to your Role',
        channel: interactionData?.channel ? interactionData?.channel : 'WEB',
        body: 'Interaction is Assigned to your Role',
        intxnId: response.intxnId,
        userId,
        roleId,
        departmentId,
        status: 'SENT',
        interactionNumber: response.intxnNo,
        intxnPriority: interactionData.priorityCode,
        customerNo: customerInfo.customerNo,
        assignedUserId: interactionData?.userId || null,
        assignedDepartmentId: interactionData?.departmentId,
        assignedRoleId: interactionData?.roleId,
        intxnStatus: interactionData.status,
        userList
      }
      logger.debug('Interaction PopUp Notification', notificationObj)
      em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', notificationObj)

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Interaction created Successfully with Id - ${response.intxnNo}`,
        data: {
          intxnNo: response.intxnNo,
          intxnId: response.intxnId
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async externalAPICall(path, method, headers, data) {
    const url = `${bcaeConfig.host}:${bcaeConfig.gatewayPort}/api/${path}`

    if (method === 'post') headers['Content-Type'] = 'application/json'

    return new Promise((resolve, reject) => {
      axios.request({ url, method, headers, data })
        .then((response) => {
          resolve({ result: response.data })
        })
        .catch((error) => {
          console.log(error?.response?.data)
          resolve({ error })
        })
    })
  }

  async createRequest(requestData, userId, roleId, departmentId, conn, t) {
    try {
      const configResponse = await conn.BcaeAppConfig.findOne({
        attributes: ['appTenantId', 'systemDefaultRole', 'systemUserId', 'systemDefaultDepartment'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })
      const configRes = configResponse?.dataValues ? configResponse?.dataValues : configResponse
      systemDeptId = configRes?.systemDefaultDepartment
      systemRoleId = configRes?.systemDefaultRole
      systemUserId = configRes?.systemUserId
      if (!requestData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const workflowMappings = await conn.WorkflowMapping.findAll({
        where: {
          moduleName: 'REQ',
          status: defaultStatus.ACTIVE
        }
      })
      // console.log('workflowMappings-------->', workflowMappings)
      // TODO: Need to check if given statementId and other mapping details are mapped
      let flwId
      for (const w of workflowMappings) {
        const mapping = w.mappingPayload

        if (
          mapping.serviceType && mapping.serviceType === requestData.serviceType &&
          mapping.serviceCategory && mapping.serviceCategory === requestData.serviceCategory &&
          mapping.requestCategory && mapping.requestCategory === requestData.requestCategory &&
          mapping.requestType && mapping.requestType === requestData.requestType) {
          flwId = w.workflowId
          break
        }
      }
      if (!flwId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Workflow not found. Please configure the workflow or contact admin'
        }
      }
      const guid = uuidv4()
      const commonAttrib = {
        tranId: guid,
        createdDeptId: departmentId || systemDeptId,
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }
      const intxnUid = uuidv4()
      const interaction = {
        requestUuid: intxnUid,
        entityType: requestData.entityType,
        entityValue: requestData.entityValue,
        // requestCategory: requestData.requestCategory,
        requestStatement: requestData.statement,
        requestDescription: requestData.remarks,
        requestType: requestData.requestType,
        serviceType: requestData.serviceType,
        // serviceCategory: requestData.serviceCategory,
        // requestChannel: requestData.channel,
        // requestCause: requestData.problemCause,
        requestPriority: requestData.priorityCode,
        contactPreference: requestData.contactPreference,
        // assignedDate: (new Date()),
        requestDate: (new Date()),
        currUser: null,
        currEntity: departmentId || 'DEPT.OU.ORG',
        // rcResolution: requestData?.rcResolution || '',
        requestStatus: defaultStatus?.requestStatus?.PENDING,
        currRole: roleId || systemRoleId,
        ...commonAttrib
      }
      // console.log('request------>', interaction)
      const response = await conn.Request.create(interaction, { transaction: t })
      const addHistory = {
        requestId: response.requestId,
        requestType: requestData.requestType,
        requestTxnUuid: uuidv4(),
        requestUuid: intxnUid,
        serviceCategory: requestData.serviceCategory || null,
        serviceType: requestData.serviceType,
        // ticketType: requestData.interactionType,
        requestPriority: requestData.priorityCode,
        // requestCause: requestData.problemCause,
        requestChannel: requestData.channel,
        contactPreference: requestData.contactPreference,
        fromEntityId: departmentId || 'DEPT.OU.ORG',
        fromRoleId: roleId || systemRoleId,
        fromUserId: userId || systemUserId,
        toEntityId: departmentId || 'DEPT.OU.ORG',
        toRoleId: roleId || systemRoleId,
        toUserId: userId || systemUserId,
        remarks: requestData.remarks,
        requestFlow: interactionFlowAction.CREATED,
        // requestPriority: requestData.priorityCode,
        requestTxnStatus: defaultStatus.NEW,
        isFollowup: defaultCode.NO,
        requestCreatedDate: new Date(),
        createdBy: userId || systemUserId,
        requestCreatedBy: userId || systemUserId,
        ...commonAttrib
      }
      // console.log('addHistory----->', addHistory)
      await conn.RequestTxn.create(addHistory, { transaction: t })

      const guid1 = uuidv4()
      // eslint-disable-next-line no-unused-vars
      const commonAttribAppointment = {
        tranId: guid1,
        createdDeptId: departmentId || systemDeptId,
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      if (requestData?.isResolvedBy !== 'BOT') {
        await assignWFToEntity(intxnUid, requestData.entityType, flwId, commonAttrib, conn, t)
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Request created Successfully with Id - ${response.requestNo}`,
        data: {
          requestNo: response.requestNo,
          requestId: response.requestId
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async createSmartRequest(requestData, userId, roleId, departmentId, conn, t) {
    try {
      // console.log('requestData---->', requestData)
      // console.log('userId---->', userId)
      // console.log('Create Request is in progress---->', conn.BcaeAppConfig)
      const configResponse = await conn.BcaeAppConfig.findOne({
        attributes: ['appTenantId', 'systemDefaultRole', 'systemUserId', 'systemDefaultDepartment'],
        where: {
          status: defaultStatus.ACTIVE
        },
        logging: true
      })
      const configRes = configResponse?.dataValues ? configResponse?.dataValues : configResponse
      systemDeptId = configRes?.systemDefaultDepartment
      systemRoleId = configRes?.systemDefaultRole
      systemUserId = configRes?.systemUserId

      // console.log('systemDeptId--->', systemDeptId)
      // console.log('systemRoleId--->', systemRoleId)
      // console.log('systemUserId--->', systemUserId)

      if (!requestData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const workflowMappings = await conn.WorkflowMapping.findAll({
        where: {
          moduleName: 'REQ',
          status: defaultStatus.ACTIVE
        }
      })
      // console.log('workflowMappings-------->', workflowMappings)
      // TODO: Need to check if given statementId and other mapping details are mapped
      let flwId
      for (const w of workflowMappings) {
        const mapping = w.mappingPayload
        if (
          mapping.serviceType && mapping.serviceType === requestData.serviceType &&
          mapping.serviceCategory && mapping.serviceCategory === requestData.serviceCategory &&
          // mapping.requestCategory && mapping.requestCategory === requestData.requestCategory &&
          mapping.requestType && mapping.requestType === requestData.requestType) {
          flwId = w.workflowId
          break
        }
      }
      // console.log('flwId----->', flwId)
      if (!flwId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Workflow not found. Please configure the workflow or contact admin'
        }
      }
      const guid = uuidv4()
      const commonAttrib = {
        tranId: guid,
        createdDeptId: requestData?.departmentId || systemUserId,
        createdRoleId: requestData?.roleId || systemRoleId,
        createdBy: requestData?.currUser || systemUserId,
        updatedBy: requestData?.currUser || systemUserId
      }
      const intxnUid = uuidv4()
      const interaction = {
        requestUuid: intxnUid,
        entityType: requestData?.entityType,
        entityValue: requestData?.entityValue,
        requestStatement: requestData?.requestStatement,
        requestStatementId: requestData?.requestStatementId,
        requestDescription: requestData?.requestDescription,
        requestType: requestData?.requestType,
        serviceType: requestData?.serviceType,
        requestChannel: requestData?.requestChannel,
        requestPriority: requestData?.requestPriority,
        contactPreference: requestData?.contactPreference,
        requestDate: (new Date()),
        currUser: requestData?.currUser,
        currEntity: departmentId || systemDeptId,
        requestStatus: defaultStatus?.requestStatus?.PENDING,
        currRole: roleId || systemRoleId,
        mappingPayload: requestData?.mappingPayload,
        // customerId: requestData?.customerId,
        customerUuid: requestData?.customerUuid,
        type: requestData?.type,
        requestedByDept: requestData?.requestedByDept,
        requestedByRole: requestData?.requestedByRole,
        ...commonAttrib
      }
      // console.log('request------>', interaction)
      const response = await conn.Request.create(interaction, { transaction: t })
      // console.log('response---->', response)
      const addHistory = {
        requestId: response.requestId,
        requestType: requestData?.requestType,
        requestTxnUuid: uuidv4(),
        requestUuid: intxnUid,
        serviceCategory: requestData?.serviceCategory || null,
        serviceType: requestData?.serviceType,
        // ticketType: requestData.interactionType,
        requestPriority: requestData?.requestPriority,
        // requestCause: requestData.problemCause,
        requestChannel: requestData?.requestChannel,
        contactPreference: requestData?.contactPreference,
        fromEntityId: departmentId || systemDeptId,
        fromRoleId: roleId || systemRoleId,
        fromUserId: userId || systemUserId,
        toEntityId: departmentId || systemDeptId,
        toRoleId: roleId || systemRoleId,
        toUserId: userId || systemUserId,
        remarks: requestData?.requestStatusReason,
        requestFlow: interactionFlowAction.CREATED,
        // requestPriority: requestData.priorityCode,
        requestTxnStatus: defaultStatus.NEW,
        isFollowup: defaultCode.NO,
        requestCreatedDate: new Date(),
        createdBy: requestData?.currUser || systemUserId,
        requestCreatedBy: requestData?.currUser || systemUserId,
        ...commonAttrib
      }
      // console.log('addHistory----->', addHistory)
      await conn.RequestTxn.create(addHistory, { transaction: t })

      requestData?.mappingPayload?.forEach(async (ele) => {
        await conn.Product.update({ totalQty: conn.sequelize.literal('total_qty - ' + Number(ele?.qty) + '') }, {
          where: {
            productId: ele?.productId
          },
          transaction: t,
          individualHooks: true
        })
      })

      if (requestData?.isResolvedBy !== 'BOT') {
        await assignWFToEntity(intxnUid, requestData.entityType, flwId, commonAttrib, conn, t)
      }
      // console.log('res---------->', {
      //   status: statusCodeConstants.SUCCESS,
      //   message: `Request created Successfully with Id - ${response.requestNo}`,
      //   data: {
      //     requestNo: response.requestNo,
      //     requestId: response.requestId
      //   }
      // })
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Request created Successfully with Id - ${response.requestNo}`,
        data: {
          requestNo: response.requestNo,
          requestId: response.requestId
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async addFollowUp(interactionData, userId, roleId, departmentId, conn, t) {
    try {
      const { interactionNumber, remarks } = interactionData

      if (!interactionData || !interactionNumber || !remarks) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const checkExistingInteraction = await conn.Interaction.findOne({
        where: {
          intxnNo: interactionNumber
        }
      })

      if (!checkExistingInteraction) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: `This Interaction ID ${interactionNumber} does not have any interaction details.`
        }
      }

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId || 'DEPT.OU.ORG',
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      const previousHistory = await conn.InteractionTxn.findOne({
        order: [['createdAt', 'DESC']],
        where: {
          intxnId: checkExistingInteraction.intxnId,
          isFollowup: defaultCode.NO
        }
      })

      const followUpData = {
        intxnId: previousHistory.intxnId,
        intxnType: previousHistory.intxnType,
        intxnTxnUuid: uuidv4(),
        intxnUuid: previousHistory.intxnUuid,
        intxnCause: previousHistory.problemCause,
        serviceCategory: previousHistory.serviceCategory,
        serviceType: previousHistory.serviceType,
        intxnPriority: interactionData.priorityCode,
        intxnChannel: interactionData.source,
        contactPreference: previousHistory.contactPreference,
        fromEntityId: previousHistory.fromEntityId,
        fromRoleId: previousHistory.fromRoleId,
        fromUserId: previousHistory.fromUserId,
        toEntityId: previousHistory.toEntityId,
        toRoleId: previousHistory.toRoleId,
        toUserId: previousHistory.toUserId,
        remarks: interactionData.remarks,
        intxnFlow: interactionFlowAction.FOLLOWUP,
        flwCreatedBy: userId || systemUserId,
        intxnTxnStatus: previousHistory.intxnTxnStatus,
        isFollowup: defaultCode.YES,
        intxnCreatedDate: new Date(),
        intxnCreatedBy: userId || systemUserId,
        ...commonAttrib
      }

      const followUp = await conn.InteractionTxn.create(followUpData, { transaction: t })
      // TODO: CREATE Attachment Here

      if (userId) {
        let user = await conn.User.findOne({
          where: {
            userId
          }
        })

        let checkExistingCustomer = await conn.Customer.findOne({
          where: {
            customerId: checkExistingInteraction.customerId
          }
        })
        user = user?.dataValues ?? user
        checkExistingCustomer = checkExistingCustomer?.dataValues ?? checkExistingCustomer
        // Create New PopUp Notification
        const notificationObj = {
          notificationType: defaultCode.POPUP,
          subject: `Interaction is followed by ${user?.firstName || ''}`,
          channel: 'WEB',
          body: `Interaction is followed by ${user?.firstName || ''}`,
          intxnId: checkExistingInteraction.intxnId,
          userId: userId || systemUserId,
          roleId: roleId || systemRoleId,
          departmentId: departmentId || systemDeptId,
          status: 'SENT',
          interactionNumber,
          intxnPriority: interactionData.priorityCode,
          customerNo: checkExistingCustomer?.customerNo,
          assignedUserId: checkExistingInteraction?.currUser || null,
          assignedDepartmentId: previousHistory?.toEntityId,
          assignedRoleId: previousHistory?.toRoleId,
          type: interactionFlowAction.FOLLOWUP
        }
        logger.debug('Interaction PopUp Notification', notificationObj)
        em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', notificationObj)

        let businessUser
        if (checkExistingInteraction?.currUser) {
          businessUser = await conn.User.findOne({ where: { userId: checkExistingInteraction?.currUser } })
        }

        /* Creating Notification request information */
        logger.debug('Creating Notification request information')
        const notificationData = {
          businessUser: {
            name: businessUser?.firstName,
            email: businessUser?.email,
            contactNo: businessUser?.contactNo,
            contactNoPfx: businessUser?.extn
          },
          notifiationSource: followUp?.description,
          referenceId: checkExistingInteraction.intxnNo,
          referenceSubId: followUp?.intxnTxnNo,
          userId: userId || systemUserId,
          customerId: checkExistingInteraction.customerId || checkExistingInteraction.profileId,
          departmentId: checkExistingInteraction.departmentId,
          roleId: checkExistingInteraction.roleId,
          channel: checkExistingInteraction.channel,
          type: 'UPDATE-INTERACTION',
          contactPreference: checkExistingInteraction.contactPreference,
          mapCategory: 'TMC_INTERACTION',
          eventType: 'ET_FOLLOWUP',
          tranCategory: checkExistingInteraction.interactionCategory,
          tranType: checkExistingInteraction.interactionType,
          serviceCategory: checkExistingInteraction?.serviceCategory,
          serviceType: checkExistingInteraction?.serviceType,
          conn,
          ...commonAttrib
        }

        /** Sending Create Interaction Noification */
        logger.debug('Sending Create Interaction Noification')
        em.emit('SEND_INTERACTION_NOTIFICATION', notificationData)
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Follow up created successfully for Interaction Id - ${interactionNumber}`,
        data: followUp
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async assignInteraction(interactionData, userId, roleId, departmentId, conn, t) {
    try {
      const { interactionNumber, type } = interactionData
      // console.log('interactionData--------->', interactionData)
      if (!interactionNumber) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingInteraction = await conn.Interaction.findOne({
        where: {
          intxnNo: interactionNumber
        }
      })

      if (!checkExistingInteraction) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `The Interaction Id ${interactionNumber} does not have any interaction details.`
        }
      }
      if (checkExistingInteraction.intxnStatus === defaultStatus.CLOSED || checkExistingInteraction.intxnStatus === defaultStatus.CANCELLED) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `This Interaction ${(type === 'REASSIGN' || type === 'REASSIGN_TO_SELF') ? 'reassign' : 'assign'} is not allowed when interaction current status in Closed/Cancel Status.`
        }
      }

      if (checkExistingInteraction.currUser && type === 'SELF') {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `The Interaction Id ${interactionNumber} is already assigned ${checkExistingInteraction.currUser === (userId || systemUserId) ? 'to you!' : 'to some other user.'} `
        }
      }

      if (checkExistingInteraction && checkExistingInteraction.currEntity !== departmentId &&
        checkExistingInteraction.currRole !== roleId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `The Interaction Id ${interactionNumber} is currently in different department or role`
        }
      }

      let assignData = {}
      if (type === 'SELF' || type === 'REASSIGN_TO_SELF') {
        assignData = {
          currEntity: departmentId,
          // intxnStatus: defaultStatus.ASSIGNED,
          currRole: roleId || systemRoleId,
          currUser: userId,
          assignedDate: (new Date()),
          intxnToken: uuidv4()
        }
      } else if (type === 'REASSIGN') {
        assignData = {
          currUser: interactionData?.userId,
          assignedDate: (new Date()),
          intxnToken: uuidv4()
        }
      }

      const updateInteraction = await conn.Interaction.update(assignData, { where: { intxnId: checkExistingInteraction.intxnId }, transaction: t })
      if (updateInteraction) {
        const previousHistory = await conn.InteractionTxn.findOne({
          order: [['createdAt', 'DESC']],
          where: {
            intxnId: checkExistingInteraction.intxnId,
            isFollowup: defaultCode.NO
          }
        })
        const commonAttrib = {
          tranId: uuidv4(),
          createdDeptId: departmentId || 'DEPT.OU.ORG',
          createdRoleId: roleId || systemRoleId,
          createdBy: userId || systemUserId,
          updatedBy: userId || systemUserId
        }

        const addHistory = {
          intxnId: checkExistingInteraction.intxnId,
          intxnType: previousHistory.intxnType,
          intxnTxnUuid: uuidv4(),
          intxnUuid: previousHistory.intxnUuid,
          serviceCategory: previousHistory.serviceCategory,
          serviceType: previousHistory.serviceType,
          intxnCause: previousHistory.problemCause,
          intxnPriority: previousHistory.intxnPriority,
          intxnChannel: previousHistory.intxnChannel,
          contactPreference: previousHistory.contactPreference,
          fromEntityId: previousHistory.fromEntityId,
          fromRoleId: previousHistory.fromRoleId,
          fromUserId: previousHistory.fromUserId,
          toEntityId: departmentId,
          toRoleId: roleId || systemRoleId,
          toUserId: interactionData?.userId || userId || systemUserId,
          remarks: (type === 'REASSIGN' || type === 'REASSIGN_TO_SELF') ? 'Interaction Re-Assigned' : 'Interaction Assigned',
          intxnFlow: (type === 'REASSIGN' || type === 'REASSIGN_TO_SELF') ? interactionFlowAction.REASSIGN : interactionFlowAction.ASSIGN,
          flwCreatedBy: userId || systemUserId,
          intxnTxnStatus: previousHistory.intxnTxnStatus,
          isFollowup: defaultCode.NO,
          intxnCreatedDate: new Date(),
          intxnCreatedBy: userId || systemUserId,
          ...commonAttrib
        }

        await conn.InteractionTxn.create(addHistory, { transaction: t })
        if (type === 'SELF') {
          const wfHdrData = await conn.WorkflowHdr.findOne({ where: { entityId: checkExistingInteraction.intxnUuid } })
          const wfHdrId = wfHdrData?.wfHdrId
          if (wfHdrId) {
            const WorkflowHistory = await conn.WorkflowTxn.findOne({
              where: {
                wfHdrId,
                wfTxnStatus: defaultStatus.USER_WAIT
              },
              order: [['wfTxnId', 'DESC']]
            })
            const wfTxnId = WorkflowHistory?.wfTxnId
            if (wfTxnId) {
              await conn.WorkflowTxn.update(assignData, { where: { wfTxnId } })
            }
          }
        }
        let checkExistingCustomer
        if (checkExistingInteraction?.customerId) {
          checkExistingCustomer = await conn.Customer.findOne({
            where: {
              customerId: checkExistingInteraction.customerId
            }
          })
        }
        checkExistingCustomer = checkExistingCustomer?.dataValues ?? checkExistingCustomer

        // Create New PopUp Notification
        const notificationObj = {
          notificationType: defaultCode.POPUP,
          subject: 'Interaction is Assigned to you',
          channel: 'WEB',
          body: 'Interaction is Assigned to you',
          intxnId: checkExistingInteraction.intxnId,
          userId,
          roleId,
          departmentId,
          status: 'SENT',
          interactionNumber,
          intxnPriority: previousHistory.intxnPriority,
          customerNo: checkExistingCustomer?.customerNo,
          assignedUserId: interactionData?.userId || userId,
          assignedDepartmentId: departmentId,
          assignedRoleId: roleId || systemRoleId
        }
        logger.debug('Interaction PopUp Notification', notificationObj)
        em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', notificationObj)

        /* Creating Notification request information */
        logger.debug('Creating Notification request information')

        let customerInfo
        if (checkExistingInteraction && (checkExistingInteraction?.customerId || checkExistingInteraction?.customerUuid)) {
          const customerWhere = {}
          if (checkExistingInteraction?.customerId) {
            customerWhere.customerId = Number(checkExistingInteraction?.customerId)
          } else if (checkExistingInteraction?.customerUuid) {
            customerWhere.customerUuid = checkExistingInteraction?.customerUuid
          }
          // console.log('customerWhere----->', customerWhere)
          customerInfo = await conn.Customer.findOne({
            where: customerWhere
          })
        }

        if (checkExistingInteraction && checkExistingInteraction?.profileId) {
          customerInfo = await conn.Profile.findOne({
            where: {
              profileId: checkExistingInteraction.profileId
            }
          })
        }
        if (!customerInfo) {
          console.log(`No customer found for id ${checkExistingInteraction.customerId}`)
        }
        // console.log('customerInfo-------xxx-->', customerInfo?.customerNo)
        // console.log('checkExistingInteraction-------xxx-->', checkExistingInteraction)

        checkExistingInteraction = checkExistingInteraction?.dataValues ? checkExistingInteraction?.dataValues : checkExistingInteraction
        customerInfo = customerInfo?.dataValues ? customerInfo?.dataValues : customerInfo

        const source = await conn.BusinessEntity.findOne({
          attributes: ['description'],
          where: {
            code: checkExistingInteraction?.interactionType ?? checkExistingInteraction?.intxnType
          }
        })

        const assignedUser = await conn.User.findOne({ where: { userId: notificationObj.assignedUserId } })

        const notificationData = {
          businessUser: {
            name: assignedUser?.firstName,
            email: assignedUser?.email,
            contactNo: assignedUser?.contactNo,
            contactNoPfx: assignedUser?.extn
          },
          notifiationSource: source.description,
          referenceId: checkExistingInteraction.intxnNo,
          referenceSubId: checkExistingInteraction.intxnTxnNo,
          userId: userId || systemUserId,
          customerId: checkExistingInteraction.customerId || checkExistingInteraction.profileId,
          departmentId: checkExistingInteraction.departmentId || systemDeptId,
          roleId: checkExistingInteraction.roleId || systemRoleId,
          channel: checkExistingInteraction.channel,
          type: type === 'REASSIGN' ? 'REASSIGN-INTERACTION' : 'ASSIGN-INTERACTION',
          contactPreference: checkExistingInteraction.contactPreference,
          mapCategory: 'TMC_INTERACTION',
          eventType: type === 'REASSIGN' ? 'ET_REASSIGNED' : 'ET_ASSIGNED',
          tranCategory: checkExistingInteraction?.interactionCategory ?? checkExistingInteraction?.intxnCategory,
          tranType: checkExistingInteraction?.interactionType ?? checkExistingInteraction?.intxnType,
          serviceCategory: checkExistingInteraction?.serviceCategory,
          serviceType: checkExistingInteraction?.serviceType,
          replyMessage: `Hi ${assignedUser.firstName}, You have raised an interaction ${checkExistingInteraction?.intxnNo} successfully. Please use this ID to track your interaction status.`,
          conn,
          ...commonAttrib
        }

        /** Sending Create Interaction Noification */
        logger.debug('Sending Create Interaction Noification')
        em.emit('SEND_INTERACTION_NOTIFICATION', notificationData)
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Interaction has been ${(type === 'REASSIGN' || type === 'REASSIGN_TO_SELF') ? 'reassigned' : 'assigned'} successfully for Id - ${interactionNumber}`
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async updateInteraction(interactionData, userId, roleId, departmentId, conn, t) {
    try {
      const { interactionNumber } = interactionData
      if (!interactionNumber) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const checkExistingInteraction = await conn.Interaction.findOne({
        where: {
          intxnNo: interactionNumber
        }
      })

      if (!checkExistingInteraction) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `This Interaction ID ${interactionNumber} does not have any interaction details.`
        }
      }

      if (checkExistingInteraction?.intxnStatus === defaultStatus.CLOSED || checkExistingInteraction?.intxnStatus === defaultStatus.CANCELLED) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'This interaction has not been allowed to update when the interaction current status is closed or cancelled.'
        }
      }

      let checkExistingCustomer
      if (checkExistingInteraction?.customerId) {
        checkExistingCustomer = await conn.Customer.findOne({
          where: {
            customerId: checkExistingInteraction.customerId
          }
        })
        if (!checkExistingCustomer) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: `Unable to locate associated customer for interaction id - ${interactionNumber}`
          }
        }
      }

      if (checkExistingInteraction?.profileId) {
        checkExistingCustomer = await conn.Profile.findOne({
          where: {
            profileId: checkExistingInteraction.profileId
          }
        })
        if (!checkExistingCustomer) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: `Unable to locate associated profile for interaction id - ${interactionNumber}`
          }
        }
      }

      const businessUnitInfo = await conn.BusinessUnit.findOne({
        attributes: ['mappingPayload', 'unitName'],
        where: {
          unitId: interactionData.departmentId,
          status: defaultStatus.ACTIVE,
          unitType: 'DEPT'
        }
      })

      if (!businessUnitInfo) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Provided departmentId is not available in system'
        }
      } else {
        const role = businessUnitInfo?.mappingPayload?.unitroleMapping.includes(interactionData.roleId) || false
        if (!role) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `Provided roleId is not mapped to ${businessUnitInfo.unitName} department`
          }
        } else {
          const checkRoleExistence = await conn.Role.findOne({
            where: {
              roleId: interactionData.roleId,
              status: defaultStatus.ACTIVE
            }
          })
          if (!checkRoleExistence) {
            return {
              status: statusCodeConstants.NOT_FOUND,
              message: 'Provided roleId is not in Active Status'
            }
          }
        }
      }
      logger.debug('Creating Notification request information')

      const updateData = {
        currUser: interactionData?.userId || null,
        currRole: interactionData.roleId,
        currEntity: interactionData.departmentId,
        intxnStatus: interactionData.status,
        intxnToken: uuidv4(),
        remarks: interactionData?.remarks,
        techCompletionDate: interactionData?.techCompletionDate,
        deployementDate: interactionData?.deployementDate
      }

      if (interactionData?.status === defaultStatus.CLOSED) {
        updateData.isResolvedBy = defaultCode.RESOLVED_BY_MANUAL
      }

      await conn.Interaction.update(updateData, { where: { intxnId: checkExistingInteraction.intxnId }, transaction: t })
      const previousHistory = await conn.InteractionTxn.findOne({
        where: {
          intxnId: checkExistingInteraction.intxnId,
          isFollowup: defaultCode.NO
        },
        order: [['createdAt', 'DESC']]
      })

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId || 'DEPT.OU.ORG',
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || checkExistingInteraction?.currUser || systemUserId,
        updatedBy: userId || checkExistingInteraction?.currUser || systemUserId
      }

      const addHistory = {
        intxnId: previousHistory.intxnId,
        intxnType: previousHistory.intxnType,
        intxnTxnUuid: uuidv4(),
        intxnUuid: previousHistory.intxnUuid,
        serviceCategory: previousHistory.serviceCategory,
        intxnCause: previousHistory.problemCause,
        serviceType: previousHistory.serviceType,
        intxnPriority: previousHistory.intxnPriority,
        intxnChannel: previousHistory.intxnChannel,
        contactPreference: previousHistory.contactPreference,
        fromEntityId: previousHistory.toEntityId,
        fromRoleId: previousHistory.toRoleId || roleId,
        fromUserId: previousHistory.toUserId || userId,
        toEntityId: interactionData.departmentId,
        toRoleId: interactionData.roleId,
        toUserId: interactionData?.userId || null,
        remarks: interactionData.remarks,
        intxnFlow: interactionFlowAction.UPDATE,
        flwCreatedBy: userId || systemUserId,
        intxnTxnStatus: interactionData.status,
        isFollowup: defaultCode.NO,
        intxnCreatedDate: new Date(),
        intxnCreatedBy: userId || checkExistingInteraction?.currUser || systemUserId,
        ...commonAttrib
      }
      const interactionHistory = await conn.InteractionTxn.create(addHistory, { transaction: t })
      logger.debug('Creating Notification request information')

      await updateWFState(checkExistingInteraction?.intxnUuid, entityCategory.INTERACTION, {
        status: interactionData.status,
        dept: interactionData.departmentId,
        role: interactionData.roleId
      }, userId, conn, t)
      const workflowExecute = await startWorkFlowEngineManual(checkExistingInteraction?.intxnUuid, conn, t)
      if (workflowExecute?.status === 'ERROR') {
        return {
          status: statusCodeConstants.ERROR,
          message: workflowExecute.message
        }
      }

      /** Closing Helpdesk Ticket when closing there interaction */

      if (interactionData?.status === defaultStatus.CLOSED && checkExistingInteraction?.helpdeskId) {
        const getHelpdesk = await conn.Helpdesk.findOne({
          where: {
            helpdeskId: checkExistingInteraction?.helpdeskId
          }
        })

        if (getHelpdesk) {
          await conn.Helpdesk.update({ status: defaultStatus.HELPDESK_CLOSED }, { where: { helpdeskId: checkExistingInteraction?.helpdeskId } })

          const helpdeskHistory = {
            helpdeskId: checkExistingInteraction?.helpdeskId,
            status: defaultStatus.HELPDESK_CLOSED,
            helpdeskTxnUuid: uuidv4(),
            helpdeskActionRemark: interactionFlowAction.HELPDESK_CLOSED,
            statusChngDate: new Date(),
            currUser: userId,
            ...commonAttrib
          }
          await conn.HelpdeskTxn.create(helpdeskHistory, { transaction: t })
        }
      }

      /** Getting Customer contact information */
      let contactWhereClause = {}
      if (checkExistingInteraction?.customerId && checkExistingCustomer) {
        contactWhereClause = {
          contactCategoryValue: checkExistingCustomer.customerNo,
          status: defaultStatus.ACTIVE,
          contactCategory: entityCategory.CUSTOMER
        }
      } else {
        contactWhereClause = {
          contactCategoryValue: checkExistingCustomer.profileNo,
          status: defaultStatus.ACTIVE,
          contactCategory: entityCategory.PROFILE
        }
      }
      const contactInfo = await conn.Contact.findOne({
        where: { ...contactWhereClause }
      })

      let email, contactNo, contactNoPfx
      if (contactInfo) {
        email = contactInfo.emailId || null
        contactNo = contactInfo.mobileNo || null
        contactNoPfx = contactInfo.mobilePrefix || null
      }
      const source = await conn.BusinessEntity.findOne({
        attributes: ['description'],
        where: {
          code: checkExistingInteraction.intxnType
        }
      })

      let businessUser
      if (interactionData?.userId) {
        businessUser = await conn.User.findOne({ where: { userId: interactionData?.userId } })
      }

      /* Creating Notification request information */
      logger.debug('Creating Notification request information')
      // eslint-disable-next-line no-unused-vars
      const notificationData = {
        consumerUser: {
          name: checkExistingCustomer.firstName,
          email,
          contactNo,
          contactNoPfx
        },
        businessUser: {
          name: businessUser?.firstName,
          email: businessUser?.email,
          contactNo: businessUser?.contactNo,
          contactNoPfx: businessUser?.extn
        },
        notifiationSource: source.description,
        referenceId: interactionNumber,
        referenceSubId: interactionHistory.intxnTxnNo,
        userId: userId || systemUserId,
        customerId: checkExistingInteraction.customerId || checkExistingInteraction.profileId,
        departmentId: interactionData.departmentId,
        roleId: interactionData.roleId,
        channel: interactionData.channel,
        type: interactionData.status === 'CLOSED' ? 'CLOSE-INTERACTION' : 'UPDATE-INTERACTION',
        contactPreference: checkExistingInteraction.contactPreference,
        mapCategory: 'TMC_INTERACTION',
        eventType: interactionData.status === 'CLOSED' ? 'ET_CLOSE' : 'ET_EDIT',
        tranCategory: interactionData.interactionCategory,
        tranType: interactionData.interactionType,
        serviceCategory: interactionData?.serviceCategory,
        serviceType: interactionData?.serviceType,
        conn
      }

      /** Sending Create Interaction Noification */
      logger.debug('Sending Update Interaction Noification', notificationData)
      em.emit('SEND_INTERACTION_NOTIFICATION', notificationData)
      // em.emit('INTERACTION_WORFKFLOW_ENGINE', { intxnId: checkExistingInteraction?.intxnUuid, ...commonAttrib })

      // Create New PopUp Notification
      const userList = !interactionData?.userId ? await getUsersByRole(interactionData?.roleId, interactionData?.departmentId, defaultCode.POPUP, conn) : []
      const notificationObj = {
        notificationType: defaultCode.POPUP,
        subject: `Interaction is Assigned to ${interactionData?.userId ? 'you' : 'your Role'}`,
        channel: interactionData?.channel ? interactionData?.channel : 'WEB',
        body: `Interaction is Assigned to ${interactionData?.userId ? 'you' : 'your Role'}`,
        intxnId: checkExistingInteraction.intxnId,
        userId: userId || systemUserId,
        roleId: roleId || systemRoleId,
        departmentId: departmentId || systemDeptId,
        status: 'SENT',
        interactionNumber,
        intxnPriority: previousHistory.intxnPriority,
        customerNo: checkExistingCustomer?.customerNo,
        assignedUserId: interactionData?.userId || null,
        assignedDepartmentId: interactionData?.departmentId,
        assignedRoleId: interactionData?.roleId,
        intxnStatus: interactionData.status,
        userList
      }
      logger.debug('Interaction PopUp Notification', notificationObj)
      em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', notificationObj)

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Interaction Id ${interactionNumber} Updated Successfully`
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  // async searchInteractionEx (interactionData, userId, conn) {
  //   try {
  //     const { limit = 10, page = 0, searchParams, userId, departmentId } = interactionData
  //     const offSet = (page * limit)

  //     let queryStart
  //     if (conn.sequelize.options.dialect === 'mssql') {
  //       queryStart = 'select TOP ' + limit
  //     } else {
  //       queryStart = 'select '
  //     }

  //     let query = queryStart + `intxn_id,
  //     intxn_type,
  //     be.description as intxn_type_desc,
  //     i.description as description ,
  //     i.request_id as request_id,
  //     rad.request_statement as request_statement ,
  //     i.service_type as service_type,
  //     be5.description as service_type_desc,
  //     i.problem_code as problem_code,
  //     abe.description as problem_code_desc,
  //     cnt.contact_type as contact_type,
  //     abe1.description  as contact_type_desc,
  //     i.curr_entity as current_entity,
  //     bu.unit_desc as created_entity_desc ,
  //     helpdesk_id,
  //     chat_id,
  //     curr_user,
  //     curr_role,
  //     i.priority_code  as priority_code,
  //     be1.description as priority_desc,
  //     i.chnl_code as channel_code,
  //     abe2.description as channel_desc,
  //     be3.description as ticket_type_desc,
  //     i.curr_status as current_status,
  //     be4.description as curr_status_desc,
  //     i.connection_id as service_id,
  //     (
  //         case
  //       when(i.identification_no is null) then conn.identification_no
  //       else i.identification_no
  //     end
  //         ) as access_nbr,
  //     i.customer_id as customer_id,
  //     i.created_at as created_at,
  //     (
  //     select
  //       concat(u.first_name , ' ', u.last_name) as created_by
  //     from
  //       ad_users as u
  //     where
  //       user_id = i.created_by) as created_by,
  //     i.account_id as account_id,
  //     cnt.contact_no as contact_no,
  //     concat(cu.first_name , ' ', cu.last_name) as customer_name,
  //     concat(acc.first_name , ' ', acc.last_name) as account_name,
  //     account_no,
  //     concat(u.first_name , ' ', u.last_name) as assigned ,

  //     bu2.unit_desc as created_ou
  //   from
  //     interaction as i
  //   left outer join cust_customers cu on
  //     cu.customer_id = i.customer_id
  //   left outer join cust_accounts acc on
  //     i.account_id = acc.account_id
  //   left outer join cust_contacts cnt on
  //     cu.customer_id = cnt.ref_cust_id and cnt.status ='AC'
  //   left outer join cust_connections conn on
  //     i.connection_id = conn.connection_id
  //   left outer join ad_business_entity be on
  //     i.intxn_type = be.code
  //   left outer join ad_business_entity be1 on
  //     i.priority_code = be1.code
  //   left outer join ad_business_entity be3 on
  //     i.intxn_cat_type = be3.code
  //   left outer join ad_business_entity be4 on
  //     i.curr_status = be4.code
  //   left outer join ad_business_entity be5 on
  //     i.service_type = be5.code
  //   left outer join ad_business_units bu on
  //     i.created_entity = bu.unit_id
  //   left outer join ad_business_units bu2 on
  //     bu.parent_unit = bu2.unit_id
  //   left outer join ad_users u on
  //     i.curr_user = u.user_id
  //   left outer join ad_request_assisted_dtl rad on
  //     i.request_id = rad.request_id
  //   left outer join ad_business_entity abe on
  //     abe.code = i.problem_code
  //   left outer join ad_business_entity abe1 on
  //   abe1.code = cnt.contact_type
  //   left outer join ad_business_entity abe2 on
  //   abe2.code = i.chnl_code `

  //     let whereClause = ' where  '

  //     if (searchParams && searchParams?.interactionId && searchParams?.interactionId !== '' && searchParams?.interactionId !== undefined) {
  //       whereClause = whereClause + ' cast(i.intxn_id as varchar) like \'%' + searchParams.interactionId.toString() + '%\' and '
  //     }

  //     if (searchParams && searchParams?.interactionType && searchParams?.interactionType !== '' && searchParams?.interactionType !== undefined) {
  //       whereClause = whereClause + '  upper(be.description) like \'%' + searchParams.interactionId.toString().toUpperCase() + '%\' and '
  //     }

  //     if (searchParams && searchParams.customerId && searchParams.customerId !== '' && searchParams.customerId !== undefined) {
  //       whereClause = whereClause + ' cast(i.customer_id as varchar) like \'%' + searchParams.customerId.toString() + '%\' and '
  //     }

  //     if (searchParams && searchParams.contactNumber && searchParams.contactNumber !== '' && searchParams.contactNumber !== undefined) {
  //       whereClause = whereClause + ' cast(cnt.contact_no as varchar) like \'%' + searchParams.contactNumber.toString() + '%\' and '
  //     }

  //     if (searchParams && searchParams.currentUserId && searchParams.currentUserId !== '' && searchParams.currentUserId !== undefined) {
  //       whereClause = whereClause + ' cast(i.curr_user as varchar) like \'%' + searchParams.currentUserId.toString() + '%\' and '
  //     }

  //     if (searchParams && searchParams.emailId && searchParams.emailId !== '' && searchParams.emailId !== undefined) {
  //       whereClause = whereClause + ' cast(cnt.email as varchar) like \'%' + searchParams.emailId.toString() + '%\' and '
  //     }

  //     if (searchParams && searchParams.status && searchParams.status !== '' && searchParams.status !== undefined) {
  //       whereClause = whereClause + 'upper(i.curr_status) like upper(\'%' + searchParams.status + '%\') and '
  //     }

  //     if (searchParams && searchParams.customerName && searchParams.customerName !== '' && searchParams.customerName !== undefined) {
  //       whereClause = whereClause + '(upper(cu.first_name) like upper(\'%' + searchParams.customerName + '%\') or upper(cu.last_name) like  upper(\'%' +
  //         searchParams.customerName + '%\') or  upper(concat(cu.first_name,\' \',cu.last_name)) like  upper(\'%' + searchParams.customerName + '%\')) and '
  //     }

  //     if (searchParams && searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
  //       whereClause = whereClause + 'CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' and '
  //     }

  //     if (searchParams && searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
  //       whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' and '
  //     }

  //     if (searchParams && searchParams.currentRoleId && searchParams.currentRoleId !== '' && searchParams.currentRoleId !== undefined) {
  //       whereClause = whereClause + ' i.curr_role = ' + searchParams.roleId + ' and '
  //     }

  //     if (searchParams && searchParams.selfDept === 'self') {
  //       whereClause = whereClause + ' i.curr_user = ' + userId + ' and ' +
  //         ' cast(i.curr_entity as varchar) like \'%' + departmentId.toString() + '%\' and '
  //     }

  //     if (searchParams && searchParams.selfDept === 'dept') {
  //       whereClause = whereClause + ' cast(i.curr_entity as varchar) like \'%' + departmentId.toString() + '%\' and '
  //     }
  //     whereClause = whereClause.substring(0, whereClause.lastIndexOf('and'))

  //     if (searchParams && searchParams.filters && Array.isArray(searchParams.filters) && !isEmpty(searchParams.filters)) {
  //       const filters = searchInteractionWithFilters(searchParams.filters)
  //       if (filters !== '') {
  //         query = query + ' where ' + filters + ' order by i.created_at DESC'
  //       }
  //     } else {
  //       query = query + whereClause + ' order by i.created_at DESC'
  //     }

  //     let count = await conn.sequelize.query('select COUNT(*) FROM (' + query + ') t')

  //     if (page && limit && conn.sequelize.options.dialect !== 'mssql') {
  //       query = query + ' limit ' + limit + ' offset ' + offSet
  //     }

  //     let rows = await conn.sequelize.query(query, {
  //       type: QueryTypes.SELECT
  //     })
  //     rows = camelCaseConversion(rows)

  //     if (count.length > 0) {
  //       count = count[0][0]?.count
  //     }
  //     if (count === 0) {
  //       return {
  //         status: statusCodeConstants.NOT_FOUND,
  //         message: 'No intraction data found'
  //       }
  //     }
  //     const data = {
  //       rows,
  //       count
  //     }

  //     return {
  //       status: statusCodeConstants.SUCCESS,
  //       message: 'Intraction data fetch succesfully',
  //       data
  //     }
  //   } catch (error) {
  //     logger.error(error)
  //     return {
  //       status: statusCodeConstants.ERROR, message: 'Internal server error'
  //     }
  //   }
  // }

  async getHistory(interactionData, conn) {
    try {
      const { interactionNumber, getFollowUp } = interactionData
      if (!interactionNumber) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const checkExistingInteraction = await conn.Interaction.findOne({
        where: {
          intxnNo: interactionNumber
        }
      })

      if (!checkExistingInteraction) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `This Interaction ID ${interactionNumber} does not have any interaction details.`
        }
      }
      const response = await conn.InteractionTxn.findAndCountAll({
        attributes: ['intxnTxnId', 'intxnId', 'intxnUuid', 'intxnChannel', 'intxnCreatedDate', 'intxnCreatedBy', 'remarks', 'isFollowup'],
        include: [
          {
            model: conn.BusinessUnit,
            as: 'fromEntityName',
            attributes: ['unitId', 'unitName', 'unitDesc']
          },
          {
            model: conn.Role,
            as: 'fromRoleName',
            attributes: ['roleId', 'roleName', 'roleDesc']
          },
          {
            model: conn.User,
            as: 'fromUserName',
            attributes: ['userId',
              [conn.sequelize.fn('CONCAT', conn.sequelize.col('fromUserName.first_name'), ' ', conn.sequelize.col('fromUserName.last_name')), 'fromUser']]
          },
          {
            model: conn.BusinessUnit,
            as: 'toEntityName',
            attributes: ['unitId', 'unitName', 'unitDesc']
          },
          {
            model: conn.Role,
            as: 'toRoleName',
            attributes: ['roleId', 'roleName', 'roleDesc']
          },
          {
            model: conn.User,
            as: 'toUserName',
            attributes: ['userId',
              [conn.sequelize.fn('CONCAT', conn.sequelize.col('toUserName.first_name'), ' ', conn.sequelize.col('toUserName.last_name')), 'toUser']]
          },
          {
            model: conn.User,
            as: 'flwCreatedby',
            attributes: ['userId',
              [conn.sequelize.fn('CONCAT', conn.sequelize.col('flwCreatedby.first_name'), ' ', conn.sequelize.col('flwCreatedby.last_name')), 'flwCreatedBy']]
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'channelDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'priorityCodeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'flowActionDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.Interaction,
            as: 'intxnDetails',
            attributes: ['intxnId', 'intxnDescription', 'intxnNo', 'requestStatement']
          }
        ],
        where: {
          intxnId: checkExistingInteraction.intxnId,
          isFollowup: getFollowUp === 'true' ? 'Y' : 'N'
        }
      })
      if (response.count === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: `Interaction ${getFollowUp === 'true' ? 'Follow History' : 'History'} is not found for this Interaction Id - ${interactionNumber}`,
          data: response
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: `Interaction History is fetched Successfully for this Interaction Id - ${interactionNumber}`,
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async cancelInteraction(interactionData, userId, roleId, departmentId, conn, t) {
    try {
      const { interactionNumber } = interactionData
      if (!interactionNumber) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const checkCancelReason = await conn.BusinessEntity.findOne({
        where: {
          code: interactionData.cancelReason,
          status: defaultStatus.ACTIVE
        }
      })

      if (!checkCancelReason) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'The provided cancel reason is not Valid'
        }
      }

      const checkExistingInteraction = await conn.Interaction.findOne({
        where: {
          intxnNo: interactionNumber
        }
      })

      if (!checkExistingInteraction) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: `This Interaction ID ${interactionNumber} does not have any interaction details.`
        }
      }

      if (checkExistingInteraction.intxnStatus === defaultStatus.CLOSED || checkExistingInteraction.intxnStatus === defaultStatus.CANCELLED) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'The interaction cancellation is not allowed when the interaction current status is closed or cancelled.'
        }
      }

      const updateData = {
        cancelReason: interactionData.cancelReason,
        currUser: interactionData.userId,
        intxnStatus: defaultStatus.CANCELLED,
        intxnToken: null
      }
      await conn.Interaction.update(updateData, { where: { intxnId: checkExistingInteraction.intxnId }, transaction: t })
      const previousHistory = await conn.InteractionTxn.findOne({
        where: {
          intxnId: checkExistingInteraction.intxnId,
          isFollowup: defaultCode.NO
        },
        order: [['intxnId', 'DESC']]
      })

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId || 'DEPT.OU.ORG',
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }
      const addHistory = {
        intxnId: previousHistory.intxnId,
        intxnType: previousHistory.intxnType,
        intxnTxnUuid: uuidv4(),
        intxnUuid: previousHistory.intxnUuid,
        serviceCategory: previousHistory.serviceCategory,
        serviceType: previousHistory.serviceType,
        intxnCause: previousHistory.problemCause,
        intxnPriority: previousHistory.intxnPriority,
        intxnChannel: previousHistory.intxnChannel,
        contactPreference: previousHistory.contactPreference,
        fromEntityId: previousHistory.toEntityId,
        fromRoleId: previousHistory.toRoleId,
        fromUserId: previousHistory.toUserId,
        toEntityId: departmentId || previousHistory.toEntityId || systemDeptId,
        toRoleId: roleId || previousHistory.toRoleId || systemRoleId,
        toUserId: userId || previousHistory.toUserId || systemUserId,
        remarks: checkCancelReason.description,
        intxnFlow: interactionFlowAction.CANCEL,
        flwCreatedBy: userId || systemUserId,
        intxnTxnStatus: defaultStatus.CANCELLED,
        isFollowup: defaultCode.NO,
        intxnCreatedDate: new Date(),
        intxnCreatedBy: userId || systemUserId,
        ...commonAttrib
      }

      await conn.InteractionTxn.create(addHistory, { transaction: t })
      const workflwdetails = await conn.WorkflowHdr.findOne({
        where: {
          entityId: checkExistingInteraction.intxnUuid
        }
      })
      if (workflwdetails) {
        await conn.WorkflowTxn.update({ wfStatus: defaultStatus.DONE }, {
          where: {
            wfHdrId: workflwdetails.wfHdrId,
            wfStatus: {
              [Op.notIn]: [defaultStatus.DONE]
            }
          },
          transaction: t
        })

        await conn.WorkflowHdr.update({ wfStatus: defaultStatus.DONE }, {
          where: {
            entityId: checkExistingInteraction.intxnUuid, wfStatus: defaultStatus.CREATED
          },
          transaction: t
        })
      }

      /* Creating Notification request information */
      logger.debug('Creating Notification request information')

      let customerInfo
      if (checkExistingInteraction && (checkExistingInteraction?.customerId || checkExistingInteraction?.customerUuid)) {
        const customerWhere = {}
        if (checkExistingInteraction?.customerId) {
          customerWhere.customerId = Number(checkExistingInteraction?.customerId)
        } else if (checkExistingInteraction?.customerUuid) {
          customerWhere.customerUuid = checkExistingInteraction?.customerUuid
        }
        console.log('customerWhere----->', customerWhere)
        customerInfo = await conn.Customer.findOne({
          where: customerWhere
        })
      }

      if (checkExistingInteraction && checkExistingInteraction?.profileId) {
        customerInfo = await conn.Profile.findOne({
          where: {
            profileId: checkExistingInteraction.profileId
          }
        })
      }
      if (!customerInfo) {
        console.log(`No customer found for id ${checkExistingInteraction.customerId}`)
      }
      // console.log('customerInfo-------xxx-->', customerInfo?.customerNo)
      // console.log('checkExistingInteraction-->', checkExistingInteraction.intxnType)

      customerInfo = customerInfo?.dataValues ? customerInfo?.dataValues : customerInfo

      const source = await conn.BusinessEntity.findOne({
        attributes: ['description'],
        where: {
          code: checkExistingInteraction.intxnType
        }
      })

      /** Getting Customer contact information */
      let contactWhereClause = {}
      if ((checkExistingInteraction?.customerId || checkExistingInteraction?.customerUuid) && customerInfo) {
        contactWhereClause = {
          contactCategoryValue: customerInfo.customerNo,
          status: defaultStatus.ACTIVE,
          contactCategory: entityCategory.CUSTOMER
        }
      } else {
        contactWhereClause = {
          contactCategoryValue: customerInfo.profileNo,
          status: defaultStatus.ACTIVE,
          contactCategory: entityCategory.PROFILE
        }
      }
      // console.log('contactWhereClause-------->', contactWhereClause)
      let contactInfo = await conn.Contact.findOne({
        where: { ...contactWhereClause },
        order: [['contactId', 'DESC']]
      })

      contactInfo = contactInfo?.dataValues ? contactInfo?.dataValues : contactInfo
      let email, contactNo, contactNoPfx
      if (contactInfo) {
        email = contactInfo.emailId || null
        contactNo = contactInfo.mobileNo || null
        contactNoPfx = contactInfo.mobilePrefix || null
      }

      let businessUser
      if (previousHistory?.toUserId) {
        businessUser = await conn.User.findOne({ where: { userId: previousHistory?.toUserId } })
      }

      const notificationData = {
        consumerUser: {
          name: customerInfo.firstName,
          email,
          contactNo,
          contactNoPfx
        },
        businessUser: {
          name: businessUser?.firstName,
          email: businessUser?.email,
          contactNo: businessUser?.contactNo,
          contactNoPfx: businessUser?.extn
        },
        notifiationSource: source.description,
        referenceId: checkExistingInteraction.intxnNo,
        referenceSubId: checkExistingInteraction.intxnTxnNo,
        userId: userId || systemUserId,
        customerId: checkExistingInteraction.customerId || checkExistingInteraction.profileId,
        departmentId: checkExistingInteraction.departmentId || systemDeptId,
        roleId: checkExistingInteraction.roleId || systemRoleId,
        channel: checkExistingInteraction.channel,
        type: 'CANCEL-INTERACTION',
        contactPreference: checkExistingInteraction.contactPreference,
        mapCategory: 'TMC_INTERACTION',
        eventType: 'ET_CANCEL',
        tranCategory: checkExistingInteraction.intxnCategory,
        tranType: checkExistingInteraction.intxnType,
        serviceCategory: checkExistingInteraction?.serviceCategory,
        serviceType: checkExistingInteraction?.serviceType,
        replyMessage: `Hi ${customerInfo.firstName}, You have raised an interaction ${checkExistingInteraction.intxnNo} successfully. Please use this ID to track your interaction status.`,
        conn,
        ...commonAttrib
      }

      /** Sending Create Interaction Noification */
      logger.debug('Sending Create Interaction Noification')
      em.emit('SEND_INTERACTION_NOTIFICATION', notificationData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interaction has been cancelled successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getCounts(interactionData, userId, conn) {
    try {
      if (!interactionData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: 'Please include at least one filter for the count.'
        }
      }
      if (interactionData?.me && !userId) {
        return {
          status: statusCodeConstants.ACCESS_FORBIDDEN,
          message: defaultMessage.ACCESS_FORBIDDEN
        }
      }

      let whereClause = {}
      if (interactionData && interactionData?.customerId) {
        whereClause.customerId = interactionData.customerId
      }

      if (interactionData && interactionData?.customerUuid) {
        whereClause.customerUuid = interactionData.customerUuid
      }

      if (interactionData && interactionData?.profileId) {
        whereClause.profileId = interactionData.profileId
      }

      if (interactionData && interactionData?.currentStatus) {
        whereClause.intxnStatus = interactionData.currentStatus
      }

      if (interactionData && interactionData?.currentRole) {
        whereClause.currRole = interactionData.currentRole
      }

      if (interactionData && interactionData?.currentDepartment) {
        whereClause.currEntity = interactionData?.currentDepartment
      }

      if (interactionData && interactionData?.currentUserId) {
        whereClause.currUser = interactionData?.currentUserId
      }

      if (interactionData && interactionData?.createdDepartment) {
        whereClause.createdEntity = interactionData?.createdDepartment
      }

      if (interactionData && interactionData?.createdRole) {
        whereClause.createdRoleId = interactionData?.createdRole
      }

      if (interactionData && interactionData?.interactionType) {
        whereClause.intxnType = interactionData?.interactionType
      }

      if (interactionData && interactionData?.me && userId) {
        whereClause = {
          ...whereClause,
          [Op.or]: {
            createdBy: conn.sequelize.where(conn.sequelize.col('"Interaction".created_by'), '=', userId),
            currUser: conn.sequelize.where(conn.sequelize.col('"Interaction".curr_user'), '=', userId)
          }
        }
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          codeType: ['INTXN_CATEGORY', 'INTERACTION_STATUS', 'INTXN_FAMILY',
            'CONTACT_PREFERENCE', 'INTXN_STATUS_REASON', 'TICKET_CHANNEL', 'PRIORITY', 'INTXN_TYPE',
            'SERVICE_TYPE', 'INTXN_STATEMENT', 'INTXN_FLOW', 'SERVICE_CATEGORY', 'INTXN_CAUSE', 'CUSTOMER_CATEGORY', 'CUSTOMER_STATUS']
        }
      })

      const businessUnitInfo = await conn.BusinessUnit.findAll({
        attributes: ['unitId', 'unitName', 'unitDesc'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const roleinfo = await conn.Role.findAll({
        attributes: ['roleId', 'roleName', 'roleDesc'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const response = await conn.Interaction.findAndCountAll({
        where: {
          ...whereClause
        }
      })
      if (response.count === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Interaction Count is not found',
          data: { count: response?.count || 0 }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interaction count is fetched Successfully.',
        data: { count: response?.count || 0, rows: interactionResources.transformInteraction(response.rows, businessEntityInfo, businessUnitInfo, roleinfo) }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async searchInteractionByQuery(query, permissions, email, conn) {
    try {
      if (!query.q || query?.q === '') {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const checkOthersIntPermissions = true// this.hasOtherInteractionPermission(permissions)

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          codeType: ['INTXN_CATEGORY', 'INTERACTION_STATUS', 'INTXN_FAMILY',
            'CONTACT_PREFERENCE', 'INTXN_STATUS_REASON', 'TICKET_CHANNEL', 'PRIORITY', 'INTXN_TYPE',
            'SERVICE_TYPE', 'INTXN_STATEMENT', 'INTXN_FLOW', 'SERVICE_CATEGORY', 'INTXN_CAUSE', 'CUSTOMER_CATEGORY', 'CUSTOMER_STATUS']
        }
      })

      const businessUnitInfo = await conn.BusinessUnit.findAll({
        attributes: ['unitId', 'unitName', 'unitDesc'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const roleinfo = await conn.Role.findAll({
        attributes: ['roleId', 'roleName', 'roleDesc'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      let whereClause = {}
      const customerClauses = []
      const contactClauses = []
      const interactionClauses = []
      const sequelize = db.sequelize

      console.log({ checkOthersIntPermissions })
      if (checkOthersIntPermissions) {
        interactionClauses.push({
          customerId: sequelize.where(
            sequelize.cast(sequelize.col('Interaction.customer_id'), 'varchar'),
            { [Op.iLike]: `%${query.q}%` }
          )
        })

        interactionClauses.push({
          profileId: sequelize.where(
            sequelize.cast(sequelize.col('Interaction.profile_id'), 'varchar'),
            { [Op.iLike]: `%${query.q}%` }
          )
        })
      } else {
        const customerNo = (await conn.Contact.findOne({ where: { emailId: email } }))?.contactCategoryValue ?? ''
        const customer = await conn.Customer.findOne({ where: { customerNo: { [Op.iLike]: `%${customerNo.toString()}` } } })
        whereClause.customerId = {
          [Op.and]: [sequelize.where(sequelize.cast(sequelize.col('Interaction.customer_id'), 'varchar'), {
            [Op.iLike]: `%${customer?.customerId ?? ''.toString()}%`
          })]
        }
      }

      interactionClauses.push({
        intxnId: sequelize.where(
          sequelize.cast(sequelize.col('Interaction.intxn_id'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      interactionClauses.push({
        intxnNo: sequelize.where(
          sequelize.cast(sequelize.col('Interaction.intxn_no'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      interactionClauses.push({
        intxnType: sequelize.where(
          sequelize.cast(sequelize.col('Interaction.intxn_type'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      interactionClauses.push({
        intxnStatus: sequelize.where(
          sequelize.cast(sequelize.col('Interaction.intxn_status'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      whereClause = {
        ...whereClause,
        [Op.or]: interactionClauses
      }

      const interactionInfo = await conn.Interaction.findAll({
        include: [
          {
            model: conn.User,
            as: 'currUserDetails',
            required: false,
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.User,
            as: 'userId',
            required: false,
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.Customer,
            as: 'customerDetails',
            required: false,
            include: [
              {
                model: conn.Contact,
                as: 'customerContact',
                required: false,
                where: {
                  contactCategory: entityCategory.CUSTOMER
                }
              },
              {
                model: conn.Address,
                as: 'customerAddress',
                required: false,
                where: {
                  addressCategory: entityCategory.CUSTOMER
                }
              },
              {
                model: conn.BusinessEntity,
                as: 'customerCatDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'customerClassDesc',
                attributes: ['code', 'description']
              }
            ]
          },
          {
            model: conn.Profile,
            as: 'profileDetails',
            required: false,
            include: [
              {
                model: conn.Contact,
                as: 'customerContact',
                required: false,
                where: {
                  contactCategory: entityCategory.PROFILE
                }
              }
            ]
          }
        ],
        where: whereClause,
        logging: false
      })

      if (interactionInfo.length === 0) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Interaction Details is not found'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interaction Details fetched Successfully',
        data: interactionResources.transformInteraction(interactionInfo, businessEntityInfo, businessUnitInfo, roleinfo) || null
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  hasOtherInteractionPermission(permissions) {
    permissions = permissions ?? []
    let interactionPermissions
    for (let index = 0; index < permissions.length; index++) {
      if (permissions[index].Interaction) {
        interactionPermissions = permissions[index].Interaction
        break
      }
    }
    return interactionPermissions?.find(x => x.screenName === 'Interaction For Other Employees')?.accessType === 'allow'
  }

  async searchInteractions(interactionData, userId, email, permissions, conn) {
    try {
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE, searchParams } = interactionData

      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      const checkOthersIntPermissions = true // this.hasOtherInteractionPermission(permissions)

      const businessEntityInfo = await conn.BusinessEntity.findAll(
        // {
        //   where: {
        //     codeType: ['INTXN_CATEGORY', 'INTERACTION_STATUS', 'INTXN_FAMILY',
        //       'CONTACT_PREFERENCE', 'INTXN_STATUS_REASON', 'TICKET_CHANNEL', 'PRIORITY', 'INTXN_TYPE',
        //       'SERVICE_TYPE', 'INTXN_STATEMENT', 'INTXN_FLOW', 'SERVICE_CATEGORY', 'INTXN_CAUSE',
        //       'CUSTOMER_CATEGORY', 'CUSTOMER_STATUS', 'PRODUCT_FAMILY', 'GENDER', 'CUSTOMER_ID_TYPE']
        //   }
        // }
      )

      const businessUnitInfo = await conn.BusinessUnit.findAll({
        attributes: ['unitId', 'unitName', 'unitDesc'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const roleinfo = await conn.Role.findAll({
        attributes: ['roleId', 'roleName', 'roleDesc'],
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      let whereClause = {}

      const customerContactWhereClause = {}
      const profileContactWhereClause = {}
      let cusWhereClauses = {}

      // for (const [key, value] of Object.entries(searchParams)) {
      //   if (!parseInt(value) && (!value || value?.trim() == "")) {
      //     delete searchParams[key]
      //   }
      // }

      for (const [key, value] of Object.entries(searchParams)) {
        if (!parseInt(value) && (!value || value === '')) {
          delete searchParams[key]
        }
      }

      console.log({ checkOthersIntPermissions })
      if (checkOthersIntPermissions) {
        if (!searchParams.customerId && !searchParams.customerUuid) {
          if (searchParams && searchParams?.customerNo && searchParams?.customerNo !== '' && searchParams?.customerNo !== undefined) {
            const customer = await conn.Customer.findOne({ where: { customerNo: { [Op.iLike]: `%${searchParams.customerNo.toString()}` } } })
            if (customer) searchParams.customerUuid = customer.customerUuid
          }
        }

        if (searchParams.customerName) {
          const customerNameParts = searchParams.customerName.split(' ')
          customerNameParts.forEach(customerNamePart => {
            cusWhereClauses = {
              ...cusWhereClauses,
              [Op.or]: {
                firstName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".first_name')), 'LIKE', '%' + customerNamePart.toLowerCase() + '%'),
                lastName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('"Customer".last_name')), 'LIKE', '%' + customerNamePart.toLowerCase() + '%')
              }
            }
          })
          const customers = await conn.Customer.findAll({ where: cusWhereClauses })
          if (customers) {
            whereClause.customerId = {
              [Op.in]: customers.map(x => x.customerId)
            }
          }
        }

        if (searchParams && searchParams.customerId && searchParams.customerId !== '' && searchParams.customerId !== undefined) {
          whereClause.customerId = {
            [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Interaction.customer_id'), 'varchar'), {
              [Op.iLike]: `%${searchParams.customerId.toString()}%`
            })]
          }
        }

        if (searchParams && searchParams.profileId && searchParams.profileId !== '' && searchParams.profileId !== undefined) {
          whereClause.profileId = {
            [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Interaction.profile_id'), 'varchar'), {
              [Op.iLike]: `%${searchParams.profileId.toString()}%`
            })]
          }
        }

        if (searchParams && searchParams.customerUuid && searchParams.customerUuid !== '' && searchParams.customerUuid !== undefined) {
          whereClause.customerUuid = {
            [Op.iLike]: `%${searchParams.customerUuid.toString()}%`
          }
        }

        if (searchParams && searchParams.contactNumber && searchParams.contactNumber !== '' && searchParams.contactNumber !== undefined) {
          customerContactWhereClause.mobileNo = {
            [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('customerDetails->customerContact.contact_no'), 'varchar'), {
              [Op.iLike]: `%${searchParams.contactNumber.toString()}%`
            })]
          }
          profileContactWhereClause.mobileNo = {
            [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('profileDetails->customerContact.contact_no'), 'varchar'), {
              [Op.iLike]: `%${searchParams.contactNumber.toString()}%`
            })]
          }
        }
      } else {
        console.log("User doesn't have perission for others")
        const customerNo = (await conn.Contact.findOne({ where: { emailId: email } }))?.contactCategoryValue ?? ''
        const customer = await conn.Customer.findOne({ where: { customerNo: { [Op.iLike]: `%${customerNo.toString()}` } } })
        whereClause.customerUuid = {
          [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Interaction.customer_uuid'), 'varchar'), {
            [Op.iLike]: `%${customer?.customerUuid ?? ''.toString()}%`
          })]
        }
      }

      if (searchParams && searchParams?.interactionId && searchParams?.interactionId !== '' && searchParams?.interactionId !== undefined) {
        whereClause.intxnId = {
          [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Interaction.intxn_id'), 'varchar'), {
            [Op.iLike]: `%${searchParams.interactionId.toString()}%`
          })]
        }
      }

      if (searchParams && searchParams?.interactionNumber && searchParams?.interactionNumber !== '' && searchParams?.interactionNumber !== undefined) {
        whereClause.intxnNo = {
          [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Interaction.intxn_no'), 'varchar'), {
            [Op.iLike]: `%${searchParams.interactionNumber.toString()}%`
          })]
        }
      }

      if (searchParams && searchParams?.interactionType && searchParams?.interactionType !== '' && searchParams?.interactionType !== undefined) {
        whereClause.intxnType = {
          [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Interaction.intxn_type')), 'LIKE', `%${searchParams.interactionType}%`)]
        }
      }

      if (searchParams && searchParams.status && searchParams.status !== '' && searchParams.status !== undefined) {
        whereClause.intxnStatus = {
          [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Interaction.intxn_status')),
            'LIKE', `%${searchParams.status.toString()}%`)]
        }
      }

      if (searchParams && searchParams.currentUserId && searchParams.currentUserId !== '' && searchParams.currentUserId !== undefined) {
        whereClause.currentUser = {
          [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Interaction.curr_user'), 'varchar'), {
            [Op.iLike]: `%${searchParams.currentUserId.toString()}%`
          })]
        }
      }

      // if (searchParams && searchParams.emailId && searchParams.emailId !== '' && searchParams.emailId !== undefined) {
      //   contactWhereClause.emailId = {
      //     [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('customerContact.emailId')),
      //       'LIKE', `%${searchParams.emailId.toString()}%`)]
      //   }
      // }

      // if (searchParams && searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
      //   whereClause = whereClause + 'CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' and '
      // }

      // if (searchParams && searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
      //   whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' and '
      // }

      if (searchParams && searchParams.currentRoleId && searchParams.currentRoleId !== '' && searchParams.currentRoleId !== undefined) {
        whereClause.currRole = {
          [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Interaction.curr_role'), 'varchar'), {
            [Op.iLike]: `%${searchParams.currentRoleId.toString()}%`
          })]
        }
      }

      // if (searchParams && searchParams.selfDept === 'self') {
      //   whereClause.currEntity = {
      //     [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Interaction.curr_entity'), 'varchar'), {
      //       [Op.iLike]: `%${searchParams.currentDeptId.toString()}%`
      //     })]
      //   }

      //   // whereClause. = whereClause + ' i. = ' +  + ' and ' +
      //     // ' cast(i.curr_entity as varchar) like \'%' + searchParams.currentDeptId.toString() + '%\' and '
      //   // whereClause = whereClause + ' i.curr_user = ' + searchParams.currentUserId + ' and ' +
      //   //   ' cast(i.curr_entity as varchar) like \'%' + searchParams.currentDeptId.toString() + '%\' and '
      // }

      if (searchParams && searchParams.selfDept === 'dept') {
        whereClause = whereClause + ' cast(i.curr_entity as varchar) like \'%' + searchParams.currentDeptId.toString() + '%\' and '
      }

      console.log('wherecluase--------', whereClause)

      const interactionInfo = await conn.Interaction.findAndCountAll({
        include: [
          {
            model: conn.User,
            as: 'currUserDetails',
            required: false,
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.User,
            as: 'userId',
            required: false,
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.Customer,
            as: 'customerDetails',
            attributes: {
              exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
            },
            required: false,
            include: [
              {
                model: conn.Contact,
                as: 'customerContact',
                attributes: {
                  exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
                },
                required: false,
                where: {
                  contactCategory: entityCategory.CUSTOMER,
                  ...customerContactWhereClause
                }
              },
              {
                model: conn.Address,
                as: 'customerAddress',
                attributes: {
                  exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
                },
                required: false,
                where: {
                  addressCategory: entityCategory.CUSTOMER,
                  isPrimary: true
                }
              }
            ]
          },
          {
            model: conn.Profile,
            as: 'profileDetails',
            attributes: {
              exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
            },
            required: false,
            include: [
              {
                model: conn.Contact,
                as: 'customerContact',
                attributes: {
                  exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
                },
                required: false,
                where: {
                  contactCategory: entityCategory.PROFILE,
                  ...profileContactWhereClause
                }

              }
            ]
          },
          {
            model: conn.KnowledgeBase,
            as: 'statementDetails',
            attributes: ['metaAttributes']
          },
          {
            model: conn.Contact,
            as: 'intxnContact',
            attributes: {
              exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
            },
            required: false,
            where: {
              contactCategory: entityCategory.INTERACTION
            }
          }
        ],
        where: {
          ...whereClause
        },
        distinct: true,
        order: [['intxnId', 'DESC']],
        ...params
      })
      // const uniqueRecords = [...new Map(interactionInfo.rows.map(item => [item.intxnNo, item])).values()]
      const data = {
        count: interactionInfo.count || 0,
        rows: interactionResources.transformInteraction(interactionInfo.rows, businessEntityInfo, businessUnitInfo, roleinfo) || null
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interaction data fetch succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async recentInteractionsByCustomers(interactionData, queryParams, userId, conn) {
    try {
      const { limit = defaultCode.lIMIT, page = defaultCode.PAGE } = queryParams
      const { customerId } = interactionData
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }
      console.log('params--->', params)
      const interactionInfo = await conn.Interaction.findAndCountAll({
        include: [
          {
            model: conn.InteractionTxn,
            as: 'txnDetails',
            required: false,
            attributes: ['intxnTxnId'],
            where: {
              isFollowup: 'N'
            }
          },
          {
            model: conn.User,
            as: 'currUserDetails',
            required: false,
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.BusinessEntity,
            as: 'serviceTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'currStatusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.User,
            as: 'userId',
            required: false,
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.Customer,
            as: 'customerDetails',
            attributes: {
              exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
            },
            required: false,
            include: [
              {
                model: conn.Contact,
                as: 'customerContact',
                attributes: {
                  exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
                }
              },
              {
                model: conn.Address,
                as: 'customerAddress',
                attributes: {
                  exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
                },
                required: false
              }
            ]
          },
          {
            model: conn.Profile,
            as: 'profileDetails',
            attributes: {
              exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
            },
            required: false,
            include: [
              {
                model: conn.Contact,
                as: 'customerContact',
                attributes: {
                  exclude: ['tranId', 'createdDeptId', 'createdRoleId', 'createdAt', 'createdBy', 'updatedBy', 'updatedAt']
                },
                required: false
              }
            ]
          }
        ],
        where: {
          customerId,
          intxnChannel: 'SELFCARE'
        },
        distinct: true,
        order: [['intxnId', 'DESC']],
        ...params,
        logging: true
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: interactionInfo?.length > 0 ? 'Recent Interaction data fetch succesfully' : 'No Records Found',
        data: interactionInfo
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async frequentKnowledgeBase(searchParam, conn) {
    try {
      let whereClause = {
        requestId: {
          [Op.ne]: null
        },
        requestStatement: {
          [Op.ne]: null
        }
      }

      if (searchParam && searchParam?.customerUuid) {
        whereClause = {
          ...whereClause,
          customerUuid: searchParam?.customerUuid
        }
      }

      if (searchParam && searchParam?.profileUuid) {
        whereClause = {
          ...whereClause,
          profileUuid: searchParam?.profileUuid
        }
      }

      if (searchParam && searchParam?.st) {
        whereClause = {
          ...whereClause,
          serviceType: searchParam?.st
        }
      }

      if (searchParam && searchParam?.serviceCategory) {
        whereClause.serviceCategory = searchParam?.serviceCategory
      }

      if (searchParam && searchParam?.today) {
        whereClause = {
          ...whereClause,
          createdAt: conn.sequelize.where(conn.sequelize.fn('date', conn.sequelize.col('created_at')), '=', searchParam?.today)
        }
      }

      const response = await conn.Interaction.findAll({
        attributes: ['requestId', 'requestStatement', [conn.sequelize.fn('count', conn.sequelize.col('request_id')), 'requestCount']],
        where: { ...whereClause },
        group: ['requestId', 'requestStatement'],
        order: [['requestCount', 'DESC']],
        limit: searchParam.limit || defaultCode.lIMIT,
        logging: true
      })

      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Knowlodge base details found',
          data: response
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Knowlodge base details fetch succesfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async frequentTopCatagory(searchParam, conn) {
    try {
      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          codeType: 'INTXN_CATEGORY'
        }
      })
      const response = await conn.Interaction.findAll({
        attributes: ['intxnCategory', [conn.sequelize.fn('count', conn.sequelize.col('intxn_category')), 'intxnCategoryCount']],
        where: {
          intxnCategory: {
            [Op.ne]: null
          }
          // serviceType: searchParam?.st
        },
        group: ['intxnCategory'],
        order: [['intxnCategoryCount', 'DESC']],
        limit: searchParam.limit || defaultCode.lIMIT
      })

      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No catalog details found',
          data: response
        }
      }

      const data = interactionResources.transformTopCatagory(response, businessEntityInfo) || null

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Catalog details fetched Successfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getCustomerInteractionHistoryCount(interactionData, conn) {
    try {
      if (!interactionData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      /** to get Last Ninty Days  */
      //   const nintyDay = new Date(new Date().setDate(new Date().getDate() - 90)).toISOString()
      let data = {
        totalInteractionCount: 0,
        openInteraction: 0,
        closedInteraction: 0,
        manualResolved: 0,
        BotResolved: 0
      }

      const interactionDetails = await conn.Interaction.findAndCountAll({
        where: {
          customerUuid: interactionData?.customerUid
          // ,createdAt: {
          //   [Op.gte]: nintyDay
          // }
        }
      })

      if (interactionDetails?.rows.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Customer Iteraction statement history is not found'
        }
      }

      // get OpenInteraction count
      const openInteraction = interactionDetails?.rows.filter((e) => {
        let isTrue = false
        if (e.intxnStatus !== defaultStatus.CLOSED && e.intxnStatus !== defaultStatus.CANCELLED) {
          isTrue = true
        }
        return isTrue
      })

      const closedInteraction = interactionDetails?.rows.filter((e) => {
        let isTrue = false
        if (e.intxnStatus === defaultStatus.CLOSED || e.intxnStatus === defaultStatus.CANCELLED) {
          isTrue = true
        }
        return isTrue
      })

      const isBotResolved = closedInteraction.filter((e) => {
        let isTrue = false
        if (e.isResolvedBy === defaultCode.RESOLVED_BY_BOT) {
          isTrue = true
        }
        return isTrue
      })

      const isManualResolved = closedInteraction.filter((e) => {
        let isTrue = false
        if (e.isResolvedBy === defaultCode.RESOLVED_BY_MANUAL) {
          isTrue = true
        }
        return isTrue
      })

      data = {
        totalInteractionCount: interactionDetails?.count || 0,
        openInteraction: openInteraction?.length || 0,
        closedInteraction: closedInteraction?.length || 0,
        manualResolved: isManualResolved?.length || 0,
        BotResolved: isBotResolved?.length || 0
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Customer Iteraction statement history fetched Successfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getCustomerInteractionHistory(interactionData, conn) {
    try {
      if (!interactionData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { limit, page } = interactionData

      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      const whereClause = { customerUuid: interactionData?.customerUid }
      if (interactionData && interactionData?.status && interactionData?.status === 'OPEN') {
        whereClause.intxnStatus = {
          [Op.notIn]: [defaultStatus.CLOSED, defaultStatus.CANCELLED]
        }
      } else if (interactionData && interactionData?.status && interactionData?.status === 'CLOSED') {
        whereClause.intxnStatus = {
          [Op.in]: [defaultStatus.CLOSED, defaultStatus.CANCELLED]
        }
      }

      const interactionDetails = await conn.Interaction.findAndCountAll({
        attributes: ['intxnId', 'intxnNo', 'createdAt'],
        include: [{
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'currStatusDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'categoryDescription'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'serviceTypeDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'srType'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'intxnCategoryDesc'
        }],
        where: { ...whereClause },
        ...params
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Cutomer History details fetched Successfully',
        data: interactionDetails
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async workFlowTest(interactionData) {
    try {
      em.emit('INTERACTION_WORFKFLOW_ENGINE', { intxnId: interactionData?.intxnUuid })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Catalog details fetched Successfully'
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getInteractionFlow(interactionData, conn) {
    try {
      if (!interactionData || !interactionData?.intxnNo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const getInteractionDetails = await conn.Interaction.findOne({
        include: [
          {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'currStatusDesc'
          }
        ],
        where: {
          intxnNo: interactionData?.intxnNo
        }
      })

      if (!getInteractionDetails) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `We are unable to find the interaction Details for ${interactionData?.intxnNo}`
        }
      }

      const details = {
        intxnNo: getInteractionDetails?.intxnNo,
        currStatus: getInteractionDetails?.currStatusDesc?.description,
        interactionCreatedDate: getInteractionDetails?.createdAt
      }

      const getInteractionHistory = await conn.InteractionTxn.findAll({
        include: [
          {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'flowActionDesc'
          }, {
            model: conn.BusinessUnit,
            attributes: ['unitName', 'unitDesc'],
            as: 'fromEntityName'
          }, {
            model: conn.BusinessUnit,
            attributes: ['unitName', 'unitDesc'],
            as: 'toEntityName'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'statusDescription'
          }, {
            model: conn.User,
            attributes: ['firstName', 'lastName'],
            as: 'flwCreatedby'
          }
        ],
        where: {
          intxnId: getInteractionDetails?.intxnId
        },
        order: [['intxnTxnId', 'ASC']]
      })

      const flow = []
      let count = 0
      let lastfromEntity = ''
      getInteractionHistory.forEach(element => {
        flow.push({
          flowSeq: count,
          interactionflow: element?.flowActionDesc?.description,
          from: element?.fromEntityName?.unitDesc,
          to: element?.toEntityName?.unitDesc,
          status: element?.statusDescription?.description,
          actionBy: (element?.flwCreatedby?.firstName || '') + ' ' + (element?.flwCreatedby?.lastName || ''),
          flowDate: element?.createdAt,
          lineStyle: {
            color: 'rgba(33, 181, 65)'
          },
          isActionDone: true
        })
        count = count + 1
        lastfromEntity = element?.fromEntityDesc?.unitDesc
      })

      const getFutureFlow = await getWFState(getInteractionDetails?.intxnUuid, entityCategory.INTERACTION, conn)

      let possibleStatus = []
      const graph = []

      if (getFutureFlow && Array.isArray(getFutureFlow?.data?.entities) && getFutureFlow?.data?.entities?.length > 0) {
        getFutureFlow?.data?.entities.forEach(element => {
          const statusfromResponse = element.status.map((s) => { return { status: s.code, dept: element.entity } })
          possibleStatus = possibleStatus.concat(statusfromResponse)
        })

        // Excepected Flow Date caluated based on +1 day of current date
        const flowDate = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()

        const final = []
        for (const pt of possibleStatus) {
          if (final.length > 0) {
            let notIncluded = true
            final.forEach((element, index) => {
              if (pt.status === element.status) {
                notIncluded = false
                const concatArray = element.subSeq.concat(pt.dept)
                const arrUniq = [...new Map(concatArray.map(v => [v.unitId, v])).values()]
                final[index].subSeq = [...arrUniq]
              }
            })

            if (notIncluded) {
              final.push({
                flowSeq: count,
                interactionflow: '',
                from: lastfromEntity,
                to: '',
                subSeq: pt.dept,
                status: pt.status,
                actionBy: '',
                flowDate,
                // lineStyle: {
                //   color: 'rgba(182, 242, 218)'
                // },
                isActionDone: false
              })
            }
          } else {
            final.push({
              flowSeq: count,
              interactionflow: '',
              from: lastfromEntity,
              to: '',
              subSeq: pt.dept,
              status: pt.status,
              actionBy: '',
              flowDate,
              // lineStyle: {
              //   color: 'rgba(182, 242, 218)'
              // },
              isActionDone: false
            })
          }
        }

        for (const f of final) {
          for (const s of f.subSeq) {
            graph.push({
              flowSeq: count,
              interactionflow: '',
              from: lastfromEntity,
              to: s.unitDesc,
              status: f.status,
              actionBy: '',
              flowDate,
              // lineStyle: {
              //   color: 'rgba(182, 242, 218)'
              // },
              isActionDone: false
            })
          }
        }
      }

      let flowGraph = graph || []
      for (let x = flow.length - 1; x >= 0; x--) {
        const temp1 = flow[x]
        temp1.children = flowGraph
        flowGraph = []
        flowGraph.push(temp1)
      }

      const response = {
        details,
        flow: flowGraph
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interaction flow fetched successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async getCustomerInteraction(payload, userId, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const limit = defaultCode.INTERACTION_LIMIT

      const checkExistingCustomer = await conn.Customer.findOne({
        where: {
          customerUuid: payload.customerUuid
        }
      })

      if (!checkExistingCustomer) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'unable to find the customer details'
        }
      }

      const getInteractionList = await conn.Interaction.findAll({
        attributes: ['intxnId', 'intxnType', 'intxnNo', 'requestStatement', 'createdAt', 'createdBy'],
        include: [{
          model: conn.BusinessEntity,
          as: 'srType',
          attributes: ['code', 'description']
        }, {
          model: conn.BusinessEntity,
          as: 'currStatusDesc',
          attributes: ['code', 'description']
        }, {
          model: conn.User,
          as: 'userId',
          attributes: ['fullName']
        }],
        where: {
          customerId: checkExistingCustomer.customerId
        },
        order: [['createdAt', 'DESC']]
        // limit
      })

      const getOrderList = await conn.Orders.findAll({
        attributes: ['orderId', 'orderType', 'orderNo', 'createdAt', 'createdBy'],
        include: [{
          model: conn.BusinessEntity,
          as: 'orderTypeDesc',
          attributes: ['code', 'description']
        }, {
          model: conn.BusinessEntity,
          as: 'orderStatusDesc',
          attributes: ['code', 'description']
        }, {
          model: conn.User,
          as: 'userId',
          attributes: ['fullName']
        }],
        where: {
          customerId: checkExistingCustomer.customerId,
          intxnId: {
            [Op.eq]: null
          },
          parentFlag: 'Y'
        },
        order: [['createdAt', 'DESC']],
        limit
      })

      const customreInteraction = getInteractionList.concat(getOrderList)

      // console.log('customreInteraction ', customreInteraction)
      customreInteraction.sort((a, b) => {
        return (new Date(a.createdAt) - new Date(b.createdAt))
      })

      const finalCustomerInteraction = []
      const separator = '--SPTR--'
      if (Array.isArray(customreInteraction) && customreInteraction.length > 0) {
        for (let c of customreInteraction) {
          c = c?.dataValues ? c?.dataValues : c

          // console.log('c ------------------- , ', c)
          const getCustomerEmoji = customerInteractionEmoji.filter(e => e.code === (c.intxnType || c.orderType))
          const p = {
            id: uuidv4(),
            date: c.createdAt,
            monthYear: moment(new Date(c.createdAt)).format('MMM-YYYY'),
            emotion: getCustomerEmoji && getCustomerEmoji.length > 0 ? emoji.get(getCustomerEmoji[0].emoji) : null,
            event: c.orderNo ? 'Order Created' : 'Interaction Created',
            statement: c.requestStatement || `ID# - ${c.intxnNo || c.orderNo}`,
            percentage: getCustomerEmoji && getCustomerEmoji.length > 0 ? getCustomerEmoji[0].percentage : 0,
            separator,
            type: c.intxnType || c.orderType,
            intxnNo: c.intxnNo || c.orderNo,
            emojiList: customerInteractionEmoji,
            details: { id: c.intxnNo || c.orderNo, entityType: c.orderNo ? 'Order' : 'Interaction', type: c.srType?.description || c.orderTypeDesc?.description, status: c?.currStatusDesc?.description || c?.orderStatusDesc?.description, createdAt: c.createdAt, createdBy: c?.userId?.fullName || c.userId?.fullName }
          }
          finalCustomerInteraction.push(p)
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Customer Interaction fetched successfully',
        data: finalCustomerInteraction
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  // Operation Dashboard

  async assignedInteractions(interactionData, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      // console.log(params, searchParams)

      const i_role_id = searchParams?.roleId || null // integer
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_all_role = searchParams?.isAllRole || null // character varying

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_cat = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_intxn_type = searchParams?.intxnType ? `'${searchParams?.intxnType}'` : null // character varying
      // const i_intxn_cat = searchParams?.intxnCat ? `'${searchParams?.intxnCat}'` : null // character varying
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from bcae_intxn_others_assigned_fn(${i_role_id},${i_entity_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_all_role},${i_intxn_type},${i_intxn_cat},${i_service_type},${i_service_cat},${i_limit},${i_offset})`

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async pooledInteractions(interactionData, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      // console.log(params, searchParams)

      const i_role_id = searchParams?.roleId || null // integer
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_all_role = searchParams?.isAllRole || null // character varying

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_cat = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_intxn_type = searchParams?.intxnType ? `'${searchParams?.intxnType}'` : null // character varying
      // const i_intxn_cat = searchParams?.intxnCat ? `'${searchParams?.intxnCat}'` : null // character varying
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from bcae_intxn_pooled_assigned_fn(${i_role_id},${i_entity_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_all_role},${i_intxn_type},${i_intxn_cat},${i_service_type},${i_service_cat},${i_limit},${i_offset})`

      console.log({ interactionSql })

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async assignedOrders(ordersData, conn) {
    try {
      const { searchParams } = ordersData
      let params = {}
      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }
      const i_role_id = searchParams?.roleId || null // integer
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null// character varying
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_all_role = searchParams?.isAllRole || null // character varying

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_type = searchParams?.orderType?.length ? `array[${searchParams?.orderType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.orderCat?.length ? `array[${searchParams?.orderCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying
      // const i_type = searchParams?.orderType ? `'${searchParams?.orderType}'` : null // character varying
      // const i_category = searchParams?.orderCat ? `'${searchParams?.orderCat}'` : null // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const orderSql = `select * from bcae_order_others_assigned_fn(${i_role_id}, ${i_entity_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_all_role},${i_type},${i_category},${i_service_type},${i_service_cat},${i_limit},${i_offset})`

      let ordersResponseData = await conn.sequelize.query(orderSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      ordersResponseData = camelCaseConversion(ordersResponseData)

      const data = {
        count: ordersResponseData.length ? ordersResponseData[0]?.oRecordCnt : 0,
        rows: ordersResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Orders fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async pooledOrders(ordersData, conn) {
    try {
      const { searchParams } = ordersData
      let params = {}
      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }
      const i_role_id = searchParams?.roleId || null // integer
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null// character varying
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_all_role = searchParams?.isAllRole || null // character varying

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_type = searchParams?.orderType?.length ? `array[${searchParams?.orderType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.orderCat?.length ? `array[${searchParams?.orderCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying
      // const i_type = searchParams?.orderType ? `'${searchParams?.orderType}'` : null // character varying
      // const i_category = searchParams?.orderCat ? `'${searchParams?.orderCat}'` : null // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const orderSql = `select * from bcae_order_pooled_assigned_fn(${i_role_id}, ${i_entity_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_all_role},${i_type},${i_category},${i_service_type},${i_service_cat},${i_limit},${i_offset})`

      let ordersResponseData = await conn.sequelize.query(orderSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      ordersResponseData = camelCaseConversion(ordersResponseData)

      const data = {
        count: ordersResponseData.length ? ordersResponseData[0]?.oRecordCnt : 0,
        rows: ordersResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Orders fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async assignedToMeTicketes(payloadData, conn) {
    try {
      const { searchParams } = payloadData
      let params = {}
      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }
      const i_role_id = searchParams?.roleId || null // integer
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_entity_type = searchParams?.entityType ? `'${searchParams?.entityType}'` : null

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_cat = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_order_type = searchParams?.orderType?.length ? `array[${searchParams?.orderType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_order_cat = searchParams?.orderCat?.length ? `array[${searchParams?.orderCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying
      // const i_intxn_type = searchParams?.intxnType ? `'${searchParams?.intxnType}'` : null // character varying
      // const i_intxn_cat = searchParams?.intxnCat ? `'${searchParams?.intxnCat}'` : null // character varying
      // const i_order_type = searchParams?.orderType ? `'${searchParams?.orderType}'` : null // character varying
      // const i_order_cat = searchParams?.orderCat ? `'${searchParams?.orderCat}'` : null // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      // eslint-disable-next-line camelcase
      const assignToMeSql = `select * from bcae_all_entity_self_assigned_fn(${i_role_id},${i_entity_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_entity_type},${i_service_type},${i_service_cat},${i_intxn_cat},${i_intxn_type},${i_order_cat},${i_order_type},${i_limit},${i_offset})`

      let assignedToMeResponseData = await conn.sequelize.query(assignToMeSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      assignedToMeResponseData = camelCaseConversion(assignedToMeResponseData)

      const data = {
        count: assignedToMeResponseData.length ? assignedToMeResponseData[0]?.oRecordCnt : 0,
        rows: assignedToMeResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Tickets fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async assignedAppoinments(appoinmentData, conn) {
    try {
      const { searchParams } = appoinmentData
      let params = {}
      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null// date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const appoinmentSql = `select * from bcae_appoint_user_assigned_fn(${i_user_id},${i_from_date},${i_to_date},${i_status},${i_service_type},${i_service_cat},${i_limit},${i_offset})`
      console.log('appoinmentSql-------->', appoinmentSql)
      let appoinmentsResponseData = await conn.sequelize.query(appoinmentSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      appoinmentsResponseData = camelCaseConversion(appoinmentsResponseData)

      const data = {
        count: appoinmentsResponseData.length ? appoinmentsResponseData[0]?.oRecordCnt : 0,
        rows: appoinmentsResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Appointments fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async myTeamAssignedInteractions(interactionData, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}
      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }
      const i_role_id = searchParams?.roleId || null // integer
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_cat = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_team_member_id = searchParams?.teamMemberId?.length ? `array[${searchParams?.teamMemberId.map(x => `${x.value}`).join(',')}]::int[]` : 'array[]::int[]' // integer

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_intxn_type = searchParams?.intxnType ? `'${searchParams?.intxnType}'` : null // character varying
      // const i_intxn_cat = searchParams?.intxnCat ? `'${searchParams?.intxnCat}'` : null // character varying
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying
      // const i_team_member_id = searchParams?.teamMemberId ? `${searchParams?.teamMemberId}` : null // integer

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from bcae_intxn_team_assigned_fn(${i_role_id}, ${i_entity_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_cat},${i_service_type},${i_service_cat},${i_team_member_id},${i_limit},${i_offset})`

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0]?.oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async myTeamAssignedOrders(ordersData, conn) {
    try {
      const { searchParams } = ordersData
      let params = {}
      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }
      const i_role_id = searchParams?.roleId || null // integer
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_type = searchParams?.type?.length ? `array[${searchParams?.type.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.category?.length ? `array[${searchParams?.category.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_team_member_id = searchParams?.teamMemberId?.length ? `array[${searchParams?.teamMemberId.map(x => `${x.value}`).join(',')}]::int[]` : 'array[]::int[]' // integer

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_type = searchParams?.type ? `'${searchParams?.type}'` : null // character varying
      // const i_category = searchParams?.category ? `'${searchParams?.category}'` : null // character varying
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying
      // const i_team_member_id = searchParams?.teamMemberId ? `${searchParams?.teamMemberId}` : null // integer

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const orderSql = `select * from bcae_order_team_assigned_fn(${i_role_id},${i_entity_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_type},${i_category},${i_service_type},${i_service_cat},${i_team_member_id},${i_limit},${i_offset})`

      let ordersResponseData = await conn.sequelize.query(orderSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      ordersResponseData = camelCaseConversion(ordersResponseData)

      const data = {
        count: ordersResponseData.length ? ordersResponseData[0]?.oRecordCnt : 0,
        rows: ordersResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Assigned Orders fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async myTeamAssignedAppoinments(appoinmentData, conn) {
    try {
      const { searchParams } = appoinmentData
      let params = {}
      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_team_member_id = searchParams?.teamMemberId?.length ? `array[${searchParams?.teamMemberId.map(x => `${x.value}`).join(',')}]::int[]` : 'array[]::int[]' // integer
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_team_member_id = searchParams?.teamMemberId ? `${searchParams?.teamMemberId}` : null // integer
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const appoinmentSql = `select * from bcae_appoint_team_assigned_fn(${i_user_id},${i_from_date},${i_to_date},${i_status},${i_team_member_id},${i_service_type},${i_service_cat},${i_limit},${i_offset})`

      let appoinmentsResponseData = await conn.sequelize.query(appoinmentSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      appoinmentsResponseData = camelCaseConversion(appoinmentsResponseData)

      const data = {
        count: appoinmentsResponseData.length ? appoinmentsResponseData[0]?.oRecordCnt : 0,
        rows: appoinmentsResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Assigned appointments fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getUserInfomativeDetails(userDetails, conn) {
    try {
      const { searchParams } = userDetails
      const i_entity_name = searchParams?.entityName ? `'${searchParams?.entityName}'` : null
      const i_user_id = searchParams?.userId || null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null

      const detailsSql = `select * from bcae_ops_infor_self_all_entity_fn(${i_entity_name},${i_user_id},${i_from_date},${i_to_date})`

      let responseData = await conn.sequelize.query(detailsSql, {
        type: QueryTypes.SELECT,
        logging: true
      })
      responseData = camelCaseConversion(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getTeamInfomativeDetails(teamDetails, conn) {
    try {
      const { searchParams } = teamDetails
      const i_entity_name = searchParams?.entityName ? `'${searchParams?.entityName}'` : null
      const i_user_id = searchParams?.userId || null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null

      const detailsSql = `select * from bcae_ops_infor_team_all_entity_fn(${i_entity_name},${i_user_id},${i_from_date},${i_to_date})`

      let responseData = await conn.sequelize.query(detailsSql, {
        type: QueryTypes.SELECT,
        logging: true
      })
      responseData = camelCaseConversion(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async handlingTime(userDetails, conn) {
    try {
      const { searchParams } = userDetails

      const iUserId = searchParams?.userId ? searchParams?.userId : null
      // const iRoleId = searchParams?.roleId ? searchParams?.roleId : null
      const iFromDate = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null

      const handlingSql = `select * from bcae_ops_infor_self_handling_fn(${iUserId},${iFromDate},${i_to_date})`

      let responseData = await conn.sequelize.query(handlingSql, {
        type: QueryTypes.SELECT,
        logging: true
      })
      responseData = camelCaseConversion(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async handlingTimeTeam(teamDetails, conn) {
    try {
      const { searchParams } = teamDetails

      const iUserId = searchParams?.userId ? searchParams?.userId : null
      const iFromDate = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null

      const handlingSql = `select * from bcae_ops_infor_team_handling_fn(${iUserId},${iFromDate},${i_to_date})`

      let responseData = await conn.sequelize.query(handlingSql, {
        type: QueryTypes.SELECT,
        logging: true
      })
      responseData = camelCaseConversion(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getMyInteractionHistoryGraph(userDetails, conn) {
    try {
      const { searchParams } = userDetails

      const whereClause = {}

      if (searchParams && searchParams?.userId) {
        whereClause.fromUserId = searchParams?.userId
      }

      if (searchParams && searchParams?.roleId) {
        whereClause.fromRoleId = searchParams?.roleId
      }

      if (searchParams && searchParams?.EntityId) {
        whereClause.fromEntityId = searchParams?.EntityId
      }

      if (searchParams && searchParams?.serviceType) {
        const serviceTypes = []
        if (Array.isArray(searchParams?.serviceType)) {
          for (const st of searchParams?.serviceType) {
            serviceTypes.push(st.value)
          }
        } else {
          serviceTypes.push(searchParams?.serviceType)
        }
        whereClause.serviceType = serviceTypes
      }

      if (searchParams && searchParams?.serviceCategory) {
        const serviceCategories = []
        if (Array.isArray(searchParams?.serviceCategory)) {
          for (const st of searchParams?.serviceCategory) {
            serviceCategories.push(st.value)
          }
        } else {
          serviceCategories.push(searchParams?.serviceCategory)
        }
        whereClause.serviceCategory = serviceCategories
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

      // interactionFlowAction.CREATED
      const getInteractionTxn = await conn.InteractionTxn.findAll({
        attributes: ['intxnId'],
        // logging: console.log,
        distinct: true,
        where: {
          intxnFlow: {
            [Op.notIn]: [interactionFlowAction.ASSIGN, interactionFlowAction.FOLLOWUP, interactionFlowAction.CREATED]
          },
          ...whereClause
        }
      })

      if (getInteractionTxn.length > 0) {
        const getInteractionTxns = getInteractionTxn.map(e => e.intxnId)
        const response = await conn.Interaction.findAndCountAll({
          attributes: ['intxnId', 'createdAt', 'intxnNo', 'requestStatement'],
          include: [{
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'currStatusDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'categoryDescription'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceTypeDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'srType'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'channleDescription'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'intxnCategoryDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'priorityDescription'
          }
            // {
            //   model: conn.InteractionTxn,
            //   as: 'txnDetails',
            //   where: {
            //     intxnFlow: {
            //       [Op.notIn]: [interactionFlowAction.ASSIGN, interactionFlowAction.FOLLOWUP]
            //     },
            //     intxnTxnStatus: {
            //       [Op.notIn]: [defaultStatus.NEW]
            //     },
            //     ...whereClause
            //   },
            //   distinct: true
            // }
          ],
          // logging: console.log,
          where: {
            intxnId: getInteractionTxns
          },
          distinct: true
        })
        const rows = interactionResources.getMyInteractionHistoryGraphTransform(response?.rows) || []
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Fetched details succesfully',
          data: {
            count: response?.count,
            rows
          }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'No details found'
      }

      // console.log('response?.rows', response?.rows)
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getTeamInteractionHistoryGraph(teamDetails, conn) {
    try {
      const { searchParams } = teamDetails

      const whereClause = {}
      let getUserlist = []
      if (searchParams && !searchParams?.teamMemberId && searchParams?.userId) {
        getUserlist = await conn.User.findAll({
          where: {
            managerId: searchParams?.userId
          }
        })
      }

      if (getUserlist.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No records found'
        }
      }

      const userList = getUserlist.map((u) => u.userId)
      whereClause.fromUserId = userList

      if (searchParams && searchParams?.roleId) {
        whereClause.fromRoleId = searchParams?.roleId
      }

      if (searchParams && searchParams?.EntityId) {
        whereClause.fromEntityId = searchParams?.EntityId
      }

      if (searchParams && searchParams?.serviceType) {
        whereClause.serviceType = searchParams?.serviceType
      }

      if (searchParams && searchParams?.serviceCategory) {
        whereClause.serviceCategory = searchParams?.serviceCategory
      }

      if (searchParams && searchParams?.teamMemberId) {
        whereClause.fromUserId = searchParams?.teamMemberId
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

      // interactionFlowAction.CREATED

      const getInteractionTxn = await conn.InteractionTxn.findAll({
        attributes: ['intxnId'],
        // logging: console.log,
        distinct: true,
        where: {
          intxnFlow: {
            [Op.notIn]: [interactionFlowAction.ASSIGN, interactionFlowAction.FOLLOWUP, interactionFlowAction.CREATED]
          },
          intxnTxnStatus: {
            [Op.notIn]: [defaultStatus.NEW]
          },
          ...whereClause
        }
      })

      if (getInteractionTxn.length > 0) {
        const getInteractionTxns = getInteractionTxn.map(e => e.intxnId)
        const response = await conn.Interaction.findAndCountAll({
          attributes: ['intxnId', 'createdAt', 'intxnNo', 'requestStatement'],
          include: [{
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'currStatusDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'categoryDescription'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceTypeDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'srType'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'channleDescription'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'intxnCategoryDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'priorityDescription'
          }
            // {
            //   model: conn.InteractionTxn,
            //   as: 'txnDetails',
            //   where: {
            //     intxnFlow: {
            //       [Op.notIn]: [interactionFlowAction.ASSIGN, interactionFlowAction.FOLLOWUP]
            //     },
            //     intxnTxnStatus: {
            //       [Op.notIn]: [defaultStatus.NEW]
            //     },
            //     ...whereClause
            //   },
            //   distinct: true
            // }
          ],
          // logging: console.log,
          where: {
            intxnId: getInteractionTxns
          },
          distinct: true
        })
        const rows = interactionResources.getMyInteractionHistoryGraphTransform(response?.rows) || []
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Fetched details succesfully',
          data: {
            count: response?.count,
            rows
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'No details found'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getTopFivePerformer(payload, conn, userId) {
    try {
      const { searchParams } = payload
      const i_entity_name = searchParams?.entityName ? `'${searchParams?.entityName}'` : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null
      const limit = searchParams?.limit ? `'${searchParams?.limit}'` : 0

      const detailsSql = `select * from bcae_ops_infor_team_top_performs_fn(${i_entity_name},${i_from_date},${i_to_date},${userId},${limit})`

      let responseData = await conn.sequelize.query(detailsSql, {
        type: QueryTypes.SELECT,
        logging: true
      })
      responseData = camelCaseConversion(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getTopFivePerformerChat(payload, conn) {
    try {
      const { searchParams } = payload
      const i_entity_name = searchParams?.entityName ? `'${searchParams?.entityName}'` : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null
      const limit = searchParams?.limit ? searchParams?.limit : 0

      const detailsSql = `select * from bcae_ops_infor_team_top_chat_performs_fn(${i_entity_name},${i_from_date},${i_to_date},${limit})`

      let responseData = await conn.sequelize.query(detailsSql, {
        type: QueryTypes.SELECT,
        logging: true
      })
      responseData = camelCaseConversion(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  /**
   * This function retrieves interaction appointment details and provides insights based on the time
   * taken to close the interaction after the appointment.
   * @param payload - an object containing the interactionNumber
   * @param conn - The database connection object used to query the database.
   * @returns This function returns an object with a status code, message, and data. The status code
   * indicates whether the function was successful or not, the message provides additional information
   * about the status, and the data contains the appointment details and insights related to the
   * interaction.
   */
  async getInteractionAppointment(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { interactionNumber } = payload

      const response = await conn.AppointmentTxn.findOne({
        where: {
          tranCategoryType: entityCategory.INTERACTION,
          tranCategoryNo: interactionNumber
        }
      })
      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Appointment details found'
        }
      }

      const interaction = conn.Interaction.findOne({
        where: {
          intxnNo: interactionNumber,
          intxnStatus: defaultStatus.CLOSED
        }
      })
      let insight = {}
      if (interaction && response.appointDate) {
        const level = moment(interaction.updatedAt).diff(moment(response.appointDate), 'days')
        if (level > -1) {
          if (level <= 1) {
            insight = {
              emotion: 'GOOD',
              message: 'The Interaction is closed on same day of appointment.'
            }
          } else if (level >= 1 && level <= 5) {
            insight = {
              emotion: 'NETURAL',
              message: `The Interaction is closed after ${level} day's of appointment.`
            }
          } else {
            insight = {
              emotion: 'IMPROVE',
              message: `The interaction is closed after ${level} day's of appointment.`
            }
          }
        }
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          status: defaultStatus.ACTIVE
        }
      })
      const rows = interactionResources.transformAppointment(response, businessEntityInfo) || {}
      const data = {
        rows,
        insight
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interaction Appointment fetched successfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  /**
   * This function retrieves interaction insights based on the payload type and returns the data as a
   * response.
   * @param payload - an object containing information about the type of interaction insight to retrieve
   * and any additional parameters such as limit, page, channel, and solutioned.
   * @param conn - It is a database connection object that is used to interact with the database.
   * @returns The function `getInteractionInsight` returns an object with properties `status`, `message`,
   * and `data`. The value of `status` and `message` depend on the logic of the function, while the value
   * of `data` depends on the input `payload` and the database query results.
   */
  async getInteractionInsight(payload, conn) {
    try {
      if (!payload || !payload?.type) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          status: defaultStatus.ACTIVE,
          codeType: businessEntity.CHANNEL
        }
      })

      if (payload?.type === defaultCode.INSIGHTS_COUNT) {
        const getInteraction = await conn.Interaction.findAll({
          include: [
            {
              model: conn.BusinessEntity,
              attributes: ['code', 'description'],
              as: 'channleDescription'
            }
          ],
          where: {
            requestId: payload?.requestId,
            customerUuid: {
              [Op.ne]: payload?.customerUuid
            },
            createdAt: {
              [Op.gte]: moment().subtract(6, 'months').format('YYYY-MM-DD'),
              [Op.lte]: moment().format('YYYY-MM-DD')
              // [Op.between]: [body.startDate, body.endDate]
            }
          }
        })

        if (!getInteraction) {
          return {
            status: statusCodeConstants.SUCCESS,
            message: 'No insight found for this statement'
          }
        }

        // group by channel
        const groupedByChannel = groupByCount(getInteraction, 'intxnChannel', true, businessEntityInfo)

        // Open Interaction
        const openInteraction = getInteraction.filter((e) => {
          let isTrue = false
          if (e.intxnStatus !== defaultStatus.CLOSED && e.intxnStatus !== defaultStatus.CANCELLED) {
            isTrue = true
          }
          return isTrue
        })

        // Resolution cornor && closed Interaction
        const closedInteraction = getInteraction.filter((e) => {
          let isTrue = false
          if (e.intxnStatus === defaultStatus.CLOSED || e.intxnStatus === defaultStatus.CANCELLED) {
            isTrue = true
          }
          return isTrue
        }).map((e) => { return { intxnNo: e.intxnNo, createdAt: moment(e.createdAt).format('MMM') } })

        const groupedClosedInteractionByDate = groupByCount(closedInteraction, 'createdAt')

        const getInteractions = getInteraction.map((e) => { return { intxnNo: e.intxnNo, createdAt: moment(e.createdAt).format('MMM') } })
        const groupedcustomerInteractionByDate = groupByCount(getInteractions, 'createdAt')

        const insight = {
          channel: groupedByChannel,
          customer: groupedcustomerInteractionByDate,
          solutioned: groupedClosedInteractionByDate,
          closedInteraction: closedInteraction?.length || 0,
          openInteraction: openInteraction?.length || 0,
          totalInteraction: getInteraction?.length || 0
        }

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Interaction insight fetched successfully',
          data: insight || []
        }
      } else if (payload?.type === defaultCode.INSIGHTS) {
        const { limit, page } = payload

        // if (!payload?.limit || !payload?.page) {
        //   return {
        //     status: statusCodeConstants.VALIDATION_ERROR,
        //     message: defaultMessage.MANDATORY_FIELDS_MISSING
        //   }
        // }

        const params = {
          offset: (page * limit),
          limit: Number(limit)
        }

        const whereClause = { requestId: payload?.requestId }
        if (payload && payload?.channel) {
          whereClause.intxnChannel = getbusinessEntity(businessEntityInfo, payload?.channel, 'code', 'description') || null
        }

        // if (payload && payload?.customerUuid) {
        //   whereClause.customerUuid = payload?.customerUuid
        // }

        if (payload && payload?.solutioned) {
          whereClause.intxnStatus = {
            [Op.in]: [defaultStatus.CLOSED, defaultStatus.CANCELLED]
          }
        }

        let response = {}
        if (payload && !payload?.customer && !payload?.solutioned) {
          response = await conn.Interaction.findAndCountAll({
            attributes: ['intxnId', 'createdAt', 'intxnNo'],
            include: [{
              model: conn.BusinessEntity,
              attributes: ['code', 'description'],
              as: 'currStatusDesc'
            }, {
              model: conn.BusinessEntity,
              attributes: ['code', 'description'],
              as: 'categoryDescription'
            }, {
              model: conn.BusinessEntity,
              attributes: ['code', 'description'],
              as: 'serviceTypeDesc'
            }, {
              model: conn.BusinessEntity,
              attributes: ['code', 'description'],
              as: 'srType'
            }, {
              model: conn.BusinessEntity,
              attributes: ['code', 'description'],
              as: 'intxnCategoryDesc'
            }],
            where: {
              ...whereClause
            },
            ...params
          })
        }

        if (payload && payload?.customer) {
          const getCustomerInteraction = await conn.Interaction.findAll({
            where: {
              ...whereClause
            },
            order: [['createdAt', 'DESC']]
          })
          const customerIds = getCustomerInteraction.map((e) => e.customerId)
          response = await conn.Customer.findAndCountAll({
            attributes: [
              'customerId', 'customerNo', 'customerUuid', 'customerRefNo', 'status', 'firstName',
              'lastName', 'customerAge', 'gender', 'birthDate', 'idType', 'idValue', 'customerCategory',
              'customerClass', 'customerMaritalStatus', 'occupation', 'registeredNo', 'registeredDate',
              'nationality', 'customerPhoto', 'taxNo', 'billable', 'customerStatusReason', 'contactPreferences'
            ],
            include: [
              {
                model: conn.BusinessEntity,
                as: 'statusDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.Contact,
                as: 'customerContact',
                include: [
                  {
                    model: conn.BusinessEntity,
                    as: 'statusDesc',
                    attributes: ['code', 'description']
                  },
                  {
                    model: conn.BusinessEntity,
                    as: 'contactTypeDesc',
                    attributes: ['code', 'description']
                  }
                ],
                required: true
              }
              // {
              //   model: conn.Interaction,
              //   as: 'customerInteraction',
              //   where: {
              //     requestId: payload?.requestId
              //   }
              // }
            ],
            ...params,
            where: {
              customerId: customerIds
            }
          })
        }

        if (payload && payload?.solutioned) {
          const getInteractions = await conn.Interaction.findAll({
            attributes: ['intxnId'],
            where: {
              ...whereClause
            }
          })
          const offSet = (page * limit)
          const interactions = getInteractions.map((e) => { return e.intxnId })

          let intxnId
          interactions?.forEach((ele) => {
            intxnId = intxnId ? intxnId + ',' + ele : ele
          })

          const handlingSql = `select * from bcae_interaction_remarks_vw where intxn_id in (${intxnId}) order by created_at desc limit ${limit} offset ${offSet} `
          let resp = await conn.sequelize.query(handlingSql, {
            type: QueryTypes.SELECT
          })
          // const rp = resp.filter((e) => {
          //   if (interactions.includes(e.intxn_id)) {
          //     return true
          //   }
          //   return false
          // })
          resp = camelCaseConversion(resp)
          response = {
            count: resp?.length || 0,
            rows: resp || []
          }
        }

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Interaction insight fetched successfully',
          data: response
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getInteractionOverview(payload, conn) {
    try {
      const { searchParams } = payload
      const i_user_id = searchParams?.userId ? `'${searchParams?.userId}'` : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null
      const i_role = searchParams?.roleId ? `'${searchParams?.roleId}'` : null
      const i_entity = searchParams?.entityId ? `'${searchParams?.entityId}'` : null

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_cat = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_order_type = searchParams?.orderType?.length ? `array[${searchParams?.orderType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_order_cat = searchParams?.orderCat?.length ? `array[${searchParams?.orderCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      const handlingSql = `select * from bcae_ops_infor_self_ageing_fn(${i_user_id},${i_from_date},${i_to_date},${i_role},${i_entity},${i_status},${i_service_type},${i_service_cat},${i_intxn_cat},${i_intxn_type},${i_order_cat},${i_order_type})`

      let responseData = await conn.sequelize.query(handlingSql, {
        type: QueryTypes.SELECT,
        logging: true
      })
      responseData = camelCaseConversion(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getAppointmentOverview(payload, conn) {
    try {
      const { searchParams } = payload
      const whereObj = {
        status: defaultStatus.SCHEDULED
      }
      // type = "Me" or "MyTeam"
      const type = ['Me', 'MyTeam'].includes(searchParams?.type) ? searchParams?.type : 'Me'

      if (type === 'Me') {
        whereObj.appointAgentId = searchParams?.userId
      } else {
        if (Array.isArray(searchParams?.teamMemberId)) {
          const teamIds = []
          for (const team of searchParams?.teamMemberId) {
            teamIds.push(team.value)
          }
          whereObj.appointAgentId = {
            [Op.in]: teamIds
          }
        } else {
          const myTeamMembers = await conn.User.findAll({
            attributes: ['userId'],
            where: { managerId: searchParams?.userId }
          })
          whereObj.appointAgentId = {
            [Op.in]: myTeamMembers.map(x => x.userId)
          }
        }
      }

      if (searchParams?.entityType && searchParams?.entityType !== 'all') {
        whereObj.tranCategoryType = searchParams?.entityType?.toUpperCase()
      }

      if (searchParams?.fromDate || searchParams?.toDate) {
        if (searchParams?.fromDate) {
          whereObj.appointDate = {
            [Op.and]: {
              [Op.gte]: searchParams?.fromDate
            }
          }
        }
        if (searchParams?.toDate) {
          whereObj.appointDate = {
            [Op.and]: {
              [Op.lte]: searchParams?.toDate
            }
          }
        }
      }

      const businessEntities = ['appointModeDesc', 'appointModeValueDesc', 'statusDesc']

      const appointments = await conn.AppointmentTxn.findAll({
        include: [
          ...businessEntities.map(x => ({ model: conn.BusinessEntity, attributes: ['code', 'description'], as: x })),
          {
            model: conn.User, attributes: ['userId', 'firstName', 'lastName'], as: 'appointAgentDesc'
          }
        ],
        where: whereObj
        // logging: true
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Fetched details ${appointments.length ? 'fetched successfully' : 'empty'}`,
        data: appointments
      }
    } catch (error) {
      console.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getTeamInteractionOverview(payload, conn) {
    try {
      const { searchParams } = payload
      const i_user_id = searchParams?.userId ? `'${searchParams?.userId}'` : null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null
      const i_role = searchParams?.roleId ? `'${searchParams?.roleId}'` : null
      const i_entity = searchParams?.entityId ? `'${searchParams?.entityId}'` : null

      const handlingSql = `select * from bcae_ops_infor_team_ageing_fn(${i_user_id},${i_from_date},${i_to_date},${i_role},${i_entity})`

      let responseData = await conn.sequelize.query(handlingSql, {
        type: QueryTypes.SELECT,
        logging: true
      })
      responseData = camelCaseConversion(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getInteractionCategoryPerformance(payload, conn) {
    try {
      if (!payload && !payload?.type) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { searchParams } = payload
      const userId = searchParams?.userId ? `'${searchParams?.userId}'` : null
      const roleId = searchParams?.roleId ? `'${searchParams?.roleId}'` : null
      const entityId = searchParams?.roleId ? `'${searchParams?.entityId}'` : null
      const fromDate = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const toDate = searchParams?.toDate ? `'${searchParams?.toDate}'` : null
      const limit = searchParams?.limit ? `'${searchParams?.limit}'` : null

      let handlingSql = ''
      if (payload && payload?.type && payload?.type === 'interactionType') {
        handlingSql = `select * from bcae_ops_infor_self_top_intxn_type_fn(${userId},${roleId},${entityId},${fromDate},${toDate},${limit})`
      }

      if (payload && payload?.type && payload?.type === 'interactionCategory') {
        handlingSql = `select * from bcae_ops_infor_self_top_intxn_category_fn(${userId},${roleId},${entityId},${fromDate},${toDate},${limit})`
      }

      console.log('handlingSql-------->', handlingSql)
      let responseData = []
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      responseData = interactionResources.transformInteractionCategoryPermormance(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData || []
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getTeamCategoryPerformance(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      const whereClause = {}

      if (searchParams && searchParams?.teamMemberId && Array.isArray(searchParams?.teamMemberId) && searchParams?.teamMemberId?.length > 0) {
        const teamMemberIds = searchParams?.teamMemberId.map(e => e.value)
        whereClause.createdBy = teamMemberIds
      } else {
        const getUserlist = await conn.User.findAll({
          where: {
            managerId: searchParams?.userId
          }
        })

        if (getUserlist.length > 0) {
          const userList = getUserlist.map((u) => u.userId)
          whereClause.createdBy = userList
        }
      }

      if (searchParams && searchParams?.serviceType) {
        if (searchParams?.serviceType && Array.isArray(searchParams?.serviceType) && searchParams?.serviceType?.length > 0) {
          const serviceTypes = searchParams?.serviceType.map(e => e.value)
          whereClause.serviceType = serviceTypes
        }
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

      if (searchParams && searchParams?.roleId) {
        whereClause.fromRoleId = searchParams?.roleId
      }
      // console.log('where', whereClause)
      const getAllInteractions = await conn.InteractionTxn.findAll({
        attributes: ['intxnId'],
        distinct: true,
        where: {
          intxnFlow: {
            [Op.notIn]: [interactionFlowAction.ASSIGN, interactionFlowAction.FOLLOWUP, interactionFlowAction.CREATED]
          },
          // intxnTxnStatus: {
          //   [Op.notIn]: [defaultStatus.NEW]
          // },
          ...whereClause
        }
        // logging: console.log
      })

      const getAllOrders = await conn.OrdersTxnHdr.findAll({
        attributes: ['orderId'],
        distinct: true,
        where: {
          orderFlow: {
            [Op.notIn]: [orderFlowAction.FOLLOWUP, orderFlowAction.ASSIGN, orderFlowAction.CREATED]
          },
          orderStatus: {
            [Op.notIn]: [defaultStatus.INPROCESS]
          },
          ...whereClause
        }
      })

      let interactionResponse = []
      if (getAllInteractions && getAllInteractions.length > 0) {
        const getInteractionTxns = getAllInteractions.map(e => e.intxnId)
        interactionResponse = await conn.Interaction.findAll({
          attributes: ['intxnId', 'createdAt', 'intxnNo', 'requestStatement'],
          include: [{
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'currStatusDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'categoryDescription'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceTypeDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'srType'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'channleDescription'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'intxnCategoryDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'priorityDescription'
          }],
          where: {
            intxnId: getInteractionTxns
          },
          distinct: true
        })
      }

      let OrderResponse = []
      if (getAllOrders && getAllOrders.length > 0) {
        const getOrderTxns = getAllOrders.map(e => e.orderId)
        OrderResponse = await conn.Orders.findAll({
          attributes: ['orderId', 'createdAt', 'orderNo'],
          include: [{
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderStatusDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceTypeDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderTypeDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCategoryDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderSourceDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderChannelDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCauseDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderPriorityDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderFamilyDesc'
          }],
          where: {
            orderId: getOrderTxns,
            parentFlag: defaultCode.NO
          },
          distinct: true
        })
      }

      const response = OrderResponse.concat(interactionResponse)
      // console.log('response', response)
      const rows = interactionResources.transformGetOverallPerformance(response) || []

      const data = {
        count: rows.length || 0,
        rows: rows || []
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getTopPerformance(payload, conn) {
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
      //   const getUserlist = await conn.User.findAll({
      //     where: {
      //       managerId: searchParams?.userId
      //     }
      //   })

      //   if (getUserlist.length > 0) {
      //     const userList = getUserlist.map((u) => u.userId)
      //     whereClause.fromUserId = userList
      //   }
      // }

      // if (searchParams?.fromDate && searchParams?.toDate) {
      //   whereClause.createdAt = {
      //     [Op.gte]: new Date(searchParams.fromDate),
      //     [Op.lte]: new Date(searchParams.toDate)
      //     // [Op.between]: [body.startDate, body.endDate]
      //   }
      // } else if (searchParams && searchParams?.fromDate) {
      //   whereClause.createdAt = searchParams?.fromDate
      // } else if (searchParams && searchParams?.toDate) {
      //   whereClause.createdAt = searchParams?.toDate
      // }

      // const response = await conn.Interaction.findAll({
      //   attributes: ['intxnCategory', [conn.sequelize.fn('count', conn.sequelize.col('intxn_category')), 'intxnCategoryCount']],
      //   where: {
      //     intxnCategory: {
      //       [Op.ne]: null
      //     },
      //     serviceType: searchParam?.st
      //   },
      //   group: ['intxnCategory'],
      //   order: [['intxnCategoryCount', 'DESC']],
      //   limit: searchParam.limit || defaultCode.lIMIT
      // })

      // const response = await conn.InteractionTxn.findAll({
      //   attributes: ['createdBy', [conn.sequelize.fn('count', conn.sequelize.col('created_by')), 'count']],
      //   where: {
      //     ...whereClause,
      //     intxnTxnStatus: [defaultStatus.CLOSED]
      //   },
      //   group: ['createdBy'],
      //   order: [['createdBy', 'DESC']],
      //   logging: console.log,
      //   limit: 5
      // })

      const userId = searchParams?.userId ? `'${searchParams?.userId}'` : null
      const fromDate = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : `'${moment().subtract(1, 'months').format('YYYY-MM-DD')}'`
      const toDate = searchParams?.toDate ? `'${searchParams?.toDate}'` : `'${moment().format('YYYY-MM-DD')}'`
      const limit = searchParams?.limit ? `'${searchParams?.limit}'` : 5

      const handlingSql = `select * from bcae_ops_infor_intxn_top_closure_performers_fn(${userId},${fromDate},${toDate},${limit})`

      let responseData
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      const userList = responseData && responseData.map((e) => { return e.oUserId })

      const getUserDetails = await conn.User.findAll({
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
        if (Array.isArray(Users) && Users?.length > 0) { resp.push(Users?.[0]) }
      })

      const data = interactionResources.transformTopPerformance(resp)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: data || []
      }

      // const interactionList = await conn.InteractionTxn.findAll({
      //   where:{
      //     intxnStatus: [defaultStatus.CLOSED, defaultStatus.CANCELLED]
      //   },
      //   order: [['', 'DESC']]
      // })
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getHelpdeskInteraction(payload, departmentId, roleId, userId, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { limit = 10, page = 0 } = payload
      const offSet = (page * limit)

      const whereClause = {
        [Op.or]: [
          { helpdeskId: { [Op.ne]: null } }
        ],
        currEntity: departmentId,
        currRole: roleId
      }

      if (payload?.assign) {
        whereClause.currUser = userId
      } else {
        whereClause.currUser = null
      }

      if (payload?.status) {
        whereClause.intxnStatus = payload?.status
      } else {
        whereClause.intxnStatus = {
          [Op.notIn]: [defaultStatus.CLOSED, defaultStatus.CANCELLED]
        }
      }

      const data = await conn.Interaction.findAndCountAll({
        include: [
          {
            model: conn.Customer,
            attributes: ['customerId', 'title', 'firstName', 'lastName', 'customerCategory', 'idType', 'idValue'],
            as: 'customerDetails',
            include: [
              {
                model: conn.Contact,
                attributes: ['contactId', 'contactNo', 'mobileNo', 'emailId'],
                as: 'customerContact'
              },
              {
                model: conn.Interaction,
                as: 'customerInteraction'
              }
            ]
          },
          {
            model: conn.Helpdesk,
            as: 'helpdeskDetails',
            include: [
              {
                model: conn.HelpdeskTxn,
                as: 'txnDetails',
                include: [{
                  model: conn.User,
                  attributes: ['firstName', 'lastName', 'email', 'contactNo'],
                  as: 'createdByDetails'
                }]
              }
            ]
          },
          { model: conn.BusinessEntity, as: 'srType', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'categoryDescription', attributes: ['description'] },
          // { model: conn.BusinessEntity, as: 'sourceDescription', attributes: ['description'] },
          // { model: conn.BusinessEntity, as: 'inqCauseDesp', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'channleDescription', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'currStatusDesc', attributes: ['description'] },
          // { model: conn.BusinessEntity, as: 'sevearityDescription', attributes: ['description'] },
          // { model: conn.BusinessEntity, as: 'locationDescription', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'priorityDescription', attributes: ['description'] },
          // { model: conn.BusinessEntity, as: 'cntPreferDescription', attributes: ['description'] },
          // { model: conn.BusinessEntity, as: 'aboutDescription', attributes: ['description'] },
          // { model: conn.BusinessEntity, as: 'problemTypeDescription', attributes: ['description'] },
          { model: conn.BusinessUnit, as: 'intDepartmentDetails', attributes: ['unitName'] },
          { model: conn.Role, as: 'roleDetails', attributes: ['roleName'] },
          {
            model: conn.User,
            as: 'currUserDetails',
            attributes: ['firstName', 'lastName']
          },
          {
            model: conn.User,
            as: 'userId',
            attributes: ['firstName', 'lastName']
          }
        ],
        where: whereClause,
        order: payload.sort === defaultStatus.NEW ? [['intxnId', 'DESC']] : [['intxnId', 'ASC']],
        offset: Number(offSet),
        limit: Number(limit),
        distinct: true
        // logging: true
      })

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

  async getRelatedStatementInfo(payload, conn) {
    try {
      const getInteractionList = await conn.Interaction.findAll({
        attributes: ['intxnId', 'intxnType', 'intxnNo', 'requestStatement', 'createdAt', 'intxnStatus', 'serviceType', 'assignedDate', 'productId'],
        include: [{
          model: conn.BusinessEntity, as: 'currStatusDesc', attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity, as: 'channleDescription', attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity, as: 'categoryDescription', attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity, as: 'intxnCategoryDesc', attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity, as: 'srType', attributes: ['code', 'description']
        }
        ],
        where: {
          requestId: payload.requestId,
          [Op.and]: [
            conn.sequelize.literal('DATE("Interaction"."created_at") BETWEEN (NOW() - INTERVAL \'7 days\') AND NOW()')
          ]
          // createdAt: {
          //   [Op.between]: [moment(new Date()).subtract(7, 'day').format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD')]
          // }
        },
        order: [['createdAt', 'DESC']]
        // logging: true
        // limit: 7
      })
      const intxnIds = []; const serviceTypeIds = []
      getInteractionList.forEach(f => { intxnIds.push(f.intxnNo) })
      getInteractionList.forEach(f => { serviceTypeIds.push(f.serviceType) })
      // console.log('serviceTypeIds ', serviceTypeIds)

      const uniqueSts = serviceTypeIds.filter((c, index) => {
        return serviceTypeIds.indexOf(c) === index
      })

      const appointmentList = await conn.AppointmentTxn.findAll({
        include: [{
          model: conn.BusinessEntity, as: 'statusDesc', attributes: ['code', 'description']
        }],
        where: {
          // tranCategoryNo: intxnIds,
          // appointDate: {
          //   [Op.between]: [moment(new Date()).subtract(7, 'day').format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD')]
          // }
        }
        // logging: true
        // limit: 7
      })

      const productList = await conn.Product.findAll({
        where: {
          serviceType: uniqueSts
        }
      })
      // console.log('productList ', productList)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Statement fetched successfully',
        data: { interactions: getInteractionList, appointments: appointmentList, products: productList }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getRelatedCategoryTypeInfo(payload, conn) {
    // console.log('payload ', payload)
    try {
      const getInteractionList = await conn.Interaction.findAll({
        attributes: ['intxnId', 'intxnType', 'intxnNo', 'requestStatement', 'createdAt', 'intxnStatus', 'serviceType', 'assignedDate'],
        include: [{
          model: conn.BusinessEntity, as: 'currStatusDesc', attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity, as: 'channleDescription', attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity, as: 'categoryDescription', attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity, as: 'intxnCategoryDesc', attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity, as: 'srType', attributes: ['code', 'description']
        }],
        where: {
          intxnCategory: payload.intxnCategory.code,
          intxnType: payload.intxnType.code,
          [Op.and]: [
            conn.sequelize.literal('DATE("Interaction"."created_at") BETWEEN (NOW() - INTERVAL \'7 days\') AND NOW()')
          ]
          // createdAt: {
          //   [Op.between]: [moment(new Date()).subtract(7, 'day').format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD')]
          // }
        },
        order: [['createdAt', 'DESC']]
        // logging: true
        // limit: 7
      })
      const intxnIds = []
      getInteractionList.forEach(f => { intxnIds.push(f.intxnNo) })

      const appointmentList = await conn.AppointmentTxn.findAll({
        include: [{
          model: conn.BusinessEntity, as: 'statusDesc', attributes: ['code', 'description']
        }],
        where: {
          tranCategoryNo: intxnIds,
          appointDate: {
            [Op.between]: [moment(new Date()).subtract(7, 'day').format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD')]
          }
        }
        // logging: true
        // limit: 7
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Statement fetched successfully',
        data: { interactions: getInteractionList, appointments: appointmentList }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getTotalInteractionByChannel(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      let query = `select
      i.created_at,i.intxn_no ,
      concat(cc.first_name,' ',cc.last_name) as customer_name ,
      be_desc(i.intxn_channel) as channel,
      be_desc(i.service_type) as service_type,
      be_desc(i.intxn_status) as intxn_status,
      be_desc(i.intxn_type) as intxn_type,
      be_desc(i.intxn_category) as intxn_category,
      be_desc(i.service_category) as service_category
    from
      interaction as i
      left join cust_customers cc on cc.customer_id =i.customer_id 
    inner join ad_business_entity as bu on
      bu.code = i.intxn_channel `
      let whereClause = ' WHERE  bu.status = \'AC\' '

      console.log('searchParams?.serviceCategory-------->', searchParams?.serviceCategory)

      if (searchParams?.serviceCategory) {
        const serviceCategories = searchParams.serviceCategory.join("', '")
        whereClause = whereClause + ` AND i.service_category IN ('${serviceCategories}')`
      }

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause = whereClause + ` AND i.service_type IN ('${serviceTypes}')`
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' AND CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }

      query = query + whereClause

      console.log('total count query--------->', query)
      const response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Interaction Count By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getTopPerformingByChannel(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload

      let query = 'SELECT count(*) as count ,be_desc(i.intxn_type) as type,COALESCE(be_desc(i.intxn_channel),i.intxn_channel) AS channel  from interaction i  '

      let whereClause = ' WHERE  1=1 '

      if (searchParams?.serviceCategory) {
        const serviceCategories = searchParams.serviceCategory.join("', '")
        whereClause = whereClause + ` AND i.service_category IN ('${serviceCategories}') `
      }

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause = whereClause + ` AND i.service_type IN ('${serviceTypes}') `
      }

      if (searchParams?.channel && searchParams?.channel !== 'skel-channel-all') {
        whereClause = whereClause + ' And i.intxn_channel = \'' + searchParams.channel + '\' '
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' And CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      if (searchParams.channel && searchParams.channel !== '' && searchParams.channel !== undefined) {
        if (searchParams?.channel !== 'skel-channel-all') {
          whereClause = whereClause + ' AND i.intxn_channel = \'' + searchParams.channel + '\' '
        }
      }

      query = query + whereClause
      // console.log('top performing query--------->', query + ' group by  i.intxn_type,i.intxn_channel order by count desc limit 5')
      const response = await conn.sequelize.query(query + ' group by  i.intxn_type,i.intxn_channel order by count desc limit 5', {
        type: QueryTypes.SELECT
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Top 5 performing By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getIssuesSolvedByChannel(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      let query = `SELECT concat(cc.first_name,' ',cc.last_name) as customer_name ,
      i.created_at,
      i.is_resolved_by,
      i.intxn_no as intxn_no,
      COALESCE(be_desc(i.intxn_channel),i.intxn_channel) as channel,
      be_desc(i.intxn_status) as intxn_status,
      be_desc(i.intxn_category) as intxn_category,
      be_desc(i.intxn_type) as intxn_type,
      be_desc(i.service_type) as service_type,
      be_desc(i.service_category) as service_category,
      'Interactions' as entity
      FROM interaction i left join cust_customers cc on cc.customer_id =i.customer_id  `
      let whereClause = ' WHERE i.is_resolved_by in (\'BOT\',\'HUMAN\') '

      if (searchParams?.serviceCategory) {
        const serviceCategories = searchParams.serviceCategory.join("', '")
        whereClause = whereClause + ` AND i.service_category IN ('${serviceCategories}') `
      }

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause = whereClause + ` AND i.service_type IN ('${serviceTypes}') `
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + 'and CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' '
      }

      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' AND CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }

      if (searchParams.channel && searchParams.channel !== '' && searchParams.channel !== undefined) {
        if (searchParams?.channel !== 'skel-channel-all') {
          whereClause = whereClause + ' AND i.intxn_channel = \'' + searchParams.channel + '\' '
        }
      }

      query = query + whereClause

      // console.log('query---------->', query)
      const response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      // response = camelCaseConversion(response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Issues Resolved By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error('error of issue resolved by-------->', error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getTopProblemSolvingByChannel(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      let query = 'SELECT count(*), be_desc(i.intxn_channel) AS channel FROM interaction i  '
      let whereClause = ' WHERE 1=1 '

      if (payload?.intxnType && payload?.intxnType?.length > 0) {
        const intxnTypes = payload.intxnType.map(type => type.value).join("', '")
        whereClause = whereClause + ` AND i.intxn_type IN ('${intxnTypes}')`
      }

      if (searchParams?.serviceCategory) {
        const serviceCategories = searchParams.serviceCategory.join("', '")
        whereClause = whereClause + ` AND i.service_category IN ('${serviceCategories}') `
      }

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause = whereClause + ` AND i.service_type IN ('${serviceTypes}') `
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + 'and  CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }

      query = query + whereClause

      let response = await conn.sequelize.query(query + 'GROUP BY i.intxn_channel order by count desc limit 5', {
        type: QueryTypes.SELECT
      })
      response = camelCaseConversion(response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Top Problem Solving By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getTopSalesByChannel(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      let query1 = `SELECT 
      concat(cc2.first_name,' ',cc2.last_name) as customer_name ,
      i.created_at,
      i.intxn_no as entity_no,
      COALESCE(be_desc(i.intxn_channel),i.intxn_channel) as channel,
      be_desc(i.intxn_status) as entity_status,
       be_desc(i.intxn_category) as entity_category,
        be_desc(i.intxn_type) as entity_type,
      be_desc(i.service_type) as service_type,      
       'Interactions' as entity
       FROM interaction i left join cust_customers cc2 on cc2.customer_id = i.customer_id left join order_hdr oh on i.intxn_id =oh.intxn_id `

      let whereClause1 = ' WHERE oh.intxn_id is not null '

      if (searchParams?.serviceCategory) {
        const serviceCategories = searchParams.serviceCategory.join("', '")
        whereClause1 = whereClause1 + ` AND i.service_category IN ('${serviceCategories}') `
      }

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause1 = whereClause1 + ` AND i.service_type IN ('${serviceTypes}') `
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause1 = whereClause1 + ' and CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause1 = whereClause1 + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      query1 = query1 + whereClause1

      let query2 = ` union all select 
      concat(cc.first_name, ' ', cc.last_name) as customer_name,
      oh.created_at,
      order_no as entity_no,
      COALESCE(be_desc(order_channel),order_channel) as channel,
      be_desc(order_status) as entity_status,
      be_desc(order_category) as entity_category,
      be_desc(order_type) as entity_type,
      be_desc(service_type) as service_type,
       'Order' as entity
          from order_hdr as oh left join cust_customers cc on cc.customer_id  = oh.customer_id  `

      let whereClause2 = ' WHERE oh.intxn_id is null '

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause2 = whereClause2 + 'and CAST(oh.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause2 = whereClause2 + ' CAST(oh.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }

      query2 = query2 + whereClause2

      const finalQuery = query1 + query2 + 'limit 5'
      // console.log('finalQuery-----top sales------->', finalQuery)
      const response = await conn.sequelize.query(finalQuery, {
        type: QueryTypes.SELECT
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Top Sales By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getLiveSupportByChannel(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      let query = 'select *, be_desc(cc.chat_source) channel_desc,be_desc(cc.status) status_desc from cc_chat cc '

      let whereClause = '  where status in (\'ASSIGNED\') and user_id is not null '

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined && searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + '  and CAST(cc.created_at as DATE) >=\'' + searchParams.startDate + '\' AND CAST(cc.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      } else {
        whereClause = whereClause + 'and cc.created_at::date = current_date '
      }

      query = query + whereClause

      const response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Live Support By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getChannelsByOrder(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      let query = `select 
      total_cnt,
      channel_desc
      from 
      (
      select     count(*) as total_cnt,
                be_desc(oh.order_channel) as channel_desc
        from   order_hdr oh
    
    `

      let whereClause = ' WHERE oh.parent_flag=\'N\' '

      const tail = ` group by oh.order_channel 
      )sub
      order by total_cnt desc 
      limit 5`

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause = whereClause + ` AND oh.service_type IN ('${serviceTypes}')`
      }

      if (payload?.orderType && payload?.orderType?.length > 0) {
        const orderTypes = payload.orderType.map(type => type.value).join("', '")
        whereClause = whereClause + ` AND oh.order_type IN ('${orderTypes}')`
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' and CAST(oh.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(oh.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }

      query = query + whereClause + tail

      // console.log('query----channels----->', query)
      const response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Top Channels By Order',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  // async getTopSalesByChannel(payload, conn) {
  //   try {
  //     if (!payload) {
  //       return {
  //         status: statusCodeConstants.VALIDATION_ERROR,
  //         message: defaultMessage.MANDATORY_FIELDS_MISSING
  //       }
  //     }
  //     const { searchParams } = payload
  //     let query1 = 'SELECT count(*), be_desc(i.intxn_channel) AS channel,\'Interactions\' as entity FROM interaction i  '

  //     let whereClause1 = ' WHERE  '
  //     if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
  //       whereClause1 = whereClause1 + 'CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
  //     }
  //     if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
  //       whereClause1 = whereClause1 + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' '
  //     }
  //     if (searchParams.startDate || searchParams.endDate) {
  //       query1 = query1 + whereClause1 + ' group by i.intxn_channel '
  //     } else {
  //       query1 = query1 + ' group by i.intxn_channel '
  //     }

  //     let query2 = ' union all select count(*) , be_desc(oh.order_channel) channel, \'Order\' as entity from order_hdr as oh '

  //     let whereClause2 = ' WHERE  '
  //     if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
  //       whereClause2 = whereClause2 + 'CAST(oh.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
  //     }
  //     if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
  //       whereClause2 = whereClause2 + ' CAST(oh.created_at as DATE) <= \'' + searchParams.endDate + '\' '
  //     }
  //     if (searchParams.startDate || searchParams.endDate) {
  //       query2 = query2 + whereClause2 + 'group by  oh.order_channel '
  //     } else {
  //       query2 = query2 + ' group by  oh.order_channel  '
  //     }
  //     const finalQuery = query1 + query2
  //     console.log('finalQuery--->', finalQuery)

  //     const response = await conn.sequelize.query(finalQuery, {
  //       type: QueryTypes.SELECT
  //     })
  //     // response = camelCaseConversion(response)
  //     return {
  //       status: statusCodeConstants.SUCCESS,
  //       message: 'Successfully Fetched Top Sales By Channel',
  //       data: response || []
  //     }
  //   } catch (error) {
  //     logger.error(error)
  //     return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
  //   }
  // }

  async getProspectGeneratedByChannel(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      const query = `select
      distinct concat(cc.first_name,' ',cc.last_name) as customer_name,
      cc.customer_no,
      be_desc(customer_category) as customer_category,
      be_desc(status) as status,
      registered_date,
      cc.created_at,
      COALESCE(be_desc(i.intxn_channel),i.intxn_channel) as channel
    from
      cust_customers as cc
    inner join interaction i on
      i.customer_id = cc.customer_id `

      let whereClause = ' WHERE cc.status in (\'CS_PROSPECT\',\'CS_TEMP\') '

      if (searchParams?.serviceCategory) {
        const serviceCategories = searchParams.serviceCategory.join("', '")
        whereClause = whereClause + ` AND i.service_category IN ('${serviceCategories}') `
      }

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause = whereClause + ` AND i.service_type IN ('${serviceTypes}') `
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' AND CAST(cc.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(cc.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }

      const response = await conn.sequelize.query(query + whereClause, {
        type: QueryTypes.SELECT,
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Prospect Generated By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getInteractionCorner(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      if (!searchParams.channel) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const query = `select
      concat(cc.first_name,' ',cc.last_name) as customer_name ,
      i.created_at,
      i.intxn_no as entity_no,
      COALESCE(be_desc(i.intxn_channel),i.intxn_channel) as channel,
      be_desc(i.intxn_status) as entity_status,
      be_desc(i.intxn_category) as entity_category,
      be_desc(i.intxn_type) as entity_type,
      be_desc(i.service_type) as service_type
      from
        interaction i left join cust_customers cc on cc.customer_id = i.customer_id   `

      let whereClause = ` WHERE i.intxn_channel='${searchParams.channel}' `

      if (payload?.intxnType && payload?.intxnType?.length > 0) {
        const intxnTypes = payload.intxnType.map(type => type.value).join("', '")
        whereClause = whereClause + ` AND i.intxn_type IN ('${intxnTypes}')`
      }

      if (searchParams?.serviceCategory) {
        const serviceCategories = searchParams.serviceCategory.join("', '")
        whereClause = whereClause + ` AND i.service_category IN ('${serviceCategories}') `
      }

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause = whereClause + ` AND i.service_type IN ('${serviceTypes}') `
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + 'AND CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }

      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }

      // console.log('query + whereClause---------->', query + whereClause)
      const response = await conn.sequelize.query(query + whereClause, {
        type: QueryTypes.SELECT,
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Interaction Corner',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async avgPerformanceByChannel(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      if (!searchParams.channel) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const query = `SELECT 
      COUNT(*) AS total_interactions_by_channel,
      (SELECT COUNT(*) FROM interaction i2 ) as total_intxn,
      round((SELECT COUNT(*) FROM interaction i2) / NULLIF(COUNT(*), 0)) as average
  FROM
      interaction i `
      let whereClause = ` WHERE i.intxn_channel='${searchParams.channel}' `
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + 'AND CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }

      const response = await conn.sequelize.query(query + whereClause, {
        type: QueryTypes.SELECT,
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Average Performance By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getInteractionCategory(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      if (!searchParams.channel) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = 'select count(*), be_desc(i.intxn_category) as category from interaction i  '

      let whereClause = ` WHERE i.intxn_channel='${searchParams.channel}' `

      if (searchParams?.serviceCategory) {
        const serviceCategories = searchParams.serviceCategory.join("', '")
        whereClause = whereClause + ` AND i.service_category IN ('${serviceCategories}') `
      }

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause = whereClause + ` AND i.service_type IN ('${serviceTypes}') `
      }

      if (payload?.intxnCategory && payload?.intxnCategory?.length > 0) {
        const intxnCategories = payload.intxnCategory.map(type => type.value).join("', '")
        whereClause = whereClause + ` AND i.intxn_category IN ('${intxnCategories}')`
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + 'AND CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      const response = await conn.sequelize.query(query + whereClause + 'GROUP BY i.intxn_category order by category', {
        type: QueryTypes.SELECT,
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Interaction Category',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async myTeamPooledInteractions(interactionData, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      // console.log(params, searchParams)

      const i_role_id = searchParams?.roleId || null // integer
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_all_role = searchParams?.isAllRole || null // character varying

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_type = searchParams?.intxnType?.length ? `array[${searchParams?.intxnType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_intxn_cat = searchParams?.intxnCat?.length ? `array[${searchParams?.intxnCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_team_member_id = searchParams?.teamMemberId?.length ? `array[${searchParams?.teamMemberId.map(x => `${x.value}`).join(',')}]::int[]` : 'array[]::int[]' // integer

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_intxn_type = searchParams?.intxnType ? `'${searchParams?.intxnType}'` : null // character varying
      // const i_intxn_cat = searchParams?.intxnCat ? `'${searchParams?.intxnCat}'` : null // character varying
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from bcae_intxn_team_pooled_fn(${i_role_id},${i_entity_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_intxn_type},${i_intxn_cat},${i_service_type},${i_service_cat},${i_team_member_id},${i_limit},${i_offset})`

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Interactions fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async myTeamPooledOrders(interactionData, conn) {
    try {
      const { searchParams } = interactionData
      let params = {}

      if (!isNaN(searchParams?.page) && !isNaN(searchParams?.limit)) {
        params = {
          offset: (searchParams?.page * searchParams?.limit),
          limit: Number(searchParams?.limit)
        }
      }

      // console.log(params, searchParams)

      const i_role_id = searchParams?.roleId || null // integer
      const i_entity_id = searchParams?.departmentId ? `'${searchParams?.departmentId}'` : null // character varying
      const i_user_id = searchParams?.userId || null // integer
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null // date
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null // date
      const i_all_role = searchParams?.isAllRole || null // character varying

      const i_status = searchParams?.status?.length ? `array[${searchParams?.status.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_type = searchParams?.serviceType?.length ? `array[${searchParams?.serviceType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_service_cat = searchParams?.serviceCat?.length ? `array[${searchParams?.serviceCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_team_member_id = searchParams?.teamMemberId?.length ? `array[${searchParams?.teamMemberId.map(x => `${x.value}`).join(',')}]::int[]` : 'array[]::int[]' // integer
      const i_type = searchParams?.orderType?.length ? `array[${searchParams?.orderType.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying
      const i_category = searchParams?.orderCat?.length ? `array[${searchParams?.orderCat.map(x => `'${x.value}'`).join(',')}]::text[]` : 'array[]::text[]' // character varying

      // const i_status = searchParams?.status ? `'${searchParams?.status}'` : null // character varying
      // const i_intxn_type = searchParams?.intxnType ? `'${searchParams?.intxnType}'` : null // character varying
      // const i_intxn_cat = searchParams?.intxnCat ? `'${searchParams?.intxnCat}'` : null // character varying
      // const i_service_type = searchParams?.serviceType ? `'${searchParams?.serviceType}'` : null // character varying
      // const i_service_cat = searchParams?.serviceCat ? `'${searchParams?.serviceCat}'` : null // character varying

      const i_limit = params?.limit || null // integer
      const i_offset = params?.offset || null // integer

      const interactionSql = `select * from bcae_order_team_pooled_fn(${i_role_id},${i_entity_id},${i_user_id},${i_from_date},${i_to_date},${i_status},${i_type},${i_category},${i_service_type},${i_service_cat},${i_team_member_id},${i_limit},${i_offset})`

      let interactionResponseData = await conn.sequelize.query(interactionSql, {
        type: QueryTypes.SELECT,
        logging: true
      })

      interactionResponseData = camelCaseConversion(interactionResponseData)

      const data = {
        count: interactionResponseData.length ? interactionResponseData[0].oRecordCnt : 0,
        rows: interactionResponseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Orders fetched succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getNewInteractionCount(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      if (!searchParams.channel) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const query = `select
      concat(cc.first_name,' ',cc.last_name) as customer_name ,
      i.created_at,
      i.intxn_no as entity_no,
      COALESCE(be_desc(i.intxn_channel),i.intxn_channel) as channel,
      be_desc(i.intxn_status) as entity_status,
      be_desc(i.intxn_category) as entity_category,
      be_desc(i.intxn_type) as entity_type,
      be_desc(i.service_type) as service_type
      from
        interaction i left join cust_customers cc on cc.customer_id = i.customer_id   `
      let whereClause = ` WHERE i.intxn_channel='${searchParams.channel}' `
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + 'AND CAST(i.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      const response = await conn.sequelize.query(query + whereClause, {
        type: QueryTypes.SELECT,
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Interaction Corner',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async saveInteractionStatement(serviceData, conn) {
    const t = await conn.sequelize.transaction()
    try {
      if (!serviceData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const knowledgeBaseData = {
        requestStatement: serviceData?.statement.toUpperCase(),
        serviceType: serviceData?.serviceType,
        intxnCategory: serviceData?.interactionCategory,
        intxnType: serviceData?.interactionType,
        serviceCategory: serviceData?.serviceCategory,
        // serviceType: serviceData?.serviceType,
        status: defaultStatus?.TEMPORARY,
        createdBy: systemUserId
      }
      const clonedData = { ...knowledgeBaseData }
      delete clonedData.createdBy
      // console.log('knowledgeBaseData--------->', knowledgeBaseData)

      const responseData = await conn.KnowledgeBase.findAll({
        where: clonedData
      })

      if (responseData && responseData?.length > 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Your interaction statement was successfully saved and submitted to admin for review. We value your contribution.',
          data: []
        }
      }
      let response = await conn.KnowledgeBase.create(knowledgeBaseData, { transaction: t })
      await t.commit()
      response = response?.dataValues ? response?.dataValues : response

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Your interaction statement was successfully saved and submitted to admin for review. We value your contribution.',
        data: response
      }
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

  async getRequests(payload, departmentId, roleId, userId, conn) {
    try {
      if (!payload?.requestStatus) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let params = {}
      if (!isNaN(payload?.page) && !isNaN(payload?.limit)) {
        params = {
          offset: (payload?.page * payload?.limit),
          limit: Number(payload?.limit)
        }
      }

      const requestStatuses = {
        open: [defaultStatus.requestStatus.PENDING],
        closed: [
          defaultStatus.requestStatus.APPROVED,
          defaultStatus.requestStatus.CANCELLED,
          defaultStatus.requestStatus.REJECTED
        ]
      }

      let where = {
        requestStatus: requestStatuses[payload?.requestStatus]
      }

      let userIds = []
      if (payload?.myRequest) {
        userIds.push(userId)
      } else {
        const users = await conn.User.findAll({
          where: {
            managerId: userId
          }
        })
        userIds = users.map((u) => u.userId)
      }

      where = {
        ...where,
        currUser: userIds
      }

      let requestTypeDesc = {}
      let currStatusDesc = {}
      let priorityDesc = {}
      let currUserDetails = {}

      if (payload?.filters && Array.isArray(payload?.filters) && !isEmpty(payload?.filters)) {
        for (const record of payload?.filters) {
          if (record.value) {
            if (record.id === 'requestNo') {
              where.requestNo = {
                [Op.and]: [
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('request_no')),
                    {
                      [record.filter === 'contains'
                        ? Op.iLike
                        : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'requestDescription') {
              where.requestDescription = {
                [Op.and]: [
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('request_description')),
                    {
                      [record.filter === 'contains'
                        ? Op.iLike
                        : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'entityType') {
              where.entityType = {
                [Op.and]: [
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('entity_type')),
                    {
                      [record.filter === 'contains'
                        ? Op.iLike
                        : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'requestType') {
              requestTypeDesc = {
                [Op.or]: [
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('requestTypeDesc.code')),
                    {
                      [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  ),
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('requestTypeDesc.description')),
                    {
                      [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'requestPriority') {
              priorityDesc = {
                [Op.or]: [
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('priorityDesc.code')),
                    {
                      [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  ),
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('priorityDesc.description')),
                    {
                      [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'status') {
              currStatusDesc = {
                [Op.or]: [
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('currStatusDesc.code')),
                    {
                      [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  ),
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('currStatusDesc.description')),
                    {
                      [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'userName') {
              currUserDetails = {
                [Op.or]: [
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('currUserDetails.first_name')),
                    {
                      [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  ),
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('currUserDetails.last_name')),
                    {
                      [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            }
          }
        }
      }

      const requestData = await conn.Request.findAndCountAll({
        where,
        include: [
          {
            model: conn.BusinessEntity,
            as: 'requestTypeDesc',
            attributes: ['code', 'description'],
            where: requestTypeDesc
          },
          {
            model: conn.BusinessEntity,
            as: 'currStatusDesc',
            attributes: ['code', 'description'],
            where: currStatusDesc
          },
          {
            model: conn.BusinessEntity,
            as: 'priorityDesc',
            attributes: ['code', 'description'],
            where: priorityDesc
          },
          {
            model: conn.User,
            as: 'createdUser',
            attributes: ['userId', 'firstName', 'lastName']
          },
          {
            model: conn.User,
            as: 'currUserDetails',
            attributes: ['userId', 'firstName', 'lastName'],
            where: currUserDetails
          },
          {
            model: conn.BusinessUnit,
            as: 'intDepartmentDetails',
            attributes: ['unitId', 'unitName']
          },
          {
            model: conn.Role,
            as: 'roleDetails',
            attributes: ['roleId', 'roleName']
          },
          {
            model: conn.BusinessUnit,
            as: 'createdDepartmentDetails',
            attributes: ['unitId', 'unitName']
          },
          {
            model: conn.Role,
            as: 'createdRoleDesc',
            attributes: ['roleId', 'roleName']
          },
          {
            model: conn.BusinessUnit,
            as: 'requestedDepartmentDetails',
            attributes: ['unitId', 'unitName']
          },
          {
            model: conn.Role,
            as: 'requestedRoleDesc',
            attributes: ['roleId', 'roleName']
          }
        ],
        order: [
          ['requestDate', 'DESC']
        ],
        ...params
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Request data listed successfully',
        data: { count: requestData?.count || 0, rows: requestData.rows }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateRequestStatus(payload, departmentId, roleId, userId, conn) {
    try {
      if (!payload?.requestNo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      if (['reject', 'cancel'].includes(payload?.status) && isEmpty(payload?.reason)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Please fill the reason'
        }
      }

      const requestStatuses = {
        approve: defaultStatus.requestStatus.APPROVED,
        reject: defaultStatus.requestStatus.REJECTED,
        cancel: defaultStatus.requestStatus.CANCELLED
      }

      if (['reject', 'cancel'].includes(payload.status)) {
        await conn.Request.update({ requestStatus: requestStatuses[payload.status], requestStatusReason: payload?.reason }, {
          where: {
            requestNo: payload.requestNo
          }
        })
        return {
          status: statusCodeConstants.SUCCESS,
          message: `Request got ${payload.status}ed successfully`
        }
      } else if (payload.status === 'approve') {
        const requestData = await conn.Request.findOne({ where: { requestNo: payload.requestNo } })
        if (!requestData) {
          return {
            status: statusCodeConstants.ERROR,
            message: 'Request not found'
          }
        } else {
          let requestedChangeMade = false

          if (requestData.entityType === 'USER') {
            requestedChangeMade = await this.updateUserRequest(requestData.mappingPayload, requestData.entityValue, conn)
          } else if (requestData.entityType === 'ROLE') {
            requestedChangeMade = await this.updateRoleRequest(requestData.mappingPayload, requestData.entityValue, conn)
          } else if (requestData.entityType === 'CUSTOMER') {
            requestedChangeMade = await this.updateCustomerRequest(requestData.mappingPayload, requestData.entityValue, conn)
          } else if (requestData.entityType === 'ORDER') {
            requestedChangeMade = await this.updateOrderRequest(requestData.mappingPayload, requestData.entityValue, conn)
          } else if (requestData.entityType === 'AI_REQUEST') {
            requestedChangeMade = true
          }

          if (requestedChangeMade) {
            await conn.Request.update({ requestStatus: requestStatuses[payload.status] }, {
              where: {
                requestNo: payload.requestNo
              }
            })
          }

          return {
            status: statusCodeConstants[requestedChangeMade ? 'SUCCESS' : 'ERROR'],
            message: requestedChangeMade ? 'Request has been approved' : 'Error in approving the request'
          }
        }
      } else {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Request status is not allowed to be updated'
        }
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateUserRequest(payload, userId, conn) {
    try {
      const updateObj = {}
      for (let index = 0; index < payload.length; index++) {
        const element = payload[index]
        updateObj[element.property] = element.currentValue
      }
      await conn.User.update(updateObj, {
        where: { userId }
      })
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async updateRoleRequest(payload, roleId, conn) {
    try {
      const updateObj = {}
      for (let index = 0; index < payload.length; index++) {
        const element = payload[index]
        updateObj[element.property] = element.currentValue
      }
      await conn.Role.update(updateObj, {
        where: { roleId }
      })
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async updateCustomerRequest(payload, customerNo, conn) {
    try {
      const updateObj = {}
      for (let index = 0; index < payload.length; index++) {
        const element = payload[index]
        updateObj[element.property] = element.currentValue
      }
      await conn.Customer.update(updateObj, {
        where: { customerNo }
      })
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async updateOrderRequest(payload, customerNo, conn) {
    try {
      const updateObj = {}
      for (let index = 0; index < payload.length; index++) {
        const element = payload[index]
        updateObj[element.property] = element.currentValue
      }
      await conn.Customer.update(updateObj, {
        where: { customerNo }
      })
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async frequentStatement(searchParam, conn) {
    try {
      const whereClause = {
        requestId: {
          [Op.ne]: null
        }
      }

      if (searchParam && searchParam?.serviceCategory) {
        whereClause.serviceCategory = searchParam?.serviceCategory
      }

      const response = await conn.Interaction.findAll({
        attributes: ['requestId', 'requestStatement', [conn.sequelize.fn('count', conn.sequelize.col('request_id')), 'requestCount']],
        where: { ...whereClause },
        group: ['requestId', 'requestStatement'],
        order: [['requestCount', 'DESC']],
        limit: searchParam.limit || defaultCode.lIMIT
      })

      if (!response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No Knowlodge base details found',
          data: response
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Knowlodge base details fetch succesfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }
}

module.exports = InteractionService

const findAndUpdateAttachment = async (entityId, interactionUid, entityCategory, conn, t) => {
  try {
    let attachment = await conn.Attachments.findAll({ where: { entityId, entityType: entityCategory, status: defaultStatus.status.TEMPORARY } })
    if (attachment) {
      const checkExistingAttachment = await conn.Attachments.findAll({
        where: {
          entityId,
          entityType: entityCategory,
          status: defaultStatus.status.FINAL
        }
      })
      if (checkExistingAttachment) {
        await conn.Attachments.update({ status: defaultStatus.status.IN_ACTIVE }, { where: { entityId, entityType: entityCategory, status: defaultStatus.status.FINAL }, transaction: t })
      }
      const data = {
        status: defaultStatus.status.FINAL,
        entityId: interactionUid
      }
      attachment = attachment?.dataValues ? attachment?.dataValues : attachment
      await conn.Attachments.update(data, { where: { entityId, entityType: entityCategory, status: defaultStatus.status.TEMPORARY }, transaction: t })
    }
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR,
      message: 'Internal server error'
    }
  }
}

const getUsersByRole = (roleId, deptId, type, conn) => {
  try {
    // console.log('roleId------>', roleId)
    // console.log('deptId------>', deptId)
    // console.log('type------>', type)
    logger.debug('Getting users list')

    let response = []
    const roleInfo = conn.Role.findOne({
      where: {
        roleId
      }
    })
    if (roleInfo) {
      let query = ''
      if (type === defaultCode.POPUP) {
        query = `SELECT user_id, user_type, title, first_name, last_name, email, contact_no
        FROM ad_users
        WHERE mapping_payload @> '{"userDeptRoleMapping":[{"roleId":[${roleId}] , "unitId" :"${deptId}"}]}'
        AND status = 'AC';`
      } else {
        query = `SELECT user_id, user_type, title, first_name, last_name, email, contact_no
        FROM ad_users
        WHERE mapping_payload @> '{"userDeptRoleMapping":[{"roleId":[${roleId}] , "unitId" :"${deptId}"}]}'
        AND notification_type::text = ANY (ARRAY['["CNT_EMAIL", "CNT_SMS"]'::text, '["CNT_BOTH"]'::text])
        AND status = 'AC';`
      }
      // const query = `SELECT user_id, user_type, title, first_name, last_name, email, contact_no
      // FROM ad_users
      // WHERE mapping_payload @> '{"userDeptRoleMapping":[{"roleId":[ ${roleId}] , "unitId" :"${deptId}"}]}'
      // and notification_type in ('CNT_EMAIL','CNT_BOTH') and status in ('AC')
      // `
      response = conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      if (response) {
        response = camelCaseConversion(response)
      }
    }
    logger.debug('Successfully fetch users list')
    return response
  } catch (error) {
    logger.error(error, 'Error while fetching users list')
  }
}

const getWorkflowEntity = async (entityId, entity, rest, conn, t) => {
  logger.debug('Fetching workflow target Deparments and Roles', rest)
  const workflowHdr = await conn.WorkflowHdr.findOne({
    where: {
      entityId,
      entity,
      wfStatus: defaultStatus.CREATED
    },
    transaction: t,
    logging: true
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
    transaction: t,
    order: [['wfTxnId', 'DESC']]
  })

  if (workflowTxns.length === 0) {
    return {
      status: 'ERROR',
      message: 'Workflow transaction details not Found'
    }
  }

  if (workflowTxns[0].wfTxnStatus !== defaultStatus.USER_WAIT) {
    return {
      status: 'ERROR',
      message: 'There not Workflow transaction wait for Manual Action'
    }
  }

  logger.debug('Finding target department and roles')

  const workflowDfn = await conn.WorkflowDefinition.findOne({
    where: {
      workflowId: workflowHdr.wfDefnId,
      status: defaultStatus.ACTIVE
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

  const obj = activities.find(e => e?.type === defaultCode.TASK && workflowTxns.length > 0 && e?.activityId === workflowTxns[0]?.activityId)
  if (!obj || !obj?.tasks) {
    return {
      status: 'ERROR',
      message: 'There is no task is assigned in Workflow to perform the action'
    }
  }
  const manualTask = obj.tasks.find(e => (e?.type === defaultCode.MANUAL && workflowTxns.length > 0 && (e.taskId + '') === workflowTxns[0]?.taskId))
  if (!manualTask || !manualTask?.assignments) {
    return {
      status: 'ERROR',
      message: 'There is no manual task is assigned in Workflow to perform the action'
    }
  }
  if (manualTask?.assignments && Array.isArray(manualTask?.assignments) && manualTask?.assignments?.length > 0) {
    let response = {}
    if (rest?.isManagerialAssign) {
      response = manualTask?.assignments?.[0]?.assignedToDeptRoles.filter((f) => f.unitId === rest?.departmentId)
      response = response?.[0] || {}
    } else {
      response = manualTask?.assignments?.[0]?.assignedToDeptRoles?.[0]
    }

    return {
      status: 'SUCCESS',
      message: 'Details Fetched Successfully',
      data: response
    }
  }
  return {
    status: 'ERROR',
    message: 'Details Successfully',
    data: []
  }
}
