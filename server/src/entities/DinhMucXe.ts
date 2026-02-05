import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { HocSinh } from "./HocSinh";

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

    @Column("decimal", { precision: 6, scale: 2, nullable: true })
    khoang_cach!: number;

    @Column({ nullable: true })
    ten_diem_dung!: string;

    @Column({ nullable: true })
    phuong_tien!: string;
}
