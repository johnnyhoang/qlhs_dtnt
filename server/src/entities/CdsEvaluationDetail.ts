import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { CdsEvaluation } from "./CdsEvaluation";
import { CdsCriterion } from "./CdsCriterion";

@Entity("cds_evaluation_details")
export class CdsEvaluationDetail {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => CdsEvaluation, (evaluation) => evaluation.details, { onDelete: "CASCADE" })
    @JoinColumn({ name: "evaluation_id" })
    evaluation!: CdsEvaluation;

    @ManyToOne(() => CdsCriterion)
    @JoinColumn({ name: "criterion_id" })
    criterion!: CdsCriterion;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    score!: number;

    @Column({ type: "text", nullable: true })
    evidence_link?: string;

    @Column({ type: "text", nullable: true })
    note?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
