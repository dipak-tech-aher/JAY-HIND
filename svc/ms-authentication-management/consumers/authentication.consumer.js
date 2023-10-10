import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import AuthenticationService from '@services/authentication.service'
import { config } from '@configs/env.config'

class AuthenticationConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.authenticationGroup })
    this.authenticationService = new AuthenticationService()
  }

  async run () {
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: config.kafka.authenticationTopic,
      fromBeginning: true
    })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value?.toString() || '{}')

        if (msg.type === 'register') {
          try {
            await this.authenticationService.registerUser(msg.value)
          } catch (error) {
            logger.error(error)
          }
        } else if (msg.type === 'sent-otp') {
          try {
            await this.authenticationService.sendOTP(msg.value)
          } catch (error) {
            logger.error(error)
          }
        } else if (msg.type === 'login') {
          try {
            await this.authenticationService.login(msg.value)
          } catch (error) {
            logger.error(error)
          }
        } else if (msg.type === 'forgot_password') {
          try {
            await this.authenticationService.forgotPassword(msg.value)
          } catch (error) {
            logger.error(error)
          }
        } else if (msg.type === 'reset_password') {
          try {
            await this.authenticationService.resetPassword(msg.value)
          } catch (error) {
            logger.error(error)
          }
        } else if (msg.type === 'logout') {
          try {
            await this.authenticationService.logout(msg.value)
          } catch (error) {
            logger.error(error)
          }
        } else if (msg.type === 'update_session') {
          try {
            await this.authenticationService.updateUserSession(msg.value)
          } catch (error) {
            logger.error(error)
          }
        } else if (msg.type === 'verify_otp') {
          try {
            await this.authenticationService.validateOTP(msg.value)
          } catch (error) {
            logger.error(error)
          }
        }
      }
    })
  }
}

export default AuthenticationConsumer
