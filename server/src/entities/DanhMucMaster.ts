import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { NguoiDung } from "./NguoiDung";

@Entity("danh_muc_master")
@Index(["loai_danh_muc", "kich_hoat"])
export class DanhMucMaster {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    @Index()
    loai_danh_muc!: string; // "noi_kham_benh", "phuong_xa", "tinh", "ngan_hang", "dan_toc", "ton_giao"

    @Column()
    ten!: string;

    @Column({ nullable: true })
    ma!: string;

    @Column({ nullable: true })
    danh_muc_cha_id!: string;

    @Column({ type: "text", nullable: true })
    ghi_chu!: string;

    @Column({ default: true })
    kich_hoat!: boolean;

    @Column({ default: 0 })
    thu_tu!: number;

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
