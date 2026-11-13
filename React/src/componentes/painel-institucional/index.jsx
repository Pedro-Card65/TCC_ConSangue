import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import LogoSlogan from '../logo-slogan/logo-slogan';
import FormularioCampanha from './formulario-campanha';
import BuscaGlobal from '../busca-global';
import EditarDadosUsuario from '../editar-dados-usuario';
import Notificacao from '../notificacao';
import FotoCampanha, { FOTO_CAMPANHA_PADRAO } from './foto-campanha';
import EnderecoInstituicao, { combinarEnderecoFormulario } from '../localizacao-brasil/endereco';
import './index.scss';

const autorizacao = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
function FormularioInstituicao({ instituicao, aoSalvar, aoCancelar }) {
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const enviando = useRef(false);

  async function salvar(evento) {
    evento.preventDefault();
    if (enviando.current) return;
    const dadosBrutos = Object.fromEntries(new FormData(evento.currentTarget));
    const dados = combinarEnderecoFormulario(dadosBrutos);
    dados.estado = dados.estado.toUpperCase();

    enviando.current = true;
    setSalvando(true);
    setErro('');
    try {
      if (instituicao) {
        await api.put('/api/instituicoes/' + instituicao.id_hemocentro, dados, autorizacao());
        aoSalvar('Dados institucionais atualizados com sucesso.');
      } else {
        await api.post('/api/instituicoes', dados, autorizacao());
        aoSalvar('Instituição cadastrada. Agora você pode criar campanhas.');
      }
    } catch (e) {
      setErro(e.response?.data?.erro ||
        'Não foi possível salvar os dados. Confira o formulário e tente novamente.');
    } finally {
      enviando.current = false;
      setSalvando(false);
    }
  }

  return <form className="formulario-instituicao" onSubmit={salvar}>
    <h2>{instituicao ? 'Editar dados institucionais' : 'Cadastre sua instituição'}</h2>
    <p>Informe os dados oficiais do local. Ao inserir o CEP, o endereço será sugerido e poderá ser corrigido.</p>
    <fieldset disabled={salvando}>
      <label>Nome da instituição *
        <input name="nome_hemo" required maxLength={100} defaultValue={instituicao?.nome_hemo || ''} />
      </label>
      <EnderecoInstituicao key={instituicao?.id_hemocentro || 'novo'} instituicao={instituicao} />
      <label>Telefone *
        <input name="telefone_centro" type="tel" required maxLength={20}
          defaultValue={instituicao?.telefone_centro || ''} placeholder="(11) 99999-9999" />
      </label>
      {erro && <p role="alert">{erro}</p>}
      <div className="acoes">
        <button type="submit">{salvando ? 'Salvando...' : instituicao ? 'Salvar alterações' : 'Salvar instituição'}</button>
        {instituicao && <button className="botao-secundario" type="button"
          onClick={aoCancelar}>Cancelar</button>}
      </div>
    </fieldset>
  </form>;
}

function EditarFotoCampanha({ campanha, aoSalvar, aoCancelar }) {
  const [foto, setFoto] = useState(campanha.foto_campanha || null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const enviando = useRef(false);
  async function salvar(evento) {
    evento.preventDefault();
    if (enviando.current || processando) return;
    enviando.current = true;
    setSalvando(true);
    setErro('');
    try {
      await api.put(`/api/campanhas/${campanha.id_campanha}/foto`, { foto_campanha: foto }, autorizacao());
      aoSalvar('Foto da campanha atualizada.');
    } catch (e) {
      setErro(e.response?.data?.erro || 'Não foi possível salvar a foto. Tente novamente.');
    } finally {
      enviando.current = false;
      setSalvando(false);
    }
  }
  return <form onSubmit={salvar} aria-label={`Editar foto de ${campanha.nome_campanha}`}>
    <fieldset disabled={salvando}>
      <FotoCampanha foto={foto} aoAlterar={setFoto} aoProcessar={setProcessando} />
      {erro && <p role="alert">{erro}</p>}
      <div className="acoes">
        <button type="submit" disabled={processando}>{salvando ? 'Salvando...' : 'Salvar foto'}</button>
        <button type="button" onClick={aoCancelar} disabled={processando}>Cancelar</button>
      </div>
    </fieldset>
  </form>;
}

export default function PainelInstitucional() {
  const [parametros, setParametros] = useSearchParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [campanhas, setCampanhas] = useState([]);
  const [adesaoPorCampanha, setAdesaoPorCampanha] = useState({});
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);
  const [criando, setCriando] = useState(parametros.get('novaCampanha') === '1');
  const [mostrarCampanhas, setMostrarCampanhas] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [editandoFoto, setEditandoFoto] = useState(null);
  const [editandoDados, setEditandoDados] = useState(false);
  const [editandoConta, setEditandoConta] = useState(false);
  const [usuarioConta, setUsuarioConta] = useState(null);
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [textoConfirmacao, setTextoConfirmacao] = useState('');
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');
  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro('');
      try {
        const resposta = (await api.get('/api/instituicoes/me', autorizacao())).data;
        if (!resposta || !Object.prototype.hasOwnProperty.call(resposta, 'instituicao')) throw new Error('Resposta inválida');
        let lista = [];
        let indicadores = {};
        if (resposta.instituicao) {
          if (!resposta.estatisticas || ['campanhas', 'grupos', 'agendamentos'].some(campo =>
            !Number.isFinite(resposta.estatisticas[campo]) || resposta.estatisticas[campo] < 0)) throw new Error('Indicadores inválidos');
          lista = (await api.get(`/api/campanhas/hemocentro/${resposta.instituicao.id_hemocentro}`, autorizacao())).data.campanhas;
          if (!Array.isArray(lista)) throw new Error('Campanhas inválidas');
          try {
            const adesao = (await api.get('/api/instituicoes/me/adesao', autorizacao())).data.campanhas;
            if (Array.isArray(adesao)) indicadores = Object.fromEntries(adesao.map(item => [item.id_campanha, item]));
          } catch {
            // A listagem principal continua acessível se os indicadores não estiverem disponíveis.
          }
        }
        const conta = (await api.get('/api/usuarios/me', autorizacao())).data;
        if (ativo) {
          setDados(resposta);
          setCampanhas(lista);
          setAdesaoPorCampanha(indicadores);
          setUsuarioConta(conta);
        }
      } catch (e) {
        if (ativo) setErro('Não foi possível atualizar o painel. Tente novamente.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [versao]);

  useEffect(() => {
    if (!confirmandoExclusao || excluindo) return undefined;
    const fechar = evento => {
      if (evento.key === 'Escape') setConfirmandoExclusao(false);
    };
    window.addEventListener('keydown', fechar);
    return () => window.removeEventListener('keydown', fechar);
  }, [confirmandoExclusao, excluindo]);

  async function excluirContaInstitucional() {
    if (excluindo || textoConfirmacao !== 'EXCLUIR' || !senhaExclusao) return;
    setExcluindo(true);
    setErroExclusao('');
    try {
      await api.delete('/api/usuarios/me/conta-institucional', {
        ...autorizacao(),
        data: { senhaAtual: senhaExclusao, confirmacao: textoConfirmacao }
      });
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');
      setConfirmandoExclusao(false);
      navigate('/', { replace: true });
    } catch (e) {
      setErroExclusao(e.response?.status === 409
        ? 'Não foi possível excluir devido a vínculos no banco. Nenhum dado foi apagado.'
        : (e.response?.data?.erro || 'Não foi possível excluir a conta. Nenhum dado foi apagado.'));
    } finally {
      setExcluindo(false);
    }
  }

  function abrirExclusao() {
    setErroExclusao('');
    setSenhaExclusao('');
    setTextoConfirmacao('');
    setConfirmandoExclusao(true);
  }

  function fecharCriacao() {
    setCriando(false);
    if (parametros.has('novaCampanha')) {
      const novos = new URLSearchParams(parametros);
      novos.delete('novaCampanha');
      setParametros(novos, { replace: true });
    }
  }

  function atualizado(texto) {
    setMensagem(texto);
    setEditandoFoto(null);
    fecharCriacao();
    setMostrarCampanhas(true);
    setVersao(valor => valor + 1);
  }
  return <main className="painel-institucional">
    <header className="cabecalho-painel-institucional">
      <div className="logo-painel-institucional"><LogoSlogan /></div>
      <div className="busca-painel-institucional"><BuscaGlobal /></div>
      <div className="espaco-painel-institucional" aria-hidden="true" />
    </header>
    <section className="painel-conteudo">
      <h1>Painel institucional</h1>
      <Notificacao mensagem={mensagem} aoFechar={setMensagem} />
      {carregando ? <p role="status">Carregando painel...</p> : erro ? <>
        <p role="alert">{erro}</p><button onClick={() => setVersao(valor => valor + 1)}>Tentar novamente</button>
      </> : !dados?.instituicao ? <>
        <FormularioInstituicao aoSalvar={atualizado} />
        <div className="acoes-cadastro-institucional">
          <button type="button" onClick={() => setVersao(valor => valor + 1)}>Atualizar painel</button>
          <button type="button" className="botao-perigo" onClick={abrirExclusao}>
            Excluir minha conta institucional
          </button>
        </div>
      </> : <>
        <h2>{dados.instituicao.nome_hemo}</h2>
        <p>{dados.instituicao.endereco} · {dados.instituicao.cidade} / {dados.instituicao.estado}</p>
        <div className="acoes acoes-dados-institucionais">
          <button type="button" onClick={() => setEditandoDados(valor => !valor)}>
            {editandoDados ? 'Fechar edição' : 'Editar dados institucionais'}
          </button>
          <button type="button" className="botao-perigo" onClick={abrirExclusao}>
            Excluir minha conta institucional
          </button>
        </div>
        {editandoDados && <FormularioInstituicao key={dados.instituicao.id_hemocentro}
          instituicao={dados.instituicao}
          aoSalvar={texto => { setEditandoDados(false); atualizado(texto); }}
          aoCancelar={() => setEditandoDados(false)} />}
        <dl className="indicadores">
          <div><dt>Agendamentos informados</dt><dd>{dados.estatisticas.agendamentos}</dd></div>
          <div><dt>Grupos vinculados</dt><dd>{dados.estatisticas.grupos}</dd></div>
          <div><dt>Campanhas</dt><dd>{dados.estatisticas.campanhas}</dd></div>
        </dl>
        <p className="ajuda">Agendamentos são intenções de comparecimento, inclusive de datas passadas. Grupos são contados uma vez, mesmo vinculados a várias campanhas.</p>
        {!criando && <div className="acoes">
          <button onClick={() => { setMensagem(''); setCriando(true); }}>Criar nova campanha</button>
          <button aria-expanded={mostrarCampanhas} aria-controls="minhas-campanhas" onClick={() => setMostrarCampanhas(valor => !valor)}>Ver minhas campanhas</button>
        </div>}
        {criando && <FormularioCampanha instituicao={dados.instituicao} aoCancelar={fecharCriacao}
          aoSalvar={() => atualizado('Campanha criada com sucesso.')} />}
        {mostrarCampanhas && <section id="minhas-campanhas">
          <h2>Minhas campanhas</h2>
          {campanhas.length === 0 ? <p>Nenhuma campanha cadastrada.</p> : <ul className="lista-campanhas">
            {campanhas.map(campanha => <li key={campanha.id_campanha}>
              <img className="foto-campanha-previa" src={campanha.foto_campanha || FOTO_CAMPANHA_PADRAO} alt={`Foto da campanha ${campanha.nome_campanha}`} />
              <h3>{campanha.nome_campanha}</h3><p>{campanha.descricao}</p>
              <p>{String(campanha.data_inicio).slice(0, 10).split('-').reverse().join('/')} a {String(campanha.data_fim).slice(0, 10).split('-').reverse().join('/')}</p>
              <p>{campanha.horario_inicio || 'Início não informado'} — {campanha.horario_fim || 'Término não informado'}</p>
              {editandoFoto === campanha.id_campanha
                ? <EditarFotoCampanha campanha={campanha} aoSalvar={atualizado} aoCancelar={() => setEditandoFoto(null)} />
                : <button type="button" onClick={() => setEditandoFoto(campanha.id_campanha)}>Alterar foto</button>}
              <p>Status: {campanha.status_campanha === 'ativa' ? 'Ativa' : 'Encerrada'}</p>
              {adesaoPorCampanha[campanha.id_campanha] && <div className="adesao-campanha">
                <span><strong>{adesaoPorCampanha[campanha.id_campanha].interessados}</strong> Interessados</span>
                <span><strong>{adesaoPorCampanha[campanha.id_campanha].pretendem_ir}</strong> Pretendem ir</span>
                <span><strong>{adesaoPorCampanha[campanha.id_campanha].comparecimentos_informados}</strong> Comparecimentos informados</span>
                <span><strong>{adesaoPorCampanha[campanha.id_campanha].grupos_vinculados}</strong> Grupos vinculados</span>
              </div>}
            </li>)}
          </ul>}
        </section>}
      </>}
      {!carregando && !erro && usuarioConta && (
        <section className="secao-dados-conta-institucional">
          <h2>Dados da conta</h2>
          <p>{usuarioConta.nome} · {usuarioConta.email}</p>
          <button type="button" onClick={() => setEditandoConta(valor => !valor)}>
            {editandoConta ? 'Fechar edição da conta' : 'Editar meus dados de usuário'}
          </button>
          {editandoConta && <EditarDadosUsuario key={usuarioConta.id_usuario}
            usuario={usuarioConta}
            aoSalvar={atualizado => {
              setUsuarioConta(atualizado);
              setEditandoConta(false);
              setMensagem('Dados da conta atualizados com sucesso.');
            }}
            aoCancelar={() => setEditandoConta(false)} />}
        </section>
      )}
    </section>
    {confirmandoExclusao && <div className="confirmacao-fundo" role="presentation"
      onMouseDown={evento => { if (evento.target === evento.currentTarget && !excluindo) setConfirmandoExclusao(false); }}>
      <div className="confirmacao-caixa" role="dialog" aria-modal="true"
        aria-labelledby="titulo-excluir-conta-institucional"
        aria-describedby="aviso-excluir-conta-institucional">
        <h2 id="titulo-excluir-conta-institucional">Excluir toda a conta institucional?</h2>
        <p id="aviso-excluir-conta-institucional">
          Essa ação é permanente e irreversível. Seu acesso ao ConSangue, os dados
          da instituição, suas campanhas, os grupos que sua conta criou e as
          participações vinculadas a essas campanhas serão apagados. As contas
          de outros usuários não serão excluídas, mas seus registros de
          participação nessas campanhas deixarão de existir.
        </p>
        <p>Para confirmar, digite <strong>EXCLUIR</strong> e informe sua senha atual.</p>
        <label>Confirmação
          <input value={textoConfirmacao} autoComplete="off" maxLength={7}
            onChange={evento => setTextoConfirmacao(evento.target.value.toUpperCase())}
            placeholder="EXCLUIR" disabled={excluindo} />
        </label>
        <label>Senha atual
          <input type="password" autoComplete="current-password" value={senhaExclusao}
            onChange={evento => setSenhaExclusao(evento.target.value)} disabled={excluindo} />
        </label>
        {erroExclusao && <p role="alert">{erroExclusao}</p>}
        <div className="acoes">
          <button type="button" className="botao-secundario" disabled={excluindo}
            onClick={() => setConfirmandoExclusao(false)}>Cancelar</button>
          <button type="button" className="botao-perigo"
            disabled={excluindo || textoConfirmacao !== 'EXCLUIR' || !senhaExclusao}
            onClick={excluirContaInstitucional}>
            {excluindo ? 'Excluindo...' : 'Excluir conta permanentemente'}
          </button>
        </div>
      </div>
    </div>}
  </main>;
}
