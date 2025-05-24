import {MercadoPagoConfig, Preference} from 'mercadopago';
import dotenv from 'dotenv';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes.js';
import { randomUUID } from 'crypto';
import { MissingParameterException } from '../errors/missingParameterError.js';
import { querySql } from '../database.js';
import { PaymentException } from '../errors/paymentError.js';
import { SafeParseReturnType } from 'zod';
import { ValidationException } from '../errors/validationError.js';
import { calculatePriceReserve, fieldsList, messageErrorZod } from '../utils/utils.js';
import { PreferenceType, PreferenceValidation } from '../schemas/referenceSchema.js';


dotenv.config();
const token = process.env.MERCADOPAGO_ACCESS_TOKEN as string;
const client = new MercadoPagoConfig({
    accessToken: token,
})

export class MercadoPagoService{
    static async createPreference(preferenceParameter:PreferenceType):Promise<PreferenceResponse>{
        if(!preferenceParameter) throw new MissingParameterException('preferenceParameter data is required', [{field:'preferenceParameter', message:'referense is required'}]);
        const validationResult:SafeParseReturnType<PreferenceType, PreferenceType> = await PreferenceValidation(preferenceParameter);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        const [user] = await querySql(`SELECT id from User where id = ? LIMIT 1`, [preferenceParameter.user_id]);
        if(user.length === 0) throw new ValidationException('User does not exits', [{field:'id', message:'User does not exits'}]);
        const [rows] = await querySql(`SELECT id, price, name from Room WHERE id = ? LIMIT 1`, [preferenceParameter.room_id]);
        if(rows.length === 0) throw new ValidationException('Room does not exits', [{field:'id', message:'Room does not exits'}]);
        const preference = new Preference(client);
        let preferenceId = randomUUID();
        const response = await preference.create({body:{
            items: [
                {   
                    unit_price: calculatePriceReserve(preferenceParameter.days, rows[0].price),
                    id:preferenceId,
                    title: rows[0].name,
                    quantity: 1,
                },
            ],
            back_urls:{
                success:preferenceParameter.success_url,
            },
            notification_url:"https://7ff4-2803-cf00-7fd-d700-156c-650d-da4b-1f1c.ngrok-free.app/Pay/webhook?source_news=webhooks",
            metadata:{
                preference:preferenceParameter
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