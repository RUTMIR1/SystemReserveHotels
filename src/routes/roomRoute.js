import express from 'express';
import { ctrlRoom } from '../controllers/roomController.js';

export const roomRoute = express.Router();

roomRoute.get('/', ctrlRoom.getRooms);
roomRoute.get('/:id', ctrlRoom.getRoomById);
roomRoute.post('/', ctrlRoom.createRoom);
roomRoute.patch('/:id', ctrlRoom.updateRoom);
roomRoute.delete('/:id', ctrlRoom.deleteRoom);