import z from 'zod';

export const RoomSchema = z.object({
    id:z.string().optional(),
    name: z.string({
        required_error: 'Room name is required',
        invalid_type_error: 'Room name must be a String'
    }),
    price: z.number({
        required_error: 'Room price is required',
        invalid_type_error: 'Room price must be a number'
    }).positive({
        message: 'Room price must be positive'
    }),
    description: z.string({
        required_error: 'Room description is required',
        invalid_type_error: 'Room description must be a String'
    }),
    image_url: z.string({
        required_error: 'Room image_url is required',
        invalid_type_error: 'Room image_url must be a String'
    }),
    state: z.enum(['active', 'inactive', 'reserved'], {
        required_error: 'Room state is required',
        invalid_type_error: 'Room state must be a string'
    }),
    categories: z.array(z.object({
        id: z.string({
            required_error: "Room category id is required",
            invalid_type_error: "Room category id must be a string"
        })
    },{
        required_error: "Room category is required",
        invalid_type_error: "Room category must be a object"
    }),{
        required_error:"Room categories is required",
        invalid_type_error: "Room categories must be a array"
    }).min(1,{message: "at least one category is required"})
},{
    required_error: 'room is required',
    invalid_type_error: 'room must be a object'
});

export type RoomType = z.infer<typeof RoomSchema>;

export const roomValidate = async (room:unknown):Promise<z.SafeParseReturnType<RoomType, RoomType>>=>{
    return RoomSchema.safeParse(room);
}

export const roomPartialValidate = async (room:unknown):Promise<z.SafeParseReturnType<Partial<RoomType>, Partial<RoomType>>>=>{
    return RoomSchema.partial().safeParse(room);
}