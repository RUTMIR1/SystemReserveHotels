import z from 'zod';

export const CategorySchema = z.object({
    name: z.string({
        required_error: 'Category name is required',
        invalid_type_error: 'Category name must be a string'
    })
},{
    required_error: 'Category is required',
    invalid_type_error: 'Category must be a object'
})

export type CategoryType = z.infer<typeof CategorySchema>;

export const categoryValidation = async (category:unknown):Promise<z.SafeParseReturnType<CategoryType,CategoryType>>=>{
    return CategorySchema.safeParse(category);
}

export const categoryValidationPartial = async (category:unknown):Promise<z.SafeParseReturnType<Partial<CategoryType>,Partial<CategoryType>>>=>{
    return CategorySchema.partial().safeParse(category);
}