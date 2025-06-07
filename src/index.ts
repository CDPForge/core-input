import express from 'express';
import defineRoutes from './routes';
import { KafkaProducer } from './kafkaProducer';
import requestIp from 'request-ip';

const app = express();

const kafkaProducer = KafkaProducer.getInstance();

app.use(express.json());
app.use(requestIp.mw());

defineRoutes(app);

const startServer = () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
  });
};

const start = async () => {
  await kafkaProducer.connect();
  startServer();
};

const handleExit = async () => {
  console.log('Arresto del server in corso...');
  await kafkaProducer.disconnect();
  console.log('Kafka disconnesso correttamente');
  process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

start().catch((err) => {
  console.error('Errore durante l\'avvio del server:', err);
  handleExit();
});
