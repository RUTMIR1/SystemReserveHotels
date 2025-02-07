DROP TABLE IF EXISTS Reservation;#

CREATE TABLE Reservation(
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    reservation_date_start DATE NOT NULL,
    reservation_date_end DATE NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    state ENUM('finalized', 'current', 'canceled') NOT NULL,
    user_id CHAR(36) NOT NULL,
    room_id CHAR(36) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES User (id),
    FOREIGN KEY (room_id) REFERENCES Room (id)
);#

INSERT INTO Reservation (id, reservation_date_start, reservation_date_end, check_in, 
check_out, code, amount, state, user_id, room_id) VALUES(
    '123e4567-e89b-12d3-a456-426655440000', '2025-01-01', '2025-03-03', '2025-02-02',
    '2025-02-08', 'CODE0001', 1000000.00, 'current', '431d6c93-e1f4-11ef-8f63-0242ac130002',
    'd4b522f1-e3a4-11ef-8f63-0242ac130002');#

DROP PROCEDURE IF EXISTS insert_reservation;#

CREATE PROCEDURE insert_reservation(
    IN p_reservation_date_start DATE,
    IN p_reservation_date_end DATE,
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_code VARCHAR(255),
    IN p_amount DECIMAL(10, 2),
    IN p_state VARCHAR(255),
    IN p_user_id CHAR(36),
    IN p_room_id CHAR(36)
)
BEGIN
    DECLARE id_reservation CHAR(36);

    SET id_reservation = UUID();

    INSERT INTO Reservation (id, reservation_date_start, reservation_date_end,
     check_in, check_out, code, amount, state, user_id, room_id)
    VALUES (id_reservation, p_reservation_date_start, p_reservation_date_end,
     p_check_in, p_check_out, p_code, p_amount, p_state, p_user_id, p_room_id);

    SELECT id_reservation AS id;
END;#

DROP PROCEDURE IF EXISTS update_reservation;#

CREATE PROCEDURE update_reservation(
    IN p_id CHAR(36),
    IN p_reservation_date_start DATE,
    IN p_reservation_date_end DATE,
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_code VARCHAR(255),
    IN p_amount DECIMAL(10, 2),
    IN p_state VARCHAR(255),
    IN p_user_id CHAR(36),
    IN p_room_id CHAR(36)
)
BEGIN
    UPDATE Reservation SET
    reservation_date_start = COALESCE(p_reservation_date_start, reservation_date_start),
    reservation_date_end = COALESCE(p_reservation_date_end, reservation_date_end),
    check_in = COALESCE(p_check_in, check_in),
    check_out = COALESCE(p_check_out, check_out),
    code = COALESCE(p_code, code),
    amount = COALESCE(p_amount, amount),
    state = COALESCE(p_state, state),
    user_id = COALESCE(p_user_id, user_id),
    room_id = COALESCE(p_room_id, room_id)
    WHERE id = p_id;

    SELECT re.id, re.reservation_date_start,
            re.reservation_date_end, re.check_in, re.check_out, re.code, re.amount,
            re.state, u.id as user_id, u.name, u.last_name, u.age, u.email, u.username,
            u.phone_number, rol.id as rol_id, rol.name as rol_name,
            a.id as address_id, a.country, a.province, a.city, a.house_number,
            a.floor, ro.id as room_id, ro.name as room_name, ro.price, ro.description,
            ro.image_url, ro.state as room_state FROM Reservation re INNER JOIN 
            User u ON re.user_id = u.id INNER JOIN Address a ON a.user_id = u.id
            INNER JOIN Rol rol ON u.rol_id = rol.id INNER JOIN Room ro ON
            re.room_id = ro.id WHERE re.id = p_id;
END;#