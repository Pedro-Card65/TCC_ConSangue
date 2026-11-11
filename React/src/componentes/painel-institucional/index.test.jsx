import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Perfil from '../../pages/perfil';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({ api: { get: jest.fn(), post: jest.fn() } }));
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '' })
}));
jest.mock('../logo-slogan/logo-slogan', () => () => null);

let root, container, painel, campanhas;
const instituicao = { id_hemocentro: 4, nome_hemo: 'Instituição de teste', endereco: 'Rua de teste', cidade: 'São Paulo', estado: 'SP' };
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  sessionStorage.setItem('token', 'teste');
  container = document.createElement('div'); document.body.appendChild(container);
  root = createRoot(container);
  painel = { instituicao, estatisticas: { campanhas: 0, grupos: 0, agendamentos: 0 } };
  campanhas = [];
  api.get.mockImplementation(async url => {
    if (url === '/api/usuarios/me') return { data: { id_usuario: 7, tipo_usuario: 'instituicao' } };
    if (url === '/api/instituicoes/me') return { data: painel };
    if (url === '/api/campanhas/hemocentro/4') return { data: { campanhas } };
    if (url === '/api/instituicoes/me/adesao') return { data: { campanhas: [] } };
    throw new Error(`Rota inesperada: ${url}`);
  });
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); sessionStorage.clear(); jest.resetAllMocks();
});
async function renderizar() { await act(async () => root.render(<Perfil />)); }
async function clicar(texto) { await act(async () => [...container.querySelectorAll('button')].find(b => b.textContent === texto).click()); }
async function preencher(nome, value) {
  const el = container.querySelector(`[name="${nome}"]`);
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function enviar() { await act(async () => container.querySelector('form:not([role=search])').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))); }
async function campanhaValida() {
  await clicar('Criar nova campanha');
  await preencher('nome_campanha', 'Campanha nova');
  await preencher('data_inicio', '2026-12-01');
  await preencher('data_fim', '2026-12-01');
}

test('perfil institucional usa apenas suas rotas e mostra o estado vazio', async () => {
  await renderizar(); await clicar('Ver minhas campanhas');
  expect(container.textContent).toContain('Instituição de teste');
  expect(container.textContent).toContain('Nenhuma campanha cadastrada');
  expect([...container.querySelectorAll('dd')].map(el => el.textContent)).toEqual(['0', '0', '0']);
  expect(api.get.mock.calls.map(c => c[0])).toEqual(['/api/usuarios/me', '/api/instituicoes/me', '/api/campanhas/hemocentro/4', '/api/instituicoes/me/adesao']);
});

test('falha de consulta não é tratada como cadastro ausente e permite tentar novamente', async () => {
  api.get.mockReset();
  api.get.mockResolvedValueOnce({ data: { id_usuario: 7, tipo_usuario: 'instituicao' } })
    .mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: { instituicao: null } });
  await renderizar();
  expect(container.querySelector('form:not([role=search])')).toBeNull();
  expect(container.querySelector('[role="alert"]')).not.toBeNull();
  await clicar('Tentar novamente');
  expect(container.textContent).toContain('Cadastre sua instituição');
});

test('cadastra hemocentro sem aceitar outro titular e recarrega o painel', async () => {
  painel = { instituicao: null };
  await renderizar();
  for (const [campo, valor] of Object.entries({ nome_hemo: 'Instituição de teste', cep: '01001-000', endereco: 'Rua de teste', cidade: 'São Paulo', estado: 'sp', telefone_centro: '11999999999' })) await preencher(campo, valor);
  api.post.mockImplementation(async () => { painel = { instituicao, estatisticas: { campanhas: 0, grupos: 0, agendamentos: 0 } }; return { data: instituicao }; });
  await enviar();
  expect(api.post.mock.calls[0][0]).toBe('/api/instituicoes');
  expect(api.post.mock.calls[0][1]).not.toHaveProperty('id_usuario');
  expect(api.post.mock.calls[0][1].estado).toBe('SP');
  expect(container.textContent).toContain('Criar nova campanha');
});

test('cria campanha no hemocentro autenticado e atualiza lista e indicador', async () => {
  await renderizar(); await campanhaValida();
  api.post.mockImplementation(async (url, dados) => {
    campanhas = [{ ...dados, id_campanha: 12 }];
    painel.estatisticas.campanhas = 1;
    return { data: { id_campanha: 12 } };
  });
  await enviar();
  expect(api.post).toHaveBeenCalledWith('/api/campanhas', expect.objectContaining({ id_hemocentro: 4, nome_campanha: 'Campanha nova', status_campanha: 'ativa', data_inicio: '2026-12-01' }), { headers: { Authorization: 'Bearer teste' } });
  expect(container.textContent).toContain('Campanha criada com sucesso');
  expect(container.querySelector('.lista-campanhas').textContent).toContain('Campanha nova');
  expect(container.querySelectorAll('dd')[2].textContent).toBe('1');
});

test('recusa datas e horários invertidos antes de enviar', async () => {
  await renderizar(); await campanhaValida();
  await preencher('data_fim', '2026-11-30'); await enviar();
  expect(container.querySelector('[role="alert"]').textContent).toContain('anterior');
  await preencher('data_fim', '2026-12-01');
  await preencher('horario_inicio', '10:00'); await preencher('horario_fim', '09:00'); await enviar();
  expect(container.querySelector('[role="alert"]').textContent).toContain('posterior');
  expect(api.post).not.toHaveBeenCalled();
});

test('mantém formulário e valores quando a API recusa a criação', async () => {
  await renderizar(); await campanhaValida();
  api.post.mockRejectedValue({ response: { status: 403, data: { erro: 'Sem permissão para este recurso.' } } });
  await enviar();
  expect(container.querySelector('[role="alert"]').textContent).toContain('Sem permissão');
  expect(container.querySelector('[name="nome_campanha"]').value).toBe('Campanha nova');
  expect(container.textContent).not.toContain('Campanha criada com sucesso');
  await clicar('Cancelar');
  expect(container.querySelector('form:not([role=search])')).toBeNull();
});

test('impede dois envios durante a mesma criação', async () => {
  await renderizar(); await campanhaValida();
  let resolver;
  api.post.mockImplementation(() => new Promise(resolve => { resolver = resolve; }));
  await enviar(); await enviar();
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(container.querySelector('fieldset').disabled).toBe(true);
  await act(async () => resolver({ data: { id_campanha: 12 } }));
});
