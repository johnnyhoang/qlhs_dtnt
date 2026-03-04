import { Router } from 'express';
import authRoutes from './auth.routes';
import hocSinhRoutes from './hoc-sinh.routes';
import suatAnRoutes from './suat-an.routes';
import dinhMucXeRoutes from './dinh-muc-xe.routes';
import baoHiemRoutes from './bao-hiem.routes';
import thanhToanRoutes from './thanh-toan.routes';
import nhapLieuRoutes from './nhap-lieu.routes';
import nguoiDungRoutes from './nguoi-dung.routes';
import danhMucMasterRoutes from './danh-muc-master.routes';
import thongKeRoutes from './thong-ke.routes';
import { authMiddleware, adminOnly, checkModuleAccess } from '../middlewares/auth.middleware';

const router = Router();

import { AppDataSource } from '../data-source';

import { lastDbError } from '../index';

router.get('/health', (req, res) => {
    const dbStatus = AppDataSource.isInitialized ? 'connected' : 'disconnected';
    res.json({ 
        status: 'ok', 
        database: dbStatus,
        error: !AppDataSource.isInitialized ? (lastDbError?.message || lastDbError || 'Unknown error') : null,
        timestamp: new Date().toISOString()
    });
});

router.use('/auth', authRoutes);

// Protected routes
router.use(authMiddleware);

router.use('/hoc-sinh', checkModuleAccess('hoc-sinh'), hocSinhRoutes);
router.use('/suat-an', checkModuleAccess('suat-an'), suatAnRoutes);
router.use('/dinh-muc-xe', checkModuleAccess('dinh-muc-xe'), dinhMucXeRoutes);
router.use('/bao-hiem', checkModuleAccess('bao-hiem'), baoHiemRoutes);
router.use('/thanh-toan', checkModuleAccess('thanh-toan'), thanhToanRoutes);
router.use('/nhap-lieu', checkModuleAccess('nhap-lieu', true), nhapLieuRoutes);
router.use('/thong-ke', thongKeRoutes);

// Admin only
router.use('/nguoi-dung', adminOnly, nguoiDungRoutes);
router.use('/danh-muc-master', adminOnly, danhMucMasterRoutes);

export default router;
