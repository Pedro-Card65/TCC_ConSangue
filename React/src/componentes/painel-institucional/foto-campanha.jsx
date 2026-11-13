import { useRef, useState } from 'react';

export const FOTO_CAMPANHA_PADRAO = '/assets/images/campanha-padrao.webp';
const exemplos = [
  ['/assets/images/campanha-solidariedade.webp', 'Solidariedade'],
  ['/assets/images/campanha-comunidade.webp', 'Comunidade'],
];

export default function FotoCampanha({ foto, aoAlterar, aoProcessar }) {
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState(false);
  const sequencia = useRef(0);

  async function escolher(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;
    setErro('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 8 * 1024 * 1024) {
      setErro('Escolha uma imagem JPEG, PNG ou WEBP de até 8 MB.');
      return;
    }
    const atual = ++sequencia.current;
    setProcessando(true);
    aoProcessar?.(true);
    const url = URL.createObjectURL(arquivo);
    try {
      const imagem = new Image();
      imagem.src = url;
      await imagem.decode();
      const canvas = document.createElement('canvas');
      const escala = Math.min(1, 960 / imagem.naturalWidth, 640 / imagem.naturalHeight);
      canvas.width = Math.max(1, Math.round(imagem.naturalWidth * escala));
      canvas.height = Math.max(1, Math.round(imagem.naturalHeight * escala));
      const contexto = canvas.getContext('2d');
      contexto.fillStyle = '#ffffff';
      contexto.fillRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
      const resultado = canvas.toDataURL('image/jpeg', 0.78);
      if (resultado.length > 300 * 1024) throw new Error('A imagem ficou grande demais. Escolha outra foto.');
      if (sequencia.current === atual) aoAlterar(resultado);
    } catch (e) {
      setErro(e.message === 'A imagem ficou grande demais. Escolha outra foto.' ? e.message : 'Não foi possível abrir a imagem. Escolha outro arquivo.');
    } finally {
      URL.revokeObjectURL(url);
      setProcessando(false);
      aoProcessar?.(false);
    }
  }

  return <div className="foto-campanha-editor">
    <p>Foto da campanha (opcional)</p>
    <img className="foto-campanha-previa" src={foto || FOTO_CAMPANHA_PADRAO} alt="Prévia da foto da campanha" />
    <label>Enviar uma foto<input type="file" accept="image/jpeg,image/png,image/webp" onChange={escolher} disabled={processando} /></label>
    <div className="fotos-campanha-exemplos" aria-label="Fotos de exemplo">
      {exemplos.map(([src, nome]) => <button key={src} type="button" disabled={processando} aria-pressed={foto === src} onClick={() => { setErro(''); aoAlterar(src); }}>
        <img src={src} alt="" />{nome}
      </button>)}
      <button type="button" disabled={processando} aria-pressed={!foto} onClick={() => { setErro(''); aoAlterar(null); }}>Usar foto padrão</button>
    </div>
    {processando && <p role="status">Preparando foto...</p>}
    {erro && <p role="alert">{erro}</p>}
  </div>;
}
