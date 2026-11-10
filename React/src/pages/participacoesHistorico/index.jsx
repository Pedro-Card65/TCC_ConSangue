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

  let nomeCampanha = []
  let nomeHospital = [];
  let endereco = [];
  let data = [];
  let grupo = [];
  let status = [];

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
              {historico.length ? historico.map(cartao) : <p>Você ainda não tem histórico de participações.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
