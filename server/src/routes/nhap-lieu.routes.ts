import { Router } from 'express';
import { nhapTuCsv, nhapSuatAnCsv, nhapDinhMucXeCsv, nhapBaoHiemCsv, nhapThanhToanCsv } from '../controllers/nhap-lieu.controller';
import { authMiddleware, checkModuleAccess } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/hoc-sinh-csv', checkModuleAccess('hoc-sinh', true), upload.single('file'), nhapTuCsv);
router.post('/suat-an-csv', checkModuleAccess('suat-an', true), upload.single('file'), nhapSuatAnCsv);
router.post('/dinh-muc-xe-csv', checkModuleAccess('dinh-muc-xe', true), upload.single('file'), nhapDinhMucXeCsv);
router.post('/bao-hiem-csv', checkModuleAccess('bao-hiem', true), upload.single('file'), nhapBaoHiemCsv);
router.post('/thanh-toan-csv', checkModuleAccess('thanh-toan', true), upload.single('file'), nhapThanhToanCsv);

export default router;
