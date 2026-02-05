import { Request, Response } from 'express';
import { DinhMucXeService } from '../services/dinh-muc-xe.service';

export const layTatCaDinhMuc = async (req: Request, res: Response) => {
    try {
        const result = await DinhMucXeService.getAll();
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
        const result = await DinhMucXeService.luuDinhMuc(hoc_sinh_id, data);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi luu dinh muc xe", error });
    }
};
