import { Request, Response } from 'express';
import { SuatAnService } from '../services/suat-an.service';

export const layTrangThaiSuatAn = async (req: Request, res: Response) => {
    try {
        const ngay = req.query.date as string || new Date().toISOString().split('T')[0];
        const lop = req.query.className as string;
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
