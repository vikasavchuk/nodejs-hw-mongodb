import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

dotenv.config();

export const setupServer = () => {
  const app = express();
  app.use(pino());
  app.use(cors());
  app.use(express.json());

  app.use('/contacts', contactsRouter);
  app.use('/auth', authRouter);

  app.use(errorHandler);
  app.use(notFoundHandler);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
