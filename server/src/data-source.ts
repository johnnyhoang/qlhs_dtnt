import "reflect-metadata";
import { DataSource } from "typeorm";
import { CONFIG } from "./config";
import { HocSinh } from "./entities/HocSinh";
import { BaoHiem } from "./entities/BaoHiem";
import { SuatAn } from "./entities/SuatAn";
import { DotThanhToan } from "./entities/DotThanhToan";
import { KhoanThanhToan } from "./entities/KhoanThanhToan";
import { DinhMucXe } from "./entities/DinhMucXe";
import { DonGiaXe } from "./entities/DonGiaXe";
import { NguoiDung } from "./entities/NguoiDung";
import { PhanQuyen } from "./entities/PhanQuyen";
import { DanhMucMaster } from "./entities/DanhMucMaster";
import { CdsEvaluationPeriod } from "./entities/CdsEvaluationPeriod";
import { CdsCriterion } from "./entities/CdsCriterion";
import { CdsEvaluation } from "./entities/CdsEvaluation";
import { CdsEvaluationDetail } from "./entities/CdsEvaluationDetail";
import { CMSPage } from "./entities/CMSPage";
import { CMSMenu } from "./entities/CMSMenu";

export const AppDataSource = new DataSource({
    type: "postgres",
    ...(CONFIG.DB.DATABASE_URL ? {
        url: CONFIG.DB.DATABASE_URL,
        ssl: CONFIG.DB.DATABASE_URL.includes("supabase.com") || CONFIG.DB.SSL
            ? { rejectUnauthorized: false }
            : undefined
    } : {
        host: CONFIG.DB.HOST,
        port: CONFIG.DB.PORT,
        username: CONFIG.DB.USERNAME,
        password: CONFIG.DB.PASSWORD,
        database: CONFIG.DB.NAME,
        ssl: CONFIG.DB.SSL ? { rejectUnauthorized: false } : undefined,
    }),
    synchronize: false, // shared Supabase DB: never auto-alter schema from the app
    logging: false,
    entities: [
        HocSinh, 
        BaoHiem, 
        SuatAn, 
        DotThanhToan, 
        KhoanThanhToan, 
        DinhMucXe, 
        DonGiaXe,
        NguoiDung,
        PhanQuyen,
        DanhMucMaster,
        CdsEvaluationPeriod,
        CdsCriterion,
        CdsEvaluation,
        CdsEvaluationDetail,
        CMSPage,
        CMSMenu,
    ],
    migrations: [__dirname + "/migrations/*.ts"],
    subscribers: [],
});
