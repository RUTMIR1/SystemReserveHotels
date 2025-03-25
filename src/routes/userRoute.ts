import express, { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authVerification } from '../middlewares/accessCookie.js';
export const userRoute:Router = express.Router();

userRoute.get('/', authVerification(['administrator', 'owner']), UserController.getUsers);
userRoute.get('/:id', UserController.getUserById);
userRoute.post('/', UserController.createUser);
userRoute.delete('/:id', authVerification(['administrator', 'owner']), UserController.deleteUserById);
userRoute.patch('/:id', authVerification(['administrator', 'owner']), UserController.updateUser); 