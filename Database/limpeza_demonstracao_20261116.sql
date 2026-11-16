USE ConSangue;

DELIMITER $$
DROP PROCEDURE IF EXISTS limpeza_controlada_consangue_20261116$$
CREATE PROCEDURE limpeza_controlada_consangue_20261116()
BEGIN
    DECLARE qtd INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT COUNT(*) INTO qtd FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (
        'backup_prelimpeza_20261116_usuarios',
        'backup_prelimpeza_20261116_hemocentros',
        'backup_prelimpeza_20261116_grupos',
        'backup_prelimpeza_20261116_campanhas',
        'backup_prelimpeza_20261116_membros_grupo',
        'backup_prelimpeza_20261116_grupos_campanhas',
        'backup_prelimpeza_20261116_participacoes'
    );
    IF qtd <> 7 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: backup incompleto.';
    END IF;

    SELECT COUNT(*) INTO qtd FROM usuarios;
    IF qtd <> 16 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: tabela usuarios alterada.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM backup_prelimpeza_20261116_usuarios;
    IF qtd <> 16 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: backup usuarios invalido.';
    END IF;

    SELECT COUNT(*) INTO qtd FROM hemocentros;
    IF qtd <> 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: tabela hemocentros alterada.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM backup_prelimpeza_20261116_hemocentros;
    IF qtd <> 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: backup hemocentros invalido.';
    END IF;

    SELECT COUNT(*) INTO qtd FROM grupos;
    IF qtd <> 6 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: tabela grupos alterada.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM backup_prelimpeza_20261116_grupos;
    IF qtd <> 6 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: backup grupos invalido.';
    END IF;

    SELECT COUNT(*) INTO qtd FROM campanhas;
    IF qtd <> 7 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: tabela campanhas alterada.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM backup_prelimpeza_20261116_campanhas;
    IF qtd <> 7 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: backup campanhas invalido.';
    END IF;

    SELECT COUNT(*) INTO qtd FROM membros_grupo;
    IF qtd <> 12 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: tabela membros_grupo alterada.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM backup_prelimpeza_20261116_membros_grupo;
    IF qtd <> 12 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: backup membros_grupo invalido.';
    END IF;

    SELECT COUNT(*) INTO qtd FROM grupos_campanhas;
    IF qtd <> 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: tabela grupos_campanhas alterada.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM backup_prelimpeza_20261116_grupos_campanhas;
    IF qtd <> 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: backup grupos_campanhas invalido.';
    END IF;

    SELECT COUNT(*) INTO qtd FROM participacoes;
    IF qtd <> 3 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: tabela participacoes alterada.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM backup_prelimpeza_20261116_participacoes;
    IF qtd <> 3 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: backup participacoes invalido.';
    END IF;

    SELECT COUNT(*) INTO qtd FROM usuarios
    WHERE id_usuario = 25 AND nome = 'Administrador'
      AND tipo_usuario = 'candidato'
      AND REPLACE(REPLACE(cpf,'.',''),'-','') = '98765432100';
    IF qtd <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: conta Administrador nao confere.';
    END IF;

    SELECT COUNT(*) INTO qtd FROM usuarios u
    JOIN hemocentros h ON h.id_usuario = u.id_usuario
    WHERE u.id_usuario = 27
      AND u.nome = 'Instituição Demonstração'
      AND u.tipo_usuario = 'instituicao'
      AND h.id_hemocentro = 8
      AND h.nome_hemo = 'Hemocentro ConSangue — DEMONSTRAÇÃO';
    IF qtd <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: instituicao 27 nao confere.';
    END IF;

    SELECT COUNT(*) INTO qtd FROM grupos
    WHERE id_grupo IN (10, 11) AND id_criador = 25;
    IF qtd <> 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: grupos preservados nao conferem.';
    END IF;

    DELETE FROM participacoes;
    DELETE FROM grupos_campanhas;
    DELETE FROM campanhas;
    DELETE FROM membros_grupo WHERE id_usuario NOT IN (25,27) OR id_grupo NOT IN (10,11);
    DELETE FROM grupos WHERE id_criador <> 25;
    DELETE FROM hemocentros WHERE id_usuario <> 27;
    DELETE FROM usuarios WHERE id_usuario NOT IN (25,27);

    SELECT COUNT(*) INTO qtd FROM usuarios
    WHERE id_usuario IN (25,27);
    IF qtd <> 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: faltam contas preservadas.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM usuarios;
    IF qtd <> 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: usuarios restantes incorretos.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM hemocentros WHERE id_usuario = 27;
    IF qtd <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: hemocentro preservado ausente.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM hemocentros;
    IF qtd <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: hemocentros restantes incorretos.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM grupos WHERE id_grupo IN (10,11) AND id_criador = 25;
    IF qtd <> 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: grupos preservados ausentes.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM grupos;
    IF qtd <> 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: grupos restantes incorretos.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM membros_grupo
    WHERE id_usuario NOT IN (25,27) OR id_grupo NOT IN (10,11);
    IF qtd <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: membros indevidos restantes.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM campanhas;
    IF qtd <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: campanhas restantes.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM grupos_campanhas;
    IF qtd <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: vinculos restantes.';
    END IF;
    SELECT COUNT(*) INTO qtd FROM participacoes;
    IF qtd <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ABORTADO: participacoes restantes.';
    END IF;

    COMMIT;
END$$
DELIMITER ;

CALL limpeza_controlada_consangue_20261116();
DROP PROCEDURE IF EXISTS limpeza_controlada_consangue_20261116;

SELECT id_usuario, nome, tipo_usuario FROM usuarios ORDER BY id_usuario;
SELECT id_hemocentro, id_usuario, nome_hemo FROM hemocentros ORDER BY id_hemocentro;
SELECT id_grupo, id_criador, nome_grupo FROM grupos ORDER BY id_grupo;
SELECT (SELECT COUNT(*) FROM campanhas) AS campanhas,
       (SELECT COUNT(*) FROM grupos_campanhas) AS vinculos,
       (SELECT COUNT(*) FROM participacoes) AS participacoes;
