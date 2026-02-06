import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { HocSinh } from "./HocSinh";
import { NguoiDung } from "./NguoiDung";

export enum LoaiSuatAn {
    SANG = "SANG",
    TRUA = "TRUA",
    TOI = "TOI"
}

@Entity("suat_an")
@Index(["hoc_sinh_id", "ngay", "loai_suat_an"], { unique: true })
export class SuatAn {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    hoc_sinh_id!: string;

    @ManyToOne(() => HocSinh)
    @JoinColumn({ name: "hoc_sinh_id" })
    hoc_sinh!: HocSinh;

    @Column({ type: "date" })
    ngay!: string; // YYYY-MM-DD

    @Column({ type: "simple-enum", enum: LoaiSuatAn })
    loai_suat_an!: LoaiSuatAn;

    @Column({ default: false })
    bao_cat!: boolean;

    @Column({ nullable: true })
    ghi_chu!: string;

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
