import { con } from './connection.js';
import { randomInt } from 'node:crypto';

const ALFABETO_CONVITE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function gerarCodigo() {
    let codigo;
    do {
        codigo = Array.from({ length: 8 }, () => ALFABETO_CONVITE[randomInt(ALFABETO_CONVITE.length)]).join('');
    } while (/^\d+$/.test(codigo));
    return codigo;
}

async function colunaConviteDisponivel() {
    const [colunas] = await con.query(
        "SELECT 1 AS existe FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grupos' AND COLUMN_NAME = 'codigo_convite' LIMIT 1"
    );
    return colunas.length > 0;
}


async function colunaFotoDisponivel() {
    const [colunas] = await con.query(
        "SELECT 1 AS existe FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grupos' AND COLUMN_NAME = 'foto_grupo' LIMIT 1"
    );
    return colunas.length > 0;
}


async function colunaVisibilidadeDisponivel() {
    const [colunas] = await con.query(
        "SELECT 1 AS existe FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grupos' AND COLUMN_NAME = 'visibilidade' LIMIT 1"
    );
    return colunas.length > 0;
}

//Finalizado

export async function criarGrupo(grupo) {
    const comVisibilidade = await colunaVisibilidadeDisponivel();
    if (!comVisibilidade && grupo.visibilidade === 'publico') {
        const erro = new Error('Ative a migração de visibilidade antes de criar grupos públicos.');
        erro.status = 503;
        throw erro;
    }
    const comCodigo = await colunaConviteDisponivel();
    const conexao = await con.getConnection();

    try {
        await conexao.beginTransaction();
        let resultado;
        for (let tentativa = 0; tentativa < (comCodigo ? 8 : 1); tentativa++) {
            const colunas = ['nome_grupo', 'descricao', 'id_criador'];
            const valores = [grupo.nome_grupo, grupo.descricao, grupo.id_criador];
            if (comCodigo) {
                colunas.push('codigo_convite');
                valores.push(gerarCodigo());
            }
            if (comVisibilidade) {
                colunas.push('visibilidade');
                valores.push(grupo.visibilidade);
            }

            try {
                const marcadores = colunas.map(() => '?').join(', ');
                [resultado] = await conexao.execute(
                    `INSERT INTO grupos (${colunas.join(', ')}) VALUES (${marcadores})`,
                    valores
                );
                break;
            } catch (erro) {
                if (comCodigo && erro.code === 'ER_DUP_ENTRY' && tentativa < 7) continue;
                throw erro;
            }
        }

        const idGrupo = resultado.insertId;
        await conexao.execute(
            "INSERT INTO membros_grupo (id_usuario, id_grupo, papel) VALUES (?, ?, 'administrador')",
            [grupo.id_criador, idGrupo]
        );
        await conexao.commit();
        return idGrupo;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

export async function listarGrupos() {
    const visibilidade = await colunaVisibilidadeDisponivel()
        ? 'visibilidade'
        : "'privado' AS visibilidade";
    const [linhas] = await con.query(
        `SELECT id_grupo, nome_grupo, descricao, id_criador, data_criacao, ${visibilidade}
         FROM grupos`
    );
    return linhas;
}

export async function listarGruposPorNome(nome) {
    const visibilidade = await colunaVisibilidadeDisponivel()
        ? 'visibilidade'
        : "'privado' AS visibilidade";
    const [linhas] = await con.query(
        `SELECT id_grupo, nome_grupo, descricao, id_criador, data_criacao, ${visibilidade}
         FROM grupos WHERE nome_grupo LIKE ?`,
        [`%${nome}%`]
    );
    return linhas;
}

export async function editarGrupo(grupo, id) {
    const alterarFoto = Object.prototype.hasOwnProperty.call(grupo, 'foto_grupo');
    const alterarVisibilidade = Object.prototype.hasOwnProperty.call(grupo, 'visibilidade');

    if (alterarFoto && !(await colunaFotoDisponivel())) {
        const erro = new Error('O armazenamento de fotos dos grupos ainda precisa ser ativado no banco.');
        erro.status = 503;
        throw erro;
    }
    if (alterarVisibilidade && !(await colunaVisibilidadeDisponivel())) {
        const erro = new Error('Ative a migração de visibilidade no banco antes de alterar o tipo de grupo.');
        erro.status = 503;
        throw erro;
    }

    const valores = [grupo.nome_grupo, grupo.descricao];
    const campos = ['nome_grupo = ?', 'descricao = ?'];
    if (alterarFoto) {
        campos.push('foto_grupo = ?');
        valores.push(grupo.foto_grupo);
    }
    if (alterarVisibilidade) {
        campos.push('visibilidade = ?');
        valores.push(grupo.visibilidade);
    }
    valores.push(id, grupo.id_criador);
    const [resultado] = await con.query(
        `UPDATE grupos SET ${campos.join(', ')} WHERE id_grupo = ? AND id_criador = ?`,
        valores
    );
    return resultado.affectedRows;
}

export async function apagarGrupo(id) {
    const conexao = await con.getConnection();

    try {
        await conexao.beginTransaction();

        const [vinculos] = await conexao.execute(
            `SELECT id_grupo_campanha
             FROM grupos_campanhas
             WHERE id_grupo = ?
             LIMIT 1`,
            [id]
        );

        if (vinculos.length > 0) {
            const erro = new Error(
                'Desvincule as campanhas antes de excluir o grupo.'
            );
            erro.status = 409;
            throw erro;
        }

        await conexao.execute(
            'DELETE FROM membros_grupo WHERE id_grupo = ?',
            [id]
        );

        const [resultado] = await conexao.execute(
            'DELETE FROM grupos WHERE id_grupo = ?',
            [id]
        );

        await conexao.commit();
        return resultado.affectedRows;

    } catch (erro) {
        await conexao.rollback();
        throw erro;

    } finally {
        conexao.release();
    }
}

export async function buscarIdPorCodigoConvite(codigo) {
    if (!(await colunaConviteDisponivel())) {
        const erro = new Error('Códigos alfanuméricos ainda não estão ativados no banco de dados.');
        erro.status = 503;
        throw erro;
    }
    const [linhas] = await con.execute('SELECT id_grupo FROM grupos WHERE codigo_convite = ? LIMIT 1', [codigo]);
    return linhas[0]?.id_grupo ?? null;
}
