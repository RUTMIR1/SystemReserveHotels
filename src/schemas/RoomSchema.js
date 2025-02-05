import z from 'zod';

const RoomSchema = z.object({
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
    })
});

export const roomValidate = async (room)=>{
    return RoomSchema.safeParse(room);
}

export const roomPartialValidate = async (room)=>{
    return RoomSchema.partial().safeParse(room);
}