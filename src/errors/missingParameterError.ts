import { ExceptionsData } from '../types/exceptionsData.js';
import { appError } from './appError.js';

export class MissingParameterException extends appError{

    public data:ExceptionsData[];
    
    constructor(message:string = 'missing parameter', data:ExceptionsData[]){
        super(message, 400);
        this.data = data;
    }
}