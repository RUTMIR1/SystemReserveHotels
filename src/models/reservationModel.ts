import { querySql, queryTransactionSql } from "../database.js";
import { ReservationType, reservationValidation, reservationValidationPartial } from "../schemas/reservationSchema.js";
import { messageErrorZod } from "../utils/utils.js";
import { ValidationUnique } from '../types/validationUnique.js'
import { RowDataPacket } from 'mysql2';
import { ReservationDto } from "../dtos/ReservationDto.js";
import { SafeParseReturnType } from "zod";

export class Reservation{

    static async validateUniqueFields(reservation:ReservationType | Partial<ReservationType>):Promise<ValidationUnique>{
        let {code} = reservation;
        if(code){
            let [rows]:RowDataPacket[] = await querySql(`SELECT (CASE WHEN code = ? THEN 'code' END)
                AS field FROM Reservation WHERE code = ? LIMIT 1`, [code, code])
            if(rows.length > 0){
                return {success: false, message: `Reservation ${rows[0].field} already exists`}
            }
        }
        return {success: true, message: 'Reservation fields correct'};
    }
    static async getReservations():Promise<ReservationDto[]>{
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
        return rows.map((re:any)=>new ReservationDto(re));
    }

    static async createReservation(reservation:ReservationType | null=null):Promise<string>{
        if(!reservation) throw new Error('Reservation data is required');
        const validationResult:SafeParseReturnType<ReservationType, ReservationType> = await reservationValidation(reservation);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const uniqueFieldsResult:ValidationUnique = await this.validateUniqueFields(reservation);
        if(!uniqueFieldsResult.success) throw new Error(uniqueFieldsResult.message);
        const [rows]:RowDataPacket[] = await queryTransactionSql(`CALL insert_reservation(?, ?, ?, ?, ?,
            ?, ?, ?, ?)`, [reservation.reservation_date_start, reservation.reservation_date_end,
                 reservation.check_in, reservation.check_out, 
                 reservation.code, reservation.amount, reservation.state,
                  reservation.user.id, reservation.room.id ]);
        return rows[0][0].id;
    }

    static async updateReservation(id:string | null=null, reservation:Partial<ReservationType> 
        | null=null):Promise<ReservationDto>{
        if(!id) throw new Error(`Reservation id is required`);
        if(!reservation) throw new Error(`Reservation data is required`);
        const [result]:RowDataPacket[] = await querySql(`SELECT id FROM Reservation WHERE id = ?`, [id]);
        if(result.length === 0) throw new Error('Reservation not found for update');
        const keys:string[] = Object.keys(reservation);
        if(keys.length === 0) throw new Error('No fields found for update reservation');
        const validationResult:SafeParseReturnType<Partial<ReservationType>, Partial<ReservationType>> = await reservationValidationPartial(id, reservation);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const validateUniqueFields:ValidationUnique = await this.validateUniqueFields(reservation);
        if(!validateUniqueFields.success) throw new Error(validateUniqueFields.message);
        let userId:string|null=null, roomId:string|null=null;
        if(reservation.user) userId = reservation.user.id;
        if(reservation.room) roomId = reservation.room.id;
        const [rows]:RowDataPacket[] = await queryTransactionSql(`CALL update_reservation( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            , [id, reservation.reservation_date_start, reservation.reservation_date_end,
                 reservation.check_in, reservation.check_out, reservation.code,
                reservation.amount, reservation.state, userId, roomId]);
        return new ReservationDto(rows[0][0]);
    }

    static async deleteReservation(id:string | null=null):Promise<ReservationDto>{
        if(!id) throw new Error('Reservation id is required');
        const [rows]:RowDataPacket[] = await querySql(`SELECT re.id, re.reservation_date_start,
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
        return new ReservationDto(rows[0]);
    }

    static async getReservationById(id:string | null=null):Promise<ReservationDto>{
        if(!id) throw new Error('Reservation id is required');
        const [rows]:RowDataPacket[] = await querySql(`SELECT re.id, re.reservation_date_start,
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
        return new ReservationDto(rows[0]);
    }
}

