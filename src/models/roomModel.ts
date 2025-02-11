import { roomValidate, roomPartialValidate, RoomType } from "../schemas/RoomSchema.js";
import { querySql, queryTransactionSql } from "../database.js";
import { messageErrorZod } from "../utils/utils.js";
import { RoomDto } from "../dtos/RoomDto.js";
import { RowDataPacket } from "mysql2";
import { SafeParseReturnType } from "zod";

export class Room{
    static async getRooms():Promise<RoomDto[]>{
        const [rows]:RowDataPacket[] = await querySql(`SELECT id, name, price, description, image_url, 
            state FROM Room`);
        return rows.map((room:any)=>new RoomDto(room));
    }

    static async createRoom(room:RoomType | null = null):Promise<string>{
        if(!room) throw new Error('room data is required');
        const validationResult:SafeParseReturnType<RoomType, RoomType> = await roomValidate(room);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const [result]:RowDataPacket[] = await queryTransactionSql(`CALL insert_room(?, ?, ?, ?, ?)`,
            [room.name, room.price, room.description, room.image_url, room.state]
        );
        return result[0][0].id;
    }

    static async updateRoom(id:string | null=null, room:Partial<RoomType>):Promise<RoomDto>{
        if(!id) throw new Error('id is required');
        if(!room) throw new Error('room data is required');
        const keys:string[] = Object.keys(room);
        if(keys.length === 0) throw new Error('No fields found for update room');       
        const validationResult:SafeParseReturnType<Partial<RoomType>, Partial<RoomType>> = await roomPartialValidate(room);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const [rows]:RowDataPacket[] = await querySql(`SELECT id FROM Room WHERE id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('Room not found for update');
        const [result]:RowDataPacket[] = await queryTransactionSql(`CALL update_room(?, ?, ?,
            ?, ?, ?)`, [id, room.name, room.price, room.description, room.image_url, room.state]);
        return new RoomDto(result[0][0]);
    }

    static async deleteRoom(id:string | null=null):Promise<RoomDto>{
        if(!id) throw new Error('id is required');
        const [rows]:RowDataPacket[] = await querySql(`SELECT id, name, price, 
            description, image_url, state FROM Room WHERE id =? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('Room not found for delete');
        const [result]:RowDataPacket[] = await querySql(`SELECT re.id FROM Reservation re INNER
             JOIN Room ro ON re.room_id = ro.id LIMIT 1`);
        if(result.length !== 0) throw new Error(`Room to delete must not have any Reservation`);
        await queryTransactionSql(`DELETE FROM Room WHERE id =?`, [id]);
        return new RoomDto(rows[0]);
    }
    static async getRoomById(id:string | null=null):Promise<RoomDto>{
        if(!id) throw new Error('id is required');
        const [rows]:RowDataPacket[] = await querySql(`SELECT id, name, price, description, image_url,
            state FROM Room WHERE id =? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('Room not found');
        return new RoomDto(rows[0]);
    }
}