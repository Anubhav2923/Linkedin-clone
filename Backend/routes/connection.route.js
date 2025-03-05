import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { sendConnectionRequest,acceptConnectionRequest ,rejectConnectionRequest, getUserConnection, removeConnection, getConnectionStatus ,getConnectionRequests } from '../controllers/connection.controller.js';

const router = express.Router();

router.post('/request/:userId', protectRoute, sendConnectionRequest),
router.put('/accept/:requestId', protectRoute, acceptConnectionRequest);
router.put('/reject/:requestId', protectRoute, rejectConnectionRequest);

// Get all connection requests for the current user
router.get('/requests', protectRoute, getConnectionRequests)

// get all connections for a user
router.get('/', protectRoute, getUserConnection);
router.delete('/:userId', protectRoute, removeConnection);
router.get('/status/:userId', protectRoute, getConnectionStatus);

export default router;