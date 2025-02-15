import { Request, Response } from "express";
import { AuthService } from "../services/authService.js";

export class authController{
    static async logIn(req:Request, res:Response):Promise<void>{
        try{
            const token:string = await AuthService.loginUser(req.body);
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: true,
                maxAge: 1000 * 60* 60
            }).send({message: "Session sucessfully", token});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error';
            res.status(status).json({status, message});
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
            let status:number = err.status || 403, message:string = err.message as string || 'Error';
            res.status(status).json({status, message});
        }
    }
}