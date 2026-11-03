import './logo-slogan.scss';
import { Link } from 'react-router-dom';

export default function LogoSlogan(props) {
  return (
    <Link to="/home">
        <div className="logo-slogan">

      <div className="logo">

        <img src="/assets/images/Logo.png" alt="Logo" />

      </div>

      <div className="marca">

        <h2>ConSangue</h2>
        <p>Mobilização Coletiva para<br />Doação de Sangue</p>

      </div>

    </div></Link>
  );
}