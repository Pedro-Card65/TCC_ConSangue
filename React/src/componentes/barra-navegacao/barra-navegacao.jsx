import './barra-navegacao.scss';
<<<<<<< HEAD
<<<<<<< HEAD
import { useState } from 'react';
=======
import { useEffect, useRef, useState } from 'react';
>>>>>>> 6af48690620e19056571256973665b83dce1f097
=======
import { useEffect, useRef, useState } from 'react';
>>>>>>> 6af48690620e19056571256973665b83dce1f097
import { NavLink, useNavigate } from 'react-router-dom';

const itens = [
  { id: 1, rota: '/participacoesHistorico', nome: 'Participações Histórico', icone: 'participacoes' },
  { id: 2, rota: '/grupos', nome: 'Grupos', icone: 'grupos' },
  { id: 3, rota: '/home', nome: 'Home', icone: 'home' },
  { id: 4, rota: '/campanhas', nome: 'Campanhas', icone: 'campanhas' },
  { id: 5, rota: '/perfil', nome: 'Perfil', icone: 'perfil' }
];

// Tipo de conta gravado no login (sessionStorage 'usuario'); sem chamada extra à API.
function lerTipoUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem('usuario') || 'null')?.tipo_usuario ?? null;
  } catch {
    return null;
  }
}

export default function BarraNavegacao() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 6af48690620e19056571256973665b83dce1f097
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuAberto) return undefined;
    function fecharFora(evento) {
      if (menuRef.current && !menuRef.current.contains(evento.target)) setMenuAberto(false);
    }
    function fecharEsc(evento) {
      if (evento.key === 'Escape') setMenuAberto(false);
    }
    document.addEventListener('pointerdown', fecharFora);
    document.addEventListener('keydown', fecharEsc);
    return () => {
      document.removeEventListener('pointerdown', fecharFora);
      document.removeEventListener('keydown', fecharEsc);
    };
  }, [menuAberto]);
  const tipoUsuario = lerTipoUsuario();
  // Histórico de participações é só para candidatos.
  const itensVisiveis = tipoUsuario === 'instituicao'
    ? itens.filter((item) => item.rota !== '/participacoesHistorico')
    : itens;
<<<<<<< HEAD
>>>>>>> 6af48690620e19056571256973665b83dce1f097
=======
>>>>>>> 6af48690620e19056571256973665b83dce1f097

  function irPara(rota) {
    setMenuAberto(false);
    navigate(rota);
  }

  function sair() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    setMenuAberto(false);
    navigate('/', { replace: true });
  }

  function teclado(evento) {
    if (evento.key === 'Escape') setMenuAberto(false);
  }

  return (
    <nav className="barra-navegacao" aria-label="Navegação principal" onKeyDown={teclado}>
<<<<<<< HEAD
<<<<<<< HEAD

      {menuAberto && (
        <div className="menu-opcoes" role="menu" aria-label="Mais opções">
          <button type="button" role="menuitem" onClick={() => irPara('/perfil')}>Perfil</button>
          <button type="button" role="menuitem" onClick={sair}>Sair</button>
        </div>
      )}
=======
>>>>>>> 6af48690620e19056571256973665b83dce1f097
=======
>>>>>>> 6af48690620e19056571256973665b83dce1f097

      <div className="conteudo-barra">

        <ul className="itens-navegacao">
          {itensVisiveis.map((item) => (
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

<<<<<<< HEAD
<<<<<<< HEAD
        <button
          type="button"
          className="botao-menu"
          aria-label={menuAberto ? 'Fechar menu' : 'Ver mais opções'}
          aria-expanded={menuAberto}
          aria-haspopup="menu"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <img src="/assets/icons/menu.webp" alt="" />
        </button>
=======
=======
>>>>>>> 6af48690620e19056571256973665b83dce1f097
        <div className="menu-container" ref={menuRef}>
          <button
            type="button"
            className="botao-menu"
            aria-label={menuAberto ? 'Fechar menu' : 'Ver mais opções'}
            aria-expanded={menuAberto}
            aria-haspopup="menu"
            aria-controls="opcoes-menu-principal"
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            <img src="/assets/icons/menu.webp" alt="" />
          </button>
          {menuAberto && (
            <div className="menu-opcoes" id="opcoes-menu-principal" role="menu" aria-label="Mais opções">
              <button type="button" role="menuitem" onClick={() => irPara('/perfil')}>Perfil</button>
              <button type="button" role="menuitem" onClick={sair}>Sair</button>
            </div>
          )}
        </div>
<<<<<<< HEAD
>>>>>>> 6af48690620e19056571256973665b83dce1f097
=======
>>>>>>> 6af48690620e19056571256973665b83dce1f097

      </div>

    </nav>
  );
}