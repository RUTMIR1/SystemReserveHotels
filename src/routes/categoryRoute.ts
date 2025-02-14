import express, { Router } from 'express';
import { CategoryController } from '../controllers/categoryController.js';
import { authVerification } from '../middlewares/accessCookie.js';
export const categoryRoute:Router = express.Router();

categoryRoute.get('/', authVerification(['user', 'administrator', 'owner']), CategoryController.getCategories);
categoryRoute.get('/:id', authVerification(['user', 'administrator', 'owner']), CategoryController.getCategory);
categoryRoute.post('/', authVerification(['administrator', 'owner']), CategoryController.createCategory);
categoryRoute.patch('/:id', authVerification(['administrator', 'owner']), CategoryController.updateCategory);
categoryRoute.delete('/:id', authVerification(['administrator', 'owner']), CategoryController.deleteCategory);