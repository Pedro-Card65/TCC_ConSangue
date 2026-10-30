
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const KEY = process.env.Chave_Secreta;

if (!KEY) {
    throw new Error('Chave_Secreta não configurada.');
}


export function generateToken(usuario) {
    return jwt.sign(
        {
            id_usuario: usuario.id_usuario,
            tipo_usuario: usuario.tipo_usuario
        },
        KEY,
        {
            expiresIn: '2h',
            algorithm: 'HS256'
        }
    );
}


export function getTokenInfo(req) {
    try {
        const auth = req.headers.authorization;

        let token = auth?.startsWith('Bearer ')
            ? auth.slice(7)
            : req.headers['x-access-token'];

        if (!token) return null;

        return jwt.verify(token, KEY, {
            algorithms: ['HS256']
        });
    }
    catch {
        return null;
    }
}



export function getAuthentication(checkRole, throw401 = true) {

    return (req, resp, next) => {

        const usuario = getTokenInfo(req);

        if (!usuario) {
            if (!throw401 && !checkRole) return next();

            return resp.status(401).send({
                erro: 'Token ausente, inválido ou expirado.'
            });
        }

        req.user = usuario;

        if (checkRole && !checkRole(usuario)) {
            return resp.status(403).send({
                erro: 'Você não possui permissão.'
            });
        }

        next();
    };
}


// GARANTE QUE O USUÁRIO ACESSE A PRÓPRIA CONTA
export function somenteProprioUsuario(req, resp, next) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return resp.status(400).send({
            erro: 'ID inválido.'
        });
    }

    if (id !== req.user.id_usuario) {
        return resp.status(403).send({
            erro: 'Você não pode alterar ou acessar outra conta.'
        });
    }

    next();
}
