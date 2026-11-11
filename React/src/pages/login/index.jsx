
import './index.scss';
import { useState } from 'react'
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import LogoSlogan from '../../componentes/logo-slogan/logo-slogan';


export default function Login() {

          const [Cap, setCap] = useState('')
          const [Senha, setSenha] = useState('') 

      function capturaCPF(e){
      let user = e.target.value
      setCap(user)
    }

      function capturaSenha(e){
      let senha = e.target.value
      setSenha(senha)
    }
    const [def, setDef] = useState('Login')
    const navigate = useNavigate();

const [erro, setErro] = useState('');
const [carregando, setCarregando] = useState(false);

async function fazerLogin(e) {
    e.preventDefault();

    setErro('');
    setCarregando(true);

    try {
        const resposta = await api.post(
            '/api/usuarios/login',
            {
                cpf: Cap,
                senha: Senha
            }
        );

        const dados = resposta.data;

        sessionStorage.setItem('token', dados.token);

        sessionStorage.setItem(
            'usuario',
            JSON.stringify(dados.usuario)
        );

        navigate('/home', { replace: true });

    } catch (erro) {
        const mensagem = erro.response?.data?.erro
            || 'Não foi possível realizar o login.';

        setErro(mensagem);
    } finally {
        setCarregando(false);
    }
}
function troca() {
  if (def === 'Login') {
    setDef('Cadastro')
  } else {
    setDef('Login')
  }
}
const [confirmarSenha, setConfirmarSenha] = useState('');

function alterarCadastro(e) {
    const { name, value } = e.target;

    setCadastro({
        ...cadastro,
        [name]: value
    });
}
const [cadastro, setCadastro] = useState({
    usuario: '',
    nascimento: '',
    cpf: '',
    telefone: '',
    email: '',
    cidade: '',
    tipo_sangue: '',
    tipo_usuario: 'candidato',
    senha: ''
});

////////////////////////////////////////////////////////////////////////////////
if (def === 'Login'){
  return (
    <div className="Background auth-page auth-page--login">

      <main className="Login">
        <div className="Login-logo">
          <div className="auth-brand"><LogoSlogan/></div>
        </div>

        <h1>Fazer Login na sua Conta</h1>

        <form onSubmit={fazerLogin}>

    <input
        type="text"
        placeholder="Digite seu CPF"
        required
        value={Cap}
        onChange={capturaCPF}
    />

    <input
        type="password"
        placeholder="Digite sua senha"
        required
        value={Senha}
        onChange={capturaSenha}
    />

    {erro && <p className="erro-login">{erro}</p>}

    <button
        type="submit"
        className="Entrar"
        disabled={carregando}
    >
        {carregando ? 'Entrando...' : 'Entrar'}
    </button>

</form>

        <div className="auth-switch"><p>É a sua primeira vez por aqui?</p><button type="button" className="Troca" onClick={troca}>Faça o seu cadastro!</button></div>
      </main>
    </div>
  )
}
async function fazerCadastro(e) {
    e.preventDefault();

    setErro('');

    // Verifica se as senhas coincidem
    if (cadastro.senha !== confirmarSenha) {
        setErro('As senhas não coincidem.');
        return;
    }

    if (cadastro.senha.length < 8) {
        setErro('A senha precisa ter pelo menos 8 caracteres.');
        return;
    }

    setCarregando(true);

    try {
        const resposta = await api.post(
            '/api/usuarios/cadastro',
            {
                ...cadastro,
                cpf: cadastro.cpf.replace(/\D/g, ''),
                telefone: cadastro.telefone.replace(/\D/g, '')
            }
        );

        alert(resposta.data.mensagem);

        // Limpa o formulário
        setCadastro({
            usuario: '',
            nascimento: '',
            cpf: '',
            telefone: '',
            email: '',
            cidade: '',
            tipo_sangue: '',
            tipo_usuario: 'candidato',
            senha: ''
        });

        setConfirmarSenha('');

        // Volta para a tela de login
        setDef('Login');

    } catch (erro) {
        setErro(
            erro.response?.data?.erro ||
            'Não foi possível realizar o cadastro.'
        );
    } finally {
        setCarregando(false);
    }
}
// Tela de cadastro
    return (
    <div className="Background auth-page auth-page--cadastro">
        <LogoSlogan/>
  
        <main className="Cadastro">
          <h1>Realizar Cadastro</h1>
  
          <form onSubmit={fazerCadastro}>

    <div className="box">
        <p>Nome Completo *</p>
        <input
            type="text"
            name="usuario"
            placeholder="Digite seu nome completo"
            value={cadastro.usuario}
            onChange={alterarCadastro}
            required
        />
    </div>

    <div className="box">
        <p>CPF *</p>
        <input
            type="text"
            name="cpf"
            placeholder="123.456.789-00"
            value={cadastro.cpf}
            onChange={alterarCadastro}
            required
        />
    </div>

    <div className="box">
        <p>Data de Nascimento *</p>
        <input
            type="date"
            name="nascimento"
            value={cadastro.nascimento}
            onChange={alterarCadastro}
            required
        />
    </div>

    <div className="box">
        <p>Telefone *</p>
        <input
            type="tel"
            name="telefone"
            placeholder="(11) 99999-9999"
            value={cadastro.telefone}
            onChange={alterarCadastro}
            required
        />
    </div>

    <div className="box">
        <p>E-mail *</p>
        <input
            type="email"
            name="email"
            placeholder="Digite seu e-mail"
            value={cadastro.email}
            onChange={alterarCadastro}
            required
        />
    </div>

    <div className="box">
        <p>Cidade *</p>
        <input
            type="text"
            name="cidade"
            placeholder="Digite sua cidade"
            value={cadastro.cidade}
            onChange={alterarCadastro}
            required
        />
    </div>
 {/* sem scss por questões de classificação, mas vou dar uma arrumada dps */}
    <div className="box">
        <p>Tipo Sanguíneo</p>
        <select
            name="tipo_sangue"
            value={cadastro.tipo_sangue}
            onChange={alterarCadastro}
        >
            <option value="">Não informado</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
        </select>
    </div>
 {/* sem scss por questões de classificação, mas vou dar uma arrumada dps */}
    <div className="box">
        <p>Tipo de Usuário *</p>
        <select
            name="tipo_usuario"
            value={cadastro.tipo_usuario}
            onChange={alterarCadastro}
            required
        >
            <option value="candidato">Candidato</option>
            <option value="instituicao">Instituição</option>
        </select>
    </div>

    <div className="box">
        <p>Senha *</p>
        <input
            type="password"
            name="senha"
            placeholder="Digite sua senha"
            value={cadastro.senha}
            onChange={alterarCadastro}
            minLength={8}
            required
        />
    </div>

    <div className="box">
        <p>Confirmação de Senha *</p>
        <input
            type="password"
            placeholder="Digite sua senha novamente"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
        />
    </div>

    {erro && <p className="erro-login">{erro}</p>}

    <button
        type="submit"
        className="Entrar"
        disabled={carregando}
    >
        {carregando ? 'Cadastrando...' : 'Criar Conta'}
    </button>

</form>
      
          <div className="auth-switch"><button type="button" className="Troca" onClick={troca}>Voltar para a tela de login</button></div>
        </main>
  
      </div>
    ); 

}
