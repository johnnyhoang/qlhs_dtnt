import { Router } from 'express';
import { layDanhSachBaoHiem, layBaoHiemTheoHocSinh, luuHoSoBaoHiem } from '../controllers/bao-hiem.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', layDanhSachBaoHiem);
router.get('/:studentId', layBaoHiemTheoHocSinh);
router.post('/', luuHoSoBaoHiem);

export default router;
