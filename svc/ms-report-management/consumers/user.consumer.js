import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import UserService from '@services/user.service'
import { config } from '@configs/env.config'

class UserConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.userGroup })
    this.userService = new UserService()
  }

  async run () {
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: config.kafka.userTopic,
      fromBeginning: true
    })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value?.toString() || '{}')
        if (msg.type === 'create_user') {
          try {
            await this.userService.createUser(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        } else if (msg.type === 'approve_new_user') {
          try {
            await this.userService.approveNewUser(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        } else if (msg.type === 'switch_user') {
          try {
            await this.userService.getUserDepartmentAndRoles(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        } else if (msg.type === 'update-user') {
          try {
            await this.userService.updateUser(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        } else if (msg.type === 'search-user') {
          try {
            await this.userService.getUserList(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        } else if (msg.type === 'search-user_id') {
          try {
            await this.userService.getUser(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        } else if (msg.type === 'verify-users') {
          try {
            await this.userService.verifyUsers(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        } else if (msg.type === 'verify-emails') {
          try {
            await this.userService.verifyEmails(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}

export default UserConsumer
