import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import OrganizationService from '@services/organization.service'
import { config } from '@configs/env.config'

class OrganizationConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.userGroup })
    this.organizationService = new OrganizationService()
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
            await this.organizationService.createOrganization(msg.value)
          } catch (error) {
            logger.error(error)
          }
        }
      }
    })
  }
}

export default OrganizationConsumer
