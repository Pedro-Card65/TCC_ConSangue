import { useRef, useState } from 'react';
import { api } from '../../services/api';
import FotoCampanha from './foto-campanha';

export default function FormularioCampanha({ instituicao, campanha = null, aoSalvar, aoCancelar }) {
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [dataInicio, setDataInicio] = useState(campanha ? String(campanha.data_inicio).slice(0, 10) : '');
  const enviando = useRef(false);
  const [foto, setFoto] = useState(null);
  const [processandoFoto, setProcessandoFoto] = useState(false);

  async function salvar(evento) {
    evento.preventDefault();
    if (enviando.current || processandoFoto) return;
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
      const configuracao = { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } };
      if (campanha) {
        await api.put(`/api/campanhas/${campanha.id_campanha}`, { ...dados, id_hemocentro: instituicao.id_hemocentro }, configuracao);
      } else {
        await api.post('/api/campanhas', { ...dados, foto_campanha: foto, id_hemocentro: instituicao.id_hemocentro }, configuracao);
      }
      aoSalvar();
    } catch (e) {
      setErro(e.response?.data?.erro || 'Não foi possível confirmar a criação. Confira suas campanhas antes de tentar novamente.');
    } finally {
      enviando.current = false;
      setSalvando(false);
    }
  }
  return <form onSubmit={salvar} aria-labelledby="titulo-formulario-campanha">
    <h2 id="titulo-formulario-campanha">{campanha ? "Editar campanha" : "Criar campanha"}</h2>
    <p>Local: {instituicao.nome_hemo} · {instituicao.endereco}</p>
    <fieldset disabled={salvando}>
      <label>Nome da campanha<input name="nome_campanha" required maxLength={100} defaultValue={campanha?.nome_campanha || ""} autoFocus /></label>
      <label>Descrição<textarea name="descricao" rows={4} maxLength={10000} defaultValue={campanha?.descricao || ""} /></label>
      <div className="campos-duplos">
        <label>Data de início<input name="data_inicio" type="date" required value={dataInicio} onChange={e => setDataInicio(e.target.value)} /></label>
        <label>Data de término<input name="data_fim" type="date" required min={dataInicio || undefined} defaultValue={campanha ? String(campanha.data_fim).slice(0, 10) : ""} /></label>
        <label>Horário de início (opcional)<input name="horario_inicio" type="time" defaultValue={campanha?.horario_inicio?.slice(0, 5) || ""} /></label>
        <label>Horário de término (opcional)<input name="horario_fim" type="time" defaultValue={campanha?.horario_fim?.slice(0, 5) || ""} /></label>
      </div>
      {!campanha && <FotoCampanha foto={foto} aoAlterar={setFoto} aoProcessar={setProcessandoFoto} />}
      <label>Status<select name="status_campanha" defaultValue={campanha?.status_campanha || "ativa"}><option value="ativa">Ativa</option><option value="encerrada">Encerrada</option></select></label>
      {erro && <p role="alert">{erro}</p>}
      <div className="acoes">
        <button type="submit" disabled={processandoFoto}>{salvando ? 'Salvando...' : campanha ? 'Salvar alterações' : 'Salvar campanha'}</button>
        <button type="button" onClick={aoCancelar}>Cancelar</button>
      </div>
    </fieldset>
  </form>;
}
