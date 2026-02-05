import { Router } from 'express';
import { 
    layDanhSachHocSinh, 
    layHocSinhTheoId, 
    taoHocSinh, 
    capNhatHocSinh, 
    xoaHocSinh 
} from '../controllers/hoc-sinh.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', layDanhSachHocSinh);
router.get('/:id', layHocSinhTheoId);
router.post('/', taoHocSinh);
router.put('/:id', capNhatHocSinh);
router.delete('/:id', xoaHocSinh);

export default router;
