import { appError } from "./appError.js";

export class AuthException extends appError{
    constructor(message='Authentication Error'){
        super(message, 401);
    }
}