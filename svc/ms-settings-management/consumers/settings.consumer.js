import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import AssetService from '@services/asset.service'
import { config } from '@configs/env.config'

class AssetConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.assetGroup })
    this.Service = new AssetService()
  }

  async run () {
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: config.kafka.assetTopic,
      fromBeginning: true
    })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value?.toString() || '{}')

        if (msg.type === 'register') {
          try {
            await this.assetService.createAsset(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}

export default AssetConsumer
