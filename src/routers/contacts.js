import express from 'express';
import {
  getContactByIdController,
  getContactsController,
  createContactController,
  updateContactController,
  deleteContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { isValidId } from '../middlewares/isValidId.js';
import { validateBody } from '../middlewares/validateBody.js';
import { contactSchema } from '../validation/validation.js';
import { authenticate } from '../middlewares/authenticate.js';

import { upload } from '../middlewares/multer.js';

const router = express.Router();

const jsonParser = express.json({
  type: 'application/json',
});

router.get('/', authenticate, ctrlWrapper(getContactsController));

router.get(
  '/:contactId',
  authenticate,
  isValidId,
  ctrlWrapper(getContactByIdController),
);

router.post(
  '/',
  upload.single('photo'),
  jsonParser,
  authenticate,
  validateBody(contactSchema),
  ctrlWrapper(createContactController),
);

router.patch(
  '/:contactId',
  upload.single('photo'),
  isValidId,
  jsonParser,
  authenticate,
  validateBody(contactSchema),
  ctrlWrapper(updateContactController),
);

router.delete(
  '/:contactId',
  isValidId,
  authenticate,
  ctrlWrapper(deleteContactController),
);

export default router;