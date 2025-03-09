import { Preference } from "mercadopago";
import { client  } from "../mercadoPago.js";

import { PreferenceRequest, PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes.js";


const preference:Preference = new Preference(client);

export class MercadoPagoService{
    static async createPreference(payModel:any):Promise<PreferenceResponse>{
        const body:PreferenceRequest = {
            items: [
                {   
                    id:payModel.id,
                    title: payModel.title,
                    quantity: 1,
                    currency_id: payModel.currency,
                    unit_price: payModel.price,
                    
                },
            ],
            payer: {
                email: payModel.user.email,
            },
            back_urls: {
                success: "http://localhost:3000/success",
                failure: "http://localhost:3000/failure",
                pending: "http://localhost:3000/pending",
            },
            auto_return: "approved",
        };
        return preference.create({body});
    }
}