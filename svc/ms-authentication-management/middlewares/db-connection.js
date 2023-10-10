const Joi = require('joi')
const { getNamespace, createNamespace } = require('continuation-local-storage')
const { getTenantConnection } = require('@services/connection-service')

const tenantNamespace = getNamespace('tenants')
const namespace = tenantNamespace ? tenantNamespace : createNamespace('tenants')

const connectionRequest = (req, res, next) => {
  const schema = Joi.object({
    tenantId: Joi.string().guid({ version: 'uuidv4' }).required()
  })

  const tenantId = req.headers['x-tenant-id']

  console.log({ tenantId })

  const { error } = schema.validate({ tenantId })

  if (error) {
    return res.json({ success: false, message: error.message.replace(/["]/g, '') })
  }

  namespace.run(() => {
    namespace.set('connection', getTenantConnection(tenantId))
    next()
  })
}

module.exports = { connectionRequest }
