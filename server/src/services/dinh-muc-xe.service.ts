import { AppDataSource } from "../data-source";
import { DinhMucXe } from "../entities/DinhMucXe";

const dinhMucXeRepository = AppDataSource.getRepository(DinhMucXe);

export const DinhMucXeService = {
    getAll: async () => {
        return await dinhMucXeRepository.find({
            relations: ["hoc_sinh", "nguoi_cap_nhat"]
        });
    },

    getByHocSinhId: async (hoc_sinh_id: string) => {
        return await dinhMucXeRepository.findOne({
            where: { hoc_sinh_id },
            relations: ["hoc_sinh"]
        });
    },

    calculateSupportAmount: (distance: number): number => {
        // Default logic: Distance * 1000 VND
        // TODO: Implement zone-based pricing in future
        return Math.round(distance * 1000);
    },

    luuDinhMuc: async (hoc_sinh_id: string, data: Partial<DinhMucXe>, userId?: number) => {
        let dinh_muc = await dinhMucXeRepository.findOneBy({ hoc_sinh_id });
        
        let so_tien = data.so_tien;
        if (data.khoang_cach !== undefined) {
             // Recalculate if distance changes, unless specific amount override is provided (though currently we trust calculation)
             // For now, always recalculate based on distance if distance is provided
             so_tien = DinhMucXeService.calculateSupportAmount(Number(data.khoang_cach));
        }

        if (dinh_muc) {
            dinhMucXeRepository.merge(dinh_muc, { ...data, so_tien, nguoi_cap_nhat_id: userId });
        } else {
            dinh_muc = dinhMucXeRepository.create({ ...data, so_tien, hoc_sinh_id, nguoi_cap_nhat_id: userId });
        }
        return await dinhMucXeRepository.save(dinh_muc);
    },

    xoaDinhMuc: async (id: number) => {
        return await dinhMucXeRepository.delete(id);
    }
};
