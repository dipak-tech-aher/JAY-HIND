import { constantCode, orderType, statusCodeConstants, logger } from '@utils'
import { v4 as uuidv4 } from 'uuid'
import { Op } from 'sequelize'
import { config } from '@config/env.config'
import moment from 'moment'

let instance

class ContractService {
  constructor (conn) {
    if (!instance) {
      instance = this
    }
    instance.conn = conn
    return instance
  }

  async createContract (orderObj, serviceObj, accountObj, customerObj, loggedUser, t) {
    try {
      const orderedProducts = await this.conn.Product.findAll({
        where: {
          productId: orderObj.orderProductDtls.map(x => x.productId),
          status: constantCode.status.ACTIVE
        },
        include: [{
          model: this.conn.ProductCharge,
          as: 'productChargesList',
          include: [{
            model: this.conn.Charge, as: 'chargeDetails'
          }]
        }]
      })

      const contractStatus = constantCode.contractStatus.OPEN
      const orderDetails = orderObj.orderProductDtls
      const contractDetails = []

      const existingContract = await this.conn.Contract.findOne({
        include: [
          {
            model: this.conn.ContractDtl,
            as: 'contractDetail'
          }
        ],
        where: {
          soId: (orderObj.isBundleOrder && !orderObj.isSplitOrder) ? orderObj.parentOrderId : orderObj.orderId
        }
      })

      /** ******************Srini commented this entire loop to address the right amount and contract */
      // for (const orderedProduct of orderedProducts) {
      //   if (orderedProduct.contractFlag == 'Y') {
      //     const orderDetail = orderDetails.find(x => x.productId == orderedProduct.productId)

      //     const actualStartDate = new Date()
      //     const actualEndDate = new Date().setMonth(new Date().getMonth() + orderedProduct.contractInMonths)

      //     const contractData = {
      //       contractName: orderedProduct.productName,
      //       status: contractStatus,
      //       plannedStartDate: actualStartDate,
      //       plannedEndDate: actualEndDate,
      //       actualStartDate,
      //       nextBillPeriod: actualStartDate,
      //       actualEndDate,
      //       rcAmount: 0,
      //       otcAmount: 0,
      //       billRefNo: customerObj.customerUuid,
      //       customerId: customerObj.customerId,
      //       customerUuid: customerObj.customerUuid,
      //       serviceId: serviceObj.serviceId,
      //       serviceUuid: serviceObj.serviceUuid,
      //       accountId: accountObj.accountId,
      //       accountUuid: accountObj.accountUuid,
      //       soId: orderObj.orderId,
      //       contractUuid: uuidv4(),
      //       tranId: uuidv4(),
      //       createdDeptId: loggedUser.departmentId,
      //       createdRoleId: loggedUser.roleId,
      //       createdBy: loggedUser.userId,
      //       createdAt: new Date()
      //     }

      //     orderedProduct.productChargesList.forEach(x => {
      //       if (x.chargeDetails.chargeCat === 'CC_RC') {
      //         contractData.rcAmount = Number(contractData.rcAmount) + Number(x.chargeAmount)
      //       } else if (x.chargeDetails.chargeCat === 'CC_NRC') {
      //         contractData.otcAmount = Number(contractData.otcAmount) + Number(x.chargeAmount)
      //       }
      //     })

      //     const contractCreated = await this.conn.Contract.create(contractData, { transaction: t })

      //     if (orderedProduct.productChargesList.length > 0) {
      //       orderedProduct.productChargesList.forEach(x => {
      //         const contractDetailsData = {
      //           contractId: contractCreated.contractId,
      //           status: contractStatus,
      //           plannedStartDate: actualStartDate,
      //           plannedEndDate: actualEndDate,
      //           actualStartDate,
      //           actualEndDate,
      //           nextBillPeriod: actualStartDate,
      //           balanceAmount: x.chargeAmount,
      //           frequency: x.frequency,
      //           durationMonth: orderedProduct.contractInMonths,
      //           productId: orderedProduct.productId,
      //           chargeId: x.chargeDetails.chargeId,
      //           chargeAmt: x.chargeAmount,
      //           chargeType: x.chargeDetails.chargeCat,
      //           orderId: orderObj.orderId,
      //           orderDtlId: orderDetail.orderDtlId,
      //           soId: orderObj.orderId,
      //           contractUuid: contractData.contractUuid,
      //           productUuid: orderedProduct.productUuid,
      //           contractDtlUuid: uuidv4(),
      //           orderUuid: orderObj.orderUuid,
      //           orderDtlUuid: orderDetail.orderDtlUuid,
      //           tranId: uuidv4(),
      //           createdDeptId: loggedUser.departmentId,
      //           createdRoleId: loggedUser.roleId,
      //           createdBy: loggedUser.userId,
      //           createdAt: new Date(),
      //           upfrontPayment: orderObj.upfrontCharge,
      //           prorated: orderObj.prorated,
      //         }

      //         contractDetails.push(contractDetailsData)
      //       })
      //     } else {
      //       contractDetails.push({
      //         contractId: contractCreated.contractId,
      //         status: constantCode.contractStatus.CLOSED,
      //         plannedStartDate: actualStartDate,
      //         plannedEndDate: actualEndDate,
      //         actualStartDate,
      //         actualEndDate,

      //         nextBillPeriod: actualEndDate,
      //         balanceAmount: 0,

      //         // frequency: "",
      //         durationMonth: orderedProduct.contractInMonths,
      //         productId: orderedProduct.productId,
      //         // chargeId: "",
      //         // chargeAmt: "",
      //         // chargeType: "",
      //         orderId: orderObj.orderId,
      //         orderDtlId: orderDetail.orderDtlId,
      //         soId: orderObj.orderId,
      //         contractUuid: contractData.contractUuid,
      //         productUuid: orderedProduct.productUuid,
      //         contractDtlUuid: uuidv4(),
      //         orderUuid: orderObj.orderUuid,
      //         orderDtlUuid: orderDetail.orderDtlUuid,
      //         tranId: uuidv4(),
      //         createdDeptId: loggedUser.departmentId,
      //         createdRoleId: loggedUser.roleId,
      //         createdBy: loggedUser.userId,
      //         createdAt: new Date(),
      //         upfrontPayment: orderObj.upfrontCharge,
      //         prorated: orderObj.prorated,
      //       })
      //     }
      //   }
      // }
      for (const orderedProduct of orderedProducts) {
        const orderDetail = orderDetails.find(x => x.productId == orderedProduct.productId)
        let contractCreated = null; let actualStartDate = null; let actualEndDate = null

        let hasPenalty = false; let penaltyAmount = 0; let penaltyChargeDetail
        if ([orderType.upgrade, orderType.downgrade].includes(orderObj.orderType)) {
          hasPenalty = true

          const termsAndConditions = await this.conn.TermsConditionsHdr.findAll({
            where: {
              termId: { [Op.in]: orderedProduct.termsList }
            },
            include: [
              {
                model: this.conn.Charge,
                as: 'chargeDtl'
              }
            ]
          })

          penaltyChargeDetail = termsAndConditions.find(x => {
            return (
              x.contractImpact === true &&
              x.entityType == orderObj.orderType &&
              x.serviceType == orderedProduct.serviceType &&
              orderedProduct?.termsList?.includes(x.termId)
            )
          })

          if (penaltyChargeDetail) {
            penaltyAmount = penaltyChargeDetail?.chargeDtl?.chargeAmount ?? 0
          }
        }

        // console.log('orderObj.isBundleOrder && !orderObj.isSplitOrder ', orderObj.isBundleOrder, orderObj.isSplitOrder)
        if (orderObj.isBundleOrder && !orderObj.isSplitOrder) {
          // console.log('existingContract   ', existingContract)
          if (existingContract) {
            actualEndDate = moment(new Date().setMonth(new Date(existingContract.actualEndDate).getMonth() + orderDetail.contractMonths)).format('YYYY-MM-DD')
            actualStartDate = moment(new Date()).format('YYYY-MM-DD')
            const contractData = {
              plannedEndDate: actualEndDate,
              actualEndDate,
              rcAmount: Number(existingContract.rcAmount) + Number(orderDetail.rcAmount),
              otcAmount: Number(existingContract.otcAmount) + Number(orderDetail.nrcAmount)
            }
            // console.log('contractData========================================', JSON.stringify(contractData))
            await this.conn.Contract.update(contractData, {
              where: {
                soId: orderObj.parentOrderId
              },
              transaction: t
            })

            contractCreated = existingContract
          } else {
            actualStartDate = moment(new Date()).format('YYYY-MM-DD')
            actualEndDate = moment(new Date().setMonth(new Date().getMonth() + orderDetail.contractMonths)).format('YYYY-MM-DD')

            const contractData = {
              contractName: orderedProduct.productName,
              status: contractStatus,
              plannedStartDate: actualStartDate,
              plannedEndDate: actualEndDate,
              actualStartDate,
              nextBillPeriod: actualStartDate,
              actualEndDate,
              rcAmount: orderDetail.rcAmount ? Number(orderDetail.rcAmount) : Number(orderObj.rcAmount),
              otcAmount: orderDetail.nrcAmount ? Number(orderDetail.nrcAmount) : Number(orderObj.nrcAmount),
              billRefNo: customerObj.customerNo,
              customerId: customerObj.customerId,
              customerUuid: customerObj.customerUuid,
              serviceId: serviceObj.serviceId,
              serviceUuid: serviceObj.serviceUuid,
              accountId: accountObj.accountId,
              accountUuid: accountObj.accountUuid,
              soId: orderObj.parentOrderId,
              contractUuid: uuidv4(),
              tranId: uuidv4(),
              createdDeptId: loggedUser.departmentId,
              createdRoleId: loggedUser.roleId,
              createdBy: loggedUser.userId,
              createdAt: new Date()
            }
            // console.log('contractData========================================', JSON.stringify(contractData))
            contractCreated = await this.conn.Contract.create(contractData, { transaction: t })
          }
        } else {
          actualStartDate = moment(new Date()).format('YYYY-MM-DD')
          actualEndDate = moment(new Date().setMonth(new Date().getMonth() + orderDetail.contractMonths)).format('YYYY-MM-DD')

          const contractData = {
            contractName: orderedProduct.productName,
            status: contractStatus,
            plannedStartDate: actualStartDate,
            plannedEndDate: actualEndDate,
            actualStartDate,
            nextBillPeriod: actualStartDate,
            actualEndDate,
            rcAmount: orderDetail.rcAmount ? Number(orderDetail.rcAmount) : Number(orderObj.rcAmount),
            otcAmount: orderDetail.nrcAmount ? Number(orderDetail.nrcAmount) : Number(orderObj.nrcAmount),
            billRefNo: customerObj.customerNo,
            customerId: customerObj.customerId,
            customerUuid: customerObj.customerUuid,
            serviceId: serviceObj.serviceId,
            serviceUuid: serviceObj.serviceUuid,
            accountId: accountObj.accountId,
            accountUuid: accountObj.accountUuid,
            soId: orderObj.orderId,
            contractUuid: uuidv4(),
            tranId: uuidv4(),
            createdDeptId: loggedUser.departmentId,
            createdRoleId: loggedUser.roleId,
            createdBy: loggedUser.userId,
            createdAt: new Date()
          }
          // console.log('contractData========================================', JSON.stringify(contractData))
          contractCreated = await this.conn.Contract.create(contractData, { transaction: t })
        }

        if (contractCreated) {
          if (orderedProduct.productChargesList.length > 0) {
            orderedProduct.productChargesList.forEach(x => {
              // console.log(orderObj.isBundleOrder, x.objectReferenceId, orderDetail.prodBundleId)
              const contractPeriod = orderDetail.contractMonths ? orderDetail.contractMonths : orderedProduct.contractInMonths
              if (orderObj.isBundleOrder === false) {
                if (!x.objectReferenceId || x.objectReferenceId === null) {
                  const contractDetailsData = {
                    contractId: contractCreated.contractId,
                    status: contractStatus,
                    plannedStartDate: actualStartDate,
                    plannedEndDate: actualEndDate,
                    actualStartDate,
                    actualEndDate,
                    nextBillPeriod: actualStartDate,
                    balanceAmount: x.chargeDetails.chargeCat === 'CC_RC' ? (Number(orderDetail.rcAmount) * Number(contractPeriod)) : x.chargeDetails.chargeCat === 'CC_NRC' ? orderDetail.nrcAmount : x.billAmount,
                    frequency: x.frequency || null,
                    durationMonth: contractPeriod,
                    productId: orderedProduct.productId,
                    chargeId: x.chargeId,
                    chargeAmt: x.chargeDetails.chargeCat === 'CC_RC' ? orderDetail.rcAmount : x.chargeDetails.chargeCat === 'CC_NRC' ? orderDetail.nrcAmount : 0,
                    chargeType: x.chargeDetails.chargeCat,
                    orderId: orderObj.orderId,
                    orderDtlId: orderDetail.orderDtlId,
                    soId: orderObj.parentOrderId,
                    contractUuid: contractCreated.contractUuid,
                    productUuid: orderedProduct.productUuid,
                    contractDtlUuid: uuidv4(),
                    orderUuid: orderObj.orderUuid,
                    orderDtlUuid: orderDetail.orderDtlUuid,
                    tranId: uuidv4(),
                    createdDeptId: loggedUser.departmentId,
                    createdRoleId: loggedUser.roleId,
                    createdBy: loggedUser.userId,
                    createdAt: new Date(),
                    upfrontPayment: orderObj.upfrontCharge,
                    prorated: orderObj.prorated,
                    quantity: orderDetail.productQuantity
                  }

                  contractDetails.push(contractDetailsData)
                }
              } else if (orderObj.isBundleOrder) {
                if (x.objectReferenceId == orderDetail.prodBundleId) {
                  const contractDetailsData = {
                    contractId: contractCreated.contractId,
                    status: contractStatus,
                    plannedStartDate: actualStartDate,
                    plannedEndDate: actualEndDate,
                    actualStartDate,
                    actualEndDate,
                    nextBillPeriod: actualStartDate,
                    balanceAmount: x.chargeDetails.chargeCat === 'CC_RC' ? (Number(orderDetail.rcAmount) * Number(contractPeriod)) : x.chargeDetails.chargeCat === 'CC_NRC' ? orderDetail.nrcAmount : x.billAmount,
                    frequency: x.frequency || null,
                    durationMonth: contractPeriod,
                    productId: orderedProduct.productId,
                    chargeId: x.chargeId,
                    chargeAmt: x.chargeDetails.chargeCat === 'CC_RC' ? orderDetail.rcAmount : x.chargeDetails.chargeCat === 'CC_NRC' ? orderDetail.nrcAmount : 0,
                    chargeType: x.chargeDetails.chargeCat,
                    orderId: orderObj.orderId,
                    orderDtlId: orderDetail.orderDtlId,
                    soId: orderObj.parentOrderId,
                    contractUuid: contractCreated.contractUuid,
                    productUuid: orderedProduct.productUuid,
                    contractDtlUuid: uuidv4(),
                    orderUuid: orderObj.orderUuid,
                    orderDtlUuid: orderDetail.orderDtlUuid,
                    tranId: uuidv4(),
                    createdDeptId: loggedUser.departmentId,
                    createdRoleId: loggedUser.roleId,
                    createdBy: loggedUser.userId,
                    createdAt: new Date(),
                    upfrontPayment: orderObj.upfrontCharge,
                    prorated: orderObj.prorated,
                    quantity: orderDetail.productQuantity
                  }

                  contractDetails.push(contractDetailsData)
                }
              }
            })

            if (hasPenalty && penaltyChargeDetail) {
              contractDetails.push({
                contractId: contractCreated.contractId,
                status: contractStatus,
                plannedStartDate: actualStartDate,
                plannedEndDate: actualEndDate,
                actualStartDate,
                actualEndDate,
                nextBillPeriod: actualStartDate,
                balanceAmount: orderObj.billAmount,
                frequency: null,
                durationMonth: orderedProduct.contractInMonths,
                productId: orderedProduct.productId,
                chargeId: penaltyChargeDetail?.chargeDtl?.chargeId,
                chargeAmt: penaltyAmount,
                chargeType: 'CC_NRC',
                orderId: orderObj.orderId,
                orderDtlId: orderDetail.orderDtlId,
                soId: orderObj.parentOrderId,
                contractUuid: contractCreated.contractUuid,
                productUuid: orderedProduct.productUuid,
                contractDtlUuid: uuidv4(),
                orderUuid: orderObj.orderUuid,
                orderDtlUuid: orderDetail.orderDtlUuid,
                tranId: uuidv4(),
                createdDeptId: loggedUser.departmentId,
                createdRoleId: loggedUser.roleId,
                createdBy: loggedUser.userId,
                createdAt: new Date(),
                upfrontPayment: orderObj.upfrontCharge,
                prorated: orderObj.prorated,
                quantity: orderDetail.productQuantity
              })
            }
          } else {
            contractDetails.push({
              contractId: contractCreated.contractId,
              status: constantCode.contractStatus.CLOSED,
              plannedStartDate: actualStartDate,
              plannedEndDate: actualEndDate,
              actualStartDate,
              actualEndDate,
              nextBillPeriod: actualEndDate,
              balanceAmount: orderObj.billAmount,
              // frequency: "",
              durationMonth: orderedProduct.contractInMonths,
              productId: orderedProduct.productId,
              // chargeId: "",
              chargeAmt: orderObj.billAmount,
              chargeType: 'CC_NRC',
              orderId: orderObj.orderId,
              orderDtlId: orderDetail.orderDtlId,
              soId: orderObj.parentOrderId,
              contractUuid: contractCreated.contractUuid,
              productUuid: orderedProduct.productUuid,
              contractDtlUuid: uuidv4(),
              orderUuid: orderObj.orderUuid,
              orderDtlUuid: orderDetail.orderDtlUuid,
              tranId: uuidv4(),
              createdDeptId: loggedUser.departmentId,
              createdRoleId: loggedUser.roleId,
              createdBy: loggedUser.userId,
              createdAt: new Date(),
              upfrontPayment: orderObj.upfrontCharge,
              prorated: orderObj.prorated,
              quantity: orderDetail.productQuantity
            })
          }
        }
      }
      // console.log('contractDetails================', JSON.stringify(contractDetails))
      // console.log(dd)
      await this.conn.ContractDtl.bulkCreate(contractDetails, { transaction: t })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Contract generated successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in creating contract'
      }
    }
  }
}

module.exports = ContractService
