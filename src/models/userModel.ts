import { UserType, userValidation, userValidationPartial } from '../schemas/UserSchema.js';
import { fieldsList, messageErrorZod } from "../utils/utils.js";
import { querySql, queryTransactionSql } from '../database.js';
import { UserDto } from '../dtos/userDto.js';
import { RowDataPacket } from 'mysql2';
import { ValidationUnique } from '../types/validationUnique.js'
import { SafeParseReturnType } from 'zod';
import bcrypt from 'bcrypt';
import { NotFoundException } from '../errors/notFoundError.js';
import { MissingParameterException } from '../errors/missingParameterError.js';
import { ValidationException } from '../errors/validationError.js'
export class User{
    static async validateUniqueFields(user:UserType | Partial<UserType>):Promise<ValidationUnique>{
        let { username ,phone_number, email, dni} =  user;
        let [rows]:RowDataPacket[] = await querySql(
            `SELECT (CASE WHEN email = ? THEN 'email' WHEN username = ?
             THEN 'username' WHEN phone_number = ? THEN 'phone_number' WHEN dni = ? THEN 'dni' END)
              AS field FROM User WHERE email = ? OR username = ? OR phone_number = ? OR dni = ?
               LIMIT 1`,
            [email, username, phone_number, dni, email, username, phone_number, dni]);
        if(rows.length > 0){
            return {success: false, message: `User ${rows[0].field} already exists`, field:rows[0].field}
        }
        return {success: true, message: 'User fields correct', field:'OK'};
    }

    static async validateExisting(user:UserType | Partial<UserType>):Promise<ValidationUnique>{
            if(user.rol){
                let [RolRow]:RowDataPacket[] = await querySql(`SELECT id FROM Rol
                     WHERE id = ? LIMIT 1`, [user.rol.id]);
                if(RolRow.length === 0) return {success:false, message:'rol does not exist', field:'rol'};  
            }
            return {success:true, message:`Valids fields`, field:'rol'};
    }

    static async getUsers():Promise<UserDto[]>{
        let [rows]:RowDataPacket[] = await querySql(`SELECT u.id, u.name, 
            u.last_name, u.age, u.dni, u.email, u.username,
                     u.phone_number, r.id as rol_id, r.name as rol_name,
                     a.id as address_id, a.country, a.province, a.city, a.house_number, a.floor
                     FROM User u INNER JOIN Rol r ON u.rol_id = r.id
                     INNER JOIN Address a ON u.id = a.user_id`);
        return rows.map((user:any)=> new UserDto(user));
    }


    static async createUser(user:UserType | null = null):Promise<string>{
        if(!user) throw new MissingParameterException('User data is required', [{field:'user', message:'data is required'}]);
        const validationResult:SafeParseReturnType<UserType, UserType> = await userValidation(user);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        const validationFields:ValidationUnique = await this.validateUniqueFields(user);
        if(!validationFields.success) throw new ValidationException(validationFields.message, [{field:validationFields.field, message:validationFields.message}]);
        const validationExisting:ValidationUnique = await this.validateExisting(user);
        if(!validationExisting.success) throw new ValidationException(validationExisting.message, [{field:validationExisting.field, message:validationExisting.message}]);
        let hashedPassword:string = await bcrypt.hash(user.password, 10);
        let [rows]:RowDataPacket[] = await queryTransactionSql(`CALL insert_user(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            , [user.name, user.last_name, user.age, user.dni, user.email, user.username,
                 hashedPassword, user.phone_number, user.rol.id
                ,user.address.country, user.address.province, user.address.city,
                 user.address.house_number,
                user.address.floor]);
        return rows[0][0].id;
    }

    static async deleteUserById(id:string | null=null):Promise<UserDto>{
        if(!id) throw new MissingParameterException('User id is required for delete', [{field:'id', message:'id is required'}]);
        let [rows]:RowDataPacket[] = await queryTransactionSql(`SELECT u.id, u.name, u.last_name,
            u.age, u.dni, u.username, u.phone_number, r.id as rol_id,
            r.name as rol_name, a.id as address_id, a.country, a.province,
             a.city, a.house_number, a.floor
             FROM User u INNER JOIN Rol r ON u.rol_id = r.id
             INNER JOIN Address a ON u.id = a.user_id WHERE u.id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new NotFoundException('User not found for delete', [{field:'id', message:'not found'}]);
        let [result]:RowDataPacket[] = await querySql(`SELECT r.id FROM Reservation r INNER JOIN User u ON
             r.user_id = u.id WHERE u.id = ? LIMIT 1`, [id]);
    if(result.length !== 0) throw new ValidationException(`User to delete must not have any reservation`, [{field:'reservation', message:'to delete must not have any reservation'}]);
        await querySql(`DELETE FROM User WHERE id = ?`, [id]);
        return new UserDto(rows[0]);
    }

    static async updateUser(user:Partial<UserType> | null=null, id:string | null=null):Promise<UserDto>{
        if(!id) throw new MissingParameterException('User id is required for update', [{field:'id', message:'id is required'}]);
        if(!user) throw new MissingParameterException('User data is required for update', [{field:'user', message:'data is required'}]);
        const keys: string[] = Object.keys(user);
        if(keys.length === 0) throw new MissingParameterException('No fields found for update user', [{field:'user', message:'not fields for update'}]);
        const validationResult:SafeParseReturnType<Partial<UserType>,Partial<UserType>> = await userValidationPartial(user);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        const validationFields:ValidationUnique = await this.validateUniqueFields(user);
        if(!validationFields.success) throw new ValidationException(validationFields.message, [{field:validationFields.field, message:validationFields.message}]);
        const validationExisting:ValidationUnique = await this.validateExisting(user);
        if(!validationExisting.success) throw new ValidationException(validationExisting.message, [{field:validationExisting.field, message:validationExisting.message}]);
        let [rows]:RowDataPacket[] = await querySql('SELECT name FROM User WHERE id = ? LIMIT 1', [id]);
        if(rows.length === 0) throw new NotFoundException('Not found User for update', [{field:'id', message:'not found'}]);
        let rolId:string | null = null;
        if(user.rol) rolId = user.rol.id;
        let [result] = await queryTransactionSql(`Call update_user(
            ?, ? ,? ,? ,? , ?, ?, ?, ?, ?)`, [id, user.name, user.last_name, user.age, user.dni,
                 user.email, user.username,
                user.password, user.phone_number, rolId]);
        return new UserDto(result[0][0]);
    }

    static async getUserById(id:string | null=null):Promise<UserDto> {
        if(!id) throw new MissingParameterException("id params is required", [{field:'id', message:'id is required'}]);
        let [rows]:RowDataPacket[] = await querySql(`SELECT u.id, u.name, u.last_name,
            u.age, u.dni, u.username, u.email, u.phone_number, r.id as rol_id,
            r.name as rol_name, a.id as address_id, a.country, a.province,
             a.city, a.house_number, a.floor
             FROM User u INNER JOIN Rol r ON u.rol_id = r.id
             INNER JOIN Address a ON u.id = a.user_id WHERE u.id = ? LIMIT 1`, [id]);
        if(rows.length === 0)throw new NotFoundException('User not found', [{field:'id', message:'not found'}]);
        return new UserDto(rows[0]);
    }
}   