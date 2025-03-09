import { ExceptionsData } from "../types/exceptionsData.js";
import { appError } from "./appError.js";


export class AuthException extends appError{

    public data:ExceptionsData[];
    
    constructor(message='Authentication Error', data:ExceptionsData[]){
        super(message, 401);
        this.data = data;
    }
}