import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Perfil from './index';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({ api: { get: jest.fn() } }));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));
jest.mock('../../componentes/logo-slogan/logo-slogan.jsx', () => () => null);
jest.mock('../../componentes/modal-campanha/modal-campanha.jsx', () => ({ campanha, aoFechar }) => (
  <div role="dialog">{campanha.nome_campanha}<button onClick={aoFechar}>Fechar detalhes</button></div>
));

let container;
let root;
let participacoes;
const usuario = { id_usuario: 7, nome: 'Candidato de teste', tipo_usuario: 'candidato' };
const campanha = { id_campanha: 11, nome_campanha: 'Campanha de teste', nome_hemo: 'Hemocentro de teste', status_campanha: 'ativa' };

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  sessionStorage.setItem('token', 'token-de-teste');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  participacoes = [];
  api.get.mockImplementation(async (url) => {
    if (url === '/api/usuarios/me' || url === '/api/usuarios/busca/7') return { data: usuario };
    if (url === '/api/grupos/usuario/7') return { data: { grupos: [] } };
    if (url === '/api/campanhas') return { data: { campanhas: [campanha] } };
    if (url === '/api/participacoes') return { data: participacoes };
    throw new Error(`Rota inesperada: ${url}`);
  });
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  sessionStorage.clear();
  jest.clearAllMocks();
});

async function renderizar() {
  await act(async () => root.render(<Perfil />));
}

test('mostra o interesse retornado como array e ignora registros de outro usuário', async () => {
  participacoes = [
    { id_registro: 1, id_usuario: '7', id_campanha: '11', status_participacao: 'interessado' },
    { id_registro: 2, id_usuario: 8, id_campanha: 11, status_participacao: 'interessado' },
  ];
  await renderizar();
  const interesse = [...container.querySelectorAll('.estatistica')].find(el => el.textContent.includes('Campanhas de interesse'));
  expect(interesse.querySelector('span').textContent).toBe('1');
  expect(container.querySelectorAll('.informacoes-historico-campanhas')).toHaveLength(1);
  expect(container.querySelector('.historico-campanhas').textContent).toContain('Campanha de teste');
});

test('abre detalhes da participação de hoje e atualiza o perfil ao fechar', async () => {
  const hoje = new Date();
  const data = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  participacoes = [{ id_registro: 1, id_usuario: 7, id_campanha: 11, status_participacao: 'pretende_ir', data_prevista: data }];
  await renderizar();
  expect(container.querySelector('.data-proxima-campanha').textContent).toBe(hoje.toLocaleDateString('pt-BR'));
  const botao = [...container.querySelectorAll('button')].find(el => el.textContent === 'Ver detalhes da campanha');
  await act(async () => botao.click());
  expect(container.querySelector('[role="dialog"]').textContent).toContain('Campanha de teste');
  participacoes = [];
  await act(async () => container.querySelector('[role="dialog"] button').click());
  expect(container.querySelector('[role="dialog"]')).toBeNull();
  expect(container.textContent).toContain('Você ainda não tem histórico de campanhas');
});

test('exibe erro para uma resposta inválida, em vez de fingir histórico vazio', async () => {
  participacoes = { inesperado: true };
  await renderizar();
  expect(container.querySelector('[role="alert"]').textContent).toBe('Não foi possível carregar o perfil.');
});
