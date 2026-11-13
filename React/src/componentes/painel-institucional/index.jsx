import { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import LogoSlogan from '../logo-slogan/logo-slogan';
import FormularioCampanha from './formulario-campanha';
import BuscaGlobal from '../busca-global';
import Notificacao from '../notificacao';
import './index.scss';

const autorizacao = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
const camposInstituicao = [
  ['nome_hemo', 'Nome da instituição', 100], ['cep', 'CEP', 9],
  ['endereco', 'Endereço', 255], ['cidade', 'Cidade', 100],
  ['estado', 'Estado (UF)', 2], ['telefone_centro', 'Telefone', 20],
];

function CadastroInstituicao({ aoSalvar }) {
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const enviando = useRef(false);
  async function salvar(evento) {
    evento.preventDefault();
    if (enviando.current) return;
    const dados = Object.fromEntries(new FormData(evento.currentTarget));
    dados.estado = dados.estado.toUpperCase();
    enviando.current = true;
    setSalvando(true);
    setErro('');
    try {
      await api.post('/api/instituicoes', dados, autorizacao());
      aoSalvar('Instituição cadastrada. Agora você pode criar campanhas.');
    } catch (e) {
      setErro(e.response?.data?.erro || 'Não foi possível confirmar o cadastro. Atualize o painel antes de tentar novamente.');
    } finally {
      enviando.current = false;
      setSalvando(false);
    }
  }
  return <form onSubmit={salvar}>
    <h2>Cadastre sua instituição</h2>
    <p>Informe os dados do local onde suas campanhas serão realizadas.</p>
    <fieldset disabled={salvando}>
      {camposInstituicao.map(([nome, rotulo, limite]) => <label key={nome}>{rotulo}
        <input name={nome} required maxLength={limite} type={nome === 'telefone_centro' ? 'tel' : 'text'}
          pattern={nome === 'cep' ? '[0-9]{5}-?[0-9]{3}' : undefined} />
      </label>)}
      <button type="submit">{salvando ? 'Salvando...' : 'Salvar instituição'}</button>
    </fieldset>
    {erro && <p role="alert">{erro}</p>}
  </form>;
}

export default function PainelInstitucional() {
  const [dados, setDados] = useState(null);
  const [campanhas, setCampanhas] = useState([]);
  const [adesaoPorCampanha, setAdesaoPorCampanha] = useState({});
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);
  const [criando, setCriando] = useState(false);
  const [mostrarCampanhas, setMostrarCampanhas] = useState(false);
  const [mensagem, setMensagem] = useState('');
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
        if (ativo) { setDados(resposta); setCampanhas(lista); setAdesaoPorCampanha(indicadores); }
      } catch (e) {
        if (ativo) setErro('Não foi possível atualizar o painel. Tente novamente.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [versao]);

  function atualizado(texto) {
    setMensagem(texto);
    setCriando(false);
    setMostrarCampanhas(true);
    setVersao(valor => valor + 1);
  }
  return <main className="painel-institucional">
    <LogoSlogan />
    <section className="painel-conteudo">
      <div className="busca-painel-institucional"><BuscaGlobal /></div>
      <h1>Painel institucional</h1>
      <Notificacao mensagem={mensagem} aoFechar={setMensagem} />
      {carregando ? <p role="status">Carregando painel...</p> : erro ? <>
        <p role="alert">{erro}</p><button onClick={() => setVersao(valor => valor + 1)}>Tentar novamente</button>
      </> : !dados?.instituicao ? <>
        <CadastroInstituicao aoSalvar={atualizado} />
        <div className="acoes-cadastro-institucional">
          <button type="button" onClick={() => setVersao(valor => valor + 1)}>Atualizar painel</button>
        </div>
      </> : <>
        <h2>{dados.instituicao.nome_hemo}</h2>
        <p>{dados.instituicao.endereco} · {dados.instituicao.cidade} / {dados.instituicao.estado}</p>
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
        {criando && <FormularioCampanha instituicao={dados.instituicao} aoCancelar={() => setCriando(false)}
          aoSalvar={() => atualizado('Campanha criada com sucesso.')} />}
        {mostrarCampanhas && <section id="minhas-campanhas">
          <h2>Minhas campanhas</h2>
          {campanhas.length === 0 ? <p>Nenhuma campanha cadastrada.</p> : <ul className="lista-campanhas">
            {campanhas.map(campanha => <li key={campanha.id_campanha}>
              <h3>{campanha.nome_campanha}</h3><p>{campanha.descricao}</p>
              <p>{String(campanha.data_inicio).slice(0, 10).split('-').reverse().join('/')} a {String(campanha.data_fim).slice(0, 10).split('-').reverse().join('/')}</p>
              <p>{campanha.horario_inicio || 'Início não informado'} — {campanha.horario_fim || 'Término não informado'}</p>
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
    </section>
  </main>;
}
