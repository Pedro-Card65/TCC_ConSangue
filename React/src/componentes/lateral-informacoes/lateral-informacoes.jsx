import './lateral-informacoes.scss';
import LogoSlogan from '../logo-slogan/logo-slogan';

const usuario = {
  nome: 'José Alves da Silva',
  email: 'josealves@gmail.com',
  cidade: 'São Paulo',
  tipo_sanguineo: 'O-'
};

const participacao = {
  hemocentro: 'Hospital Abidas',
  data: '22 de Nov',
  horario: '10h'
};

const grupo = {
  nome_grupo: 'Grupo Amigos do Sangue',
  total_membros: 8
};

export default function InformacoesLaterais() {
  const partesNome = usuario.nome.split(' ');
  const nomeCurto = `${partesNome[0]} ${partesNome[partesNome.length - 1]}`;

  return (
    <section className="informacoes-laterais">

      <LogoSlogan />

        <div className="cartao">

            <div className="foto-nome-user">
                <img src="/assets/images/User.png" alt="Foto do usuário" />
                <h3>{nomeCurto}</h3>
            </div>

            <div className="suas-informacoes">
                <div>
                <h3>Suas informações</h3>
                </div>

            <div className="dados-usuario">
                <p>{usuario.nome}</p>
                <p>{usuario.email}</p>
                <p>{usuario.cidade}</p>
                <p>Tipo Sanguíneo: {usuario.tipo_sanguineo}</p>
            </div>
            </div>

        <div className="participacoes-planejadas">
            <div>
                <h3>Próxima participação planejada</h3>
            </div>

            {participacao ? (
                <p>{participacao.hemocentro} • {participacao.data} às {participacao.horario}</p>
            ) : (
                <p>Nenhuma participação planejada</p>
            )}
            </div>

            <div className="grupo-atual">
            <div>
                <h3>Meu grupo atual</h3>
            </div>

            {grupo ? (
                <p>{grupo.nome_grupo} ({grupo.total_membros} membros)</p>
            ) : (
                <p>Você ainda não está em um grupo</p>
            )}
        </div>

    </div>

    </section>
);
}