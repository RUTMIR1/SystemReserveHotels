import { RoomDto } from "./RoomDto.js";
import { UserDto } from "./userDto.js";

export class ReservationDto{
    id: string;
    reservation_date_start: string;
    reservation_date_end: string;
    check_in: string;
    check_out: string;
    code: string;
    amount: number;
    state: string;
    days:number;
    user: UserDto;
    room: RoomDto;
    constructor({id, reservation_date_start, reservation_date_end, check_in, check_out,
        code, amount, state, days, user_id, name, last_name, age, dni, email, username, phone_number,
    rol_id, rol_name, address_id, country, province, city, house_number, floor, room_id,
    room_name, price, description, image_url, room_state, room_categories}:{
            id:string, reservation_date_start:string, reservation_date_end:string, 
            check_in:string, check_out:string, code:string, amount:number, state:string, days:number,
        user_id:string, name:string, last_name:string, age:number, dni:string, email:string,
        username: string, phone_number:string, rol_id:string, rol_name:string, address_id:string,
     country:string, province:string, city:string, house_number:number, floor:number,
        room_id:string, room_name:string, price:number, description:string, image_url:string,
     room_state:string, room_categories:RoomDto[]}){
                this.id = id;
                this.reservation_date_start = new Date(reservation_date_start).toISOString().split('T')[0];
                this.reservation_date_end = new Date(reservation_date_end).toISOString().split('T')[0];
                this.check_in = new Date(check_in).toISOString().split('T')[0];
                this.check_out = new Date(check_out).toISOString().split('T')[0];
                this.code = code;
                this.amount = parseFloat((amount as unknown) as string);
                this.state = state;
                this.days = days;
                this.user = new UserDto({id:user_id, name:name, last_name:last_name, age:age, dni:dni, email:email, 
                    username:username, phone_number:phone_number, rol_id:rol_id, rol_name:rol_name,
                address_id:address_id, country:country, province:province, city:city,house_number:house_number, floor:floor});
                this.room = new RoomDto({id:room_id, name:room_name, price:price, 
                    description: description, image_url:image_url, 
                    state: room_state, categories:room_categories})
            }
}