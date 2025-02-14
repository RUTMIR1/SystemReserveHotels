import express, { Router } from 'express';
import { authController } from '../controllers/authController.js';

export const authRoute:Router = express.Router();

authRoute.post('/login', authController.login);