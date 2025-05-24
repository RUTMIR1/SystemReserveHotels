import { RoomDto } from "../dtos/RoomDto.js";
import { Room } from "../models/roomModel.js";
import { Request, Response } from "express";
import { ExceptionsData } from "../types/exceptionsData.js";
export class RoomController{
    
    static async getRooms(req:Request, res:Response):Promise<void>{
        try{
            let rooms:RoomDto[] = await Room.getRooms();
            console.log(rooms);
            res.status(200).json(rooms);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async createRoom(req:Request, res:Response):Promise<void>{
        try{
            let roomId:string = await Room.createRoom(req.body);
            res.status(201).json({status:201, message: 'Room created successfully',
                room: roomId});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async updateRoom(req:Request, res:Response):Promise<void>{
        try{
            let roomUpdate:RoomDto = await Room.updateRoom(req.params.id, req.body);
            res.status(200).json({status:200, message: `Room updated successfully`,
                room: roomUpdate});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async deleteRoom(req:Request, res:Response):Promise<void>{
        try{
            let roomDeleted:RoomDto = await Room.deleteRoom(req.params.id);
            res.status(200).json({status: 200, message: `Room deleted successfully`,
                room: roomDeleted});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async getRoomById(req:Request, res:Response):Promise<void>{
        try{
            let room:RoomDto = await Room.getRoomById(req.params.id);
            res.status(200).json(room);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async getRoomsByCategory(req:Request, res:Response):Promise<void>{
        try{
            const rooms:RoomDto[] = await Room.getRoomsByCategory(req.params.category);
            res.status(200).json(rooms);
        }catch(err:any){    
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async getRoomsByState(req:Request, res:Response):Promise<void>{
        try{
            const rooms:RoomDto[] = await Room.getRoomsByState(req.params.state);
            res.status(200).json(rooms);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }
}




