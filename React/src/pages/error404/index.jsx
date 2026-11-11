import './index.scss';
import { Link } from 'react-router-dom';

export default function Error404() {
  
  return (
    <div className="pagina-erro404">
        <div className='OrganizaçãoErro'>
            <div><h2>ERROR 404</h2></div>
            <div>
            <p className="erro-descricao">Parece que essa tal pagina não existe</p>
            <p className="erro-orientacao">Volte para o menu</p>
            </div>
            <div className='divzinha'>
            <Link to = '/'><button className='VoltarAoMenu'>VOLTAR</button></Link>
            
            </div>
          
        </div>
    </div>
  );
}