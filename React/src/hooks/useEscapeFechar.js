import { useEffect, useRef } from 'react';

// Chama aoFechar quando Esc é pressionado, apenas enquanto ativo for verdadeiro.
export default function useEscapeFechar(ativo, aoFechar) {
  const fechar = useRef(aoFechar);
  fechar.current = aoFechar;

  useEffect(() => {
    if (!ativo) return undefined;
    function aoTeclar(evento) {
      if (evento.key === 'Escape') fechar.current();
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [ativo]);
}
