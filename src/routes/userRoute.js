import express from 'express';
import { ctrlUser } from '../controllers/userController.js';
export const userRouter = express.Router();

userRouter.get('/', ctrlUser.getUsers);
userRouter.get('/:id', ctrlUser.getUserById);
userRouter.post('/', ctrlUser.createUser);
userRouter.delete('/:id', ctrlUser.deleteUserById);
userRouter.patch('/:id', ctrlUser.updateUser);