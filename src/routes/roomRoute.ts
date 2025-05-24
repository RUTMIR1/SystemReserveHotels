import express, { Router } from 'express';
import { RoomController } from '../controllers/roomController.js';
import { authVerification } from '../middlewares/accessCookie.js';

export const roomRoute:Router = express.Router();

roomRoute.get('/', RoomController.getRooms);
roomRoute.get('/category/:category', RoomController.getRoomsByCategory);
roomRoute.get('/state/:state', RoomController.getRoomsByState);
roomRoute.get('/:id',RoomController.getRoomById);
roomRoute.post('/', authVerification(['administrator', 'owner']),RoomController.createRoom);
roomRoute.patch('/:id', authVerification(['administrator', 'owner']), RoomController.updateRoom);
roomRoute.delete('/:id', authVerification(['administrator', 'owner']), RoomController.deleteRoom);