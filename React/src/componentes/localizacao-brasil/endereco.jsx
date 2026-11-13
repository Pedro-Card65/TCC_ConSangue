import { useEffect, useRef, useState } from 'react';
import LocalizacaoBrasil from './index';

export function combinarEnderecoFormulario(dados) {
  const endereco = String(dados.endereco || '').trim();
  const numero = String(dados.numero || '').trim();
  const resto = { ...dados };
  delete resto.numero;
  return {
    ...resto,
    endereco: numero ? endereco + ', ' + numero : endereco
  };
}

function separarEndereco(endereco) {
  const original = String(endereco || '');
  const partes = original.match(/^(.*),\s*(\d+[A-Za-z/-]*|s\/n)$/i);
  return partes ? { logradouro: partes[1], numero: partes[2] } :
    { logradouro: original, numero: '' };
}

export default function EnderecoInstituicao({ instituicao }) {
  const [campos, setCampos] = useState(() => {
    const endereco = separarEndereco(instituicao?.endereco);
    return {
      cep: instituicao?.cep || '',
      endereco: endereco.logradouro,
      numero: endereco.numero,
      estado: instituicao?.estado || '',
      cidade: instituicao?.cidade || ''
    };
  });
  const [mensagemCep, setMensagemCep] = useState('');
  const cepInicial = useRef(String(instituicao?.cep || '').replace(/\D/g, ''));

  useEffect(() => {
    const cep = campos.cep.replace(/\D/g, '');
    if (cep.length !== 8 || cep === cepInicial.current) return undefined;

    const controlador = new AbortController();
    const temporizador = setTimeout(() => {
      setMensagemCep('Consultando CEP...');
      fetch('https://viacep.com.br/ws/' + cep + '/json/', { signal: controlador.signal })
        .then(resposta => {
          if (!resposta.ok) throw new Error('Consulta indisponível');
          return resposta.json();
        })
        .then(dados => {
          if (controlador.signal.aborted) return;
          if (dados.erro) {
            setMensagemCep('CEP não encontrado. Verifique o número ou preencha o endereço manualmente.');
            return;
          }
          cepInicial.current = cep;
          setCampos(atual => ({
            ...atual,
            endereco: dados.logradouro || atual.endereco,
            estado: dados.uf || atual.estado,
            cidade: dados.localidade || atual.cidade
          }));
          setMensagemCep('Endereço preenchido pelo CEP. Você pode corrigir a rua e os outros campos.');
        })
        .catch(() => {
          if (!controlador.signal.aborted) setMensagemCep('Não foi possível consultar o CEP. Preencha o endereço manualmente.');
        });
    }, 350);

    return () => {
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [campos.cep]);

  function alterar(nome, valor) {
    setCampos(anterior => ({ ...anterior, [nome]: valor }));
  }

  return <>
    <label>CEP *
      <input name="cep" type="text" inputMode="numeric" autoComplete="postal-code"
        value={campos.cep} maxLength={9} pattern="[0-9]{5}-?[0-9]{3}" required
        placeholder="00000-000"
        onChange={e => {
          const numeros = e.target.value.replace(/\D/g, '').slice(0, 8);
          alterar('cep', numeros.length > 5 ? numeros.slice(0, 5) + '-' + numeros.slice(5) : numeros);
          setMensagemCep('');
        }} />
    </label>
    {mensagemCep && <small role="status" className="mensagem-cep">{mensagemCep}</small>}
    <label>Endereço / rua *
      <input name="endereco" value={campos.endereco} maxLength={230} required
        placeholder="Rua, avenida ou praça"
        autoComplete="address-line1" onChange={e => alterar('endereco', e.target.value)} />
    </label>
    <label>Número (se houver)
      <input name="numero" value={campos.numero} maxLength={20} placeholder="Ex.: 125 ou S/N"
        autoComplete="address-line2" onChange={e => alterar('numero', e.target.value)} />
    </label>
    <LocalizacaoBrasil estado={campos.estado} cidade={campos.cidade}
      aoAlterar={alteracoes => setCampos(anterior => ({ ...anterior, ...alteracoes }))} />
  </>;
}
