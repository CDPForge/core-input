// src/kafka/kafkaProducer.ts
import { Kafka, Producer } from 'kafkajs';
import { kafkaConfig } from '../config/config'; // Importa la configurazione


export class KafkaProducer {
  private producer: Producer;
  private kafka: Kafka;
  private static singleInstance: KafkaProducer;

  private constructor() {
    this.kafka = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    });
    this.producer = this.kafka.producer();
  }

  public static getInstance(): KafkaProducer {
    if (!KafkaProducer.singleInstance) {
      KafkaProducer.singleInstance = new KafkaProducer();
    }
    return KafkaProducer.singleInstance;
  }

  // Connetti il producer Kafka
  async connect(): Promise<void> {
    await this.producer.connect();
    console.log('Producer Kafka connesso');
  }

  // Invia un log al topic Kafka
  async sendLogToKafka(log: object): Promise<void> {
    try {
      await this.producer.send({
        topic: kafkaConfig.topic, // Usa il topic definito nel file di configurazione
        messages: [
          {
            value: JSON.stringify(log),
          },
        ],
      });
      console.log('Log inviato con successo a Kafka');
    } catch (error) {
      console.error('Errore nell\'invio del log a Kafka:', error);
    }
  }

  // Disconnetti il producer Kafka
  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    console.log('Producer Kafka disconnesso');
  }
}