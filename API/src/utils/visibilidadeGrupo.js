import { erroHttp } from './erroHttp.js';

export const VISIBILIDADES_GRUPO = ['publico', 'privado'];

export function validarVisibilidadeGrupo(valor = 'privado') {
    if (!VISIBILIDADES_GRUPO.includes(valor)) {
        throw erroHttp(400, "A visibilidade deve ser 'publico' ou 'privado'.");
    }
    return valor;
}
