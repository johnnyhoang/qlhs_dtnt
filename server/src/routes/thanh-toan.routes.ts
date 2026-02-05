import { Router } from 'express';
import { layDanhSachDotThanhToan, layChiTietDotThanhToan, taoDotThanhToanMoi } from '../controllers/thanh-toan.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/batches', layDanhSachDotThanhToan);
router.get('/batches/:id', layChiTietDotThanhToan);
router.post('/batches/generate', taoDotThanhToanMoi);

export default router;
