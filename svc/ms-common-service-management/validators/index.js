const Joi = require('joi')

export const downloadFileValidator = Joi.object({
  uid: Joi.string().guid({ version: 'uuidv4' }).required()
})
