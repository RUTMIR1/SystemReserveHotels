import express, { Router } from 'express';
import { AddressController } from '../controllers/addressController.js';
export const addressRoute:Router = express.Router();

addressRoute.get('/', AddressController.getAllAddress);
addressRoute.get('/:id', AddressController.getAddressById);
addressRoute.patch('/:id', AddressController.updateAddress);