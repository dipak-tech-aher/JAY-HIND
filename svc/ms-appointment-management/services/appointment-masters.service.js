import { CryptoHelper, constantCode, defaultMessage, statusCodeConstants, defaultCode } from '@utils'
import { addressFields, customerFields, contactFields } from '@utils/constant'
import { config } from '@config/env.config'
import { compareRecords, transformRecord } from '@resources'
import { Op } from 'sequelize'
const { v4: uuidv4 } = require('uuid')
const moment = require('moment');

const { systemUserId, systemRoleId, roleProperties } = config

let instance
class AppointmentMastersService {
  constructor() {
    if (!instance) {
      instance = this
    }
    instance.cryptoHelper = new CryptoHelper()
    return instance
  }

  async createSlots(payload, userId, conn) {

  }
}

module.exports = AppointmentMastersService
