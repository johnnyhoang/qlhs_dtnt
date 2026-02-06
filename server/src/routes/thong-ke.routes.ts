import { Router } from 'express';
import { layThongKeSuatAnCatTheoLopVaNgay, layThongKeSuatAnTheoThang, layThongKeVanChuyenTheoLop } from '../controllers/thong-ke.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/suat-an/cat-theo-lop-va-ngay', layThongKeSuatAnCatTheoLopVaNgay);
router.get('/suat-an/thang', layThongKeSuatAnTheoThang);
router.get('/van-chuyen/theo-lop', layThongKeVanChuyenTheoLop);

export default router;
