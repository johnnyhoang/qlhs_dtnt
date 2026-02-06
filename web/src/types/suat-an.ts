export const LoaiSuatAn = {
    SANG: "SANG",
    TRUA: "TRUA",
    TOI: "TOI"
} as const;

export type LoaiSuatAn = typeof LoaiSuatAn[keyof typeof LoaiSuatAn];

export interface TrangThaiSuatAn {
    SANG: boolean;
    TRUA: boolean;
    TOI: boolean;
    ghi_chu: string;
    lastUpdated?: string;
    updatedBy?: string;
}

export interface HocSinhSuatAnStatus {
    id: string;
    ma_hoc_sinh: string;
    ho_ten: string;
    lop: string;
    suat_an: TrangThaiSuatAn;
}
