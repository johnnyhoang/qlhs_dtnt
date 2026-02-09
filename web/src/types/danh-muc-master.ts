export const LoaiDanhMuc = {
    NOI_KHAM_BENH: "noi_kham_benh",
    PHUONG_XA: "phuong_xa",
    TINH: "tinh",
    NGAN_HANG: "ngan_hang",
    DAN_TOC: "dan_toc",
    TON_GIAO: "ton_giao",
    LOP: "lop"
} as const;

export type LoaiDanhMuc = typeof LoaiDanhMuc[keyof typeof LoaiDanhMuc];

export const TenLoaiDanhMuc: Record<LoaiDanhMuc, string> = {
    [LoaiDanhMuc.NOI_KHAM_BENH]: "Nơi khám chữa bệnh BHYT",
    [LoaiDanhMuc.PHUONG_XA]: "Phường/Xã",
    [LoaiDanhMuc.TINH]: "Tỉnh/Thành phố",
    [LoaiDanhMuc.NGAN_HANG]: "Ngân hàng",
    [LoaiDanhMuc.DAN_TOC]: "Dân tộc",
    [LoaiDanhMuc.TON_GIAO]: "Tôn giáo",
    [LoaiDanhMuc.LOP]: "Lớp học"
};

export interface DanhMucMaster {
    id: string;
    loai_danh_muc: LoaiDanhMuc;
    ten: string;
    ma?: string;
    danh_muc_cha_id?: string;
    ghi_chu?: string;
    kich_hoat: boolean;
    thu_tu: number;
    createdAt: string;
    updatedAt: string;
    nguoi_cap_nhat?: {
        ho_ten: string;
    };
}

export interface CreateDanhMucRequest {
    loai_danh_muc: LoaiDanhMuc;
    ten: string;
    ma?: string;
    danh_muc_cha_id?: string;
    ghi_chu?: string;
    kich_hoat?: boolean;
    thu_tu?: number;
}

export interface UpdateDanhMucRequest extends Partial<CreateDanhMucRequest> {}

export interface DanhMucListResponse {
    data: DanhMucMaster[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
