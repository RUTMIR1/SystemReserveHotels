import { querySql, queryTransactionSql } from "../database.js";
import { calculatePriceReserve, createCodeReservation, fieldsList, messageErrorZod } from "../utils/utils.js";
import { RowDataPacket } from 'mysql2';
import { ReservationDto } from "../dtos/ReservationDto.js";
import { SafeParseReturnType } from "zod";
import { ReservationType, reservationValidation, reservationValidationPartial } from "../schemas/reservationSchema.js";
import { MissingParameterException } from "../errors/missingParameterError.js";
import { ValidationException } from "../errors/validationError.js";
import { NotFoundException } from "../errors/notFoundError.js";
import { validateUniqueFields, ValidationExisting, ValidationUnique } from "../utils/utilModel.js";
import { PreferenceType, PreferenceValidation } from "../schemas/referenceSchema.js";

export class Reservation{

    static async validateExisting(reservation:ReservationType | Partial<ReservationType>):Promise<ValidationExisting>{
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
        const validationFields:ValidationUnique[] = await validateUniqueFields(reservation as any, 'Reservation');
        if(validationFields.length > 0) throw new ValidationException(validationFields.map(el=>el.message).join('-'), [...validationFields]);
        const validationExisting:ValidationExisting = await this.validateExisting(reservation);
        if(!validationExisting.success) throw new ValidationException(validationExisting.message, [{field:validationExisting.field, message:validationExisting.message}]);
        const [room] = await querySql('SELECT state FROM Room WHERE id = ?',[reservation.room.id]);
        if(room[0].state !== 'active') throw new ValidationException('Room is not active!', [{field:'Room state', message:'Room is not active'}]);
        let [codes]:RowDataPacket[] = await querySql('SELECT code FROM Reservation ORDER BY created_at DESC LIMIT 1');
        reservation.code = createCodeReservation(codes[0].code);
        const [rows]:RowDataPacket[] = await queryTransactionSql(`CALL insert_reservation(?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?)`, [reservation.reservation_date_start, reservation.reservation_date_end,
                 reservation.check_in, reservation.check_out, 
                 reservation.code, reservation.amount, reservation.state, reservation.days,
                  reservation.user.id, reservation.room.id ]);
        await queryTransactionSql(`UPDATE Room SET state = 'reserved' WHERE id = ?`, [reservation.room.id]);
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
        const validationFields:ValidationUnique[] = await validateUniqueFields(reservation as any, 'Reservation', id);
        if(validationFields.length > 0) throw new ValidationException(validationFields.map(el=>el.message).join('-'), [...validationFields]);
        const validationExisting:ValidationExisting = await this.validateExisting(reservation);
        if(!validationExisting.success) throw new ValidationException(validationExisting.message, [{field:validationExisting.field, message:validationExisting.message}]);
        let userId:string|null=null, roomId:string|null=null;
        if(reservation.user) userId = reservation.user.id as string;
        if(reservation.room) roomId = reservation.room.id as string;
        const [rows]:RowDataPacket[] = await queryTransactionSql(`CALL update_reservation( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            , [id, reservation.reservation_date_start, reservation.reservation_date_end,
                reservation.check_in, reservation.check_out, reservation.code,
                reservation.amount, reservation.state, reservation.days, userId, roomId]);
        if(reservation.state && reservation.state !== 'current') await queryTransactionSql(`UPDATE Room r SET r.state = 'inactive' WHERE r.id = ?`,[id]);
        return new ReservationDto(rows[0][0]);
    }

    static async deleteReservation(id:string | null=null):Promise<ReservationDto>{
        if(!id) throw new MissingParameterException('Reservation id is required', [{field:'id', message:'id is required'}]);
        const [rows]:RowDataPacket[] = await querySql(`CALL get_reservation(?)`, [id]);
        if(rows[0].length === 0) throw new NotFoundException('Reservation not found for delete', [{field:'id', message:'not found'}]);
        await queryTransactionSql(`UPDATE Room SET state = 'active' WHERE id = ?`, [id]);
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
    static async generateReservationPaid(preference:PreferenceType){
        console.log("yo recibo: ", preference);
        if(!preference) throw new MissingParameterException('preference data is required', [{field:'preference', message:'data is required'}]);
        const validationResult:SafeParseReturnType<PreferenceType, PreferenceType> = await PreferenceValidation(preference);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        let [rows]:RowDataPacket[] = await querySql('SELECT price FROM Room WHERE id = ? LIMIT 1', [preference.room_id]);
        if(rows.length === 0) throw new ValidationException('Room id not found', [{field:'roomId', message:'room id not found'}]);
        let [user]:RowDataPacket[] = await querySql('SELECT name FROM User WHERE id = ? LIMIT 1', [preference.user_id]);
        if(user.length === 0) throw new ValidationException('User id not found', [{field:'userId', message:'User id not found'}]);
        let [codes]:RowDataPacket[] = await querySql('SELECT code FROM Reservation ORDER BY created_at DESC LIMIT 1');
        const milsegDays = 1000 * 60 * 60 * 24 * rows[0].price;
        const code = createCodeReservation(codes[0].code);
        const reservation_date_start = new Date().toISOString().split('T')[0];
        const reservation_date_end = new Date(new Date().getTime() + milsegDays).toISOString().split('T')[0];
        const check_in = new Date().toISOString().split('T')[0];
        const check_out = new Date().toISOString().split('T')[0];
        const state = 'current';
        const amount = calculatePriceReserve(preference.days, rows[0].price);
        await queryTransactionSql(`CALL insert_reservation(?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?)`, [reservation_date_start, reservation_date_end,
                 check_in, check_out, code, amount, state, preference.days,
                  preference.user_id, preference.room_id]);
    }
}