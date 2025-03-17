import {Request, Response, NextFunction} from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALLOWED_ORIGINS:string[] = [
    'http://localhost:3000',
    'http://localhost:5173'
]

export const corsMiddleware = async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    if(!req.headers.origin)console.log(req.query);
    const origin = req.headers.origin;
    if(!origin || !ALLOWED_ORIGINS.includes(origin as string)){
        if(!(req.headers['x-signature'] && validateSignature(req.headers['x-signature'] as string
            ,req.headers['x-request-id'] as string
            ,req.url
        ))){
            return res.status(403).json({message: 'Origin not allowed'});
        }
    }
    if(origin){
        res.setHeader('Access-Control-Allow-Origin', origin as string);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return next();
}

const validateSignature = (signature:string, requestId: string, url:string):boolean=>{
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const dataID = urlParams.get('data.id');
    /* const data:string[] = signature.match(/ts=(\d+),v1=([a-z0-9]+)/) as string[];
    const ts = data[1];
    const v1 = data[2]; */

    const parts = signature.split(',');

    let ts:string = '';
    let hash:string = '';

    parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
            const trimmedKey = key.trim();
            const trimmedValue = value.trim();
            if (trimmedKey === 'ts') {
                ts = trimmedValue;
            } else if (trimmedKey === 'v1') {
                hash = trimmedValue;
            }
        }
    });
    let manifest:string;
    if(dataID){
        manifest = `id:${dataID};request-id:${requestId};ts:${ts};`;
    }else{
        manifest = `request-id:${requestId};ts:${ts};`;
    }
    const expectedHash = crypto.createHmac('sha256', process.env.KEY_SECRET as string)
                               .update(manifest)
                               .digest('hex');
        if (hash === expectedHash) {
        return true;
        }
        return false
}