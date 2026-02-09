import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { HocSinh } from "./HocSinh";
import { NguoiDung } from "./NguoiDung";

@Entity("dinh_muc_xe")
export class DinhMucXe {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    hoc_sinh_id!: string;

    @OneToOne(() => HocSinh)
    @JoinColumn({ name: "hoc_sinh_id" })
    hoc_sinh!: HocSinh;

    @Column({ nullable: true })
    so_tai_khoan!: string;

    @Column({ nullable: true })
    ngan_hang!: string;

    @Column({ nullable: true })
    dia_chi_xa_moi!: string;

    @Column({ nullable: true })
    xa_huong_tro_cap!: string;

    @Column("decimal", { precision: 12, scale: 0, nullable: true })
    so_tien!: number;

    @Column("decimal", { precision: 6, scale: 2, nullable: true })
    khoang_cach!: number;

    @Column({ nullable: true })
    ten_diem_dung!: string;

    @Column({ nullable: true })
    phuong_tien!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ nullable: true })
    nguoi_cap_nhat_id!: number;

    @ManyToOne(() => NguoiDung, { nullable: true })
    @JoinColumn({ name: "nguoi_cap_nhat_id" })
    nguoi_cap_nhat!: NguoiDung;
}
