import './lateral-hemocentros.scss';

const hemocentros = [
  { id: 1, nome: 'Hospital Abidas', seguidores: 700, endereco: 'Praça da Luz, 500 - Luz, São Paulo - SP', cep: '01120-010' },
  { id: 2, nome: 'Hospital Abidas', seguidores: 700, endereco: 'Praça da Luz, 500 - Luz, São Paulo - SP', cep: '01120-010' },
  { id: 3, nome: 'Hospital Abidas', seguidores: 700, endereco: 'Praça da Luz, 500 - Luz, São Paulo - SP', cep: '01120-010' },
  { id: 4, nome: 'Hospital Abidas', seguidores: 700, endereco: 'Praça da Luz, 500 - Luz, São Paulo - SP', cep: '01120-010' }
];

export default function HemocentrosLaterais() {
  return (
    <section className="hemocentros-laterais">

      <img className="icone-topo" src="/assets/icons/dois-quadrados.webp" alt="" />

      <h2 className="titulo">Encontre Hemocentros parceiros</h2>

      <ul className="lista-hemocentros">
        {hemocentros.map((h) => (
          <li className="cartao-hemocentro" key={h.id}>

            <div className="cabecalho-cartao">

              <div className="nome-hemocentro">
                <p>{h.nome}</p>
                <img src="/assets/icons/mini-gota-sangue.webp" alt="" />
              </div>

              <div className="acoes">
                <button type="button" aria-label="Seguir hemocentro">
                  <img src="/assets/icons/mais-vermelho.webp" alt="" />
                </button>
                <button type="button" aria-label="Ver hemocentro">
                  <img src="/assets/icons/lupa-vermelha.webp" alt="" />
                </button>
              </div>

            </div>

            <p>{h.seguidores} seguidores</p>
            <p>{h.endereco}, {h.cep}</p>

          </li>
        ))}
      </ul>

    </section>
  );
}