import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import { CONFIG } from './config';
import routes from './routes';
import { seedCdsCriteria } from './utils/cds-seeder';

const app = express();
let dataSourceInitPromise: Promise<void> | null = null;

const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) return true;
  if (CONFIG.CORS_ORIGINS.includes('*') || CONFIG.CORS_ORIGINS.includes(origin)) {
    return true;
  }
  return origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1');
};

// Manual CORS + remove Vercel-injected COOP/COEP headers that break Google login popup
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  }

  // Remove Vercel-injected security headers that break Google OAuth popup
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');

  // Respond immediately to preflight (OPTIONS) without touching DB
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

const ensureDataSourceReady = async () => {
  if (AppDataSource.isInitialized) {
    return;
  }

  if (!dataSourceInitPromise) {
    dataSourceInitPromise = (async () => {
      console.log("Initializing Data Source...");
      await AppDataSource.initialize();
      await seedCdsCriteria();
      console.log("Data Source has been initialized!");
      lastDbError = null;
    })().catch((err) => {
      lastDbError = err;
      dataSourceInitPromise = null;
      throw err;
    });
  }

  await dataSourceInitPromise;
};

app.get('/api/health', async (_req, res) => {
  try {
    await ensureDataSourceReady();
    res.json({
      ok: true,
      database: 'ready',
      environment: CONFIG.NODE_ENV,
    });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({
      ok: false,
      database: 'error',
      environment: CONFIG.NODE_ENV,
      error: CONFIG.NODE_ENV === 'development' ? err : undefined,
    });
  }
});

// Database initialization middleware
app.use(async (_req, res, next) => {
  try {
    await ensureDataSourceReady();
    next();
  } catch (err) {
    console.error("Database initialization failed in middleware:", err);
    res.status(500).json({ 
      message: "Database initialization failed",
      error: CONFIG.NODE_ENV === 'development' ? err : undefined
    });
  }
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('QLHS API is running');
});

export let lastDbError: any = null;

const startServer = async () => {
  try {
    await ensureDataSourceReady();
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    lastDbError = err;
  }

  // Only listen on port if not in Vercel environment
  if (process.env.VERCEL !== '1') {
    const server = app.listen(CONFIG.PORT, "0.0.0.0", () => {
      console.log(`Server is listening on port ${CONFIG.PORT}`);
    });

    process.on('SIGINT', () => {
      console.log(`SIGINT received. Closing server...`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  }
};

// Start initialization but don't block Vercel export
startServer();

// Export for Vercel
export default app;
