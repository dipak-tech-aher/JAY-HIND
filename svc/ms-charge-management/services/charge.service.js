import { sequelize } from '@models'
import { defaultCode, statusCodeConstants, defaultStatus } from '@utils'
import { isEmpty } from 'lodash'
import { Op } from 'sequelize'
const { v4: uuidv4 } = require("uuid");

const { getConnection } = require('@services/connection-service')
let instance

class ChargeService {
  constructor() {
    if (!instance) {
      instance = this
    }
    return instance
  }

  async createCharge(charge, departmentId, roleId, userId) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId,
      };

      const checkName = await conn.Charge.findAll({
        where: { chargeName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('charge_name')), '=', charge.chargeName.toLowerCase()) }
      })
      if (!isEmpty(checkName)) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Charge name already exist'
        }
      }
      const data = {
        chargeName: charge.chargeName,
        chargeCat: charge.chargeCat,
        serviceType: charge.serviceType,
        currency: charge.currency,
        startDate: charge.startDate,
        glcode: charge.glcode,
        status: charge.status || defaultStatus.ACTIVE,
        ...commonAttrib
      }
      if (charge.endDate !== '' && charge.endDate !== undefined) {
        data.endDate = charge.endDate
      }
      const response = await conn.Charge.create(data, { transaction: t })
      if (!response) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Internal server error'
        }
      }
      await t.commit()
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Sucessfully Charge Created',
        data: response
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async getChargeById(charge) {
    try {
      const chargeId = charge?.id
      const conn = await getConnection()

      const reqData = await conn.Charge.findOne(
        {
          include: [
            { model: conn.BusinessEntity, attributes: [], as: 'chargeCatDesc' },
            { model: conn.BusinessEntity, attributes: [], as: 'currencyDesc' },
            { model: conn.BusinessEntity, attributes: [], as: 'serviceTypeDesc' },
            { model: conn.BusinessEntity, attributes: [], as: 'statusDesc' },
            { model: conn.User, attributes: [], as: 'createdByUser' },
            { model: conn.User, attributes: [], as: 'updatedByUser' }
          ],
          attributes: [
            'chargeId', 'chargeName', 'startDate', 'endDate', 'glcode', 'chargeCat', 'currency', 'serviceType', 'status', 'createdAt', 'updatedAt',
            [sequelize.literal('"chargeCatDesc"."description"'), 'chargeCatDes'],
            [sequelize.literal('"currencyDesc"."description"'), 'currencyDes'],
            [sequelize.literal('"serviceTypeDesc"."description"'), 'serviceTypeDes'],
            [sequelize.literal('"statusDesc"."description"'), 'statusDes'],
            [sequelize.literal('"createdByUser"."first_name"'), 'createdUser'],
            [sequelize.literal('"updatedByUser"."first_name"'), 'updatedUser']

          ],
          where: { chargeId }
        })
      if (!reqData) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Charge Details not found'
        }
      }
      return {
        status: statusCodeConstants.NOT_FOUND,
        message: 'Successfully fetch charges data',
        data: reqData
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getChargeByName() {
    try {
      const conn = await getConnection()
      const reqData = await conn.Charge.findAll({
        include: [
          { model: conn.BusinessEntity, as: 'chargeCatDesc', attributes: ['description'] },
          { model: conn.BusinessEntity, as: 'currencyDesc', attributes: ['description'] }
        ],
        // where: { status: defaultStatus.ACTIVE },
        order: [['chargeId', 'DESC']]
      })
      if (!reqData) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Charge Details not found'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch charges data',
        data: reqData
      }
    } catch (error) {
      console.log(error)

      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getChargeByList(chargeData) {
    try {
      let { limit = defaultCode.lIMIT, page = defaultCode.PAGE, excel = false, name, filter } = chargeData
      const conn = await getConnection()
      let offSet = (page * limit)
      if (excel) {
        offSet = undefined
        limit = undefined
      }

      let whereClause = {}
      let chargeCatDesc
      let whereCreatedBy
      let whereUpdatedBy
      let statusDesc

      if (name) {
        whereClause = {
          chargeName: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('charge_name')), 'LIKE', '%' + name.toLowerCase() + '%')
        }
      }
      if (filter && Array.isArray(filter) && !isEmpty(filter)) {
        for (const record of filter) {
          if (record.value) {
            if (record.id === 'chargeId') {
              whereClause.chargeId = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.cast(conn.sequelize.col('Charge.charge_id'), 'varchar'), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value}%`
                })]
              }
            } else if (record.id === 'chargeName') {
              whereClause.chargeName = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Charge.charge_name')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            } else if (record.id === 'serviceType') {
              whereClause.serviceType = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Charge.service_type')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            } else if (record.id === 'chargeCatDes') {
              chargeCatDesc = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('description')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
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
            } else if (record.id === 'currency') {
              whereClause.currency = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Charge.currency')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            } else if (record.id === 'glcode') {
              whereClause.glcode = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Charge.glcode')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            } else if (record.id === 'chargeStatus') {
              statusDesc = {
                [Op.and]: [conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('statusDesc.description')), {
                  [record.filter === 'contains' ? Op.like : Op.notLike]: `%${record.value.toUpperCase()}%`
                })]
              }
            }
          }
        }
      }

      const charge = await conn.Charge.findAndCountAll({
        include: [
          { model: conn.BusinessEntity, attributes: [], as: 'chargeCatDesc', where: chargeCatDesc },
          { model: conn.BusinessEntity, attributes: [], as: 'currencyDesc' },
          { model: conn.BusinessEntity, attributes: [], as: 'serviceTypeDesc' },
          { model: conn.BusinessEntity, attributes: [], as: 'statusDesc', where: statusDesc },
          { model: conn.User, attributes: [], as: 'createdByUser', where: whereCreatedBy, subQuery: false },
          { model: conn.User, attributes: [], as: 'updatedByUser', where: whereUpdatedBy, subQuery: false }
        ],
        attributes: [
          'chargeId', 'chargeName', 'startDate', 'endDate', 'glcode', 'chargeCat', 'currency', 'serviceType', 'status', 'createdAt', 'updatedAt',
          [conn.sequelize.literal('"chargeCatDesc"."description"'), 'chargeCatDes'],
          [conn.sequelize.literal('"currencyDesc"."description"'), 'currencyDes'],
          [conn.sequelize.literal('"serviceTypeDesc"."description"'), 'serviceTypeDes'],
          [conn.sequelize.literal('"statusDesc"."description"'), 'statusDes'],
          [conn.sequelize.literal('"createdByUser"."first_name"'), 'createdUser'],
          [conn.sequelize.literal('"updatedByUser"."first_name"'), 'updatedUser']
        ],
        where: whereClause,
        order: [['chargeId', 'DESC']],
        offset: offSet,
        limit: excel === false ? Number(limit) : limit
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch charges data',
        data: charge
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateCharge(charge, userId) {
    const conn = await getConnection()
    const t = await conn.sequelize.transaction()
    try {
      const { chargeId } = charge
      const existingInfo = await conn.Charge.findOne({ where: { chargeId } })
      if (!existingInfo) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'charge details not found'
        }
      }
      charge.updatedBy = userId
      const response = await conn.Charge.update(charge, { where: { chargeId }, transaction: t })
      if (isEmpty(response)) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Internal server error'
        }
      }
      await t.commit()
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Charge updated Successfully'
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
}

module.exports = ChargeService
