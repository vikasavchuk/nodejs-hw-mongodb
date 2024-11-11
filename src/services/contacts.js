import { ContactsCollection } from '../models/contact.js';

export const getAllContacts = async () => await ContactsCollection.find();

export const getContactById = async (contactId) => await ContactsCollection.findById(contactId);

export const createContact = async (contactData) => {
  const contact = new ContactsCollection(contactData);
  return await contact.save();
};

export const updateContact = async (contactId, contactData) => 
  await ContactsCollection.findByIdAndUpdate(contactId, contactData, { new: true });

export const deleteContact = async (contactId) => 
  await ContactsCollection.findByIdAndDelete(contactId);
