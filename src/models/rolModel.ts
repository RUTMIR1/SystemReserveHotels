import { RowDataPacket } from "mysql2";
import { querySql, queryTransactionSql } from "../database.js";
import { RolType, rolValidation, rolValidationPartial } from "../schemas/RolSchema.js";
import { fieldsList, messageErrorZod } from "../utils/utils.js";
import { ValidationUnique } from "../types/validationUnique.js";
import { RolDto } from "../dtos/RolDto.js";
import { SafeParseReturnType } from "zod";
import { MissingParameterException } from "../errors/missingParameterError.js";
import { ValidationException } from "../errors/validationError.js";
import { NotFoundException } from "../errors/notFoundError.js";

export class Rol{
    static async validateUniqueFieldsRol(rol:RolType | Partial<RolType>):Promise<ValidationUnique>{
        let {name} = rol;
        const [rows]:RowDataPacket[] = await querySql('SELECT name FROM Rol WHERE name = ? LIMIT 1',
            [name]);
        if(rows.length > 0) return {success: false, message: `Rol ${name} already exists`, field:'name'};
        return {success: true, message: `Rol fields correct`, field:'OK'};
    }

    static async getRols():Promise<RolDto[]>{
        const [rows]:RowDataPacket[] = await querySql('SELECT id, name FROM Rol');
        return rows.map((rol:any)=> new RolDto(rol));       
    }

    static async createRol(rol:RolType | null =null):Promise<string>{
        if(!rol) throw new MissingParameterException('Rol data is required', [{field:'rol', message:'id is required'}]);
        const validationResult:SafeParseReturnType<RolType, RolType> = await rolValidation(rol);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        const uniqueFieldsresult:ValidationUnique = await this.validateUniqueFieldsRol(rol);
        if(!uniqueFieldsresult.success) throw new ValidationException(uniqueFieldsresult.message, [{field:uniqueFieldsresult.field, message:uniqueFieldsresult.message}]);
        const [rows]:RowDataPacket[] = await queryTransactionSql(`CALL insert_rol(?)`, [rol.name]);
        return rows[0][0].id;
    }

    static async updateRol(id:string | null=null, rol:Partial<RolDto> | null=null):Promise<RolDto>{
        if(!id)throw new MissingParameterException('Rol id is required', [{field:'id', message:'id is required'}]);
        if(!rol)throw new MissingParameterException('Rol data is required', [{field:'rol', message:'rol is required'}]);
        const keys:string[] = Object.keys(rol);
        if(keys.length === 0) throw new MissingParameterException('Rol fields are required', [{field:'rol', message:'not fields for update'}]);
        const validationResult:SafeParseReturnType<Partial<RolType>, Partial<RolType>> = await rolValidationPartial(rol);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        const uniqueFieldsResult:ValidationUnique = await this.validateUniqueFieldsRol(rol);
        if(!uniqueFieldsResult.success) throw new ValidationException(uniqueFieldsResult.message, [{field:uniqueFieldsResult.field, message:uniqueFieldsResult.message}]);
        let [rows]:RowDataPacket[] = await querySql('SELECT name FROM Rol WHERE id = ? LIMIT 1',[id]);
        if(rows.length === 0) throw new NotFoundException('Rol not found for update', [{field:'id', message:'not found'}]);
        let [result]:RowDataPacket[] = await queryTransactionSql('CALL update_rol(?, ?)', [id, rol.name]);
        return new RolDto(result[0][0]);
    }
    static async deleteRol(id:string | null=null):Promise<RolDto>{
        if(!id) throw new MissingParameterException('Rol id is required', [{field:'id', message:'id is required'}]);
        let [rows]:RowDataPacket[] = await querySql(`SELECT id, name FROM Rol WHERE id = ?`, [id]);
        if(rows.length === 0) throw new NotFoundException('Rol not found for deleted', [{field:'id', message:'not found'}]);
        let [result]:RowDataPacket[] = await querySql(`SELECT r.id FROM Rol r INNER JOIN User u ON
             r.id = u.rol_id WHERE r.id = ? LIMIT 1`, [id]);
        if(result.length !== 0) throw new ValidationException('Rol to delete must not have any User', [{field:'user', message:'to delete must not have any user'}]);
        await queryTransactionSql(`DELETE FROM Rol WHERE id = ?`, [id]);
        return new RolDto(rows[0]);
    };
    static async getRolById(id:string | null=null):Promise<RolDto>{
        if(!id) throw new MissingParameterException('Rol id is required', [{field:'id', message:'id is required'}]);
        let [rows]:RowDataPacket[] = await querySql(`SELECT id, name FROM Rol WHERE id =?`, [id]);
        if(rows.length === 0) throw new NotFoundException('Rol not found', [{field:'id', message:'not found'}]);
        return new RolDto(rows[0]);
    }
}