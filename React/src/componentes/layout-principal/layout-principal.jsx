import './layout-principal.scss';
import { Outlet } from 'react-router-dom';
import InformacoesLaterais from '../lateral-informacoes/lateral-informacoes';

export default function LayoutPrincipal() {
  return (
    <div className="layout-principal">

      <aside className="coluna-esquerda">
        <InformacoesLaterais />
      </aside>

      <main className="coluna-centro">
        <Outlet />
      </main>

      <aside className="coluna-direita"></aside>

    </div>
  );
}
