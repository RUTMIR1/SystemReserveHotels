import express from 'express';
import { ctrlUser } from '../controllers/userController.js';
export const userRouter = express.Router();

userRouter.post('/', ctrlUser.createUser);