import gruposCampanhas from './controller/grupos_campanhasController.js';
import membros from './controller/membros_grupoController.js';
import auth from './controller/authController.js';
import { con } from './repository/connection.js';
import grupos from './controller/gruposController.js';
import instituicoes from './controller/instituicoesController.js';
import participacoes from './controller/participacoesController.js';
import usuario from './controller/usuariosController.js'; // </3
import campanhas from './controller/campanhasController.js';


export function addRoutes(api) {
    
    api.get('/api/status', (req, res) => {
        res.status(200).json({
            status: 'ok',
            mensagem: 'API Funcionando'
        });
    });

    api.use(grupos);
    api.use(membros);
    api.use(gruposCampanhas);
    api.use(instituicoes);
    api.use(participacoes);
    api.use(auth);
    api.use(usuario);
    api.use(campanhas);
}