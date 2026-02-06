import { Router } from 'express';
import { layTatCaDinhMuc, layDinhMucTheoHocSinh, luuDinhMucXe } from '../controllers/dinh-muc-xe.controller';
import { authMiddleware, checkModuleAccess } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', checkModuleAccess('dinh-muc-xe'), layTatCaDinhMuc);
router.get('/:studentId', checkModuleAccess('dinh-muc-xe'), layDinhMucTheoHocSinh);
router.post('/', checkModuleAccess('dinh-muc-xe', true), luuDinhMucXe);

export default router;
