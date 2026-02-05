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
    createdAt: string;
    updatedAt: string;
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
}

export interface UpdateHocSinhRequest extends Partial<CreateHocSinhRequest> {}

export interface HocSinhListResponse {
    data: HocSinh[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
