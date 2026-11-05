import './index.scss';

export default function Grupos() {
  return (
    <div className="bloco">

        <div className="b2">
          
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

        </div>

        <div className="grupos">

          <div className="gru">

            <div className="titulo">
              
              <img src="/assets/grupo/mao.png" alt="" />
                
                <div className="text">
                  
                  <h2>Nome</h2>
                  <p>Membros</p>
                
                </div>

                <img src="/assets/icons/gotaAdd.png" alt="" id='gota'/>

            </div>

            <p id='desc'>・Campanha + Amor - Hospital Abidas</p>
            <button>Ver Grupo</button>

          </div>

          <div className="gru">

            <div className="titulo">
              
              <img src="/assets/grupo/group.png" alt="" />
                
                <div className="text">
                  
                  <h2>Nome</h2>
                  <p>Membros</p>
                
                </div>

                <img src="/assets/icons/gotaAdd.png" alt="" id='gota'/>

            </div>

            <p id='desc'>・Campanha + Amor - Hospital Abidas</p>
            <button>Ver Grupo</button>

          </div>

          <div className="gru">

            <div className="titulo">
              
              <img src="/assets/grupo/heart.png" alt="" />
                
                <div className="text">
                  
                  <h2>Nome</h2>
                  <p>Membros</p>
                
                </div>
    
                <img src="/assets/icons/gotaAdd.png" alt="" id='gota'/>

            </div>

            <p id='desc'>・Campanha + Amor - Hospital Abidas</p>
            <button>Ver Grupo</button>

          </div>


          
        </div>
    </div>
  );
}