import express, { Router } from 'express';
import { UserController } from '../controllers/userController.js';
export const userRoute:Router = express.Router();

userRoute.get('/', UserController.getUsers);
userRoute.get('/:id', UserController.getUserById);
userRoute.post('/', UserController.createUser);
userRoute.delete('/:id', UserController.deleteUserById);
userRoute.patch('/:id', UserController.updateUser);