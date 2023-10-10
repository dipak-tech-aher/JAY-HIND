/* eslint-disable camelcase */
import orderResources from '@resources'
import {
  CryptoHelper, constantCode, generateString, defaultMessage, entityCategory, logger,
  orderFlowAction, orderType, productFields, statusCodeConstants, camelCaseConversion, defaultStatus
} from '@utils'
import { isEmpty, _ } from 'lodash'
import { Op, QueryTypes, json } from 'sequelize'
import { db } from '@models'
import { v4 as uuidv4 } from 'uuid'
import { assignWFToEntity, getOrderWF, getWFState, startWorkFlowEngineManual, updateWFState } from './workflow.service'
import ContractService from './contract.service'
import { config } from '@config/env.config'
import em from '@emitters'
import moment from 'moment'
import axios from 'axios'

const {
  systemUserId, systemRoleId, systemDeptId, roleProperties,
  domainURL, systemWebSelfCareRoleId, systemWebSelfCareDeptId,
  bcae: bcaeConfig
} = config

const commonExcludableAttrs = ['createdDeptId', 'createdRoleId', 'tranId', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']

let instance

class OrderService {
  constructor () {
    if (!instance) {
      instance = this
    }
    instance.cryptoHelper = new CryptoHelper()
    return instance
  }

  async createOrUpdateAddress (body, userId, roleId, departmentId, conn, t) {
    try {
      const tranId = uuidv4()
      const commonAttris = {
        status: defaultStatus.ACTIVE,
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId,
        tranId
      }
      if (body?.body?.action === 'ADD') {
        const addressDetails = await conn.Address.create({ ...body?.body, ...commonAttris }, { transaction: t })
        console.log('addressDetails----->', addressDetails)
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Address Created Successfully',
          data: addressDetails
        }
      } else if (body?.body?.action === 'UPDATE') {
        const updatedAddress = await conn.Address.update(body, { where: { addressNo: body?.addressNo }, returning: true, plain: true, transaction: t })
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Address updated Successfully',
          data: updatedAddress
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getServiceTypeCategory (body, conn) {
    try {
      console.log('body------>', body)
      if (body?.tranType === 'Order' || body?.tranType === 'ORDER') {
        const responseData = await conn.Orders.findAll({
          attributes: ['orderCategory', 'orderCategory', 'serviceType'],
          include: [
            {
              model: conn.OrdersDetails,
              as: 'orderProductDtls',
              attributes: ['productId'],
              include: [
                {
                  attributes: ['productSubType', 'productSubCategory', 'productCategory', 'serviceType'],
                  model: conn.Product,
                  as: 'productDetails'
                }
              ]
            }
          ],
          where: {
            orderNo: body?.tranNo
          }
        })
        console.log('responseData-------->', responseData)
        const data = {}
        if (responseData?.length > 0) {
          data.serviceType = responseData[0]?.serviceType
          data.productSubType = responseData[0]?.orderProductDtls[0]?.productDetails?.productSubType
        }
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Fetched successfully ',
          data
        }
      } else {
        const responseData = await conn.Interaction.findOne({
          attributes: ['serviceCategory', 'serviceType'],
          where: {
            intxnNo: body?.tranNo
          }
        })
        const data = {}
        if (responseData) {
          data.serviceType = responseData?.serviceType
          data.productSubType = responseData?.serviceCategory
        }
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Fetched successfully ',
          data
        }
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in Fetching Data'
      }
    }
  }

  async getMyProducts (body, conn) {
    try {
      console.log('searchParam', body)
      const productsList = await conn.Orders.findAll({
        distinct: true,
        include: [
          {
            model: conn.OrdersDetails,
            as: 'orderProductDtls',
            attributes: ['productId'],
            include: [
              {
                model: conn.Product,
                as: 'productDetails',
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
                    }

                  }
                ]
              }
            ]
          }
        ],
        where: {
          customerId: body?.customerId,
          parentFlag: 'N'
        },
        // logging: true,
        order: [['createdAt', 'DESC']]
      })

      return {
        status: statusCodeConstants.SUCCESS,
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

  async createOrder (orderData, authData, userId, roleId, departmentId, conn, t) {
    // console.log(JSON.stringify(orderData))
    try {
      if (!orderData && !orderData?.customerId) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const customerInfo = await conn.Customer.findOne({
        where: {
          [Op.or]: {
            customerUuid: orderData.customerUuid
          }
        }
      })

      if (!customerInfo) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Customer not found'
        }
      }

      const guid = uuidv4()
      const commonAttrib = {
        tranId: guid,
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }

      // console.log('orderData---------->', orderData)
      const masterOrder = {
        orderUuid: uuidv4(),
        orderStatus: constantCode.status.NEW,
        currEntity: departmentId,
        currRole: roleId,
        orderDate: new Date(),
        orderCategory: orderData.orderCategory,
        orderSource: orderData.orderSource,
        orderType: orderData.orderType,
        orderChannel: orderData.orderChannel,
        orderPriority: orderData.orderPriority,
        billAmount: orderData.billAmount,
        orderDescription: orderData.orderDescription,
        customerId: customerInfo?.customerId || customerInfo?.dataValues?.customerId,
        intxnId: orderData?.interactionId || null,
        requestId: orderData?.requestId || null,
        requestStatement: orderData?.requestStatement || null,
        parentFlag: constantCode.common.YES,
        ...commonAttrib
      }

      const masterOrders = await conn.Orders.create(masterOrder, { transaction: t })

      const masterOrdersTxnHdrInfo = {
        orderTxnUuid: uuidv4(),
        orderId: masterOrders.orderId,
        orderStatus: constantCode.status.NEW,
        orderFlow: orderFlowAction.CREATED,
        fromEntityId: departmentId,
        fromRoleId: roleId,
        fromUserId: userId,
        toEntityId: departmentId,
        toRoleId: roleId,
        orderDate: new Date(),
        orderCategory: orderData.orderCategory,
        orderSource: orderData.orderSource,
        orderType: orderData.orderType,
        orderChannel: orderData.orderChannel,
        orderPriority: orderData.orderPriority,
        billAmount: orderData.billAmount,
        orderDescription: orderData.orderDescription,
        customerId: orderData.customerId,
        intxnId: orderData?.interactionId || null,
        parentFlag: constantCode.common.YES,
        isFollowup: constantCode.common.NO,
        ...commonAttrib
      }

      const masterTxnHdr = await conn.OrdersTxnHdr.create(masterOrdersTxnHdrInfo, { transaction: t })

      const result = []
      let count = 1
      const source = await conn.BusinessEntity.findOne({
        attributes: ['description'],
        where: {
          code: orderData.orderType
        }
      })
      if (Array.isArray(orderData.order) && orderData.order.length > 0) {
        for (const payload of orderData.order) {
          let checkingExistingAccount, checkingExistingService
          if (payload && payload?.accountUuid) {
            checkingExistingAccount = await conn.CustAccounts.findOne({
              where: {
                accountUuid: payload.accountUuid,
                customerUuid: customerInfo.customerUuid
              }
            })
            if (!checkingExistingAccount) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: `No Account is found for provided account id ${payload.accountId}.`
              }
            }
          }

          if (payload && payload?.serviceUuid) {
            checkingExistingService = await conn.CustServices.findOne({
              where: {
                serviceUuid: payload.serviceUuid,
                customerUuid: customerInfo.customerUuid
              }
            })
            if (!checkingExistingService) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: `No service is found for provided service id ${payload.serviceUuid}.`
              }
            }

            const checkingExistingServiceWithAccount = await conn.CustServices.findOne({
              where: {
                serviceUuid: payload.serviceUuid,
                accountUuid: payload.accountUuid,
                customerUuid: customerInfo.customerUuid
              }
            })
            if (!checkingExistingServiceWithAccount) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: `The Provided service is provided not mapped with account id - ${payload.accountUid}.`
              }
            }
            if ([orderType.upgrade, orderType.downgrade].includes(orderData.orderType)) {
              await conn.CustServices.update({ productBenefit: payload.productBenefit, actualProductBenefit: payload.actualProductBenefit }, {
                where: {
                  serviceUuid: payload.serviceUuid,
                  accountUuid: payload.accountUuid,
                  customerUuid: customerInfo.customerUuid
                },
                transaction: t
              })
            }
          }

          const workflowMappings = await conn.WorkflowMapping.findAll({
            where: {
              moduleName: entityCategory.ORDER,
              status: constantCode.status.ACTIVE
            }
          })

          let flwId
          for (const w of workflowMappings) {
            const mapping = w.mappingPayload
            // console.log('mapping.orderType-->',mapping.orderType,'---orderData.orderType--->',orderData.orderType)
            // console.log('mapping.serviceType-->',mapping.serviceType,'--- payload.serviceType--->', payload.serviceType)
            // console.log('mapping.customerCategory-->',mapping.customerCategory,'---customerInfo.customerCategory--->',customerInfo.customerCategory)
            // console.log(' mapping.orderCategory-->', mapping.orderCategory,'---orderData.orderCategory--->',orderData.orderCategory)
            // console.log('mapping.priority-->',mapping.priority,'---orderData.orderPriority--->',orderData.orderPriority)

            // console.log(mapping.orderType === orderData.orderType,
            //   mapping.serviceType === payload.serviceType,
            //   mapping.customerCategory === customerInfo.customerCategory,
            //   mapping.orderCategory === orderData.orderCategory,
            //   mapping.priority === orderData.orderPriority)
            if (
              mapping.orderType && mapping.orderType === orderData.orderType &&
              mapping.serviceType && mapping.serviceType === payload.serviceType &&
              mapping.customerCategory && mapping.customerCategory === customerInfo.customerCategory &&
              mapping.orderCategory && mapping.orderCategory === orderData.orderCategory &&
              mapping.priority && mapping.priority === orderData.orderPriority) {
              flwId = w.workflowId
              break
            }
          }

          if (!flwId) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'Workflow not found. Please configure the workflow or contact admin.'
            }
          }

          // TODO: Need to check on appointment requirment for physical order family

          const orderUid = uuidv4()

          const orderInfo = {
            orderUuid: orderUid,
            orderNo: masterOrders.orderNo + '_' + count,
            orderStatus: constantCode.status.NEW,
            currEntity: departmentId,
            currRole: roleId,
            orderDate: new Date(),
            orderCategory: orderData.orderCategory,
            orderSource: orderData.orderSource,
            orderType: orderData.orderType,
            orderChannel: orderData.orderChannel,
            orderCause: orderData.orderCause,
            orderPriority: orderData.orderPriority,
            billAmount: payload.billAmount,
            orderDescription: payload.orderDescription,
            customerId: customerInfo?.customerId || customerInfo?.dataValues?.customerId,
            accountId: checkingExistingAccount?.accountId || checkingExistingAccount?.dataValues?.accountId,
            serviceId: checkingExistingService?.serviceId || checkingExistingService?.dataValues?.serviceId,
            intxnId: orderData?.interactionId || null,
            orderFamily: payload.orderFamily,
            orderMode: payload.orderMode,
            orderDeliveryMode: payload?.orderDeliveryMode,
            contactPreference: payload.contactPreference,
            requestId: orderData?.requestId || null,
            requestStatement: orderData?.requestStatement || null,
            serviceType: payload.serviceType,
            parentFlag: constantCode.common.NO,
            parentOrderId: masterOrders.orderId,
            parentOrderUuid: masterOrders.orderUuid,
            rcAmount: payload.rcAmount || null,
            nrcAmount: payload.nrcAmount || null,
            advanceCharge: payload.advanceCharge || null,
            upfrontCharge: payload.upfrontCharge || null,
            prorated: payload.prorated || '',
            isSplitOrder: payload.isSplitOrder,
            isBundleOrder: payload.isBundle,
            ...commonAttrib
          }
          const orderDetails = await conn.Orders.create(orderInfo, { transaction: t })
          let appoitmentObj
          if (orderDetails) {
            if (orderData?.appointmentList && orderData?.appointmentList.length > 0) {
              // console.log('orderData?.appointmentList',orderData?.appointmentList)
              const orderAppointData = orderData?.appointmentList.find((x) => x.productNo === payload?.product[0]?.productSerialNo)
              // console.log('orderAppointData------>', orderAppointData)
              if (orderAppointData) {
                const oldTxnData = await conn.AppointmentTxn.findOne({
                  where: {
                    appointUserId: orderAppointData?.customerId,
                    tranCategoryNo: orderAppointData?.productNo,
                    status: 'AS_TEMP',
                    tranCategoryType: 'ORDER',
                    appointDtlId: orderAppointData?.appointDtlId
                  },
                  // logging: console.log,
                  transaction: t,
                  raw: true
                })
                // console.log('oldTxnData',oldTxnData)
                if (oldTxnData) {
                  const appointmentTxnData = {
                    appointDtlId: oldTxnData?.appointDtlId,
                    appointId: oldTxnData?.appointId,
                    appointDate: oldTxnData?.appointDate,
                    status: defaultStatus.SCHEDULED,
                    appointUserCategory: oldTxnData?.appointUserCategory,
                    appointUserId: oldTxnData?.appointUserId,
                    appointAgentId: oldTxnData?.appointAgentId,
                    appointMode: oldTxnData?.appointMode,
                    appointModeValue: '',
                    appointStartTime: oldTxnData?.appointStartTime,
                    appointEndTime: oldTxnData?.appointEndTime,
                    tranCategoryType: oldTxnData?.tranCategoryType,
                    tranCategoryNo: orderDetails?.orderNo,
                    tranCategoryUuid: orderUid
                  }
                  // console.log('appointmentTxnData ===> ', appointmentTxnData)
                  try {
                    if (['AUDIO_CONF', 'VIDEO_CONF'].includes(appointmentTxnData.appointMode) && appointmentTxnData.appointAgentId && appointmentTxnData.appointUserId) {
                      const hostDetail = await conn.User.findOne({ where: { userId: appointmentTxnData.appointAgentId } })
                      const customerDetail = await conn.Contact.findOne({
                        where: {
                          contactCategory: 'CUSTOMER',
                          contactCategoryValue: customerInfo?.customerNo || customerInfo?.dataValues?.customerNo
                        }
                      })
                      const start = moment(`${appointmentTxnData.appointDate}T${appointmentTxnData.appointStartTime}Z`)// now
                      const end = moment(`${appointmentTxnData.appointDate}T${appointmentTxnData.appointEndTime}Z`)

                      const requestBody = {
                        txnNo: orderDetails?.orderNo,
                        agenda: 'Order related - ' + orderDetails?.orderNo,
                        hostEmail: hostDetail?.email,
                        hostUserGroup: hostDetail?.userGroup,
                        hostMobilePrefix: hostDetail?.extn,
                        hostMobileNo: hostDetail?.contactNo,
                        duration: end.diff(start, 'minutes'),
                        customerEmail: customerDetail?.emailId,
                        customerMobilePrefix: customerDetail?.mobilePrefix,
                        customerMobileNo: customerDetail?.mobileNo,
                        customerUserGroup: customerDetail?.userGroup ?? 'UG_CONSUMER',
                        topic: 'Order related - ' + orderDetails?.orderNo,
                        appointDateTime: `${appointmentTxnData.appointDate}T${appointmentTxnData.appointStartTime}Z`,
                        tranEntity: 'TMC_ORDER',
                        eventType: 'ET_CREATION',
                        tranCategory: orderData.orderCategory,
                        tranType: orderData.orderType,
                        serviceCategory: checkingExistingService?.serviceCategory || checkingExistingService?.dataValues?.serviceCategory,
                        serviceType: checkingExistingService?.serviceType || checkingExistingService?.dataValues?.serviceType
                      } // "2022-03-25T07:32:55Z"
                      const { authorization, tenantId } = authData
                      const headers = {
                        'Content-Type': 'application/json',
                        'X-TENANT-ID': tenantId,
                        Authorization: authorization
                      }
                      const method = 'post'
                      const path = 'appointment/create-meeting-link'
                      // console.log({ path, method, headers, requestBody }, 'for appointment')
                      const { result, error } = await this.createAppointmentLink(path, method, headers, requestBody)
                      console.log('<================== from appointment ==================>')
                      console.log({ result, error })
                      console.log('<================== from appointment ==================>')
                      appointmentTxnData.medium = result?.data?.medium
                      appointmentTxnData.mediumData = result?.data?.mediumData
                      appointmentTxnData.appointModeValue = result?.data?.meetingUrl
                    }
                  } catch (error) {
                    console.log(error, 'appointment medium create error')
                  }

                  await conn.AppointmentTxn.update(appointmentTxnData, {
                    where: {
                      appointTxnId: oldTxnData.appointTxnId
                    },
                    transaction: t
                  })

                  if (['CUST_VISIT', 'BUS_VISIT'].includes(oldTxnData.appointMode)) {
                    const guidAddress = uuidv4()
                    const commonAttribAddress = {
                      tranId: guidAddress,
                      createdDeptId: departmentId || systemDeptId,
                      createdRoleId: roleId || systemRoleId,
                      createdBy: userId || systemUserId,
                      updatedBy: userId || systemUserId
                    }

                    const addressData = {
                      address1: orderAppointData?.appointAddress?.address1 || orderAppointData?.appointAddress[0]?.address1,
                      address2: orderAppointData?.appointAddress?.address2 || orderAppointData?.appointAddress[0]?.address2,
                      address3: orderAppointData?.appointAddress?.address3 || orderAppointData?.appointAddress[0]?.address3,
                      city: orderAppointData?.appointAddress?.city || orderAppointData?.appointAddress[0]?.city,
                      state: orderAppointData?.appointAddress?.state || orderAppointData?.appointAddress[0]?.state,
                      district: orderAppointData?.appointAddress?.district || orderAppointData?.appointAddress[0]?.district,
                      postcode: orderAppointData?.appointAddress?.postcode || orderAppointData?.appointAddress[0]?.postcode,
                      country: orderAppointData?.appointAddress?.country || orderAppointData?.appointAddress[0]?.country,
                      status: 'AC',
                      isPrimary: true,
                      addressCategory: 'ORDER_APPOINTMENT',
                      addressCategoryValue: orderDetails?.orderNo,
                      ...commonAttribAddress
                    }
                    // console.log('addressData', addressData)
                    await conn.Address.create(addressData, { transaction: t })
                  }

                  appoitmentObj = {
                    notificationType: constantCode.common.POPUP,
                    subject: source?.description ? `Appointment created for ${orderDetails.orderNo} - ${source?.description} in your role` : 'Appointment for order is created in your role',
                    channel: orderData?.channel ?? 'WEB',
                    body: source?.description ? `Appointment created for ${orderDetails.orderNo} - ${source?.description} in your role` : 'Appointment for order is created in your role',
                    orderId: oldTxnData?.appointDtlId,
                    userId,
                    roleId,
                    departmentId,
                    status: 'SENT',
                    orderNumber: oldTxnData.appointmentTxnNo,
                    priority: orderData.orderPriority,
                    customerNo: customerInfo.customerNo,
                    assignedUserId: oldTxnData?.appointAgentId,
                    assignedDepartmentId: departmentId,
                    assignedRoleId: roleId,
                    orderStatus: constantCode.status.NEW,
                    notificationSource: entityCategory.APPOINTMENT,
                    link: ['AUDIO_CONF', 'VIDEO_CONF'].includes(appointmentTxnData?.appointMode) ? appointmentTxnData.appointModeValue : ''
                  }
                }
              }
            }

            if (!payload?.product && !Array.isArray(payload?.product)) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: 'Please Provide atleast one Product detail for order creation.'
              }
            }

            const productDetails = []
            for (const p of payload.product) {
              const productObject = {
                orderId: orderDetails.orderId,
                orderDtlUuid: uuidv4(),
                productId: p.productId,
                productQuantity: p.productQuantity,
                productStatus: constantCode.status.ACTIVE,
                productAddedDate: p.productAddedDate,
                billAmount: p.billAmount,
                rcAmount: p.rcAmount,
                nrcAmount: p.nrcAmount,
                edof: p.edof,
                productSerialNo: p.productSerialNo,
                prodBundleId: p.bundleId,
                isBundle: p.isBundle,
                contractMonths: p.contract,
                ...commonAttrib
              }
              // console.log('productObjectproductObjectproductObject', productObject)
              productDetails.push(productObject)
            }
            // console.log(JSON.stringify(productDetails))
            // console.log(dd)
            await conn.OrdersDetails.bulkCreate(productDetails, { transaction: t })

            const OrdersTxnHdrInfo = {
              orderTxnUuid: uuidv4(),
              orderId: orderDetails.orderId,
              orderStatus: constantCode.status.NEW,
              orderFlow: orderFlowAction.CREATED,
              fromEntityId: departmentId,
              fromRoleId: roleId,
              fromUserId: userId,
              toEntityId: departmentId,
              toRoleId: roleId,
              orderDate: new Date(),
              orderCategory: orderData.orderCategory,
              serviceType: payload.serviceType,
              orderSource: orderData.orderSource,
              orderType: orderData.orderType,
              orderChannel: orderData.orderChannel,
              orderPriority: orderData.orderPriority,
              billAmount: payload.billAmount,
              orderDescription: payload.orderDescription,
              orderDeliveryMode: payload.orderDeliveryMode,
              customerId: customerInfo?.customerId || customerInfo?.dataValues?.customerId,
              accountId: checkingExistingAccount?.accountId || checkingExistingAccount?.dataValues?.accountId,
              serviceId: checkingExistingService?.serviceId || checkingExistingService?.dataValues?.serviceId,
              intxnId: orderData?.interactionId || null,
              orderFamily: payload.orderFamily,
              orderMode: payload.orderMode,
              contactPreference: payload.contactPreference,
              parentFlag: constantCode.common.NO,
              parentOrderId: masterOrders.orderId,
              parentOrderUuid: masterOrders.orderUuid,
              isFollowup: constantCode.common.NO,
              ...commonAttrib
            }
            // console.log('OrdersTxnHdrInfo', OrdersTxnHdrInfo)

            const OrdersTxnHdrDetails = await conn.OrdersTxnHdr.create(OrdersTxnHdrInfo, { transaction: t })

            if (OrdersTxnHdrDetails) {
              const orderTxnDtlInfo = productDetails.map(product => ({ orderTxnId: OrdersTxnHdrDetails.orderTxnId, orderTxnDtlUuid: uuidv4(), ...product }))
              await conn.OrdersTxnDtl.bulkCreate(orderTxnDtlInfo, { transaction: t })
            }

            await assignWFToEntity(orderDetails.orderUuid, 'ORDER', flwId, commonAttrib, conn, t)
            const workflowExecute = await startWorkFlowEngineManual(orderDetails.orderUuid, conn, t)

            if (workflowExecute?.status === 'ERROR') {
              return {
                status: statusCodeConstants.ERROR,
                message: workflowExecute.message
              }
            }
            // Order to Task
            /**
            const getOrderTask = await getWFTask(orderDetails.orderUuid, entityCategory.ORDER, conn, t)

            const productIds = productDetails.map(p => p.productId)
            const productTask = await conn.ProductTaskMap.findAll({
              where: {
                productId: productIds
              }
            })
             */
          }

          // Create New PopUp Notification
          const userList = await getUsersByRole(roleId, departmentId, constantCode.common.POPUP, conn) || []
          const notificationObj = {
            notificationType: constantCode.common.POPUP,
            subject: source?.description ? `${source?.description} order is created in your role` : 'order is created in your role',
            channel: orderData?.channel ?? 'WEB',
            body: source?.description ? `${source?.description} order is created in your role` : 'order is created in your role',
            orderId: orderDetails.orderId,
            userId,
            roleId,
            departmentId,
            status: 'SENT',
            orderNumber: orderDetails.orderNo,
            priority: orderData.orderPriority,
            customerNo: customerInfo.customerNo,
            assignedUserId: null,
            assignedDepartmentId: departmentId,
            assignedRoleId: roleId,
            orderStatus: constantCode.status.NEW,
            userList
          }
          logger.debug('Order PopUp Notification', notificationObj)
          em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', notificationObj)
          // console.log('appoitmentObj ----------------->', appoitmentObj)
          if (!isEmpty(appoitmentObj)) {
            logger.debug('Appointment PopUp Notification', appoitmentObj)
            em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', appoitmentObj)
          }
          result.push({
            orderNo: orderDetails.orderNo,
            orderUuid: orderDetails.orderUuid
          })
          count = count + 1

          const contactWhereClause = {
            contactCategoryValue: customerInfo?.customerNo || customerInfo?.dataValues?.customerNo,
            status: constantCode.status.ACTIVE,
            contactCategory: entityCategory.CUSTOMER
          }
          console.log({ contactWhereClause })
          let contactInfo = await conn.Contact.findOne({
            where: { ...contactWhereClause },
            order: [['contactId', 'DESC']]
          })

          contactInfo = contactInfo?.dataValues ? contactInfo?.dataValues : contactInfo
          let email, contactNo, contactNoPfx
          if (contactInfo) {
            email = contactInfo.emailId || null
            contactNo = contactInfo.mobileNo || null
            contactNoPfx = contactInfo.mobilePrefix || null
          }

          // send email
          logger.debug('Creating Notification request information')
          const notificationData = {
            name: customerInfo.firstName,
            email,
            contactNo,
            contactNoPfx,
            notifiationSource: source.description,
            referenceId: orderInfo.orderNo,
            referenceSubId: orderInfo?.orderTxnId,
            userId: userId || systemUserId,
            customerId: customerInfo.customerId,
            departmentId,
            roleId,
            // channel: interactionData.channel,
            type: 'CREATE-ORDER',
            contactPreference: customerInfo.contactPreferences,
            mapCategory: 'TMC_ORDER',
            eventType: 'ET_CREATION',
            tranCategory: orderInfo.orderCategory,
            tranType: orderInfo.orderType,
            serviceCategory: checkingExistingService?.serviceCategory || checkingExistingService?.dataValues?.serviceCategory,
            serviceType: checkingExistingService?.serviceType || checkingExistingService?.dataValues?.serviceType,
            ...commonAttrib
          }
          console.log(notificationData)
          em.emit('SEND_CREATE_ORDER_NOTIFICATION', notificationData, conn)
        }
      }

      try {
        if (customerInfo) {
          // console.log('======================= CHECK FOR CUSTOMER USER CREATION =========================')
          const customerContacts = await conn.Contact.findAll({ where: { contactCategoryValue: customerInfo.customerNo } })
          const customerAddresses = await conn.Address.findAll({ where: { addressCategoryValue: customerInfo.customerNo } })

          if (customerAddresses.length && customerContacts.length) {
            const primaryAddress = customerAddresses.find(x => x.isPrimary)
            const primaryContact = customerContacts.find(x => x.isPrimary)
            const customerContact = primaryContact || customerContacts[0]
            const customerAddress = primaryAddress || customerAddresses[0]
            const userInfo = await conn.User.findOne({
              where: {
                email: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email')), '=', customerContact?.emailId.toLowerCase())
              }
            })

            const userInfoMobile = await conn.User.findOne({
              where: {
                contactNo: customerContact?.mobileNo
              }
            })

            if (!userInfoMobile && !userInfo) {
              const userObj = {
                title: customerInfo.title,
                firstName: customerInfo.firstName,
                lastName: customerInfo.lastName,
                email: customerContact?.emailId,
                dob: customerInfo.birthDate,
                country: customerAddress?.country,
                gender: customerInfo.gender,
                contactNo: customerContact?.mobileNo,
                loginPassword: generateString(6),
                customerId: customerInfo.customerId,
                customerUuid: customerInfo.customerUuid,
                userType: 'UT_CONSUMER',
                userGroup: 'UG_CONSUMER',
                userSource: 'US_WEBAPP',
                ...commonAttrib
              }
              // console.log(userObj)
              // console.log('======================= GOING FOR CUSTOMER USER CREATION =========================')
              await this.createUser(userObj, conn, t)
            }
          }
        }
      } catch (error) {
        console.log(error)
        // console.log('============================ ERROR IN CUSTOMER USER CREATION ==============================')
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Order created Successfully #${masterOrders.orderNo}`,
        data: {
          orderId: masterOrders.orderNo,
          auxiliaryOrders: result
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async createOrderWebSelfCare (orderData, authData, userId, roleId, departmentId, conn, t) {
    console.log('----systemWebSelfCareRoleId----->',
      systemWebSelfCareRoleId)
    console.log('systemWebSelfCareDeptId---->', systemWebSelfCareDeptId)
    // console.log(JSON.stringify(orderData))
    try {
      if (!orderData && !orderData?.customerId) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const customerInfo = await conn.Customer.findOne({
        where: {
          [Op.or]: {
            customerUuid: orderData.customerUuid
          }
        }
      })

      if (!customerInfo) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Customer not found'
        }
      }

      const guid = uuidv4()
      const commonAttrib = {
        tranId: guid,
        createdDeptId: systemWebSelfCareDeptId,
        createdRoleId: systemWebSelfCareRoleId,
        createdBy: userId,
        updatedBy: userId
      }

      console.log('orderData-------webslefcare--->', orderData)
      const masterOrder = {
        orderUuid: uuidv4(),
        orderStatus: constantCode.status.NEW,
        currEntity: systemWebSelfCareDeptId,
        currRole: systemWebSelfCareRoleId,
        orderDate: new Date(),
        orderCategory: orderData.orderCategory,
        orderSource: orderData.orderSource,
        orderType: orderData.orderType,
        orderChannel: orderData.orderChannel,
        orderPriority: orderData.orderPriority,
        billAmount: orderData.billAmount,
        orderDescription: orderData.orderDescription,
        customerId: customerInfo?.customerId || customerInfo?.dataValues?.customerId,
        intxnId: orderData?.interactionId || null,
        requestId: orderData?.requestId || null,
        requestStatement: orderData?.requestStatement || null,
        parentFlag: constantCode.common.YES,
        ...commonAttrib
      }

      const masterOrders = await conn.Orders.create(masterOrder, { transaction: t })

      const masterOrdersTxnHdrInfo = {
        orderTxnUuid: uuidv4(),
        orderId: masterOrders.orderId,
        orderStatus: constantCode.status.NEW,
        orderFlow: orderFlowAction.CREATED,
        fromEntityId: systemWebSelfCareDeptId,
        fromRoleId: systemWebSelfCareRoleId,
        fromUserId: userId,
        toEntityId: systemWebSelfCareDeptId,
        toRoleId: systemWebSelfCareRoleId,
        orderDate: new Date(),
        orderCategory: orderData.orderCategory,
        orderSource: orderData.orderSource,
        orderType: orderData.orderType,
        orderChannel: orderData.orderChannel,
        orderPriority: orderData.orderPriority,
        billAmount: orderData.billAmount,
        orderDescription: orderData.orderDescription,
        customerId: orderData.customerId,
        intxnId: orderData?.interactionId || null,
        parentFlag: constantCode.common.YES,
        isFollowup: constantCode.common.NO,
        ...commonAttrib
      }

      const masterTxnHdr = await conn.OrdersTxnHdr.create(masterOrdersTxnHdrInfo, { transaction: t })

      const result = []
      let count = 1
      if (Array.isArray(orderData.order) && orderData.order.length > 0) {
        for (const payload of orderData.order) {
          let checkingExistingAccount, checkingExistingService
          if (payload && payload?.accountUuid) {
            checkingExistingAccount = await conn.CustAccounts.findOne({
              where: {
                accountUuid: payload.accountUuid,
                customerUuid: customerInfo.customerUuid
              }
            })
            if (!checkingExistingAccount) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: `No Account is found for provided account id ${payload.accountId}.`
              }
            }
          }

          if (payload && payload?.serviceUuid) {
            checkingExistingService = await conn.CustServices.findOne({
              where: {
                serviceUuid: payload.serviceUuid,
                customerUuid: customerInfo.customerUuid
              }
            })
            if (!checkingExistingService) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: `No service is found for provided service id ${payload.serviceUuid}.`
              }
            }

            const checkingExistingServiceWithAccount = await conn.CustServices.findOne({
              where: {
                serviceUuid: payload.serviceUuid,
                accountUuid: payload.accountUuid,
                customerUuid: customerInfo.customerUuid
              }
            })
            if (!checkingExistingServiceWithAccount) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: `The Provided service is provided not mapped with account id - ${payload.accountUid}.`
              }
            }
          }

          const workflowMappings = await conn.WorkflowMapping.findAll({
            where: {
              moduleName: entityCategory.ORDER,
              status: constantCode.status.ACTIVE
            }
          })

          // console.log('workflowMappings------->', workflowMappings)

          let flwId
          for (const w of workflowMappings) {
            const mapping = w.mappingPayload
            // console.log('mapping.orderType-->',mapping.orderType,'---orderData.orderType--->',orderData.orderType)
            // console.log('mapping.serviceType-->',mapping.serviceType,'--- payload.serviceType--->', payload.serviceType)
            // console.log('mapping.customerCategory-->',mapping.customerCategory,'---customerInfo.customerCategory--->',customerInfo.customerCategory)
            // console.log(' mapping.orderCategory-->', mapping.orderCategory,'---orderData.orderCategory--->',orderData.orderCategory)
            // console.log('mapping.priority-->',mapping.priority,'---orderData.orderPriority--->',orderData.orderPriority)

            console.log(mapping.orderType === orderData.orderType,
              mapping.serviceType === payload.serviceType,
              mapping.customerCategory === customerInfo.customerCategory,
              mapping.orderCategory === orderData.orderCategory,
              mapping.priority === orderData.orderPriority)
            if (
              mapping.orderType && mapping.orderType === orderData.orderType &&
              mapping.serviceType && mapping.serviceType === payload.serviceType &&
              mapping.customerCategory && mapping.customerCategory === customerInfo.customerCategory &&
              mapping.orderCategory && mapping.orderCategory === orderData.orderCategory &&
              mapping.priority && mapping.priority === orderData.orderPriority) {
              flwId = w.workflowId
              break
            }
          }

          if (!flwId) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'Workflow not found. Please configure the workflow or contact admin.'
            }
          }

          // TODO: Need to check on appointment requirment for physical order family

          const orderUid = uuidv4()

          const orderInfo = {
            orderUuid: orderUid,
            orderNo: masterOrders.orderNo + '_' + count,
            orderStatus: constantCode.status.NEW,
            currEntity: systemWebSelfCareDeptId,
            currRole: systemWebSelfCareRoleId,
            orderDate: new Date(),
            orderCategory: orderData.orderCategory,
            orderSource: orderData.orderSource,
            orderType: orderData.orderType,
            orderChannel: orderData.orderChannel,
            orderCause: orderData.orderCause,
            orderPriority: orderData.orderPriority,
            billAmount: payload.billAmount,
            orderDescription: payload.orderDescription,
            customerId: customerInfo?.customerId || customerInfo?.dataValues?.customerId,
            accountId: checkingExistingAccount?.accountId || checkingExistingAccount?.dataValues?.accountId,
            serviceId: checkingExistingService?.serviceId || checkingExistingService?.dataValues?.serviceId,
            intxnId: orderData?.interactionId || null,
            orderFamily: payload.orderFamily,
            orderMode: payload.orderMode,
            orderDeliveryMode: payload?.orderDeliveryMode,
            contactPreference: payload.contactPreference,
            requestId: orderData?.requestId || null,
            requestStatement: orderData?.requestStatement || null,
            serviceType: payload.serviceType,
            parentFlag: constantCode.common.NO,
            parentOrderId: masterOrders.orderId,
            parentOrderUuid: masterOrders.orderUuid,
            rcAmount: payload.rcAmount || null,
            nrcAmount: payload.nrcAmount || null,
            advanceCharge: payload.advanceCharge || null,
            upfrontCharge: payload.upfrontCharge || null,
            prorated: payload.prorated || '',
            isSplitOrder: payload.isSplitOrder,
            isBundleOrder: payload.isBundle,
            paymentId: orderData.paymentId,
            deliveryLocation: payload?.deliveryLocation,
            ...commonAttrib
          }
          const orderDetails = await conn.Orders.create(orderInfo, { transaction: t })
          if (orderDetails) {
            if (orderData?.appointmentList && orderData?.appointmentList.length > 0) {
              // console.log('orderData?.appointmentList',orderData?.appointmentList)
              const orderAppointData = orderData?.appointmentList.find((x) => x.productNo === payload?.product[0]?.productSerialNo)
              console.log('orderAppointData------>', orderAppointData)
              if (orderAppointData) {
                const oldTxnData = await conn.AppointmentTxn.findOne({
                  where: {
                    appointUserId: orderAppointData?.customerId,
                    tranCategoryNo: orderAppointData?.productNo,
                    status: 'AS_TEMP',
                    tranCategoryType: 'ORDER',
                    appointDtlId: orderAppointData?.appointDtlId
                  },
                  transaction: t,
                  raw: true
                })
                // console.log('oldTxnData',oldTxnData)
                if (oldTxnData) {
                  const appointmentTxnData = {
                    appointDtlId: oldTxnData?.appointDtlId,
                    appointId: oldTxnData?.appointId,
                    appointDate: oldTxnData?.appointDate,
                    status: defaultStatus.SCHEDULED,
                    appointUserCategory: oldTxnData?.appointUserCategory,
                    appointUserId: oldTxnData?.appointUserId,
                    appointAgentId: oldTxnData?.appointAgentId,
                    appointMode: oldTxnData?.appointMode,
                    appointModeValue: '',
                    appointStartTime: oldTxnData?.appointStartTime,
                    appointEndTime: oldTxnData?.appointEndTime,
                    tranCategoryType: oldTxnData?.tranCategoryType,
                    tranCategoryNo: orderDetails?.orderNo,
                    tranCategoryUuid: orderUid
                  }
                  console.log('appointmentTxnData ====> ', appointmentTxnData)
                  try {
                    if (['AUDIO_CONF', 'VIDEO_CONF'].includes(appointmentTxnData.appointMode) && appointmentTxnData.appointAgentId && appointmentTxnData.appointUserId) {
                      const hostDetail = await conn.User.findOne({ where: { userId: appointmentTxnData.appointAgentId } })
                      const customerDetail = await conn.Contact.findOne({
                        where: {
                          contactCategory: 'CUSTOMER',
                          contactCategoryValue: customerInfo?.customerNo || customerInfo?.dataValues?.customerNo
                        }
                      })
                      const start = moment(`${appointmentTxnData.appointDate}T${appointmentTxnData.appointStartTime}Z`)// now
                      const end = moment(`${appointmentTxnData.appointDate}T${appointmentTxnData.appointEndTime}Z`)

                      const requestBody = {
                        agenda: 'Order related - ' + orderDetails?.orderNo,
                        hostEmail: hostDetail?.email,
                        duration: end.diff(start, 'minutes'),
                        customerEmail: customerDetail?.emailId,
                        topic: 'Order related - ' + orderDetails?.orderNo,
                        appointDateTime: `${appointmentTxnData.appointDate}T${appointmentTxnData.appointStartTime}Z`
                      } // "2022-03-25T07:32:55Z"
                      const { authorization, tenantId } = authData
                      const headers = {
                        'Content-Type': 'application/json',
                        'X-TENANT-ID': tenantId,
                        Authorization: authorization
                      }
                      const method = 'post'
                      const path = 'appointment/create-meeting-link'
                      // console.log({ path, method, headers, requestBody }, 'for appointment')
                      const { result, error } = await this.createAppointmentLink(path, method, headers, requestBody)
                      console.log('<================== from appointment ==================>')
                      console.log({ result, error })
                      console.log('<================== from appointment ==================>')
                      appointmentTxnData.medium = result?.data?.medium
                      appointmentTxnData.mediumData = result?.data?.mediumData
                      appointmentTxnData.appointModeValue = result?.data?.meetingUrl
                    }
                  } catch (error) {
                    console.log(error, 'appointment medium create error')
                  }

                  await conn.AppointmentTxn.update(appointmentTxnData, {
                    where: {
                      appointTxnId: oldTxnData.appointTxnId
                    },
                    transaction: t
                  })

                  if (['CUST_VISIT', 'BUS_VISIT'].includes(oldTxnData.appointMode)) {
                    const guidAddress = uuidv4()
                    const commonAttribAddress = {
                      tranId: guidAddress,
                      createdDeptId: systemWebSelfCareDeptId,
                      createdRoleId: systemWebSelfCareRoleId,
                      createdBy: userId || systemUserId,
                      updatedBy: userId || systemUserId
                    }

                    const addressData = {
                      address1: orderAppointData?.appointAddress?.address1 || orderAppointData?.appointAddress[0]?.address1,
                      address2: orderAppointData?.appointAddress?.address2 || orderAppointData?.appointAddress[0]?.address2,
                      address3: orderAppointData?.appointAddress?.address3 || orderAppointData?.appointAddress[0]?.address3,
                      city: orderAppointData?.appointAddress?.city || orderAppointData?.appointAddress[0]?.city,
                      state: orderAppointData?.appointAddress?.state || orderAppointData?.appointAddress[0]?.state,
                      district: orderAppointData?.appointAddress?.district || orderAppointData?.appointAddress[0]?.district,
                      postcode: orderAppointData?.appointAddress?.postcode || orderAppointData?.appointAddress[0]?.postcode,
                      country: orderAppointData?.appointAddress?.country || orderAppointData?.appointAddress[0]?.country,
                      status: 'AC',
                      isPrimary: true,
                      addressCategory: 'ORDER_APPOINTMENT',
                      addressCategoryValue: orderDetails?.orderNo,
                      ...commonAttribAddress
                    }
                    // console.log('addressData', addressData)
                    await conn.Address.create(addressData, { transaction: t })
                  }
                }
              }
            }

            if (!payload?.product && !Array.isArray(payload?.product)) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: 'Please Provide atleast one Product detail for order creation.'
              }
            }

            const productDetails = []
            for (const p of payload.product) {
              const productObject = {
                orderId: orderDetails.orderId,
                orderDtlUuid: uuidv4(),
                productId: p.productId,
                productQuantity: p.productQuantity,
                productStatus: constantCode.status.ACTIVE,
                productAddedDate: p.productAddedDate,
                billAmount: p.billAmount,
                rcAmount: p.rcAmount,
                nrcAmount: p.nrcAmount,
                edof: p.edof,
                productSerialNo: p.productSerialNo,
                prodBundleId: p.bundleId,
                isBundle: p.isBundle,
                contractMonths: p.contract,
                ...commonAttrib
              }
              console.log('productObjectproductObjectproductObject', productObject)
              productDetails.push(productObject)
            }
            console.log(JSON.stringify(productDetails))
            // console.log(dd)
            await conn.OrdersDetails.bulkCreate(productDetails, { transaction: t })

            const OrdersTxnHdrInfo = {
              orderTxnUuid: uuidv4(),
              orderId: orderDetails.orderId,
              orderStatus: constantCode.status.NEW,
              orderFlow: orderFlowAction.CREATED,
              fromEntityId: systemWebSelfCareDeptId,
              fromRoleId: systemWebSelfCareRoleId,
              fromUserId: userId,
              toEntityId: systemWebSelfCareDeptId,
              toRoleId: systemWebSelfCareRoleId,
              orderDate: new Date(),
              orderCategory: orderData.orderCategory,
              serviceType: payload.serviceType,
              orderSource: orderData.orderSource,
              orderType: orderData.orderType,
              orderChannel: orderData.orderChannel,
              orderPriority: orderData.orderPriority,
              billAmount: payload.billAmount,
              orderDescription: payload.orderDescription,
              orderDeliveryMode: payload.orderDeliveryMode,
              customerId: customerInfo?.customerId || customerInfo?.dataValues?.customerId,
              accountId: checkingExistingAccount?.accountId || checkingExistingAccount?.dataValues?.accountId,
              serviceId: checkingExistingService?.serviceId || checkingExistingService?.dataValues?.serviceId,
              intxnId: orderData?.interactionId || null,
              orderFamily: payload.orderFamily,
              orderMode: payload.orderMode,
              contactPreference: payload.contactPreference,
              parentFlag: constantCode.common.NO,
              parentOrderId: masterOrders.orderId,
              parentOrderUuid: masterOrders.orderUuid,
              isFollowup: constantCode.common.NO,
              ...commonAttrib
            }
            console.log('OrdersTxnHdrInfo', OrdersTxnHdrInfo)

            const OrdersTxnHdrDetails = await conn.OrdersTxnHdr.create(OrdersTxnHdrInfo, { transaction: t })

            if (OrdersTxnHdrDetails) {
              const orderTxnDtlInfo = productDetails.map(product => ({ orderTxnId: OrdersTxnHdrDetails.orderTxnId, orderTxnDtlUuid: uuidv4(), ...product }))
              await conn.OrdersTxnDtl.bulkCreate(orderTxnDtlInfo, { transaction: t })
            }

            await assignWFToEntity(orderDetails.orderUuid, 'ORDER', flwId, commonAttrib, conn, t)
            const workflowExecute = await startWorkFlowEngineManual(orderDetails.orderUuid, conn, t)

            if (workflowExecute?.status === 'ERROR') {
              return {
                status: statusCodeConstants.ERROR,
                message: workflowExecute.message
              }
            }
            // Order to Task
            /**
            const getOrderTask = await getWFTask(orderDetails.orderUuid, entityCategory.ORDER, conn, t)

            const productIds = productDetails.map(p => p.productId)
            const productTask = await conn.ProductTaskMap.findAll({
              where: {
                productId: productIds
              }
            })
             */
          }
          const userList = await getUsersByRole(roleId, departmentId, constantCode.common.POPUP, conn) || []
          const notificationObj = {
            notificationType: constantCode.common.POPUP,
            subject: 'Order is Assigned to your Role',
            channel: orderData?.channel ? orderData?.channel : 'WEB',
            body: 'Order is Assigned to your Role',
            orderId: orderDetails.orderId,
            userId,
            roleId,
            departmentId,
            status: 'SENT',
            orderNumber: orderDetails.orderNo,
            priority: orderData.orderPriority,
            customerNo: customerInfo.customerNo,
            assignedUserId: null,
            assignedDepartmentId: departmentId,
            assignedRoleId: roleId,
            orderStatus: constantCode.status.NEW,
            userList
          }
          logger.debug('Order PopUp Notification', notificationObj)
          em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', notificationObj)
          result.push({
            orderNo: orderDetails.orderNo,
            orderUuid: orderDetails.orderUuid
          })
          count = count + 1
        }
      }

      try {
        if (customerInfo) {
          // console.log('======================= CHECK FOR CUSTOMER USER CREATION =========================')
          const customerContacts = await conn.Contact.findAll({ where: { contactCategoryValue: customerInfo.customerNo } })
          const customerAddresses = await conn.Address.findAll({ where: { addressCategoryValue: customerInfo.customerNo } })

          if (customerAddresses.length && customerContacts.length) {
            const primaryAddress = customerAddresses.find(x => x.isPrimary)
            const primaryContact = customerContacts.find(x => x.isPrimary)
            const customerContact = primaryContact || customerContacts[0]
            const customerAddress = primaryAddress || customerAddresses[0]
            const userInfo = await conn.User.findOne({
              where: {
                email: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email')), '=', customerContact?.emailId.toLowerCase())
              }
            })

            const userInfoMobile = await conn.User.findOne({
              where: {
                contactNo: customerContact?.mobileNo
              }
            })

            if (!userInfoMobile && !userInfo) {
              const userObj = {
                title: customerInfo.title,
                firstName: customerInfo.firstName,
                lastName: customerInfo.lastName,
                email: customerContact?.emailId,
                dob: customerInfo.birthDate,
                country: customerAddress?.country,
                gender: customerInfo.gender,
                contactNo: customerContact?.mobileNo,
                loginPassword: generateString(6),
                customerId: customerInfo.customerId,
                customerUuid: customerInfo.customerUuid,
                userType: 'UT_CONSUMER',
                userGroup: 'UG_CONSUMER',
                userSource: 'US_WEBAPP',
                ...commonAttrib
              }
              // console.log(userObj)
              // console.log('======================= GOING FOR CUSTOMER USER CREATION =========================')
              await this.createUser(userObj, conn, t)
            }
          }
        }
      } catch (error) {
        console.log(error)
        // console.log('============================ ERROR IN CUSTOMER USER CREATION ==============================')
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: `Order created Successfully #${masterOrders.orderNo}`,
        data: {
          orderId: masterOrders.orderNo,
          auxiliaryOrders: result
        }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async createAppointmentLink (path, method, headers, data) {
    const url = `${bcaeConfig.host}:${bcaeConfig.gatewayPort}/api/${path}`

    if (method === 'post') headers['Content-Type'] = 'application/json'

    return new Promise((resolve, reject) => {
      axios.request({ url, method, headers, data })
        .then((response) => {
          // console.log("Zoom response", response);
          resolve({ result: response.data })
        })
        .catch((error) => {
          console.log('Zoom error', error?.response?.data)
          resolve({ error })
        })
    })
  }

  // async createOrderWebSelfCare(orderData, userId, roleId, departmentId, conn, t) {
  //   // console.log(JSON.stringify(orderData))
  //   try {
  //     if (!orderData && !orderData?.customerId) {
  //       return {
  //         status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
  //         message: defaultMessage.MANDATORY_FIELDS_MISSING
  //       }
  //     }

  //     const customerInfo = await conn.Customer.findOne({
  //       where: {
  //         [Op.or]: {
  //           customerUuid: orderData.customerUuid
  //         }
  //       }
  //     })

  //     if (!customerInfo) {
  //       return {
  //         status: statusCodeConstants.NOT_FOUND,
  //         message: 'Customer not found'
  //       }
  //     }

  //     const guid = uuidv4()
  //     const commonAttrib = {
  //       tranId: guid,
  //       createdDeptId: departmentId,
  //       createdRoleId: roleId,
  //       createdBy: userId,
  //       updatedBy: userId
  //     }

  //     console.log('orderData---------->', orderData)
  //     const masterOrder = {
  //       orderUuid: uuidv4(),
  //       orderStatus: constantCode.status.NEW,
  //       currEntity: 'PRODUCT_QUALITY_ASSURANCE_DEPARTMENT.SERVICE_PROVIDER',
  //       currRole: roleId,
  //       orderDate: new Date(),
  //       orderCategory: orderData.orderCategory,
  //       orderSource: orderData.orderSource,
  //       orderType: orderData.orderType,
  //       orderChannel: orderData.orderChannel,
  //       orderPriority: orderData.orderPriority,
  //       billAmount: orderData.billAmount,
  //       orderDescription: orderData.orderDescription,
  //       customerId: customerInfo?.customerId || customerInfo?.dataValues?.customerId,
  //       intxnId: orderData?.interactionId || null,
  //       requestId: orderData?.requestId || null,
  //       requestStatement: orderData?.requestStatement || null,
  //       parentFlag: constantCode.common.YES,
  //       paymentId: orderData.paymentId,
  //       ...commonAttrib
  //     }

  //     const masterOrders = await conn.Orders.create(masterOrder, { transaction: t })

  //     const masterOrdersTxnHdrInfo = {
  //       orderTxnUuid: uuidv4(),
  //       orderId: masterOrders.orderId,
  //       orderStatus: constantCode.status.NEW,
  //       orderFlow: orderFlowAction.CREATED,
  //       fromEntityId: 'PRODUCT_QUALITY_ASSURANCE_DEPARTMENT.SERVICE_PROVIDER',
  //       fromRoleId: roleId,
  //       fromUserId: userId,
  //       toEntityId: 'PRODUCT_QUALITY_ASSURANCE_DEPARTMENT.SERVICE_PROVIDER',
  //       toRoleId: roleId,
  //       orderDate: new Date(),
  //       orderCategory: orderData.orderCategory,
  //       orderSource: orderData.orderSource,
  //       orderType: orderData.orderType,
  //       orderChannel: orderData.orderChannel,
  //       orderPriority: orderData.orderPriority,
  //       billAmount: orderData.billAmount,
  //       orderDescription: orderData.orderDescription,
  //       customerId: orderData.customerId,
  //       intxnId: orderData?.interactionId || null,
  //       parentFlag: constantCode.common.YES,
  //       isFollowup: constantCode.common.NO,
  //       ...commonAttrib
  //     }

  //     const masterTxnHdr = await conn.OrdersTxnHdr.create(masterOrdersTxnHdrInfo, { transaction: t })

  //     const result = []
  //     let count = 1
  //     if (Array.isArray(orderData.order) && orderData.order.length > 0) {
  //       for (const payload of orderData.order) {
  //         let checkingExistingAccount, checkingExistingService
  //         if (payload && payload?.accountUuid) {
  //           checkingExistingAccount = await conn.CustAccounts.findOne({
  //             where: {
  //               accountUuid: payload.accountUuid,
  //               customerUuid: customerInfo.customerUuid
  //             }
  //           })
  //           if (!checkingExistingAccount) {
  //             return {
  //               status: statusCodeConstants.VALIDATION_ERROR,
  //               message: `No Account is found for provided account id ${payload.accountId}.`
  //             }
  //           }
  //         }

  //         if (payload && payload?.serviceUuid) {
  //           checkingExistingService = await conn.CustServices.findOne({
  //             where: {
  //               serviceUuid: payload.serviceUuid,
  //               customerUuid: customerInfo.customerUuid
  //             }
  //           })
  //           if (!checkingExistingService) {
  //             return {
  //               status: statusCodeConstants.VALIDATION_ERROR,
  //               message: `No service is found for provided service id ${payload.serviceUuid}.`
  //             }
  //           }

  //           const checkingExistingServiceWithAccount = await conn.CustServices.findOne({
  //             where: {
  //               serviceUuid: payload.serviceUuid,
  //               accountUuid: payload.accountUuid,
  //               customerUuid: customerInfo.customerUuid
  //             }
  //           })
  //           if (!checkingExistingServiceWithAccount) {
  //             return {
  //               status: statusCodeConstants.VALIDATION_ERROR,
  //               message: `The Provided service is provided not mapped with account id - ${payload.accountUid}.`
  //             }
  //           }
  //         }

  //         const workflowMappings = await conn.WorkflowMapping.findAll({
  //           where: {
  //             moduleName: entityCategory.ORDER,
  //             status: constantCode.status.ACTIVE
  //           }
  //         })

  //         // console.log('workflowMappings------->', workflowMappings)

  //         let flwId
  //         for (const w of workflowMappings) {
  //           const mapping = w.mappingPayload;
  //           // console.log('mapping.orderType-->',mapping.orderType,'---orderData.orderType--->',orderData.orderType)
  //           // console.log('mapping.serviceType-->',mapping.serviceType,'--- payload.serviceType--->', payload.serviceType)
  //           // console.log('mapping.customerCategory-->',mapping.customerCategory,'---customerInfo.customerCategory--->',customerInfo.customerCategory)
  //           // console.log(' mapping.orderCategory-->', mapping.orderCategory,'---orderData.orderCategory--->',orderData.orderCategory)
  //           // console.log('mapping.priority-->',mapping.priority,'---orderData.orderPriority--->',orderData.orderPriority)

  //           console.log(mapping.orderType === orderData.orderType,
  //             mapping.serviceType === payload.serviceType,
  //             mapping.customerCategory === customerInfo.customerCategory,
  //             mapping.orderCategory === orderData.orderCategory,
  //             mapping.priority === orderData.orderPriority)
  //           if (
  //             mapping.orderType && mapping.orderType === orderData.orderType &&
  //             mapping.serviceType && mapping.serviceType === payload.serviceType &&
  //             mapping.customerCategory && mapping.customerCategory === customerInfo.customerCategory &&
  //             mapping.orderCategory && mapping.orderCategory === orderData.orderCategory &&
  //             mapping.priority && mapping.priority === orderData.orderPriority) {
  //             flwId = w.workflowId
  //             break
  //           }
  //         }

  //         if (!flwId) {
  //           return {
  //             status: statusCodeConstants.VALIDATION_ERROR,
  //             message: 'Workflow not found. Please configure the workflow or contact admin.'
  //           }
  //         }

  //         // TODO: Need to check on appointment requirment for physical order family

  //         const orderUid = uuidv4()

  //         const orderInfo = {
  //           orderUuid: orderUid,
  //           orderNo: masterOrders.orderNo + '_' + count,
  //           orderStatus: constantCode.status.NEW,
  //           currEntity: 'PRODUCT_QUALITY_ASSURANCE_DEPARTMENT.SERVICE_PROVIDER',
  //           currRole: roleId,
  //           orderDate: new Date(),
  //           orderCategory: orderData.orderCategory,
  //           orderSource: orderData.orderSource,
  //           orderType: orderData.orderType,
  //           orderChannel: orderData.orderChannel,
  //           orderCause: orderData.orderCause,
  //           orderPriority: orderData.orderPriority,
  //           billAmount: payload.billAmount,
  //           orderDescription: payload.orderDescription,
  //           customerId: customerInfo?.customerId || customerInfo?.dataValues?.customerId,
  //           accountId: checkingExistingAccount?.accountId || checkingExistingAccount?.dataValues?.accountId,
  //           serviceId: checkingExistingService?.serviceId || checkingExistingService?.dataValues?.serviceId,
  //           intxnId: orderData?.interactionId || null,
  //           orderFamily: payload.orderFamily,
  //           orderMode: payload.orderMode,
  //           orderDeliveryMode: payload?.orderDeliveryMode,
  //           contactPreference: payload.contactPreference,
  //           requestId: orderData?.requestId || null,
  //           requestStatement: orderData?.requestStatement || null,
  //           serviceType: payload.serviceType,
  //           parentFlag: constantCode.common.NO,
  //           parentOrderId: masterOrders.orderId,
  //           parentOrderUuid: masterOrders.orderUuid,
  //           rcAmount: payload.rcAmount || null,
  //           nrcAmount: payload.nrcAmount || null,
  //           advanceCharge: payload.advanceCharge || null,
  //           upfrontCharge: payload.upfrontCharge || null,
  //           prorated: payload.prorated || '',
  //           isSplitOrder: payload.isSplitOrder,
  //           isBundleOrder: payload.isBundle,
  //           paymentId: orderData.paymentId,
  //           deliveryLocation: payload?.deliveryLocation,
  //           ...commonAttrib
  //         }
  //         const orderDetails = await conn.Orders.create(orderInfo, { transaction: t })
  //         if (orderDetails) {
  //           if (orderData?.appointmentList && orderData?.appointmentList.length > 0) {
  //             // console.log('orderData?.appointmentList',orderData?.appointmentList)
  //             const orderAppointData = orderData?.appointmentList.find((x) => x.productNo === payload?.product[0]?.productSerialNo)
  //             console.log('orderAppointData------>', orderAppointData)
  //             if (orderAppointData) {
  //               const oldTxnData = await conn.AppointmentTxn.findOne({
  //                 where: {
  //                   appointUserId: orderAppointData?.customerId,
  //                   tranCategoryNo: orderAppointData?.productNo,
  //                   status: 'AS_TEMP',
  //                   tranCategoryType: 'ORDER',
  //                   appointDtlId: orderAppointData?.appointDtlId
  //                 },
  //                 transaction: t,
  //                 raw: true
  //               })
  //               // console.log('oldTxnData',oldTxnData)
  //               if (oldTxnData) {
  //                 await conn.AppointmentTxn.update({
  //                   tranCategoryNo: orderDetails?.orderNo,
  //                   tranCategoryUuid: orderUid,
  //                   status: 'AS_SCHED'
  //                 },
  //                   {
  //                     where: {
  //                       appointTxnId: oldTxnData.appointTxnId
  //                     },
  //                     transaction: t
  //                   })
  //                 if (['CUST_VISIT', 'BUS_VISIT'].includes(oldTxnData.appointMode)) {
  //                   const guidAddress = uuidv4()
  //                   const commonAttribAddress = {
  //                     tranId: guidAddress,
  //                     createdDeptId: departmentId || systemDeptId,
  //                     createdRoleId: roleId || systemRoleId,
  //                     createdBy: userId || systemUserId,
  //                     updatedBy: userId || systemUserId
  //                   }

  //                   const addressData = {
  //                     address1: orderAppointData?.appointAddress?.address1 || orderAppointData?.appointAddress[0]?.address1,
  //                     address2: orderAppointData?.appointAddress?.address2 || orderAppointData?.appointAddress[0]?.address2,
  //                     address3: orderAppointData?.appointAddress?.address3 || orderAppointData?.appointAddress[0]?.address3,
  //                     city: orderAppointData?.appointAddress?.city || orderAppointData?.appointAddress[0]?.city,
  //                     state: orderAppointData?.appointAddress?.state || orderAppointData?.appointAddress[0]?.state,
  //                     district: orderAppointData?.appointAddress?.district || orderAppointData?.appointAddress[0]?.district,
  //                     postcode: orderAppointData?.appointAddress?.postcode || orderAppointData?.appointAddress[0]?.postcode,
  //                     country: orderAppointData?.appointAddress?.country || orderAppointData?.appointAddress[0]?.country,
  //                     status: 'AC',
  //                     isPrimary: true,
  //                     addressCategory: 'ORDER_APPOINTMENT',
  //                     addressCategoryValue: orderDetails?.orderNo,
  //                     ...commonAttribAddress
  //                   }
  //                   // console.log('addressData', addressData)
  //                   await conn.Address.create(addressData, { transaction: t })
  //                 }
  //               }
  //             }
  //           }

  //           if (!payload?.product && !Array.isArray(payload?.product)) {
  //             return {
  //               status: statusCodeConstants.VALIDATION_ERROR,
  //               message: 'Please Provide atleast one Product detail for order creation.'
  //             }
  //           }

  //           const productDetails = []
  //           for (const p of payload.product) {

  //             const productObject = {
  //               orderId: orderDetails.orderId,
  //               orderDtlUuid: uuidv4(),
  //               productId: p.productId,
  //               productQuantity: p.productQuantity,
  //               productStatus: constantCode.status.ACTIVE,
  //               productAddedDate: p.productAddedDate,
  //               billAmount: p.billAmount,
  //               rcAmount: p.rcAmount,
  //               nrcAmount: p.nrcAmount,
  //               edof: p.edof,
  //               productSerialNo: p.productSerialNo,
  //               prodBundleId: p.bundleId,
  //               isBundle: p.isBundle,
  //               contractMonths: p.contract,
  //               ...commonAttrib
  //             }
  //             console.log('productObjectproductObjectproductObject', productObject)
  //             productDetails.push(productObject)
  //           }
  //           console.log(JSON.stringify(productDetails))
  //           // console.log(dd)
  //           await conn.OrdersDetails.bulkCreate(productDetails, { transaction: t })

  //           const OrdersTxnHdrInfo = {
  //             orderTxnUuid: uuidv4(),
  //             orderId: orderDetails.orderId,
  //             orderStatus: constantCode.status.NEW,
  //             orderFlow: orderFlowAction.CREATED,
  //             fromEntityId: departmentId,
  //             fromRoleId: roleId,
  //             fromUserId: userId,
  //             toEntityId: departmentId,
  //             toRoleId: roleId,
  //             orderDate: new Date(),
  //             orderCategory: orderData.orderCategory,
  //             serviceType: payload.serviceType,
  //             orderSource: orderData.orderSource,
  //             orderType: orderData.orderType,
  //             orderChannel: orderData.orderChannel,
  //             orderPriority: orderData.orderPriority,
  //             billAmount: payload.billAmount,
  //             orderDescription: payload.orderDescription,
  //             orderDeliveryMode: payload.orderDeliveryMode,
  //             customerId: customerInfo?.customerId || customerInfo?.dataValues?.customerId,
  //             accountId: checkingExistingAccount?.accountId || checkingExistingAccount?.dataValues?.accountId,
  //             serviceId: checkingExistingService?.serviceId || checkingExistingService?.dataValues?.serviceId,
  //             intxnId: orderData?.interactionId || null,
  //             orderFamily: payload.orderFamily,
  //             orderMode: payload.orderMode,
  //             contactPreference: payload.contactPreference,
  //             parentFlag: constantCode.common.NO,
  //             parentOrderId: masterOrders.orderId,
  //             parentOrderUuid: masterOrders.orderUuid,
  //             isFollowup: constantCode.common.NO,
  //             ...commonAttrib
  //           }
  //           console.log('OrdersTxnHdrInfo', OrdersTxnHdrInfo)

  //           const OrdersTxnHdrDetails = await conn.OrdersTxnHdr.create(OrdersTxnHdrInfo, { transaction: t })

  //           if (OrdersTxnHdrDetails) {
  //             const orderTxnDtlInfo = productDetails.map(product => ({ orderTxnId: OrdersTxnHdrDetails.orderTxnId, orderTxnDtlUuid: uuidv4(), ...product }))
  //             await conn.OrdersTxnDtl.bulkCreate(orderTxnDtlInfo, { transaction: t })
  //           }

  //           await assignWFToEntity(orderDetails.orderUuid, 'ORDER', flwId, commonAttrib, conn, t)
  //           const workflowExecute = await startWorkFlowEngineManual(orderDetails.orderUuid, conn, t)

  //           if (workflowExecute?.status === 'ERROR') {
  //             return {
  //               status: statusCodeConstants.ERROR,
  //               message: workflowExecute.message
  //             }
  //           }
  //           // Order to Task
  //           /**
  //           const getOrderTask = await getWFTask(orderDetails.orderUuid, entityCategory.ORDER, conn, t)

  //           const productIds = productDetails.map(p => p.productId)
  //           const productTask = await conn.ProductTaskMap.findAll({
  //             where: {
  //               productId: productIds
  //             }
  //           })
  //            */
  //         }
  //         result.push({
  //           orderNo: orderDetails.orderNo,
  //           orderUuid: orderDetails.orderUuid
  //         })
  //         count = count + 1
  //       }
  //     }

  //     // let contactWhereClause = {}
  //     // if (orderData?.customerId && customerInfo) {
  //     //   contactWhereClause = {
  //     //     contactCategoryValue: customerInfo.customerNo,
  //     //     status: constantCode.status.ACTIVE,
  //     //     contactCategory: entityCategory.CUSTOMER
  //     //   }
  //     // }
  //     // let contactInfo = await conn.Contact.findOne({
  //     //   where: { ...contactWhereClause },
  //     //   order: [['contactId', 'DESC']]
  //     // })

  //     // contactInfo = contactInfo?.dataValues ? contactInfo?.dataValues : contactInfo
  //     // let email, contactNo, contactNoPfx
  //     // if (contactInfo) {
  //     //   email = contactInfo.emailId || null
  //     //   contactNo = contactInfo.mobileNo || null
  //     //   contactNoPfx = contactInfo.mobilePrefix || null
  //     // }

  //     // const source = await conn.BusinessEntity.findOne({
  //     //   attributes: ['description'],
  //     //   where: {
  //     //     code: orderData.orderType
  //     //   }
  //     // })

  //     // // send email
  //     // logger.debug('Creating Notification request information')
  //     // const notificationData = {
  //     //   name: customerInfo.firstName,
  //     //   email,
  //     //   contactNo,
  //     //   contactNoPfx,
  //     //   notifiationSource: source.description,
  //     //   referenceId: masterOrders.orderNo,
  //     //   referenceSubId: masterTxnHdr.orderTxnId,
  //     //   userId: userId || systemUserId,
  //     //   customerId: customerInfo.customerId,
  //     //   departmentId,
  //     //   roleId,
  //     //   // channel: interactionData.channel,
  //     //   type: 'CREATE-ORDER',
  //     //   contactPreference: customerInfo.contactPreference,
  //     //   ...commonAttrib
  //     // }
  //     // console.log(notificationData)
  //     // em.emit('SEND_ORDER_NOTIFICATION', notificationData)

  //     try {
  //       if (customerInfo) {
  //         // console.log('======================= CHECK FOR CUSTOMER USER CREATION =========================')
  //         const customerContacts = await conn.Contact.findAll({ where: { contactCategoryValue: customerInfo.customerNo } })
  //         const customerAddresses = await conn.Address.findAll({ where: { addressCategoryValue: customerInfo.customerNo } })

  //         if (customerAddresses.length && customerContacts.length) {
  //           const primaryAddress = customerAddresses.find(x => x.isPrimary)
  //           const primaryContact = customerContacts.find(x => x.isPrimary)
  //           const customerContact = primaryContact || customerContacts[0]
  //           const customerAddress = primaryAddress || customerAddresses[0]
  //           const userInfo = await conn.User.findOne({
  //             where: {
  //               email: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email')), '=', customerContact?.emailId.toLowerCase())
  //             }
  //           })

  //           const userInfoMobile = await conn.User.findOne({
  //             where: {
  //               contactNo: customerContact?.mobileNo
  //             }
  //           })

  //           if (!userInfoMobile && !userInfo) {
  //             const userObj = {
  //               title: customerInfo.title,
  //               firstName: customerInfo.firstName,
  //               lastName: customerInfo.lastName,
  //               email: customerContact?.emailId,
  //               dob: customerInfo.birthDate,
  //               country: customerAddress?.country,
  //               gender: customerInfo.gender,
  //               contactNo: customerContact?.mobileNo,
  //               loginPassword: generateString(6),
  //               customerId: customerInfo.customerId,
  //               customerUuid: customerInfo.customerUuid,
  //               userType: 'UT_CONSUMER',
  //               userGroup: 'UG_CONSUMER',
  //               userSource: 'US_WEBAPP',
  //               ...commonAttrib
  //             }
  //             // console.log(userObj)
  //             // console.log('======================= GOING FOR CUSTOMER USER CREATION =========================')
  //             // await this.createUser(userObj, conn, t)
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.log(error)
  //       // console.log('============================ ERROR IN CUSTOMER USER CREATION ==============================')
  //     }

  //     return {
  //       status: statusCodeConstants.SUCCESS,
  //       message: `Order created Successfully #${masterOrders.orderNo}`,
  //       data: {
  //         orderId: masterOrders.orderNo,
  //         auxiliaryOrders: result
  //       }
  //     }
  //   } catch (error) {
  //     logger.error(error)
  //     return {
  //       status: statusCodeConstants.ERROR, message: 'Internal server error'
  //     }
  //   }
  // }

  async createUser (user, conn, t) {
    try {
      const loginid = await this.generateUserId(user.email, conn)
      const inviteToken = this.cryptoHelper.createHmac(user)
      const password = this.cryptoHelper.hashPassword(user.loginPassword)
      const payload = { userDeptRoleMapping: [{ roleId: [roleProperties.role.unitId], unitId: roleProperties.dept.unitId }] }
      user = {
        ...user,
        status: constantCode.status.ACTIVE,
        loginid,
        loginPassword: password,
        payload,
        biAccess: user.biAccess === true ? constantCode.common.YES : constantCode.common.NO,
        whatsappAccess: user.whatsappAccess === true ? constantCode.common.YES : constantCode.common.NO,
        createdBy: systemUserId,
        updatedBy: systemUserId
      }

      const createdUser = await conn.User.create(user, { transaction: t })

      if (createdUser) {
        const notificationData = {
          userId: createdUser.userId,
          loginId: createdUser.loginid,
          firstName: createdUser.firstName,
          domainURL,
          email: createdUser.email,
          loginPassword: user.loginPassword,
          inviteToken,
          type: 'CREATE-USER',
          channel: 'WEB',
          notifiationSource: 'USER',
          tranId: createdUser.tranId,
          createdDeptId: createdUser.createdDeptId,
          createdRoleId: createdUser.createdRoleId,
          createdBy: createdUser.createdBy,
          updatedBy: createdUser.updatedBy
        }

        em.emit('USER_CREATED', notificationData, conn)

        return true
      }
      return false
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  async generateUserId (emailId, conn) {
    const e = emailId.split('@')[0] + '_'
    const userData = await conn.User.findAndCountAll({
      where: {
        loginid: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('loginid')), 'LIKE', e.toLowerCase() + '%')
      }
    })
    let userCount = userData.count + 1
    userCount = userCount < 100 ? '00' + userCount.toString().substr('00' + userCount.toString().length - 2) : userCount
    const userId = e.toLowerCase() + `_${userCount}`
    return userId
  }

  async assignOrder (orderDetails, userId, roleId, departmentId, conn, t) {
    try {
      if (isEmpty(orderDetails)) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      if (orderDetails?.order && Array.isArray(orderDetails?.order) && orderDetails?.order.length > 0) {
        for (const orderData of orderDetails?.order) {
          const { orderNo, type } = orderData

          const checkExistingOrder = await conn.Orders.findOne({
            where: {
              orderNo
            }
          })

          if (!checkExistingOrder) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'The Order does not have any order details.'
            }
          }

          if (checkExistingOrder.parentFlag === 'Y') {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `The Order cannot be ${type === 'REASSIGN' ? 'reassigned' : 'assigned'}`
            }
          }

          if (checkExistingOrder.orderStatus === constantCode.status.CLOSED || checkExistingOrder.orderStatus === constantCode.status.CANCELLED) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `This order ${type === 'REASSIGN' ? 'reassign' : 'assign'}  is not allowed when Order current status in Closed/Cancel Status.`

            }
          }

          if (type === 'SELF') {
            if (checkExistingOrder.currUser) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: `The Order is already assigned ${checkExistingOrder.currUser === userId ? 'to you!' : 'to some other user.'}`
              }
            }
          } else if (type === 'REASSIGN') {
            if (!checkExistingOrder.currUser) {
              return {
                status: statusCodeConstants.VALIDATION_ERROR,
                message: 'The Order is not assigned to any other user.'
              }
            } else {
              if (checkExistingOrder.currUser === userId) {
                return {
                  status: statusCodeConstants.VALIDATION_ERROR,
                  message: 'The Order is already assigned to you!'
                }
              }
            }
          }

          if (checkExistingOrder && checkExistingOrder.currEntity !== departmentId &&
            checkExistingOrder.currRole !== roleId) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: 'The Order is currently in different department and role.'
            }
          }

          let assignData = { currUser: userId || systemUserId, assignedDate: (new Date()) }
          if (type === 'SELF') {
            assignData = {
              ...assignData,
              currEntity: departmentId,
              currRole: roleId || systemRoleId
            }
          }

          const assignOrder = await conn.Orders.update(assignData, {
            where: { orderNo },
            transaction: t
          })

          if (!assignOrder) {
            logger.error('Error while update on assign or reassign')
            return {
              status: statusCodeConstants.ERROR,
              message: 'Internal server error'
            }
          }

          const previousHistory = await conn.OrdersTxnHdr.findOne({
            order: [['createdAt', 'DESC']],
            where: {
              orderId: checkExistingOrder.orderId
            }
          })

          const commonAttrib = {
            tranId: uuidv4(),
            createdDeptId: departmentId,
            createdRoleId: roleId,
            createdBy: userId,
            updatedBy: userId
          }

          const addHistory = {
            orderTxnUuid: uuidv4(),
            orderId: checkExistingOrder.orderId,
            orderStatus: previousHistory?.orderStatus || checkExistingOrder?.orderStatus,
            orderFlow: type === 'REASSIGN' ? orderFlowAction.REASSIGN : orderFlowAction.ASSIGN,
            remarks: type === 'REASSIGN' ? 'Re-Assign to self' : 'Assign to self',
            fromEntityId: previousHistory?.toEntityId || departmentId,
            fromRoleId: previousHistory?.toRoleId || roleId,
            fromUserId: previousHistory?.toUserId || userId,
            toEntityId: departmentId,
            toRoleId: roleId,
            toUserId: userId,
            orderDate: new Date(),
            orderCategory: checkExistingOrder.orderCategory,
            serviceType: checkExistingOrder.serviceType,
            orderSource: checkExistingOrder.orderSource,
            orderType: checkExistingOrder.orderType,
            orderChannel: checkExistingOrder.orderChannel,
            orderPriority: checkExistingOrder.orderPriority,
            billAmount: checkExistingOrder.billAmount,
            orderDescription: checkExistingOrder.orderDescription,
            orderDeliveryMode: checkExistingOrder.orderDeliveryMode,
            customerId: checkExistingOrder.customerId,
            accountId: checkExistingOrder.accountId,
            serviceId: checkExistingOrder.serviceId,
            intxnId: checkExistingOrder?.intxnId || null,
            orderFamily: checkExistingOrder.orderFamily,
            orderMode: checkExistingOrder.orderMode,
            contactPreference: checkExistingOrder.contactPreference,
            isFollowup: constantCode.common.NO,
            ...commonAttrib
          }
          const OrdersTxnHdrDetails = await conn.OrdersTxnHdr.create(addHistory, { transaction: t })

          if (OrdersTxnHdrDetails) {
            const wfHdrData = await conn.WorkflowHdr.findOne({ where: { entityId: checkExistingOrder.orderId } })
            const wfHdrId = wfHdrData?.wfHdrId
            if (wfHdrId) {
              const WorkflowHistory = await conn.WorkflowTxn.findOne({
                where: {
                  wfHdrId,
                  wfTxnStatus: constantCode.status.USER_WAIT
                },
                order: [['wfTxnId', 'DESC']]
              })
              const wfTxnId = WorkflowHistory?.wfTxnId
              if (wfTxnId) {
                await conn.WorkflowTxn.update(assignData, { where: { wfTxnId } })
              }
            }
          }
          let customerInfo = await conn.Customer.findOne({
            where: {
              customerId: checkExistingOrder.customerId
            }
          })
          customerInfo = customerInfo?.dataValues ?? customerInfo

          const notificationObj = {
            notificationType: constantCode.common.POPUP,
            subject: 'Order is Assigned to your You',
            channel: orderDetails?.channel ? orderDetails?.channel : 'WEB',
            body: 'Order is Assigned to your You',
            orderId: checkExistingOrder.orderId,
            userId,
            roleId,
            departmentId,
            status: 'SENT',
            orderNumber: orderNo,
            priority: checkExistingOrder.orderPriority,
            customerNo: customerInfo.customerNo,
            assignedUserId: userId,
            assignedDepartmentId: departmentId,
            assignedRoleId: roleId,
            orderStatus: previousHistory?.orderStatus || checkExistingOrder?.orderStatus
          }
          logger.debug('Order PopUp Notification', notificationObj)
          em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', notificationObj)
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order has updated successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async editOrder (orderData, userId, roleId, departmentId, conn, t) {
    try {
      if (isEmpty(orderData)) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { orderNo } = orderData

      let checkExistingOrder = await conn.Orders.findOne({
        where: {
          orderNo
        },
        include: [
          { model: conn.OrdersDetails, as: 'orderProductDtls' }
        ]
      })
      checkExistingOrder = checkExistingOrder?.dataValues ? checkExistingOrder?.dataValues : checkExistingOrder

      if (!checkExistingOrder) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'This Order No does not have any order details.'
        }
      }

      // NEED TO UNCOMMENT BELOW LINES
      if (checkExistingOrder.currUser !== userId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `This Order No ${orderNo} is not assigned to you!`
        }
      }

      if (checkExistingOrder.parentFlag === 'Y') {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'The Order cannot be update'
        }
      }

      if (checkExistingOrder.orderStatus === constantCode.status.CLOSED || checkExistingOrder.orderStatus === constantCode.status.CANCELLED) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'This order has not been allowed to update when the order current status is closed or cancelled.'
        }
      }

      let checkExistingCustomer, checkExistingAccount, checkExistingService
      if (checkExistingOrder?.customerId) {
        checkExistingCustomer = await conn.Customer.findOne({
          where: {
            customerId: checkExistingOrder.customerId
          }
        })

        if (!checkExistingCustomer) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `Unable to locate associated customer for order no - ${orderNo}`
          }
        }
        checkExistingCustomer = checkExistingCustomer?.dataValues ? checkExistingCustomer?.dataValues : checkExistingCustomer
      }

      if (checkExistingOrder?.accountId) {
        checkExistingAccount = await conn.CustAccounts.findOne({
          where: {
            accountId: checkExistingOrder.accountId
          }
        })

        if (!checkExistingAccount) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: `Unable to locate associated account for order no - ${orderNo}`
          }
        }

        checkExistingAccount = checkExistingAccount?.dataValues ? checkExistingAccount?.dataValues : checkExistingAccount
      }

      if (checkExistingOrder?.serviceId) {
        checkExistingService = await conn.CustServices.findOne({
          where: {
            serviceId: checkExistingOrder.serviceId
          }
        })
        if (!checkExistingService) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: `Unable to locate associated service for order no - ${orderNo}`
          }
        }
        checkExistingService = checkExistingService?.dataValues ? checkExistingService?.dataValues : checkExistingService
      }
      let taskAvailableAndNotCompleted = false
      if (!orderData?.tasks || !orderData?.tasks?.length) {
        taskAvailableAndNotCompleted = false
      } else {
        for (let index = 0; index < orderData?.tasks?.length; index++) {
          const negativeTaskAvailable = orderData?.tasks?.find(x => x.type == 'negative')
          if (negativeTaskAvailable) {
            taskAvailableAndNotCompleted = true
          }
        }
      }
      if (taskAvailableAndNotCompleted) {
        orderData = {
          ...orderData,
          roleId: checkExistingOrder?.currRole,
          departmentId: checkExistingOrder?.currEntity
        }
      }
      if (orderData?.status !== constantCode.status.CLOSED) {
        const businessUnitInfo = await conn.BusinessUnit.findOne({
          attributes: ['mappingPayload', 'unitName'],
          where: {
            unitId: orderData.departmentId,
            status: constantCode.status.ACTIVE,
            unitType: 'DEPT'
          }
        })

        if (!businessUnitInfo) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: 'Provided department is not available in system'
          }
        } else {
          const role = businessUnitInfo?.mappingPayload?.unitroleMapping.includes(orderData.roleId) || false
          if (!role) {
            // NEED TO UNCOMMENT BELOW LINES
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `Provided role is not mapped to ${businessUnitInfo.unitName} department`
            }
          } else {
            const checkRoleExistence = await conn.Role.findOne({
              where: {
                roleId: orderData.roleId,
                status: constantCode.status.ACTIVE
              }
            })
            if (!checkRoleExistence) {
              return {
                status: statusCodeConstants.NOT_FOUND,
                message: 'Provided role is not in Active Status'
              }
            }
          }
        }
      }
      let updateData = {
        orderStatus: checkExistingOrder?.status,
        currUser: checkExistingOrder?.currUser,
        currRole: checkExistingOrder?.currRole,
        currEntity: checkExistingOrder?.currEntity
      }
      if (!taskAvailableAndNotCompleted) {
        updateData = {
          orderStatus: orderData?.status,
          currUser: orderData?.userId || null,
          currRole: orderData?.roleId || roleId || systemRoleId,
          currEntity: orderData?.departmentId || departmentId || 'COMQUEST.BCT'
        }
      }

      // console.log({ taskAvailableAndNotCompleted })

      if (orderData?.tasks?.length) {
        const APPOINTMENT_TASK_NO = 'TASK00000013'
        const taskNos = orderData?.tasks?.map(x => x.taskNo)
        const tasks = await conn.TaskMst.findAll({ where: { taskNo: taskNos } })
        for (let index = 0; index < orderData?.tasks?.length; index++) {
          const taskDetail = orderData?.tasks[index]
          if (taskDetail?.taskNo == APPOINTMENT_TASK_NO && taskDetail?.value == 'TS_COMPLETED') {
            const appointResult = await conn.AppointmentTxn.findOne({
              where: {
                tranCategoryType: 'ORDER',
                tranCategoryNo: orderNo
              },
              include: [
                {
                  model: conn.BusinessEntity,
                  attributes: ['code', 'description', 'mappingPayload'],
                  as: 'statusDesc'
                }
              ]
            })

            if (!appointResult) {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Sorry, you don\'t have appointment task for this order'
              }
            } else if (appointResult?.statusDesc?.mappingPayload?.mode != 'FINISHED') {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Sorry, appointment for this order is not completed.'
              }
            }
          }
          if (taskDetail?.orderTaskId) {
            await conn.OrderTaskHdr.update({
              status: taskDetail?.value,
              comments: taskDetail?.comments
            }, { where: { orderTaskId: taskDetail?.orderTaskId }, transaction: t })
          } else {
            const orderTaskData = {
              orderId: checkExistingOrder.orderId,
              // productId: "",
              taskId: tasks?.find(x => x.taskNo == taskDetail?.taskNo)?.taskId,
              status: taskDetail?.value,
              comments: taskDetail?.comments,
              taskUuid: tasks?.find(x => x.taskNo == taskDetail?.taskNo)?.taskUuid,
              orderTaskHdrUuid: uuidv4(),
              // productUuid: "",
              orderUuid: checkExistingOrder.orderUuid,
              createdBy: userId || systemUserId,
              createdAt: new Date(),
              updatedBy: userId || systemUserId,
              updatedAt: new Date()
            }
            await conn.OrderTaskHdr.create(orderTaskData, { transaction: t })
          }
        }
      }

      await conn.Orders.update(updateData, { where: { orderId: checkExistingOrder.orderId }, transaction: t })

      const parentOrderId = checkExistingOrder?.parentOrderId

      const childOrder = await conn.Orders.findAll({
        where: {
          parentOrderId
        }
      })

      const childOrders = childOrder?.dataValues ? childOrder?.dataValues : childOrder
      const count = childOrders?.length
      const closedCounts = childOrders?.map((ele) => ele?.orderStatus)
      let flag = false
      const l = closedCounts?.filter((ele) => ele === 'CLS')

      if ((l?.length == count - 1 || count - 1 == 0) && orderData?.status === 'CLS') {
        flag = true
      }

      if (closedCounts.every((e) => e === 'CLS') || flag) {
        await conn.Orders.update(updateData, { where: { orderId: checkExistingOrder.parentOrderId }, transaction: t })
      }

      const previousHistory = await conn.OrdersTxnHdr.findOne({
        where: {
          orderId: checkExistingOrder.orderId
        },
        order: [['orderTxnId', 'DESC']]
      })

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId || 'COMQUEST.BCT',
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      const addHistory = {
        orderTxnUuid: uuidv4(),
        orderId: previousHistory.orderId,
        orderStatus: orderData.status,
        orderFlow: orderFlowAction.UPDATE,
        fromEntityId: previousHistory.toEntityId,
        fromRoleId: previousHistory.toRoleId,
        fromUserId: previousHistory.toUserId || userId,
        toEntityId: orderData.departmentId || departmentId,
        toRoleId: orderData.roleId || roleId,
        toUserId: orderData.userId || null,
        orderDate: new Date(),
        orderCategory: previousHistory.orderCategory,
        serviceType: previousHistory.serviceType,
        orderSource: previousHistory.orderSource,
        orderType: previousHistory.orderType,
        orderChannel: previousHistory.orderChannel,
        orderPriority: previousHistory.orderPriority,
        billAmount: previousHistory.billAmount,
        orderDescription: previousHistory.orderDescription,
        orderDeliveryMode: previousHistory.orderDeliveryMode,
        customerId: previousHistory.customerId,
        accountId: previousHistory.accountId,
        serviceId: previousHistory.serviceId,
        intxnId: previousHistory?.intxnId || null,
        orderFamily: previousHistory.orderFamily,
        orderMode: previousHistory.orderMode,
        contactPreference: previousHistory.contactPreference,
        isFollowup: constantCode.common.NO,
        remarks: orderData?.remarks,
        ...commonAttrib
      }

      const orderHistory = await conn.OrdersTxnHdr.create(addHistory, { transaction: t })
      if (orderData.payloads && Array.isArray(orderData.payloads) && orderData.payloads.length > 0) {
        const payloadAttrib = {
          orderTxnId: orderHistory.orderTxnId,
          orderTxnDtlUuid: uuidv4(),
          orderId: orderHistory.orderId
        }
        for (const payload of orderData.payloads) {
          const checkProduct = await conn.Product.findOne({
            where: {
              productId: payload.productId,
              status: constantCode.status.ACTIVE
            }
          })

          if (!checkProduct) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `provided Product ${payload.productSerialNo} is not available in product master`
            }
          }
          payload.productName = checkProduct.productName
          const updateProduct = await createOrUpdateProduct(payload, payloadAttrib, commonAttrib, conn, t)
          if (updateProduct.status === 'ERROR') {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: updateProduct.message
            }
          }
        }
      }

      // if all tasks completed for the current status - START
      if (!taskAvailableAndNotCompleted) {
        await updateWFState(checkExistingOrder.orderUuid, 'ORDER', {
          status: orderData.status,
          dept: orderData.departmentId || departmentId,
          role: orderData.roleId || roleId
        }, userId, conn, t)

        const workflowExecute = await startWorkFlowEngineManual(checkExistingOrder.orderUuid, conn, t)
        // if all tasks completed for the current status - END

        // if (orderData.taskPayloads && Array.isArray(orderData?.taskPayloads) && orderData.taskPayloads.length > 0) {
        //   const taskDetails = orderData?.taskPayloads.map((e) => {
        //     return {
        //       orderTxnHdrId: orderHistory.orderTxnHdrId,
        //       taskId: e.taskId,
        //       status: e.taskStatus,
        //       taskUuid: e.taskUuid
        //       // orderTxnHdrUuid:
        //       // orderTxnDtlUuid:
        //     }
        //   })
        // }

        if (workflowExecute?.status === 'ERROR') {
          return {
            status: statusCodeConstants.ERROR,
            message: workflowExecute.message
          }
        }
      }

      /* Order to Task */
      // const getOrderTask = await getWFTask(checkExistingOrder.orderUuid, entityCategory.ORDER, conn, t)
      // const taskIds = getOrderTask.data.entities[0].task.map((e) => e.taskId)

      // const getExistingDetails = await conn.OrdersDetails.findAll({
      //   attributes: ['productId'],
      //   where: {
      //     orderId: checkExistingOrder.orderId,
      //     productStatus: constantCode.status.ACTIVE
      //   }
      // })

      // const productIds = getExistingDetails.map(p => p.productId)
      // const productTask = await conn.ProductTaskMap.findAll({
      //   attributes: ['taskId'],
      //   where: {
      //     productId: productIds
      //   }
      // })

      if (orderData.status === constantCode.status.CLOSED) {
        if (!taskAvailableAndNotCompleted) {
          console.log('==================== ORDER STATUS CLOSED ===========================')

          // TODO: need to create contract here in closing condition and also activate the service/customer/account based on order type as new connection
          if (checkExistingOrder.orderType === orderType.signUp) {
            if (checkExistingCustomer && checkExistingCustomer.status === constantCode.customerStatus.PENDING) {
              await conn.Customer.update({ status: constantCode.customerStatus.ACTIVE, updatedBy: userId }, { where: { customerId: checkExistingCustomer.customerId }, transaction: t })
            }

            if (checkExistingAccount && checkExistingAccount.status === constantCode.customerStatus.PENDING) {
              await conn.CustAccounts.update({ status: constantCode.customerStatus.ACTIVE, updatedBy: userId }, { where: { accountId: checkExistingAccount.accountId }, transaction: t })
            }

            if (checkExistingService && checkExistingService.status === constantCode.serviceStatus.PENDING) {
              await conn.CustServices.update({ status: constantCode.serviceStatus.ACTIVE, updatedBy: userId, activationDate: new Date() }, { where: { serviceId: checkExistingService.serviceId }, transaction: t })
            }
          }

          if (checkExistingOrder.orderType === orderType.upgrade || checkExistingOrder.orderType === orderType.downgrade ||
            checkExistingOrder.orderType === orderType.terminate
          ) {
            const checkOrdersDetails = await conn.OrdersDetails.findAll({
              where: {
                orderId: checkExistingOrder.orderId
              }
            })

            const checkExistingContract = await conn.Contract.findAll({
              where: {
                serviceId: checkExistingService.serviceId,
                status: {
                  [Op.notIn]: ['CONTR_ST_CLOSED']
                }
              },
              logging: console.log
            })

            if (checkExistingService && checkOrdersDetails) {
              const plans = checkOrdersDetails.map(e => e.productId)
              await conn.CustServices.update({ planPayload: plans?.[0] }, { where: { serviceId: checkExistingService.serviceId }, transaction: t })
            }
            if (checkExistingContract) {
              const contractIds = checkExistingContract.map((c) => c.contractId)
              if (contractIds) {
                await conn.MonthlyContractDtl.update({ status: 'CONTR_ST_CLOSED' }, { where: { contractId: contractIds }, transaction: t })
                await conn.MonthlyContract.update({ status: 'CONTR_ST_CLOSED' }, { where: { contractId: contractIds }, transaction: t })

                await conn.ContractDtl.update({ status: 'CONTR_ST_CLOSED' }, { where: { contractId: contractIds }, transaction: t })
                await conn.Contract.update({ status: 'CONTR_ST_CLOSED' }, { where: { contractId: contractIds }, transaction: t })
              }
            }

            if (checkExistingOrder.orderType === orderType.terminate) {
              // serviceId: checkExistingService.serviceId
              await conn.CustServices.update({ status: constantCode.serviceStatus.IN_ACTIVE }, {
                where: {
                  serviceId: checkExistingService.serviceId
                },
                transaction: t
              })
              const customerActiveService = await conn.CustServices.findOne({
                where: {
                  customerUuid: checkExistingCustomer.customerUuid,
                  status: constantCode.serviceStatus.ACTIVE
                },
                transaction: t
              })
              if (!customerActiveService) {
                await conn.Customer.update({ status: constantCode.customerStatus.IN_ACTIVE }, {
                  where: {
                    customerUuid: checkExistingCustomer.customerUuid
                  },
                  transaction: t
                })
              }
            }
          }

          if (checkExistingOrder.orderType === orderType.terminate) {
            // serviceId: checkExistingService.serviceId
            await conn.CustServices.update({ status: constantCode.serviceStatus.IN_ACTIVE, expiryDate: new Date() }, {
              where: {
                parentOrderId: checkExistingOrder.parentOrderId,
                orderStatus: {
                  [Op.notIn]: [constantCode.status.CLOSED, constantCode.status.CANCELLED]
                }
              },
              transaction: t
            })

            if (checkMasterOrder?.count === 0) {
              const updateMasterOrder = {
                orderStatus: constantCode.status.CLOSED,
                updatedBy: userId
              }

              await conn.Orders.update(updateMasterOrder, {
                where: {
                  orderId: checkExistingOrder.parentOrderId
                },
                transaction: t
              })

              const masterOrdersTxnHdrInfo = {
                orderTxnUuid: uuidv4(),
                orderId: checkExistingOrder.parentOrderId,
                orderStatus: constantCode.status.CLOSED,
                orderFlow: orderFlowAction.UPDATE,
                fromEntityId: departmentId,
                fromRoleId: roleId,
                fromUserId: userId,
                toEntityId: departmentId,
                toRoleId: roleId,
                orderDate: new Date(),
                orderCategory: checkExistingOrder.orderCategory,
                orderSource: checkExistingOrder.orderSource,
                orderType: checkExistingOrder.orderType,
                orderChannel: checkExistingOrder.orderChannel,
                orderPriority: checkExistingOrder.orderPriority,
                billAmount: checkExistingOrder.billAmount,
                orderDescription: checkExistingOrder.orderDescription,
                customerId: checkExistingOrder.customerId,
                intxnId: checkExistingOrder?.intxnId || null,
                parentFlag: constantCode.common.YES,
                isFollowup: constantCode.common.NO,
                ...commonAttrib
              }

              await conn.OrdersTxnHdr.create(masterOrdersTxnHdrInfo, { transaction: t })
            }
          }

          // update contract
          if (checkExistingOrder.orderType !== orderType.terminate) {
            console.log('==================== GOING TO CREATE CONTRACT ===========================')
            const contractService = new ContractService(conn)
            const loggedUser = { userId, roleId, departmentId }
            const contractsCreated = await contractService.createContract(checkExistingOrder, checkExistingService, checkExistingAccount, checkExistingCustomer, loggedUser, t)
            console.log(contractsCreated, '==================== contracts Created ===================')

            if (contractsCreated.status !== 200) {
              return {
                status: statusCodeConstants.ERROR, message: 'Internal server error'
              }
            }
          }
          return {
            status: statusCodeConstants.SUCCESS,
            message: 'Order has been updated successfully'
          }
        } else {
          return {
            status: statusCodeConstants.ERROR,
            message: 'Sorry, there are pending tasks to be completed'
          }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order has been updated successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async editOrderEx (orderData, userId, roleId, departmentId, conn, t) {
    try {
      if (isEmpty(orderData)) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { orderNo } = orderData

      let checkExistingOrder = await conn.Orders.findOne({
        where: {
          orderNo
        },
        include: [
          { model: conn.OrdersDetails, as: 'orderProductDtls' }
        ]
      })
      checkExistingOrder = checkExistingOrder?.dataValues ? checkExistingOrder?.dataValues : checkExistingOrder

      if (!checkExistingOrder) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'This Order No does not have any order details.'
        }
      }

      // NEED TO UNCOMMENT BELOW LINES
      if (checkExistingOrder.currUser !== userId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `This Order No ${orderNo} is not assigned to you!`
        }
      }

      if (checkExistingOrder.parentFlag === 'Y') {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'The Order cannot be update'
        }
      }

      if (checkExistingOrder.orderStatus === constantCode.status.CLOSED || checkExistingOrder.orderStatus === constantCode.status.CANCELLED) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'This order has not been allowed to update when the order current status is closed or cancelled.'
        }
      }

      let checkExistingCustomer, checkExistingAccount, checkExistingService
      if (checkExistingOrder?.customerId) {
        checkExistingCustomer = await conn.Customer.findOne({
          where: {
            customerId: checkExistingOrder.customerId
          }
        })

        if (!checkExistingCustomer) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: `Unable to locate associated customer for order no - ${orderNo}`
          }
        }
        checkExistingCustomer = checkExistingCustomer?.dataValues ? checkExistingCustomer?.dataValues : checkExistingCustomer
      }

      if (checkExistingOrder?.accountId) {
        checkExistingAccount = await conn.CustAccounts.findOne({
          where: {
            accountId: checkExistingOrder.accountId
          }
        })

        if (!checkExistingAccount) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: `Unable to locate associated account for order no - ${orderNo}`
          }
        }

        checkExistingAccount = checkExistingAccount?.dataValues ? checkExistingAccount?.dataValues : checkExistingAccount
      }

      if (checkExistingOrder?.serviceId) {
        checkExistingService = await conn.CustServices.findOne({
          where: {
            serviceId: checkExistingOrder.serviceId
          }
        })
        if (!checkExistingService) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: `Unable to locate associated service for order no - ${orderNo}`
          }
        }
        checkExistingService = checkExistingService?.dataValues ? checkExistingService?.dataValues : checkExistingService
      }
      let taskAvailableAndNotCompleted = false
      if (!orderData?.tasks || !orderData?.tasks?.length) {
        taskAvailableAndNotCompleted = false
      } else {
        for (let index = 0; index < orderData?.tasks?.length; index++) {
          const negativeTaskAvailable = orderData?.tasks?.find(x => x.type == 'negative')
          if (negativeTaskAvailable) {
            taskAvailableAndNotCompleted = true
          }
        }
      }
      if (taskAvailableAndNotCompleted) {
        orderData = {
          ...orderData,
          roleId: checkExistingOrder?.currRole,
          departmentId: checkExistingOrder?.currEntity
        }
      }
      if (orderData?.status !== constantCode.status.CLOSED) {
        const businessUnitInfo = await conn.BusinessUnit.findOne({
          attributes: ['mappingPayload', 'unitName'],
          where: {
            unitId: orderData.departmentId,
            status: constantCode.status.ACTIVE,
            unitType: 'DEPT'
          }
        })

        if (!businessUnitInfo) {
          return {
            status: statusCodeConstants.NOT_FOUND,
            message: 'Provided department is not available in system'
          }
        } else {
          const role = businessUnitInfo?.mappingPayload?.unitroleMapping.includes(orderData.roleId) || false
          if (!role) {
            // NEED TO UNCOMMENT BELOW LINES
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `Provided role is not mapped to ${businessUnitInfo.unitName} department`
            }
          } else {
            const checkRoleExistence = await conn.Role.findOne({
              where: {
                roleId: orderData.roleId,
                status: constantCode.status.ACTIVE
              }
            })
            if (!checkRoleExistence) {
              return {
                status: statusCodeConstants.NOT_FOUND,
                message: 'Provided role is not in Active Status'
              }
            }
          }
        }
      }
      let updateData = {
        orderStatus: checkExistingOrder?.status,
        currUser: checkExistingOrder?.currUser,
        currRole: checkExistingOrder?.currRole,
        currEntity: checkExistingOrder?.currEntity
      }
      if (!taskAvailableAndNotCompleted) {
        updateData = {
          orderStatus: orderData?.status,
          currUser: orderData?.userId || null,
          currRole: orderData?.roleId || roleId || systemRoleId,
          currEntity: orderData?.departmentId || departmentId || 'COMQUEST.BCT'
        }
      }

      // console.log({ taskAvailableAndNotCompleted })

      if (orderData?.tasks?.length) {
        const APPOINTMENT_TASK_NO = 'TASK00000013'
        const taskNos = orderData?.tasks?.map(x => x.taskNo)
        const tasks = await conn.TaskMst.findAll({ where: { taskNo: taskNos } })
        for (let index = 0; index < orderData?.tasks?.length; index++) {
          const taskDetail = orderData?.tasks[index]
          if (taskDetail?.taskNo == APPOINTMENT_TASK_NO && taskDetail?.value == 'TS_COMPLETED') {
            const appointResult = await conn.AppointmentTxn.findOne({
              where: {
                tranCategoryType: 'ORDER',
                tranCategoryNo: orderNo
              },
              include: [
                {
                  model: conn.BusinessEntity,
                  attributes: ['code', 'description', 'mappingPayload'],
                  as: 'statusDesc'
                }
              ]
            })

            if (!appointResult) {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Sorry, you don\'t have appointment task for this order'
              }
            } else if (appointResult?.statusDesc?.mappingPayload?.mode != 'FINISHED') {
              return {
                status: statusCodeConstants.ERROR,
                message: 'Sorry, appointment for this order is not completed.'
              }
            }
          }
          if (taskDetail?.orderTaskId) {
            await conn.OrderTaskHdr.update({
              status: taskDetail?.value,
              comments: taskDetail?.comments
            }, { where: { orderTaskId: taskDetail?.orderTaskId }, transaction: t })
          } else {
            const orderTaskData = {
              orderId: checkExistingOrder.orderId,
              // productId: "",
              taskId: tasks?.find(x => x.taskNo == taskDetail?.taskNo)?.taskId,
              status: taskDetail?.value,
              comments: taskDetail?.comments,
              taskUuid: tasks?.find(x => x.taskNo == taskDetail?.taskNo)?.taskUuid,
              orderTaskHdrUuid: uuidv4(),
              // productUuid: "",
              orderUuid: checkExistingOrder.orderUuid,
              createdBy: userId || systemUserId,
              createdAt: new Date(),
              updatedBy: userId || systemUserId,
              updatedAt: new Date()
            }
            await conn.OrderTaskHdr.create(orderTaskData, { transaction: t })
          }
        }
      }

      await conn.Orders.update(updateData, { where: { orderId: checkExistingOrder.orderId }, transaction: t })
      const previousHistory = await conn.OrdersTxnHdr.findOne({
        where: {
          orderId: checkExistingOrder.orderId
        },
        order: [['orderTxnId', 'DESC']]
      })

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId || 'COMQUEST.BCT',
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      const addHistory = {
        orderTxnUuid: uuidv4(),
        orderId: previousHistory.orderId,
        orderStatus: orderData.status,
        orderFlow: orderFlowAction.UPDATE,
        fromEntityId: previousHistory.toEntityId,
        fromRoleId: previousHistory.toRoleId,
        fromUserId: previousHistory.toUserId || userId,
        toEntityId: orderData.departmentId || departmentId,
        toRoleId: orderData.roleId || roleId,
        toUserId: orderData.userId || null,
        orderDate: new Date(),
        orderCategory: previousHistory.orderCategory,
        serviceType: previousHistory.serviceType,
        orderSource: previousHistory.orderSource,
        orderType: previousHistory.orderType,
        orderChannel: previousHistory.orderChannel,
        orderPriority: previousHistory.orderPriority,
        billAmount: previousHistory.billAmount,
        orderDescription: previousHistory.orderDescription,
        orderDeliveryMode: previousHistory.orderDeliveryMode,
        customerId: previousHistory.customerId,
        accountId: previousHistory.accountId,
        serviceId: previousHistory.serviceId,
        intxnId: previousHistory?.intxnId || null,
        orderFamily: previousHistory.orderFamily,
        orderMode: previousHistory.orderMode,
        contactPreference: previousHistory.contactPreference,
        isFollowup: constantCode.common.NO,
        remarks: orderData?.remarks,
        ...commonAttrib
      }

      const orderHistory = await conn.OrdersTxnHdr.create(addHistory, { transaction: t })
      if (orderData.payloads && Array.isArray(orderData.payloads) && orderData.payloads.length > 0) {
        const payloadAttrib = {
          orderTxnId: orderHistory.orderTxnId,
          orderTxnDtlUuid: uuidv4(),
          orderId: orderHistory.orderId
        }
        for (const payload of orderData.payloads) {
          const checkProduct = await conn.Product.findOne({
            where: {
              productId: payload.productId,
              status: constantCode.status.ACTIVE
            }
          })

          if (!checkProduct) {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: `provided Product ${payload.productSerialNo} is not available in product master`
            }
          }
          payload.productName = checkProduct.productName
          const updateProduct = await createOrUpdateProduct(payload, payloadAttrib, commonAttrib, conn, t)
          if (updateProduct.status === 'ERROR') {
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message: updateProduct.message
            }
          }
        }
      }

      // if all tasks completed for the current status - START
      if (!taskAvailableAndNotCompleted) {
        await updateWFState(checkExistingOrder.orderUuid, 'ORDER', {
          status: orderData.status,
          dept: orderData.departmentId || departmentId,
          role: orderData.roleId || roleId
        }, userId, conn, t)

        const workflowExecute = await startWorkFlowEngineManual(checkExistingOrder.orderUuid, conn, t)
        // if all tasks completed for the current status - END

        // if (orderData.taskPayloads && Array.isArray(orderData?.taskPayloads) && orderData.taskPayloads.length > 0) {
        //   const taskDetails = orderData?.taskPayloads.map((e) => {
        //     return {
        //       orderTxnHdrId: orderHistory.orderTxnHdrId,
        //       taskId: e.taskId,
        //       status: e.taskStatus,
        //       taskUuid: e.taskUuid
        //       // orderTxnHdrUuid:
        //       // orderTxnDtlUuid:
        //     }
        //   })
        // }

        if (workflowExecute?.status === 'ERROR') {
          return {
            status: statusCodeConstants.ERROR,
            message: workflowExecute.message
          }
        }
      }

      /* Order to Task */
      // const getOrderTask = await getWFTask(checkExistingOrder.orderUuid, entityCategory.ORDER, conn, t)
      // const taskIds = getOrderTask.data.entities[0].task.map((e) => e.taskId)

      // const getExistingDetails = await conn.OrdersDetails.findAll({
      //   attributes: ['productId'],
      //   where: {
      //     orderId: checkExistingOrder.orderId,
      //     productStatus: constantCode.status.ACTIVE
      //   }
      // })

      // const productIds = getExistingDetails.map(p => p.productId)
      // const productTask = await conn.ProductTaskMap.findAll({
      //   attributes: ['taskId'],
      //   where: {
      //     productId: productIds
      //   }
      // })

      if (orderData.status === constantCode.status.CLOSED) {
        if (!taskAvailableAndNotCompleted) {
          console.log('==================== ORDER STATUS CLOSED ===========================')

          // TODO: need to create contract here in closing condition and also activate the service/customer/account based on order type as new connection
          if (checkExistingOrder.orderType === orderType.signUp) {
            if (checkExistingCustomer && checkExistingCustomer.status === constantCode.customerStatus.PENDING) {
              await conn.Customer.update({ status: constantCode.customerStatus.ACTIVE, updatedBy: userId }, { where: { customerId: checkExistingCustomer.customerId }, transaction: t })
            }

            if (checkExistingAccount && checkExistingAccount.status === constantCode.customerStatus.PENDING) {
              await conn.CustAccounts.update({ status: constantCode.customerStatus.ACTIVE, updatedBy: userId }, { where: { accountId: checkExistingAccount.accountId }, transaction: t })
            }

            if (checkExistingService && checkExistingService.status === constantCode.serviceStatus.PENDING) {
              await conn.CustServices.update({ status: constantCode.serviceStatus.ACTIVE, updatedBy: userId, activationDate: new Date() }, { where: { serviceId: checkExistingService.serviceId }, transaction: t })
            }
          }

          if (checkExistingOrder.orderType === orderType.upgrade || checkExistingOrder.orderType === orderType.downgrade ||
            checkExistingOrder.orderType === orderType.terminate
          ) {
            const checkOrdersDetails = await conn.OrdersDetails.findAll({
              where: {
                orderId: checkExistingOrder.orderId
              }
            })

            const checkExistingContract = await conn.Contract.findAll({
              where: {
                serviceId: checkExistingService.serviceId,
                status: {
                  [Op.notIn]: ['CONTR_ST_CLOSED']
                }
              },
              logging: console.log
            })

            if (checkExistingService && checkOrdersDetails) {
              const plans = checkOrdersDetails.map(e => e.productId)
              await conn.CustServices.update({ planPayload: plans?.[0] }, { where: { serviceId: checkExistingService.serviceId }, transaction: t })
            }
            if (checkExistingContract) {
              const contractIds = checkExistingContract.map((c) => c.contractId)
              if (contractIds) {
                await conn.MonthlyContractDtl.update({ status: 'CONTR_ST_CLOSED' }, { where: { contractId: contractIds }, transaction: t })
                await conn.MonthlyContract.update({ status: 'CONTR_ST_CLOSED' }, { where: { contractId: contractIds }, transaction: t })

                await conn.ContractDtl.update({ status: 'CONTR_ST_CLOSED' }, { where: { contractId: contractIds }, transaction: t })
                await conn.Contract.update({ status: 'CONTR_ST_CLOSED' }, { where: { contractId: contractIds }, transaction: t })
              }
            }

            if (checkExistingOrder.orderType === orderType.terminate) {
              // serviceId: checkExistingService.serviceId
              await conn.CustServices.update({ status: constantCode.serviceStatus.IN_ACTIVE }, {
                where: {
                  serviceId: checkExistingService.serviceId
                },
                transaction: t
              })
              const customerActiveService = await conn.CustServices.findOne({
                where: {
                  customerUuid: checkExistingCustomer.customerUuid,
                  status: constantCode.serviceStatus.ACTIVE
                },
                transaction: t
              })
              if (!customerActiveService) {
                await conn.Customer.update({ status: constantCode.customerStatus.IN_ACTIVE }, {
                  where: {
                    customerUuid: checkExistingCustomer.customerUuid
                  },
                  transaction: t
                })
              }
            }
          }

          if (checkExistingOrder.orderType === orderType.terminate) {
            // serviceId: checkExistingService.serviceId
            await conn.CustServices.update({ status: constantCode.serviceStatus.IN_ACTIVE, expiryDate: new Date() }, {
              where: {
                parentOrderId: checkExistingOrder.parentOrderId,
                orderStatus: {
                  [Op.notIn]: [constantCode.status.CLOSED, constantCode.status.CANCELLED]
                }
              },
              transaction: t
            })

            if (checkMasterOrder?.count === 0) {
              const updateMasterOrder = {
                orderStatus: constantCode.status.CLOSED,
                updatedBy: userId
              }

              await conn.Orders.update(updateMasterOrder, {
                where: {
                  orderId: checkExistingOrder.parentOrderId
                },
                transaction: t
              })

              const masterOrdersTxnHdrInfo = {
                orderTxnUuid: uuidv4(),
                orderId: checkExistingOrder.parentOrderId,
                orderStatus: constantCode.status.CLOSED,
                orderFlow: orderFlowAction.UPDATE,
                fromEntityId: departmentId,
                fromRoleId: roleId,
                fromUserId: userId,
                toEntityId: departmentId,
                toRoleId: roleId,
                orderDate: new Date(),
                orderCategory: checkExistingOrder.orderCategory,
                orderSource: checkExistingOrder.orderSource,
                orderType: checkExistingOrder.orderType,
                orderChannel: checkExistingOrder.orderChannel,
                orderPriority: checkExistingOrder.orderPriority,
                billAmount: checkExistingOrder.billAmount,
                orderDescription: checkExistingOrder.orderDescription,
                customerId: checkExistingOrder.customerId,
                intxnId: checkExistingOrder?.intxnId || null,
                parentFlag: constantCode.common.YES,
                isFollowup: constantCode.common.NO,
                ...commonAttrib
              }

              await conn.OrdersTxnHdr.create(masterOrdersTxnHdrInfo, { transaction: t })
            }
          }

          // update contract
          if (checkExistingOrder.orderType !== orderType.terminate) {
            console.log('==================== GOING TO CREATE CONTRACT ===========================')
            const contractService = new ContractService(conn)
            const loggedUser = { userId, roleId, departmentId }
            const contractsCreated = await contractService.createContract(checkExistingOrder, checkExistingService, checkExistingAccount, checkExistingCustomer, loggedUser, t)
            console.log(contractsCreated, '==================== contracts Created ===================')

            if (contractsCreated.status !== 200) {
              return {
                status: statusCodeConstants.ERROR, message: 'Internal server error'
              }
            }
          }

          return {
            status: statusCodeConstants.SUCCESS,
            message: 'Order has been updated successfully'
          }
        } else {
          return {
            status: statusCodeConstants.ERROR,
            message: 'Sorry, there are pending tasks to be completed'
          }
        }
      }

      let customerInfo = await conn.Customer.findOne({
        where: {
          customerId: checkExistingOrder.customerId
        }
      })
      customerInfo = customerInfo?.dataValues ?? customerInfo
      let userList = []
      if (!orderData?.userId) {
        userList = await getUsersByRole(roleId, departmentId, constantCode.common.POPUP, conn) || []
      }
      const notificationObj = {
        notificationType: constantCode.common.POPUP,
        subject: `Order is Assigned to ${orderData?.userId ? 'you' : ' your role'}`,
        channel: orderData?.channel ? orderData?.channel : 'WEB',
        body: `Order is Assigned to ${orderData?.userId ? 'you' : 'role'}`,
        orderId: checkExistingOrder.orderId,
        userId,
        roleId,
        departmentId,
        status: 'SENT',
        orderNumber: orderNo,
        priority: checkExistingOrder.orderPriority,
        customerNo: customerInfo.customerNo,
        assignedUserId: orderData.userId,
        assignedDepartmentId: orderData?.departmentId,
        assignedRoleId: orderData?.roleId,
        orderStatus: previousHistory?.orderStatus || checkExistingOrder?.orderStatus,
        userList
      }
      logger.debug('Order PopUp Notification', notificationObj)
      em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', notificationObj)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order has been updated successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async addFollowUp (orderData, userId, roleId, departmentId, conn, t) {
    try {
      const { orderNo, remarks, priority, source } = orderData

      if (!orderData || !orderNo || !remarks) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const checkExistingOrder = await conn.Orders.findOne({
        where: {
          orderNo
        }
      })

      if (!checkExistingOrder) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'This Order does not have any order details.'
        }
      }

      if (checkExistingOrder.parentFlag === 'Y') {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'This Order cannot be add Follow-up'
        }
      }

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId || 'COMQUEST.BCT',
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      const previousHistory = await conn.OrdersTxnHdr.findOne({
        order: [['createdAt', 'DESC']],
        where: {
          orderId: checkExistingOrder.orderId,
          isFollowup: constantCode.common.NO
        }
      })

      const followUpData = {
        orderTxnUuid: uuidv4(),
        orderId: previousHistory.orderId,
        orderStatus: previousHistory.orderStatus,
        orderFlow: orderFlowAction.FOLLOWUP,
        fromEntityId: previousHistory.toEntityId,
        fromRoleId: previousHistory.toRoleId,
        fromUserId: previousHistory.toUserId || userId,
        remarks,
        toEntityId: departmentId,
        toRoleId: roleId,
        toUserId: userId,
        orderDate: new Date(),
        orderCategory: previousHistory.orderCategory,
        serviceType: previousHistory.serviceType,
        orderSource: previousHistory.orderSource,
        orderType: previousHistory.orderType,
        orderChannel: source,
        orderPriority: priority,
        billAmount: previousHistory.billAmount,
        orderDescription: previousHistory.orderDescription,
        orderDeliveryMode: previousHistory.orderDeliveryMode,
        customerId: previousHistory.customerId,
        accountId: previousHistory.accountId,
        serviceId: previousHistory.serviceId,
        intxnId: previousHistory?.intxnId || null,
        orderFamily: previousHistory.orderFamily,
        orderMode: previousHistory.orderMode,
        contactPreference: previousHistory.contactPreference,
        isFollowup: constantCode.common.YES,
        ...commonAttrib
      }
      const followUp = await conn.OrdersTxnHdr.create(followUpData, { transaction: t })

      let user = await conn.User.findOne({
        where: {
          userId
        }
      })

      let checkExistingCustomer = await conn.Customer.findOne({
        where: {
          customerNo: checkExistingOrder.customerId
        }
      })
      user = user.dataValues ?? user
      checkExistingCustomer = checkExistingCustomer.dataValues ?? checkExistingCustomer
      // const userList = getUsersByRole(roleId, departmentId, constantCode.common.POPUP, conn) || []
      const notificationObj = {
        notificationType: constantCode.common.POPUP,
        subject: `Order is followed by the${user?.firstName || ''}`,
        channel: orderData?.channel ? orderData?.channel : 'WEB',
        body: 'Order is Assigned to your Role',
        orderId: previousHistory.orderId,
        userId,
        roleId,
        departmentId,
        status: 'SENT',
        orderNumber: previousHistory.orderNo,
        priority,
        customerNo: checkExistingCustomer.customerNo,
        assignedUserId: userId,
        assignedDepartmentId: departmentId,
        assignedRoleId: roleId,
        orderStatus: previousHistory.orderStatus,
        type: orderFlowAction.FOLLOWUP
      }
      logger.debug('Order PopUp Notification', notificationObj)
      em.emit('UPDATE_CREATE_POPUP_NOTIFICATION', notificationObj)

      const data = {
        orderTransactionUid: followUp.orderTxnUuid,
        orderNo
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Follow up created successfully for order',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getOrderHistory (orderData, userId, roleId, departmentId, conn, t) {
    try {
      if (isEmpty(orderData)) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { orderNo, getFollowUp } = orderData

      const checkExistingOrder = await conn.Orders.findOne({
        where: {
          orderNo
        }
      })

      if (!checkExistingOrder) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'The Order Id does not have any order details.'
        }
      }

      const respose = await conn.OrdersTxnHdr.findAndCountAll({
        include: [
          {
            model: conn.User,
            as: 'fromUserDescription',
            attributes: ['firstName', 'lastName']
          }, {
            model: conn.User,
            as: 'toUserDescription',
            attributes: ['firstName', 'lastName']
          }, {
            model: conn.User,
            as: 'createdByDescription',
            attributes: ['firstName', 'lastName']
          }, {
            model: conn.User,
            as: 'updatedByDescription',
            attributes: ['firstName', 'lastName']
          }, {
            model: conn.OrdersTxnDtl,
            as: 'orderProductTxn',
            include: [
              {
                model: conn.Product,
                as: 'productTxnDtls'
              }
            ]
          }
        ],
        where: {
          orderId: checkExistingOrder.orderId,
          isFollowup: getFollowUp === 'true' ? 'Y' : 'N'
        },
        order: [['createdAt', 'DESC']]
      })

      if (!respose || respose?.count === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No order History details found ',
          data: respose
        }
      }

      const businessUnitInfo = await conn.BusinessUnit.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      const roleinfo = await conn.Role.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          // codeType: ['ORDER_FLOW', 'ORDER_STATUS'],
          status: constantCode.status.ACTIVE
        }
      })

      const data = {
        count: respose?.count,
        rows: orderResources.getorderTranactionDetailsTransform(respose.rows, businessEntityInfo, businessUnitInfo, roleinfo)

      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order History details fetched successfully.',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async searchOrder (orderData, userId, roleId, departmentId, conn, t) {
    try {
      const { limit = constantCode.common.lIMIT, page = constantCode.common.PAGE, searchParams } = orderData
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      for (const [key, value] of Object.entries(searchParams)) {
        if (!parseInt(value) && (!value || value?.trim() === '')) {
          delete searchParams[key]
        }
      }

      // const whereClause = { parentFlag: constantCode.common.YES }
      const whereClause = {}
      let customerClause = {}
      if (searchParams && searchParams?.orderNo) {
        whereClause.orderNo = searchParams.orderNo
      }

      if (searchParams && searchParams?.orderId) {
        whereClause.orderId = searchParams.orderId
      }

      if (searchParams && searchParams?.customerId) {
        whereClause.customerId = searchParams.customerId
      }

      if (searchParams && searchParams?.intxnId) {
        whereClause.intxnId = searchParams.intxnId
      }

      if (searchParams && searchParams?.orderUuid) {
        whereClause.orderUuid = searchParams.orderUuid
      }

      if (searchParams && searchParams?.customerName) {
        customerClause = {
          ...customerClause,
          [Op.or]: [
            {
              firstName: { [Op.iLike]: `%${searchParams.customerName}%` }

            }, {
              lastName: { [Op.iLike]: `%${searchParams.customerName}%` }

            }
          ]
        }
      }

      if (searchParams && searchParams?.customerNo) {
        customerClause.customerNo = searchParams.customerNo
      }

      if (searchParams && searchParams.customerUuid) {
        customerClause.customerUuid = searchParams.customerUuid
      }

      const response = await conn.Orders.findAndCountAll({
        include: [
          {
            model: conn.CustServices,
            as: 'serviceDetails'
          },
          {
            model: conn.User,
            as: 'currUserDetails',
            attributes: ['firstName', 'lastName', 'userId']
          }, {
            model: conn.OrderTaskHdr,
            as: 'orderTasks',
            attributes: ['orderTaskId', 'taskId', 'status', 'comments']
          }, {
            model: conn.OrdersDetails,
            as: 'orderProductDtls',
            include: {
              model: conn.Product,
              as: 'productDetails',
              attributes: [
                'productUuid', 'productId', 'productNo', 'status', 'productImage',
                'productName', 'productFamily', 'productCategory', 'productSubCategory', 'provisioningType',
                'productType', 'serviceType', 'chargeType', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'
              ]
            }
          },
          {
            model: conn.Customer,
            as: 'customerDetails',
            include: [{
              model: conn.Address,
              as: 'customerAddress'
            }, {
              model: conn.Contact,
              as: 'customerContact'
            },
            {
              model: conn.CustAccounts,
              as: 'customerAccounts',
              // attributes: ['currency'],
              include: [
                {
                  model: conn.Address,
                  as: 'accountAddress'
                },
                {
                  model: conn.BusinessEntity,
                  as: 'currencyDesc',
                  attributes: ['code', 'description', 'mappingPayload']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'accountPriorityDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'idTypeDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'accountStatus',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'billLanguageDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'accountLevelDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'accountTypeDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.BusinessEntity,
                  as: 'accountCatagoryDesc',
                  attributes: ['code', 'description']
                }
              ]
            }]
          }],
        where: { ...whereClause },
        order: [['orderId', 'DESC']],
        ...params
      })

      if (!response || response.count === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No order details found',
          data: []
        }
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      const businessUnitInfo = await conn.BusinessUnit.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      const roleinfo = await conn.Role.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      // const masterOrder = response.count > 0 ? response.rows.filter(m => m.parentFlag === 'Y') : []
      // const childOrder = response.count > 0 ? response.rows.filter(c => c.parentFlag === 'N') : []

      if (response.count < 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Order details fetched successfully',
          data: []
        }
      }

      const finalOrders = []
      for (let m of response.rows) {
        m = m?.dataValues ? m?.dataValues : m
        if (m.parentFlag === 'Y') {
          const getChildOrders = await conn.Orders.findAndCountAll({
            include: [
              {
                model: conn.CustServices,
                as: 'serviceDetails'
              },
              {
                model: conn.User,
                as: 'currUserDetails',
                attributes: ['firstName', 'lastName', 'userId']
              },
              {
                model: conn.OrderTaskHdr,
                as: 'orderTasks',
                attributes: ['orderTaskId', 'taskId', 'status', 'comments']
              },
              {
                model: conn.OrdersDetails,
                as: 'orderProductDtls',
                include: {
                  model: conn.Product,
                  as: 'productDetails',
                  attributes: [
                    'productUuid', 'productId', 'productNo', 'status', 'productImage',
                    'productName', 'productFamily', 'productCategory', 'productSubCategory', 'provisioningType',
                    'productType', 'serviceType', 'chargeType', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'
                  ]
                }
              },
              {
                model: conn.Customer,
                as: 'customerDetails',
                include: [{
                  model: conn.Address,
                  as: 'customerAddress'
                }, {
                  model: conn.Contact,
                  as: 'customerContact'
                },
                {
                  model: conn.CustAccounts,
                  as: 'customerAccounts',
                  // attributes: ['currency'],
                  include: [
                    {
                      model: conn.Address,
                      as: 'accountAddress'
                    },
                    {
                      model: conn.BusinessEntity,
                      as: 'currencyDesc',
                      attributes: ['code', 'description', 'mappingPayload']
                    },
                    {
                      model: conn.BusinessEntity,
                      as: 'accountPriorityDesc',
                      attributes: ['code', 'description']
                    },
                    {
                      model: conn.BusinessEntity,
                      as: 'idTypeDesc',
                      attributes: ['code', 'description']
                    },
                    {
                      model: conn.BusinessEntity,
                      as: 'accountStatus',
                      attributes: ['code', 'description']
                    },
                    {
                      model: conn.BusinessEntity,
                      as: 'billLanguageDesc',
                      attributes: ['code', 'description']
                    },
                    {
                      model: conn.BusinessEntity,
                      as: 'accountLevelDesc',
                      attributes: ['code', 'description']
                    },
                    {
                      model: conn.BusinessEntity,
                      as: 'accountTypeDesc',
                      attributes: ['code', 'description']
                    },
                    {
                      model: conn.BusinessEntity,
                      as: 'accountCatagoryDesc',
                      attributes: ['code', 'description']
                    }
                  ]
                }]
              }],
            where: {
              parentOrderUuid: m.orderUuid
            },
            order: [['orderId', 'DESC']]
          })

          // console.log("getChildOrders ================> ", getChildOrders.rows)

          finalOrders.push({
            ...m,
            childOrder: getChildOrders.rows
          })
        } else {
          const getMasterOrder = response.rows.filter(ele => ele.orderUuid === m.parentOrderUuid)
          if (getMasterOrder <= 0) {
            finalOrders.push(m)
          }
        }
      }
      // console.log('finalOrders ', JSON.stringify(finalOrders))
      const data = {
        count: finalOrders?.length || 0,
        row: orderResources.orderDetailsTransform(finalOrders, businessEntityInfo, businessUnitInfo, roleinfo)
      }

      // const data = {
      //   count: finalOrders.length === 0 ? response.rows.count : finalOrders.length,
      //   rows: finalOrders.length === 0
      //     ? orderResources.orderDetailsTransform(response.rows, businessEntityInfo, businessUnitInfo, roleinfo)
      //     : orderResources.orderDetailsTransform(finalOrders, businessEntityInfo, businessUnitInfo, roleinfo)
      // }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order details fetch succesfully.',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async searchOrderByQuery (query, conn) {
    try {
      if (!query.q || query?.q === '') {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const customerClauses = []
      const contactClauses = []
      const orderClauses = []
      const sequelize = db.sequelize

      customerClauses.push({
        customerUuid: sequelize.where(
          sequelize.cast(sequelize.col('Customer.customer_uuid'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })
      customerClauses.push({
        customerNo: sequelize.where(
          sequelize.cast(sequelize.col('Customer.customer_no'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })
      customerClauses.push({
        status: sequelize.where(
          sequelize.cast(sequelize.col('Customer.status'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      const customerNameParts = query.q.split(' ')
      customerNameParts.forEach(customerNamePart => {
        customerClauses.push({
          firstName: sequelize.where(
            sequelize.cast(sequelize.col('Customer.first_name'), 'varchar'),
            { [Op.iLike]: `%${customerNamePart}%` }
          )
        })
        customerClauses.push({
          lastName: sequelize.where(
            sequelize.cast(sequelize.col('Customer.last_name'), 'varchar'),
            { [Op.iLike]: `%${customerNamePart}%` }
          )
        })
      })

      contactClauses.push({
        mobileNo: sequelize.where(
          sequelize.cast(sequelize.col('mobile_no'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      contactClauses.push({
        contactNo: sequelize.where(
          sequelize.cast(sequelize.col('contact_no'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      contactClauses.push({
        emailId: sequelize.where(
          sequelize.cast(sequelize.col('email_id'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      const contacts = await conn.Contact.findAll({
        where: {
          [Op.or]: contactClauses
        }
      })

      if (contacts.length) {
        const customerNos = contacts.map(x => x.contactCategoryValue)
        customerClauses.push({
          customerNo: { [Op.in]: customerNos }
        })
      }

      const customers = await conn.Customer.findAll({
        include: [
          {
            model: conn.Contact,
            as: 'customerContact',
            include: [
              {
                model: conn.BusinessEntity,
                as: 'statusDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'contactTypeDesc',
                attributes: ['code', 'description']
              }
            ],
            required: false
          }
        ],
        where: {
          [Op.or]: customerClauses
        }
      })

      const customerIds = customers.map(x => x.customerId)

      orderClauses.push({
        customerId: sequelize.where(
          sequelize.cast(sequelize.col('Orders.customer_id'), 'varchar'),
          { [Op.in]: customerIds }
        )
      })

      orderClauses.push({
        orderNo: sequelize.where(
          sequelize.cast(sequelize.col('Orders.order_no'), 'varchar'),
          { [Op.iLike]: `%${query.q}%` }
        )
      })

      const response = await conn.Orders.findAll({
        include: [{
          model: conn.User,
          as: 'currUserDetails',
          attributes: ['firstName', 'lastName', 'userId']
        }, {
          model: conn.OrdersDetails,
          as: 'orderProductDtls',
          include: {
            model: conn.Product,
            as: 'productDetails',
            attributes: [
              'productUuid', 'productId', 'productNo', 'status',
              'productName', 'productFamily', 'productCategory', 'productSubCategory',
              'productType', 'serviceType', 'chargeType', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'
            ]
          }
        },
        {
          model: conn.Customer,
          as: 'customerDetails',
          required: false,
          include: [{
            model: conn.Address,
            as: 'customerAddress',
            required: false
          }, {
            model: conn.Contact,
            as: 'customerContact',
            required: false
          }]
        }],
        where: {
          [Op.or]: orderClauses
          // parentFlag: {
          //   [Op.eq]: 'Y'
          // }
        }
      })

      if (!response || response.length === 0) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'No order details found for your search filters!!',
          data: []
        }
      }

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      const businessUnitInfo = await conn.BusinessUnit.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      const roleinfo = await conn.Role.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      const finalOrders = []
      for (let m of response) {
        m = m?.dataValues ? m?.dataValues : m
        if (m.parentFlag === 'Y') {
          const getChildOrders = await conn.Orders.findAll({
            include: [
              {
                model: conn.User,
                as: 'currUserDetails',
                attributes: ['firstName', 'lastName', 'userId']
              },
              {
                model: conn.OrdersDetails,
                as: 'orderProductDtls',
                include: {
                  model: conn.Product,
                  as: 'productDetails',
                  attributes: [
                    'productUuid', 'productId', 'productNo', 'status',
                    'productName', 'productFamily', 'productCategory', 'productSubCategory',
                    'productType', 'serviceType', 'chargeType', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'
                  ]
                }
              },
              {
                model: conn.Customer,
                as: 'customerDetails',
                include: [{
                  model: conn.Address,
                  as: 'customerAddress'
                }, {
                  model: conn.Contact,
                  as: 'customerContact'
                }]
              }],
            where: {
              parentOrderUuid: m.orderUuid
            },
            order: [['orderId', 'DESC']]
          })

          finalOrders.push({
            ...m,
            childOrder: getChildOrders
          })
        } else {
          const getMasterOrder = response.filter(ele => ele.orderUuid === m.parentOrderUuid)
          if (getMasterOrder <= 0) {
            finalOrders.push(m)
          }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order Details fetched Successfully',
        data: orderResources.orderDetailsTransform(finalOrders, businessEntityInfo, businessUnitInfo, roleinfo)
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getMyOrders (data, userId, roleId, departmentId, conn) {
    try {
      if (!data.customerId || data?.customerId === '' || data?.orderStatus === '' || !data?.orderStatus) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { limit, page } = data
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      const orderClause = {
        customerId: data?.customerId
      }

      const orderClauseChild = {
        customerId: data?.customerId
      }

      if (data?.orderStatus === 'PENDING') {
        orderClauseChild.orderStatus = {
          [Op.ne]: 'CLS'
        }
      } else {
        orderClauseChild.orderStatus = 'CLS'
      }

      const response = await conn.Orders.findAll({
        include: [{
          model: conn.OrdersDetails,
          as: 'orderProductDtls',
          include: {
            model: conn.Product,
            as: 'productDetails',
            attributes: [
              'productUuid', 'productImage', 'productId', 'productNo', 'status',
              'productName', 'productFamily', 'productCategory', 'productSubCategory',
              'productType', 'serviceType', 'chargeType', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'productBenefit'
            ]
          }
        },
        {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderStatusDesc'
        },
        {
          model: conn.Address,
          as: 'shipBillAddressDetails'
        },
        {
          model: conn.AppointmentTxn,
          as: 'appointmentDetails',
          include: {
            model: conn.AppointmentHdr,
            as: 'appointHdrDetails'
          }
        },
        {
          model: conn.OrdersTxnHdr,
          as: 'orderTxnDtls',
          attributes: ['orderStatus', 'orderTxnNo', 'orderTxnId', 'createdAt'],
          include: {
            attributes: ['code', 'description'],
            model: conn.BusinessEntity,
            as: 'orderStatusDesc'
          }
        }
        ],
        where: orderClauseChild,
        order: [['createdAt', 'DESC']]
      })

      const finalOrders = []

      for (let m of response) {
        m = m?.dataValues ? m?.dataValues : m
        if (m.parentFlag === 'Y') {
          const childOrders = await conn.Orders.findAll({
            include: [{
              model: conn.OrdersDetails,
              as: 'orderProductDtls',
              include: {
                model: conn.Product,
                as: 'productDetails',
                attributes: [
                  'productUuid', 'productImage', 'productId', 'productNo', 'status',
                  'productName', 'productFamily', 'productCategory', 'productSubCategory',
                  'productType', 'serviceType', 'chargeType', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'productBenefit'
                ]
              }
            },
            {
              model: conn.BusinessEntity,
              attributes: ['code', 'description'],
              as: 'orderStatusDesc'
            },
            {
              model: conn.CustAccounts,
              attributes: ['currency'],
              as: 'accountDetails',
              include: {
                model: conn.BusinessEntity,
                attributes: ['code', 'description'],
                as: 'currencyDesc'
              }
            },
            {
              model: conn.Address,
              as: 'shipBillAddressDetails'
            },
            {
              model: conn.AppointmentTxn,
              as: 'appointmentDetails',
              include: {
                model: conn.AppointmentHdr,
                as: 'appointHdrDetails'
              }
            },
            {
              model: conn.OrdersTxnHdr,
              as: 'orderTxnDtls',
              attributes: ['orderStatus', 'orderTxnNo', 'orderTxnId', 'createdAt'],
              include: {
                attributes: ['code', 'description'],
                model: conn.BusinessEntity,
                as: 'orderStatusDesc'
              }
            }
            ],
            where: { ...orderClauseChild, parentOrderUuid: m.orderUuid },
            order: [['createdAt', 'DESC']]
          })
          finalOrders.push({
            ...m,
            childOrder: childOrders
          })
        }
      }

      if (!finalOrders || finalOrders.length === 0) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'No orders found!!',
          data: { count: finalOrders?.length, finalOrders: [] }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order Details fetched Successfully',
        data: { count: finalOrders?.length, finalOrders }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateShippingAddress (data, userId, roleId, departmentId, conn, t) {
    try {
      const { shippingAddress, addressId } = data
      console.log('shippingAddress------>', shippingAddress)
      console.log('addressId------>', addressId)
      await conn.Address.update(shippingAddress, { where: { addressId }, transaction: t })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Shipping Address Updated Successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCounts (orderData, userId, roleId, departmentId, conn) {
    try {
      if (!orderData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          messgae: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const whereClause = { parentFlag: 'N' }

      if (orderData && orderData?.customerUuid) {
        const checkExistingCustomer = await conn.Customer.findOne({
          where: {
            customerUuid: orderData?.customerUuid
          }
        })

        if (!checkExistingCustomer) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'customer Uid is not found',
            data: { count: 0 }
          }
        }

        whereClause.customerId = checkExistingCustomer.customerId
      }

      if (orderData && orderData?.isClosedOnly) {
        if (orderData?.isClosedOnly === 'true') {
          whereClause.orderStatus = constantCode.status.CLOSED
        } else {
          whereClause.orderStatus = { [Op.notIn]: [constantCode.status.CLOSED] }
        }
      } else {
        if (orderData && orderData?.currentStatus) {
          whereClause.orderStatus = orderData.currentStatus
        }
      }

      // if (orderData && orderData?.orderDate) {
      //   whereClause.currRole = orderData.currentRole
      // }

      if (orderData && orderData?.currentRole) {
        whereClause.currRole = orderData.currentRole
      }

      if (orderData && orderData?.currentDepartment) {
        whereClause.currEntity = orderData?.currentDepartment
      }

      if (orderData && orderData?.currentUserId) {
        whereClause.currUser = orderData?.currentUserId
      }

      if (orderData && orderData?.createdDepartment) {
        whereClause.create = orderData?.createdDepartment
      }

      if (orderData && orderData?.createdRole) {
        whereClause.createdRoleId = orderData?.createdRole
      }

      if (orderData && orderData?.orderType) {
        whereClause.orderType = orderData?.orderType
      }

      const response = await conn.Orders.findAndCountAll({
        where: {
          ...whereClause
        }
      })

      if (response.count === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Order Count is not found',
          data: { count: response?.count || 0 }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order count is fetched Successfully.',
        data: { count: response?.count || 0 }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async cancelOrder (orderData, userId, roleId, departmentId, conn, t) {
    try {
      const { orderNo, cancelReason } = orderData
      if (!orderData || !orderNo) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const checkCancelReason = await conn.BusinessEntity.findOne({
        where: {
          code: cancelReason,
          codeType: constantCode.businessEntityCodeType.ORD_STATUS_REASON,
          status: constantCode.status.ACTIVE
        }
      })

      if (!checkCancelReason) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'The provided cancel reason is not Valid'
        }
      }

      let checkExistingOrder = await conn.Orders.findOne({
        where: {
          orderNo
        }
      })
      checkExistingOrder = checkExistingOrder?.dataValues ? checkExistingOrder?.dataValues : checkExistingOrder

      if (!checkExistingOrder) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'This order does not have any order details.'
        }
      }

      if (checkExistingOrder.parentFlag === 'Y') {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'The Master Order cannot be cancelled'
        }
      }

      if (checkExistingOrder.orderStatus === constantCode.status.CLOSED || checkExistingOrder.orderStatus === constantCode.status.CANCELLED) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'The order cancellation is not allowed when the order current status is closed or cancelled.'
        }
      }

      const checkExistingCustomer = await conn.Customer.findOne({
        where: {
          customerId: checkExistingOrder?.customerId,
          status: {
            [Op.notIn]: [constantCode.customerStatus.TEMP]
          }
        }
      })

      if (!checkExistingCustomer) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Customer mapped for this order is not available'
        }
      }

      const checkExistingService = await conn.CustServices.findOne({
        where: {
          serviceId: checkExistingOrder.serviceId
        }
      })

      if (!checkExistingService) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Service mapped for this order is not available'
        }
      }

      const updateData = {
        orderStatusReason: orderData.cancelReason,
        currUser: orderData.userId,
        orderStatus: constantCode.status.CANCELLED
      }

      await conn.Orders.update(updateData, { where: { orderId: checkExistingOrder.orderId }, transaction: t })
      let previousHistory = await conn.OrdersTxnHdr.findOne({
        where: {
          orderId: checkExistingOrder.orderId,
          isFollowup: constantCode.common.NO
        },
        order: [['orderId', 'DESC']],
        logging: true
      })
      previousHistory = previousHistory?.dataValues ? previousHistory?.dataValues : previousHistory

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId || 'COMQUEST.BCT',
        createdRoleId: systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      const addHistory = {
        orderTxnUuid: uuidv4(),
        orderId: previousHistory?.orderId,
        orderStatus: constantCode.status.CANCELLED,
        orderFlow: orderFlowAction.CANCEL,
        fromEntityId: previousHistory.toEntityId,
        fromRoleId: previousHistory.toRoleId,
        fromUserId: previousHistory.toUserId || userId || systemUserId,
        remarks: orderData?.remarks,
        toEntityId: systemDeptId,
        toRoleId: systemRoleId,
        toUserId: userId || systemUserId,
        orderStatusReason: orderData.cancelReason,
        orderDate: new Date(),
        orderCategory: previousHistory.orderCategory,
        serviceType: previousHistory.serviceType,
        orderSource: previousHistory.orderSource,
        orderType: previousHistory.orderType,
        orderChannel: previousHistory.source,
        orderPriority: previousHistory.priority,
        billAmount: previousHistory.billAmount,
        orderDescription: previousHistory.orderDescription,
        orderDeliveryMode: previousHistory.orderDeliveryMode,
        customerId: previousHistory.customerId,
        accountId: previousHistory.accountId,
        serviceId: previousHistory.serviceId,
        intxnId: previousHistory?.intxnId || null,
        orderFamily: previousHistory.orderFamily,
        orderMode: previousHistory.orderMode,
        contactPreference: previousHistory.contactPreference,
        isFollowup: constantCode.common.NO,
        ...commonAttrib
      }

      await conn.OrdersTxnHdr.create(addHistory, { transaction: t })

      const workflwdetails = await conn.WorkflowHdr.findOne({
        where: {
          entityId: checkExistingOrder.orderUuid
        }
      })
      if (workflwdetails) {
        await conn.WorkflowTxn.update({ wfStatus: constantCode.status.DONE }, {
          where: {
            wfHdrId: workflwdetails.wfHdrId,
            wfStatus: {
              [Op.notIn]: [constantCode.status.DONE]
            }
          },
          transaction: t
        })

        await conn.WorkflowHdr.update({ wfStatus: constantCode.status.DONE }, {
          where: {
            entityId: checkExistingOrder.orderUuid, wfStatus: constantCode.status.CREATED
          },
          transaction: t
        })
      }

      /** cancel master order if all child order are cancelled. */

      const checkExistingChildOrder = await conn.Orders.findAll({
        where: {
          parentOrderUuid: checkExistingOrder.parentOrderUuid,
          parentFlag: constantCode.common.NO,
          orderStatus: {
            [Op.notIn]: [constantCode.status.CLOSED, constantCode.status.CANCELLED]
          }
        },
        transaction: t
      })

      if (checkExistingChildOrder.length === 0) {
        let checkExistingMasterOrder = await conn.Orders.findOne({
          where: {
            orderUuid: checkExistingOrder.parentOrderUuid
          }
        })
        checkExistingMasterOrder = checkExistingMasterOrder?.dataValues ? checkExistingMasterOrder?.dataValues : checkExistingMasterOrder

        if (!checkExistingMasterOrder) {
          return {
            status: statusCodeConstants.VALIDATION_ERROR,
            message: 'The master order for this order is not found.'
          }
        }

        await conn.Orders.update(updateData, { where: { orderId: checkExistingMasterOrder.orderId }, transaction: t })

        let previousHistoryMaster = await conn.OrdersTxnHdr.findOne({
          where: {
            orderId: checkExistingMasterOrder.orderId,
            isFollowup: constantCode.common.NO
          },
          order: [['orderId', 'DESC']]
        })

        previousHistoryMaster = previousHistoryMaster?.dataValues ? previousHistoryMaster?.dataValues : previousHistoryMaster

        const addHistoryMaster = {
          orderTxnUuid: uuidv4(),
          orderId: checkExistingOrder.parentOrderId,
          orderStatus: constantCode.status.CANCELLED,
          orderFlow: orderFlowAction.CANCEL,
          fromEntityId: previousHistoryMaster.toEntityId,
          fromRoleId: previousHistoryMaster.toRoleId,
          fromUserId: previousHistoryMaster.toUserId || userId || systemUserId,
          remarks: orderData?.remarks,
          toEntityId: systemDeptId,
          toRoleId: systemRoleId,
          toUserId: userId || systemUserId,
          orderStatusReason: orderData.cancelReason,
          orderDate: new Date(),
          orderCategory: previousHistoryMaster.orderCategory,
          serviceType: previousHistoryMaster.serviceType,
          orderSource: previousHistoryMaster.orderSource,
          orderType: previousHistoryMaster.orderType,
          orderChannel: previousHistoryMaster.source,
          orderPriority: previousHistoryMaster.priority,
          billAmount: previousHistoryMaster.billAmount,
          orderDescription: previousHistoryMaster.orderDescription,
          orderDeliveryMode: previousHistoryMaster.orderDeliveryMode,
          customerId: previousHistoryMaster.customerId,
          accountId: previousHistoryMaster.accountId,
          serviceId: previousHistoryMaster.serviceId,
          intxnId: previousHistoryMaster?.intxnId || null,
          orderFamily: previousHistoryMaster.orderFamily,
          orderMode: previousHistoryMaster.orderMode,
          contactPreference: previousHistoryMaster.contactPreference,
          isFollowup: constantCode.common.NO,
          ...commonAttrib
        }

        await conn.OrdersTxnHdr.create(addHistoryMaster, { tranaction: t })
      }

      if (checkExistingOrder.orderType === orderType.signUp) {
        // if (checkExistingCustomer && checkExistingCustomer.status === constantCode.customerStatus.PENDING) {
        //   await conn.Customer.update({ status: constantCode.customerStatus.ACTIVE, updatedBy: userId }, { where: { customerId: checkExistingCustomer.customerId }, transaction: t })
        // }

        // if (checkExistingAccount && checkExistingCustomer.status === constantCode.status.PENDING) {
        //   await conn.CustAccounts.update({ status: constantCode.customerStatus.ACTIVE, updatedBy: userId }, { where: { accountId: checkExistingAccount.accountId }, transaction: t })
        // }

        if (checkExistingService && checkExistingService.status === constantCode.status.PENDING) {
          await conn.CustServices.update({ status: constantCode.serviceStatus.CANCEL, serviceStatusReason: orderData.cancelReason, updatedBy: userId }, { where: { serviceId: checkExistingService.serviceId }, transaction: t })
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order has been cancelled successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async cancelOrders (orderData, userId, roleId, departmentId, conn, t) {
    try {
      const response = await conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: orderData?.conversationUid,
          conversationActionType: 'ORDER_CONFIG',
          smartAssistType: 'RECEIVED'
        },
        order: [['smartAssistTxnId', 'DESC']]
      })
      const promises = []
      const orders = []
      if (response?.dataValues?.smartAssistValue && response?.dataValues?.smartAssistValue?.length > 0) {
        response?.dataValues?.smartAssistValue.forEach((ele) => {
          orders.push({
            orderNo: ele?.orderNo,
            cancelReason: 'OSR015'
          })
          const promise = this.cancelOrder({
            orderNo: ele?.orderNo,
            cancelReason: 'OSR015'
          }, userId, roleId, departmentId, conn, t)
          promises.push(promise)
        })
      }

      const results = await Promise.all(promises)

      const responses = []

      for (let i = 0; i < orders.length; i++) {
        const orderNo = orders[i].orderNo
        const status = results[i].status
        const message = results[i].message

        responses.push({
          orderNo,
          status,
          message
        })
      }

      console.log('responses------>', responses)
      return responses
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async cancelOrdersEx (orderData, userId, roleId, departmentId, conn) {
    try {
      const response = await conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: orderData?.conversationUid,
          conversationActionType: 'ORDER_CONFIG',
          smartAssistType: 'RECEIVED'
        },
        order: [['smartAssistTxnId', 'DESC']]
      })
      const promises = []
      const orders = []

      if (response?.dataValues?.smartAssistValue && response?.dataValues?.smartAssistValue?.length > 0) {
        response.dataValues.smartAssistValue.forEach((ele) => {
          const t = conn.sequelize.transaction()
          orders.push({
            orderNo: ele?.orderNo,
            cancelReason: 'OSR015'
          })
          let promise
          try {
            promise = this.cancelOrder(
              {
                orderNo: ele?.orderNo,
                cancelReason: 'OSR015'
              },
              userId,
              roleId,
              departmentId,
              conn,
              t
            )
            promise.then((result) => {
              if (result.status === 200) {
                t.commit()
              }
            })
            promises.push(promise)
          } catch (err) {
            console.log('err--->', err)
            t.rollback()
          }
        })
      }

      const results = await Promise.all(promises)
      const responses = []

      for (let i = 0; i < orders.length; i++) {
        const orderNo = orders[i].orderNo
        const status = results[i].status
        const message = results[i].message

        responses.push({
          orderNo,
          status,
          message
        })
      }

      return responses
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getOrderListbasedOnConversationId (serviceData, userId, conn) {
    try {
      const { conversationUid } = serviceData
      if (!conversationUid) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let checkExistingConversation = await conn.smartAssist.findOne({
        where: {
          smartAssistConversationId: serviceData?.conversationUid,
          conversationActionType: 'INTIAL_CONFIG'
        }
      })

      const smartAssistValue = checkExistingConversation.smartAssistValue
      const { customerUuid } = smartAssistValue

      checkExistingConversation = checkExistingConversation?.dataValues ? checkExistingConversation?.dataValues : checkExistingConversation

      const checkExistingCustomer = await conn.Customer.findOne({
        where: {
          customerUuid
        }
      })

      const response = await conn.Orders.findAndCountAll({
        where: {
          customerId: checkExistingCustomer.customerId,
          orderStatus: {
            [Op.notIn]: [constantCode.status.CLOSED, constantCode.status.CANCELLED]
          },
          parentFlag: constantCode.common.NO
        }
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order details fetched Successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async getAddressbasedOnOrderId (orderData, userId, conn) {
    try {
      if (!orderData) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const orderDetails = await conn.Orders.findOne({
        where: {
          orderId: orderData.orderId
        }
      })

      if (!orderDetails) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'we are unable to find Order Id'
        }
      }

      const getCustomer = await conn.Customer.findOne({
        where: {
          customerId: orderDetails?.customerId
        }
      })

      const getAddressDetails = await conn.Address.findOne({
        where: {
          addressCategoryValue: getCustomer?.customerNo,
          addressCategory: entityCategory?.CUSTOMER,
          isPrimary: true
        }
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order Address fetched Successfully',
        data: getAddressDetails
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async UpdateOrderAddress (orderData, userId, departmentId, roleId, conn, t) {
    try {
      if (!orderData || !orderData?.orderId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const orderDetails = await conn.Orders.findOne({
        where: {
          orderId: orderData.orderId
        }
      })

      if (!orderDetails) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'we are unable to find Order Id'
        }
      }

      const getCustomer = await conn.Customer.findOne({
        where: {
          customerId: orderDetails?.customerId
        }
      })

      const addressData = {
        isPrimary: true,
        addressCategoryValue: getCustomer?.customerNo,
        addressCategory: entityCategory?.CUSTOMER,
        addressType: orderData?.addressType,
        address1: orderData?.address1 || null,
        address2: orderData?.address2 || null,
        address3: orderData?.address3 || null,
        addrZone: orderData?.addrZone || null,
        city: orderData.city,
        district: orderData.district,
        state: orderData.state,
        postcode: orderData.postcode,
        country: orderData.country,
        latitude: orderData?.latitude || null,
        longitude: orderData?.longitude || null,
        tranId: uuidv4(),
        createdBy: userId || systemUserId,
        createdDeptId: departmentId || 'COMQUEST.BCT',
        createdRoleId: roleId || systemRoleId,
        billFlag: orderData?.billFlag || 'N'
      }

      await conn.Address.update({ isPrimary: false }, {
        where: {
          addressCategoryValue: getCustomer?.customerNo,
          addressCategory: entityCategory?.CUSTOMER,
          isPrimary: true
        },
        transaction: t
      })

      await conn.Address.create(addressData, { transaction: t })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order Address updated Successfully'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async getOrderFlow (orderData, conn) {
    try {
      if (!orderData || !orderData?.orderNo) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const getOrderDetails = await conn.Orders.findOne({
        include: [
          {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderStatusDesc'
          }
        ],
        where: {
          orderNo: orderData?.orderNo
        }
      })

      if (!getOrderDetails) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: `We are unable to find the order Details for ${orderData?.orderNo}`
        }
      }

      const details = {
        orderNo: getOrderDetails?.orderNo,
        currStatus: getOrderDetails?.orderStatusDesc?.description,
        orderCreatedDate: getOrderDetails?.createdAt
      }

      const getOrderHistory = await conn.OrdersTxnHdr.findAll({
        attributes: ['orderId', 'createdAt'],
        include: [
          {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderFlowDesc'
          }, {
            model: conn.BusinessUnit,
            attributes: ['unitName', 'unitDesc'],
            as: 'fromEntityDesc'
          }, {
            model: conn.BusinessUnit,
            attributes: ['unitName', 'unitDesc'],
            as: 'toEntityDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderStatusDesc'
          }, {
            model: conn.User,
            attributes: ['firstName', 'lastName'],
            as: 'createdByDescription'
          }, {
            model: conn.Role,
            attributes: ['roleId', 'roleDesc'],
            as: 'fromRoleDescription'
          }, {
            model: conn.Role,
            attributes: ['roleId', 'roleDesc'],
            as: 'toRoleDescription'
          }
        ],
        where: {
          orderId: getOrderDetails?.orderId,
          orderFlow: { [Op.notIn]: ['ORDER_FOLLOWUP', 'ODR_ASSIGN_TO_SELF'] }
        },
        order: [['orderTxnId', 'ASC']]
      })

      const orderUuid = await conn.Orders.findOne({
        attributes: ['orderUuid'],
        where: {
          orderId: getOrderDetails?.orderId
        },
        raw: true
      })
      // console.log('orderUuidorderUuidorderUuid ',orderUuid)
      const workflowHistory = await conn.WorkflowHdr.findOne({
        include: [
          {
            model: conn.WorkflowTxn,
            as: 'wfTxn',
            where: {
              wfTxnStatus: 'DONE'
            }
          }
        ],
        where: {
          entityId: orderUuid.orderUuid
        }
      })

      const getFutureFlow = await getOrderWF(getOrderDetails?.orderUuid, entityCategory.ORDER, conn)
      let futureFlow = getFutureFlow?.data?.entities.flat()

      for (const child of futureFlow?.[0]?.children) {
        findAndReplaceChild(futureFlow, futureFlow?.[0], child)
      }

      console.log('getOrderHistory', JSON.stringify(getOrderHistory))

      for (const child of futureFlow?.[0]?.children) {
        checkFlowIsDone(child, getOrderHistory)
      }

      // for (const element of futureFlow) {
      //   // console.log('element=============', element)
      //   for (const child of element.children) {
      //     console.log('element=============', element, child)
      //     console.log("calling ------------->")
      //     findAndReplaceChild(futureFlow, element, child)
      //     // findAndReplaceChild1(futureFlow, element, child)
      //   }
      // }
      // console.log('childObj====================', JSON.stringify(childObj))
      // console.log('futureFlow2===================', JSON.stringify(futureFlow))

      // for (const element of futureFlow) {
      //   for (const child of element.children[0].children) {
      //     const matchingChild = child?.children?.find(f => {
      //       console.log(child.role, '===', f.role, '&&', child.status, '===', f.status, '&&', child.entity, '===', f.entity)
      //       if (child.role === f.role && child.status === f.status && child.entity === f.entity && child.activityId !== f.activityId) {
      //         return true
      //       }
      //     }
      //     )
      //     console.log('matchingChild=============', matchingChild)

      //     if (matchingChild) {
      //       // const matchingChildIndex= futureFlow.indexOf(matchingChild)
      //       child.children.push(matchingChild)
      //       // const childIndex = element.children.indexOf(child)
      //       // element.children.splice(childIndex, 1)
      //       // futureFlow.splice(matchingChildIndex, 1);
      //       // for (const subChild of matchingChild.children || []) {
      //       //   console.log('matchingChild=============', matchingChild);
      //       //   console.log('subchild=============', subChild)
      //       //   findAndReplaceChild(futureFlow, matchingChild, subChild);
      //       // }
      //     }
      //   }
      // }

      // console.log('futureFlow3===================', JSON.stringify(futureFlow))

      // if (getFutureFlow && Array.isArray(futureFlow) && futureFlow.length > 0) {
      //   futureFlow.forEach(ele => {
      //     // console.log('element===>', element)
      //     let childObj = {}
      //    // for (const ele of element) {
      //       // console.log('element===>', ele)
      //       // console.log('mainArr===>', JSON.stringify(mainArr))
      //       //mainArr.push(ele)

      //       if (mainArr.length > 0) {
      //         mainArr.map(val => {
      //           // console.log('main array val', val)
      //           // && !mainArr.find(f => ele.role === f.role && ele.status === f.status && ele.entity === f.entity)
      //           // console.log(ele.role ,'===', val.role ,'&&', ele.status ,'===', val.status ,'&&', ele.entity, '===', val.entity)
      //           if (ele.role === val.role && ele.status === val.status && ele.entity === val.entity) {
      //             if (!val.children) {
      //               val.children = []
      //             }
      //             val.children.push(ele.children[0])
      //             childObj = ele
      //             return val
      //           }
      //           function checkChildEle(val) {
      //             if (Array.isArray(val)) {
      //               // console.log('ele is =======================================', ele)
      //               // console.log('val is =======================================', val)
      //               val.map(x => {
      //               console.log(ele.role, '===', x.role ,'&&', ele.status, '===', x.status, '&&', ele.entity, '===', x.entity)

      //                 if (ele.role === x.role && ele.status === x.status && ele.entity === x.entity) {
      //                   if (!x.children) {
      //                     x.children = []
      //                   }
      //                   const arr = []
      //                   for (const e of ele.children) {
      //                     const obj = {
      //                       ...e
      //                     }
      //                     arr.push(obj)
      //                   }
      //                   x.children = arr
      //                   childObj = ele

      //                   //if (x.children) {
      //                     checkChildEle(arr[0])
      //                  // }
      //                 }

      //                 console.log('xxxxxxxxxxxxxxxxxxxxxxxx', x)
      //                 return x
      //               })
      //             }
      //           }
      //           checkChildEle(val.children)
      //           return val
      //         })
      //       }
      //       mainArr.push(ele)
      //       // console.log('mainArr before filter===', mainArr)
      //       // console.log('childObj--------->', childObj)
      //       flow = mainArr.filter(f => JSON.stringify(f) !== JSON.stringify(childObj))
      //     //}
      //   })
      //   // console.log('flow--------->', JSON.stringify(flow))
      // console.log('getOrderHistory--------->', JSON.stringify(getOrderHistory))
      // getOrderHistory.forEach(o => {
      //   futureFlow.map(f => {
      //     console.log('checkCondition', o.fromRoleDescription.roleDesc === f.role , o.fromEntityDesc.unitDesc === f.entity , o.orderStatusDesc.description === f.status)
      //     console.log('checkCondition 1', o.fromRoleDescription.roleDesc , f.role , o.fromEntityDesc.unitDesc , f.entity , o.orderStatusDesc.description , f.status)

      //     if (o.fromRoleDescription.roleDesc === f.role && o.fromEntityDesc.unitDesc === f.entity && o.orderStatusDesc.description === f.status) {
      //       // console.log('Inside flow...')
      //       f.flowDate = o.createdAt
      //       f.children[0].lineStyle = {
      //         color: 'rgba(33, 181, 65)'
      //       }

      //       function checkChildEle (ele) {
      //         if (Array.isArray(ele)) {
      //           ele.map(x => {
      //             console.log('x------------>', JSON.stringify(x))

      //             for (const w of workflowHistory.wfTxn) {
      //               if (w.activityId === x.activityId && o.toRoleDescription.roleDesc === x.role && o.toEntityDesc.unitDesc === x.entity && o.orderStatusDesc.description === x.status) {
      //                 x.flowDate = w.createdAt
      //                 x.lineStyle = {
      //                   color: 'rgba(33, 181, 65)'
      //                 }
      //                 console.log('x.children------->', JSON.stringify(x.children))
      //                 if (x.children) {
      //                   checkChildEle(x.children)
      //                 }
      //               }
      //             }
      //             return x
      //           })
      //         }
      //       }
      //       checkChildEle(f.children)
      //       return f
      //     }
      //   })
      // })

      //   console.log('final flow------------->', JSON.stringify(flow))
      // }
      futureFlow = [futureFlow?.[0]] || futureFlow
      // console.log('Output before style remove =============>',JSON.stringify(futureFlow))

      futureFlow = removeLineStyleFromChildren(futureFlow);

      console.log('Final output flow =============>', JSON.stringify(futureFlow))
      const response = {
        details,
        flow: futureFlow
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order flow fetched successfully',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async getCustomerOrderHistoryCount (orderData, conn) {
    try {
      if (!orderData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let data = {
        totalOrderCount: 0,
        totalOrderData: [],
        openOrderCount: 0,
        openOrderData: [],
        closedOrderCount: 0,
        closedOrderData: []
      }

      const checkExistingCustomer = await conn.Customer.findOne({
        where: {
          customerUuid: orderData?.customerUid
        }
      })

      if (!checkExistingCustomer) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'we are unable to find the customer details for order history count'
        }
      }

      const orderDetails = await conn.Orders.findAndCountAll({
        include: [{
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderStatusDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'serviceTypeDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderTypeDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderCategoryDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderSourceDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderChannelDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderCauseDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderPriorityDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderFamilyDesc'
        }],
        where: {
          customerId: checkExistingCustomer?.customerId,
          parentFlag: constantCode.common.NO
        }
      })

      if (orderDetails?.rows.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Customer Order statement history is not found',
          data
        }
      }

      // get closed Order count

      const openOrder = orderDetails?.rows.filter((e) => {
        let isTrue = false
        if (e.orderStatus !== constantCode.status.CLOSED && e.orderStatus !== constantCode.status.CANCELLED) {
          isTrue = true
        }
        return isTrue
      })
      // openOrder = getUniqueObject(openOrder, 'parentOrderUuid')

      const closedOrder = orderDetails?.rows.filter((e) => {
        let isTrue = false
        if (e.orderStatus === constantCode.status.CLOSED || e.orderStatus === constantCode.status.CANCELLED) {
          isTrue = true
        }
        return isTrue
      })
      // const closedOrderParentOrderUuid = getUniqueObject(closedOrder, 'parentOrderUuid')
      // closedOrder = await conn.Orders.findAll({
      //   where: {
      //     orderUuid: closedOrderParentOrderUuid,
      //     parentFlag: constantCode.common.YES,
      //     orderStatus: [constantCode.status.CLOSED, constantCode.status.CANCELLED]
      //   }
      // })

      // const totalOrder = getUniqueObject(orderDetails?.rows, 'parentOrderUuid')

      data = {
        totalOrderCount: orderDetails?.rows.length || 0,
        totalOrderData: orderDetails?.rows,
        openOrderCount: openOrder.length || 0,
        openOrderData: openOrder,
        closedOrderCount: closedOrder.length || 0,
        closedOrderData: closedOrder
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Customer order statement history fetched Successfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal Server Error'
      }
    }
  }

  async getMyOrderHistory (userDetails, conn) {
    try {
      const { searchParams } = userDetails

      const whereClause = {}

      if (searchParams && searchParams?.userId) {
        whereClause.fromUserId = searchParams?.userId
      }

      if (searchParams && searchParams?.roleId) {
        whereClause.fromRoleId = searchParams?.roleId
      }

      if (searchParams && searchParams?.entityId) {
        whereClause.fromEntityId = searchParams?.entityId
      }

      if (searchParams && searchParams?.serviceType) {
        whereClause.serviceType = searchParams?.serviceType
      }

      if (searchParams?.fromDate && searchParams?.toDate) {
        whereClause.createdAt = {
          [Op.gte]: new Date(searchParams.fromDate),
          [Op.lte]: new Date(searchParams.toDate)
          // [Op.between]: [body.startDate, body.endDate]
        }
      } else if (searchParams && searchParams?.fromDate) {
        whereClause.createdAt = searchParams?.fromDate
      } else if (searchParams && searchParams?.toDate) {
        whereClause.createdAt = searchParams?.toDate
      }

      const getOrderId = await conn.OrdersTxnHdr.findAll({
        attributes: ['orderId'],
        where: {
          orderFlow: {
            [Op.notIn]: [orderFlowAction.FOLLOWUP, orderFlowAction.ASSIGN, orderFlowAction.CREATED]
          },
          // orderStatus: {
          //   [Op.notIn]: [constantCode.status.INPROCESS]
          // },
          ...whereClause
        }
      })

      if (getOrderId && getOrderId.length > 0) {
        const getOrderIds = getOrderId.map(e => e.orderId)
        const response = await conn.Orders.findAndCountAll({
          attributes: ['orderId', 'createdAt', 'orderNo'],
          include: [{
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderStatusDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceTypeDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderTypeDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCategoryDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderSourceDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderChannelDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCauseDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderPriorityDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderFamilyDesc'
          }
            // , {
            //   model: conn.OrdersTxnHdr,
            //   as: 'orderTxnDtls',
            //   distinct: true,
            //   where: whereClause
            // }
          ],
          where: {
            orderId: getOrderIds,
            parentFlag: constantCode.common.NO
          },
          distinct: true
        })

        // console.log('response?.rows', response?.rows)

        const rows = orderResources.getMyOrderHistoryGraphTransform(response?.rows) || []

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Fetched details succesfully',
          data: {
            count: response?.count,
            rows
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'No details found'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal Server Error'
      }
    }
  }

  async getTeamOrderHistory (teamDetails, conn) {
    try {
      const { searchParams } = teamDetails

      const whereClause = {}
      let getUserlist = []
      if (searchParams && searchParams?.userId && !searchParams.teamMemberId) {
        getUserlist = await conn.User.findAll({
          where: {
            managerId: searchParams?.userId
          }
        })
      }
      if (getUserlist.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No records found'
        }
      }

      const userList = getUserlist.map((u) => u.userId)
      whereClause.fromUserId = userList

      if (searchParams && searchParams.teamMemberId) {
        whereClause.fromUserId = searchParams.teamMemberId
      }

      if (searchParams && searchParams?.roleId) {
        whereClause.fromRoleId = searchParams?.roleId
      }

      if (searchParams && searchParams?.entityId) {
        whereClause.fromEntityId = searchParams?.entityId
      }

      if (searchParams && searchParams?.serviceType) {
        whereClause.serviceType = searchParams?.serviceType
      }

      if (searchParams?.fromDate && searchParams?.toDate) {
        whereClause.createdAt = {
          [Op.gte]: new Date(searchParams.fromDate),
          [Op.lte]: new Date(searchParams.toDate)
          // [Op.between]: [body.startDate, body.endDate]
        }
      } else if (searchParams && searchParams?.fromDate) {
        whereClause.createdAt = searchParams?.fromDate
      } else if (searchParams && searchParams?.toDate) {
        whereClause.createdAt = searchParams?.toDate
      }

      const getOrderId = await conn.OrdersTxnHdr.findAll({
        attributes: ['orderId'],
        where: {
          orderFlow: {
            [Op.notIn]: [orderFlowAction.FOLLOWUP, orderFlowAction.ASSIGN, orderFlowAction.CREATED]
          },
          // orderStatus: {
          //   [Op.notIn]: [constantCode.status.INPROCESS]
          // },
          ...whereClause
        }
      })

      if (getOrderId && getOrderId.length > 0) {
        const getOrderIds = getOrderId.map(e => e.orderId)
        const response = await conn.Orders.findAndCountAll({
          attributes: ['orderId', 'createdAt', 'orderNo'],
          include: [{
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderStatusDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'serviceTypeDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderTypeDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCategoryDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderSourceDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderChannelDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderCauseDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderPriorityDesc'
          }, {
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'orderFamilyDesc'
          }
            // , {
            //   model: conn.OrdersTxnHdr,
            //   as: 'orderTxnDtls',
            //   distinct: true,
            //   where: whereClause
            // }
          ],
          where: {
            orderId: getOrderIds,
            parentFlag: constantCode.common.NO
          },
          distinct: true
        })

        // console.log('response?.rows', response?.rows)

        const rows = orderResources.getMyOrderHistoryGraphTransform(response?.rows) || []

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Fetched details succesfully',
          data: {
            count: response?.count,
            rows
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'No details found'
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal Server Error'
      }
    }
  }

  async handlingTime (payload, conn) {
    try {
      const { searchParams } = payload
      const i_user_id = searchParams?.userId || null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const i_to_date = searchParams?.toDate ? `'${searchParams?.toDate}'` : null

      const detailsSql = `select * from bcae_ops_infor_order_self_handling_fn(${i_user_id},${i_from_date},${i_to_date})`

      let responseData = await conn.sequelize.query(detailsSql, {
        type: QueryTypes.SELECT,
        logging: true
      })
      responseData = camelCaseConversion(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal Server Error'
      }
    }
  }

  async handlingTimeTeam (payload, conn) {
    try {
      const { searchParams } = payload
      const i_user_id = searchParams?.userId || null
      const i_from_date = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const i_to_date = searchParams?.toDate ? `'${searchParams?.fromDate}'` : null

      const detailsSql = `select * from bcae_ops_infor_order_team_handling_fn(${i_user_id},${i_from_date},${i_to_date})`

      let responseData = await conn.sequelize.query(detailsSql, {
        type: QueryTypes.SELECT,
        logging: true
      })
      responseData = camelCaseConversion(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal Server Error'
      }
    }
  }

  async getCustomerOrderHistory (orderData, conn) {
    try {
      if (!orderData) {
        return {
          status: statusCodeConstants.MANDATORY_FIELDS_MISSING,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { limit, page } = orderData
      const params = {
        offset: (page * limit),
        limit: Number(limit)
      }

      let getExistingDetails = await conn.Customer.findOne({
        where: {
          customerUuid: orderData?.customerUid
        }
      })
      getExistingDetails = getExistingDetails?.dataValues ? getExistingDetails?.dataValues : getExistingDetails

      const whereClause = { customerId: getExistingDetails.customerId, parentFlag: constantCode?.common?.NO }

      if (orderData && orderData?.status && orderData?.status === 'OPEN') {
        whereClause.orderStatus = {
          [Op.notIn]: [constantCode.status.CLOSED, constantCode.status.CANCELLED]
        }
      } else if (orderData && orderData?.status && orderData?.status === 'CLOSED') {
        whereClause.orderStatus = {
          [Op.in]: [constantCode.status.CLOSED, constantCode.status.CANCELLED]
        }
      }

      const orderDetails = await conn.Orders.findAndCountAll({
        attributes: ['orderId', 'orderNo', 'createdAt'],
        include: [{
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderStatusDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'serviceTypeDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderTypeDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderCategoryDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderSourceDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderChannelDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderCauseDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderPriorityDesc'
        }, {
          model: conn.BusinessEntity,
          attributes: ['code', 'description'],
          as: 'orderFamilyDesc'
        }
        ],
        where: { ...whereClause },
        order: [['createdAt', 'DESC']],
        ...params
      })

      if (orderDetails.count === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No order history details found',
          data: orderDetails
        }
      }

      // const getParentOrderUuid = orderDetails.rows.map((e) => { return e.parentOrderUuid })

      // const getParentOrderDetails = await conn.Orders.findAndCountAll({
      //   attributes: ['orderId', 'orderNo', 'createdAt'],
      //   include: [
      //     {
      //       model: conn.BusinessEntity,
      //       attributes: ['code', 'description'],
      //       as: 'orderStatusDesc'
      //     }, {
      //       model: conn.BusinessEntity,
      //       attributes: ['code', 'description'],
      //       as: 'serviceTypeDesc'
      //     }, {
      //       model: conn.BusinessEntity,
      //       attributes: ['code', 'description'],
      //       as: 'orderTypeDesc'
      //     }, {
      //       model: conn.BusinessEntity,
      //       attributes: ['code', 'description'],
      //       as: 'orderCategoryDesc'
      //     }
      //   ],
      //   where: { orderUuid: getParentOrderUuid },
      //   ...params
      // })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order history details fetched Successfully',
        data: orderDetails
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal Server Error'
      }
    }
  }

  async getOrderCategoryPerformance (payload, conn) {
    try {
      if (!payload && !payload?.type) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const { searchParams } = payload
      const userId = searchParams?.userId ? `'${searchParams?.userId}'` : null
      const roleId = searchParams?.roleId ? `'${searchParams?.roleId}'` : null
      const entityId = searchParams?.roleId ? `'${searchParams?.entityId}'` : null
      const fromDate = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const toDate = searchParams?.toDate ? `'${searchParams?.toDate}'` : null
      const limit = searchParams?.limit ? `'${searchParams?.limit}'` : null

      let handlingSql = ''
      if (payload && payload?.type && payload?.type === 'orderType') {
        handlingSql = `select * from bcae_ops_infor_self_top_order_type_fn(${userId},${roleId},${entityId},${fromDate},${toDate},${limit})`
      }

      if (payload && payload?.type && payload?.type === 'orderCategory') {
        handlingSql = `select * from bcae_ops_infor_self_top_order_category_fn(${userId},${roleId},${entityId},${fromDate},${toDate},${limit})`
      }
      let responseData = []
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      responseData = orderResources.transformOrderCategoryPermormance(responseData)

      const data = {
        count: responseData.length ? responseData[0]?.oRecordCnt : 0,
        rows: responseData || []
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {

    }
  }

  async getTopPerformance (payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload

      // const whereClause = {}

      // if (searchParams && searchParams?.teamMemberId && Array.isArray(searchParams?.teamMemberId) && searchParams?.teamMemberId?.length > 0) {
      //   const teamMemberIds = searchParams?.teamMemberId.map(e => e.value)
      //   whereClause.createdBy = teamMemberIds
      // } else {
      //   const getUserlist = await conn.User.findAll({
      //     where: {
      //       managerId: searchParams?.userId
      //     }
      //   })

      //   if (getUserlist.length > 0) {
      //     const userList = getUserlist.map((u) => u.userId)
      //     whereClause.fromUserId = userList
      //   }
      // }

      // const response = await conn.OrdersTxnHdr.findAll({
      //   attributes: ['createdBy', [conn.sequelize.fn('count', conn.sequelize.col('created_by')), 'count']],
      //   where: {
      //     ...whereClause,
      //     orderStatus: [constantCode.status.CLOSED]
      //   },
      //   group: ['createdBy'],
      //   order: [['createdBy', 'DESC']],
      //   limit: 5 || constantCode.common.lIMIT
      // })

      // const userList = response && response.map((e) => { return e.createdBy })

      // const getUserDetails = await conn.User.findAll({
      //   attributes: ['firstName', 'lastName', 'profilePicture'],
      //   where: {
      //     userId: userList
      //   }
      // })
      const userId = searchParams?.userId ? `'${searchParams?.userId}'` : null
      const fromDate = searchParams?.fromDate ? `'${searchParams?.fromDate}'` : null
      const toDate = searchParams?.toDate ? `'${searchParams?.toDate}'` : null
      const limit = searchParams?.limit ? `'${searchParams?.limit}'` : 5

      const handlingSql = `select * from bcae_ops_infor_order_top_closure_performers_fn(${userId},${fromDate},${toDate},${limit})`

      let responseData
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      const userList = responseData && responseData.map((e) => { return e.oUserId })

      const getUserDetails = await conn.User.findAll({
        attributes: ['userId', 'firstName', 'lastName', 'profilePicture'],
        where: {
          userId: userList
        }
      })
      const resp = []

      responseData.forEach(element => {
        const getUserDetail = getUserDetails.filter(e => e.userId === element.oUserId)

        const Users = getUserDetail.map((e) => {
          if (e.userId === element.oUserId) {
            return {
              firstName: e.firstName,
              lastName: e?.lastName,
              profilePicture: e?.profilePicture,
              alias: '',
              rating: (Number(element?.oClosedPercentage) / 20).toFixed(1)
            }
          }
        })
        if (Array.isArray(Users) && Users.length > 0) { resp.push(Users?.[0]) }
      })

      const data = orderResources.transformTopPerformance(resp)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: data || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR, message: 'Internal server error'
      }
    }
  }

  async getRelatedCategoryTypeInfo (payload, conn) {
    // console.log('payload ', payload)
    try {
      const response = await conn.Orders.findAndCountAll({
        include: [
          {
            model: conn.User,
            as: 'currUserDetails',
            attributes: ['firstName', 'lastName', 'userId']
          }, {
            model: conn.OrdersDetails,
            as: 'orderProductDtls',
            include: {
              model: conn.Product,
              as: 'productDetails',
              attributes: [
                'productUuid', 'productId', 'productNo', 'status', 'productImage',
                'productName', 'productFamily', 'productCategory', 'productSubCategory',
                'productType', 'serviceType', 'chargeType', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'
              ]
            }
          }
        ],
        where: {
          orderCategory: payload.orderCategory?.code,
          orderType: payload.orderType?.code,
          parentFlag: constantCode.common.NO
          // createdAt: {
          //   [Op.between]: [moment(new Date()).subtract(7, 'day').format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD')]
          // }
        }
      })

      // console.log('response------------>', response)

      const businessEntityInfo = await conn.BusinessEntity.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      const businessUnitInfo = await conn.BusinessUnit.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      const roleinfo = await conn.Role.findAll({
        where: {
          status: constantCode.status.ACTIVE
        }
      })

      // const finalOrders = []
      // for (let m of response.rows) {
      //   m = m?.dataValues ? m?.dataValues : m
      //   if (m.parentFlag === 'Y') {
      //     const getChildOrders = await conn.Orders.findAndCountAll({
      //       include: [
      //         {
      //           model: conn.User,
      //           as: 'currUserDetails',
      //           attributes: ['firstName', 'lastName', 'userId']
      //         },
      //         {
      //           model: conn.OrdersDetails,
      //           as: 'orderProductDtls',
      //           include: {
      //             model: conn.Product,
      //             as: 'productDetails',
      //             attributes: [
      //               'productUuid', 'productId', 'productNo', 'status', 'productImage',
      //               'productName', 'productFamily', 'productCategory', 'productSubCategory',
      //               'productType', 'serviceType', 'chargeType', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'
      //             ]
      //           }
      //         }],
      //       where: {
      //         parentOrderUuid: m.orderUuid
      //       }
      //     })

      //     finalOrders.push({
      //       ...m,
      //       childOrder: getChildOrders.rows
      //     })
      //   } else {
      //     const getMasterOrder = response.rows.filter(ele => ele.orderUuid === m.parentOrderUuid)
      //     if (getMasterOrder <= 0) {
      //       finalOrders.push(m)
      //     }
      //   }
      // }
      const orderDet = orderResources.orderDetailsTransform(response.rows, businessEntityInfo, businessUnitInfo, roleinfo)
      // console.log('orderDet----------->', orderDet)
      const orderIds = []
      orderDet.forEach(f => { orderIds.push(f.orderNo) })
      // console.log('orderIds--------->', orderIds)
      const appointmentList = await conn.AppointmentTxn.findAll({
        include: [{
          model: conn.BusinessEntity, as: 'statusDesc', attributes: ['code', 'description']
        }],
        where: {
          tranCategoryNo: orderIds
          // appointDate: {
          //   [Op.between]: [moment(new Date()).subtract(7, 'day').format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD')]
          // }
        }
        // logging: true
        // limit: 7
      })
      console.log(appointmentList.length)
      // console.log('appointmentList------>', appointmentList)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Order details fetch succesfully.',
        data: { orders: orderDet, appointments: appointmentList }
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getTotalOrdersByChannel (payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      let query = `	select
      concat(cc.first_name, ' ', cc.last_name) as customer_name ,
      order_no,oh.created_at,
      be_desc(order_channel) as channel,
      be_desc(order_status) as order_status,
      be_desc(order_category) as order_category,
      be_desc(order_type) as order_type,
      be_desc(oh.service_type) as service_type,
      be_desc (cs.service_category) as service_category 
    from
      order_hdr oh
    left join cust_customers cc on
      cc.customer_id = oh.customer_id
    left join cust_services cs on oh.service_id = cs.service_id `
      let whereClause = ' WHERE oh.parent_flag =\'N\' '

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause = whereClause + ` AND oh.service_type IN ('${serviceTypes}')`
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' AND CAST(oh.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(oh.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      query = query + whereClause

      console.log('order query-------->', query)

      const response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Orders Count By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getOrderCorner (payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      if (!searchParams.channel) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `select 
      concat(cc.first_name,' ',cc.last_name) as customer_name ,
      oh.created_at,
      oh.order_no as entity_no,
      COALESCE(be_desc(oh.order_channel),oh.order_channel) as channel,
      be_desc(oh.order_status) as entity_status,
      be_desc(oh.order_category) as entity_category,
      be_desc(oh.order_type) as entity_type,
      be_desc(oh.service_type) as service_type
      from order_hdr oh left join cust_customers cc on cc.customer_id =oh.customer_id `
      let whereClause = ` WHERE  oh.order_channel='${searchParams.channel}' and oh.parent_flag='N' `

      if (searchParams?.serviceType) {
        const serviceTypes = searchParams.serviceType.join("', '")
        whereClause = whereClause + ` AND oh.service_type IN ('${serviceTypes}') `
      }

      if (payload?.orderType && payload?.orderType?.length > 0) {
        const orderTypes = payload.orderType.map(type => type.value).join("', '")
        whereClause = whereClause + ` AND oh.order_type IN ('${orderTypes}')`
      }

      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' AND CAST(oh.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(oh.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      console.log('query + whereClause---------->', query + whereClause)
      const response = await conn.sequelize.query(query + whereClause, {
        type: QueryTypes.SELECT
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Orders Corner',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getRevenueByChannel (payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      console.log('searchParams------->', searchParams)

      let query = 'SELECT * FROM bcae_revenue_channel_fn(null, null, null)'
      if (searchParams?.startDate || searchParams?.endDate || searchParams?.channel) {
        if (!searchParams?.startDate && !searchParams?.endDate && searchParams?.channel !== '') {
          if (searchParams?.channel !== 'skel-channel-all') {
            query = `SELECT * FROM bcae_revenue_channel_fn('${searchParams?.channel}', null, null)`
          } else {
            query = 'SELECT * FROM bcae_revenue_channel_fn(null, null, null)'
          }
        } else {
          if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined && searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
            query = `SELECT * FROM bcae_revenue_channel_fn(null, '${searchParams.startDate}', '${searchParams.endDate}')`
          }

          if (searchParams.channel && searchParams.channel !== '' && searchParams.channel !== undefined) {
            if (searchParams?.channel !== 'skel-channel-all') {
              query = `SELECT * FROM bcae_revenue_channel_fn('${searchParams?.channel}', '${searchParams.startDate}', '${searchParams.endDate}')`
            } else {
              query = `SELECT * FROM bcae_revenue_channel_fn(null, '${searchParams.startDate}', '${searchParams.endDate}')`
            }
          }
        }
      }

      console.log('revenue query-------->', query)
      let response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT,
        logging: true
      })
      response = camelCaseConversion(response)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Revenue By Channel',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getOverAllRevenueCount (payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      let query = 'SELECT sum(orh.bill_amount) as count ,be_desc(order_channel) AS channel FROM order_hdr AS orh'
      let whereClause = ' WHERE orh.parent_flag=\'N\' '
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' And CAST(orh.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(orh.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      query = query + whereClause
      const response = await conn.sequelize.query(query + ' GROUP BY order_channel', {
        type: QueryTypes.SELECT
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Over All Revenue Count',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getAppoinmentCount (payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      let query = 'select count(*) as count  from appointment_dtl ad left join ad_users au on ad.user_id =au.user_id '
      let whereClause = 'where au.user_type =\'UT_CONSUMER\' '
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + 'AND CAST(ad.appoint_date as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(ad.appoint_date as DATE) <= \'' + searchParams.endDate + '\' '
      }

      query = query + whereClause

      console.log('appoinment query----->', query)

      const response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched Over All Appoinment Count',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getNewOrderCount (payload, conn) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const { searchParams } = payload
      if (!searchParams.channel) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const query = `select 
      concat(cc.first_name,' ',cc.last_name) as customer_name ,
      oh.created_at,
      oh.order_no as entity_no,
      COALESCE(be_desc(oh.order_channel),oh.order_channel) as channel,
      be_desc(oh.order_status) as entity_status,
      be_desc(oh.order_category) as entity_category,
      be_desc(oh.order_type) as entity_type,
      be_desc(oh.service_type) as service_type
      from order_hdr oh left join cust_customers cc on cc.customer_id =oh.customer_id `
      let whereClause = ` WHERE  oh.order_channel='${searchParams.channel}' `
      if (searchParams.startDate && searchParams.startDate !== '' && searchParams.startDate !== undefined) {
        whereClause = whereClause + ' AND CAST(oh.created_at as DATE) >=\'' + searchParams.startDate + '\' AND '
      }
      if (searchParams.endDate && searchParams.endDate !== '' && searchParams.endDate !== undefined) {
        whereClause = whereClause + ' CAST(oh.created_at as DATE) <= \'' + searchParams.endDate + '\' '
      }
      console.log('query + whereClause---------->', query + whereClause)
      const response = await conn.sequelize.query(query + whereClause, {
        type: QueryTypes.SELECT
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched New Order Count',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getAllOrders (conn) {
    try {
      const ChildOrders = await conn.Orders.findAll({
        attributes: ['orderStatus'],
        where: {
          parentOrderId: '1476'
        },
        order: [['createdAt', 'DESC']]
      })
      const xx = ChildOrders?.dataValues ? ChildOrders?.dataValues : ChildOrders
      const arr = []
      xx?.map((ele) => {
        arr.push(ele?.orderStatus)
      })
      const x = arr.every(value => value === 'CLS')
      console.log('ChildOrders------>', x)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully Fetched New Order Count',
        data: xx
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getLiveSales (payload, conn) {
    try {
      if (!payload || (!payload?.fromTime || !payload?.toTime)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const fromTime = payload?.fromTime ? `'${payload?.fromTime}'` : null
      const toTime = payload?.toTime ? `'${payload?.toTime}'` : null

      const handlingSql = `select * from dtworks_sd_live_sales(${fromTime},${toTime})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getTotalSales (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const userId = payload?.userId ? `'${payload?.userId}'` : null
      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_total_sales(${fromDate},${toDate},${location}, ${userId})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }
      responseData = camelCaseConversion(responseData)
      let total = 0
      if (responseData && responseData?.length > 0) {
        responseData = responseData.sort((a, b) => b.vTotalSalesCnt - a.vTotalSalesCnt) // b - a for reverse sort
        // if (responseData.length > 0) {
        responseData?.forEach((e) => {
          total += Number(e.vTotalSalesCnt)
        })
        // }
        responseData = responseData.slice(0, 6)
      }
      
      const data = {
        total: total || 0,
        list: responseData || []
      }

      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getSalesByChannel (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const userId = payload?.userId ? `'${payload?.userId}'` : null
      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_channel_wise_sales(${fromDate},${toDate},${location}, ${userId})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      let total = 0
      if (responseData && responseData?.length > 0) {
        responseData = responseData.sort((a, b) => b.vTotalSalesCnt - a.vTotalSalesCnt) // b - a for reverse sort
        responseData?.forEach((e) => {
          total += Number(e.vTotalSalesCnt)
        })
        // responseData = responseData.slice(0, 6)
      }

      const data = {
        total: total || 0,
        list: responseData || []
      }
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getAnnualContractValue (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_annual_contract_value(${fromDate},${toDate},${location})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      let totalPercent = 0;
      if (responseData && responseData?.length > 0) {
        responseData = responseData.sort((a, b) => b.vAvgAcv - a.vAvgAcv) // b - a for reverse sort
        let total = 0;
        responseData?.forEach((e) => {
          total += Number(e.vAvgAcv);
        })
        totalPercent = total/responseData.length;
      }

      const data = {
        total: totalPercent || 0,
        list: responseData || []
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getCustomerLifetimeValue (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_customer_lifetime_value(${fromDate},${toDate},${location})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      let total = 0;
      if (responseData && responseData?.length > 0) {
        responseData = responseData.sort((a, b) => b.avgCustomerLifetimeValue - a.avgCustomerLifetimeValue) // b - a for reverse sort
        responseData?.forEach((e) => {
          total += Number(e.avgCustomerLifetimeValue);
        })
      }

      const data = {
        total: total || 0,
        list: responseData || []
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getLeadsPipeline (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_leads_pipeline(${fromDate},${toDate},${location})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getLiveSalesTrack (payload, conn) {
    try {
      const handlingSql = `select * from dtworks_sd_live_sales_track()`;

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getChurnRatePercent (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_churn_rate_perc(${fromDate},${toDate},${location})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      let total = 0;
      if (responseData && responseData?.length > 0) {
        responseData = responseData.sort((a, b) => b.vCustChurnRate - a.vCustChurnRate) // b - a for reverse sort
        responseData?.forEach((e) => {
          total += Number(e.vCustChurnRate);
        })
      }

      const data = {
        total: total || 0,
        list: responseData || []
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getPositiveNegativeReplyCount (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_positive_negative_reply_count(${fromDate},${toDate},${location})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getDealsByAge (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_deals_age(${fromDate},${toDate},${location})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getAvgLeadResponseTime (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_avg_lead_response_time(${fromDate},${toDate},${location})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getSalesGrowth (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const userId = payload?.userId ? `'${payload?.userId}'` : null
      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_sales_growth(${fromDate},${toDate},${location},${userId})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getSalesByLocation (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const userId = payload?.userId ? `'${payload?.userId}'` : null
      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_sales_by_location(${fromDate},${toDate},${location},${userId})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getMonthlySales (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      // const userId = payload?.userId ? `'${payload?.userId}'` : null
      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_ordersales_month_count(${fromDate},${toDate},${location})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }

  async getSalesMetric (payload, conn) {
    try {
      if (!payload || (!payload?.fromDate || !payload?.toDate)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      // const userId = payload?.userId ? `'${payload?.userId}'` : null
      const fromDate = payload?.fromDate ? `'${payload?.fromDate}'` : null
      const toDate = payload?.toDate ? `'${payload?.toDate}'` : null
      const location = payload?.location ? `'${payload?.location}'` : null

      const handlingSql = `select * from dtworks_sd_keymetric_month_count(${fromDate},${toDate},${location})`

      let responseData = {}
      if (handlingSql) {
        responseData = await conn.sequelize.query(handlingSql, {
          type: QueryTypes.SELECT
        })
      }

      responseData = camelCaseConversion(responseData)
      // responseData = orderResources.transformOrderCategoryPermormance(responseData)

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Fetched details succesfully',
        data: responseData
      }
    } catch (error) {
      logger.error(error)
      return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
    }
  }
}

module.exports = OrderService

const createOrUpdateProduct = async (newProduct, payloadAttrib, commonAttrib, conn, t) => {
  try {
    let productUpdate = {}
    if (newProduct.action === 'ADD') {
      const checkExistingProductTxnDetails = await conn.OrdersTxnDtl.findOne({
        where: {
          productId: newProduct.productId,
          orderId: payloadAttrib.orderId,
          productStatus: constantCode.status.ACTIVE
        },
        order: [['orderTxnDtlId', 'DESC']]
      })

      if (checkExistingProductTxnDetails) {
        return { status: 'ERROR', message: `The provided product ${newProduct.productName}, is already in your order list. Instead of adding new items, please update the quantity.` }
      }

      const productObject = {
        productId: newProduct.productId,
        productQuantity: newProduct.productQuantity,
        productStatus: constantCode.status.ACTIVE,
        productAddedDate: newProduct.productAddedDate,
        billAmount: newProduct.billAmount,
        edof: newProduct.edof,
        productSerialNo: newProduct.productSerialNo,
        ...commonAttrib,
        ...payloadAttrib,
        orderDtlUuid: uuidv4()
      }
      productUpdate = await conn.OrdersTxnDtl.create(productObject, { transaction: t })
    } else if (newProduct.action === 'UPDATE') {
      const checkExistingProductTxnDetails = await conn.OrdersTxnDtl.findOne({
        where: {
          productId: newProduct.productId,
          orderId: payloadAttrib.orderId,
          orderTxnId: payloadAttrib.orderTxnId,
          productStatus: constantCode.status.ACTIVE
        },
        order: [['orderTxnDtlId', 'DESC']]
      })
      if (!checkExistingProductTxnDetails) {
        return { status: 'ERROR', message: `The provided Product ${newProduct.productName} is not in your order list` }
      }

      const notSameProduct = orderResources.compareRecords(checkExistingProductTxnDetails, newProduct, productFields)
      if (!notSameProduct) {
        return { status: statusCodeConstants.SUCCESS, message: 'There is no changes in product' }
      }
      const productDetails = {
        ...orderResources.transformRecord(checkExistingProductTxnDetails, newProduct, productFields),
        orderDtlUuid: checkExistingProductTxnDetails.orderDtlUuid,
        ...commonAttrib
      }
      productUpdate = await conn.OrdersTxnDtl.update(productDetails, { where: { orderTxnDtlId: checkExistingProductTxnDetails.orderTxnDtlId }, transaction: t })
    } else if (newProduct.action === 'REMOVE') {
      const checkExistingProductTxnDetails = await conn.OrdersTxnDtl.findOne({
        logging: true,
        where: {
          productId: newProduct.productId,
          orderId: payloadAttrib.orderId,
          orderTxnId: payloadAttrib.orderTxnId,
          productStatus: constantCode.status.ACTIVE
        },
        order: [['orderTxnDtlId', 'DESC']]
      })

      if (!checkExistingProductTxnDetails) {
        return { status: 'ERROR', message: `The provided Product ${newProduct.productName} is not in your order list` }
      }
      productUpdate = await conn.OrdersTxnDtl.update({ productStatus: constantCode.status.IN_ACTIVE }, { logging: true, where: { orderTxnDtlId: checkExistingProductTxnDetails.orderTxnDtlId }, transaction: t })
    }
    return { status: statusCodeConstants.SUCCESS, message: 'Product details update or created successfully', data: productUpdate }
  } catch (error) {
    logger.error(error)
    return {
      status: 'ERROR', message: 'Internal server error'
    }
  }
}

const getUsersByRole = async (roleId, deptId, type, conn) => {
  try {
    logger.debug('Getting users list')

    let response = []
    const roleInfo = conn.Role.findOne({
      where: {
        roleId
      }
    })
    if (roleInfo) {
      let query = ''
      if (type === constantCode.common.POPUP) {
        query = `SELECT user_id, user_type, title, first_name, last_name, email, contact_no
        FROM ad_users
        WHERE mapping_payload @> '{"userDeptRoleMapping":[{"roleId":[${roleId}] , "unitId" :"${deptId}"}]}'
        AND status = 'AC';`
      } else {
        query = `SELECT user_id, user_type, title, first_name, last_name, email, contact_no
        FROM ad_users
        WHERE mapping_payload @> '{"userDeptRoleMapping":[{"roleId":[${roleId}] , "unitId" :"${deptId}"}]}'
        AND notification_type::text = ANY (ARRAY['["CNT_EMAIL", "CNT_SMS"]'::text, '["CNT_BOTH"]'::text])
        AND status = 'AC';`
      }
      // const query = `SELECT user_id, user_type, title, first_name, last_name, email, contact_no
      // FROM ad_users
      // WHERE mapping_payload @> '{"userDeptRoleMapping":[{"roleId":[ ${roleId}] , "unitId" :"${deptId}"}]}'
      // and notification_type in ('CNT_EMAIL','CNT_BOTH') and status in ('AC')
      // `
      // console.log('query---------->', query)
      response = await conn.sequelize.query(query, {
        type: QueryTypes.SELECT
      })
      if (response) {
        response = camelCaseConversion(response)
      }
    }
    logger.debug('Successfully fetch users list')
    return response
  } catch (error) {
    logger.error(error, 'Error while fetching users list')
  }
}

// function getOrderFlow (mainArr, parentObj) {
//   console.log('main array is ', mainArr)
//   const flow = []
//   console.log('parentObj of main arr ', parentObj)
//   if (parentObj.children.length > 0) {
//     for (const ch of parentObj.children) {
//       console.log(ch.role, parentObj.role, ch.entity, parentObj.entity, ch.status, parentObj.status)
//       const mainObj = mainArr.find(f => f.role === ch.role && f.entity === ch.entity && f.status === ch.status)
//       if (mainObj) {
//         console.log('main obj is ', mainObj)
//         const inx = mainArr.indexOf(parentObj)
//         const chInx = parentObj.children.indexOf(ch)
//         // console.log('childereddf    ', mainArr[inx]['children'][chInx])
//         if (!Array.isArray(mainArr[inx].children[chInx])) {
//           mainArr[inx].children[chInx] = []
//         }
//         mainArr[inx].children[chInx] = {
//           ...mainObj,
//           lineStyle: {
//             color: 'rgba(33, 181, 65)'
//           }
//         }
//         // console.log(_.some(mainArr, v => _.isEqual(v, mainObj)))
//         _.some(mainArr, v => {
//           // console.log('v==', v)
//           // console.log('mainObj==', mainObj)
//           if (!_.isEqual(v, mainObj)) {
//             flow.push({
//               ...v,
//               lineStyle: {
//                 color: 'rgba(33, 181, 65)'
//               }
//             })
//           }
//         })
//         getOrderFlow(mainArr[inx].children, parentObj)
//         break
//       }
//     }
//   }

//   return flow
// }

const findAndReplaceChild = (futureFlow, element, child) => {
  const matchingChild = futureFlow.find(f =>
    child.role === f.role && child.status === f.status && child.entity === f.entity && child.activityId !== f.activityId
  )

  if (matchingChild) {
    child.children = matchingChild?.children
    if (child.children && Array.isArray(child.children) && child.children.length > 0) {
      for (const elementChild of child?.children) {
        const result = isStatusAvailable(element, elementChild.status)
        if (!result) {
          findAndReplaceChild(futureFlow, element, elementChild)
        }
      }
    }
  }
}

const isStatusAvailable = (jsonData, status) => {
  if (jsonData.hasOwnProperty('status') && jsonData.status === status && jsonData.hasOwnProperty('children') && jsonData.children.length > 0) {
    const checkChildernsSubAvailable = jsonData.children.find(f => f.hasOwnProperty('children') && f.children.length > 0)
    if (checkChildernsSubAvailable) {
      return true
    }
    return false
  }

  // Recursive case: check the "children" if it exists
  if (jsonData.hasOwnProperty('children')) {
    for (const child of jsonData.children) {
      // Recurse into each child node
      if (isStatusAvailable(child, status)) {
        return true
      }
    }
  }

  // If the status is not found in the current node or any of its children, return false
  return false
}

function hasParentLineStyle (obj) {
  console.log('obj.lineStyleobj.lineStyle', obj.lineStyle)
  if (obj.lineStyle) {
    return true
  }
  // if (obj.children) {
  //   return obj.children.some((child) => hasParentLineStyle(child));
  // }
  return false
}

function removeLineStyleFromChildren (data) {
  if (!Array.isArray(data)) return data

  console.log('data is ', data)
  return data.map((item) => {
    const newItem = { ...item }

    console.log('newItem', newItem, hasParentLineStyle(newItem))
    if (!hasParentLineStyle(newItem)) {
      console.log('newItem to be deleted ', newItem)
      if (newItem.children) {
        for (const c of newItem.children) {
          delete c.lineStyle
        }
      }
    }
    if (newItem.children) {
      newItem.children = removeLineStyleFromChildren(newItem.children)
    }
    return newItem
  })
}

const checkFlowIsDone = (futureFlowData, workflowData) => {
  futureFlowData.lineStyle = {
    color: 'rgba(33,181,65)'
  }
  console.log('futureFlowData==================>', JSON.stringify(futureFlowData))
  if (futureFlowData?.hasOwnProperty('entity') && futureFlowData?.hasOwnProperty('role') && futureFlowData?.hasOwnProperty('status')) {
    const checkIsworkflowAvbl = workflowData.find((node) => {
      // console.log('from=====================>',node?.fromRoleDescription?.roleDesc ,'===', futureFlowData?.role , '===', node?.fromEntityDesc?.unitDesc , '===', futureFlowData?.entity ,
      // '===', node?.orderStatusDesc?.description , '===', futureFlowData?.status)

      // console.log('to=====================>',node?.toRoleDescription?.roleDesc ,'===', futureFlowData?.role , '===', node?.toEntityDesc?.unitDesc , '===', futureFlowData?.entity ,
      // '===', node?.orderStatusDesc?.description , '===', futureFlowData?.status)

      if (node?.toRoleDescription?.roleDesc && node?.toEntityDesc?.unitDesc && node?.orderStatusDesc?.description &&
        node?.toRoleDescription?.roleDesc === futureFlowData?.role && node?.toEntityDesc?.unitDesc === futureFlowData?.entity &&
        node?.orderStatusDesc?.description === futureFlowData?.status) {
        futureFlowData.lineStyle = {
          color: 'rgba(33,181,65)'
        }
        futureFlowData.flowDate = node.createdAt
        return true
      }
    })
    // console.log('checkIsworkflowAvbl --------------->', JSON.stringify(checkIsworkflowAvbl))
    if (!checkIsworkflowAvbl) {
      return false
    }
  }

  if (futureFlowData.hasOwnProperty('children')) {
    // eslint-disable-next-line no-unreachable-loop
    for (const child of futureFlowData.children) {
      // Recurse into each child node
      console.log('child -------------->', child)
      if (checkFlowIsDone(child, workflowData)) {
        return true
      }
      // else {
      //   // If checkFlowIsDone returns false, terminate the loop
      //   break
      // }
    }
  }

  // If the status is not found in the current node or any of its children, return false

  //     console.log('checkCondition', o.fromRoleDescription.roleDesc === f.role , o.fromEntityDesc.unitDesc === f.entity , o.orderStatusDesc.description === f.status)
}

// const createorUpdateContract = async (conn, t) => {
//   try {
//     const contractHdr = {

//     }

//     const contractDtl = {

//     }
//   } catch (error) {
//     logger.error(error)
//     return {
//       status: statusCodeConstants.ERROR, message: 'Internal server error'
//     }
//   }
// }
