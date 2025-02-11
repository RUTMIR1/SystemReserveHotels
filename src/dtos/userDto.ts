import { AddressDto } from "./AddressDto.js";
import { RolDto } from "./RolDto.js";

export class UserDto{
    id: string;
    name:string;
    last_name: string;
    age: number;
    email: string;
    username: string;
    phone_number: string;
    rol: RolDto;
    address: AddressDto;
    constructor({
        id,
        name,
        last_name,
        age,
        email,
        username,
        phone_number,
        rol_id,
        rol_name,
        address_id,
        country,
        province,
        city,
        house_number,
        floor
    }: {
        id: string;
        name: string;
        last_name: string;
        age: number;
        email: string;
        username: string;
        phone_number: string;
        rol_id: string;
        rol_name: string;
        address_id: string;
        country: string;
        province: string;
        city: string;
        house_number: number;
        floor: number;
    }){
            if(!id) throw new Error("Missing User id");
            if(!name) throw new Error("Missing User name");
            if(!last_name) throw new Error("Missing User last_name");       
            this.id = id;
            this.name = name;
            this.last_name = last_name;
            this.age = age;
            this.email = email;
            this.username = username;
            this.phone_number = phone_number;
            this.rol = new RolDto({id: rol_id, name: rol_name});
            this.address = new AddressDto({id: address_id, country:country, province: province,
                city:city,house_number:house_number, floor: floor});
        };
}