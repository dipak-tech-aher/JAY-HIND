import { camelCaseConversion, pickProperties } from '@utils'

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
  }

}
