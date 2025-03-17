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
    days INT NOT NULL,
    user_id CHAR(36) NOT NULL,
    room_id CHAR(36) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES User (id),
    FOREIGN KEY (room_id) REFERENCES Room (id)
);#

DROP PROCEDURE IF EXISTS insert_reservation;#

CREATE PROCEDURE insert_reservation(
    IN p_reservation_date_start DATE,
    IN p_reservation_date_end DATE,
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_code VARCHAR(255),
    IN p_amount DECIMAL(10, 2),
    IN p_state VARCHAR(255),
    IN p_days INT,
    IN p_user_id CHAR(36),
    IN p_room_id CHAR(36)
)
BEGIN
    DECLARE id_reservation CHAR(36);

    SET id_reservation = UUID();

    INSERT INTO Reservation (id, reservation_date_start, reservation_date_end,
     check_in, check_out, code, amount, state, days, user_id, room_id)
    VALUES (id_reservation, p_reservation_date_start, p_reservation_date_end,
     p_check_in, p_check_out, p_code, p_amount, p_state, p_days, p_user_id, p_room_id);

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
    IN p_days INT,
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
    days = COALESCE(p_days, days),
    user_id = COALESCE(p_user_id, user_id),
    room_id = COALESCE(p_room_id, room_id)
    WHERE id = p_id;

    SELECT re.id, re.reservation_date_start,
            re.reservation_date_end, re.check_in, re.check_out, re.code, re.amount,
            re.state, re.days, u.id as user_id, u.name, u.last_name, u.age, u.email, u.username,
            u.phone_number, rol.id as rol_id, rol.name as rol_name,
            a.id as address_id, a.country, a.province, a.city, a.house_number,
            a.floor, ro.id as room_id, ro.name as room_name, ro.price, ro.description,
            ro.image_url, ro.state as room_state, JSON_ARRAYAGG(JSON_OBJECT(
            'id',c.id,'name',c.name)) AS room_categories FROM Reservation re INNER JOIN 
            User u ON re.user_id = u.id INNER JOIN Address a ON a.user_id = u.id
            INNER JOIN Rol rol ON u.rol_id = rol.id INNER JOIN Room ro ON
            re.room_id = ro.id INNER JOIN RoomCategory rc ON ro.id = rc.room_id INNER
            JOIN Category c ON rc.category_id = c.id WHERE re.id = p_id GROUP BY re.id, re.reservation_date_start, re.reservation_date_end, re.check_in, 
         re.check_out, re.code, re.amount, re.state, re.days,
         u.id, u.name, u.last_name, u.age, u.email, u.username, 
         u.phone_number, rol.id, rol.name, 
         a.id, a.country, a.province, a.city, a.house_number, a.floor, 
         ro.id, ro.name, ro.price, ro.description, ro.image_url, ro.state;
END;#

DROP PROCEDURE IF EXISTS get_reservation;#

CREATE PROCEDURE get_reservation(
    IN p_id CHAR(36)
)
BEGIN
    SELECT re.id, re.reservation_date_start,
            re.reservation_date_end, re.check_in, re.check_out, re.code, re.amount,
            re.state, re.days, u.id as user_id, u.name, u.last_name, u.age, u.email, u.username,
            u.phone_number, rol.id as rol_id, rol.name as rol_name,
            a.id as address_id, a.country, a.province, a.city, a.house_number,
            a.floor, ro.id as room_id, ro.name as room_name, ro.price, ro.description,
            ro.image_url, ro.state as room_state, JSON_ARRAYAGG(JSON_OBJECT(
            'id',c.id,'name',c.name)) AS room_categories FROM Reservation re INNER JOIN 
            User u ON re.user_id = u.id INNER JOIN Address a ON a.user_id = u.id
            INNER JOIN Rol rol ON u.rol_id = rol.id INNER JOIN Room ro ON
            re.room_id = ro.id INNER JOIN RoomCategory rc ON ro.id = rc.room_id INNER
            JOIN Category c ON rc.category_id = c.id WHERE re.id = p_id GROUP BY re.id, re.reservation_date_start, re.reservation_date_end, re.check_in, 
         re.check_out, re.code, re.amount, re.state, re.days, 
         u.id, u.name, u.last_name, u.age, u.email, u.username, 
         u.phone_number, rol.id, rol.name, 
         a.id, a.country, a.province, a.city, a.house_number, a.floor, 
         ro.id, ro.name, ro.price, ro.description, ro.image_url, ro.state;
END;#

DROP PROCEDURE IF EXISTS get_all_reservations;#

CREATE PROCEDURE get_all_reservations()
BEGIN
    SELECT re.id, re.reservation_date_start,
            re.reservation_date_end, re.check_in, re.check_out, re.code, re.amount,
            re.state, re.days, u.id as user_id, u.name, u.last_name, u.age, u.email, u.username,
            u.phone_number, rol.id as rol_id, rol.name as rol_name,
            a.id as address_id, a.country, a.province, a.city, a.house_number,
            a.floor, ro.id as room_id, ro.name as room_name, ro.price, ro.description,
            ro.image_url, ro.state as room_state, JSON_ARRAYAGG(JSON_OBJECT(
            'id',c.id,'name',c.name)) AS room_categories FROM Reservation re INNER JOIN 
            User u ON re.user_id = u.id INNER JOIN Address a ON a.user_id = u.id
            INNER JOIN Rol rol ON u.rol_id = rol.id INNER JOIN Room ro ON
            re.room_id = ro.id INNER JOIN RoomCategory rc ON ro.id = rc.room_id INNER
            JOIN Category c ON rc.category_id = c.id GROUP BY re.id, re.reservation_date_start, re.reservation_date_end, re.check_in, 
         re.check_out, re.code, re.amount, re.state, re.days,
         u.id, u.name, u.last_name, u.age, u.email, u.username, 
         u.phone_number, rol.id, rol.name, 
         a.id, a.country, a.province, a.city, a.house_number, a.floor, 
         ro.id, ro.name, ro.price, ro.description, ro.image_url, ro.state;
END;#

DROP PROCEDURE IF EXISTS get_reservations_by_username;#

CREATE PROCEDURE get_reservations_by_username(
    IN p_username VARCHAR(100)
)
BEGIN
    SELECT re.id, re.reservation_date_start,
            re.reservation_date_end, re.check_in, re.check_out, re.code, re.amount,
            re.state, re.days, u.id as user_id, u.name, u.last_name, u.age, u.email, u.username,
            u.phone_number, rol.id as rol_id, rol.name as rol_name,
            a.id as address_id, a.country, a.province, a.city, a.house_number,
            a.floor, ro.id as room_id, ro.name as room_name, ro.price, ro.description,
            ro.image_url, ro.state as room_state, JSON_ARRAYAGG(JSON_OBJECT(
            'id',c.id,'name',c.name)) AS room_categories FROM Reservation re INNER JOIN 
            User u ON re.user_id = u.id INNER JOIN Address a ON a.user_id = u.id
            INNER JOIN Rol rol ON u.rol_id = rol.id INNER JOIN Room ro ON
            re.room_id = ro.id INNER JOIN RoomCategory rc ON ro.id = rc.room_id INNER
            JOIN Category c ON rc.category_id = c.id WHERE u.username = p_username GROUP BY re.id, re.reservation_date_start, re.reservation_date_end, re.check_in, 
         re.check_out, re.code, re.amount, re.state, re.days,
         u.id, u.name, u.last_name, u.age, u.email, u.username, 
         u.phone_number, rol.id, rol.name, 
         a.id, a.country, a.province, a.city, a.house_number, a.floor, 
         ro.id, ro.name, ro.price, ro.description, ro.image_url, ro.state;
END;#