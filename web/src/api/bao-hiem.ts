import client from './client';
import type { BaoHiem, UpsertBaoHiemRequest } from '../types/bao-hiem';

export const layDanhSachBaoHiem = async (lop?: string | string[]): Promise<BaoHiem[]> => {
    const response = await client.get('/bao-hiem', { params: { lop } });
    return response.data;
};

export const layBaoHiemTheoHocSinh = async (hoc_sinh_id: string): Promise<BaoHiem> => {
    const response = await client.get(`/bao-hiem/${hoc_sinh_id}`);
    return response.data;
};

export const luuHoSoBaoHiem = async (data: UpsertBaoHiemRequest): Promise<BaoHiem> => {
    const response = await client.post('/bao-hiem', data);
    return response.data;
};
