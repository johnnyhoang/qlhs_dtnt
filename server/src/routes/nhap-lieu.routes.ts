import { Router } from 'express';
import { nhapTuCsv, nhapSuatAnCsv, nhapDinhMucXeCsv, nhapBaoHiemCsv, nhapThanhToanCsv } from '../controllers/nhap-lieu.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/hoc-sinh-csv', authMiddleware, upload.single('file'), nhapTuCsv);
router.post('/suat-an-csv', authMiddleware, upload.single('file'), nhapSuatAnCsv);
router.post('/dinh-muc-xe-csv', authMiddleware, upload.single('file'), nhapDinhMucXeCsv);
router.post('/bao-hiem-csv', authMiddleware, upload.single('file'), nhapBaoHiemCsv);
router.post('/thanh-toan-csv', authMiddleware, upload.single('file'), nhapThanhToanCsv);

export default router;
