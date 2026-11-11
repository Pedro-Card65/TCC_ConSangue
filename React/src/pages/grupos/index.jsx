import './index.scss';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import VincularCampanha from '../../componentes/vincular-campanha';

function tokenAtual() {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

function listaDa(resposta, chave) {
  const dados = resposta?.data;
  if (Array.isArray(dados)) return dados;
  return Array.isArray(dados?.[chave]) ? dados[chave] : [];
}


function prepararFotoGrupo(arquivo) {
  return new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 8 * 1024 * 1024) {
      reject(new Error('Escolha uma imagem JPEG, PNG ou WEBP de até 8 MB.'));
      return;
    }
    const endereco = URL.createObjectURL(arquivo);
    const imagem = new Image();
    imagem.onload = () => {
      try {
        const lado = Math.min(imagem.naturalWidth, imagem.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Não foi possível processar a imagem.');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 256, 256);
        ctx.drawImage(imagem, (imagem.naturalWidth - lado) / 2, (imagem.naturalHeight - lado) / 2, lado, lado, 0, 0, 256, 256);
        const foto = canvas.toDataURL('image/jpeg', 0.78);
        if (foto.length > 300 * 1024) throw new Error('A foto ficou grande demais. Escolha outra imagem.');
        resolve(foto);
      } catch (erro) {
        reject(erro);
      } finally {
        URL.revokeObjectURL(endereco);
      }
    };
    imagem.onerror = () => {
      URL.revokeObjectURL(endereco);
      reject(new Error('Não foi possível abrir a imagem.'));
    };
    imagem.src = endereco;
  });
}

export default function Grupos() {
  const location = useLocation();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [meusIds, setMeusIds] = useState(new Set());
  const [meusGrupos, setMeusGrupos] = useState({});
  const [usuarioId, setUsuarioId] = useState(null);
  const [contagens, setContagens] = useState({});
  const [membrosPorGrupo, setMembrosPorGrupo] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [modal, setModal] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [fotoGrupo, setFotoGrupo] = useState(null);
  const [fotoAlterada, setFotoAlterada] = useState(false);

  useEffect(() => {
    const id = location.state?.abrirGrupoId;
    if (!id || carregando) return;
    const encontrado = grupos.find(grupo => String(grupo.id_grupo) === String(id));
    if (encontrado) {
      setGrupoSelecionado(encontrado);
      setModal('detalhes');
    }
    navigate('/grupos', { replace: true, state: null });
  }, [carregando, grupos, location.state, navigate]);

  const carregar = useCallback(async () => {
    const token = tokenAtual();
    if (!token) {
      setErro('Faça login para consultar e participar de grupos.');
      setCarregando(false);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    setCarregando(true);
    setErro('');
    try {
      const [resGrupos, resUsuario] = await Promise.all([
        api.get('/api/grupos'),
        api.get('/api/usuarios/me', config)
      ]);
      const todos = listaDa(resGrupos, 'grupos');
      const usuario = resUsuario.data?.usuario ?? resUsuario.data;
      setUsuarioId(usuario.id_usuario);
      const resMeus = await api.get(`/api/grupos/usuario/${usuario.id_usuario}`, config);
      const meus = listaDa(resMeus, 'grupos');
      setGrupos(todos);
      setMeusIds(new Set(meus.map((grupo) => String(grupo.id_grupo))));
      setMeusGrupos(Object.fromEntries(meus.map((grupo) => [String(grupo.id_grupo), grupo])));

      const resultadosContagem = await Promise.all(todos.map(async (grupo) => {
        try {
          const resposta = await api.get(`/api/membros/grupo/${grupo.id_grupo}`, config);
          return [grupo.id_grupo, listaDa(resposta, 'membros')];
        } catch {
          return [grupo.id_grupo, null];
        }
      }));
      setContagens(Object.fromEntries(resultadosContagem.map(([id, membros]) => [id, membros?.length ?? null])));
      setMembrosPorGrupo(Object.fromEntries(resultadosContagem));
    } catch (error) {
      setErro(error.response?.data?.erro || 'Não foi possível carregar os grupos. Verifique sua conexão com a API.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!mensagem || (!mensagem.includes('saiu do grupo') && !mensagem.includes('foi apagado'))) return undefined;

    const temporizador = window.setTimeout(() => setMensagem(''), 2000);
    return () => window.clearTimeout(temporizador);
  }, [mensagem]);

  async function criarGrupo(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await api.post('/api/grupo', { nome_grupo: nome.trim(), descricao: descricao.trim() }, {
        headers: { Authorization: `Bearer ${tokenAtual()}` }
      });
      window.dispatchEvent(new Event('consangue:grupo-atualizado'));
      setMensagem('Grupo criado com sucesso.');
      setNome('');
      setDescricao('');
      setModal('');
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.erro || 'Não foi possível criar o grupo.');
    } finally { setSalvando(false); }
  }

  async function entrarGrupo(id) {
    setSalvando(true);
    setErro('');
    setMensagem('');
    try {
      await api.post('/api/membro', { id_grupo: Number(id) }, {
        headers: { Authorization: `Bearer ${tokenAtual()}` }
      });
      window.dispatchEvent(new Event('consangue:grupo-atualizado'));
      setMensagem('Você entrou no grupo com sucesso.');
      setModal('');
      setGrupoSelecionado(null);
      setCodigo('');
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.erro || 'Não foi possível entrar no grupo. Confira o código e tente novamente.');
    } finally { setSalvando(false); }
  }

  async function sairGrupo(grupo) {
    const membro = meusGrupos[String(grupo.id_grupo)];
    if (!membro || !window.confirm(`Deseja sair do grupo "${grupo.nome_grupo}"?`)) return;

    setSalvando(true);
    setErro('');
    try {
      await api.delete(`/api/membro/${membro.id_membro}`, {
        headers: { Authorization: `Bearer ${tokenAtual()}` }
      });
      window.dispatchEvent(new Event('consangue:grupo-atualizado'));
      setMensagem(`Você saiu do grupo "${grupo.nome_grupo}".`);
      setModal('');
      setGrupoSelecionado(null);
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.erro || 'Não foi possível sair do grupo.');
    } finally { setSalvando(false); }
  }

  async function apagarGrupo(grupo) {
    setSalvando(true);
    setErro('');
    try {
      await api.delete(`/api/grupo/${grupo.id_grupo}`, {
        headers: { Authorization: `Bearer ${tokenAtual()}` }
      });
      window.dispatchEvent(new Event('consangue:grupo-atualizado'));
      setMensagem(`O grupo "${grupo.nome_grupo}" foi apagado.`);
      setModal('');
      setGrupoSelecionado(null);
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.erro || 'Não foi possível apagar o grupo. Grupos com campanhas vinculadas precisam ser desvinculados primeiro.');
    } finally { setSalvando(false); }
  }

  function abrirGrupo(grupo) {
    setGrupoSelecionado(grupo);
    setModal('detalhes');
  }

  function abrirEdicao(grupo) {
    setGrupoSelecionado(grupo);
    setNome(grupo.nome_grupo || '');
    setDescricao(grupo.descricao || '');
    setFotoGrupo(grupo.foto_grupo || null);
    setFotoAlterada(false);
    setErro('');
    setModal('editar');
  }

  async function selecionarFotoGrupo(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;
    setErro('');
    try {
      const novaFoto = await prepararFotoGrupo(arquivo);
      setFotoGrupo(novaFoto);
      setFotoAlterada(true);
    } catch (erroFoto) {
      setErro(erroFoto.message || 'Não foi possível processar a foto.');
    }
  }

  async function editarGrupo(evento) {
    evento.preventDefault();
    if (!grupoSelecionado) return;
    setSalvando(true);
    setErro('');
    try {
      await api.put(`/api/grupo/${grupoSelecionado.id_grupo}`, {
        nome_grupo: nome.trim(),
        descricao: descricao.trim(),
        ...(fotoAlterada ? { foto_grupo: fotoGrupo } : {})
      }, { headers: { Authorization: `Bearer ${tokenAtual()}` } });
      window.dispatchEvent(new Event('consangue:grupo-atualizado'));
      setMensagem('Informações do grupo atualizadas.');
      setModal('');
      setGrupoSelecionado(null);
      setNome('');
      setDescricao('');
      await carregar();
    } catch (error) {
      setErro(error.response?.data?.erro || 'Não foi possível atualizar o grupo.');
    } finally { setSalvando(false); }
  }

  return (
    <div className="pagina-grupos">
      <header className="cabecalho-grupos">
        <h1>MEUS GRUPOS</h1>
        <div className="acoes-grupos">
          <button className="botao-principal" type="button" onClick={() => { setErro(''); setModal('criar'); }}>
            Criar novo grupo <span aria-hidden="true">+</span>
          </button>
          <button className="botao-secundario" type="button" onClick={() => { setErro(''); setModal('entrar'); }}>
            Entrar com Código
          </button>
        </div>
      </header>

      {mensagem && <p className="mensagem-grupos" role="status">{mensagem}<button type="button" onClick={() => setMensagem('')} aria-label="Fechar mensagem">×</button></p>}
      {erro && !modal && <div className="erro-grupos" role="alert"><span>{erro}</span><button type="button" onClick={carregar}>Tentar novamente</button></div>}

      <section className="lista-grupos" aria-label="Grupos disponíveis" aria-busy={carregando}>
        {carregando && <p role="status">Carregando grupos...</p>}
        {!carregando && !erro && grupos.length === 0 && <p>Nenhum grupo encontrado. Crie o primeiro!</p>}
        {!carregando && grupos.map((grupo, indice) => {
          const participando = meusIds.has(String(grupo.id_grupo));
          return (
            <article className="cartao-grupo" key={grupo.id_grupo}>
              <div className="titulo-grupo">
                <div className={`avatar-grupo avatar-${indice % 3}`} aria-hidden="true">
                  {grupo.foto_grupo ? <img src={grupo.foto_grupo} alt="" /> : (grupo.nome_grupo || 'G').trim().charAt(0).toUpperCase()}
                </div>
                <div className="texto-grupo">
                  <h2>{grupo.nome_grupo}</h2>
                  <p>{contagens[grupo.id_grupo] ?? '—'} {contagens[grupo.id_grupo] === 1 ? 'membro' : 'membros'}</p>
                </div>
                
              </div>
              <p className="descricao-grupo">{grupo.descricao || 'Grupo de doadores ConSangue'}</p>
              <div className="rodape-cartao-grupo">
                <button type="button" className="ver-grupo" onClick={() => abrirGrupo(grupo)}>Ver Grupo</button>
                {participando && <span className="participando">Você participa</span>}
              </div>
            </article>
          );
        })}
      </section>

      {modal && <div className="fundo-modal-grupos" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setModal(''); }}>
        <section className="modal-grupos" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-grupos">
          <button className="fechar-modal-grupos" type="button" onClick={() => { setModal(''); setErro(''); }} aria-label="Fechar">×</button>
          {modal === 'criar' && <>
            <h2 id="titulo-modal-grupos">Criar novo grupo</h2>
            <p>Reúna pessoas para apoiar campanhas de doação.</p>
            <form onSubmit={criarGrupo}>
              <label htmlFor="nome-grupo">Nome do grupo</label>
              <input id="nome-grupo" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} required />
              <label htmlFor="descricao-grupo">Descrição</label>
              <textarea id="descricao-grupo" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
              {erro && <p className="erro-modal" role="alert">{erro}</p>}
              <button className="botao-principal" type="submit" disabled={salvando}>{salvando ? 'Criando...' : 'Criar grupo'}</button>
            </form>
          </>}
          {modal === 'editar' && grupoSelecionado && <>
            <h2 id="titulo-modal-grupos">Editar grupo</h2>
            <p>Atualize o nome e a descrição do grupo.</p>
            <form onSubmit={editarGrupo}>
              <label htmlFor="editar-nome-grupo">Nome do grupo</label>
              <input id="editar-nome-grupo" value={nome} onChange={e => setNome(e.target.value)} maxLength={100} required />
              <label htmlFor="editar-descricao-grupo">Descrição</label>
              <textarea id="editar-descricao-grupo" value={descricao} onChange={e => setDescricao(e.target.value)} maxLength={255} rows={3} required />
              <div className="editor-foto-grupo">
                <div className="avatar-grupo avatar-preview" aria-hidden="true">
                  {fotoGrupo ? <img src={fotoGrupo} alt="" /> : (nome || 'G').trim().charAt(0).toUpperCase()}
                </div>
                <div className="editor-foto-acoes">
                  <label htmlFor="foto-grupo-editar">Foto do grupo (opcional)</label>
                  <input id="foto-grupo-editar" type="file" accept="image/jpeg,image/png,image/webp" onChange={selecionarFotoGrupo} disabled={salvando} />
                  {fotoGrupo && <button type="button" className="botao-secundario" disabled={salvando} onClick={() => { setFotoGrupo(null); setFotoAlterada(true); }}>Remover foto</button>}
                </div>
              </div>
              {erro && <p className="erro-modal" role="alert">{erro}</p>}
              <div className="acoes-confirmacao">
                <button className="botao-secundario" type="button" disabled={salvando} onClick={() => setModal('detalhes')}>Cancelar</button>
                <button className="botao-principal" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
              </div>
            </form>
          </>}
          {modal === 'entrar' && <>
            <h2 id="titulo-modal-grupos">Entrar com Código</h2>
            <p>Informe o ID do grupo para participar.</p>
            <form onSubmit={(e) => { e.preventDefault(); entrarGrupo(codigo); }}>
              <label htmlFor="codigo-grupo">Código do grupo</label>
              <input id="codigo-grupo" inputMode="numeric" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} required />
              {erro && <p className="erro-modal" role="alert">{erro}</p>}
              <button className="botao-principal" type="submit" disabled={salvando}>{salvando ? 'Entrando...' : 'Entrar no grupo'}</button>
            </form>
          </>}
          {modal === 'detalhes' && grupoSelecionado && <>
            <div className="cabecalho-detalhes-grupo">
              <div className="avatar-grupo avatar-preview" aria-hidden="true">
                {grupoSelecionado.foto_grupo
                  ? <img src={grupoSelecionado.foto_grupo} alt="" />
                  : (grupoSelecionado.nome_grupo || 'G').trim().charAt(0).toUpperCase()}
              </div>
              <h2 id="titulo-modal-grupos">{grupoSelecionado.nome_grupo}</h2>
            </div>
            <p>{grupoSelecionado.descricao || 'Grupo de doadores ConSangue.'}</p>
            <p className="codigo-exibido">Código do grupo: <strong>{grupoSelecionado.id_grupo}</strong></p>
            {erro && <p className="erro-modal" role="alert">{erro}</p>}
            {meusIds.has(String(grupoSelecionado.id_grupo))
              ? <p className="aviso-participacao">Você já participa deste grupo.</p>
              : <button className="botao-principal" type="button" disabled={salvando} onClick={() => entrarGrupo(grupoSelecionado.id_grupo)}>{salvando ? 'Entrando...' : 'Participar do grupo'}</button>}
            {meusIds.has(String(grupoSelecionado.id_grupo)) && String(grupoSelecionado.id_criador) === String(usuarioId) && (
              <button className="botao-secundario" type="button" onClick={() => abrirEdicao(grupoSelecionado)}>Editar grupo</button>
            )}
            {meusIds.has(String(grupoSelecionado.id_grupo)) && String(grupoSelecionado.id_criador) === String(usuarioId) && (
              <button className="botao-perigo" type="button" onClick={() => { setErro(''); setModal('confirmar-apagar'); }}>
                Apagar grupo
              </button>
            )}
            {meusIds.has(String(grupoSelecionado.id_grupo)) && String(grupoSelecionado.id_criador) !== String(usuarioId) && (
              <button className="botao-perigo" type="button" disabled={salvando} onClick={() => sairGrupo(grupoSelecionado)}>
                {salvando ? 'Saindo...' : 'Sair do grupo'}
              </button>
            )}

            {meusIds.has(String(grupoSelecionado.id_grupo)) && (
              <section className="membros-detalhes-grupo" aria-label="Membros do grupo">
                <h3>Membros</h3>
                {membrosPorGrupo[grupoSelecionado.id_grupo] == null
                  ? <p>Não foi possível consultar os membros deste grupo.</p>
                  : membrosPorGrupo[grupoSelecionado.id_grupo].length === 0
                    ? <p>Nenhum membro encontrado.</p>
                    : <ul>
                        {membrosPorGrupo[grupoSelecionado.id_grupo].map((membro) => (
                          <li key={membro.id_membro}>{membro.nome || membro.usuario || 'Participante'} — {membro.papel === 'administrador' ? 'Administrador' : 'Membro'}</li>
                        ))}
                      </ul>}
              </section>
            )}
            {meusIds.has(String(grupoSelecionado.id_grupo)) && String(grupoSelecionado.id_criador) === String(usuarioId) && (
              <VincularCampanha key={grupoSelecionado.id_grupo} idGrupo={grupoSelecionado.id_grupo} />
            )}
          </>}
          {modal === 'confirmar-apagar' && grupoSelecionado && <>
            <h2 id="titulo-modal-grupos">Apagar grupo?</h2>
            <p>Tem certeza de que deseja apagar <strong>{grupoSelecionado.nome_grupo}</strong>? Esta ação não pode ser desfeita.</p>
            <p className="aviso-exclusao">Grupos com campanhas vinculadas não podem ser apagados.</p>
            {erro && <p className="erro-modal" role="alert">{erro}</p>}
            <div className="acoes-confirmacao">
              <button className="botao-secundario" type="button" disabled={salvando} onClick={() => { setErro(''); setModal('detalhes'); }}>Cancelar</button>
              <button className="botao-apagar-confirmacao" type="button" disabled={salvando} onClick={() => apagarGrupo(grupoSelecionado)}>
                {salvando ? 'Apagando...' : 'Sim, apagar grupo'}
              </button>
            </div>
          </>}
        </section>
      </div>}
    </div>
  );
}
