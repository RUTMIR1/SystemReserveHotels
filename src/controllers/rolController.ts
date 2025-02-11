import { RolDto } from "../dtos/RolDto.js";
import { Rol } from "../models/rolModel.js";
import { Request, Response} from "express";
export class RolController{
    static async getRols(req:Request, res:Response):Promise<void>{
        try{
            let rols:RolDto[] = await Rol.getRols();
            res.status(200).json(rols);
        }catch(err:any){
            res.status(403).json({status:403, message: err.message});
        }
    };
    
    static async createRol(req:Request, res:Response):Promise<void>{
        try{
            let rolId:string = await Rol.createRol(req.body);
            res.status(201).json({status:201, message: `User created successfully`,
                rol: rolId});
        }catch(err:any){
            res.status(403).json({status:403, message: err.message});
        }
    };
    
    static async updateRol(req:Request, res:Response):Promise<void>{
        try{
            let rolUpdate:RolDto = await Rol.updateRol(req.params.id, req.body);
            res.status(200).json({status:200, message: `User updated successfully`,
                rol: rolUpdate});
        }catch(err:any){
            res.status(403).json({status:403, message:err.message});
        }
    };

    static async deleteRol(req:Request, res:Response):Promise<void>{
        try{
            let rolDelete:RolDto = await Rol.deleteRol(req.params.id);
            res.status(200).json({status:200, message: 'Rol deleted successfully',
                rol: rolDelete});
        }catch(err:any){
            res.status(403).json({status:403, message:err.message});
        }
    };
    
    static async getRolById(req:Request, res:Response):Promise<void>{
        try{
            let rol:RolDto = await Rol.getRolById(req.params.id);
            res.status(200).json(rol);
        }catch(err:any){
            res.status(403).json({status:403, message:err.message});
        }
    };
}




