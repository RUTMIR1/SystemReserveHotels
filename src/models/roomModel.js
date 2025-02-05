import { roomValidate, roomPartialValidate } from "../schemas/RoomSchema.js";
import { querySql, queryTransactionSql } from "../database.js";
import { messageErrorZod } from "../utils/utils.js";

export class Room{
    static async getRooms(){
        const [rows] = await querySql(`SELECT id, name, price, description, image_url, 
            state FROM Room`);
        return rows;
    }

    static async createRoom({room}){
        if(!room) throw new Error('room data is required');
        const validationResult = await roomValidate(room);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        let {name, price, description, image_url, state} = room;
        const [result] = await queryTransactionSql(`CALL insert_room(?, ?, ?, ?, ?)`,
            [name, price, description, image_url, state]
        );
        return result[0][0].id;
    }

    static async updateRoom({id, room}){
        if(!id) throw new Error('id is required');
        if(!room) throw new Error('room data is required');
        const keys = Object.keys(room);
        if(keys.length === 0) throw new Error('No fields found for update room');       
        const validationResult = await roomPartialValidate(room);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const [rows] = await querySql(`SELECT id FROM Room WHERE id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('Room not found for update');
        let {name, price, description, image_url, state} = room;
        const [result] = await queryTransactionSql(`CALL update_room(?, ?, ?,
            ?, ?, ?)`, [id, name, price, description, image_url, state]);
        return result[0][0];
    }

    static async deleteRoom({id}){
        if(!id) throw new Error('id is required');
        const [rows] = await querySql(`SELECT id FROM Room WHERE id =? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('Room not found for delete');
        await queryTransactionSql(`DELETE FROM Room WHERE id =?`, [id]);
        return rows[0].id;
    }
    static async getRoomById({id}){
        if(!id) throw new Error('id is required');
        const [rows] = await querySql(`SELECT id, name, price, description, image_url,
            state FROM Room WHERE id =? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('Room not found');
        return rows[0];
    }
}