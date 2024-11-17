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
  jsonParser,
  authenticate,
  validateBody(contactSchema),
  ctrlWrapper(createContactController),
);

router.patch(
  '/:contactId',
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
// router.use(authenticate);
// router.get('/', ctrlWrapper(getContactsController));
export default router;