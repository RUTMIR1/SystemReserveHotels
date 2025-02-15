import { ReservationDto } from "../dtos/ReservationDto.js";
import { Reservation } from "../models/reservationModel.js";
import { Request, Response } from "express";

export class ReservationController{
    
    static async getReservations(req:Request, res:Response):Promise<void>{
        try{
            let reservations:ReservationDto[] = await Reservation.getReservations();
            res.status(200).json(reservations);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error';
            res.status(status).json({status, message});
        }
    }
    
    static async createReservation(req:Request, res:Response):Promise<void>{
        try{
            let reservationId:string = await Reservation.createReservation(req.body);
            res.status(201).json({status: 201, message: 'Reservation created successfully!',
                reservation: reservationId});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error';
            res.status(status).json({status, message});
        }
    }

    static async updateReservation(req:Request, res:Response):Promise<void>{
        try{
            let reservationUpdate:ReservationDto = await Reservation.updateReservation(req.params.id, req.body);
            res.status(200).json({status: 200, message: `Reservation updated successfully`,
                reservation: reservationUpdate});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error';
            res.status(status).json({status, message});
        }
    }

    static async deleteReservation(req:Request, res:Response):Promise<void>{
        try{
            let reservationDeleted:ReservationDto = await Reservation.deleteReservation(req.params.id);
            res.status(200).json({status: 200, message: 'Reservation deleted successfully',
                reservation: reservationDeleted});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error';
            res.status(status).json({status, message});
        }
    }
    
    static async getReservationById(req:Request, res:Response):Promise<void>{
        try{
            let reservation:ReservationDto = await Reservation.getReservationById(req.params.id);
            res.status(200).json(reservation);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error';
            res.status(status).json({status, message});
        }
    }
}



