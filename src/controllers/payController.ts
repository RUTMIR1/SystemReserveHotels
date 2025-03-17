import { MercadoPagoService } from "../services/mercadoPagoService.js";
import { Request, Response } from "express";
import { ExceptionsData } from "../types/exceptionsData.js";
import { Room } from "../models/roomModel.js"

export class PayController{
     
    static async createPay(req:Request, res:Response){
        try{
            let response = await MercadoPagoService.createPreference(req.body);
            res.status(200).json(response);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
                       , data:ExceptionsData = err.data || [{field:'', message:''}];
                       res.status(status).json({status, message, data});
        }
    }

    static async webhook(req:Request, res:Response){
        try{
            if(req.query['type'] === 'payment'){
                const data = await MercadoPagoService.getPayment(req.query['data.id'] as string);
                if(data.status === 'approved'){
                    let {room_id, user_id} = data.metadata;
                    await Room.updateRoom(room_id, {state:'reserved'});
                    //Room.updateRoom({});
                    //necesito encontrar la room. cambiar el estado de la room.
                    //registrar reserva!!!
                }
            }
            res.status(204);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
                       , data:ExceptionsData = err.data || [{field:'', message:''}];
                       res.status(status).json({status, message, data});
        }
    }
}