import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import './acesso-administrativo.scss';

function config() {
  return { headers: { Authorization: 'Bearer ' + (sessionStorage.getItem('token') || '') } };
}

export default function AcessoAdministrativo({ aoAtivar }) {
  const [podeAtivar, setPodeAtivar] = useState(false);
  const [ativo, setAtivo] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('token')) return undefined;
    let cancelado = false;
    api.get('/api/admin/situacao', config()).then(({ data }) => {
      if (!cancelado) {
        setPodeAtivar(Boolean(data.pode_ativar));
        setAtivo(Boolean(data.administrador));
      }
    }).catch(() => {});
    return () => { cancelado = true; };
  }, []);

  async function ativar(evento) {
    evento.preventDefault();
    if (!codigo || enviando) return;
    setErro('');
    setEnviando(true);
    try {
      const { data } = await api.post('/api/admin/ativar', { codigo }, config());
      if (!data?.token || !data.administrador) throw new Error('Resposta administrativa inválida.');
      sessionStorage.setItem('token', data.token);
      setAtivo(true);
      setCodigo('');
      aoAtivar?.();
    } catch (falha) {
      setErro(falha.response?.data?.erro || falha.message || 'Não foi possível ativar o modo administrador.');
    } finally {
      setEnviando(false);
    }
  }

  if (!podeAtivar) return null;

  return (
    <section className="consangue-acesso-admin" aria-label="Acesso administrativo">
      {ativo
        ? <p role="status"><strong>Modo administrador ativo.</strong> Você pode gerenciar campanhas e grupos de outros usuários.</p>
        : <form onSubmit={ativar}>
            <label htmlFor="codigo-administrativo">Ativar modo administrador</label>
            <div className="consangue-acesso-admin-campos">
              <input id="codigo-administrativo" type="password" autoComplete="off"
                placeholder="Código administrativo" value={codigo} required
                onChange={evento => setCodigo(evento.target.value)} />
              <button type="submit" disabled={enviando}>
                {enviando ? 'Ativando...' : 'Ativar acesso'}
              </button>
            </div>
            <small>Esse acesso é exclusivo da conta Administrador e expira com sua sessão.</small>
            {erro && <p role="alert">{erro}</p>}
          </form>}
    </section>
  );
}
