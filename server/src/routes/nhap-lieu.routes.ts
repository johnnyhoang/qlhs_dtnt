import { Router } from 'express';
import multer from 'multer';
import { nhapTuExcel } from '../controllers/nhap-lieu.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/hoc-sinh-excel', upload.single('file'), nhapTuExcel);

export default router;
