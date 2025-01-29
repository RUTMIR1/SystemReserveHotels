import { userValidation } from '../schemas/UserSchema.js';
import { messageErrorZod } from "../utils/utils.js";
import { cnn } from '../database.js';
export class User{
    static async createUser({user}){
        const validationResult = userValidation(user);
        if(!validationResult.success){
            throw new Error(messageErrorZod(validationResult));
        }
        const connection = await cnn.getConnection();
        try{
            await connection.beginTransaction();
            let { name, lastName, age, email, username, password} = user;
            let result = await connection.query(`Insert into User (name, age, email, username, password) 
                Values (?, ?, ?, ?, ?, ?)`, 
                [name, lastName, age, email, username, password]);
            await connection.commit();
            return result;
        }catch(err){
            throw new Error(err.message);
        }finally{
            connection.release();
        }
    }
}