import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: Number(process.env.DB_PORT) || 3306,
    USERNAME: process.env.DB_USERNAME || 'root',
    PASSWORD: process.env.DB_PASSWORD || 'M1nh.kh01',
    NAME: process.env.DB_NAME || 'qlhs_db',
  },
  JWT_SECRET: process.env.JWT_SECRET || 'secret_key_change_me',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
};
