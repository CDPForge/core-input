// src/routes/apiRoutes.ts
import { Router } from 'express';
import { post } from '../controllers/logsController';

const router = Router();

// Definisci la rotta POST per ricevere i log
router.post('/log', post);

export default router;
