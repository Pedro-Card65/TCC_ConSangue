-- ============================================================================
-- CONSANGUE - ESTRUTURA COMPLETA DO BANCO (MYSQL)
-- ============================================================================
-- Execute em um banco NOVO, nunca diretamente sobre o banco em producao.
-- As antigas migracoes de foto de perfil, foto de grupo, convite de grupo e
-- visibilidade ja estao incorporadas aos CREATE TABLE abaixo.
-- NAO repita os antigos ALTER TABLE: as colunas ja existem neste esquema.
-- No MySQL de producao, o esquema e os dados reais sao administrados a parte.
-- ============================================================================

CREATE DATABASE ConSangue;

USE ConSangue;

CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    tipo_sanguineo VARCHAR(3),
    tipo_usuario ENUM('candidato', 'instituicao') NOT NULL,
    foto_perfil MEDIUMTEXT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hemocentros (
    id_hemocentro INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    nome_hemo VARCHAR(100) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    telefone_centro VARCHAR(20) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario)
);

CREATE TABLE grupos (
    id_grupo INT PRIMARY KEY AUTO_INCREMENT,
    nome_grupo VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    foto_grupo MEDIUMTEXT NULL,
    codigo_convite CHAR(8) NULL UNIQUE,
    visibilidade ENUM('publico', 'privado') NOT NULL DEFAULT 'privado',
    id_criador INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_criador) 
        REFERENCES usuarios(id_usuario)
);

CREATE TABLE campanhas (
    id_campanha INT PRIMARY KEY AUTO_INCREMENT,
    id_hemocentro INT NOT NULL,
    nome_campanha VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    horario_inicio TIME,
    horario_fim TIME,
    status_campanha ENUM('ativa', 'encerrada')
        DEFAULT 'ativa' NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_hemocentro)
        REFERENCES hemocentros(id_hemocentro)
);

CREATE TABLE membros_grupo (
    id_membro INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_grupo INT NOT NULL,
    papel ENUM('administrador', 'membro')
        DEFAULT 'membro',
    data_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_grupo)
        REFERENCES grupos(id_grupo),

    UNIQUE (id_usuario, id_grupo)
);

CREATE TABLE grupos_campanhas (
    id_grupo_campanha INT PRIMARY KEY AUTO_INCREMENT,
    id_grupo INT NOT NULL,
    id_campanha INT NOT NULL,
    meta_participacoes INT NOT NULL,
    data_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_grupo)
        REFERENCES grupos(id_grupo),

    FOREIGN KEY (id_campanha)
        REFERENCES campanhas(id_campanha),

    UNIQUE (id_grupo, id_campanha)
);

CREATE TABLE participacoes (
    id_registro INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_campanha INT NOT NULL,
    id_grupo_campanha INT NULL,

    status_participacao ENUM(
        'interessado',
        'pretende_ir',
        'comparecimento_informado'
    ) DEFAULT 'interessado',

    data_prevista DATE,
    horario_previsto TIME,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_campanha)
        REFERENCES campanhas(id_campanha),

    FOREIGN KEY (id_grupo_campanha)
        REFERENCES grupos_campanhas(id_grupo_campanha),

    UNIQUE (id_usuario, id_campanha)
);

-- ============================================================================
-- SEÇÃO OPCIONAL DE DADOS FICTÍCIOS (DESATIVADA POR PADRÃO)
-- ============================================================================
-- Os comandos de dados_teste.sql foram mantidos aqui para concentrar os arquivos.
-- ATENÇÃO: nunca use estes INSERTs no Railway/produção.
-- Para preencher um banco LOCAL NOVO, execute toda a estrutura acima e depois
-- retire apenas os delimitadores /* e */ abaixo, executando SOMENTE o bloco
-- opcional em seu MySQL local. Ele cria usuário institucional com hash fictício,
-- hemocentro e duas campanhas; não permite login com a senha fictícia.
-- A execução repetida pode causar erro de CPF/e-mail duplicado.
-- ============================================================================
/*
-- =============================================================
-- DADOS DE TESTE - SOMENTE PARA AMBIENTE LOCAL
-- NÃO use dados pessoais reais. Todos os valores abaixo são fictícios.
-- NÃO execute em banco de produção.
-- Pré-requisito: as tabelas acima já foram criadas
-- =============================================================

USE ConSangue;

-- 1) Usuário do tipo 'instituicao' (exigido pela FK hemocentros.id_usuario)
INSERT INTO usuarios (nome, data_nascimento, cpf, telefone, email, senha_hash, cidade, tipo_sanguineo, tipo_usuario)
VALUES ('Instituição Teste', '1980-01-01', '000.000.000-00', '(00) 00000-0000',
        'instituicao.teste@exemplo.com', 'hash_ficticio_nao_usar', 'Cidade Teste', NULL, 'instituicao');

SET @id_usuario = LAST_INSERT_ID();

-- 2) Hemocentro (FK: id_usuario). Campos obrigatórios: id_usuario, nome_hemo, cep, endereco, cidade, estado, telefone_centro
INSERT INTO hemocentros (id_usuario, nome_hemo, cep, endereco, cidade, estado, telefone_centro)
VALUES (@id_usuario, 'Hemocentro Teste', '00000-000', 'Rua Fictícia, 123', 'Cidade Teste', 'XX', '(00) 0000-0000');

SET @id_hemocentro = LAST_INSERT_ID();

-- 3) Campanhas (FK: id_hemocentro)
-- Obrigatórias: id_hemocentro, nome_campanha, data_inicio, data_fim, status_campanha ('ativa' | 'encerrada')
-- Campanha ativa
INSERT INTO campanhas (id_hemocentro, nome_campanha, descricao, data_inicio, data_fim, horario_inicio, horario_fim, status_campanha)
VALUES (@id_hemocentro, 'Campanha Teste Ativa', 'Campanha fictícia em andamento para testes locais.',
        '2026-11-01', '2026-12-31', '08:00:00', '17:00:00', 'ativa');

-- Campanha finalizada
INSERT INTO campanhas (id_hemocentro, nome_campanha, descricao, data_inicio, data_fim, horario_inicio, horario_fim, status_campanha)
VALUES (@id_hemocentro, 'Campanha Teste Encerrada', 'Campanha fictícia já encerrada para testes locais.',
        '2026-08-01', '2026-08-31', '08:00:00', '17:00:00', 'encerrada');
*/
