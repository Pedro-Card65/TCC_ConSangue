import './index.scss';
import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function Campanhas() {
  const [campanhas, setCampanhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function buscarCampanhas() {
      try {
        const resposta = await api.get('/api/campanhas');

        if (ativo) {
          setCampanhas(resposta.data.campanhas);
        }
      }
      catch (error) {
        if (ativo) {
          setErro(error.response?.data?.erro || 'Não foi possível carregar as campanhas. Tente novamente mais tarde.');
        }
      }
      finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    buscarCampanhas();

    return () => {
      ativo = false;
    };
  }, []);

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

      <section className="lista-campanhas" aria-label="Campanhas encontradas" aria-busy={carregando}>

        {carregando && <p role="status">Carregando campanhas...</p>}

        {erro && <p className="erro-campanhas" role="alert">{erro}</p>}

        {!carregando && !erro && (
          campanhas.length > 0 ? (
            campanhas.map((campanha) => (
              <article className="cartao-campanha" key={campanha.id_campanha}>
                <h2>{campanha.nome_campanha}</h2>
                <p>{campanha.descricao}</p>
                <p>Status: {campanha.status_campanha}</p>
              </article>
            ))
          ) : (
            <p>Nenhuma campanha encontrada.</p>
          )
        )}

      </section>
    </div>
  );
}
