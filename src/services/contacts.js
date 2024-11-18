import createHttpError from 'http-errors';
import { Contact } from '../models/contact.js';

export const getAllContacts = async (
  userId,
  filter = {},
  page = 1,
  perPage = 4,
  sortBy = 'name',
  sortOrder = 'asc',
) => {
  if (!userId) {
    throw createHttpError(400, 'Invalid user ID');
  }

  const query = { userId, ...filter };
  if (filter.contactType) {
    query.contactType = filter.contactType;
  }

  if (filter.isFavourite !== undefined) {
    query.isFavourite = filter.isFavourite;
  }

  const skip = (page - 1) * perPage;
  const limit = perPage;

  const [contacts, totalItems] = await Promise.all([
    Contact.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .exec(),
    Contact.countDocuments(query),
  ]);

  return { contacts, totalItems };
};

export const getContactById = async (contactId, userId) => {
  return await Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (newContact) => {
  return await Contact.create(newContact);
};

export const updateContact = async (contactId, userId, newContact) => {
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId, userId }, 
    newContact,
    { new: true }
  );

  if (!updatedContact) {
    throw createHttpError(404, 'Contact not found or does not belong to user');
  }

  return updatedContact;
};

export const deleteContact = async (contactId, userId) => {
  return await Contact.findOneAndDelete({ _id: contactId, userId });
};