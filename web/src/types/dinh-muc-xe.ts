import type { HocSinh } from './hoc-sinh';

export interface DinhMucXe {
    id: number;
    hoc_sinh_id: string;
    hoc_sinh?: HocSinh;
    so_tai_khoan?: string;
    ngan_hang?: string;
    dia_chi_xa_moi?: string;
    xa_huong_tro_cap?: string;
    khoang_cach?: number;
    ten_diem_dung?: string;
    phuong_tien?: string;
    createdAt?: string;
    updatedAt?: string;
    nguoi_cap_nhat?: {
        ho_ten: string;
    };
}

export interface UpsertDinhMucXeRequest extends Partial<Omit<DinhMucXe, 'id' | 'hoc_sinh'>> {
    hoc_sinh_id: string;
}
