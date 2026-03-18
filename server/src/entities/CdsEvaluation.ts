import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { NguoiDung } from "./NguoiDung";
import { CdsEvaluationPeriod } from "./CdsEvaluationPeriod";
import { CdsEvaluationDetail } from "./CdsEvaluationDetail";

@Entity("cds_evaluations")
export class CdsEvaluation {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => CdsEvaluationPeriod)
    @JoinColumn({ name: "period_id" })
    period!: CdsEvaluationPeriod;

    @ManyToOne(() => NguoiDung)
    @JoinColumn({ name: "user_id" })
    user!: NguoiDung;

    @Column({ default: "DRAFT" }) // DRAFT, SUBMITTED
    status!: string;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    total_score_group1!: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    total_score_group2!: number;

    @Column({ nullable: true })
    submitter_name!: string;

    @Column({ nullable: true })
    level!: number; // 1 (Chưa đáp ứng), 2 (Cơ bản), 3 (Tốt)

    @OneToMany(() => CdsEvaluationDetail, (detail) => detail.evaluation)
    details!: CdsEvaluationDetail[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
