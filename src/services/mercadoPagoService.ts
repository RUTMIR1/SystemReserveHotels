import {MercadoPagoConfig, Preference} from 'mercadopago';
import dotenv from 'dotenv';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes.js';
import { randomUUID } from 'crypto';
import { MissingParameterException } from '../errors/missingParameterError.js';
import { querySql } from '../database.js';
import { PaymentException } from '../errors/paymentError.js';
import { reservationValidation, ReservationType } from '../schemas/reservationSchema.js';
import { ValidationUnique } from '../types/validationUnique.js';
import { SafeParseReturnType } from 'zod';
import { ValidationException } from '../errors/validationError.js';
import { fieldsList, messageErrorZod } from '../utils/utils.js';
import { Reservation } from '../models/reservationModel.js';

dotenv.config();
const token = process.env.MERCADOPAGO_ACCESS_TOKEN as string;
const client = new MercadoPagoConfig({
    accessToken: token,
})

export class MercadoPagoService{
    static async createPreference(reservation:ReservationType):Promise<PreferenceResponse>{
        if(!reservation) throw new MissingParameterException('Reservation data is required', [{field:'reservation', message:'data is required'}]);
        const validationResult:SafeParseReturnType<ReservationType, ReservationType> = await reservationValidation(reservation);
        if(!validationResult.success) throw new ValidationException(messageErrorZod(validationResult), fieldsList(validationResult));
        const validationExisting:ValidationUnique = await Reservation.validateExisting(reservation);
        if(!validationExisting.success) throw new ValidationException(validationExisting.message, [{field:validationExisting.field, message:validationExisting.message}]);
        const [rows] = await querySql(`SELECT id, price, name from Room WHERE id = ? LIMIT 1`, [reservation.room.id]);
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
            notification_url:"https://f0dc-2803-cf00-7fd-d700-f5b7-3f51-21a5-28bf.ngrok-free.app/Pay/webhook?source_news=webhooks",
            metadata:{
                reservation
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