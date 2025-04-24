import {Router} from 'express';
import {
    checkVIPStatus,
    getVIPBenefits,
    manualVIPUpgrade,
    revokeVIPStatus,
    updateVIPExpiry
} from '../controllers/vipCon.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';

const vipRouter = Router();

// Public routes
vipRouter.get('/check-status', isAuthenticated, checkVIPStatus);

vipRouter.get('/benefits/:userId', isAuthenticated, getVIPBenefits);

// Admin-only routes
vipRouter.post('/upgrade', isAuthenticated, authorizeAdmin, manualVIPUpgrade);

vipRouter.patch('/extend', isAuthenticated, authorizeAdmin, updateVIPExpiry);

vipRouter.delete('/revoke/:userId', isAuthenticated, authorizeAdmin, revokeVIPStatus);

export default vipRouter;