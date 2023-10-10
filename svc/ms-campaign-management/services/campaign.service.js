import { config } from '@config/env.config'
import em from '@emitters'
import { BusinessUnit, Otp, Role, sequelize, User, UserSession } from '@models'
import userResources from '@resources'
import { CryptoHelper, defaultStatusCode, logger, defaultStatus, defaultCode } from '@utils'
import { get, isEmpty, map } from 'lodash'
import { Op } from 'sequelize'

// import required dependency
const generatePassword = require('generate-password')

const { systemUserId, chatCount, chatRoleId, userLoginAttempts, DomainURL } = config
let instance

class CampaignService {
}
module.exports = CampaignService

