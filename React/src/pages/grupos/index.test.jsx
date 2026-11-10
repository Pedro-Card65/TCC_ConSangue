import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Grupos from './index';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({ api: { get: jest.fn(), post: jest.fn() } }));

let root, container, meus;
const grupo = { id_grupo: 3, nome_grupo: 'Grupo de teste', descricao: 'Mobilização', id_criador: 7, papel: 'administrador' };
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  sessionStorage.setItem('token', 'teste');
  container = document.createElement('div'); document.body.appendChild(container);
  root = createRoot(container); meus = [grupo];
  api.get.mockImplementation(async url => {
    if (url === '/api/usuarios/me') return { data: { id_usuario: 7 } };
    if (url === '/api/grupos/usuario/7') return { data: { grupos: meus } };
    if (url === '/api/grupos') return { data: { grupos: [grupo, { id_grupo: 9, nome_grupo: 'Outro grupo' }] } };
    if (url === '/api/membros/grupo/3') return { data: { membros: [{ id_membro: 1, nome: 'Pessoa de teste', papel: 'administrador' }] } };
    if (url === '/api/campanhas') return { data: { campanhas: [{ id_campanha: 11, nome_campanha: 'Campanha de teste' }] } };
    throw new Error(`Rota inesperada: ${url}`);
  });
  api.post.mockResolvedValue({ data: { id: 10 } });
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); sessionStorage.clear(); jest.resetAllMocks();
});
async function renderizar() { await act(async () => root.render(<Grupos />)); }
async function clicar(texto) { await act(async () => [...container.querySelectorAll('button')].find(b => b.textContent === texto).click()); }
async function preencher(selector, value) {
  const el = container.querySelector(selector);
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}
async function enviar(selector) { await act(async () => container.querySelector(selector).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))); }

test('cria grupo com JWT sem permitir escolher outro criador e recarrega a lista', async () => {
  await renderizar(); await clicar('Criar novo grupo');
  await preencher('#nome-grupo', 'Novo grupo'); await preencher('#descricao-grupo', 'Descrição de teste');
  api.post.mockImplementation(async () => { meus = [...meus, { ...grupo, id_grupo: 10, nome_grupo: 'Novo grupo' }]; return { data: { id: 10 } }; });
  await enviar('.formulario-grupo');
  expect(api.post).toHaveBeenCalledWith('/api/grupo', { nome_grupo: 'Novo grupo', descricao: 'Descrição de teste' }, { headers: { Authorization: 'Bearer teste' } });
  expect(container.querySelectorAll('.gru')).toHaveLength(2);
});

test('entra somente no grupo escolhido e exibe conflito da API sem mensagem de sucesso', async () => {
  await renderizar(); await clicar('Entrar em grupo');
  expect(container.querySelectorAll('#grupo-entrada option')).toHaveLength(2);
  await preencher('#grupo-entrada', '9');
  api.post.mockRejectedValue({ response: { status: 409, data: { erro: 'Usuário já é membro deste grupo.' } } });
  await enviar('.formulario-grupo');
  expect(api.post).toHaveBeenCalledWith('/api/membro', { id_grupo: 9 }, { headers: { Authorization: 'Bearer teste' } });
  expect(container.querySelector('[role="alert"]').textContent).toContain('já é membro');
  expect(container.textContent).not.toContain('Você entrou no grupo.');
});

test('administrador consulta membros e vincula campanha pela API existente', async () => {
  await renderizar(); await clicar('Ver grupo');
  expect(container.textContent).toContain('Pessoa de teste');
  await preencher('#campanha-vinculo', '11'); await enviar('.vincular-campanha');
  expect(api.post).toHaveBeenCalledWith('/api/grupoCampanhas', { id_grupo: 3, id_campanha: 11, meta_participacoes: 10 }, { headers: { Authorization: 'Bearer teste' } });
  expect(container.textContent).toContain('Campanha vinculada ao grupo com sucesso!');
});

test('membro comum não recebe o formulário administrativo', async () => {
  meus = [{ ...grupo, papel: 'membro', id_criador: 8 }];
  await renderizar(); await clicar('Ver grupo');
  expect(container.querySelector('.vincular-campanha')).toBeNull();
  expect(api.post).not.toHaveBeenCalled();
});
