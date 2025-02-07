import z from 'zod';
import { querySql } from '../database.js';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const BaseReservationSchema = z.object({
    reservation_date_start: z.string({
        required_error: 'reservation_date_start is required',
        invalid_type_error: 'reservation_date_start must be a string'
    }).regex(dateRegex, {
        message: 'reservation_date_start must be a valid date in the format YYYY-MM-DD'
    }).transform((str) => {
        const date = new Date(str);
        if (isNaN(date)) throw new Error('reservation_date_start Invalid date');
        return date;
    }),
    reservation_date_end: z.string({
        required_error: 'reservation_date_end is required',
        invalid_type_error: 'reservation_date_end must be a string'
    }).regex(dateRegex, {
        message: 'reservation_date_end must be a valid date in the format YYYY-MM-DD'
    }).transform((str) => {
        const date = new Date(str);
        if (isNaN(date)) throw new Error('reservation_date_end Invalid date');
        return date;
    }),
    check_in: z.string({
        required_error: 'check_in date is required',
        invalid_type_error: 'check_in date must be a string'
    }).regex(dateRegex, {
        message: 'check_in must be a valid date in the format YYYY-MM-DD'
    }).transform((str) => {
        const date = new Date(str);
        if (isNaN(date)) throw new Error('check_in Invalid date');
        return date;
    }),
    check_out: z.string({
        required_error: 'check_out date is required',
        invalid_type_error: 'check_out date must be a string'
    }).regex(dateRegex, {
        message: 'check_out must be a valid date in the format YYYY-MM-DD'
    }).transform((str) => {
        const date = new Date(str);
        if (isNaN(date)) throw new Error('check_out Invalid date');
        return date;
    }),
    code: z.string({
        required_error: 'code is required',
        invalid_type_error: 'code must be a string'
    }).regex(/CODE\d{5}/, { message: 'Invalid code, must be CODEXXXXX' }),
    amount: z.number({
        required_error: 'amount is required',
        invalid_type_error: 'amount must be a number'
    }).positive({ message: 'Amount must be positive' }),
    state: z.enum(['finalized', 'current', 'canceled'], {
        required_error: 'state is required',
        invalid_type_error: 'state must be a string',
    }),
    user: z.object({
        id: z.string({
            required_error: 'user id is required',
            invalid_type_error: 'user id must be a string'
        }).uuid({ message: 'User ID must be a UUID string' })
    }),
    room: z.object({
        id: z.string({
            required_error: 'room id is required',
            invalid_type_error: 'room id must be a string'
        }).uuid({ message: 'Room ID must be a UUID string' })
    })
});

export const ReservationSchema = BaseReservationSchema.superRefine((data, ctx) => {
    if (data.reservation_date_start >= data.reservation_date_end) {
        ctx.addIssue({
            path: ['reservation_date_start'],
            message: 'reservation_date_start must be before reservation_date_end'
        });
    }
    if (data.check_in >= data.check_out) {
        ctx.addIssue({
            path: ['check_in'],
            message: 'check_in must be before check_out'
        });
    }
    if (data.check_in < data.reservation_date_start) {
        ctx.addIssue({
            path: ['check_in'],
            message: 'check_in cannot be before reservation_date_start'
        });
    }
    if (data.check_in > data.reservation_date_end) {
        ctx.addIssue({
            path: ['check_in'],
            message: 'check_in cannot be after reservation_date_end'
        });
    }
    if (data.check_out > data.reservation_date_end) {
        ctx.addIssue({
            path: ['check_out'],
            message: 'check_out cannot be after reservation_date_end'
        });
    }
    if (data.check_out < data.reservation_date_start) {
        ctx.addIssue({
            path: ['check_out'],
            message: 'check_out cannot be before reservation_date_start'
        });
    }
});

export const reservationValidation = async (reservation) => {
    return ReservationSchema.safeParse(reservation);
};

export const reservationValidationPartial = async (id, reservation) => {
    const result = BaseReservationSchema.partial().safeParse(reservation);
    
    if (!result.success) {
        return result; 
    }

    const [rows] = await querySql(
        `SELECT reservation_date_start, reservation_date_end, 
        check_in, check_out FROM Reservation WHERE id = ?`, 
        [id]
    );
    const existing = rows[0];
    const issues = [];

    if (reservation.reservation_date_start) {
        if (new Date(existing.reservation_date_end).getTime() < 
            new Date(reservation.reservation_date_start).getTime()) {
            issues.push({
                path: ['reservation_date_start'],
                message: 'reservation_date_start cannot be after than reservation_date_end'
            });
        }
    }

    if (reservation.reservation_date_end) {
        if (new Date(existing.reservation_date_start).getTime() > 
            new Date(reservation.reservation_date_end).getTime()) {
            issues.push({
                path: ['reservation_date_end'],
                message: 'reservation_date_end cannot be before than reservation_date_start'
            });
        }
    }

    if (reservation.check_in) {
        if (new Date(existing.reservation_date_start).getTime() > 
            new Date(reservation.check_in).getTime()) {
            issues.push({
                path: ['check_in'],
                message: 'check_in cannot be before than reservation_date_start'
            });
        }
        if (new Date(existing.reservation_date_end).getTime() < 
            new Date(reservation.check_in).getTime()) {
            issues.push({
                path: ['check_in'],
                message: 'check_in cannot be after than reservation_date_end'
            });
        }
        if(new Date(existing.check_out).getTime() <
          new Date(reservation.check_in).getTime()){
            issues.push({
                path: ['check_in'],
                message: 'check_in cannot be after than check_out'
            })
            }
    }

    if (reservation.check_out) {
        if (new Date(existing.reservation_date_start).getTime() > 
            new Date(reservation.check_out).getTime()) {
            issues.push({
                path: ['check_out'],
                message: 'check_out cannot be before than reservation_date_start'
            });
        }
        if (new Date(existing.reservation_date_end).getTime() < 
            new Date(reservation.check_out).getTime()) {
            issues.push({
                path: ['check_out'],
                message: 'check_out cannot be after than reservation_date_end'
            });
        }
        if(new Date(existing.check_out).getTime() <
          new Date(reservation.check_in).getTime()){
            issues.push({
                path: ['check_in'],
                message: 'check_in cannot be after than check_out'
            })
            }
    }

    if (issues.length > 0) {
        return { success: false, error: { issues } };
    }

    return result;
};


