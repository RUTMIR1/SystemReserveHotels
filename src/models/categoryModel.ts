import { SafeParseReturnType } from 'zod';
import { CategoryDto } from '../dtos/Category.js';
import { CategoryType, categoryValidation, categoryValidationPartial} from '../schemas/CategorySchema.js';
import { querySql, queryTransactionSql } from "../database.js";
import { messageErrorZod } from "../utils/utils.js";
import { RowDataPacket } from "mysql2";
import { ValidationUnique} from "../types/validationUnique.js"
import { MissingParameterException } from '../errors/missingParameterError.js';
import { ValidationException } from '../errors/validationError.js';
import { NotFoundException } from '../errors/notFoundError.js';

export class Category{

    static async validateUniqueFieldsCategory(category:CategoryType | Partial<CategoryType>):Promise<ValidationUnique>{
            let {name} = category;
            const [rows]:RowDataPacket[] = await querySql('SELECT name FROM Category WHERE name = ? LIMIT 1',
                [name]);
            if(rows.length > 0) return {success: false, message: `Category ${name} already exists`};
            return {success: true, message: `Rol fields correct`};
        }
    static async getCategories():Promise<CategoryDto[]>{
        let [rows]:RowDataPacket[] = await querySql(`SELECT id, name FROM Category`);
        return rows.map((ca:any)=> new CategoryDto(ca));
    }

    static async createCategory(category:CategoryType | null=null):Promise<string>{
        if(!category) throw new MissingParameterException('category data is required');
        const resultValidation:SafeParseReturnType<CategoryType, CategoryType> = await categoryValidation(category);
        if(!resultValidation.success) throw new ValidationException(messageErrorZod(resultValidation));
        const resultUniqueValidation:ValidationUnique = await this.validateUniqueFieldsCategory(category);
        if(!resultUniqueValidation.success) throw new ValidationException(resultUniqueValidation.message);
        const [rows]:RowDataPacket[] = await querySql(`CALL insert_category(?)`, [category.name]);
        return rows[0][0].id;
    }

    static async updateCategory(id:string | null=null ,category:CategoryType  | null=null):Promise<CategoryDto>{
        if(!id) throw new MissingParameterException('category id is required');
        if(!category) throw new MissingParameterException('category data is requierd');
        const keys:string[] = Object.keys(category);
        if(keys.length === 0) throw new MissingParameterException('Not fields for update category');
        const [rows]:RowDataPacket[] = await querySql(`SELECT id FROM Category WHERE 
            id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new NotFoundException(`Category Not found for update`);
        const resultValidation:SafeParseReturnType<Partial<CategoryType>,Partial<CategoryType>> = await categoryValidationPartial(category);
        if(!resultValidation.success) throw new ValidationException(messageErrorZod(resultValidation));
        const resultUniqueValidation:ValidationUnique = await this.validateUniqueFieldsCategory(category);
        if(!resultUniqueValidation.success) throw new ValidationException(resultUniqueValidation.message);
        let [result]:RowDataPacket[] = await querySql(`CALL update_category(?, ?)`,
            [id, category.name]);
        return result[0][0];
    }
    static async deleteCategory(id:string | null=null):Promise<CategoryDto>{
        if(!id) throw new MissingParameterException("Category id is required");
        const [rows]:RowDataPacket[] = await querySql(`SELECT id, name FROM Category WHERE id = ? LIMIT 1`,[id]);
        if(rows.length === 0) throw new NotFoundException(`Category not found for detele`);
        const [result]:RowDataPacket[] = await querySql(`SELECT c.id FROM Category c INNER 
            JOIN RoomCategory rc ON c.id = rc.category_id WHERE rc.category_id = ? LIMIT 1`, [id]);
        if(result.length !== 0) throw new ValidationException(`Category to delete must not have any Room`);
        await queryTransactionSql(`DELETE FROM Category WHERE id = ?`, [id]);
        return new CategoryDto(rows[0]);
    }
    static async getCategory(id:string | null=null):Promise<CategoryDto>{
        if(!id) throw new MissingParameterException("Category id is required");
        const [rows]:RowDataPacket[] = await querySql(`SELECT id, name FROM Category WHERE id = ? LIMIT 1`,[id]);
        if(rows.length === 0) throw new NotFoundException(`Category not found`);
        return new CategoryDto(rows[0]);
    }
}