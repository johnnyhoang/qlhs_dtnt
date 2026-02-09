import { Request, Response } from 'express';
import { BaoHiemService } from '../services/bao-hiem.service';

export const layDanhSachBaoHiem = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        
        // Parse lop param
        let lop: string | string[] = "";
        const rawLop = req.query.lop;
        if (typeof rawLop === 'string') {
            lop = rawLop.includes(',') ? rawLop.split(',') : rawLop;
        } else if (Array.isArray(rawLop)) {
            lop = rawLop as string[];
        }

        const result = await BaoHiemService.getAll(user, lop);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay danh sach bao hiem", error });
    }
};

export const layBaoHiemTheoHocSinh = async (req: Request, res: Response) => {
    try {
        const result = await BaoHiemService.getByHocSinhId(req.params.studentId as string);
        if (!result) return res.status(404).json({ message: "Khong tim thay ho so bao hiem" });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay thong tin bao hiem", error });
    }
};

export const luuHoSoBaoHiem = async (req: Request, res: Response) => {
    try {
        const { hoc_sinh_id, ...data } = req.body;
        const user = (req as any).user;
        const result = await BaoHiemService.luuHoSo(hoc_sinh_id, data, user?.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: "Loi khi luu ho so bao hiem", error });
    }
};
