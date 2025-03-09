import { ExceptionsData } from "../types/exceptionsData.js";
import { appError } from "./appError.js";

export class ValidationException extends appError{

    public data:ExceptionsData[];

    constructor(message:string="Error Validation", data:ExceptionsData[]){
        super(message, 400);
        this.data = data;
    }
}