import {Request, Response, NextFunction} from 'express';
const ALLOWED_ORIGINS:string[] = [
    'http://localhost:3000',
    'http://localhost:5173'
]

export const corsMiddleware = async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    const origin = req.headers.origin;
    if(!origin || !ALLOWED_ORIGINS.includes(origin as string)){
       return res.status(403).json({message: 'Origin not allowed'});
    }
    res.setHeader('Access-Control-Allow-Origin', origin as string);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return next();
}