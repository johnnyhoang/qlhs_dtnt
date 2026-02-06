import type { HocSinh } from './hoc-sinh';

export interface BaoHiem {
    id: number;
    hoc_sinh_id: string;
    hoc_sinh?: HocSinh;
    ma_doi_tuong?: string;
    so_the?: string;
    noi_dang_ky?: string;
    han_su_dung?: string;
    dia_chi?: string;
    thong_tin_sai?: string;
    thong_tin_dung?: string;
    da_nop_anh: boolean;
    ly_do_anh?: string;
    tra_cuu_vssid?: string;
    ngay_du_5_nam?: string;
    ghi_chu?: string;
    createdAt?: string;
    updatedAt?: string;
    nguoi_cap_nhat?: {
        ho_ten: string;
    };
}

export interface UpsertBaoHiemRequest extends Partial<Omit<BaoHiem, 'id' | 'hoc_sinh'>> {
    hoc_sinh_id: string;
}
