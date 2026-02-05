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

    layDotThanhToanTheoId: async (id: number) => {
        return await dotThanhToanRepository.findOne({
            where: { id },
            relations: ["khoan_thanh_toan", "khoan_thanh_toan.hoc_sinh"]
        });
    },

    taoMoiDotThanhToan: async (thang: number, nam: number, ghi_chu?: string) => {
        // Tao dot thanh toan
        const dot = dotThanhToanRepository.create({ thang, nam, ghi_chu });
        await dotThanhToanRepository.save(dot);

        // Lay tat ca hoc sinh dang hoc
        const hoc_sinh_list = await hocSinhRepository.find({ where: { trang_thai: TrangThaiHocSinh.DANG_HOC } });

        const khoan_list: KhoanThanhToan[] = [];

        for (const hoc_sinh of hoc_sinh_list) {
            // Logic tinh toan:
            // 1. Tien an: (Tong ngay - ngay bao cat) * don gia
            // 2. Tien xe: Khoang cach * don gia
            
            const thangStr = String(thang).padStart(2, '0');
            const patternDate = `${nam}-${thangStr}-%`;

            const soNgayBaoCat = await suatAnRepository
                .createQueryBuilder("record")
                .where("record.hoc_sinh_id = :hoc_sinh_id", { hoc_sinh_id: hoc_sinh.id })
                .andWhere("record.ngay LIKE :pattern", { pattern: patternDate })
                .andWhere("record.bao_cat = :bao_cat", { bao_cat: true })
                .getCount();

            const dinh_muc_xe = await dinhMucXeRepository.findOneBy({ hoc_sinh_id: hoc_sinh.id });
            const tienXe = (dinh_muc_xe?.khoang_cach || 0) * 1000; // Gia tam tinh

            const tienAn = Math.max(0, 1500000 - (soNgayBaoCat * 50000));
            const tongTien = tienAn + tienXe;

            const khoan = khoanThanhToanRepository.create({
                dot_thanh_toan_id: dot.id,
                hoc_sinh_id: hoc_sinh.id,
                tien_an: tienAn,
                tien_xe: tienXe,
                ho_tro_khac: 0,
                tong_tien: tongTien,
                xa: hoc_sinh.lop, // Tam thoi lay lop vi HocSinh chua co truong Xa
                trang_thai: TrangThaiThanhToan.CHO_XU_LY
            });
            khoan_list.push(khoan);
        }

        await khoanThanhToanRepository.save(khoan_list);
        return dot;
    }
};
