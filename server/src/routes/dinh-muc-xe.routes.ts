import { Router } from 'express';
import { layTatCaDinhMuc, layDinhMucTheoHocSinh, luuDinhMucXe } from '../controllers/dinh-muc-xe.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', layTatCaDinhMuc);
router.get('/:studentId', layDinhMucTheoHocSinh);
router.post('/', luuDinhMucXe);

export default router;
