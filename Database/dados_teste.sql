-- =============================================================
-- DADOS DE TESTE - SOMENTE PARA AMBIENTE LOCAL
-- NÃO use dados pessoais reais. Todos os valores abaixo são fictícios.
-- NÃO execute em banco de produção.
-- Pré-requisito: o banco ConSangue já criado com Database/ConSangue.sql
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
