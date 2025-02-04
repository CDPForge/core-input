// src/controllers/logController.ts
import { Request, Response } from 'express';
import { KafkaProducer } from '../kafkaProducer';

const kafkaProducer = KafkaProducer.getInstance();

// Funzione per gestire la rotta POST /log
export const post = async (req: Request, res: Response) => {
  const log = req.body;

  if (!log || !log.message) {
    return res.status(400).end();
  }
  await kafkaProducer.sendLogToKafka(log).then(() => res.status(200).end()).catch((err) => res.status(500).end());
};
