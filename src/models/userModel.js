import { userValidation, userValidationPartial } from '../schemas/UserSchema.js';
import { messageErrorZod } from "../utils/utils.js";
import { querySql, queryTransactionSql } from '../database.js';
export class User{
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
        let [rows] = await querySql(`SELECT id, name,
                    last_name, age, email, username, phone_number FROM User`);
        return rows;
    }


    static async createUser({user=null}){
        if(!user) throw new Error('User data is required');
        const validationResult = await userValidation(user);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        let { name, last_name, age, email, username, password, phone_number} = user;
        const validationFields = await this.validateUniqueFields(user);
        if(!validationFields.success) throw new Error(validationFields.message);
        let [rows] = await queryTransactionSql(`CALL insert_user(?, ?, ?, ?, ?, ?, ?)`
            , [name, last_name, age, email, username, password, phone_number]);
        return rows[0][0].id;
    }

    static async deleteUserById({id=null}){
        if(!id) throw new Error('User id is required for delete');
        let [rows] = await queryTransactionSql(`SELECT 
            name FROM User
            Where id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('User not found for deleted');
        await querySql(`DELETE FROM User WHERE id = ?`, [id]);
        return rows[0];
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
        let {name, last_name, age, email, username, password, phone_number} = user;
         [rows] = await queryTransactionSql(`Call update_user(
            ?, ? ,? ,? , ?, ?, ?, ?)`, [id , name, last_name, age, email, username,
                password, phone_number]);
        return rows[0];
    }

    static async getUserById({id=null}){
        if(!id) throw new Error ("id params is required");
        let [rows] = await querySql(`SELECT name FROM User WHERE id = ? LIMIT 1`, [id]);
        if(rows.length === 0)throw new Error('User not found');
        return rows[0];
    }
}