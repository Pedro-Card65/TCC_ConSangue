import './lateral-hemocentros.scss';
import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function HemocentrosLaterais() {

  const [hemocentros, setHemocentros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function carregarHemocentros() {
      try {
        const response = await api.get('/api/instituicoes');
        if (ativo) {
          setHemocentros(response.data);
          setCarregando(false);
        }
      } catch (error) {
        if (ativo) {
          setErro(true);
          setCarregando(false);
        }
      }
    }

    carregarHemocentros();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <section className="hemocentros-laterais">
      <img className="icone-topo" src="/assets/icons/dois-quadrados.webp" alt="" />
      <h2 className="titulo">Encontre Hemocentros parceiros</h2>

      {carregando && <p>Carregando hemocentros...</p>}

      {erro && <p role="alert">Não foi possível carregar os hemocentros.</p>}

      {!carregando && !erro && hemocentros.length === 0 && (
        <p>Nenhum hemocentro encontrado.</p>
      )}

      {!carregando && !erro && hemocentros.length > 0 && (
        <ul className="lista-hemocentros">
          {hemocentros.map((h) => (
            <li className="cartao-hemocentro" key={h.id_hemocentro}>

              <div className="cabecalho-cartao">

                <div className="nome-hemocentro">
                  <p>{h.nome_hemo}</p>
                  <img src="/assets/icons/mini-gota-sangue.webp" alt="" />
                </div>

                <div className="acoes">
                  <button
                    type="button"
                    aria-expanded={aberto === h.id_hemocentro}
                    aria-controls={`detalhes-hemo-${h.id_hemocentro}`}
                    onClick={() => setAberto(aberto === h.id_hemocentro ? null : h.id_hemocentro)}
                  >
                    {aberto === h.id_hemocentro ? 'Ocultar' : 'Ver perfil'}
                  </button>
                </div>

              </div>

              {aberto === h.id_hemocentro && (
                <div className="detalhes-hemocentro" id={`detalhes-hemo-${h.id_hemocentro}`}>
                  <p>{h.endereco}, {h.cidade} - {h.estado}, {h.cep}</p>
                  {h.telefone_centro && <p>Telefone: {h.telefone_centro}</p>}
                </div>
              )}

            </li>
          ))}
        </ul>
      )}

    </section>
  );
}