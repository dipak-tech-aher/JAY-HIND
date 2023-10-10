/* eslint-disable no-extend-native */
// import { Op } from 'sequelize'
import { /* USER_ACC_PWD_EXP_DAYS, USER_ACC_PWD_EXP_REMINDER, */ USER_PASSWORD_EXPIRED } from '@utils/constants'
import { getSystemConfiguration } from './user.service'
import { logger } from '@utils'
const cron = require('node-cron')
const { getTenantConnection } = require('@services/connection-service')

const conn = await getTenantConnection('a89d6593-3aa8-437b-9629-9fcbaa201da6')

Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}

export const userAccountPwdExpiryCheck = cron.schedule('0 1 * * *', async () => {
  // const configData = await conn.MetaBusinessConfig.findAll({
  //   where: {
  //     configCode: {
  //       [Op.in]: [USER_ACC_PWD_EXP_DAYS, USER_ACC_PWD_EXP_REMINDER]
  //     }
  //   }
  // })

  // const pwdExpiryDays = configData.find(x => x.configCode === USER_ACC_PWD_EXP_DAYS).configValue
  // const pwdExpiryReminderDays = configData.find(x => x.configCode === USER_ACC_PWD_EXP_REMINDER).configValue

  let systemConfig

  await getSystemConfiguration(conn).then((e) => {
    if (e.status === 200) {
      systemConfig = e?.data
    }
  })

  if (systemConfig) {
    const pwdExpiryDays = systemConfig?.appPwdExpiryDays
    const pwdExpiryReminderDays = systemConfig?.appPwdExpiryNotifyDays

    const pwdHistories = await conn.PwdHistory.findAll({
      includes: [{ model: conn.User, as: 'user' }],
      limit: 1,
      order: [['histInsertedDate', 'DESC']],
      group: ['userId']
    })

    const notifications = []
    const pwdExpiredUsers = []

    // eslint-disable-next-line array-callback-return
    pwdHistories.filter(x => {
      const currentDate = new Date()
      const expiryDate = (new Date(x.histInsertedDate)).addDays(pwdExpiryDays - pwdExpiryReminderDays)
      const diffTime = Math.abs(currentDate - expiryDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (expiryDate <= currentDate) {
        notifications.push({
          email: x.user.email,
          mobile_no: x.user.contact_no,
          notification_type: 'Popup',
          subject: 'Your BCAE account password is about to expire!',
          body: `Your BCAE account password will be expired in ${diffDays} days. Kindly update your password to avoid inconvenience`,
          status: 'NEW',
          user_id: x.user.user_id,
          source: 'Password Expiry Notification',
          markedusers: null
        })
      } else {
        pwdExpiredUsers.push(x.user.user_id)
      }
    })

    if (pwdExpiredUsers.length) await conn.Users.update({ status: USER_PASSWORD_EXPIRED }, { where: { userId: pwdExpiredUsers } })

    if (notifications.length) await conn.Notifications.bulkCreate(notifications, { updateOnDuplicate: ['user_id', 'source'] })
  } else {
    logger.error('System configuration is not available')
  }
})
