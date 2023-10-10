import { Kafka } from 'kafkajs';
import { config } from '@config/env.config';

const kafka = new Kafka({
	clientId: config.kafka.clientId,
	brokers: config.kafka.brokers
});

export default kafka;
