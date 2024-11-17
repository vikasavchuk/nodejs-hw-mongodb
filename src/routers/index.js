import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import authRouters from './auth.js';
import contactsRouters from './contacts.js';

const router = express.Router();

router.use('/auth', authRouters);
router.use('/contacts', authenticate, contactsRouters);

export default router;