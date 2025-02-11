import z from 'zod';

const RolSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string({
        required_error: 'Rol name is required',
        invalid_type_error: 'Rol must be a String'
    })
});

export type RolType = z.infer<typeof RolSchema>;

export const rolValidation = async (rol:unknown):Promise<z.SafeParseReturnType<RolType,RolType>>=>{
    return RolSchema.safeParse(rol);
}

export const rolValidationPartial = async (rol:unknown):Promise<z.SafeParseReturnType<Partial<RolType>,Partial<RolType>>>=>{
    return RolSchema.partial().safeParse(rol);
}
