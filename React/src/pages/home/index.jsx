import './index.scss';
import ModalCampanha from '../../componentes/modal-campanha/modal-campanha.jsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';

function formatarData(data) {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function normalizar(valor) {
  return String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function Home() {
  const navigate = useNavigate();
  const [campanhas, setCampanhas] = useState([]);
  const [hemocentros, setHemocentros] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [campanhaAberta, setCampanhaAberta] = useState(null);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const [resultadoCampanhas, resultadoHemocentros, resultadoGrupos] = await Promise.allSettled([
        api.get('/api/campanhas'),
        api.get('/api/instituicoes'),
        api.get('/api/grupos')
      ]);
      if (!ativo) return;
      if (resultadoCampanhas.status === 'fulfilled') {
        setCampanhas(resultadoCampanhas.value.data?.campanhas ?? []);
      } else {
        setErro('Não foi possível carregar as campanhas.');
      }
      if (resultadoHemocentros.status === 'fulfilled') {
        const dados = resultadoHemocentros.value.data;
        setHemocentros(Array.isArray(dados) ? dados : dados?.instituicoes ?? []);
      }
      if (resultadoGrupos.status === 'fulfilled') {
        setGrupos(resultadoGrupos.value.data?.grupos ?? []);
      }
      setCarregando(false);
    }
    carregar();
    return () => { ativo = false; };
  }, []);

  const termo = normalizar(busca.trim());
  const combina = (...valores) => valores.some(valor => normalizar(valor).includes(termo));
  const campanhasExibidas = termo
    ? campanhas.filter(c => combina(c.nome_campanha, c.descricao, c.nome_hemo, c.cidade, c.status_campanha))
    : campanhas;
  const hemocentrosExibidos = termo
    ? hemocentros.filter(h => combina(h.nome_hemo, h.cidade, h.estado, h.endereco))
    : [];
  const gruposExibidos = termo
    ? grupos.filter(g => combina(g.nome_grupo, g.descricao))
    : [];
  const semResultados = termo && campanhasExibidas.length === 0 &&
    hemocentrosExibidos.length === 0 && gruposExibidos.length === 0;

  return (
    <div className="pagina-home">
      <div className="pesquisa">
        <img src="/assets/icons/LupaPesquisa.png" alt="" />
        <input
          type="search"
          aria-label="Pesquisar campanhas, hemocentros ou grupos"
          placeholder="Pesquisar campanhas, hemocentros ou grupos..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {carregando && <p role="status">Carregando campanhas...</p>}
      {erro && <p role="alert">{erro}</p>}

      {!carregando && termo && (
        <section className="resultados-home" aria-live="polite">
          <h2>Resultados da pesquisa</h2>
          {hemocentrosExibidos.length > 0 && (
            <div className="resultados-categoria">
              <h3>Hemocentros ({hemocentrosExibidos.length})</h3>
              {hemocentrosExibidos.map(h => (
                <div className="resultado-item" key={h.id_hemocentro}>
                  <span><strong>{h.nome_hemo}</strong> · {h.cidade}/{h.estado}</span>
                  <button type="button" onClick={() => setBusca(h.nome_hemo)}>
                    Ver campanhas
                  </button>
                </div>
              ))}
            </div>
          )}
          {gruposExibidos.length > 0 && (
            <div className="resultados-categoria">
              <h3>Grupos ({gruposExibidos.length})</h3>
              {gruposExibidos.map(g => (
                <div className="resultado-item" key={g.id_grupo}>
                  <span><strong>{g.nome_grupo}</strong> — {g.descricao}</span>
                  <button type="button" onClick={() => navigate('/grupos', { state: { abrirGrupoId: g.id_grupo } })}>
                    Ver grupo
                  </button>
                </div>
              ))}
            </div>
          )}
          {semResultados && !erro && <p>Nenhum resultado encontrado para "{busca}".</p>}
        </section>
      )}

      {!carregando && !erro && (
        campanhasExibidas.length > 0 ? (
          campanhasExibidas.map(c => (
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
          !termo && <div className="home-aviso"><p>Nenhuma campanha encontrada.</p></div>
        )
      )}
      {campanhaAberta && (
        <ModalCampanha campanha={campanhaAberta} aoFechar={() => setCampanhaAberta(null)} />
      )}
    </div>
  );
}
