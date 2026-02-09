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
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3500'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('QLHS API is running');
});

const startServer = async () => {
  const port = Number(process.env.PORT) || 8080;
  
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Server is listening on port ${port}`);
  });

  try {
    console.log("Initializing Data Source...");
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    // In production, we might want to keep the process running so logs are accessible
    // rather than immediate exit 1 which triggers restarts.
  }

  process.on('SIGINT', () => {
    console.log(`SIGINT received. Closing server...`);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception:`, err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled Rejection at:`, promise, 'reason:', reason);
  });
};

startServer();
