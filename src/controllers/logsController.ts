// src/controllers/logController.ts
import { Request, Response } from 'express';
import { KafkaProducer } from '../kafkaProducer';

const kafkaProducer = KafkaProducer.getInstance();

// Funzione per gestire la rotta POST /log
export const post = async (req: Request, res: Response) => {
  const log = req.body;

  if (!log || !log.message) {
    return res.status(400).json({ error: 'Il log deve contenere un messaggio.' });
  }

  try {
    // Invia il log a Kafka
    await kafkaProducer.sendLogToKafka(log);
    res.status(200).json({ message: 'Log ricevuto e inviato a Kafka.' });
  } catch (error) {
    console.error('Errore nell\'invio del log a Kafka:', error);
    res.status(500).json({ error: 'Errore nell\'invio del log a Kafka.' });
  }
};
