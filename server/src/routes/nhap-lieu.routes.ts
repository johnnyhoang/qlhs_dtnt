import { Router } from 'express';
import multer from 'multer';
import { nhapTuCsv } from '../controllers/nhap-lieu.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/hoc-sinh-csv', upload.single('file'), nhapTuCsv);

export default router;
