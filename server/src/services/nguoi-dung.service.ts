import { AppDataSource } from "../data-source";
import { NguoiDung, VaiTro } from "../entities/NguoiDung";
import { PhanQuyen } from "../entities/PhanQuyen";

export class NguoiDungService {
    private static readonly DEFAULT_NEW_USER_PERMISSIONS = [
        {
            ma_module: "cds",
            co_quyen_xem: true,
            co_quyen_sua: true,
        },
    ];

    private static getUserRepository() {
        return AppDataSource.getRepository(NguoiDung);
    }

    private static getPermissionRepository() {
        return AppDataSource.getRepository(PhanQuyen);
    }

    static async findOrCreateByEmail(email: string, ho_ten: string, anh_dai_dien?: string) {
        const repo = this.getUserRepository();
        const permissionRepo = this.getPermissionRepository();
        let user = await repo.findOne({ 
            where: { email },
            relations: ["danh_sach_quyen"]
        });

        if (!user) {
            const userCount = await repo.count();
            user = repo.create({
                email,
                ho_ten,
                anh_dai_dien,
                vai_tro: userCount === 0 ? VaiTro.ADMIN : VaiTro.USER,
                kich_hoat: true
            });
            await repo.save(user);

            const defaultPermissions = this.DEFAULT_NEW_USER_PERMISSIONS.map((permission) =>
                permissionRepo.create({
                    nguoi_dung_id: user!.id,
                    ...permission,
                })
            );

            user.danh_sach_quyen = await permissionRepo.save(defaultPermissions);
        }

        return user;
    }

    static async getUserWithPermissions(userId: number) {
        return await this.getUserRepository().findOne({
            where: { id: userId, kich_hoat: true },
            relations: ["danh_sach_quyen"]
        });
    }

    static async getAllUsers() {
        return await this.getUserRepository().find({
            relations: ["danh_sach_quyen"]
        });
    }

    static async updatePermissions(userId: number, permissions: { ma_module: string, co_quyen_xem: boolean, co_quyen_sua: boolean }[]) {
        const repo = this.getPermissionRepository();
        await repo.delete({ nguoi_dung_id: userId });
        const newPermissions = permissions.map(p => repo.create({
            nguoi_dung_id: userId,
            ...p
        }));
        return await repo.save(newPermissions);
    }

    static async updateClassAssignments(userId: number, classes: string[]) {
        const repo = this.getUserRepository();
        const user = await repo.findOneBy({ id: userId });
        if (!user) throw new Error("User not found");
        
        user.lop_phu_trach = classes;
        return await repo.save(user);
    }
}
