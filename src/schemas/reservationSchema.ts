import z, { string, ZodIssue } from 'zod';
import { querySql } from '../database.js';
import { RowDataPacket } from 'mysql2';
import { RoomSchema } from './RoomSchema.js';
import { UserSchema } from './UserSchema.js';

const dateRegex:RegExp = /^\d{4}-\d{2}-\d{2}$/;

const BaseReservationSchema = z.object({
    id:z.string().optional(),
    reservation_date_start: z.string({
        required_error: 'reservation_date_start is required',
        invalid_type_error: 'reservation_date_start must be a string'
    }).regex(dateRegex, {
        message: 'reservation_date_start must be a valid date in the format YYYY-MM-DD'
    }).transform((str) => {
        let date:Date = new Date(str);
        if (isNaN(date.getTime())) throw new Error('reservation_date_start Invalid date');
        let dateStr:string = date.toISOString().split('T')[0];
        return dateStr;
    }).optional(),
    reservation_date_end: z.string({
        required_error: 'reservation_date_end is required',
        invalid_type_error: 'reservation_date_end must be a string'
    }).regex(dateRegex, {
        message: 'reservation_date_end must be a valid date in the format YYYY-MM-DD'
    }).transform((str) => {
        const date:Date = new Date(str);
        if (isNaN(date.getTime())) throw new Error('reservation_date_end Invalid date');
        let dateStr:string = date.toISOString().split('T')[0];
        return dateStr;
    }).optional(),
    check_in: z.string({
        required_error: 'check_in date is required',
        invalid_type_error: 'check_in date must be a string'
    }).regex(dateRegex, {
        message: 'check_in must be a valid date in the format YYYY-MM-DD'
    }).transform((str) => {
        const date:Date = new Date(str);
        if (isNaN(date.getTime())) throw new Error('check_in Invalid date');
        let dateStr:string = date.toISOString().split('T')[0];
        return dateStr;
    }).optional(),
    check_out: z.string({
        required_error: 'check_out date is required',
        invalid_type_error: 'check_out date must be a string'
    }).regex(dateRegex, {
        message: 'check_out must be a valid date in the format YYYY-MM-DD'
    }).transform((str) => {
        let date:Date = new Date(str);
        if (isNaN(date.getTime())) throw new Error('check_out Invalid date');
        let dateStr:string = date.toISOString().split('T')[0];
        return dateStr;
    }).optional(),
    code: z.string({
        required_error: 'code is required',
        invalid_type_error: 'code must be a string'
    }).regex(/CODE\d{5}/, { message: 'Invalid code, must be CODEXXXXX' }).optional(),
    amount: z.number({
        required_error: 'amount is required',
        invalid_type_error: 'amount must be a number'
    }).positive({ message: 'Amount must be positive' }),
    days: z.number({
        required_error: 'days is required',
        invalid_type_error: 'days must be a number'
    }).positive({
        message: 'days must be positive'
    }),
    state: z.enum(['finalized', 'current', 'canceled'], {
        required_error: 'state is required',
        invalid_type_error: 'state must be a string',
    }).optional(),
    user: z.object({
        id:z.string({
            required_error: 'User id is required',
            invalid_type_error: 'User id must be a string'
        }).uuid({message:'User id must be in UUID format'})
    }),
    room: z.object({
        id:z.string({
            required_error:'Room id is required',
            invalid_type_error:'Room id must be a string'
        }).uuid({message:'User id must be in UUID format'})
    })
});

/**
 *  user: z.object({
        id: z.string({
            required_error: 'user id is required',
            invalid_type_error: 'user id must be a string'
        }).uuid({ message: 'User ID must be a UUID string' })
    }),
 * z.enum(['finalized', 'current', 'canceled'], {
        required_error: 'state is required',
        invalid_type_error: 'state must be a string',
    }).optional()
 * 
 * z.object({
        id: z.string({
            required_error: 'room id is required',
            invalid_type_error: 'room id must be a string'
        }).uuid({ message: 'Room ID must be a UUID string' })
    })
 */

export const ReservationSchema = BaseReservationSchema.superRefine((data, ctx) => {
    if(data.reservation_date_end && data.reservation_date_start && data.check_in && data.check_out){
    if (data.reservation_date_start >= data.reservation_date_end) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['reservation_date_start'],
            message: 'reservation_date_start must be before reservation_date_end'
        });
    }
    
    if (data.check_in >= data.check_out) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['check_in'],
            message: 'check_in must be before check_out'
        });
    }
    if (data.check_in < data.reservation_date_start) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['check_in'],
            message: 'check_in cannot be before reservation_date_start'
        });
    }
    if (data.check_in > data.reservation_date_end) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['check_in'],
            message: 'check_in cannot be after reservation_date_end'
        });
    }
    if (data.check_out > data.reservation_date_end) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['check_out'],
            message: 'check_out cannot be after reservation_date_end'
        });
    }
    if (data.check_out < data.reservation_date_start) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['check_out'],
            message: 'check_out cannot be before reservation_date_start'
        });
    }
    }
});

export type ReservationType = z.infer<typeof ReservationSchema>;

export const reservationValidation = async (reservation:any):Promise<z.SafeParseReturnType<ReservationType, ReservationType>> => {
    return ReservationSchema.safeParse(reservation);
};

export const reservationValidationPartial = async (id:string, reservation:any):Promise<z.SafeParseReturnType<Partial<ReservationType>, Partial<ReservationType>>> => {
    const result:z.SafeParseReturnType<Partial<ReservationType>, Partial<ReservationType>> = BaseReservationSchema.partial().safeParse(reservation);
    
    if (!result.success) {
        return result; 
    }

    const [rows]:RowDataPacket[]  = await querySql(
        `SELECT reservation_date_start, reservation_date_end, 
        check_in, check_out FROM Reservation WHERE id = ?`, 
        [id]
    );
    const existing:any = rows[0];
    const issues: ZodIssue[] = [];

    if (reservation.reservation_date_start) {
        if (new Date(existing.reservation_date_end).getTime() < 
            new Date(reservation.reservation_date_start).getTime()) {
            issues.push({
                code: z.ZodIssueCode.custom,
                path: ['reservation_date_start'],
                message: 'reservation_date_start cannot be after than reservation_date_end'
            });
        }
    }

    if (reservation.reservation_date_end) {
        if (new Date(existing.reservation_date_start).getTime() > 
            new Date(reservation.reservation_date_end).getTime()) {
            issues.push({
                code: z.ZodIssueCode.custom,
                path: ['reservation_date_end'],
                message: 'reservation_date_end cannot be before than reservation_date_start'
            });
        }
    }

    if (reservation.check_in) {
        if (new Date(existing.reservation_date_start).getTime() > 
            new Date(reservation.check_in).getTime()) {
            issues.push({
                code: z.ZodIssueCode.custom,
                path: ['check_in'],
                message: 'check_in cannot be before than reservation_date_start'
            });
        }
        if (new Date(existing.reservation_date_end).getTime() < 
            new Date(reservation.check_in).getTime()) {
            issues.push({
                code: z.ZodIssueCode.custom,
                path: ['check_in'],
                message: 'check_in cannot be after than reservation_date_end'
            });
        }
        if(new Date(existing.check_out).getTime() <
          new Date(reservation.check_in).getTime()){
            issues.push({
                code: z.ZodIssueCode.custom,
                path: ['check_in'],
                message: 'check_in cannot be after than check_out'
            })
            }
    }

    if (reservation.check_out) {
        if (new Date(existing.reservation_date_start).getTime() > 
            new Date(reservation.check_out).getTime()) {
            issues.push({
                code: z.ZodIssueCode.custom,
                path: ['check_out'],
                message: 'check_out cannot be before than reservation_date_start'
            });
        }
        if (new Date(existing.reservation_date_end).getTime() < 
            new Date(reservation.check_out).getTime()) {
            issues.push({
                code: z.ZodIssueCode.custom,
                path: ['check_out'],
                message: 'check_out cannot be after than reservation_date_end'
            });
        }
        if(new Date(existing.check_out).getTime() <
          new Date(reservation.check_in).getTime()){
            issues.push({
                code: z.ZodIssueCode.custom,
                path: ['check_in'],
                message: 'check_in cannot be after than check_out'
            })
            }
    }

    if (issues.length > 0) {
        return { success: false, error: new z.ZodError(issues) };
    }

    return result;
};