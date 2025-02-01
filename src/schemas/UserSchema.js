import z from 'zod';

const UserSchema = z.object({
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
        min_length: 8,
        max_length: 20,
        message: 'User password must be between 8 and 20 characters long',
    }),
    phone_number: z.string({
        required_error: 'User phone number is required',
        invalid_type_error: 'User phone number must be a string'
    })
})

export const userValidation = async (user)=>{
    return UserSchema.safeParse(user);
}

export const userValidationPartial = async (user)=>{
    return UserSchema.partial().safeParse(user);
}
