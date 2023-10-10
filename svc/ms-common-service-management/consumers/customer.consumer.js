import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import CustomerService from '@services/customer.service'
import { config } from '@configs/env.config'

class CustomerConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.customerGroup })
    this.customerService = new CustomerService()
  }

  async run () {
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: config.kafka.customerTopic,
      fromBeginning: true
    })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value?.toString() || '{}')

        if (msg.type === 'create_customer') {
          try {
            await this.customerService.createCustomer(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}

export default CustomerConsumer
