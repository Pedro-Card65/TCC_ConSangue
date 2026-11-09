import './index.scss';

const campanhas = [
  {
    id: 1,
    hospital: 'Hospital Abidas',
    cidade: 'São Paulo, SP',
    seguidores: 700,
    titulo: 'Campanha Mais Amor',
    periodo: 'De 15 a 30 de novembro',
    imagem: '/assets/images/campanha-padrao.webp',
    descricao:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum dolorem expedita, nam non iste a ipsum hic sapiente mollitia voluptates harum sit architecto quae, laborum, quo ut molestias eius dolor?',
    grupos: 5,
    curtidas: 128,
    compartilhamentos: 3
  }
];

export default function Home() {
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

      {campanhas.length > 0 ? (
        campanhas.map((c) => (
          <article className="cartao-campanha" key={c.id}>

            <header className="cartao-topo">
              <img className="cartao-logo" src="/assets/icons/banido.png" alt="" />

              <div className="cartao-identificacao">
                <h2>
                  {c.hospital}
                  <img src="/assets/icons/mini-gota-sangue.webp" alt="Hemocentro verificado" />
                </h2>
                <p>{c.hospital} • {c.cidade}</p>
                <p>{c.seguidores} seguidores</p>
              </div>
            </header>

            <div className="cartao-imagem">
              <img src={c.imagem} alt={c.titulo} />
              <span className="cartao-periodo">{c.periodo}</span>
            </div>

            <div className="cartao-acoes">
              <ul className="cartao-interacoes">
                <li>
                  <img src="/assets/icons/pessoas.webp" alt="Grupos" />
                  <span>{c.grupos}</span>
                </li>
                <li>
                  <img src="/assets/icons/coracao-curtida.webp" alt="Curtidas" />
                  <span>{c.curtidas}</span>
                </li>
                <li>
                  <img src="/assets/icons/compartilhamento.webp" alt="Compartilhamentos" />
                  <span>{c.compartilhamentos}</span>
                </li>
              </ul>

              <button type="button" className="cartao-saiba-mais">Saiba mais</button>
            </div>

            <p className="cartao-descricao">
              <strong>{c.hospital}:</strong> {c.descricao}
            </p>

          </article>
        ))
      ) : (
        <div className="home-aviso">
          <p>Nenhuma campanha encontrada.</p>
        </div>
      )}

    </div>
  );
}