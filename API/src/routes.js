import { con } from './repository/connection.js';
import grupos from './controller/gruposController.js';
import instituicoes from './controller/instituicoesController.js'

export function addRoutes(api) {
    
    api.get('/api/status', (req, res) => {
        res.status(200).json({
            status: 'ok',
            mensagem: 'API Funcionando'
        });
    });

    api.use(grupos);
    api.use(instituicoes);
}