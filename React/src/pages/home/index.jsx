import './index.scss';
import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function Home() {
  const [campanhas, setCampanhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchCampanhas = async () => {
      try {
        const response = await api.get('/api/campanhas');
        setCampanhas(response.data.campanhas); 
      } catch (error) {
        setErro(error.response?.data?.erro || 'Erro ao carregar campanhas.');
      } finally {
        setCarregando(false);
      }
    };

    fetchCampanhas();
  }, []);
  
      return (
    <div className="pagina-home">

      <div className="pesquisa">
        <img src="/assets/icons/LupaPesquisa.png" alt="" />
        <input
          type="text"
          aria-label="Pesquisar"
          placeholder="Pesquisar campanhas, hemocentros ou grupos..."
        />
      </div>

      {carregando && <p role="status">Carregando campanhas...</p>}

      {erro && <p role="alert">{erro}</p>}

      {!carregando && !erro && (
        campanhas.length > 0 ? (
          campanhas.map((c) => (
            <article className="cartao-campanha" key={c.id_campanha}>

              <header className="cartao-topo">
                <img className="cartao-logo" src="/assets/icons/banido.png" alt="" />

                <div className="cartao-identificacao">
                  <h2>{c.nome_campanha}</h2>
                  <p>Status: {c.status_campanha}</p>
                </div>
              </header>

              <div className="cartao-imagem">
                <img src="/assets/images/campanha-padrao.webp" alt={c.nome_campanha} />
              </div>

              <div className="cartao-acoes">
                <button type="button" className="cartao-saiba-mais">Saiba mais</button>
              </div>

              <p className="cartao-descricao">{c.descricao}</p>

            </article>
          ))
        ) : (
          <div className="home-aviso">
            <p>Nenhuma campanha encontrada.</p>
          </div>
        )
      )}

    </div>
  );
}