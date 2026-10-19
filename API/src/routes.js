import { con } from './repository/connection.js';
import grupos from './controller/gruposController.js';
import instituicoes from './controller/instituicoesController.js';
import usuario from './controller/usuariosController.js'; // </3


export function addRoutes(api) {
    
    api.get('/api/status', (req, res) => {
        res.status(200).json({
            status: 'ok',
            mensagem: 'API Funcionando'
        });
    });

    api.use(grupos);
    api.use(instituicoes);
    api.use(usuario)
}