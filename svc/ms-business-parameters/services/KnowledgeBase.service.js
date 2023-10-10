import { logger, statusCodeConstants, entityCategory, defaultStatus, defaultMessage } from '@utils'
// import { assignWFToEntity, processWhatsAppStartStep, continueChatWFExecution } from './workflow.service'
// import IntelligenceService from './Intelligence.service'
import { v4 as uuidv4 } from 'uuid'
// import { isEmpty } from 'lodash'
import { processTheCurrentFlow } from '../utils/workflow-utils'
import { QueryTypes, Op } from 'sequelize'
import { config } from '@config/env.config'
const { systemUserId, systemRoleId, systemDeptId } = config
const natural = require('natural')
let instance

class KnowledgeBaseService {
  constructor(conn) {
    if (!instance) {
      instance = this
    }
    instance.conn = conn
    // this.intelligenceService = new IntelligenceService(conn)
    return instance
  }

  async checkMapping(statements, deptId, roleId, conn, whereClause) {
    console.log('statements-----xx------->', statements)
    console.log('whereClause-----xx------->', whereClause)
    
    delete whereClause?.statementClass;

    const finalStatements = new Set()
    const mappedDetails = await conn.TranEntityMap.findAll({
      where: {
        deptId,
        roleId,
        ...whereClause
      },
      logging: false
    })
    Array.from(statements).filter((f) => {
      // console.log('f is------->', f)
      mappedDetails.filter((map) => {
        if (map?.entityType === 'INTERACTION') {
          if (map?.productFamily) {
            if (map?.productFamily === f?.productFamily) {
              // console.log(
              //   'inside if of prod family',
              //   map?.productFamily,
              //   f?.productFamily
              // )
              if (map?.productType) {
                // console.log('if productType ------------------> ', map?.productType, f?.productType)

                if (map?.productType === f?.productType) {
                  // console.log(
                  //   'inside if of productType',
                  //   map?.productType,
                  //   f?.productType
                  // )
                  if (map?.productSubType) {
                    // console.log('if product sub Type -----------1-------> ', map?.productSubType, f?.productSubType)

                    if (map?.productSubType === f?.productSubType) {
                      if (map?.tranCategory) {
                        // console.log('if product sub Type -----------2-------> ', map?.tranCategory, f?.intxnCategory)

                        if (map?.tranCategory === f?.intxnCategory) {
                          if (map?.tranType) {
                            if (map?.tranType === f?.intxnType) {
                              // console.log('if product sub Type --------3----------> ', map?.serviceType, f?.serviceType)
                              if (
                                map?.serviceType &&
                                map?.serviceType === f?.serviceType
                              ) {
                                finalStatements.add(f)
                              }
                            }
                          } else {
                            if (
                              map?.serviceType &&
                              map?.serviceType === f?.serviceType
                            ) {
                              finalStatements.add(f)
                            }
                          }
                        }
                      } else {
                        if (map?.tranType) {
                          if (map?.tranType === f?.intxnType) {
                            if (
                              map?.serviceType &&
                              map?.serviceType === f?.serviceType
                            ) {
                              finalStatements.add(f)
                            }
                          }
                        } else {
                          if (
                            map?.serviceType &&
                            map?.serviceType === f?.serviceType
                          ) {
                            finalStatements.add(f)
                          }
                        }
                      }
                    }
                  } else {
                    // console.log('else product sub type ------------->')
                    if (map?.tranCategory) {
                      // console.log('if product tran Category ------------->')

                      if (map?.tranCategory === f?.intxnCategory) {
                        // console.log('if product tran Type ------------->')

                        if (map?.tranType) {
                          if (map?.tranType === f?.intxnType) {
                            // console.log('if product service Type ------------->')

                            if (
                              map?.serviceType &&
                              map?.serviceType === f?.serviceType
                            ) {
                              finalStatements.add(f)
                            }
                          }
                        } else {
                          if (
                            map?.serviceType &&
                            map?.serviceType === f?.serviceType
                          ) {
                            finalStatements.add(f)
                          }
                        }
                      }
                    } else {
                      if (map?.tranType) {
                        if (map?.tranType === f?.intxnType) {
                          if (
                            map?.serviceType &&
                            map?.serviceType === f?.serviceType
                          ) {
                            finalStatements.add(f)
                          }
                        }
                      } else {
                        if (
                          map?.serviceType &&
                          map?.serviceType === f?.serviceType
                        ) {
                          finalStatements.add(f)
                        }
                      }
                    }
                  }
                }
              } else {
                // console.log('else productType ------------------> ')
                if (map?.productSubType) {
                  if (map?.productSubType === f?.productSubType) {
                    if (map?.tranCategory) {
                      if (map?.tranCategory === f?.intxnCategory) {
                        if (map?.tranType) {
                          if (map?.tranType === f?.intxnType) {
                            if (
                              map?.serviceType &&
                              map?.serviceType === f?.serviceType
                            ) {
                              finalStatements.add(f)
                            }
                          }
                        } else {
                          if (
                            map?.serviceType &&
                            map?.serviceType === f?.serviceType
                          ) {
                            finalStatements.add(f)
                          }
                        }
                      }
                    } else {
                      if (map?.tranType) {
                        if (map?.tranType === f?.intxnType) {
                          if (
                            map?.serviceType &&
                            map?.serviceType === f?.serviceType
                          ) {
                            finalStatements.add(f)
                          }
                        }
                      } else {
                        if (
                          map?.serviceType &&
                          map?.serviceType === f?.serviceType
                        ) {
                          finalStatements.add(f)
                        }
                      }
                    }
                  }
                } else {
                  if (map?.tranCategory) {
                    // console.log(
                    //   'inside if of intxnCategory',
                    //   map?.tranCategory,
                    //   f?.intxnCategory
                    // )
                    if (map?.tranCategory === f?.intxnCategory) {
                      if (map?.tranType) {
                        // console.log(
                        //   'inside if of intxnType',
                        //   map?.tranType,
                        //   f?.intxnType
                        // )
                        if (map?.tranType === f?.intxnType) {
                          // console.log(
                          //   'inside if of serviceType',
                          //   map?.serviceType,
                          //   f?.serviceType
                          // )
                          if (
                            map?.serviceType &&
                            map?.serviceType === f?.serviceType
                          ) {
                            // console.log(
                            //   'inside if of serviceType',
                            //   map?.serviceType,
                            //   f?.serviceType
                            // )
                            finalStatements.add(f)
                          }
                        }
                      } else {
                        if (
                          map?.serviceType &&
                          map?.serviceType === f?.serviceType
                        ) {
                          finalStatements.add(f)
                        }
                      }
                    }
                  } else {
                    if (map?.tranType) {
                      if (map?.tranType === f?.intxnType) {
                        if (
                          map?.serviceType &&
                          map?.serviceType === f?.serviceType
                        ) {
                          finalStatements.add(f)
                        }
                      }
                    } else {
                      if (
                        map?.serviceType &&
                        map?.serviceType === f?.serviceType
                      ) {
                        finalStatements.add(f)
                      }
                    }
                  }
                }
              }
            }
          } else {
            // console.log(
            //   'inside else of prod family',
            //   map?.productFamily,
            //   f?.productFamily
            // )
            if (map?.productType) {
              if (map?.productType === f?.productType) {
                // console.log(
                //   'inside if of productType',
                //   map?.productType,
                //   f?.productType
                // )
                if (map?.productSubType) {
                  if (map?.productSubType === f?.productSubType) {
                    if (map?.tranCategory) {
                      if (map?.tranCategory === f?.intxnCategory) {
                        if (map?.tranType) {
                          if (map?.tranType === f?.intxnType) {
                            if (
                              map?.serviceType &&
                              map?.serviceType === f?.serviceType
                            ) {
                              finalStatements.add(f)
                            }
                          }
                        } else {
                          if (
                            map?.serviceType &&
                            map?.serviceType === f?.serviceType
                          ) {
                            finalStatements.add(f)
                          }
                        }
                      }
                    } else {
                      if (map?.tranType) {
                        if (map?.tranType === f?.intxnType) {
                          if (
                            map?.serviceType &&
                            map?.serviceType === f?.serviceType
                          ) {
                            finalStatements.add(f)
                          }
                        }
                      } else {
                        if (
                          map?.serviceType &&
                          map?.serviceType === f?.serviceType
                        ) {
                          finalStatements.add(f)
                        }
                      }
                    }
                  }
                } else {
                  if (map?.tranCategory) {
                    if (map?.tranCategory === f?.intxnCategory) {
                      if (map?.tranType) {
                        if (map?.tranType === f?.intxnType) {
                          if (
                            map?.serviceType &&
                            map?.serviceType === f?.serviceType
                          ) {
                            finalStatements.add(f)
                          }
                        }
                      } else {
                        if (
                          map?.serviceType &&
                          map?.serviceType === f?.serviceType
                        ) {
                          finalStatements.add(f)
                        }
                      }
                    }
                  } else {
                    if (map?.tranType) {
                      if (map?.tranType === f?.intxnType) {
                        if (
                          map?.serviceType &&
                          map?.serviceType === f?.serviceType
                        ) {
                          finalStatements.add(f)
                        }
                      }
                    } else {
                      if (
                        map?.serviceType &&
                        map?.serviceType === f?.serviceType
                      ) {
                        finalStatements.add(f)
                      }
                    }
                  }
                }
              }
            } else {
              if (map?.productSubType) {
                if (map?.productSubType === f?.productSubType) {
                  if (map?.tranCategory) {
                    if (map?.tranCategory === f?.intxnCategory) {
                      if (map?.tranType) {
                        if (map?.tranType === f?.intxnType) {
                          if (
                            map?.serviceType &&
                            map?.serviceType === f?.serviceType
                          ) {
                            finalStatements.add(f)
                          }
                        }
                      } else {
                        if (
                          map?.serviceType &&
                          map?.serviceType === f?.serviceType
                        ) {
                          finalStatements.add(f)
                        }
                      }
                    }
                  } else {
                    if (map?.tranType) {
                      if (map?.tranType === f?.intxnType) {
                        if (
                          map?.serviceType &&
                          map?.serviceType === f?.serviceType
                        ) {
                          finalStatements.add(f)
                        }
                      }
                    } else {
                      if (
                        map?.serviceType &&
                        map?.serviceType === f?.serviceType
                      ) {
                        finalStatements.add(f)
                      }
                    }
                  }
                }
              } else {
                if (map?.tranCategory) {
                  if (map?.tranCategory === f?.intxnCategory) {
                    if (map?.tranType) {
                      if (map?.tranType === f?.intxnType) {
                        if (
                          map?.serviceType &&
                          map?.serviceType === f?.serviceType
                        ) {
                          finalStatements.add(f)
                        }
                      }
                    } else {
                      if (
                        map?.serviceType &&
                        map?.serviceType === f?.serviceType
                      ) {
                        finalStatements.add(f)
                      }
                    }
                  }
                } else {
                  if (map?.tranType) {
                    if (map?.tranType === f?.intxnType) {
                      if (
                        map?.serviceType &&
                        map?.serviceType === f?.serviceType
                      ) {
                        finalStatements.add(f)
                      }
                    }
                  } else {
                    if (
                      map?.serviceType &&
                      map?.serviceType === f?.serviceType
                    ) {
                      finalStatements.add(f)
                    }
                  }
                }
              }
            }
          }
        }
      })
    })
    return Array.from(finalStatements)
  }

  async searchKnowledgeBase(req, searchParam, ouId, deptId, roleId, conn) {
    try {
      const { userFamily } = req
      const { q, c, st, s } = searchParam
      let response
      if (q) {
        const whereClause = {}
        if (s && s === entityCategory?.HELPDESK) {
          // Define a list of stopwords to remove
          const stopwords = new Set(natural.stopwords)

          // Use natural's tokenizer to split the search query into words
          const tokenizer = new natural.WordTokenizer()
          const words = tokenizer.tokenize(q)

          // Remove stopwords from the list of words
          const importantWords = words.filter((word) => !stopwords.has(word))

          if (importantWords) {
            whereClause.requestStatement = {
              [Op.iRegexp]: `(${importantWords.join('|')})`
            }
          }
        }
        // if (st && st !== 'undefined') {
        //   whereClause.serviceType = st
        // }
        console.log('whereClause==========', whereClause)
        const productDet = await conn.Product.findAll({
          where: {
            status: 'AC',
            ...whereClause
          },
          logging: false
        })

        if (userFamily?.includes('UAM_SELFCARE')) {
          whereClause.statementClass = ['SC_CONSUMER', 'SC_ALL', 'SC_BOTH']
        }

        response = await conn.KnowledgeBase.findAll({
          where: {
            status: 'AC',
            ...whereClause
          },
          logging: false
        })

        const statements = new Set()
        let obj

        for (const kb of response) {
          for (const prod of productDet) {
            // console.log('kb.serviceType------>', kb.serviceType, ' prod.serviceType----->', prod.serviceType)
            if (kb.serviceType === prod.serviceType) {
              console.log('KB------->', kb)
              obj = {
                requestId: kb.requestId,
                intxnCategory: kb.intxnCategory,
                intxnType: kb.intxnType,
                serviceCategory: kb.serviceCategory, // product type
                serviceType: kb.serviceType,
                requestStatement: kb.requestStatement,
                intxnResolution: kb.intxnResolution,
                intxnCause: kb.intxnCause,
                triggerType: kb.triggerType,
                priorityCode: kb.priorityCode,
                productFamily: prod.productFamily,
                productType: prod.productType,
                productSubType: prod.productSubType,
                isAppointment: kb.isAppointment
                // productCategory : ''
              }

              // console.log('statements-------->', statements)
              if (!Array.from(statements).find(f => f.requestId == kb.requestId && f.serviceType == kb.serviceType)) {
                statements.add(obj)
              }
            }
          }
        }

        response = await this.checkMapping(statements, deptId, roleId, conn, whereClause);

      } else if (c) {
        let whereClause = {}
        if (!st) {
          whereClause.intxnCategory = c
          whereClause.status = 'AC'
        } else {
          whereClause.intxnCategory = c
          whereClause.serviceType = st,
            whereClause.status = 'AC'
        }
        if (userFamily?.includes('UAM_SELFCARE')) {
          whereClause.statementClass = ['SC_CONSUMER', 'SC_ALL', 'SC_BOTH']
        }

        const responseData = await conn.KnowledgeBase.findAll({
          where: whereClause
        });

        const productDet = await conn.Product.findAll({
          where: {
            status: 'AC'
          },
          logging: false
        })

        const statements = new Set()
        let obj

        for (const kb of responseData) {
          for (const prod of productDet) {
            if (kb.serviceType === prod.serviceType) {
              obj = {
                requestId: kb.requestId,
                intxnCategory: kb.intxnCategory,
                intxnType: kb.intxnType,
                serviceCategory: kb.serviceCategory, // product type
                serviceType: kb.serviceType,
                requestStatement: kb.requestStatement,
                intxnResolution: kb.intxnResolution,
                intxnCause: kb.intxnCause,
                triggerType: kb.triggerType,
                priorityCode: kb.priorityCode,
                productFamily: prod.productFamily,
                productType: prod.productType,
                productSubType: prod.productSubType,
                isAppointment: kb.isAppointment
              }

              if (!Array.from(statements).find(f => f.requestId == kb.requestId && f.serviceType == kb.serviceType)) {
                statements.add(obj)
              }
            }
          }
        }

        response = await this.checkMapping(statements, deptId, roleId, conn, {})
      }

      if (response.length === 0) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'No data found from Knowledge Base',
          data: []
        }
      }

      if (q) {
        response = response.filter(
          (x) => x.requestStatement?.toLowerCase()?.includes(q?.toLowerCase())
        );
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
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

  async requestStatementList(body, query, conn) {
    try {
      // const {} = body
      const { limit = 10, page = 0 } = query
      const offSet = page * limit
      const whereClause = {}
      const response = await conn.KnowledgeBase.findAndCountAll({
        include: [
          {
            model: conn.BusinessEntity,
            as: 'intxnCategoryDesc'
          },
          {
            model: conn.BusinessEntity,
            as: 'intxnTypeDesc'
          },
          {
            model: conn.BusinessEntity,
            as: 'intxnCauseDesc'
          },
          {
            model: conn.BusinessEntity,
            as: 'serviceTypeDesc'
          },
          {
            model: conn.BusinessEntity,
            as: 'serviceCategoryDesc'
          },
          {
            model: conn.BusinessEntity,
            as: 'priorityCodeDesc'
          },
          {
            model: conn.BusinessEntity,
            as: 'intxnResolutionDesc'
          }
        ],
        order: [['requestId', 'ASC']],
        where: whereClause,
        offset: offSet,
        limit: Number(limit)
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
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

  async getKnowledgeBase(searchParam, departmentId, userId, roleId, t) {
    try {
      let { requestId, customerUuid, serviceUuid, accountUuid } = searchParam

      if (!requestId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let response = await instance.conn.KnowledgeBase.findOne({
        include: [
          {
            attributes: ['code', 'description'],
            model: instance.conn.BusinessEntity,
            as: 'intxnResolutionDesc'
          }
        ],
        where: {
          requestId
        }
      })

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId,
        source: 'KnowledgeBase'
      }

      if (!response) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'No data found from Knowledge Base',
          data: []
        }
      }

      const resolutionAction = {
        mismatchService: false,
        multipleService: false,
        noService: false,
        data: []
      }

      response = response?.dataValues ?? response
      // console.log('response-------->', response)
      let activeServiceDetails
      if (response?.intxnType !== 'REQUEST' && response?.intxnType !== 'GENERAL') {
        // console.log('im here in if---->',response?.intxnType)
        if (response.triggerType === 'A') {
          if (serviceUuid && accountUuid) {
            activeServiceDetails = await this.conn.CustServices.findOne({
              where: {
                serviceUuid
                // status: defaultStatus?.CUSTOMER_SERVICE?.ACTIVE
              }
            })
            activeServiceDetails = activeServiceDetails?.dataValues
              ? activeServiceDetails?.dataValues
              : activeServiceDetails
            if (response.serviceType !== activeServiceDetails.serviceType) {
              response.resolutionAction = {
                ...resolutionAction,
                mismatchService: true
              }
              return {
                status: statusCodeConstants.SUCCESS,
                message:
                  'There is no service mapped to you related this statement.',
                data: response
              }
            }
          } else if (customerUuid) {
            activeServiceDetails = await this.conn.CustServices.findAll({
              include: [
                {
                  attributes: ['code', 'description'],
                  model: this.conn.BusinessEntity,
                  as: 'serviceTypeDesc'
                }
              ],
              attributes: [
                'serviceId',
                'serviceUuid',
                'serviceNo',
                'serviceName',
                'serviceCategory',
                'serviceType',
                'accountUuid',
                'customerId'
              ],
              where: {
                customerUuid,
                serviceType: response?.serviceType
                // serviceCategory: response?.serviceCategory,
                // status: defaultStatus?.CUSTOMER_SERVICE?.ACTIVE
              },
              raw: true
            })

            // console.log(
            //   'activeServiceDetails-----sss---->',
            //   activeServiceDetails
            // )

            if (activeServiceDetails && activeServiceDetails?.length > 1) {
              response.resolutionAction = {
                ...resolutionAction,
                multipleService: true,
                data: activeServiceDetails
              }
              return {
                status: statusCodeConstants.SUCCESS,
                message:
                  'There are multiple services mapped to you related this statement. Please select one of the service.',
                data: response
              }
            } else if (activeServiceDetails && activeServiceDetails?.length === 1) {
              activeServiceDetails = activeServiceDetails?.dataValues
                ? activeServiceDetails?.dataValues
                : activeServiceDetails
              // console.log('here------>', activeServiceDetails)
              response.resolutionAction = {
                ...resolutionAction,
                multipleService: false,
                data: activeServiceDetails
              }
              serviceUuid = activeServiceDetails.serviceUuid
              accountUuid = activeServiceDetails.accountUuid
              searchParam.serviceUuid = activeServiceDetails[0].serviceUuid
              searchParam.accountUuid = activeServiceDetails[0].accountUuid
            } else {
              response.resolutionAction = {
                ...resolutionAction,
                noService: true
              }
              return {
                status: statusCodeConstants.SUCCESS,
                message:
                  'There is no service mapped to you related this statement...',
                data: response
              }
            }
          } else {
            return {
              status: statusCodeConstants.SUCCESS,
              message:
                'Your account is not yet active please contact admin',
              data: []
            }
          }
        }
      }
      // console.log('response.triggerType--------->', response.triggerType)
      // console.log('entityCategory.KB--------->', entityCategory.KB)
      // console.log('searchParam?.moduleName--------->', searchParam?.moduleName)
      if (
        response &&
        (response.triggerType === 'A' || response.triggerType === 'M')
      ) {
        const workflowMappings = await this.conn.WorkflowMapping.findAll({
          where: {
            moduleName: searchParam?.moduleName || entityCategory.KB,
            status: defaultStatus.ACTIVE
          },
          logging: true
        })

        let flwId
        for (const w of workflowMappings) {
          const mapping = w.mappingPayload
          if (
            mapping.intxnCategory && mapping?.intxnCategory === response.intxnCategory &&
            mapping.intxnType && mapping?.intxnType === response.intxnType &&
            mapping.serviceType && mapping?.serviceType === response.serviceType &&
            mapping?.requestStatementIds?.includes(requestId)
          ) {
            flwId = w.workflowId
            break
          }
        }
        if (flwId) {
          const conversationUid = uuidv4()
          response.flwId = flwId
          response.conversationUid = conversationUid
          const smartAssistDetails = {
            smartAssistConversationId: conversationUid,
            smartAssistType: 'RECEIVED',
            smartAssistValue: {
              ...response,
              ...searchParam,
              customerId:
                activeServiceDetails?.length > 0
                  ? activeServiceDetails[0]?.customerId
                  : activeServiceDetails?.customerId || searchParam?.customerId,
              serviceId:
                activeServiceDetails?.length > 0
                  ? activeServiceDetails[0]?.serviceId
                  : activeServiceDetails?.serviceId
            },
            smartAssistTxnUuid: uuidv4(),
            conversationActionType: 'INTIAL_CONFIG',
            seqNo: 1,
            ...commonAttrib
          }
          await this.conn.smartAssist.create(smartAssistDetails, {
            transaction: t
          })
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
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

  async createRequestStatement(body, departmentId, userId, roleId, t) {
    try {
      if (!body) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }

      let intxnResolution = ''
      if (body.isDropdown === 'Y') {
        intxnResolution = body.intxnResolution
      } else {
        const query = 'select be_next_seq(\'be_intxn_resolution_no_seq\',\'INTXN_RESOLUTION\')'
        const resp = await this.conn.sequelize.query(query, {
          type: QueryTypes.SELECT,
          transaction: t
        })
        intxnResolution = resp[0].be_next_seq
        const commonAttribBusinessEntity = {
          tranId: uuidv4(),
          createdDeptId: departmentId,
          createdRoleId: roleId,
          createdBy: userId,
          updatedBy: userId
        }
        const businessEntityBody = {
          code: intxnResolution,
          description: body.intxnResolution,
          codeType: 'INTXN_RESOLUTION',
          mappingPayload: {},
          status: 'AC',
          ...commonAttribBusinessEntity
        }
        await instance.conn.BusinessEntity.create(businessEntityBody, {
          transaction: t
        })
      }

      const requestStatementBody = {
        triggerType: 'A',
        status: 'AC',
        ...body,
        intxnResolution,
        ...commonAttrib
      }
      const response = await instance.conn.KnowledgeBase.create(
        requestStatementBody,
        { transaction: t }
      )
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
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

  async editRequestStatement(body, params, departmentId, userId, roleId, t) {
    try {
      if (!body) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }
      const oldBusinessEntity = await instance.conn.KnowledgeBase.findOne({
        where: {
          requestId: Number(params.id)
        },
        raw: true,
        transaction: t
      })
      let intxnResolution = body.intxnResolution
      if (oldBusinessEntity.intxnResolution !== body.intxnResolution) {
        if (body.isDropdown === 'Y') {
          intxnResolution = body.intxnResolution
        } else {
          const query = 'select be_next_seq(\'be_intxn_resolution_no_seq\',\'INTXN_RESOLUTION\')'
          const resp = await this.conn.sequelize.query(query, {
            type: QueryTypes.SELECT,
            transaction: t
          })
          intxnResolution = resp[0].be_next_seq
          const commonAttribBusinessEntity = {
            tranId: uuidv4(),
            createdDeptId: departmentId,
            createdRoleId: roleId,
            createdBy: userId,
            updatedBy: userId
          }
          const businessEntityBody = {
            code: intxnResolution,
            description: body.intxnResolution,
            codeType: 'INTXN_RESOLUTION',
            mappingPayload: {},
            status: 'AC',
            ...commonAttribBusinessEntity
          }
          await instance.conn.BusinessEntity.create(businessEntityBody, {
            transaction: t
          })
        }
      }
      const requestStatementBody = {
        ...body,
        intxnResolution
      }
      const response = await instance.conn.KnowledgeBase.update(
        requestStatementBody,
        { where: { requestId: Number(params.id) }, transaction: t }
      )
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
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

  async AddRequestStatement(payload, deptId, roleId, userId, t) {
    try {
      if (!payload) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      const requestStatement = {
        intxnCategory: payload?.intxnCategory,
        intxnType: payload?.intxnType,
        serviceCategory: payload?.serviceCategory,
        serviceType: payload?.serviceType,
        status: 'TEMP',
        requestStatement: payload?.requestStatement,
        priorityCode: payload?.priorityCode,
        tranId: uuidv4(),
        createdDeptId: deptId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId
      }

      const response = await this.conn.KnowledgeBase.create(requestStatement, {
        transaction: t
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
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

  async ExKNB(searchParam, departmentId, userId, roleId, t) {
    try {
      let { requestId, customerUuid, serviceUuid, accountUuid } = searchParam

      if (!requestId) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: defaultMessage.MANDATORY_FIELDS_MISSING
        }
      }

      let response = await instance.conn.KnowledgeBase.findOne({
        where: {
          requestId
        }
      })

      // const conversationUid = uuidv4()
      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: departmentId,
        createdRoleId: roleId,
        createdBy: userId,
        updatedBy: userId,
        source: 'KnowledgeBase'
      }

      if (!response) {
        return {
          status: statusCodeConstants.VALIDATION_ERROR,
          message: 'No data found from Knowledge Base',
          data: []
        }
      }

      const resolutionAction = {
        mismatchService: false,
        multipleService: false,
        noService: false,
        data: []
      }

      response = response?.dataValues ? response?.dataValues : response
      // response.resolutionAction = { ...resolutionAction }
      //  const intelligenceResponse = await this.intelligenceService.predictInteractionSolution(response, { customerUuid, serviceUuid, accountUuid, actionCount })
      //  response.intelligenceResponse = intelligenceResponse
      //  console.log('intelligenceResponse==>', intelligenceResponse)
      let serviceDetails
      if (
        !(
          [
            'SERVICE_RELATED',
            'PRODUCT_RELATED',
            'ACCOUNT_RELATED',
            'OFFERS_RELATED'
          ].includes(response.intxnCategory) &&
          ['INTEREST'].includes(response.intxnType)
        ) &&
        response.triggerType === 'A'
      ) {
        if (serviceUuid && accountUuid) {
          serviceDetails = await this.conn.CustServices.findOne({
            where: {
              serviceUuid
            }
          })

          if (response.serviceType !== serviceDetails.serviceType) {
            response.resolutionAction = {
              ...resolutionAction,
              mismatchService: true
            }
            return {
              status: statusCodeConstants.VALIDATION_ERROR,
              message:
                'There is no service mapped to you related this statement. Are you sure you have chosen the right service',
              data: response
            }
          }
        } else if (customerUuid) {
          serviceDetails = await this.conn.CustServices.findAll({
            attributes: [
              'serviceUuid',
              'serviceNo',
              'serviceName',
              'serviceCategory',
              'serviceType'
            ],
            where: {
              customerUuid
            }
          })

          if (serviceDetails && serviceDetails?.length > 1) {
            response.resolutionAction = {
              ...resolutionAction,
              multipleService: true,
              data: serviceDetails
            }
            return {
              status: statusCodeConstants.SUCCESS,
              message:
                'There is multiple services mapped to you. Please select one of the following',
              data: response
            }
          } else if (serviceDetails && serviceDetails?.length === 1) {
            serviceDetails = serviceDetails?.dataValues
              ? serviceDetails?.dataValues
              : serviceDetails
            serviceUuid = serviceDetails.serviceUuid
            accountUuid = serviceDetails.accountUuid
          } else {
            response.resolutionAction = {
              ...resolutionAction,
              noService: true
            }
            return {
              status: statusCodeConstants.SUCCESS,
              message:
                'There is no service mapped to you !!. Please click the link below to activate the new service.',
              data: response
            }
          }
        }
      }

      // console.log('response-------->', response)

      if (response && response.triggerType === 'A') {
        const workflowMappings = await this.conn.WorkflowMapping.findAll({
          where: {
            moduleName: entityCategory.KB,
            status: defaultStatus.ACTIVE
          }
        })
        // console.log(response)
        let flwId
        for (const w of workflowMappings) {
          const mapping = w.mappingPayload
          // mapping.orderType && mapping.serviceCategory === serviceCategory &&
          // mapping.serviceType && mapping.serviceType === serviceType &&
          if (
            mapping.intxnCategory &&
            mapping?.intxnCategory === response.intxnCategory &&
            mapping.intxnType &&
            mapping?.intxnType === response.intxnType
          ) {
            flwId = w.workflowId
            break
          }
        }
        if (flwId) {
          const conversationUid = uuidv4()
          response.flwId = flwId
          response.conversationUid = conversationUid

          const smartAssistDetails = {
            smartAssistConversationId: conversationUid,
            smartAssistType: 'RECEIVED',
            smartAssistValue: { ...response, ...searchParam },
            smartAssistTxnUuid: uuidv4(),
            conversationActionType: 'INTIAL_CONFIG',
            seqNo: 1,
            ...commonAttrib
          }
          await this.conn.smartAssist.create(smartAssistDetails, {
            transaction: t
          })
        }

        // console.log('flwId is ', flwId)
        // const options = { customerUuid, accountUuid, serviceUuid }
        // const workflowExecute = await instance.automatedResolutionResponse(commonAttrib, conversationUid, '16')
        // console.log('workflowExecute===>', workflowExecute)
        /*
        await assignWFToEntity(conversationUid, entityCategory.KB, '15', commonAttrib, this.conn, t)
        const workflowExecute = await startWorkFlowEngineManual(conversationUid, options, this.conn, t)

        if (workflowExecute.status === 'SUCCESS' && response?.intxnCategory) {
          const workflwHdrDetails = await this.conn.WorkflowHdr.findOne({
            attributes: ['nextActivityId', 'wfContext'],
            where: {
              entityId: conversationUid
            },
            transaction: t
          })
          const workflowHdrDetailsContext = workflwHdrDetails?.wfContext?.context[workflwHdrDetails.nextActivityId]
          if (!isEmpty(workflowHdrDetailsContext?.task_1?.data)) {
            response.resolutionAction = { ...resolutionAction, data: workflowHdrDetailsContext?.task_1?.data }
          } else {
            response = {
              ...response,
              intxnResolution: workflowHdrDetailsContext?.task_1?.message,
              resolutionAction: { ...resolutionAction }
            }
          }
        }
        */
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
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

  async automatedResolutionResponse(data, entityId, flowId) {
    logger.debug('Started Bot Live chat Message....')
    const t = await this.conn.sequelize.transaction()
    try {
      let callAgainFlag = { callAgain: false }
      callAgainFlag = await processTheCurrentFlow(
        data,
        entityId,
        callAgainFlag,
        flowId,
        this.conn,
        t
      )
      while (callAgainFlag.callAgain && callAgainFlag?.livechat === undefined) {
        callAgainFlag = await processTheCurrentFlow(
          data,
          entityId,
          callAgainFlag,
          flowId,
          this.conn,
          t
        )
      }
      await t.commit()
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully sent automated response',
        data: callAgainFlag
      }
    } catch (err) {
    } finally {
      if (t && !t.finished) {
        await t.rollback()
      }
    }
  }

  async searchKnowledgeBaseByHelpdesk(searchParam, conn) {
    try {
      if (!searchParam) {
        return {
          status: statusCodeConstants?.MANDATORY_FIELDS_MISSING,
          message: defaultMessage?.MANDATORY_FIELDS_MISSING
        }
      }

      const { s } = searchParam

      // Define a list of stopwords to remove
      const stopwords = new Set(natural.stopwords)

      // Use natural's tokenizer to split the search query into words
      const tokenizer = new natural.WordTokenizer()
      const words = tokenizer.tokenize(s)

      // Remove stopwords from the list of words
      const importantWords = words.filter((word) => !stopwords.has(word))

      const response = await conn.KnowledgeBase.findAll({
        where: {
          requestStatement: {
            [Op.iRegexp]: `(${importantWords.join('|')})`
          }
        },
        limit: 5
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async getKnowledgeBaseConsumer(searchParam, conn) {
    try {
      const response = await this.conn.KnowledgeBase.findAll({
        where: {
          status: defaultStatus.ACTIVE,
          statementClass: ['SC_BOTH', 'SC_CONSUMER']
        }
      })

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }

  async checkSmartAssist(payload, conn, t) {
    try {
      let response = { smartAssist: 'N' }
      // || !payload?.customerId

      if (!payload || !payload?.requestId) {
        return {
          status: statusCodeConstants.SUCCESS,
          message: 'Successfully fetch knowledge Base',
          data: response
        }
      }

      const getKnowledgeBase = await conn.KnowledgeBase.findOne({
        where: {
          requestId: payload?.requestId
        }
      })

      // console.log('payload ------------->', payload)

      let checkCustomer
      let checkServiceDetails
      if (Number(payload?.customerId)) {
        checkCustomer = await conn.Customer.findOne({
          where: {
            customerId: Number(payload?.customerId)
          }
        })

        checkServiceDetails = await conn.CustServices.findAll({
          where: {
            customerUuid: checkCustomer?.customerUuid
          }
        })
      }

      const commonAttrib = {
        tranId: uuidv4(),
        createdDeptId: systemDeptId,
        createdRoleId: systemRoleId,
        createdBy: systemUserId,
        updatedBy: systemUserId,
        source: 'KnowledgeBase'
      }

      if (getKnowledgeBase && getKnowledgeBase?.triggerType === 'A') {
        const workflowMappings = await this.conn.WorkflowMapping.findAll({
          where: {
            moduleName: entityCategory.KB,
            status: defaultStatus.ACTIVE
          }
        })

        let flwId
        for (const w of workflowMappings) {
          const mapping = w.mappingPayload
          if (
            mapping.intxnCategory &&
            mapping?.intxnCategory === getKnowledgeBase.intxnCategory &&
            mapping.intxnType &&
            mapping?.intxnType === getKnowledgeBase.intxnType
          ) {
            flwId = w.workflowId
            break
          }
        }
        if (flwId) {
          const conversationUid = uuidv4()
          response = {
            ...response,
            requestId: getKnowledgeBase.requestId,
            intxnCategory: getKnowledgeBase.intxnCategory,
            intxnType: getKnowledgeBase.intxnType,
            serviceCategory: getKnowledgeBase.serviceCategory,
            serviceType: getKnowledgeBase.serviceType,
            intxnCause: getKnowledgeBase.intxnCause,
            status: getKnowledgeBase.status,
            requestStatement: getKnowledgeBase.requestStatement,
            intxnResolution: getKnowledgeBase.intxnResolution,
            priorityCode: getKnowledgeBase.priorityCode,
            triggerType: getKnowledgeBase.triggerType,
            isAppointment: getKnowledgeBase.isAppointment,
            statementClass: getKnowledgeBase.statementClass,
            flwId,
            conversationUid,
            smartAssist: 'Y'
          }
          // response.flwId = flwId
          // response.conversationUid = conversationUid
          // response.smartAssist = 'Y'
          // checkServiceDetails.length === 1 ?

          const smartAssistDetails = {
            smartAssistConversationId: conversationUid,
            smartAssistType: 'RECEIVED',
            smartAssistValue: {
              ...response,
              ...payload,
              customerId: checkCustomer?.customerId,
              customerUuid: checkCustomer?.customerUuid,
              serviceId: checkServiceDetails?.[0]?.serviceId,
              serviceUuid: checkServiceDetails?.[0]?.serviceUuid
            },
            smartAssistTxnUuid: uuidv4(),
            conversationActionType: 'INTIAL_CONFIG',
            seqNo: 1,
            ...commonAttrib
          }
          await this.conn.smartAssist.create(smartAssistDetails, {
            transaction: t
          })
        } else {
          response = {
            ...response,
            requestId: getKnowledgeBase.requestId,
            intxnCategory: getKnowledgeBase.intxnCategory,
            intxnType: getKnowledgeBase.intxnType,
            serviceCategory: getKnowledgeBase.serviceCategory,
            serviceType: getKnowledgeBase.serviceType,
            intxnCause: getKnowledgeBase.intxnCause,
            status: getKnowledgeBase.status,
            requestStatement: getKnowledgeBase.requestStatement,
            intxnResolution: getKnowledgeBase.intxnResolution,
            priorityCode: getKnowledgeBase.priorityCode,
            triggerType: getKnowledgeBase.triggerType,
            isAppointment: getKnowledgeBase.isAppointment,
            statementClass: getKnowledgeBase.statementClass
          }
        }
      } else {
        response = {
          ...response,
          requestId: getKnowledgeBase.requestId,
          intxnCategory: getKnowledgeBase.intxnCategory,
          intxnType: getKnowledgeBase.intxnType,
          serviceCategory: getKnowledgeBase.serviceCategory,
          serviceType: getKnowledgeBase.serviceType,
          intxnCause: getKnowledgeBase.intxnCause,
          status: getKnowledgeBase.status,
          requestStatement: getKnowledgeBase.requestStatement,
          intxnResolution: getKnowledgeBase.intxnResolution,
          priorityCode: getKnowledgeBase.priorityCode,
          triggerType: getKnowledgeBase.triggerType,
          isAppointment: getKnowledgeBase.isAppointment,
          statementClass: getKnowledgeBase.statementClass
        }
      }

      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
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

  async searchKnowledgeBaseConsumer(searchParam, conn) {
    try {
      if (!searchParam) {
        return {
          status: statusCodeConstants?.MANDATORY_FIELDS_MISSING,
          message: defaultMessage?.MANDATORY_FIELDS_MISSING
        }
      }

      const { q } = searchParam

      // Define a list of stopwords to remove
      const stopwords = new Set(natural.stopwords)

      // Use natural's tokenizer to split the search query into words
      const tokenizer = new natural.WordTokenizer()
      const words = tokenizer.tokenize(q)

      // Remove stopwords from the list of words
      const importantWords = words.filter((word) => !stopwords.has(word))

      const response = await conn.KnowledgeBase.findAll({
        where: {
          status: defaultStatus.ACTIVE,
          statementClass: ['SC_BOTH', 'SC_CONSUMER'],
          requestStatement: {
            [Op.iRegexp]: `(${importantWords.join('|')})`
          }
        },
        limit: 10
      })
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Successfully fetch knowledge Base',
        data: response || []
      }
    } catch (error) {
      logger.error(error)
      return {
        status: statusCodeConstants.ERROR,
        message: 'Internal server error'
      }
    }
  }
}

module.exports = KnowledgeBaseService
