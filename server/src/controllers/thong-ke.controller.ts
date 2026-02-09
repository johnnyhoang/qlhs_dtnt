import { Request, Response } from 'express';
import { ThongKeService } from '../services/thong-ke.service';

export const layThongKeSuatAnCatTheoLopVaNgay = async (req: Request, res: Response) => {
    try {
        const start_date = req.query.start_date as string;
        const end_date = req.query.end_date as string;

        if (!start_date || !end_date) {
            return res.status(400).json({ message: "Thiếu start_date hoặc end_date" });
        }

        const user = (req as any).user;
        const result = await ThongKeService.getMealCutoffByClassAndWeek(start_date, end_date, user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay thong ke suat an", error });
    }
};

export const layThongKeSuatAnTheoThang = async (req: Request, res: Response) => {
    try {
        const month = Number(req.query.month);
        const year = Number(req.query.year);

        if (!month || !year) {
            return res.status(400).json({ message: "Thiếu month hoặc year" });
        }

        const user = (req as any).user;
        const classes = req.query.classes ? (req.query.classes as string).split(',') : [];
        const result = await ThongKeService.getMonthlyMealStatistics(month, year, user, classes);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay thong ke suat an thang", error });
    }
};

export const layThongKeVanChuyenTheoLop = async (req: Request, res: Response) => {
    try {
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;
        const user = (req as any).user;
        const classes = req.query.classes ? (req.query.classes as string).split(',') : [];

        const result = await ThongKeService.getTransportStatisticsByClass(startDate, endDate, user, classes);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Loi khi lay thong ke van chuyen", error });
    }
};
