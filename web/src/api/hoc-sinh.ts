import client from './client';
import type { HocSinh, CreateHocSinhRequest, UpdateHocSinhRequest, HocSinhListResponse } from '../types/hoc-sinh';

export const layDanhSachHocSinh = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    lop?: string;
}): Promise<HocSinhListResponse> => {
    const response = await client.get('/hoc-sinh', { params });
    return response.data;
};

export const layHocSinhTheoId = async (id: string): Promise<HocSinh> => {
    const response = await client.get(`/hoc-sinh/${id}`);
    return response.data;
};

export const taoHocSinh = async (data: CreateHocSinhRequest): Promise<HocSinh> => {
    const response = await client.post('/hoc-sinh', data);
    return response.data;
};

export const capNhatHocSinh = async (id: string, data: UpdateHocSinhRequest): Promise<HocSinh> => {
    const response = await client.put(`/hoc-sinh/${id}`, data);
    return response.data;
};

export const xoaHocSinh = async (id: string): Promise<void> => {
    await client.delete(`/hoc-sinh/${id}`);
};
