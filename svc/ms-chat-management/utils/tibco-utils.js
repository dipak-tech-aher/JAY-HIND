import { config } from '@config/env.config'
import { logger } from '../config/logger'
import { tibco } from 'config'
const got = require('got')
const { tibco } = config

export const getCustomerDetails = async (accessNbr, serviceType, trackingId) => {
    try {
      logger.debug('Fetching Customer And Account Number for : ', accessNbr)
      let response = {}
      let identifier
      if (serviceType === 'Prepaid' || serviceType === 'Postpaid' || serviceType === 'PREPAID' || serviceType === 'POSTPAID') {
        identifier = 'MOBILE'
      } else if (serviceType === 'Fixed' || serviceType === 'FIXED' || serviceType === 'FIXEDLINE') {
        identifier = 'FIXEDLINE'
      }
  
      const reqBody = {
        accessNumber: accessNbr,
        identifier: identifier,
        trackingId: trackingId
      }
      const realtimeResponse = await got.put({
        headers: { Authorization: 'Basic ' + Buffer.from(tibco.username + ':' + tibco.passwd).toString('base64') },
        url: tibco.customerAPIEndPoint + tibco.customerSummaryAPI,
        body: JSON.stringify(reqBody),
        retry: 0
      })
      // console.log('realtimeResponse::::::',realtimeResponse.body)
      const parsedRealtimeData = JSON.parse(realtimeResponse.body)
      if (identifier === 'MOBILE') {
        response = customerDetailsTransformer.evaluate(parsedRealtimeData)
      } else if (identifier === 'FIXEDLINE') {
        response = fixedLineChatDetailsTransformer.evaluate(parsedRealtimeData)
      }
  
      // console.log('response::::::',response)
  
      logger.debug('Fetched service summary for Access Nbr : ', accessNbr)
      return response
    } catch (error) {
      logger.error(error, 'Error while fetching Customer Nbr and Account Nbr from TIBCO')
      return {}
    }
  }