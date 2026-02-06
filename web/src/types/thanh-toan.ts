import type { HocSinh } from './hoc-sinh';

export interface DotThanhToan {
    id: number;
    thang: number;
    nam: number;
    createdAt: string;
    updatedAt?: string;
    nguoi_cap_nhat?: {
        ho_ten: string;
    };
    ghi_chu?: string;
    khoan_thanh_toan?: KhoanThanhToan[];
}

export interface KhoanThanhToan {
    id: number;
    dot_thanh_toan_id: number;
    hoc_sinh_id: string;
    hoc_sinh?: HocSinh;
    tien_an: number;
    tien_xe: number;
    ho_tro_khac: number;
    tong_tien: number;
    trang_thai: string;
    ngay_chi_tra?: string;
    ghi_chu?: string;
    createdAt?: string;
    updatedAt?: string;
    nguoi_cap_nhat?: {
        ho_ten: string;
    };
}

export interface CreateDotThanhToanRequest {
    thang: number;
    nam: number;
    ghi_chu?: string;
}
