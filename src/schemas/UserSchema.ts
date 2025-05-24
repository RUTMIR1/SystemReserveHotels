import z from 'zod';
import { AddressSchema } from './AddressSchema.js';
const UserSchemaBase = z.object({
    id:z.string().optional(),   
    name: z.string({
        required_error: 'User name is required',
        invalid_type_error: 'User name must be a String'
    }).regex(/^[A-Za-zÁÉÍÓÚáéíóú]*$/, 'name invalid').refine(
        (value:string)=> value.length !== 0 || value ,{message: 'name is required'}
    ).refine((value:string)=> value.length > 3, {message:'name must be at least 3 characters'}),
    last_name: z.string({
        required_error: 'User lastName is required',
        invalid_type_error: 'User lastName must be a string'
    }).regex(/^[A-Za-zÁÉÍÓÚáéíóú]*$/, 'lastName invalid').refine(
        (value:string)=> value.length !== 0 || value ,{message: 'lastname is required'}
    ).refine((value:string)=> value.length > 3, {message:'lastname must be at least 3 characters'}),
    age: z.number({
        required_error: 'User age is required',
        invalid_type_error: 'User age must be a number',
    }).int({message: 'User age must be a number integer'}).positive(
        {message: 'User age must be positive'}
    ).min(18, {message: 'User age must be greater than or equal to 18'}),
    dni: z.string({
        required_error:'User dni is required',
        invalid_type_error:'User dni must be a string'
    }).refine(
        (value:string)=> value.length !== 0 || value ,{message: 'dni is required'}
    ).refine((value:string)=> value.length > 3, {message:'dni must be at least 3 characters'}),
    email: z.string({
        required_error: 'User email is required',
        invalid_type_error: 'User email must be a string',
    }).email({message: 'User email is invalid'}),
    username: z.string({
        required_error: 'User username is required',
        invalid_type_error: 'User username must be a string',
    }).refine(
        (value:string)=> value.length !== 0 || value ,{message: 'username is required'}
    ).refine((value:string)=> value.length > 3, {message:'username must be at least 3 characters'}),
    password: z.string({
        required_error: 'User password is required',
        invalid_type_error: 'User password must be a string',
    }).refine(
        (value:string)=> value.length !== 0 || value ,{message: 'password is required'}
    ).refine((value:string)=> value.length > 3, {message:'password must be at least 3 characters'}),
    phone_number: z.string({
        required_error: 'User phone number is required',
        invalid_type_error: 'User phone number must be a string'
    }).refine(
        (value:string)=> value.length !== 0 || value ,{message: 'phone number is required'}
    ).refine((value:string)=> value.length > 3, {message:'phone number must be at least 3 characters'}),
    address: AddressSchema
},{
    required_error: 'user is required',
    invalid_type_error: 'user must be an object'
});

export const UserSchema = UserSchemaBase.extend({rol: z.object({id: z.string({
    required_error: 'Rol ID is required',
    invalid_type_error: 'Rol ID must be a string'
}).uuid({message: 'Rol ID must be a UUID string'})}, {
    required_error: 'rol is required',
    invalid_type_error: 'rol must be an object'
})});

export const UserRegisterSchema = UserSchemaBase;

export type UserType = z.infer<typeof UserSchema>;

export const userValidation = async (user:unknown):Promise<z.SafeParseReturnType<UserType,UserType>> => {
    return UserSchema.safeParse(user);
}

export const userValidationPartial = async (user: unknown):Promise<z.SafeParseReturnType<Partial<UserType>,Partial<UserType>>> => {
    return UserSchema.partial().safeParse(user);
}

export type UserRegisterType = z.infer<typeof UserRegisterSchema>;

export const userRegisterValidation = async (user:unknown):Promise<z.SafeParseReturnType<UserRegisterType,UserRegisterType>> => {
    return UserRegisterSchema.safeParse(user);
}

export const userRegistroValidationPartial = async (user: unknown):Promise<z.SafeParseReturnType<Partial<UserRegisterType>,Partial<UserRegisterType>>> => {
    return UserRegisterSchema.partial().safeParse(user);
}