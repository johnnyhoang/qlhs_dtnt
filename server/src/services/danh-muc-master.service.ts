import { AppDataSource } from "../data-source";
import { DanhMucMaster } from "../entities/DanhMucMaster";
import { Like } from "typeorm";

const danhMucRepository = AppDataSource.getRepository(DanhMucMaster);

export const DanhMucMasterService = {
    getAll: async (page = 1, pageSize = 10, loai_danh_muc = "", search = "") => {
        const skip = (page - 1) * pageSize;
        const where: any = {};

        if (loai_danh_muc) {
            where.loai_danh_muc = loai_danh_muc;
        }

        if (search) {
            where.ten = Like(`%${search}%`);
        }

        const [data, total] = await danhMucRepository.findAndCount({
            where,
            skip,
            take: pageSize,
            order: { loai_danh_muc: "ASC", thu_tu: "ASC", ten: "ASC" },
            relations: ["nguoi_cap_nhat"]
        });

        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    },

    getByCategory: async (loai_danh_muc: string) => {
        return await danhMucRepository.find({
            where: { loai_danh_muc, kich_hoat: true },
            order: { thu_tu: "ASC", ten: "ASC" }
        });
    },

    getById: async (id: string) => {
        return await danhMucRepository.findOneBy({ id });
    },

    create: async (data: Partial<DanhMucMaster>, userId?: number) => {
        const item = danhMucRepository.create({ ...data, nguoi_cap_nhat_id: userId });
        return await danhMucRepository.save(item);
    },

    update: async (id: string, data: Partial<DanhMucMaster>, userId?: number) => {
        const item = await danhMucRepository.findOneBy({ id });
        if (!item) return null;
        danhMucRepository.merge(item, { ...data, nguoi_cap_nhat_id: userId });
        return await danhMucRepository.save(item);
    },

    delete: async (id: string) => {
        return await danhMucRepository.delete(id);
    },

    upsertBatch: async (loai_danh_muc: string, items: Partial<DanhMucMaster>[], userId?: number) => {
        const results = [];
        for (const item of items) {
            // Try to find existing by category and code or name
            let existing = null;
            if (item.ma) {
                existing = await danhMucRepository.findOne({
                    where: { loai_danh_muc, ma: item.ma }
                });
            }
            if (!existing && item.ten) {
                existing = await danhMucRepository.findOne({
                    where: { loai_danh_muc, ten: item.ten }
                });
            }

            if (existing) {
                danhMucRepository.merge(existing, { ...item, nguoi_cap_nhat_id: userId });
                results.push(await danhMucRepository.save(existing));
            } else {
                const newItem = danhMucRepository.create({ 
                    ...item, 
                    loai_danh_muc,
                    nguoi_cap_nhat_id: userId 
                });
                results.push(await danhMucRepository.save(newItem));
            }
        }
        return results;
    }
};
