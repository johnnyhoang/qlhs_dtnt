import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { KhoanThanhToan } from "./KhoanThanhToan";

@Entity("dot_thanh_toan")
export class DotThanhToan {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    thang!: number;

    @Column()
    nam!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ nullable: true })
    ghi_chu!: string;

    @OneToMany(() => KhoanThanhToan, item => item.dot_thanh_toan)
    khoan_thanh_toan!: KhoanThanhToan[];
}
