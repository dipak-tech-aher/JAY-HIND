import { CompressionTypes } from 'kafkajs'
import kafka from '@config/kafka.config'

export class ProducerService {
  constructor () {
    this.producer = kafka.producer()
  }

  async send (messages, topic) {
    await this.producer.connect()
    await this.producer.send({
      messages: [{ value: JSON.stringify(messages) }],
      topic,
      compression: CompressionTypes.GZIP
    })
    await this.producer.disconnect()
  }
}

// export default new ProducerService()
