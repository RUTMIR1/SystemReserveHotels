import { querySql, queryTransactionSql } from "../database.js";
import { rolValidation, rolValidationPartial } from "../schemas/RolSchema.js";
import { messageErrorZod } from "../utils/utils.js";

export class Rol{
    static async validateUniqueFieldsRol(rol){
        let {name} = rol;
        const [rows] = await querySql('SELECT name FROM Rol WHERE name = ? LIMIT 1',
            [name]);
        if(rows.length > 0) return {success: false, message: `Rol ${name} already exists`};
        return {success: true, message: `Rol fields correct`};
    }

    static async getRols(){
        const [rows] = await querySql('SELECT id, name FROM Rol');
        return rows;       
    }

    static async createRol({rol=null}){
        if(!rol) throw new Error('Rol data is required');
        const validationResult = await rolValidation(rol);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const uniqueFieldsresult = await this.validateUniqueFieldsRol(rol);
        if(!uniqueFieldsresult.success) throw new Error(uniqueFieldsresult.message);
        let {name} = rol;
        const [rows] = await queryTransactionSql(`CALL insert_rol(?)`, [name]);
        return rows[0][0].id;
    }

    static async updateRol({id=null, rol=null}){
        if(!id)throw new Error('Rol id is required');
        if(!rol)throw new Error('Rol data is required');
        const validationResult = await rolValidationPartial(rol);
        if(!validationResult.success) throw new Error(messageErrorZod(validationResult));
        const uniqueFieldsResult = await this.validateUniqueFieldsRol(rol);
        if(!uniqueFieldsResult.success) throw new Error(uniqueFieldsResult.message);
        const keys = Object.keys(rol);
        if(keys.length === 0) throw new Error('Rol fields are required');
        let [rows] = await querySql('SELECT name FROM Rol WHERE id = ? LIMIT 1',[id]);
        if(rows.length === 0) throw new Error('Rol not found for update');
        let {name} = rol;
        [rows] = await queryTransactionSql('CALL update_rol(?, ?)', [id, name]);
        return rows[0].id;
    }
    static async deleteRol({id}){
        if(!id) throw new Error('Rol id is required');
        let [rows] = await querySql(`SELECT id, name FROM Rol WHERE id = ?`, [id]);
        if(rows.length === 0) throw new Error('Rol not found for deleted');
        await queryTransactionSql(`DELETE FROM Rol WHERE id = ?`, [id]);
        return rows[0];
    };
    static async getRolById({id}){
        if(!id) throw new Error('Rol id is required');
        let [rows] = await querySql(`SELECT id, name FROM Rol WHERE id =?`, [id]);
        if(rows.length === 0) throw new Error('Rol not found');
        return rows[0];
    }
}