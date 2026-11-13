import { useEffect, useState } from 'react';

export const ESTADOS = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins']
];

const cacheMunicipios = new Map();

export default function LocalizacaoBrasil({ estado = '', cidade = '', aoAlterar, obrigatorio = true }) {
  const [municipios, setMunicipios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!estado) {
      setMunicipios([]);
      setErro('');
      setCarregando(false);
      return undefined;
    }

    if (cacheMunicipios.has(estado)) {
      setMunicipios(cacheMunicipios.get(estado));
      setErro('');
      setCarregando(false);
      return undefined;
    }

    const controlador = new AbortController();
    setCarregando(true);
    setErro('');

    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/' +
      encodeURIComponent(estado) + '/municipios?orderBy=nome', { signal: controlador.signal })
      .then(resposta => {
        if (!resposta.ok) throw new Error('Serviço indisponível');
        return resposta.json();
      })
      .then(dados => {
        if (!Array.isArray(dados) || !dados.length) throw new Error('Lista de municípios inválida');
        const nomes = dados.map(item => item.nome).filter(Boolean)
          .sort((a, b) => a.localeCompare(b, 'pt-BR'));
        cacheMunicipios.set(estado, nomes);
        if (!controlador.signal.aborted) setMunicipios(nomes);
      })
      .catch(() => {
        if (!controlador.signal.aborted) {
          setMunicipios([]);
          setErro('Não foi possível carregar os municípios. Selecione o estado novamente.');
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCarregando(false);
      });

    return () => controlador.abort();
  }, [estado]);

  return <>
    <label>Estado (UF) *
      <select name="estado" value={estado} required={obrigatorio}
        onChange={evento => aoAlterar({ estado: evento.target.value, cidade: '' })}>
        <option value="">Selecione o estado</option>
        {ESTADOS.map(([sigla, nome]) =>
          <option key={sigla} value={sigla}>{nome} ({sigla})</option>)}
      </select>
    </label>
    <label>Cidade *
      <select name="cidade" value={cidade} required={obrigatorio}
        disabled={!estado || carregando || municipios.length === 0}
        onChange={evento => aoAlterar({ cidade: evento.target.value })}>
        <option value="">{!estado ? 'Selecione primeiro o estado' : carregando ? 'Carregando cidades...' : 'Selecione a cidade'}</option>
        {municipios.map(nome => <option key={nome} value={nome}>{nome}</option>)}
      </select>
    </label>
    {erro && <small role="alert" className="erro-localizacao">{erro}</small>}
  </>;
}
