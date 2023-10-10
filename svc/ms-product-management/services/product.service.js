/* eslint-disable array-callback-return */
import { defaultStatus, logger, statusCodeConstants, defaultCode, defaultMessage } from '@utils'
import { QueryTypes, Op } from 'sequelize'
import { _, isEmpty } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import moment from 'moment'

let instance
const commonExcludableAttrs = ['createdDeptId', 'createdRoleId', 'tranId', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']

class ProductService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async getProducts(conn, searchParam) {
    try {
      const whereObj = {
        status: defaultStatus.ACTIVE
      }

      const chargesWhereClause = {}

      if (searchParam && searchParam?.productType) {
        // whereObj.serviceType = serviceType;
        whereObj.productType = searchParam?.productType
      }

      if (searchParam && searchParam?.productCategory) {
        whereObj.productCategory = searchParam?.productCategory
      }

      if (searchParam && searchParam?.productId) {
        whereObj.productId = searchParam?.productId
      }

      if (searchParam && searchParam?.productSubCategory) {
        whereObj.productSubCategory = searchParam?.productSubCategory
      }

      if (searchParam && searchParam?.productFamily) {
        whereObj.productFamily = searchParam?.productFamily
      }

      if (searchParam && searchParam?.productSubType) {
        whereObj.productSubType = searchParam?.productSubType
      }

      if (searchParam && searchParam?.serviceType) {
        whereObj.serviceType = searchParam?.serviceType
      }

      if (searchParam && searchParam?.charge?.chargeAmount) {
        if (searchParam && searchParam?.charge?.operators === 'lte') {
          chargesWhereClause.chargeAmount <= Number(searchParam?.charge?.chargeAmount?.[0])
        } else if (searchParam && searchParam?.charge?.operators === 'gte') {
          chargesWhereClause.chargeAmount >= Number(searchParam?.charge?.chargeAmount?.[0])
        } else {
          chargesWhereClause.chargeAmount === Number(searchParam?.charge?.chargeAmount?.[0])
        }
      }

      if (searchParam && searchParam?.chargeCategory) {
        chargesWhereClause.chargeCat = searchParam?.chargeCategory
      }

      const productsList = await conn.Product.findAll({
        where: whereObj,
        attributes: {
          exclude: [...commonExcludableAttrs, 'productVariant', 'provisioningType', 'productLine', 'volumeAllowed', 'revenueGlCode', 'receivableGlCode']
        },
        include: [
          // { model: conn.BusinessEntity, as: 'productTypeDesc', attributes: ['code', 'description'] },
          {
            model: conn.BusinessEntity,
            as: 'serviceTypeDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productTypeDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productSubTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productSubCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.ProductCharge,
            as: 'productChargesList',
            attributes: {
              exclude: [...commonExcludableAttrs, 'glcode']
            },
            include: [
              {
                model: conn.Charge,
                as: 'chargeDetails',
                attributes: {
                  exclude: [...commonExcludableAttrs]
                },
                where: {
                  ...chargesWhereClause
                },
                include: [
                  {
                    model: conn.BusinessEntity,
                    as: 'chargeCatDesc',
                    attributes: ['code', 'description']
                  },
                  {
                    model: conn.BusinessEntity,
                    as: 'currencyDesc',
                    attributes: ['code', 'description']
                  }
                ]
              }
            ]
          },
          {
            model: conn.User,
            attributes: ['firstName', 'lastName'],
            as: 'createdByUser'
          },
          {
            model: conn.User,
            attributes: ['firstName', 'lastName'],
            as: 'updatedByUser'
          }
        ],
        order: [['product_id', 'desc']],
        logging: console.log
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Products ${productsList.length > 0 ? 'retrived' : 'list empty'}`,
        data: productsList
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** *******Product Module-Search using limit-Srinivasan.N-17-June-2023 *****/
  async getProductsbyLimit(inputData, conn) {
    try {
      let { limit = defaultCode.lIMIT, page = defaultCode.PAGE, excel = false, filters, serviceCategory, serviceType, customerCategory } = inputData

      let offSet = (page * limit)
      if (excel) {
        offSet = undefined
        limit = undefined
      }

      const whereClause = {}
      let whereCreatedBy
      let whereUpdatedBy
      let statusDesc

      if (serviceCategory && serviceCategory.length > 0) {
        whereClause.productSubType = serviceCategory
      }
      if (serviceType && serviceType.length > 0) {
        whereClause.serviceType = serviceType
      }
      if (customerCategory && customerCategory.length > 0) {
        const customerTypelookup = await conn.BusinessEntity.findAll({ where: { code: customerCategory } })
        const productSubCat = customerTypelookup.map(f => f.mappingPayload.productSubCategory)
        whereClause.productSubCategory = productSubCat[0]
      }

      if (Array.isArray(filters) && !isEmpty(filters)) {
        for (const record of filters) {
          if (record.value) {
            if (record.id === 'productName') {
              whereClause.productName = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.col('"Product".product_name'), {
                  [record.filter === 'contains' ? Op.iLike : Op.notILike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'serviceType') {
              whereClause.serviceType = {
                [Op.and]: [
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('Product.service_type')),
                    {
                      [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'createdUser') {
              whereCreatedBy = {
                [Op.and]: conn.sequelize.where(
                  conn.sequelize.fn('concat', conn.sequelize.fn('UPPER', conn.sequelize.col('first_name')), ' ',
                    conn.sequelize.fn('UPPER', conn.sequelize.col('last_name'))),
                  {
                    [Op.like]: `%${record.value.toUpperCase()}%`
                  }
                )
              }
            } else if (record.id === 'updatedUser') {
              whereUpdatedBy = {
                [Op.and]: conn.sequelize.where(
                  conn.sequelize.fn('concat', conn.sequelize.fn('UPPER', conn.sequelize.col('updatedByUser.first_name')), ' ',
                    conn.sequelize.fn('UPPER', conn.sequelize.col('updatedByUser.last_name'))),
                  {
                    [Op.like]: `%${record.value.toUpperCase()}%`
                  }
                )
              }
            } else if (record.id === 'status') {
              statusDesc = {
                [Op.and]: [
                  conn.sequelize.where(
                    conn.sequelize.fn('UPPER', conn.sequelize.col('statusDesc.description')),
                    {
                      [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            }
          }
        }
      }

      // console.log('whereClause', JSON.stringify(whereClause))

      const commonExcludableAttrs = ['createdDeptId', 'createdRoleId', 'tranId', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']
      const productCount = await conn.Product.count({ where: whereClause })

      const productList = await conn.Product.findAll({
        attributes: {
          exclude: [...commonExcludableAttrs, 'productVariant', 'productLine', 'volumeAllowed', 'revenueGlCode', 'receivableGlCode']
        },
        include: [
          {
            model: conn.BusinessEntity,
            as: 'serviceTypeDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productTypeDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productSubTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productSubCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'uomCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productClassDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'serviceClassDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'provisioningTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.ProductCharge,
            as: 'productChargesList',
            attributes: {
              exclude: [...commonExcludableAttrs, 'glcode']
            },
            include: [
              {
                model: conn.Charge,
                as: 'chargeDetails',
                attributes: {
                  exclude: [...commonExcludableAttrs]
                },
                include: [
                  {
                    model: conn.BusinessEntity,
                    as: 'chargeCatDesc',
                    attributes: ['code', 'description']
                  },
                  {
                    model: conn.BusinessEntity,
                    as: 'currencyDesc',
                    attributes: ['code', 'description']
                  }
                ]
              },
              {
                model: conn.BusinessEntity,
                as: 'frequencyDesc',
                attributes: ['code', 'description']
              }
            ]
          },
          { model: conn.BusinessEntity, attributes: [], as: 'statusDesc', where: statusDesc },
          {
            model: conn.User,
            as: 'createdByUser',
            where: whereCreatedBy,
            subQuery: false
          },
          {
            model: conn.User,
            as: 'updatedByUser',
            where: whereUpdatedBy,
            subQuery: false
          }
        ],
        where: whereClause,
        order: [['product_id', 'desc']],
        offset: offSet,
        limit: excel === false ? Number(limit) : limit,
        logging: false
      })

      if (productList.termsList) {
        const termsList = await conn.TermsConditionsHdr.findAll({
          where: {
            termId: productList.termsList
          }
        })

        productList.map(f => {
          return {
            ...f,
            termDtl: termsList
          }
        })
      }

      const productsList = {
        rows: productList,
        count: productCount
      }

      // console.log('productsList , ', productsList)
      // console.log(ddfd)

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Products ${productsList.rows.length > 0 ? 'retrived' : 'list empty'}`,
        data: productsList
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getProductsDetail(inputData, conn) {
    try {
      let { productIds } = inputData

      const whereClause = {
        productId: { [Op.in]: productIds }
      }
      let statusDesc

      // console.log('whereClause', JSON.stringify(whereClause))

      const commonExcludableAttrs = ['createdDeptId', 'createdRoleId', 'tranId', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']

      const productList = await conn.Product.findAll({
        attributes: {
          exclude: [...commonExcludableAttrs, 'productVariant', 'productLine', 'volumeAllowed', 'revenueGlCode', 'receivableGlCode','productImage']
        },
        include: [
          {
            model: conn.BusinessEntity,
            as: 'serviceTypeDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productTypeDescription',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productSubTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productSubCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'uomCategoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'productClassDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'serviceClassDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'provisioningTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.ProductCharge,
            as: 'productChargesList',
            attributes: {
              exclude: [...commonExcludableAttrs, 'glcode']
            },
            include: [
              {
                model: conn.Charge,
                as: 'chargeDetails',
                attributes: {
                  exclude: [...commonExcludableAttrs]
                },
                include: [
                  {
                    model: conn.BusinessEntity,
                    as: 'chargeCatDesc',
                    attributes: ['code', 'description']
                  },
                  {
                    model: conn.BusinessEntity,
                    as: 'currencyDesc',
                    attributes: ['code', 'description']
                  }
                ]
              },
              {
                model: conn.BusinessEntity,
                as: 'frequencyDesc',
                attributes: ['code', 'description']
              }
            ]
          },
          { model: conn.BusinessEntity, attributes: [], as: 'statusDesc', where: statusDesc },
        ],
        where: whereClause,
        order: [['product_id', 'desc']],
        logging: false
      })

      if (productList.termsList) {
        const termsList = await conn.TermsConditionsHdr.findAll({
          where: {
            termId: productList.termsList
          }
        })

        productList.map(f => {
          return {
            ...f,
            termDtl: termsList
          }
        })
      }

      const productsList = {
        rows: productList
      }

      // console.log('productsList , ', productsList)
      // console.log(ddfd)

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Products ${productsList.rows.length > 0 ? 'retrived' : 'list empty'}`,
        data: productsList
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getTaskProductMapping(conn, body) {
    try {
      console.log('searchParam', body)
      const productIds = `(${_.map(body, id => `'${id}'`).join(',')})`
      console.log('productIds', productIds)
      const schSql = `select * from product_task_map left join task_mst on product_task_map.task_id = task_mst.task_id where product_task_map.product_id in ${productIds} and product_task_map.status='${defaultStatus.ACTIVE}'`
      const productMapping = await conn.sequelize.query(schSql, {
        type: QueryTypes.SELECT
      })

      return {
        status: statusCodeConstants.SUCCESS, // productMapping.length > 0 ? statusCodeConstants.SUCCESS : statusCodeConstants.NOT_FOUND,
        // message: `Product Task Mapping ${productMapping.length > 0 ? 'retrived' : 'list empty'}`,
        data: productMapping
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  /** *******Product Module-Create-Srinivasan.N-16-June-2023 *****/
  async createProduct(inputData, userId, roleId, departmentId, conn, t) {
    try {
      const guid = uuidv4()
      const commonAttrib = {
        tranId: guid,
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }

      const productData = {
        ...inputData,
        productUuid: uuidv4(),
        ...commonAttrib
      }

      // console.log('productData ', productData)

      const product = await conn.Product.create(productData, {
        transaction: t
      })

      // console.log('product ', product)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Saved successfully',
        data: product
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  /** *******Product Module-Update-Srinivasan.N-16-June-2023 *****/
  async updateProduct(inputData, userId, roleId, departmentId, conn, t) {
    console.log(inputData)
    try {
      const product = await conn.Product.findOne({
        include: [
          {
            model: conn.ProductCharge, as: 'productChargesList'
          }
        ],
        where: { productUuid: inputData.productUuid }
      })

      if (!product) {
        return {
          status: statusCodeConstants.ERROR, message: 'Unable to find product details'
        }
      }
      const updateObj = {
        ...inputData,
        status: inputData.status ? inputData.status : defaultStatus.ACTIVE,
        termsList: inputData.termsId
      }
      // console.log('updateObj====================>>>>>>>>>>', updateObj)
      let result = await conn.Product.update(updateObj, {
        where: {
          productUuid: inputData.productUuid
        },
        transaction: t
      })

      if (inputData.productChargesList && inputData.productChargesList.length > 0) {
        const newCharges = inputData.productChargesList.filter(ch => !product.productChargesList.some(prod => prod.chargeId === ch.chargeId))
        const existingCharges = inputData.productChargesList.filter(ch => product.productChargesList.some(prod => prod.chargeId === ch.chargeId))

        if (!isEmpty(newCharges)) {
          const newObjects = newCharges.map(ch => {
            const guid = uuidv4()
            return {
              productId: product.productId,
              chargeId: ch.chargeId,
              chargeAmount: Number(ch.chargeAmount),
              frequency: ch.frequency,
              billingEffective: ch.billingEffective,
              advanceCharge: ch.advanceCharge,
              chargeUpfront: ch.chargeUpfront,
              status: 'AC',
              startDate: ch.startDate,
              endDate: ch.endDate || null,
              changesApplied: ch.changesApplied,
              remarks: ch.remarks,
              prorated: ch.prorated,
              chargeType: ch.chargeType,
              currency: ch.currencyDesc,
              productUuid: inputData.productUuid,
              tranId: guid,
              createdDeptId: departmentId,
              createdRoleId: roleId,
              createdBy: userId,
              updatedBy: userId
            }
          })

          for (const obj of newObjects) {
            result = await conn.ProductCharge.create(obj, { transaction: t })
          }
        }

        if (!isEmpty(existingCharges)) {
          await Promise.all(existingCharges.map(async ch => {
            const obj = {
              chargeAmount: Number(ch.chargeAmount),
              frequency: ch.frequency,
              billingEffective: ch.billingEffective,
              advanceCharge: ch.advanceCharge,
              chargeUpfront: ch.chargeUpfront,
              status: 'AC',
              startDate: ch.startDate,
              endDate: ch.endDate || null,
              changesApplied: ch.changesApplied,
              remarks: ch.remarks,
              prorated: ch.prorated,
              chargeType: ch.chargeType,
              currency: ch.currencyDesc,
              updatedBy: userId
            };
            await conn.ProductCharge.update(obj, {
              where: {
                chargeId: ch.chargeId,
              },
              transaction: t
            });
          }));
        }

      }

      // if(inputData.productChargesList && inputData.productChargesList.length > 0){
      //   for(const ch of inputData.productChargesList) {
      //     const guid = uuidv4()
      //     const commonAttrib = {
      //       tranId: guid,
      //       createdDeptId: departmentId,
      //       createdRoleId: roleId,
      //       createdBy: userId,
      //       updatedBy: userId
      //     }
      //     for(const prod of product.productChargesList){
      //       if(prod.chargeId != ch.chargeId){
      //         const obj={
      //           productId: product.productId,
      //           chargeId: ch.chargeId,
      //           chargeAmount: Number(ch.chargeAmount),
      //           frequency: ch.frequency,
      //           billingEffective: ch.billingEffective,
      //           advanceCharge: ch.advanceCharge,
      //           chargeUpfront: ch.chargeUpfront,
      //           status: 'AC',
      //           startDate: ch.startDate,
      //           endDate: ch.endDate || null,
      //           changesApplied: ch.changesApplied,
      //           remarks: ch.remarks,
      //           prorated: ch.prorated,
      //           productUuid: inputData.productUuid,
      //           ...commonAttrib
      //         }
      //       console.log('obj ', obj)
      //       result= await conn.ProductCharge.create(obj, {transaction: t})
      //       }

      //     }

      //   }
      // }

      // if (inputData.termsId && Array.isArray(inputData.termsId)) {
      //   const guid = uuidv4()
      //   const commonAttrib = {
      //     tranId: guid,
      //     createdDeptId: departmentId,
      //     createdRoleId: roleId,
      //     createdBy: userId,
      //     updatedBy: userId
      //   }
      //   for (const term of inputData.termsId) {
      //     const dtlobj = {
      //       termId: term,
      //       productId: inputData.productId,
      //       status: defaultStatus.ACTIVE,
      //       ...commonAttrib
      //     }

      //     result = await conn.TermsConditionsDtl.create(dtlobj, { transaction: t })
      //   }

      // }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Saved successfully',
        data: result
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  /** *******Product Module-Bundle Mapping-Srinivasan.N-19-June-2023 *****/
  async getProductBundleMapping(inputData, conn) {
    let { limit = defaultCode.lIMIT, page = defaultCode.PAGE, excel = false, filter } = inputData
    let offSet = (page * limit)
    if (excel) {
      offSet = undefined
      limit = undefined
    }

    const productBundleCount = await conn.ProductBundleHdr.count({
      where: {
        status: defaultStatus.ACTIVE
      }
    })

    const productBundleList = await conn.ProductBundleHdr.findAll({
      include: [
        {
          model: conn.ProductBundleDtl,
          as: 'productBundleDtl',
          include: [
            {
              model: conn.Product,
              as: 'productDtl',
              include: [
                {
                  model: conn.BusinessEntity,
                  as: 'serviceTypeDescription',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productTypeDescription',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productSubTypeDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productCategoryDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productSubCategoryDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.ProductCharge,
                  as: 'productChargesList'
                }
              ]
            }
          ]
        }
      ],
      where: {
        status: defaultStatus.ACTIVE
      }
      // offset: offSet,
      // limit: excel === false ? Number(limit) : limit,
    })

    const chargeList = await conn.ProductCharge.findAll({
      include: [
        {
          model: conn.Charge,
          as: 'chargeDetails',
          attributes: {
            exclude: [...commonExcludableAttrs]
          },
          include: [
            {
              model: conn.BusinessEntity,
              as: 'chargeCatDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'currencyDesc',
              attributes: ['code', 'description']
            }
          ]
        }
      ]
    })
    const termsList = await conn.TermsConditionsHdr.findAll({})
    const finalBundleList = []
    // console.log('=====================>', productBundleList)
    if (Array.isArray(productBundleList)) {
      for (const bundleList of productBundleList) {
        if (bundleList.prodBundleId) {
          const detObj = {
            bundleName: bundleList.prodBundleName,
            bundleImage: bundleList.bundleImage,
            productCategory: 'PC_BUNDLE',
            bundleId: bundleList.prodBundleId,
            contractFlag: bundleList.contractFlag,
            contractList: bundleList.contractList,
            productBundleDtl: bundleList.productBundleDtl.map((bundleDet) => {
              const charges = bundleDet.useExistingCharge
                ? chargeList.filter(
                  (c) => c.productId === bundleDet.productId && (!c.objectType && c.objectType === null) && (!c.objectReferenceId && c.objectReferenceId === null)
                )
                : chargeList.filter(
                  (c) =>
                    c.objectType === 'TMC_PRODUCTBUNDLE' && Number(c.objectReferenceId) === Number(bundleList.prodBundleId) && Number(c.productId) === Number(bundleDet.productId)
                )
              const terms = termsList.filter((c) =>
                bundleDet?.termsList?.includes(c.termId)
              )
              return {
                useExistingCharge: bundleDet.useExistingCharge,
                useExistingTerm: bundleDet.useExistingTerm,
                productDtl: bundleDet.productDtl,
                productId: bundleDet.productId,
                charges: charges.map(({ chargeId, chargeAmount, chargeDetails }) => ({
                  chargeId,
                  chargeAmount,
                  chargeType: chargeDetails.chargeCat,
                  currency: chargeDetails.currencyDesc.description
                })),
                terms: terms.map(
                  ({ termId, termName, entityType, serviceType, termsContent }) => ({
                    termId,
                    termName,
                    entityType,
                    serviceType,
                    termsContent
                  })
                )
              }
            })
          }

          // console.log('======================', detObj);

          finalBundleList.push(detObj)
        }
      }
    }

    // const filterProductIds = []
    // for (const bundle of productBundleList) {
    //   for (const dtl of bundle.productBundleDtl) {
    //     filterProductIds.push(dtl.productDtl.productId)
    //   }
    // }
    const productCount = await conn.Product.count({
      where: {
        status: defaultStatus.ACTIVE
      }
    })
    const productsList = await conn.Product.findAll({
      include: [
        {
          model: conn.BusinessEntity,
          as: 'serviceTypeDescription',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productTypeDescription',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productSubTypeDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productCategoryDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productSubCategoryDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.ProductCharge,
          as: 'productChargesList',
          attributes: {
            exclude: [...commonExcludableAttrs, 'glcode']
          },
          include: [
            {
              model: conn.Charge,
              as: 'chargeDetails',
              attributes: {
                exclude: [...commonExcludableAttrs]
              },
              include: [
                {
                  model: conn.BusinessEntity,
                  as: 'chargeCatDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'currencyDesc',
                  attributes: ['code', 'description']
                }
              ]
            }
          ]
        }
      ],
      where: {
        status: defaultStatus.ACTIVE
        // productId: { [Op.notIn]: { filterProductIds } }
      },
      logging: true,
      // offset: offSet,
      // limit: excel === false ? Number(limit) : limit,
      order: [['product_id', 'DESC']]
    })

    const finalList =
    {
      bundleList: {
        count: productBundleCount,
        rows: finalBundleList
      },
      productList: {
        count: productCount,
        rows: productsList
      }
    }

    return {
      status: statusCodeConstants.SUCCESS,
      message: 'Success',
      data: finalList
    }
  }

  async getProductBundleMappingWebSelfCare(inputData, conn) {
    let { limit = defaultCode.lIMIT, page = defaultCode.PAGE, excel = false, filter } = inputData
    let offSet = (page * limit)
    if (excel) {
      offSet = undefined
      limit = undefined
    }
    console.log(1)
    const productBundleCount = await conn.ProductBundleHdr.count({
      where: {
        status: defaultStatus.ACTIVE
      }
    })
    console.log(2)
    const productBundleList = await conn.ProductBundleHdr.findAll({
      include: [
        {
          model: conn.ProductBundleDtl,
          as: 'productBundleDtl',
          include: [
            {
              model: conn.Product,
              as: 'productDtl',
              include: [
                {
                  model: conn.BusinessEntity,
                  as: 'serviceTypeDescription',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productTypeDescription',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productSubTypeDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productCategoryDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productSubCategoryDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.ProductCharge,
                  as: 'productChargesList'
                }
              ]
            }
          ]
        }
      ],
      where: {
        status: defaultStatus.ACTIVE
      }
      // offset: offSet,
      // limit: excel === false ? Number(limit) : limit,
    })
    console.log(3)
    const chargeList = await conn.ProductCharge.findAll({
      include: [
        {
          model: conn.Charge,
          as: 'chargeDetails',
          attributes: {
            exclude: [...commonExcludableAttrs]
          },
          include: [
            {
              model: conn.BusinessEntity,
              as: 'chargeCatDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'currencyDesc',
              attributes: ['code', 'description']
            }
          ]
        }
      ]
    })
    console.log(4)
    const termsList = await conn.TermsConditionsHdr.findAll({});
    console.log(5)
    const finalBundleList = []
    // console.log('=====================>', productBundleList)
    if (Array.isArray(productBundleList)) {
      for (const bundleList of productBundleList) {
        const detObj = {
          bundleName: bundleList.prodBundleName,
          productCategory: 'PC_BUNDLE',
          bundleId: bundleList.prodBundleId,
          contractFlag: bundleList.contractFlag,
          contractList: bundleList.contractList,
          bundleImage: bundleList.bundleImage,
          productBundleDtl: bundleList.productBundleDtl.map((bundleDet) => {
            const charges = bundleDet.useExistingCharge
              ? chargeList.filter(
                (c) => c.productId === bundleDet.productId && (!c.objectType && c.objectType === null) && (!c.objectReferenceId && c.objectReferenceId === null)
              )
              : chargeList.filter(
                (c) =>
                  c.objectType === 'TMC_PRODUCTBUNDLE' && Number(c.objectReferenceId) === Number(bundleList.prodBundleId) && Number(c.productId) === Number(bundleDet.productId)
              )
            const terms = termsList.filter((c) =>
              bundleDet?.termsList && bundleDet?.termsList?.includes(c.termId)
            )
            // console.log('========================================',JSON.stringify(charges))
            return {
              useExistingCharge: bundleDet.useExistingCharge,
              useExistingTerm: bundleDet.useExistingTerm,
              productDtl: bundleDet.productDtl,
              productId: bundleDet.productId,
              charges: charges.map(({ chargeId, chargeAmount, chargeDetails }) => ({
                chargeId,
                chargeAmount,
                chargeType: chargeDetails.chargeCat,
                currency: chargeDetails.currencyDesc.description
              })),
              terms: terms.map(
                ({ termId, termName, entityType, serviceType, termsContent }) => ({
                  termId,
                  termName,
                  entityType,
                  serviceType,
                  termsContent
                })
              )
            }
          })
        }

        // console.log('======================', detObj);

        finalBundleList.push(detObj)
      }
    }
    console.log(6)
    // const filterProductIds = []
    // for (const bundle of productBundleList) {
    //   for (const dtl of bundle.productBundleDtl) {
    //     filterProductIds.push(dtl.productDtl.productId)
    //   }
    // }
    const productCount = await conn.Product.count({
      where: {
        status: defaultStatus.ACTIVE,
        serviceClass: ['SC_CONSUMER', 'SC_BOTH']
      }
    })
    console.log(7)
    const productsList = await conn.Product.findAll({
      include: [
        {
          model: conn.BusinessEntity,
          as: 'serviceTypeDescription',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productTypeDescription',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productSubTypeDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productCategoryDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productSubCategoryDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.ProductCharge,
          as: 'productChargesList',
          attributes: {
            exclude: [...commonExcludableAttrs, 'glcode']
          },
          include: [
            {
              model: conn.Charge,
              as: 'chargeDetails',
              attributes: {
                exclude: [...commonExcludableAttrs]
              },
              include: [
                {
                  model: conn.BusinessEntity,
                  as: 'chargeCatDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'currencyDesc',
                  attributes: ['code', 'description']
                }
              ]
            }
          ]
        }
      ],
      where: {
        status: defaultStatus.ACTIVE,
        serviceClass: ['SC_CONSUMER', 'SC_BOTH']
        // productId: { [Op.notIn]: { filterProductIds } }
      },
      logging: true,
      // offset: offSet,
      // limit: excel === false ? Number(limit) : limit,
      order: [['product_id', 'DESC']]
    })
    console.log(8)
    const finalList =
    {
      bundleList: {
        count: productBundleCount,
        rows: finalBundleList
      },
      productList: {
        count: productCount,
        rows: productsList
      }
    }
    console.log(9)
    return {
      status: statusCodeConstants.SUCCESS,
      message: 'Success',
      data: finalList
    }
  }

  async getRecommendedPlans(inputData, conn) {
    const PAGE_SIZE = 6; // Set the number of records per page
    const currentPage = 1;

    const { customerId, source } = inputData;
    let productWhere = {
      status: defaultStatus.ACTIVE,
      serviceClass: ['SC_CONSUMER', 'SC_BOTH']
    }
    let bundleWhere = {}
    if (source === "HOME") {
      const sTypeIntxn = await conn.Interaction.findAll({
        attributes: ['serviceType'],
        where: {
          customerId
        },
        raw: true
      });

      const sType = await conn.Orders.findAll({
        attributes: ['serviceType'],
        where: {
          customerId
        },
        raw: true
      });
      const stIntxn = sTypeIntxn?.map((ele) => ele?.serviceType) || [];
      const stOrder = sType?.map((ele) => ele?.serviceType) || [];
      const combinedSt = [...stIntxn, ...stOrder];
      const uniqueServiceTypes = [...new Set(combinedSt)].filter(Boolean);
      if (uniqueServiceTypes?.length > 0) {
        productWhere.serviceType = {
          [Op.in]: uniqueServiceTypes
        }
      }
    } else if (source === "CART") {
      const data = await conn.Cart.findAll({
        attributes: ['cartItems'],
        where: {
          customerId
        },
        raw: true
      });
      if (data?.length > 0) {
        const cart = data[0]?.cartItems;
        const st = cart?.map((ele) => ele?.serviceType) || []
        const uniqueServiceTypes = [...new Set(st)].filter(Boolean);
        if (uniqueServiceTypes?.length > 0) {
          productWhere.serviceType = {
            [Op.in]: uniqueServiceTypes
          }
        }
      }
    }

    console.log('productWhere------>', productWhere)

    const productBundleCount = await conn.ProductBundleHdr.count({
      where: {
        status: defaultStatus.ACTIVE
      },
    })

    const productBundleList = await conn.ProductBundleHdr.findAll({
      include: [
        {
          model: conn.ProductBundleDtl,
          as: 'productBundleDtl',
          include: [
            {
              model: conn.Product,
              as: 'productDtl',
              include: [
                {
                  model: conn.BusinessEntity,
                  as: 'serviceTypeDescription',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productTypeDescription',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productSubTypeDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productCategoryDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'productSubCategoryDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.ProductCharge,
                  as: 'productChargesList'
                }
              ]
            }
          ]
        }
      ],
      where: {
        status: defaultStatus.ACTIVE
      },
      offset: (currentPage - 1) * PAGE_SIZE, // Calculate the offset based on the current page number
      limit: PAGE_SIZE,
    })

    const chargeList = await conn.ProductCharge.findAll({
      include: [
        {
          model: conn.Charge,
          as: 'chargeDetails',
          attributes: {
            exclude: [...commonExcludableAttrs]
          },
          include: [
            {
              model: conn.BusinessEntity,
              as: 'chargeCatDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'currencyDesc',
              attributes: ['code', 'description']
            }
          ]
        }
      ]
    })

    const termsList = await conn.TermsConditionsHdr.findAll({})
    const finalBundleList = []
    if (Array.isArray(productBundleList)) {
      for (const bundleList of productBundleList) {
        const detObj = {
          bundleName: bundleList.prodBundleName,
          productCategory: 'PC_BUNDLE',
          bundleId: bundleList.prodBundleId,
          contractFlag: bundleList.contractFlag,
          contractList: bundleList.contractList,
          contractList: bundleList.contractList,
          bundleImage: bundleList.bundleImage,
          productBundleDtl: bundleList.productBundleDtl.map((bundleDet) => {
            const charges = bundleDet.useExistingCharge
              ? chargeList.filter(
                (c) => c.productId === bundleDet.productId && (!c.objectType && c.objectType === null) && (!c.objectReferenceId && c.objectReferenceId === null)
              )
              : chargeList.filter(
                (c) =>
                  c.objectType === 'TMC_PRODUCTBUNDLE' && Number(c.objectReferenceId) === Number(bundleList.prodBundleId) && Number(c.productId) === Number(bundleDet.productId)
              )
            const terms = termsList.filter((c) =>
              bundleDet?.termsList && bundleDet?.termsList?.includes(c.termId)
            )
            // console.log('========================================',JSON.stringify(charges))
            return {
              useExistingCharge: bundleDet.useExistingCharge,
              useExistingTerm: bundleDet.useExistingTerm,
              productDtl: bundleDet.productDtl,
              productId: bundleDet.productId,
              charges: charges.map(({ chargeId, chargeAmount, chargeDetails }) => ({
                chargeId,
                chargeAmount,
                chargeType: chargeDetails.chargeCat,
                currency: chargeDetails.currencyDesc.description
              })),
              terms: terms.map(
                ({ termId, termName, entityType, serviceType, termsContent }) => ({
                  termId,
                  termName,
                  entityType,
                  serviceType,
                  termsContent
                })
              )
            }
          })
        }
        finalBundleList.push(detObj)
      }
    }

    const productCount = await conn.Product.count({
      where: productWhere
    })

    const productsList = await conn.Product.findAll({
      include: [
        {
          model: conn.BusinessEntity,
          as: 'serviceTypeDescription',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productTypeDescription',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productSubTypeDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productCategoryDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'productSubCategoryDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.ProductCharge,
          as: 'productChargesList',
          attributes: {
            exclude: [...commonExcludableAttrs, 'glcode']
          },
          include: [
            {
              model: conn.Charge,
              as: 'chargeDetails',
              attributes: {
                exclude: [...commonExcludableAttrs]
              },
              include: [
                {
                  model: conn.BusinessEntity,
                  as: 'chargeCatDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'currencyDesc',
                  attributes: ['code', 'description']
                }
              ]
            }
          ]
        }
      ],
      where: productWhere,
      order: [['product_id', 'DESC']],
      offset: (currentPage - 1) * PAGE_SIZE, // Calculate the offset based on the current page number
      limit: PAGE_SIZE,
    })

    const finalList = {
      bundleList: {
        count: productBundleCount,
        rows: finalBundleList
      },
      productList: {
        count: productCount,
        rows: productsList
      }
    }
    return {
      status: statusCodeConstants.SUCCESS,
      message: 'Success',
      data: finalList
    }
  }

  async getPromoDetails(details, conn) {
    try {
      const promoDetails = await conn.PromoHdr.findAll({
        include: [
          {
            model: conn.PromoDtl,
            as: 'promoDtl',
            include: [
              {
                model: conn.Product,
                as: 'productDtl'
              }
            ]
          },
          {
            model: conn.ProductCharge,
            as: 'promoCharge',
            where: {
              objectType: 'TMC_PROMOCODE'
            },
            required: false
          }
        ],
        where: {
          endDate: {
            [Op.gte]: moment(new Date()).format('YYYY-MM-DD'),
            // [Op.lte]: createdate + month
          },
          status: defaultStatus.ACTIVE,
          promoCode: {
            [Op.ne]: null
          }
        },
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: promoDetails
      }
    } catch (err) {
      logger.error(err)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error--service error'
      }
    }
  }

  async getProductDetails(payload, conn) {
    try {
      const { type, serviceUuid } = payload

      if (!type || !serviceUuid) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingService = await conn.CustServices.findOne({
        where: {
          serviceUuid
        }
      })

      if (!checkExistingService) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Service is not available'
        }
      }
      checkExistingService = checkExistingService?.dataValues ? checkExistingService?.dataValues : checkExistingService

      const getServiceProduct = await this.getProducts(conn, { productId: checkExistingService?.planPayload }).then((resp) => {
        return resp?.status === 200 ? resp?.data : []
      })

      let response = []
      if (getServiceProduct && Array?.isArray(getServiceProduct) && getServiceProduct.length > 0) {
        // const searchParam = {
        //   chargeCategory: 'CC_RC',
        //   charge:{
        //     chargeAmount: getServiceProduct?.[0].productChargesList.filter(e=>e.chargeDetails.chargeCat === 'CC_RC').map(f=>  f.chargeAmount),
        //     operators: type === 'upgrade' ? 'gte' : type === 'downgrade' ? 'lte':''
        //   }
        // }

        const searchParam = {
          productFamily: getServiceProduct?.[0]?.productFamily,
          productCategory: getServiceProduct?.[0]?.productCategory,
          productSubCategory: getServiceProduct?.[0]?.productSubCategory,
          productType: getServiceProduct?.[0]?.productType,
          productSubType: getServiceProduct?.[0]?.productSubType,
          serviceType: getServiceProduct?.[0]?.serviceType
        }
        response = await this.getProducts(conn, searchParam).then((resp) => {
          console.log(resp)
          return resp?.status === 200 ? resp?.data : []
        })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Product Details fetched Successfully',
        data: {
          currentProduct: getServiceProduct,
          productList: response
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error--service error'
      }
    }
  }

  async getTermsDetails(details, conn) {
    try {
      const termDetails = await conn.TermsConditionsHdr.findAll({
        where: {
          status: defaultStatus.ACTIVE,
          termId: details.termsList
        },
        logging: true
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: termDetails
      }
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = ProductService
