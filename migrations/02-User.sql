DROP TABLE IF EXISTS User;#

CREATE TABLE IF NOT EXISTS User (
id CHAR(36) NOT NULL default (UUID()),
name varchar(100) NOT NULL,
last_name varchar(100) NOT NULL,
age INT NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
username VARCHAR(100) NOT NULL UNIQUE,
password VARCHAR(100) NOT NULL,
phone_number VARCHAR(100) NOT NULL UNIQUE,
rol_id CHAR(36) NOT NULL,
PRIMARY KEY (id),
FOREIGN KEY (rol_id) REFERENCES Rol(id) ON DELETE CASCADE ON UPDATE CASCADE
);#

INSERT INTO User (id, name, last_name, age, email, username, password, phone_number, rol_id) values
 ('431c358a-e1f4-11ef-8f63-0242ac130002' ,'John', 'Doe', 30, 'Jhon@gmail.com', 'john_doe', 'password123', '1234567','6939d182-e1e7-11ef-8f63-0242ac130002');#
INSERT INTO User (id, name, last_name, age, email, username, password, phone_number, rol_id) values
 ('431d6c93-e1f4-11ef-8f63-0242ac130002', 'Marco', 'Hans', 25, 'Marco@gmail.com', 'Mark123', '12345', '111333454', '693b0754-e1e7-11ef-8f63-0242ac130002');#

 DROP PROCEDURE IF EXISTS update_user;#

 CREATE PROCEDURE update_user(
    IN p_id CHAR(36),
    IN p_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_age INT,
    IN p_email VARCHAR(100),
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(100),
    IN p_phone_number VARCHAR(100),
    IN p_rol_id CHAR(36)
    )
 BEGIN
    UPDATE User SET
    name = COALESCE(p_name, name),
    last_name = COALESCE(p_last_name, last_name),
    age = COALESCE(p_age, age),
    email = COALESCE(p_email, email),
    username = COALESCE(p_username, username),
    password = COALESCE(p_password, password),
    phone_number = COALESCE(p_phone_number, phone_number),
    rol_id = COALESCE(p_rol_id, rol_id)
    WHERE id = p_id;
    SELECT u.id, u.name, u.last_name, u.age, u.email, u.username, u.phone_number,
    r.id as rol_id, r.name as rol_name FROM User u 
    INNER JOIN Rol r ON u.rol_id = r.id WHERE u.id = p_id LIMIT 1;
 END;#

 DROP PROCEDURE IF EXISTS insert_user;#

 CREATE PROCEDURE insert_user(
    IN p_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_age INT,
    IN p_email VARCHAR(100),
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(100),
    IN p_phone_number VARCHAR(100),
    IN p_rol_id CHAR(36),
    IN p_country VARCHAR(255),
    IN p_province VARCHAR(255),
    IN p_city VARCHAR(255),
    IN p_house_number VARCHAR(100),
    IN p_floor VARCHAR(100)
 )
 BEGIN
    DECLARE last_id CHAR(36);

    INSERT INTO User (name, last_name, age, email, username, password, phone_number, rol_id)
    VALUES (p_name, p_last_name, p_age, p_email, p_username, p_password, p_phone_number, p_rol_id);

    SET last_id = (SELECT id FROM User WHERE username = p_username LIMIT 1);

    INSERT INTO Address (country, province, city, house_number, floor, user_id)VALUES
    (p_country, p_province, p_city, p_house_number, p_floor, last_id);

    SELECT id FROM User WHERE username = p_username LIMIT 1;
 END;#