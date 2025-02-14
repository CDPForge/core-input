// src/server.ts
import express from 'express';
import defineRoutes from './routes';
import { KafkaProducer } from './kafkaProducer';
import requestIp from 'request-ip';

// Crea una nuova istanza di Express
const app = express();

// Configura KafkaProducer
const kafkaProducer = KafkaProducer.getInstance();

// Middleware per il parsing del corpo della richiesta in formato JSON
app.use(express.json());
app.use(requestIp.mw());

defineRoutes(app);

// Avvio del server Express
const startServer = () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
  });
};

// Esegui l'avvio del producer Kafka e del server Express
const start = async () => {
  await kafkaProducer.connect();
  startServer();
};

// Gestire la disconnessione di Kafka alla chiusura del server
const handleExit = async () => {
  console.log('Arresto del server in corso...');
  await kafkaProducer.disconnect();
  console.log('Kafka disconnesso correttamente');
  process.exit(0);
};

// Ascolta i segnali di chiusura per gestire la disconnessione
process.on('SIGINT', handleExit);  // Interruzione del processo (Ctrl + C)
process.on('SIGTERM', handleExit); // Termination (es. kill del processo)

start().catch((err) => {
  console.error('Errore durante l\'avvio del server:', err);
  handleExit();
});
