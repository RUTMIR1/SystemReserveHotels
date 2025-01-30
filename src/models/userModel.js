import { userValidation } from '../schemas/UserSchema.js';
import { messageErrorZod } from "../utils/utils.js";
import { querySql, queryTransactionSql } from '../database.js';
export class User{

    static async getUsers(){
        const connection = await cnn.getConnection();
    }


    static async createUser({user}){
        const validationResult = userValidation(user);
        if(!validationResult.success){
            throw new Error(messageErrorZod(validationResult));
        }
        try{
            
        }catch(err){
            throw new Error(err.message);
        }finally{
            connection.release();
        }
    }


}