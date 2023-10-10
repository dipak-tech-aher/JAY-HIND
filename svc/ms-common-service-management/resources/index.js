import { camelCaseConversion, pickProperties } from '@utils'
import { get, each } from 'lodash'
import moment from 'moment'

module.exports = {
  // single transformation
  transform (user) {
    const requiredProperties = ['userId', 'contactNo', 'email', 'userType', 'photo', 'title', 'firstName', 'lastName', 'gender', 'dob', 'officeNo', 'status', 'profilePicture', 'location', 'country']

    return pickProperties(camelCaseConversion(user), requiredProperties)
  },

  // array transformation
  transformCollection (users) {
    const self = this
    const data = []
    for (let i = 0; i <= users.length; i++) {
      data.push(self.transform(users[i]))
    }
    return data
  },

  compareRecords (oldRecord, newRecord, fields) {
    let isNotSame = false

    // eslint-disable-next-line array-callback-return
    fields.every(field => {
      if (newRecord[field] && newRecord[field] !== oldRecord[field]) {
        isNotSame = true
      }
    })

    return isNotSame
  },

  transformRecord (oldRecord, newRecord, fields) {
    return fields.reduce((a, v) => ({ ...a, [v]: get(newRecord, v, oldRecord[v]) }), {})
  },
  transformNotificationSource (payload, businessEntityInfo) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        payload = payload?.dataValues ? payload?.dataValues : payload
        response.push(this.transformNotificationSource(payload, businessEntityInfo))
      })
    } else {
      response = {
        source: this.getbusinessEntity(businessEntityInfo, get(payload, 'notificationSource', '')) || null,
        count: Number(get(payload, 'notificationCount', 0))
      }
    }
    return response
  },
  getbusinessEntity (businessEntityInfo, code) {
    let response = null
    if (Array.isArray(code)) {
      response = []
      each(code, (code) => {
        response.push(this.getbusinessEntity(businessEntityInfo, code))
      })
    } else {
      response = businessEntityInfo.find(e => e.code === code)
      if (response) {
        response = {
          code: get(response, 'code', ''),
          description: get(response, 'description', '')
        }
      }
    }
    return response
  },
  transformNotificationDetails (payload, departmentId, roleId, userId) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        // payload = payload?.dataValues ? payload?.dataValues : payload
        response.push(this.transformNotificationDetails(payload, departmentId, roleId, userId))
      })
    } else {
      response = {
        body: get(payload, 'body', ''),
        category: get(payload, 'category', ''),
        createdAt: get(payload, 'createdAt', ''),
        notificationEvents: get(payload, 'notificationEvents', ''),
        notificationId: get(payload, 'notificationId', ''),
        notificationSourceDesc: get(payload, 'notificationSourceDesc', ''),
        notificationType: get(payload, 'notificationType', ''),
        payload: get(payload, 'payload', ''),
        referenceNo: get(payload, 'referenceNo', ''),
        subject: get(payload, 'subject', ''),
        entity: get(payload, 'interactionDetails', '')
          ? this.transformInteractionEntity(get(payload, 'interactionDetails', ''), departmentId, roleId, userId)
          : get(payload, 'orderDetails', '')
            ? this.transformOrderEntity(get(payload, 'orderDetails', ''), departmentId, roleId, userId)
            : get(payload, 'appointmentDetails', '')
              ? this.transformAppointment(get(payload, 'appointmentDetails', ''), departmentId, roleId, userId)
              : null
      }
    }
    return response
  },
  transformInteractionEntity (payload, departmentId, roleId, userId) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        // payload = payload?.dataValues ? payload?.dataValues : payload
        response.push(this.transformInteractionEntity(payload, departmentId, roleId, userId))
      })
    } else {
      response = {
        source: 'INTERACTION',
        intxnNo: get(payload, 'intxnNo', ''),
        intxnUuid: get(payload, 'intxnUuid', ''),
        status: get(payload, 'intxnStatus', ''),
        type: get(payload, 'currUser', '') === null ? 'ASSIGNTOSELF' : get(payload, 'currUser', '') === userId ? 'REASSIGN' : '',
        currDept: get(payload, 'currEntity', ''),
        currRole: get(payload, 'currRole', ''),
        isEnabled: !!(get(payload, 'currEntity', '') === departmentId && get(payload, 'currRole', '') === roleId && get(payload, 'intxnStatus', '') !== 'CLOSED')
      }
    }
    return response
  },
  transformOrderEntity (payload, departmentId, roleId, userId) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformOrderEntity(payload, departmentId, roleId, userId))
      })
    } else {
      response = {
        source: 'ORDER',
        orderNo: get(payload, 'orderNo', ''),
        orderUuid: get(payload, 'orderUuid', ''),
        status: get(payload, 'orderStatus', ''),
        type: get(payload, 'currUser', '') === null ? 'ASSIGNTOSELF' : get(payload, 'currUser', '') === userId ? 'REASSIGN' : '',
        currDept: get(payload, 'currEntity', ''),
        currRole: get(payload, 'currRole', ''),
        isEnabled: !!(get(payload, 'currEntity', '') === departmentId && get(payload, 'currRole', '') === roleId && (get(payload, 'intxnStatus', '') !== 'CLS' || get(payload, 'intxnStatus', '') !== 'CNCLED'))
      }
    }
    return response
  },
  transformAppointment (payload, departmentId, roleId, userId) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformAppointment(payload, departmentId, roleId, userId))
      })
    } else {
      response = {
        source: 'APPOINTMENT',
        appointmentTxnNo: get(payload, 'appointmentTxnNo', ''),
        status: get(payload, 'status', ''),
        type: get(payload, 'appointMode', ''),
        link: get(payload, 'appointModeValue', ''),
        isEnabled: checkIsAppointmentValid(get(payload, 'appointDate', ''), get(payload, 'appointStartTime', ''))
      }
    }
    return response
  }
}

const checkIsAppointmentValid = (appointmentDate, appointmentTime) => {
  try {
    const appointmentDateTime = appointmentDate + ' ' + appointmentTime
    if (moment(appointmentDateTime, 'YYYY-MM-DD HH:mm').isBefore(moment())) {
      return false
    }
    return true
  } catch (error) {

  }
}
