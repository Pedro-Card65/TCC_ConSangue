-- Migração: foto de perfil do usuário
-- Execute uma única vez no banco que já existe (local e Railway).
ALTER TABLE ConSangue.usuarios ADD COLUMN foto_perfil MEDIUMTEXT NULL;
