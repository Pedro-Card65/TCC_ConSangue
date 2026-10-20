
import './index.scss';
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

        <div className="Cadastro"><p>É a sua primeira vez por aqui?<p className='Troca' onClick={troca}>Faça o seu Cadastro!</p></p>
        <p>Gostaria de cadastrar um hemocentro?<p className='Troca' onClick={troca}>Clique aqui!</p></p>
        </div>
      </main>
    </div>
  )
}
  ///////////////////////////////////////////////////////////////////////////////
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
  
        <main className="Login">
          <h1>Fazer cadastro na sua Conta</h1>
  
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Digite seu CPF ou telefone" required onChange={capturaCPF}/>
  
            <input type="password" placeholder="Digite sua Senha" required onChange={capturaSenha}/>
            <button type="submit" className="Entrar" onClick={teste}>Entrar</button>
          </form>
  
          <div className="Cadastro"><p>É a sua primeira vez por aqui? <p className='Troca' onClick={troca}>Faça o seu Cadastro!</p></p></div>
        </main>
  
      </div>
    ); 

}
