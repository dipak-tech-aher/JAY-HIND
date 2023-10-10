import { logger, statusCodeConstants, entityCategory, defaultStatus, defaultMessage } from '@utils'
import { POSITIVE_INTXN_TYPES, NEGATIVE_INTXN_TYPES, NEUTRAL_INTXN_TYPES } from '@utils/constant';
import { Op } from 'sequelize';

let instance

class IntelligenceService {
    constructor(conn) {
        if (!instance) {
            instance = this
        }
        this.conn = conn;
        return instance
    }

    async predictInteractionSolution(intxnDetails, metaData = {}) {
        let response;
        const { intxnCategory } = intxnDetails;
        switch (intxnCategory) {
            case 'PRODUCT_RELATED':
                response = await this.productRelatedSolution(intxnDetails, metaData)
                break;
            case 'OFFERS_RELATED':
                response = await this.offersRelatedSolution(intxnDetails, metaData)
                break;
            case 'CONTRACT_RELATED':
                response = await this.contractRelatedSolution(intxnDetails, metaData)
                break;
            case 'ACCOUNT_RELATED':
                response = await this.accountRelatedSolution(intxnDetails, metaData)
                break;
            case 'SERVICE_RELATED':
                response = await this.serviceRelatedSolution(intxnDetails, metaData)
                break;
            case 'BILLING_RELATED':
                response = await this.billingRelatedSolution(intxnDetails, metaData)
                break;
            case 'DELIVERY_RELATED':
                response = await this.deliveryRelatedSolution(intxnDetails, metaData)
                break;
            case 'SUPPORT_RELATED':
                response = await this.supportRelatedSolution(intxnDetails, metaData)
                break;
            case 'PAYMENT_RELATED':
                response = await this.paymentRelatedSolution(intxnDetails, metaData)
                break;
            case 'APPOINTMENT_RELATED':
                response = await this.appointmentRelatedSolution(intxnDetails, metaData)
                break;
            case 'NOTIFICATION_RELATED':
                response = await this.notificationRelatedSolution(intxnDetails, metaData)
                break;
            case 'FAULT_RELATED':
                response = await this.faultRelatedSolution(intxnDetails, metaData)
                break;
            case 'ACCESS_RELATED':
                response = await this.accessRelatedSolution(intxnDetails, metaData)
                break;
            default:
                response = { status: false, message: "Category not in the list" }
        }

        return response;
    }

    // PRODUCT RELATED SOLUTIONS AND DATA STARTS HERE
    async productRelatedSolution(intxnDetails, metaData) {
        const { intxnCategory, intxnType, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount, location } = metaData;

        let outcome = {};
        let data = [];

        if (actionCount == 1) {
            let orConditions = []
            let whereObj = {
                status: defaultStatus.ACTIVE,
                [Op.or]: orConditions
            }

            if (!NEGATIVE_INTXN_TYPES.includes(intxnType)) {
                if (location) {
                    orConditions.push({ productLocation: { [Op.contains]: [location] } })
                    whereObj = {
                        ...whereObj,
                        [Op.or]: orConditions
                    }
                }
            }

            let productCatsServicetypes = [serviceType]
            let intxnIds = [];
            let orderTxnIds = [];
            let interactions = [];

            if (!NEGATIVE_INTXN_TYPES.includes(intxnType)) {
                interactions = await this.conn.Interaction.findAll({
                    where: {
                        customerUuid, intxnCategory, intxnType, serviceCategory
                    }
                })
                if (interactions.length > 0) {
                    interactions.forEach(interaction => {
                        productCatsServicetypes.push(interaction.serviceType)
                        intxnIds.push(interaction.intxnId)
                    })
                }

                orConditions.push({
                    [Op.and]: [
                        { productSubCategory: { [Op.startsWith]: `PSC_${customerDetails.customerCategory}_` } },
                        { serviceType: { [Op.in]: productCatsServicetypes } }
                    ]
                })

                whereObj = {
                    ...whereObj,
                    [Op.or]: orConditions
                }
            }

            let orderTxns = await this.conn.OrdersTxnHdr.findAll({
                where: {
                    [Op.or]: [
                        { customerId: customerDetails.customerId },
                        {
                            intxnId: {
                                [Op.in]: intxnIds
                            }
                        }
                    ]
                }
            });

            if (orderTxns.length > 0) {
                orderTxns.forEach(orderTxn => {
                    orderTxnIds.push(orderTxn.orderTxnId)
                })

                let OrdersTxnDtls = await this.conn.OrdersTxnDtl.findAll({
                    where: {
                        orderTxnId: {
                            [Op.in]: orderTxnIds
                        }
                    }
                });

                if (OrdersTxnDtls.length) {
                    let productIds = OrdersTxnDtls.map(OrdersTxnDtl => OrdersTxnDtl.productId);
                    orConditions.push({ productId: { [Op.in]: productIds } })
                    whereObj = {
                        ...whereObj,
                        [Op.or]: orConditions
                    }
                }
            }

            console.log(products, "i'm herer...."); 

            let products = await this.conn.Product.findAll({
                where: whereObj,
                include: [
                    { model: this.conn.ProductCharge, as: 'productChargesList' },
                    { model: this.conn.BusinessEntity, as: 'productFamilyDesc' },
                    { model: this.conn.BusinessEntity, as: 'productCategoryDesc' },
                    { model: this.conn.BusinessEntity, as: 'productSubCategoryDesc' },
                    { model: this.conn.BusinessEntity, as: 'productTypeDesc' },
                    { model: this.conn.BusinessEntity, as: 'serviceTypeDesc' },
                    { model: this.conn.BusinessEntity, as: 'provisioningTypeDesc' },
                    { model: this.conn.BusinessEntity, as: 'chargeTypeDesc' }
                ]
            });

            console.log(products, 'im here....');

            products.forEach(product => {
                let tempArr = []
                tempArr.push({
                    name: "Product name",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.productName
                })
                tempArr.push({
                    name: "Product category",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.productCategoryDesc?.description
                })
                tempArr.push({
                    name: "Service type",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.serviceTypeDesc?.description
                })
                tempArr.push({
                    name: "Warranty period",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.warrantyPeriod
                })
                // tempArr.push({
                //     name: "Charge list",
                //     type: "text",
                //     entity: "PRODUCT_CHARGELIST",
                //     value: product.productChargesList
                // })
                data.push({
                    confirmMessage: "Would you like to proceed to order screen?",
                    message: "We have found excellent offers for you.",
                    displayType: "SELECTABLE",
                    result: tempArr
                })
            })
        } else if (actionCount == 2) {
            data = {
                message: resolutionInformation.description,
                autoCreate: true
            }
        }

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": true,
                "interactionCreation": false
            };
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }
    // PRODUCT RELATED SOLUTIONS AND DATA ENDS HERE

    // SERVICE RELATED SOLUTIONS AND DATA STARTS HERE
    async serviceRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": true,
                "interactionCreation": false
            };
            let products = await this.conn.Product.findAll({
                where: { serviceType },
                include: [
                    { model: this.conn.ProductCharge, as: 'productChargesList' },
                    { model: this.conn.BusinessEntity, as: 'productFamilyDesc' },
                    { model: this.conn.BusinessEntity, as: 'productCategoryDesc' },
                    { model: this.conn.BusinessEntity, as: 'productSubCategoryDesc' },
                    { model: this.conn.BusinessEntity, as: 'productTypeDesc' },
                    { model: this.conn.BusinessEntity, as: 'serviceTypeDesc' },
                    { model: this.conn.BusinessEntity, as: 'provisioningTypeDesc' },
                    { model: this.conn.BusinessEntity, as: 'chargeTypeDesc' }
                ]
            });

            console.log(products, 'im here....');

            products.forEach(product => {
                let tempArr = []
                tempArr.push({
                    name: "Product name",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.productName
                })
                tempArr.push({
                    name: "Product category",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.productCategoryDesc?.description
                })
                tempArr.push({
                    name: "Service type",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.serviceTypeDesc?.description
                })
                tempArr.push({
                    name: "Warranty period",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.warrantyPeriod
                })
                // tempArr.push({
                //     name: "Charge list",
                //     type: "text",
                //     entity: "PRODUCT_CHARGELIST",
                //     value: product.productChargesList
                // })
                data.push({
                    confirmMessage: "Would you like to proceed to order screen?",
                    message: "We have found excellent offers for you.",
                    displayType: "SELECTABLE",
                    result: tempArr
                })
            })
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                const service = await this.conn.CustServices.findOne({
                    where: { customerUuid, serviceUuid },
                    include: [
                        { model: this.conn.BusinessEntity, as: 'serviceStatusDesc' },
                        { model: this.conn.BusinessEntity, as: 'serviceCatDesc' },
                        { model: this.conn.BusinessEntity, as: 'serviceTypeDesc' }
                    ]
                });
                let message = "";
                let usedPercentage = (Number(service.serviceUsage) / Number(service.serviceLimit)) * 100;
                if (usedPercentage >= 90) {
                    message = `It looks like ${usedPercentage.toFixed(2)}% of your available data. Kindly top-up to continue your service smoothly, else proceed to raise a complaint to proceed further.`
                } else {
                    message = `You have consumed only ${usedPercentage.toFixed(2)}% of data. Still good to go. If you feel any disputes, please raise a complaint to proceed further.`
                }
                console.log(service)
                data = [
                    {
                        confirmMessage: "Is your query resolved?",
                        message: message,
                        displayType: "READ-ONLY",
                        result: [
                            {
                                name: "Service Name",
                                type: "text",
                                entity: "SERVICE",
                                value: service.serviceName
                            },
                            {
                                name: "Service Category",
                                type: "text",
                                entity: "SERVICE",
                                value: service.serviceCatDesc.description
                            },
                            {
                                name: "Service Type",
                                type: "text",
                                entity: "SERVICE",
                                value: service.serviceTypeDesc.description
                            },
                            {
                                name: "Service Status",
                                type: "text",
                                entity: "SERVICE",
                                value: service.serviceStatusDesc.description
                            },
                            {
                                name: "Service Usage",
                                type: "text",
                                entity: "SERVICE",
                                value: `${service.serviceUsage} ${service.serviceUnit}`
                            },
                            {
                                name: "Service limit",
                                type: "text",
                                entity: "SERVICE",
                                value: service.serviceLimit
                            },
                            {
                                name: "Available balance",
                                type: "text",
                                entity: "SERVICE",
                                value: `${service.serviceBalance} ${service.serviceUnit}`
                            }
                        ]
                    }
                ]
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }
    // SERVICE RELATED SOLUTIONS AND DATA ENDS HERE

    // BILLING RELATED SOLUTIONS AND DATA STARTS HERE
    async billingRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": true,
                "interactionCreation": false
            };
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                const billing = await this.conn.Billing.findOne({
                    where: { customerUuid, serviceUuid, accountUuid }
                });
                data = [
                    {
                        confirmMessage: "Is your query resolved?",
                        message: "Below is your billing details.",
                        displayType: "READ-ONLY",
                        result: [
                            {
                                name: "Bill Amount",
                                type: "text",
                                entity: "BILLING",
                                value: billing.totInvAmount
                            },
                            {
                                name: "Bill Date",
                                type: "text",
                                entity: "BILLING",
                                value: billing.billDate
                            },
                            {
                                name: "Download latest bill",
                                type: "media",
                                entity: "BILLING",
                                value: "#"
                            }
                        ]
                    }
                ]
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }
    // BILLING RELATED SOLUTIONS AND DATA ENDS HERE

    async offersRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": true,
                "interactionCreation": false
            };
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                let products = await this.conn.Product.findAll({
                    where: { serviceType },
                    include: [
                        { model: this.conn.ProductCharge, as: 'productChargesList' },
                        { model: this.conn.BusinessEntity, as: 'productFamilyDesc' },
                        { model: this.conn.BusinessEntity, as: 'productCategoryDesc' },
                        { model: this.conn.BusinessEntity, as: 'productSubCategoryDesc' },
                        { model: this.conn.BusinessEntity, as: 'productTypeDesc' },
                        { model: this.conn.BusinessEntity, as: 'serviceTypeDesc' },
                        { model: this.conn.BusinessEntity, as: 'provisioningTypeDesc' },
                        { model: this.conn.BusinessEntity, as: 'chargeTypeDesc' }
                    ]
                });
    
                console.log(products, 'im here....');
    
                products.forEach(product => {
                    let tempArr = []
                    tempArr.push({
                        name: "Product name",
                        type: "text",
                        entity: "PRODUCT",
                        value: product?.productName
                    })
                    tempArr.push({
                        name: "Product category",
                        type: "text",
                        entity: "PRODUCT",
                        value: product?.productCategoryDesc?.description
                    })
                    tempArr.push({
                        name: "Service type",
                        type: "text",
                        entity: "PRODUCT",
                        value: product?.serviceTypeDesc?.description
                    })
                    tempArr.push({
                        name: "Warranty period",
                        type: "text",
                        entity: "PRODUCT",
                        value: product?.warrantyPeriod
                    })
                    // tempArr.push({
                    //     name: "Charge list",
                    //     type: "text",
                    //     entity: "PRODUCT_CHARGELIST",
                    //     value: product.productChargesList
                    // })
                    data.push({
                        confirmMessage: "Would you like to proceed to order screen?",
                        message: "We have found excellent offers for you.",
                        displayType: "SELECTABLE",
                        result: tempArr
                    })
                })
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }

    async contractRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": true,
                "interactionCreation": false
            };
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                const account = await this.conn.CustAccounts.findOne({
                    where: { customerUuid, accountUuid },
                    include: [
                        {
                            model: this.conn.BusinessEntity,
                            as: 'accountStatusDesc'
                        }
                    ]
                });
                data = [
                    {
                        confirmMessage: "Is your query resolved?",
                        message: "Below are the contract details. If any disputes, kindly raise the interaction.",
                        displayType: "READ-ONLY",
                        result: [
                            {
                                name: "Account name",
                                type: "text",
                                entity: "ACCOUNT",
                                value: `${account.firstName} ${account.lastName}`
                            },
                            {
                                name: "Account status",
                                type: "text",
                                entity: "ACCOUNT",
                                value: account.accountStatusDesc.description
                            }
                        ]
                    }
                ]
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = [
                    {
                        confirmMessage: "Please click YES to proceed",
                        message: resolutionInformation.description,
                        displayType: "READ-ONLY",
                    }
                ]
            }
        }

        return { outcome, data };
    }

    async accountRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": true,
                "interactionCreation": false
            };
            let products = await this.conn.Product.findAll({
                where: { serviceType },
                include: [
                    { model: this.conn.ProductCharge, as: 'productChargesList' },
                    { model: this.conn.BusinessEntity, as: 'productFamilyDesc' },
                    { model: this.conn.BusinessEntity, as: 'productCategoryDesc' },
                    { model: this.conn.BusinessEntity, as: 'productSubCategoryDesc' },
                    { model: this.conn.BusinessEntity, as: 'productTypeDesc' },
                    { model: this.conn.BusinessEntity, as: 'serviceTypeDesc' },
                    { model: this.conn.BusinessEntity, as: 'provisioningTypeDesc' },
                    { model: this.conn.BusinessEntity, as: 'chargeTypeDesc' }
                ]
            });

            console.log(products, 'im here....');

            products.forEach(product => {
                let tempArr = []
                tempArr.push({
                    name: "Product name",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.productName
                })
                tempArr.push({
                    name: "Product category",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.productCategoryDesc?.description
                })
                tempArr.push({
                    name: "Service type",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.serviceTypeDesc?.description
                })
                tempArr.push({
                    name: "Warranty period",
                    type: "text",
                    entity: "PRODUCT",
                    value: product?.warrantyPeriod
                })
                // tempArr.push({
                //     name: "Charge list",
                //     type: "text",
                //     entity: "PRODUCT_CHARGELIST",
                //     value: product.productChargesList
                // })
                data.push({
                    confirmMessage: "Would you like to proceed to order screen?",
                    message: "We have found excellent offers for you.",
                    displayType: "SELECTABLE",
                    result: tempArr
                })
            })
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                const account = await this.conn.CustAccounts.findOne({
                    where: { customerUuid, accountUuid },
                    include: [
                        {
                            model: this.conn.BusinessEntity,
                            as: 'accountStatusDesc'
                        }
                    ]
                });
                data = [
                    {
                        confirmMessage: "Is your query resolved?",
                        displayType: "READ-ONLY",
                        result: [
                            {
                                name: "Account name",
                                type: "text",
                                entity: "ACCOUNT",
                                value: `${account.firstName} ${account.lastName}`
                            },
                            {
                                name: "Account status",
                                type: "text",
                                entity: "ACCOUNT",
                                value: account.accountStatusDesc.description
                            }
                        ]
                    }
                ]
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }

    async deliveryRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": true,
                "interactionCreation": false
            };
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                const billing = await this.conn.Billing.findOne({
                    where: { customerUuid, serviceUuid, accountUuid }
                });
                data = [
                    {
                        confirmMessage: "Is your query resolved?",
                        displayType: "READ-ONLY",
                        result: [
                            {
                                name: "Bill Amount",
                                type: "text",
                                entity: "BILLING",
                                value: billing.totInvAmount
                            },
                            {
                                name: "Bill Date",
                                type: "text",
                                entity: "BILLING",
                                value: billing.billDate
                            },
                            {
                                name: "Download latest bill",
                                type: "media",
                                entity: "BILLING",
                                value: "#"
                            }
                        ]
                    }
                ]
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }

    async supportRelatedSolution(intxnDetails, metaData) {
        const { intxnCategory, intxnResolution, intxnType, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount, location } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (metaData.actionCount == 1) {
                let interactions = await this.conn.Interaction.findAll({
                    where: {
                        customerUuid
                    },
                    order: [["createdBy", "DESC"]],
                    limit: 5
                })

                let orders = await this.conn.OrdersTxnDtl.findAll({
                    where: {
                        customerUuid
                    },
                    include: [
                        {
                            model: this.conn.Product,
                            as: 'productTxnDtls'
                        }
                    ],
                    order: [["createdBy", "DESC"]],
                    limit: 5
                })
                if (interactions.length) {
                    interactions.forEach(interaction => {
                        let tempArr = [];
                        tempArr.push({
                            name: "Interaction no",
                            type: "text",
                            entity: "INTERACTION",
                            value: interaction.intxnNo
                        })
                        tempArr.push({
                            name: "Interaction statement",
                            type: "text",
                            entity: "INTERACTION",
                            value: interaction.requestStatement
                        })
                        tempArr.push({
                            name: "Interaction date",
                            type: "text",
                            entity: "INTERACTION",
                            value: interaction.createdAt
                        })
                        data.push({
                            confirmMessage: "Would you like to proceed to order screen?",
                            displayType: "SELECTABLE",
                            result: tempArr
                        })
                    })
                }

                if (orders.length) {
                    orders.forEach(order => {
                        let tempArr = [];
                        tempArr.push({
                            name: "Order no",
                            type: "text",
                            entity: "ORDER",
                            value: order.orderTxnId
                        })
                        tempArr.push({
                            name: "Ordered product",
                            type: "text",
                            entity: "ORDER",
                            value: order.productTxnDtls.productName
                        })
                        tempArr.push({
                            name: "Order date",
                            type: "text",
                            entity: "ORDER",
                            value: order.createdAt
                        })
                        data.push({
                            confirmMessage: "Would you like to proceed to order screen?",
                            displayType: "SELECTABLE",
                            result: tempArr
                        })
                    })
                }

                if (!interactions.length && !orders.length) {
                    data = {
                        message: resolutionInformation.description,
                        autoCreate: true
                    }
                }

            } else if (metaData.actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (metaData.actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }

    async paymentRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": true,
                "interactionCreation": false
            };
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                const billing = await this.conn.Billing.findOne({
                    where: { customerUuid, serviceUuid, accountUuid }
                });
                data = [
                    {
                        confirmMessage: "Is your query resolved?",
                        displayType: "READ-ONLY",
                        result: [
                            {
                                name: "Bill Amount",
                                type: "text",
                                value: billing.totInvAmount
                            },
                            {
                                name: "Bill Date",
                                type: "text",
                                value: billing.billDate
                            },
                            {
                                name: "Download latest bill",
                                type: "media",
                                value: "#"
                            }
                        ]
                    }
                ]
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }

    async appointmentRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": true,
                "interactionCreation": false
            };
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                const billing = await this.conn.Billing.findOne({
                    where: { customerUuid, serviceUuid, accountUuid }
                });
                data = [
                    {
                        displayType: "READ-ONLY",
                        result: [
                            {
                                name: "Bill Amount",
                                type: "text",
                                value: billing.totInvAmount
                            },
                            {
                                name: "Bill Date",
                                type: "text",
                                value: billing.billDate
                            },
                            {
                                name: "Download latest bill",
                                type: "media",
                                value: "#"
                            }
                        ]
                    }
                ]
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }

    async notificationRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": true,
                "interactionCreation": false
            };
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                const billing = await this.conn.Billing.findOne({
                    where: { customerUuid, serviceUuid, accountUuid }
                });
                data = [
                    {
                        displayType: "READ-ONLY",
                        result: [
                            {
                                name: "Bill Amount",
                                type: "text",
                                value: billing.totInvAmount
                            },
                            {
                                name: "Bill Date",
                                type: "text",
                                value: billing.billDate
                            },
                            {
                                name: "Download latest bill",
                                type: "media",
                                value: "#"
                            }
                        ]
                    }
                ]
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }

    // fault, service status check and return respective message
    async faultRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                const service = await this.conn.CustServices.findOne({
                    where: { customerUuid },
                    order: [['createdAt', 'DESC']],
                    include: [
                        {
                            model: this.conn.BusinessEntity,
                            as: 'serviceStatusDesc'
                        }
                    ]
                });
                data = [
                    {
                        confirmMessage: "Is your query resolved?",
                        message: (service.status == "SS_AC") ? "Looks like your service is active. If you still face issue in accessing the service, kindly raise your complaince." : "We are sorry is down due to the following reason,",
                        displayType: "READ-ONLY",
                        result: [
                            {
                                name: "Service Status",
                                type: "text",
                                entity: "SERVICE",
                                value: service.serviceStatusDesc.description
                            },
                            {
                                name: "Service Usage",
                                type: "text",
                                entity: "SERVICE",
                                value: `${service.serviceUsage} ${service.serviceUnit}`
                            },
                            {
                                name: "Service limit",
                                type: "text",
                                entity: "SERVICE",
                                value: service.serviceLimit
                            },
                            {
                                name: "Available balance",
                                type: "text",
                                entity: "SERVICE",
                                value: service.serviceBalance
                            }
                        ]
                    }
                ]
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }

    async accessRelatedSolution(intxnDetails, metaData) {
        const { intxnType, intxnResolution, intxnCategory, serviceCategory, serviceType } = intxnDetails;
        const { customerUuid, serviceUuid, accountUuid, actionCount } = metaData;

        let outcome = {};
        let data = [];

        const resolutionInformation = await this.conn.BusinessEntity.findOne({ where: { code: intxnResolution } })

        if (POSITIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": true,
                "interactionCreation": false
            };
        }
        else if (NEGATIVE_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": true,
                "orderCreation": false,
                "interactionCreation": false
            };
            if (actionCount == 1) {
                const billing = await this.conn.Billing.findOne({
                    where: { customerUuid, serviceUuid, accountUuid }
                });
                data = [
                    {
                        displayType: "READ-ONLY",
                        result: [
                            {
                                name: "Bill Amount",
                                type: "text",
                                entity: "BILLING",
                                value: billing.totInvAmount
                            },
                            {
                                name: "Bill Date",
                                type: "text",
                                entity: "BILLING",
                                value: billing.billDate
                            },
                            {
                                name: "Download latest bill",
                                type: "media",
                                entity: "BILLING",
                                value: "#"
                            }
                        ]
                    }
                ]
            } else if (actionCount == 2) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }
        else if (NEUTRAL_INTXN_TYPES.includes(intxnType)) {
            outcome = {
                "appointmentRequired": false,
                "orderCreation": false,
                "interactionCreation": true
            };
            if (actionCount == 1) {
                data = {
                    message: resolutionInformation.description,
                    autoCreate: true
                }
            }
        }

        return { outcome, data };
    }
}

module.exports = IntelligenceService