import { AppDataSource } from "../data-source";
import { HocSinh } from "../entities/HocSinh";
import { Like, In } from "typeorm";

const hocSinhRepository = AppDataSource.getRepository(HocSinh);

export const HocSinhService = {
    getAll: async (page = 1, pageSize = 10, search = "", lop: string | string[] = "", user?: any) => {
        const skip = (page - 1) * pageSize;
        const where: any = {};
        
        // Normalize lop to array if it's a string
        const filterClasses = Array.isArray(lop) ? lop : (lop ? [lop] : []);

        // Teacher restriction
        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            if (assignedClasses.length === 0) {
                 return { data: [], total: 0, page, pageSize, totalPages: 0 };
            }
            
            if (filterClasses.length > 0) {
                // Intersection check
                const allowedClasses = filterClasses.filter(c => assignedClasses.includes(c));
                if (allowedClasses.length === 0) {
                     return { data: [], total: 0, page, pageSize, totalPages: 0 };
                }
                where.lop = In(allowedClasses);
            } else {
                where.lop = In(assignedClasses);
            }
        } else {
             // Admin/User behavior
             if (filterClasses.length > 0) {
                 where.lop = In(filterClasses);
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
    },

    getClasses: async (user?: any) => {
        if (user && user.vai_tro === "TEACHER") {
            const assignedClasses: string[] = user.lop_phu_trach || [];
            return assignedClasses.sort();
        }

        const classes = await hocSinhRepository
            .createQueryBuilder("hoc_sinh")
            .select("DISTINCT hoc_sinh.lop", "lop")
            .orderBy("hoc_sinh.lop", "ASC")
            .getRawMany();

        return classes.map(c => c.lop).filter(Boolean);
    }
};
