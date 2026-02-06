import { Request, Response } from 'express';
import { DanhMucMasterService } from '../services/danh-muc-master.service';

export const layDanhSachDanhMuc = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const loai_danh_muc = req.query.loai_danh_muc as string || "";
        const search = req.query.search as string || "";

        const result = await DanhMucMasterService.getAll(page, pageSize, loai_danh_muc, search);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay danh sach danh muc", error });
    }
};

export const layDanhMucTheoLoai = async (req: Request, res: Response) => {
    try {
        const result = await DanhMucMasterService.getByCategory(req.params.loai as string);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay danh muc theo loai", error });
    }
};

export const layDanhMucTheoId = async (req: Request, res: Response) => {
    try {
        const item = await DanhMucMasterService.getById(req.params.id as string);
        if (!item) {
            return res.status(404).json({ message: "Khong tim thay danh muc" });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay thong tin danh muc", error });
    }
};

export const taoDanhMuc = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const item = await DanhMucMasterService.create(req.body, user?.id);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: "Loi khi tao danh muc", error });
    }
};

export const capNhatDanhMuc = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const item = await DanhMucMasterService.update(req.params.id as string, req.body, user?.id);
        if (!item) {
            return res.status(404).json({ message: "Khong tim thay danh muc" });
        }
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: "Loi khi cap nhat danh muc", error });
    }
};

export const xoaDanhMuc = async (req: Request, res: Response) => {
    try {
        await DanhMucMasterService.delete(req.params.id as string);
        res.json({ message: "Da xoa danh muc" });
    } catch (error) {
        res.status(500).json({ message: "Loi khi xoa danh muc", error });
    }
};
