import dotenv from 'dotenv';
import { setupServer } from './server.js';

dotenv.config();

const startApp = async () => {
  try {
    await setupServer();
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
};

startApp();
