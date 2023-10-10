import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import ContractService from '@services/contract.service'
import { config } from '@configs/env.config'

class contractConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.userGroup })
    this.contractService = new ContractService()
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
        //     await this.contractService.createCatalog(msg.value)
        //   } catch (error) {
        //     console.log(error)
        //     logger.error(error)
        //   }
        // }
      }
    })
  }
}

export default contractConsumer
