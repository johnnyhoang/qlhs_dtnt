import { AppDataSource } from "../data-source";
import { HocSinh } from "../entities/HocSinh";
import { Like } from "typeorm";

const hocSinhRepository = AppDataSource.getRepository(HocSinh);

export const HocSinhService = {
    getAll: async (page = 1, pageSize = 10, search = "", lop = "") => {
        const skip = (page - 1) * pageSize;
        const where: any = {};

        if (lop) {
            where.lop = lop;
        }

        if (search) {
            where.ho_ten = Like(`%${search}%`);
        }

        const [hoc_sinh_list, total] = await hocSinhRepository.findAndCount({
            where,
            skip,
            take: pageSize,
            order: { ho_ten: "ASC" }
        });

        return {
            data: hoc_sinh_list,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    },

    getById: async (id: string) => {
        return await hocSinhRepository.findOneBy({ id });
    },

    create: async (data: Partial<HocSinh>) => {
        const hoc_sinh = hocSinhRepository.create(data);
        return await hocSinhRepository.save(hoc_sinh);
    },

    update: async (id: string, data: Partial<HocSinh>) => {
        const hoc_sinh = await hocSinhRepository.findOneBy({ id });
        if (!hoc_sinh) return null;
        hocSinhRepository.merge(hoc_sinh, data);
        return await hocSinhRepository.save(hoc_sinh);
    },

    delete: async (id: string) => {
        return await hocSinhRepository.delete(id);
    },

    upsertByMaHocSinh: async (data: Partial<HocSinh>) => {
        if (!data.ma_hoc_sinh) throw new Error("Mã học sinh là bắt buộc");
        
        const existing = await hocSinhRepository.findOneBy({ ma_hoc_sinh: data.ma_hoc_sinh });
        if (existing) {
            hocSinhRepository.merge(existing, data);
            return await hocSinhRepository.save(existing);
        } else {
            const hoc_sinh = hocSinhRepository.create(data);
            return await hocSinhRepository.save(hoc_sinh);
        }
    }
};
