import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { CMSPage } from "./CMSPage";

export enum CMSMenuTargetType {
    PAGE = "PAGE",
    TOOL = "TOOL",
}

@Entity("cms_menus")
export class CMSMenu {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nhan_menu!: string;

    @Column({
        type: "enum",
        enum: CMSMenuTargetType,
        default: CMSMenuTargetType.PAGE,
    })
    loai_dich!: CMSMenuTargetType;

    @Column({ nullable: true })
    duong_dan?: string;

    @Column({ nullable: true })
    khoa_he_thong?: string;

    @Column({ nullable: true })
    parent_id?: number | null;

    @ManyToOne(() => CMSMenu, (menu) => menu.children, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "parent_id" })
    parent?: CMSMenu | null;

    @OneToMany(() => CMSMenu, (menu) => menu.parent)
    children!: CMSMenu[];

    @Column({ nullable: true })
    page_id?: number | null;

    @ManyToOne(() => CMSPage, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "page_id" })
    page?: CMSPage | null;

    @Column({ default: 0 })
    thu_tu!: number;

    @Column({ default: true })
    hien_thi!: boolean;

    @Column({ default: false })
    khoa_he_thong_bat_buoc!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
