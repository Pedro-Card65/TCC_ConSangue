-- Aplicar uma vez após fazer backup do MySQL existente.
-- Mantém os IDs numéricos antigos e não remove grupos ou seus vínculos.
ALTER TABLE ConSangue.grupos ADD COLUMN codigo_convite CHAR(8) NULL;
ALTER TABLE ConSangue.grupos ADD UNIQUE KEY uq_grupos_codigo_convite (codigo_convite);
-- Após a migração, executar a partir da pasta API:
-- node scripts/preencher_codigos_grupos.mjs
