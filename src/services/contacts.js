import { ContactsCollection } from '../models/contact.js';

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

export const getContactById = async (contactId) => await ContactsCollection.findById(contactId);

export const createContact = async (contactData) => {
  const contact = new ContactsCollection(contactData);
  return await contact.save();
};

export const updateContact = async (contactId, contactData) => 
  await ContactsCollection.findByIdAndUpdate(contactId, contactData, { new: true });

export const deleteContact = async (contactId) => 
  await ContactsCollection.findByIdAndDelete(contactId);
