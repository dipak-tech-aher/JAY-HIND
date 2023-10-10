import { ContractController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const contractRoute = express.Router()
const contractController = new ContractController()

contractRoute.use([connectionRequest])

contractRoute
  .post('/unbilled', contractController.getUnbilledContracts.bind(contractController))
  .post('/billed', contractController.getBilledContracts.bind(contractController))
  .post('/history', contractController.getContractHistory.bind(contractController))
  .post('/create', validateToken, contractController.createContract.bind(contractController))
  .put('/:id', validateToken, contractController.updateContract.bind(contractController))
  .put('/detail/:id', validateToken, contractController.updateContractDetail.bind(contractController))
  .put('/unbilled/:id', validateToken, contractController.updateUnbilledContracts.bind(contractController))
  .put('/unbilled/split/:id', validateToken, contractController.updateUnbilledSplitContracts.bind(contractController))
  .post('/usage-calculation', validateToken, contractController.calculateUsage.bind(contractController))
  .get('/count', validateToken, contractController.getMonthlyContractCounts.bind(contractController))
  .get('/re-generate', validateToken, contractController.getReGenerateContracts.bind(contractController))
  .get('/generate-unbilled-contract', validateToken, contractController.generateMonthlyUnBilledContract.bind(contractController))
  .get('/generate-scheduled-contracts', contractController.generateScheduledMonthlyContracts.bind(contractController))
  .get('/get-scheduled-contracts/:customerUuid', validateToken, contractController.getCustomerScheduledMonthlyContracts.bind(contractController))
  .get('/get-scheduled-contracts', validateToken, contractController.getCustomerScheduledMonthlyContracts.bind(contractController))
  .get('/get-contracts-by-service', validateToken, contractController.getCustomerContractsByService.bind(contractController))
  .get('/contract-job/:state', contractController.contractJob.bind(contractController))

  .post('/search', contractController.searchContracts.bind(contractController))
  .put('/monthly/:id', contractController.updateMonthlyContract.bind(contractController))
  .put('/detail/monthly/:id', contractController.updateMonthlyContractDetail.bind(contractController))

module.exports = contractRoute
