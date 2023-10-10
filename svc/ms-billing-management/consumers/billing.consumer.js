import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import BillingService from '@services/billing.service'
import { config } from '@configs/env.config'

class BillingConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.billingGroup })
    this.billingService = new BillingService()
  }

  async run () {
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: config.kafka.billingTopic,
      fromBeginning: true
    })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value?.toString() || '{}')

        if (msg.type === 'register') {
          try {
            await this.billingService.createBilling(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}

export default BillingConsumer
