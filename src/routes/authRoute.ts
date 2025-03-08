import express, { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authVerification } from '../middlewares/accessCookie.js';

export const authRoute:Router = express.Router();

authRoute.post('/login', authController.logIn);
authRoute.post('/logout', authController.logOut);
authRoute.post('/register', authController.register);
authRoute.get('/me', authVerification(['user', 'administrator', 'owner']) ,authController.me);