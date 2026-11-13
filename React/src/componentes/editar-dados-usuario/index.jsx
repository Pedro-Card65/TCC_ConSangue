import { useState } from 'react';
import { api } from '../../services/api';
import LocalizacaoBrasil from '../localizacao-brasil';
import './index.scss';

const TIPOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EditarDadosUsuario({ usuario, aoSalvar, aoCancelar }) {
  const [campos, setCampos] = useState({
    nome: usuario.nome || '',
    email: usuario.email || '',
    telefone: usuario.telefone || '',
    tipo_sanguineo: usuario.tipo_sanguineo || ''
  });
  const [estado, setEstado] = useState('');
  const [novaCidade, setNovaCidade] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(evento) {
    evento.preventDefault();
    if (salvando) return;
    if (estado && !novaCidade) {
      setErro('Selecione a cidade do estado informado.');
      return;
    }
    setErro('');
    setSalvando(true);
    try {
      const dados = { ...campos, senhaAtual };
      if (estado && novaCidade) {
        dados.estado = estado;
        dados.cidade = novaCidade;
      }
      const resposta = await api.put('/api/usuarios/me', dados, {
        headers: { Authorization: 'Bearer ' + sessionStorage.getItem('token') }
      });
      const atualizado = resposta.data.usuario;
      const armazenado = JSON.parse(sessionStorage.getItem('usuario') || '{}');
      sessionStorage.setItem('usuario', JSON.stringify({ ...armazenado,
        nome: atualizado.nome, email: atualizado.email, cidade: atualizado.cidade,
        tipo_sanguineo: atualizado.tipo_sanguineo
      }));
      aoSalvar(atualizado);
    } catch (falha) {
      setErro(falha.response?.data?.erro || 'Não foi possível atualizar os dados. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  function alterar(campo, valor) {
    setCampos(atual => ({ ...atual, [campo]: valor }));
  }

  return <form className="edicao-dados-usuario" onSubmit={salvar}>
    <h3>Editar dados da conta</h3>
    <p>Atualize seus dados pessoais. O CPF e a data de nascimento não podem ser alterados por aqui.</p>
    <fieldset disabled={salvando}>
      <label>Nome completo *
        <input name="nome" value={campos.nome} required minLength={3} maxLength={100}
          autoComplete="name" onChange={evento => alterar('nome', evento.target.value)} />
      </label>
      <label>E-mail *
        <input type="email" name="email" value={campos.email} required maxLength={100}
          autoComplete="email" onChange={evento => alterar('email', evento.target.value)} />
      </label>
      <label>Telefone *
        <input type="tel" name="telefone" value={campos.telefone} required maxLength={20}
          autoComplete="tel" onChange={evento => alterar('telefone', evento.target.value)} />
      </label>
      <label>Tipo sanguíneo
        <select name="tipo_sanguineo" value={campos.tipo_sanguineo}
          onChange={evento => alterar('tipo_sanguineo', evento.target.value)}>
          <option value="">Não informado</option>
          {TIPOS.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
        </select>
      </label>
      <div className="edicao-cidade">
        <p>Cidade atual: <strong>{usuario.cidade || 'Não informada'}</strong></p>
        <p>Para alterar a cidade, selecione um estado e um município abaixo.</p>
        <LocalizacaoBrasil obrigatorio={false} estado={estado} cidade={novaCidade}
          aoAlterar={alteracoes => {
            if (Object.prototype.hasOwnProperty.call(alteracoes, 'estado')) {
              setEstado(alteracoes.estado);
              setNovaCidade('');
            }
            if (Object.prototype.hasOwnProperty.call(alteracoes, 'cidade')) {
              setNovaCidade(alteracoes.cidade);
            }
          }} />
      </div>
      <label>Senha atual para confirmar as alterações *
        <input type="password" autoComplete="current-password" value={senhaAtual}
          required onChange={evento => setSenhaAtual(evento.target.value)} />
      </label>
      {erro && <p className="edicao-erro" role="alert">{erro}</p>}
      <div className="edicao-acoes">
        <button type="submit">{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
        <button type="button" className="edicao-cancelar" onClick={aoCancelar}>Cancelar</button>
      </div>
    </fieldset>
  </form>;
}
