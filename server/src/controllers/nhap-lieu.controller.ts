import { Request, Response } from 'express';
import * as xlsx from 'xlsx';
import { HocSinhService } from '../services/hoc-sinh.service';
import { HocSinh, GioiTinh } from '../entities/HocSinh';

export const nhapTuExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui long chon file Excel" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet) as any[];

        const ket_qua = {
            thanh_cong: 0,
            loi: 0,
            chi_tiet_loi: [] as any[]
        };

        for (const item of data) {
            try {
                // Mapping thong tin tu Excel sang entity HocSinh
                const thong_tin_hoc_sinh: Partial<HocSinh> = {
                    ma_hoc_sinh: String(item['Mã học sinh'] || item['ma_hoc_sinh'] || ''),
                    ma_moet: String(item['Mã MOET'] || item['ma_moet'] || ''),
                    ho_ten: String(item['Họ tên'] || item['ho_ten'] || ''),
                    lop: String(item['Lớp'] || item['lop'] || ''),
                    gioi_tinh: item['Giới tính'] === 'Nữ' ? GioiTinh.NU : GioiTinh.NAM,
                    // Them cac truong khac neu can
                };

                if (thong_tin_hoc_sinh.ma_hoc_sinh && thong_tin_hoc_sinh.ho_ten) {
                    await HocSinhService.create(thong_tin_hoc_sinh);
                    ket_qua.thanh_cong++;
                } else {
                    throw new Error("Thieu thong tin bat buoc (Ma hoc sinh hoặc Họ tên)");
                }
            } catch (err: any) {
                ket_qua.loi++;
                ket_qua.chi_tiet_loi.push({ item, error: err.message });
            }
        }

        res.json({
            message: `Da nhap xong: ${ket_qua.thanh_cong} thanh cong, ${ket_qua.loi} loi`,
            data: ket_qua
        });
    } catch (error) {
        res.status(500).json({ message: "Loi khi nhap du lieu tu Excel", error });
    }
};
