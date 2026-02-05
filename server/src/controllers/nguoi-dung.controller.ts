import { Request, Response } from 'express';
import { NguoiDungService } from '../services/nguoi-dung.service';
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
        const { kich_hoat, vai_tro } = req.body;
        
        const repository = AppDataSource.getRepository(NguoiDung);
        const user = await repository.findOne({ where: { id: Number(id) } });
        
        if (!user) return res.status(404).json({ message: 'Khong tim thay nguoi dung' });
        
        if (kich_hoat !== undefined) user.kich_hoat = kich_hoat;
        if (vai_tro !== undefined) user.vai_tro = vai_tro;
        
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
