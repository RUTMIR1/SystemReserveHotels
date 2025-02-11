import z from 'zod';
import { AddressSchema } from './AddressSchema.js';
export const UserSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string({
        required_error: 'User name is required',
        invalid_type_error: 'User name must be a String'
    }).regex(/^[A-Za-zÁÉÍÓÚáéíóú]*$/, 'User name invalid'),
    last_name: z.string({
        required_error: 'User lastName is required',
        invalid_type_error: 'User lastName must be a string'
    }).regex(/^[A-Za-zÁÉÍÓÚáéíóú]*$/, 'User lastName invalid'),
    age: z.number({
        required_error: 'User age is required',
        invalid_type_error: 'User age must be a number',
    }).int({message: 'User age must be a number integer'}).positive(
        {message: 'User age must be positive'}
    ).min(18, {message: 'User age must be greater than or equal to 18'}),
    email: z.string({
        required_error: 'User email is required',
        invalid_type_error: 'User email must be a string',
    }).email({message: 'User email is invalid'}),
    username: z.string({
        required_error: 'User username is required',
        invalid_type_error: 'User username must be a string',
    }),
    password: z.string({
        required_error: 'User password is required',
        invalid_type_error: 'User password must be a string',
        message: 'User password must be between 8 and 20 characters long',
    }),
    phone_number: z.string({
        required_error: 'User phone number is required',
        invalid_type_error: 'User phone number must be a string'
    }),
    rol: z.object({id: z.string({
        required_error: 'Rol ID is required',
        invalid_type_error: 'Rol ID must be a string'
    }).uuid({message: 'Rol ID must be a UUID string'})}, {
        required_error: 'rol is required',
        invalid_type_error: 'rol must be an object'
    }),
    address: AddressSchema
},{
    required_error: 'user is required',
    invalid_type_error: 'user must be an object'
});

export type UserType = z.infer<typeof UserSchema>;

export const userValidation = async (user:unknown):Promise<z.SafeParseReturnType<UserType,UserType>> => {
    return UserSchema.safeParse(user);
}

export const userValidationPartial = async (user: unknown):Promise<z.SafeParseReturnType<Partial<UserType>,Partial<UserType>>> => {
    return UserSchema.partial().safeParse(user);
}
