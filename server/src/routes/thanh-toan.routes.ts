import { Router } from 'express';
import { layDanhSachDotThanhToan, layChiTietDotThanhToan, taoDotThanhToanMoi } from '../controllers/thanh-toan.controller';
import { authMiddleware, checkModuleAccess } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/batches', checkModuleAccess('thanh-toan'), layDanhSachDotThanhToan);
router.get('/batches/:id', checkModuleAccess('thanh-toan'), layChiTietDotThanhToan);
router.post('/batches/generate', checkModuleAccess('thanh-toan', true), taoDotThanhToanMoi);

export default router;
