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
                const ma_hoc_sinh = String(item['Mã học sinh'] || item['ma_hoc_sinh'] || '').trim();
                const ho_ten = String(item['Họ tên'] || item['ho_ten'] || '').trim();

                if (!ma_hoc_sinh || !ho_ten) {
                    throw new Error("Thiếu thông tin bắt buộc (Mã học sinh hoặc Họ tên)");
                }

                const thong_tin_hoc_sinh: Partial<HocSinh> = {
                    ma_hoc_sinh,
                    ho_ten,
                    ma_moet: item['Mã MOET'] || item['ma_moet'] ? String(item['Mã MOET'] || item['ma_moet']).trim() : undefined,
                    lop: item['Lớp'] || item['lop'] ? String(item['Lớp'] || item['lop']).trim() : undefined,
                    cccd: item['CCCD'] || item['cccd'] ? String(item['CCCD'] || item['cccd']).trim() : undefined,
                    gioi_tinh: String(item['Giới tính'] || item['gioi_tinh'] || '').toLowerCase() === 'nữ' ? GioiTinh.NU : GioiTinh.NAM,
                };

                // Xu ly ngay sinh (neu co)
                const raw_ngay_sinh = item['Ngày sinh'] || item['ngay_sinh'];
                if (raw_ngay_sinh) {
                    const date = new Date(raw_ngay_sinh);
                    if (!isNaN(date.getTime())) {
                        thong_tin_hoc_sinh.ngay_sinh = date;
                    }
                }

                await HocSinhService.upsertByMaHocSinh(thong_tin_hoc_sinh);
                ket_qua.thanh_cong++;
            } catch (err: any) {
                ket_qua.loi++;
                ket_qua.chi_tiet_loi.push({ item, error: err.message });
            }
        }

        res.json({
            message: `Đã nhập xong: ${ket_qua.thanh_cong} thành công, ${ket_qua.loi} lỗi`,
            data: ket_qua
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi nhập dữ liệu từ Excel", error });
    }
};
