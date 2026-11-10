import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import VincularCampanha from '../../componentes/vincular-campanha';
import './index.scss';

export default function Grupos() {
  const [dados, setDados] = useState(null);
  const [atualizacao, setAtualizacao] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [modo, setModo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [entrada, setEntrada] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [membros, setMembros] = useState(null);
  const [erroMembros, setErroMembros] = useState('');
  const [salvando, setSalvando] = useState(false);
  const enviando = useRef(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro('');
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('Faça login para acessar seus grupos.');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const usuario = (await api.get('/api/usuarios/me', config)).data;
        const [meus, todos] = await Promise.all([
          api.get(`/api/grupos/usuario/${usuario.id_usuario}`, config), api.get('/api/grupos', config)
        ]);
        if (!Array.isArray(meus.data.grupos) || !Array.isArray(todos.data.grupos)) throw new Error('Resposta de grupos inválida.');
        if (ativo) setDados({ usuario, grupos: meus.data.grupos, todos: todos.data.grupos });
      } catch (error) {
        if (ativo) setErro(error.response?.data?.erro || error.message || 'Não foi possível carregar os grupos.');
      } finally { if (ativo) setCarregando(false); }
    }
    carregar();
    return () => { ativo = false; };
  }, [atualizacao]);

  useEffect(() => {
    let ativo = true;
    setMembros(null);
    setErroMembros('');
    if (!selecionado) return;
    api.get(`/api/membros/grupo/${selecionado}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } })
      .then(({ data }) => { if (ativo) setMembros(data.membros); })
      .catch(error => { if (ativo) setErroMembros(error.response?.data?.erro || 'Não foi possível carregar os membros.'); });
    return () => { ativo = false; };
  }, [selecionado, atualizacao]);

  function abrir(novoModo) {
    setModo(novoModo); setErro(''); setMensagem(''); setNome(''); setDescricao(''); setEntrada('');
  }

  async function salvar(event) {
    event.preventDefault();
    if (enviando.current) return;
    const token = sessionStorage.getItem('token');
    if (!token) { setErro('Sua sessão terminou. Faça login novamente.'); return; }
    if (modo === 'criar' && (!nome.trim() || !descricao.trim())) { setErro('Informe nome e descrição.'); return; }
    if (modo === 'entrar' && !entrada) { setErro('Selecione um grupo.'); return; }
    enviando.current = true; setSalvando(true); setErro(''); setMensagem('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (modo === 'criar') {
        await api.post('/api/grupo', { nome_grupo: nome.trim(), descricao: descricao.trim() }, config);
        setMensagem('Grupo criado. Você é o administrador.');
      } else {
        await api.post('/api/membro', { id_grupo: Number(entrada) }, config);
        setMensagem('Você entrou no grupo.');
      }
      setModo(''); setAtualizacao(valor => valor + 1);
    } catch (error) { setErro(error.response?.data?.erro || 'Não foi possível salvar. Tente novamente.'); }
    finally { enviando.current = false; setSalvando(false); }
  }

  const grupos = dados?.grupos || [];
  const grupo = grupos.find(item => String(item.id_grupo) === String(selecionado));
  const outros = (dados?.todos || []).filter(item => !grupos.some(meu => String(meu.id_grupo) === String(item.id_grupo)));
  const administrador = grupo && (grupo.papel === 'administrador' || String(grupo.id_criador) === String(dados.usuario.id_usuario));

  return <div className="bloco grupos-integrados">
    <div className="b2"><h1>MEUS GRUPOS</h1><div className="botoes">
      <button id="criar" disabled={carregando || salvando || !dados} onClick={() => abrir('criar')}>Criar novo grupo</button>
      <button id="entrar" disabled={carregando || salvando || !dados} onClick={() => abrir('entrar')}>Entrar em grupo</button>
    </div></div>
    {mensagem && <p role="status">{mensagem}</p>}
    {erro && <div role="alert">{erro} {!modo && <button onClick={() => setAtualizacao(valor => valor + 1)}>Tentar novamente</button>}</div>}
    {modo && <form className="formulario-grupo" onSubmit={salvar} aria-label={modo === 'criar' ? 'Criar grupo' : 'Entrar em grupo'}>
      <h2>{modo === 'criar' ? 'Criar grupo' : 'Escolha um grupo'}</h2>
      {modo === 'criar' ? <>
        <label htmlFor="nome-grupo">Nome do grupo</label><input id="nome-grupo" required maxLength={100} disabled={salvando} value={nome} onChange={e => setNome(e.target.value)} />
        <label htmlFor="descricao-grupo">Descrição</label><textarea id="descricao-grupo" required maxLength={255} disabled={salvando} value={descricao} onChange={e => setDescricao(e.target.value)} />
      </> : <>
        <label htmlFor="grupo-entrada">Grupo</label><select id="grupo-entrada" required disabled={salvando} value={entrada} onChange={e => setEntrada(e.target.value)}>
          <option value="">Selecione um grupo</option>{outros.map(item => <option key={item.id_grupo} value={item.id_grupo}>{item.nome_grupo}</option>)}
        </select>{!outros.length && <p>Nenhum outro grupo disponível.</p>}
      </>}
      <div className="acoes-grupo"><button type="submit" disabled={salvando || (modo === 'entrar' && !outros.length)}>{salvando ? 'Salvando...' : modo === 'criar' ? 'Salvar grupo' : 'Confirmar entrada'}</button>
      <button type="button" disabled={salvando} onClick={() => setModo('')}>Cancelar</button></div>
    </form>}
    {carregando ? <p role="status">Carregando grupos...</p> : <>
      {!grupos.length && !erro && <p>Você ainda não participa de um grupo.</p>}
      <div className="grupos">{grupos.map(item => <article className="gru" key={item.id_grupo}>
        <h2>{item.nome_grupo}</h2><p>{item.descricao}</p><p>{item.papel === 'administrador' ? 'Administrador' : 'Membro'}</p>
        <button onClick={() => setSelecionado(item.id_grupo)} aria-label={`Ver grupo ${item.nome_grupo}`}>Ver grupo</button>
      </article>)}</div>
      {grupo && <section className="detalhes-grupo" aria-label={`Detalhes de ${grupo.nome_grupo}`}>
        <h2>{grupo.nome_grupo}</h2><button onClick={() => setSelecionado(null)}>Fechar detalhes</button><h3>Membros</h3>
        {erroMembros ? <p role="alert">{erroMembros}</p> : membros === null ? <p role="status">Carregando membros...</p> : <ul>{membros.map(membro => <li key={membro.id_membro}>{membro.nome} — {membro.papel === 'administrador' ? 'Administrador' : 'Membro'}</li>)}</ul>}
        {administrador && <VincularCampanha key={grupo.id_grupo} idGrupo={grupo.id_grupo} />}
      </section>}
    </>}
  </div>;
}
