// import jwtDecode from 'jwt-decode'
import { isBefore, isAfter } from 'date-fns'
import { ResponseHelper, CryptoHelper, defaultMessage, logger } from '@utils'
import { BillingSession } from '@models'

const responseHelper = new ResponseHelper()
const cryptoHelper = new CryptoHelper()

export async function validateToken (req, res, next) {
  try {
    const { authorization } = req.headers
    if (!(authorization)) {
      logger.error(defaultMessage.NOT_AUTHORIZED)
      return responseHelper.notAuthorized(res, new Error('Your session has expired. Please try again'))
    }
    let decodedToken
    try {
      decodedToken = cryptoHelper.verifyJWT(authorization)
    } catch (error) {
      logger.error(error, 'JWT Token signature error')
      return responseHelper.notAuthorized(res, new Error(defaultMessage.NOT_AUTHORIZED))
    }
    const decryptedToken = cryptoHelper.decrypt(decodedToken)
    if (!decryptedToken) {
      logger.error(defaultMessage.NOT_AUTHORIZED)
      return responseHelper.notAuthorized(res, new Error(defaultMessage.NOT_AUTHORIZED))
    }
    const user = await BillingSession.findOne({
      where: { sessionId: decryptedToken.sid, userId: decryptedToken.id }
    })
    if (!user) {
      logger.error(defaultMessage.NOT_AUTHORIZED)
      return responseHelper.notAuthorized(res, new Error(defaultMessage.NOT_AUTHORIZED))
    }

    const date = new Date()
    const currentTime = new Date(date.getTime())
    const expireTime = new Date(decryptedToken.expiresIn)
    const fiveMinutesAgo = new Date(expireTime.getTime() - 5000 * 60)
    if (isAfter(currentTime, expireTime)) {
      // skiping the expireTime for logout
      const originalUrl = req.originalUrl.split('/api/billing/')[1]
      if (originalUrl && originalUrl.split('/')[0] === 'logout') {
        next()
      }
      logger.debug('Access Token got expired')
      return responseHelper.notAuthorized(res, new Error('Your session has expired. Please try again'))
    } else if ((isBefore(fiveMinutesAgo, expireTime)) && (isAfter(expireTime, fiveMinutesAgo))) {
      // res.refreshToken = cryptoHelper.createAccessToken(rawData)
      logger.debug('Generating New Access Token')
    }
    logger.debug('Successfully verified user')
    // req.userId = decryptedToken.id
    // req.roleId = user.currRoleId
    // req.roleName = user.currRole
    // req.department = user.currDept
    // req.departmentId = user.currDeptId
    // req.permissions = user.permissions
    // req.email = user.payload.email
    // req.contactNo = user.payload.contactNo
    // req.userLocation = user.payload.location

    next()
  } catch (error) {
    logger.error(error, 'Error while validating token')
    responseHelper.notAuthorized(res, new Error(defaultMessage.NOT_AUTHORIZED))
  }
}
