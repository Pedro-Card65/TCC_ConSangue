import './lateral-informacoes.scss';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import LogoSlogan from '../logo-slogan/logo-slogan';

function dataISO(valor) {
  return valor ? String(valor).slice(0, 10) : '';
}

function formatarData(valor) {
  const data = dataISO(valor);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return 'Data a definir';

  const [ano, mes, dia] = data.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(ano, mes - 1, dia)));
}

function formatarHorario(horario) {
  return horario
    ? String(horario).slice(0, 5).replace(':', 'h')
    : 'Horário a definir';
}

function dataLocalHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function abreviarNome(nome = '') {
  const partes = String(nome).trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'Usuário';
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1]}`;
}

export default function InformacoesLaterais() {
  const [usuario, setUsuario] = useState(null);
  const [campanhas, setCampanhas] = useState([]);
  const [grupoRecente, setGrupoRecente] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function buscarDadosLaterais() {
      const token = sessionStorage.getItem('token');

      if (!token) {
        if (ativo) {
          setErro('Faça login para visualizar suas informações.');
          setCarregando(false);
        }
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      try {
        // Nome, cidade e tipo sanguíneo vêm do usuário autenticado.
        const respostaUsuario = await api.get('/api/usuarios/me', config);
        const usuarioLogado = respostaUsuario.data;

        if (ativo) setUsuario(usuarioLogado);

        const ehCandidato = usuarioLogado.tipo_usuario === 'candidato';

        const [respGrupos, respParticipacoes, respCampanhas] = await Promise.all([
          api.get(`/api/grupos/usuario/${usuarioLogado.id_usuario}`, config),
          ehCandidato
            ? api.get('/api/participacoes', config)
            : Promise.resolve({ data: [] }),
          ehCandidato
            ? api.get('/api/campanhas')
            : Promise.resolve({ data: { campanhas: [] } })
        ]);

        const grupos = respGrupos.data.grupos ?? [];
        const participacoes = respParticipacoes.data ?? [];
        const todasCampanhas = respCampanhas.data.campanhas ?? [];

        const campanhasPorId = new Map(
          todasCampanhas.map(campanha => [Number(campanha.id_campanha), campanha])
        );

        const hoje = dataLocalHoje();
        const planejadas = participacoes
          .filter(participacao => {
            const campanha = campanhasPorId.get(Number(participacao.id_campanha));
            const data = dataISO(participacao.data_prevista);

            return (
              participacao.status_participacao === 'pretende_ir' &&
              campanha?.status_campanha === 'ativa' &&
              (!data || data >= hoje)
            );
          })
          .sort((a, b) => {
            const dataA = dataISO(a.data_prevista) || '9999-12-31';
            const dataB = dataISO(b.data_prevista) || '9999-12-31';
            return dataA.localeCompare(dataB);
          })
          .map(participacao => ({
            id_registro: participacao.id_registro,
            nome_campanha: campanhasPorId.get(Number(participacao.id_campanha)).nome_campanha,
            data_prevista: participacao.data_prevista,
            horario_previsto: participacao.horario_previsto
          }));

        if (ativo) {
          setCampanhas(planejadas);
          
          setGrupoRecente(grupos[0] ?? null);
        }
      } catch (error) {
        if (ativo) {
          setErro(error.response?.data?.erro || 'Não foi possível carregar todos os dados da lateral.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    buscarDadosLaterais();
    return () => { ativo = false; };
  }, []);

  return (
    <section className="informacoes-laterais">
      <LogoSlogan />

      <div className="cartao" aria-busy={carregando}>
        <div className="foto-nome-user">
          <div className="foto-perfil-reservada">
            <img src={usuario?.foto_perfil || '/assets/icons/perfil-vermelho.webp'} alt="" />
          </div>
          <h3>{usuario ? abreviarNome(usuario.nome) : 'Usuário'}</h3>
        </div>

        {carregando && <p className="aviso-lateral">Carregando informações...</p>}
        {erro && <p className="aviso-lateral erro-lateral" role="alert">{erro}</p>}

        {usuario && (
          <div className="suas-informacoes">
            <div className="cabecalho-informacoes">
              <h3>Suas informações</h3>
            </div>
            <div className="dados-usuario">
              <p>{usuario.nome || 'Nome não informado'}</p>
              <p>Cidade: {usuario.cidade || 'Não informada'}</p>
              <p>Tipo Sanguíneo: {usuario.tipo_sanguineo || 'Não informado'}</p>
            </div>
          </div>
        )}

        {!carregando && usuario && (
          <>
            <div className="secao-lateral participacoes-planejadas">
              <div className="cabecalho-secao">
                <img src="/assets/icons/campanhas-vermelho.webp" alt="" />
                <h3>Campanhas a participar</h3>
                <span className="contador-campanhas">{campanhas.length}</span>
              </div>

              {campanhas.length > 0 ? (
                <ul className="lista-campanhas">
                  {campanhas.map(campanha => (
                    <li key={campanha.id_registro}>
                      <strong>{campanha.nome_campanha}</strong>
                      <span>{formatarData(campanha.data_prevista)}</span>
                      <span>{formatarHorario(campanha.horario_previsto)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="estado-vazio">Nenhuma campanha planejada.</p>
              )}
            </div>

            <div className="secao-lateral grupo-atual">
              <div className="cabecalho-secao">
                <img src="/assets/icons/grupos-vermelho.webp" alt="" />
                <h3>Meu grupo mais recente</h3>
              </div>

              {grupoRecente ? (
                <div className="grupo-conteudo">
                  <strong>{grupoRecente.nome_grupo}</strong>
                  <span>Entrada: {formatarData(grupoRecente.data_entrada)}</span>
                  <span>{grupoRecente.papel === 'administrador' ? 'Administrador' : 'Membro'}</span>
                </div>
              ) : (
                <p className="estado-vazio">Você ainda não participa de um grupo.</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
