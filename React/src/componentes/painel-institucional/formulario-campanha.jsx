import { useRef, useState } from 'react';
import { api } from '../../services/api';

export default function FormularioCampanha({ instituicao, aoSalvar, aoCancelar }) {
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const enviando = useRef(false);

  async function salvar(evento) {
    evento.preventDefault();
    if (enviando.current) return;
    const dados = Object.fromEntries(new FormData(evento.currentTarget));
    dados.nome_campanha = dados.nome_campanha.trim();
    if (!dados.nome_campanha) { setErro('Informe o nome da campanha.'); return; }
    if (dados.data_fim < dados.data_inicio) { setErro('O término não pode ser anterior ao início.'); return; }
    if (dados.data_inicio === dados.data_fim && dados.horario_inicio && dados.horario_fim && dados.horario_fim <= dados.horario_inicio) {
      setErro('O horário de término deve ser posterior ao início.'); return;
    }
    enviando.current = true;
    setSalvando(true);
    setErro('');
    try {
      await api.post('/api/campanhas', { ...dados, id_hemocentro: instituicao.id_hemocentro }, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      aoSalvar();
    } catch (e) {
      setErro(e.response?.data?.erro || 'Não foi possível confirmar a criação. Confira suas campanhas antes de tentar novamente.');
    } finally {
      enviando.current = false;
      setSalvando(false);
    }
  }
  return <form onSubmit={salvar} aria-labelledby="titulo-criar-campanha">
    <h2 id="titulo-criar-campanha">Criar campanha</h2>
    <p>Local: {instituicao.nome_hemo} · {instituicao.endereco}</p>
    <fieldset disabled={salvando}>
      <label>Nome da campanha<input name="nome_campanha" required maxLength={100} autoFocus /></label>
      <label>Descrição<textarea name="descricao" rows={4} maxLength={10000} /></label>
      <div className="campos-duplos">
        <label>Data de início<input name="data_inicio" type="date" required value={dataInicio} onChange={e => setDataInicio(e.target.value)} /></label>
        <label>Data de término<input name="data_fim" type="date" required min={dataInicio || undefined} /></label>
        <label>Horário de início (opcional)<input name="horario_inicio" type="time" /></label>
        <label>Horário de término (opcional)<input name="horario_fim" type="time" /></label>
      </div>
      <label>Status<select name="status_campanha" defaultValue="ativa"><option value="ativa">Ativa</option><option value="encerrada">Encerrada</option></select></label>
      {erro && <p role="alert">{erro}</p>}
      <div className="acoes">
        <button type="submit">{salvando ? 'Salvando...' : 'Salvar campanha'}</button>
        <button type="button" onClick={aoCancelar}>Cancelar</button>
      </div>
    </fieldset>
  </form>;
}
