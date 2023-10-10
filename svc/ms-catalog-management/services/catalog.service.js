/* eslint-disable array-callback-return */
import { sequelize } from '@models'
import { defaultCode, defaultStatus, statusCodeConstants, defaultMessage, logger } from '@utils'
import { isEmpty } from 'lodash'
import { Op } from 'sequelize'
const { getConnection } = require('@services/connection-service')
let instance

class CatalogService {
  constructor () {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async createCatalog (catalog) {
    const t = await sequelize.transaction()
    try {
      logger.info('Creating new Catalog')
      const conn = await getConnection()
      const { userId } = catalog
      logger.info('Checking duplicate name')
      const checkName = await conn.Catalog.findAll({
        where: { catalogName: sequelize.where(sequelize.fn('LOWER', sequelize.col('catalog_name')), '=', catalog.catalogName.toLowerCase()) }
      })
      if (!isEmpty(checkName)) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Catalog name already exist'
        }
      }
      logger.debug('Attempting to Creating catalog')
      const newCatalog = {
        catalogName: catalog.catalogName,
        status: defaultCode.NEW,
        serviceType: catalog.serviceType,
        startDate: catalog.startDate,
        endDate: catalog.endDate ? catalog.endDate : null,
        customerType: { customerType: catalog.customerType },
        createdBy: userId,
        updatedBy: userId
      }
      const catalogResponse = await conn.Catalog.create(newCatalog, { transaction: t })
      if (!catalogResponse.catalogId) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Error while creating Catalog'
        }
      }
      // CREATING PLAN MAPPING OF CATALOG
      logger.debug('Creating plan mapping of catalog')
      if (!catalog?.plan[0]?.planId) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Plan id not found'
        }
      }
      const newPlan = {
        catalogId: catalogResponse.catalogId,
        planId: catalog.plan[0].planId,
        mandatory: defaultCode.YES,
        status: defaultCode.ACTIVE,
        createdBy: userId,
        updatedBy: userId
      }
      const planResponse = await conn.CatalogPlanMap.create(newPlan, { transaction: t })
      if (!planResponse) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Error while creating plan mapping'
        }
      }

      // CREATING SERVICE MAPPING OF CATALOG
      const allResponseServices = []
      if (catalog?.service) {
        logger.debug('Creating service mapping of catalog')
        for (const s of catalog.service) {
          if (!s.serviceId) {
            return {
              status: statusCodeConstants.NOT_FOUND,
              message: 'service id not found'
            }
          }
          const newService = {
            catalogId: catalogResponse.catalogId,
            serviceId: s.serviceId,
            mandatory: s.mandatory,
            status: defaultCode.ACTIVE,
            createdBy: userId,
            updatedBy: userId
          }
          const serviceResponse = await conn.CatalogServiceMap.create(newService, { transaction: t })
          if (!serviceResponse) {
            return {
              status: statusCodeConstants.ERROR,
              message: 'Error while creating service mapping'
            }
          }
          allResponseServices.push(serviceResponse)
        }
      }
      // CREATING ADDON MAPPING OF CATALOG
      const allResponseAddons = []
      if (catalog.addon) {
        logger.debug('Creating addon mapping of catalog')
        for (const a of catalog.addon) {
          if (!a.addonId) {
            return {
              status: statusCodeConstants.NOT_FOUND,
              message: 'addon id not found'
            }
          }
          const newAddon = {
            catalogId: catalogResponse.catalogId,
            addonId: a.addonId,
            mandatory: a.mandatory,
            status: defaultCode.ACTIVE,
            createdBy: userId,
            updatedBy: userId
          }
          const addonResponse = await conn.CatalogAddonMap.create(newAddon, { transaction: t })
          if (!addonResponse) {
            return {
              status: statusCodeConstants.ERROR,
              message: 'Error while creating addon'
            }
          }
          allResponseAddons.push(addonResponse)
        }
      }
      // CREATING ASSET MAPPING OF CATALOG
      const allResponseAsset = []
      if (catalog.asset) {
        logger.debug('Creating asset mapping')
        for (const a of catalog.asset) {
          if (!a.assetId) {
            return {
              status: statusCodeConstants.ERROR,
              message: 'assest id not found'
            }
          }
          const newAsset = {
            catalogId: catalogResponse.catalogId,
            assetId: a.assetId,
            mandatory: a.mandatory,
            status: defaultCode.ACTIVE,
            createdBy: userId,
            updatedBy: userId
          }
          const assetResponse = await conn.CatalogAssetMap.create(newAsset, { transaction: t })
          if (!assetResponse) {
            return {
              status: statusCodeConstants.ERROR,
              message: 'Error while creating assest'
            }
          }

          allResponseAsset.push(assetResponse)
        }
      }

      // FINAL RESPONSE OBJECT
      const response = {
        catalog: catalogResponse,
        plan: planResponse,
        services: allResponseServices,
        addons: allResponseAddons,
        asset: allResponseAsset
      }
      await t.commit()
      return { status: statusCodeConstants.SUCCESS, message: 'Catalog created successfully', data: response }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) { await t.rollback() }
    }
  }

  async updateCatalog (catalog) {
    const t = await sequelize.transaction()
    try {
      const conn = await getConnection()
      logger.debug('Update catalog data')
      const { id, userId } = catalog
      if (!catalog && !id) {
        return new Error(defaultMessage.MANDATORY_FIELDS_MISSING, { cause: { code: statusCodeConstants.NOT_FOUND } })
      }
      logger.debug(' attempting to update catalog')
      const catalogInfo = await conn.Catalog.findOne({ where: { catalogId: id } })
      if (!catalogInfo) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Catalog not found'
        }
      }
      logger.info('Checking duplicate name')
      if (catalog.catalogName.toLowerCase() !== catalogInfo.catalogName.toLowerCase()) {
        const checkName = await conn.Catalog.findAll({
          where: { catalogName: sequelize.where(sequelize.fn('LOWER', sequelize.col('catalog_name')), '=', catalog.catalogName.toLowerCase()) }
        })
        if (!isEmpty(checkName)) {
          logger.info('Catalog name already exist')
          return {
            status: statusCodeConstants.CONFLICT,
            message: 'Catalog name already exist'
          }
        }
      }
      const updateCatalog = {
        catalogName: catalog?.catalogName || catalogInfo?.catalogName,
        status: catalog?.status || catalogInfo?.status,
        endDate: catalog?.endDate || catalogInfo?.endDate,
        customerType: { customerType: catalog?.customerType || catalogInfo?.customerType },
        updatedBy: userId
      }
      const catalogResponse = await conn.Catalog.update(updateCatalog, { where: { catalogId: id }, transaction: t })
      if (!catalogResponse) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Error while updating Catalog'
        }
      }

      // UPDATING/ADDING PLAN MAPPING OF CATALOG
      logger.debug('Creating plan mapping of catalog')
      if (catalog?.plan) {
        logger.debug('Into plan section')
        for (const p of catalog.plan) {
          if (p.catalogPlanId) {
            logger.debug('Finding existing plan record')
            const planInfo = await conn.CatalogPlanMap.findOne({ where: { catalogPlanId: p.catalogPlanId } })
            if (!planInfo) {
              return {
                status: statusCodeConstants.NOT_FOUND,
                message: 'Plan not found'
              }
            }

            logger.debug('Updating exsiting plan record')
            const updatePlan = {
              mandatory: defaultCode.YES,
              status: p.status || defaultCode.ACTIVE,
              updatedBy: userId
            }
            const planResponse = await conn.CatalogPlanMap.update(updatePlan, { where: { catalogPlanId: p.catalogPlanId }, transaction: t })
            if (!planResponse) {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Error while updating plan mapping'
              }
            }
          } else if (!p.catalogPlanId) {
            logger.debug('Found new plan to be added')
            if (!p.planId) {
              return {
                status: statusCodeConstants.NOT_FOUND,
                message: 'Plan id not found'
              }
            }
            logger.debug(`Adding new plan to existing catalog ${id}`)
            const newPlan = {
              catalogId: id,
              planId: p.planId,
              mandatory: defaultCode.YES,
              status: defaultCode.ACTIVE,
              createdBy: userId,
              updatedBy: userId
            }
            const planResponse = await conn.CatalogPlanMap.create(newPlan, { transaction: t })
            if (!planResponse) {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Error while creating plan mapping'
              }
            }
          }
        }
      }

      // UPDATING/ADDING SERVICE MAPPING OF CATALOG
      if (catalog?.service) {
        logger.debug('Into service mapping of catalog')
        for (const s of catalog.service) {
          if (s.catalogServiceId) {
            const updateService = {
              mandatory: s.mandatory,
              status: s.status || defaultCode.ACTIVE,
              updatedBy: userId
            }
            const serviceResponse = await conn.CatalogServiceMap.update(updateService, { where: { catalogServiceId: s.catalogServiceId }, transaction: t })
            if (!serviceResponse) {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Error while updating service mapping'
              }
            }
          } else if (!s.catalogServiceId) {
            logger.debug('Adding asset mapping')
            if (!s.serviceId) {
              return {
                status: statusCodeConstants.NOT_FOUND,
                message: 'service id not found'
              }
            }
            const newService = {
              catalogId: id,
              serviceId: s.serviceId,
              mandatory: s.mandatory,
              status: defaultCode.ACTIVE,
              createdBy: userId,
              updatedBy: userId
            }
            const serviceResponse = await conn.CatalogServiceMap.create(newService, { transaction: t })
            if (!serviceResponse) {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Error while adding service mapping'
              }
            }
          }
        }
      }
      // UPDATING/ADDING ADDON MAPPING OF CATALOG
      if (catalog.addon) {
        logger.debug('Into addon mapping of catalog')
        for (const a of catalog.addon) {
          if (a.catalogAddonId) {
            const updateAddon = {
              mandatory: a.mandatory,
              status: a.status || defaultCode.ACTIVE,
              updatedBy: userId
            }
            const addonResponse = await conn.CatalogAddonMap.update(updateAddon, { where: { catalogAddonId: a.catalogAddonId }, transaction: t })
            if (!addonResponse) {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Error while Updating addon'
              }
            }
          } else if (!a.catalogAddonId) {
            logger.debug('Adding asset mapping')
            if (!a.addonId) {
              return {
                status: statusCodeConstants.NOT_FOUND,
                message: 'addon id not found'
              }
            }
            const newAddon = {
              catalogId: id,
              addonId: a.addonId,
              mandatory: a.mandatory,
              status: defaultCode.ACTIVE,
              createdBy: userId,
              updatedBy: userId
            }
            const addonResponse = await conn.CatalogAddonMap.create(newAddon, { transaction: t })
            if (!addonResponse) {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Error while adding addon'
              }
            }
          }
        }
      }

      // UPDATING/ADDING ASSET MAPPING OF CATALOG
      if (catalog.asset) {
        logger.debug('Into asset mapping')
        for (const a of catalog.asset) {
          if (a.catalogAssetId) {
            const updateAsset = {
              mandatory: a.mandatory,
              status: a.status || defaultCode.ACTIVE,
              updatedBy: userId
            }
            const assetResponse = await conn.CatalogAssetMap.update(updateAsset, { where: { catalogAssetId: a.catalogAssetId }, transaction: t })
            if (!assetResponse) {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Error while updating addon'
              }
            }
          } else if (!a.catalogAssetId) {
            logger.debug('adding asset mapping')
            if (!a.assetId) {
              return {
                status: statusCodeConstants.NOT_FOUND,
                message: 'addon id not found'
              }
            }
            const newAsset = {
              catalogId: id,
              assetId: a.assetId,
              mandatory: a.mandatory,
              status: defaultCode.ACTIVE,
              createdBy: userId,
              updatedBy: userId
            }
            const assetResponse = await conn.CatalogAssetMap.create(newAsset, { transaction: t })
            if (!assetResponse) {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Error while adding addon'
              }
            }
          }
        }
      }
      await t.commit()
      return { status: statusCodeConstants.SUCCESS, message: 'Catalog updated successfully' }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) { await t.rollback() }
    }
  }

  async getCatalog (catalog) {
    try {
      logger.debug('Getting catalog details by catalogId')
      const conn = await getConnection()
      const { id, history } = catalog
      let response
      if (history) {
        response = await conn.Catalog.findOne({
          include: [
            { model: conn.CatalogAddonMap, as: 'addonMap' },
            { model: conn.CatalogAssetMap, as: 'assetMap' },
            { model: conn.CatalogServiceMap, as: 'serviceMap' },
            { model: conn.CatalogPlanMap, as: 'planMap' },
            { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
            { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['description'] },
            { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] },
            { model: conn.User, as: 'updatedByName', attributes: ['firstName', 'lastName'] }
          ],
          where: { catalogId: id }
        })
      } else { response = await catalogQuery(id) }
      if (!response) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'catalog not found'
        }
      }
      return { status: statusCodeConstants.SUCCESS, message: 'Successfully fetch catalog data', data: response }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async catalogByServiceType (catalog) {
    try {
      logger.debug('Getting catalog details by planId')
      const conn = await getConnection()
      const { type, pending = false, pendingId } = catalog
      const whereClause = { serviceType: type }
      if (pending) { whereClause.catalogId = pendingId }

      const response = await conn.Catalog.findAll({
        include: [
          {
            attributes: ['addonId'],
            model: conn.CatalogAddonMap,
            as: 'addonMap',
            include: [
              {
                attributes: ['addonId', 'chargeAmount', 'frequency'],
                model: conn.AddonCharge,
                as: 'addonCharge',
                include: [{ attributes: ['chargeName', 'currency', 'chargeCat'], model: conn.Charge, as: 'chargeDetails' }]
              },
              {
                attributes: ['addonName'],
                model: conn.AddonMst,
                as: 'addonDetails'
              }
            ],
            where: { status: defaultCode.ACTIVE },
            required: false
          },
          {
            attributes: ['assetId'],
            model: conn.CatalogAssetMap,
            as: 'assetMap',
            include: [
              {
                attributes: ['assetId', 'chargeAmount', 'frequency'],
                model: conn.AssetCharge,
                as: 'assetCharge',
                include: [{ attributes: ['chargeName', 'currency', 'chargeCat'], model: conn.Charge, as: 'chargeDetails' }]
              },
              {
                attributes: ['assetName'],
                model: conn.AssetMst,
                as: 'assetDetails'
              }
            ],
            where: { status: defaultCode.ACTIVE },
            required: false
          },
          {
            attributes: ['serviceId'],
            model: conn.CatalogServiceMap,
            as: 'serviceMap',
            include: [
              {
                attributes: ['serviceId', 'chargeAmount', 'frequency'],
                model: conn.ServiceCharge,
                as: 'serviceCharge',
                include: [{ attributes: ['chargeName', 'currency', 'chargeCat'], model: conn.Charge, as: 'chargeDetails' }]
              },
              {
                attributes: ['serviceName'],
                model: conn.Service,
                as: 'serviceDetails'
              }
            ],
            where: { status: defaultCode.ACTIVE },
            required: false
          },
          {
            attributes: ['planId'],
            model: conn.CatalogPlanMap,
            as: 'planMap',
            include: [
              {
                attributes: ['planId', 'chargeAmount', 'frequency'],
                model: conn.PlanCharge,
                as: 'planCharge',
                include: [{ attributes: ['chargeName', 'currency', 'chargeCat'], model: conn.Charge, as: 'chargeDetails' }]
              },
              {
                attributes: ['planName'],
                model: conn.Plan,
                as: 'planDetails'
              }
            ],
            where: { status: defaultCode.ACTIVE },
            required: false
          },
          { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['code', 'description'] }
          // { model: User, as: 'createdByName', attributes: ['firstName', 'lastName'] },
          // { model: User, as: 'updatedByName', attributes: ['firstName', 'lastName'] }
        ],
        where: whereClause
        // raw: true,
        // nest: true
      })

      logger.debug('Calculating total RC and NRC by catalog')
      response.map((catalog) => {
        if (catalog?.planMap && catalog?.planMap.length > 0) {
          catalog?.planMap.map((plan) => {
            let totalRc = 0
            let totalNrc = 0
            if (plan?.planCharge && plan?.planCharge.length > 0) {
              plan?.planCharge.map((charge) => {
                if (charge?.chargeDetails?.chargeCat === 'CC_RC') {
                  totalRc = totalRc + Number(charge?.chargeAmount) || 0
                } else if (charge?.chargeDetails?.chargeCat === 'CC_NRC') {
                  totalNrc = totalNrc + Number(charge?.chargeAmount) || 0
                }
              })
            }
            plan.dataValues.totalRc = totalRc
            plan.dataValues.totalNrc = totalNrc
            plan.dataValues.catalogId = catalog.catalogId
          })
        }
        if (catalog?.serviceMap && catalog?.serviceMap.length > 0) {
          catalog?.serviceMap.map((service) => {
            let totalRc = 0
            let totalNrc = 0
            if (service?.serviceCharge && service?.serviceCharge.length > 0) {
              service?.serviceCharge.map((charge) => {
                if (charge?.chargeDetails?.chargeCat === 'CC_RC') {
                  totalRc = totalRc + Number(charge?.chargeAmount) || 0
                } else if (charge?.chargeDetails?.chargeCat === 'CC_NRC') {
                  totalNrc = totalNrc + Number(charge?.chargeAmount) || 0
                }
              })
            }
            service.dataValues.totalRc = totalRc
            service.dataValues.totalNrc = totalNrc
            service.dataValues.catalogId = catalog.catalogId
          })
        }
        if (catalog?.assetMap && catalog?.assetMap.length > 0) {
          catalog?.assetMap.map((asset) => {
            let totalRc = 0
            let totalNrc = 0
            if (asset?.assetCharge && asset?.assetCharge.length > 0) {
              asset?.assetCharge.map((charge) => {
                if (charge?.chargeDetails?.chargeCat === 'CC_RC') {
                  totalRc = totalRc + Number(charge?.chargeAmount) || 0
                } else if (charge?.chargeDetails?.chargeCat === 'CC_NRC') {
                  totalNrc = totalNrc + Number(charge?.chargeAmount) || 0
                }
              })
            }
            asset.dataValues.totalRc = totalRc
            asset.dataValues.totalNrc = totalNrc
            asset.dataValues.catalogId = catalog.catalogId
          })
        }
        if (catalog?.addonMap && catalog?.addonMap.length > 0) {
          catalog?.addonMap.map((addon) => {
            let totalRc = 0
            let totalNrc = 0
            if (addon?.addonCharge && addon?.addonCharge.length > 0) {
              addon?.addonCharge.map((charge) => {
                if (charge?.chargeDetails?.chargeCat === 'CC_RC') {
                  totalRc = totalRc + Number(charge?.chargeAmount) || 0
                } else if (charge?.chargeDetails?.chargeCat === 'CC_NRC') {
                  totalNrc = totalNrc + Number(charge?.chargeAmount) || 0
                }
              })
            }
            addon.dataValues.totalRc = totalRc
            addon.dataValues.totalNrc = totalNrc
            addon.dataValues.catalogId = catalog.catalogId
          })
        }
      })

      response.map((catalog) => {
        let totalNrc = 0
        let totalRc = 0
        if (catalog?.planMap && catalog?.planMap.length > 0) {
          for (const plan of catalog?.planMap) {
            if (plan?.planCharge && plan?.planCharge.length > 0) {
              for (const charge of plan?.planCharge) {
                if (charge?.chargeDetails?.chargeCat === 'CC_RC') {
                  totalRc = totalRc + Number(charge?.chargeAmount) || 0
                } else if (charge?.chargeDetails?.chargeCat === 'CC_NRC') {
                  totalNrc = totalNrc + Number(charge?.chargeAmount) || 0
                }
              }
            }
          }
        }
        if (catalog?.serviceMap && catalog?.serviceMap.length > 0) {
          for (const service of catalog?.serviceMap) {
            if (service?.serviceCharge && service?.serviceCharge.length > 0) {
              for (const charge of service?.serviceCharge) {
                if (charge?.chargeDetails?.chargeCat === 'CC_RC') {
                  totalRc = totalRc + Number(charge?.chargeAmount) || 0
                } else if (charge?.chargeDetails?.chargeCat === 'CC_NRC') {
                  totalNrc = totalNrc + Number(charge?.chargeAmount) || 0
                }
              }
            }
          }
        }
        if (catalog?.assetMap && catalog?.assetMap.length > 0) {
          for (const asset of catalog?.assetMap) {
            if (asset?.assetCharge && asset?.assetCharge.length > 0) {
              for (const charge of asset?.assetCharge) {
                if (charge?.chargeDetails?.chargeCat === 'CC_RC') {
                  totalRc = totalRc + Number(charge?.chargeAmount) || 0
                } else if (charge?.chargeDetails?.chargeCat === 'CC_NRC') {
                  totalNrc = totalNrc + Number(charge?.chargeAmount) || 0
                }
              }
            }
          }
        }
        if (catalog?.addonMap && catalog?.addonMap.length > 0) {
          for (const addon of catalog?.addonMap) {
            if (addon?.addonCharge && addon?.addonCharge.length > 0) {
              for (const charge of addon?.addonCharge) {
                if (charge?.chargeDetails?.chargeCat === 'CC_RC') {
                  totalRc = totalRc + Number(charge?.chargeAmount) || 0
                } else if (charge?.chargeDetails?.chargeCat === 'CC_NRC') {
                  totalNrc = totalNrc + Number(charge?.chargeAmount) || 0
                }
              }
            }
          }
        }
        catalog.dataValues.totalRc = totalRc
        catalog.dataValues.totalNrc = totalNrc
        return catalog
        // if (catalog?.planMap?.planCharge?.chargeDetails?.chargeCat && catalog?.planMap?.planCharge?.chargeAmount) {
        //   if (catalog?.planMap?.planCharge?.chargeDetails?.chargeCat === 'CC_RC') {
        //     catalog.totalRc += catalog.planMap.planCharge.chargeAmount
        //   } else if (catalog?.planMap?.planCharge?.chargeDetails?.chargeCat === 'CC_NRC') {
        //     catalog.totalNrc += catalog.planMap.planCharge.chargeAmount
        //   }
        // } else {
        //   catalog.totalRc = 0
        //   catalog.totalNrc = 0
        // }
      })

      // logger.debug('Removing unwatned items in catalog object')
      // for (const catalog of response) { delete catalog.planMap }

      if (!response) {
        logger.debug(defaultMessage.NOT_FOUND)
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Catalog not found'
        }
      }
      return { status: statusCodeConstants.SUCCESS, message: 'Successfully fetch catalog data', data: response }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCatalogByName (catalog) {
    try {
      logger.debug('Getting catalog details by planId')
      const conn = await getConnection()
      let { history, limit = defaultCode.lIMIT, page = defaultCode.PAGE, excel = false, name, filters } = catalog
      let offSet = (page * limit)
      if (excel) {
        offSet = undefined
        limit = undefined
      }
      let whereClause = {}
      let whereCreatedBy
      let whereUpdatedBy
      let addonName
      let planName
      let serviceName
      let assetName
      if (name) {
        whereClause = { catalogName: sequelize.where(sequelize.fn('LOWER', sequelize.col('catalog_name')), 'LIKE', '%' + name.toLowerCase() + '%') }
      }
      if (filters && Array.isArray(filters) && !isEmpty(filters)) {
        for (const record of filters) {
          if (record.value) {
            if (record.id === 'catalogId') {
              whereClause.catalogId = {
                [Op.and]: [sequelize.where(sequelize.cast(sequelize.col('Catalog.catalog_id'), 'varchar'), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'catalogName') {
              whereClause.catalogName = {
                [Op.and]: [sequelize.where(sequelize.fn('UPPER', sequelize.col('Catalog.catalog_name')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            } else if (record.id === 'productCategory') {
              whereClause.serviceType = {
                [Op.and]: [sequelize.where(sequelize.fn('UPPER', sequelize.col('Catalog.service_type')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            } else if (record.id === 'plan') {
              planName = {
                [Op.and]: [sequelize.where(sequelize.fn('UPPER', sequelize.col('plan_name')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            } else if (record.id === 'serviceItems') {
              serviceName = {
                [Op.and]: [sequelize.where(sequelize.fn('UPPER', sequelize.col('service_name')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            } else if (record.id === 'assetItems') {
              assetName = {
                [Op.and]: [sequelize.where(sequelize.fn('UPPER', sequelize.col('asset_name')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            } else if (record.id === 'addonItems') {
              addonName = {
                [Op.and]: [sequelize.where(sequelize.fn('UPPER', sequelize.col('addon_name')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            } else if (record.id === 'createdBy') {
              whereCreatedBy = {
                [Op.and]: sequelize.where(
                  sequelize.fn('concat', sequelize.fn('UPPER', sequelize.col('first_name')), ' ',
                    sequelize.fn('UPPER', sequelize.col('last_name'))),
                  {
                    [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                  }
                )
              }
            } else if (record.id === 'updatedBy') {
              whereUpdatedBy = {
                [Op.and]: sequelize.where(
                  sequelize.fn('concat', sequelize.fn('UPPER', sequelize.col('updatedByName.first_name')), ' ',
                    sequelize.fn('UPPER', sequelize.col('updatedByName.last_name'))),
                  {
                    [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                  }
                )
              }
            } else if (record.id === 'catalogStatus') {
              whereClause.status = {
                [Op.and]: [sequelize.where(sequelize.fn('UPPER', sequelize.col('Catalog.status')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            }
          }
        }
      }

      let response
      if (history) {
        response = await conn.Catalog.findAll({
          include: [
            { model: conn.CatalogAddonMap, as: 'addonMap' },
            { model: conn.CatalogAssetMap, as: 'assetMap' },
            { model: conn.CatalogServiceMap, as: 'serviceMap' },
            { model: conn.CatalogPlanMap, as: 'planMap' },
            { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
            { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['description'] },
            { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] },
            { model: conn.User, as: 'updatedByName', attributes: ['firstName', 'lastName'] }
          ],
          order: [['catalogId', 'DESC']],
          offset: offSet,
          limit: Number(limit)
        })
      } else {
        response = await conn.Catalog.findAndCountAll({
          include: [
            {
              model: conn.CatalogAddonMap,
              as: 'addonMap',
              include: [
                {
                  attributes: ['chargeAmount'],
                  model: conn.AddonCharge,
                  as: 'addonCharge',
                  include: [{ attributes: ['chargeCat'], model: conn.Charge, as: 'chargeDetails' }]
                },
                { model: conn.AddonMst, as: 'addonDetails', attributes: ['addonName'], where: addonName }
              ],
              where: { status: defaultCode.ACTIVE },
              required: false
            },
            {
              model: conn.CatalogAssetMap,
              as: 'assetMap',
              include: [
                {
                  attributes: ['chargeAmount'],
                  model: conn.AssetCharge,
                  as: 'assetCharge',
                  include: [{ attributes: ['chargeCat'], model: conn.Charge, as: 'chargeDetails' }]
                },
                { model: conn.AssetMst, as: 'assetDetails', attributes: ['assetName'], where: assetName }
              ],
              where: { status: defaultCode.ACTIVE },
              required: false
            },
            {
              model: conn.CatalogServiceMap,
              as: 'serviceMap',
              include: [
                {
                  attributes: ['chargeAmount'],
                  model: conn.ServiceCharge,
                  as: 'serviceCharge',
                  include: [{ attributes: ['chargeCat'], model: conn.Charge, as: 'chargeDetails' }]
                },
                { model: conn.Service, as: 'serviceDetails', attributes: ['serviceName'], where: serviceName }
              ],
              where: { status: defaultCode.YES },
              required: false
            },
            {
              model: conn.CatalogPlanMap,
              as: 'planMap',
              include: [
                {
                  attributes: ['chargeAmount'],
                  model: conn.PlanCharge,
                  as: 'planCharge',
                  include: [{ attributes: ['chargeCat'], model: conn.Charge, as: 'chargeDetails' }]
                },
                { model: conn.Plan, as: 'planDetails', attributes: ['planName'], where: planName }
              ],
              where: { status: defaultCode.YES },
              required: false
            },
            { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
            { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['description'] },
            { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'], where: whereCreatedBy, subQuery: false },
            { model: conn.User, as: 'updatedByName', attributes: ['firstName', 'lastName'], where: whereUpdatedBy, subQuery: false }
          ],
          where: whereClause,
          distinct: true,
          order: [['catalogId', 'DESC']],
          offset: offSet,
          limit: excel === false ? Number(limit) : limit
        })
      }
      if (!response) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'catalog not found'
        }
      }
      for (const catalog of response.rows) {
        for (const planMap of catalog.planMap) {
          for (const planCharge of planMap.planCharge) {
            planMap.dataValues.totalNrc = 0
            planMap.dataValues.totalRc = 0
            if (planCharge?.chargeDetails?.chargeCat && planCharge?.chargeAmount) {
              if (planCharge?.chargeDetails?.chargeCat === 'CC_RC') {
                planMap.dataValues.totalRc += planCharge.chargeAmount
              } else if (planCharge?.chargeDetails?.chargeCat === 'CC_NRC') {
                planMap.dataValues.totalNrc += planCharge.chargeAmount
              }
            } else {
              planMap.dataValues.totalRc = 0
              planMap.dataValues.totalNrc = 0
            }
          }
          delete planMap.dataValues.planCharge
        }
        for (const serviceMap of catalog.serviceMap) {
          for (const serviceCharge of serviceMap.serviceCharge) {
            serviceMap.dataValues.totalNrc = 0
            serviceMap.dataValues.totalRc = 0
            if (serviceCharge?.chargeDetails?.chargeCat && serviceCharge?.chargeAmount) {
              if (serviceCharge?.chargeDetails?.chargeCat === 'CC_RC') {
                serviceMap.dataValues.totalRc += serviceCharge.chargeAmount
              } else if (serviceCharge?.chargeDetails?.chargeCat === 'CC_NRC') {
                serviceCharge.dataValues.totalNrc += serviceCharge.chargeAmount
              }
            } else {
              serviceMap.dataValues.totalRc = 0
              serviceMap.dataValues.totalNrc = 0
            }
          }
          delete serviceMap.dataValues.serviceCharge
        }
        for (const assetMap of catalog.assetMap) {
          for (const assetCharge of assetMap.assetCharge) {
            assetMap.dataValues.totalNrc = 0
            assetMap.dataValues.totalRc = 0
            if (assetCharge?.chargeDetails?.chargeCat && assetCharge?.chargeAmount) {
              if (assetCharge?.chargeDetails?.chargeCat === 'CC_RC') {
                assetMap.dataValues.totalRc += assetCharge.chargeAmount
              } else if (assetCharge?.chargeDetails?.chargeCat === 'CC_NRC') {
                assetCharge.dataValues.totalNrc += assetCharge.chargeAmount
              }
            } else {
              assetMap.dataValues.totalRc = 0
              assetMap.dataValues.totalNrc = 0
            }
          }
          delete assetMap.dataValues.assetCharge
        }
      }
      for (const catalog of response.rows) {
        const customerDesc = await conn.BusinessEntity.findAll({
          attributes: ['code', 'description'],
          where: { code: catalog.customerType.customerType }
        })
        catalog.customerType = customerDesc
      }
      return { status: statusCodeConstants.SUCCESS, message: 'Successfully fetch catalog data', data: response }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCatalogList () {
    try {
      logger.debug('Getting catalog list')
      const conn = await getConnection()
      const response = await conn.Catalog.findAll({
        include: [
          { model: conn.CatalogAddonMap, as: 'addonMap' },
          { model: conn.CatalogAssetMap, as: 'assetMap' },
          { model: conn.CatalogServiceMap, as: 'serviceMap' },
          { model: conn.CatalogPlanMap, as: 'planMap' },
          { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['description'] },
          { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] },
          { model: conn.User, as: 'updatedByName', attributes: ['firstName', 'lastName'] }
        ],
        order: [['catalogId', 'DESC']]
      })
      if (!response) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'catalog not found'
        }
      }
      return { status: statusCodeConstants.SUCCESS, message: 'Successfully fetch catalog data', data: response }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
}

export const catalogQuery = async (id) => {
  const conn = await getConnection()
  const response = await conn.Catalog.findOne({
    include: [
      { model: conn.CatalogAddonMap, as: 'addonMap', where: { status: defaultStatus.ACTIVE }, required: false },
      {
        model: conn.CatalogAssetMap,
        as: 'assetMap',
        include: [
          {
            attributes: ['chargeAmount', 'frequency'],
            model: conn.AssetCharge,
            as: 'assetCharge',
            include: [
              {
                attributes: ['chargeName', 'currency', 'chargeCat'],
                model: conn.Charge,
                as: 'chargeDetails',
                include: [
                  { model: conn.BusinessEntity, as: 'chargeCatDesc', attributes: ['description'] },
                  { model: conn.BusinessEntity, as: 'currencyDesc', attributes: ['description'] }
                ]
              },
              { model: conn.BusinessEntity, as: 'frequencyDesc', attributes: ['description'] }
            ]
          }
        ],
        where: { status: defaultStatus.ACTIVE },
        required: false
      },
      {
        model: conn.CatalogServiceMap,
        as: 'serviceMap',
        include: [
          {
            attributes: ['chargeAmount', 'frequency'],
            model: conn.ServiceCharge,
            as: 'serviceCharge',
            include: [
              {
                model: conn.Charge,
                as: 'chargeDetails',
                attributes: ['chargeName', 'chargeCat', 'currency'],
                include: [
                  { model: conn.BusinessEntity, as: 'chargeCatDesc', attributes: ['description'] },
                  { model: conn.BusinessEntity, as: 'currencyDesc', attributes: ['description'] }
                ]
              },
              { model: conn.BusinessEntity, as: 'frequencyDesc', attributes: ['description'] }
            ]
          }
        ],
        where: { status: defaultStatus.ACTIVE },
        required: false
      },
      {
        model: conn.CatalogPlanMap,
        as: 'planMap',
        include: [
          {
            attributes: ['chargeAmount', 'frequency'],
            model: conn.PlanCharge,
            as: 'planCharge',
            include: [
              {
                attributes: ['chargeName', 'currency', 'chargeCat'],
                model: conn.Charge,
                as: 'chargeDetails',
                include: [
                  { model: conn.BusinessEntity, as: 'chargeCatDesc', attributes: ['description'] },
                  { model: conn.BusinessEntity, as: 'currencyDesc', attributes: ['description'] }
                ]
              },
              { model: conn.BusinessEntity, as: 'frequencyDesc', attributes: ['description'] }
            ]
          }
        ],
        where: { status: defaultStatus.ACTIVE },
        required: false
      },
      { model: conn.BusinessEntity, as: 'statusDesc', attributes: ['description'] },
      { model: conn.BusinessEntity, as: 'serviceTypeDesc', attributes: ['code', 'description'] },
      { model: conn.User, as: 'createdByName', attributes: ['firstName', 'lastName'] },
      { model: conn.User, as: 'updatedByName', attributes: ['firstName', 'lastName'] }
    ],
    where: { catalogId: id }
  })
  return response
}

module.exports = CatalogService
