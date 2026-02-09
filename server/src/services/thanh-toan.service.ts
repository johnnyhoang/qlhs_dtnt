import { AppDataSource } from "../data-source";
import { DotThanhToan } from "../entities/DotThanhToan";
import { KhoanThanhToan, TrangThaiThanhToan } from "../entities/KhoanThanhToan";
import { HocSinh, TrangThaiHocSinh } from "../entities/HocSinh";
import { SuatAn } from "../entities/SuatAn";
import { DinhMucXe } from "../entities/DinhMucXe";

const dotThanhToanRepository = AppDataSource.getRepository(DotThanhToan);
const khoanThanhToanRepository = AppDataSource.getRepository(KhoanThanhToan);
const hocSinhRepository = AppDataSource.getRepository(HocSinh);
const suatAnRepository = AppDataSource.getRepository(SuatAn);
const dinhMucXeRepository = AppDataSource.getRepository(DinhMucXe);

export const ThanhToanService = {
    layTatCaDotThanhToan: async () => {
        return await dotThanhToanRepository.find({
            order: { nam: "DESC", thang: "DESC" }
        });
    },

    layDotThanhToanTheoId: async (id: number, user?: any) => {
        const dot = await dotThanhToanRepository.findOneBy({ id });
        if (!dot) return null;

        const query = khoanThanhToanRepository.createQueryBuilder("khoan")
            .leftJoinAndSelect("khoan.hoc_sinh", "hoc_sinh")
            .leftJoinAndSelect("khoan.nguoi_cap_nhat", "nguoi_cap_nhat")
            .where("khoan.dot_thanh_toan_id = :id", { id });

        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (assignedClasses.length > 0) {
                 query.andWhere("hoc_sinh.lop IN (:...assignedClasses)", { assignedClasses });
            } else {
                 // Teacher with no classes sees no records
                 query.andWhere("1=0");
            }
        }

        dot.khoan_thanh_toan = await query.getMany();
        return dot;
    },

    taoMoiDotThanhToan: async (thang: number, nam: number, userId?: number, ghi_chu?: string) => {
        // Tao dot thanh toan
        const dot = dotThanhToanRepository.create({ thang, nam, ghi_chu });
        await dotThanhToanRepository.save(dot);

        // Lay tat ca hoc sinh dang hoc
        const hoc_sinh_list = await hocSinhRepository.find({ where: { trang_thai: TrangThaiHocSinh.DANG_HOC } });

        const khoan_list: KhoanThanhToan[] = [];

        for (const hoc_sinh of hoc_sinh_list) {
            // Logic tinh toan
            const thangStr = String(thang).padStart(2, '0');
            const patternDate = `${nam}-${thangStr}-%`;

            const soNgayBaoCat = await suatAnRepository
                .createQueryBuilder("record")
                .where("record.hoc_sinh_id = :hoc_sinh_id", { hoc_sinh_id: hoc_sinh.id })
                .andWhere("record.ngay LIKE :pattern", { pattern: patternDate })
                .andWhere("record.bao_cat = :bao_cat", { bao_cat: true })
                .getCount();

            const dinh_muc_xe = await dinhMucXeRepository.findOneBy({ hoc_sinh_id: hoc_sinh.id });
            
            // Use stored amount, or fallback to calculation if missing (migration support)
            let tienXe = 0;
            if (dinh_muc_xe) {
                if (dinh_muc_xe.so_tien !== undefined && dinh_muc_xe.so_tien !== null) {
                    tienXe = Number(dinh_muc_xe.so_tien);
                } else {
                    // Fallback for old records
                    tienXe = (dinh_muc_xe.khoang_cach || 0) * 1000;
                }
            }

            const tienAn = Math.max(0, 1500000 - (soNgayBaoCat * 50000));
            const tongTien = tienAn + tienXe;

            const khoan = khoanThanhToanRepository.create({
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

        await khoanThanhToanRepository.save(khoan_list);
        return dot;
    },
    
    capNhatKhoanThanhToan: async (id: number, data: Partial<KhoanThanhToan>, userId?: number) => {
        const khoan = await khoanThanhToanRepository.findOneBy({ id });
        if (!khoan) return null;
        khoanThanhToanRepository.merge(khoan, { ...data, nguoi_cap_nhat_id: userId });
        return await khoanThanhToanRepository.save(khoan);
    }
};
