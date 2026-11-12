import React, { useEffect, useState } from 'react';
import './index.scss';
import { api } from '../../services/api.js';

const STATUS = {
  comparecimento_informado: 'Presença informada',
  interessado: 'Interesse registrado',
  pretende_ir: 'Pretende ir',
};

function formatarData(data) {
  if (!data) return 'Data não informada';
  const iso = String(data).slice(0, 10);
  const valor = /^\d{4}-\d{2}-\d{2}$/.test(iso)
    ? new Date(`${iso}T00:00:00`)
    : new Date(data);
  return Number.isNaN(valor.getTime()) ? 'Data não informada' : valor.toLocaleDateString('pt-BR');
}

function dataISO(valor) {
  return valor ? String(valor).slice(0, 10) : '';
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
  const [vinculos, setVinculos] = useState([]);
  const [erroAcao, setErroAcao] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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
        let listaVinculos = [];
        try {
          const resVinculos = await api.get('/api/gruposCampanhas');
          listaVinculos = normalizarLista(resVinculos, 'grupos');
        } catch {
          // Sem os vínculos, o histórico continua disponível, apenas sem o nome do grupo.
        }
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
        setVinculos(listaVinculos);
      } catch (erroRequisicao) {
        if (ativo) {
          setErro(erroRequisicao?.response?.status === 403
            ? 'Esta página é só para candidatos.'
            : 'Não foi possível carregar suas participações. Tente novamente mais tarde.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; };
  }, []);

  const campanhasPorId = new Map(campanhas.map(c => [String(c.id_campanha), c]));
  const gruposPorId = new Map(grupos.map(g => [String(g.id_grupo), g]));
  const vinculosPorId = new Map(vinculos.map(v => [String(v.id_grupo_campanha), v]));

  const registros = participacoes.map(participacao => {
    const campanha = campanhasPorId.get(String(participacao.id_campanha)) ?? {};
    const vinculo = participacao.id_grupo_campanha != null
      ? vinculosPorId.get(String(participacao.id_grupo_campanha))
      : null;
    const grupo = vinculo ? gruposPorId.get(String(vinculo.id_grupo)) : null;
    return {
      ...campanha,
      ...participacao,
      nomeGrupo: grupo?.nome_grupo ?? '',
      dataCampanha: dataISO(campanha.data_inicio),
      fimCampanha: dataISO(campanha.data_fim)
    };
  });

  const hoje = new Date();
  const hojeISO = [hoje.getFullYear(), String(hoje.getMonth() + 1).padStart(2, '0'), String(hoje.getDate()).padStart(2, '0')].join('-');
  // Um interesse também pode ser a próxima oportunidade; não equivale a presença agendada.
  const proximas = registros
    .filter(item => ['interessado', 'pretende_ir'].includes(item.status_participacao)
      && item.status_campanha === 'ativa'
      && (item.fimCampanha || dataISO(item.data_prevista)) >= hojeISO)
    .map(item => ({
      ...item,
      dataOrdenacao: (dataISO(item.data_prevista) && dataISO(item.data_prevista) >= hojeISO)
        ? dataISO(item.data_prevista)
        : (item.dataCampanha > hojeISO ? item.dataCampanha : hojeISO)
    }))
    .sort((a, b) => a.dataOrdenacao.localeCompare(b.dataOrdenacao));
  const proxima = proximas[0];
  const outrasProximas = proximas.slice(1);
  const idsFuturos = new Set(proximas.map(item => String(item.id_registro)));
  const dataDoRegistro = item => dataISO(item.data_prevista) || item.dataCampanha || item.fimCampanha || '';
  const historico = registros
    .filter(item => !idsFuturos.has(String(item.id_registro)))
    .sort((a, b) => dataDoRegistro(b).localeCompare(dataDoRegistro(a)));

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
        {item.data_prevista
          ? <p>Data planejada: {formatarData(item.data_prevista)}{item.horario_previsto ? ` • ${String(item.horario_previsto).slice(0, 5)}` : ''}</p>
          : <p>Período da campanha: {formatarData(item.dataCampanha)}{item.fimCampanha ? ` a ${formatarData(item.fimCampanha)}` : ''}</p>}
        {item.nomeGrupo && <p>Grupo: {item.nomeGrupo}</p>}
        <div className="partBaixo">
          <p>Status: {STATUS[item.status_participacao] ?? 'Status não informado'}</p>
          {item.status_participacao !== 'comparecimento_informado' && (
            <button type="button" onClick={async () => {
              const token = sessionStorage.getItem('token') || localStorage.getItem('token');
              setErroAcao('');
              try {
                await api.delete(`/api/participacoes/${item.id_registro}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setParticipacoes((atuais) => atuais.filter((registro) => registro.id_registro !== item.id_registro));
              } catch {
                setErroAcao('Não foi possível remover esta participação.');
              }
            }}>{item.status_participacao === 'interessado' ? 'Remover interesse' : 'Cancelar intenção de participação'}</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-participacaoHistorico">
      <h1>PARTICIPAÇÕES</h1>
      <div className="bloco-participacoes">
        {erroAcao && <p role="alert">{erroAcao}</p>}
        {carregando ? <p>Carregando participações...</p> : erro ? <p role="alert">{erro}</p> : (
          <>
            <h2>{proxima?.status_participacao === 'interessado'
              ? 'Próxima campanha de interesse' : 'Próxima participação planejada'}</h2>
            {proxima ? cartao(proxima) : <p>Você ainda não registrou interesse em campanhas futuras.</p>}
            {outrasProximas.length > 0 && (
              <>
                <h2>Outras campanhas de interesse</h2>
                <div className="historico">{outrasProximas.map(cartao)}</div>
              </>
            )}
            <h2>Histórico</h2>
            <div className="historico">
              {historico.length ? historico.map(cartao) : <p>Você ainda não tem histórico de participações.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
