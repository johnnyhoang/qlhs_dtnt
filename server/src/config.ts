import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 3500,
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: Number(process.env.DB_PORT) || 3306,
    USERNAME: process.env.DB_USER || process.env.DB_USERNAME || 'qlhs_user',
    PASSWORD: process.env.DB_PASS || process.env.DB_PASSWORD || 'B1g.h13u',
    NAME: process.env.DB_NAME || 'qlhs_db',
    SOCKET_PATH: process.env.DB_SOCKET_PATH,
  },
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_hieu_hoa',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
};
