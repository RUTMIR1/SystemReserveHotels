import express, { Router } from 'express';
import { CategoryController } from '../controllers/categoryController.js';
export const categoryRoute:Router = express.Router();

categoryRoute.get('/', CategoryController.getCategories);
categoryRoute.get('/:id', CategoryController.getCategory);
categoryRoute.post('/', CategoryController.createCategory);
categoryRoute.patch('/:id', CategoryController.updateCategory);
categoryRoute.delete('/:id', CategoryController.deleteCategory);