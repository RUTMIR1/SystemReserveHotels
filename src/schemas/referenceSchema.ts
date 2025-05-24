import z from 'zod';

const PreferenceSchema = z.object({
    days:z.number({
        required_error:'days is required',
        invalid_type_error:'days must be a string'
    }),
    user_id:z.string({
        required_error:'user id is required', 
        invalid_type_error:'user id must be a string'
    }),
    room_id:z.string({
        required_error:'room id is required',
        invalid_type_error:'room id must be a string'
    }),
    success_url:z.string({
        required_error:'success url is required',
        invalid_type_error:'success url must be a string'
    }).optional()
})

export type PreferenceType = z.infer<typeof PreferenceSchema>;

export const PreferenceValidation = async (preference:unknown)=>{
    return PreferenceSchema.safeParse(preference);
}