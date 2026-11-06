-- Execute no banco ConSangue de desenvolvimento, após confirmar InnoDB
-- para grupos e membros_grupo. O padrão abaixo é uma simulação (ROLLBACK).
START TRANSACTION;

SELECT g.id_grupo, g.id_criador, m.id_membro, m.id_usuario, m.papel
FROM grupos g
JOIN membros_grupo m ON m.id_grupo = g.id_grupo AND m.id_usuario = g.id_criador
WHERE g.id_grupo = 1 AND g.id_criador = 1 AND m.id_membro = 1
FOR UPDATE;

-- Só promove o vínculo conhecido se ele pertencer realmente ao criador.
-- Não insere outro membro nem altera os demais participantes.
UPDATE membros_grupo m
JOIN grupos g ON g.id_grupo = m.id_grupo AND g.id_criador = m.id_usuario
SET m.papel = 'administrador'
WHERE g.id_grupo = 1 AND g.id_criador = 1 AND m.id_membro = 1
  AND m.papel = 'membro';

SELECT ROW_COUNT() AS membros_corrigidos;
SELECT id_membro, id_usuario, id_grupo, papel
FROM membros_grupo WHERE id_membro = 1 AND id_grupo = 1;

-- Após conferir a simulação, execute novamente substituindo ROLLBACK por COMMIT.
-- Se a consulta inicial não retornar uma linha, investigue e não amplie o filtro.
ROLLBACK;
