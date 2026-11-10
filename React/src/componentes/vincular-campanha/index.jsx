import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import './index.scss';

export default function VincularCampanha({ idGrupo, aoVincular }) {
    const [campanhas, setCampanhas] = useState([]);
    const [idCampanha, setIdCampanha] = useState('');
    const [meta, setMeta] = useState('10');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        let ativo = true;

        async function carregarCampanhas() {
            try {
                const resposta = await api.get('/api/campanhas');

                if (ativo) {
                    setCampanhas(resposta.data.campanhas || []);
                }
            } catch {
                if (ativo) {
                    setErro('Não foi possível carregar as campanhas.');
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarCampanhas();

        return () => {
            ativo = false;
        };
    }, []);

    async function vincular(e) {
        e.preventDefault();

        if (salvando || carregando) {
            return;
        }

        setErro('');
        setSucesso('');

        const token = sessionStorage.getItem('token');

        if (!token) {
            setErro('Faça login para continuar.');
            return;
        }

        if (!idGrupo || !idCampanha || !Number.isInteger(Number(meta)) || Number(meta) <= 0) {
            setErro('Selecione uma campanha e informe uma meta válida.');
            return;
        }

        setSalvando(true);

        try {
            const resposta = await api.post(
                '/api/grupoCampanhas',
                {
                    id_grupo: Number(idGrupo),
                    id_campanha: Number(idCampanha),
                    meta_participacoes: Number(meta)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSucesso('Campanha vinculada ao grupo com sucesso!');
            setIdCampanha('');
            aoVincular?.(resposta.data.id);

        } catch (error) {
            setErro(
                error.response?.data?.erro || 'Não foi possível vincular a campanha.'
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <form className="vincular-campanha" onSubmit={vincular}>
            <h2>Vincular campanha ao grupo</h2>

            <label htmlFor="campanha-vinculo">Campanha</label>
            <select
                id="campanha-vinculo"
                value={idCampanha}
                onChange={e => setIdCampanha(e.target.value)}
                disabled={carregando || salvando}
                required
            >

                <option value="">Selecione uma campanha</option>

                {campanhas.map(campanha => (
                    <option
                        key={campanha.id_campanha}
                        value={campanha.id_campanha}
                    >

                        {campanha.nome_campanha}
                    </option>
                ))}
            </select>

            {carregando && <p role="status">Carregando campanhas...</p>}

            {!carregando && !erro && campanhas.length === 0 && (
                <p>Nenhuma campanha disponível no momento.</p>
            )}

            <label htmlFor="meta-vinculo">Meta de participações</label>
            <input
                id="meta-vinculo"
                type="number"
                min="1"
                step="1"
                value={meta}
                onChange={e => setMeta(e.target.value)}
                disabled={salvando}
                required
            />

            <button
                type="submit"
                disabled={carregando || salvando || !idGrupo || !idCampanha}
            >
                {salvando ? 'Vinculando...' : 'Vincular campanha'}
            </button>

            {erro && <p role="alert">{erro}</p>}
            {sucesso && <p role="status">{sucesso}</p>}
        </form>
    );
}
