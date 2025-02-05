import express from 'express';
import { ctrlUser } from '../controllers/userController.js';
export const userRoute = express.Router();

userRoute.get('/', ctrlUser.getUsers);
userRoute.get('/:id', ctrlUser.getUserById);
userRoute.post('/', ctrlUser.createUser);
userRoute.delete('/:id', ctrlUser.deleteUserById);
userRoute.patch('/:id', ctrlUser.updateUser);