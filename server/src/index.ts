import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import { CONFIG } from './config';
import routes from './routes';
import { seedCdsCriteria } from './utils/cds-seeder';

const app = express();

// CORS configuration for production
app.use(cors({
  origin: CONFIG.CORS_ORIGINS,
  credentials: true
}));
app.use(express.json());

// Database initialization middleware
app.use(async (req, res, next) => {
  if (AppDataSource.isInitialized) {
    return next();
  }
  
  try {
    console.log("Database not initialized, initializing now...");
    await AppDataSource.initialize();
    await seedCdsCriteria();
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
    console.log("Initializing Data Source...");
    await AppDataSource.initialize();
    await seedCdsCriteria();
    console.log("Data Source has been initialized!");
    lastDbError = null;
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
