import { Router } from 'express';
import { layDanhSachNguoiDung, capNhatTrangThaiNguoiDung, capNhatPhanQuyen } from '../controllers/nguoi-dung.controller';

const router = Router();

router.get('/', layDanhSachNguoiDung);
router.patch('/:id', capNhatTrangThaiNguoiDung);
router.post('/:id/phan-quyen', capNhatPhanQuyen);

export default router;
