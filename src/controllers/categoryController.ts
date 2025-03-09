import { Request, Response} from 'express';
import { Category } from '../models/categoryModel.js';
import { CategoryDto } from '../dtos/Category.js';
import { ExceptionsData } from '../types/exceptionsData.js';
export class CategoryController{
    static async getCategories(req:Request, res:Response):Promise<void>{
        try{
            let categories:CategoryDto[] = await Category.getCategories();
            res.status(200).json(categories);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async createCategory(req:Request, res:Response):Promise<void>{
        try{
            let categoryId:string = await Category.createCategory(req.body);
            res.status(201).json({status:201, message:'Category created successfully',
                category: categoryId
            });
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async updateCategory(req:Request, res:Response):Promise<void>{
        try{
            let categoryUpdate = await Category.updateCategory(req.params.id, req.body);
            res.status(200).json({status:200, message: 'user update succesfully',
                category: categoryUpdate});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async deleteCategory(req:Request, res:Response):Promise<void>{
        try{
            let categoryDeleted = await Category.deleteCategory(req.params.id);
            res.status(200).json({status:200, message: 'Category delete successfully',
                 category: categoryDeleted});
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }

    static async getCategory(req:Request, res:Response):Promise<void>{
        try{
            let category = await Category.getCategory(req.params.id);
            res.status(200).json(category);
        }catch(err:any){
            let status:number = err.status || 403, message:string = err.message as string || 'Error'
            , data:ExceptionsData = err.data || [{field:'', message:''}];
            res.status(status).json({status, message, data});
        }
    }
}