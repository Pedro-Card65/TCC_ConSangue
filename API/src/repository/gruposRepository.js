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

let preparacaoVisibilidade = null;

// Atualiza apenas a coluna ausente, sem recriar ou apagar grupos existentes.
// Uma Promise compartilhada impede duas altera챌천es simult창neas nesta inst창ncia da API.
export async function garantirVisibilidadeGrupos() {
    if (!preparacaoVisib떻쬺�^