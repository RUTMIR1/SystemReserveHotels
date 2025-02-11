import { UserType, userValidation, userValidationPartial } from '../schemas/UserSchema.js';
import { messageErrorZod } from "../utils/utils.js";
import { querySql, queryTransactionSql } from '../database.js';
import { UserDto } from '../dtos/userDto.js';
import { RowDataPacket } from 'mysql2';
import { ValidationUnique } from '../types/validationUnique.js'
import { SafeParseReturnType } from 'zod';

export class User{
    static async validateUniqueFields(user:UserType | Partial<UserType>):Promise<ValidationUnique>{
        let { username ,phone_number, email} =  user;
        let [rows]:RowDataPacket[] = await querySql(
            `SELECT (CASE WHEN email = ? THEN 'email' WHEN username = ?
             THEN 'username' WHEN phone_number = ? THEN 'phone_number' END)
              AS field FROM User WHERE email = ? OR username = ? OR phone_number = ?
               LIMIT 1`,
            [email, username, phone_number, email, username, phone_number]);
        if(rows.length > 0){
            return {success: false, message: `User ${rows[0].field} already exists`}
        }
        return {success: true, message: 'User fields correct'};
    }

    static async getUsers():Promise<UserDto[]>{
        let [rows]:RowDataPacket[] = await querySql(`SELECT u.id, u.name, 
            u.last_name, u.age, u.email, u.username,
                     u.phone_number, r.id as rol_id, r.name as rol_name,
                     a.id as address_id, a.country, a.province, a.city, a.house_number, a.floor
                     FROM User u INNER JOIN Rol r ON u.rol_id = r.id
                     INNER JOIN Address a ON u.id = a.user_id`);
        return rows.map((user:any)=> new UserDto(user));
    }


    static async createUser(user:UserType | null = null):Promise<string>{
        if(!user) throw new Error('User data is required');
        const validationResult:SafeParseReturnType<UserType, UserType> = await userValidation(user);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const validationFields:ValidationUnique = await this.validateUniqueFields(user);
        if(!validationFields.success) throw new Error(validationFields.message);
        let [rows]:RowDataPacket[] = await queryTransactionSql(`CALL insert_user(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            , [user.name, user.last_name, user.age, user.email, user.username,
                 user.password, user.phone_number, user.rol.id
                ,user.address.country, user.address.province, user.address.city,
                 user.address.house_number,
                user.address.floor]);
        return rows[0][0].id;
    }

    static async deleteUserById(id:string | null=null):Promise<UserDto>{
        if(!id) throw new Error('User id is required for delete');
        let [rows]:RowDataPacket[] = await queryTransactionSql(`SELECT u.id, u.name, u.last_name,
            u.age, u.username, u.phone_number, r.id as rol_id,
            r.name as rol_name, a.id as address_id, a.country, a.province,
             a.city, a.house_number, a.floor
             FROM User u INNER JOIN Rol r ON u.rol_id = r.id
             INNER JOIN Address a ON u.id = a.user_id WHERE u.id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('User not found for deleted');
        let [result]:RowDataPacket[] = await querySql(`SELECT r.id FROM Reservation r INNER JOIN User u ON
             r.user_id = u.id LIMIT 1`);
        if(result.length !== 0) throw new Error(`User to delete must not have any reservation`);
        await querySql(`DELETE FROM User WHERE id = ?`, [id]);
        return new UserDto(rows[0]);
    }

    static async updateUser(user:Partial<UserType> | null=null, id:string | null=null):Promise<UserDto>{
        if(!id) throw new Error('User id is required for update');
        if(!user) throw new Error('User data is required for update');
        const validationResult:SafeParseReturnType<Partial<UserType>,Partial<UserType>> = await userValidationPartial(user);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const validationFields:ValidationUnique = await this.validateUniqueFields(user);
        if(!validationFields.success) throw new Error(validationFields.message);
        const keys: string[] = Object.keys(user);
        if(keys.length === 0) throw new Error('No fields found for update user');
        let [rows]:RowDataPacket[] = await querySql('SELECT name FROM User WHERE id = ? LIMIT 1', [id]);
        if(rows.length === 0) throw new Error('Not found User for update');
        let rolId:string | null = null;
        if(user.rol) rolId = user.rol.id;
        let [result] = await queryTransactionSql(`Call update_user(
            ?, ? ,? ,? ,? , ?, ?, ?, ?)`, [id, user.name, user.last_name, user.age,
                 user.email, user.username,
                user.password, user.phone_number, rolId]);
        return new UserDto(result[0][0]);
    }

    static async getUserById(id:string | null=null):Promise<UserDto> {
        if(!id) throw new Error ("id params is required");
        let [rows]:RowDataPacket[] = await querySql(`SELECT u.id, u.name, u.last_name,
            u.age, u.username, u.phone_number, r.id as rol_id,
            r.name as rol_name, a.id as address_id, a.country, a.province,
             a.city, a.house_number, a.floor
             FROM User u INNER JOIN Rol r ON u.rol_id = r.id
             INNER JOIN Address a ON u.id = a.user_id WHERE u.id = ? LIMIT 1`, [id]);
        if(rows.length === 0)throw new Error('User not found');
        return new UserDto(rows[0]);
    }
}   