import { appError } from "./appError.js";

export class ValidationException extends appError{
    constructor(message:string="Error Validation"){
        super(message, 400);
    }
}