import { AppDataSource } from "../data-source";
import { BaoHiem } from "../entities/BaoHiem";

const baoHiemRepository = AppDataSource.getRepository(BaoHiem);

export const BaoHiemService = {
    getAll: async (user?: any) => {
        const query = baoHiemRepository.createQueryBuilder("bao_hiem")
            .leftJoinAndSelect("bao_hiem.hoc_sinh", "hoc_sinh")
            .leftJoinAndSelect("bao_hiem.nguoi_cap_nhat", "nguoi_cap_nhat");

        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (assignedClasses.length === 0) {
                 return [];
            }
            query.where("hoc_sinh.lop IN (:...assignedClasses)", { assignedClasses });
        }

        return await query.getMany();
    },

    getByHocSinhId: async (hoc_sinh_id: string) => {
        return await baoHiemRepository.findOne({
            where: { hoc_sinh_id },
            relations: ["hoc_sinh"]
        });
    },

    luuHoSo: async (hoc_sinh_id: string, data: Partial<BaoHiem>, userId?: number) => {
        let ho_so = await baoHiemRepository.findOneBy({ hoc_sinh_id });
        if (ho_so) {
            baoHiemRepository.merge(ho_so, { ...data, nguoi_cap_nhat_id: userId });
        } else {
            ho_so = baoHiemRepository.create({ ...data, hoc_sinh_id, nguoi_cap_nhat_id: userId });
        }
        return await baoHiemRepository.save(ho_so);
    },

    xoaHoSo: async (id: number) => {
        return await baoHiemRepository.delete(id);
    }
};
