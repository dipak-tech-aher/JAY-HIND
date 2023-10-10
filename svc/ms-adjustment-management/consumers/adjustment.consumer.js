import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import AdjustmentService from '@services/adjustment.service'
import { config } from '@configs/env.config'

class AdjustmentConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.adjustmnetGroup })
    this.adjustmnetService = new AdjustmenttService()
  }

  async run () {
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: config.kafka.adjustmentTopic,
      fromBeginning: true
    })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value?.toString() || '{}')

        if (msg.type === 'register') {
          try {
            await this.adjustmnetService.createAdjustment(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}

export default AdjustmentConsumer
