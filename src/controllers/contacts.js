import {
  getAllContacts as getAllContactsService,
  getContactById as getContactByIdService,
  createContact as createContactService,
  updateContact as updateContactService,
  deleteContact as deleteContactService
} from '../services/contacts.js';
import createHttpError from 'http-errors';

const { NotFound } = createHttpError;

export const getAllContacts = async (req, res) => {
  const contacts = await getAllContactsService();
  res.status(200).json({ status: 200, message: 'Successfully found contacts!', data: contacts });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactByIdService(contactId);
  if (!contact) throw new NotFound('Contact not found');
  res.status(200).json({ status: 200, message: `Successfully found contact with id ${contactId}!`, data: contact });
};

export const createContact = async (req, res) => {
  const contact = await createContactService(req.body);
  res.status(201).json({ status: 201, message: 'Successfully created a contact!', data: contact });
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const contact = await updateContactService(contactId, req.body);
  if (!contact) throw new NotFound('Contact not found');
  res.status(200).json({ status: 200, message: 'Successfully patched a contact!', data: contact });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const contact = await deleteContactService(contactId);
  if (!contact) throw new NotFound('Contact not found');
  res.status(204).send();
};

