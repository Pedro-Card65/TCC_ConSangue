import './index.scss';
import { useState, useEffect } from 'react';
import { api } from '../../services/api.js'

export default function Campanhas() {
  const [campanhas, setCampanhas] = useState([]);
  /*useEffect(() => {

    async function buscarCampanhas() {
      const resposta = await api.get('/api/campanhas');

      setCampanhas(resposta.data.campanhas)
    }

    buscarCampanhas();

  }, []);*/

  return (
    <div className="pagina-campanhas">

      <h1> CAMPANHAS </h1>

      <div className="pesquisa">

        <div className='pesquisa-nome'>
          <label htmlFor="busca-campanha">
            Pesquisar Campanhas/Hemocentros
          </label>

          <div className='barra-pesquisa'>
            <img src="/assets/icons/lupa.png" alt="" />
            <input
              id="busca-campanha"
              type="text"
              placeholder='Nome da Campanha' />
          </div>
        </div>

        <fieldset className="pesquisa-tipos">
          <legend>
            Buscar por tipo
          </legend>

          <div className="grupo-tipos-rapidos">
            <button> O- </button>
            <button> A- </button>
            <button> AB- </button>
          </div>
        </fieldset>

        <div className="filtro-cidade">
          <label htmlFor="cidade">
            Distrito/Cidade
          </label>

          <select id="cidade">
            <option value="" disabled>Cidade</option>
            <option value="sao-paulo">São Paulo</option>
            <option value="sao-bernardo">São Bernardo</option>
            <option value="diadema">Diadema</option>
            <option value="campinas">Campinas</option>
          </select>
        </div>

        <div className="filtro-status">
          <label htmlFor="status">
            Status
          </label>

          <select id="status">
            <option value="ativas" >Ativas</option>
            <option value="finalizadas">Finalizadas</option>
            
          </select>
        </div>

        <button className='pesquisar'>Pesquisar</button>

      </div>
    </div>
  );
}