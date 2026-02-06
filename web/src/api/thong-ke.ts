import client from './client';
import type { MealCutoffWeeklyReport, MonthlyMealStats, TransportStatsReport } from '../types/thong-ke';

export const layThongKeSuatAnCatTheoLopVaNgay = async (startDate: string, endDate: string): Promise<MealCutoffWeeklyReport> => {
    const response = await client.get('/thong-ke/suat-an/cat-theo-lop-va-ngay', {
        params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
};

export const layThongKeSuatAnTheoThang = async (month: number, year: number): Promise<MonthlyMealStats> => {
    const response = await client.get('/thong-ke/suat-an/thang', {
        params: { month, year }
    });
    return response.data;
};

export const layThongKeVanChuyenTheoLop = async (startDate?: string, endDate?: string): Promise<TransportStatsReport> => {
    const response = await client.get('/thong-ke/van-chuyen/theo-lop', {
        params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
};
