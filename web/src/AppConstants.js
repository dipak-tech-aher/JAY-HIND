export const statusConstantCode = {
  status: {
    ACTIVE: 'AC',
    IN_ACTIVE: 'IN',
    PENDING: 'PENDING',
    TEMPORARY: 'TEMP',
    NEW: 'NEW',
    ASSIGNED: 'ASSIGNED',
    CLOSED: 'CLOSED',
    CANCELLED: 'CANCELLED',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    CREATED: 'CREATED',
    DONE: 'DONE',
    USER_WAIT: 'USER_WAIT',
    INPROCESS: 'INP',
    SERVICE_TEMP: 'SS_TEMP',
    SERVICE_ACTIVE: 'SS_AC',
    SERVICE_PEND: 'SS_PEND',
    CUST_TEMP: 'CS_TEMP',
    CUST_ACTIVE: 'CS_ACTIVE',
    CUST_PEND: 'CS_PEND',
    HELPDESK_NEW: 'HS_NEW',
    HELPDESK_CLOSED: 'HS_CLS',
    HELPDESK_CANCEL: 'HS_CANCE',
    HELPDESK_ASSIGN: 'HS_ASSGN',
    HELPDESK_ESCALATED: 'HS_ESCALATED'
  },
  common: {
    YES: 'Y',
    NO: 'N',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    lIMIT: 10,
    PAGE: 0,
    PASSWORD_LENGTH: 8,
    AVAILABLE: 'AVAILABLE',
    ALL: 'ALL',
    INTERACTION: 'TMC_INTERACTION'
  },
  businessEntity: {
    PROJECT: 'PROJECT',
    SEVERITY: 'SEVERITY',
    HELPDESK_TYPE: 'HELPDESK_TYPE',
    HELPDESKSTATUS: 'HELPDESK_STATUS',
    HELPDESKCANCELREASON: 'HELPDESK_CANCEL_REASON',
    AUDIOCONF: 'AUDIO_CONF',
    VIDEOCONF: 'VIDEO_CONF',
    WEB: 'WEB',
    IVR: 'IVR',
    MOBILELIVECHAT: 'MOBILE-LIVECHAT',
    WEBSITELIVECHAT: 'WEBSITE-LIVECHAT',
    WHATSAPPLIVECHAT: 'WHATSAPP-LIVECHAT',
    FBLIVECHAT: 'FB-LIVECHAT',
    MOBILEAPP: 'MOBILEAPP',
    WEBPORTAL: 'WEBPORTAL',
    EMAIL: 'E-MAIL',
    LIVECHAT: 'LIVECHAT',
    WALKIN: 'WALKIN',
    INSTAGRAM: 'INSTAGRAM-LIVECHAT'
  },
  entityCategory: {
    CUSTOMER: 'CUSTOMER',
    SERVICE: 'SERVICE',
    PROFILE: 'PROFILE',
    USER: 'USER',
    INTERACTION: 'INTERACTION',
    ACCOUNT: 'ACCOUNT',
    ORDER: 'ORDER',
    HELPDESK: 'HELPDESK',
    APPOINTMENT: 'APPOINTMENT',
    REQUEST: 'REQUEST'
  },
  negativeIntxnTypes: ['REQCOMP', 'APPEALS', 'GRIEVANCE'],
  bussinessSetup: ['PF_UTILITY'],
  topPerformanceActivity: [{
    label: "Interaction",
    value: "Interaction"
  }, {
    label: "Order",
    value: "Order"
  }],
  colorCode: {
    PRTYHGH: { color: 'text-danger', desc: 'High' },
    PRTYMED: { color: 'text-warning', desc: 'Medium' },
    PRTYLOW: { color: 'text-success', desc: 'Low' },
    // VIP: 'text-info'
  },
  cancelStatus: ['NEW']
}

export const DEFAULT_LOCALE = 'en'
export const SalesDashboardConstant = {
  offlineStore: ['Walk In']
}

export const moduleConfig = {
  appointment: "CFG_APPOINTMENT",
  admin: "CFG_ADMIN",
  account: "CFG_ACCOUNT",
  billing: "CFG_BILLING",
  contract: "CFG_CONTRACT",
  customer: "CFG_CUSTOMER",
  dashboard: "CFG_DASHBOARD",
  helpdesk: "CFG_HELPDESK",
  interaction: "CFG_INTERACTION",
  invoice: "CFG_INVOICE",
  mis: "CFG_MIS",
  order: "CFG_ORDER",
  product: "CFG_PRODUCT",
  payment: "CFG_PAYMENT",
  profile: "CFG_PROFILE",
  service: "CFG_SERVICE"
}