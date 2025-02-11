import { UserDto } from "../dtos/userDto.js";
import { User } from "../models/userModel.js";
import { Request, Response } from "express";
export class UserController{
    static async createUser(req:Request, res:Response):Promise<void>{
        try{
            let newUserId:string = await User.createUser(req.body);
            res.status(201).json({status: 201, message: 'User created sucessfully!', 
                user: newUserId});
        }catch(err:any){
            res.status(403).json({status: 403, message: err.message});
        }
    };

    static async getUsers(req:Request, res:Response):Promise<void>{
        try{
            let users:UserDto[]= await User.getUsers();
            res.status(200).json(users);
        }catch(err:any){
            res.status(403).json({status: 403, message: err.message});
        }    
    };
    static async deleteUserById(req:Request, res:Response):Promise<void>{
        try{
            let userDeleted:UserDto = await User.deleteUserById(req.params.id);
            res.status(200).json({status: 200, message: 'User deleted successfully',
                user: userDeleted});
        }catch(err:any){
            res.status(403).json({status: 403, message: err.message});
        }
    };

    static async updateUser(req:Request, res:Response):Promise<void>{
        try{
            let result:UserDto = await User.updateUser(req.body, req.params.id);
            res.status(200).json({status: 200, message: 'User updated successfully',
                user: result});
        }catch(err:any){
            res.status(403).json({status:403, message: err.message});
        }
    }
    static async getUserById(req:Request, res:Response):Promise<void>{
        try{
            let user:UserDto = await User.getUserById(req.params.id);
            res.status(200).json(user);
        }catch(err:any){
            res.status(403).json({status:403, message: err.message});
        }
    }
}