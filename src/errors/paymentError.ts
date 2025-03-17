import { appError } from "./appError.js";

export class PaymentException extends appError{

    constructor(message="payment error"){
        super(message, 400);
    }
}