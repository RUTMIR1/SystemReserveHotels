import z from 'zod';

const authSchema = z.object({
    username: z.string({
        required_error: 'username is required',
        invalid_type_error: 'username must be a string'
    }),
    password: z.string({
        required_error: 'password is required',
        invalid_type_error: 'password must be a string'
    }),
    rol: z.string({
        required_error: 'rol is required',
        invalid_type_error: 'rol must be a string'
    }).optional()
});

export type AuthType = z.infer<typeof authSchema>;

export const authValidation = async (auth:unknown): Promise<z.SafeParseReturnType<AuthType, AuthType>>=>{
    return authSchema.safeParse(auth);
}