import {
  sequelize,
  BusinessEntity,
  BulkUploadDtl,
  BulkUploadBusinessEntity,
  PortalSetting,
  User
} from '@models'
import {
  transfromBusinessParameter,
  transfromPortalSetting,
  transformTemplateDetails
} from '@resources'
import {
  defaultCode,
  logger,
  getTimeSlots,
  groupBy,
  statusCodeConstants,
  camelCaseConversion,
  defaultStatus,
  noOfDaysBetween2Dates,
  CryptoHelper
} from '@utils'
// import { isEmpty, map } from 'lodash'
import { Op, QueryTypes } from 'sequelize'
import moment from 'moment'
import { isEmpty } from 'lodash'
import { config } from '@config/env.config'
import axios from 'axios'
const { v4: uuidv4 } = require('uuid')
let instance, commonAttrib
const { systemUserId, systemRoleId, systemDeptId, bcae: bcaeConfig } = config
const commonExcludableAttrs = ['createdDeptId', 'createdRoleId', 'tranId', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt']

class BusinessParameterService {
  constructor () {
    if (!instance) {
      instance = this
    }
    instance.cryptoHelper = new CryptoHelper()
    return instance
  }

  async getFAQs (payload, conn) {
    try {
      let whereClause = {}
      if (payload?.channel) {
        whereClause = {
          ...whereClause,
          channel: payload?.channel
        }
      }

      if (payload?.status) {
        whereClause = {
          ...whereClause,
          status: payload?.status
        }
      }

      const faqs = await conn.Faqs.findAll({
        where: whereClause,
        include: [
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description', 'mapping_payload']
          }
        ]
      })

      const groupedFAQs = groupBy(faqs, 'channel')

      const codesAndDescriptions = await conn.BusinessEntity.findAll({
        where: {
          code: Object.keys(groupedFAQs),
          status: defaultStatus.ACTIVE
        }
      })

      const updatedFAQs = []
      for (let index = 0; index < codesAndDescriptions.length; index++) {
        const codeAndDescription = codesAndDescriptions[index]
        updatedFAQs.push({
          code: codeAndDescription.code,
          description: codeAndDescription.description,
          data: groupedFAQs[codeAndDescription.code]
        })
      }

      return {
        status: updatedFAQs?.length ? statusCodeConstants.SUCCESS : statusCodeConstants.NOT_FOUND,
        message: updatedFAQs?.length ? 'FAQs retrived successfully' : 'No FAQs added',
        data: updatedFAQs
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createOrUpdateFAQs (body, conn, departmentId, userId, roleId, t) {
    try {
      const commonAttrib = {
        createdRoleId: roleId || systemRoleId,
        createdDeptId: departmentId || systemDeptId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }

      let faqSaved = false
      if (typeof body?.faqId === 'number') {
        await conn.Faqs.update({
          question: body.question,
          answer: body.answer,
          channel: body.channel,
          status: body.status,
          updatedBy: userId || systemUserId
        }, {
          where: {
            faqId: body?.faqId
          },
          transaction: t
        })
        faqSaved = true
      } else {
        await conn.Faqs.create({
          question: body.question,
          answer: body.answer,
          channel: body.channel,
          status: body.status,
          tranId: uuidv4(),
          ...commonAttrib
        }, { transaction: t })
        faqSaved = true
      }

      return {
        status: faqSaved ? statusCodeConstants.SUCCESS : statusCodeConstants.ERROR,
        message: faqSaved ? 'FAQ saved successfully' : 'Error in saving FAQ'
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async deleteFAQs (body, conn, departmentId, userId, roleId, t) {

  }

  async addToCart (conn, body, userId, t) {
    try {
      const commonAttrib = {
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }
      console.log('body------->', body)

      const cartCheck = await conn.Cart.findOne({
        where: { customerId: body?.customerId },
        logging: true
      })
      console.log('cartCheck------>', cartCheck)
      let cartDetails
      if (cartCheck) {
        await conn.Cart.update({ cartItems: body?.cartItems, finalCalculations: body?.finalCalculations, appliedPromoCodes: body?.appliedPromoCodes },
          {
            where: {
              customerId: body?.customerId
            },
            transaction: t
          })
        cartDetails = await conn.Cart.findOne({
          where: { customerId: body?.customerId },
          logging: true
        })
      } else {
        const bodyWithJSONString = {
          ...body,
          cartItems: body.cartItems,
          appliedPromoCodes: body.appliedPromoCodes,
          finalCalculations: body?.finalCalculations,
          ...commonAttrib
        }
        cartDetails = await conn.Cart.create(bodyWithJSONString, {
          transaction: t
        })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Item Added in cart successfully',
        data: cartDetails
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  // async addToCart(conn, body, userId, t) {
  //   try {
  //     const commonAttrib = {
  //       createdBy: userId || systemUserId,
  //       updatedBy: userId || systemUserId,
  //     };
  //     console.log('body------->', body);

  //     const cartCheck = await conn.Cart.findOne({
  //       where: { customerId: body?.customerId },
  //       logging: true
  //     });
  //     console.log('cartCheck------>', cartCheck)
  //     let cartDetails;
  //     if (cartCheck) {
  //       await conn.Cart.update({ cartItems: JSON.stringify(body?.cartItems), finalCalculations: JSON.stringify(body?.finalCalculations), appliedPromoCodes: JSON.stringify(body?.appliedPromoCodes) },
  //         {
  //           where: {
  //             customerId: body?.customerId
  //           },
  //           transaction: t
  //         });
  //       cartDetails = await conn.Cart.findOne({
  //         where: { customerId: body?.customerId },
  //         logging: true
  //       });
  //     } else {
  //       const bodyWithJSONString = {
  //         ...body,
  //         cartItems: JSON.stringify(body.cartItems),
  //         appliedPromoCodes: JSON.stringify(body.appliedPromoCodes),
  //         finalCalculations: JSON.stringify(body?.finalCalculations),
  //         ...commonAttrib,
  //       };
  //       cartDetails = await conn.Cart.create(bodyWithJSONString, {
  //         transaction: t,
  //       });
  //     }

  //     return {
  //       status: statusCodeConstants.SUCCESS,
  //       message: "Item Added in cart successfully",
  //       data: cartDetails
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       status: statusCodeConstants.ERROR,
  //       message: "Internal server error",
  //     };
  //   }
  // }

  async getCart (conn, body) {
    try {
      console.log('body------>', body)
      const cartDetails = await conn.Cart.findOne({
        where: { customerId: body?.customerId },
        logging: true
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'cart fetched successfully',
        data: cartDetails
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  // async getCart(conn, body) {
  //   try {
  //     console.log('body------>', body)
  //     const cartDetails = await conn.Cart.findOne({
  //       where: { customerId: body?.customerId },
  //       logging: true
  //     });

  //     return {
  //       status: statusCodeConstants.SUCCESS,
  //       message: "cart fetched successfully",
  //       data: { cartItems: cartDetails && JSON.parse(cartDetails?.cartItems) || [], finalCalculations: cartDetails && JSON.parse(cartDetails?.finalCalculations) || [], appliedPromoCodes: cartDetails && JSON.parse(cartDetails?.appliedPromoCodes) }
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     return {
  //       status: statusCodeConstants.ERROR,
  //       message: "Internal server error",
  //     };
  //   }
  // }

  async saveCard (body, conn, departmentId, userId, roleId, t) {
    try {
      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId || systemDeptId,
        createdRoleId: roleId || systemRoleId,
        createdBy: userId || systemUserId,
        updatedBy: userId || systemUserId
      }
      console.log('body------->', body)
      const payload = {}

      if (body?.upiId) {
        payload.upiId = this.cryptoHelper.encrypt({ upiId: body?.upiId })
      } else {
        payload.cardExpiryDate = this.cryptoHelper.encrypt({ cardExpiryDate: body?.expiryDate })
        payload.cardHolderName = this.cryptoHelper.encrypt({ cardHolderName: body?.cardHolderName })
        payload.cardCvv = this.cryptoHelper.encrypt({ cvv: body?.cvv })
        payload.cardNumberDebitCredit = this.cryptoHelper.encrypt({ cardNumber: body?.cardNumber })
        payload.customerId = body?.customerId
      }

      const cardCheck = await conn.CustomerPayment.findOne({
        where: payload,
        logging: true
      })

      if (cardCheck) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Provided Details already exists',
          data: { custPaymentId: cardCheck?.custPaymentId }
        }
      }

      const cardDetails = await conn.CustomerPayment.create({ ...payload, ...commonAttrib }, {
        transaction: t
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Provided Details saved successfully',
        data: { custPaymentId: cardDetails?.custPaymentId }
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getBusinessParameterLookup (lookup, conn) {
    try {
      const codeTypes = lookup.valueParam.split(',')

      console.log('lookup ------------->', lookup)

      // const { filters } = lookup

      let response = {}

      // const filter = {}

      for (const codeType of codeTypes) {
        const businessEntities = await conn.BusinessEntity.findAll({
          // include: [
          //   {
          //     model: conn.MetaTypeCodeLu, as: 'codeTypeDesc', attributes: ['description']
          //   }
          // ],
          where: {
            codeType,
            status: defaultStatus.ACTIVE
          },
          order: [['description', 'ASC']]
        })

        response[codeType] = []

        for (const row of businessEntities) {
          if (lookup && lookup.isFormatted === 'true') {
            response[codeType].push({
              code: row?.code,
              value: row?.description
            })
          } else {
            response[codeType].push({
              code: row.code,
              description: row.description,
              codeType: row.codeType,
              codeTypeDesc: row.codeTypeDesc,
              mapping: row.mappingPayload,
              status: row.status
            })
          }
        }
      }

      // if (filters && Array?.isArray(filters) && filters.length > 0) {
      //   for (const filter of filters) {

      //   }
      // }

      // if (lookup && lookup.isFormatted === 'true') {
      //   response = response?.map((m) => ({ code: m.code, value: m.description }))
      // }

      if (response.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Not Record found for your given search Param',
          data: response
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched Business Parameter data',
        data: response
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getModulesList (conn) {
    try {
      const modulesList = await conn.Mainmenu.findAll({ where: { status: defaultStatus.ACTIVE, appName: defaultCode?.WEB_APPNAME } })
      const groupByModuleName = groupBy(modulesList, 'moduleName')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched the modules list',
        data: groupByModuleName
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getAddressLookup (lookup, conn) {
    try {
      let whereClauses = {}
      if (lookup && lookup?.country) {
        whereClauses.country = lookup.country
      }
      if (lookup && lookup?.postCode) {
        whereClauses.postCode = lookup.postCode
      }
      if (lookup && lookup?.state) {
        whereClauses = {
          ...whereClauses,
          state: { [Op.iLike]: `%${lookup.state}%` }
        }
      }

      if (lookup && lookup?.city) {
        whereClauses = {
          ...whereClauses,
          city: { [Op.iLike]: `%${lookup.city}%` }
        }
      }

      const response = await conn.AddressLookup.findAll({
        // logging: console.log,
        where: {
          ...whereClauses
        }
      })

      const addressLookup = []
      for (const row of response) {
        addressLookup.push({
          postCode: row.postCode,
          state: row.state,
          region: row.region,
          city: row.city,
          country: row.country,
          district: row.district
        })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch Business Parameter data',
        data: addressLookup
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getMainMenuByRole (reqData, conn) {
    try {
      const roleId = reqData.roleId
      const response = await conn.Mainmenu.findAll({
        where: {
          status: 'AC',
          appName: defaultCode?.WEB_APPNAME
        },
        order: [
          ['moduleName', 'ASC'],
          ['screenName', 'ASC']
        ]
      })
      const modules = [...new Set(response.map((item) => item.moduleName))]
      const finalObj = []
      const obj = []
      // eslint-disable-next-line array-callback-return
      modules.map((m) => {
        const list = []
        let currMod
        // eslint-disable-next-line array-callback-return
        response.map((r) => {
          if (m === r.moduleName) {
            currMod = r
            list.push({
              screenName: r.screenName,
              props: r.props,
              url: r.url,
              icon: r.icon
            })
          }
        })
        obj.push({
          moduleName: m,
          moduleIcon: currMod.moduleIcon,
          list
        })
      })

      obj.map((o, ind) => {
        o.list.map((l, i) => {
          // eslint-disable-next-line array-callback-return
          modules.map((m) => {
            if (m === l.screenName) {
              finalObj.push(m)
              const screenDtl = obj.find((e) => e.moduleName === m)
              o.list[i] = screenDtl
            }
          })
          return l
        })
        return o
      })

      const responsObj = []
      obj.forEach((f) => {
        if (!finalObj.includes(f.moduleName)) {
          f.accessType = 'deny'
          responsObj.push(f)
        }
      })

      const permissions = await conn.Role.findOne({
        attributes: ['mappingPayload'],
        raw: true,
        where: { roleId }
      })

      responsObj.map((o) => {
        let accessType = ''
        o.list &&
          o.list.map((l) => {
            if (l.moduleName) {
              let found1 = false
              l.list &&
                l.list.map((m) => {
                  if (m.screenName) {
                    for (const p of permissions?.mappingPayload?.permissions) {
                      for (const t of p[Object.keys(p)[0]]) {
                        if (t.screenName === m.screenName) {
                          m.accessType = t.accessType
                          if (t.accessType !== 'deny') {
                            found1 = true
                          }
                        }
                      }
                    }
                  }
                  return m
                })

              if (found1 === true) {
                l.accessType = 'allow'
                accessType = 'allow'
              } else {
                l.accessType = 'deny'
                accessType = 'deny'
              }
            } else {
              if (l.screenName) {
                for (const p of permissions?.mappingPayload?.permissions) {
                  for (const t of p[Object.keys(p)[0]]) {
                    if (t.screenName === l.screenName) {
                      l.accessType = t.accessType
                      if (t.accessType !== 'deny') {
                        accessType = 'allow'
                      }
                    }
                  }
                }
              }
            }
            return l
          })
        if (accessType !== 'deny') {
          o.accessType = 'allow'
        }
        return o
      })

      if (response) {
        const newResponse = []
        responsObj.forEach((x, i) => {
          const atleastOneAllowed = x.list.find(
            (y) => y.accessType === 'allow'
          )
          if (atleastOneAllowed) {
            newResponse.push(responsObj[i])
          }
        })

        logger.debug('Successfully fetch Mainmenu data')
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Successfully fetch Mainmenu data',
          data: newResponse
        }
      }
      return {
        status: statusCodeConstants.NOT_FOUND,
        message: 'Menu data not found',
        data: response
      }
    } catch (error) {
      logger.error(error, 'Error while fetching Mainmenu data')
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getShiftMasters (conn) {
    const shiftMst = await conn.ShiftMst.findAll({
      attributes: [
        'shiftId',
        'shiftNo',
        'shiftShortName',
        'shiftStartTime',
        'shiftEndTime'
      ],
      where: {
        status: defaultStatus.ACTIVE
      }
    })
    return {
      status: statusCodeConstants.SUCCESS,
      message: 'Notification headers found',
      data: shiftMst
    }
  }

  async getNotificationHeaders (conn) {
    const notificationHdrs = await conn.NotificationHdr.findAll({
      attributes: ['notifyId', 'notifyName', 'status'],
      where: {
        status: defaultStatus.ACTIVE
      }
    })
    return {
      status: statusCodeConstants.SUCCESS,
      message: 'Notification headers found',
      data: notificationHdrs
    }
  }

  async createTemplateMaster (details, conn, departmentId, userId, roleId, t) {
    try {
      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }

      const {
        templateName,
        templateCategory,
        userGroup,
        templateStatus: status,
        eventType,
        calendarId,
        appointmentType,
        location,
        notifyId,
        slots: slotsArray,
        fromDate,
        toDate,
        shiftId
      } = details

      const templateHdr = await conn.TemplateHdr.findOne({
        where: { templateName, templateCategory },
        logging: true
      })

      if (templateHdr) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Template name already exists'
        }
      }

      const templateHdrReq = {
        templateName,
        templateCategory,
        userGroup,
        status,
        eventType,
        calendarId,
        ...commonAttrib
      }

      if (['TC_EMAIL', 'TC_SMS', 'TC_WHATSAPP'].includes(templateCategory)) {
        templateHdrReq.entity = details.entity
      }

      const templateHdrRes = await conn.TemplateHdr.create(templateHdrReq, {
        transaction: t
      })

      if (templateCategory === 'TC_APPOINT') {
        const appointHdrReq = {
          appointName: templateName,
          status: 'AS_SCHED',
          templateId: templateHdrRes.templateId,
          appointType: appointmentType,
          location,
          userGroup,
          notifyId: notifyId || 1,
          ...commonAttrib
        }
        let hasRoster = false
        let rosterDetails = []

        let roster

        if (appointmentType === 'CUST_VISIT') {
          roster = await conn.RosterHdr.findOne({
            where: { calendarId, shiftId, appointType: appointmentType, appointLoc: location }
          })
        } else {
          roster = await conn.RosterHdr.findOne({
            where: { calendarId, shiftId, appointType: appointmentType }
          })
        }

        if (roster) {
          const whereClause = {
            rosterId: roster.rosterId,
            status: defaultStatus.ACTIVE,
            rosterDate: {
              [Op.between]: [fromDate, toDate]
            }
          }
          rosterDetails = await conn.RosterDtl.findAll({
            where: whereClause
          })
          hasRoster = true
        }

        const appointHdrRes = await conn.AppointmentHdr.create(appointHdrReq, {
          transaction: t
        })
        const appointmentDetails = []
        if (!hasRoster) {
          const numDays = noOfDaysBetween2Dates(fromDate, toDate)

          for (let day = 0; day < numDays; day++) {
            for (const slot of slotsArray) {
              // console.log("slot---->", slot);

              for (const timing of slot.timings) {
                // console.log("timings---->", timing);
                const startTime = timing.split('-')[0]
                const endTime = timing.split('-')[1]
                const duration = moment
                  .duration(
                    moment(`1997-01-01T${endTime}:00`, 'YYYY-MM-DDTHH:mm:ss')
                      .diff(moment(`1997-01-01T${startTime}:00`, 'YYYY-MM-DDTHH:mm:ss'))
                  )
                  .asMinutes()

                // console.log("duration----->", duration);
                appointmentDetails.push({
                  appointId: appointHdrRes.appointId,
                  status: 'AS_SCHED',
                  appointMode: appointmentType,
                  calenderId: 1,
                  shiftId,
                  divId: slot.divId,
                  appointDate: moment(
                    new Date(fromDate).setDate(new Date(fromDate).getDate() + day)
                  ).format('YYYY-MM-DD'),
                  workType: 'WT_WORKING',
                  appointInterval: duration,
                  appointAgentsAvailability: slot.personCount,
                  appointStartTime: startTime,
                  appointEndTime: endTime,
                  ...commonAttrib
                })
              }
            }
          }
        } else {
          for (const roster of rosterDetails) {
            appointmentDetails.push({
              appointId: appointHdrRes.appointId,
              status: 'AS_SCHED',
              appointMode: appointmentType,
              calenderId: 1,
              shiftId,
              appointDate: moment(new Date(roster.rosterDate)).format('YYYY-MM-DD'),
              workType: 'WT_WORKING',
              appointInterval: moment(roster.rosterEndTime, 'HH:mm').diff(moment(roster.rosterStartTime, 'HH:mm')) / (60 * 1000),
              userId: Number(roster.userId),
              appointStartTime: roster.rosterStartTime,
              appointEndTime: roster.rosterEndTime,
              ...commonAttrib
            })
          }
        }

        if (appointmentDetails.length > 0) {
          // console.log("appointmentDetails:", appointmentDetails);
          await conn.AppointmentDtl.bulkCreate(appointmentDetails, {
            transaction: t
          })
        }
      } else if (templateCategory === 'TC_TERMSCONDITION') {
        if (!details.chargeData && details.dynamicTerm) {
          return {
            status: statusCodeConstants.ERROR,
            message: 'Charge details missing'
          }
        }
        if (details.dynamicTerm) {
          await conn.Charge.update({ chargeAmount: Number(details.chargeData.chargeAmount) },
            {
              where: {
                chargeId: Number(details.chargeId)
              },
              transaction: t
            })
        }

        const hdrReq = {
          termName: templateName,
          status: 'AC',
          entityType: details.orderType,
          serviceType: details.serviceType,
          templateId: templateHdrRes.templateId,
          contractImpact: details.dynamicTerm ? details.contractImpact : false,
          paymentImpact: details.dynamicTerm ? details.paymentImpact : false,
          billingImpact: details.dynamicTerm ? details.billingImpact : false,
          benefitsImpact: details.dynamicTerm ? details.benefitsImpact : false,
          termsContent: String(details.staticTerm ? details.termsContent : '').trim(),
          chargeId: details.dynamicTerm ? Number(details.chargeId) : null,
          noOfDays: details.dynamicTerm ? Number(details.noOfDays) : null,
          ...commonAttrib
        }
        await conn.TermsConditionsHdr.create(hdrReq, { transaction: t })
      } else if (templateCategory === 'TC_PRODUCTBUNDLE') {
        const hdrReq = {
          prodBundleName: templateName,
          prodBundleUuid: uuidv4(),
          status: 'AC',
          templateId: templateHdrRes.templateId,
          contractFlag: details.contractFlag,
          contractList: details.contractList,
          bundleImage: details.bundleImage,
          ...commonAttrib
        }
        await conn.ProductBundleHdr.create(hdrReq, { transaction: t })
      } else if (templateCategory === 'TC_PROMOCODE') {
        const isPromoExist = await conn.PromoHdr.findOne({ where: { promoCode: details.promoCode } })
        if (isPromoExist) {
          return {
            message: 'This Promo Code has already been used',
            status: statusCodeConstants.VALIDATION_ERROR
          }
        }

        let chargeDetails = null
        if (details.chargeData) {
          const chargeData = details.chargeData
          if (!chargeData) {
            return {
              status: statusCodeConstants.ERROR,
              message: 'Charge details missing'
            }
          }
          chargeDetails = await conn.Charge.create({
            chargeName: chargeData.chargeName,
            chargeCat: chargeData.chargeType,
            chargeAmount: Number(chargeData.chargeAmount),
            status: defaultStatus.TEMPORARY,
            currency: chargeData.currency,
            startDate: details.promoStartDate,
            endDate: details.promoEndDate,
            ...commonAttrib
          }, { transaction: t })
        }
        const hdrReq = {
          promoName: templateName,
          promoCode: details.promoCode,
          promoUuid: uuidv4(),
          status: 'AC',
          templateId: templateHdrRes.templateId,
          promoType: details.promoType,
          allowedTimes: details.allowedTimes,
          allowWithOtherPromo: details.allowWithOtherPromo,
          startDate: details.promoStartDate,
          endDate: details.promoEndDate,
          productBenefit: details.productBenefit,
          promoValidityDuration: details.promoDuration,
          chargeId: chargeDetails?.chargeId || null,
          contractList: details.contractList || null,
          ...commonAttrib
        }

        console.log(hdrReq)
        const promoHdr = await conn.PromoHdr.create(hdrReq, { transaction: t })

        if (details.termsId && Array.isArray(details.termsId)) {
          for (const term of details.termsId) {
            const dtlobj = {
              termId: term,
              productId: promoHdr.promoId,
              status: defaultStatus.ACTIVE,
              ...commonAttrib
            }
            await conn.TermsConditionsDtl.create(dtlobj, { transaction: t })
          }
        }
      } else if (['TC_EMAIL', 'TC_SMS', 'TC_WHATSAPP'].includes(templateCategory)) {
        const notificationTemplateReq = {
          templateType: templateCategory,
          templateName,
          subject: details.subject,
          body: details.content,
          rawContent: details.rawContent,
          dataSource: details.dataSource,
          templateStatus: status === defaultStatus.template.ACTIVE ? defaultStatus.ACTIVE : defaultStatus.IN_ACTIVE,
          templateHdrId: templateHdrRes.templateId,
          ...commonAttrib
        }

        const notificationTemplateExist = await conn.NotificationTemplate.findOne({ where: { templateType: templateCategory, templateName } })
        if (notificationTemplateExist) {
          return {
            message: 'This template category with name has already exists.',
            status: statusCodeConstants.VALIDATION_ERROR
          }
        }

        await conn.NotificationTemplate.create(notificationTemplateReq, { transaction: t })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Template Master created successfully',
        data: templateHdrRes
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateTemplateMaster (details, conn, departmentId, userId, roleId, t) {
    try {
      const commonAttrib = {
        updatedBy: userId
      }

      const {
        templateId,
        templateName,
        templateCategory,
        userGroup,
        templateStatus: status,
        eventType,
        entity,
        calendarId,
        appointmentType,
        location,
        notifyId,
        slots: slotsArray,
        fromDate,
        toDate,
        shiftId
      } = details

      const templateHdr = await conn.TemplateHdr.findOne({
        where: {
          templateName,
          templateCategory,
          templateId: {
            [Op.ne]: templateId
          }
        }
      })

      if (templateHdr) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Template name already exists'
        }
      }

      if (templateCategory === 'TC_APPOINT') {
        let appointHdrRes = await conn.AppointmentHdr.findOne({
          where: { templateId }
        })
        const appointId = appointHdrRes.appointId

        const isAppointmentBooked = await conn.AppointmentTxn.findOne({ where: { appointId } })

        if (!isAppointmentBooked) {
          const templateHdrReq = {
            templateName,
            templateCategory,
            userGroup,
            status,
            eventType,
            calendarId,
            ...commonAttrib
          }

          const templateHdrRes = await conn.TemplateHdr.update(templateHdrReq, {
            where: {
              templateId
            },
            transaction: t
          })

          const appointHdrReq = {
            appointName: templateName,
            status: 'AS_SCHED',
            templateId,
            appointType: appointmentType,
            location,
            userGroup,
            notifyId: notifyId || 1,
            ...commonAttrib
          }

          let hasRoster = false
          let rosterDetails = []

          let roster
          if (appointmentType === 'CUST_VISIT') {
            roster = await conn.RosterHdr.findOne({
              where: { calendarId, shiftId, appointType: appointmentType, appointLoc: location }
            })
          } else {
            roster = await conn.RosterHdr.findOne({
              where: { calendarId, shiftId, appointType: appointmentType }
            })
          }

          if (roster) {
            const whereClause = {
              rosterId: roster.rosterId,
              status: defaultStatus.ACTIVE,
              rosterDate: {
                [Op.between]: [fromDate, toDate]
              }
            }
            rosterDetails = await conn.RosterDtl.findAll({
              where: whereClause
            })
            hasRoster = true
            appointHdrReq.rosterId = roster.rosterId
          } else {
            appointHdrReq.rosterId = null
          }

          appointHdrRes = await conn.AppointmentHdr.update(appointHdrReq, {
            where: {
              templateId
            },
            transaction: t
          })

          await conn.AppointmentDtl.destroy({ where: { appointId }, transaction: t })

          const appointmentDetails = []
          if (!hasRoster) {
            const numDays = noOfDaysBetween2Dates(fromDate, toDate)

            for (let day = 0; day < numDays; day++) {
              for (const slot of slotsArray) {
                for (const timing of slot.timings) {
                  const startTime = timing.split('-')[0]
                  const endTime = timing.split('-')[1]
                  const duration = moment
                    .duration(
                      moment(`1997-01-01T${endTime}:00`, 'YYYY-MM-DDTHH:mm:ss')
                        .diff(moment(`1997-01-01T${startTime}:00`, 'YYYY-MM-DDTHH:mm:ss'))
                    )
                    .asMinutes()

                  appointmentDetails.push({
                    appointId,
                    status: 'AS_SCHED',
                    appointMode: appointmentType,
                    calenderId: 1,
                    shiftId,
                    divId: slot.divId,
                    appointDate: moment(
                      new Date(fromDate).setDate(new Date(fromDate).getDate() + day)
                    ).format('YYYY-MM-DD'),
                    workType: 'WT_WORKING',
                    appointInterval: duration,
                    appointAgentsAvailability: slot.personCount,
                    appointStartTime: startTime,
                    appointEndTime: endTime,
                    tranId: uuidv4(),
                    createdDeptId: departmentId,
                    createdRoleId: roleId,
                    createdBy: userId,
                    updatedBy: userId,
                    ...commonAttrib
                  })
                }
              }
            }
          } else {
            for (const roster of rosterDetails) {
              appointmentDetails.push({
                appointId,
                status: 'AS_SCHED',
                appointMode: appointmentType,
                calenderId: 1,
                shiftId,
                appointDate: moment(new Date(roster.rosterDate)).format('YYYY-MM-DD'),
                workType: 'WT_WORKING',
                appointInterval: moment(roster.rosterEndTime, 'HH:mm').diff(moment(roster.rosterStartTime, 'HH:mm')) / (60 * 1000),
                userId: Number(roster.userId),
                appointStartTime: roster.rosterStartTime,
                appointEndTime: roster.rosterEndTime,
                tranId: uuidv4(),
                createdDeptId: departmentId,
                createdRoleId: roleId,
                createdBy: userId,
                updatedBy: userId,
                ...commonAttrib
              })
            }
          }

          if (appointmentDetails.length > 0) {
            // console.log("appointmentDetails:", appointmentDetails);
            await conn.AppointmentDtl.bulkCreate(appointmentDetails, {
              transaction: t
            })
          }

          return {
            status: statusCodeConstants.SUCCESS,
            message: 'Template Master updated successfully',
            data: templateHdrRes
          }
        } else {
          return {
            status: statusCodeConstants.CONFLICT,
            message: 'Template cannot be edited because already appointment has been booked for this template.'
          }
        }
      } else if (templateCategory === 'TC_TERMSCONDITION') {
        const hdrRes = await conn.TermsConditionsHdr.findOne({
          where: { templateId }
        })

        const templateHdrReq = {
          templateName,
          templateCategory,
          userGroup,
          status,
          eventType,
          calendarId,
          ...commonAttrib
        }

        const templateHdrRes = await conn.TemplateHdr.update(templateHdrReq, {
          where: {
            templateId
          },
          transaction: t
        })

        const hdrReq = {
          termName: templateName,
          status: defaultStatus.ACTIVE,
          entityType: details.orderType,
          serviceType: details.serviceType,
          contractImpact: details.dynamicTerm ? details.contractImpact : false,
          paymentImpact: details.dynamicTerm ? details.paymentImpact : false,
          billingImpact: details.dynamicTerm ? details.billingImpact : false,
          benefitsImpact: details.dynamicTerm ? details.benefitsImpact : false,
          termsContent: String(details.staticTerm ? details.termsContent : '').trim(),
          chargeId: details.dynamicTerm ? Number(details.chargeId) : null,
          noOfDays: details.dynamicTerm ? Number(details.noOfDays) : null,
          ...commonAttrib
        }
        await conn.TermsConditionsHdr.update(hdrReq, {
          where: {
            templateId,
            termId: hdrRes.termId
          },
          transaction: t
        })

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Template Master updated successfully',
          data: templateHdrRes
        }
      } else if (templateCategory === 'TC_PRODUCTBUNDLE') {
        const hdrRes = await conn.ProductBundleHdr.findOne({
          where: { templateId }
        })

        const templateHdrReq = {
          templateName,
          templateCategory,
          userGroup,
          status,
          eventType,
          calendarId,
          ...commonAttrib
        }

        const templateHdrRes = await conn.TemplateHdr.update(templateHdrReq, {
          where: {
            templateId
          },
          transaction: t
        })

        const hdrReq = {
          prodBundleName: templateName,
          status: defaultStatus.ACTIVE,
          contractFlag: details.contractFlag,
          contractList: details.contractList,
          bundleImage: details.bundleImage,
          ...commonAttrib
        }
        await conn.ProductBundleHdr.update(hdrReq, {
          where: {
            templateId,
            prodBundleId: hdrRes.prodBundleId
          },
          transaction: t
        })

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Template Master updated successfully',
          data: templateHdrRes
        }
      } else if (templateCategory === 'TC_PROMOCODE') {
        const hdrRes = await conn.PromoHdr.findOne({
          where: { templateId }
        })

        const templateHdrReq = {
          templateName,
          templateCategory,
          userGroup,
          status,
          eventType,
          calendarId,
          ...commonAttrib
        }

        const templateHdrRes = await conn.TemplateHdr.update(templateHdrReq, {
          where: {
            templateId
          },
          transaction: t
        })

        const hdrReq = {
          promoName: templateName,
          status: defaultStatus.ACTIVE,
          promoType: details.promoType,
          allowedTimes: details.allowedTimes,
          allowWithOtherPromo: details.allowWithOtherPromo,
          startDate: details.promoStartDate,
          endDate: details.promoEndDate,
          ...commonAttrib
        }
        await conn.PromoHdr.update(hdrReq, {
          where: {
            templateId,
            promoId: hdrRes.promoId
          },
          transaction: t
        })

        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Template Master updated successfully',
          data: templateHdrRes
        }
      } else if (['TC_EMAIL', 'TC_SMS', 'TC_WHATSAPP'].includes(templateCategory)) {
        const templateHdrReq = {
          templateName,
          templateCategory,
          userGroup,
          status,
          eventType,
          entity,
          calendarId,
          ...commonAttrib
        }

        const templateHdrRes = await conn.TemplateHdr.update(templateHdrReq, {
          where: {
            templateId
          },
          transaction: t
        })

        const notificationTemplateReq = {
          templateType: templateCategory,
          templateName,
          subject: details.subject,
          body: details.content,
          rawContent: details.rawContent,
          dataSource: details.dataSource,
          templateStatus: status === defaultStatus.template.ACTIVE ? defaultStatus.ACTIVE : defaultStatus.IN_ACTIVE,
          templateHdrId: templateId,
          ...commonAttrib
        }

        const notificationTemplateExist = await conn.NotificationTemplate.findOne({
          where: {
            templateType: templateCategory,
            templateName,
            templateHdrId: {
              [Op.ne]: templateId
            }
          }
        })
        if (notificationTemplateExist) {
          return {
            message: 'This template category with name has already exists.',
            status: statusCodeConstants.VALIDATION_ERROR
          }
        }
        await conn.NotificationTemplate.update(notificationTemplateReq, {
          where: {
            templateHdrId: templateId
          },
          transaction: t
        })
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Template Master updated successfully',
          data: templateHdrRes
        }
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async checkRoster (details, conn, departmentId, userId, roleId) {
    try {
      const {
        calendarId,
        shiftId,
        appointmentType: appointType,
        location: appointLoc,
        fromDate,
        toDate,
        limit,
        page
      } = details
      let roster
      if (appointType === 'CUST_VISIT') {
        roster = await conn.RosterHdr.findOne({
          where: { calendarId, shiftId, appointType, appointLoc }
        })
      } else {
        console.log({ calendarId, shiftId, appointType })
        roster = await conn.RosterHdr.findOne({
          where: { calendarId, shiftId, appointType }
        })
      }
      // console.log("roster roster roster", roster);
      const offSet = page * limit
      if (roster) {
        let whereClause = {
          rosterId: roster.rosterId,
          status: defaultStatus.ACTIVE
        }
        console.log('fromDate==', fromDate)
        console.log('toDate==', toDate)
        if (fromDate && fromDate !== '' && toDate && toDate !== '') {
          let startDate = moment(fromDate)
          let endDate = moment(toDate)
          const diff = endDate.diff(startDate, 'days')
          if (diff < 0) {
            startDate = toDate
            endDate = fromDate
          } else if (diff == 0 || diff > 0) {
            startDate = fromDate
            endDate = toDate
          }
          console.log({ startDate, endDate })
          whereClause = {
            ...whereClause,
            rosterDate: {
              [Op.between]: [startDate, endDate]
            }
          }
        }
        console.log('whereClause===', whereClause)
        const rosterDetails = await conn.RosterDtl.findAndCountAll({
          include: [
            {
              model: conn.User,
              as: 'userDetails',
              attributes: ['firstName', 'lastName']
            }
          ],
          where: whereClause,
          offset: offSet,
          limit: Number(limit)
          // logging: true,
        })

        console.log(rosterDetails)
        if (rosterDetails.rows.length) {
          const groupByDates = groupBy(rosterDetails.rows, 'rosterDate')
          const dates = Object.keys(groupByDates)
          const result = {
            dates: [dates[0], dates[dates.length - 1]],
            slots: []
          }
          for (let index = 0; index < dates.length; index++) {
            const rosterList = groupByDates[dates[index]]
            // let startTime = rosterList[0]['rosterStartTime'];
            // let endTime = rosterList[rosterList.length - 1]['rosterEndTime'];
            result.slots.push({
              personCount: rosterList.filter((x) => x.userId).length,
              divId: index,
              timings: groupByDates[dates[index]].map(
                (x) =>
                  `${moment(x.rosterStartTime, 'HH:mm:ss').format(
                    'HH:mm'
                  )}-${moment(x.rosterEndTime, 'HH:mm:ss').format('HH:mm')}`
              )
            })
          }
          result.rosterDetails = rosterDetails.rows
          result.totalCount = rosterDetails.count
          return {
            status: statusCodeConstants.SUCCESS,
            message: 'Roster details found',
            data: result
          }
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Roster details not found'
      }
    } catch (err) {
      console.log(err)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async setPinnedStatus (details, conn, t) {
    try {
      console.log(details)
      const entities = {
        eRAwomq2IF: {
          name: 'TemplateHdr',
          pKey: 'templateId'
        },
        fOaauuatLv: {
          name: 'TemplateMapping',
          pKey: 'templateId'
        }
      }

      const { isPinned, entityId, entityCode } = details

      await conn[entities[entityCode].name].update(
        { isPinned },
        {
          where: {
            [entities[entityCode].pKey]: entityId
          },
          transaction: t,
          logging: true
        }

      )

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success'
      }
    } catch (err) {
      console.log(err)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error occured'
      }
    }
  }

  async getCalendarMaster (details, conn) {
    try {
      let det = await conn.CalendarMaster.findAll({
        attributes: [
          'calendarId',
          'calendarUuid',
          'calendarDescription',
          'calendarShortName'
        ],
        where: {
          status: 'AC'
        }
      })

      if (details?.all === 'true' && det && Array?.isArray(det) && det?.length > 0) {
        det = det?.map((d) => ({ code: d.calendarUuid, value: d?.calendarShortName }))
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: det
      }
    } catch (err) {
      console.log(err)
    }
  }

  async getHolidayMaster (details, conn) {
    try {
      let holidayDet
      if (details?.all === 'true') {
        holidayDet = await conn.HolidayMaster.findAndCountAll({
          include: [{
            model: conn.BusinessEntity,
            attributes: ['code', 'description'],
            as: 'holidayDayNameDesc'
          }],
          where: {
            calendarUuid: details.calendarUuid,
            holidayDate: {
              [Op.between]: [moment().startOf('year').format('YYYY-MM-DD'), moment().endOf('year').format('YYYY-MM-DD')]
            },
            status: 'AC'
          },
          order: [['holidayDate', 'ASC']]
        })
      } else {
        holidayDet = await conn.CalendarMaster.findOne({
          include: [
            {
              model: conn.HolidayMaster,
              attributes: ['holidayDate', 'holidayDescription', 'holidayType'],
              as: 'holidayDet'
            }
          ],
          where: {
            calendarUuid: details.calendarUuid,
            status: 'AC'
          }
          // logging: true
        })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: holidayDet
      }
    } catch (err) {
      console.log(err)
    }
  }

  getTimeAsMinutes (time) {
    return moment.duration({ hours: time[0], minutes: time[1] }).asMinutes()
  }

  isValidFormat (date, format) {
    return moment(date, format, true).isValid()
  }

  async calculateAppointmentSlots (details, conn) {
    const rawSlots = details.obj.slots
    const rawBreaks = details.obj.breaks

    const blockedSlots = []
    for (const breakTime of rawBreaks) {
      const splitBreak = breakTime.range.split('-')
      if (
        this.isValidFormat(
          `1996-01-01 ${splitBreak[0]}"`,
          'YYYY-MM-DD HH:mm'
        ) &&
        this.isValidFormat(`1996-01-01 ${splitBreak[1]}"`, 'YYYY-MM-DD HH:mm')
      ) {
        const breakStart = splitBreak[0].split(':')
        const breakEnd = splitBreak[1].split(':')
        const blockStartTime = this.getTimeAsMinutes(breakStart)
        const blockEndTime = this.getTimeAsMinutes(breakEnd)
        blockedSlots.push([blockStartTime, blockEndTime])
      }
    }

    const slots = []
    for (const slot of rawSlots) {
      const tempSlots = {
        personCount: slot.personCount,
        divId: slot.divId,
        timings: {}
      }
      const splitSlot = slot.range.split('-')
      const slotStart = splitSlot[0].split(':')
      const slotEnd = splitSlot[1].split(':')
      const slotStartTime = this.getTimeAsMinutes(slotStart)
      const slotEndTime = this.getTimeAsMinutes(slotEnd)
      const generatedSlots = getTimeSlots(
        blockedSlots,
        true,
        slot.duration,
        true,
        true
      )
      for (const [key, value] of Object.entries(generatedSlots)) {
        if (key >= slotStartTime && key <= slotEndTime) {
          tempSlots.timings[key] = value
        }
      }
      slots.push(tempSlots)
    }

    for (let index = 0; index < slots.length; index++) {
      const tempSlots = slots[index].timings
      const timingsArr1 = Object.values(tempSlots)
      const timingsArr2 = []
      timingsArr1.forEach((timing, index) => {
        if (timingsArr1[index + 1]) {
          timingsArr2.push(`${timing}-${timingsArr1[index + 1]}`)
        }
      })
      slots[index].timings = timingsArr2
    }

    console.log(slots)

    return {
      status: statusCodeConstants.SUCCESS,
      message: 'Success',
      data: slots
    }
  }

  async calculateAppointmentSlots_old (details, conn) {
    try {
      const slots = []
      const breaks = []
      for (const slot of details.obj.slots) {
        for (const breakT of details.obj.breaks) {
          slots.push(
            SplitWorkTime(
              slot.range.split('-')[0],
              slot.range.split('-')[1],
              breakT.range.split('-')[0],
              breakT.range.split('-')[1],
              slot.duration
            )
          )
        }
      }

      // console.log('slots are ', slots)
      const totalSlots = []
      const totalBreaks = []
      slots.forEach((e) => {
        e.slots.forEach((s) => {
          totalSlots.push(s)
        })
        e.breaks.forEach((s) => {
          totalBreaks.push(s)
        })
      })

      //   e.endTimeSlots.forEach(s => {
      //     if (!e.breaks.includes(s)) {
      //       totalEndSlots.push(s)
      //     }
      //   })
      // })
      // console.log('totalSlots==>', totalSlots.filter((item, index) => totalSlots.indexOf(item) === index))
      // console.log('totalBreaks==>', totalBreaks.filter((item, index) => totalBreaks.indexOf(item) === index))
      const result = totalSlots.filter((e) => !totalBreaks.includes(e))
      // console.log('totalEndSlots==>', totalEndSlots)

      // const result = totalStartSlots.map((item, i) => item + '-' + totalStartSlots[i+1])
      // const finalSlots = totalSlots.filter(e => !totalBreaks.includes(e))
      console.log(
        'result==>',
        result.filter((item, index) => result.indexOf(item) === index)
      )
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: result
      }
    } catch (err) {
      console.log(err)
    }
  }

  async businessDetails (payload, conn, departmentId, userId, roleId, t) {
    try {
      const { } = payload
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in saving business details'
      }
    }
  }

  async getMappedUnmappedTemplate (details, conn) {
    try {
      const whereClause = {
        status: ['AC', 'TPL_ACTIVE']
      }
      console.log('1')
      if (details.templateId) {
        whereClause.templateId = details.templateId
      }
      if (details.mapCategory) {
        whereClause.mapCategory = details.mapCategory.toUpperCase()
      }
      if (details.serviceCategory && details.serviceCategory.length > 0) {
        whereClause.serviceCategory = details.serviceCategory
      }
      if (details.serviceType && details.serviceType.length > 0) {
        whereClause.serviceType = details.serviceType
      }
      if (details.tranType && details.tranType.length > 0) {
        whereClause.tranType = details.tranType
      }
      if (details.tranCategory && details.tranCategory.length > 0) {
        whereClause.tranCategory = details.tranCategory
      }
      if (details.tranPriority && details.tranPriority.length > 0) {
        whereClause.tranPriority = details.tranPriority
      }
      console.log('2')
      const mappedTemplate = await conn.TemplateHdr.findAll({
        attributes: [
          'templateId',
          'templateCategory',
          'templateName',
          'userGroup',
          'templateNo',
          'status',
          'eventType',
          'isPinned',
          'entity'
        ],
        include: [
          {
            model: conn.TemplateMapping,
            attributes: [
              'templateMapId',
              'templateId',
              'templateMapName',
              'mapCategory',
              'tranEntity',
              'serviceCategory',
              'serviceType',
              'customerClass',
              'customerCategory',
              'tranType',
              'tranCategory',
              'tranPriority',
              'isPinned',
              'objectName',
              'objectReference'
            ],
            as: 'templateMap',
            include: [
              {
                model: conn.BusinessEntity,
                as: 'serviceCategoryDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'serviceTypeDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'customerCategoryDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'tranTypeDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'tranCategoryDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'tranPriorityDesc',
                attributes: ['code', 'description']
              },
              {
                model: conn.BusinessEntity,
                as: 'statusDesc',
                attributes: ['code', 'description']
              }
            ],
            where: whereClause,
            required: true
          },
          {
            model: conn.BusinessEntity,
            as: 'statusDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'categoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'userGroupDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'eventTypeDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.ProductBundleHdr,
            as: 'productBundleHdr',
            include: [
              {
                model: conn.ProductBundleDtl,
                as: 'productBundleDtl'
              }
            ]
          }
        ],
        where: { status: ['AC', 'TPL_ACTIVE'] }
        // logging: true
      })
      console.log('3')
      const productIds = []

      // mappedTemplate.forEach((template) => {
      //   template?.productBundleHdr?.forEach((productBundle) => {
      //     productBundle?.productBundleDtl?.forEach((product) => {
      //       productIds.push(product.productId);
      //     });
      //   });
      // });

      mappedTemplate.forEach((template) => {
        template?.productBundleHdr?.productBundleDtl?.forEach((product) => {
          productIds.push(product.productId)
        })
      })
      console.log('4')
      // console.log('productIds====', productIds)
      const productsList = await conn.Product.findAll({
        where: {
          productId: productIds
        },
        attributes: ['productId', 'productName', 'productSubType', 'serviceType', 'productType', 'status'],
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
        order: [['product_id', 'desc']],
        logging: false
      })
      console.log('5')
      // console.log('productsList', JSON.stringify(productsList))
      const templateHdrList = mappedTemplate.map((template) => {
        const productBundleHdr = template.productBundleHdr
        const productDtl = []

        // console.log('productBundleHdr ', productBundleHdr)
        if (productBundleHdr) {
          productBundleHdr.productBundleDtl.forEach((detail) => {
            const filteredProducts = productsList
              .filter((prod) => Number(prod.productId) === Number(detail.productId))
              .map((prod) => ({
                productId: prod.productId,
                productName: prod.productName,
                productSubType: prod.productSubType,
                serviceType: prod.serviceType,
                productType: prod.productType,
                status: prod.status,
                serviceTypeDescription: prod.serviceTypeDescription,
                productTypeDescription: prod.productTypeDescription,
                productSubTypeDesc: prod.productSubTypeDesc,
                productChargesList: prod.productChargesList,
                useExistingCharge: detail.useExistingCharge,
                useExistingTerm: detail.useExistingTerm,
                useNewCharge: !detail.useExistingCharge,
                useNewTerm: !detail.useExistingTerm
              }))

            // console.log('filteredProducts============================', filteredProducts)
            productDtl.push(...filteredProducts)
          })
        }

        return {
          templateId: template.templateId,
          templateCategory: template.templateCategory,
          templateName: template.templateName,
          userGroup: template.userGroup,
          templateNo: template.templateNo,
          templateMap: template.templateMap,
          status: template.status,
          eventType: template.eventType,
          isPinned: template.isPinned,
          mapCategoryDesc: template.categoryDesc,
          confirmedTemplateList: productDtl
        }
      })
      // console.log(JSON.stringify(templateHdrList))
      // if(termsHdr && termsHdr.length > 0){
      //   termsHdr.map((term) => term.termDtl.map((detail) => productDtl.push(detail.productDtl)));
      // }

      // delete template['productBundleHdr']
      // delete template['termsHdr']
      console.log('6')
      const mappedTemplateIds = []
      for (const map of mappedTemplate) {
        mappedTemplateIds.push(map.templateId)
      }
      const unMappedTemplate = await conn.TemplateHdr.findAll({
        attributes: [
          'templateId',
          'templateCategory',
          'templateName',
          'userGroup',
          'templateNo',
          'status',
          'eventType',
          'isPinned',
          'entity'
        ],
        include: [
          {
            model: conn.ProductBundleHdr,
            as: 'productBundleHdr',
            include: [
              {
                model: conn.ProductBundleDtl,
                as: 'productBundleDtl'
              }
            ]
          },
          {
            model: conn.PromoHdr,
            as: 'promoHdr',
            include: [
              {
                model: conn.Charge,
                as: 'chargeDet',
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
          status: ['AC', 'TPL_ACTIVE'],
          templateId: {
            [Op.notIn]: mappedTemplateIds
          }
        }
        // logging: true
      })
      console.log('7')
      // console.log(unMappedTemplate)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: { mappedTemplate: templateHdrList, unMappedTemplate }
      }
    } catch (err) {
      console.log(err)
    }
  }

  async getTemplateDetails (details, conn) {
    try {
      let whereClause = {
        status: ['AC', 'TPL_ACTIVE', 'IN', 'TPL_INACTIVE']
      }

      if (details.templateNo) {
        whereClause.templateNo = details.templateNo
      }

      if (details.searchParam) {
        whereClause = {
          ...whereClause,
          [Op.or]: {
            templateName: { [Op.iLike]: `%${details.searchParam}%` },
            templateNo: { [Op.iLike]: `%${details.searchParam}%` }
          }
        }
      }

      if (details.templateNo || details.searchParam) {
        return await this.getTemplateDetailsByTemplateNo(details, conn)
      }

      const templateDetails = (await conn.TemplateHdr.findAll({
        include: [
          {
            attributes: ['code', 'description'],
            model: conn.BusinessEntity,
            as: 'statusDesc',
            required: false
          },
          {
            model: conn.AppointmentHdr,
            attributes: [
              'appointId',
              'appointName',
              'appointType',
              'location',
              'userGroup',
              'notifyId',
              'status'
            ],
            as: 'appointmentHdr'
          },
          {
            model: conn.ProductBundleHdr,
            as: 'productBundleHdr'
          },
          {
            model: conn.TermsConditionsHdr,
            as: 'termsHdr'
          },
          {
            model: conn.PromoHdr,
            as: 'promoHdr'
          },
          {
            model: conn.NotificationTemplate,
            as: 'notificationTemplate'
          },
          {
            model: conn.BusinessEntity,
            as: 'categoryDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'userGroupDesc',
            attributes: ['code', 'description']
          },
          {
            model: conn.BusinessEntity,
            as: 'eventTypeDesc',
            attributes: ['code', 'description']
          }
        ],
        where: whereClause
      })).map((template) => template.get({ plain: true }))

      const appointIds = []
      for (let index = 0; index < templateDetails.length; index++) {
        const templateDetail = templateDetails[index]
        if (templateDetail?.appointmentHdr[0]?.appointId) {
          appointIds.push(templateDetail?.appointmentHdr[0]?.appointId)
        }
      }

      const appointDetails = (await conn.AppointmentDtl.findAll({
        attributes: [
          'appointId',
          [conn.sequelize.fn('COUNT', conn.sequelize.col('appoint_dtl_id')), 'appointDetailCount']
        ],
        where: { appointId: appointIds },
        group: ['appointId']
      })).map((template) => template.get({ plain: true }))

      for (let index = 0; index < appointDetails.length; index++) {
        const appointDetail = appointDetails[index]
        const tempIndex = templateDetails.findIndex(x => x?.appointmentHdr[0]?.appointId == appointDetail.appointId)
        templateDetails[tempIndex].appointDetailCount = appointDetail.appointDetailCount
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: templateDetails
      }
    } catch (err) {
      console.log(err)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching template details'
      }
    }
  }

  async getTemplateDetailsByTemplateNo (details, conn) {
    try {
      let whereClause = {
        status: ['AC', 'TPL_ACTIVE', 'IN', 'TPL_INACTIVE']
      }

      if (details.templateNo) {
        whereClause.templateNo = details.templateNo
      }
      if (details.searchParam) {
        whereClause = {
          ...whereClause,
          [Op.or]: {
            templateName: { [Op.iLike]: `%${details.searchParam}%` },
            templateNo: { [Op.iLike]: `%${details.searchParam}%` }
          }
        }
      }
      console.log(1)
      const templateDetail = await conn.TemplateHdr.findOne({ where: whereClause })
      let startDate = ''
      let endDate = ''
      if (templateDetail?.templateCategory == 'TC_APPOINT') {
        const AppointmentHdr = await conn.AppointmentHdr.findOne({ where: { templateId: templateDetail.templateId } })
        if (AppointmentHdr) {
          const startAppointmentDtl = await conn.AppointmentDtl.findOne({ where: { appointId: AppointmentHdr.appointId }, order: [['appointDate', 'ASC']], limit: 1 })
          const endAppointmentDtl = await conn.AppointmentDtl.findOne({ where: { appointId: AppointmentHdr.appointId }, order: [['appointDate', 'DESC']], limit: 1 })
          startDate = startAppointmentDtl?.appointDate
          endDate = endAppointmentDtl?.appointDate
        }
      }
      console.log(2)
      // console.log({ startDate, endDate }, "from template details by template no");

      const tempBasedincludes = {
        TC_APPOINT: {
          model: conn.AppointmentHdr,
          attributes: [
            'appointId',
            'appointName',
            'appointType',
            'location',
            'userGroup',
            'notifyId',
            'status'
          ],
          as: 'appointmentHdr',
          include: [
            {
              model: conn.AppointmentDtl,
              attributes: [
                'appointDtlId',
                'appointMode',
                'calenderId',
                'shiftId',
                'appointDate',
                'appointInterval',
                'appointAgentsAvailability',
                'appointStartTime',
                'appointEndTime',
                'status',
                'divId'
              ],
              as: 'appointmentDet',
              limit: 10,
              offset: 0,
              include: [
                {
                  model: conn.BusinessEntity,
                  as: 'appointModeDesc',
                  attributes: ['code', 'description']
                },
                {
                  model: conn.CalendarMaster,
                  as: 'calendarDet'
                },
                {
                  model: conn.ShiftMst,
                  as: 'shiftDet'
                }
              ]
            },
            {
              model: conn.BusinessEntity,
              as: 'appointTypeDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.AppointmentTxn,
              as: 'appointmentTxnDet'
            }
          ]
        },
        TC_NOTIFY: {
          model: conn.NotificationHdr,
          as: 'notificationHdr',
          attributes: ['notifyId', 'notifyName', 'notifyType', 'status'],
          include: [
            {
              model: conn.NotificationDtl,
              as: 'notificationDtl',
              attributes: [
                'notifyDtlId',
                'subject',
                'notifyContent',
                'status'
              ]
            }
          ]
        },
        TC_PRODUCTBUNDLE: {
          model: conn.ProductBundleHdr,
          as: 'productBundleHdr',
          include: [
            {
              model: conn.ProductBundleDtl,
              as: 'productBundleDtl',
              include: [
                {
                  model: conn.Product,
                  as: 'productDtl',
                  attributes: ['productName', 'productId', 'productSubType', 'serviceType', 'productType']
                }
              ]
            }
          ]
        },
        TC_TERMSCONDITION: {
          model: conn.TermsConditionsHdr,
          as: 'termsHdr'
        },
        TC_PROMOCODE: {
          model: conn.PromoHdr,
          as: 'promoHdr'
        },
        TC_EMAIL: {
          model: conn.NotificationTemplate,
          as: 'notificationTemplate',
          where: {
            templateHdrId: templateDetail.templateId
          }
        },
        TC_SMS: {
          model: conn.NotificationTemplate,
          as: 'notificationTemplate',
          where: {
            templateHdrId: templateDetail.templateId
          }
        },
        TC_WHATSAPP: {
          model: conn.NotificationTemplate,
          as: 'notificationTemplate',
          where: {
            templateHdrId: templateDetail.templateId
          }
        }
      }

      const includes = [
        {
          attributes: ['code', 'description'],
          model: conn.BusinessEntity,
          as: 'statusDesc',
          required: false
        },
        {
          model: conn.BusinessEntity,
          as: 'categoryDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'userGroupDesc',
          attributes: ['code', 'description']
        },
        {
          model: conn.BusinessEntity,
          as: 'eventTypeDesc',
          attributes: ['code', 'description']
        }
      ]

      if (tempBasedincludes[templateDetail?.templateCategory]) {
        includes.push(tempBasedincludes[templateDetail?.templateCategory])
      }

      if (details?.from == 'mapScreen') {
        includes.push({
          model: conn.TemplateMapping,
          as: 'templateMap',
          attributes: [
            'templateMapId',
            'templateId',
            'templateMapName',
            'mapCategory',
            'tranEntity',
            'serviceCategory',
            'serviceType',
            'customerClass',
            'customerCategory',
            'tranType',
            'tranCategory',
            'tranPriority',
            'isPinned',
            'objectName',
            'objectReference'
          ],
          include: [
            {
              model: conn.BusinessEntity,
              as: 'serviceCategoryDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'serviceTypeDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'customerCategoryDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'tranTypeDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'tranCategoryDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'tranPriorityDesc',
              attributes: ['code', 'description']
            },
            {
              model: conn.BusinessEntity,
              as: 'statusDesc',
              attributes: ['code', 'description']
            }
          ]
        })
      }

      const templateDetails = (await conn.TemplateHdr.findAll({
        include: includes,
        where: whereClause
        // logging: true,
      })).map((template) => template.get({ plain: true }))
      console.log(3)
      if (templateDetails?.length) {
        templateDetails[0].startDate = startDate
        templateDetails[0].endDate = endDate
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: templateDetails
      }
    } catch (err) {
      console.log(err)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Error in fetching template details'
      }
    }
  }

  async getInteractionTemplateDetails (details, conn) {
    try {
      if (!details?.roleId) details.roleId = systemRoleId
      console.log('details---------->', details?.mapCategory?.toUpperCase(),
        details?.serviceType,
        details?.customerCategory,
        details?.tranType,
        details?.tranCategory,
        details?.tranPriority)
      const mappedTemplate = await conn.TemplateHdr.findOne({
        attributes: [
          'templateId',
          'templateCategory',
          'templateName',
          'userGroup',
          'templateNo',
          'entity'
        ],
        include: [
          {
            model: conn.TemplateMapping,
            attributes: [
              'templateMapId',
              'templateId',
              'templateMapName',
              'mapCategory',
              'tranEntity',
              'serviceCategory',
              'serviceType',
              'customerClass',
              'tranType',
              'tranPriority'
            ],
            as: 'templateMap',
            where: {
              status: ['AC', 'TPL_ACTIVE'],
              mapCategory: details?.mapCategory?.toUpperCase(),
              serviceCategory: details?.serviceCategory,
              serviceType: details?.serviceType,
              customerCategory: details?.customerCategory || defaultCode.CUSTOMER_CATEGORY,
              tranType: details?.tranType,
              tranCategory: details?.tranCategory,
              tranPriority: details?.tranPriority
            }
          },
          {
            model: conn.AppointmentHdr,
            attributes: [
              'appointId',
              'appointName',
              'appointType',
              'userGroup',
              'notifyId',
              'rosterId',
              'location',
              'status'
            ],
            as: 'appointmentHdr',
            include: [
              {
                model: conn.AppointmentDtl,
                attributes: [
                  'appointDtlId',
                  'appointMode',
                  'calenderId',
                  'shiftId',
                  'appointDate',
                  'appointInterval',
                  'appointAgentsAvailability',
                  'appointStartTime',
                  'appointEndTime'
                ],
                as: 'appointmentDet'
              }
            ]
          }
        ],
        where: {
          status: ['AC', 'TPL_ACTIVE'],
          templateCategory: 'TC_APPOINT',
          eventType: 'ET_CREATION'
        },
        logging: false
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: { mappedTemplate }
      }
    } catch (err) {
      console.log(err)
    }
  }

  async getAvailableAppointment (details, conn) {
    try {
      if (!details?.roleId) details.roleId = systemRoleId

      const appointmentWhere = {
        appointType: details?.appointmentType,
        status: 'AS_SCHED'
      }

      const appointDtlWhere = {
        appointMode: details?.appointmentType,
        status: 'AS_SCHED'
      }

      if (details?.appointmentDate) {
        appointDtlWhere.appointDate = details?.appointmentDate
      }

      if (details?.appointmentType === 'CUST_VISIT') {
        appointmentWhere.location = details?.location
      }

      // console.log('appointDtlWhere------>', appointDtlWhere)
      console.log('Where------>', {
        status: ['AC', 'TPL_ACTIVE'],
        mapCategory: details?.mapCategory?.toUpperCase(),
        serviceCategory: details?.serviceCategory,
        serviceType: details?.serviceType,
        customerCategory: details?.customerCategory || defaultCode.CUSTOMER_CATEGORY,
        tranType: details?.tranType,
        tranCategory: details?.tranCategory,
        tranPriority: details?.tranPriority
      })
      // console.log("1");
      const mappedTemplate = await conn.TemplateHdr.findOne({
        attributes: [
          'templateId',
          'templateCategory',
          'templateName',
          'userGroup',
          'templateNo',
          'entity'
        ],
        include: [
          {
            model: conn.TemplateMapping,
            attributes: [
              'templateMapId',
              'templateId',
              'templateMapName',
              'mapCategory',
              'tranEntity',
              'serviceCategory',
              'serviceType',
              'customerClass',
              'tranType',
              'tranPriority'
            ],
            as: 'templateMap',
            where: {
              status: ['AC', 'TPL_ACTIVE'],
              mapCategory: details?.mapCategory?.toUpperCase(),
              serviceCategory: details?.serviceCategory,
              serviceType: details?.serviceType,
              customerCategory: details?.customerCategory || defaultCode.CUSTOMER_CATEGORY,
              tranType: details?.tranType,
              tranCategory: details?.tranCategory,
              tranPriority: details?.tranPriority
            }
          },
          {
            model: conn.AppointmentHdr,
            attributes: [
              'appointId',
              'appointName',
              'appointType',
              'userGroup',
              'notifyId',
              'rosterId',
              'location'
            ],
            as: 'appointmentHdr',
            include: [
              {
                model: conn.AppointmentDtl,
                attributes: [
                  'appointDtlId',
                  'appointMode',
                  'calenderId',
                  'shiftId',
                  'appointDate',
                  'appointInterval',
                  'appointAgentsAvailability',
                  'appointStartTime',
                  'appointEndTime',
                  'userId'
                ],
                as: 'appointmentDet',
                where: appointDtlWhere
              }
            ]
          }
        ],
        where: {
          status: ['AC', 'TPL_ACTIVE'],
          templateCategory: 'TC_APPOINT',
          eventType: 'ET_CREATION'
        }
        // logging: true,
      })
      // console.log("2");
      const skills = await conn.SkillMaster.findAll({
        include: [
          {
            attributes: ['userId'],
            model: conn.UserSkillMap,
            as: 'userSkill'
          }
        ],
        where: {
          status: ['AC'],
          mapCategory: (details.mapCategory?.toUpperCase() === 'TMC_INTERACTION' || details.mapCategory?.toUpperCase() === 'TMC_ORDER') ? details.mapCategory?.toUpperCase()?.split('_')[1] : details.mapCategory?.toUpperCase(),
          serviceCategory: details.serviceCategory,
          serviceType: details.serviceType,
          tranType: details.tranType,
          tranCategory: details.tranCategory
        }
        // raw: true,
      })
      // console.log("3");
      // console.log("skills========>", skills);
      // console.log('mappedTemplate ==================>', mappedTemplate)
      // console.log('mappedTemplate.appointmentHdr[0]?.rosterId', mappedTemplate?.appointmentHdr[0]?.rosterId)
      const events = []
      const currentAppointments = []
      if (mappedTemplate) {
        const appointmentDet = mappedTemplate?.appointmentHdr[0]?.appointmentDet
        if (appointmentDet && appointmentDet.length > 0) {
          // let rosterData
          // if (mappedTemplate?.appointmentHdr[0]?.rosterId) {
          //   const rosterWhere = {
          //     rosterId: mappedTemplate.appointmentHdr[0]?.rosterId,
          //     appointType: details?.appointmentType,
          //     status: 'AC'
          //   }
          //   if (details?.appointmentType === 'CUST_VISIT') {
          //     rosterWhere.appointLoc = details?.location
          //   }
          //   console.log('rosterWhere', rosterWhere)
          //   rosterData = await conn.RosterHdr.findOne({
          //     where: rosterWhere,
          //     raw: true
          //   })
          // }
          // console.log('rosterData',rosterData)
          // console.log('mappedTemplate.appointmentHdr[0]?.appointmentDet',mappedTemplate.appointmentHdr[0]?.appointmentDet.length)
          // console.log("4");
          // console.log("appointmentDet.length", appointmentDet.length);

          const allAppointmentTxnDetails = await conn.AppointmentTxn.findAll({
            where: {
              appointDtlId: appointmentDet.map(x => x.appointDtlId)
            },
            raw: true
          })

          for (const appointment of appointmentDet) {
            // console.log("appointment.appointDtlId", appointment.appointDtlId);
            const appointmentTxnDetails = allAppointmentTxnDetails.filter(x => x.appointDtlId == appointment.appointDtlId)
            // console.log(appointmentTxnDetails.length);
            // console.log("5");
            // console.log('appointmentTxnDetails---------->', appointmentTxnDetails)
            const bookedAppointment = appointmentTxnDetails
              .map((x) => x.appointTxnId)
              .filter((y) => y)
            // console.log('bookedAppointment---------->', bookedAppointment)
            const userIds = appointmentTxnDetails
              .map((x) => x.appointAgentId)
              .filter((y) => y)
            // console.log('userIds-------->', userIds)
            let colorCode = 'POSITIVE'
            let title = 'Appointment Available'
            // console.log('appointment?.appointDate',appointment?.appointDate)
            // console.log('appointment?.appointStartTime',appointment?.appointStartTime)
            // console.log('appointment?.appointEndTime',appointment?.appointEndTime)
            // let rosterDetails = []
            // if (rosterData) {
            //   rosterDetails = await conn.RosterDtl.findAll({
            //     where: {
            //       rosterId: mappedTemplate.appointmentHdr[0]?.rosterId,
            //       status: 'AC',
            //       rosterDate: appointment?.appointDate,
            //       rosterStartTime: appointment?.appointStartTime,
            //       rosterEndTime: appointment?.appointEndTime
            //     },
            //     raw: true
            //   })
            // } else {
            //   const rosterWhere = {
            //     appointType: details?.appointmentType,
            //     status: 'AC'
            //   }
            //   if (details?.appointmentType === 'CUST_VISIT') {
            //     rosterWhere.appointLoc = details?.location
            //   }
            //   // console.log('rosterWhere',rosterWhere)
            //   rosterData = await conn.RosterHdr.findOne({
            //     include: [
            //       {
            //         model: conn.RosterDtl,
            //         as: 'rosterDet',
            //         where: {
            //           status: 'AC',
            //           rosterDate: appointment?.appointDate,
            //           rosterStartTime: appointment?.appointStartTime,
            //           rosterEndTime: appointment?.appointEndTime
            //         }
            //       }
            //     ],
            //     where: rosterWhere
            //   })
            //   rosterDetails = rosterData?.dataValues?.rosterDtl || []
            // }
            // console.log('rosterDetails',rosterDetails.length)
            // console.log("6");
            let userDetails
            let availableUsers = 0
            // console.log('appooint',appointment?.appointDtlId)
            // console.log("appointmentDet", appointmentDet);
            const userList = appointmentDet.filter(
              (y) => !userIds.includes(y.userId)
            )
            // console.log("7");
            // console.log('userList------->', userList)
            // console.log("filtered userList", userList);
            if (userList.length > 0) {
              const users = [...new Set(userList.map((x) => x.userId))]
              // console.log('users-------->', users)
              const skilledUsers = []
              skills.filter((s) => {
                for (const us of s.userSkill) {
                  // console.log("us===", us);
                  if (users.includes(us.dataValues.userId)) {
                    skilledUsers.push(us.dataValues.userId)
                  }
                }
              })
              // console.log("skilledUsers--------->", skilledUsers);
              const whereClause = {
                userId: skilledUsers
              }
              const userInfo = await conn.User.findAll({
                where: {
                  userId: skilledUsers
                },
                raw: true
              })
              // console.log("userInfo--------->", userInfo);
              if (details?.appointmentType === 'CUST_VISIT') {
                userDetails = userInfo.find((x) => x.loc === details?.location)
                availableUsers = userInfo.filter(
                  (x) => x.loc === details?.location
                ).length
              }
              // else if (details?.appointmentType === "BUS_VISIT") {
              //   const addressIds = [
              //     ...new Set(userInfo.map((x) => x?.addressId)),
              //   ];
              //   // console.log("addressIds", addressIds);
              //   // console.log(details?.address);
              //   const addressInfo = await conn.Address.findAll({
              //     where: {
              //       addressId: addressIds,
              //       district: details?.address.district,
              //       postcode: details?.address.postcode,
              //     },
              //     raw: true,
              //   });
              //   // console.log("addressInfo", addressInfo);
              //   if (addressInfo.length > 0) {
              //     // console.log('Number(addressInfo[0]?.addressId)',Number(addressInfo[0]?.addressId))
              //     userDetails = userInfo.find(
              //       (x) =>
              //         Number(x?.addressId) === Number(addressInfo[0]?.addressId)
              //     );
              //     const availableAddressIds = addressInfo.map(
              //       (x) => x.addressId
              //     );
              //     availableUsers = userInfo.filter((x) =>
              //       availableAddressIds.includes(x.addressId)
              //     ).length;
              //   }
              // }
              else {
                userDetails = userList[0]
              }
            }
            // console.log("8");
            // console.log("bookedAppointment.length", bookedAppointment.length);
            // bookedAppointment.length < Number(appointment.appointAgentsAvailability) &&
            // console.log('userDetails--------->', userDetails);
            // console.log('availableUsers--------->', availableUsers);
            if (userDetails) {
              if (bookedAppointment.length > appointmentDet.length / 2) {
                colorCode = 'BELOW_NEUTRAL'
                title = 'Few Appointment Left'
              }
              const startTime = moment(
                new Date(
                  appointment.appointDate + ' ' + appointment.appointStartTime
                )
              ).format('hh:mm A')
              const endTime = moment(
                new Date(
                  appointment.appointDate + ' ' + appointment.appointEndTime
                )
              ).format('hh:mm A')
              const transformValue = this.eventObject({
                title,
                start:
                  appointment.appointDate + ' ' + appointment.appointStartTime,
                end: appointment.appointDate + ' ' + appointment.appointEndTime,
                eventCat: colorCode
              })
              console.log(
                'compare users ids for appointment ',
                userDetails?.userId,
                appointment.userId
              )
              if (userDetails?.userId === appointment.userId) {
                const obj = {
                  ...transformValue,
                  appointDtlId: appointment.appointDtlId,
                  slotName: startTime + ' - ' + endTime,
                  appointUserId: userDetails?.userId,
                  availableUsers,
                  appointDate: appointment.appointDate,
                  appointStartTime: appointment.appointStartTime,
                  appointEndTime: appointment.appointEndTime
                }
                currentAppointments.push(obj)

                const obj2 = this.eventObject({
                  title,
                  start:
                    appointment.appointDate +
                    ' ' +
                    appointment.appointStartTime,
                  end:
                    appointment.appointDate + ' ' + appointment.appointEndTime,
                  eventCat: colorCode
                })
                events.push(obj2)
              }
              // console.log("9");
            } else {
              // colorCode = "NEGATIVE";
              // title = "Not Available";
              // const obj = this.eventObject({
              //   title,
              //   start:
              //     appointment.appointDate + " " + appointment.appointStartTime,
              //   end: appointment.appointDate + " " + appointment.appointEndTime,
              //   eventCat: colorCode,
              // });
              // events.push(obj);
            }
          }
          // console.log("10");
        }
      }

      console.log('6')
      console.log('events', events)
      console.log('events', removeDuplicates(events))

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: {
          events: removeDuplicates(events),
          currentAppointments
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  async getAvailableAppointmentWebSelfCare (details, conn) {
    try {
      if (!details?.roleId) details.roleId = systemRoleId

      const appointmentWhere = {
        appointType: details?.appointmentType,
        status: 'AS_SCHED'
      }

      const appointDtlWhere = {
        appointMode: details?.appointmentType,
        status: 'AS_SCHED'
      }

      if (details?.appointmentDate) {
        appointDtlWhere.appointDate = details?.appointmentDate
      }

      if (details?.appointmentType === 'CUST_VISIT') {
        appointmentWhere.location = details?.location
      }

      console.log('Where------>', {
        status: ['AC', 'TPL_ACTIVE'],
        mapCategory: details?.mapCategory?.toUpperCase(),
        serviceCategory: details?.serviceCategory,
        serviceType: details?.serviceType,
        customerCategory: details?.customerCategory || defaultCode.CUSTOMER_CATEGORY,
        tranType: details?.tranType,
        tranCategory: details?.tranCategory,
        tranPriority: details?.tranPriority
      })
      const mappedTemplate = await conn.TemplateHdr.findOne({
        attributes: [
          'templateId',
          'templateCategory',
          'templateName',
          'userGroup',
          'templateNo',
          'entity'
        ],
        include: [
          {
            model: conn.TemplateMapping,
            attributes: [
              'templateMapId',
              'templateId',
              'templateMapName',
              'mapCategory',
              'tranEntity',
              'serviceCategory',
              'serviceType',
              'customerClass',
              'tranType',
              'tranPriority'
            ],
            as: 'templateMap',
            where: {
              status: ['AC', 'TPL_ACTIVE'],
              mapCategory: details?.mapCategory?.toUpperCase(),
              serviceCategory: details?.serviceCategory,
              serviceType: details?.serviceType,
              customerCategory: details?.customerCategory || defaultCode.CUSTOMER_CATEGORY,
              tranType: details?.tranType,
              tranCategory: details?.tranCategory,
              tranPriority: details?.tranPriority
            }
          },
          {
            model: conn.AppointmentHdr,
            attributes: [
              'appointId',
              'appointName',
              'appointType',
              'userGroup',
              'notifyId',
              'rosterId',
              'location'
            ],
            as: 'appointmentHdr',
            include: [
              {
                model: conn.AppointmentDtl,
                attributes: [
                  'appointDtlId',
                  'appointMode',
                  'calenderId',
                  'shiftId',
                  'appointDate',
                  'appointInterval',
                  'appointAgentsAvailability',
                  'appointStartTime',
                  'appointEndTime',
                  'userId'
                ],
                as: 'appointmentDet',
                where: appointDtlWhere
              }
            ]
          }
        ],
        where: {
          status: ['AC', 'TPL_ACTIVE'],
          templateCategory: 'TC_APPOINT',
          eventType: 'ET_CREATION'
        }
        // logging: true,
      })
      // console.log("2");
      const skills = await conn.SkillMaster.findAll({
        include: [
          {
            attributes: ['userId'],
            model: conn.UserSkillMap,
            as: 'userSkill'
          }
        ],
        where: {
          status: ['AC'],
          mapCategory: (details.mapCategory?.toUpperCase() === 'TMC_INTERACTION' || details.mapCategory?.toUpperCase() === 'TMC_ORDER') ? details.mapCategory?.toUpperCase()?.split('_')[1] : details.mapCategory?.toUpperCase(),
          serviceCategory: details.serviceCategory,
          serviceType: details.serviceType,
          tranType: details.tranType,
          tranCategory: details.tranCategory
        }
        // raw: true,
      })

      const events = []
      const currentAppointments = []
      if (mappedTemplate) {
        const appointmentDet = mappedTemplate?.appointmentHdr[0]?.appointmentDet
        if (appointmentDet && appointmentDet.length > 0) {
          const allAppointmentTxnDetails = await conn.AppointmentTxn.findAll({
            where: {
              appointDtlId: appointmentDet.map(x => x.appointDtlId)
            },
            raw: true
          })

          for (const appointment of appointmentDet) {
            // console.log("appointment.appointDtlId", appointment.appointDtlId);
            const appointmentTxnDetails = allAppointmentTxnDetails.filter(x => x.appointDtlId == appointment.appointDtlId)
            // console.log(appointmentTxnDetails.length);
            // console.log("5");
            // console.log('appointmentTxnDetails---------->', appointmentTxnDetails)
            const bookedAppointment = appointmentTxnDetails
              .map((x) => x.appointTxnId)
              .filter((y) => y)
            // console.log('bookedAppointment---------->', bookedAppointment)
            const userIds = appointmentTxnDetails
              .map((x) => x.appointAgentId)
              .filter((y) => y)
            // console.log('userIds-------->', userIds)
            let colorCode = 'POSITIVE'
            let title = 'Appointment Available'
            let userDetails
            let availableUsers = 0
            const userList = appointmentDet.filter(
              (y) => !userIds.includes(y.userId)
            )
            if (userList.length > 0) {
              const users = [...new Set(userList.map((x) => x.userId))]
              // console.log('users-------->', users)
              const skilledUsers = []
              skills.filter((s) => {
                for (const us of s.userSkill) {
                  // console.log("us===", us);
                  if (users.includes(us.dataValues.userId)) {
                    skilledUsers.push(us.dataValues.userId)
                  }
                }
              })
              const whereClause = {
                userId: skilledUsers
              }
              const userInfo = await conn.User.findAll({
                where: {
                  userId: skilledUsers
                },
                raw: true
              })
              // console.log("userInfo--------->", userInfo);
              if (details?.appointmentType === 'CUST_VISIT') {
                userDetails = userInfo.find((x) => x.loc === details?.location)
                availableUsers = userInfo.filter(
                  (x) => x.loc === details?.location
                ).length
              } else {
                userDetails = userList[0]
              }
            }

            const startTime = moment(
              new Date(
                appointment.appointDate + ' ' + appointment.appointStartTime
              )
            ).format('hh:mm A')
            const endTime = moment(
              new Date(
                appointment.appointDate + ' ' + appointment.appointEndTime
              )
            ).format('hh:mm A')

            if (userDetails) {
              if (bookedAppointment.length > appointmentDet.length / 2) {
                colorCode = 'BELOW_NEUTRAL'
                title = 'Few Appointment Left'
              }

              const transformValue = this.eventObjectSelfCare({
                appointDtlId: appointment?.appointDtlId,
                slotName: startTime + ' - ' + endTime,
                appointUserId: userDetails?.userId,
                availableUsers,
                appointDate: appointment?.appointDate,
                appointStartTime: appointment?.appointStartTime,
                appointEndTime: appointment?.appointEndTime,
                title,
                start:
                  appointment.appointDate + ' ' + appointment.appointStartTime,
                end: appointment.appointDate + ' ' + appointment.appointEndTime,
                eventCat: colorCode
              })
              console.log(
                'compare users ids for appointment ',
                userDetails?.userId,
                appointment.userId
              )
              if (userDetails?.userId === appointment.userId) {
                const obj = {
                  ...transformValue,
                  appointDtlId: appointment.appointDtlId,
                  slotName: startTime + ' - ' + endTime,
                  appointUserId: userDetails?.userId,
                  availableUsers,
                  appointDate: appointment.appointDate,
                  appointStartTime: appointment.appointStartTime,
                  appointEndTime: appointment.appointEndTime
                }
                currentAppointments.push(obj)

                const obj2 = this.eventObjectSelfCare({
                  appointDtlId: appointment?.appointDtlId,
                  slotName: startTime + ' - ' + endTime,
                  appointUserId: userDetails?.userId,
                  availableUsers,
                  appointDate: appointment?.appointDate,
                  appointStartTime: appointment?.appointStartTime,
                  appointEndTime: appointment?.appointEndTime,
                  title,
                  start:
                    appointment.appointDate +
                    ' ' +
                    appointment.appointStartTime,
                  end:
                    appointment.appointDate + ' ' + appointment.appointEndTime,
                  eventCat: colorCode
                })
                events.push(obj2)
              }
            } else {
              colorCode = 'NEGATIVE'
              title = 'Booked - Unavailable'
              const obj = this.eventObjectSelfCare({
                appointDtlId: appointment.appointDtlId,
                slotName: startTime + ' - ' + endTime,
                appointUserId: userDetails?.userId,
                availableUsers,
                appointDate: appointment.appointDate,
                appointStartTime: appointment.appointStartTime,
                appointEndTime: appointment.appointEndTime,
                title,
                start:
                  appointment.appointDate + ' ' + appointment.appointStartTime,
                end: appointment.appointDate + ' ' + appointment.appointEndTime,
                eventCat: colorCode
              })
              events.push(obj)
            }
          }
        }
      }

      console.log('events', removeDuplicates(events))

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: {
          events: removeDuplicates(events),
          currentAppointments
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  eventObjectSelfCare ({
    appointDtlId,
    slotName,
    appointUserId,
    availableUsers,
    appointDate,
    appointStartTime,
    appointEndTime,
    title,
    start,
    end,
    description,
    eventCat,
    extendedProps = {}
  }) {
    const eventType = {
      POSITIVE: {
        backgroundColor: '#14A44D',
        borderColor: '#14A44D',
        textColor: '#FBFBFB'
      },
      BELOW_POSITIVE: {
        backgroundColor: '#3B71CA',
        borderColor: '#3B71CA',
        textColor: '#FBFBFB'
      },
      NEUTRAL: {
        backgroundColor: '#9FA6B2',
        borderColor: '#9FA6B2',
        textColor: '#FBFBFB'
      },
      BELOW_NEUTRAL: {
        backgroundColor: '#E4A11B',
        borderColor: '#E4A11B',
        textColor: '#FBFBFB'
      },
      NEGATIVE: {
        backgroundColor: '#DC4C64',
        borderColor: '#DC4C64',
        textColor: '#FBFBFB'
      }
    }
    return {
      // id: uuidv4(),
      appointDtlId,
      slotName,
      appointUserId,
      availableUsers,
      appointDate,
      appointStartTime,
      appointEndTime,
      title,
      start,
      end,
      extendedProps,
      description,
      ...eventType[eventCat]
    }
  }

  eventObject ({
    title,
    start,
    end,
    description,
    eventCat,
    extendedProps = {}
  }) {
    const eventType = {
      POSITIVE: {
        backgroundColor: '#14A44D',
        borderColor: '#14A44D',
        textColor: '#FBFBFB'
      },
      BELOW_POSITIVE: {
        backgroundColor: '#3B71CA',
        borderColor: '#3B71CA',
        textColor: '#FBFBFB'
      },
      NEUTRAL: {
        backgroundColor: '#9FA6B2',
        borderColor: '#9FA6B2',
        textColor: '#FBFBFB'
      },
      BELOW_NEUTRAL: {
        backgroundColor: '#E4A11B',
        borderColor: '#E4A11B',
        textColor: '#FBFBFB'
      },
      NEGATIVE: {
        backgroundColor: '#DC4C64',
        borderColor: '#DC4C64',
        textColor: '#FBFBFB'
      }
    }
    return {
      // id: uuidv4(),
      title,
      start,
      end,
      extendedProps,
      description,
      ...eventType[eventCat]
    }
  }

  async tempAppointmentCreate (details, authData, conn, departmentId, userId, roleId, t) {
    try {
      departmentId = departmentId || systemDeptId
      userId = userId || systemUserId
      roleId = roleId || systemRoleId

      commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId || 1,
        createdBy: userId || 1,
        updatedBy: userId || 1
      }
      const appointmentData = await conn.AppointmentDtl.findOne({
        where: { appointDtlId: details?.appointDtlId },
        raw: true
      })
      const oldTxnData = await conn.AppointmentTxn.findOne({
        where: {
          appointDtlId: details?.appointDtlId,
          appointUserId: details?.customerId,
          tranCategoryNo: details?.productNo,
          status: 'AS_TEMP'
        },
        transaction: t,
        raw: true
      })
      if (oldTxnData) {
        await conn.AppointmentTxn.destroy({
          where: { appointTxnId: oldTxnData.appointTxnId },
          transaction: t
        })
      }
      let appointTxnCreate = {}
      if (details?.operation === 'CREATE') {
        const appointmentTxnData = {
          appointDtlId: appointmentData?.appointDtlId,
          appointId: appointmentData?.appointId,
          appointDate: appointmentData?.appointDate,
          status: 'AS_TEMP',
          appointUserCategory: 'CUSTOMER',
          appointUserId: details?.customerId,
          appointAgentId: details?.appointAgentId,
          appointMode: appointmentData?.appointMode,
          appointStartTime: appointmentData?.appointStartTime,
          appointEndTime: appointmentData?.appointEndTime,
          tranCategoryType: 'ORDER',
          tranCategoryNo: details?.productNo,
          tranCategoryUuid: uuidv4(),
          ...commonAttrib
        }

        try {
          if (['AUDIO_CONF', 'VIDEO_CONF'].includes(appointmentTxnData.appointMode) && appointmentTxnData.appointAgentId && appointmentTxnData.appointUserId) {
            const hostDetail = await conn.User.findOne({ where: { userId: appointmentTxnData.appointAgentId } })
            const customerDetail = await conn.Contact.findOne({
              where: {
                contactCategory: 'CUSTOMER',
                contactCategoryValue: details?.customerNo || details?.dataValues?.customerNo
              }
            })
            const start = moment(`${appointmentTxnData.appointDate}T${appointmentTxnData.appointStartTime}Z`)// now
            const end = moment(`${appointmentTxnData.appointDate}T${appointmentTxnData.appointEndTime}Z`)

            const requestBody = {
              agenda: 'Customer related - ' + details?.customerNo,
              hostEmail: hostDetail?.email,
              duration: end.diff(start, 'minutes'),
              customerEmail: customerDetail?.emailId,
              topic: 'Customer related - ' + details?.customerNo,
              appointDateTime: `${appointmentTxnData.appointDate}T${appointmentTxnData.appointStartTime}Z`
            } // "2022-03-25T07:32:55Z"
            const { tenantId } = authData
            const headers = {
              'Content-Type': 'application/json',
              'X-TENANT-ID': tenantId
            }
            const method = 'post'
            const path = 'appointment/create-meeting-link-chat'
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

        console.log('appointmentTxnData', appointmentTxnData)
        appointTxnCreate = await conn.AppointmentTxn.create(
          appointmentTxnData,
          { transaction: t }
        )
      }

      // console.log(aaa)
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: { appointTxnCreate }
      }
    } catch (err) {
      console.log(err)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createAppointmentLink (path, method, headers, data) {
    console.log('bcaeConfig.gatewayPort --------->', bcaeConfig.gatewayPort)
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

  async createTemplateMapping (details, conn, departmentId, userId, roleId, t) {
    try {
      const requestObj = []
      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }

      const mappedTemplate = details.mappedTemplate
      const unMappedTemplate = details.unMappedTemplate

      if (['TMC_PRODUCTBUNDLE', 'TMC_PROMOCODE'].includes(details.mapCategory)) {
        for (const tempList of mappedTemplate) {
          if (!tempList.templateMap) {
            const header = details.mapCategory === 'TMC_PRODUCTBUNDLE'
              ? await conn.ProductBundleHdr.findOne({ where: { templateId: tempList.templateId } })
              : await conn.PromoHdr.findOne({ where: { templateId: tempList.templateId } })

            for (const list of tempList.confirmedTemplateList) {
              const chargeList = list.useNewCharge ? list.newChargeList : await conn.ProductCharge.findAll({ where: { productId: list.productId } })
              const totalChargeAmount = chargeList.reduce((total, charge) => total + Number(charge.chargeAmount), 0)

              const templateMapping = {
                templateId: tempList.templateId,
                templateMapName: list.productName,
                mapCategory: details.mapCategory.toUpperCase(),
                customerCategory: null,
                serviceCategory: list.productSubType,
                serviceType: list.serviceType,
                tranCategory: list.productCategory,
                tranPriority: null,
                tranType: list.productType,
                status: tempList.status || 'TPL_ACTIVE',
                objectName: 'Product',
                objectReference: list.productId,
                ...commonAttrib
              }

              requestObj.push(templateMapping)
              let detailObj = null
              if (details.mapCategory === 'TMC_PRODUCTBUNDLE') {
                detailObj = {
                  prodBundleId: header.prodBundleId,
                  productId: list.productId,
                  requiredQty: list.requiredQty ? list.requiredQty : 1,
                  status: defaultStatus.ACTIVE,
                  prodBundleUuid: header.prodBundleUuid,
                  productUuid: list.productUuid,
                  prodBundleDtlUuid: uuidv4(),
                  chargeList: list.useNewCharge ? list.newChargeList.map(m => m.chargeId) : [],
                  termsList: list.useNewTerm ? list.termsId : [],
                  useExistingCharge: list.useExistingCharge,
                  useExistingTerm: list.useExistingTerm,
                  totalCharge: totalChargeAmount,
                  ...commonAttrib
                }

                await conn.ProductBundleDtl.create(detailObj, { transaction: t })

                for (const charge of chargeList) {
                  const prodChargeObj = {
                    objectType: details.mapCategory,
                    objectReferenceId: header.prodBundleId,
                    productId: list.productId,
                    chargeId: charge.chargeId,
                    chargeType: charge.chargeType,
                    chargeAmount: charge.chargeAmount,
                    frequency: charge.frequency,
                    billingEffective: charge.billingEffective,
                    advanceCharge: charge.advanceCharge,
                    chargeUpfront: charge.upfrontCharge,
                    currency: charge.currency,
                    status: 'AC',
                    startDate: charge.startDate,
                    endDate: charge.endDate || null,
                    changesApplied: charge.changesApplied,
                    remarks: charge.remarks,
                    prorated: charge.prorated,
                    productUuid: list.productUuid,
                    ...commonAttrib
                  }
                  // console.log(JSON.stringify(prodChargeObj))
                  // console.log(dd)
                  await conn.ProductCharge.create(prodChargeObj, { transaction: t })
                }
              } else {
                detailObj = {
                  promoId: header.promoId,
                  productId: list.productId,
                  status: defaultStatus.ACTIVE,
                  promoUuid: header.promoUuid,
                  productUuid: list.productUuid,
                  promoDtlUuid: uuidv4(),
                  chargeList: list.useNewCharge ? list.newChargeList.map(m => m.chargeId) : [],
                  termsList: list.useNewTerm ? list.termsId : [],
                  useExistingCharge: list.useExistingCharge,
                  useExistingTerm: list.useExistingTerm,
                  ...commonAttrib
                }

                await conn.PromoDtl.create(detailObj, { transaction: t })

                const chargeDet = await conn.Charge.findAll({ where: { chargeId: header.chargeId } })
                for (const charge of chargeDet) {
                  console.log('charge ', charge)
                  const newObjects = {
                    productId: list.productId,
                    chargeId: header.chargeId,
                    chargeAmount: Number(charge.chargeAmount),
                    changesApplied: 'N',
                    status: 'AC',
                    chargeType: charge.chargeCat,
                    currency: charge.currency,
                    startDate: header.startDate,
                    endDate: header.endDate,
                    objectReferenceId: header.promoId,
                    objectType: details.mapCategory,
                    ...commonAttrib
                  }

                  // console.log('newObjectsnewObjects ', newObjects)
                  // console.log(ss)
                  await conn.ProductCharge.create(newObjects, { transaction: t })
                }
              }
            }
          } else {
            // need to update the template object
          }
        }

        await conn.TemplateMapping.bulkCreate(requestObj, { transaction: t })
      } else {
        console.log('mappedTemplate ==> ', mappedTemplate)
        if (mappedTemplate.length > 1) {
          const arr = []
          mappedTemplate.forEach((m) => {
            const obj = {
              templateCategory: m.templateCategory,
              userGroup: m.userGroup,
              location: m.appointmentHdr?.[0]?.location
            }
            if (['TC_EMAIL', 'TC_SMS', 'TC_WHATSAPP'].includes(m.templateCategory)) {
              obj.templateNo = m.templateNo
              obj.mapCategory = m.mapCategory
              obj.tranEntity = m.tranEntity
            }
            arr.push(obj)
          })
          console.log(JSON.stringify(arr))

          if (hasDuplicates(arr)) {
            return {
              status: statusCodeConstants.ERROR,
              message: 'Mapping already available with same template type and user group combination'
            }
          }
        }

        const serviceTypeObj = await conn.BusinessEntity.findAll({
          where: {
            codeType: 'SERVICE_TYPE',
            status: 'AC'
          },
          raw: true
        })

        const serviceTypes = []
        details.serviceCategory.forEach((sc) => {
          details.serviceType.forEach((st) => {
            serviceTypeObj.forEach((sto) => {
              if (
                sto.mappingPayload &&
                sto.mappingPayload.hasOwnProperty('mapEntity') &&
                sto.mappingPayload.mapEntity.includes(sc) &&
                st === sto.code
              ) {
                serviceTypes.push(sto.code)
              }
            })
          })
        })

        mappedTemplate.forEach((temp) => {
          if (
            temp.templateMap?.templateMapId === undefined ||
            temp.templateMap?.templateMapId === null
          ) {
            if (
              details.customerCategory.length === 0 ||
              details.tranCategory.length === 0 ||
              details.tranType.length === 0 ||
              details.serviceCategory.length === 0 ||
              details.serviceType.length === 0 ||
              details.tranPriority.length === 0
            ) {
              return
            }

            details.customerCategory.forEach((customerCategory) => {
              details.serviceCategory.forEach((serviceCategory) => {
                serviceTypes.forEach((serviceType) => {
                  details.tranCategory.forEach((tranCategory) => {
                    details.tranType.forEach((tranType) => {
                      details.tranPriority.forEach((tranPriority) => {
                        requestObj.push({
                          templateId: temp.templateId,
                          templateMapName: temp.templateName,
                          customerCategory,
                          mapCategory: details.mapCategory.toUpperCase(),
                          tranEntity: details?.tranEntity?.toUpperCase(),
                          serviceCategory,
                          serviceType,
                          tranCategory,
                          tranPriority,
                          tranType,
                          status: temp.status || 'AC',
                          ...commonAttrib
                        })
                      })
                    })
                  })
                })
              })
            })
          }
        })

        console.log('requestObj ===> ', requestObj)

        await conn.TemplateMapping.bulkCreate(requestObj, { transaction: t })

        for (const unmap of unMappedTemplate) {
          if (unmap.type && unmap.type === 'UNSELECT') {
            const mapIds = []
            unmap.templateMap &&
              unmap.templateMap.filter((e) => mapIds.push(e.templateMapId))

            await conn.TemplateMapping.update({ status: 'IN' }, {
              where: {
                templateMapId: mapIds
              },
              transaction: t
            })
          }
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Template Mapping successful',
        data: ''
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateTemplateMapping (details, conn, departmentId, userId, roleId, t) {
    try {
      commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }
      const mappedTemplate = details?.mappedTemplate ? details?.mappedTemplate : details?.templateData?.mappedTemplate
      const unMappedTemplate = details?.unMappedTemplate ? details?.unMappedTemplate : details?.templateData?.unMappedTemplate

      const requestObj = []
      let respObj
      mappedTemplate.length > 0 &&
        mappedTemplate.map((temp) => {
          if (!temp.templateMap?.templateMapId) {
            if (
              details.customerCategory.length === 0 ||
              details.tranCategory.length === 0 ||
              details.tranType.length === 0 ||
              details.serviceCategory.length === 0 ||
              details.serviceType.length === 0 ||
              details.tranPriority.length === 0
            ) {
              return
            }

            details.customerCategory.map((cc) => {
              details.tranCategory.map((tc) => {
                details.tranType.map((tt) => {
                  details.serviceCategory.map((sc) => {
                    details.serviceType.map((st) => {
                      details.tranPriority.map((tp) => {
                        const obj = {
                          templateId: temp.templateId,
                          templateMapName: temp.templateName,
                          mapCategory: details?.mapCategory?.toUpperCase(),
                          tranEntity: details?.tranEntity?.toUpperCase(),
                          customerCategory: cc,
                          tranCategory: tc,
                          status: temp.status || 'AC',
                          tranType: tt,
                          serviceCategory: sc,
                          serviceType: st,
                          tranPriority: tp,
                          ...commonAttrib
                        }
                        requestObj.push(obj)
                      })
                    })
                  })
                })
              })
            })
          }
        })
      // console.log("requestObj===>", requestObj);

      await conn.TemplateMapping.bulkCreate(requestObj, {
        updateOnDuplicate: [
          'tranType',
          'tranCategory',
          'serviceCategory',
          'serviceType',
          'status',
          'tranPriority',
          'customerCategory'
        ],
        transaction: t
      })

      for (const unmap of unMappedTemplate) {
        // console.log(unmap)
        if (unmap.type && unmap.type === 'UNSELECT') {
          const mapIds = []
          unmap?.templateMap?.filter((e) => mapIds.push(e.templateMapId))
          // console.log(mapIds);
          await conn.TemplateMapping.update(
            { status: 'IN' },
            {
              where: {
                templateMapId: mapIds
              },
              transaction: t
            }
          )
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Template mapping updated successfully!',
        data: ''
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createBusinessParameter (reqData, userId, departmentId, roleId, conn, t) {
    try {
      const buSql = `select be_next_seq('${reqData?.codeType}')`
      const buCode = await conn.sequelize.query(buSql, {
        type: QueryTypes.SELECT
      })

      if (!isEmpty(buCode)) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'Error while creating business Parameter'
        }
      }
      const hasRecord = await conn.BusinessEntity.findOne({
        where: { code: buCode[0]?.be_next_seq }
      })

      if (!isEmpty(hasRecord)) {
        return {
          status: statusCodeConstants.CONFLICT,
          message: 'Business Parameter already exist'
        }
      }
      reqData.code = buCode[0]?.be_next_seq
      const data = transfromBusinessParameter(reqData, userId)
      data.tranId = uuidv4()
      data.createdDeptId = departmentId
      data.createdRoleId = roleId
      data.createdBy = userId
      data.updatedBy = userId

      const response = await conn.BusinessEntity.create(data, {
        transaction: t
      })

      if (!response) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Failed to create Business Parameter'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Business Parameter created successfully',
        data: response
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateBusinessParameter (reqData, userId, departmentId, roleId, conn, t) {
    try {
      const BPinfo = await conn.BusinessEntity.findOne({
        where: { code: reqData.code }
      })
      if (!BPinfo) {
        logger.debug('Business Parameter not found')
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Business Parameter not found'
        }
      }
      const updateBP = transfromBusinessParameter(reqData, userId, BPinfo)
      await conn.BusinessEntity.update(updateBP, {
        where: { code: reqData.code },
        transaction: t
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Business Parameter created successfully'
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async updateBcaeAppConfig (
    reqData,
    params,
    userId,
    departmentId,
    roleId,
    conn,
    t
  ) {
    try {
      const BPinfo = await conn.BcaeAppConfig.findOne({
        where: { configId: params.id }
      })
      if (!BPinfo) {
        logger.debug('Business App Config not found')
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Business App Config not found'
        }
      }
      const bcaeAppConfigReq = {
        status: 'AC',
        appButtonColor: reqData.buttonColor,
        appBarColor: reqData.navbarColor,
        appRosterFlag: reqData.rosterAutoAssignSetting === 'Y',
        appUserManual: reqData.userManualPdf,
        appLogo: reqData.logoImage,
        appFaq: reqData.appFaq,
        businessSetup: reqData.businessSetup,
        requestCycleSetupPayload: reqData.requestCycleSetupPayload,
        maxRolesLimit: Number(reqData.maxRolesLimit),
        maxEntityLimit: Number(reqData.maxEntityLimit),
        maxUserLimit: reqData.userLimitPayload.reduce((acc, curr) => {
          acc = acc + Number(curr.count || 0)
          return acc
        }, 0),
        maxSessionTimeout: reqData?.sessionAutoLogout,
        maxPasswordRetry: Number(reqData.loginRetryCount),
        userLimitPayload: reqData.userLimitPayload,
        moduleSetupPayload: reqData.moduleSetup,
        channelSetupPayload: reqData.channelSetupPayload,
        multiLangSetupPayload: reqData.multiLanguageSelection,
        portalSetupPayload: reqData.portalSetupPayload,
        appointChannelSetupPayload: reqData.appointChannelSetupPayload,
        otpExpirationDuration: reqData.otpExpirationDuration,
        appDefaultRole: reqData.appDefaultRole,
        appDefaultDepartment: reqData.appDefaultDepartment,
        appTenantId: reqData.appTenantId
      }
      if (reqData.notificationSetupPayload || reqData.notificationSetupPayload.Port !== '') {
        bcaeAppConfigReq.notificationSetupPayload = reqData.notificationSetupPayload
      }
      if (reqData.portalSetupPayload) {
        bcaeAppConfigReq.portalSetupPayload = reqData.portalSetupPayload
      }
      await conn.BcaeAppConfig.update(bcaeAppConfigReq, {
        where: { configId: params.id },
        transaction: t
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Business App Config created successfully'
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getBusinessParameterList (reqData, conn) {
    try {
      let {
        limit = defaultCode.lIMIT,
        page = defaultCode.PAGE,
        all,
        excel = false,
        filters,
        code
      } = reqData
      let offSet = page * limit
      if (excel) {
        offSet = undefined
        limit = undefined
      }
      if (all) {
        const response = await conn.BusinessEntity.findAll({
          where: { status: defaultCode.ACTIVE, codeType: code }
        })
        if (response) {
          return {
            status: statusCodeConstants.SUCCESS,
            message: 'Successfully fetch Business Parameter data',
            data: response
          }
        }
      }
      const whereClause = { codeType: code }
      let whereCreatedBy = {}
      let whereUpdatedBy = {}
      if (filters && Array.isArray(filters) && !isEmpty(filters)) {
        for (const record of filters) {
          if (record.value) {
            if (record.id === 'code') {
              whereClause.code = {
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn('UPPER', sequelize.col('BusinessEntity.code')),
                    {
                      [record.filter === 'contains'
                        ? Op.like
                        : Op.notLike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'description') {
              whereClause.description = {
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn(
                      'UPPER',
                      sequelize.col('BusinessEntity.description')
                    ),
                    {
                      [Op.like]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'codeType') {
              whereClause.codeType = {
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn(
                      'UPPER',
                      sequelize.col('BusinessEntity.code_type')
                    ),
                    {
                      [record.filter === 'contains'
                        ? Op.like
                        : Op.notLike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'status') {
              whereClause.status = {
                [Op.and]: [
                  sequelize.where(
                    sequelize.fn(
                      'UPPER',
                      sequelize.col('BusinessEntity.status')
                    ),
                    {
                      [record.filter === 'contains'
                        ? Op.like
                        : Op.notLike]: `%${record.value.toUpperCase()}%`
                    }
                  )
                ]
              }
            } else if (record.id === 'createdBy') {
              whereCreatedBy = {
                [Op.and]: sequelize.where(
                  sequelize.fn(
                    'concat',
                    sequelize.fn(
                      'UPPER',
                      sequelize.col('createdByName.first_name')
                    ),
                    ' ',
                    sequelize.fn(
                      'UPPER',
                      sequelize.col('createdByName.last_name')
                    )
                  ),
                  {
                    [Op.like]: `%${record.value.toUpperCase()}%`
                  }
                )
              }
            } else if (record.id === 'updatedBy') {
              whereUpdatedBy = {
                [Op.and]: sequelize.where(
                  sequelize.fn(
                    'concat',
                    sequelize.fn(
                      'UPPER',
                      sequelize.col('updatedByName.first_name')
                    ),
                    ' ',
                    sequelize.fn(
                      'UPPER',
                      sequelize.col('updatedByName.last_name')
                    )
                  ),
                  {
                    [Op.like]: `%${record.value.toUpperCase()}%`
                  }
                )
              }
            }
          }
        }
      }

      const response = await conn.BusinessEntity.findAndCountAll({
        include: [
          {
            model: conn.User,
            as: 'createdByName',
            attributes: ['firstName', 'lastName'],
            required: true,
            where: whereCreatedBy
          },
          {
            model: conn.User,
            as: 'updatedByName',
            attributes: ['firstName', 'lastName'],
            required: true,
            where: whereUpdatedBy
          }
        ],
        where: whereClause,
        order: [['code', 'ASC']],
        offset: offSet,
        // logging: true,
        limit: excel === false ? Number(limit) : limit
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch Business Parameter data',
        data: response
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getBusinessParameter (code, conn) {
    try {
      logger.debug('Getting Business Parameter  details by ID')
      const response = await conn.BusinessEntity.findOne({ where: { code } })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch Business Parameter data',
        data: response
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getBusinessParameterCodeTypeList (conn) {
    try {
      logger.debug('Getting Business Parameter details by CodeType')
      let response = await conn.sequelize.query(
        `select distinct be.code_type,tyc.description, tyc.code, tyc.mapping_key from ad_business_entity be
                                        inner join meta_type_code_lu as tyc on be.code_type = tyc.code order by be.code_type `,
        {
          type: QueryTypes.SELECT
        }
      )
      response = camelCaseConversion(response)
      if (!response) {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Business Parameter details not found'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch Business Parameter data',
        data: response
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createBusinessParameterBulk (requestBody, userId, conn) {
    const t = await conn.sequelize.transaction()
    try {
      logger.info('Creating Bulk Business Parameter')
      requestBody.list.map((entity) => {
        entity.code = entity?.code || null
        entity.description = entity?.description || null
        entity.codeType = entity?.codeType || null
        entity.mappingPayload = entity?.mappingPayload || null
        entity.status = 'Active' ? 'AC' : 'IN' || null
        entity.createdBy = userId
        entity.updatedBy = userId
        return entity
      })
      const data = {
        bulkUploadType: requestBody.type,
        noOfRecordsAttempted: requestBody.counts.total,
        successfullyUploaded: requestBody.counts.success,
        failed: requestBody.counts.failed,
        createdBy: userId
      }
      const responsebulk = await conn.BulkUploadDtl.create(data, {
        transaction: t
      })
      if (!responsebulk) {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Failed to create Business Parameter'
        }
      }
      requestBody.list.map((record) => {
        record.bulkuploadId = responsebulk.uploadProcessId
        return record
      })

      const response = await conn.BulkUploadBusinessEntity.bulkCreate(
        requestBody.list,
        { transaction: t }
      )
      if (response) {
        await BusinessEntity.bulkCreate(requestBody.list, { transaction: t })
      }
      await t.commit()
      const bulkUploadResponse = await conn.BulkUploadDtl.findOne({
        where: {
          uploadProcessId: responsebulk.uploadProcessId
        },
        include: [
          {
            model: User,
            as: 'createdByName',
            attributes: ['firstName', 'lastName']
          }
        ]
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Business Parameter created successfully',
        data: bulkUploadResponse
      }
    } catch (error) {
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

  async verifyBusinessParameterRecords (reqBody, conn) {
    try {
      logger.info('Verifying Bulk Business Parameter')
      const response = []
      const codes = map(reqBody.list, 'code')
      if (!isEmpty(codes)) {
        logger.info('Finding codes in db')
        const businessEntities = await BusinessEntity.findAll({
          attributes: ['code'],
          where: { code: codes }
        })
        let list = []
        if (isEmpty(businessEntities)) {
          list = codes
        } else {
          for (const i of codes) {
            let found = false
            for (const j of businessEntities) {
              if (i === j.code) {
                response.push({
                  code: i,
                  validationStatus: 'FAILED',
                  validationRemark: 'Business Entity Already Exists'
                })
                found = true
              }
            }
            if (found === false) {
              response.push({ code: i, validationStatus: 'SUCCESS' })
            }
          }
        }
      } else {
        return {
          status: statusCodeConstants.ERROR,
          message: 'Failed to Verify Business Parameter'
        }
      }
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Business Parameter created successfully',
        data: response
      }
    } catch (error) {
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async createBcaeAppConfigRecord (
    details,
    conn,
    departmentId,
    userId,
    roleId,
    t
  ) {
    try {
      commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }
      // console.log('details',details)
      const bcaeAppConfigReq = {
        status: 'AC',
        appButtonColor: details.buttonColor,
        appBarColor: details.navbarColor,
        appRosterFlag: details.rosterAutoAssignSetting === 'Y',
        appUserManual: details.userManualPdf,
        appLogo: details.logoImage,
        appFaq: details.appFaq,
        businessSetup: details.businessSetup,
        requestCycleSetupPayload: details.requestCycleSetupPayload,
        maxRolesLimit: Number(details.maxRolesLimit),
        maxEntityLimit: Number(details.maxEntityLimit),
        maxUserLimit: details.userLimitPayload.reduce((acc, curr) => {
          acc = acc + Number(curr.count || 0)
          return acc
        }, 0),
        maxSessionTimeout: details?.sessionAutoLogout,
        maxPasswordRetry: Number(details.loginRetryCount),
        userLimitPayload: details.userLimitPayload,
        moduleSetupPayload: details.moduleSetup,
        channelSetupPayload: details.channelSetupPayload,
        multiLangSetupPayload: details.multiLanguageSelection,
        portalSetupPayload: details.portalSetupPayload,
        appointChannelSetupPayload: details.appointChannelSetupPayload,
        notificationSetupPayload: details.notificationSetupPayload,
        otpExpirationDuration: details.otpExpirationDuration,
        appDefaultRole: details?.appDefaultRole,
        appDefaultDepartment: details?.appDefaultDepartment,
        appTenantId: details?.appTenantId,
        ...commonAttrib
      }

      // console.log('bcaeAppConfigReq',bcaeAppConfigReq)
      const bcaeAppConfigData = await conn.BcaeAppConfig.create(
        bcaeAppConfigReq,
        { transaction: t }
      )

      if (details?.channelSetupPayload && Array.isArray(details?.channelSetupPayload) && details?.channelSetupPayload.length) {
        await conn.BusinessEntity.update({ status: defaultStatus.IN_ACTIVE },
          {
            where: {
              codeType: 'USER_FAMILY',
              code: {
                [Op.notIn]: details?.channelSetupPayload
              },
              status: defaultStatus.ACTIVE
            }
          })
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'System Paramters created successfully',
        data: bcaeAppConfigData
      }
    } catch (error) {
      console.log(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getBcaeAppConfigRecord (conn) {
    try {
      const response = await conn.BcaeAppConfig.findOne({
        attributes: { exclude: ['appUserManual', 'portalSetupPayload', 'notificationSetupPayload'] },
        where: {
          status: defaultStatus.ACTIVE
        }
      })
      if (!response) {
        return {
          status: statusCodeConstants.ERROR,
          message:
            'System Configuartion is not available. Please contact system admin'
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched the system configuration',
        data: response
      }
    } catch (error) {
      logger.error('error', error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getCurrentCount (conn) {
    try {
      const getBuCount = await conn.BusinessUnit.count({
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const getRoleCount = await conn.Role.count({
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const getUserCount = await conn.User.count({
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const getUserTypeCount = await conn.User.findAll({
        attributes: [
          'userType',
          [
            conn.sequelize.fn('COUNT', conn.sequelize.col('user_type')),
            'userTypeGroup'
          ]
        ],
        where: {
          status: defaultStatus.ACTIVE
        },
        group: ['userType']
      })

      const groupedObjects = getUserTypeCount.map((e) => {
        return { [e.userType]: Number(e?.dataValues?.userTypeGroup) }
      })
      const singleObject = groupedObjects.reduce((result, currentObject) => {
        return { ...result, ...currentObject }
      }, {})
      // console.log('singleObject', getUserTypeCount)

      const response = {
        department: getBuCount || 0,
        role: getRoleCount || 0,
        user: {
          total: getUserCount || 0,
          ...singleObject
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched the current count details',
        data: response
      }
    } catch (error) {
      logger.error('error', error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getTotalCount (conn) {
    try {
      const getBuCount = await conn.BusinessUnit.count({
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const getRoleCount = await conn.Role.count({
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const getUserCount = await conn.User.count({
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const getRequestCount = await conn.KnowledgeBase.count({
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const getBusinessEntityCount = await conn.BusinessEntity.count({
        where: {
          status: defaultStatus.ACTIVE
        }
      })

      const response = {
        department: getBuCount || 0,
        role: getRoleCount || 0,
        user: getUserCount || 0,
        request: getRequestCount || 0,
        businessEntity: getBusinessEntityCount || 0
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched the current count details',
        data: response
      }
    } catch (error) {
      logger.error('error', error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getTermsAndConditions (inputData, conn) {
    try {
      const where = {
        status: defaultStatus.ACTIVE
      }

      const attributes = ['entityType', 'serviceType']
      for (const property in inputData) {
        if (attributes.includes(property)) {
          where[property] = inputData[property]
        }
      }

      const termsResponse = await conn.TermsConditionsHdr.findAll({
        where,
        include: [
          {
            model: conn.Charge,
            as: 'chargeDtl'
          }
        ]
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetched the current count details',
        data: termsResponse
      }
    } catch (error) {
      logger.error('error', error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  // async createChannelSetting (reqBody, userId) {
  //   const conn = await getConnection()
  //   const t = await conn.sequelize.transaction()
  //   try {
  //     logger.info('Creating Portal Settings')
  //     const hasRecord = await conn.PortalSetting.findOne({ where: { settingType: reqBody.settingType } })
  //     if (!isEmpty(hasRecord)) {
  //       return { status: statusCodeConstants.CONFLICT, message: 'Portal Settings already exist' }
  //     }
  //     const data = transfromPortalSetting(reqBody, userId)
  //     const response = await conn.PortalSetting.create(data, { transaction: t })
  //     if (!response) {
  //       return { status: statusCodeConstants.ERROR, message: 'Failed to create Portal Settings' }
  //     }
  //     await t.commit()
  //     return {
  //       status: statusCodeConstants.SUCCESS,
  //       message: 'Portal Settings created successfully',
  //       data: response
  //     }
  //   } catch (error) {
  //     return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
  //   } finally {
  //     if (t && !t.finished) { await t.rollback() }
  //   }
  // }

  // async updateChannelSetting (reqData, userId) {
  //   const conn = await getConnection()
  //   const t = await conn.sequelize.transaction()
  //   try {
  //     const BPinfo = await conn.PortalSetting.findOne({ where: { code: reqData.code } })
  //     if (!BPinfo) {
  //       logger.debug('Portal Settings not found')
  //       return { status: statusCodeConstants.NOT_FOUND, message: 'Portal Settings not found' }
  //     }
  //     const updateBP = transfromBusinessParameter(reqData, userId, BPinfo)
  //     await conn.BusinessEntity.update(updateBP, { where: { code: reqData.code }, transaction: t })
  //     await t.commit()
  //     return { status: statusCodeConstants.SUCCESS, message: 'Portal Settings created successfully' }
  //   } catch (error) {
  //     return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
  //   } finally {
  //     if (t && !t.finished) { await t.rollback() }
  //   }
  // }

  // async getchannelSetting (reqData) {
  //   try {
  //     const conn = await getConnection()
  //     const { type } = reqData
  //     logger.debug('Getting Portal Settings details by ID')
  //     const response = await conn.PortalSetting.findOne({
  //       include: [
  //         {
  //           model: User,
  //           as: 'createdByName',
  //           attributes: ['firstName', 'lastName']
  //         },
  //         {
  //           model: User,
  //           as: 'updatedByName',
  //           attributes: ['firstName', 'lastName']
  //         }
  //       ],
  //       where: { settingType: type }
  //     })
  //     return {
  //       status: statusCodeConstants.SUCCESS,
  //       message: 'Successfully fetch Portal Settings data',
  //       data: response
  //     }
  //   } catch (error) {
  //     return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
  //   }
  // }

  // async getchannelSettingList (reqData) {
  //   try {
  //     const conn = await getConnection()
  //     let { limit = defaultCode.lIMIT, page = defaultCode.PAGE, all, excel = false, filters } = reqData
  //     let offSet = (page * limit)
  //     if (excel) {
  //       offSet = undefined
  //       limit = undefined
  //     }
  //     if (all) {
  //       const response = await conn.PortalSetting.findAll({ where: { status: defaultCode.ACTIVE } })
  //       if (response) {
  //         return {
  //           status: statusCodeConstants.SUCCESS,
  //           message: 'Successfully fetch Portal Settings data',
  //           data: response
  //         }
  //       }
  //     }
  //     const response = await conn.PortalSetting.findAndCountAll({
  //       order: [['settingId', 'DESC']],
  //       offset: offSet,
  //       limit: excel === false ? Number(limit) : limit
  //     })
  //     return {
  //       status: statusCodeConstants.SUCCESS,
  //       message: 'Successfully fetch Portal Setting data',
  //       data: response
  //     }
  //   } catch (error) {
  //     return { status: statusCodeConstants.ERROR, message: 'Internal server error' }
  //   }
  // }

  async getAvailableAppointmentChat (details, conn) {
    try {
      const appointmentWhere = {
        appointType: details?.appointmentType,
        status: 'AS_SCHED'
      }
      if (details?.appointmentType === 'CUST_VISIT') {
        appointmentWhere.location = details?.location
      }
      console.log('appointmentWhere', appointmentWhere)
      const mappedTemplate = await conn.TemplateHdr.findOne({
        attributes: [
          'templateId',
          'templateCategory',
          'templateName',
          'userGroup',
          'templateNo',
          'entity'
        ],
        include: [
          {
            model: conn.TemplateMapping,
            attributes: [
              'templateMapId',
              'templateId',
              'templateMapName',
              'mapCategory',
              'tranEntity',
              'serviceCategory',
              'serviceType',
              'customerClass',
              'tranType',
              'tranPriority'
            ],
            as: 'templateMap',
            where: {
              status: ['AC', 'TPL_ACTIVE'],
              mapCategory: details.mapCategory?.toUpperCase(),
              // serviceCategory: details.serviceCategory,
              // serviceType: details.serviceType,
              customerCategory: details.customerCategory || defaultCode.CUSTOMER_CATEGORY,
              tranType: details.tranType,
              tranCategory: details.tranCategory,
              tranPriority: details.tranPriority
            }
          },
          {
            model: conn.AppointmentHdr,
            attributes: [
              'appointId',
              'appointName',
              'appointType',
              'userGroup',
              'notifyId',
              'rosterId',
              'location'
            ],
            as: 'appointmentHdr',
            where: appointmentWhere,
            include: [
              {
                model: conn.AppointmentDtl,
                attributes: [
                  'appointDtlId',
                  'appointMode',
                  'calenderId',
                  'shiftId',
                  'appointDate',
                  'appointInterval',
                  'appointAgentsAvailability',
                  'appointStartTime',
                  'appointEndTime',
                  'userId'
                ],
                as: 'appointmentDet',
                where: {
                  appointMode: details?.appointmentType,
                  appointDate: details?.appointmentDate,
                  status: 'AS_SCHED'
                },
                include: [
                  {
                    model: conn.AppointmentTxn,
                    as: 'appointmentTxnDetails'
                  }
                ]
              }
            ]
          }
        ],
        where: {
          status: ['AC', 'TPL_ACTIVE'],
          templateCategory: 'TC_APPOINT',
          // templateId: details?.templateId,
          eventType: 'ET_CREATION'
        },
        logging: true
      })
      // const skills = await conn.SkillMaster.findAll({
      //   include: [
      //     {
      //       attributes: ["userId"],
      //       model: conn.UserSkillMap,
      //       as: "userSkill",
      //     },
      //   ],
      //   where: {
      //     status: ["AC"],
      //     mapCategory: details.mapCategory?.toUpperCase(),
      //     serviceCategory: details.serviceCategory,
      //     serviceType: details.serviceType,
      //     tranType: details.tranType,
      //     tranCategory: details.tranCategory,
      //   },
      //   //raw: true,
      // });
      // console.log("skills", skills);
      // console.log('mappedTemplate ==================>', mappedTemplate)
      // console.log('mappedTemplate.appointmentHdr[0]?.rosterId', mappedTemplate?.appointmentHdr[0]?.rosterId)
      const events = []
      const currentAppointments = []
      if (mappedTemplate) {
        const appointmentDet =
          mappedTemplate?.appointmentHdr[0]?.appointmentDet
        if (appointmentDet && appointmentDet.length > 0) {
          for (const appointment of appointmentDet) {
            const appointmentTxnDetails = await conn.AppointmentTxn.findAll({
              where: {
                appointDtlId: appointment.appointDtlId
              },
              raw: true
            })
            const bookedAppointment = appointmentTxnDetails
              .map((x) => x.appointTxnId)
              .filter((y) => y)
            const userIds = appointmentTxnDetails
              .map((x) => x.appointAgentId)
              .filter((y) => y)
            let colorCode = 'POSITIVE'
            let title = 'Appointment Available'

            let userDetails
            const availableUsers = 0
            // console.log('appooint',appointment?.appointDtlId)
            // console.log("appointmentDet", appointmentDet);
            const userList = appointmentDet.filter(
              (y) => !userIds.includes(y.userId)
            )
            // console.log("filtered userList", userList);
            if (userList.length > 0) {
              const users = [...new Set(userList.map((x) => x.userId))]
              // console.log('users',users)
              // const skilledUsers = [];
              // skills.filter((s) => {
              //   for (const us of s.userSkill) {
              //     // console.log("us===", us);
              //     if (users.includes(us.dataValues.userId)) {
              //       skilledUsers.push(us.dataValues.userId);
              //     }
              //   }
              // });
              // console.log("skilledUsers", skilledUsers);
              // const userInfo = await conn.User.findAll({
              //   where: {
              //     userId: skilledUsers,
              //   },
              //   raw: true,
              // });
              // // console.log("userInfo", userInfo.length);
              // if (details?.appointmentType === "CUST_VISIT") {
              //   userDetails = userInfo.find((x) => x.loc === details?.location);
              //   availableUsers = userInfo.filter(
              //     (x) => x.loc === details?.location
              //   ).length;
              // }
              // else if (details?.appointmentType === "BUS_VISIT") {
              //   const addressIds = [
              //     ...new Set(userInfo.map((x) => x?.addressId)),
              //   ];
              //   // console.log("addressIds", addressIds);
              //   // console.log(details?.address);
              //   const addressInfo = await conn.Address.findAll({
              //     where: {
              //       addressId: addressIds,
              //       district: details?.address.district,
              //       postcode: details?.address.postcode,
              //     },
              //     raw: true,
              //   });
              //   // console.log("addressInfo", addressInfo);
              //   if (addressInfo.length > 0) {
              //     // console.log('Number(addressInfo[0]?.addressId)',Number(addressInfo[0]?.addressId))
              //     userDetails = userInfo.find(
              //       (x) =>
              //         Number(x?.addressId) === Number(addressInfo[0]?.addressId)
              //     );
              //     const availableAddressIds = addressInfo.map(
              //       (x) => x.addressId
              //     );
              //     availableUsers = userInfo.filter((x) =>
              //       availableAddressIds.includes(x.addressId)
              //     ).length;
              //   }
              // }
              // else {
              //   userDetails = userList[0];
              // }
              userDetails = userList[0]
            }
            // console.log("bookedAppointment.length", bookedAppointment.length);
            // bookedAppointment.length < Number(appointment.appointAgentsAvailability) &&
            if (userDetails) {
              if (bookedAppointment.length > appointmentDet.length / 2) {
                colorCode = 'BELOW_NEUTRAL'
                title = 'Few Appointment Left'
              }
              const startTime = moment(
                new Date(
                  appointment.appointDate + ' ' + appointment.appointStartTime
                )
              ).format('hh:mm A')
              const endTime = moment(
                new Date(
                  appointment.appointDate + ' ' + appointment.appointEndTime
                )
              ).format('hh:mm A')
              const transformValue = this.eventObject({
                title,
                start:
                  appointment.appointDate + ' ' + appointment.appointStartTime,
                end: appointment.appointDate + ' ' + appointment.appointEndTime,
                eventCat: colorCode
              })
              console.log(
                'compare users ids for appointment ',
                userDetails?.userId,
                appointment.userId
              )
              if (userDetails?.userId === appointment.userId) {
                const obj = {
                  ...transformValue,
                  appointDtlId: appointment.appointDtlId,
                  slotName: startTime + ' - ' + endTime,
                  appointUserId: userDetails?.userId,
                  availableUsers,
                  appointDate: appointment.appointDate,
                  appointStartTime: appointment.appointStartTime,
                  appointEndTime: appointment.appointEndTime
                }
                currentAppointments.push(obj)

                const obj2 = this.eventObject({
                  title,
                  start:
                    appointment.appointDate +
                    ' ' +
                    appointment.appointStartTime,
                  end:
                    appointment.appointDate + ' ' + appointment.appointEndTime,
                  eventCat: colorCode
                })
                events.push(obj2)
              }
            } else {
              console.log('Appointment not available')
              // colorCode = "NEGATIVE";
              // title = "Not Available";
              // const obj = this.eventObject({
              //   title,
              //   start:
              //     appointment.appointDate + " " + appointment.appointStartTime,
              //   end: appointment.appointDate + " " + appointment.appointEndTime,
              //   eventCat: colorCode,
              // });
              // events.push(obj);
            }
          }
        }
      }

      console.log('events', events)
      console.log('removeDuplicates', removeDuplicates(events))

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: {
          events: removeDuplicates(events),
          currentAppointments
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  async getFutureAvailableAppointmentChat (details, conn) {
    try {
      const appointmentWhere = {
        appointType: details?.appointmentType,
        status: 'AS_SCHED'
      }
      if (details?.appointmentType === 'CUST_VISIT') {
        appointmentWhere.location = details?.location
      }

      const mappedTemplate = await conn.TemplateHdr.findOne({
        attributes: [
          'templateId',
          'templateCategory',
          'templateName',
          'userGroup',
          'templateNo'
        ],
        include: [
          {
            model: conn.TemplateMapping,
            attributes: [
              'templateMapId',
              'templateId',
              'templateMapName',
              'mapCategory',
              'serviceCategory',
              'serviceType',
              'customerClass',
              'tranType',
              'tranPriority'
            ],
            as: 'templateMap',
            where: {
              status: ['AC', 'TPL_ACTIVE'],
              mapCategory: details.mapCategory?.toUpperCase(),
              // serviceCategory: details.serviceCategory,
              // serviceType: details.serviceType,
              customerCategory: details.customerCategory || defaultCode.CUSTOMER_CATEGORY,
              tranType: details.tranType,
              tranCategory: details.tranCategory,
              tranPriority: details.tranPriority
            }
          },
          {
            model: conn.AppointmentHdr,
            attributes: [
              'appointId',
              'appointName',
              'appointType',
              'userGroup',
              'notifyId',
              'rosterId',
              'location'
            ],
            as: 'appointmentHdr',
            where: appointmentWhere,
            include: [
              {
                model: conn.AppointmentDtl,
                attributes: [
                  'appointDtlId',
                  'appointMode',
                  'calenderId',
                  'shiftId',
                  'appointDate',
                  'appointInterval',
                  'appointAgentsAvailability',
                  'appointStartTime',
                  'appointEndTime',
                  'userId'
                ],
                as: 'appointmentDet',
                where: {
                  appointMode: details?.appointmentType,
                  appointDate: {
                    [Op.between]: [moment().format('YYYY-MM-DD'), moment().add(30, 'days').format('YYYY-MM-DD')]
                  },
                  status: 'AS_SCHED'
                },
                include: [
                  {
                    model: conn.AppointmentTxn,
                    as: 'appointmentTxnDetails'
                  }
                ]
              }
            ]
          }
        ],
        where: {
          status: ['AC', 'TPL_ACTIVE'],
          templateCategory: 'TC_APPOINT',
          // templateId: details?.templateId,
          eventType: 'ET_CREATION'
        }
      })
      // const skills = await conn.SkillMaster.findAll({
      //   include: [
      //     {
      //       attributes: ["userId"],
      //       model: conn.UserSkillMap,
      //       as: "userSkill",
      //     },
      //   ],
      //   where: {
      //     status: ["AC"],
      //     mapCategory: details.mapCategory?.toUpperCase(),
      //     serviceCategory: details.serviceCategory,
      //     serviceType: details.serviceType,
      //     tranType: details.tranType,
      //     tranCategory: details.tranCategory,
      //   },
      //   //raw: true,
      // });
      // console.log("skills", skills);
      // console.log('mappedTemplate ==================>', mappedTemplate)
      // console.log('mappedTemplate.appointmentHdr[0]?.rosterId', mappedTemplate?.appointmentHdr[0]?.rosterId)
      const events = []
      const currentAppointments = []
      if (mappedTemplate) {
        const appointmentDet =
          mappedTemplate?.appointmentHdr[0]?.appointmentDet
        if (appointmentDet && appointmentDet.length > 0) {
          for (const appointment of appointmentDet) {
            const appointmentTxnDetails = await conn.AppointmentTxn.findAll({
              where: {
                appointDtlId: appointment.appointDtlId
              },
              raw: true
            })
            const bookedAppointment = appointmentTxnDetails
              .map((x) => x.appointTxnId)
              .filter((y) => y)
            const userIds = appointmentTxnDetails
              .map((x) => x.appointAgentId)
              .filter((y) => y)
            let colorCode = 'POSITIVE'
            let title = 'Appointment Available'

            let userDetails
            const availableUsers = 0
            // console.log('appooint',appointment?.appointDtlId)
            // console.log("appointmentDet", appointmentDet);
            const userList = appointmentDet.filter(
              (y) => !userIds.includes(y.userId)
            )
            // console.log("filtered userList", userList);
            if (userList.length > 0) {
              const users = [...new Set(userList.map((x) => x.userId))]
              // console.log('users',users)
              // const skilledUsers = [];
              // skills.filter((s) => {
              //   for (const us of s.userSkill) {
              //     // console.log("us===", us);
              //     if (users.includes(us.dataValues.userId)) {
              //       skilledUsers.push(us.dataValues.userId);
              //     }
              //   }
              // });
              // console.log("skilledUsers", skilledUsers);
              // const userInfo = await conn.User.findAll({
              //   where: {
              //     userId: skilledUsers,
              //   },
              //   raw: true,
              // });
              // // console.log("userInfo", userInfo.length);
              // if (details?.appointmentType === "CUST_VISIT") {
              //   userDetails = userInfo.find((x) => x.loc === details?.location);
              //   availableUsers = userInfo.filter(
              //     (x) => x.loc === details?.location
              //   ).length;
              // }
              // else if (details?.appointmentType === "BUS_VISIT") {
              //   const addressIds = [
              //     ...new Set(userInfo.map((x) => x?.addressId)),
              //   ];
              //   // console.log("addressIds", addressIds);
              //   // console.log(details?.address);
              //   const addressInfo = await conn.Address.findAll({
              //     where: {
              //       addressId: addressIds,
              //       district: details?.address.district,
              //       postcode: details?.address.postcode,
              //     },
              //     raw: true,
              //   });
              //   // console.log("addressInfo", addressInfo);
              //   if (addressInfo.length > 0) {
              //     // console.log('Number(addressInfo[0]?.addressId)',Number(addressInfo[0]?.addressId))
              //     userDetails = userInfo.find(
              //       (x) =>
              //         Number(x?.addressId) === Number(addressInfo[0]?.addressId)
              //     );
              //     const availableAddressIds = addressInfo.map(
              //       (x) => x.addressId
              //     );
              //     availableUsers = userInfo.filter((x) =>
              //       availableAddressIds.includes(x.addressId)
              //     ).length;
              //   }
              // }
              // else {
              //   userDetails = userList[0];
              // }
              userDetails = userList[0]
            }
            // console.log("bookedAppointment.length", bookedAppointment.length);
            // bookedAppointment.length < Number(appointment.appointAgentsAvailability) &&
            if (userDetails) {
              if (bookedAppointment.length > appointmentDet.length / 2) {
                colorCode = 'BELOW_NEUTRAL'
                title = 'Few Appointment Left'
              }
              const startTime = moment(
                new Date(
                  appointment.appointDate + ' ' + appointment.appointStartTime
                )
              ).format('hh:mm A')
              const endTime = moment(
                new Date(
                  appointment.appointDate + ' ' + appointment.appointEndTime
                )
              ).format('hh:mm A')
              const transformValue = this.eventObject({
                title,
                start:
                  appointment.appointDate + ' ' + appointment.appointStartTime,
                end: appointment.appointDate + ' ' + appointment.appointEndTime,
                eventCat: colorCode
              })
              // console.log(
              //   "compare users ids for appointment ",
              //   userDetails?.userId,
              //   appointment.userId
              // );
              if (userDetails?.userId === appointment.userId) {
                const obj = {
                  ...transformValue,
                  appointDtlId: appointment.appointDtlId,
                  slotName: startTime + ' - ' + endTime,
                  appointUserId: userDetails?.userId,
                  availableUsers,
                  appointDate: appointment.appointDate,
                  appointStartTime: appointment.appointStartTime,
                  appointEndTime: appointment.appointEndTime
                }
                currentAppointments.push(obj)

                const obj2 = this.eventObject({
                  title,
                  start:
                    appointment.appointDate +
                    ' ' +
                    appointment.appointStartTime,
                  end:
                    appointment.appointDate + ' ' + appointment.appointEndTime,
                  eventCat: colorCode
                })
                events.push(obj2)
              }
            } else {
              console.log('Appointment not available')
              // colorCode = "NEGATIVE";
              // title = "Not Available";
              // const obj = this.eventObject({
              //   title,
              //   start:
              //     appointment.appointDate + " " + appointment.appointStartTime,
              //   end: appointment.appointDate + " " + appointment.appointEndTime,
              //   eventCat: colorCode,
              // });
              // events.push(obj);
            }
          }
        }
      }

      // console.log("events", events);
      // console.log("removeDuplicates", removeDuplicates(events));

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Success',
        data: {
          events: removeDuplicates(events),
          currentAppointments
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  async getMenus (reqData, conn) {
    try {
      const roleId = reqData.roleId
      const response = await conn.Mainmenu.findAll({
        where: {
          status: defaultStatus?.ACTIVE,
          appName: defaultCode?.WEBSELFCARE_APPNAME
        },
        order: [
          ['moduleName', 'ASC'],
          ['screenName', 'ASC']
        ]
      })

      if (response) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Web selfcare Menu data fetched successfully',
          data: response
        }
      } else {
        return {
          status: statusCodeConstants.NOT_FOUND,
          message: 'Web selfcare Menu data not found',
          data: response
        }
      }
    } catch (error) {
      logger.error(error, 'Error while fetching Mainmenu data')
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
}

function SplitWorkTime (StartTime, EndTime, BreakFrom, BreakTo, Duration) {
  console.log(StartTime, EndTime, BreakFrom, BreakTo, Duration)
  function D (J) {
    return (J < 10 ? '0' : '') + J
  }
  const endTimeArr = []
  const breakArr = []
  const startTimeArr = []
  const slotsArr = []
  if (StartTime) {
    let mins = StartTime.split(':')

    const [hours1, minutes1] = StartTime.split(':')
    const [hours2, minutes2] = EndTime.split(':')

    let date1 = new Date(2022, 0, 1, +hours1, +minutes1)
    const date2 = new Date(2022, 0, 1, +hours2, +minutes2)

    while (date1 < date2) {
      const startTime = mins[0] + ':' + mins[1]
      mins = mins[0] * 60 + +mins[1] + +Duration
      const val = D(((mins % (24 * 60)) / 60) | 0) + ':' + D(mins % 60)
      slotsArr.push(startTime + '-' + val)
      // endTimeArr.push(val)
      mins = val.split(':')
      date1 = new Date(2022, 0, 1, +mins[0], +mins[1])
    }
  }

  let breakDate1, breakDate2
  if (BreakFrom) {
    const [breakFromHour, breakFromMin] = BreakFrom.split(':')
    const [breakToHour, breakToMin] = BreakTo.split(':')
    breakDate1 = new Date(2022, 0, 1, +breakFromHour, +breakFromMin)
    breakDate2 = new Date(2022, 0, 1, +breakToHour, +breakToMin)
    let breakMins = BreakFrom.split(':')
    while (breakDate1 < breakDate2) {
      const startTime = breakMins[0] + ':' + breakMins[1]
      breakMins = breakMins[0] * 60 + +breakMins[1] + +Duration
      const val =
        D(((breakMins % (24 * 60)) / 60) | 0) + ':' + D(breakMins % 60)
      breakArr.push(startTime + '-' + val)
      breakMins = val.split(':')
      breakDate1 = new Date(2022, 0, 1, +breakMins[0], +breakMins[1])
    }
  }

  // console.log('slotArr==', sArr)
  // console.log('breakArr==', breakArr)

  return {
    // startTimeSlots: startTimeArr,
    // endTimeSlots: endTimeArr,
    slots: slotsArr,
    breaks: breakArr
  }
}

// const SplitBreakTime = (BreakFrom, BreakTo, Duration) => {
//   function D (J) { return (J < 10 ? '0' : '') + J };
//   const breakArr = []
//   let breakDate1, breakDate2
//   if (BreakFrom) {
//     const [breakFromHour, breakFromMin] = BreakFrom.split(':')
//     const [breakToHour, breakToMin] = BreakTo.split(':')
//     breakDate1 = new Date(2022, 0, 1, +breakFromHour, +breakFromMin)
//     breakDate2 = new Date(2022, 0, 1, +breakToHour, +breakToMin)
//     let breakMins = BreakFrom.split(':')
//     while (breakDate1 < breakDate2) {
//       breakMins = breakMins[0] * 60 + +breakMins[1] + +1
//       const val = D(breakMins % (24 * 60) / 60 | 0) + ':' + D(breakMins % 60)
//       breakArr.push(val)
//       breakMins = val.split(':')
//       breakDate1 = new Date(2022, 0, 1, +breakMins[0], +breakMins[1])
//     }
//   }
//   return breakArr.filter((item, index) => breakArr.indexOf(item) === index)
// }

// function SlotGeneration(StartTime, EndTime, Duration = '60') {
//   function D(J) { return (J < 10 ? '0' : '') + J };
//   const startTimeArr = []; const endTimeArr = []

//   if (StartTime) {
//     let mins = StartTime.split(':')

//     const [hours1, minutes1] = StartTime.split(':')
//     const [hours2, minutes2] = EndTime.split(':')

//     let date1 = new Date(2022, 0, 1, +hours1, +minutes1)
//     const date2 = new Date(2022, 0, 1, +hours2, +minutes2)

//     while (date1 < date2) {
//       const startTime = mins[0] + ':' + mins[1]
//       mins = mins[0] * 60 + +mins[1] + +Duration
//       const val = D(mins % (24 * 60) / 60 | 0) + ':' + D(mins % 60)
//       endTimeArr.push(val)
//       startTimeArr.push(startTime)
//       // slotsArray.push(startTime+'-'+val)
//       mins = val.split(':')
//       date1 = new Date(2022, 0, 1, +mins[0], +mins[1])
//     }
//   }
//   // slotsArray.filter((item,
//   //     index) => slotsArray.indexOf(item) === index);
//   return { startTimes: startTimeArr, endTimes: endTimeArr }
// }

// function templateMappingRecurr(data, keys) {
//   let response = []
//   for (const key of keys) {
//    getEachItem(data[key])
//   }
//   return response
// }

const hasDuplicates = (arr) => {
  const valuesSoFar = Object.create(null)
  for (let i = 0; i < arr.length; ++i) {
    const currentObject = arr[i]
    const objectKey = JSON.stringify(currentObject)
    if (valuesSoFar[objectKey]) {
      return true
    }
    valuesSoFar[objectKey] = true
  }
  return false
}

const removeDuplicates = (arr) => {
  const valuesSoFar = Object.create(null)
  let currentObject
  const list = []
  for (let i = 0; i < arr.length; ++i) {
    currentObject = arr[i]
    const objectKey = JSON.stringify(currentObject)
    if (!valuesSoFar[objectKey]) {
      list.push(currentObject)
    }
    valuesSoFar[objectKey] = true
  }

  // console.log("list", list);
  return list
}

module.exports = BusinessParameterService
