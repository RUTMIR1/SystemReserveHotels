import z from 'zod';

const RolSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string({
        required_error: 'Rol name is required',
        invalid_type_error: 'Rol must be a String'
    })
});

export const rolValidation = async (rol)=>{
    return RolSchema.safeParse(rol);
}

export const rolValidationPartial = async (rol)=>{
    return RolSchema.partial().safeParse(rol);
}
