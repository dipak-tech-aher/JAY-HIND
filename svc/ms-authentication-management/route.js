import { AuthenticationController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const authenticationRouter = express.Router()
const authenticationController = new AuthenticationController()

authenticationRouter.use([connectionRequest])

authenticationRouter
  .post('/register-via-mobile', authenticationController.registerUserViaMobile.bind(authenticationController))
  .post('/register', authenticationController.registerUser.bind(authenticationController))
  .post('/send-otp', authenticationController.sendOTP.bind(authenticationController))
  .post('/login', authenticationController.login.bind(authenticationController))
  .post('/send-forgot-password', authenticationController.forgotPassword.bind(authenticationController))
  .post('/reset-password', authenticationController.resetPassword.bind(authenticationController))
  .post('/change-password', authenticationController.changePassword.bind(authenticationController))
  .get('/token/:inviteToken', authenticationController.getUserByToken.bind(authenticationController))
  .delete('/logout/:id', authenticationController.logout.bind(authenticationController))
  .put('/session/:id', validateToken, authenticationController.updateUserSession.bind(authenticationController))
  .get('/verify-otp/:reference', authenticationController.validateOTP.bind(authenticationController))
  .post('/refresh-token', authenticationController.getAccessToken.bind(authenticationController))
  .get('/get-session-info', validateToken, authenticationController.getSessionInfo.bind(authenticationController))

module.exports = authenticationRouter
