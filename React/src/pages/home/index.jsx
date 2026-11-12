import './index.scss';
import ModalCampanha from '../../componentes/modal-campanha/modal-campanha.jsx';
import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

function formatarData(data) {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export default function Home() {
  const [campanhas, setCampanhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [campanhaAberta, setCampanhaAberta] = useState(null);

  useEffect(() => {
    const controle = new AbortController();
    async function carregar() {
      setCarregando(true);
      try {
        const resposta = await api.get('/api/campanhas', { signal: controle.signal });
        if (!controle.signal.aborted) setCampanhas(resposta.data?.campanhas ?? []);
      } catch {
        if (!controle.signal.aborted) setErro('NÃ£o foi possÃ­vel carregar as campanhas.');
      } finally {
        if (!controle.signal.aborted) setCarregando(false);
      }
    }
    carregar();
    return () => controle.abort();
  }, []);

  return (
    <div className="pagina-home">
      <h1 className="sr-only">Campanhas de doaÃ§Ã£o</h1>
      {carregando && <p role="status">Carregando campanhas...</p>}
      {erro && <p role="alert">{erro}</p>}

      {!carregando && !erro && (
        campanhas.length > 0 ? (
          campanhas.map(c => (
            <article className="cartao-campanha" key={c.¶»§q«^