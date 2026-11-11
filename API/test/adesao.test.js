import test from 'node:test';
import assert from 'node:assert/strict';
import { agregarAdesaoPorCampanha } from '../src/service/adesao.js';

test('zero progresso exclui interesse simples', () => {
  const [c] = agregarAdesaoPorCampanha([{ id_campanha: 1, meta_participacoes: 5, grupos_vinculados: 1, id_usuario: 10, status_participacao: 'interessado' }]);
  assert.equal(c.total_participacoes, 0);
  assert.equal(c.progresso_percentual, 0);
  assert.equal(c.estado_meta, 'em_andamento');
});

test('intencao e comparecimento informado atingem a meta', () => {
  const [c] = agregarAdesaoPorCampanha([
    { id_campanha: 2, meta_participacoes: 2, grupos_vinculados: 1, id_usuario: 10, status_participacao: 'pretende_ir' },
    { id_campanha: 2, meta_participacoes: 2, grupos_vinculados: 1, id_usuario: 11, status_participacao: 'comparecimento_informado' }
  ]);
  assert.equal(c.total_participacoes, 2);
  assert.equal(c.progresso_percentual, 100);
  assert.equal(c.estado_meta, 'atingida');
});

test('nao duplica candidato em linhas repetidas', () => {
  const row = { id_campanha: 3, meta_participacoes: 1, grupos_vinculados: 1, id_usuario: 10, status_participacao: 'pretende_ir' };
  const [c] = agregarAdesaoPorCampanha([row, row]);
  assert.equal(c.total_participacoes, 1);
});

test('sem meta informa estado e mantém total', () => {
  const [c] = agregarAdesaoPorCampanha([{ id_campanha: 4, meta_participacoes: null, grupos_vinculados: 0, id_usuario: 12, status_participacao: 'pretende_ir' }]);
  assert.equal(c.total_participacoes, 1);
  assert.equal(c.progresso_percentual, null);
  assert.equal(c.estado_meta, 'sem_meta');
});