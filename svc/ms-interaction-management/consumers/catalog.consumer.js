import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import CatalogService from '@services/catalog.service'
import { config } from '@configs/env.config'

class CatalogConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.userGroup })
    this.catalogService = new CatalogService()
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
        //     await this.catalogService.createCatalog(msg.value)
        //   } catch (error) {
        //     console.log(error)
        //     logger.error(error)
        //   }
        // }
      }
    })
  }
}

export default CatalogConsumer
