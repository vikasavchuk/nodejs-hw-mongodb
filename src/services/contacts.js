import { ContactsCollection } from '../models/contact.js';
import createHttpError from 'http-errors';

const { NotFound } = createHttpError;

export const getAllContacts = async (page = 1, perPage = 10, sort = {}, filter = {}) => {
  const skip = (page - 1) * perPage;
  const totalItems = await ContactsCollection.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / perPage);

  const contacts = await ContactsCollection.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(perPage);

  return {
    data: contacts,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  if (!contact) throw new NotFound('Contact not found');
  return contact;
};

export const createContact = async (contactData) => {
  const contact = new ContactsCollection(contactData);
  return await contact.save();
};

export const updateContact = async (contactId, contactData) => {
  const contact = await ContactsCollection.findByIdAndUpdate(contactId, contactData, { new: true });
  if (!contact) throw new NotFound('Contact not found');
  return contact;
};

export const deleteContact = async (contactId) => {
  const contact = await ContactsCollection.findByIdAndDelete(contactId);
  if (!contact) throw new NotFound('Contact not found');
  return contact;
};
