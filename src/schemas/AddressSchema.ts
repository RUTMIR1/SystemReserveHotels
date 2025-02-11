import z from 'zod';

export const AddressSchema = z.object({
   country: z.string({
     required_error: 'Address country is required',
     invalid_type_error: 'Address country mus1t be a string'
   }),
   province: z.string({
     required_error: 'Address province is required',
     invalid_type_error: 'Address province must be a string'
   }),
   city: z.string({
     required_error: 'Address city is required',
     invalid_type_error: 'Address city must be a string'
   }),
   house_number: z.number({
     required_error: 'Address house_number is required',
     invalid_type_error: 'Address house_number must be a number'
   }).int({message: 'Address house_number must be a integer'})
   .positive({message:'Address house_number must be positive'}),
   floor: z.number({
     required_error: 'Address floor is required',
     invalid_type_error: 'Address floor must be a number'
   }).int({
     message: 'Address floor must be a integer'
   }).positive({
     message: 'Address floor must be positive'
   })
},{
    required_error: 'address is required',
    invalid_type_error: 'address must be an object'
});

export type AddressType = z.infer<typeof AddressSchema>;

export const addressValidationPartial = async(address:unknown):Promise<z.SafeParseReturnType<Partial<AddressType>, Partial<AddressType>>>=>{
    return AddressSchema.partial().safeParse(address);
}