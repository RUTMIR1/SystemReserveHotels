DROP TABLE IF EXISTS User;

CREATE TABLE IF NOT EXISTS User (
id BINARY(16) NOT NULL default (UUID_TO_BIN(UUID())),
name varchar(100) NOT NULL,
last_name varchar(100) NOT NULL,
age INT NOT NULL,
email VARCHAR(100) NOT NULL,
username VARCHAR(100) NOT NULL,
password VARCHAR(100) NOT NULL,
phone_number VARCHAR(100) NOT NULL,
PRIMARY KEY (id)
);

INSERT INTO User (id, name, last_name, age, email, username, password, phone_number) values
 (UUID_TO_BIN(UUID()) ,'John', 'Doe', 30, 'Jhon@gmail.com', 'john_doe', 'password123', '1234567');
INSERT INTO User (id, name, last_name, age, email, username, password, phone_number) values
 (UUID_TO_BIN(UUID()) ,'Marco', 'Hans', 25, 'Marco@gmail.com', 'Mark123', '12345', '111333454');