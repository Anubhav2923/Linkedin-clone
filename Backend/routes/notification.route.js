import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { deleteNotification, getuserNotifications, markNotificationAsRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', protectRoute, getuserNotifications);

router.put('/:id/read', protectRoute, markNotificationAsRead);
router.delete('/:id', protectRoute, deleteNotification);

export default router;