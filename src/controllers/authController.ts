import { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import { SessionData } from "../types/requestSession.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';
import { AuthException } from "../errors/authError.js";
import { ExceptionsData } from "../types/exceptionsData.js";

dotenv.config();

export class authController{
    static async logIn(req:Request, res:Response):Promise<void>{
        try{
            const {token, refreshToken} = await AuthService.loginUser(req.body);

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: true,
                maxAge: 1000 * 60 * 60 * 24
            })

            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: true,
                maxAge: 1000 * 60* 10
            }).send({message: "Session sucessfully", token});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async logOut(req:Request, res:Response):Promise<void>{
        try{
            res.clearCookie('access-token').json({status:200, message:'logout successfully'});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error';
            res.status(status).json({status, message});
        }
    }

    static async register(req:Request, res:Response):Promise<void>{
        try{
            await AuthService.registerUser(req.body);
            res.status(201).json({status:201, message:'User Created Successfully'})
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async me(req:Request, res:Response):Promise<void>{
        try{
            const token:string = req.cookies?.access_token;
            if(!token || typeof token !== 'string'){
                throw new AuthException('not cookie for data user', [{field:'cookie', message:'not cookie for data user'}]);
            }
            const data:string | JwtPayload = jwt.verify(token, process.env.JWT_SECRET as string);
            res.status(200).json(data);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }
    static async refresherToken(req:Request, res:Response):Promise<void>{
        try{
            const tokenRefresh:string = req.cookies?.refresh_token;
            if(!tokenRefresh || typeof tokenRefresh !== 'string'){
                throw new AuthException('not cookie for refresh cookie', [{field:'cookie', message:'not cookie for refresh cookie'}]);
            }
            jwt.verify(tokenRefresh, process.env.JWT_REFRESH_SECRET as string, (err, decoded)=>{
                if(err){
                    return res.status(406).json({message: 'Unauthorized'});
                }else{
                    accessToken = jwt.sign({
                        
                    })
                }
            });
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }
}