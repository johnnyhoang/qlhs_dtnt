import { Request, Response } from 'express';
import { ThanhToanService } from '../services/thanh-toan.service';
import { convertToCSV } from '../utils/csv.util';
import dayjs from 'dayjs';

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

export const xuatCSVThanhToan = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { id } = req.params;
        
        // Parse lop param
        let lop: string | string[] = "";
        const rawLop = req.query.lop;
        if (typeof rawLop === 'string') {
            lop = rawLop.includes(',') ? rawLop.split(',') : rawLop;
        } else if (Array.isArray(rawLop)) {
            lop = rawLop as string[];
        }

        const dot = await ThanhToanService.layDotThanhToanTheoId(Number(id), user, lop);
        if (!dot) return res.status(404).json({ message: "Khong tim thay dot thanh toan" });

        const data = dot.khoan_thanh_toan || [];

        const columns = [
            { key: 'hoc_sinh.ho_ten', header: 'Họ và tên' },
            { key: 'hoc_sinh.lop', header: 'Lớp' },
            { key: 'tien_an', header: 'Tiền ăn' },
            { key: 'tien_xe', header: 'Tiền xe' },
            { key: 'ho_tro_khac', header: 'Hỗ trợ khác' },
            { key: 'tong_tien', header: 'Tổng cộng' },
            { key: 'trang_thai', header: 'Trạng thái' },
            { key: 'updatedAt', header: 'Ngày cập nhật' },
            { key: 'nguoi_cap_nhat.ho_ten', header: 'Người cập nhật' },
        ];

        const formattedData = data.map((item: any) => ({
            ...item,
            updatedAt: item.updatedAt ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm') : '',
        }));

        const csv = convertToCSV(formattedData, columns);
        const filename = `thanh_toan_thang_${dot.thang}_${dot.nam}_${dayjs().format('YYYYMMDD')}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: "Loi khi xuat CSV chi tra", error });
    }
};
