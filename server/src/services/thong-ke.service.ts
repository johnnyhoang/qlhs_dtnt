import { AppDataSource } from "../data-source";
import { SuatAn, LoaiSuatAn } from "../entities/SuatAn";
import { HocSinh, TrangThaiHocSinh } from "../entities/HocSinh";
import { DinhMucXe } from "../entities/DinhMucXe";
import { Between, In } from "typeorm";

const suatAnRepository = AppDataSource.getRepository(SuatAn);
const hocSinhRepository = AppDataSource.getRepository(HocSinh);
const dinhMucXeRepository = AppDataSource.getRepository(DinhMucXe);

export const ThongKeService = {
    // Thống kê cắt phần ăn theo lớp và ngày
    getMealCutoffByClassAndWeek: async (startDate: string, endDate: string, user?: any) => {
        const where: any = { trang_thai: TrangThaiHocSinh.DANG_HOC };

        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (assignedClasses.length === 0) {
                 return { start_date: startDate, end_date: endDate, dates: [], data: [] };
            }
            where.lop = In(assignedClasses);
        }

        // Get all active students
        const students = await hocSinhRepository.find({
            where,
            order: { lop: "ASC", ho_ten: "ASC" }
        });

        // Get all meal records for the date range
        const mealRecords = await suatAnRepository.find({
            where: {
                ngay: Between(startDate, endDate),
                bao_cat: true
            }
        });

        // Group students by class
        const classeMap = new Map<string, any[]>();
        students.forEach(student => {
            if (!classeMap.has(student.lop)) {
                classeMap.set(student.lop, []);
            }
            classeMap.get(student.lop)!.push(student);
        });

        // Generate date range
        const dates: string[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
        }

        // Build result structure
        const result = Array.from(classeMap.entries()).map(([lop, students]) => {
            const days: any = {};
            
            dates.forEach(date => {
                const studentIds = students.map(s => s.id);
                const dayRecords = mealRecords.filter(r => 
                    r.ngay === date && studentIds.includes(r.hoc_sinh_id)
                );

                days[date] = {
                    sang: dayRecords.filter(r => r.loai_suat_an === LoaiSuatAn.SANG).length,
                    trua: dayRecords.filter(r => r.loai_suat_an === LoaiSuatAn.TRUA).length,
                    toi: dayRecords.filter(r => r.loai_suat_an === LoaiSuatAn.TOI).length
                };
            });

            return { lop, days, total_students: students.length };
        });

        return {
            start_date: startDate,
            end_date: endDate,
            dates,
            data: result
        };
    },

    // Thống kê suất ăn theo tháng
    getMonthlyMealStatistics: async (month: number, year: number, user?: any) => {
        // Calculate date range for the month
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const whereStudent: any = { trang_thai: TrangThaiHocSinh.DANG_HOC };
        const whereMeal: any = {
            ngay: Between(startDate, endDate),
            bao_cat: true
        };

        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (assignedClasses.length === 0) {
                 return {
                    month, year, total_students: 0, total_meal_days: 0, total_possible_meals: 0,
                    total_meals_cut: 0, total_meals_served: 0,
                    by_meal_type: {
                        sang: { possible: 0, cut: 0, served: 0 },
                        trua: { possible: 0, cut: 0, served: 0 },
                        toi: { possible: 0, cut: 0, served: 0 }
                    }
                 };
            }
            whereStudent.lop = In(assignedClasses);
            // Meal records also implicitly filtered because we only count cuts if they exist, 
            // but strict filtering on meal query is better performance-wise if possible, 
            // though suat_an doesn't have direct 'lop' column, need to join or subquery.
            // For simplicity and since we control student count, let's just count cuts 
            // that belong to students in these classes.
            // Or use query builder to join.
        }

        // Get total active students
        const totalStudents = await hocSinhRepository.count({
            where: whereStudent
        });

        // Count working days (excluding weekends)
        let workingDays = 0;
        for (let d = 1; d <= lastDay; d++) {
            const date = new Date(year, month - 1, d);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
                workingDays++;
            }
        }

        // Get all meal cut records for the month
        let cutRecords: SuatAn[] = [];
        if (user && user.vai_tro === "TEACHER") {
             const assignedClasses: string[] = user.lop_phu_trach || [];
             if (assignedClasses.length > 0) {
                 cutRecords = await suatAnRepository.createQueryBuilder("suat_an")
                    .innerJoin("hoc_sinh", "hs", "hs.id = suat_an.hoc_sinh_id")
                    .where("suat_an.ngay BETWEEN :startDate AND :endDate", { startDate, endDate })
                    .andWhere("suat_an.bao_cat = :bao_cat", { bao_cat: true })
                    .andWhere("hs.lop IN (:...assignedClasses)", { assignedClasses })
                    .getMany();
             }
        } else {
             cutRecords = await suatAnRepository.find({
                where: {
                    ngay: Between(startDate, endDate),
                    bao_cat: true
                }
            });
        }

        // Calculate statistics by meal type
        const sangCuts = cutRecords.filter(r => r.loai_suat_an === LoaiSuatAn.SANG).length;
        const truaCuts = cutRecords.filter(r => r.loai_suat_an === LoaiSuatAn.TRUA).length;
        const toiCuts = cutRecords.filter(r => r.loai_suat_an === LoaiSuatAn.TOI).length;

        const totalPossibleMeals = totalStudents * workingDays;
        
        return {
            month,
            year,
            total_students: totalStudents,
            total_meal_days: workingDays,
            total_possible_meals: totalPossibleMeals,
            total_meals_cut: sangCuts + truaCuts + toiCuts,
            total_meals_served: (totalPossibleMeals * 3) - (sangCuts + truaCuts + toiCuts),
            by_meal_type: {
                sang: { 
                    possible: totalPossibleMeals,
                    cut: sangCuts, 
                    served: totalPossibleMeals - sangCuts 
                },
                trua: { 
                    possible: totalPossibleMeals,
                    cut: truaCuts, 
                    served: totalPossibleMeals - truaCuts 
                },
                toi: { 
                    possible: totalPossibleMeals,
                    cut: toiCuts, 
                    served: totalPossibleMeals - toiCuts 
                }
            }
        };
    },

    // Thống kê vận chuyển theo lớp
    getTransportStatisticsByClass: async (startDate: string = "", endDate: string = "", user?: any) => {
        const where: any = { trang_thai: TrangThaiHocSinh.DANG_HOC };

        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (assignedClasses.length === 0) {
                 return { data: [], summary: { total_students: 0, total_with_support: 0, total_distance: 0, total_amount: 0 }};
            }
            where.lop = In(assignedClasses);
        }

        const students = await hocSinhRepository.find({
            where,
            order: { lop: "ASC" }
        });

        // Get transport records only for filtered students
        const studentIds = students.map(s => s.id);
        let transportRecords: DinhMucXe[] = [];
        
        if (studentIds.length > 0) {
            transportRecords = await dinhMucXeRepository.createQueryBuilder("dinh_muc_xe")
                .where("dinh_muc_xe.hoc_sinh_id IN (:...studentIds)", { studentIds })
                .getMany();
        }

        // Group by class
        const classMap = new Map<string, any>();
        students.forEach(student => {
            if (!classMap.has(student.lop)) {
                classMap.set(student.lop, {
                    lop: student.lop,
                    total_students: 0,
                    students_with_support: 0,
                    total_distance: 0,
                    total_amount: 0
                });
            }
            const classData = classMap.get(student.lop)!;
            classData.total_students++;

            const transport = transportRecords.find(t => t.hoc_sinh_id === student.id);
            if (transport && Number(transport.khoang_cach) > 0) {
                classData.students_with_support++;
                classData.total_distance += Number(transport.khoang_cach);
                classData.total_amount += Number(transport.khoang_cach) * 1000;
            }
        });

        const summaryRecords = transportRecords.filter(t => Number(t.khoang_cach) > 0);

        return {
            data: Array.from(classMap.values()),
            summary: {
                total_students: students.length,
                total_with_support: summaryRecords.length,
                total_distance: summaryRecords.reduce((sum, t) => sum + Number(t.khoang_cach || 0), 0),
                total_amount: summaryRecords.reduce((sum, t) => sum + (Number(t.khoang_cach || 0) * 1000), 0)
            }
        };
    }
};
