import express from 'express';
import { getCurrentUser, loginController, logoutController, signupController } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';


const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/logout', logoutController);

router.get('/me', protectRoute, getCurrentUser)

export default router;