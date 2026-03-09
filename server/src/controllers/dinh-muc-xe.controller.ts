import { Request, Response } from 'express';
import { DinhMucXeService } from '../services/dinh-muc-xe.service';
import { convertToCSV } from '../utils/csv.util';
import dayjs from 'dayjs';

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

export const xuatCSVDinhMucXe = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let lop: string | string[] = "";
        const rawLop = req.query.lop;
        if (typeof rawLop === 'string') {
            lop = rawLop.includes(',') ? rawLop.split(',') : rawLop;
        } else if (Array.isArray(rawLop)) {
            lop = rawLop as string[];
        }

        const data = await DinhMucXeService.getAll(user, lop);

        const columns = [
            { key: 'hoc_sinh.ma_hoc_sinh', header: 'Mã HS' },
            { key: 'hoc_sinh.ho_ten', header: 'Họ và tên' },
            { key: 'hoc_sinh.lop', header: 'Lớp' },
            { key: 'khoang_cach', header: 'Khoảng cách (km)' },
            { key: 'so_tien', header: 'Số tiền hỗ trợ' },
            { key: 'ngan_hang', header: 'Ngân hàng' },
            { key: 'so_tai_khoan', header: 'Số tài khoản' },
            { key: 'updatedAt', header: 'Ngày cập nhật' },
            { key: 'nguoi_cap_nhat.ho_ten', header: 'Người cập nhật' },
        ];

        const formattedData = data.map((item: any) => ({
            ...item,
            so_tien: item.so_tien?.toLocaleString('vi-VN') + ' VNĐ',
            updatedAt: item.updatedAt ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm') : '',
        }));

        const csv = convertToCSV(formattedData, columns);
        const filename = `dinh_muc_xe_${dayjs().format('YYYYMMDD')}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: "Loi khi xuat CSV dinh muc xe", error });
    }
};
