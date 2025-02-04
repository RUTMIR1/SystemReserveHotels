import { userValidation, userValidationPartial } from '../schemas/UserSchema.js';
import { messageErrorZod } from "../utils/utils.js";
import { querySql, queryTransactionSql } from '../database.js';


export class User{

    
    static buildUserReturn(user){
        return {
            id: user.id,
            name: user.name,
            last_name: user.last_name,
            age: user.age,
            email: user.email,
            username: user.username,
            phone_number: user.phone_number,
            rol: {id: user.rol_id, name: user.rol_name},
            address: {
                id: user.address_id,
                country: user.country,
                province: user.province,
                city: user.city,
                house_number: user.house_number,
                floor: user.floor
            }
        };
    };

    static async validateUniqueFields(user){
        let { username, phone_number, email} =  user;
        let [rows] = await querySql(
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

    static async getUsers(){
        let [rows] = await querySql(`SELECT u.id, u.name,
                    u.last_name, u.age, u.email, u.username,
                     u.phone_number, r.id as rol_id, r.name as rol_name,
                     a.id as address_id, a.country, a.province, a.city, a.house_number, a.floor
                     FROM User u INNER JOIN Rol r ON u.rol_id = r.id
                     INNER JOIN Address a ON u.id = a.user_id`);
        return rows.map(user=>this.buildUserReturn(user));
    }


    static async createUser({user=null}){
        if(!user) throw new Error('User data is required');
        const validationResult = await userValidation(user);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        let { name, last_name, age, email, username, password, phone_number, rol, address} = user;
        const validationFields = await this.validateUniqueFields(user);
        if(!validationFields.success) throw new Error(validationFields.message);
        let [rows] = await queryTransactionSql(`CALL insert_user(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            , [name, last_name, age, email, username, password, phone_number, rol.id
                ,address.country, address.province, address.city, address.house_number,
                address.floor]);
        return rows[0][0].id;
    }

    static async deleteUserById({id=null}){
        if(!id) throw new Error('User id is required for delete');
        let [rows] = await queryTransactionSql(`SELECT u.name, u.last_name,
            u.age, u.username, u.phone_number, r.id as rol_id,
            r.name as rol_name, a.id as address_id, a.country, a.province,
             a.city, a.house_number, a.floor
             FROM User u INNER JOIN Rol r ON u.rol_id = r.id
             INNER JOIN Address a ON u.id = a.user_id WHERE u.id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('User not found for deleted');
        await querySql(`DELETE FROM User WHERE id = ?`, [id]);
        return this.buildUserReturn(rows[0]);
    }

    static async updateUser({user=null, id=null}){
        if(!id) throw new Error('User id is required for update');
        if(!user) throw new Error('User data is required for update');
        const validationResult = await userValidationPartial(user);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const validationFields = await this.validateUniqueFields(user);
        if(!validationFields.success) throw new Error(validationFields.message);
        const keys = Object.keys(user);
        if(keys.length === 0) throw new Error('No fields found for update user');
        let [rows] = await querySql('SELECT name FROM User WHERE id = ? LIMIT 1', [id]);
        if(rows.length === 0) throw new Error('Not found User for update');
        let {name, last_name, age, email, username, password, phone_number, rol} = user;
        if(rol) rol = rol.id;
         [rows] = await queryTransactionSql(`Call update_user(
            ?, ? ,? ,? ,? , ?, ?, ?, ?)`, [id, name, last_name, age, email, username,
                password, phone_number, rol]);
        return this.buildUserReturn(rows[0][0]);
    }

    static async getUserById({id=null}){
        if(!id) throw new Error ("id params is required");
        let [rows] = await querySql(`SELECT u.name, u.last_name,
            u.age, u.username, u.phone_number, r.id as rol_id,
            r.name as rol_name, a.id as address_id, a.country, a.province,
             a.city, a.house_number, a.floor
             FROM User u INNER JOIN Rol r ON u.rol_id = r.id
             INNER JOIN Address a ON u.id = a.user_id WHERE u.id = ? LIMIT 1`, [id]);
        if(rows.length === 0)throw new Error('User not found');
        return this.buildUserReturn(rows[0]);
    }
}