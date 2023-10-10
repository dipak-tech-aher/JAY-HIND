import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import BulkuploadService from '@services/bulkupload.service'
import { config } from '@configs/env.config'

export class BulkuploadConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.bulkuploadGroup })
    this.Service = new BulkuploadService()
  }

  async run () {
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: config.kafka.bulkuploadTopic,
      fromBeginning: true
    })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value?.toString() || '{}')

        if (msg.type === 'register') {
          try {
            await this.bulkuploadService.createBulkupoad(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}
