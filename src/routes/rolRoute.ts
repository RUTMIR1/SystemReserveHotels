import express, { Router } from 'express';
import { RolController} from '../controllers/rolController.js'
import { authVerification } from '../middlewares/accessCookie.js';
export const rolRoute:Router = express.Router();

rolRoute.get('/', authVerification(['administrator', 'owner']), RolController.getRols);
rolRoute.get('/:id', authVerification(['administrator', 'owner']), RolController.getRolById);
rolRoute.post('/', authVerification(['administrator', 'owner']) ,RolController.createRol);
rolRoute.patch('/:id', authVerification(['administrator', 'owner']), RolController.updateRol);
rolRoute.delete('/:id', authVerification(['administrator', 'owner']),RolController.deleteRol);