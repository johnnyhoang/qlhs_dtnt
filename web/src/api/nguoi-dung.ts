import client from './client';
import { NguoiDung, PhanQuyen } from './auth';

export const layDanhSachNguoiDung = async (): Promise<NguoiDung[]> => {
    const response = await client.get('/nguoi-dung');
    return response.data;
};

export const capNhatTrangThaiNguoiDung = async (id: number, data: Partial<NguoiDung>) => {
    const response = await client.patch(`/nguoi-dung/${id}`, data);
    return response.data;
};

export const capNhatPhanQuyen = async (id: number, permissions: Partial<PhanQuyen>[]) => {
    const response = await client.post(`/nguoi-dung/${id}/phan-quyen`, { permissions });
    return response.data;
};
