import './lateral-informacoes.scss';
import LogoSlogan from '../logo-slogan/logo-slogan';

export default function InformacoesLaterais() {
  return (
    <section className="informacoes-laterais">

        <LogoSlogan />

        <div className='cartao'>

            <div className="foto-nome-user">
                <img src="/assets/images/User.png" alt="Foto do usuário" />
                <h3>Nome do Usuário</h3>
            </div>

            <div className="suas-informacoes">
                <div>
                <h3>Suas informações</h3>
                </div>

                <div className="dados-usuario">
                <p>Nome completo</p>
                <p>E-mail</p>
                <p>Cidade</p>
                <p>Tipo Sanguíneo:</p>
                </div>
            </div>

            <div className="participacoes-planejadas">
                <div>
                <h3>Próxima participação planejada</h3>
                </div>

                <p>Campanha planejada • data e hora</p>
            </div>

            <div className="grupo-atual">
                <div>
                <h3>Meu grupo atual</h3>
                </div>

                <p>Nome do grupo (n.º de membros)</p>
            </div>

        </div>

    </section>
  );
}