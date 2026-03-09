import { Request, Response } from 'express';
import { SuatAnService } from '../services/suat-an.service';
import { convertToCSV } from '../utils/csv.util';
import dayjs from 'dayjs';

export const layTrangThaiSuatAn = async (req: Request, res: Response) => {
    try {
        const ngay = req.query.date as string || new Date().toISOString().split('T')[0];
        
        // Parse lop param
        let lop: string | string[] = "";
        const rawLop = req.query.className;
        if (typeof rawLop === 'string') {
            lop = rawLop.includes(',') ? rawLop.split(',') : rawLop;
        } else if (Array.isArray(rawLop)) {
            lop = rawLop as string[];
        }
        const search = req.query.search as string;

        const user = (req as any).user;
        const result = await SuatAnService.layTrangThaiHangNgay(ngay, lop, search, user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay thong tin suat an", error });
    }
};

export const baoCatSuatAn = async (req: Request, res: Response) => {
    try {
        const { hoc_sinh_id, ngay, loai_suat_an, bao_cat, ghi_chu } = req.body;
        const user = (req as any).user;
        const result = await SuatAnService.doiTrangThaiBaoCat(hoc_sinh_id, ngay, loai_suat_an, bao_cat, user?.id, ghi_chu);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi bao cat suat an", error });
    }
};

export const xuatCSVSuatAn = async (req: Request, res: Response) => {
    try {
        const ngay = req.query.date as string || dayjs().format('YYYY-MM-DD');
        let lop: string | string[] = "";
        const rawLop = req.query.className;
        if (typeof rawLop === 'string') {
            lop = rawLop.includes(',') ? rawLop.split(',') : rawLop;
        } else if (Array.isArray(rawLop)) {
            lop = rawLop as string[];
        }
        const search = req.query.search as string;

        const user = (req as any).user;
        const data = await SuatAnService.layTrangThaiHangNgay(ngay, lop, search, user);

        const columns = [
            { key: 'ma_hoc_sinh', header: 'Mã HS' },
            { key: 'ho_ten', header: 'Họ và tên' },
            { key: 'lop', header: 'Lớp' },
            { key: 'suat_an.SANG', header: 'Sáng' },
            { key: 'suat_an.TRUA', header: 'Trưa' },
            { key: 'suat_an.TOI', header: 'Tối' },
            { key: 'suat_an.ghi_chu', header: 'Ghi chú' },
            { key: 'suat_an.updatedBy', header: 'Người báo' },
            { key: 'suat_an.lastUpdated', header: 'Thời gian' },
        ];

        const formattedData = data.map((item: any) => ({
            ...item,
            'suat_an.SANG': item.suat_an.SANG ? 'Cắt' : 'Ăn',
            'suat_an.TRUA': item.suat_an.TRUA ? 'Cắt' : 'Ăn',
            'suat_an.TOI': item.suat_an.TOI ? 'Cắt' : 'Ăn',
            'suat_an.lastUpdated': item.suat_an.lastUpdated ? dayjs(item.suat_an.lastUpdated).format('DD/MM/YYYY HH:mm') : '',
        }));

        const csv = convertToCSV(formattedData, columns);
        const filename = `bao_cao_suat_an_${ngay}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: "Loi khi xuat CSV suat an", error });
    }
};
