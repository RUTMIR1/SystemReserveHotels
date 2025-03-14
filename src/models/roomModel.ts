import { roomValidate, roomPartialValidate, RoomType } from "../schemas/RoomSchema.js";
import { querySql, queryTransactionSql } from "../database.js";
import { fieldsList, messageErrorZod } from "../utils/utils.js";
import { RowDataPacket } from "mysql2";
import { RoomDto } from "../dtos/RoomDto.js";
import { SafeParseReturnType } from "zod";
import { ValidationUnique } from "../types/validationUnique.js";
import { MissingParameterException } from "../errors/missingParameterError.js";
import { ValidationException } from "../errors/validationError.js";
import { NotFoundException } from "../errors/notFoundError.js";

export class Room{

    static async validateExisting(room:RoomType | Partial<RoomType>):Promise<ValidationUnique>{
            if(room.categories){
                    const categories:string[] = room.categories.map(category=> category.id);
                    const categoriesNotRepeat:Set<string> = new Set(categories);
                    const categoryIds:string[] = Array.from(categoriesNotRepeat);

                    let [RoomRow]:RowDataPacket[] = await querySql(`SELECT id FROM Category
                         WHERE id IN (${categoryIds.map(()=> '?').join(',')})`, [...categoryIds]);
                    if(RoomRow.length !== categoryIds.length) return {success:false, message:'one or more categories do not exist', field:'category'};  
            }
            return {success:true, message:`Valids fields`, field:'ok'};
    }

    static async getRooms():Promise<RoomDto[]>{
        const [rows]:RowDataPacket[] = await querySql(`SELECT DISTINCT r.id, r.name, r.price, r.description, r.image_url, r.state, 
(SELECT JSON_ARRAYAGG(JSON_OBJECT('id', c2.id, 'name', c2.name)) FROM RoomCategory rc2 
INNER JOIN Category c2 WHERE rc2.room_id = r.id AND c2.id = rc2.category_id) AS categories FROM Room r 
             INNER JOIN RoomCategory rc ON r.id = rc.room_id INNER JOIN Category c ON rc.category_id = c.id`);
        return rows.map((room:any)=>new RoomDto(room));
    }

    static async createRoom(room:RoomType | null = null):Promise<string>{
        if(!room) throw new MissingParameterException('room data is required', [{field:'room', message:'data is required'}]);
        const validationResult:SafeParseReturnType<RoomType, RoomType> = await roomValidate(room);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        const validationExisting:ValidationUnique = await this.validateExisting(room);
        if(!validationExisting.success) throw new ValidationException(validationExisting.message, [{field:validationExisting.field, message:validationExisting.message}]);
        const [result]:RowDataPacket[] = await queryTransactionSql(`CALL insert_room(?, ?, ?, ?, ?, ?)`,
            [room.name, room.price, room.description, room.image_url, room.state, JSON.stringify(room.categories)]
        );
        return result[0][0].id;
    }

    static async updateRoom(id:string | null=null, room:Partial<RoomType>):Promise<RoomDto>{
        if(!id) throw new MissingParameterException('id is required', [{field:'id', message:'id is required'}]);
        if(!room) throw new MissingParameterException('room data is required', [{field:'room', message:'data is required'}]);
        const keys:string[] = Object.keys(room);
        if(keys.length === 0) throw new MissingParameterException('No fields found for update room', [{field:'room', message:'not fields to update'}]);
        const validationResult:SafeParseReturnType<Partial<RoomType>, Partial<RoomType>> = await roomPartialValidate(room);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        const validationExisting:ValidationUnique = await this.validateExisting(room);
        if(!validationExisting.success) throw new ValidationException(validationExisting.message, [{field:validationExisting.field, message:validationExisting.message}]);
        const [rows]:RowDataPacket[] = await querySql(`SELECT id FROM Room WHERE id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new NotFoundException('Room not found for update', [{field:'id', message:'not found'}]);
        const [result]:RowDataPacket[] = await queryTransactionSql(`CALL update_room(?, ?, ?,
            ?, ?, ?, ?)`, [id, room.name, room.price, room.description, room.image_url, room.state, JSON.stringify(room.categories)]);
        return new RoomDto(result[0][0]);
    }

    static async deleteRoom(id:string | null=null):Promise<RoomDto>{
        if(!id) throw new MissingParameterException('id is required', [{field:'id', message:'id is required'}]);
        const [rows]:RowDataPacket[] = await querySql(`SELECT DISTINCT r.id, r.name, r.price, r.description, r.image_url, r.state, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', c2.id, 'name', c2.name)) FROM RoomCategory rc2 
            INNER JOIN Category c2 WHERE rc2.room_id = r.id AND c2.id = rc2.category_id) AS categories FROM Room r 
             INNER JOIN RoomCategory rc ON r.id = rc.room_id INNER JOIN Category c ON rc.category_id = c.id WHERE r.name = 'Room2'`, [id]);
        if(rows.length === 0) throw new NotFoundException('Room not found for delete', [{field:'id', message:'not found'}]);
        const [result]:RowDataPacket[] = await querySql(`SELECT re.id FROM Reservation re INNER
             JOIN Room ro ON re.room_id = ro.id where ro.id = ? LIMIT 1`,[id]);
        if(result.length !== 0) throw new ValidationException(`Room to delete must not have any Reservation`, [{field:'reservation', message:'to delete must not have any reservation'}]);
        await queryTransactionSql(`DELETE FROM Room WHERE id =?`, [id]);
        return new RoomDto(rows[0]);
    }
    static async getRoomById(id:string | null=null):Promise<RoomDto>{
        if(!id) throw new MissingParameterException('id is required', [{field:'id', message:'id is required'}]);
        const [rows]:RowDataPacket[] = await querySql(`SELECT DISTINCT r.id, r.name, r.price, r.description, r.image_url, r.state, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', c2.id, 'name', c2.name)) FROM RoomCategory rc2 
            INNER JOIN Category c2 WHERE rc2.room_id = r.id AND c2.id = rc2.category_id) AS categories FROM Room r 
             INNER JOIN RoomCategory rc ON r.id = rc.room_id INNER JOIN Category c ON rc.category_id = c.id WHERE r.id = ?`, [id]);
        if(rows.length === 0) throw new NotFoundException('Room not found', [{field:'id', message:'not found'}]);
        return new RoomDto(rows[0]);
    }

    static async getRoomsByCategory(category:string | null=null):Promise<RoomDto[]>{
        if(!category) throw new MissingParameterException('category is required', [{field:'id', message:'id is required'}]);
        const [rows]:RowDataPacket[] = await querySql(`SELECT DISTINCT r.id, r.name, r.price, r.description, r.image_url, r.state, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', c2.id, 'name', c2.name)) FROM RoomCategory rc2 
            INNER JOIN Category c2 WHERE rc2.room_id = r.id AND c2.id = rc2.category_id) AS categories FROM Room r 
             INNER JOIN RoomCategory rc ON r.id = rc.room_id INNER JOIN Category c ON rc.category_id = c.id WHERE c.name = ?`, [category]);
        return rows.map((el:any)=> new RoomDto(el));
    }
}