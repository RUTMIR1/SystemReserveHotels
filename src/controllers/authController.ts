import { Request, Response } from "express";
import { authService } from "../services/authService.js";

export class authController{
    static async logIn(req:Request, res:Response):Promise<void>{
        try{
            const token = await authService.loginUser(req.body);
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: true,
                maxAge: 1000 * 60* 60
            }).send({message: "Session sucessfully", token})
        }catch(err:any){
            res.status(403).json({status: 403, message: err.message});
        }
    }

    static async logOut(req:Request, res:Response):Promise<void>{
        try{
            res.clearCookie('access-token').json({status:200, message:'logout successfully'});
        }catch(err:any){
            res.status(403).json({status:403, message:`${err.message}`});
        }
    }
}