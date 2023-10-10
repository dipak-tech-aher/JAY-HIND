import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import BusinessParameterService from '@services/BusinessParameter.service'
import { config } from '@configs/env.config'

export class BusinessParameterConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.userGroup })
    this.businessParameterService = new BusinessParameterService()
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

        if (msg.type === 'register') {
          try {
            await this.businessParameterService.createBusinessParameter(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
        if (msg.type === 'getMenuByRole') {
          try {
            await this.businessParameterService.getMainMenuByRole(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}
