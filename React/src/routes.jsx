// Página de rotas para ligar as páginas
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import LayoutComBarra from './layouts/layout-barra-navegacao/layout-barra-navegacao.jsx'

import LayoutPrincipal from './layouts/layout-principal/layout-principal.jsx'

import Cadastro from './pages/cadastro/index.jsx'

import Login from './pages/login/index.jsx'

import Home from './pages/home/index.jsx'

import Perfil from './pages/perfil/index.jsx'

import Campanhas from './pages/campanhas/index.jsx'

import Grupos from './pages/grupos/index.jsx'
import Participacoes from './pages/participacoes/index.jsx'
import Historico from './pages/historico/index.jsx'
import ParticipacoesHistorico from './pages/participacoesHistorico/index.jsx';

import Error from './pages/error404/index.jsx'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route element={<LayoutComBarra />}>
          <Route element={<LayoutPrincipal />}>
            <Route path="/home" element={<Home />} />
            <Route path="/campanhas" element={<Campanhas />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/participacoes" element={<Participacoes />} />
            <Route path="/participacoesHistorico" element={<ParticipacoesHistorico />} />
          </Route>
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/historico" element={<Historico />} />
        </Route>
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  )
}
