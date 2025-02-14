import express, { Router } from 'express';
import { AddressController } from '../controllers/addressController.js';
import { authVerification } from '../middlewares/accessCookie.js';
export const addressRoute:Router = express.Router();

addressRoute.get('/', authVerification(['administrator', 'owner']), AddressController.getAllAddress);
addressRoute.get('/:id', authVerification(['administrator', 'owner']), AddressController.getAddressById);
addressRoute.patch('/:id', authVerification(['administrator', 'owner']), AddressController.updateAddress);