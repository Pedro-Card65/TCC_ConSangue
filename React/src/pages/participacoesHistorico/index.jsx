import React, { useEffect, useState } from 'react';
import './index.scss';
import { api } from '../../services/api.js';

const STATUS = {
  comparecimento_informado: 'Realizada',
  interessado: 'Tenho interesse',
  pretende_ir: 'Agendada',
};

function formatarData(data) {
  if (!data) return 'Data não informada';
  const valor = typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)
    ? new Date(`${data}T00:00:00`)
    : new Date(data);
  return Number.isNaN(valor.getTime()) ? 'Data não informada' : valor.toLocaleDateString('pt-BR');
}

function normalizarLista(resposta, chave) {
  const dados = resposta?.data;
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.[chave])) return dados[chave];
  return [];
}

export default function ParticipacoesHistorico() {
  const [participacoes, setParticipacoes] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setErro('Faça login para consultar suas participações.');
        setCarregando(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [resParticipacoes, resCampanhas, resUsuario] = await Promise.all([
          api.get('/api/participacoes', config),
          api.get('/api/campanhas'),
          api.get('/api/usuarios/me', config),
        ]);
        const listaParticipacoes = normalizarLista(resParticipacoes, 'participacoes');
        const listaCampanhas = normalizarLista(resCampanhas, 'campanhas');
        const usuario = resUsuario.data?.usuario ?? resUsuario.data;
        let listaGrupos = [];

        if (usuario?.id_usuario != null) {
          try {
            const resGrupos = await api.get(`/api/grupos/usuario/${usuario.id_usuario}`, config);
            listaGrupos = normalizarLista(resGrupos, 'grupos');
          } catch {
            // O histórico continua disponível mesmo se a consulta de grupos falhar.
          }
        }

        if (!ativo) return;
        setParticipacoes(listaParticipacoes);
        setCampanhas(listaCampanhas);
        setGrupos(listaGrupos);
      } catch {
        if (ativo) setErro('Não foi possível carregar suas participações. Tente novamente mais tarde.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; };
  }, []);

  const campanhasPorId = new Map(campanhas.map((campanha) => [String(campanha.id_campanha), campanha]));
  const gruposPorId = new Map(grupos.map((grupo) => [String(grupo.id_grupo), grupo]));
  const registros = participacoes.map((participacao) => {
    const campanha = campanhasPorId.get(String(participacao.id_campanha)) ?? {};
    const vinculo = campanha.id_grupo_campanha != null
      ? grupos.find((grupo) => String(grupo.id_grupo_campanha) === String(campanha.id_grupo_campanha))
      : null;
    const grupo = vinculo
      ? gruposPorId.get(String(vinculo.id_grupo))
      : gruposPorId.get(String(participacao.id_grupo));
    return { ...participacao, ...campanha, nomeGrupo: grupo?.nome_grupo ?? grupo?.nome ?? '' };
  });

  const agora = new Date();
  const proximas = registros
    .filter((item) => item.status_participacao === 'pretende_ir' && item.data_prevista && new Date(`${String(item.data_prevista).slice(0, 10)}T00:00:00`) >= new Date(agora.toDateString()))
    .sort((a, b) => new Date(a.data_prevista) - new Date(b.data_prevista));
  const proxima = proximas[0];
  const historico = registros.filter((item) => item !== proxima);

  function nomeHospital(item) {
    return item.nome_hemo ?? item.nome_instituicao ?? item.nome_hospital ?? 'Instituição não informada';
  }

  function enderecoHospital(item) {
    const local = [item.endereco, item.numero].filter(Boolean).join(', ');
    return [local, [item.cidade, item.estado].filter(Boolean).join(' - ')].filter(Boolean).join(' • ');
  }

  function cartao(item) {
    return (
      <div className="participacoes" key={item.id_registro}>
        <h2>{item.nome_campanha ?? 'Campanha sem nome'} - {nomeHospital(item)}</h2>
        {enderecoHospital(item) && <p>{enderecoHospital(item)}</p>}
        <p>{formatarData(item.data_prevista)}{item.horario_previsto ? ` • ${String(item.horario_previsto).slice(0, 5)}` : ''}</p>
        {item.nomeGrupo && <p>Grupo: {item.nomeGrupo}</p>}
        <div className="partBaixo">
          <p>Status: {STATUS[item.status_participacao] ?? item.status_participacao ?? 'Não informado'}</p>
          {item.status_participacao !== 'comparecimento_informado' && (
            <button type="button" onClick={async () => {
              const token = sessionStorage.getItem('token');
              try {
                await api.delete(`/api/participacoes/${item.id_registro}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setParticipacoes((atuais) => atuais.filter((registro) => registro.id_registro !== item.id_registro));
              } catch {
                setErro('Não foi possível cancelar esta participação.');
              }
            }}>Cancelar presença</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-participacaoHistorico">
      <h1>PARTICIPAÇÕES</h1>
      <div className="bloco-participacoes">
        {carregando ? <p>Carregando participações...</p> : erro ? <p role="alert">{erro}</p> : (
          <>
            <h1>Próxima participação</h1>
            {proxima ? cartao(proxima) : <p>Você não tem participações agendadas.</p>}
            <h1>Histórico</h1>
            <div className="historico">
              {historico.length ? historico.map(cartao) : <p>Participe para consultar suas participações.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}