// src/controllers/logController.ts
import { Request, Response } from 'express';
import { KafkaProducer } from '../kafkaProducer';

const kafkaProducer = KafkaProducer.getInstance();

// Funzione per gestire la rotta POST /log
export const post = async (req: Request, res: Response) => {
  const log = req.body;

  if (!log || !log.events) {
    return res.status(400).end();
  }

  if (!Array.isArray(log.events)) {
    log.events = [log.events];
  }

  log.events = log.events.map(l => {
    l.ua = req.headers['user-agent'];
    l.ip = req.clientIp;
    return l;
  });

  await kafkaProducer.sendLogToKafka(log.events)
  .then(() => res.status(200).end())
  .catch((err) => {
    console.error(err);
    res.status(500).end();
  });
};
