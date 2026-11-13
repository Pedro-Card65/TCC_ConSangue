const UFS = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT',
  'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO',
  'RR', 'SC', 'SP', 'SE', 'TO'
]);
const municipiosEmCache = new Map();

function normalizar(valor) {
  return String(valor || '').trim().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

function erroValidacao(mensagem, status = 422) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

export async function validarLocalizacao(cidade, estado) {
  const uf = String(estado || '').trim().toUpperCase();
  const municipio = String(cidade || '').trim();

  if (!UFS.has(uf)) throw erroValidacao('Selecione um estado brasileiro válido.');
  if (!municipio || municipio.length > 100) {
    throw erroValidacao('Selecione uma cidade válida.');
  }

  let nomes = municipiosEmCache.get(uf);
  if (!nomes) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), 6500);
    try {
      const resposta = await fetch(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados/' + uf + '/municipios',
        { signal: controlador.signal }
      );
      if (!resposta.ok) throw new Error('IBGE indisponível');
      const dados = await resposta.json();
      if (!Array.isArray(dados) || !dados.length) throw new Error('Municípios indisponíveis');
      nomes = new Set(dados.map(item => normalizar(item.nome)));
      municipiosEmCache.set(uf, nomes);
    } catch {
      throw erroValidacao('Não foi possível validar a cidade agora. Tente novamente.', 503);
    } finally {
      clearTimeout(temporizador);
    }
  }
  if (!nomes.has(normalizar(municipio))) {
    throw erroValidacao('A cidade não pertence ao estado selecionado.');
  }
  return { cidade: municipio, estado: uf };
}
