import express from 'express';
import * as userController from './../controllers/userController.js';
import * as authController from './../controllers/authController.js';


const router = express.Router();




router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);


// futrue work forget password



// middleware routes (already signed in users)
router.use(authController.protect);
router.use(authController.restrictToAdmin);

router
    .route('/')
    .get(userController.getAllUsers)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

export default router;