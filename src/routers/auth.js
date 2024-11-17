import express from 'express';
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
} from '../controllers/auth.js';
import { registerSchema, loginSchema } from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';

const authRouters = express.Router();
const jsonParser = express.json({
  type: 'application/json',
});

authRouters.post(
  '/register',
  jsonParser,
  validateBody(registerSchema),
  ctrlWrapper(registerController),
);

authRouters.post(
  '/login',
  jsonParser,
  validateBody(loginSchema),
  ctrlWrapper(loginController),
);

authRouters.post('/refresh', ctrlWrapper(refreshTokenController));

authRouters.post('/logout', ctrlWrapper(logoutController));

export default authRouters;