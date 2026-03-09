import { AppDataSource } from "../data-source";
import { DotThanhToan } from "../entities/DotThanhToan";
import { KhoanThanhToan, TrangThaiThanhToan } from "../entities/KhoanThanhToan";
import { HocSinh, TrangThaiHocSinh } from "../entities/HocSinh";
import { SuatAn } from "../entities/SuatAn";
import { DinhMucXe } from "../entities/DinhMucXe";

const getDotRepo = () => AppDataSource.getRepository(DotThanhToan);
const getKhoanRepo = () => AppDataSource.getRepository(KhoanThanhToan);
const getHSRepo = () => AppDataSource.getRepository(HocSinh);
const getSARepo = () => AppDataSource.getRepository(SuatAn);
const getDMXRepo = () => AppDataSource.getRepository(DinhMucXe);

export const ThanhToanService = {
    layTatCaDotThanhToan: async () => {
        return await getDotRepo().find({
            order: { nam: "DESC", thang: "DESC" }
        });
    },

    layDotThanhToanTheoId: async (id: number, user?: any, lop: string | string[] = "") => {
        const dot = await getDotRepo().findOneBy({ id });
        if (!dot) return null;

        const query = getKhoanRepo().createQueryBuilder("khoan")
            .leftJoinAndSelect("khoan.hoc_sinh", "hoc_sinh")
            .leftJoinAndSelect("khoan.nguoi_cap_nhat", "nguoi_cap_nhat")
            .where("khoan.dot_thanh_toan_id = :id", { id });

        // Normalize lop to array
        const filterClasses = Array.isArray(lop) ? lop : (lop ? [lop] : []);

        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (assignedClasses.length > 0) {
                 if (filterClasses.length > 0) {
                     const allowedClasses = filterClasses.filter(c => assignedClasses.includes(c));
                     if (allowedClasses.length === 0) {
                         query.andWhere("1=0");
                     } else {
                         query.andWhere("hoc_sinh.lop IN (:...allowedClasses)", { allowedClasses });
                     }
                 } else {
                     query.andWhere("hoc_sinh.lop IN (:...assignedClasses)", { assignedClasses });
                 }
            } else {
                 // Teacher with no classes sees no records
                 query.andWhere("1=0");
            }
        } else {
             if (filterClasses.length > 0) {
                 query.andWhere("hoc_sinh.lop IN (:...filterClasses)", { filterClasses });
             }
        }

        dot.khoan_thanh_toan = await query.getMany();
        return dot;
    },

    taoMoiDotThanhToan: async (thang: number, nam: number, userId?: number, ghi_chu?: string) => {
        const dotRepo = getDotRepo();
        const khoanRepo = getKhoanRepo();
        const hsRepo = getHSRepo();
        const saRepo = getSARepo();
        const dmxRepo = getDMXRepo();

        // Tao dot thanh toan
        const dot = dotRepo.create({ thang, nam, ghi_chu });
        await dotRepo.save(dot);

        // Lay tat ca hoc sinh dang hoc
        const hoc_sinh_list = await hsRepo.find({ where: { trang_thai: TrangThaiHocSinh.DANG_HOC } });

        const khoan_list: KhoanThanhToan[] = [];

        for (const hoc_sinh of hoc_sinh_list) {
            // Logic tinh toan
            const thangStr = String(thang).padStart(2, '0');
            const patternDate = `${nam}-${thangStr}-%`;

            const soNgayBaoCat = await saRepo
                .createQueryBuilder("record")
                .where("record.hoc_sinh_id = :hoc_sinh_id", { hoc_sinh_id: hoc_sinh.id })
                .andWhere("record.ngay LIKE :pattern", { pattern: patternDate })
                .andWhere("record.bao_cat = :bao_cat", { bao_cat: true })
                .getCount();

            const dinh_muc_xe = await dmxRepo.findOneBy({ hoc_sinh_id: hoc_sinh.id });
            
            // Use stored amount, or fallback to calculation if missing (migration support)
            let tienXe = 0;
            if (dinh_muc_xe) {
                if (dinh_muc_xe.so_tien !== undefined && dinh_muc_xe.so_tien !== null) {
                    tienXe = Number(dmxRepo.getId(dinh_muc_xe) ? dinh_muc_xe.so_tien : 0); // Corrected check
                } else {
                    // Fallback for old records
                    tienXe = (dinh_muc_xe.khoang_cach || 0) * 1000;
                }
            }

            const tienAn = Math.max(0, 1500000 - (soNgayBaoCat * 50000));
            const tongTien = tienAn + tienXe;

            const khoan = khoanRepo.create({
                dot_thanh_toan_id: dot.id,
                hoc_sinh_id: hoc_sinh.id,
                tien_an: tienAn,
                tien_xe: tienXe,
                ho_tro_khac: 0,
                tong_tien: tongTien,
                xa: hoc_sinh.lop,
                trang_thai: TrangThaiThanhToan.CHO_XU_LY,
                nguoi_cap_nhat_id: userId
            });
            khoan_list.push(khoan);
        }

        await khoanRepo.save(khoan_list);
        return dot;
    },
    
    capNhatKhoanThanhToan: async (id: number, data: Partial<KhoanThanhToan>, userId?: number) => {
        const repo = getKhoanRepo();
        const khoan = await repo.findOneBy({ id });
        if (!khoan) return null;
        repo.merge(khoan, { ...data, nguoi_cap_nhat_id: userId });
        return await repo.save(khoan);
    }
};
