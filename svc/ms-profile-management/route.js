import { ProfilController } from '@controllers'
import { validateToken } from '@middlewares/authentication-helper'
// import { validatePermission } from '@middlewares/permission-validator'
import express from 'express'
const { connectionRequest } = require('@middlewares/db-connection')

const profileRoute = express.Router()
const profilController = new ProfilController()

profileRoute.use([connectionRequest, validateToken])

profileRoute
  .post('/create', profilController.createProfile.bind(profilController))
  .put('/update', profilController.updateProfile.bind(profilController))
  .post('/search', profilController.searchProfile.bind(profilController))
  .get('/CentralMasterPatientProfile', profilController.temp_centralMasterProfile.bind(profilController))
  .get('/PatientProfile', profilController.temp_patientProfile.bind(profilController))
  .get('/VisitHistory', profilController.temp_patientVisitHistory.bind(profilController))
  .get('/PatientBilling', profilController.temp_patientBill.bind(profilController))
  .get('/DrProfile', profilController.temp_drProfile.bind(profilController))
  .get('/HospitalProfile', profilController.temp_hospitalProfile.bind(profilController))
  .get('/LabTestHistory', profilController.temp_LabReport.bind(profilController))
  .get('/DiagnosticImagingResultReport', profilController.temp_ImagingResultReport.bind(profilController))

module.exports = profileRoute
