import './index.scss';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import ModalCampanha from '../../componentes/modal-campanha/modal-campanha.jsx';
import FormularioCampanha from '../../componentes/painel-institucional/formulario-campanha.jsx';
import AcessoAdministrativo from '../../componentes/acesso-administrativo';

const filtrosIniciais = {
  nome: '',
  cidade: '',
  status: 'ativa'
};

function normalizar(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function dataFormatada(data) {
  if (!data) {
    return '';
  }

  return new Date(data).toLocaleDateString('pt-BR', {
    timeZone: 'UTC'
  });
}

export default function Campanhas() {
  const [instituicao, setInstituicao] = useState(false);
  const [administrador, setAdministrador] = useState(false);
  const [editandoCampanha, setEditandoCampanha] = useState(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null);
  const [excluindoCampanha, setExcluindoCampanha] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');
  const [campanhas, setCampanhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [aplicados, setAplicados] = useState(filtrosIniciais);
  const [campanhaAberta, setCampanhaAberta] = useState(null);

  useEffect(() => {
    const controle = new AbortController();

    async function buscarCampanhas() {
      setCarregando(true);
      setErro('');

      try {
        const resposta = await api.get('/api/campanhas', {
          signal: controle.signal
        });

        if (!controle.signal.aborted) {
          setCampanhas(resposta.data.campanhas || []);
        }
      }
      catch (error) {
        if (!controle.signal.aborted) {
          setErro(
            error.response?.data?.erro ||
            'Não foi possível carregar as campanhas. Tente novamente.'
          );
        }
      }
      finally {
        if (!controle.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    buscarCampanhas();

    return () => {
      controle.abort();
    };
  }, [tentativa]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return undefined;
    const controle = new AbortController();
    const config = { headers: { Authorization: 'Bearer ' + token }, signal: controle.signal };
    Promise.all([
      api.get('/api/usuarios/me', config),
      api.get('/api/admin/situacao', config).catch(() => ({ data: { administrador: false } }))
    ]).then(([usuario, permissao]) => {
      if (!controle.signal.aborted) {
        setInstituicao((usuario.data.usuario ?? usuario.data).tipo_usuario === 'instituicao');
        setAdministrador(Boolean(permissao.data?.administrador));
      }
    }).catch(() => {});
    return () => controle.abort();
  }, []);

  function alterar(evento) {
    const { name, value } = evento.target;

    setFiltros({
      ...filtros,
      [name]: value
    });
  }

  function pesquisar(evento) {
    evento.preventDefault();
    setAplicados({ ...filtros });
  }

  function limparFiltros() {
    setFiltros(filtrosIniciais);
    setAplicados(filtrosIniciais);
  }

  function tentarNovamente() {
    setTentativa(tentativa + 1);
  }

  function fecharCampanha() {
    setCampanhaAberta(null);
  }

  async function excluirCampanha() {
    if (!confirmandoExclusao || excluindoCampanha) return;
    setExcluindoCampanha(true);
    setErroExclusao('');
    try {
      await api.delete('/api/campanhas/' + confirmandoExclusao.id_campanha, {
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem('token') }
      });
      setConfirmandoExclusao(null);
      setTentativa(v => v + 1);
    } catch (falha) {
      setErroExclusao(falha.response?.data?.erro ||
        'Não foi possível excluir. Verifique se há grupos ou participações vinculados.');
    } finally {
      setExcluindoCampanha(false);
    }
  }

  function ativouAdministracao() {
    setAdministrador(true);
    setTentativa(v => v + 1);
  }

  const cidades = [];

  for (const campanha of campanhas) {
    if (campanha.cidade && !cidades.includes(campanha.cidade)) {
      cidades.push(campanha.cidade);
    }
  }

  cidades.sort((primeira, segunda) => primeira.localeCompare(segunda, 'pt-BR'));

  const resultados = campanhas.filter(campanha => {
    const nome = normalizar(`${campanha.nome_campanha} ${campanha.nome_hemo || ''}`);
    const busca = normalizar(aplicados.nome.trim());

    const correspondeNome = nome.includes(busca);
    const correspondeCidade = !aplicados.cidade || campanha.cidade === aplicados.cidade;
    const correspondeStatus = !aplicados.status || campanha.status_campanha === aplicados.status;

    return correspondeNome && correspondeCidade && correspondeStatus;
  });

  return (
    <div className="pagina-campanhas">

      <h1>CAMPANHAS</h1>
      {instituicao && <Link className="criar-campanha" to="/perfil?novaCampanha=1">Criar nova campanha</Link>}
      <AcessoAdministrativo aoAtivar={ativouAdministracao} />

      <form className="pesquisa" onSubmit={pesquisar}>

        <div className="pesquisa-nome">
          <label htmlFor="busca-campanha">
            Pesquisar campanhas/hemocentros
          </label>

          <div className="barra-pesquisa">
            <img src="/assets/icons/lupa.png" alt="" />

            <input
              id="busca-campanha"
              name="nome"
              value={filtros.nome}
              onChange={alterar}
              placeholder="Nome da campanha ou hemocentro"
            />
          </div>
        </div>

        <div className="filtro-cidade">
          <label htmlFor="cidade">Cidade</label>

          <select
            id="cidade"
            name="cidade"
            value={filtros.cidade}
            onChange={alterar}
          >
            <option value="">Todas as cidades</option>

            {cidades.map(cidade => (
              <option key={cidade} value={cidade}>
                {cidade}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-status">
          <label htmlFor="status">Status</label>

          <select
            id="status"
            name="status"
            value={filtros.status}
            onChange={alterar}
          >
            <option value="">Todos</option>
            <option value="ativa">Ativas</option>
            <option value="encerrada">Finalizadas</option>
          </select>
        </div>

        <button className="pesquisar" type="submit" disabled={carregando}>
          Pesquisar
        </button>

        <button type="button" onClick={limparFiltros}>
          Limpar filtros
        </button>

      </form>

      <section
        className="lista-campanhas"
        aria-label="Campanhas encontradas"
        aria-busy={carregando}
      >

        {carregando && (
          <p role="status">Carregando campanhas...</p>
        )}

        {erro && (
          <div role="alert">
            <p>{erro}</p>

            <button onClick={tentarNovamente}>
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && (
          <>
            <p role="status">{resultados.length} campanha(s) encontrada(s).</p>

            {resultados.length === 0 && (
              <p>Nenhuma campanha encontrada. Experimente mudar os filtros.</p>
            )}

            {resultados.map(campanha => (
              <article className="cartao-campanha" key={campanha.id_campanha}>
                <img className="foto-campanha" src={campanha.foto_campanha || '/assets/images/campanha-padrao.webp'} alt="" loading="lazy" />
                <h2>{campanha.nome_campanha}</h2>

                <p>{campanha.nome_hemo} — {campanha.cidade}/{campanha.estado}</p>
                <p>{campanha.descricao}</p>

                <p>
                  De {dataFormatada(campanha.data_inicio)} a {dataFormatada(campanha.data_fim)}
                </p>

                <p>
                  Status: {campanha.status_campanha === 'ativa' ? 'Ativa' : 'Finalizada'}
                </p>

                <button type="button" onClick={() => setCampanhaAberta(campanha)}>
                  Ver detalhes e participar
                </button>
                {administrador && <div className="acoes-admin-campanha">
                  <button type="button" onClick={() => { setEditandoCampanha(campanha); setErroExclusao(''); }}>
                    Editar campanha
                  </button>
                  <button type="button" className="botao-perigo" onClick={() => {
                    setConfirmandoExclusao(campanha); setErroExclusao('');
                  }}>Excluir campanha</button>
                </div>}
                {administrador && editandoCampanha?.id_campanha === campanha.id_campanha &&
                  <div className="formulario-admin-campanha">
                    <FormularioCampanha key={campanha.id_campanha}
                      campanha={campanha}
                      instituicao={{ id_hemocentro: campanha.id_hemocentro,
                        nome_hemo: campanha.nome_hemo, endereco: campanha.endereco }}
                      aoCancelar={() => setEditandoCampanha(null)}
                      aoSalvar={() => { setEditandoCampanha(null); setTentativa(v => v + 1); }}
                    />
                  </div>}
              </article>
            ))}
          </>
        )}

      </section>

      {confirmandoExclusao && administrador && (
        <div className="fundo-confirmacao-admin-campanha" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacao-admin-campanha"
            className="caixa-confirmacao-admin-campanha">
            <h2 id="titulo-confirmacao-admin-campanha">Excluir campanha?</h2>
            <p>Deseja excluir permanentemente <strong>{confirmandoExclusao.nome_campanha}</strong>?
              Campanhas com participações ou grupos vinculados não podem ser excluídas.</p>
            {erroExclusao && <p role="alert">{erroExclusao}</p>}
            <div className="acoes-admin-campanha">
              <button type="button" disabled={excluindoCampanha}
                onClick={() => setConfirmandoExclusao(null)}>Cancelar</button>
              <button type="button" className="botao-perigo" disabled={excluindoCampanha}
                onClick={excluirCampanha}>
                {excluindoCampanha ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
            </div>
          </section>
        </div>
      )}

      {campanhaAberta && (
        <ModalCampanha
          key={campanhaAberta.id_campanha}
          campanha={campanhaAberta}
          aoFechar={fecharCampanha}
        />
      )}

    </div>
  );
}
