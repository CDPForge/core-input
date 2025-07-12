
import { Request, RequestHandler, Response } from 'express';
import { KafkaProducer } from '../kafkaProducer';
import { Event, GoogleTopic, Log, GoogleTopicsMap } from '@cdp-forge/types';
import { UAParser } from 'ua-parser-js';

const kafkaProducer = KafkaProducer.getInstance();

export const post: RequestHandler = async (req: Request, res: Response) => {
  const log = req.body;

  if (!log || !log.events) {
    res.status(400).end();
    return;
  }

  let events: any[] = Array.isArray(log.events) ? log.events : [log.events];

  const invalidEvents: any[] = [];
  const validEvents: Event[] = events.filter((event: Event) => {
    if (!isValidEvent(event)) {
      console.error(`Invalid event: ${JSON.stringify(event)}`);
      invalidEvents.push(event);
      return false;
    }
    return true;
  });

  const logs: Log[] = validEvents.map((l: Event): Log => {
    l.userAgent = req.headers['user-agent'];
    l.ip = req.clientIp;
    if (l.event === 'topics') {
      res.setHeader('Observe-Browsing-Topics', '?1');
    }
    const googleTopics = req.headers['Sec-Browsing-Topics'] as string;
    if (googleTopics) {
      const topicsMatch = googleTopics.match(/\(([\d\s]+)\);.*/);
      if (topicsMatch) {
        l.topics = topicsMatch[1].split(" ").map((topic: string) => Number(topic) as keyof typeof GoogleTopicsMap);
      }
    }

    return eventToLog(l);
  });

  await kafkaProducer.sendLogToKafka(logs)
    .then(() => res.status(200).json({ invalidEvents }).end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
};

const isValidEvent = (event: any): boolean => {
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
    ((Array.isArray(event.topics) && event.topics.every((t: any)=> (Object.keys(GoogleTopicsMap)).includes(t))) || event.topics === undefined)
  );
};

const eventToLog = (event: Event): Log => {
  const log: Log = {
    client: event.client,
    date: event.timestamp,
    instance: event.instance,
    event: event.event,
    referrer: event.referrer,
    session: event.session,
    target: event.target,
    device: { id: event.did, ip: event.ip, userAgent: event.userAgent },
    page: { title: event.pageTitle, type: event.pageType, description: event.pageDescription, image: event.pageImage, href: event.href },
    order: event.order,
    product: event.products
  }

  if (event.userAgent) {
    try {
      const parser = new UAParser(event.userAgent);
      log.device.browser = parser.getBrowser().name;
      log.device.os = parser.getOS().name;
      log.device.type = parser.getDevice().type || ['Windows', 'macOS', 'Linux'].includes(log.device.os!) ? 'Desktop' : undefined;
    } catch (err) {
      console.error('Error parsing user agent:', err);
    }
  }

  if (event.topics) {
    log.googleTopics = event.topics.map((topic: keyof typeof GoogleTopicsMap): GoogleTopic => ({
      id: topic,
      name: GoogleTopicsMap[topic]
    }));
  }

  return log;
}


