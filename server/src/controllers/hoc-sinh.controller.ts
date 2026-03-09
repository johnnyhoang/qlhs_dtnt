import { Request, Response } from 'express';
import { HocSinhService } from '../services/hoc-sinh.service';
import { convertToCSV } from '../utils/csv.util';
import dayjs from 'dayjs';

export const layDanhSachHocSinh = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const search = req.query.search as string || "";
        
        let lop: string | string[] = "";
        const rawLop = req.query.lop;

        if (typeof rawLop === 'string') {
            lop = rawLop.includes(',') ? rawLop.split(',') : rawLop;
        } else if (Array.isArray(rawLop)) {
            lop = rawLop as string[];
        }

        const user = (req as any).user;
        const result = await HocSinhService.getAll(page, pageSize, search, lop, user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay danh sach hoc sinh", error });
    }
};

export const layHocSinhTheoId = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const hoc_sinh = await HocSinhService.getById(req.params.id as string, user);
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
        const user = (req as any).user;
        const hoc_sinh = await HocSinhService.create(req.body, user);
        res.status(201).json(hoc_sinh);
    } catch (error) {
        res.status(400).json({ message: "Loi khi tao hoc sinh", error });
    }
};

export const capNhatHocSinh = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const hoc_sinh = await HocSinhService.update(req.params.id as string, req.body, user);
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
        const user = (req as any).user;
        await HocSinhService.delete(req.params.id as string, user);
        res.json({ message: "Da xoa hoc sinh" });
    } catch (error) {
        res.status(500).json({ message: "Loi khi xoa hoc sinh", error });
    }
};

export const layDanhSachLop = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const classes = await HocSinhService.getClasses(user);
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay danh sach lop", error });
    }
};

export const xuatCSVHocSinh = async (req: Request, res: Response) => {
    try {
        const search = req.query.search as string || "";
        let lop: string | string[] = "";
        const rawLop = req.query.lop;

        if (typeof rawLop === 'string') {
            lop = rawLop.includes(',') ? rawLop.split(',') : rawLop;
        } else if (Array.isArray(rawLop)) {
            lop = rawLop as string[];
        }

        const user = (req as any).user;
        const { data } = await HocSinhService.getAll(1, -1, search, lop, user);

        const columns = [
            { key: 'ma_hoc_sinh', header: 'Mã HS' },
            { key: 'ho_ten', header: 'Họ và tên' },
            { key: 'lop', header: 'Lớp' },
            { key: 'ngay_sinh', header: 'Ngày sinh' },
            { key: 'gioi_tinh', header: 'Giới tính' },
            { key: 'dan_toc', header: 'Dân tộc' },
            { key: 'ton_giao', header: 'Tôn giáo' },
            { key: 'dia_chi', header: 'Địa chỉ' },
            { key: 'trang_thai', header: 'Trạng thái' },
            { key: 'ma_moet', header: 'Mã MOET' },
            { key: 'updatedAt', header: 'Ngày cập nhật' },
            { key: 'nguoi_cap_nhat.ho_ten', header: 'Người cập nhật' },
        ];

        // Format dates before export
        const formattedData = data.map((item: any) => ({
            ...item,
            ngay_sinh: item.ngay_sinh ? dayjs(item.ngay_sinh).format('DD/MM/YYYY') : '',
            updatedAt: item.updatedAt ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm') : '',
        }));

        const csv = convertToCSV(formattedData, columns);
        const filename = `danh_sach_hoc_sinh_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: "Loi khi xuat CSV hoc sinh", error });
    }
};
