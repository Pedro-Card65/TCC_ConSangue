import { timingSafeEqual } from 'node:crypto';
import { con } from '../repository/connection.js';

const NOME_ADMIN = 'Administrador';

function mesmoValorSeguro(informado, esperado) {
    if (typeof informado !== 'string' || typeof esperado !== 'string') return false;
    const a = Buffer.from(informado, 'utf8');
    const b = Buffer.from(esperado, 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
}

// Esta permissão é independente do tipo "candidato" e não altera o registro.
// O CPF não é uma credencial: a elevação exige também um código de acesso
// exclusivo, conhecido somente pelo operador e configurado no servidor.
export async function contaAdministradoraValida(usuarioJwt) {
    const cpfPermitido = process.env.ADMINISTRADOR_CPF;
    const codigo = process.env.ADMINISTRADOR_CODIGO_ACESSO;
    if (!/^\d{11}$/.test(cpfPermitido || '') || !codigo || codigo.length < 20 ||
        usuarioJwt?.tipo_usuario !== 'candidato' ||
        !Number.isSafeInteger(Number(usuarioJwt.id_usuario))) return false;

    const [contas] = await con.execute(
        'SELECT nome, cpf, tipo_usuario FROM usuarios WHERE id_usuario = ? LIMIT 1',
        [usuarioJwt.id_usuario]
    );
    const conta = contas[0];
    return !!conta && conta.nome?.trim() === NOME_ADMIN &&
        conta.tipo_usuario === 'candidato' &&
        mesmoValorSeguro(String(conta.cpf).replace(/\D/g, ''), cpfPermitido);
}

export async function possuiAdministracao(usuarioJwt) {
    return usuarioJwt?.administracao === true &&
        await contaAdministradoraValida(usuarioJwt);
}

export function codigoAdministrativoValido(codigoInformado) {
    const codigo = process.env.ADMINISTRADOR_CODIGO_ACESSO;
    if (typeof codigo !== 'string' || codigo.length < 20) return false;
    return mesmoValorSeguro(codigoInformado, codigo);
}

export async function exigirAdministracao(req, resp, next) {
    try {
        if (!(await possuiAdministracao(req.user))) {
            return resp.status(403).json({ erro: 'Permissão administrativa não ativada.' });
        }
        next();
    } catch (erro) {
        console.error('Erro na autorização administrativa:', erro);
        return resp.status(500).json({ erro: 'Não foi possível verificar a autorização.' });
    }
}
