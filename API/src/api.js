import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { addRoutes } from './routes.js';

const api = express();
api.set('trust proxy', 1);

const origensPermitidas = new Set([
    'https://tcc-consangue1.vercel.app',
    'https://consangue1.vercel.app',
    ...(process.env.CORS_ORIGENS || '').split(',').map(item => item.trim()).filter(Boolean)
]);

if (process.env.NODE_ENV !== 'production') {
    origensPermitidas.add('http://localhost:3000');
    origensPermitidas.add('http://127.0.0.1:3000');
}

api.use(cors({
    origin(origem, callback) {
        callback(null, !origem || origensPermitidas.has(origem));
    }
}));
api.use(express.json({ limit: '1mb' }));
addRoutes(api);

const port = Number(process.env.PORT || 3000);
api.listen(port,  () => console.log(`-> API subiu com sucesso na porta ${port}`));