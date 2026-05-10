import express from 'express';
import * as userController from './../controllers/userController.js';
import * as authController from './../controllers/authController.js';


const router = express.Router();




router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);


// futrue work forget password + update password


//* protect all routes from here
router.use(authController.protect);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);

//? router.delete('/deleteMe', userController.deleteMe);

//^ only admins
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