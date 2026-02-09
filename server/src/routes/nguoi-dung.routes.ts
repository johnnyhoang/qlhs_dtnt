import { Router } from 'express';
import { layDanhSachNguoiDung, capNhatTrangThaiNguoiDung, capNhatPhanQuyen, capNhatLopPhuTrach } from '../controllers/nguoi-dung.controller';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

router.get('/', layDanhSachNguoiDung);
router.patch('/:id', capNhatTrangThaiNguoiDung);
router.post('/:id/phan-quyen', capNhatPhanQuyen);
router.post('/:id/lop-phu-trach', capNhatLopPhuTrach);

export default router;
