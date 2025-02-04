import { querySql, queryTransactionSql } from "../database.js";
import { addressValidationPartial } from "../schemas/AddressSchema.js";
import { messageErrorZod } from "../utils/utils.js";
export class Address{

    static async getAllAddress(){
        let [rows] = await querySql(`SELECT id, country, province, city, house_number, 
            floor FROM Address`);
        return rows;
    }

    static async getAddressById({id}){
        if(!id) throw new Error('Address id is required');
        let [rows] = await querySql(`SELECT id, country, province, city, house_number,
            floor FROM Address WHERE id = ? LIMIT 1`, [id]);
        if(rows.length === 0) throw new Error('Addres not found');
        return rows[0]; 
    }

    static async updateAddress({id, address}){
        if(!id) throw new Error('Address id is required');
        if(!address) throw new Error('Address data is required');
        const keys = Object.keys(address);
        if(keys.length === 0) throw new Error('No fields found for update address');
        const resultValidation = await addressValidationPartial(address);
        if(!resultValidation.success) throw new Error(messageErrorZod(resultValidation));
        const [rows] = await querySql('SELECT id FROM Address WHERE id = ?', [id]);
        if(rows.length === 0) throw new Error('Address not found for update');
        let {country, province, city, house_number, floor} = address;
        const [result] = await queryTransactionSql('CALL update_address(?, ?, ?, ?, ?, ?)',
            [id, country, province, city, house_number, floor])
        return result[0];
    }
}