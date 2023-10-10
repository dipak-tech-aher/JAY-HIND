import { isBefore, isAfter } from 'date-fns'
import { logger, ResponseHelper, CryptoHelper, statusCodeConstants } from '@utils'

const responseHelper = new ResponseHelper()
const cryptoHelper = new CryptoHelper()
const { getConnection } = require('@services/connection-service')

export async function validateToken (req, res, next) {
  try {
    const conn = await getConnection()
    const { authorization } = req.headers
    if (!(authorization)) {
      logger.error('not authorized')
      return responseHelper.sendResponse(req, res, { status: statusCodeConstants.NOT_AUTHORIZED, message: 'Not authorized' })
    }
    let decodedToken
    try {
      decodedToken = cryptoHelper.verifyJWT(authorization)
    } catch (error) {
      logger.error(error, 'JWT Token signature error')
      return responseHelper.sendResponse(req, res, { status: statusCodeConstants.NOT_AUTHORIZED, message: 'Not authorized' })
    }
    const decryptedToken = cryptoHelper.decrypt(decodedToken)
    if (!decryptedToken) {
      return responseHelper.sendResponse(req, res, { status: statusCodeConstants.NOT_AUTHORIZED, message: 'Not authorized' })
    }
    const user = await conn.UserSession.findOne({
      where: { sessionId: decryptedToken.sid }
    })
    if (!user) {
      return responseHelper.sendResponse(req, res, { status: statusCodeConstants.NOT_AUTHORIZED, message: 'Not authorized' })
    }
    // const rawData = {
    //   userId: decryptedToken.id,
    //   sessionId: decryptedToken.sid
    // }
    const date = new Date()
    const currentTime = new Date(date.getTime())
    const expireTime = new Date(decryptedToken.expiresIn)
    const fiveMinutesAgo = new Date(expireTime.getTime() - 5000 * 60)
    if (isAfter(currentTime, expireTime)) {
      // skiping the expireTime for logout
      const originalUrl = req.originalUrl.split('/api/users/')[1]
      if (originalUrl && originalUrl.split('/')[0] === 'logout') {
        next()
      }
      logger.debug('Access Token got expired')
      return responseHelper.sendResponse(req, res, { status: statusCodeConstants.NOT_AUTHORIZED, message: 'Not authorized' })
    } else if ((isBefore(fiveMinutesAgo, expireTime)) && (isAfter(expireTime, fiveMinutesAgo))) {
      // res.refreshToken = cryptoHelper.createAccessToken(rawData)
      logger.debug('Generating New Access Token')
    }
    logger.debug('Successfully verified user')
    req.userId = decryptedToken.id
    req.roleId = user.currRoleId
    req.roleName = user.currRole
    req.department = user.currDept
    req.departmentId = user.currDeptId
    req.permissions = user.permissions
    req.email = user.payload.email
    req.contactNo = user.payload.contactNo
    req.userLocation = user.payload.location

    next()
  } catch (error) {
    logger.error(error, 'Error while validating token')
    return responseHelper.sendResponse(req, res, { status: statusCodeConstants.NOT_AUTHORIZED, message: 'Not authorized' })
  }
}

export async function DTAuthVerification (req, res, next) {
  try {
    const conn = await getConnection()
    const { user, apikey } = req.headers
    if (!(apikey)) {
      logger.error(defaultMessage.NOT_AUTHORIZED)
      return responseHelper.notAuthorized(res, new Error('User not authorized'))
    }
    const tokenDetails = await conn.UserToken.findOne({
      where: { token: apikey, userId: user, status: 'AC' }
    })


    if (!tokenDetails) {
      logger.error(defaultMessage.NOT_AUTHORIZED)
      return responseHelper.notAuthorized(res, new Error(defaultMessage.NOT_AUTHORIZED))
    }

    const userDet = await conn.User.findOne({
      where: { email: user }
    })

    req.userId = userDet.userId  

    next()
  } catch (error) {
    logger.error(error, 'Error while validating token')
    responseHelper.notAuthorized(res, new Error(defaultMessage.NOT_AUTHORIZED))
  }
}

