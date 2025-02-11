DROP TABLE IF EXISTS Reservation;#
DROP TABLE IF EXISTS Address;#
DROP TABLE IF EXISTS RoomCategory;#
DROP TABLE IF EXISTS User;#
DROP TABLE IF EXISTS Rol;#
DROP TABLE IF EXISTS Room;#
DROP TABLE IF EXISTS Category;#

CREATE TABLE IF NOT EXISTS Rol(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY (id)
);#

INSERT INTO Rol (id, name) VALUES ('6938f783-e1e7-11ef-8f63-0242ac130002','administrator');#
INSERT INTO Rol (id, name) VALUES ('693b0754-e1e7-11ef-8f63-0242ac130002','user');#
INSERT INTO Rol (id, name) VALUES ('6939d182-e1e7-11ef-8f63-0242ac130002','owner');#

DROP PROCEDURE IF EXISTS insert_rol;#

CREATE PROCEDURE insert_rol(
    IN p_name VARCHAR(255)
)
BEGIN
    INSERT INTO Rol (name) values (p_name);
    SELECT id FROM Rol WHERE name = p_name LIMIT 1;
END;#

DROP PROCEDURE IF EXISTS update_rol;#

CREATE PROCEDURE update_rol(
    IN p_id CHAR(36),
    IN p_name VARCHAR(255)
)
BEGIN
    UPDATE Rol SET name = COALESCE(p_name, name) WHERE id = p_id;
    SELECT id, name FROM Rol WHERE id = p_id LIMIT 1;
END;#