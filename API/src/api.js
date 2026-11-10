import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { addRoutes } from './routes.js';

const api = express();
api.use(cors());
api.use(express.json({ limit: '1mb' }));
addRoutes(api);

const port = Number(process.env.PORT || 3000);
api.listen(port,  () => console.log(`-> API subiu com sucesso na porta ${port}`));