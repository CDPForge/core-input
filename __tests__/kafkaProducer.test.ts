// __tests__/kafkaProducer.test.ts
import { KafkaProducer } from '../src/kafkaProducer';

// Mock della libreria Kafka
jest.mock('kafkajs', () => {
    return {
        Kafka: jest.fn().mockImplementation(() => ({
            producer: jest.fn().mockReturnValue({
                connect: jest.fn(),
                disconnect: jest.fn(),
                send: jest.fn(),
            }),
        })),
    };
});

describe('KafkaProducer', () => {
    let kafkaProducer: KafkaProducer;

    beforeEach(() => {
        kafkaProducer = KafkaProducer.getInstance(); // Ottieni l'istanza singleton
    });

    afterEach(() => {
        jest.clearAllMocks(); // Pulisce i mock tra i test
    });

    test('should connect to Kafka', async () => {
        await kafkaProducer.connect();
        const producer = (kafkaProducer as any).producer;
        expect(producer.connect).toHaveBeenCalledTimes(1); // Verifica che connect sia stato chiamato una volta
    });

    test('should send a log to Kafka', async () => {
        const log = [{client: 100, instance:100}];
        await kafkaProducer.sendLogToKafka(log);
        const producer = (kafkaProducer as any).producer;
        expect(producer.send).toHaveBeenCalledWith({
            topic: 'logs',
            messages: [{ value: JSON.stringify(log[0]) }],
        });
    });

    test('should disconnect from Kafka', async () => {
        await kafkaProducer.disconnect();
        const producer = (kafkaProducer as any).producer;
        expect(producer.disconnect).toHaveBeenCalledTimes(1); // Verifica che disconnect sia stato chiamato una volta
    });
});
