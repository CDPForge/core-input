// __tests__/logController.test.ts
import { Request, Response } from 'express';
import { post } from '../src/controllers/logsController';
import { KafkaProducer } from '../src/kafkaProducer';

// Mock del KafkaProducer
jest.mock('../src/kafkaProducer', () => {
    return {
        KafkaProducer: {
            getInstance: jest.fn().mockReturnThis()
        },
    };
});

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
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), end: jest.fn() } as Response;

        await post(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should send log to Kafka and return 200', async () => {
        const req = { headers: { 'user-agent': "ua-test" }, body: { events: [{client: 100, instance:100}] } } as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), end: jest.fn() } as Response;

        kafkaProducerMock.sendLogToKafka.mockResolvedValueOnce(undefined); // Simula il successo

        await post(req, res);

        expect(kafkaProducerMock.sendLogToKafka).toHaveBeenCalledWith(req.body.events);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should send log to Kafka and return 200 even if the events is not an array, but a single event', async () => {
        const req = { headers: { 'user-agent': "ua-test" }, body: { events: {client: 100, instance:100} } } as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), end: jest.fn() } as Response;

        kafkaProducerMock.sendLogToKafka.mockResolvedValueOnce(undefined); // Simula il successo

        await post(req, res);

        expect(kafkaProducerMock.sendLogToKafka).toHaveBeenCalledWith(req.body.events);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 500 if there is an error sending log to Kafka', async () => {
        const req = { headers: { 'user-agent': "ua-test" }, body: { events: [{client: 100, instance:100}] } } as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), end: jest.fn() } as Response;

        kafkaProducerMock.sendLogToKafka.mockRejectedValueOnce(new Error('Kafka error'));

        await post(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
