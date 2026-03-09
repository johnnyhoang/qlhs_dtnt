import { AppDataSource } from "../data-source";
import { DanhMucMaster } from "../entities/DanhMucMaster";
import { Like } from "typeorm";

const getRepo = () => AppDataSource.getRepository(DanhMucMaster);

export const DanhMucMasterService = {
    getAll: async (page = 1, pageSize = 10, loai_danh_muc = "", search = "") => {
        const repo = getRepo();
        const skip = (page - 1) * pageSize;
        const where: any = {};

        if (loai_danh_muc) {
            where.loai_danh_muc = loai_danh_muc;
        }

        if (search) {
            where.ten = Like(`%${search}%`);
        }

        const [data, total] = await repo.findAndCount({
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
        return await getRepo().find({
            where: { loai_danh_muc, kich_hoat: true },
            order: { thu_tu: "ASC", ten: "ASC" }
        });
    },

    getById: async (id: string) => {
        return await getRepo().findOneBy({ id });
    },

    create: async (data: Partial<DanhMucMaster>, userId?: number) => {
        const repo = getRepo();
        const item = repo.create({ ...data, nguoi_cap_nhat_id: userId });
        return await repo.save(item);
    },

    update: async (id: string, data: Partial<DanhMucMaster>, userId?: number) => {
        const repo = getRepo();
        const item = await repo.findOneBy({ id });
        if (!item) return null;
        repo.merge(item, { ...data, nguoi_cap_nhat_id: userId });
        return await repo.save(item);
    },

    delete: async (id: string) => {
        return await getRepo().delete(id);
    },

    upsertBatch: async (loai_danh_muc: string, items: Partial<DanhMucMaster>[], userId?: number) => {
        const repo = getRepo();
        const results = [];
        for (const item of items) {
            // Try to find existing by category and code or name
            let existing = null;
            if (item.ma) {
                existing = await repo.findOne({
                    where: { loai_danh_muc, ma: item.ma }
                });
            }
            if (!existing && item.ten) {
                existing = await repo.findOne({
                    where: { loai_danh_muc, ten: item.ten }
                });
            }

            if (existing) {
                repo.merge(existing, { ...item, nguoi_cap_nhat_id: userId });
                results.push(await repo.save(existing));
            } else {
                const newItem = repo.create({ 
                    ...item, 
                    loai_danh_muc,
                    nguoi_cap_nhat_id: userId 
                });
                results.push(await repo.save(newItem));
            }
        }
        return results;
    }
};
