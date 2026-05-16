import express from 'express';
import * as categoryController from '../controllers/categoryController.js'
import * as authController from '../controllers/authController.js';


const router = express.Router();

router.route('/')
    .get(categoryController.getAllCategories);


//! from here we must add auth + restrict to admin 

// router.use(authController.restrictToAdmin);
router.use(authController.protect)


router.post('/', categoryController.createCategory);

router.route('/:id')
    .put(categoryController.updateCategory)
    .patch(categoryController.deleteCategory);


export default router;