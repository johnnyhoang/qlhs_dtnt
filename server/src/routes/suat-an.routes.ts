import { Router } from 'express';
import { layTrangThaiSuatAn, baoCatSuatAn } from '../controllers/suat-an.controller';
import { authMiddleware, checkModuleAccess } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', checkModuleAccess('suat-an'), layTrangThaiSuatAn);
router.post('/bao-cat', checkModuleAccess('suat-an', true), baoCatSuatAn);

export default router;
