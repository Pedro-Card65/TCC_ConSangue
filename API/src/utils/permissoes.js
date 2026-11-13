import { con } from '../repository/connection.js';

function idValido(valor) {
    const numero = Number(valor);
    return /^[1-9]\d*$/.test(String(valor)) && Number.isSafeInteger(numero)
        ? numero : null;
}

function negar(resp, status, mensagem) {
    return resp.status(status).json({ erro: mensagem });
}

// Confirma que o recurso solicitado realmente pertence ao usuário do JWT.
async function verificarPermissao(req, resp, next, sql, valores, aoPermitir) {
    try {
        if (valores.some(v => v === null)) {
            return negar(resp, 400, 'ID inválido.');
        }
        const [linhas] = await con.execute(sql, valores);
        if (!linhas.length) return negar(resp, 403, 'Sem permissão para este recurso.');
        if (aoPermitir) {
            const erro = aoPermitir(linhas[0]);
            if (erro) return negar(resp, 403, erro);
        }
        next();
    } catch (erro) {
        console.error('Erro ao verificar autorização:', erro);
        return negar(resp, 500, 'Erro interno ao verificar autorização.');
    }
}

export function somenteMeuId(parametro = 'id') {
    return (req, resp, next) => {
        const id = idValido(req.params[parametro]);
        if (!id) return negar(resp, 400, 'ID inválido.');
        if (id !== req.user.id_usuario) {
            return negar(resp, 403, 'Você só pode acessar sua própria conta.');
        }
        next();
    };
}

// Ao cadastrar, o ID do titular sempre vem do token, nunca de um campo arbitrário.
export function inserirMeuId(campo) {
    return (req, resp, next) => {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return negar(resp, 400, 'Corpo da requisição inválido.');
        }
        if (req.body[campo] !== undefined &&
            idValido(req.body[campo]) !== req.user.id_usuario) {
            return negar(resp, 403, `Não é permitido informar outro ${campo}.`);
        }
        req.body[campo] = req.user.id_usuario;
        next();
    };
}

// Listagem de participantes exige associação comprovada ao grupo no banco.
export function somenteMembroGrupo(req, resp, next) {
    const idGrupo = idValido(req.params.id_grupo);
    verificarPermissao(req, resp, next,
        `SELECT g.id_grupo FROM grupos g
         LEFT JOIN membros_grupo m ON m.id_grupo = g.id_grupo
           AND m.id_usuario = ?
         WHERE g.id_grupo = ?
           AND (g.id_criador = ? OR m.id_membro IS NOT NULL)
         LIMIT 1`,
        [req.user.id_usuario, idGrupo, req.user.id_usuario]);
}

export function somenteDonoInstituicao(req, resp, next) {
    const id = idValido(req.params.id);
    verificarPermissao(req, resp, next,
        'SELECT id_hemocentro FROM hemocentros WHERE id_hemocentro = ? AND id_usuario = ? LIMIT 1',
        [id, req.user.id_usuario]);
}

export function somenteMinhaInstituicaoNoBody(req, resp, next) {
    const id = idValido(req.body?.id_hemocentro);
    verificarPermissao(req, resp, next,
        'SELECT id_hemocentro FROM hemocentros WHERE id_hemocentro = ? AND id_usuario = ? LIMIT 1',
        [id, req.user.id_usuario]);
}

export function somenteDonoCampanha(req, resp, next) {
    const id = idValido(req.params.id);
    verificarPermissao(req, resp, next,
        `SELECT c.id_hemocentro FROM campanhas c
         JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro
         WHERE c.id_campanha = ? AND h.id_usuario = ? LIMIT 1`,
        [id, req.user.id_usuario], (campanha) => {
            if (req.method === 'PUT') {
                if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
                    return 'Informe os dados da campanha.';
                }
                if (req.body?.id_hemocentro !== undefined &&
                    idValido(req.body.id_hemocentro) !== campanha.id_hemocentro) {
                    return 'Não é permitido alterar o hemocentro da campanha.';
                }
                req.body.id_hemocentro = campanha.id_hemocentro;
            }
        });
}

export function somenteCriadorGrupo(req, resp, next) {
    const id = idValido(req.params.id);
    verificarPermissao(req, resp, next,
        'SELECT id_grupo FROM grupos WHERE id_grupo = ? AND id_criador = ? LIMIT 1',
        [id, req.user.id_usuario], () => {
            if (req.method === 'PUT') {
                if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
                    return 'Informe os dados do grupo.';
                }
                req.body.id_criador = req.user.id_usuario;
            }
        });
}

export function somenteDonoParticipacao(req, resp, next) {
    const id = idValido(req.params.id);
    verificarPermissao(req, resp, next,
        'SELECT id_registro FROM participacoes WHERE id_registro = ? AND id_usuario = ? LIMIT 1',
        [id, req.user.id_usuario]);
}

// É permitido administrar grupo se for seu criador ou um membro administrador.
function sqlAdminGrupo() {
    return `SELECT g.id_grupo FROM grupos g
            LEFT JOIN membros_grupo m ON m.id_grupo = g.id_grupo
                AND m.id_usuario = ? AND m.papel = 'administrador'
            WHERE g.id_grupo = ?
              AND (g.id_criador = ? OR m.id_membro IS NOT NULL)
            LIMIT 1`;
}

export function somenteAdminGrupo(req, resp, next) {
    const id = idValido(req.body?.id_grupo ?? req.params.id_grupo);
    verificarPermissao(req, resp, next, sqlAdminGrupo(),
        [req.user.id_usuario, id, req.user.id_usuario]);
}

export function somenteAdminDoGrupoCampanha(req, resp, next) {
    const id = idValido(req.params.id);
    verificarPermissao(req, resp, next,
        `SELECT gc.id_grupo FROM grupos_campanhas gc
         JOIN grupos g ON g.id_grupo = gc.id_grupo
         LEFT JOIN membros_grupo m ON m.id_grupo = g.id_grupo
             AND m.id_usuario = ? AND m.papel = 'administrador'
         WHERE gc.id_grupo_campanha = ?
           AND (g.id_criador = ? OR m.id_membro IS NOT NULL)
         LIMIT 1`,
        [req.user.id_usuario, id, req.user.id_usuario], (vinculo) => {
            if (req.method === 'PUT' && req.body?.id_grupo !== undefined &&
                idValido(req.body.id_grupo) !== vinculo.id_grupo) {
                return 'Não é permitido trocar o grupo deste vínculo.';
            }
        });
}

// Uma alteração de papel exige admin do grupo; remover membro permite também sair do grupo.
export function permissaoMembro(permitirProprio = false) {
    return async (req, resp, next) => {
        const id = idValido(req.params.id);
        try {
            if (!id) return negar(resp, 400, 'ID inválido.');
            const [linhas] = await con.execute(
                `SELECT mg.id_usuario, g.id_criador, admin.id_membro AS admin_id
                 FROM membros_grupo mg
                 JOIN grupos g ON g.id_grupo = mg.id_grupo
                 LEFT JOIN membros_grupo admin ON admin.id_grupo = g.id_grupo
                     AND admin.id_usuario = ? AND admin.papel = 'administrador'
                 WHERE mg.id_membro = ? LIMIT 1`,
                [req.user.id_usuario, id]
            );
            if (!linhas.length) return negar(resp, 404, 'Membro não encontrado.');
            const membro = linhas[0];
            
            if (membro.id_usuario === membro.id_criador) {
                return negar(
                    resp,
                    403,
                    'O criador não pode ser removido ou rebaixado do próprio grupo.'
                );
            }

            if (membro.id_criador !== req.user.id_usuario &&
                membro.admin_id === null &&
                !(permitirProprio && membro.id_usuario === req.user.id_usuario)) {
                return negar(resp, 403, 'Sem permissão para alterar este membro.');
            }
            next();
        } catch (erro) {
            console.error(erro);
            return negar(resp, 500, 'Erro interno ao verificar autorização.');
        }
    };
}
