import './index.scss';
import LogoSlogan from '../../componentes/logo-slogan/logo-slogan.jsx';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import ModalCampanha from '../../componentes/modal-campanha/modal-campanha.jsx';
import PainelInstitucional from '../../componentes/painel-institucional';
import BuscaGlobal from '../../componentes/busca-global';

const STATUS = {
  comparecimento_informado: { texto: 'Compareceu', classe: 'compareceu' },
  interessado: { texto: 'Interesse', classe: 'interesse' },
  pretende_ir: { texto: 'Planejada', classe: 'planejada' },
};

const formatarData = (d) => {
  if (!d) return '—';
  const valor = /^\d{4}-\d{2}-\d{2}$/.test(String(d)) ? `${d}T00:00:00` : d;
  return new Date(valor).toLocaleDateString('pt-BR');
};

const AVATAR_PADRAO = '/assets/icons/perfil-vermelho.webp';
const FOTO_TAMANHO = 256;

function carregarImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imagem inválida')); };
    img.src = url;
  });
}

// recorte quadrado central, 256x256, JPEG qualidade 0.8
async function redimensionarFoto(arquivo) {
  const img = await carregarImagem(arquivo);
  const lado = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - lado) / 2;
  const sy = (img.naturalHeight - lado) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = FOTO_TAMANHO;
  canvas.height = FOTO_TAMANHO;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, FOTO_TAMANHO, FOTO_TAMANHO);
  ctx.drawImage(img, sx, sy, lado, lado, 0, 0, FOTO_TAMANHO, FOTO_TAMANHO);

  return canvas.toDataURL('image/jpeg', 0.8);
}


export default function User() {

  const [usuario, setUsuario] = useState(null);
  const [estatisticas, setEstatisticas] = useState({ grupos: 0, participadas: 0, interesse: 0 });
  const [proximaCampanha, setProximaCampanha] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState('');
  const fotoInputRef = useRef(null);
  const navigate = useNavigate();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');
<<<<<<< HEAD
=======
  const [campanhaAberta, setCampanhaAberta] = useState(null);
  const [atualizacao, setAtualizacao] = useState(0);
>>>>>>> 6af48690620e19056571256973665b83dce1f097

  async function excluirConta() {
    const token = sessionStorage.getItem('token');
    setExcluindo(true);
    setErroExclusao('');
    try {
      await api.delete(`/api/usuarios/deletar/certeza/${usuario.id_usuario}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');
      navigate('/', { replace: true });
    } catch (erro) {
      setErroExclusao(
        erro.response?.status === 409
          ? 'Não é possível excluir: há grupos ou participações vinculados.'
          : erro.response?.data?.erro || 'Não foi possível excluir a conta.'
      );
    } finally {
      setExcluindo(false);
    }
  }

  useEffect(() => {
  let ativo = true;
  const token = sessionStorage.getItem('token'); // mesmo storage que o login usa

  if (!token) { setCarregando(false); return; }

  const headers = { Authorization: `Bearer ${token}` };

  async function carregar() {
    try {
      const me = (await api.get('/api/usuarios/me', { headers })).data;
      const id = me.id_usuario ?? me.usuario?.id_usuario;

      const autenticado = me.usuario ?? me;
      if (autenticado.tipo_usuario === 'instituicao') {
        if (ativo) setUsuario(autenticado);
        return;
      }

      const [busca, grupos, parts, camps] = await Promise.all([
        api.get(`/api/usuarios/busca/${id}`, { headers }),
        api.get(`/api/grupos/usuario/${id}`, { headers }),
        api.get('/api/participacoes', { headers }),
        api.get('/api/campanhas'),
      ]);

      if (!ativo) return;

      const u = busca.data.usuario ?? busca.data;
      const listaGrupos = grupos.data.grupos ?? [];
      const listaCamps = camps.data.campanhas ?? [];
      const participacoes = Array.isArray(parts.data) ? parts.data : parts.data.participacoes;
      if (!Array.isArray(participacoes)) throw new Error('Resposta de participações inválida');
      const listaParts = participacoes.filter((p) => String(p.id_usuario) === String(id));

      const cruzadas = listaParts.map((p) => {
        const c = listaCamps.find((x) => String(x.id_campanha) === String(p.id_campanha)) || {};
        return { ...c, ...p, data: p.data_prevista || p.data_registro };
      });

      setUsuario(u);
      setFotoPerfil(u.foto_perfil ?? null);
      setEstatisticas({
        grupos: listaGrupos.length,
        participadas: listaParts.filter((p) => p.status_participacao === 'comparecimento_informado').length,
        interesse: listaParts.filter((p) => p.status_participacao === 'interessado').length,
      });
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      setProximaCampanha(
        cruzadas
<<<<<<< HEAD
          .filter((p) => p.status_participacao === 'pretende_ir' && new Date(p.data_prevista) > new Date())
=======
          .filter((p) => p.status_participacao === 'pretende_ir' && p.data_prevista &&
            new Date(`${String(p.data_prevista).slice(0, 10)}T00:00:00`) >= hoje)
>>>>>>> 6af48690620e19056571256973665b83dce1f097
          .sort((a, b) => new Date(a.data_prevista) - new Date(b.data_prevista))[0] || null
      );
      setHistorico(cruzadas);
    } catch (e) {
      if (ativo) setErro(true);
    } finally {
      if (ativo) setCarregando(false);
    }
  }

  carregar();
  return () => { ativo = false; };
}, [atualizacao]);

  function fecharCampanha() {
    setCampanhaAberta(null);
    setAtualizacao((valor) => valor + 1);
  }

  async function enviarFoto(foto) {
    const token = sessionStorage.getItem('token');

    setSalvandoFoto(true);
    setErroFoto('');

    try {
      await api.put(
        '/api/usuarios/foto',
        { foto },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFotoPerfil(foto);
    } catch (e) {
      setErroFoto(e.response?.data?.erro || 'Não foi possível salvar a foto.');
    } finally {
      setSalvandoFoto(false);
    }
  }

  async function aoEscolherFoto(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';

    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      setErroFoto('Selecione um arquivo de imagem.');
      return;
    }

    setErroFoto('');

    try {
      const foto = await redimensionarFoto(arquivo);
      await enviarFoto(foto);
    } catch {
      setErroFoto('Não foi possível processar essa imagem.');
    }
  }

    if (carregando) return <p>Carregando perfil...</p>;
    if (!sessionStorage.getItem('token')) return <p>Faça login para ver seu perfil.</p>;
    if (erro || !usuario) return <p role="alert">Não foi possível carregar o perfil.</p>;
    if (usuario.tipo_usuario === 'instituicao') return <PainelInstitucional />;
  return (

    <div className="pagina-user">

      <LogoSlogan />
      {campanhaAberta && <ModalCampanha campanha={campanhaAberta} aoFechar={fecharCampanha} />}

      <div className="busca-perfil"><BuscaGlobal /></div>

      <section className="user">

        <div className="informacoes-usuario">
          <div className="titulo-informacoes-usuario">
            <h3>Suas informações</h3>
          </div>

          <div className="conteudo-informacoes-usuario">
            <div className="coluna-foto">
              <button
                type="button"
                className="botao-foto"
                title="Alterar foto"
                aria-label="Alterar foto"
                disabled={salvandoFoto}
                onClick={() => fotoInputRef.current?.click()}
              >
                <img
                  className="foto-usuario"
                  src={fotoPerfil || AVATAR_PADRAO}
                  alt="Foto do usuário"
                />
              </button>

              <input
                ref={fotoInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={aoEscolherFoto}
              />

              {fotoPerfil && !salvandoFoto && (
                <button type="button" className="botao-remover-foto" onClick={() => enviarFoto(null)}>
                  Remover foto
                </button>
              )}

              {salvandoFoto && <span className="status-foto">Salvando...</span>}
              {erroFoto && <span className="erro-foto" role="alert">{erroFoto}</span>}
            </div>

            <div className="coluna-user-1">
              <p>{usuario.nome}</p>
              <p>{usuario.email}</p>
              <p>{usuario.cidade}</p>
              <p>Tipo Sanguíneo: {usuario.tipo_sanguineo}</p>
            </div>

            <div className="coluna-user-2">
              <p>Ingressou em: {formatarData(usuario.data_cadastro)}</p>
              <p>{usuario.tipo_usuario} <img src="/assets/icons/mini-gota-sangue.webp" alt="" /></p>
            </div>
          </div>
        </div>

        <div className="grupos-comunidades">
          <div className="titulo-grupos-comunidades">
            <h3>Grupos e comunidades</h3>
          </div>

          <div className="conteudo-grupos-comunidades">
            <div className="estatistica">
              <div className="valor-estatistica">
                <img src="/assets/icons/grupos-vermelho.webp" alt="" />
                <span>{estatisticas.grupos}</span>
              </div>
              <p>Grupos</p>
            </div>

            <div className="estatistica">
              <div className="valor-estatistica">
                <img src="/assets/icons/check-vermelho.png" alt="" />
                <span>{estatisticas.participadas}</span>
              </div>
              <p>Campanhas participadas</p>
            </div>

            <div className="estatistica">
              <div className="valor-estatistica">
                <img src="/assets/icons/coracao-vermelho.png" alt="" />
                <span>{estatisticas.interesse}</span>
              </div>
              <p>Campanhas de interesse</p>
            </div>
          </div>
        </div>

        <div className="proxima-campanha">
          <div className="titulo-proxima-campanha">
            <h3>Próxima campanha</h3>
          </div>

          <div className="conteudo-proxima-campanha">
            {proximaCampanha ? (
              <>
                <div className="informacoes-proxima-campanha">
                  <div className="data-proxima-campanha">
                    <h2>{formatarData(proximaCampanha.data_prevista)}</h2>
                  </div>

                  <div className="informacoes-encontro-proxima-campanha">
                    <h2>{proximaCampanha.nome_campanha}</h2>
                    <p>{proximaCampanha.nome_hemo}</p>
                    <p>{proximaCampanha.horario_inicio} - {proximaCampanha.cidade}</p>
                  </div>

                  <div className="confirmacao">
                    <h2>{STATUS[proximaCampanha.status_participacao]?.texto}</h2>
                  </div>
                </div>

                <div className="acessar-proxima-campanha">
                  <button type="button" onClick={() => setCampanhaAberta(proximaCampanha)}>Ver detalhes da campanha</button>
                </div>
              </>
            ) : (
              <p>Você não tem nenhuma campanha planejada</p>
            )}
          </div>
        </div>

        <div className="historico-campanhas">
          <div className="titulo-historico-campanhas">
            <h3>Histórico de campanhas</h3>
          </div>

          <div className="conteudo-historico-campanhas">
            {historico.length > 0 ? (
              <ul>
                {historico.map((h) => (
                  <li className="informacoes-historico-campanhas" key={h.id_registro}>
                    <p>
                      {h.nome_campanha} — {h.nome_hemo} •{' '}
                      {h.status_participacao === 'comparecimento_informado' ? 'Realizada em' : 'Interesse em'}{' '}
                      {formatarData(h.data)}
                    </p>
                    <span className={`status-historico ${STATUS[h.status_participacao]?.classe}`}>
                      {STATUS[h.status_participacao]?.texto}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Você ainda não tem histórico de campanhas</p>
            )}
          </div>
        </div>

      </section>

      <div className="area-excluir">
        <button type="button" className="botao-excluir-conta" onClick={() => setConfirmandoExclusao(true)}>
          Excluir conta
        </button>
      </div>

      {confirmandoExclusao && (
        <div className="excluir-fundo" onClick={() => { if (!excluindo) setConfirmandoExclusao(false); }}>
          <div
            className="excluir-caixa"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-excluir-conta"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-excluir-conta">Excluir sua conta?</h2>
            <p>Essa ação é permanente e não pode ser desfeita.</p>

            {erroExclusao && <p role="alert" className="erro-excluir">{erroExclusao}</p>}

            <div className="excluir-acoes">
              <button type="button" disabled={excluindo} onClick={() => setConfirmandoExclusao(false)}>
                Cancelar
              </button>
              <button type="button" className="confirmar-excluir" disabled={excluindo} onClick={excluirConta}>
                {excluindo ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
