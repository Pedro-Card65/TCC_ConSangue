import { erroHttp } from './erroHttp.js';

// O ID numérico é apenas identificador interno; ingresso exige convite recebido de um membro.
export function validarConviteDeEntrada(dados) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados) ||
        Object.prototype.hasOwnProperty.call(dados, 'id_grupo') ||
        !Object.prototype.hasOwnProperty.call(dados, 'codigo_convite')) {
        throw erroHttp(400, 'Para entrar em um grupo, informe somente o código de convite de 8 caracteres.');
    }
    if (typeof dados.codigo_convite !== 'string') {
        throw erroHttp(400, 'Código de convite inválido. Informe 8 caracteres.');
    }
    const codigo = dados.codigo_convite.trim().toUpperCase();
    if (!/^[A-HJ-NP-Z2-9]{8}$/.test(codigo) || !/[A-HJ-NP-Z]/.test(codigo)) {
        throw erroHttp(400, 'Código de convite inválido. Informe 8 caracteres.');
    }
    return codigo;
}
