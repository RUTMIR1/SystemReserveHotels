import express, { Router } from 'express';
import { RoomController } from '../controllers/roomController.js';
import { authVerification } from '../middlewares/accessCookie.js';

export const roomRoute:Router = express.Router();

roomRoute.get('/', authVerification(['user', 'administrator', 'owner']), RoomController.getRooms);
roomRoute.get('/:id', authVerification(['user', 'administrator', 'owner']),RoomController.getRoomById);
roomRoute.post('/', authVerification(['administrator', 'owner']),RoomController.createRoom);
roomRoute.patch('/:id', authVerification(['administrator', 'owner']), RoomController.updateRoom);
roomRoute.delete('/:id', authVerification(['administrator', 'owner']), RoomController.deleteRoom);