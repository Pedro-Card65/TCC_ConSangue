// Página de rotas para ligar as páginas
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Cadastro from './pages/cadastro/index.jsx';

import Login from './pages/login/index.jsx';

import Home from './pages/home/index.jsx';

import User from './pages/user/index.jsx';

import Hemocentro from './pages/hemocentro/index.jsx';

import Grupos from './pages/grupos/index.jsx';

import Historico from './pages/historico/index.jsx';

import Error from './pages/error404/index.jsx'

export default function Router(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path = '/' element = {<Login/>} />;
                <Route path = '/cadastro' element = {<Cadastro/>} />;
                <Route path = '/home' element = {<Home/>} />;
                <Route path = '/user' element = {<User/>} />;
                <Route path = '/hemocentro' element = {<Hemocentro/>} />;
                <Route path = '/grupos' element = {<Grupos/>} />;
                <Route path = '/historico' element = {<Historico/>} />;
                <Route path = '*' element = {<Error/>}/>
            </Routes>
        </BrowserRouter>
    )
}