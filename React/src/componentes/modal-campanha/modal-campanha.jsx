import './modal-campanha.scss';

function formatarData(data) {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatarHora(hora) {
  return hora ? hora.slice(0, 5) : '';
}

export default function ModalCampanha({ campanha, aoFechar }) {
  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div className="modal-caixa" onClick={(e) => e.stopPropagation()}>

        <div className="modal-topo">
          <button type="button" onClick={aoFechar}>Voltar para o Feed</button>
          <button type="button" aria-label="Fechar" onClick={aoFechar}>✕</button>
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

        <div className="modal-acoes">
          <button type="button">
            Participar com meu grupo
            <img src="/assets/icons/pessoas.webp" alt="" />
          </button>
          <button type="button">
            Tenho interesse
            <img src="/assets/icons/coracao-vermelho.png" alt="" />
          </button>
        </div>

      </div>
    </div>
  );
}