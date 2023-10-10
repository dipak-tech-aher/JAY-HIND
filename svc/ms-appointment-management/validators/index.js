const Joi = require('joi')

export const createOrUpdateAptHdrValidator = Joi.object({
  body: Joi.array()
    .items({
      appointId: Joi.number().label('Appointment id'),
      appointName: Joi.string().required().label('Appointment name'),
      status: Joi.string().required().label('Status'),
      templateId: Joi.number().required().label('Template'),
      appointType: Joi.date().required().valid('CREATION', 'PROVISIONING').label('Appointment type'),
      userGroup: Joi.string().required().valid('CONSUMER', 'BUSINESS').label('User group'),
      notifyId: Joi.number().label('Notification')
    })
})

export const createOrUpdateAptDtlValidator = Joi.object({
  body: Joi.array()
    .items({
      appointDtlId: Joi.number().label('Appointment detail id'),
      appointId: Joi.string().required().label('Appointment'),
      status: Joi.string().required().label('Status'),
      appointMode: Joi.number().required().label('Appointment mode'),
      calenderId: Joi.date().required().valid('CREATION', 'PROVISIONING').label('Calender'),
      shiftId: Joi.string().required().valid('CONSUMER', 'BUSINESS').label('Shift'),
      appointDate: Joi.number().label('Appointment date'),
      workType: Joi.number().label('Work type'),
      appointInterval: Joi.number().label('Appointment interval'),
      appointAgents_availability: Joi.number().label('Agents availability'),
      appointStartTime: Joi.number().label('Appointment start time'),
      appointEndTime: Joi.number().label('Appointment end time')
    })
})

// appointAgentsAvailability: Joi.number().required().label("Agents availability"),
// appointStartTime: Joi.string().regex(/^([0-9]{2})\:([0-9]{2})$/).required().label("Start time"),
// appointEndTime: Joi.string().regex(/^([0-9]{2})\:([0-9]{2})$/).required().label("End time")
