import { Request, Response } from 'express';
import { HocSinhService } from '../services/hoc-sinh.service';

export const layDanhSachHocSinh = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const search = req.query.search as string || "";
        const lop = req.query.lop as string || "";

        const result = await HocSinhService.getAll(page, pageSize, search, lop);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay danh sach hoc sinh", error });
    }
};

export const layHocSinhTheoId = async (req: Request, res: Response) => {
    try {
        const hoc_sinh = await HocSinhService.getById(req.params.id as string);
        if (!hoc_sinh) {
            return res.status(404).json({ message: "Khong tim thay hoc sinh" });
        }
        res.json(hoc_sinh);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay thong tin hoc sinh", error });
    }
};

export const taoHocSinh = async (req: Request, res: Response) => {
    try {
        const hoc_sinh = await HocSinhService.create(req.body);
        res.status(201).json(hoc_sinh);
    } catch (error) {
        res.status(400).json({ message: "Loi khi tao hoc sinh", error });
    }
};

export const capNhatHocSinh = async (req: Request, res: Response) => {
    try {
        const hoc_sinh = await HocSinhService.update(req.params.id as string, req.body);
        if (!hoc_sinh) {
            return res.status(404).json({ message: "Khong tim thay hoc sinh" });
        }
        res.json(hoc_sinh);
    } catch (error) {
        res.status(400).json({ message: "Loi khi cap nhat hoc sinh", error });
    }
};

export const xoaHocSinh = async (req: Request, res: Response) => {
    try {
        await HocSinhService.delete(req.params.id as string);
        res.json({ message: "Da xoa hoc sinh" });
    } catch (error) {
        res.status(500).json({ message: "Loi khi xoa hoc sinh", error });
    }
};
