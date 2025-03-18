import { MercadoPagoService } from "../services/mercadoPagoService.js";
import { Request, Response } from "express";
import { ExceptionsData } from "../types/exceptionsData.js";
import { Room } from "../models/roomModel.js"
import { Reservation } from "../models/reservationModel.js";

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
                console.log(data);
                if(data.status === 'approved'){
                    console.log("se ejecuta lo segundo --")
                    let {reservation} = data.metadata;
                    console.log(reservation);
                    await Reservation.generateReservationPaid(reservation);
                    console.log("se guarda reservacion!");
                    await Room.updateRoom(reservation.room.id, {state:'reserved'});
                    console.log("se cambia estado de habitacion");
                }
            }
            res.status(204);
        }catch(err:any){
            console.log(err);
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
                       , data:ExceptionsData = err.data || [{field:'', message:''}];
                       res.status(status).json({status, message, data});
        }
    }
}