import client from './client';
import type { DinhMucXe, UpsertDinhMucXeRequest } from '../types/dinh-muc-xe';

export const layTatCaDinhMuc = async (): Promise<DinhMucXe[]> => {
    const response = await client.get('/dinh-muc-xe');
    return response.data;
};

export const layDinhMucTheoHocSinh = async (hoc_sinh_id: string): Promise<DinhMucXe> => {
    const response = await client.get(`/dinh-muc-xe/${hoc_sinh_id}`);
    return response.data;
};

export const luuDinhMucXe = async (data: UpsertDinhMucXeRequest): Promise<DinhMucXe> => {
    const response = await client.post('/dinh-muc-xe', data);
    return response.data;
};
