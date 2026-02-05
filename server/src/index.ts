import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import { CONFIG } from './config';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('QLHS API is running');
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    const server = app.listen(CONFIG.PORT, () => {
      console.log(`Server (PID: ${process.pid}) is running on port ${CONFIG.PORT}`);
    });

    process.on('SIGINT', () => {
      console.log(`SIGINT received on PID: ${process.pid}. Closing server...`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('exit', (code) => {
      console.log(`Process ${process.pid} exited with code: ${code}`);
    });

    process.on('uncaughtException', (err) => {
      console.error(`Uncaught Exception on PID ${process.pid}:`, err);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error(`Unhandled Rejection at PID ${process.pid}:`, promise, 'reason:', reason);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
    process.exit(1);
  });
