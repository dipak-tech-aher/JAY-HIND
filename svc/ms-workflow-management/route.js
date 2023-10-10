import { WorkflowController } from '@controllers/workflow.controller'

import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'

const { connectionRequest } = require('@middlewares/db-connection')
const workflowRoute = express.Router()
const workflowController = new WorkflowController()

workflowRoute.use([connectionRequest])
// validatePermission, validateToken

workflowRoute
  .post('/create', validateToken, workflowController.createWorkflow.bind(workflowController))
  .put('/update/:workflowId', validateToken, workflowController.updateWorkflow.bind(workflowController))
  .get('/get-workflow/:workflowId', validateToken, workflowController.getWorkflow.bind(workflowController))
  .get('/get-workflow-list', validateToken, workflowController.getWorkflowList.bind(workflowController))
  .delete('/delete/:workflowId', workflowController.deleteWorkflow.bind(workflowController))

  .post('/workflow-mapping-list', validateToken, workflowController.unMappedWorkflowList.bind(workflowController))
  .post('/create-workflow-mapping', validateToken, workflowController.createWorkflowMapping.bind(workflowController))
  .post('/mapped-workflow-list', validateToken, workflowController.listMappedWorkflow.bind(workflowController))
  .put('/update/mapped-workflow/:mappingId', validateToken, workflowController.updatedMappedWorkflow.bind(workflowController))

  // validateToken, 
  .get('/get-status', workflowController.getWorkflowState.bind(workflowController))
  .get('/db-schema-info', validateToken, workflowController.getDBSchemaInfo.bind(workflowController))
  .get('/org-hierarchy-roles', validateToken, workflowController.getOrgHierarchyWithRoles.bind(workflowController))

  .post('/resolution', validateToken, workflowController.getResolution.bind(workflowController))
  .post('/resolution-chat', workflowController.getResolutionChat.bind(workflowController))

  .put('/update-conversation/:conversationUid', validateToken, workflowController.updateResolution.bind(workflowController))
  .post('/get-last-conversation', workflowController.getLastConversationAction.bind(workflowController))
  .post('/add-conversation', workflowController.addConversation.bind(workflowController))
  .post('/task-list', workflowController.getTaskList.bind(workflowController))
  .get('/task-details', workflowController.getTaskDetails.bind(workflowController))
module.exports = { workflowRoute }
