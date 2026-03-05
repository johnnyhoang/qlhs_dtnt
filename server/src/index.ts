import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import { CONFIG } from './config';
import routes from './routes';

const app = express();

// CORS configuration for production
app.use(cors({
  origin: [
    'https://qlhs-web-311534268252.asia-southeast1.run.app',
    'https://qlhs-web.vercel.app',
    /\.vercel\.app$/, // Allow all Vercel preview deployments
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3500'
  ],
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
    next();
  } catch (err) {
    console.error("Database initialization failed in middleware:", err);
    res.status(500).json({ 
      message: "Database initialization failed",
      error: process.env.NODE_ENV === 'development' ? err : undefined
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
    console.log("Data Source has been initialized!");
    lastDbError = null;
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    lastDbError = err;
  }

  // Only listen on port if not in Vercel environment
  if (process.env.VERCEL !== '1') {
    const port = Number(process.env.PORT) || 8080;
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`Server is listening on port ${port}`);
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
