import './index.scss';
import { Link } from 'react-router-dom';

import InformacoesLaterais from '../../componentes/lateral-informacoes/lateral-informacoes';

export default function Home() {
  return (
    <div className="pagina-home">

      <InformacoesLaterais />


    </div>
  );
}


