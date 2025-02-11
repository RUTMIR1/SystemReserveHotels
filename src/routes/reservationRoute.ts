import express, { Router } from 'express';
import { ReservationController } from '../controllers/reservationController.js';
export const reservationRoute:Router = express.Router();

reservationRoute.get('/', ReservationController.getReservations);
reservationRoute.get('/:id', ReservationController.getReservationById);
reservationRoute.post('/', ReservationController.createReservation);
reservationRoute.patch('/:id', ReservationController.updateReservation);
reservationRoute.delete('/:id', ReservationController.deleteReservation);