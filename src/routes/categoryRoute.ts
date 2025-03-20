import express, { Router } from 'express';
import { CategoryController } from '../controllers/categoryController.js';
import { authVerification } from '../middlewares/accessCookie.js';
export const categoryRoute:Router = express.Router();

categoryRoute.get('/', CategoryController.getCategories);
categoryRoute.get('/:id', CategoryController.getCategory);
categoryRoute.post('/', authVerification(['administrator', 'owner']), CategoryController.createCategory);
categoryRoute.patch('/:id', authVerification(['administrator', 'owner']), CategoryController.updateCategory);
categoryRoute.delete('/:id', authVerification(['administrator', 'owner']), CategoryController.deleteCategory);