import { querySql, queryTransactionSql } from "../database.js";
import { fieldsList, messageErrorZod } from "../utils/utils.js";
import { ValidationUnique } from '../types/validationUnique.js'
import { RowDataPacket } from 'mysql2';
import { ReservationDto } from "../dtos/ReservationDto.js";
import { SafeParseReturnType } from "zod";
import { ReservationType, reservationValidation, reservationValidationPartial } from "../schemas/reservationSchema.js";
import { MissingParameterException } from "../errors/missingParameterError.js";
import { ValidationException } from "../errors/validationError.js";
import { NotFoundException } from "../errors/notFoundError.js";

export class Reservation{

    static async validateUniqueFields(reservation:ReservationType | Partial<ReservationType>):Promise<ValidationUnique>{
        let {code} = reservation;
        if(code){
            let [rows]:RowDataPacket[] = await querySql(`SELECT (CASE WHEN code = ? THEN 'code' END)
                AS field FROM Reservation WHERE code = ? LIMIT 1`, [code, code])
            if(rows.length > 0){
                return {success: false, message: `Reservation ${rows[0].field} already exists`, field:rows[0].field}
            }
        }
        return {success: true, message: 'Reservation fields correct', field:'OK'};
    }

    static async validateExisting(reservation:ReservationType | Partial<ReservationType>):Promise<ValidationUnique>{
        if(reservation.user && reservation.room){
            let [UserRow]:RowDataPacket[] = await querySql(`SELECT id FROM User
                 WHERE id = ? LIMIT 1`, [reservation.user.id]);
            let [RoomRow]:RowDataPacket[] = await querySql(`SELECT id FROM Room 
                WHERE id = ? LIMIT 1`, [reservation.room.id]);
            if(UserRow.length === 0) return {success:false, message:'user does not exits', field:'user'};  
            if(RoomRow.length === 0) return {success:false, message:'room does not exits', field:'room'};
        }
        return {success:true, message:`Valids fields`, field:'OK'};
    }

    static async getReservations():Promise<ReservationDto[]>{
        const [rows] = await querySql(`CALL get_all_reservations()`);
        return rows[0].map((re:any)=>new ReservationDto(re));
    }

    static async createReservation(reservation:ReservationType | null=null):Promise<string>{
        if(!reservation) throw new MissingParameterException('Reservation data is required', [{field:'reservation', message:'reservation data is required'}]);
        const validationResult:SafeParseReturnType<ReservationType, ReservationType> = await reservationValidation(reservation);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        const uniqueFieldsResult:ValidationUnique = await this.validateUniqueFields(reservation);
        if(!uniqueFieldsResult.success) throw new ValidationException(uniqueFieldsResult.message, [{field:uniqueFieldsResult.field, message:uniqueFieldsResult.message}]);
        const validationExisting:ValidationUnique = await this.validateExisting(reservation);
        if(!validationExisting.success) throw new ValidationException(validationExisting.message, [{field:validationExisting.field, message:validationExisting.message}]);
        const [rows]:RowDataPacket[] = await queryTransactionSql(`CALL insert_reservation(?, ?, ?, ?, ?,
            ?, ?, ?, ?)`, [reservation.reservation_date_start, reservation.reservation_date_end,
                 reservation.check_in, reservation.check_out, 
                 reservation.code, reservation.amount, reservation.state,
                  reservation.user.id, reservation.room.id ]);
        return rows[0][0].id;
    }

    static async updateReservation(id:string | null=null, reservation:Partial<ReservationType> 
        | null=null):Promise<ReservationDto>{
        if(!id) throw new MissingParameterException(`Reservation id is required`, [{field:'id', message:'id is required'}]);
        if(!reservation) throw new MissingParameterException(`Reservation data is required`, [{field:'reservation', message:'data is required'}]);
        const keys:string[] = Object.keys(reservation);
        if(keys.length === 0) throw new MissingParameterException('No fields found for update reservation', [{field:'reservation', message:'not field to update'}]);
        const [result]:RowDataPacket[] = await querySql(`SELECT id FROM Reservation WHERE id = ?`, [id]);
        if(result.length === 0) throw new NotFoundException('Reservation not found for update', [{field:'id', message:'not found'}]);
        const validationResult:SafeParseReturnType<Partial<ReservationType>, Partial<ReservationType>> = await reservationValidationPartial(id, reservation);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        const validateUniqueFields:ValidationUnique = await this.validateUniqueFields(reservation);
        if(!validateUniqueFields.success) throw new ValidationException(validateUniqueFields.message, [{field:validateUniqueFields.field, message:validateUniqueFields.message}]);
        const validationExisting:ValidationUnique = await this.validateExisting(reservation);
        if(!validationExisting.success) throw new ValidationException(validationExisting.message, [{field:validationExisting.field, message:validationExisting.message}]);
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
        if(!id) throw new MissingParameterException('Reservation id is required', [{field:'id', message:'id is required'}]);
        const [rows]:RowDataPacket[] = await querySql(`CALL get_reservation(?)`, [id]);
        if(rows[0].length === 0) throw new NotFoundException('Reservation not found for delete', [{field:'id', message:'not found'}]);
        await queryTransactionSql(`DELETE FROM Reservation WHERE id = ?`, [id]);
        return new ReservationDto(rows[0]);
    }

    static async getReservationById(id:string | null=null):Promise<ReservationDto>{
        if(!id) throw new MissingParameterException('Reservation id is required', [{field:'id', message:'id is required'}]);
        const [rows]:RowDataPacket[] = await querySql(`CALL get_reservation(?)`, [id]);
        if(rows.length === 0) throw new NotFoundException('Reservation not found', [{field:'id', message:'not found'}]);
        return new ReservationDto(rows[0][0]);
    }

    static async getReservationsByUsername(username:string | null=null):Promise<ReservationDto[]>{
        if(!username) throw new MissingParameterException('User username is required', [{field:'id', message:'id is required'}]);
        const [rows]:RowDataPacket[] = await querySql(`SELECT username FROM User WHERE username = ?`, [username]);
        if(rows.length === 0) throw new NotFoundException('User not found', [{field:'id', message:'not found'}]);
        const [result]:RowDataPacket[] = await querySql(`CALL get_reservations_by_username(?)`, [username]);
        return result[0].map((re:any)=> new ReservationDto(re));
    }
}