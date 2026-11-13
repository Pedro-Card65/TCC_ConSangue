// Cidades de referência local: não dependem da disponibilidade do IBGE
// ou de serviços de terceiros para o cadastro funcionar.
import { useMemo } from 'react';
import municipiosPorUf from '../../data/municipios.json';

export const ESTADOS = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins']
];

function normalizar(valor) {
  return String(valor || '').trim().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export default function LocalizacaoBrasil({ estado = '', cidade = '', aoAlterar, obrigatorio = true }) {
  const municipios = useMemo(() => municipiosPorUf[estado] || [], [estado]);
  const cidadeSelecionada = useMemo(() =>
    municipios.find(nome => normalizar(nome) === normalizar(cidade)) || '',
    [municipios, cidade]
  );

  return <>
    <label>Estado (UF) {obrigatorio && '*'}
      <select name="estado" value={estado} required={obrigatorio}
        onChange={evento => aoAlterar({ estado: evento.target.value, cidade: '' })}>
        <option value="">Selecione o estado</option>
        {ESTADOS.map(([sigla, nome]) =>
          <option key={sigla} value={sigla}>{nome} ({sigla})</option>)}
      </select>
    </label>
    <label>Cidade {obrigatorio && '*'}
      <select name="cidade" value={cidadeSelecionada} required={obrigatorio}
        disabled={!estado}
        onChange={evento => aoAlterar({ cidade: evento.target.value })}>
        <option value="">{!estado ? 'Selecione primeiro o estado' : 'Selecione a cidade'}</option>
        {municipios.map(nome => <option key={nome} value={nome}>{nome}</option>)}
      </select>
    </label>
  </>;
}
