import { SafeParseReturnType } from 'zod';
import { CategoryDto } from '../dtos/Category.js';
import { CategoryType, categoryValidation, categoryValidationPartial} from '../schemas/CategorySchema.js';
import { querySql, queryTransactionSql } from "../database.js";
import { fieldsList, messageErrorZod } from "../utils/utils.js";
import { RowDataPacket } from "mysql2";
import { MissingParameterException } from '../errors/missingParameterError.js';
import { ValidationException } from '../errors/validationError.js';
import { NotFoundException } from '../errors/notFoundError.js';
import { validateUniqueFields, ValidationExisting, ValidationUnique } from '../utils/utilModel.js';

export class Category{

    static async getCategories():Promise<CategoryDto[]>{
        const [rows]:RowDataPacket[] = await querySql(`SELECT id, name FROM Category`);
        return rows.map((category:any)=>new CategoryDto(category))
    }

    static async createCategory(category:CategoryType | null=null):Promise<string>{
        if(!category) throw new MissingParameterException('category data is required', [{field:'category', message:'data is required'}]);
        const resultValidation:SafeParseReturnType<CategoryType, CategoryType> = await categoryValidation(category);
        if(!resultValidation.success) throw new ValidationException(messageErrorZod(resultValidation), fieldsList(resultValidation));
        const validationFields:ValidationUnique[] = await validateUniqueFields(category as any, 'Category');
        if(validationFields.length > 0) throw new ValidationException(validationFields.map(el=>el.message).join('-'), [...validationFields]);
        const [rows]:RowDataPacket[] = await querySql(`CALL insert_category(?)`, [category.name]);
        return rows[0][0].id;
    }

    static async updateCategory(id:string | null=null ,category:CategoryType  | null=null):Promise<CategoryDto>{
        if(!id) throw new MissingParameterException('category id is required', [{field:'id', message:'id is required'}]);
        if(!category) throw new MissingParameterException('category data is requierd', [{field:'category', message:'data is required'}]);
        const keys:string[] = Object.keys(category);
        if(keys.length === 0) throw new MissingParameterException('Not fields to update category', [{field:'category', message:'no fields to update'}]);
        const [rows]:RowDataPacket[] = await querySql(`SELECT id FROM Category WHERE 
            id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new NotFoundException(`Category Not found for update`, [{field:'id', message:'not found'}]);
        const resultValidation:SafeParseReturnType<Partial<CategoryType>,Partial<CategoryType>> = await categoryValidationPartial(category);
        if(!resultValidation.success) throw new ValidationException(messageErrorZod(resultValidation), fieldsList(resultValidation));
        const validationFields:ValidationUnique[] = await validateUniqueFields(category as any, 'Category', id);
        if(validationFields.length > 0) throw new ValidationException(validationFields.map(el=>el.message).join('-'), [...validationFields]);
        let [result]:RowDataPacket[] = await querySql(`CALL update_category(?, ?)`,
            [id, category.name]);
        return result[0][0];
    }
    static async deleteCategory(id:string | null=null):Promise<CategoryDto>{
        if(!id) throw new MissingParameterException("Category id is required", [{field:'id', message:'id is required'}]);
        const [rows]:RowDataPacket[] = await querySql(`SELECT id, name FROM Category WHERE id = ? LIMIT 1`,[id]);
        if(rows.length === 0) throw new NotFoundException(`Category not found for detele`, [{field:'id', message:'not found'}]);
        const [result]:RowDataPacket[] = await querySql(`SELECT c.id FROM Category c INNER 
            JOIN RoomCategory rc ON c.id = rc.category_id WHERE rc.category_id = ? LIMIT 1`, [id]);
        if(result.length !== 0) throw new ValidationException(`Category to delete must not have any Room`, [{field:'room', message:'to delete must not have any room'}]);
        await queryTransactionSql(`DELETE FROM Category WHERE id = ?`, [id]);
        return new CategoryDto(rows[0]);
    }
    static async getCategory(id:string | null=null):Promise<CategoryDto>{
        if(!id) throw new MissingParameterException("Category id is required", [{field:'id', message:'id is required'}]);
        const [rows]:RowDataPacket[] = await querySql(`SELECT id, name FROM Category WHERE id = ? LIMIT 1`,[id]);
        if(rows.length === 0) throw new NotFoundException(`Category not found`, [{field:'id', message:'not found'}]);
        return new CategoryDto(rows[0]);
    }
}