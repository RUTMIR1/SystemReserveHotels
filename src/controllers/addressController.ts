import { AddressDto } from "../dtos/AddressDto.js";
import { Address } from "../models/addressModel.js";
import {Request, Response} from "express";
import { ExceptionsData } from "../types/exceptionsData.js";
export class AddressController{
    
    static async getAllAddress(req:Request, res:Response):Promise<void>{
        try{
            let Addresses:AddressDto[] = await Address.getAllAddress();
            res.status(200).json(Addresses);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async getAddressById(req:Request, res:Response):Promise<void>{
        try{
            let address:AddressDto = await Address.getAddressById(req.params.id);
            res.status(200).json(address);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }
 
    static async updateAddress(req:Request, res:Response):Promise<void>{
        try{
            let result:AddressDto = await Address.updateAddress(req.params.id, req.body);
            res.status(200).json({status: 200, message: 'Address updated successfully',
                address: result});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }
}