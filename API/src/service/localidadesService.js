// Base local de municípios com códigos IBGE, derivada de
// https://github.com/kelvins/municipios-brasileiros (licença MIT).
// Manter sincronizada com React/src/data/municipios.json.
import { readFileSync } from 'node:fs';

const municipiosPorUf = JSON.parse(
    readFileSync(new URL('../data/municipios.json', import.meta.url), 'utf8')
);
const municipiosNormalizados = new Map();

function normalizar(valor) {
    return String(valor || '').trim().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR');
}

function erroValidacao(mensagem, status = 422) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

export async function validarLocalizacao(cidade, estado) {
    const uf = String(estado || '').trim().toUpperCase();
    const nome = String(cidade || '').trim();

    if (!Object.prototype.hasOwnProperty.call(municipiosPorUf, uf)) {
        throw erroValidacao('Selecione um estado brasileiro válido.');
    }
    if (!nome || nome.length > 100) {
        throw erroValidacao('Selecione uma cidade válida.');
    }

    if (!municipiosNormalizados.has(uf)) {
        municipiosNormalizados.set(uf, new Map(
            municipiosPorUf[uf].map(municipio => [normalizar(municipio), municipio])
        ));
    }
    const municipioOficial = municipiosNormalizados.get(uf).get(normalizar(nome));
    if (!municipioOficial) {
        throw erroValidacao('A cidade não pertence ao estado selecionado.');
    }
    return { cidade: municipioOficial, estado: uf };
}
