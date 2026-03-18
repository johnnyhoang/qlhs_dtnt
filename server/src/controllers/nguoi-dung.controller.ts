import { Request, Response } from 'express';
import { NguoiDungService } from '../services/nguoi-dung.service';
import { convertToCSV } from '../utils/csv.util';
import dayjs from 'dayjs';
import { AppDataSource } from '../data-source';
import { NguoiDung } from '../entities/NguoiDung';

export const layDanhSachNguoiDung = async (req: Request, res: Response) => {
    try {
        const users = await NguoiDungService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Loi khi lay danh sach nguoi dung' });
    }
};

export const capNhatTrangThaiNguoiDung = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { kich_hoat, vai_tro, ho_ten, ghi_chu } = req.body;
        
        const repository = AppDataSource.getRepository(NguoiDung);
        const user = await repository.findOne({ where: { id: Number(id) } });
        
        if (!user) return res.status(404).json({ message: 'Khong tim thay nguoi dung' });
        
        if (kich_hoat !== undefined) user.kich_hoat = kich_hoat;
        if (vai_tro !== undefined) user.vai_tro = vai_tro;
        if (ho_ten !== undefined) user.ho_ten = ho_ten;
        if (ghi_chu !== undefined) user.ghi_chu = ghi_chu;
        
        await repository.save(user);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Loi khi cap nhat nguoi dung' });
    }
};

export const capNhatPhanQuyen = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;
        
        await NguoiDungService.updatePermissions(Number(id), permissions);
        res.json({ message: 'Cap nhat phan quyen thanh cong' });
    } catch (error) {
        res.status(500).json({ message: 'Loi khi cap nhat phan quyen' });
    }
};

export const capNhatLopPhuTrach = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { lop_phu_trach } = req.body;
        
        await NguoiDungService.updateClassAssignments(Number(id), lop_phu_trach);
        res.json({ message: 'Cap nhat lop phu trach thanh cong' });
    } catch (error) {
        res.status(500).json({ message: 'Loi khi cap nhat lop phu trach' });
    }
};

export const xuatCSVNguoiDung = async (req: Request, res: Response) => {
    try {
        const data = await NguoiDungService.getAllUsers();

        const columns = [
            { key: 'ho_ten', header: 'Họ và tên' },
            { key: 'email', header: 'Email' },
            { key: 'vai_tro', header: 'Vai trò' },
            { key: 'kich_hoat', header: 'Trạng thái' },
            { key: 'lop_phu_trach', header: 'Lớp phụ trách' },
            { key: 'updatedAt', header: 'Ngày cập nhật' },
        ];

        const formattedData = data.map((item: any) => ({
            ...item,
            kich_hoat: item.kich_hoat ? 'Hoạt động' : 'Khóa',
            lop_phu_trach: Array.isArray(item.lop_phu_trach) ? item.lop_phu_trach.join(', ') : '',
            updatedAt: item.updatedAt ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm') : '',
        }));

        const csv = convertToCSV(formattedData, columns);
        const filename = `nguoi_dung_${dayjs().format('YYYYMMDD')}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: "Loi khi xuat CSV nguoi dung", error });
    }
};
