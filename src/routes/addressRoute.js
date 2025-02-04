import express from 'express';
import { ctrlAddress } from '../controllers/addressController.js';
export const addressRoute = express.Router();

addressRoute.get('/', ctrlAddress.getAllAddress);
addressRoute.get('/:id', ctrlAddress.getAddressById);
addressRoute.patch('/:id', ctrlAddress.updateAddress);