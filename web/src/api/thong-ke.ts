import axiosClient from './client';
import type { MealCutoffWeeklyReport, MonthlyMealStats, TransportStatsReport } from '../types/thong-ke';

// Thống kê cắt phần ăn theo lớp và ngày
export const layThongKeSuatAnCatTheoLopVaNgay = async (startDate: string, endDate: string, classes: string[] = []) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (classes.length > 0) params.append('classes', classes.join(','));
    const response = await axiosClient.get(`/thong-ke/suat-an-cat-lop-ngay?${params.toString()}`);
    return response.data;
};

// Thống kê suất ăn theo tháng
export const layThongKeSuatAnTheoThang = async (month: number, year: number, classes: string[] = []) => {
    const params = new URLSearchParams({ month: String(month), year: String(year) });
    if (classes.length > 0) params.append('classes', classes.join(','));
    const response = await axiosClient.get(`/thong-ke/suat-an-thang?${params.toString()}`);
    return response.data;
};

// Thống kê vận chuyển theo lớp
export const layThongKeVanChuyenTheoLop = async (startDate?: string, endDate?: string, classes: string[] = []) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (classes.length > 0) params.append('classes', classes.join(','));
    
    const response = await axiosClient.get(`/thong-ke/van-chuyen-lop?${params.toString()}`);
    return response.data;
};
