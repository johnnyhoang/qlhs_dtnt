import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { DotThanhToan } from "./DotThanhToan";
import { HocSinh } from "./HocSinh";

export enum TrangThaiThanhToan {
    CHO_XU_LY = "CHO_XU_LY",
    DA_THANH_TOAN = "DA_THANH_TOAN"
}

@Entity("khoan_thanh_toan")
@Index(["dot_thanh_toan_id", "hoc_sinh_id"], { unique: true })
export class KhoanThanhToan {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    dot_thanh_toan_id!: number;

    @ManyToOne(() => DotThanhToan, dot => dot.khoan_thanh_toan)
    @JoinColumn({ name: "dot_thanh_toan_id" })
    dot_thanh_toan!: DotThanhToan;

    @Column()
    hoc_sinh_id!: string;

    @ManyToOne(() => HocSinh)
    @JoinColumn({ name: "hoc_sinh_id" })
    hoc_sinh!: HocSinh;

    @Column({ nullable: true })
    xa!: string;

    @Column({ default: 0 })
    tien_an!: number;

    @Column({ default: 0 })
    tien_xe!: number;

    @Column({ default: 0 })
    ho_tro_khac!: number;

    @Column({ default: 0 })
    tong_tien!: number;

    @Column({ type: "simple-enum", enum: TrangThaiThanhToan, default: TrangThaiThanhToan.CHO_XU_LY })
    trang_thai!: TrangThaiThanhToan;

    @Column({ type: "date", nullable: true })
    ngay_chi_tra!: string;

    @Column({ nullable: true })
    ghi_chu!: string;
}
