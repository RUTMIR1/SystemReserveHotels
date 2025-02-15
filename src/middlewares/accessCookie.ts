import { Request, Response, NextFunction} from 'express';
import { SessionData } from '../types/requestSession.js';
import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();    

export const accessCookie = async (req:Request, res:Response, next:NextFunction):Promise<void>=>{
    const token:string = req.cookies?.access_token;
    req.payload = {username: '', rol:''} as SessionData;
    if(!token || typeof token !== 'string'){
        return next();
    }
    const data:string | JwtPayload = jwt.verify(token, process.env.JWT_SECRET as string);
    req.payload = data as SessionData;
    console.log(req.payload);
    return next();
}

export const authVerification = (allowed:string[]=[])=>{
    return async (req:Request, res:Response, next:NextFunction):Promise<void>=>{
        if(allowed.length === 0) return next();
        if(allowed.includes(req.payload.rol)) return next();
        if(req.payload.rol === ''){
            res.status(401).json({status:401, message: 'Unauthorized access'});
        }else{
            res.status(403).json({status:403, message: 'No Permission to use'});
        }
    }
}