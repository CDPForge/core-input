// src/routes/apiRoutes.ts
import { post } from './controllers/logsController';
import express from 'express';

const defineRoutes = (app: express.Express) => {
    app.post('/events', post);
}

export default defineRoutes;
