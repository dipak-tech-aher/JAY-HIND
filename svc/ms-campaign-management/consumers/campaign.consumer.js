import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import CampaignService from '@services/campaign.service'
import { config } from '@configs/env.config'

class CampaignConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.campaignGroup })
    this.campaignService = new CampaignService()
  }

  async run () {
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: config.kafka.campaignTopic,
      fromBeginning: true
    })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value?.toString() || '{}')

        if (msg.type === 'register') {
          try {
            await this.campaignService.createCampaign(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}

export default CampaignConsumer
