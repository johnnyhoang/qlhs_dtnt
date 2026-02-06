import { Router } from 'express';
import { layDanhSachNguoiDung, capNhatTrangThaiNguoiDung, capNhatPhanQuyen } from '../controllers/nguoi-dung.controller';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

router.get('/', layDanhSachNguoiDung);
router.patch('/:id', capNhatTrangThaiNguoiDung);
router.post('/:id/phan-quyen', capNhatPhanQuyen);

export default router;
