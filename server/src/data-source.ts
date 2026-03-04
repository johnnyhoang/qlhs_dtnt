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

export const AppDataSource = new DataSource({
    type: "mysql",
    // For Cloud Run, use socketPath if provided, otherwise use host/port
    ...(CONFIG.DB.SOCKET_PATH ? {
        socketPath: CONFIG.DB.SOCKET_PATH,
    } : {
        host: CONFIG.DB.HOST,
        port: Number(CONFIG.DB.PORT) || 3306,
    }),
    username: CONFIG.DB.USERNAME,
    password: CONFIG.DB.PASSWORD,
    database: CONFIG.DB.NAME,
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
        DanhMucMaster
    ],
    migrations: [__dirname + "/migrations/*.ts"],
    subscribers: [],
});
