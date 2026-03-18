import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("cds_evaluation_periods")
export class CdsEvaluationPeriod {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    year!: string; // e.g. "2023-2024"

    @Column({ type: "timestamp", nullable: true })
    start_date?: Date;

    @Column({ type: "timestamp", nullable: true })
    end_date?: Date;

    @Column({ default: true })
    is_active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
