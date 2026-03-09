import { Request, Response } from 'express';
import { DanhMucMasterService } from '../services/danh-muc-master.service';
import { convertToCSV } from '../utils/csv.util';
import dayjs from 'dayjs';

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

export const xuatCSVDanhMucMaster = async (req: Request, res: Response) => {
    try {
        const loai_danh_muc = req.query.loai_danh_muc as string || "";
        const search = req.query.search as string || "";

        // Fetch all records for export (pageSize: 10000 should be enough for master data)
        const result = await DanhMucMasterService.getAll(1, 10000, loai_danh_muc, search);
        const data = result.data;

        const columns = [
            { key: 'loai_danh_muc', header: 'Loại' },
            { key: 'ma', header: 'Mã' },
            { key: 'ten', header: 'Tên' },
            { key: 'thu_tu', header: 'Thứ tự' },
            { key: 'kich_hoat', header: 'Trạng thái' },
            { key: 'ghi_chu', header: 'Ghi chú' },
            { key: 'updatedAt', header: 'Ngày cập nhật' },
            { key: 'nguoi_cap_nhat.ho_ten', header: 'Người cập nhật' },
        ];

        const formattedData = data.map((item: any) => ({
            ...item,
            kich_hoat: item.kich_hoat ? 'Hoạt động' : 'Khóa',
            updatedAt: item.updatedAt ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm') : '',
        }));

        const csv = convertToCSV(formattedData, columns);
        const filename = `danh_muc_${loai_danh_muc}_${dayjs().format('YYYYMMDD')}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: "Loi khi xuat CSV danh muc", error });
    }
};
