import './barra-navegacao.scss';
import { NavLink } from 'react-router-dom';

const itens = [
  { id: 1, rota: '/participacoes', nome: 'Participações', icone: 'participacoes' },
  { id: 2, rota: '/grupos', nome: 'Grupos', icone: 'grupos' },
  { id: 3, rota: '/home', nome: 'Home', icone: 'home' },
  { id: 4, rota: '/campanhas', nome: 'Campanhas', icone: 'campanhas' },
  { id: 5, rota: '/perfil', nome: 'Perfil', icone: 'perfil' }
];

export default function BarraNavegacao() {
  return (
    <nav className="barra-navegacao" aria-label="Navegação principal">

      <div className="conteudo-barra">

        <ul className="itens-navegacao">
          {itens.map((item) => (
            <li key={item.id}>
              <NavLink to={item.rota} className="item" aria-label={item.nome}>
                {({ isActive }) => (
                  <img
                    src={`/assets/icons/${item.icone}-${isActive ? 'vermelho' : 'branco'}.webp`}
                    alt=""
                  />
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <button type="button" className="botao-menu" aria-label="Abrir menu">
          <img src="/assets/icons/menu.webp" alt="" />
        </button>

      </div>

    </nav>
  );
}