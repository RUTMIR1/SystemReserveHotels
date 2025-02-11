DROP TABLE IF EXISTS Room;#

CREATE TABLE Room(
    id CHAR (36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    state ENUM('active', 'inactive', 'reserved') NOT NULL,
    PRIMARY KEY (id)
);#

INSERT INTO Room (id, name, price, description, image_url, state) VALUES
    ('d4b522f1-e3a4-11ef-8f63-0242ac130002','Deluxe Room', 150.00, 'A spacious, elegant room with a king-sized bed and a full-size bathroom.',
    'https://example.com/deluxe-room-image.jpg', 'active'),
    ('d4b526ac-e3a4-11ef-8f63-0242ac130002','Standard Room', 100.00, 'A cozy, comfortable room with a queen-sized bed and a small bathroom.',
    'https://example.com/standard-room-image.jpg', 'active');#

DROP PROCEDURE IF EXISTS insert_room;#

CREATE PROCEDURE insert_room(
    IN p_name VARCHAR(255),
    IN p_price DECIMAL(10,2),
    IN p_description TEXT,
    IN p_image_url VARCHAR(255),
    IN p_state ENUM('active', 'inactive', 'reserved')
)
BEGIN
    DECLARE uuid VARCHAR(36);

    SET uuid = UUID();
    INSERT INTO Room (id, name, price, description, image_url, state) VALUES
    (uuid ,p_name, p_price, p_description, p_image_url, p_state);

    SELECT uuid AS id;
END;#

DROP PROCEDURE IF EXISTS update_room;#

CREATE PROCEDURE update_room(
    IN p_id CHAR(36),
    IN p_name VARCHAR(255),
    IN p_price DECIMAL(10, 2),
    IN p_description VARCHAR(255),
    IN p_image_url VARCHAR(255),
    IN p_state ENUM('active', 'inactive', 'reserved')
)
BEGIN
    UPDATE Room SET
    name = COALESCE(p_name, name),
    price = COALESCE(p_price, price),
    description = COALESCE(p_description, description),
    image_url = COALESCE(p_image_url, image_url),
    state = COALESCE(p_state, state)
    WHERE id = p_id;

    SELECT id, name, price, description, image_url, state FROM Room WHERE id = p_id;
END;#