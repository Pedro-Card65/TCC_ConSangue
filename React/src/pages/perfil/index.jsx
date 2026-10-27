import './index.scss';
import LogoSlogan from '../../componentes/logo-slogan/logo-slogan.jsx';

export default function User() {
  return (
    <div className="pagina-user">

      <LogoSlogan />

      <div className='pesquisa'>

      <img src="/assets/icons/LupaPesquisa.png" alt="" />
      <input type="text" placeholder="Pesquisar campanhas, hemocentros ou grupos..." />

      </div>

      <section className="user">

        <div className="informacoes-usuario">

          <div className='titulo-informacoes-usuario'>

            <h3>Suas Informações</h3>

          </div>

          <div className="conteudo-informacoes-usuario">

          <img src="/assets/images/User.png" alt="Foto do Usuário" />

          <div className='coluna-user-1'>

          <p>Nome do Usuário</p>
          <p>E-mail</p>
          <p>Cidade</p>
          <p>Tipo Sanguíneo:</p>

          </div>

          <div className='coluna-user-2'>

          <p>Ingressou em:</p>
          <p>Doador 🩸</p>

          </div>

          </div>
        </div>

        <div className="grupos-comunidades">

          <div className='titulo-grupos-comunidades'>

            <h3>Grupos e Comunidades</h3>

          </div>

          <div className="conteudo-grupos-comunidades">

            <div className='campanhas-participadas'>

              <p>Campanhas Participadas</p>

            </div>

            <div className='grupos-participados'>

              <p>Grupos Participados</p>

            </div>

            <div className='interesse-participacao'>

              <p>Interesse de Participação</p>

            </div>

          </div>
        </div>

        <div className="proxima-campanha">
          

          <div className='titulo-proxima-campanha'>

            <h3>Próxima Campanha</h3>

          </div>

          <div className="conteudo-proxima-campanha">

            <div className='informacoes-proxima-campanha'>

              <div className='data-proxima-campanha'>

                <h2>Data</h2>

              </div>

              <div className='informacoes-encontro-proxima-campanha'>

                <h2>Local</h2>
                <p>Endereço da Campanha</p>
                <p>horário da Campanha</p>

              </div>

              <div className='confirmacao'>

                <h2>Planejada</h2>

              </div>

            </div>

            <div className='acessar-proxima-campanha'>

              <button>Acessar Próxima Campanha</button>

            </div>

          </div>
        </div>
        <div className="historico-campanhas">
          

          <div className='titulo-historica-campanhas'>

            <h3>Histórico de Campanhas</h3>

          </div>

          <div className="conteudo-historico-campanhas">

            <div className='informacoes-historico-campanhas'>

              <div className='nomes-historico-campanhas'>
                <h2>nome da campanha -</h2>

              </div>

              <div className='hemocentros-historico-campanhas'>

                <h2>Nome do Hospital/Hemocentro *</h2>

              </div>

              <div className='confirmacao-interesse-historico-campanhas'>

                <h2>Compareceu / Interesse</h2>

              </div>

            </div>

          </div>

        </div>

      </section>

      

    </div>
  );
}