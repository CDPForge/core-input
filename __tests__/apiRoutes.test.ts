// __tests__/apiRoutes.test.ts
import request from 'supertest';
import express from 'express';
import apiRoutes from '../src/routes/apiRoute';
import { KafkaProducer } from '../src/kafkaProducer';

// Mock del KafkaProducer
jest.mock('../src/kafkaProducer', () => {
    return {
        KafkaProducer: {
            getInstance: jest.fn().mockReturnThis(),
        },
    };
});

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('API Routes', () => {
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
        await request(app).post('/api/log').send({}).set('Accept', 'application/json').set('Content-Type', 'application/json').expect(400);
    });

    test('should return 200 if log is sent to Kafka successfully', async () => {
        const log = { events: [{client: 100, instance:100}] };

        kafkaProducerMock.sendLogToKafka.mockResolvedValueOnce(undefined); // Simula il successo

        await request(app).post('/api/log').send(log).set('Accept', 'application/json').set('Content-Type', 'application/json').expect(200);
    });

    test('should return 500 if there is an error sending log to Kafka', async () => {
        const log = { events: [{client: 100, instance:100}] };

        kafkaProducerMock.sendLogToKafka.mockRejectedValueOnce(new Error('Kafka error'));

        await request(app).post('/api/log').send(log).set('Accept', 'application/json').set('Content-Type', 'application/json').expect(500);
    });
});
