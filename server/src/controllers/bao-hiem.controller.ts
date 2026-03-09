import { Request, Response } from 'express';
import { BaoHiemService } from '../services/bao-hiem.service';
import { convertToCSV } from '../utils/csv.util';
import dayjs from 'dayjs';

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

export const xuatCSVBaoHiem = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let lop: string | string[] = "";
        const rawLop = req.query.lop;
        if (typeof rawLop === 'string') {
            lop = rawLop.includes(',') ? rawLop.split(',') : rawLop;
        } else if (Array.isArray(rawLop)) {
            lop = rawLop as string[];
        }

        const data = await BaoHiemService.getAll(user, lop);

        const columns = [
            { key: 'hoc_sinh.ma_hoc_sinh', header: 'Mã HS' },
            { key: 'hoc_sinh.ho_ten', header: 'Họ và tên' },
            { key: 'hoc_sinh.lop', header: 'Lớp' },
            { key: 'so_the', header: 'Số thẻ BHYT' },
            { key: 'noi_dk_kcb_ban_dau', header: 'Nơi ĐK KCB ban đầu' },
            { key: 'han_su_dung', header: 'Hạn sử dụng' },
            { key: 'updatedAt', header: 'Ngày cập nhật' },
            { key: 'nguoi_cap_nhat.ho_ten', header: 'Người cập nhật' },
        ];

        const formattedData = data.map((item: any) => ({
            ...item,
            han_su_dung: item.han_su_dung ? dayjs(item.han_su_dung).format('DD/MM/YYYY') : '',
            updatedAt: item.updatedAt ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm') : '',
        }));

        const csv = convertToCSV(formattedData, columns);
        const filename = `bao_hiem_${dayjs().format('YYYYMMDD')}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: "Loi khi xuat CSV bao hiem", error });
    }
};
