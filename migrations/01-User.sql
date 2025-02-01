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
PRIMARY KEY (id)
);#

INSERT INTO User (name, last_name, age, email, username, password, phone_number) values
 ('John', 'Doe', 30, 'Jhon@gmail.com', 'john_doe', 'password123', '1234567');#
INSERT INTO User (name, last_name, age, email, username, password, phone_number) values
 ('Marco', 'Hans', 25, 'Marco@gmail.com', 'Mark123', '12345', '111333454');#

 DROP PROCEDURE IF EXISTS update_user;#

 CREATE PROCEDURE update_user(
    IN p_id CHAR(36),
    IN p_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_age INT,
    IN p_email VARCHAR(100),
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(100),
    IN p_phone_number VARCHAR(100)
    )
 BEGIN
    UPDATE User SET
    name = COALESCE(p_name, name),
    last_name = COALESCE(p_last_name, last_name),
    age = COALESCE(p_age, age),
    email = COALESCE(p_email, email),
    username = COALESCE(p_username, username),
    password = COALESCE(p_password, password),
    phone_number = COALESCE(p_phone_number, phone_number)
    WHERE id = p_id;
    SELECT name, last_name, age, email, username, phone_number FROM User WHERE id = p_id LIMIT 1;
 END;#

 DROP PROCEDURE IF EXISTS insert_user;#

 CREATE PROCEDURE insert_user(
    IN p_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_age INT,
    IN p_email VARCHAR(100),
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(100),
    IN p_phone_number VARCHAR(100)
 )
 BEGIN
    INSERT INTO User (name, last_name, age, email, username, password, phone_number)
    VALUES (p_name, p_last_name, p_age, p_email, p_username, p_password, p_phone_number);
    SELECT id FROM User WHERE username = p_username LIMIT 1;
 END;#