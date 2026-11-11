import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001'
});

// Sessão expirada ou token inválido: limpa a sessão e volta para o login.
// A própria requisição de login fica de fora (401 ali é senha/CPF errado).
api.interceptors.response.use(
    resposta => resposta,
    erro => {
        const ehLogin = (erro.config?.url || '').includes('/api/usuarios/login');

        if (erro.response?.status === 401 && !ehLogin) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('usuario');

            if (window.location.pathname !== '/') {
                window.location.assign('/');
            }
        }

        return Promise.reject(erro);
    }
);
