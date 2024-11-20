import path from 'node:path';

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';
import { initMongoConnection } from './db/initMongoConnection.js';

import routers from './routers/index.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

import { swaggerDocs } from './middlewares/swaggerDocs.js';

const app = express();

app.use('/api-docs', swaggerDocs());

app.use('/photos', express.static(path.resolve('src', 'public/photos')));

export const setupServer = async () => {
  try {
    await initMongoConnection();

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }

  app.use(cors());
  app.use(cookieParser());
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use('/', routers);

  app.use(notFoundHandler);
  app.use(errorHandler);
};

export default app;