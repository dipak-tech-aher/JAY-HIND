import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import KnowledgeBaseService from '@services/KnowledgeBase.service'
import { config } from '@configs/env.config'

export class KnowledgeBaseConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.userGroup })
    this.knowledgeBaseService = new KnowledgeBaseService()
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

        if (msg.type === 'search') {
          try {
            await this.knowledgeBaseService.searchKnowledgeBase(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}
