export class AddressDto{
    id: string;
    country: string;
    province: string;
    city: string;
    house_number: number;
    floor: number;

    constructor({id, country, city, province, house_number, floor}:{
        id: string, country: string, city:string, province:string, house_number:number,
        floor: number}){
            if(!id) throw new Error("missing Address id");
            if(!country) throw new Error("missing Address country");
            if(!city) throw new Error("missing Address city");
            if(!province) throw new Error("missing Address province");
            if(!house_number) throw new Error("missing Address house number");
            if(!floor) throw new Error("missing Address floor");
            this.id = id;
            this.country = country;
            this.city = city;
            this.province = province;
            this.house_number = house_number;
            this.floor = floor;
        }
}