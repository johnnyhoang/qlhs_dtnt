import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { HocSinh } from "./HocSinh";

@Entity("bao_hiem")
export class BaoHiem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    hoc_sinh_id!: string;

    @OneToOne(() => HocSinh)
    @JoinColumn({ name: "hoc_sinh_id" })
    hoc_sinh!: HocSinh;

    @Column({ nullable: true })
    ma_doi_tuong!: string;

    @Column({ nullable: true })
    so_the!: string;

    @Column({ nullable: true })
    noi_dang_ky!: string;

    @Column({ type: "date", nullable: true })
    han_su_dung!: string;

    @Column({ nullable: true })
    dia_chi!: string;

    @Column({ type: "text", nullable: true })
    thong_tin_sai!: string;

    @Column({ type: "text", nullable: true })
    thong_tin_dung!: string;

    @Column({ default: false })
    da_nop_anh!: boolean;

    @Column({ type: "text", nullable: true })
    ly_do_anh!: string;

    @Column({ type: "text", nullable: true })
    tra_cuu_vssid!: string;

    @Column({ type: "date", nullable: true })
    ngay_du_5_nam!: string;

    @Column({ type: "text", nullable: true })
    ghi_chu!: string;
}
