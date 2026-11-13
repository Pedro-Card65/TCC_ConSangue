import { timingSafeEqual } from 'node:crypto';

// Convite restrito ao servidor; não é uma certificação de hemocentro.
export function exigirConviteInstitucional(codigo, configurado = process.env.CODIGO_CADASTRO_INSTITUICAO) {
    const erro = (mensagem, status) => Object.assign(new Error(mensagem), { status });
    if (typeof configurado !== 'string' || configurado.length < 16) {
        throw erro('O cadastro institucional está indisponível sem autorização dos responsáveis.', 503);
    }
    if (typeof codigo !== 'string' || codigo.length > 128) {
        throw erro('O cadastro institucional exige um código de acesso válido.', 403);
    }
    const esperado = Buffer.from(configurado, 'utf8');
    const enviado = Buffer.from(codigo.trim(), 'utf8');
    if (enviado.length !== esperado.length || !timingSafeEqual(enviado, esperado)) {
        throw erro('Código de acesso institucional inválido.', 403);
    }
    return true;
}
