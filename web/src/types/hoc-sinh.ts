export const GioiTinh = {
    NAM: "NAM",
    NU: "NU",
    KHAC: "KHAC"
} as const;

export type GioiTinh = typeof GioiTinh[keyof typeof GioiTinh];

export const TrangThaiHocSinh = {
    DANG_HOC: "DANG_HOC",
    DA_NGHI: "DA_NGHI"
} as const;

export type TrangThaiHocSinh = typeof TrangThaiHocSinh[keyof typeof TrangThaiHocSinh];

export interface HocSinh {
    id: string;
    ma_hoc_sinh: string;
    ma_moet?: string;
    cccd?: string;
    ho_ten: string;
    lop: string;
    ngay_sinh?: string | Date;
    gioi_tinh?: GioiTinh;
    trang_thai: TrangThaiHocSinh;
    // Address Information
    dia_chi?: string;
    phuong_xa?: string;
    tinh?: string;
    // Banking Information
    so_tai_khoan?: string;
    ngan_hang?: string;
    // Personal Information
    dan_toc?: string;
    ton_giao?: string;
    so_dien_thoai?: string;
    // Additional Information
    ghi_chu?: string;
    ly_lich?: string;
    createdAt: string;
    updatedAt: string;
    nguoi_cap_nhat?: {
        ho_ten: string;
    };
}

export interface CreateHocSinhRequest {
    ma_hoc_sinh: string;
    ma_moet?: string;
    cccd?: string;
    ho_ten: string;
    lop: string;
    ngay_sinh?: string | Date;
    gioi_tinh?: GioiTinh;
    trang_thai?: TrangThaiHocSinh;
    // Address Information
    dia_chi?: string;
    phuong_xa?: string;
    tinh?: string;
    // Banking Information
    so_tai_khoan?: string;
    ngan_hang?: string;
    // Personal Information
    dan_toc?: string;
    ton_giao?: string;
    so_dien_thoai?: string;
    // Additional Information
    ghi_chu?: string;
    ly_lich?: string;
}

export interface UpdateHocSinhRequest extends Partial<CreateHocSinhRequest> {}

export interface HocSinhListResponse {
    data: HocSinh[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
