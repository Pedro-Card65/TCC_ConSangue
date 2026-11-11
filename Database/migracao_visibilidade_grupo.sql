-- Executar UMA VEZ em bancos existentes, depois de backup e verificacao de schema.
-- Antes: SHOW COLUMNS FROM ConSangue.grupos LIKE 'visibilidade';
-- Grupos existentes ficam privados para preservar os convites atuais.
ALTER TABLE ConSangue.grupos
    ADD COLUMN visibilidade ENUM('publico', 'privado') NOT NULL DEFAULT 'privado';
