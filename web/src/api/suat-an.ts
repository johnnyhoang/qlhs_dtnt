import client from './client';
import type { HocSinhSuatAnStatus, LoaiSuatAn } from '../types/suat-an';

export const layTrangThaiSuatAn = async (params: {
    ngay: string;
    lop?: string;
    search?: string;
}): Promise<HocSinhSuatAnStatus[]> => {
    const response = await client.get('/suat-an/status', { params });
    return response.data;
};

export const baoCatSuatAn = async (data: {
    hoc_sinh_id: string;
    ngay: string;
    loai_suat_an: LoaiSuatAn;
    bao_cat: boolean;
    ghi_chu?: string;
}): Promise<any> => {
    const response = await client.post('/suat-an/toggle', data);
    return response.data;
};
