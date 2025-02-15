import express, { Router } from 'express';
import { ReservationController } from '../controllers/reservationController.js';
import { authVerification } from '../middlewares/accessCookie.js';
export const reservationRoute:Router = express.Router();

reservationRoute.get('/', authVerification(['administrator', 'owner']), ReservationController.getReservations);
reservationRoute.get('/user', authVerification(['user','administrator', 'owner']), ReservationController.getMyReservations);
reservationRoute.get('/user/:username', authVerification(['administrator', 'owner']), ReservationController.getReservationsByUsername);
reservationRoute.get('/:id', authVerification(['administrator', 'owner']), ReservationController.getReservationById);
reservationRoute.post('/', authVerification(['administrator', 'owner']), ReservationController.createReservation);
reservationRoute.patch('/:id', authVerification(['administrator', 'owner']), ReservationController.updateReservation);
reservationRoute.delete('/:id', authVerification(['administrator', 'owner']), ReservationController.deleteReservation);