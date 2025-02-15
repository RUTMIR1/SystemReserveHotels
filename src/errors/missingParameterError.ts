import { appError } from './appError.js';

export class MissingParameterException extends appError{
    constructor(message:string = 'missing parameter'){
        super(message, 400);
    }
}