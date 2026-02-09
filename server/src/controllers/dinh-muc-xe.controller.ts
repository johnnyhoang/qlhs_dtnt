import { Request, Response } from 'express';
import { DinhMucXeService } from '../services/dinh-muc-xe.service';

export const layTatCaDinhMuc = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        
        let lop: string | string[] = "";
        const rawLop = req.query.lop;
        if (typeof rawLop === 'string') {
            lop = rawLop.includes(',') ? rawLop.split(',') : rawLop;
        } else if (Array.isArray(rawLop)) {
            lop = rawLop as string[];
        }

        const result = await DinhMucXeService.getAll(user, lop);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay dinh muc xe", error });
    }
};

export const layDinhMucTheoHocSinh = async (req: Request, res: Response) => {
    try {
        const result = await DinhMucXeService.getByHocSinhId(req.params.studentId as string);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay dinh muc xe theo hoc sinh", error });
    }
};

export const luuDinhMucXe = async (req: Request, res: Response) => {
    try {
        const { hoc_sinh_id, ...data } = req.body;
        const user = (req as any).user;
        const result = await DinhMucXeService.luuDinhMuc(hoc_sinh_id, data, user?.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi luu dinh muc xe", error });
    }
};
