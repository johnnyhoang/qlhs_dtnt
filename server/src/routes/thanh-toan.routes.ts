import { Router } from 'express';
import { layDanhSachDotThanhToan, layChiTietDotThanhToan, taoDotThanhToanMoi, xuatCSVThanhToan } from '../controllers/thanh-toan.controller';
import { authMiddleware, checkModuleAccess } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/batches', checkModuleAccess('thanh-toan'), layDanhSachDotThanhToan);
router.get('/batches/:id/export', checkModuleAccess('thanh-toan'), xuatCSVThanhToan);
router.get('/batches/:id', checkModuleAccess('thanh-toan'), layChiTietDotThanhToan);
router.post('/batches/generate', checkModuleAccess('thanh-toan', true), taoDotThanhToanMoi);

export default router;
