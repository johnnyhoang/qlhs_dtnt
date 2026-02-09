import client from './client';

export interface PhanQuyen {
    id: number;
    ma_module: string;
    co_quyen_xem: boolean;
    co_quyen_sua: boolean;
}

export interface NguoiDung {
    id: number;
    email: string;
    ho_ten: string;
    vai_tro: 'ADMIN' | 'USER' | 'TEACHER';
    lop_phu_trach?: string[];
    anh_dai_dien?: string;
    kich_hoat: boolean;
    danh_sach_quyen?: PhanQuyen[];
}

export const googleLogin = async (idToken: string) => {
    const response = await client.post('/auth/google-login', { idToken });
    return response.data;
};

export const getMe = async () => {
    const response = await client.get('/auth/me');
    return response.data;
};
