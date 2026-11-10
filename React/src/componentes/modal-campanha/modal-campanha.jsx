import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import './modal-campanha.scss';

function formatarData(data) {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatarHora(hora) {
  return hora ? hora.slice(0, 5) : '';
}

export default function ModalCampanha({ campanha, aoFechar }) {
  const caixa = useRef(null);
  const [participacao, setParticipacao] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [grupo, setGrupo] = useState('');
  const [mostrarGrupos, setMostrarGrupos] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const token = sessionStorage.getItem('token');
  let usuario;
  try { usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null'); } catch { usuario = null; }
  const candidato = Boolean(token && usuario?.tipo_usuario === 'candidato');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    caixa.current?.focus();
    return () => { document.body.style.overflow = overflow; anterior?.focus(); };
  }, []);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      if (!candidato) { setCarregando(false); return; }
      try {
        const resposta = await api.get('/api/participacoes', { headers: { Authorization: `Bearer ${token}` }, params: { id_campanha: campanha.id_campanha } });
        if (ativo) setParticipacao(resposta.data[0] || null);
      } catch (error) {
        if (ativo) setErro(error.response?.data?.erro || 'Não foi possível consultar sua participação. Feche e abra os detalhes para tentar novamente.');
      } finally { if (ativo) setCarregando(false); }
    }
    carregar();
    return () => { ativo = false; };
  }, [campanha.id_campanha, candidato, token]);

  async function carregarGrupos() {
    setMostrarGrupos(true);
    setSalvando(true);
    setErro('');
    try {
      const [meus, vinculos] = await Promise.all([
        api.get(`/api/grupos/usuario/${usuario.id_usuario}`, { headers }),
        api.get('/api/gruposCampanhas')
      ]);
      setGrupos(vinculos.data.grupos.filter(v => Number(v.id_campanha) === Number(campanha.id_campanha))
        .flatMap(v => meus.data.grupos.filter(g => Number(g.id_grupo) === Number(v.id_grupo))
          .map(g => ({ ...g, id_grupo_campanha: v.id_grupo_campanha }))));
    } catch (error) { setErro(error.response?.data?.erro || 'Não foi possível carregar os grupos.'); }
    finally { setSalvando(false); }
  }

  async function participar(idVinculo) {
    if (salvando || carregando) return;
    setSalvando(true);
    setErro('');
    setMensagem('');
    try {
      const dados = idVinculo
        ? { id_grupo_campanha: Number(idVinculo) }
        : { status_participacao: 'interessado' };
      const resposta = participacao
        ? await api.put(`/api/participacoes/${participacao.id_registro}`, dados, { headers })
        : await api.post('/api/participacoes', { id_campanha: campanha.id_campanha, ...dados }, { headers });
      setParticipacao(resposta.data);
      setMensagem(idVinculo ? 'Participação vinculada ao grupo!' : 'Interesse registrado!');
    } catch (error) { setErro(error.response?.data?.erro || 'Não foi possível registrar sua participação.'); }
    finally { setSalvando(false); }
  }

  async function removerInteresse() {
    if (salvando || carregando || !participacao) return;
    setSalvando(true);
    setErro('');
    setMensagem('');
    try {
      await api.delete(`/api/participacoes/${participacao.id_registro}`, { headers });
      setParticipacao(null);
      setGrupo('');
      setMostrarGrupos(false);
      setMensagem('Interesse removido.');
    } catch (error) { setErro(error.response?.data?.erro || 'Não foi possível remover seu interesse.'); }
    finally { setSalvando(false); }
  }

  function teclado(evento) {
    if (evento.key === 'Escape' && !salvando) aoFechar();
    if (evento.key !== 'Tab') return;
    const itens = [...caixa.current.querySelectorAll('button:not(:disabled), a[href], select:not(:disabled)')];
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    if (evento.shiftKey && (document.activeElement === primeiro || document.activeElement === caixa.current)) {
      evento.preventDefault(); ultimo?.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault(); primeiro?.focus();
    }
  }

  return (
    <div className="modal-fundo" onClick={() => { if (!salvando) aoFechar(); }}>
      <div className="modal-caixa" ref={caixa} tabIndex={-1} role="dialog" aria-modal="true" aria-label={campanha.nome_campanha} onKeyDown={teclado} onClick={(e) => e.stopPropagation()}>

        <div className="modal-topo">
          <button type="button" disabled={salvando} onClick={aoFechar}>Voltar para o Feed</button>
          <button type="button" aria-label="Fechar" disabled={salvando} onClick={aoFechar}>✕</button>
        </div>

        <div
          className="modal-banner"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('/assets/images/campanha-padrao.webp')"
          }}
        >
          <h2>{campanha.nome_campanha}</h2>
          <span className="modal-periodo">
            De {formatarData(campanha.data_inicio)} a {formatarData(campanha.data_fim)}
          </span>
        </div>

        <div className="modal-info">
          {campanha.descricao && <p>{campanha.descricao}</p>}

          {campanha.horario_inicio && (
            <p>
              <strong>Horário:</strong> {formatarHora(campanha.horario_inicio)}
              {campanha.horario_fim && ` às ${formatarHora(campanha.horario_fim)}`}
            </p>
          )}

          <p><strong>Status:</strong> {campanha.status_campanha}</p>

          {/* TODO A03: endereço, tipos sanguíneos, requisitos e engajamento (vêm da API) */}
        </div>

        {erro && <p role="alert">{erro}</p>}
        {mensagem && <p role="status">{mensagem}</p>}
        {carregando && <p role="status">Consultando participação...</p>}
        {participacao && <p role="status">Sua participação: {participacao.status_participacao.replaceAll('_', ' ')}{participacao.id_grupo_campanha ? ' (com grupo)' : ''}.</p>}
        {!token && <p><Link to="/">Faça login</Link> para participar.</p>}
        {token && !candidato && <p>O registro de participação está disponível para candidatos.</p>}
        {campanha.status_campanha !== 'ativa' && <p>Esta campanha está finalizada.</p>}
        {candidato && campanha.status_campanha === 'ativa' && <>
          <div className="modal-acoes">
            <button type="button" disabled={carregando || salvando} onClick={carregarGrupos}>Participar com meu grupo</button>
            <button type="button" disabled={carregando || salvando} onClick={participacao ? removerInteresse : () => participar()}>
              {salvando ? 'Salvando...' : participacao ? 'Remover interesse' : 'Tenho interesse'}
            </button>
          </div>
          {mostrarGrupos && <div className="selecao-grupo">
            <label htmlFor="grupo-participacao">Meu grupo vinculado à campanha</label>
            <select id="grupo-participacao" value={grupo} disabled={salvando} onChange={e => setGrupo(e.target.value)}>
              <option value="">Selecione um grupo</option>
              {grupos.map(g => <option key={g.id_grupo_campanha} value={g.id_grupo_campanha}>{g.nome_grupo}</option>)}
            </select>
            <button type="button" disabled={!grupo || salvando} onClick={() => participar(grupo)}>Confirmar grupo</button>
            {!salvando && grupos.length === 0 && <p>Nenhum dos seus grupos está vinculado a esta campanha. Peça ao administrador para vinculá-lo na <Link to="/grupos">página de grupos</Link>.</p>}
          </div>}
        </>}
      </div>
    </div>
  );
}
