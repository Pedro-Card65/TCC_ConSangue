import './index.scss';
import LogoSlogan from '../../componentes/logo-slogan/logo-slogan.jsx';
import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

const STATUS = {
  comparecimento_informado: { texto: 'Compareceu', classe: 'compareceu' },
  interessado: { texto: 'Interesse', classe: 'interesse' },
  pretende_ir: { texto: 'Planejada', classe: 'planejada' },
};

const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—');


export default function User() {

  const [usuario, setUsuario] = useState(null);
  const [estatisticas, setEstatisticas] = useState({ grupos: 0, participadas: 0, interesse: 0 });
  const [proximaCampanha, setProximaCampanha] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
  let ativo = true;
  const token = localStorage.getItem('token'); // use a mesma chave que o login salva

  if (!token) { setCarregando(false); return; }

  const headers = { Authorization: `Bearer ${token}` };

  async function carregar() {
    try {
      const me = (await api.get('/api/usuarios/me', { headers })).data;
      const id = me.id_usuario ?? me.usuario?.id_usuario;

      const [busca, grupos, parts, camps] = await Promise.all([
        api.get(`/api/usuarios/busca/${id}`, { headers }),
        api.get(`/api/grupos/usuario/${id}`, { headers }),
        api.get('/api/participacoes', { headers }),
        api.get('/api/campanhas'),
      ]);

      if (!ativo) return;

      const u = busca.data.usuario ?? busca.data;
      const listaGrupos = grupos.data.grupos ?? [];
      const listaCamps = camps.data.campanhas ?? [];
      const listaParts = (parts.data.participacoes ?? [])
        .filter((p) => p.id_usuario === id); // remova se a API já filtra pelo token

      const cruzadas = listaParts.map((p) => {
        const c = listaCamps.find((x) => x.id_campanha === p.id_campanha) || {};
        return { ...p, ...c, data: p.data_prevista || p.data_registro };
      });

      setUsuario(u);
      setEstatisticas({
        grupos: listaGrupos.length,
        participadas: listaParts.filter((p) => p.status === 'comparecimento_informado').length,
        interesse: listaParts.filter((p) => p.status === 'interessado').length,
      });
      setProximaCampanha(
        cruzadas
          .filter((p) => p.status === 'pretende_ir' && new Date(p.data_prevista) > new Date())
          .sort((a, b) => new Date(a.data_prevista) - new Date(b.data_prevista))[0] || null
      );
      setHistorico(cruzadas);
    } catch (e) {
      if (ativo) setErro(true);
    } finally {
      if (ativo) setCarregando(false);
    }
  }

  carregar();
  return () => { ativo = false; };
}, []);
    if (carregando) return <p>Carregando perfil...</p>;
    if (!localStorage.getItem('token')) return <p>Faça login para ver seu perfil.</p>;
    if (erro || !usuario) return <p role="alert">Não foi possível carregar o perfil.</p>;
  return (

    <div className="pagina-user">

      <LogoSlogan />

      <div className="pesquisa">
        <img src="/assets/icons/LupaPesquisa.png" alt="" />
        <input
          type="text"
          aria-label="Pesquisar"
          placeholder="Pesquisar campanhas, hemocentros ou grupos..."
        />
      </div>

      <section className="user">

        <div className="informacoes-usuario">
          <div className="titulo-informacoes-usuario">
            <h3>Suas informações</h3>
          </div>

          <div className="conteudo-informacoes-usuario">
            <img src="/assets/icons/banido.png" alt="Foto do usuário" />

            <div className="coluna-user-1">
              <p>{usuario.nome}</p>
              <p>{usuario.email}</p>
              <p>{usuario.cidade}</p>
              <p>Tipo Sanguíneo: {usuario.tipo_sanguineo}</p>
            </div>

            <div className="coluna-user-2">
              <p>Ingressou em: {formatarData(usuario.data_cadastro)}</p>
              <p>{usuario.tipo_usuario} <img src="/assets/icons/mini-gota-sangue.webp" alt="" /></p>
            </div>
          </div>
        </div>

        <div className="grupos-comunidades">
          <div className="titulo-grupos-comunidades">
            <h3>Grupos e comunidades</h3>
          </div>

          <div className="conteudo-grupos-comunidades">
            <div className="estatistica">
              <div className="valor-estatistica">
                <img src="/assets/icons/grupos-vermelho.webp" alt="" />
                <span>{estatisticas.grupos}</span>
              </div>
              <p>Grupos</p>
            </div>

            <div className="estatistica">
              <div className="valor-estatistica">
                <img src="/assets/icons/check-vermelho.png" alt="" />
                <span>{estatisticas.participadas}</span>
              </div>
              <p>Campanhas participadas</p>
            </div>

            <div className="estatistica">
              <div className="valor-estatistica">
                <img src="/assets/icons/coracao-vermelho.png" alt="" />
                <span>{estatisticas.interesse}</span>
              </div>
              <p>Campanhas de interesse</p>
            </div>
          </div>
        </div>

        <div className="proxima-campanha">
          <div className="titulo-proxima-campanha">
            <h3>Próxima campanha</h3>
          </div>

          <div className="conteudo-proxima-campanha">
            {proximaCampanha ? (
              <>
                <div className="informacoes-proxima-campanha">
                  <div className="data-proxima-campanha">
                    <h2>{formatarData(proximaCampanha.data_prevista)}</h2>
                  </div>

                  <div className="informacoes-encontro-proxima-campanha">
                    <h2>{proximaCampanha.nome_campanha}</h2>
                    <p>{proximaCampanha.nome_hemo}</p>
                    <p>{proximaCampanha.horario_inicio} - {proximaCampanha.cidade}</p>
                  </div>

                  <div className="confirmacao">
                    <h2>{STATUS[proximaCampanha.status]?.texto}</h2>
                  </div>
                </div>

                <div className="acessar-proxima-campanha">
                  <button type="button">Ver detalhes da campanha</button>
                </div>
              </>
            ) : (
              <p>Você não tem nenhuma campanha planejada</p>
            )}
          </div>
        </div>

        <div className="historico-campanhas">
          <div className="titulo-historico-campanhas">
            <h3>Histórico de campanhas</h3>
          </div>

          <div className="conteudo-historico-campanhas">
            {historico.length > 0 ? (
              <ul>
                {historico.map((h) => (
                  <li className="informacoes-historico-campanhas" key={h.id_participacao ?? h.id_campanha}>
                    <p>
                      {h.nome_campanha} — {h.nome_hemo} •{' '}
                      {h.status === 'comparecimento_informado' ? 'Realizada em' : 'Interesse em'}{' '}
                      {formatarData(h.data)}
                    </p>
                    <span className={`status-historico ${STATUS[h.status]?.classe}`}>
                      {STATUS[h.status]?.texto}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Você ainda não tem histórico de campanhas</p>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}