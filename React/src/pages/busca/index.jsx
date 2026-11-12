import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import ModalCampanha from '../../componentes/modal-campanha/modal-campanha.jsx';
import './index.scss';

function normalizar(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

function extrairLista(resposta, campo) {
  const conteudo = resposta?.data;
  if (Array.isArray(conteudo)) return conteudo;
  return Array.isArray(conteudo?.[campo]) ? conteudo[campo] : [];
}

const categorias = ['campanhas', 'instituicoes', 'grupos'];

export default function Busca() {
  const location = useLocation();
  const navigate = useNavigate();
  const termo = (new URLSearchParams(location.search).get('q') || '').trim().slice(0, 120);
  const [dados, setDados] = useState({ campanhas: [], instituicoes: [], grupos: [] });
  const [falhas, setFalhas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [instituicaoExpandida, setInstituicaoExpandida] = useState(null);
  const [campanhaAberta, setCampanhaAberta] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    if (!termo) {
      setDados({ campanhas: [], instituicoes: [], grupos: [] });
      setFalhas([]);
      setCarregando(false);
      return undefined;
    }

    const controle = new AbortController();
    setCarregando(true);
    setFalhas([]);
    setInstituicaoExpandida(null);

    async function buscar() {
      const endpoints = ['/api/campanhas', '/api/instituicoes', '/api/grupos'];
      const requisicoes = endpoints.map(url => api.get(url, { signal: controle.signal }));
      const resultados = await Promise.allSettled(requisicoes);
      if (controle.signal.aborted) return;

      const dadosNovos = {};
      const falhasNovas = [];
      resultados.forEach((resultado, indice) => {
        const categoria = categorias[indice];
        if (resultado.status === 'fulfilled') {
          dadosNovos[categoria] = extrairLista(resultado.value, categoria);
        } else {
          dadosNovos[categoria] = [];
          falhasNovas.push(categoria);
        }
      });
      setDados(dadosNovos);
      setFalhas(falhasNovas);
      setCarregando(false);
    }

    buscar();
    return () => controle.abort();
  }, [termo]);

  useEffect(() => {
    setFiltro('todos');
  }, [termo]);

  const encontrados = useMemo(() => {
    const busca = normalizar(termo);
    const contem = (...campos) => campos.some(campo => normalizar(campo).includes(busca));
    if (!busca) return { campanhas: [], instituicoes: [], grupos: [] };
    return {
      campanhas: dados.campanhas.filter(c => contem(c.nome_campanha, c.descricao, c.nome_hemo, c.cidade, c.estado, c.status_campanha)),
      instituicoes: dados.instituicoes.filter(h => contem(h.nome_hemo, h.cidade, h.estado, h.endereco)),
      grupos: dados.grupos.filter(g => contem(g.nome_grupo, g.descricao))
    };
  }, [dados, termo]);

  const total = encontrados.campanhas.length + encontrados.instituicoes.length + encontrados.grupos.length;
  const filtros = [
    { chave: 'todos', nome: 'Todos', quantidade: total },
    { chave: 'campanhas', nome: 'Campanhas', quantidade: encontrados.campanhas.length },
    { chave: 'instituicoes', nome: 'Hemocentros', quantidade: encontrados.instituicoes.length },
    { chave: 'grupos', nome: 'Grupos', quantidade: encontrados.grupos.length }
  ];
  const categoriaVisivel = chave => filtro === 'todos' || filtro === chave;
  const totalVisivel = filtro === 'todos' ? total : encontrados[filtro]?.length ?? 0;

  return (
    <div className="pagina-busca">
      <header className="cabecalho-resultados">
        <h1>Resultados da busca</h1>
        <p>{termo ? <>Pesquisa por <strong>“{termo}”</strong></> : 'Digite um termo na barra de pesquisa.'}</p>
      </header>

      {carregando && <p className="estado-resultados" role="status">Buscando resultados...</p>}

      {!carregando && termo && (
        <>
          {falhas.length > 0 && (
            <p className="aviso-resultados" role="alert">
              Não foi possível consultar {falhas.map(f => f === 'instituicoes' ? 'hemocentros' : f).join(', ')}.
              Alguns resultados podem estar indisponíveis.
            </p>
          )}

          <div className="barra-filtros-resultados">
            <div className="filtros-categorias-busca" role="group" aria-label="Filtrar resultados por categoria">
              {filtros.map(opcao => (
                <button
                  type="button"
                  key={opcao.chave}
                  className={'filtro-busca' + (filtro === opcao.chave ? ' ativo' : '')}
                  aria-pressed={filtro === opcao.chave}
                  onClick={() => setFiltro(opcao.chave)}
                >
                  {opcao.nome} ({opcao.quantidade})
                </button>
              ))}
            </div>
            <p className="quantidade-resultados" role="status">
              {totalVisivel} {totalVisivel === 1 ? 'resultado' : 'resultados'}
            </p>
          </div>

          {totalVisivel === 0 && falhas.length === 0 && (
            <p className="estado-resultados">Nenhum resultado encontrado. Tente outro termo ou categoria.</p>
          )}

          {categoriaVisivel('campanhas') && encontrados.campanhas.length > 0 && (
            <section className="secao-resultados" aria-labelledby="resultados-campanhas">
              <h2 id="resultados-campanhas">Campanhas <span>({encontrados.campanhas.length})</span></h2>
              <div className="lista-resultados">
                {encontrados.campanhas.map(c => (
                  <article className="cartao-resultado" key={c.id_campanha}>
                    <div className="conteudo-resultado">
                      <h3>{c.nome_campanha}</h3>
                      <p className="detalhe-resultado">{[c.nome_hemo, c.cidade].filter(Boolean).join(' · ')}</p>
                      {c.descricao && <p className="descricao-resultado">{c.descricao}</p>}
                      {c.status_campanha && <p className="detalhe-resultado">Status: {c.status_campanha}</p>}
                    </div>
                    <button type="button" onClick={() => setCampanhaAberta(c)}>Ver campanha</button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {categoriaVisivel('instituicoes') && encontrados.instituicoes.length > 0 && (
            <section className="secao-resultados" aria-labelledby="resultados-hemocentros">
              <h2 id="resultados-hemocentros">Hemocentros <span>({encontrados.instituicoes.length})</span></h2>
              <div className="lista-resultados">
                {encontrados.instituicoes.map(h => {
                  const aberto = String(instituicaoExpandida) === String(h.id_hemocentro);
                  const campanhasInstituicao = dados.campanhas.filter(c => String(c.id_hemocentro) === String(h.id_hemocentro));
                  return (
                    <article className="cartao-resultado" key={h.id_hemocentro}>
                      <div className="conteudo-resultado">
                        <h3>{h.nome_hemo}</h3>
                        <p className="detalhe-resultado">{[h.cidade, h.estado].filter(Boolean).join(' / ')}</p>
                        {h.endereco && <p className="descricao-resultado">{h.endereco}</p>}
                        {aberto && (
                          <div className="campanhas-do-hemocentro">
                            <h4>Campanhas deste hemocentro</h4>
                            {falhas.includes('campanhas')
                              ? <p>Campanhas indisponíveis no momento.</p>
                              : campanhasInstituicao.length === 0
                                ? <p>Nenhuma campanha cadastrada.</p>
                                : campanhasInstituicao.map(c => (
                                  <button
                                    type="button"
                                    className="link-campanha"
                                    key={c.id_campanha}
                                    onClick={() => setCampanhaAberta(c)}
                                  >
                                    {c.nome_campanha}
                                  </button>
                                ))}
                          </div>
                        )}
                      </div>
                      <button type="button" aria-expanded={aberto} onClick={() => setInstituicaoExpandida(aberto ? null : h.id_hemocentro)}>
                        {aberto ? 'Ocultar campanhas' : 'Ver campanhas'}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {categoriaVisivel('grupos') && encontrados.grupos.length > 0 && (
            <section className="secao-resultados" aria-labelledby="resultados-grupos">
              <h2 id="resultados-grupos">Grupos <span>({encontrados.grupos.length})</span></h2>
              <div className="lista-resultados">
                {encontrados.grupos.map(g => (
                  <article className="cartao-resultado" key={g.id_grupo}>
                    <div className="conteudo-resultado">
                      <h3>{g.nome_grupo}</h3>
                      {g.descricao && <p className="descricao-resultado">{g.descricao}</p>}
                      <p className="detalhe-resultado">Grupo por convite</p>
                    </div>
                    <button type="button" onClick={() => navigate('/grupos', { state: { abrirGrupoId: g.id_grupo } })}>
                      Ver grupo
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {campanhaAberta && (
        <ModalCampanha key={campanhaAberta.id_campanha} campanha={campanhaAberta} aoFechar={() => setCampanhaAberta(null)} />
      )}
    </div>
  );
}
