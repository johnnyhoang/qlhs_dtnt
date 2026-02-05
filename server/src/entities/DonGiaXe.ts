import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("don_gia_xe")
export class DonGiaXe {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    vung_cu!: string;

    @Column()
    vung_moi!: string;

    @Column()
    muc_ho_tro!: number;

    @Column({ type: "text", nullable: true })
    ghi_chu!: string;
}
