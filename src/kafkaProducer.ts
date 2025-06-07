// src/kafka/kafkaProducer.ts
import { Kafka, Producer } from 'kafkajs';
import Config from './config';
import { Event } from './types';

export class KafkaProducer {
  private producer: Producer;
  private kafka: Kafka;
  private static singleInstance: KafkaProducer;

  private static podName = process.env.CLIENT_ID || 'default-client-id';

  private constructor() {
    this.kafka = new Kafka({
      clientId: `tracker-api-pod-${KafkaProducer.podName}`,
      brokers: Config.getInstance().config.kafkaConfig.brokers,
    });
    this.producer = this.kafka.producer();
  }

  public static getInstance(): KafkaProducer {
    if (!KafkaProducer.singleInstance) {
      KafkaProducer.singleInstance = new KafkaProducer();
    }
    return KafkaProducer.singleInstance;
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    console.log('Producer Kafka connesso');
  }

  async sendLogToKafka(logs: Event[]): Promise<void> {
    try {
      await this.producer.send({
        topic: Config.getInstance().config.kafkaConfig.topic.LOGS, // Usa il topic definito nel file di configurazione
        messages: logs.map(l => {return {value: JSON.stringify(l)}})
      });
      console.log('Log inviato con successo a Kafka');
    } catch (error) {
      console.error('Errore nell\'invio del log a Kafka:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    console.log('Producer Kafka disconnesso');
  }
}