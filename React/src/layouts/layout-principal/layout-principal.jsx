import './layout-principal.scss'
import { Outlet } from 'react-router-dom'
import InformacoesLaterais from '../../componentes/lateral-informacoes/lateral-informacoes'
import HemocentrosLaterais from '../../componentes/lateral-hemocentros/lateral-hemocentros'
import BuscaGlobal from '../../componentes/busca-global'

export default function LayoutPrincipal() {
  return (
    <div className="layout-principal">
      <aside className="coluna-esquerda">
        <InformacoesLaterais />
      </aside>

      <main className="coluna-centro">
        <div className="area-busca-global"><BuscaGlobal /></div>
        <Outlet />
      </main>

      <aside className="coluna-direita">
        <HemocentrosLaterais />
      </aside>
    </div>
  )
}
