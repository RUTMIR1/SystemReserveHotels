DROP TABLE IF EXISTS Address;#

CREATE TABLE Address(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    country VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    house_number INT NOT NULL,
    floor INT NOT NULL,
    user_id CHAR(36) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES User(id)
);#

INSERT INTO Address (country, province, city, house_number, floor, user_id) VALUES
    ('USA', 'New York', 'Manhattan', 123, 1, '431c358a-e1f4-11ef-8f63-0242ac130002'),
    ('Canada', 'Ontario', 'Toronto', 456, 2, '431d6c93-e1f4-11ef-8f63-0242ac130002');#

DROP PROCEDURE IF EXISTS update_address;#

CREATE PROCEDURE update_address(
    IN p_id CHAR(36),
    IN p_country VARCHAR(255),
    IN p_province VARCHAR(255),
    IN p_city VARCHAR(255),
    IN p_house_number INT,
    IN p_floor INT
)
BEGIN
    UPDATE Address SET
    country = COALESCE(p_country, country),
    province = COALESCE(p_province, province),
    city = COALESCE(p_city, city),
    house_number = COALESCE(p_house_number, house_number),
    floor = COALESCE(p_floor, floor)
    WHERE id = p_id;

    SELECT id, country, province, city, house_number, floor FROM Address WHERE
    id = p_id;
END;#