import express from 'express';
import defineRoutes from './routes';
import requestIp from 'request-ip';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import config from './config/default';
import PulsarProducer from "./pulsarProducer";

const app = express();

app.use(express.json());
app.use(requestIp.mw());

app.use(cors({
  origin: '*'
}));

defineRoutes(app);

const start = async () => {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
  });
};

const handleExit = async () => {
  console.log('Arresto del server in corso...');
  await PulsarProducer.closeAll()
  console.log('Kafka disconnesso correttamente');
  process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

start().catch((err) => {
  console.error('Errore durante l\'avvio del server:', err);
  handleExit();
});
