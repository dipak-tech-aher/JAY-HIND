import { OrganizationController } from '@controllers/organization.controller'
import { RoleController } from '@controllers/role.controller'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator';
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const organizationRouter = express.Router()
const roleRouter = express.Router()

const organizationController = new OrganizationController()
const roleController = new RoleController()

roleRouter.use([connectionRequest, validateToken])
organizationRouter.use([connectionRequest, validateToken])

organizationRouter
  .post('/create', organizationController.createOrganization.bind(organizationController))
  .put('/update/:id', organizationController.updateOrganization.bind(organizationController))
  .get('/search/:id?', organizationController.getOrganization.bind(organizationController))

roleRouter
  .get('/', roleController.getRoles.bind(roleController))
  .get('/role-family', roleController.getRoleFamily.bind(roleController))
  .post('/create', roleController.createRole.bind(roleController))
  .put('/update/:id', roleController.updateRole.bind(roleController))
  .get('/search/:id?', roleController.getRole.bind(roleController))
  .post('/verify', roleController.verifyRoles.bind(roleController))
  .post('/bulk', roleController.bulkUploadRoles.bind(roleController))
  .get('/modules', roleController.getModuleScreens.bind(roleController))
module.exports = { organizationRouter, roleRouter }
