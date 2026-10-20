import './index.scss';
import { Link } from 'react-router-dom';

export default function Grupos() {
  
  return (
    <div className="Background">
        <div className='OrganizaçãoErro'>
            <div><h2>ERROR 404</h2></div>
            <div>
            <p99>Parece que essa tal pagina não existe</p99>
            <p100>Volte para o menu</p100>
            </div>
            <div className='divzinha'>
            <Link to = '/'><button className='VoltarAoMenu'>VOLTAR</button></Link>
            
            </div>
          
        </div>
    </div>
  );
}