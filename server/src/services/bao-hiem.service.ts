import { AppDataSource } from "../data-source";
import { BaoHiem } from "../entities/BaoHiem";

const getRepo = () => AppDataSource.getRepository(BaoHiem);

export const BaoHiemService = {
    getAll: async (user?: any, lop: string | string[] = "") => {
        const repo = getRepo();
        const query = repo.createQueryBuilder("bao_hiem")
            .leftJoinAndSelect("bao_hiem.hoc_sinh", "hoc_sinh")
            .leftJoinAndSelect("bao_hiem.nguoi_cap_nhat", "nguoi_cap_nhat");

        // Normalize lop to array
        const filterClasses = Array.isArray(lop) ? lop : (lop ? [lop] : []);

        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (assignedClasses.length === 0) {
                 return [];
            }
            
            if (filterClasses.length > 0) {
                 const allowedClasses = filterClasses.filter(c => assignedClasses.includes(c));
                 if (allowedClasses.length === 0) return [];
                 query.where("hoc_sinh.lop IN (:...allowedClasses)", { allowedClasses });
            } else {
                 query.where("hoc_sinh.lop IN (:...assignedClasses)", { assignedClasses });
            }
        } else {
             if (filterClasses.length > 0) {
                 query.where("hoc_sinh.lop IN (:...filterClasses)", { filterClasses });
             }
        }

        return await query.getMany();
    },

    getByHocSinhId: async (hoc_sinh_id: string) => {
        return await getRepo().findOne({
            where: { hoc_sinh_id },
            relations: ["hoc_sinh"]
        });
    },

    luuHoSo: async (hoc_sinh_id: string, data: Partial<BaoHiem>, userId?: number) => {
        const repo = getRepo();
        let ho_so = await repo.findOneBy({ hoc_sinh_id });
        if (ho_so) {
            repo.merge(ho_so, { ...data, nguoi_cap_nhat_id: userId });
        } else {
            ho_so = repo.create({ ...data, hoc_sinh_id, nguoi_cap_nhat_id: userId });
        }
        return await repo.save(ho_so);
    },

    xoaHoSo: async (id: number) => {
        return await getRepo().delete(id);
    }
};
