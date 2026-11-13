import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './index.scss';

export default function Notificacao({ mensagem, aoFechar }) {
  useEffect(() => {
    if (!mensagem) return undefined;
    const timeout = setTimeout(() => aoFechar(''), 5000);
    return () => clearTimeout(timeout);
  }, [mensagem, aoFechar]);

  if (!mensagem) return null;

  return createPortal(
    <div className="notificacao-consangue" role="status" aria-live="polite">
      <span className="notificacao-consangue-icone" aria-hidden="true">✓</span>
      <div className="notificacao-consangue-conteudo">
        <strong>Sucesso!</strong>
        <p>{mensagem}</p>
      </div>
      <button className="notificacao-consangue-fechar" type="button"
        aria-label="Fechar notificação" onClick={() => aoFechar('')}>×</button>
    </div>,
    document.body
  );
}
