import { each, get } from 'lodash'
import moment from 'moment'

export const transformAddress = (address) => {
  const data = {
    addressType: get(address, 'addressType', 'Home'),
    hno: get(address, 'flatHouseUnitNo', ''),
    block: get(address, 'block', ''),
    buildingName: get(address, 'building', ''),
    street: get(address, 'street', ''),
    road: get(address, 'road', ''),
    city: get(address, 'cityTown', ''),
    town: get(address, 'village', ''),
    state: get(address, 'state', ''),
    district: get(address, 'district', ''),
    country: get(address, 'country', ''),
    postCode: get(address, 'postCode', '')
  }
  return data
}

export const transformContact = (data) => {
  const response = {
    title: get(data, 'contactTitle', ''),
    firstName: get(data, 'surName', ''),
    lastName: get(data, 'foreName', ''),
    contactType: get(data, 'contactType', ''),
    contactNo: get(data, 'contactNbr', 0),
    email: get(data, 'email', '')
  }
  if (data.contactForeName && data.contactSurName) {
    response.firstName = get(data, 'contactSurName', '')
    response.lastName = get(data, 'contactForeName', '')
  }
  return response
}

export const transformContactForBulk = (data) => {
  const response = {
    title: get(data, 'title', ''),
    firstName: get(data, 'firstName', ''),
    lastName: get(data, 'lastName', ''),
    contactType: get(data, 'contactType', ''),
    contactNo: get(data, 'contactNo', 0),
    email: get(data, 'email', '')
  }

  return response
}

export const transformCustomer = (data) => {
  const response = {
    title: get(data, 'title', ''),
    firstName: get(data, 'firstName', ''),
    lastName: get(data, 'lastName', ''),
    custType: get(data, 'customerType', ''),
    customerCat: get(data, 'category', ''),
    customerClass: get(data, 'class', ''),
    gender: get(data, 'gender', null),
    birthDate: get(data, 'dob', null),
    idType: ((get(data, 'idType') !== undefined && get(data, 'idType') !== '') ? get(data, 'idType') : null),
    idValue: ((get(data, 'idNbr') !== undefined && get(data, 'idNbr') !== '') ? get(data, 'idNbr') : null),
    property_1: get(data, 'property1', null),
    property_2: get(data, 'property2', null),
    property_3: get(data, 'property3', null)
  }
  if (data.customerType === 'BUSINESS' || data.customerType === 'GOVERNMENT') {
    response.firstName = get(data, 'companyName', '')
    response.registeredNo = get(data, 'registrationNbr', null)
    response.regDate = get(data, 'registrationDate', null)
    response.idType = ((get(data, 'idType') !== undefined && get(data, 'idType') !== '') ? get(data, 'idType') : null)
    response.idValue = ((get(data, 'idNbr') !== undefined && get(data, 'idNbr') !== '') ? get(data, 'idNbr') : null)
  }
  return response
}

export const transformAddressHistory = (customer, userId) => {
  const response = {
    hno: get(customer.address, 'hno', ''),
    buildingName: get(customer.address, 'buildingName', ''),
    street: get(customer.address, 'street', ''),
    road: get(customer.address, 'road', ''),
    city: get(customer.address, 'city', ''),
    state: get(customer.address, 'state', ''),
    district: get(customer.address, 'district', ''),
    country: get(customer.address, 'country', ''),
    zip: get(customer.address, 'postCode', ''),
    postCode: get(customer.address, 'postCode', ''),
    customerId: get(customer, 'customerId', null),
    accountId: get(customer, 'accountId', null),
    createdBy: userId,
    updatedBy: userId
  }
  return response
}

export const transformCustomerDetailsHistory = (customer, userId) => {
  const response = {
    idType: ((get(customer, 'idType') !== undefined && get(customer, 'idType') !== '') ? get(customer, 'idType') : null),
    idValue: ((get(customer, 'idValue') !== undefined && get(customer, 'idValue') !== '') ? get(customer, 'idValue') : null),
    email: get(customer.contact, 'email', ''),
    contactType: get(customer.contact, 'contactType', ''),
    contactNo: get(customer.contact, 'contactNo', ''),
    customerId: get(customer, 'customerId', null),
    createdBy: userId,
    updatedBy: userId
  }
  return response
}

export const transformAccountDetailsHistory = (account, userId) => {
  const response = {
    email: get(account.contact, 'email', ''),
    title: get(account.contact, 'title', ''),
    firstName: get(account.contact, 'firstName', ''),
    lastName: get(account.contact, 'lastName', ''),
    contactNo: get(account.contact, 'contactNo', ''),
    accountId: get(account, 'accountId', null),
    createdBy: userId,
    updatedBy: userId
  }
  return response
}

export const transformCustomerPropertyHistory = (customer, userId) => {
  const response = {
    property_1: get(customer, 'property_1', null),
    property_2: get(customer, 'property_2', null),
    property_3: get(customer, 'property_3', null),
    customerId: get(customer, 'customerId', null),
    accountId: get(customer, 'accountId', null),
    createdBy: userId,
    updatedBy: userId
  }
  return response
}

export const transformUpdateCustomer = (data, customer) => {
  const response = {
    birthDate: get(data.details, 'dob', customer.birthDate),
    idType: get(data.details, 'idType', customer.idType),
    idValue: get(data.details, 'idValue', customer.idValue),
    property_1: get(data.property, 'property1', customer.property_1),
    property_2: get(data.property, 'property2', customer.property_2),
    property_3: get(data.property, 'property3', customer.property_3)
  }
  return response
}

export const transformUpdateAccount = (data, customer) => {
  const response = {
    property_1: get(data.property, 'property1', customer.property_1),
    property_2: get(data.property, 'property2', customer.property_2),
    property_3: get(data.property, 'property3', customer.property_3)
  }
  return response
}

export const transformUpdateAddress = (data, address) => {
  const response = {
    hno: get(data, 'flatHouseUnitNo', address.hno),
    buildingName: get(data, 'building', address.buildingName),
    street: get(data, 'street', address.street),
    road: get(data, 'road', address.road),
    city: get(data, 'cityTown', address.city),
    state: get(data, 'state', address.state),
    district: get(data, 'district', address.district),
    country: get(data, 'country', address.country),
    postCode: get(data, 'postCode', address.postCode)
  }
  return response
}
export const comparAddress = (newAddress, oldAddress) => {
  let sameAddress = false
  if (newAddress.flatHouseUnitNo !== oldAddress.hno) {
    sameAddress = true
  } else if (newAddress.street !== oldAddress.street) {
    sameAddress = true
  } else if (newAddress.building !== oldAddress.buildingName) {
    sameAddress = true
  } else if (newAddress.cityTown !== oldAddress.city) {
    sameAddress = true
  } else if (newAddress.country !== oldAddress.country) {
    sameAddress = true
  } else if (newAddress.district !== oldAddress.district) {
    sameAddress = true
  } else if (newAddress.postCode !== oldAddress.postCode) {
    sameAddress = true
  } else if (newAddress.state !== oldAddress.state) {
    sameAddress = true
  }
  return sameAddress
}

export const camparCustomerDetails = (customerInfo, customerDetails) => {
  let sameDetails = false
  if (customerInfo.contact.contactType !== customerDetails.contactType) {
    sameDetails = true
  } else if (customerInfo.contact.contactNo !== customerDetails.contactNbr) {
    sameDetails = true
  } else if (customerInfo.contact.email !== customerDetails.email) {
    sameDetails = true
  } else if (customerInfo.idType !== customerDetails.idType) {
    sameDetails = true
  } else if (customerInfo.idValue !== customerDetails.idValue) {
    sameDetails = true
  }
  return sameDetails
}

export const camparAccountDetails = (accountInfo, accountDetails) => {
  let sameDetails = false
  if (accountInfo.contact.title !== accountDetails.title) {
    sameDetails = true
  } else if (accountInfo.contact.firstName !== accountDetails.firstName) {
    sameDetails = true
  } else if (accountInfo.contact.lastName !== accountDetails.lastName) {
    sameDetails = true
  } else if (accountInfo.contact.contactNo !== accountDetails.contactNo) {
    sameDetails = true
  } else if (accountInfo.contact.email !== accountDetails.email) {
    sameDetails = true
  }
  return sameDetails
}

export const transformUpdateContact = (data, contact) => {
  const response = {
    title: get(data, 'title', contact.title),
    firstName: get(data, 'firstName', contact.firstName),
    lastName: get(data, 'lastName', contact.lastName),
    contactNo: get(data, 'contactNbr', contact.contactNo),
    email: get(data, 'email', contact.email),
    contactType: get(data, 'contactType', contact.contactType) || null
  }
  return response
}

export const transformAccountHistory = (account) => {
  const response = {
    email: get(account.contact, 'email', ''),
    contactType: get(account.contact, 'contactType', ''),
    contactNo: get(account.contact, 'contactNo', ''),
    hno: get(account.address, 'hno', ''),
    buildingName: get(account.address, 'buildingName', ''),
    street: get(account.address, 'street', ''),
    road: get(account.address, 'road', ''),
    city: get(account.address, 'city', ''),
    state: get(account.address, 'state', ''),
    district: get(account.address, 'district', ''),
    country: get(account.address, 'country', ''),
    zip: get(account.address, 'postCode', ''),
    postCode: get(account.address, 'postCode', ''),
    property_1: get(account, 'property_1', null),
    property_2: get(account, 'property_2', null),
    property_3: get(account, 'property_3', null),
    accountId: get(account, 'accountId', null)
  }
  return response
}

export const transformAccount = (customerType, data) => {
  const response = {
    accountCat: get(data, 'category', ''),
    accountClass: get(data, 'class', ''),
    accountPriority: get(data, 'priority', 'STANDARD'),
    title: get(data, 'title', ''),
    firstName: get(data, 'surName', ''),
    lastName: get(data, 'foreName', ''),
    gender: ((get(data, 'gender') !== undefined && get(data, 'gender') !== '') ? get(data, 'gender') : null),
    birthDate: ((get(data, 'dob') !== undefined && get(data, 'dob') !== '') ? get(data, 'dob') : null),
    idType: ((get(data, 'idType') !== undefined && get(data, 'idType') !== '') ? get(data, 'idType') : null),
    idValue: ((get(data, 'idNbr') !== undefined && get(data, 'idNbr') !== '') ? get(data, 'idNbr') : null),
    baseCollPlan: get(data, 'baseCollPlan', ''),
    priority: get(data, 'priority', ''),
    noOfCopies: get(data, 'billOptions.noOfCopies', 0),
    billDeliveryMthd: get(data, 'billOptions.billDeliveryMethod', ''),
    billLang: get(data, 'billOptions.billLanguage', '')
  }
  if (customerType === 'BUSINESS') {
    response.firstName = get(data, 'companyName', '')
    response.regDate = ((get(data, 'registeredDate') !== undefined && get(data, 'registeredDate') !== '') ? get(data, 'registeredDate') : null)
    response.registeredNo = get(data, 'registeredNbr', '')
  }
  return response
}

export const transformSecurityQuestion = (data) => {
  const response = {
    profileName: get(data, 'securityQuestion', ''),
    profileValue: get(data, 'securityAnswer', '')
  }
  return response
}

export const transformConnection = (data, catalog) => {
  const name = catalog?.planId ? catalog?.planName : catalog?.serviceId ? catalog?.serviceName : catalog?.assetId ? catalog?.assetName : catalog?.addonId ? catalog?.addonName : catalog?.catalogId ? catalog?.catalogName : ''
  let response = {
    connectionName: name,
    connectionType: get(data, 'connectionType', 'ST_POST'),
    isPorted: (get(data, 'portIn', 'No') === 'Yes') ? 'Y' : 'N',
    donor: (get(data, 'portIn', 'No') === 'Yes') ? get(data, 'donor') : null,
    paymentMethod: get(data, 'paymentMethod', null),
    creditProf: get(data, 'creditProfile', null),
    status: get(data, 'status', 'ACTIVE')
  }

  response = {
    ...response,
    exchngCode: get(data, 'fixed.exchangeCode', null),
    identificationNo: get(data, 'fixed.accessNbr', ''),
    connectionSelection: get(data, 'fixed.serviceNumberSelection', ''),
    connectionGrp: get(data, 'fixed.serviceNumberGroup', ''),
    deposit: get(data, 'deposit.includeExclude', ''),
    charge: ((get(data, 'deposit.includeExclude') === 'include') ? get(data, 'deposit.charge') : null),
    excludeReason: get(data, 'deposit.excludeReason', null)
  }
  response.connectionGrp = catalog?.serviceType || 'DEFAULT'
  response.connectionType = catalog?.serviceType || 'DEFAULT'
  return response
}

export const transformCustomerResponse = (customers = []) => {
  let response
  if (Array.isArray(customers)) {
    response = []
    each(customers, (customer) => {
      response.push(transformCustomerResponse(customer))
    })
  } else {
    response = {
      customerId: get(customers, 'customerId', ''),
      title: get(customers, 'title', ''),
      foreName: get(customers, 'lastName', ''),
      surName: get(customers, 'firstName', ''),
      companyName: get(customers, 'firstName', ''),
      category: get(customers, 'customerCat', ''),
      categoryDesc: get(customers.category, 'description', ''),
      class: get(customers, 'customerClass', ''),
      classDesc: get(customers.class, 'description', ''),
      gender: get(customers, 'gender', ''),
      birthDate: get(customers, 'birthDate', ''),
      regDate: get(customers, 'regDate', ''),
      registeredNo: get(customers, 'registeredNo', ''),
      idType: get(customers, 'idType', ''),
      idValue: get(customers, 'idValue', ''),
      idTypeDesc: get(customers.idTypeDesc, 'description', ''),
      status: get(customers, 'status', ''),
      addressId: get(customers, 'addressId', ''),
      priority: get(customers, 'priority', ''),
      property1: get(customers, 'property_1', ''),
      property2: get(customers, 'property_2', ''),
      property3: get(customers, 'property_3', ''),
      isBillable: get(customers, 'isBillable', ''),
      customerType: get(customers, 'custType', ''),
      crmCustomerNo: get(customers, 'crmCustomerNo', ''),
      contactType: get(customers.contact, 'contactType', ''),
      contactTypeDesc: get(customers.contact.contactTypeDesc, 'description', ''),
      email: get(customers.contact, 'email', ''),
      contactNbr: get(customers.contact, 'contactNo', '')
    }
    if (customers.address) {
      const address = transformResponseAddress(customers.address)
      response.address = [address]
    }
  }
  return response
}

export const transformResponseAddress = (address) => {
  const response = {
    addressId: get(address, 'addressId', ''),
    addressType: get(address, 'addressType', ''),
    flatHouseUnitNo: get(address, 'hno', ''),
    block: get(address, 'block', ''),
    building: get(address, 'buildingName', ''),
    street: get(address, 'street', ''),
    road: get(address, 'road', ''),
    district: get(address, 'district', ''),
    state: get(address, 'state', ''),
    village: get(address, 'town', ''),
    cityTown: get(address, 'city', ''),
    country: get(address, 'country', ''),
    postCode: get(address, 'postCode', '')
  }
  return response
}

export const transformAccountResponse = (accounts = []) => {
  let response
  if (Array.isArray(accounts)) {
    response = []
    each(accounts, (account) => {
      response.push(transformAccountResponse(account))
    })
  } else {
    response = {
      accountId: get(accounts, 'accountId', ''),
      customerId: get(accounts, 'customerId', ''),
      addressId: get(accounts, 'addressId', ''),
      title: get(accounts, 'title', ''),
      surName: get(accounts, 'lastName', ''),
      foreName: get(accounts, 'firstName', ''),
      gender: get(accounts, 'gender', ''),
      dob: get(accounts, 'birthDate', ''),
      companyName: get(accounts, 'firstName', ''),
      registeredDate: get(accounts, 'regDate', ''),
      idType: get(accounts, 'idType', ''),
      idTypeDesc: get(accounts.id_typ, 'description', ''),
      idNbr: get(accounts, 'idValue', ''),
      registeredNbr: get(accounts, 'registeredNo', ''),
      acctPriority: get(accounts, 'accountPriority', ''),
      acctPriorityDesc: get(accounts.acct_prty, 'description', ''),
      priority: get(accounts, 'priority', ''),
      priorityDesc: get(accounts.prty, 'description', ''),
      class: get(accounts, 'accountClass', ''),
      classDesc: get(accounts.acct_class, 'description', ''),
      category: get(accounts, 'accountCat', ''),
      categoryDesc: get(accounts.acct_catg, 'description', ''),
      baseCollPlan: get(accounts, 'baseCollPlan', ''),
      baseCollPlanDesc: get(accounts.coll_plan, 'description', ''),
      status: get(accounts, 'status', ''),
      property_1: get(accounts, 'property_1', ''),
      property_2: get(accounts, 'property_2', ''),
      property_3: get(accounts, 'property_3', ''),
      email: get(accounts.contact, 'email', ''),
      contactType: get(accounts.contact, 'contactType', ''),
      contactTypeDesc: get(accounts.contact.contactTypeDesc, 'description', ''),
      contactNbr: get(accounts.contact, 'contactNo', ''),
      contactTitle: get(accounts.contact, 'title', ''),
      contactSurName: get(accounts.contact, 'lastName', ''),
      contactForeName: get(accounts.contact, 'firstName', '')
    }
    response.accountNo = accounts.accountNo
    const address = {
      ...transformResponseAddress(accounts.address),
      districtDesc: accounts?.address?.districtDesc?.description || '',
      stateDesc: accounts?.address?.stateDesc?.description || '',
      countryDesc: accounts?.address?.countryDesc?.description || '',
      postCodeDesc: accounts?.address?.postCodeDesc?.description || ''
    }
    response.billingAddress = [address]
    response.billOptions = {
      billLanguage: get(accounts, 'billLang', ''),
      billLanguageDesc: get(accounts.bill_language, 'description', ''),
      billDeliveryMethod: get(accounts, 'billDeliveryMthd', ''),
      billDeliveryMethodDesc: get(accounts.bill_dlvy_mthd, 'description', ''),
      noOfCopies: get(accounts, 'noOfCopies', '')
    }
    response.securityData = {
      securityQuestion: get(accounts?.securityQuestion, 'profileName', ''),
      securityQuestionDesc: get(accounts.securityQuestion?.sec_q, 'description', ''),
      securityAnswer: get(accounts?.securityQuestion, 'profileValue', '')
    }
  }
  return response
}

export const transformServiceResponse = (services = []) => {
  let response
  if (Array.isArray(services)) {
    response = []
    each(services, (service) => {
      response.push(transformServiceResponse(service))
    })
  } else {
    response = {
      serviceId: get(services, 'connectionId', ''),
      accessNbr: get(services, 'identificationNo', ''),
      catalog: get(services, 'connectionType', ''),
      catalogDesc: get(services.conn_typ, 'description', ''),
      status: get(services, 'status', ''),
      statusDesc: get(services.serviceStatus, 'description', ''),
      product: get(services, 'product', ''),
      productDesc: get(services, 'planName', ''),
      planName: get(services, 'planName', ''),
      networkType: get(services, 'networkType', ''),
      prodType: get(services, 'prodType', ''),
      serviceTypeDesc: get(services, 'serviceTypeDesc', ''),
      charge: get(services, 'charge', ''),
      serviceNumberSelection: get(services, 'connectionSelection', ''),
      paymentMethod: get(services, 'paymentMethod', ''),
      paymentMethodDesc: get(services.pymt_mthd, 'description', ''),
      creditProfile: get(services, 'creditProf', ''),
      creditProfileDesc: get(services.crd_prf, 'description', '')
    }

    response.installationAddress = [transformResponseAddress(services.address)]
    response.deposit = {
      includeExclude: get(services, 'deposit', ''),
      charge: get(services, 'depositChg', ''),
      chargeDesc: get(services.dep_chrg, 'description', ''),
      excludeReason: get(services, 'excludeReason', '')
    }

    if (response.prodType === 'Fixed') {
      response.fixed = {
        serviceNumberSelection: get(services, 'connectionSelection', ''),
        serviceNbrGroup: get(services, 'connectionGrp', ''),
        serviceNbrGroupDesc: get(services.conn_grp, 'description', ''),
        serviceNumberGroupDesc: get(services.conn_grp, 'description', ''),
        exchangeCode: get(services, 'exchngCode', ''),
        exchangeCodeDesc: get(services.exchCd, 'description', ''),
        accessNbr: get(services, 'identificationNo', '')
      }
    }
    if (response.prodType === 'Prepaid' || response.prodType === 'Postpaid') {
      const mobile = {}

      mobile.serviceNumberSelection = get(services, 'connectionSelection', '')
      mobile.dealership = get(services, 'dealership', '')
      mobile.dealershipDesc = get(services.dlrshp, 'description', '')
      mobile.nbrGroup = get(services, 'connectionGrp', '')
      mobile.nbrGroupDesc = get(services.conn_grp, 'description', '')
      mobile.accessNbr = get(services, 'identificationNo', '')

      mobile.gsm = {}
      mobile.gsm.assignSIMLater = get(services, 'assignSimLater', '')
      mobile.gsm.iccid = get(services, 'iccid', '')
      mobile.gsm.imsi = get(services, 'imsi', '')

      response.mobile = mobile
    }
    response.portIn = {}

    response.portIn.portInChecked = (get(services, 'isPorted') === 'Y') ? 'Yes' : 'No'

    response.portIn.donor = (get(services, 'isPorted') === 'Y') ? get(services, 'donor') : ''
  }
  return response
}

export const transformConnectionPlanResponse = (connplans = []) => {
  let response
  if (Array.isArray(connplans)) {
    response = []
    each(connplans, (connplan) => {
      response.push(transformConnectionPlanResponse(connplan))
    })
  } else {
    response = {
      connectionPlanId: get(connplans, 'connPlanId'),
      serviceId: get(connplans, 'connectionId'),
      planId: get(connplans, 'planId'),
      status: get(connplans, 'status'),
      prodType: get(connplans.plan, 'prodType'),
      planName: get(connplans.plan, 'planName'),
      bandwidth: get(connplans.plan, 'bandwidth'),
      networkType: get(connplans.plan, 'networkType'),
      charge: get(connplans.plan, 'charge'),
      validity: get(connplans.plan, 'validity'),
      refillProfileId: get(connplans.plan, 'refillProfileId'),
      planType: get(connplans.plan, 'planType'),
      startDate: get(connplans, 'createdAt'),
      txnReference: get(connplans, 'txnReference')
    }
    if (connplans.plan.planoffer) {
      response.offers = transformOfferResponse(connplans.plan.planoffer)
    }
  }
  return response
}

export const transformPurchaseHistoryResponse = (connplans = []) => {
  let response
  if (Array.isArray(connplans)) {
    response = []
    each(connplans, (connplan) => {
      response.push(transformPurchaseHistoryResponse(connplan))
    })
  } else {
    response = {
      connectionPlanId: get(connplans, 'connPlanId'),
      serviceId: get(connplans, 'connectionId'),
      planId: get(connplans, 'planId'),
      status: get(connplans, 'status'),
      prodType: get(connplans.plan, 'prodType'),
      planName: get(connplans.plan, 'planName'),
      charge: get(connplans.plan, 'charge'),
      planType: get(connplans.plan, 'planType'),
      boosterTopupStatus: get(connplans.connPlanStatus, 'code'),
      boosterTopupStatusDesc: get(connplans.connPlanStatus, 'description'),
      purchasedDate: get(connplans, 'createdAt'),
      purchasedBy: get(connplans.createdByUser, 'title') + '. ' + get(connplans.createdByUser, 'firstName') + ' ' + get(connplans.createdByUser, 'lastName')
    }
    if (connplans.plan.planoffer) {
      response.offers = transformOfferResponse(connplans.plan.planoffer)
    }
  }
  return response
}

export const transformPlanResponse = (plans = []) => {
  let response
  if (Array.isArray(plans)) {
    response = []
    each(plans, (plan) => {
      response.push(transformPlanResponse(plan))
    })
  } else {
    response = {
      planId: get(plans, 'planId', ''),
      prodType: get(plans, 'prodType', ''),
      planType: get(plans, 'planType', ''),
      planName: get(plans, 'planName', ''),
      bandwidth: get(plans, 'bandwidth', ''),
      networkType: get(plans, 'networkType', ''),
      charge: get(plans, 'charge', ''),
      refillProfileId: get(plans, 'refillProfileId', ''),
      status: get(plans, 'status', '')
    }
    if (plans.planoffer) {
      response.offers = transformOfferResponse(plans.planoffer)
    }
  }
  return response
}

export const transformOfferResponse = (offers = []) => {
  let response
  if (Array.isArray(offers)) {
    response = []
    each(offers, (offer) => {
      response.push(transformOfferResponse(offer))
    })
  } else {
    response = {
      planOfferId: get(offers, 'planOfferId', ''),
      planId: get(offers, 'planId', ''),
      quota: get(offers, 'quota', ''),
      offerId: get(offers, 'offerId', ''),
      units: get(offers, 'units', ''),
      offerType: get(offers, 'offerType', '')
    }
  }
  return response
}

export const transformInteractionTask = (data) => {
  const response = {
    stepId: get(data, 'intxnTaskId'),
    intxnId: get(data, 'intxnId'),
    stepName: get(data, 'taskId'),
    stepStatus: get(data, 'status'),
    createdAt: get(data, 'createdAt'),
    updatedAt: get(data, 'updatedAt')
  }
  return response
}

export const transformCatalog = (catalog) => {
  const data = {
    planName: get(catalog, 'bundleName', null),
    refillProfileId: get(catalog, 'refillProfileId', null),
    commPackName: get(catalog, 'commPackName', null),
    planCategory: get(catalog, 'bundleCatagory', null),
    planType: get(catalog, 'bundleType', null),
    status: get(catalog, 'status', 'AC'),
    networkType: get(catalog, 'networkType', null),
    ocsDesc: get(catalog, 'ocsDescription', null),
    charge: get(catalog, 'charge', null),
    serviceCls: get(catalog, 'serviceClass', null),
    prodType: get(catalog, 'service', null),
    refPlanCode: get(catalog, 'TarrifCode', null),
    validity: get(catalog, 'validity', null)
  }
  return data
}

export const transformComplaint = (complaint) => {
  const data = {
    customerId: get(complaint, 'customerId', null),
    accountId: get(complaint, 'accountId', null),
    connectionId: get(complaint, 'serviceId', null),
    intxnType: get(complaint, 'intxnType', null),
    problemCode: get(complaint, 'problemCode', null),
    chnlCode: get(complaint, 'chnlCode', null),
    cntPrefer: get(complaint, 'cntPrefer', null),
    priorityCode: get(complaint, 'priorityCode', null),
    sourceCode: get(complaint, 'sourceCode', null),
    // businessEntityCode: get(complaint, 'businessEntityCode', 'COMPLAINT'),
    description: get(complaint, 'remarks', null),
    currStatus: get(complaint, 'currStatus', 'NEW'),
    commentType: get(complaint, 'problemType', null),
    commentCause: get(complaint, 'problemCause', null),
    addressId: get(complaint, 'addressId', null),
    woType: get(complaint, 'woType', 'COMPLAINT'),
    isBotReq: get(complaint, 'isBotReq', 'N'),
    surveyReq: get(complaint, 'surveyReq', null),
    intxnCatType: get(complaint, 'ticketType', null),
    services: get(complaint, 'productOrServices', null),
    kioskRefId: get(complaint, 'kioskRefId', null),
    location: get(complaint, 'location', null)
  }
  data.natureCode = complaint.natureCode ? complaint.natureCode : null
  data.causeCode = complaint.causeCode ? complaint.causeCode : null
  data.clearCode = complaint.clearCode ? complaint.clearCode : null
  data.parentIntxn = complaint.masterTicketId ? complaint.masterTicketId : null
  return data
}

export const transformUpdateComplaint = (complaint, comaplaintInfo) => {
  const data = {
    customerId: get(complaint, 'customerId', comaplaintInfo.customerId),
    accountId: get(complaint, 'accountId', comaplaintInfo.accountId),
    connectionId: get(complaint, 'serviceId', comaplaintInfo.connectionId),
    intxnType: get(complaint, 'intxnType', comaplaintInfo.intxnType),
    problemCode: get(complaint, 'problemCode', comaplaintInfo.problemCode),
    chnlCode: get(complaint, 'chnlCode', comaplaintInfo.chnlCode),
    cntPrefer: get(complaint, 'cntPrefer', comaplaintInfo.cntPrefer),
    priorityCode: get(complaint, 'priorityCode', comaplaintInfo.priorityCode),
    sourceCode: get(complaint, 'sourceCode', comaplaintInfo.sourceCode),
    businessEntityCode: get(complaint, 'businessEntityCode', comaplaintInfo.businessEntityCode),
    description: get(complaint, 'remarks', comaplaintInfo.description),
    currStatus: get(complaint, 'currStatus', comaplaintInfo.currStatus),
    commentType: get(complaint, 'problemType', comaplaintInfo.commentType),
    commentCause: get(complaint, 'problemCause', comaplaintInfo.commentCause),
    addressId: get(complaint, 'addressId', comaplaintInfo.addressId),
    woType: get(complaint, 'woType', comaplaintInfo.woType),
    isBotReq: get(complaint, 'isBotReq', comaplaintInfo.isBotReq),
    surveyReq: get(complaint, 'surveyReq', comaplaintInfo.surveyReq),
    intxnCatType: get(complaint, 'ticketType', comaplaintInfo.intxnType),
    services: get(complaint, 'productOrServices', comaplaintInfo.services),
    kioskRefId: get(complaint, 'kioskRefId', comaplaintInfo.kioskRefId),
    location: get(complaint, 'location', comaplaintInfo.location)
  }
  data.natureCode = complaint.natureCode ? complaint.natureCode : null
  data.causeCode = complaint.causeCode ? complaint.causeCode : null
  data.clearCode = complaint.clearCode ? complaint.clearCode : null
  return data
}

export const transformInquiry = (inquiry) => {
  const data = {
    customerId: get(inquiry, 'customerId', null),
    accountId: get(inquiry, 'accountId', null),
    connectionId: get(inquiry, 'connectionId', null),
    intxnType: get(inquiry, 'intxnType', 'REQINQ'),
    businessEntityCode: get(inquiry, 'serviceType', 'INQUIRY'),
    commentType: get(inquiry, 'inquiryAbout', null),
    services: get(inquiry, 'inquiryCategory', null),
    chnlCode: get(inquiry, 'ticketChannel', null),
    sourceCode: get(inquiry, 'ticketSource', null),
    priorityCode: get(inquiry, 'ticketPriority', null),
    description: get(inquiry, 'ticketDescription', null),
    currStatus: get(inquiry, 'currStatus', 'NEW'),
    assignedDate: get(inquiry, 'assignedDate', Date.now()),
    woType: get(inquiry, 'woType', 'INQUIRY'),
    kioskRefId: get(inquiry, 'kioskRefId', null),
    surveyReq: get(inquiry, 'surveyReq', null),
    intxnCatType: get(inquiry, 'intxnType', 'REQINQ'),
    location: get(inquiry, 'location', null)
  }
  return data
}

export const transformUpdateInquiry = (inquiry, inquiryInfo) => {
  const data = {
    customerId: get(inquiry, 'customerId', inquiryInfo.customerId),
    accountId: get(inquiry, 'accountId', inquiryInfo.accountId),
    connectionId: get(inquiry, 'connectionId', inquiryInfo.connectionId),
    intxnType: get(inquiry, 'intxnType', inquiryInfo.intxnType),
    businessEntityCode: get(inquiry, 'serviceType', inquiryInfo.businessEntityCode),
    commentType: get(inquiry, 'inquiryAbout', inquiryInfo.commentType),
    services: get(inquiry, 'inquiryCategory', inquiryInfo.services),
    chnlCode: get(inquiry, 'ticketChannel', inquiryInfo.chnlCode),
    sourceCode: get(inquiry, 'ticketSource', inquiryInfo.sourceCode),
    priorityCode: get(inquiry, 'ticketPriority', inquiryInfo.priorityCode),
    description: get(inquiry, 'ticketDescription', inquiryInfo.description),
    currStatus: get(inquiry, 'currStatus', inquiryInfo.currStatus),
    assignedDate: get(inquiry, 'assignedDate', Date.now()),
    woType: get(inquiry, 'woType', inquiryInfo.woType),
    kioskRefId: get(inquiry, 'kioskRefId', inquiryInfo.kioskRefId),
    surveyReq: get(inquiry, 'surveyReq', inquiryInfo.surveyReq),
    intxnCatType: get(inquiry, 'intxnType', inquiryInfo.intxnCatType),
    location: get(inquiry, 'location', inquiryInfo.location)
  }
  return data
}

export const transformInteractionTxn = (complaint) => {
  const data = {
    intxnId: get(complaint, 'intxnId', null),
    fromEntity: get(complaint, 'fromEntity', 'IMAGINE'),
    fromRole: get(complaint, 'fromRole', null),
    fromUser: get(complaint, 'fromUser', null),
    causeCode: get(complaint, 'causeCode', null),
    toEntity: get(complaint, 'toEntity', 'IMAGINE'),
    toRole: get(complaint, 'toRole', null),
    toUser: get(complaint, 'toUser', null),
    intxnStatus: get(complaint, 'intxnStatus', null),
    flwId: get(complaint, 'flwId', 'A'),
    flwCreatedBy: get(complaint, 'flwCreatedBy', null),
    flwAction: get(complaint, 'flwAction', 'A'),
    businessEntityCode: get(complaint, 'businessEntityCode', null),
    priorityCode: get(complaint, 'priorityCode', null),
    problemCode: get(complaint, 'problemCode', null),
    natureCode: get(complaint, 'natureCode', null),
    currStatus: get(complaint, 'currStatus', 'NEW'),
    isFlwBypssd: get(complaint, 'isFlwBypssd', null),
    slaCode: get(complaint, 'slaCode', null),
    expctdDateCmpltn: get(complaint, 'expctdDateCmpltn', null),
    remarks: get(complaint, 'remarks', null)
  }
  return data
}

export const transformappointment = (appointment) => {
  const data = {
    remarks: get(appointment, 'remarks', null),
    contactPerson: get(appointment, 'contactPerson', null),
    contactNo: get(appointment, 'contactNumber', null)
  }
  data.fromDate = appointment.fromDate + ' ' + appointment.fromTime
  data.toDate = appointment.toDate + ' ' + appointment.toTime
  data.fromTime = appointment.fromDate + ' ' + appointment.fromTime
  data.toTime = appointment.toDate + ' ' + appointment.toTime

  return data
}

export const transformCharge = (charge) => {
  const data = {
    chargeName: get(charge, 'chargeName', null),
    chargeCat: get(charge, 'chargeCat', null),
    serviceType: get(charge, 'serviceType', null),
    currency: get(charge, 'currency', null),
    startDate: get(charge, 'startDate', null),
    endDate: get(charge, 'endDate', null),
    glcode: get(charge, 'glcode', null),
    status: get(charge, 'status', null)
  }
  return data
}

export const transfromPlan = (plan, userId, planInfo) => {
  const data = {
    planName: plan?.planName || planInfo?.planName || null,
    serviceType: plan?.serviceType || planInfo?.serviceType || null,
    startDate: plan?.startDate || planInfo?.startDate || null,
    endDate: plan?.endDate || planInfo?.endDate || null,
    status: plan?.status || planInfo?.status || null,
    property: { plan: plan?.planProperty || planInfo?.planProperty || null },
    updatedBy: userId
  }
  if (!planInfo) data.createdBy = userId
  return data
}

export const transformPlanCharge = (charge, userId, planId, chargeInfo) => {
  if (!planId) return false
  const data = {
    planId: planId,
    chargeId: charge?.chargeId || chargeInfo?.chargeId || null,
    chargeType: charge?.chargeType || chargeInfo?.chargeType || null,
    currency: charge?.currency || chargeInfo?.currency || null,
    chargeAmount: charge?.chargeAmount || chargeInfo?.chargeAmount || null,
    frequency: charge?.frequency || chargeInfo?.frequency || null,
    prorated: charge?.prorated || chargeInfo?.prorated || 'N',
    chargeUpfront: charge?.chargeUpfront || chargeInfo?.chargeUpfront || null,
    changesApplied: charge?.changesApplied || chargeInfo?.changesApplied || 'N',
    billingEffective: charge?.billingEffective || chargeInfo?.billingEffective || null,
    advanceCharge: charge?.advanceCharge || chargeInfo?.advanceCharge || null,
    startDate: charge?.startDate || chargeInfo?.startDate || null,
    endDate: charge?.endDate || chargeInfo?.endDate || null,
    updatedBy: userId
  }
  if (!chargeInfo) data.createdBy = userId
  return data
}

export const transfromService = (service, userId, serviceInfo) => {
  const data = {
    serviceName: service?.serviceName || serviceInfo?.serviceName || null,
    serviceType: service?.serviceType || serviceInfo?.serviceType || null,
    startDate: service?.startDate || serviceInfo?.startDate || null,
    endDate: service?.endDate || serviceInfo?.endDate || null,
    volumeAllowed: service?.volumeAllowed || serviceInfo?.volumeAllowed || null,
    multipleSelection: service?.multipleSelection || serviceInfo?.multipleSelection || null,
    status: service?.status || serviceInfo?.status || null,
    property: { service: service?.serviceProperty || serviceInfo?.serviceProperty || null },
    updatedBy: userId
  }
  if (!serviceInfo) data.createdBy = userId
  return data
}

export const transformServiceCharge = (service, userId, serviceId, serviceInfo) => {
  if (!serviceId) return false
  const data = {
    serviceId: serviceId,
    chargeId: service?.chargeId || serviceInfo?.chargeId || null,
    chargeType: service?.chargeType || serviceInfo?.chargeType || null,
    currency: service?.currency || serviceInfo?.currency || null,
    chargeAmount: service?.chargeAmount || serviceInfo?.chargeAmount || null,
    frequency: service?.frequency || serviceInfo?.frequency || null,
    prorated: service?.prorated || serviceInfo?.prorated || 'N',
    chargeUpfront: service?.chargeUpfront || serviceInfo?.chargeUpfront || null,
    changesApplied: service?.changesApplied || serviceInfo?.changesApplied || 'N',
    billingEffective: service?.billingEffective || serviceInfo?.billingEffective || null,
    advanceCharge: service?.advanceCharge || serviceInfo?.advanceCharge || null,
    startDate: service?.startDate || serviceInfo?.startDate || null,
    endDate: service?.endDate || serviceInfo?.endDate || null,
    updatedBy: userId
  }
  if (!serviceInfo) data.createdBy = userId
  return data
}

export const transformNewCustomerChatResponse = (chatHeader = []) => {
  let response
  if (Array.isArray(chatHeader)) {
    response = []
    each(chatHeader, (chat) => {
      response.push(transformNewCustomerChatResponse(chat))
    })
  } else {
    response = {
      chatId: get(chatHeader, 'chatId', ''),
      contactNo: get(chatHeader, 'contactNo', ''),
      name: get(chatHeader, 'createdBy', ''),
      emailId: get(chatHeader, 'emailId', ''),
      socketId: get(chatHeader, 'socketId', ''),
      status: get(chatHeader, 'status', ''),
      customerInfo: get(chatHeader, 'customerInfo', ''),
      type: get(chatHeader, 'type', '')
    }
  }
  return response
}

export const transformRole = (roles = []) => {
  let response
  if (Array.isArray(roles)) {
    response = []
    each(roles, (role) => {
      response.push(transformRole(role))
    })
  } else {
    response = {
      roleId: get(roles, 'roleId', ''),
      roleName: get(roles, 'roleName', ''),
      roleDesc: get(roles, 'roleDesc', '')
    }
  }
  return response
}

// Report Transform-start
export const transformLoginSearchResponse = (userSession = []) => {
  let response
  if (Array.isArray(userSession)) {
    response = []
    each(userSession, (data) => {
      response.push(transformLoginSearchResponse(data))
    })
  } else {
    const totalTime = (get(userSession, 'updatedAt', '').getTime() - get(userSession, 'createdAt', '').getTime()) / (1000 * 60) / 60
    response = {
      userID: get(userSession, 'userId', ''),
      userName: get(userSession, 'userName', ''),
      // userName: get(userSession, 'loginid', ''),
      ip: get(userSession, 'ip', ''),
      // loginDateTime: moment(get(userSession, 'createdAt', '')).format('DD-MMM-YYYY HH:MM A'),
      // logoutDateTime: moment(get(userSession, 'updatedAt', '')).format('DD-MMM-YYYY HH:MM A'),
      loginDateTime: get(userSession, 'createdAtFormat', ''),
      logoutDateTime: get(userSession, 'updatedAtFormat', ''),
      totalTimeLoggedIn: parseInt(Number(totalTime)) + ':' + Math.round((Number(totalTime) - parseInt(Number(totalTime))) * 60)
    }
  }
  return response
}

export const transformOpenClosedSLADeptInteractionSearchResponse = (interaction = []) => {
  let response
  if (Array.isArray(interaction)) {
    response = []
    each(interaction, (data) => {
      response.push(transformOpenClosedSLADeptInteractionSearchResponse(data))
    })
  } else {
    response = {
      interactionID: get(interaction, 'interaction_id', ''),
      interactionType: get(interaction, 'interaction_type', ''),
      workOrderType: get(interaction, 'wo_type', ''),
      status: get(interaction, 'ticket_status', ''),
      customerNo: get(interaction, 'customer_no', ''),
      customerName: get(interaction, 'customer_name', ''),
      customerType: get(interaction, 'cust_type', ''),
      billRefNumber: get(interaction, 'bill_ref_no', ''),
      serviceNo: get(interaction, 'identification_no', ''),
      serviceType: get(interaction, 'service_type', ''),
      problemCategory: get(interaction, 'problem_category', ''),
      problemType: get(interaction, 'problem_type_desc', ''),
      problemCause: get(interaction, 'cause_code_name', ''),
      ticketChannel: get(interaction, 'chnl_code_desc', ''),
      ticketSource: get(interaction, 'source_code_desc', ''),
      ticketLocation: get(interaction, 'ticket_location', ''),
      ticketPriority: get(interaction, 'priority', ''),
      role: get(interaction, 'curr_role', ''),
      contactNo: get(interaction, 'customer_contact_no', ''),
      contactEmail: get(interaction, 'customer_email', ''),
      createdBy: get(interaction, 'intxn_created_by', ''),
      createdOn: get(interaction, 'intxn_created_at', ''),
      openAgeingDays: get(interaction, '', '') + (get(interaction, '', '') ? 'Days' : ''),

      // Closed Interaction
      closedBy: get(interaction, 'closed_by', ''),
      // closedOn: get(interaction, 'closed_date', ''),
      closedOn: moment(get(interaction, 'closed_date', '')).format('DD-MMM-YYYY HH:MM A'),
      surveySent: get(interaction, 'surveysent', ''),
      // SLA
      aging: get(interaction, '', '') + (get(interaction, '', '') ? 'Days' : ''),
      sla: get(interaction, '', '') + (get(interaction, '', '') ? '%' : ''),
      // Departmentwise Interaction
      createdDept: get(interaction, '', ''),
      currentDept: get(interaction, '', ''),
      district: get(interaction, 'district', ''),
      kampong: get(interaction, 'city', ''),
      l1_remark: get(interaction, 'l1_remarks', ''),
      l2_remark: get(interaction, 'l2_remarks', ''),
      ticketDesc: get(interaction, 'description', ''),
      currUser: get(interaction, 'intxn_curr_user', '')
    }
  }
  return response
}

export const transformChatSearchResponse = (chat = []) => {
  let response
  if (Array.isArray(chat)) {
    response = []
    each(chat, (data) => {
      response.push(transformChatSearchResponse(data))
    })
  } else {
    response = {
      chatID: get(chat, 'chatId', ''),
      chatType: get(chat, 'type', ''),
      serviceNumber: get(chat, 'accessNo', ''),
      customerName: get(chat, 'customerName', ''),
      customerEmail: get(chat, 'emailId', ''),
      customerContact: get(chat, 'contactNo', ''),
      startDateTime: moment(get(chat, 'createdAt', '')).format('DD-MMM-YYYY HH:MM A'),
      endDateTime: moment(get(chat, 'updatedAt', '')).format('DD-MMM-YYYY HH:MM A'),
      agentName: get(chat, 'user.firstName', '')
    }
  }
  return response
}

export const transformAuditTrailSearchResponse = (userSession = []) => {
  let response
  if (Array.isArray(userSession)) {
    response = []
    each(userSession, (data) => {
      response.push(transformAuditTrailSearchResponse(data))
    })
  } else {
    response = {
      userID: get(userSession, 'userId', ''),
      // userName: get(userSession, 'user.firstName', '')+get(userSession, 'user.lastName', ''),
      // userName: get(userSession, 'loginid', ''),
      userName: get(userSession, 'userName', ''),
      ip: get(userSession, 'ip', ''),
      // dateTime: moment(get(userSession, 'createdAt', '')).format('DD-MMM-YYYY HH:MM A'),
      dateTime: get(userSession, 'createdAtFormat', ''),
      action: get(userSession, 'action', ''),
      actionDetails: get(userSession, 'actionDetails', '')
    }
  }
  return response
}

export const transformProductSearchResponse = (product = [], productType) => {
  let response
  if (Array.isArray(product)) {
    response = []
    each(product, (data) => {
      response.push(transformProductSearchResponse(data, productType))
    })
  } else {
    response = {
      productServiceType: get(product, 'serviceType', ''),
      productStatus: get(product, 'status', ''),
      totalRecurringCharge: get(product, 'totalRecurringCharge', ''),
      totalOnetimeCharge: get(product, 'totalOneTimeCharge', ''),
      subscribedCustomer: get(product, 'subscribedCustomercount', ''),
      recChrgRevenue: get(product, 'totalRecurringChargeRevenue', ''),
      onetimeChrgRevenue: get(product, 'totalOnetimeChargeRevenue', '')
    }
    if (productType === 'PT_PLAN_MST') {
      response.productType = 'Plan'
      response.productName = get(product, 'planName', '')
    } else if (productType === 'PT_SERVICE_MST') {
      response.productType = 'Service'
      response.productName = get(product, 'serviceName', '')
    } else if (productType === 'PT_ASSET_MST') {
      response.productType = 'Asset'
      response.productName = get(product, 'assetName', '')
    } else if (productType === 'PT_ADDON_MST') {
      response.productType = 'Add-ons'
      response.productName = get(product, 'addonName', '')
    }
  }
  return response
}

export const transformSalesSearchResponse = (sales = [], productType) => {
  let response
  if (Array.isArray(sales)) {
    response = []
    each(sales, (data) => {
      response.push(transformSalesSearchResponse(data, productType))
    })
  } else {
    response = {
      customerNo: get(sales, '', ''),
      customerName: get(sales, '', ''),
      customerType: get(sales, '', ''),
      billRefNumber: get(sales, '', ''),
      woRefNumber: get(sales, '', ''),
      woInitiationDate: get(sales, '', ''),
      woClosedDate: get(sales, '', ''),
      serviceNumber: get(sales, '', ''),
      serviceType: get(sales, '', ''),
      productType: get(sales, '', ''),
      productName: get(sales, '', ''),
      totalRecurringCharge: get(sales, '', ''),
      totalOnetimeCharge: get(sales, '', ''),
      servStartDate: get(sales, '', ''),
      servEndDate: get(sales, '', ''),
      servAddressDate: get(sales, '', ''),
      accManager: get(sales, '', '')
    }
  }
  return response
}

export const transformInvoiceSearchResponse = (invoice = []) => {
  let response
  if (Array.isArray(invoice)) {
    response = []
    each(invoice, (data) => {
      response.push(transformInvoiceSearchResponse(data))
    })
  } else {
    response = {
      customerNo: get(invoice, 'crmCustomerNo', ''),
      customerName: get(invoice, 'customerName', ''),
      customerType: get(invoice, 'custType', ''),
      billRefNumber: get(invoice, 'billRefNo', ''),
      currency: get(invoice, '', ''),
      invoiceNumber: get(invoice, 'invNo', ''),
      invoiceDate: get(invoice, 'invDate', ''),
      startDate: get(invoice, 'invStartDate', ''),
      endDate: get(invoice, 'invEndDate', ''),
      invoiceAmount: get(invoice, 'invAmt', ''),
      netDueAmount: get(invoice, 'invOsAmt', ''),
      advanceAmount: get(invoice, 'advAmount', ''),
      invoiceStatus: get(invoice, 'invoiceStatus', '')
    }
  }
  return response
}

export const transformBillingSearchResponse = (billing = []) => {
  let response
  if (Array.isArray(billing)) {
    response = []
    each(billing, (data) => {
      response.push(transformBillingSearchResponse(data))
    })
  } else {
    response = {
      customerNo: get(billing, 'customerNo', ''),
      customerName: get(billing, 'customerName', ''),
      customerType: get(billing, 'custType', ''),
      billRefNumber: get(billing, 'billRefNo', ''),
      contractId: get(billing, 'contractId', ''),
      serviceNumber: get(billing, 'serviceNo', ''),
      contractName: get(billing, 'contractName', ''),
      contractStartDate: get(billing, 'startDate', ''),
      contractEndDate: get(billing, 'endDate', ''),
      contractStatus: get(billing, 'status', ''),
      chargeName: get(billing, 'chargeName', ''),
      chargeType: get(billing, 'chargeType', ''),
      chargeAmount: get(billing, 'chargeAmt', ''),
      currency: get(billing, 'currency', ''),
      frequency: get(billing, 'frequency', ''),
      prorated: get(billing, 'prorated', ''),
      creditAdjAmount: get(billing, 'creditAdjAmount', ''),
      debitAdjAmount: get(billing, 'debitAdjAmount', ''),
      lastBillPeriod: get(billing, 'lastBillPeriod', ''),
      nextBillPeriod: get(billing, 'nextBillPeriod', '')
    }
  }
  return response
}

export const invoicePDFdata = (data) => {
  const account = data.invoiceData.accountDetail
  const invoice = data.invoiceData
  const allServices = data.allServices
  const summery = data.summery
  const response = {
    address: {
      firstName: account?.firstName || null,
      lastName: account?.lastName || null,
      hno: account?.address?.hno || null,
      block: account?.address?.block || null,
      buildingName: account?.address?.buildingName || null,
      street: account?.address?.street || null,
      road: account?.address?.road || null,
      city: account?.address?.city || null,
      town: account?.address?.town || null,
      state: account?.address?.state || null,
      district: account?.address?.district || null,
      country: account?.address?.country || null,
      postCode: account?.address?.postCode || null
    },
    invoice: {
      invoiceId: invoice?.invoiceId || null,
      billRefNo: invoice?.billRefNo || null,
      invStartDate: invoice?.invStartDate || null,
      invEndDate: invoice?.invEndDate || null,
      invDate: invoice?.invDate || null,
      dueDate: invoice?.dueDate || null,
      soNumber: invoice?.soNumber || '-'
    },
    dueAmount: {
      previousOutstanding: data?.invoiceData?.prevBalance || 0,
      advancePayment: data?.invoiceData?.advAmount || 0,
      invoiceAmount: data?.invoiceData?.invAmt || 0,
      totalOutstnading: data?.totalOutstanding || 0,
      dueOutStanding: 0
    },
    summary: {
      monthlyRentals: summery.monthlyRental || 0,
      oneTimeCharge: summery.oneTimeCharge || 0,
      usageCharge: summery.usageCharge || 0,
      debitAdjustment: summery.debitAdjustment || 0,
      creditAdjustment: summery.creditAdjustment || 0,
      total: summery?.total || 0,
      finalTotalAmount: data?.totalOutstanding || 0
    },
    services: allServices || []
  }
  return response
}

export const transformHelpDesk = (tickets, interactionsOfCustomer) => {
  const data = {
    helpdeskId: tickets?.dataValues?.helpdeskId || null,
    name: tickets?.dataValues?.name || null,
    title: tickets?.dataValues?.title || null,
    content: tickets?.dataValues?.content || null,
    source: tickets?.dataValues?.source || null,
    email: tickets?.dataValues?.email || null,
    createdAt: tickets.dataValues?.createdAt || null,
    updatedAt: tickets.dataValues?.updatedAt || null,
    status: tickets.dataValues?.status || null,
    conversation: []
  }
  if (tickets?.dataValues?.txnDetails?.length > 0) {
    for (const t of tickets?.dataValues?.txnDetails) {
      console.log(t.createdByDetails)
      const txn = {
        helpdeskTxnId: t?.dataValues?.helpdeskTxnId,
        sender: t?.dataValues?.createdByDetails.dataValues.firstName + ' ' + t?.dataValues?.createdByDetails.dataValues.lastName,
        content: t?.dataValues?.content || null,
        messageDateTime: t?.dataValues?.messageDateTime || null,
        inOut: t?.dataValues?.inOut || null,
        createdAt: t?.dataValues?.createdAt || null,
        createdByDetails: t.createdByDetails
      }
      data.conversation.push(txn)
    }
  }
  const customerDetails = tickets?.contactDetails.length > 0 ? helpDeskCustomerData(tickets?.contactDetails[0], interactionsOfCustomer) : {}
  const response = {
    ...data,
    customerDetails
  }
  return response
}

export const helpDeskCustomerData = (data, interactionsOfCustomer) => {
  const response = {
    isExisting: true,
    customer: {
      customerId: data?.customerDetails[0]?.customerId || null,
      contactId: data?.contactId || null,
      crmCustomerNo: data?.customerDetails[0]?.crmCustomerNo || null,
      fullName: data?.customerDetails[0]?.firstName || null,
      customerType: data?.customerDetails[0]?.customerTypeDesc?.description || null,
      customerTypeCode: data?.customerDetails[0]?.custType || null,
      contactNumber: data?.contactNo || null,
      email: data?.email || null,
      contactPreference: data?.contactPreferenceDesc?.description,
      contactPreferenceCode: data?.contactPreference || null,
      idType: data?.customerDetails[0]?.idTypeDesc?.description || null,
      idTypeCode: data?.customerDetails[0]?.idType || null,
      idValue: data?.customerDetails[0]?.idValue || null
    },
    address: {
      addressId: data?.customerDetails[0]?.address?.dataValues.addressId || null,
      hno: data?.customerDetails[0]?.address?.dataValues.hno || null,
      buildingName: data?.customerDetails[0]?.address?.dataValues.buildingName || null,
      road: data?.customerDetails[0]?.address?.dataValues.road || null,
      street: data?.customerDetails[0]?.address?.dataValues.street || null,
      city: data?.customerDetails[0]?.address?.dataValues.city || null,
      district: data?.customerDetails[0]?.address?.dataValues.district || null,
      state: data?.customerDetails[0]?.address?.dataValues.state || null,
      postCode: data?.customerDetails[0]?.address?.dataValues.postCode || null,
      country: data?.customerDetails[0]?.address?.dataValues.country || null
    },
    interaction: []
  }
  const interaction = interactionsOfCustomer

  if (interaction?.length > 0) {
    for (const i of interaction) {
      response.interaction.push({
        intxnId: i?.intxnId || null,
        intxnType: i?.srType?.description || null, // i?.intxnType || null,
        problemCause: i?.cmpProblemDesp?.description || null,
        status: i?.currStatusDesc?.description || null, // i?.currStatus || null,
        about: i?.inqCauseDesp?.description || null,
        createdAt: i?.createdAt || null,
        updatedAt: i?.updatedAt || null
      })
    }
  }

  return response
}

// Report Transform-End
