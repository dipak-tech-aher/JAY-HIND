/* eslint-disable array-callback-return */
import { defaultStatus, logger, statusCodeConstants, defaultCode, defaultMessage } from '@utils'
import { QueryTypes, Op } from 'sequelize'
import { _, isEmpty } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import moment from 'moment'

let instance
const commonExcludableAttrs = ['createdDeptId', 'createdRoleId', 'tranId', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']

class InventoryService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  /** *******Inventory Module-List-Srinivasan.N-19-Sep-2023 *****/
  async getInventoryItemList(conn, searchParam) {
    try {
      const whereObj = {
        status: defaultStatus.ACTIVE
      }

      const itemList = await conn.Product.findAll({
        where: whereObj,
        attributes: {
          exclude: [...commonExcludableAttrs,]
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

  /** *******Inventory Module-Update-Srinivasan.N-19-Sep-2023 *****/
  async createInventoryItem(inputData, userId, roleId, departmentId, conn, t) {
    try {
      const guid = uuidv4()
      const commonAttrib = {
        tranId: guid,
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }

      const invItemHdrData = {
        ...inputData,
        invItemUuid: uuidv4(),
        ...commonAttrib
      }

      // console.log('invItemData ', invItemHdrData)

      const product = await conn.InvItemHdr.create(invItemHdrData, {
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

  /** *******Inventory Module-Update-Srinivasan.N-19-Sep-2023 *****/
  async updateInventoryItem(inputData, userId, roleId, departmentId, conn, t) {
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
}

module.exports = InventoryService
