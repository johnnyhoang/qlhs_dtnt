import { AppDataSource } from "../data-source";
import { SuatAn, LoaiSuatAn } from "../entities/SuatAn";
import { HocSinh, TrangThaiHocSinh } from "../entities/HocSinh";

const suatAnRepository = AppDataSource.getRepository(SuatAn);
const hocSinhRepository = AppDataSource.getRepository(HocSinh);

export const SuatAnService = {
    layTrangThaiHangNgay: async (ngay: string, lop: string | string[] = "", search?: string, user?: any) => {
        // Lay tat ca hoc sinh dang hoc
        const query = hocSinhRepository.createQueryBuilder("hoc_sinh")
            .where("hoc_sinh.trang_thai = :trang_thai", { trang_thai: TrangThaiHocSinh.DANG_HOC });

        // Normalize lop to array
        const filterClasses = Array.isArray(lop) ? lop : (lop ? [lop] : []);

        // Teacher restriction
        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (assignedClasses.length === 0) {
                 return [];
            }
            
            if (filterClasses.length > 0) {
                 // Intersection check
                const allowedClasses = filterClasses.filter(c => assignedClasses.includes(c));
                if (allowedClasses.length === 0) {
                     return [];
                }
                query.andWhere("hoc_sinh.lop IN (:...allowedClasses)", { allowedClasses });
            } else {
                query.andWhere("hoc_sinh.lop IN (:...assignedClasses)", { assignedClasses });
            }
        } else {
             if (filterClasses.length > 0) {
                query.andWhere("hoc_sinh.lop IN (:...filterClasses)", { filterClasses });
            }
        }

        if (search) {
            query.andWhere("hoc_sinh.ho_ten LIKE :search", { search: `%${search}%` });
        }

        const hoc_sinh_list = await query.orderBy("hoc_sinh.ho_ten", "ASC").getMany();

        // Lay thong tin suat an cho ngay do
        const records = await suatAnRepository.find({
            where: { ngay },
            relations: ["nguoi_cap_nhat"]
        });

        // Mapping records vao map de tra cuu nhanh
        const recordMap = new Map();
        records.forEach(r => {
            const key = `${r.hoc_sinh_id}_${r.loai_suat_an}`;
            recordMap.set(key, r);
        });

        // Ket hop thong tin hoc sinh voi trang thai bao cat suat an
        return hoc_sinh_list.map(hoc_sinh => ({
            ...hoc_sinh,
            suat_an: {
                [LoaiSuatAn.SANG]: recordMap.get(`${hoc_sinh.id}_${LoaiSuatAn.SANG}`)?.bao_cat ?? false,
                [LoaiSuatAn.TRUA]: recordMap.get(`${hoc_sinh.id}_${LoaiSuatAn.TRUA}`)?.bao_cat ?? false,
                [LoaiSuatAn.TOI]: recordMap.get(`${hoc_sinh.id}_${LoaiSuatAn.TOI}`)?.bao_cat ?? false,
                ghi_chu: recordMap.get(`${hoc_sinh.id}_${LoaiSuatAn.SANG}`)?.ghi_chu || "",
                lastUpdated: recordMap.get(`${hoc_sinh.id}_${LoaiSuatAn.SANG}`)?.updatedAt,
                updatedBy: recordMap.get(`${hoc_sinh.id}_${LoaiSuatAn.SANG}`)?.nguoi_cap_nhat?.ho_ten
            }
        }));
    },

    doiTrangThaiBaoCat: async (hoc_sinh_id: string, ngay: string, loai_suat_an: LoaiSuatAn, bao_cat: boolean, userId?: number, ghi_chu?: string) => {
        let record = await suatAnRepository.findOne({
            where: { hoc_sinh_id, ngay, loai_suat_an }
        });

        if (record) {
            record.bao_cat = bao_cat;
            record.nguoi_cap_nhat_id = userId as any;
            if (ghi_chu !== undefined) record.ghi_chu = ghi_chu;
            return await suatAnRepository.save(record);
        } else {
            record = suatAnRepository.create({
                hoc_sinh_id,
                ngay,
                loai_suat_an,
                bao_cat,
                ghi_chu,
                nguoi_cap_nhat_id: userId
            });
            return await suatAnRepository.save(record);
        }
    }
};
