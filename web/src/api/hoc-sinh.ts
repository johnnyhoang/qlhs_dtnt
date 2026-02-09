import axiosClient from './client';
import type { HocSinh, CreateHocSinhRequest, UpdateHocSinhRequest, HocSinhListResponse } from '../types/hoc-sinh';

export const layDanhSachHocSinh = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    lop?: string | string[];
}): Promise<HocSinhListResponse> => {
    const response = await axiosClient.get('/hoc-sinh', { params });
    return response.data;
};

export const layHocSinhTheoId = async (id: string): Promise<HocSinh> => {
    const response = await axiosClient.get(`/hoc-sinh/${id}`);
    return response.data;
};

export const taoHocSinh = async (data: CreateHocSinhRequest): Promise<HocSinh> => {
    const response = await axiosClient.post('/hoc-sinh', data);
    return response.data;
};

export const capNhatHocSinh = async (id: string, data: UpdateHocSinhRequest): Promise<HocSinh> => {
    const response = await axiosClient.put(`/hoc-sinh/${id}`, data);
    return response.data;
};

export const xoaHocSinh = async (id: string): Promise<void> => {
    await axiosClient.delete(`/hoc-sinh/${id}`);
};

export const layDanhSachLop = async (): Promise<string[]> => {
    const response = await axiosClient.get('/hoc-sinh/danh-muc-lop');
    return response.data;
};
