import { constantCode, defaultMessage, statusCodeConstants, defaultCode, logger, camelCaseConversion } from '@utils'
const SpellCorrector = require('spelling-corrector');
const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();
import { QueryTypes } from 'sequelize'

let instance
export default class CustomerEngagementdashboardService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async getCounts(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let query = `select * from bcae_ce_growth_fn('${payload.type}', null, null)`

      if (payload?.searchParams?.startDate && payload?.searchParams?.startDate !== '' && payload?.searchParams?.startDate !== undefined && payload?.searchParams?.endDate && payload?.searchParams?.endDate !== '' && payload?.searchParams?.endDate !== undefined) {
        query = `select * from select bcae_ce_growth_fn('${payload.type}', '${payload?.searchParams.startDate}', '${payload?.searchParams.endDate}')`
      }
      console.log('query----getcounts---->', query)
      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        logging: true
      });
      response = camelCaseConversion(response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Data',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getCountsData(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let query = `select * from bcae_ce_growth_data_fn('${payload?.type}', null, null)`

      if (payload?.searchParams?.startDate && payload?.searchParams?.startDate !== '' && payload?.searchParams?.startDate !== undefined && payload?.searchParams?.endDate && payload?.searchParams?.endDate !== '' && payload?.searchParams?.endDate !== undefined) {
        query = `select * from select bcae_ce_growth_data_fn('${payload.type}', '${payload?.searchParams.startDate}', '${payload?.searchParams.endDate}')`
      }
      console.log('query----getcounts--data-->', query)
      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        logging: true
      });
      response = camelCaseConversion(response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Data',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getRecentCustomers(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let query = `select 
      customer_photo ,
      cc.customer_name ,
      cc.customer_catgory as customer_category,
      cc.email 
      from 	bcae_customer_dtl_vw cc 
      `
      let whereClause = `where 	cc.customer_created_date::date = current_date
      and 	customer_status in ('Active','Pending','Temporary','Prospect') `

      if (payload?.searchParams?.startDate && payload?.searchParams?.startDate !== '' && payload?.searchParams?.startDate !== undefined) {
        whereClause = whereClause + 'AND CAST(cc.created_at as DATE) >=\'' + payload?.searchParams?.startDate + '\' AND '
      }
      if (payload?.searchParams?.endDate && payload?.searchParams?.endDate !== '' && payload?.searchParams?.endDate !== undefined) {
        whereClause = whereClause + ' CAST(cc.created_at as DATE) <= \'' + payload?.searchParams?.endDate + '\' '
      }

      console.log('query + whereClause-------->', query + whereClause)

      const response = await conn.sequelize.query(query + whereClause, {
        type: QueryTypes.SELECT,
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Recent Customers',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async topPerformingProducts(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let query = `select
      total_cnt,
      prod_desc
    from
      (
      select
        count(*) total_cnt,
        prod_desc(product_id) as prod_desc,
        product_id
      from
        order_dtl od
      group by
        product_id 
    )sub
    `
      const tail = ` order by total_cnt desc limit 5`;

      let whereClause = ` `

      if (payload?.searchParams?.startDate && payload?.searchParams?.startDate !== '' && payload?.searchParams?.startDate !== undefined) {
        whereClause = whereClause + 'AND CAST(od.created_at as DATE) >=\'' + payload?.searchParams?.startDate + '\' AND '
      }
      if (payload?.searchParams?.endDate && payload?.searchParams?.endDate !== '' && payload?.searchParams?.endDate !== undefined) {
        whereClause = whereClause + ' CAST(od.created_at as DATE) <= \'' + payload?.searchParams?.endDate + '\' '
      }

      console.log('query + Top performing products customer engagement dashboard-------->', query + whereClause)

      const response = await conn.sequelize.query(query + whereClause + tail, {
        type: QueryTypes.SELECT,
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Top Performing Products',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async topChannelByGrevience(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let query = `select
      total_cnt,
      channel_desc
    from
      (
      select
        count(*) total_cnt,
        be_desc(i.intxn_channel) channel_desc
      from
        interaction i
      where
        intxn_type = 'GRIEVANCE'
      group by
        i.intxn_channel
    )sub `
      const tail = `  order by total_cnt desc limit 5`;

      let whereClause = ` `

      if (payload?.searchParams?.startDate && payload?.searchParams?.startDate !== '' && payload?.searchParams?.startDate !== undefined) {
        whereClause = whereClause + 'AND CAST(i.created_at as DATE) >=\'' + payload?.searchParams?.startDate + '\' AND '
      }
      if (payload?.searchParams?.endDate && payload?.searchParams?.endDate !== '' && payload?.searchParams?.endDate !== undefined) {
        whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + payload?.searchParams?.endDate + '\' '
      }

      console.log('query + Top performing products customer engagement dashboard-------->', query + whereClause)

      const response = await conn.sequelize.query(query + whereClause + tail, {
        type: QueryTypes.SELECT,
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Channel Greviences',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async topCustomerIssues(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let query = `select 
      sub.total_cnt,
      sub.request_statement
      from 
      (
      select  count(*) total_cnt,
            i.request_statement  
      from    interaction i 
      where i.intxn_type not in ('RECOMMENDATION','INTEREST','REQUEST','SUGGESTION','PURCHASE')
      group by i.request_statement
      )sub `
      const tail = ` order by total_cnt desc limit 10`;

      let whereClause = ` `

      if (payload?.searchParams?.startDate && payload?.searchParams?.startDate !== '' && payload?.searchParams?.startDate !== undefined) {
        whereClause = whereClause + 'AND CAST(i.created_at as DATE) >=\'' + payload?.searchParams?.startDate + '\' AND '
      }
      if (payload?.searchParams?.endDate && payload?.searchParams?.endDate !== '' && payload?.searchParams?.endDate !== undefined) {
        whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + payload?.searchParams?.endDate + '\' '
      }

      console.log('query + Top performing products customer engagement dashboard-------->', query + whereClause)

      const response = await conn.sequelize.query(query + whereClause + tail, {
        type: QueryTypes.SELECT,
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Top Customer issues',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async InteractionsByChannel(payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let query = `SELECT COUNT(*) AS count, BE_DESC(i.intxn_channel) AS channel
FROM interaction i
`
      const tail = ` GROUP BY i.intxn_channel`;

      let whereClause = `WHERE 1=1 `

      if (payload?.searchParams?.startDate && payload?.searchParams?.startDate !== '' && payload?.searchParams?.startDate !== undefined) {
        whereClause = whereClause + 'AND CAST(i.created_at as DATE) >=\'' + payload?.searchParams?.startDate + '\' AND '
      }
      if (payload?.searchParams?.endDate && payload?.searchParams?.endDate !== '' && payload?.searchParams?.endDate !== undefined) {
        whereClause = whereClause + ' CAST(i.created_at as DATE) <= \'' + payload?.searchParams?.endDate + '\' '
      }

      console.log('query get channels engagement dashboard-------->', query + whereClause)

      const response = await conn.sequelize.query(query + whereClause + tail, {
        type: QueryTypes.SELECT,
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Interactions Created by channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

}