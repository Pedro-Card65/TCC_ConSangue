-- DEMONSTRAÇÃO LOCAL: use somente no banco local ConSangue, nunca em produção.
-- CPFs inválidos de propósito (o login aceita 11 dígitos); e-mails usam .invalid.
-- Senha para as três contas: DemoConSangue2026!
USE ConSangue;
START TRANSACTION;

INSERT INTO usuarios (nome, data_nascimento, cpf, telefone, email, senha_hash, cidade, tipo_sanguineo, tipo_usuario)
VALUES ('Instituição Demonstração', '1980-01-01', '12345678900', '0000000000', 'instituicao.demo@consangue.example.invalid', '$2b$12$zIKVvdMX.FkjnxsdMEzZ8OFMKauxObrQOt4gtesX1zfioHD9Vjx0C', 'Cidade Modelo', NULL, 'instituicao')
ON DUPLICATE KEY UPDATE id_usuario = LAST_INSERT_ID(id_usuario), senha_hash = VALUES(senha_hash);
SET @id_instituicao = LAST_INSERT_ID();

INSERT INTO usuarios (nome, data_nascimento, cpf, telefone, email, senha_hash, cidade, tipo_sanguineo, tipo_usuario)
VALUES ('Candidata Demonstração A', '1990-02-03', '12345678901', '0000000001', 'candidata.a@consangue.example.invalid', '$2b$12$zIKVvdMX.FkjnxsdMEzZ8OFMKauxObrQOt4gtesX1zfioHD9Vjx0C', 'Cidade Modelo', 'O+', 'candidato')
ON DUPLICATE KEY UPDATE id_usuario = LAST_INSERT_ID(id_usuario), senha_hash = VALUES(senha_hash);
SET @id_candidata_a = LAST_INSERT_ID();

INSERT INTO usuarios (nome, data_nascimento, cpf, telefone, email, senha_hash, cidade, tipo_sanguineo, tipo_usuario)
VALUES ('Candidato Demonstração B', '1995-04-05', '12345678902', '0000000002', 'candidato.b@consangue.example.invalid', '$2b$12$zIKVvdMX.FkjnxsdMEzZ8OFMKauxObrQOt4gtesX1zfioHD9Vjx0C', 'Cidade Modelo', 'AB+', 'candidato')
ON DUPLICATE KEY UPDATE id_usuario = LAST_INSERT_ID(id_usuario), senha_hash = VALUES(senha_hash);
SET @id_candidato_b = LAST_INSERT_ID();

INSERT INTO hemocentros (id_usuario, nome_hemo, cep, endereco, cidade, estado, telefone_centro)
SELECT @id_instituicao, 'Hemocentro Modelo (fictício)', '00000-000', 'Rua Fictícia, 100', 'Cidade Modelo', 'SP', '0000000000'
WHERE NOT EXISTS (SELECT 1 FROM hemocentros WHERE id_usuario = @id_instituicao);

COMMIT;

SELECT 'Instituição' AS perfil, id_usuario, cpf, email FROM usuarios WHERE email = 'instituicao.demo@consangue.example.invalid'
UNION ALL SELECT 'Candidata A', id_usuario, cpf, email FROM usuarios WHERE email = 'candidata.a@consangue.example.invalid'
UNION ALL SELECT 'Candidato B', id_usuario, cpf, email FROM usuarios WHERE email = 'candidato.b@consangue.example.invalid';