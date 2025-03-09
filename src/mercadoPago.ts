import mercadoPago, { MercadoPagoConfig } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

export const client = new MercadoPagoConfig({accessToken: process.env.MERCADO_ACCESS_TOKEN as string});