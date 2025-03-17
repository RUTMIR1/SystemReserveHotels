import {MercadoPagoConfig, Preference} from 'mercadopago';
import dotenv from 'dotenv';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes.js';
import { randomUUID } from 'crypto';
import { MissingParameterException } from '../errors/missingParameterError.js';
import { querySql } from '../database.js';
import { NotFoundException } from '../errors/notFoundError.js';
import { PaymentException } from '../errors/paymentError.js';

dotenv.config();
const token = process.env.MERCADOPAGO_ACCESS_TOKEN as string;
const client = new MercadoPagoConfig({
    accessToken: token,
})

interface IDataPayment{
    room:string;
    user:string;
}

export class MercadoPagoService{
    static async createPreference(data:IDataPayment):Promise<PreferenceResponse>{
        let {room, user} = data;
        if(!room) throw new MissingParameterException("id room is required", [{field: "id", message: "id room is required"}]);
        if(!user) throw new MissingParameterException("username is required", [{field:"username", message: "username is required"}]);
        const [rows] = await querySql(`SELECT id, price, name from Room WHERE id = ? LIMIT 1`, [room]);
        const [rows2] = await querySql(`SELECT id FROM User WHERE username = ? LIMIT 1`, [user]);
        if(rows2.length === 0) throw new NotFoundException('User not found for pay', [{field:'username', message:'Not Found'}]);
        if(rows.length === 0) throw new NotFoundException('Room not found for pay', [{field:'room', message:'Not Found'}]);
        const preference = new Preference(client);
        let preferenceId = randomUUID();
        const response = await preference.create({body:{
            items: [
                {   
                    unit_price: parseFloat(rows[0].price),
                    id:preferenceId,
                    title: rows[0].name,
                    quantity: 1,
                },
            ],
            notification_url:"https://914f-2803-cf00-7fd-d700-dca9-7588-6700-ca8e.ngrok-free.app/Pay/webhook?source_news=webhooks",
            metadata:{
                room_id:room,
                user_id:rows2[0].id
            }
        }});
        return response; 
    }

    static async getPayment(id:string){
        const response:any = await fetch(`https://api.mercadopago.com/v1/payments/${id}`,
            {headers: {'Coontent-Type': 'application/json',
                    'Authorization': `Bearer ${token}`},}
        );
        if(!response.ok){
            throw new PaymentException(`Payment status: ${response.status}`);
        }
        const responseInfo = await response.json();
        return responseInfo;
    }
}