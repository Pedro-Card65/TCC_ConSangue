
import './index.scss';
import './index2.scss';
import { Link } from 'react-router-dom';
import { useState } from 'react'

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

     function teste(){
        alert(`Seu login é ${Cap} e ${Senha}`)
      }

    const [def, setDef] = useState('Login')

function troca() {
  if (def === 'Login') {
    setDef('Cadastro')
  } else {
    setDef('Login')
  }
}


////////////////////////////////////////////////////////////////////////////////
if (def === 'Login'){
  return (
    <div className="Background">
      <div className="Consangue">
        <div className="Logo">
          <img src="/assets/images/Logo.png" alt="Logo" />
        </div>

        <div className="Marca">
          <h2>ConSangue</h2>
          <p>Mobilização Coletiva para<br />Doação de Sangue</p>
        </div>
      </div>

      <main className="Login">
        <h1>Fazer Login na sua Conta</h1>

        <form onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Digite seu CPF ou telefone" required onChange={capturaCPF}/>

          <input type="password" placeholder="Digite sua Senha" required onChange={capturaSenha}/>
          <button type="submit" className="Entrar" onClick={teste}>Entrar</button>
        </form>

        <div className="Cadastro"><p>É a sua primeira vez por aqui?<p className='Troca' onClick={troca}>Faça o seu Cadastro!</p></p></div>
      </main>

    </div>
  )
}

// Tela de cadastro
    return (
      <div className="Background">
        <div className="Consangue">
          <div className="Logo">
            <img src="/assets/images/Logo.png" alt="Logo" />
          </div>
  
          <div className="Marca">
            <h2>ConSangue</h2>
            <p>Mobilização Coletiva para <br/> Doação de Sangue</p>
          </div>
        </div>
  
        <main className="Cadastro">
          <h1>Realizar Cadastro</h1>
  
          <form onSubmit={(e) => e.preventDefault()}>
            
            <div className="box">
              <p>Nome Completo *</p>
              <input type="text" placeholder="Digite seu nome completo" required onChange={capturaCPF}/>
            </div>

            <div className="box">
              <p>CPF *</p>
              <input type="text" placeholder='123.456.789-00'/>
            </div>

            <div className="box">
              <p>Data de Nascimento *</p>
              <input type="date"/>
            </div>

            <div className="box">
              <p>Telefone *</p>
              <input type="tel" placeholder='(00) 1234-56789' />
            </div>

            <div className="box">
              <p>E-mail *</p>
              <input type="email" placeholder='Digite seu e-mail' />
            </div>

            <div className="box">
              <p>Cidade</p>
              <input type="text" placeholder='Digite sua cidade' />
            </div>

            <div className="box">
              <p>Tipo Sanguineo</p>
              <input type="text" placeholder='Ex.: O-' />
            </div>

            <div className="box">
              <p>Tipo de Usuário *</p>
              <input type="text" placeholder='Escolha' />
            </div>

            <div className="box">
              <p>Senha *</p>
              <input type="password" placeholder='Digite sua senha'/>
            </div>

            <div className="box">
              <p>Confirmação de Senha *</p>
              <input type="text" placeholder='Digite sua senha novamente' />
            </div>


          </  form>
      
          <div className="Cadastro"><p>É a sua primeira vez por aqui? <p className='Troca' onClick={troca}>Faça o seu Cadastro!</p></p></div>
        </main>
  
      </div>
    ); 

}
