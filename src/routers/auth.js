import express from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { register, login, refresh, logout } from '../controllers/auth.js';
import { userRegisterSchema, userLoginSchema } from '../validation/authSchemas.js';

const router = express.Router();

router.post('/register', validateBody(userRegisterSchema), register);
router.post('/login', validateBody(userLoginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
