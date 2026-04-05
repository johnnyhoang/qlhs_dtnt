import dotenv from 'dotenv';
dotenv.config();

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const requireEnv = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const optionalEnv = (name: string) => process.env[name]?.trim() || undefined;

const parseCorsOrigins = () => {
  const rawValue = process.env.CORS_ORIGINS;

  if (!rawValue) {
    return [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3500',
    ];
  }

  return rawValue
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseNumber(process.env.PORT, 8080),
  DB: {
    DATABASE_URL: optionalEnv('DATABASE_URL'),
    HOST: optionalEnv('DB_HOST'),
    PORT: parseNumber(process.env.DB_PORT, 5432),
    USERNAME: optionalEnv('DB_USER'),
    PASSWORD: optionalEnv('DB_PASSWORD'),
    NAME: optionalEnv('DB_NAME'),
    SSL: process.env.DB_SSL === 'true',
  },
  JWT_SECRET: requireEnv('JWT_SECRET'),
  GOOGLE_CLIENT_ID: requireEnv('GOOGLE_CLIENT_ID'),
  CORS_ORIGINS: parseCorsOrigins(),
  ALLOW_VERCEL_PREVIEWS: process.env.ALLOW_VERCEL_PREVIEWS === 'true',
};
