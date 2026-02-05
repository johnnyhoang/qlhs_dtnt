import { Router } from 'express';
import { googleLogin, getMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/google-login', googleLogin);
router.get('/me', authMiddleware, getMe);

export default router;
