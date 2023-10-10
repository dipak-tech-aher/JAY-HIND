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
            await this.authenticationService.createAuthentication(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}

export default AuthenticationConsumer
