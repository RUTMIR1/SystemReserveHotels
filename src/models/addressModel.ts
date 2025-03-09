import { RowDataPacket } from "mysql2";
import { querySql, queryTransactionSql } from "../database.js";
import { AddressDto } from "../dtos/AddressDto.js";
import { AddressType, addressValidationPartial } from "../schemas/AddressSchema.js";
import { fieldsList, messageErrorZod } from "../utils/utils.js";
import { MissingParameterException } from "../errors/missingParameterError.js";
import { NotFoundException } from "../errors/notFoundError.js";
import { ValidationException } from "../errors/validationError.js";
import { SafeParseReturnType } from "zod";
export class Address{

    static async getAllAddress():Promise<AddressDto[]>{
        let [rows]:RowDataPacket[] = await querySql(`SELECT id, country, province, city, house_number, 
            floor FROM Address`);
        return rows.map((address:any)=>new AddressDto(address));
    }

    static async getAddressById(id:string | null=null):Promise<AddressDto>{
        if(!id) throw new MissingParameterException('Address id is required', [{field:'id', message:'id is required'}]);
        let [rows]:RowDataPacket[] = await querySql(`SELECT id, country, province, city, house_number,
            floor FROM Address WHERE id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new NotFoundException('Address not found', [{field:'address', message:'not found'}]);
        return new AddressDto(rows[0]); 
    }

    static async updateAddress(id:string | null=null, address:Partial<AddressType>):Promise<AddressDto>{
        if(!id) throw new MissingParameterException('Address id is required', [{field:'id',
             message:'id is required'}]);
        if(!address) throw new MissingParameterException('Address data is required', [{field:'address', message:'data is required'}]);
        const keys:string[] = Object.keys(address);
        if(keys.length === 0) throw new MissingParameterException('No fields found for update address', [{field:'data', message:'no data for update'}]);
        const resultValidation:SafeParseReturnType<Partial<AddressType>,Partial<AddressType>> = await addressValidationPartial(address);
        if(!resultValidation.success) throw new ValidationException(messageErrorZod(resultValidation), fieldsList(resultValidation));
        const [rows] = await querySql('SELECT id FROM Address WHERE id = ?', [id]);
        if(rows.length === 0) throw new NotFoundException('Address not found for update', [{field:'id', message:'not found'}]);
        const [result]:RowDataPacket[] = await queryTransactionSql('CALL update_address(?, ?, ?, ?, ?, ?)',
            [id, address.country, address.province, address.city, address.house_number, address.floor])
        return new AddressDto(result[0][0]);
    }
}