import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validarConviteDeEntrada } from '../src/utils/codigoConvite.js';

const ler = arquivo => readFileSync(new URL(arquivo, import.meta.url), 'utf8');

test('convite válido aceita letras minúsculas e devolve formato padronizado', () => {
  assert.equal(validarConviteDeEntrada({ codigo_convite: ' ab2d3f4g ' }), 'AB2D3F4G');
});

test('ID numérico ou ausência de convite não permitem ingresso', () => {
  for (const dados of [{ id_grupo: 3 }, {}, { codigo_convite: 'AB2D3F4G', id_grupo: 3 }, null]) {
    assert.throws(() => validarConviteDeEntrada(dados), { status: 400 });
  }
});

test('convites curtos, inválidos ou apenas numéricos são rejeitados', () => {
  for (const codigo of ['3', 'ABCDEFG', '12345678', 'ABCDEFG0', 'ABCDEFGI', 'ABC DEF2', 12345678]) {
    assert.throws(() => validarConviteDeEntrada({ codigo_convite: codigo }), { status: 400 });
  }
});

test('SQL das listagens públicas não solicita fotos nem códigos secretos', () => {
  const codigo = ler('../src/repository/gruposRepository.js');
  const inicio = codigo.indexOf('export async function listarGrupos()');
  const fim = codigo.indexOf('export async function editarGrupo(', inicio);
  assert.ok(inicio >= 0 && fim > inicio);
  const consultasPublicas = codigo.slice(inicio, fim);
  assert.doesNotMatch(consultasPublicas, /foto_grupo|codigo_convite/);
});

test('código e foto são consultados somente pela listagem de grupos do próprio membro', () => {
  const codigo = ler('../src/repository/membros_grupoRepository.js');
  const inicio = codigo.indexOf('export async function listarGruposPorUsuario(');
  const fim = codigo.indexOf('export async function editarPapel(', inicio);
  assert.ok(inicio >= 0 && fim > inicio);
  const consulta = codigo.slice(inicio, fim);
  assert.match(consulta, /g\.codigo_convite/);
  assert.match(consulta, /g\.foto_grupo/);
  assert.match(consulta, /WHERE\s+m\.id_usuario\s*=\s*\?/);
});

test('membros exigem autenticação e vínculo na API', () => {
  const rotas = ler('../src/controller/membros_grupoController.js');
  const permissoes = ler('../src/utils/permissoes.js');
  assert.match(rotas, /get\('\/membros\/grupo\/:id_grupo', getAuthentication\(\), somenteMembroGrupo,/);
  assert.match(permissoes, /export function somenteMembroGrupo/);
  assert.match(permissoes, /SELECT id_membro FROM membros_grupo WHERE id_grupo = \? AND id_usuario = \?/);
  assert.match(rotas, /get\('\/grupos\/usuario\/:id_usuario', getAuthentication\(\), somenteMeuId\('id_usuario'\)/);
});

test('serviço de ingresso usa somente o código, nunca o ID recebido do cliente', () => {
  const codigo = ler('../src/service/membros_grupoService.js');
  const inicio = codigo.indexOf('export async function entrarGrupoService(');
  const fim = codigo.indexOf('export async function listarMembrosPorGrupoService(', inicio);
  assert.ok(inicio >= 0 && fim > inicio);
  const trecho = codigo.slice(inicio, fim);
  assert.match(trecho, /validarConviteDeEntrada\(membro\)/);
  assert.match(trecho, /buscarIdPorCodigoConvite\(codigo\)/);
  assert.doesNotMatch(trecho, /validarId\(membro\.id_grupo/);
});
