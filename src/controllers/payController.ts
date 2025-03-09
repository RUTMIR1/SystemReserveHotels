import { MercadoPagoService } from "../services/mercadoPagoService.js";
import { Request, Response } from "express";
export class PayController{
     
    static async createPay(req:Request, res:Response){
        try{
            let response = await MercadoPagoService.createPreference(req.body);
            //res.status(200).json({ id: response.body.id, init_point: response.body.init_point});
        }catch(err:any){
            res.status(403).json({});
        }
    }
}