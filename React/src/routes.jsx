
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';

// import Bloqueio from './componentes/bloqueio.jsx';
// rapaziada, quando a gente terminar os bagui, é só descomentar esse import e os route lá embaixo (em baixo sla n sei escrever) bjss 😘😘
import LayoutComBarra from './layouts/layout-barra-navegacao/layout-barra-navegacao.jsx';
import LayoutPrincipal from './layouts/layout-principal/layout-principal.jsx';
import Login from './pages/login/index.jsx';
import Home from './pages/home/index.jsx';
import Perfil from './pages/perfil/index.jsx';
import Campanhas from './pages/campanhas/index.jsx';
import Grupos from './pages/grupos/index.jsx';
import ParticipacoesHistorico from './pages/participacoesHistorico/index.jsx';
import Error from './pages/error404/index.jsx';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Navigate to="/" replace />} />
        {/* <Route element={<Bloqueio />}> */}
        <Route element={<LayoutComBarra />}>
          <Route element={<LayoutPrincipal />}>
            <Route path="/home" element={<Home />} />
            <Route path="/campanhas" element={<Campanhas />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/participacoesHistorico" element={<ParticipacoesHistorico />} />
          </Route>
          <Route path="/perfil" element={<Perfil />} />
        </Route>
        {/* </Route> */}

        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}
