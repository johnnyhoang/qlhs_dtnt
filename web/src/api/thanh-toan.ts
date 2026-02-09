import client from './client';
import type { DotThanhToan, CreateDotThanhToanRequest } from '../types/thanh-toan';

export const layDanhSachDotThanhToan = async (): Promise<DotThanhToan[]> => {
    const response = await client.get('/thanh-toan/batches');
    return response.data;
};

export const layChiTietDotThanhToan = async (id: number, lop?: string | string[]): Promise<DotThanhToan> => {
    const response = await client.get(`/thanh-toan/batches/${id}`, { params: { lop } });
    return response.data;
};

export const taoDotThanhToanMoi = async (data: CreateDotThanhToanRequest): Promise<DotThanhToan> => {
    const response = await client.post('/thanh-toan/batches/generate', data);
    return response.data;
};
