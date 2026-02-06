import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { NguoiDung } from "./NguoiDung";

export enum GioiTinh {
    NAM = "NAM",
    NU = "NU",
    KHAC = "KHAC"
}

export enum TrangThaiHocSinh {
    DANG_HOC = "DANG_HOC",
    DA_NGHI = "DA_NGHI"
}

@Entity("hoc_sinh")
export class HocSinh {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    ma_hoc_sinh!: string;

    @Column({ nullable: true })
    ma_moet!: string;

    @Column({ nullable: true })
    cccd!: string;

    @Column()
    ho_ten!: string;

    @Column()
    lop!: string;

    @Column({ type: "date", nullable: true })
    ngay_sinh!: Date;

    @Column({ type: "simple-enum", enum: GioiTinh, nullable: true })
    gioi_tinh!: GioiTinh;

    @Column({ type: "simple-enum", enum: TrangThaiHocSinh, default: TrangThaiHocSinh.DANG_HOC })
    trang_thai!: TrangThaiHocSinh;

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
