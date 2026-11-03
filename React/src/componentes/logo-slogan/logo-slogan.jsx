import './logo-slogan.scss';
import { Link } from 'react-router-dom';

export default function LogoSlogan(props) {
  return (
    <Link to="/home">
        <div className="logo-slogan">

      <div className="logo">

        <img src="/assets/images/Logo_Vermelha.png" alt="Logo" />

      </div>

    </div></Link>
  );
}