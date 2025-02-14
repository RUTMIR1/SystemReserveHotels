import { RowDataPacket } from "mysql2";
import { AuthType, authValidation } from "../schemas/authSchema.js";
import { messageErrorZod } from "../utils/utils.js";
import { querySql } from "../database.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { SessionData } from "../types/requestSession.js";
import bcrypt from 'bcrypt';

dotenv.config();

const JWT_SECRET:string = process.env.JWT_SECRET || "DEFAULT";

export class authService{

    static async loginUser(dataAuth:AuthType){
        const resultValidation = await authValidation(dataAuth);
        if(!resultValidation.success) throw new Error(messageErrorZod(resultValidation));
        const [rows]:RowDataPacket[] = await querySql(`SELECT u.username, u.password, r.name FROM User u
             INNER JOIN Rol r ON u.rol_id = r.id WHERE username = ?`, [dataAuth.username]);
        if(rows.length === 0) throw new Error('User not exist');
        const resultCompare:boolean = await bcrypt.compare(dataAuth.password, rows[0].password);
        if(!resultCompare) throw new Error('password incorrect');
        const newDataAuth:SessionData = {username: rows[0].username, rol:rows[0].name};
        const token = jwt.sign(newDataAuth, JWT_SECRET, { 
            expiresIn: '1h'
        });
        return token;
    }       
}