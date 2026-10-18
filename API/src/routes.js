import { con } from './repository/connection.js';

export function addRoutes(api) {
    
    api.get('/api/status', (req, res) => {
        res.status(200).json({
            status: 'ok',
            mensagem: 'API Funcionando'
        });
    });

    api.use(instituicoesController);
}