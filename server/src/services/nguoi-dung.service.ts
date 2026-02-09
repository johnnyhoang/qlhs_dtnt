import { AppDataSource } from "../data-source";
import { NguoiDung, VaiTro } from "../entities/NguoiDung";
import { PhanQuyen } from "../entities/PhanQuyen";

export class NguoiDungService {
    private static userRepository = AppDataSource.getRepository(NguoiDung);
    private static permissionRepository = AppDataSource.getRepository(PhanQuyen);

    static async findOrCreateByEmail(email: string, ho_ten: string, anh_dai_dien?: string) {
        let user = await this.userRepository.findOne({ 
            where: { email },
            relations: ["danh_sach_quyen"]
        });

        if (!user) {
            // First user is Admin, others are default Users
            const userCount = await this.userRepository.count();
            user = this.userRepository.create({
                email,
                ho_ten,
                anh_dai_dien,
                vai_tro: userCount === 0 ? VaiTro.ADMIN : VaiTro.USER,
                kich_hoat: true
            });
            await this.userRepository.save(user);
        }

        return user;
    }

    static async getUserWithPermissions(userId: number) {
        return await this.userRepository.findOne({
            where: { id: userId, kich_hoat: true },
            relations: ["danh_sach_quyen"]
        });
    }

    static async getAllUsers() {
        return await this.userRepository.find({
            relations: ["danh_sach_quyen"]
        });
    }

    static async updatePermissions(userId: number, permissions: { ma_module: string, co_quyen_xem: boolean, co_quyen_sua: boolean }[]) {
        // Simple implementation: delete old, insert new
        await this.permissionRepository.delete({ nguoi_dung_id: userId });
        const newPermissions = permissions.map(p => this.permissionRepository.create({
            nguoi_dung_id: userId,
            ...p
        }));
        return await this.permissionRepository.save(newPermissions);
    }

    static async updateClassAssignments(userId: number, classes: string[]) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error("User not found");
        
        user.lop_phu_trach = classes;
        return await this.userRepository.save(user);
    }
}
