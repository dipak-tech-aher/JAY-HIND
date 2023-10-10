import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import InvoiceService from '@services/invoice.service'
import { config } from '@configs/env.config'

class InvoiceConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.userGroup })
    this.invoiceService = new InvoiceService()
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

        // if (msg.type === 'register') {
        //   try {
        //     await this.invoiceService.createCatalog(msg.value)
        //   } catch (error) {
        //     console.log(error)
        //     logger.error(error)
        //   }
        // }
      }
    })
  }
}

export default InvoiceConsumer
