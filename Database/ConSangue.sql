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
