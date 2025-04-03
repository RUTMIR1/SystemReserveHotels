import { Request } from "express";

export interface SessionData{
    username:string;
    rol:string;
    id: string;
    exp?:number;
}