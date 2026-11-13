import { useRef, useState } from 'react';

export const FOTO_CAMPANHA_PADRAO = '/assets/images/campanha-padrao.webp';

export default function FotoCampanha({ foto, aoAlterar, aoProcessar }) {
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState(false);
  const sequencia = useRef(0);

  async function escolher(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;
    setErro('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) ||
      arquivo.size > 8 * 1024 * 1024) {
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
      if (!contexto) throw new Error('Imagem inválida');
      contexto.fillStyle = '#ffffff';
      contexto.fillRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
      const resultado = canvas.toDataURL('image/jpeg', 0.78);
      if (resultado.length > 300 * 1024) throw new Error('Imagem muito grande');
      if (sequencia.current === atual) aoAlterar(resultado);
    } catch {
      setErro('Não foi possível preparar essa foto. Escolha outra imagem.');
    } finally {
      URL.revokeObjectURL(url);
      setProcessando(false);
      aoProcessar?.(false);
    }
  }

  return <div className="foto-campanha-editor">
    <p>Foto da campanha (opcional)</p>
    <img className="foto-campanha-previa" src={foto || FOTO_CAMPANHA_PADRAO} alt="Prévia da campanha" />
    <div className="linha-upload-foto">
      <label className="botao-upload-foto">
        Escolher imagem
        <input type="file" accept="image/jpeg,image/png,image/webp"
          onChange={escolher} disabled={processando} />
      </label>
      <span>{foto ? 'Foto personalizada selecionada' : 'Nenhuma foto selecionada'}</span>
    </div>
    {foto && <button className="botao-remover-foto-campanha" type="button" disabled={processando}
      onClick={() => { setErro(''); aoAlterar(null); }}>Remover foto</button>}
    {processando && <p role="status">Preparando foto...</p>}
    {erro && <p role="alert">{erro}</p>}
  </div>;
}
