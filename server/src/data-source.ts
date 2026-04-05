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

if (
    !CONFIG.DB.DATABASE_URL &&
    (!CONFIG.DB.HOST || !CONFIG.DB.USERNAME || !CONFIG.DB.PASSWORD || !CONFIG.DB.NAME)
) {
    throw new Error(
        "Database configuration is incomplete. Set DATABASE_URL or DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME."
    );
}

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
    synchronize: true, // Auto create tables for dev
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
        CdsEvaluationDetail
    ],
    migrations: [__dirname + "/migrations/*.ts"],
    subscribers: [],
});
