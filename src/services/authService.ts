import { RowDataPacket } from "mysql2";
import { AuthType, authValidation } from "../schemas/authSchema.js";
import { fieldsList, messageErrorZod } from "../utils/utils.js";
import { querySql, queryTransactionSql } from "../database.js";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
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

interface ITokens{
    token:string;
    refreshToken:string;
}

const JWT_SECRET:string = process.env.JWT_SECRET || "DEFAULT";  
const JWT_REFRESH_SECRET:string = process.env.JWT_REFRESH_SECRET || "DEFAULT";

export class AuthService{

    static async loginUser(dataAuth:AuthType | null=null):Promise<ITokens>{
        if(!dataAuth) throw new MissingParameterException('User data login is required', [{field:'user', message:'data login is required'}]);
        const resultValidation:SafeParseReturnType<AuthType, AuthType> = await authValidation(dataAuth);
        if(!resultValidation.success) throw new ValidationException(messageErrorZod(resultValidation), fieldsList(resultValidation));
        const [rows]:RowDataPacket[] = await querySql(`SELECT u.id, u.username, u.password, r.name FROM User u
             INNER JOIN Rol r ON u.rol_id = r.id WHERE username = ?`, [dataAuth.username]);
        if(rows.length === 0) throw new NotFoundException('User not exist', [{field:'username', message:'username not exist'}]);
        const resultCompare:boolean = await bcrypt.compare(dataAuth.password, rows[0].password);
        if(!resultCompare) throw new AuthException('password incorrect', [{field:'password', message:'password incorrect'}]);
        const newDataAuth:SessionData = {username: rows[0].username, rol:rows[0].name, id:rows[0].id};
        const token:string = jwt.sign(newDataAuth, JWT_SECRET, { 
            expiresIn: '1h'
        });
        const refreshToken:string =jwt.sign(newDataAuth, JWT_REFRESH_SECRET,{
            expiresIn: '24h'
        });
        return {token, refreshToken};
    }

    static async registerUser(user:UserRegisterType | null=null):Promise<void>{
        if(!user) throw new MissingParameterException('User data register is required', [{field:'user', message:'data is required'}]);
        const resultValidation:SafeParseReturnType<UserRegisterType, UserRegisterType> = await userRegisterValidation(user);
        if(!resultValidation.success) throw new ValidationException(messageErrorZod(resultValidation), fieldsList(resultValidation));
        const resultUniqueValidation:ValidationUnique = await User.validateUniqueFields(user);
        if(!resultUniqueValidation.success) throw new ValidationException(resultUniqueValidation.message, [{field:resultUniqueValidation.field, message:resultUniqueValidation.message}]);
        let hashedPassword:string = await bcrypt.hash(user.password, 10);
        const [rol]:RowDataPacket[] = await querySql(`SELECT id FROM Rol WHERE name = 'user'`);
        await queryTransactionSql(`CALL insert_user(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                    , [user.name, user.last_name, user.age, user.email, user.username,
                         hashedPassword, user.phone_number, rol[0].id
                        ,user.address.country, user.address.province, user.address.city,
                         user.address.house_number,
                        user.address.floor]);
    }
    static async refreshTokens(tokenRefresh:string){
            console.log("arrancamos con el metodo")
            console.log(tokenRefresh)
            if(!tokenRefresh || typeof tokenRefresh !== 'string'){
                throw new AuthException('not cookie for refresh cookie', [{field:'cookie', message:'not cookie for refresh cookie'}]);
            }
            let newToken:string = '', newRefreshToken:string = '';
            console.log("pasamos la primera prueba")
            jwt.verify(tokenRefresh, process.env.JWT_REFRESH_SECRET as string, (err, decoded)=>{
                if(err){
                    console.log("aca hubo un error")
                    throw new AuthException('unauthorized', [{field:'token', message: 'unauthorized'}]);
                }else{
                    console.log("hacemos algo con refresh")
                    let {username, rol, id} = decoded as JwtPayload;
                    console.log("!decoded! ",decoded )
                    newToken = jwt.sign({username, rol, id} as JwtPayload, 
                        process.env.JWT_SECRET as string, {
                            expiresIn: '1h'
                        });
                    newRefreshToken =jwt.sign({username, rol, id} as JwtPayload, 
                        process.env.JWT_REFRESH_SECRET as string,{
                            expiresIn: '24h'
                        });
                }});
            return { newToken, newRefreshToken};
    } 
}