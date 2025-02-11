import { RowDataPacket } from "mysql2";
import { querySql, queryTransactionSql } from "../database.js";
import { RolType, rolValidation, rolValidationPartial } from "../schemas/RolSchema.js";
import { messageErrorZod } from "../utils/utils.js";
import { ValidationUnique } from "../types/validationUnique.js";
import { RolDto } from "../dtos/RolDto.js";
import { SafeParseReturnType } from "zod";

export class Rol{
    static async validateUniqueFieldsRol(rol:RolType | Partial<RolType>):Promise<ValidationUnique>{
        let {name} = rol;
        const [rows]:RowDataPacket[] = await querySql('SELECT name FROM Rol WHERE name = ? LIMIT 1',
            [name]);
        if(rows.length > 0) return {success: false, message: `Rol ${name} already exists`};
        return {success: true, message: `Rol fields correct`};
    }

    static async getRols():Promise<RolDto[]>{
        const [rows]:RowDataPacket[] = await querySql('SELECT id, name FROM Rol');
        return rows.map((rol:any)=> new RolDto(rol));       
    }

    static async createRol(rol:RolType | null =null):Promise<string>{
        if(!rol) throw new Error('Rol data is required');
        const validationResult:SafeParseReturnType<RolType, RolType> = await rolValidation(rol);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const uniqueFieldsresult:ValidationUnique = await this.validateUniqueFieldsRol(rol);
        if(!uniqueFieldsresult.success) throw new Error(uniqueFieldsresult.message);
        const [rows]:RowDataPacket[] = await queryTransactionSql(`CALL insert_rol(?)`, [rol.name]);
        return rows[0][0].id;
    }

    static async updateRol(id:string | null=null, rol:Partial<RolDto> | null=null):Promise<RolDto>{
        if(!id)throw new Error('Rol id is required');
        if(!rol)throw new Error('Rol data is required');
        const validationResult:SafeParseReturnType<Partial<RolType>, Partial<RolType>> = await rolValidationPartial(rol);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const uniqueFieldsResult:ValidationUnique = await this.validateUniqueFieldsRol(rol);
        if(!uniqueFieldsResult.success) throw new Error(uniqueFieldsResult.message);
        const keys:string[] = Object.keys(rol);
        if(keys.length === 0) throw new Error('Rol fields are required');
        let [rows]:RowDataPacket[] = await querySql('SELECT name FROM Rol WHERE id = ? LIMIT 1',[id]);
        if(rows.length === 0) throw new Error('Rol not found for update');
        let [result]:RowDataPacket[] = await queryTransactionSql('CALL update_rol(?, ?)', [id, rol.name]);
        return new RolDto(result[0][0]);
    }
    static async deleteRol(id:string | null=null):Promise<RolDto>{
        if(!id) throw new Error('Rol id is required');
        let [rows]:RowDataPacket[] = await querySql(`SELECT id, name FROM Rol WHERE id = ?`, [id]);
        if(rows.length === 0) throw new Error('Rol not found for deleted');
        let [result]:RowDataPacket[] = await querySql(`SELECT r.id FROM Rol r INNER JOIN User u ON
             r.id = u.rol_id WHERE r.id = ? LIMIT 1`, [id]);
        if(result.length !== 0) throw new Error('Rol to delete must not have any User');
        await queryTransactionSql(`DELETE FROM Rol WHERE id = ?`, [id]);
        return new RolDto(rows[0]);
    };
    static async getRolById(id:string | null=null):Promise<RolDto>{
        if(!id) throw new Error('Rol id is required');
        let [rows]:RowDataPacket[] = await querySql(`SELECT id, name FROM Rol WHERE id =?`, [id]);
        if(rows.length === 0) throw new Error('Rol not found');
        return new RolDto(rows[0]);
    }
}