/* import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../services/api';

export default function RotaProtegida() {
    const [estado, setEstado] = useState('verificando');

    useEffect(() => {
        const token = sessionStorage.getItem('token');

        if (!token) {
            setEstado('negado');
            return;
        }

        let ativo = true;

        async function verificarLogin() {
            try {
                await api.get(
                '/api/usuarios/me',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (ativo) setEstado('autorizado');

            } catch (erro) {
                if (erro.response?.status === 401) {
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('usuario');

                    if (ativo) setEstado('negado');
                } else {
                    if (ativo) setEstado('erro');
                }
            }
        }

        verificarLogin();

        return () => {
            ativo = false;
        };
    }, []);

    if (estado === 'verificando') {
        return <p>Verificando sua sessão...</p>;
    }

    if (estado === 'negado') {
        return <Navigate to="/" replace />;
    }

    if (estado === 'erro') {
        return <p>Não foi possível verificar a sessão. Confira a conexão com a API e recarregue a página.</p>;
    }

    return <Outlet />;
}
 */