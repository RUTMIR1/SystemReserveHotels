import { ExceptionsData } from "../types/exceptionsData.js";
import { appError } from "./appError.js";

export class NotFoundException extends appError{

    public data:ExceptionsData[];

    constructor(message:string="Not found Error", data:ExceptionsData[]){
        super(message, 404);
        this.data = data;
    }


}