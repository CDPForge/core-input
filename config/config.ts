// src/config/config.ts

export const kafkaConfig = {
    clientId: 'log-server',
    brokers: ['localhost:9092'], // Indica l'indirizzo del tuo broker Kafka
    topic: 'logs', // Nome del topic Kafka dove inviare i log
  };
  