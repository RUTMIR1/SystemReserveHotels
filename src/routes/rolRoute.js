import express from 'express';
import { ctrlRol } from '../controllers/rolController.js';
export const rolRoute = express.Router();

rolRoute.get('/', ctrlRol.getRols);
rolRoute.get('/:id', ctrlRol.getRolById);
rolRoute.post('/', ctrlRol.createRol);
rolRoute.patch('/:id', ctrlRol.updateRol);
rolRoute.delete('/:id', ctrlRol.deleteRol);