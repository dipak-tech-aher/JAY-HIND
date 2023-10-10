import kafka from '@configs/kafka.config'
import logger from '@utils/logger'
import AppointmentService from '@services/appointment.service'
import { config } from '@configs/env.config'

class AppointmentConsumer {
  constructor () {
    this.consumer = kafka.consumer({ groupId: config.kafka.appointmentGroup })
    this.appointmentService = new AppointmentService()
  }

  async run () {
    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: config.kafka.customerTopic,
      fromBeginning: true
    })

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const msg = JSON.parse(message.value?.toString() || '{}')

        if (msg.type === 'create_customer') {
          try {
            await this.appointmentService.createCustomer(msg.value)
          } catch (error) {
            console.log(error)
            logger.error(error)
          }
        }
      }
    })
  }
}

export default CustomerConsumer
