import express from 'express';
import * as authController from './../controllers/authController.js';

const router = express.Router();

router.get('/', (req, res) =>
{
    res.status(200).json({ message: 'Auth route is available. Use POST /auth/signup.' });
});

router.post('/signup', authController.signup);

export default router;
