import { Request, Response } from 'express';
import { ThanhToanService } from '../services/thanh-toan.service';

export const layDanhSachDotThanhToan = async (req: Request, res: Response) => {
    try {
        const result = await ThanhToanService.layTatCaDotThanhToan();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay danh sach dot thanh toan", error });
    }
};

export const layChiTietDotThanhToan = async (req: Request, res: Response) => {
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

        const result = await ThanhToanService.layDotThanhToanTheoId(Number(req.params.id), user, lop);
        if (!result) return res.status(404).json({ message: "Khong tim thay dot thanh toan" });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay chi tiet dot thanh toan", error });
    }
};

export const taoDotThanhToanMoi = async (req: Request, res: Response) => {
    try {
        const { thang, nam, ghi_chu } = req.body;
        const user = (req as any).user;
        const result = await ThanhToanService.taoMoiDotThanhToan(thang, nam, user?.id, ghi_chu);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi tao dot thanh toan", error });
    }
};
