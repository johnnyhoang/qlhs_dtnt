import { Router } from 'express';
import { layTrangThaiSuatAn, baoCatSuatAn } from '../controllers/suat-an.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/status', layTrangThaiSuatAn);
router.post('/toggle', baoCatSuatAn);

export default router;
