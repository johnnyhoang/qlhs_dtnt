import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

export enum CMSPageStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
}

export enum CMSContentType {
    HTML = "HTML",
    PDF = "PDF",
}

@Entity("cms_pages")
export class CMSPage {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    slug!: string;

    @Column()
    tieu_de!: string;

    @Column({ nullable: true })
    mo_ta?: string;

    @Column({
        type: "enum",
        enum: CMSContentType,
    })
    loai_noi_dung!: CMSContentType;

    @Column({ type: "text", nullable: true })
    noi_dung_html?: string;

    @Column({ type: "bytea", nullable: true })
    tep_pdf?: Buffer;

    @Column({ nullable: true })
    ten_tep_goc?: string;

    @Column({ nullable: true })
    mime_type?: string;

    @Column("simple-json", { nullable: true })
    metadata?: Record<string, string | number | boolean | null>;

    @Column({
        type: "enum",
        enum: CMSPageStatus,
        default: CMSPageStatus.DRAFT,
    })
    trang_thai!: CMSPageStatus;

    @Column({ default: false })
    la_trang_chu!: boolean;

    @Column({ nullable: true })
    created_by_id?: number;

    @Column({ nullable: true })
    updated_by_id?: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
