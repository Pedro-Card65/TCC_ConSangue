import './index.scss';

export default function Grupos() {
  return (
    <div className="bloco">
        <h1>MEUS GRUPOS</h1>

        <div className="botoes">

          <button id='criar'>
            Criar novo grupo
            <img src="/assets/icons/add.png" alt="" />
          </button>

          <button id='entrar'>
            Entrar com Código
          </button>

        </div>

        <div className="grupos">

          <div className="gru">

            <div className="titulo">
              
              <img src="/assets/icons/mao.png" alt="" />
                
                <div className="text">
                  
                  <h2>Nome</h2>
                  <p>Membros</p>
                
                </div>

                <img src="/assets/icons/gotaAdd.png" alt="" id='gota'/>

            </div>

            <p>・Campanha + Amor - Hospital Abidas</p>
          </div>

          
        </div>
    </div>
  );
}