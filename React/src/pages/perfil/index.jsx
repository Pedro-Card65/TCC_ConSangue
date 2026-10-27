import './index.scss';
import LogoSlogan from '../../componentes/logo-slogan/logo-slogan.jsx';

const usuario = {
  nome: 'José Alves da Silva',
  email: 'josealves@gmail.com',
  cidade: 'São Paulo',
  tipo_sanguineo: 'O-',
  data_cadastro: '13/10/2026',
  perfil: 'Doador'
};

const estatisticas = [
  { id: 1, icone: '/assets/icons/check-vermelho.webp', valor: 5, rotulo: 'Campanhas participadas' },
  { id: 2, icone: '/assets/icons/grupos-vermelho.webp', valor: 3, rotulo: 'Grupos' },
  { id: 3, icone: '/assets/icons/coracao-vermelho.webp', valor: 3, rotulo: 'Interesse de participação' }
];

const proximaCampanha = {
  nome: 'Campanha Unidos Pelo Sangue',
  hemocentro: 'Hemocentro do Centro',
  horario: '9h00',
  cidade: 'São Paulo/SP',
  dia: '14',
  mes_ano: 'Set/26',
  status: 'Planejada'
};

const historico = [
  { id: 1, campanha: 'Campanha Vida em Dobro', hemocentro: 'Hospital Santa Cruz', data: '10/05/2026', status: 'Compareceu' },
  { id: 2, campanha: 'Mega Doação de Primavera', hemocentro: 'Hemocentro Central', data: '02/08/2026', status: 'Interesse' }
];

export default function User() {
  return (
    <div className="pagina-user">

      <LogoSlogan />

      <div className="pesquisa">
        <img src="/assets/icons/LupaPesquisa.png" alt="" />
        <input
          type="text"
          aria-label="Pesquisar"
          placeholder="Pesquisar campanhas, hemocentros ou grupos..."
        />
      </div>

      <section className="user">

        <div className="informacoes-usuario">

          <div className="titulo-informacoes-usuario">
            <h3>Suas informações</h3>
          </div>

          <div className="conteudo-informacoes-usuario">

            <img src="/assets/images/User.png" alt="Foto do usuário" />

            <div className="coluna-user-1">
              <p>{usuario.nome}</p>
              <p>{usuario.email}</p>
              <p>{usuario.cidade}</p>
              <p>Tipo Sanguíneo: {usuario.tipo_sanguineo}</p>
            </div>

            <div className="coluna-user-2">
              <p>Ingressou em: {usuario.data_cadastro}</p>
              <p>{usuario.perfil} <img src="/assets/icons/mini-gota-sangue.webp" alt="" /></p>
            </div>

          </div>
        </div>

        <div className="grupos-comunidades">

          <div className="titulo-grupos-comunidades">
            <h3>Grupos e comunidades</h3>
          </div>

          <div className="conteudo-grupos-comunidades">
            {estatisticas.map((e) => (
              <div className="estatistica" key={e.id}>
                <div className="valor-estatistica">
                  <img src={e.icone} alt="" />
                  <span>{e.valor}</span>
                </div>
                <p>{e.rotulo}</p>
              </div>
            ))}
          </div>

        </div>

        <div className="proxima-campanha">

          <div className="titulo-proxima-campanha">
            <h3>Próxima campanha</h3>
          </div>

          <div className="conteudo-proxima-campanha">

            {proximaCampanha ? (
              <>
                <div className="informacoes-proxima-campanha">

                  <div className="data-proxima-campanha">
                    <h2>{proximaCampanha.dia} {proximaCampanha.mes_ano}</h2>
                  </div>

                  <div className="informacoes-encontro-proxima-campanha">
                    <h2>{proximaCampanha.nome}</h2>
                    <p>{proximaCampanha.hemocentro}</p>
                    <p>{proximaCampanha.horario} - {proximaCampanha.cidade}</p>
                  </div>

                  <div className="confirmacao">
                    <h2>{proximaCampanha.status}</h2>
                  </div>

                </div>

                <div className="acessar-proxima-campanha">
                  <button type="button">Ver detalhes da campanha</button>
                </div>
              </>
            ) : (
              <p>Você não tem nenhuma campanha planejada</p>
            )}

          </div>
        </div>

        <div className="historico-campanhas">

          <div className="titulo-historico-campanhas">
            <h3>Histórico de campanhas</h3>
          </div>

          <div className="conteudo-historico-campanhas">
            {historico.length > 0 ? (
              <ul>
                {historico.map((h) => (
                  <li className="informacoes-historico-campanhas" key={h.id}>
                    <p>
                      {h.campanha} — {h.hemocentro} • {h.status === 'Compareceu' ? 'Realizada em' : 'Interesse em'} {h.data}
                    </p>
                    <span className={`status-historico ${h.status.toLowerCase()}`}>
                      {h.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Você ainda não tem histórico de campanhas</p>
            )}
          </div>

        </div>

      </section>

    </div>
  );
}