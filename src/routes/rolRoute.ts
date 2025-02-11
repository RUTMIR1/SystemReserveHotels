import express, { Router } from 'express';
import { RolController} from '../controllers/rolController.js'
export const rolRoute:Router = express.Router();

rolRoute.get('/', RolController.getRols);
rolRoute.get('/:id', RolController.getRolById);
rolRoute.post('/', RolController.createRol);
rolRoute.patch('/:id', RolController.updateRol);
rolRoute.delete('/:id', RolController.deleteRol);