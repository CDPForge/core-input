// __tests__/logController.test.ts
import { Request, Response } from 'express';
import { post } from '../src/controllers/logsController';
import { KafkaProducer } from '../src/kafkaProducer';
import { Event } from '../src/types';
// Mock del KafkaProducer
jest.mock('../src/kafkaProducer', () => {
    return {
        KafkaProducer: {
            getInstance: jest.fn().mockReturnThis()
        },
    };
});

const validEvent: Event = {
    client: 100,
    instance: 100,
    event: 'click',
    href: 'https://www.example.com',
    pageTitle: 'Example Page',
    timestamp: new Date().toISOString(),
    did: 'unique-device-id',
    session: 'session-id',
}

describe('logController', () => {
    let kafkaProducerMock: jest.Mocked<KafkaProducer>;

    beforeEach(() => {

        kafkaProducerMock = KafkaProducer.getInstance() as jest.Mocked<KafkaProducer>;

        kafkaProducerMock.sendLogToKafka = jest.fn();
        kafkaProducerMock.connect = jest.fn();
        kafkaProducerMock.disconnect = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return 400 if log message is missing', async () => {
        const req = { headers: { 'user-agent': "ua-test" }, body: {} } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
            sendStatus: jest.fn(),
            links: jest.fn(), 
            jsonp: jest.fn(),
        } as unknown as Response;

        await post(req, res, ()=>{});

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should send log to Kafka and return 200', async () => {
        const req = { headers: { 'user-agent': "ua-test" }, body: { events: [validEvent] } } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
            sendStatus: jest.fn(),
            links: jest.fn(),
            jsonp: jest.fn(),
        } as unknown as Response;

        kafkaProducerMock.sendLogToKafka.mockResolvedValueOnce(undefined); // Simula il successo

        await post(req, res, ()=>{});

        expect(kafkaProducerMock.sendLogToKafka).toHaveBeenCalledWith(req.body.events);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should send log to Kafka and return 200 even if the events is not an array, but a single event', async () => {
        const req = { headers: { 'user-agent': "ua-test" }, body: { events: validEvent } } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
            sendStatus: jest.fn(),
            links: jest.fn(),
            jsonp: jest.fn(),
        } as unknown as Response;

        kafkaProducerMock.sendLogToKafka.mockResolvedValueOnce(undefined); // Simula il successo

        await post(req, res, ()=>{});

        expect(kafkaProducerMock.sendLogToKafka).toHaveBeenCalledWith([req.body.events]);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 500 if there is an error sending log to Kafka', async () => {
        const req = { headers: { 'user-agent': "ua-test" }, body: { events: validEvent } } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
            sendStatus: jest.fn(),
            links: jest.fn(),
            jsonp: jest.fn(),
            setHeader: jest.fn(),
        } as unknown as Response;

        kafkaProducerMock.sendLogToKafka.mockRejectedValueOnce(new Error('Kafka error'));

        await post(req, res, ()=>{});

        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('should return invalid events if the event is not a valid event and send to kafka the valid events', async () => {
        const req = { headers: { 'user-agent': "ua-test" }, body: { events: [validEvent, {event: 'invalid'}] } } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
            sendStatus: jest.fn(),
            links: jest.fn(),
            jsonp: jest.fn(),
            setHeader: jest.fn(),
        } as unknown as Response;

        kafkaProducerMock.sendLogToKafka.mockResolvedValueOnce(undefined); 
        // Simula il successo
        await post(req, res, ()=>{});
        

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({invalidEvents: [{event: 'invalid'}]});
        expect(kafkaProducerMock.sendLogToKafka).toHaveBeenCalledWith([validEvent]);
    });
    test('should set header Observe-Browsing-Topics to ?1 if the event is a topics event', async () => {
        const evt = Object.assign({},validEvent,{ event: 'topics' });
        const req = { headers: { 'user-agent': "ua-test", 'Sec-Browsing-Topics': '(1 2 3);v=chrome.123:123:123' }, body: { events: [evt] } } as unknown as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
            sendStatus: jest.fn(),
            links: jest.fn(),
            jsonp: jest.fn(),
            setHeader: jest.fn(),
        } as unknown as Response;
        kafkaProducerMock.sendLogToKafka.mockResolvedValueOnce(undefined); // Simula il successo
        await post(req, res, ()=>{});
        expect(res.setHeader).toHaveBeenCalledWith('Observe-Browsing-Topics', '?1');
        expect(kafkaProducerMock.sendLogToKafka).toHaveBeenCalledWith([evt]);
        expect(evt.topics).toBeDefined();
        expect(evt.topics).toEqual([1,2,3]);
    }); 
});
