import express, { Router } from 'express';
import { RoomController } from '../controllers/roomController.js';

export const roomRoute:Router = express.Router();

roomRoute.get('/', RoomController.getRooms);
roomRoute.get('/:id', RoomController.getRoomById);
roomRoute.post('/', RoomController.createRoom);
roomRoute.patch('/:id', RoomController.updateRoom);
roomRoute.delete('/:id', RoomController.deleteRoom);