import { Request, Response, NextFunction} from 'express';
import { SessionData } from '../types/requestSession.js';
import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthService } from '../services/authService.js';
import { ExceptionsData } from '../types/exceptionsData.js';

dotenv.config();    

export const accessCookie = async (req:Request, res:Response, next:NextFunction):Promise<void>=>{
    try{
        const token:string = req.cookies?.access_token;
        req.payload = {username: '', rol:'', id: ''} as SessionData;
        if(!token || typeof token !== 'string' || isTokenExpired(token, process.env.JWT_SECRET as string)){
            const tokenRefresh = req.cookies?.refresh_token;
            if(tokenRefresh && typeof tokenRefresh === 'string' && !isTokenExpired(tokenRefresh, process.env.JWT_REFRESH_SECRET as string)){
                const {newToken, newRefreshToken} = await AuthService.refreshTokens(tokenRefresh);
                res.cookie('refresh_token', newRefreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 60 * 24
                });
                res.cookie('access_token', newToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: "lax",
                    maxAge: 1000 * 60 * 60
                });
                const data:string | JwtPayload = jwt.verify(newRefreshToken, process.env.JWT_REFRESH_SECRET as string);
                req.payload = data as SessionData;
                console.log(req.payload);
                return next();
            }else{
                console.log("no tengo cokkie de refresh")
                return next();
            }
        }else{
            console.log("tengo cookie de acceso")
            const data:string | JwtPayload = jwt.verify(token, process.env.JWT_SECRET as string);
            req.payload = data as SessionData;
            console.log(req.payload);
            return next();
        }
    }catch(err:any){
        let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
    }
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

const isTokenExpired = (token:string, secret:string):boolean=>{
    try{
        const data = jwt.verify(token, secret);
        const d = data as SessionData;
        if(!d.exp) return true;
        return d.exp*1000 < Date.now();
    }catch(err){
        return true;
    }
}