-- Aplicar uma vez no banco MySQL existente antes de habilitar fotos dos grupos.
-- Preserva grupos, membros, campanhas e demais dados.
ALTER TABLE ConSangue.grupos ADD COLUMN foto_grupo MEDIUMTEXT NULL;
