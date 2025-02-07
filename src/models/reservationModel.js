import { querySql, queryTransactionSql } from "../database.js";
import { reservationValidation, reservationValidationPartial } from "../schemas/reservationSchema.js";
import { messageErrorZod } from "../utils/utils.js";

export class Reservation{

    static buildReservationReturn(re){
        return {
            id: re.id,
            reservation_date_start: new Date(re.reservation_date_start).toISOString().split('T')[0],
            reservation_date_end: new Date(re.reservation_date_end).toISOString().split('T')[0],
            check_in: new Date(re.check_in).toISOString().split('T')[0],
            check_out: new Date(re.check_out).toISOString().split('T')[0],
            code: re.code,
            amount: re.amount,
            state: re.state,
            user:{
                id: re.user_id,
                name: re.name,
                last_name: re.last_name,
                age: re.age,
                email: re.email,
                username: re.username,
                phone_number: re.phone_number,
                rol: {id: re.rol_id, name: re.rol_name},
                address: {
                    id: re.address_id,
                    country: re.country,
                    province: re.province,
                    city: re.city,
                    house_number: re.house_number,
                    floor: re.floor
                }
            },
            room:{
                id: re.room_id,
                name: re.room_name,
                price: re.price,
                description: re.description,
                image_url: re.image_url,
                state: re.room_state
            }
        }
    }

    static async validateUniqueFields(reservation){
        let {code} = reservation; 
        if(code){
            let [rows] = await querySql(`SELECT (CASE WHEN code = ? THEN 'code' END)
                AS field FROM Reservation WHERE code = ? LIMIT 1`, [code, code])
            if(rows.length > 0){
                return {success: false, message: `Reservation ${rows[0].field} already exists`}
            }
        }
        return {success: true, message: 'Reservation fields correct'};
    }
    static async getReservations(){
        const [rows] = await querySql(`SELECT re.id, re.reservation_date_start,
            re.reservation_date_end, re.check_in, re.check_out, re.code, re.amount,
            re.state, u.id as user_id, u.name, u.last_name, u.age, u.email, u.username,
            u.phone_number, rol.id as rol_id, rol.name as rol_name,
            a.id as address_id, a.country, a.province, a.city, a.house_number,
            a.floor, ro.id as room_id, ro.name as room_name, ro.price, ro.description,
            ro.image_url, ro.state as room_state FROM Reservation re INNER JOIN 
            User u ON re.user_id = u.id INNER JOIN Address a ON a.user_id = u.id
            INNER JOIN Rol rol ON u.rol_id = rol.id INNER JOIN Room ro ON
            re.room_id = ro.id`);
        return rows.map(re=>this.buildReservationReturn(re));
    }

    static async createReservation({reservation}){
        if(!reservation) throw new Error('Reservation data is required');
        const validationResult = await reservationValidation(reservation);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const uniqueFieldsResult = await this.validateUniqueFields(reservation);
        if(!uniqueFieldsResult.success) throw new Error(uniqueFieldsResult.message);
        let {reservation_date_start, reservation_date_end, check_in, check_out, code,
             amount, state, user, room, } = reservation;
        const [rows] = await queryTransactionSql(`CALL insert_reservation(?, ?, ?, ?, ?,
            ?, ?, ?, ?)`, [reservation_date_start, reservation_date_end, check_in,
                check_out, code, amount, state, user.id, room.id ]);
        return rows[0][0].id;
    }

    static async updateReservation({id, reservation}){
        if(!id) throw new Error(`Reservation id is required`);
        if(!reservation) throw new Error(`Reservation data is required`);
        const [result] = await querySql(`SELECT id FROM Reservation WHERE id = ?`, [id]);
        if(result.length === 0) throw new Error('Reservation not found for update');
        const keys = Object.keys(reservation);
        if(keys.length === 0) throw new Error('No fields found for update reservation');
        const validationResult = await reservationValidationPartial(id, reservation);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const validateUniqueFields = await this.validateUniqueFields(reservation);
        if(!validateUniqueFields.success) throw new Error(validateUniqueFields.message);
        let {reservation_date_start, reservation_date_end, check_in, check_out, code,
             amount, state, user, room, } = reservation;
        if(user) user = user.id;
        if(room) room = room.id;
        const [rows] = await queryTransactionSql(`CALL update_reservation( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            , [id, reservation_date_start, reservation_date_end, check_in, check_out, code,
                amount, state, user, room]);
        return this.buildReservationReturn(rows[0][0]);
    }

    static async deleteReservation({id}){
        if(!id) throw new Error('Reservation id is required');
        const [rows] = await querySql(`SELECT re.id, re.reservation_date_start,
            re.reservation_date_end, re.check_in, re.check_out, re.code, re.amount,
            re.state, u.id as user_id, u.name, u.last_name, u.age, u.email, u.username,
            u.phone_number, rol.id as rol_id, rol.name as rol_name,
            a.id as address_id, a.country, a.province, a.city, a.house_number,
            a.floor, ro.id as room_id, ro.name as room_name, ro.price, ro.description,
            ro.image_url, ro.state as room_state FROM Reservation re INNER JOIN 
            User u ON re.user_id = u.id INNER JOIN Address a ON a.user_id = u.id
            INNER JOIN Rol rol ON u.rol_id = rol.id INNER JOIN Room ro ON
            re.room_id = ro.id WHERE re.id = ?`, [id]);
        if(rows.length === 0) throw new Error('Reservation not found for delete');
        await queryTransactionSql(`DELETE FROM Reservation WHERE id = ?`, [id]);
        return this.buildReservationReturn(rows[0]);
    }

    static async getReservationById({id}){
        if(!id) throw new Error('Reservation id is required');
        const [rows] = await querySql(`SELECT re.id, re.reservation_date_start,
            re.reservation_date_end, re.check_in, re.check_out, re.code, re.amount,
            re.state, u.id as user_id, u.name, u.last_name, u.age, u.email, u.username,
            u.phone_number, rol.id as rol_id, rol.name as rol_name,
            a.id as address_id, a.country, a.province, a.city, a.house_number,
            a.floor, ro.id as room_id, ro.name as room_name, ro.price, ro.description,
            ro.image_url, ro.state as room_state FROM Reservation re INNER JOIN 
            User u ON re.user_id = u.id INNER JOIN Address a ON a.user_id = u.id
            INNER JOIN Rol rol ON u.rol_id = rol.id INNER JOIN Room ro ON
            re.room_id = ro.id WHERE re.id = ?`, [id]);
        if(rows.length === 0) throw new Error('Reservation not found');
        return this.buildReservationReturn(rows[0]);
    }
}

