import { defaultCode } from '@utils'
const Joi = require('joi')

export const createCatalogValidator = Joi.object({
  catalogName: Joi.string().required(),
  serviceType: Joi.string().required(),
  customerType: Joi.array().required(),
  startDate: Joi.date().greater('now').required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).allow(null, ''),
  status: Joi.string().required(),
  plan: Joi.array().items({
    planId: Joi.number().required(),
    catalogPlanId: Joi.string().allow(null, ''),
    status: Joi.string().required(),
    mandatory: Joi.string().valid(defaultCode.YES, defaultCode.NO).required()
  }),
  service: Joi.array().items(
    {
      serviceId: Joi.number().required(),
      catalogServiceId: Joi.string().allow(null, ''),
      status: Joi.string().required(),
      mandatory: Joi.string().valid(defaultCode.YES, defaultCode.NO).required()
    }),
  addon: Joi.array().items(
    {
      addonId: Joi.number().required(),
      catalogAddonId: Joi.string().allow(null, ''),
      status: Joi.string().required(),
      mandatory: Joi.string().valid(defaultCode.YES, defaultCode.NO).required()
    }),
  asset: Joi.array().items(
    {
      assetId: Joi.number().required(),
      catalogAssetId: Joi.string().allow(null, ''),
      status: Joi.string().required(),
      mandatory: Joi.string().valid(defaultCode.YES, defaultCode.NO).required()
    })
})

export const updateCatalogItemValidator = Joi.object({
  catalogName: Joi.string().required(),
  serviceType: Joi.string().required(),
  customerType: Joi.array().required(),
  startDate: Joi.date().required().greater('now'),
  endDate: Joi.date().greater(Joi.ref('startDate')).allow(null, ''),
  status: Joi.string().required(),
  plan: Joi.array().items({
    catalogPlanId: Joi.number().allow(null, ''),
    catalogId: Joi.number.when('catalogPlanId', { is: Joi.exist(), then: Joi.number().positive().required(), otherwise: Joi.allow(null, '') }),
    planId: Joi.number().positive().required(),
    mandatory: Joi.string().valid(defaultCode.YES, defaultCode.NO).required(),
    status: Joi.string().required(),
    remarks: Joi.string().allow(null, ''),
    planDetails: Joi.array().items({
      planName: Joi.string().required()
    }).when('catalogPlanId', { is: Joi.exist(), then: Joi.positive().required() }),
    totalNrc: Joi.number().when('catalogPlanId', { is: Joi.exist(), then: Joi.positive().required(), otherwise: Joi.allow(null, '') }),
    totalRc: Joi.number().when('catalogPlanId', { is: Joi.exist(), then: Joi.positive().required(), otherwise: Joi.allow(null, '') })
  }),
  service: Joi.array().items({
    catalogServiceId: Joi.number().allow(null, ''),
    catalogId: Joi.number().when('catalogServiceId', { is: Joi.exist(), then: Joi.positive().required(), otherwise: Joi.allow(null, '') }),
    serviceId: Joi.number().positive().required(),
    mandatory: Joi.string().valid(defaultCode.YES, defaultCode.NO).required(),
    status: Joi.string().required(),
    remarks: Joi.string().allow(null, ''),
    serviceDetails: Joi.array().items({
      serviceName: Joi.string().required()
    }),
    totalNrc: Joi.number().when('catalogServiceId', { is: Joi.exist(), then: Joi.positive().required(), otherwise: Joi.allow(null, '') }),
    totalRc: Joi.number().when('catalogServiceId', { is: Joi.exist(), then: Joi.positive().required(), otherwise: Joi.allow(null, '') })
  }),
  addon: Joi.array().items({
    catalogAddonId: Joi.number().allow(null, ''),
    catalogId: Joi.number().positive().when('catalogAddonId', { is: Joi.exist(), then: Joi.positive().required(), otherwise: Joi.allow(null, '') }),
    addonId: Joi.number().positive().required(),
    mandatory: Joi.string().valid(defaultCode.YES, defaultCode.NO).required(),
    status: Joi.string().required(),
    remarks: Joi.string().allow(null, ''),
    addonCharge: Joi.array().items({
      chargeAmount: Joi.number().positive().required(),
      chargeDetails: Joi.object({
        chargeCat: Joi.string().required()
      }).required()
    }).when('catalogAddonId', { is: Joi.exist(), then: Joi.positive().required() }),
    addonDetails: Joi.array().items({
      addonName: Joi.string().required()
    }).when('catalogAddonId', { is: Joi.exist(), then: Joi.positive().required() })
  }),
  asset: Joi.array().items({
    catalogAssetId: Joi.number().allow(null, ''),
    catalogId: Joi.number().positive().when('catalogAssetId', { is: Joi.exist(), then: Joi.positive().required(), otherwise: Joi.allow(null, '') }),
    assetId: Joi.number().positive().required(),
    mandatory: Joi.number().valid(defaultCode.YES, defaultCode.NO).required(),
    status: Joi.string().required(),
    remarks: Joi.string().required(),
    assetDetails: Joi.array().items({ assetName: Joi.string().required() }).when('catalogAssetId', { is: Joi.exist(), then: Joi.positive().required(), otherwise: Joi.allow(null, '') }),
    totalNrc: Joi.number().when('catalogAssetId', { is: Joi.exist(), then: Joi.positive().required(), otherwise: Joi.allow(null, '') }),
    totalRc: Joi.number().when('catalogAssetId', { is: Joi.exist(), then: Joi.positive().required(), otherwise: Joi.allow(null, '') })
  })
})

export const getCatalogValidator = Joi.object({
  id: Joi.number().required(),
  history: Joi.boolean().required()
})

export const catalogByServiceTypeValidator = Joi.object({
  type: Joi.string().required(),
  pending: Joi.boolean().default(false),
  pendingId: Joi.number().when('pending', { is: true, then: Joi.required(), otherwise: Joi.allow(null, '') })
})

export const getCatalogByNameValidator = Joi.object({
  history: Joi.boolean().default(false),
  limit: Joi.number().default(defaultCode.lIMIT).required(),
  page: Joi.number().default(defaultCode.PAGE).required(),
  excel: Joi.boolean().default(false),
  name: Joi.string().allow(null, ''),
  filters: Joi.array().items({
    value: Joi.string().required(),
    id: Joi.string().required()
  }).allow(null, [], '')
})
