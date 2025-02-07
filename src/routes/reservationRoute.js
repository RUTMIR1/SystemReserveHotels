import express from 'express';
import { ctrlReservation } from '../controllers/reservationController.js';
export const reservationRoute = express.Router();

reservationRoute.get('/', ctrlReservation.getReservations);
reservationRoute.get('/:id', ctrlReservation.getReservationById);
reservationRoute.post('/', ctrlReservation.createReservation);
reservationRoute.patch('/:id', ctrlReservation.updateReservation);
reservationRoute.delete('/:id', ctrlReservation.deleteReservation);