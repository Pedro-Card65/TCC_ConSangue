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
        if (!controle.signal.aborted) setErro('Não foi possível carregar as campanhas.');
      } finally {
        if (!controle.signal.aborted) setCarregando(false);
      }
    }
    carregar();
    return () => controle.abort();
  }, []);

  return (
    <div className="pagina-home">
      {carregando && <p role="status">Carregando campanhas...</p>}
      {erro && <p role="alert">{erro}</p>}

      {!carregando && !erro && (
        campanhas.length > 0 ? (
          campanhas.map(c => (
            <article className="cartao-campanha" key={c.id_campanha}>
              <header className="cartao-topo">
                <img className="cartao-logo" src="/assets/images/Simbolo_Vermelho.png" alt="" />

                <div className="cartao-identificacao">
                  <h2>{c.nome_campanha}</h2>
                  <p className="cartao-hemo">
                    {c.nome_hemo}
                    <img src="/assets/images/verificado.png" alt="Hemocentro verificado" title="Hemocentro verificado" />
                  </p>
                  <p>Status: {c.status_campanha}</p>
                </div>
              </header>
              <div className="cartao-imagem">
                <img src="/assets/images/campanha-padrao.webp" alt={c.nome_campanha} />
                <span className="cartao-periodo">
                  {formatarData(c.data_inicio)} a {formatarData(c.data_fim)}
                </span>
              </div>
              <div className="cartao-acoes">
                <button type="button" className="cartao-saiba-mais" onClick={() => setCampanhaAberta(c)}>
                  Saiba mais
                </button>
              </div>
              <p className="cartao-descricao">{c.descricao}</p>
            </article>
          ))
        ) : (
          <div className="home-aviso"><p>Nenhuma campanha encontrada.</p></div>
        )
      )}
      {campanhaAberta && (
        <ModalCampanha campanha={campanhaAberta} aoFechar={() => setCampanhaAberta(null)} />
      )}
    </div>
  );
}
