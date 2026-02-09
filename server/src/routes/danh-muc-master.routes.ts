import { Router } from 'express';
import { 
    layDanhSachDanhMuc, 
    layDanhMucTheoLoai, 
    layDanhMucTheoId, 
    taoDanhMuc, 
    capNhatDanhMuc, 
    xoaDanhMuc 
} from '../controllers/danh-muc-master.controller';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// All routes require admin access for now
router.get('/', adminOnly, layDanhSachDanhMuc);
router.get('/category/:loai', adminOnly, layDanhMucTheoLoai);
router.get('/:id', adminOnly, layDanhMucTheoId);
router.post('/', adminOnly, taoDanhMuc);
router.put('/:id', adminOnly, capNhatDanhMuc);
router.delete('/:id', adminOnly, xoaDanhMuc);

export default router;
