import { AppDataSource } from "../data-source";
import { DinhMucXe } from "../entities/DinhMucXe";

const dinhMucXeRepository = AppDataSource.getRepository(DinhMucXe);

export const DinhMucXeService = {
    getAll: async () => {
        return await dinhMucXeRepository.find({
            relations: ["hoc_sinh"]
        });
    },

    getByHocSinhId: async (hoc_sinh_id: string) => {
        return await dinhMucXeRepository.findOne({
            where: { hoc_sinh_id },
            relations: ["hoc_sinh"]
        });
    },

    luuDinhMuc: async (hoc_sinh_id: string, data: Partial<DinhMucXe>) => {
        let dinh_muc = await dinhMucXeRepository.findOneBy({ hoc_sinh_id });
        if (dinh_muc) {
            dinhMucXeRepository.merge(dinh_muc, data);
        } else {
            dinh_muc = dinhMucXeRepository.create({ ...data, hoc_sinh_id });
        }
        return await dinhMucXeRepository.save(dinh_muc);
    },

    xoaDinhMuc: async (id: number) => {
        return await dinhMucXeRepository.delete(id);
    }
};
