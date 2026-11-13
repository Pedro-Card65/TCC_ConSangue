import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import './index.scss';

function listaDa(resposta, chave) {
    const dados = resposta?.data;
    if (Array.isArray(dados)) return dados;
    return Array.isArray(dados?.[chave]) ? dados[chave] : [];
}

function dataISO(valor) {
    return valor ? String(valor).slice(0, 10) : '';
}

export default function VincularCampanha({ idGrupo, podeAdministrar = false, aoVincular }) {
    const [campanhas, setCampanhas] = useState([]);
    const [vinculos, setVinculos] = useState([]);
    const [participacoes, setParticipacoes] = useState([]);
    const [ehCandidato, setEhCandidato] = useState(false);
    const [idCampanha, setIdCampanha] = useState('');
    const [meta, setMeta] = useState('10');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(true);

    const carregar = useCallback(async () => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
            setErro('Fa�a login para consultar as campanhas do grupo.');
            setCarregando(false);
            return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        setCarregando(true);
        setErro('');
        try {
            const [resCampanhas, resVinculos, resUsuario] = await Promise.all([
                api.get('/api/campanhas'),
                api.get('/api/gruposCampanhas'),
                api.get('/api/usuarios/me', config)
            ]);
            const usuario = resUsuario.data?.usuario ?? resUsuario.data;
            const candidato = usuario.tipo_usuario === 'candidato';
            const resParticipacoes = candidato
                ? await api.get('/api/participacoes', config)
                : { data: [] };
            setEhCandidato(candidato);
            setCampanhas(listaDa(resCampanhas, 'campanhas'));
            setVinculos(listaDa(resVinculos, 'grupos')
                .filter(vinculo => String(vinculo.id_grupo) === String(idGrupo)));
            setParticipacoes(listaDa(resParticipacoes, 'participacoes'));
        } catch (error) {
            setErro(error.response?.data?.erro || 'N�o foi poss�vel carregar as campanhas deste grupo.');
        } finally {
            setCarregando(false);
        }
    }, [idGrupo]);

    useEffect(() => { carregar(); }, [carregar]);

    async function vincular(evento) {
        evento.preventDefault();
        if (!podeAdministrar || salvando || carregando) return;
        if (!idCampanha || !Number.isSafeInteger(Number(meta)) || Number(meta) < 1) {
            setErro('Selecione uma campanha e informe uma meta v�lida.');
            return;
        }
        setSalvando(true);
        setErro('');
        setSucesso('');
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const resposta = await api.post('/api/grupoCampanhas', {
                id_grupo: Number(idGrupo),
                id_campanha: Number(idCampanha),
                meta_participacoes: Number(meta)
            }, { headers: { Authorization: `Bearer ${token}` } });
            // Vincular o grupo N�O registra interesse individual do administrador nem dos membros.
            setSucesso('Grupo vinculado � campanha! Cada membro poder� decidir se quer participar.');
            setIdCampanha('');
            aoVincular?.(resposta.data.id);
            await carregar();
        } catch (error) {
            setErro(error.response?.data?.erro || 'N�o foi poss�vel vincular a campanha.');
        } finally {
            setSalvando(false);
        }
    }

    async function participar(vinculo, status) {
        if (!ehCandidato || salvando || carregando) return;
        const campanha = campanhas.find(c => String(c.id_campanha) === String(vinculo.id_campanha));
        if (!campanha || campanha.status_campanha !== 'ativa') {
            setErro('Essa campanha n�o est� ativa.');
            return;
        }
        const anterior = participacoes.find(p => String(p.id_campanha) === String(vinculo.id_campanha));
        if (anterior?.status_participacao === 'comparecimento_informado') {
            setErro('O comparecimento j� foi informado para esta campanha.');
            return;
        }
        setSalvando(true);
        setErro('');
        setSucesso('');
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const dados = {
                id_grupo_campanha: vinculo.id_grupo_campanha,
                status_participacao: status
            };
            if (status === 'pretende_ir') {
                const hoje = new Date();
                const dataHoje = [hoje.getFullYear(), String(hoje.getMonth() + 1).padStart(2, '0'), String(hoje.getDate()).padStart(2, '0')].join('-');
                const inicio = dataISO(campanha.data_inicio);
                dados.data_prevista = inicio && inicio >= dataHoje ? inicio : dataHoje;
            } else {
                dados.data_prevista = null;
            }
            const resposta = anterior
                ? await api.put(`/api/participacoes/${anterior.id_registro}`, dados, config)
                : await api.post('/api/participacoes', { id_campanha: vinculo.id_campanha, ...dados }, config);
            setParticipacoes(atuais => [
                ...atuais.filter(p => String(p.id_campanha) !== String(vinculo.id_campanha)),
                resposta.data
            ]);
            await carregar();
            setSucesso(status === 'pretende_ir'
                ? 'Sua inten��o de comparecer foi registrada.'
                : 'Seu interesse foi registrado.');
        } catch (error) {
            setErro(error.response?.data?.erro || 'N�o foi poss�vel registrar sua participa��o.');
        } finally {
            setSalvando(false);
        }
    }

    const idsVinculados = new Set(vinculos.map(v => String(v.id_campanha)));
    const disponiveis = campanhas.filter(c =>
        c.status_campanha === 'ativa' && !idsVinculados.has(String(c.id_campanha)));

    return (
        <section className="vincular-campanha" aria-label="Campanhas do grupo">
            <h2>Campanhas do grupo</h2>
            <p>O administrador pode aderir a uma campanha em nome do grupo, sem se inscrever pessoalmente. Cada membro decide sua pr�pria participa��o.</p>

            {carregando && <p role="status">Carregando campanhas...</p>}
            {!carregando && vinculos.length === 0 && <p>Este grupo ainda n�o aderiu a nenhuma campanha.</p>}
            {!carregando && vinculos.map(vinculo => {
                const campanha = campanhas.find(c => String(c.id_campanha) === String(vinculo.id_campanha));
                const registro = participacoes.find(p => String(p.id_campanha) === String(vinculo.id_campanha));
                const ativa = campanha?.status_campanha === 'ativa';
                return (
                    <div className="campanha-do-grupo" key={vinculo.id_grupo_campanha}>
                        <strong>{campanha?.nome_campanha || `Campanha #${vinculo.id_campanha}`}</strong>
                        <small>Ades�es individuais: {vinculo.total_adesoes ?? 0} � Interessados: {vinculo.total_interessados ?? 0}</small>
                        {Number(vinculo.meta_participacoes) > 0 ? (
                            <>
                                <small>Meta do grupo: {vinculo.meta_participacoes} participa��es � {vinculo.percentual_progresso ?? 0}%</small>
                                <progress aria-label={`Progresso do grupo em ${campanha?.nome_campanha || 'campanha'}`}
                                    max={Number(vinculo.meta_participacoes)}
                                    value={Math.min(Number(vinculo.total_adesoes || 0), Number(vinculo.meta_participacoes))} />
                                <small>{Number(vinculo.total_adesoes) > Number(vinculo.meta_participacoes)
                                    ? 'Meta superada' : Number(vinculo.total_adesoes) === Number(vinculo.meta_participacoes)
                                        ? 'Meta atingida' : 'Mobiliza��o em andamento'}</small>
                            </>
                        ) : <small>Sem meta definida</small>}
                        <small>Contam inten��es e presen�as informadas pelos candidatos; n�o representam doa��es comprovadas.</small>
                        <small>{ativa ? 'Campanha ativa' : 'Campanha encerrada'}</small>
                        {ehCandidato && registro && (
                            <p className="situacao-campanha-grupo">
                                Sua situa��o: {registro.status_participacao === 'pretende_ir'
                                    ? 'Pretende ir'
                                    : registro.status_participacao === 'comparecimento_informado'
                                        ? 'Presen�a informada' : 'Interesse registrado'}
                            </p>
                        )}
                        {ehCandidato && ativa && registro?.status_participacao !== 'comparecimento_informado' && (
                            <div className="acoes-campanha-grupo">
                                <button type="button" disabled={salvando || carregando ||
                                    (registro?.status_participacao === 'interessado' &&
                                     String(registro.id_grupo_campanha) === String(vinculo.id_grupo_campanha))}
                                    onClick={() => participar(vinculo, 'interessado')}>
                                    Tenho interesse
                                </button>
                                <button type="button" disabled={salvando || carregando ||
                                    (registro?.status_participacao === 'pretende_ir' &&
                                     String(registro.id_grupo_campanha) === String(vinculo.id_grupo_campanha))}
                                    onClick={() => participar(vinculo, 'pretende_ir')}>
                                    Pretendo ir
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}

            {podeAdministrar && !carregando && (
                <form onSubmit={vincular}>
                    <h3>Vincular o grupo a outra campanha</h3>
                    <label htmlFor="campanha-vinculo">Campanha dispon�vel</label>
                    <select id="campanha-vinculo" value={idCampanha}
                        onChange={e => setIdCampanha(e.target.value)}
                        disabled={salvando || disponiveis.length === 0} required>
                        <option value="">Selecione uma campanha</option>
                        {disponiveis.map(campanha => (
                            <option key={campanha.id_campanha} value={campanha.id_campanha}>
                                {campanha.nome_campanha}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="meta-vinculo">Meta de participa��es</label>
                    <input id="meta-vinculo" type="number" min="1" step="1" value={meta}
                        onChange={e => setMeta(e.target.value)} disabled={salvando} required />
                    <button type="submit" disabled={salvando || !idCampanha || disponiveis.length === 0}>
                        {salvando ? 'Vinculando...' : 'Vincular grupo � campanha'}
                    </button>
                    {disponiveis.length === 0 && <p>Nenhuma nova campanha ativa dispon�vel.</p>}
                </form>
            )}
            {erro && <p role="alert">{erro}</p>}
            {sucesso && <p role="status">{sucesso}</p>}
        </section>
    );
}
