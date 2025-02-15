import { appError } from "./appError.js";

export class NotFoundException extends appError{
    constructor(message:string="Not found Error"){
        super(message, 404);
    }
}