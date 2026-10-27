import { Outlet } from 'react-router-dom';
import BarraNavegacao from '../../componentes/barra-navegacao/barra-navegacao';

export default function LayoutComBarra() {
  return (
    <>
      <Outlet />
      <BarraNavegacao />
    </>
  );
}