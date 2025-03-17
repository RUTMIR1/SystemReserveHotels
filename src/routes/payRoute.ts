import express, { Router } from "express";
import { PayController } from "../controllers/payController.js";
import { authVerification } from "../middlewares/accessCookie.js";
export const payRouter:Router = express.Router();

payRouter.post('/webhook', PayController.webhook);
payRouter.post('/', authVerification(['administrator', 'owner', 'user']), PayController.createPay);