import assert from 'node:assert/strict';

const base = new URL(process.env.CONSANGUE_API_URL || 'http://localhost:3001');
if (process.env.CONSANGUE_E2E_LOCAL !== 'SIM' || base.protocol !== 'http:' || !['localhost', '127.0.0.1', '::1'].includes(base.hostname)) {
  throw new Error('Por seguranca, o E2E exige CONSANGUE_E2E_LOCAL=SIM e uma API HTTP em localhost.');
}
const password = 'DemoConSangue2026!';
async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(new URL(path, base), {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(method + ' ' + path + ': HTTP ' + response.status + ' ' + (data?.erro || JSON.stringify(data)));
  return data;
}
async function esperarStatus(path, { token, method = 'GET', body } = {}, esperado) {
  const response = await fetch(new URL(path, base), {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json();
  assert.equal(response.status, esperado, method + ' ' + path);
  return data;
}
async function login(cpf) {
  return (await request('/api/usuarios/login', { method: 'POST', body: { cpf, senha: password } })).token;
}
const day = offset => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};
const suffix = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
let instituicaoToken, candidataToken, candidatoToken, campanhaId, grupoId, vinculoId, participacaoCandidataId, participacaoCandidatoId;
let errosLimpeza = [];
try {
  instituicaoToken = await login('12345678900');
  candidataToken = await login('12345678901');
  candidatoToken = await login('12345678902');
  const painel = await request('/api/instituicoes/me', { token: instituicaoToken });
  const idHemo = painel.instituicao?.id_hemocentro;
  assert.ok(idHemo, 'hemocentro ficticio da instituicao');
  const candidata = await request('/api/usuarios/me', { token: candidataToken });
  const candidato = await request('/api/usuarios/me', { token: candidatoToken });

  const campanha = await request('/api/campanhas', { token: instituicaoToken, method: 'POST', body: {
    id_hemocentro: idHemo, nome_campanha: 'E2E mobilizacao ' + suffix,
    descricao: 'Registro temporario para validar progresso coletivo.',
    data_inicio: day(7), data_fim: day(8), horario_inicio: '09:00', horario_fim: '16:00', status_campanha: 'ativa'
  } });
  campanhaId = campanha.id_campanha;
  const grupo = await request('/api/grupo', { token: candidataToken, method: 'POST', body: {
    nome_grupo: 'E2E grupo ' + suffix, descricao: 'Grupo temporario para validar mobilizacao coletiva.'
  } });
  grupoId = grupo.id;
  await request('/api/membro', { token: candidatoToken, method: 'POST', body: { id_grupo: grupoId } });
  const vinculo = await request('/api/grupoCampanhas', { token: candidataToken, method: 'POST', body: {
    id_grupo: grupoId, id_campanha: campanhaId, meta_participacoes: 2
  } });
  vinculoId = vinculo.id;

  const adesaoCandidata = await request('/api/participacoes', { token: candidataToken, method: 'POST', body: {
    id_campanha: campanhaId, id_grupo_campanha: vinculoId, status_participacao: 'pretende_ir'
  } });
  participacaoCandidataId = adesaoCandidata.id_registro;
  const adesaoCandidato = await request('/api/participacoes', { token: candidatoToken, method: 'POST', body: {
    id_campanha: campanhaId, id_grupo_campanha: vinculoId, status_participacao: 'comparecimento_informado'
  } });
  participacaoCandidatoId = adesaoCandidato.id_registro;

  await esperarStatus('/api/participacoes', { token: candidatoToken, method: 'POST', body: {
    id_campanha: campanhaId, id_grupo_campanha: vinculoId, status_participacao: 'pretende_ir'
  } }, 409);

  const lerProgresso = async () => {
    const resultado = await request('/api/gruposCampanhas');
    return resultado.grupos.find(item => item.id_grupo_campanha === vinculoId);
  };
  let indicador = await lerProgresso();
  assert.equal(indicador.total_participacoes, 2, 'conta dois candidatos distintos');
  assert.equal(indicador.progresso_percentual, 100, 'meta atingida sem inflar duplicidade');
  assert.equal(indicador.estado_meta, 'atingida');

  const meusGruposCandidato = await request('/api/grupos/usuario/' + candidato.id_usuario, { token: candidatoToken });
  const membroCandidato = meusGruposCandidato.grupos.find(item => item.id_grupo === grupoId);
  assert.ok(membroCandidato?.id_membro);
  await request('/api/membro/' + membroCandidato.id_membro, { token: candidatoToken, method: 'DELETE' });
  indicador = await lerProgresso();
  assert.equal(indicador.total_participacoes, 2, 'sair do grupo nao cancela a adesao individual registrada');

  await request('/api/participacoes/' + participacaoCandidatoId, { token: candidatoToken, method: 'DELETE' });
  participacaoCandidatoId = null;
  indicador = await lerProgresso();
  assert.equal(indicador.total_participacoes, 1, 'cancelar a adesao reduz o total');
  assert.equal(indicador.progresso_percentual, 50);

  const participacoes = await request('/api/participacoes', { token: candidataToken });
  assert.ok(participacoes.some(item => item.id_registro === participacaoCandidataId && item.id_grupo_campanha === vinculoId));
  const adesao = await request('/api/instituicoes/me/adesao', { token: instituicaoToken });
  const painelIndicador = adesao.campanhas.find(item => item.id_campanha === campanhaId);
  assert.ok(painelIndicador && painelIndicador.pretendem_ir === 1 && painelIndicador.grupos_vinculados === 1);
  console.log('E2E aprovado: dois membros, duplicidade 409, meta por vinculo, saida sem cancelamento implicito e cancelamento decrementando o progresso.');
} finally {
  const tentar = async (path, token) => { try { await request(path, { token, method: 'DELETE' }); } catch (error) { errosLimpeza.push(error.message); } };
  if (participacaoCandidatoId && candidatoToken) await tentar('/api/participacoes/' + participacaoCandidatoId, candidatoToken);
  if (participacaoCandidataId && candidataToken) await tentar('/api/participacoes/' + participacaoCandidataId, candidataToken);
  if (vinculoId && candidataToken) await tentar('/api/grupoCampanhas/' + vinculoId, candidataToken);
  for (const token of [candidatoToken]) {
    if (!grupoId || !token) continue;
    try {
      const me = await request('/api/usuarios/me', { token });
      const grupos = await request('/api/grupos/usuario/' + me.id_usuario, { token });
      const membro = grupos.grupos.find(item => item.id_grupo === grupoId);
      if (membro?.id_membro) await tentar('/api/membro/' + membro.id_membro, token);
    } catch (error) { errosLimpeza.push(error.message); }
  }
  if (grupoId && candidataToken) await tentar('/api/grupo/' + grupoId, candidataToken);
  if (campanhaId && instituicaoToken) await tentar('/api/campanhas/' + campanhaId, instituicaoToken);
  if (errosLimpeza.length) throw new Error('Falha ao remover dados temporarios do E2E: ' + errosLimpeza.join('; '));
}