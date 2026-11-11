import { useEffect, useId, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.scss';

export default function BuscaGlobal() {
  const navigate = useNavigate();
  const location = useLocation();
  const campoId = useId();
  const [texto, setTexto] = useState(() => new URLSearchParams(location.search).get('q') || '');

  useEffect(() => {
    if (location.pathname === '/busca') {
      setTexto(new URLSearchParams(location.search).get('q') || '');
    }
  }, [location.pathname, location.search]);

  function pesquisar(evento) {
    evento.preventDefault();
    const termo = texto.trim();
    if (!termo) return;
    navigate(`/busca?q=${encodeURIComponent(termo)}`);
  }

  return (
    <form className="busca-global" role="search" onSubmit={pesquisar}>
      <label htmlFor={campoId} className="busca-global-rotulo">Pesquisar no ConSangue</label>
      <div className="busca-global-campo">
        <img src="/assets/icons/LupaPesquisa.png" alt="" aria-hidden="true" />
        <input
          id={campoId}
          type="search"
          autoComplete="off"
          value={texto}
          maxLength={120}
          onChange={evento => setTexto(evento.target.value)}
          placeholder="Buscar campanhas, grupos ou hemocentros..."
        />
        <button type="submit" disabled={!texto.trim()} aria-label="Buscar no ConSangue">
          Buscar
        </button>
      </div>
    </form>
  );
}
