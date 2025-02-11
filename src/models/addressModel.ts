import { RowDataPacket } from "mysql2";
import { querySql, queryTransactionSql } from "../database.js";
import { AddressDto } from "../dtos/AddressDto.js";
import { AddressType, addressValidationPartial } from "../schemas/AddressSchema.js";
import { messageErrorZod } from "../utils/utils.js";
export class Address{

    static async getAllAddress():Promise<AddressDto[]>{
        let [rows]:RowDataPacket[] = await querySql(`SELECT id, country, province, city, house_number, 
            floor FROM Address`);
        return rows.map((address:any)=>new AddressDto(address));
    }

    static async getAddressById(id:string | null=null):Promise<AddressDto>{
        if(!id) throw new Error('Address id is required');
        let [rows]:RowDataPacket[] = await querySql(`SELECT id, country, province, city, house_number,
            floor FROM Address WHERE id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('Addres not found');
        return new AddressDto(rows[0]); 
    }

    static async updateAddress(id:string | null=null, address:Partial<AddressType>):Promise<AddressDto>{
        if(!id) throw new Error('Address id is required');
        if(!address) throw new Error('Address data is required');
        const keys:string[] = Object.keys(address);
        if(keys.length === 0) throw new Error('No fields found for update address');
        const resultValidation:any = await addressValidationPartial(address);
        if(!resultValidation.success) throw new Error(messageErrorZod(resultValidation));
        const [rows] = await querySql('SELECT id FROM Address WHERE id = ?', [id]);
        if(rows.length === 0) throw new Error('Address not found for update');
        const [result]:RowDataPacket[] = await queryTransactionSql('CALL update_address(?, ?, ?, ?, ?, ?)',
            [id, address.country, address.province, address.city, address.house_number, address.floor])
        return new AddressDto(result[0][0]);
    }
}