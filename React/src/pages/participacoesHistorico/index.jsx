import './index.scss';


export default function ParticipacoesHistorico() {

  /* let nomeCampanha = []
  let nomeHospital = [];
  let endereco = [];
  let data = [];
  let grupo = [];
  let status = []; */

  return (
    <div className="pagina-participacaoHistorico">

      <h1> PARTICIPAÇÕES </h1>

      <div className='bloco-participacoes'>

        <h1>Próxima participação</h1>
        <div className="participacoes">
          <h2>Compania Mais Amor - Hospital Abidas</h2>
          <p>Praça da Luz, 500 • São Paulo, SP</p>
          <p>22 de Novembro de 2026 </p>
          <p>Grupo: Amigos do Sangue</p>

          <div className="partBaixo">
            <p>Status: Agendado</p>
            <button>Cancelar Presença</button>
          </div>

        </div>

        <h1>Histórico</h1>
        <div className="historico">

        </div>
      </div>
    </div>


  );
}