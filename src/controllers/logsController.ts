// src/controllers/logController.ts
import { Request, RequestHandler, Response } from 'express';
import { KafkaProducer } from '../kafkaProducer';
import { Event } from '../types';
const kafkaProducer = KafkaProducer.getInstance();

// Funzione per gestire la rotta POST /log
export const post: RequestHandler = async (req: Request, res: Response) => {
  const log = req.body;

  if (!log || !log.events) {
    res.status(400).end();
    return;
  }

  let events: Event[] = Array.isArray(log.events) ? log.events : [log.events];

  const invalidEvents: any[] = [];
  events = events.filter((event: Event) => {
    if (!isValidEvent(event)) {
      console.error(`Invalid event: ${JSON.stringify(event)}`);
      invalidEvents.push(event);
      return false;
    }
    return true;
  });

  events = events.map((l: Event) => {
    l.userAgent = req.headers['user-agent'];
    l.ip = req.clientIp;
    if (l.event === 'topics') {
      res.setHeader('Observe-Browsing-Topics', '?1');
    }
    const googleTopics = req.headers['Sec-Browsing-Topics'] as string;
    if (googleTopics) {
      const topicsMatch = googleTopics.match(/\(([\d\s]+)\);.*/);
      if (topicsMatch) { 
        l.topics = topicsMatch[1].split(" ").map(Number);
      }
    }
    return l;
  });

  await kafkaProducer.sendLogToKafka(events)
  .then(() => res.status(200).json({invalidEvents}).end())
  .catch((err) => {
    console.error(err);
    res.status(500).end();
  });
};

const isValidEvent = (event: Event): boolean => {
  return (
    typeof event.client === 'number' &&
    typeof event.instance === 'number' &&
    typeof event.event === 'string' &&
    typeof event.href === 'string' &&
    typeof event.pageTitle === 'string' &&
    (typeof event.pageDescription === 'string' || event.pageDescription === undefined) &&
    (typeof event.pageImage === 'string' || event.pageImage === undefined) &&
    (typeof event.pageType === 'string' || event.pageType === undefined) &&
    (typeof event.referrer === 'string' || event.referrer === undefined) &&
    typeof event.timestamp === 'string' &&
    typeof event.did === 'string' &&
    typeof event.session === 'string' &&
    (typeof event.gdpr === 'string' || event.gdpr === undefined) &&
    (typeof event.userAgent === 'string' || event.userAgent === undefined) &&
    (typeof event.ip === 'string' || event.ip === undefined) &&
    (Array.isArray(event.topics) || event.topics === undefined)
  );
};


