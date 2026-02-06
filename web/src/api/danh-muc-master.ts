import client from './client';
import type { DanhMucMaster, CreateDanhMucRequest, UpdateDanhMucRequest, DanhMucListResponse, LoaiDanhMuc } from '../types/danh-muc-master';

export const layDanhSachDanhMuc = async (params?: {
    page?: number;
    pageSize?: number;
    loai_danh_muc?: string;
    search?: string;
}): Promise<DanhMucListResponse> => {
    const response = await client.get('/danh-muc-master', { params });
    return response.data;
};

export const layDanhMucTheoLoai = async (loai: LoaiDanhMuc): Promise<DanhMucMaster[]> => {
    const response = await client.get(`/danh-muc-master/category/${loai}`);
    return response.data;
};

export const layDanhMucTheoId = async (id: string): Promise<DanhMucMaster> => {
    const response = await client.get(`/danh-muc-master/${id}`);
    return response.data;
};

export const taoDanhMuc = async (data: CreateDanhMucRequest): Promise<DanhMucMaster> => {
    const response = await client.post('/danh-muc-master', data);
    return response.data;
};

export const capNhatDanhMuc = async (id: string, data: UpdateDanhMucRequest): Promise<DanhMucMaster> => {
    const response = await client.put(`/danh-muc-master/${id}`, data);
    return response.data;
};

export const xoaDanhMuc = async (id: string): Promise<void> => {
    await client.delete(`/danh-muc-master/${id}`);
};
