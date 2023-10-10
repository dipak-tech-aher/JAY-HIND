import { UserController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'

const { connectionRequest } = require('@middlewares/db-connection')
const userRouter = express.Router()
const userController = new UserController()

userRouter.use([connectionRequest, validateToken])

userRouter
  .post('/create', userController.createUser.bind(userController))
  .put('/approve', userController.approveNewUser.bind(userController))
  .get('/switch-user', userController.getUserDepartmentAndRoles.bind(userController))
  .get('/get-my-team-members', userController.getMyTeamMembers.bind(userController))
  .put('/update/:id', userController.updateUser.bind(userController))
  .put('/update-status/:id', userController.updateUserStatus.bind(userController))
  .post('/search', userController.getUserList.bind(userController))
  .get('/search/:userId', userController.getUser.bind(userController))
  .post('/verify', userController.verifyUsers.bind(userController))
  .post('/verify-email', userController.verifyEmails.bind(userController))
  .get('/by-role', userController.getUsersRoleId.bind(userController))
  .get('/get-managerlist', userController.getManagerList.bind(userController))
  .get('/get-skills-list', userController.getSkillsList.bind(userController))
  .get('/roles-departments', userController.getRolesAndDepartments.bind(userController))
module.exports = userRouter
