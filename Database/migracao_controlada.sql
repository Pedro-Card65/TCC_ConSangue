-- ConSangue: migração incremental controlada de tabelas já existentes.
-- ANTES: exporte um backup verificável e execute no banco de desenvolvimento.
-- Somente depois de revisar o resultado aplique em produção pelo administrador.
-- NUNCA execute Database/ConSangue.sql em um banco já existente.
-- Selecione o banco correto antes de executar esta migração.
SELECT DATABASE() AS banco_selecionado;

-- Grupos: visibilidade, foto e código de convite.
SET @tem_coluna := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='grupos' AND COLUMN_NAME='visibilidade');
SET @comando := IF(@tem_coluna=0,
  "ALTER TABLE grupos ADD COLUMN visibilidade ENUM('publico','privado') NOT NULL DEFAULT 'privado'",
  'SELECT 1');
PREPARE etapa FROM @comando; EXECUTE etapa; DEALLOCATE PREPARE etapa;

SET @tem_coluna := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='grupos' AND COLUMN_NAME='foto_grupo');
SET @comando := IF(@tem_coluna=0,
  'ALTER TABLE grupos ADD COLUMN foto_grupo MEDIUMTEXT NULL',
  'SELECT 1');
PREPARE etapa FROM @comando; EXECUTE etapa; DEALLOCATE PREPARE etapa;

SET @tem_coluna := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='grupos' AND COLUMN_NAME='codigo_convite');
SET @comando := IF(@tem_coluna=0,
  'ALTER TABLE grupos ADD COLUMN codigo_convite CHAR(8) NULL UNIQUE',
  'SELECT 1');
PREPARE etapa FROM @comando; EXECUTE etapa; DEALLOCATE PREPARE etapa;

-- Campanhas: foto opcional.
SET @tem_coluna := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='campanhas' AND COLUMN_NAME='foto_campanha');
SET @comando := IF(@tem_coluna=0,
  'ALTER TABLE campanhas ADD COLUMN foto_campanha MEDIUMTEXT NULL',
  'SELECT 1');
PREPARE etapa FROM @comando; EXECUTE etapa; DEALLOCATE PREPARE etapa;

-- Checar as quatro colunas. Códigos de convite existentes nunca são divulgados.
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA=DATABASE()
  AND ((TABLE_NAME='grupos' AND COLUMN_NAME IN ('visibilidade','foto_grupo','codigo_convite'))
    OR (TABLE_NAME='campanhas' AND COLUMN_NAME='foto_campanha'))
ORDER BY TABLE_NAME, COLUMN_NAME;
