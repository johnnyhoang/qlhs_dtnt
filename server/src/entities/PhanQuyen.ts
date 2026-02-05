import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { NguoiDung } from "./NguoiDung";

@Entity("phan_quyen")
export class PhanQuyen {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nguoi_dung_id!: number;

    @ManyToOne(() => NguoiDung, (nd) => nd.danh_sach_quyen)
    @JoinColumn({ name: "nguoi_dung_id" })
    nguoi_dung!: NguoiDung;

    @Column()
    ma_module!: string; // e.g., 'hoc-sinh', 'suat-an', 'bao-hiem'

    @Column({ default: true })
    co_quyen_xem!: boolean;

    @Column({ default: false })
    co_quyen_sua!: boolean;
}
