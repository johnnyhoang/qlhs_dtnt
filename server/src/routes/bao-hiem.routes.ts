import { Router } from 'express';
import { layDanhSachBaoHiem, layBaoHiemTheoHocSinh, luuHoSoBaoHiem } from '../controllers/bao-hiem.controller';
import { authMiddleware, checkModuleAccess } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', checkModuleAccess('bao-hiem'), layDanhSachBaoHiem);
router.get('/:studentId', checkModuleAccess('bao-hiem'), layBaoHiemTheoHocSinh);
router.post('/', checkModuleAccess('bao-hiem', true), luuHoSoBaoHiem);

export default router;
