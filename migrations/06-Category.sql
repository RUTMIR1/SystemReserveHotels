DROP TABLE IF EXISTS Category;#

CREATE TABLE Category(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(100) UNIQUE,
    PRIMARY KEY(id)
);#

INSERT INTO Category(id, name) VALUES 
('6938f783-e1e7-11ef-8f63-0242ac131232','suite'),
('6938f783-e1e7-11ef-8f63-0242ac131112','Junior Suite'),
 ('6938f783-e1e7-11ef-8f63-0242ac132222','Family');#

DROP PROCEDURE IF EXISTS insert_category;#

CREATE PROCEDURE insert_category(
    IN p_name VARCHAR(100)
)
BEGIN
    DECLARE id_category CHAR(36);
    SET id_category = UUID();
    INSERT INTO Category(id, name) VALUES (id_category, p_name);
    SELECT id_category AS id;
END;#

DROP PROCEDURE IF EXISTS update_category;#

CREATE PROCEDURE update_category(
    IN p_id CHAR(36),
    IN p_name VARCHAR(100)
)
BEGIN
    UPDATE Category SET name = COALESCE(p_name, name) WHERE id = p_id;
    SELECT id, name FROM Category WHERE id = p_id LIMIT 1;
END;#