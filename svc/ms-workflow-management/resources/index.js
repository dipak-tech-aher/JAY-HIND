import { camelCaseConversion, pickProperties } from '@utils'
import { each, get } from 'lodash'

module.exports = {
  // single transformation
  Transform (value) {
    const requiredProperties = []

    return pickProperties(camelCaseConversion(value), requiredProperties)
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

  transformRole (roles = []) {
    let response
    if (Array.isArray(roles)) {
      response = []
      each(roles, (role) => {
        response.push(this.transformRole(role))
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
}
