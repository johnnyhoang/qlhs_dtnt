import { AppDataSource } from "../data-source";
import { HocSinh } from "../entities/HocSinh";
import { Like, In } from "typeorm";

const hocSinhRepository = AppDataSource.getRepository(HocSinh);

export const HocSinhService = {
    getAll: async (page = 1, pageSize = 10, search = "", lop = "", user?: any) => {
        const skip = (page - 1) * pageSize;
        const where: any = {};

        // Teacher restriction
        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (assignedClasses.length === 0) {
                 // Teacher with no classes sees nothing
                 return { data: [], total: 0, page, pageSize, totalPages: 0 };
            }
            // If filtering by class, ensure it's allowed
            if (lop) {
                if (!assignedClasses.includes(lop)) {
                    return { data: [], total: 0, page, pageSize, totalPages: 0 };
                }
                where.lop = lop;
            } else {
                // Return students from ALL assigned classes
                where.lop = In(assignedClasses);
            }
        } else {
             // Admin/User behavior
             if (lop) {
                 where.lop = lop;
             }
        }

        if (search) {
             where.ho_ten = Like(`%${search}%`);
        }

        const [hoc_sinh_list, total] = await hocSinhRepository.findAndCount({
            where,
            skip,
            take: pageSize,
            order: { ho_ten: "ASC" },
            relations: ["nguoi_cap_nhat"]
        });

        return {
            data: hoc_sinh_list,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    },

    getById: async (id: string, user?: any) => {
        const hoc_sinh = await hocSinhRepository.findOneBy({ id });
        if (!hoc_sinh) return null;

        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (!assignedClasses.includes(hoc_sinh.lop)) {
                return null; // Or use a specific error if preferred
            }
        }
        return hoc_sinh;
    },

    create: async (data: Partial<HocSinh>, user?: any) => {
        if (user && user.vai_tro === "TEACHER") {
             const assignedClasses: string[] = user.lop_phu_trach || [];
             if (data.lop && !assignedClasses.includes(data.lop)) {
                 throw new Error("Không có quyền thêm học sinh vào lớp này");
             }
        }
        const hoc_sinh = hocSinhRepository.create({ ...data, nguoi_cap_nhat_id: user?.id });
        return await hocSinhRepository.save(hoc_sinh);
    },

    update: async (id: string, data: Partial<HocSinh>, user?: any) => {
        const hoc_sinh = await hocSinhRepository.findOneBy({ id });
        if (!hoc_sinh) return null;

        if (user && user.vai_tro === "TEACHER") {
             const assignedClasses: string[] = user.lop_phu_trach || [];
             // Check if teacher manages the CURRENT class of student
             if (!assignedClasses.includes(hoc_sinh.lop)) {
                 throw new Error("Không có quyền chỉnh sửa học sinh lớp này");
             }
             // Check if teacher is identifying a NEW class they don't manage
             if (data.lop && !assignedClasses.includes(data.lop)) {
                 throw new Error("Không có quyền chuyển học sinh sang lớp này");
             }
        }

        hocSinhRepository.merge(hoc_sinh, { ...data, nguoi_cap_nhat_id: user?.id });
        return await hocSinhRepository.save(hoc_sinh);
    },

    delete: async (id: string, user?: any) => {
        if (user && user.vai_tro === "TEACHER") {
            const hoc_sinh = await hocSinhRepository.findOneBy({ id });
            if (hoc_sinh) {
                const assignedClasses: string[] = user.lop_phu_trach || [];
                if (!assignedClasses.includes(hoc_sinh.lop)) {
                    throw new Error("Không có quyền xóa học sinh lớp này");
                }
            }
        }
        return await hocSinhRepository.delete(id);
    },

    upsertByMaHocSinh: async (data: Partial<HocSinh>, user?: any) => {
        if (!data.ma_hoc_sinh) throw new Error("Mã học sinh là bắt buộc");
        
        const existing = await hocSinhRepository.findOneBy({ ma_hoc_sinh: data.ma_hoc_sinh });
        
        if (user && user.vai_tro === "TEACHER") {
             const assignedClasses: string[] = user.lop_phu_trach || [];
             if (existing) {
                 if (!assignedClasses.includes(existing.lop)) {
                     throw new Error(`Không có quyền cập nhật học sinh ${existing.ho_ten} (Lớp ${existing.lop})`);
                 }
             }
             if (data.lop && !assignedClasses.includes(data.lop)) {
                 throw new Error(`Không có quyền thêm/sửa học sinh vào lớp ${data.lop}`);
             }
        }

        if (existing) {
            hocSinhRepository.merge(existing, { ...data, nguoi_cap_nhat_id: user?.id });
            return await hocSinhRepository.save(existing);
        } else {
            const hoc_sinh = hocSinhRepository.create({ ...data, nguoi_cap_nhat_id: user?.id });
            return await hocSinhRepository.save(hoc_sinh);
        }
    }
};
