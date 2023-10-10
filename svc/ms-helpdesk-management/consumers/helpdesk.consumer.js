import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import HelpdeskService from '@services/helpdesk.service'
import { config } from '@configs/env.config'

class HelpdeskConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.helpdeskGroup })
    this.helpdeskService = new HelpdeskService()
  }

  async run () {
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: config.kafka.helpdeskTopic,
      fromBeginning: true
    })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value?.toString() || '{}')

        if (msg.type === 'create_helpdesk') {
          try {
            await this.helpdeskService.createHelpdesk(msg.value)
          } catch (error) {
            logger.error(error)
          }
        }
      }
    })
  }
}

export default HelpdeskConsumer
