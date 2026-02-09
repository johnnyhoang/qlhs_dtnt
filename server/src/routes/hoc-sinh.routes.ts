import { Router } from 'express';
import { 
    layDanhSachHocSinh, 
    layHocSinhTheoId, 
    taoHocSinh, 
    capNhatHocSinh, 
    xoaHocSinh,
    layDanhSachLop
} from '../controllers/hoc-sinh.controller';
import { authMiddleware, checkModuleAccess } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/danh-muc-lop', checkModuleAccess('hoc-sinh'), layDanhSachLop);
router.get('/', checkModuleAccess('hoc-sinh'), layDanhSachHocSinh);
router.get('/:id', checkModuleAccess('hoc-sinh'), layHocSinhTheoId);
router.post('/', checkModuleAccess('hoc-sinh', true), taoHocSinh);
router.put('/:id', checkModuleAccess('hoc-sinh', true), capNhatHocSinh);
router.delete('/:id', checkModuleAccess('hoc-sinh', true), xoaHocSinh);

export default router;
