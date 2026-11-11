import { api } from './api';

function simularRespostaDeErro(status, url) {
  const erro = { response: { status }, config: { url } };
  const manipulador = api.interceptors.response.handlers.find(item => typeof item.rejected === 'function');
  return manipulador.rejected(erro);
}

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  sessionStorage.clear();
});

test('401 em rota autenticada limpa a sessão', async () => {
  sessionStorage.setItem('token', 'token-teste');
  sessionStorage.setItem('usuario', JSON.stringify({ id_usuario: 1 }));
  await expect(simularRespostaDeErro(401, '/api/usuarios/me')).rejects.toMatchObject({
    response: { status: 401 }
  });
  expect(sessionStorage.getItem('token')).toBeNull();
  expect(sessionStorage.getItem('usuario')).toBeNull();
});

test('401 no login não apaga sessão por engano', async () => {
  sessionStorage.setItem('token', 'token-teste');
  await expect(simularRespostaDeErro(401, '/api/usuarios/login')).rejects.toMatchObject({
    response: { status: 401 }
  });
  expect(sessionStorage.getItem('token')).toBe('token-teste');
});

test('erro 500 não desloga o usuário', async () => {
  sessionStorage.setItem('token', 'token-teste');
  await expect(simularRespostaDeErro(500, '/api/usuarios/me')).rejects.toMatchObject({
    response: { status: 500 }
  });
  expect(sessionStorage.getItem('token')).toBe('token-teste');
});
