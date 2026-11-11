import './lateral-hemocentros.scss';
import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import ModalCampanha from '../modal-campanha/modal-campanha.jsx';

export default function HemocentrosLaterais() {

  const [hemocentros, setHemocentros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [aberto, setAberto] = useState(null);
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const [campanhas, setCampanhas] = useState([]);
  const [campanhaAberta, setCampanhaAberta] = useState(null);
>>>>>>> 6af48690620e19056571256973665b83dce1f097
=======
  const [campanhas, setCampanhas] = useState([]);
  const [campanhaAberta, setCampanhaAberta] = useState(null);
>>>>>>> 6af48690620e19056571256973665b83dce1f097

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
    api.get('/api/campanhas').then(resposta => {
      if (ativo) setCampanhas(resposta.data?.campanhas ?? []);
    }).catch(() => {});

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
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 6af48690620e19056571256973665b83dce1f097
                  <h3>Campanhas deste hemocentro</h3>
                  {campanhas.filter(c => String(c.id_hemocentro) === String(h.id_hemocentro)).length === 0
                    ? <p>Nenhuma campanha disponível.</p>
                    : <ul className="campanhas-hemocentro">
                        {campanhas.filter(c => String(c.id_hemocentro) === String(h.id_hemocentro)).map(c => (
                          <li key={c.id_campanha}>
                            <span>{c.nome_campanha}</span>
                            <button type="button" onClick={() => setCampanhaAberta(c)}>Saiba mais</button>
                          </li>
                        ))}
                      </ul>}
<<<<<<< HEAD
>>>>>>> 6af48690620e19056571256973665b83dce1f097
=======
>>>>>>> 6af48690620e19056571256973665b83dce1f097
                </div>
              )}

            </li>
          ))}
        </ul>
      )}

      {campanhaAberta && <ModalCampanha campanha={campanhaAberta} aoFechar={() => setCampanhaAberta(null)} />}
    </section>
  );
}