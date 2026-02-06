import { Request, Response } from 'express';
import * as xlsx from 'xlsx';
import { HocSinhService } from '../services/hoc-sinh.service';
import { HocSinh, GioiTinh } from '../entities/HocSinh';

export const nhapTuCsv = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn file CSV" });
        }

        // Su dung xlsx de doc buffer (xlsx ho tro ca CSV)
        console.log(`[BACKEND] CSV Import: Received file "${req.file.originalname}" (${req.file.size} bytes)`);
        
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(worksheet) as any[];

        console.log(`[BACKEND] CSV Import: workbook.SheetNames =`, workbook.SheetNames);
        console.log(`[BACKEND] CSV Import: rawData has ${rawData.length} rows`);

        if (rawData.length === 0) {
            console.warn(`[BACKEND] CSV Import: No data found in file or sheet.`);
            return res.status(400).json({ message: "File CSV không có dữ liệu hoặc định dạng không hợp lệ" });
        }

        // Chuan hoa key (xu ly BOM, khoang trang, mapping tieng Viet)
        const data = rawData.map((row, index) => {
            const newRow: any = {};
            if (index === 0) console.log(`[BACKEND] CSV Import: Normalizing row 0 keys:`, Object.keys(row));
            for (const key of Object.keys(row)) {
                let normKey = key.trim().replace(/^\ufeff/, '').toLowerCase();
                
                // Mapping cac truong quan trong
                if (['mã học sinh', 'ma_hoc_sinh', 'mã hs', 'mahs'].includes(normKey)) normKey = 'ma_hoc_sinh';
                else if (['họ tên', 'ho_ten', 'họ và tên', 'hoten'].includes(normKey)) normKey = 'ho_ten';
                else if (['lớp', 'lop', 'ten_lop'].includes(normKey)) normKey = 'lop';
                else if (['mã moet', 'ma_moet', 'moet'].includes(normKey)) normKey = 'ma_moet';
                else if (['giới tính', 'gioi_tinh', 'gt', 'gender'].includes(normKey)) normKey = 'gioi_tinh';
                else if (['ngày sinh', 'ngay_sinh', 'ngaysinh', 'birth'].includes(normKey)) normKey = 'ngay_sinh';
                else if (['cccd', 'so_the', 'id_card'].includes(normKey)) normKey = 'cccd';

                newRow[normKey] = row[key];
            }
            return newRow;
        });

        console.log(`[BACKEND] CSV Import: Data normalized for ${data.length} rows.`);

        const ket_qua = {
            thanh_cong: 0,
            loi: 0,
            chi_tiet_loi: [] as any[]
        };

        for (const item of data) {
            try {
                // Mapping thong tin tu CSV sang entity HocSinh
                let ma_hoc_sinh = String(item.ma_hoc_sinh || '').trim();
                let ho_ten = String(item.ho_ten || '').trim();

                // Xu ly ma_hoc_sinh neu bi doc thanh float (vi du 123.0)
                if (ma_hoc_sinh.endsWith('.0')) {
                    ma_hoc_sinh = ma_hoc_sinh.substring(0, ma_hoc_sinh.length - 2);
                }

                if (!ma_hoc_sinh || !ho_ten || ho_ten === 'undefined' || ma_hoc_sinh === 'undefined' || ho_ten === '' || ma_hoc_sinh === '') {
                    throw new Error(`Thiếu hoặc sai thông tin bắt buộc (Mã: "${ma_hoc_sinh}", Tên: "${ho_ten}")`);
                }

                const thong_tin_hoc_sinh: Partial<HocSinh> = {
                    ma_hoc_sinh,
                    ho_ten,
                    ma_moet: item.ma_moet ? String(item.ma_moet).trim() : undefined,
                    lop: item.lop && String(item.lop).trim() !== '' ? String(item.lop).trim() : 'N/A',
                    cccd: item.cccd ? String(item.cccd).trim() : undefined,
                    gioi_tinh: String(item.gioi_tinh || '').toLowerCase() === 'nữ' ? GioiTinh.NU : GioiTinh.NAM,
                };

                await HocSinhService.upsertByMaHocSinh(thong_tin_hoc_sinh);
                ket_qua.thanh_cong++;
            } catch (err: any) {
                console.error(`[BACKEND] CSV Import Error on item:`, item, `| Error:`, err.message);
                ket_qua.loi++;
                ket_qua.chi_tiet_loi.push({ 
                    item_ma: item.ma_hoc_sinh || 'N/A', 
                    item_ten: item.ho_ten || 'N/A', 
                    error: err.message 
                });
            }
        }

        console.log(`[BACKEND] CSV Import Finished: ${ket_qua.thanh_cong} success, ${ket_qua.loi} errors`);

        res.json({
            message: `Đã nhập xong: ${ket_qua.thanh_cong} thành công, ${ket_qua.loi} lỗi`,
            data: ket_qua
        });
    } catch (error: any) {
        console.error("[BACKEND] CSV Import Global Fatal Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi nhập dữ liệu từ CSV", error: error.message });
    }
};
