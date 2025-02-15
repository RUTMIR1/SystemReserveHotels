import { RowDataPacket } from "mysql2";
import { AuthType, authValidation } from "../schemas/authSchema.js";
import { messageErrorZod } from "../utils/utils.js";
import { querySql, queryTransactionSql } from "../database.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { SessionData } from "../types/requestSession.js";
import bcrypt from 'bcrypt';
import { ValidationException } from "../errors/validationError.js";
import { NotFoundException } from "../errors/notFoundError.js";
import { AuthException } from "../errors/authError.js";
import { UserRegisterType, userRegisterValidation } from "../schemas/UserSchema.js";
import { MissingParameterException } from "../errors/missingParameterError.js";
import { SafeParseReturnType } from "zod";
import { User } from "../models/userModel.js";
import { ValidationUnique } from "../types/validationUnique.js";

dotenv.config();

const JWT_SECRET:string = process.env.JWT_SECRET || "DEFAULT";

export class AuthService{

    static async loginUser(dataAuth:AuthType | null=null):Promise<string>{
        if(!dataAuth) throw new MissingParameterException('User data login is required');
        const resultValidation:SafeParseReturnType<AuthType, AuthType> = await authValidation(dataAuth);
        if(!resultValidation.success) throw new ValidationException(messageErrorZod(resultValidation));
        const [rows]:RowDataPacket[] = await querySql(`SELECT u.username, u.password, r.name FROM User u
             INNER JOIN Rol r ON u.rol_id = r.id WHERE username = ?`, [dataAuth.username]);
        if(rows.length === 0) throw new NotFoundException('User not exist');
        const resultCompare:boolean = await bcrypt.compare(dataAuth.password, rows[0].password);
        if(!resultCompare) throw new AuthException('password incorrect');
        const newDataAuth:SessionData = {username: rows[0].username, rol:rows[0].name};
        const token:string = jwt.sign(newDataAuth, JWT_SECRET, { 
            expiresIn: '1h'
        });
        return token;
    }

    static async registerUser(user:UserRegisterType | null=null):Promise<void>{
        if(!user) throw new MissingParameterException('User data register is required');
        const resultValidation:SafeParseReturnType<UserRegisterType, UserRegisterType> = await userRegisterValidation(user);
        if(!resultValidation.success) throw new ValidationException(messageErrorZod(resultValidation));
        const resultUniqueValidation:ValidationUnique = await User.validateUniqueFields(user);
        if(!resultUniqueValidation.success) throw new ValidationException(resultUniqueValidation.message);
        let hashedPassword:string = await bcrypt.hash(user.password, 10);
        const [rol]:RowDataPacket[] = await querySql(`SELECT id FROM Rol WHERE name = 'user'`);
        const [rows]:RowDataPacket[] = await queryTransactionSql(`CALL insert_user(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                    , [user.name, user.last_name, user.age, user.email, user.username,
                         hashedPassword, user.phone_number, rol[0].id
                        ,user.address.country, user.address.province, user.address.city,
                         user.address.house_number,
                        user.address.floor]);
    }
}