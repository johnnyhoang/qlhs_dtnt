import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { PhanQuyen } from "./PhanQuyen";

export enum VaiTro {
    ADMIN = "ADMIN",
    USER = "USER",
    TEACHER = "TEACHER"
}

@Entity("nguoi_dung")
export class NguoiDung {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    ho_ten!: string;

    @Column({ nullable: true })
    anh_dai_dien?: string;

    @Column({
        type: "enum",
        enum: VaiTro,
        default: VaiTro.USER
    })
    vai_tro!: VaiTro;

    @Column("simple-json", { nullable: true })
    lop_phu_trach?: string[]; // Array of class names e.g., ["10A1", "10A2"]

    @Column({ default: true })
    kich_hoat!: boolean;

    @OneToMany(() => PhanQuyen, (pq) => pq.nguoi_dung)
    danh_sach_quyen!: PhanQuyen[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
