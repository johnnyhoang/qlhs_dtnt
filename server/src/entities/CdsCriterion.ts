import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("cds_criteria")
export class CdsCriterion {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    group_code!: string; // e.g. "DAY_HOC", "QUAN_TRI"

    @Column()
    code!: string; // e.g. "1.1", "1.3.1"

    @Column("text")
    name!: string;

    @Column({ default: false })
    is_mandatory!: boolean;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    max_score!: number;

    @Column({ default: 0 })
    order_index!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
