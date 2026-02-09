import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { HocSinhService } from '../services/hoc-sinh.service';
import { SuatAnService } from '../services/suat-an.service';
import { DinhMucXeService } from '../services/dinh-muc-xe.service';
import { BaoHiemService } from '../services/bao-hiem.service';
import { ThanhToanService } from '../services/thanh-toan.service';
import { HocSinh, GioiTinh } from '../entities/HocSinh';
import { LoaiSuatAn } from '../entities/SuatAn';

// Helper de doc CSV va chuan hoa header
const getCsvData = (buffer: Buffer) => {
    let cleanBuffer = buffer;
    
    // Loai bo UTF-8 BOM neu co
    if (cleanBuffer[0] === 0xEF && cleanBuffer[1] === 0xBB && cleanBuffer[2] === 0xBF) {
        cleanBuffer = cleanBuffer.slice(3);
    }

    const content = cleanBuffer.toString('utf8');
    
    try {
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_quotes: true
        });

        if (!records || records.length === 0) return null;

        // Normalize keys in the first record to create a mapping or just map each record
        // Since csv-parse returns objects with keys as headers, we need to normalize them
        
        const normalizedData = records.map((record: any) => {
            const newRecord: any = {};
            Object.keys(record).forEach(key => {
                let s = String(key || '').trim().toLowerCase();
                s = s.replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
                newRecord[s] = record[key];
            });
            return newRecord;
        });

        return normalizedData;
    } catch (error) {
        console.error("CSV Parse Error:", error);
        return null;
    }
};

// Map header linh hoat
const mapFields = (item: any, mapping: Record<string, string[]>) => {
    const newItem: any = {};
    for (const [target, variants] of Object.entries(mapping)) {
        for (const [key, value] of Object.entries(item)) {
            const cleanKey = key.toLowerCase();
            if (variants.some(v => cleanKey.includes(v)) || variants.includes(cleanKey)) {
                newItem[target] = value;
                break;
            }
        }
    }
    return newItem;
};

export const nhapTuCsv = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng chọn file CSV" });
        const data = getCsvData(req.file.buffer);
        if (!data) return res.status(400).json({ message: "File không hợp lệ hoặc rỗng" });

        const user = (req as any).user;
        const ket_qua = { thanh_cong: 0, loi: 0, chi_tiet_loi: [] as any[] };

        const fieldMapping = {
            ma_hoc_sinh: ['ma_hoc_sinh', 'ma_hs', 'mahs', 'student_id', 'code'],
            ho_ten: ['ho_ten', 'full_name', 'ten', 'name'],
            lop: ['lop', 'class'],
            ma_moet: ['moet', 'bgd'],
            gioi_tinh: ['gioi_tinh', 'gt', 'gender'],
            cccd: ['cccd', 'id_card']
        };

        for (const rawItem of data) {
            try {
                const item = mapFields(rawItem, fieldMapping);
                let ma_hoc_sinh = String(item.ma_hoc_sinh || '').trim();
                let ho_ten = String(item.ho_ten || '').trim();

                if (ma_hoc_sinh.endsWith('.0')) ma_hoc_sinh = ma_hoc_sinh.slice(0, -2);
                if (!ma_hoc_sinh || !ho_ten || ho_ten.toLowerCase() === 'undefined') {
                    throw new Error(`Thiếu Mã (${ma_hoc_sinh}) hoặc Tên (${ho_ten})`);
                }

                await HocSinhService.upsertByMaHocSinh({
                    ma_hoc_sinh,
                    ho_ten,
                    ma_moet: item.ma_moet ? String(item.ma_moet).trim() : undefined,
                    lop: item.lop ? String(item.lop).trim() : 'N/A',
                    cccd: item.cccd ? String(item.cccd).trim() : undefined,
                    gioi_tinh: String(item.gioi_tinh || '').toLowerCase().includes('nữ') ? GioiTinh.NU : GioiTinh.NAM,
                }, user);
                ket_qua.thanh_cong++;
            } catch (err: any) {
                ket_qua.loi++;
                ket_qua.chi_tiet_loi.push({ error: err.message });
            }
        }
        res.json({ message: `Đã nhập xong học sinh`, data: ket_qua });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

export const nhapSuatAnCsv = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng chọn file CSV" });
        const data = getCsvData(req.file.buffer);
        if (!data) return res.status(400).json({ message: "File rỗng" });

        const user = (req as any).user;
        const { ngay } = req.body; // Cần ngày import hoặc lấy từ file
        const ket_qua = { thanh_cong: 0, loi: 0 };

        const fieldMapping = {
            ma_hoc_sinh: ['ma_hoc_sinh', 'ma_hs', 'mahs'],
            loai: ['loai', 'sang', 'trua', 'toi'],
            bao_cat: ['bao_cat', 'cat_an', 'off'],
            ghi_chu: ['ghi_chu', 'note']
        };

        for (const rawItem of data) {
            try {
                const item = mapFields(rawItem, fieldMapping);
                let ma_hs = String(item.ma_hoc_sinh || '').trim();
                if (ma_hs.endsWith('.0')) ma_hs = ma_hs.slice(0, -2);
                
                const hs = await HocSinhService.getAll(1, 1, "", ma_hs, user); // Search by code
                const hoc_sinh = hs.data.find(h => h.ma_hoc_sinh === ma_hs);
                if (!hoc_sinh) throw new Error("Không tìm thấy học sinh");

                const loai = String(item.loai || 'trưa').toLowerCase().includes('sáng') ? LoaiSuatAn.SANG : 
                             String(item.loai || 'trưa').toLowerCase().includes('tối') ? LoaiSuatAn.TOI : LoaiSuatAn.TRUA;
                
                await SuatAnService.doiTrangThaiBaoCat(
                    hoc_sinh.id, 
                    ngay || new Date().toISOString().split('T')[0], 
                    loai, 
                    item.bao_cat === '1' || String(item.bao_cat).toLowerCase().includes('x'), 
                    user?.id,
                    item.ghi_chu
                );
                ket_qua.thanh_cong++;
            } catch (err) { ket_qua.loi++; }
        }
        res.json({ message: "Đã nhập xong suất ăn", data: ket_qua });
    } catch (error: any) { res.status(500).json({ message: "Lỗi", error: error.message }); }
};

export const nhapDinhMucXeCsv = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng chọn file CSV" });
        const data = getCsvData(req.file.buffer);
        if (!data) return res.status(400).json({ message: "File rỗng" });

        const user = (req as any).user;
        const ket_qua = { thanh_cong: 0, loi: 0 };

        const mapping = {
            ma_hoc_sinh: ['ma_hoc_sinh', 'ma_hs'],
            khoang_cach: ['khoang_cach', 'km'],
            ngan_hang: ['ngan_hang', 'bank'],
            stk: ['stk', 'so_tai_khoan']
        };

        for (const raw of data) {
            try {
                const item = mapFields(raw, mapping);
                let ma_hs = String(item.ma_hoc_sinh || '').trim();
                if (ma_hs.endsWith('.0')) ma_hs = ma_hs.slice(0, -2);
                
                const hs = await HocSinhService.getAll(1, 1, "", ma_hs, user);
                const hoc_sinh = hs.data.find(h => h.ma_hoc_sinh === ma_hs);
                if (!hoc_sinh) throw new Error("N/A");

                await DinhMucXeService.luuDinhMuc(hoc_sinh.id, {
                    khoang_cach: Number(item.khoang_cach || 0),
                    ngan_hang: item.ngan_hang,
                    so_tai_khoan: item.stk
                }, user?.id);
                ket_qua.thanh_cong++;
            } catch (err) { ket_qua.loi++; }
        }
        res.json({ message: "Đã nhập xong định mức xe", data: ket_qua });
    } catch (error: any) { res.status(500).json({ message: "Lỗi", error: error.message }); }
};

export const nhapBaoHiemCsv = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng chọn file CSV" });
        const data = getCsvData(req.file.buffer);
        const user = (req as any).user;
        const ket_qua = { thanh_cong: 0, loi: 0 };

        const mapping = {
            ma_hoc_sinh: ['ma_hoc_sinh', 'ma_hs'],
            so_the: ['so_the', 'bhyt', 'insurance_id'],
            han_dung: ['han_dung', 'expiry']
        };

        for (const raw of data!) {
            try {
                const item = mapFields(raw, mapping);
                let ma_hs = String(item.ma_hoc_sinh || '').trim();
                if (ma_hs.endsWith('.0')) ma_hs = ma_hs.slice(0, -2);
                const hs = await HocSinhService.getAll(1, 1, "", ma_hs, user);
                const hoc_sinh = hs.data.find(h => h.ma_hoc_sinh === ma_hs);
                if (hoc_sinh) {
                    await BaoHiemService.luuHoSo(hoc_sinh.id, {
                        so_the: item.so_the,
                        han_su_dung: item.han_dung
                    }, user?.id);
                    ket_qua.thanh_cong++;
                } else ket_qua.loi++;
            } catch (err) { ket_qua.loi++; }
        }
        res.json({ message: "Đã nhập xong bảo hiểm", data: ket_qua });
    } catch (error: any) { res.status(500).json({ message: "Lỗi", error: error.message }); }
};

export const nhapThanhToanCsv = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng chọn file CSV" });
        const data = getCsvData(req.file.buffer);
        const user = (req as any).user;
        const { dot_id } = req.body;
        const ket_qua = { thanh_cong: 0, loi: 0 };

        const mapping = {
            ma_hoc_sinh: ['ma_hoc_sinh', 'ma_hs'],
            tien_an: ['an', 'meal', 'food'],
            tien_xe: ['xe', 'transport', 'car'],
            trang_thai: ['trang_thai', 'status']
        };

        for (const raw of data!) {
            try {
                const item = mapFields(raw, mapping);
                let ma_hs = String(item.ma_hoc_sinh || '').trim();
                if (ma_hs.endsWith('.0')) ma_hs = ma_hs.slice(0, -2);
                const hs = await HocSinhService.getAll(1, 1, "", ma_hs, user);
                const hoc_sinh = hs.data.find(h => h.ma_hoc_sinh === ma_hs);
                
                if (hoc_sinh && dot_id) {
                    const dot = await ThanhToanService.layDotThanhToanTheoId(Number(dot_id));
                    const khoan = dot?.khoan_thanh_toan.find(k => k.hoc_sinh_id === hoc_sinh.id);
                    if (khoan) {
                        await ThanhToanService.capNhatKhoanThanhToan(khoan.id, {
                            tien_an: Number(item.tien_an || khoan.tien_an),
                            tien_xe: Number(item.tien_xe || khoan.tien_xe),
                            tong_tien: Number(item.tien_an || khoan.tien_an) + Number(item.tien_xe || khoan.tien_xe)
                        }, user?.id);
                        ket_qua.thanh_cong++;
                    } else ket_qua.loi++;
                } else ket_qua.loi++;
            } catch (err) { ket_qua.loi++; }
        }
        res.json({ message: "Đã nhập xong thanh toán", data: ket_qua });
    } catch (error: any) { res.status(500).json({ message: "Lỗi", error: error.message }); }
};

export const nhapDanhMucMasterCsv = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng chọn file CSV" });
        const data = getCsvData(req.file.buffer);
        if (!data) return res.status(400).json({ message: "File rỗng" });

        const user = (req as any).user;
        const { loai_danh_muc } = req.body; // Required: category type
        
        if (!loai_danh_muc) {
            return res.status(400).json({ message: "Thiếu loại danh mục (loai_danh_muc)" });
        }

        const ket_qua = { thanh_cong: 0, loi: 0, chi_tiet_loi: [] as any[] };

        const mapping = {
            ten: ['ten', 'name', 'title'],
            ma: ['ma', 'code'],
            ghi_chu: ['ghi_chu', 'note', 'notes'],
            thu_tu: ['thu_tu', 'order', 'sort_order']
        };

        const items = [];
        for (const raw of data) {
            try {
                const item = mapFields(raw, mapping);
                const ten = String(item.ten || '').trim();
                
                if (!ten) {
                    throw new Error("Thiếu tên danh mục");
                }

                items.push({
                    ten,
                    ma: item.ma ? String(item.ma).trim() : undefined,
                    ghi_chu: item.ghi_chu ? String(item.ghi_chu).trim() : undefined,
                    thu_tu: item.thu_tu ? Number(item.thu_tu) : 0,
                    kich_hoat: true
                });
            } catch (err: any) {
                ket_qua.loi++;
                ket_qua.chi_tiet_loi.push({ error: err.message, row: raw });
            }
        }

        // Batch upsert
        const { DanhMucMasterService } = await import('../services/danh-muc-master.service');
        await DanhMucMasterService.upsertBatch(loai_danh_muc, items, user?.id);
        ket_qua.thanh_cong = items.length;

        res.json({ message: `Đã nhập xong danh mục ${loai_danh_muc}`, data: ket_qua });
    } catch (error: any) { 
        res.status(500).json({ message: "Lỗi", error: error.message }); 
    }
};
